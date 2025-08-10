import "./App.css";
import { useEffect, useState } from "react";
import {
  Search,
  Play,
  MessageCircle,
  StickyNote,
  Calendar,
  Filter,
  Eye,
  Clock,
  Hash,
  Moon,
  Sun,
  X,
  Tag,
} from "lucide-react";
import axios from "axios";

import { SearchBar } from "./components/searchBar";
import { FilterPanel } from "./components/filterPanel";
import { YouTubeCard } from "./components/cards/youtubeCard";
import { CommentCard } from "./components/cards/commentCard";
import type {
  YoutubeVideo,
  YoutubeComment,
  KeepEntry,
  KeepAnnotation,
  KeepListContent,
} from "./types";

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const GoogleTakeoutViewer = () => {
  const [activeTab, setActiveTab] = useState("youtube-watch");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: "all",
    sortBy: "newest",
    channels: [],
    labels: [],
    contentType: "all",
  });
  const [youtubeDataLoading, setYoutubeDataLoading] = useState(true);
  const [youtubeSearchData, setYoutubeSearchData] = useState<YoutubeVideo[]>(
    []
  );
  const [youtubeWatchData, setYoutubeWatchData] = useState<YoutubeVideo[]>([]);

  const [commentsData, setCommentsData] = useState<YoutubeComment[]>([]);
  const [commentsDataLoading, setCommentsDataLoading] = useState(true);

  const [keepsData, setKeepsData] = useState<KeepEntry[]>([]);
  const [keepsDataLoading, setKeepsDataLoading] = useState(true);

  useEffect(() => {
    const get_youtube_history = async () => {
      try {
        // Youtube watch + search history
        let result = await axios.get("http://127.0.0.1:8000/youtube_history");
        let data_no_ads = result.data.filter(
          (video: YoutubeVideo) => video.details[0] != "From Google Ads"
        );
        // for now I am exlcuidng ads, but we can always get them back
        setYoutubeWatchData(
          data_no_ads.filter((video: YoutubeVideo) =>
            video.title.toLowerCase().includes("watched")
          )
        );
        setYoutubeSearchData(
          data_no_ads.filter((video: YoutubeVideo) =>
            video.title.toLowerCase().includes("searched")
          )
        );

        // Youtube comment history
        result = await axios.get("http://127.0.0.1:8000/youtube_comments");
        setCommentsData(result.data);

        // Keeps data
        result = await axios.get("http://127.0.0.1:8000/google_keep");
        setKeepsData(result.data);
      } catch (err) {
        console.log(err);
      } finally {
        setYoutubeDataLoading(false);
        setCommentsDataLoading(false);
        setKeepsDataLoading(false);
      }
    };
    get_youtube_history();
  }, []);

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        activeTab === id
          ? "bg-blue-600 text-white shadow-lg"
          : darkMode
            ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
      <span
        className={`text-sm px-2 py-1 rounded-full ${
          activeTab === id
            ? "bg-blue-500"
            : darkMode
              ? "bg-gray-700"
              : "bg-gray-300"
        }`}
      >
        {count}
      </span>
    </button>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b shadow-sm transition-colors duration-300 ${
          darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-3xl font-bold ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Google Takeout Viewer
              </h1>
              <p
                className={`mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Explore your exported data with style
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                {darkMode ? "Light" : "Dark"}
              </button>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <Filter size={18} />
                Filters
              </button>
              <div
                className={`flex items-center gap-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
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
          <TabButton
            id="youtube-watch"
            label="Watch History"
            icon={Play}
            count={youtubeWatchData.length}
          />
          <TabButton
            id="youtube-search"
            label="Search History"
            icon={Search}
            count={youtubeSearchData.length}
          />
          <TabButton
            id="comments"
            label="Comments"
            icon={MessageCircle}
            count={commentsData.length}
          />
          <TabButton
            id="notes"
            label="Keep Notes"
            icon={StickyNote}
            count={keepsData.length}
          />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            darkMode={darkMode}
          />

          {/* Active Filters Display */}
          {(filters.channels.length > 0 ||
            filters.labels.length > 0 ||
            filters.dateRange !== "all" ||
            filters.contentType !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.dateRange !== "all" && (
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    darkMode
                      ? "bg-gray-800 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Calendar size={14} />
                  Last {filters.dateRange}
                  <button
                    onClick={() => setFilters({ ...filters, dateRange: "all" })}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}

              {filters.channels.map((channel) => (
                <span
                  key={channel}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    darkMode
                      ? "bg-gray-800 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Hash size={14} />
                  {channel}
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        channels: filters.channels.filter((c) => c !== channel),
                      })
                    }
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}

              {filters.labels.map((label) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    darkMode
                      ? "bg-gray-800 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Tag size={14} />
                  {label}
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        labels: filters.labels.filter((l) => l !== label),
                      })
                    }
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}

              {filters.contentType !== "all" && (
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    darkMode
                      ? "bg-gray-800 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <StickyNote size={14} />
                  {filters.contentType}
                  <button
                    onClick={() =>
                      setFilters({ ...filters, contentType: "all" })
                    }
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
          {activeTab === "youtube-watch" &&
            !youtubeDataLoading &&
            youtubeWatchData
              .filter((video: YoutubeVideo) =>
                video.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(0, 20)
              .map((video: YoutubeVideo) => (
                <YouTubeCard
                  key={video.id}
                  video={video}
                  cardType=""
                  darkMode={darkMode}
                />
              ))}

          {activeTab === "youtube-search" &&
            !youtubeDataLoading &&
            youtubeSearchData
              .filter((video: YoutubeVideo) =>
                video.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(0, 20)
              .map((video: YoutubeVideo) => (
                <YouTubeCard
                  key={video.id}
                  video={video}
                  cardType="search"
                  darkMode={darkMode}
                />
              ))}

          {activeTab === "comments" &&
            !commentsDataLoading &&
            commentsData
              .filter((comment: YoutubeComment) =>
                comment.text.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(0, 20)
              .map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  darkMode={darkMode}
                />
              ))}

          <div className='grid grid-cols-2 md:grid-cols-4 gap-8"'>
            {activeTab === "notes" &&
              !keepsDataLoading &&
              keepsData
                .filter(
                  (note: KeepEntry) =>
                    note.textContent
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    note.title
                      ?.toLocaleLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .slice(0, 20)
                .map((note) => <KeepNoteCard key={note.id} note={note} />)}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`p-6 rounded-xl border transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={24} />
              <div>
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {activeTab === "youtube-search"
                    ? youtubeSearchData.length
                    : activeTab === "youtube-watch"
                      ? youtubeWatchData.length
                      : activeTab === "comments"
                        ? commentsData.length
                        : keepsData.length}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total items
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="text-green-600" size={24} />
              <div>
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {filters.dateRange === "all"
                    ? "All Time"
                    : `Last ${filters.dateRange}`}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Date range
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Filter className="text-purple-600" size={24} />
              <div>
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {filters.channels.length +
                    filters.labels.length +
                    (filters.dateRange !== "all" ? 1 : 0) +
                    (filters.contentType !== "all" ? 1 : 0)}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Active filters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        setFilters={setFilters}
        filters={filters}
        activeTab={activeTab}
      />
    </div>
  );
};

export default GoogleTakeoutViewer;
