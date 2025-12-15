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
  const itemsPerPage = 20;
  const [youtubeDataLoading, setYoutubeDataLoading] = useState(true);
  const [youtubeSearchData, setYoutubeSearchData] = useState<YoutubeVideo[]>(
    []
  );
  const [youtubeWatchData, setYoutubeWatchData] = useState<YoutubeVideo[]>([]);
  const [commentsData, setCommentsData] = useState<YoutubeComment[]>([]);
  const [commentsDataLoading, setCommentsDataLoading] = useState(true);

  const [keepsData, setKeepsData] = useState<KeepEntry[]>([]);
  const [keepsDataLoading, setKeepsDataLoading] = useState(true);

  const [statusMessage, setStatusMessage] = useState(
    "Loading watch and search history"
  );

  // Sort handler function
  const handleSort = (sortValue: string) => {
    setFilters({ ...filters, sortBy: sortValue });

    setYoutubeWatchData(
      [...youtubeWatchData].sort((a, b) => {
        if (sortValue === "alphabetical") {
          return a.title.localeCompare(b.title);
        } else if (sortValue === "oldest") {
          return new Date(a.time).getTime() - new Date(b.time).getTime();
        } else {
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        }
      })
    );

    setYoutubeSearchData(
      [...youtubeSearchData].sort((a, b) => {
        if (sortValue === "alphabetical") {
          return a.title.localeCompare(b.title);
        } else if (sortValue === "oldest") {
          return new Date(a.time).getTime() - new Date(b.time).getTime();
        } else {
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        }
      })
    );

    setCommentsData(
      [...commentsData].sort((a, b) => {
        if (sortValue === "alphabetical") {
          return a.text.localeCompare(b.text);
        } else if (sortValue === "oldest") {
          return new Date(a.time).getTime() - new Date(b.time).getTime();
        } else {
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        }
      })
    );

    setKeepsData(
      [...keepsData].sort((a, b) => {
        if (sortValue === "alphabetical") {
          return (a?.textContent || "").localeCompare(b?.textContent || "");
        } else if (sortValue === "oldest") {
          return (
            new Date(a.createdTimestampUsec).getTime() -
            new Date(b.createdTimestampUsec).getTime()
          );
        } else {
          return (
            new Date(b.createdTimestampUsec).getTime() -
            new Date(a.createdTimestampUsec).getTime()
          );
        }
      })
    );
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
  const setCurrentPage = (page: number | ((prevPage: number) => number)) => {
    setPaginationState((prevState) => {
      const newPage =
        typeof page === "function"
          ? page(prevState[activeTab as keyof typeof prevState])
          : page;

      return {
        ...prevState,
        [activeTab]: newPage,
      };
    });
  };

  // Calculate total pages for active tab
  const getTotalPages = () => {
    let filteredDataLength = 0;

    if (activeTab === "youtube-watch") {
      filteredDataLength = youtubeWatchData.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).length;
    } else if (activeTab === "youtube-search") {
      filteredDataLength = youtubeSearchData.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).length;
    } else if (activeTab === "comments") {
      filteredDataLength = commentsData.filter((comment) =>
        comment.text.toLowerCase().includes(searchQuery.toLowerCase())
      ).length;
    } else if (activeTab === "notes") {
      filteredDataLength = keepsData.filter(
        (note) =>
          (note.textContent || note.title) &&
          (note.textContent
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            note.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      ).length;
    }

    return Math.ceil(filteredDataLength / itemsPerPage);
  };

  // Update the tab switching function to preserve pagination
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // No need to reset page when switching tabs - we're now preserving it!
  };

  // Update the search handler to reset only current tab's page
  useEffect(() => {
    // Reset only the current tab's page when search query changes
    setPaginationState((prevState) => ({
      ...prevState,
      [activeTab]: 1,
    }));
  }, [searchQuery]);

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
          data_no_ads
            .filter((video: YoutubeVideo) =>
              video.title.toLowerCase().includes("watched")
            )
            .map((video: YoutubeVideo) => {
              return {
                ...video,
                title: video.title.split(" ").slice(1).join(" "),
              };
            })
        );

        setYoutubeSearchData(
          data_no_ads
            .filter((video: YoutubeVideo) =>
              video.title.toLowerCase().includes("searched")
            )
            .map((video: YoutubeVideo) => {
              return {
                ...video,
                title: video.title.split(" ").slice(2).join(" "),
              };
            })
        );

        // Youtube comment history
        setStatusMessage("Loading comment history");
        result = await axios.get("http://127.0.0.1:8000/youtube_comments");
        setCommentsData(result.data);
        setStatusMessage("Done");

        // Keeps data
        setStatusMessage("Loading Keeps data");
        result = await axios.get("http://127.0.0.1:8000/google_keep");
        setKeepsData(result.data);
      } catch (err) {
        console.log(err);
        setStatusMessage("Error loading data. Check console logs.");
      } finally {
        setYoutubeDataLoading(false);
        setCommentsDataLoading(false);
        setKeepsDataLoading(false);
        setStatusMessage("Data loaded");
      }
    };
    get_youtube_history();
  }, []);

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
            count={youtubeWatchData.length}
            activeTab={activeTab}
            darkMode={darkMode}
            onClick={handleTabChange}
          />
          <TabButton
            id="youtube-search"
            label="Search History"
            icon={Search}
            count={youtubeSearchData.length}
            activeTab={activeTab}
            darkMode={darkMode}
            onClick={handleTabChange}
          />
          <TabButton
            id="comments"
            label="Comments"
            icon={MessageCircle}
            count={commentsData.length}
            activeTab={activeTab}
            darkMode={darkMode}
            onClick={handleTabChange}
          />
          <TabButton
            id="notes"
            label="Keep Notes"
            icon={StickyNote}
            count={keepsData.length}
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
                <option value="alphabetical">A to Z</option>
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
            youtubeWatchData
              .filter((video: YoutubeVideo) =>
                video.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(
                (getCurrentPage() - 1) * itemsPerPage,
                getCurrentPage() * itemsPerPage
              )
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
              .slice(
                (getCurrentPage() - 1) * itemsPerPage,
                getCurrentPage() * itemsPerPage
              )
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
              .slice(
                (getCurrentPage() - 1) * itemsPerPage,
                getCurrentPage() * itemsPerPage
              )
              .map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  darkMode={darkMode}
                />
              ))}

          {activeTab === "notes" && !keepsDataLoading && (
            <div className="notes-grid">
              {keepsData
                .filter(
                  (note: KeepEntry) =>
                    (note.textContent || note.title) &&
                    (note.textContent
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                      note.title
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()))
                )
                .slice(
                  (getCurrentPage() - 1) * itemsPerPage,
                  getCurrentPage() * itemsPerPage
                )
                .map((note) => (
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
