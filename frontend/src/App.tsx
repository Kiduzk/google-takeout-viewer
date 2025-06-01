import './App.css'
import { useState } from 'react';
import { Search, Play, MessageCircle, StickyNote, Calendar, Filter, Eye, Clock, Hash, Moon, Sun, X, Tag } from 'lucide-react';

const GoogleTakeoutViewer = () => {
  const [activeTab, setActiveTab] = useState('youtube');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    sortBy: 'newest',
    channels: [],
    labels: [],
    contentType: 'all'
  });

  // Sample data with more variety for filtering
  const youtubeData = [
    {
      id: 1,
      title: "How to Build React Components Like a Pro",
      channel: "TechMastery",
      watchedAt: "2024-12-15T14:30:00Z",
      duration: "24:15",
      url: "https://youtube.com/watch?v=abc123",
      category: "Education"
    },
    {
      id: 2,
      title: "The Future of Web Development in 2025",
      channel: "CodeCraft",
      watchedAt: "2024-12-14T09:15:00Z",
      duration: "18:42",
      url: "https://youtube.com/watch?v=def456",
      category: "Technology"
    },
    {
      id: 3,
      title: "Minimalist Workspace Setup Tour",
      channel: "DesignSpace",
      watchedAt: "2024-12-13T20:45:00Z",
      duration: "12:30",
      url: "https://youtube.com/watch?v=ghi789",
      category: "Lifestyle"
    },
    {
      id: 4,
      title: "JavaScript Performance Optimization",
      channel: "TechMastery",
      watchedAt: "2024-12-12T16:20:00Z",
      duration: "31:22",
      url: "https://youtube.com/watch?v=jkl012",
      category: "Education"
    }
  ];

  const commentsData = [
    {
      id: 1,
      text: "This is exactly what I needed! Thanks for the detailed explanation.",
      video: "Advanced JavaScript Patterns",
      channel: "JS Academy",
      timestamp: "2024-12-10T16:20:00Z"
    },
    {
      id: 2,
      text: "Could you make a follow-up video about async/await patterns?",
      video: "Promise Chains in Modern JS",
      channel: "CodeLab",
      timestamp: "2024-12-08T11:30:00Z"
    }
  ];

  const keepNotesData = [
    {
      id: 1,
      title: "Project Ideas",
      content: "• Google Takeout viewer app\n• Personal finance tracker\n• Reading list organizer",
      createdAt: "2024-12-12T10:15:00Z",
      labels: ["dev", "projects"],
      isPinned: true
    },
    {
      id: 2,
      title: "Meeting Notes - Q4 Planning",
      content: "Key objectives:\n- Launch new feature set\n- Improve user onboarding\n- Expand team by 2 engineers",
      createdAt: "2024-12-11T14:00:00Z",
      labels: ["work", "meetings"],
      isPinned: false
    },
    {
      id: 3,
      title: "Book Recommendations",
      content: "• Atomic Habits - James Clear\n• The Pragmatic Programmer\n• System Design Interview",
      createdAt: "2024-12-09T19:30:00Z",
      labels: ["books", "personal"],
      isPinned: false
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueChannels = () => {
    return [...new Set(youtubeData.map(video => video.channel))];
  };

  const getUniqueLabels = () => {
    return [...new Set(keepNotesData.flatMap(note => note.labels))];
  };

  const FilterPanel = () => (
    <div 
      className={`fixed inset-0 backdrop-blur-sm bg-black/20 z-50 transition-all duration-300 ${filterOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setFilterOpen(false);
        }
      }}
    >
      <div className={`fixed right-0 top-0 h-full w-96 shadow-xl transform transition-transform duration-300 ${filterOpen ? 'translate-x-0' : 'translate-x-full'} bg-gray-900`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-100">
              Filters
            </h3>
            <button
              onClick={() => setFilterOpen(false)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-800 text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Date Range
              </label>
              <div className="space-y-2">
                {['all', 'today', 'week', 'month', 'year'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="dateRange"
                      value={option}
                      checked={filters.dateRange === option}
                      onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                      className="mr-3 text-blue-600"
                    />
                    <span className="capitalize text-gray-300">
                      {option === 'all' ? 'All Time' : `Last ${option}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-700 text-gray-100"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical</option>
                {activeTab === 'youtube' && <option value="duration">By Duration</option>}
              </select>
            </div>

            {/* Channel Filter (YouTube only) */}
            {activeTab === 'youtube' && (
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Channels
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {getUniqueChannels().map((channel) => (
                    <label key={channel} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.channels.includes(channel)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({...filters, channels: [...filters.channels, channel]});
                          } else {
                            setFilters({...filters, channels: filters.channels.filter(c => c !== channel)});
                          }
                        }}
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-sm text-gray-300">
                        {channel}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Labels Filter (Keep Notes only) */}
            {activeTab === 'notes' && (
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Labels
                </label>
                <div className="space-y-2">
                  {getUniqueLabels().map((label) => (
                    <label key={label} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.labels.includes(label)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({...filters, labels: [...filters.labels, label]});
                          } else {
                            setFilters({...filters, labels: filters.labels.filter(l => l !== label)});
                          }
                        }}
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-sm flex items-center gap-2 text-gray-300">
                        <Tag size={14} />
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Content Type Filter (Keep Notes) */}
            {activeTab === 'notes' && (
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Content Type
                </label>
                <div className="space-y-2">
                  {['all', 'pinned', 'todos', 'regular'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="contentType"
                        value={type}
                        checked={filters.contentType === type}
                        onChange={(e) => setFilters({...filters, contentType: e.target.value})}
                        className="mr-3 text-blue-600"
                      />
                      <span className="capitalize text-gray-300">
                        {type === 'all' ? 'All Notes' : type === 'todos' ? 'To-Do Lists' : type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setFilters({
                dateRange: 'all',
                sortBy: 'newest',
                channels: [],
                labels: [],
                contentType: 'all'
              })}
              className="flex-1 py-3 px-4 rounded-lg border transition-colors border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Clear All
            </button>
            <button
              onClick={() => setFilterOpen(false)}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-lg' 
          : darkMode 
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
      <span className={`text-sm px-2 py-1 rounded-full ${
        activeTab === id ? 'bg-blue-500' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
      }`}>
        {count}
      </span>
    </button>
  );

  const SearchBar = () => (
    <div className="relative">
      <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} size={20} />
      <input
        type="text"
        placeholder={`Search through your ${activeTab === 'youtube' ? 'watch history' : activeTab === 'comments' ? 'comments' : 'notes'}...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`w-full pl-12 pr-4 py-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      />
    </div>
  );

  const YouTubeCard = ({ video }) => (
    <div className={`border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
          <Play className="text-red-600" size={24} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-lg mb-2 line-clamp-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {video.title}
          </h3>
          <div className={`flex items-center gap-4 text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="flex items-center gap-1">
              <Hash size={14} />
              {video.channel}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {video.duration}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {formatDate(video.watchedAt)}
            </span>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View on YouTube
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CommentCard = ({ comment }) => (
    <div className={`border rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
          <MessageCircle className="text-green-600" size={24} />
        </div>
        <div className="flex-1">
          <p className={`mb-3 leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {comment.text}
          </p>
          <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            On: <span className="font-medium">{comment.video}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {comment.channel}
            </span>
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {formatDate(comment.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const KeepNoteCard = ({ note }) => (
    <div className={`border rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${note.isPinned ? 'ring-2 ring-yellow-200' : ''} ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
          <StickyNote className="text-yellow-600" size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-semibold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {note.title}
            </h3>
            {note.isPinned && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                darkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
              }`}>
                Pinned
              </span>
            )}
          </div>
          <p className={`mb-4 whitespace-pre-line leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {note.content}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {note.labels.map((label) => (
                <span key={label} className={`text-xs px-3 py-1 rounded-full ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {label}
                </span>
              ))}
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {formatDate(note.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      {/* Header */}
      <header className={`border-b shadow-sm transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Google Takeout Viewer
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Explore your exported data with style
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Filter size={18} />
                Filters
              </button>
              <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Eye size={16} />
                <span>Last updated: Today</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <TabButton id="youtube" label="Watch History" icon={Play} count={youtubeData.length} />
          <TabButton id="comments" label="Comments" icon={MessageCircle} count={commentsData.length} />
          <TabButton id="notes" label="Keep Notes" icon={StickyNote} count={keepNotesData.length} />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar />
          
          {/* Active Filters Display */}
          {(filters.channels.length > 0 || filters.labels.length > 0 || filters.dateRange !== 'all' || filters.contentType !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.dateRange !== 'all' && (
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  <Calendar size={14} />
                  Last {filters.dateRange}
                  <button
                    onClick={() => setFilters({...filters, dateRange: 'all'})}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              
              {filters.channels.map(channel => (
                <span key={channel} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  <Hash size={14} />
                  {channel}
                  <button
                    onClick={() => setFilters({...filters, channels: filters.channels.filter(c => c !== channel)})}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              
              {filters.labels.map(label => (
                <span key={label} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  <Tag size={14} />
                  {label}
                  <button
                    onClick={() => setFilters({...filters, labels: filters.labels.filter(l => l !== label)})}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              
              {filters.contentType !== 'all' && (
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  <StickyNote size={14} />
                  {filters.contentType}
                  <button
                    onClick={() => setFilters({...filters, contentType: 'all'})}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'youtube' && youtubeData.map(video => (
            <YouTubeCard key={video.id} video={video} />
          ))}
          
          {activeTab === 'comments' && commentsData.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
          
          {activeTab === 'notes' && keepNotesData.map(note => (
            <KeepNoteCard key={note.id} note={note} />
          ))}
        </div>

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-xl border transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={24} />
              <div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {activeTab === 'youtube' ? youtubeData.length : 
                   activeTab === 'comments' ? commentsData.length : 
                   keepNotesData.length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total items</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl border transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <Clock className="text-green-600" size={24} />
              <div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {filters.dateRange === 'all' ? 'All Time' : `Last ${filters.dateRange}`}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date range</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl border transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <Filter className="text-purple-600" size={24} />
              <div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {filters.channels.length + filters.labels.length + 
                   (filters.dateRange !== 'all' ? 1 : 0) + 
                   (filters.contentType !== 'all' ? 1 : 0)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active filters</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel />
    </div>
  );
};

export default GoogleTakeoutViewer 