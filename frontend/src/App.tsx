import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";

import { Header } from "./components/header";
import { SearchBar } from "./components/searchBar";
import { TabsSection } from "./components/tabsSection";
import { SortAndScrollControls } from "./components/sortAndScrollControls";
import { ContentRenderer } from "./components/contentRenderer";
import { Pagination } from "./components/pagination";
import { ScrollToTop } from "./components/ScrollToTop";

import type {
  YoutubeVideo,
  YoutubeComment,
  KeepEntry,
  Tab,
  ApiResponse,
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

// Map tab name to the url address for each type of data we show, if we want to add more we just add the datapoint here
// and fetching the data will be handled for us automatically
const tabToUrlAddress: Record<Tab, string> = {
  "youtube-watch": "youtube_history",
  "youtube-search": "youtube_search",
  comments: "youtube_comments",
  notes: "google_keep",
};

const GoogleTakeoutViewer = () => {
  const [activeTab, setActiveTab] = useState<Tab>("youtube-watch");
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: "all",
    sortBy: "newest",
    channels: [],
    labels: [],
    contentType: "all",
  });

  const [paginationState, setPaginationState] = useState<Record<Tab, number>>({
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
    setActiveTab(tabId as Tab);
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
        updateResponseData(watch.data, "youtube-watch");

        // Set search history
        updateResponseData(search.data, "youtube-search");

        // Set comments
        updateResponseData(comments.data, "comments");

        // Set keeps
        updateResponseData(keeps.data, "notes");
      } catch (err) {
        console.error("Error loading data:", err);
        setStatusMessage("Error loading data.");
      }
    };
    loadAllData();
  }, []);

  // Update the response we gotten based on the active tab
  // could be much cleaner for the future to make it easier to add new supported data
  const updateResponseData = (result: ApiResponse, tab: Tab) => {
    if (tab === "youtube-watch") {
      setYoutubeWatchData(result.data);
      setYoutubeWatchTotalPages(result.pagination.pages);
      setYoutubeWatchTotalCount(result.pagination.total);
      setYoutubeDataLoading(false);
    } else if (tab === "youtube-search") {
      setYoutubeSearchData(result.data);
      setYoutubeSearchTotalPages(result.pagination.pages);
      setYoutubeSearchTotalCount(result.pagination.total);
      setYoutubeDataLoading(false);
    } else if (tab === "comments") {
      setCommentsData(result.data);
      setCommentsTotalPages(result.pagination.pages);
      setCommentsTotalCount(result.pagination.total);
      setCommentsDataLoading(false);
    } else if (tab === "notes") {
      setKeepsData(result.data);
      setKeepsTotalPages(result.pagination.pages);
      setKeepsTotalCount(result.pagination.total);
      setKeepsDataLoading(false);
    }
  };

  // General useEffect, it will fetch data for the current active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatusMessage(`Loading ${activeTab} data`);
        const sort = filters.sortBy === "oldest" ? "oldest" : "newest";
        const result = await axios.get(
          `http://127.0.0.1:8000/${tabToUrlAddress[activeTab]}`,
          {
            params: {
              page: paginationState[activeTab],
              per_page: itemsPerPage,
              search: searchQuery,
              sort: sort,
            },
          }
        );
        const responseData = result.data;
        updateResponseData(responseData, activeTab);
        setStatusMessage("Data loaded");
      } catch (err) {
        setStatusMessage(`Error loading ${activeTab}.`);
      }
    };
    fetchData();
  }, [paginationState[activeTab], searchQuery, filters.sortBy, activeTab]);

  return (
    <div className={darkMode ? "app-bg-dark" : "app-bg-light"}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} statusMessage={statusMessage} />

      <div className="content-container">
        <TabsSection
          activeTab={activeTab}
          youtubeWatchTotalCount={youtubeWatchTotalCount}
          youtubeSearchTotalCount={youtubeSearchTotalCount}
          commentsTotalCount={commentsTotalCount}
          keepsTotalCount={keepsTotalCount}
          darkMode={darkMode}
          onTabChange={handleTabChange}
        />

        <div className="search-container">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            darkMode={darkMode}
          />
        </div>

        <div className="content-section">
          <SortAndScrollControls
            sortBy={filters.sortBy}
            darkMode={darkMode}
            onSortChange={handleSort}
          />

          <ContentRenderer
            activeTab={activeTab}
            youtubeWatchData={youtubeWatchData}
            youtubeSearchData={youtubeSearchData}
            commentsData={commentsData}
            keepsData={keepsData}
            youtubeDataLoading={youtubeDataLoading}
            commentsDataLoading={commentsDataLoading}
            keepsDataLoading={keepsDataLoading}
            darkMode={darkMode}
            currentPage={getCurrentPage()}
          />

          <Pagination
            currentPage={getCurrentPage()}
            totalPages={getTotalPages()}
            darkMode={darkMode}
            onPreviousClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNextClick={() => setCurrentPage((p) => Math.min(getTotalPages(), p + 1))}
          />

          <ScrollToTop darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default GoogleTakeoutViewer;
