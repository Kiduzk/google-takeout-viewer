import "./App.css";
import { useEffect, useState } from "react";
import {
  Search,
  Play,
  MessageCircle,
  StickyNote,
  Sun,
  Moon,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

import { SearchBar } from "./components/searchBar";
import { TabButton } from "./components/TabButton";
import { YouTubeCard } from "./components/cards/youtubeCard";
import { CommentCard } from "./components/cards/commentCard";
import { KeepNoteCard } from "./components/cards/keepsNoteCard";

import type { YoutubeVideo, YoutubeComment, KeepEntry } from "./types";

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
  const [darkMode, setDarkMode] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: "all",
    sortBy: "newest",
    channels: [],
    labels: [],
    contentType: "all",
  });

  const [paginationState, setPaginationState] = useState({
    "youtube-watch": 1,
    "youtube-search": 1,
    comments: 1,
    notes: 1,
  });
  const itemsPerPage = 50;
  const [youtubeDataLoading, setYoutubeDataLoading] = useState(true);
  const [youtubeSearchData, setYoutubeSearchData] = useState<YoutubeVideo[]>(
    []
  );
  const [youtubeWatchData, setYoutubeWatchData] = useState<YoutubeVideo[]>([]);
  const [youtubeWatchTotalPages, setYoutubeWatchTotalPages] = useState(1);
  const [youtubeWatchTotalCount, setYoutubeWatchTotalCount] = useState(0);
  const [youtubeSearchTotalPages, setYoutubeSearchTotalPages] = useState(1);
  const [youtubeSearchTotalCount, setYoutubeSearchTotalCount] = useState(0);
  const [commentsData, setCommentsData] = useState<YoutubeComment[]>([]);
  const [commentsDataLoading, setCommentsDataLoading] = useState(true);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [commentsTotalCount, setCommentsTotalCount] = useState(0);

  const [keepsData, setKeepsData] = useState<KeepEntry[]>([]);
  const [keepsDataLoading, setKeepsDataLoading] = useState(true);
  const [keepsTotalPages, setKeepsTotalPages] = useState(1);
  const [keepsTotalCount, setKeepsTotalCount] = useState(0);

  const [statusMessage, setStatusMessage] = useState(
    "Loading watch and search history"
  );

  // Sort handler function
  const handleSort = (sortValue: string) => {
    setFilters({ ...filters, sortBy: sortValue });
    setPaginationState(() => ({
      "youtube-watch": 1,
      "youtube-search": 1,
      comments: 1,
      notes: 1,
    }));
  };

  // Get current page for active tab
  const getCurrentPage = () =>
    paginationState[activeTab as keyof typeof paginationState];

  // Set page for current tab only
  const setCurrentPage = (page: (prevPage: number) => number) => {
    setPaginationState((prevState) => {
      const newPage = page(prevState[activeTab as keyof typeof prevState]);
      return {
        ...prevState,
        [activeTab]: newPage,
      };
    });
  };

  // Gets total pages for active tab, default to 1
  const getTotalPages = () => {
    if (activeTab === "youtube-watch") {
      return youtubeWatchTotalPages;
    } else if (activeTab === "youtube-search") {
      return youtubeSearchTotalPages;
    } else if (activeTab === "comments") {
      return commentsTotalPages;
    } else if (activeTab === "notes") {
      return keepsTotalPages;
    }
    return 1;
  };

  // Update the tab switching function to preserve pagination
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Update the search handler to reset only current tab's page
  useEffect(() => {
    // Reset only the current tab's page when search query changes
    setPaginationState((prevState) => ({
      ...prevState,
      [activeTab]: 1,
    }));
  }, [searchQuery]);


  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [watch, search, comments, keeps] = await Promise.all([
          axios.get("http://127.0.0.1:8000/youtube_history", {
            params: { page: 1, per_page: itemsPerPage },
          }),
          axios.get("http://127.0.0.1:8000/youtube_search", {
            params: { page: 1, per_page: itemsPerPage },
          }),
          axios.get("http://127.0.0.1:8000/youtube_comments", {
            params: { page: 1, per_page: itemsPerPage },
          }),
          axios.get("http://127.0.0.1:8000/google_keep", {
            params: { page: 1, per_page: itemsPerPage },
          }),
        ]);

        // Set watch history
        setYoutubeWatchData(watch.data.data);
        setYoutubeWatchTotalPages(watch.data.pagination.pages);
        setYoutubeWatchTotalCount(watch.data.pagination.total);

        // Set search history
        setYoutubeSearchData(search.data.data);
        setYoutubeSearchTotalPages(search.data.pagination.pages);
        setYoutubeSearchTotalCount(search.data.pagination.total);

        // Set comments
        setCommentsData(comments.data.data);
        setCommentsTotalPages(comments.data.pagination.pages);
        setCommentsTotalCount(comments.data.pagination.total);

        // Set keeps
        setKeepsData(keeps.data.data);
        setKeepsTotalPages(keeps.data.pagination.pages);
        setKeepsTotalCount(keeps.data.pagination.total);

        setYoutubeDataLoading(false);
        setCommentsDataLoading(false);
        setKeepsDataLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setStatusMessage("Error loading data.");
      }
    };
    loadAllData();
  }, []);

  // Fetch YouTube watch history
  useEffect(() => {
    const fetchWatchHistory = async () => {
      try {
        setStatusMessage("Loading watch history");
        const sort = filters.sortBy === "oldest" ? "oldest" : "newest";
        const result = await axios.get(
          "http://127.0.0.1:8000/youtube_history",
          {
            params: {
              page: paginationState["youtube-watch"],
              per_page: itemsPerPage,
              search: searchQuery,
              sort: sort,
            },
          }
        );

        const responseData = result.data;
        setYoutubeWatchData(responseData.data);
        setYoutubeWatchTotalPages(responseData.pagination.pages);
        if (activeTab === "youtube-watch") {
          setYoutubeWatchTotalCount(responseData.pagination.total);
        }
        setYoutubeDataLoading(false);
        setStatusMessage("Data loaded");
      } catch (err) {
        console.log("Error fetching watch history:", err);
        setStatusMessage("Error loading watch history.");
        setYoutubeDataLoading(false);
      }
    };
    fetchWatchHistory();
  }, [paginationState["youtube-watch"], searchQuery, filters.sortBy, activeTab]);

  // Fetch YouTube search history
  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        const sort = filters.sortBy === "oldest" ? "oldest" : "newest";
        const result = await axios.get("http://127.0.0.1:8000/youtube_search", {
          params: {
            page: paginationState["youtube-search"],
            per_page: itemsPerPage,
            search: searchQuery,
            sort: sort,
          },
        });

        const responseData = result.data;
        setYoutubeSearchData(responseData.data);
        setYoutubeSearchTotalPages(responseData.pagination.pages);
        if (activeTab === "youtube-search") {
          setYoutubeSearchTotalCount(responseData.pagination.total);
        }
        setStatusMessage("Data loaded");
      } catch (err) {
        console.log("Error fetching search history:", err);
        setStatusMessage("Error loading search history.");
      }
    };
    fetchSearchHistory();
  }, [paginationState["youtube-search"], searchQuery, filters.sortBy, activeTab]);

  // Fetch YouTube comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setStatusMessage("Loading comment history");
        const sort = filters.sortBy === "oldest" ? "oldest" : "newest";
        const result = await axios.get(
          "http://127.0.0.1:8000/youtube_comments",
          {
            params: {
              page: paginationState["comments"],
              per_page: itemsPerPage,
              search: searchQuery,
              sort: sort,
            },
          }
        );
        const responseData = result.data;
        setCommentsData(responseData.data);
        setCommentsTotalPages(responseData.pagination.pages);
        if (activeTab === "comments") {
          setCommentsTotalCount(responseData.pagination.total);
        }
        setCommentsDataLoading(false);
        setStatusMessage("Data loaded");
      } catch (err) {
        console.log("Error fetching comments:", err);
        setStatusMessage("Error loading comments.");
      }
    };
    fetchComments();
  }, [paginationState["comments"], searchQuery, filters.sortBy, activeTab]);

  // Fetch Google Keep notes
  useEffect(() => {
    const fetchKeeps = async () => {
      try {
        setStatusMessage("Loading Keeps data");
        const sort = filters.sortBy === "oldest" ? "oldest" : "newest";
        const result = await axios.get("http://127.0.0.1:8000/google_keep", {
          params: {
            page: paginationState["notes"],
            per_page: itemsPerPage,
            search: searchQuery,
            sort: sort,
          },
        });
        const responseData = result.data;
        setKeepsData(responseData.data);
        setKeepsTotalPages(responseData.pagination.pages);
        if (activeTab === "notes") {
          setKeepsTotalCount(responseData.pagination.total);
        }
        setKeepsDataLoading(false);
        setStatusMessage("Data loaded");
      } catch (err) {
        console.log("Error fetching keeps:", err);
        setStatusMessage("Error loading keeps.");
      }
    };
    fetchKeeps();
  }, [paginationState["notes"], searchQuery, filters.sortBy, activeTab]);

  return (
    <div className={darkMode ? "app-bg-dark" : "app-bg-light"}>
      {/* Header */}
      <header className={darkMode ? "app-header-dark" : "app-header-light"}>
        <div className="container-layout">
          <div className="header-content">
            <div>
              <h1
                className={
                  darkMode ? "heading-title-dark" : "heading-title-light"
                }
              >
                Google Takeout Viewer
              </h1>
              <p
                className={
                  darkMode ? "heading-subtitle-dark" : "heading-subtitle-light"
                }
              ></p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={darkMode ? "status-text-dark" : "status-text-light"}
              >
                <span>{statusMessage}</span>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={
                  darkMode ? "theme-toggle-dark" : "theme-toggle-light"
                }
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="content-container">
        {/* Navigation Tabs */}
        <div className="tabs-container">
          <TabButton
            id="youtube-watch"
            label="Watch History"
            icon={Play}
            count={youtubeWatchTotalCount}
            activeTab={activeTab}
            darkMode={darkMode}
            onClick={handleTabChange}
          />
          <TabButton
            id="youtube-search"
            label="Search History"
            icon={Search}
            count={youtubeSearchTotalCount}
            activeTab={activeTab}
            darkMode={darkMode}
            onClick={handleTabChange}
          />
          <TabButton
            id="comments"
            label="Comments"
            icon={MessageCircle}
            count={commentsTotalCount}
            activeTab={activeTab}
            darkMode={darkMode}
            onClick={handleTabChange}
          />
          <TabButton
            id="notes"
            label="Keep Notes"
            icon={StickyNote}
            count={keepsTotalCount}
            activeTab={activeTab}
            darkMode={darkMode}
            onClick={handleTabChange}
          />
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            darkMode={darkMode}
          />
        </div>
        {/* Content */}
        <div className="content-section">
          <div className="flex justify-between mb-4 items-center">
            {/* Sort dropdown */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className={`appearance-none pl-4 pr-10 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-200"
                    : "bg-white border-gray-200 text-gray-700"
                } border`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${darkMode ? "%23aaa" : "%23666"}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1rem",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Go Down button */}
            <button
              onClick={() =>
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                })
              }
              title="Go to bottom"
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ArrowDown size={16} />
              <span>Bottom</span>
            </button>
          </div>

          {activeTab === "youtube-watch" &&
            !youtubeDataLoading &&
            youtubeWatchData.map((video: YoutubeVideo) => (
              <YouTubeCard
                key={video.id}
                video={video}
                cardType=""
                darkMode={darkMode}
              />
            ))}

          {activeTab === "youtube-search" &&
            !youtubeDataLoading &&
            youtubeSearchData.map((video: YoutubeVideo) => (
              <YouTubeCard
                key={video.id}
                video={video}
                cardType="search"
                darkMode={darkMode}
              />
            ))}

          {activeTab === "comments" &&
            !commentsDataLoading &&
            commentsData.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                darkMode={darkMode}
              />
            ))}

          {activeTab === "notes" && !keepsDataLoading && (
            <div className="notes-grid">
              {keepsData.map((note) => (
                <KeepNoteCard key={note.id} note={note} darkMode={darkMode} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={getCurrentPage() === 1}
                className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                  getCurrentPage() === 1
                    ? `opacity-50 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`
                    : darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft size={16} />
                <span className="ml-1">Previous</span>
              </button>

              <div
                className={`px-4 py-2 font-medium ${darkMode ? "text-gray-300" : "text-gray-800"}`}
              >
                Page {getCurrentPage()} of {getTotalPages()}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(getTotalPages(), p + 1))
                }
                disabled={getCurrentPage() === getTotalPages()}
                className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                  getCurrentPage() === getTotalPages()
                    ? `opacity-50 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`
                    : darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="mr-1">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Go Up button at bottom */}
          <div className="flex justify-center mt-8 mb-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ArrowUp size={16} />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleTakeoutViewer;
