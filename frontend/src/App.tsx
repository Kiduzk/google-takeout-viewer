import './App.css'
import { useEffect, useState } from 'react';
import { Search, Play, MessageCircle, StickyNote, Calendar, Filter, Eye, Clock, Hash, Moon, Sun, X, Tag, SquaresExclude } from 'lucide-react';
import axios from 'axios';

interface YoutubeVideo {
  id: number;
  title: string;
  titleUrl: string;
  time: string;
  details: string[];
}

interface YoutubeComment {
  id: number,
  videoId: string,
  channelId: string,
  commentId: string,
  text: string,
  time: string,
}

interface KeepListContent {
    textHtml: string,
    text: string,
    isChecked: boolean
}

interface KeepAnnotation {
    description: string,
    source: string,
    title: string,
    url: string
}


interface KeepsEntry {
  id: number,
  title: string,
  userEditedTimestampUsec: string, 
  createdTimestampUsec: string,
  listContent: KeepListContent[],
  textContent: string,
  textContentHtml: string,
  color: string,
  annotations: KeepAnnotation[],
  isTrashed: boolean,
  isPinned: boolean
  isArchived: boolean
}

const SearchBar = ( {searchQuery, setSearchQuery, activeTab, darkMode } : {
    searchQuery: string,
    setSearchQuery: (value: string) => void,
    activeTab: string,
    darkMode: boolean
  } ) => (
  <div className="relative">
    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} size={20} />
    <input
      type="text"
      placeholder={`Search through your ${activeTab === 'youtube-watch' ? 'YouTube watch history' : activeTab === 'youtube-search' ? 'YouTube search history' : activeTab === 'comments' ? 'YouTube comments' : 'notes'}...`}
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

const GoogleTakeoutViewer = () => {
  const [activeTab, setActiveTab] = useState('youtube-watch');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    sortBy: 'newest',
    channels: [],
    labels: [],
    contentType: 'all'
  });
  const [youtubeDataLoading, setYoutubeDataLoading] = useState(true);
  const [youtubeSearchData, setYoutubeSearchData] = useState<YoutubeVideo[]>([]);
  const [youtubeWatchData, setYoutubeWatchData] = useState<YoutubeVideo[]>([]);

  const [commentsData, setCommentsData] = useState<YoutubeComment[]>([]);
  const [commentsDataLoading, setCommentsDataLoading] = useState(true);

  const [keepsData, setKeepsData] = useState<KeepsEntry[]>([]);
  const [keepsDataLoading, setKeepsDataLoading] = useState(true)

  useEffect(() => {
    const get_youtube_history = async () => {
      try {
        // Youtube watch + search history
        let result = await axios.get("http://127.0.0.1:8000/youtube_history");
        let data_no_ads = result.data.filter(
          (video: YoutubeVideo) => video.details[0] != "From Google Ads"
        )
        // for now I am exlcuidng ads, but we can always get them back
        setYoutubeWatchData(data_no_ads.filter(
          (video: YoutubeVideo) => video.title.toLowerCase().includes("watched")
        ));
        setYoutubeSearchData(data_no_ads.filter(
          (video: YoutubeVideo) => video.title.toLowerCase().includes("searched")
        ))

        // Youtube comment history
        result = await axios.get("http://127.0.0.1:8000/youtube_comments");
        setCommentsData(result.data)

        // Keeps data
        result = await axios.get("http://127.0.0.1:8000/google_keep");
        setKeepsData(result.data)

      } catch (err) {
        console.log(err);
      } finally {
        setYoutubeDataLoading(false);
        setCommentsDataLoading(false);
        setKeepsDataLoading(false);
      }
    }
    get_youtube_history();
  }, [])


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

            {/* Labels Filter (Keep Notes only) */}
            {/* {activeTab === 'notes' && (
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
            )} */}

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

  
  const YouTubeCard = ({ video, cardType }: { video: YoutubeVideo, cardType: string  }) => (
    <div className={`border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
          {cardType === "search" 
          ? <Search className='text-red-600' size={24} />
          : <Play className="text-red-600" size={24} />}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-lg mb-2 line-clamp-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {video.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {formatDate(video.time)}
            </span>
            <a href={video.titleUrl} target="_blank" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const CommentCard = ({ comment } : { comment: YoutubeComment }) => (
    <div className={`border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
          <MessageCircle className="text-green-600" size={24} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-lg mb-2 line-clamp-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {comment.text}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {formatDate(comment.time)}
            </span>
            <a href={`https://www.youtube.com/watch?v=${comment.videoId}&lc=${comment.commentId}`} target="_blank" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const KeepNoteCard = ({ note } : { note: KeepsEntry }) => (
    <div className={`border max-h-100  m-5 rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${note.isPinned ? 'ring-2 ring-yellow-200' : ''} ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className="flex-1 justify-between">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`break-words break-all font-semibold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
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
          <p className={`h-50 break-words break-all overflow-hidden truncate mb-4 whitespace-pre-line leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {note.textContent}
          </p>
          <div className="flex items-center">
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {formatDate(note.createdTimestampUsec)}
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
          <TabButton id="youtube-watch" label="Watch History" icon={Play} count={youtubeWatchData.length} />
          <TabButton id="youtube-search" label="Search History" icon={Search} count={youtubeSearchData.length} />
          <TabButton id="comments" label="Comments" icon={MessageCircle} count={commentsData.length} />
          <TabButton id="notes" label="Keep Notes" icon={StickyNote} count={keepsData.length} />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeTab={activeTab} darkMode={darkMode} />
          
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
          {activeTab === 'youtube-watch' &&
          !youtubeDataLoading && youtubeWatchData
          .filter(
            (video: YoutubeVideo) => video.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 20)
          .map((video: YoutubeVideo) => (
            <YouTubeCard key={video.id} video={video} />
          ))}

          {activeTab === 'youtube-search' &&
          !youtubeDataLoading && youtubeSearchData
          .filter(
            (video: YoutubeVideo) => video.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 20)
          .map((video: YoutubeVideo) => (
            <YouTubeCard key={video.id} video={video} cardType="search" />
          ))}
         
          {activeTab === 'comments' && 
          
          !commentsDataLoading && commentsData
          .filter(
            (comment: YoutubeComment) => comment.text.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 20)
          .map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
          
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8"'>
          {activeTab === 'notes' && 
          
          !keepsDataLoading && keepsData 
          .filter(
            (note: KeepsEntry) => 
              note.textContent?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              note.title?.toLocaleLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 20)
          .map(note => (
            <KeepNoteCard key={note.id} note={note} />
          ))}
 
          </div>
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
                  {activeTab === 'youtube-search' ? youtubeSearchData.length : 
                   activeTab === 'youtube-watch' ? youtubeWatchData.length : 
                   activeTab === 'comments' ? commentsData.length : 
                   keepsData.length}
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