import "./App.css";
import { useEffect, useState } from "react";
import {
  Search,
  Play,
  MessageCircle,
  StickyNote,
  Sun,
  Moon
} from "lucide-react";
import axios from "axios";

import { SearchBar } from "./components/searchBar";
import { TabButton } from "./components/TabButton";
import { YouTubeCard } from "./components/cards/youtubeCard";
import { CommentCard } from "./components/cards/commentCard";
import { KeepNoteCard } from "./components/cards/keepsNoteCard";

import { YoutubeWatchGraph } from "./components/graphs/youtubeWatchGraph";

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
  const [youtubeDataLoading, setYoutubeDataLoading] = useState(true);
  const [youtubeSearchData, setYoutubeSearchData] = useState<YoutubeVideo[]>([]);
  const [youtubeWatchData, setYoutubeWatchData] = useState<YoutubeVideo[]>([]);

  // TODO: look into how to add more graphs in future, probably need more general
  const [youtubeWatchDataGraph, setYoutubeWatchDataGraph] = useState<
    { date: string; count: number }[]
  >([]);

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
          return (
            new Date(a.time).getTime() -
            new Date(b.time).getTime()
          );
        } else {
          return (
            new Date(b.time).getTime() -
            new Date(a.time).getTime()
          );
        }
      })
    );
    
    setYoutubeSearchData(
      [...youtubeSearchData].sort((a, b) => {
        if (sortValue === "alphabetical") {
          return a.title.localeCompare(b.title);
        } else if (sortValue === "oldest") {
          return (
            new Date(a.time).getTime() -
            new Date(b.time).getTime()
          );
        } else {
          return (
            new Date(b.time).getTime() -
            new Date(a.time).getTime()
          );
        }
      })
    );
    
    setCommentsData(
      [...commentsData].sort((a, b) => {
        if (sortValue === "alphabetical") {
          return a.text.localeCompare(b.text);
        } else if (sortValue === "oldest") {
          return (
            new Date(a.time).getTime() -
            new Date(b.time).getTime()
          );
        } else {
          return (
            new Date(b.time).getTime() -
            new Date(a.time).getTime()
          );
        }
      })
    );
    
    setKeepsData(
      [...keepsData].sort((a, b) => {
        if (sortValue === "alphabetical") {
          return (a?.textContent || "").localeCompare(
            b?.textContent || ""
          );
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
  };

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
        // for graph visualization
        // Goal: to look at how much videos we watch per day. Accumulate all the same days in one
        const watchGraphDataByDate = data_no_ads
          .filter((video: YoutubeVideo) =>
            video.title.toLowerCase().includes("watched")
          )
          .map((video: YoutubeVideo) => ({
            date: new Date(video.time).toLocaleDateString(),
          }))
          .reduce((count: Record<string, number>, item: { date: string }) => {
            count[item.date] = (count[item.date] || 0) + 1;
            return count;
          }, {});
        const chartData = Object.entries(watchGraphDataByDate).map(
          ([date, count]) => ({
            date,
            count: Number(count),
          })
        ); // array gymnastics to make output consistent with how recharts wants it
        setYoutubeWatchDataGraph(chartData);

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
              <h1 className={darkMode ? "heading-title-dark" : "heading-title-light"}>
                Google Takeout Viewer
              </h1>
              <p className={darkMode ? "heading-subtitle-dark" : "heading-subtitle-light"}>
                Explore your exported data with style
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={darkMode ? "status-text-dark" : "status-text-light"}>
                <span>{statusMessage}</span>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={darkMode ? "theme-toggle-dark" : "theme-toggle-light"}
              >
                {darkMode ? (
                  <Sun size={20} />
                ) : (
                  <Moon size={20} />
                )}
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
            onClick={setActiveTab}
          />
          <TabButton
            id="youtube-search"
            label="Search History"
            icon={Search}
            count={youtubeSearchData.length}
            activeTab={activeTab}
            darkMode={darkMode}
            onClick={setActiveTab}
          />
          <TabButton
            id="comments"
            label="Comments"
            icon={MessageCircle}
            count={commentsData.length}
            activeTab={activeTab}
            darkMode={darkMode}
            onClick={setActiveTab}
          />
          <TabButton
            id="notes"
            label="Keep Notes"
            icon={StickyNote}
            count={keepsData.length}
            activeTab={activeTab}
            darkMode={darkMode}
            onClick={setActiveTab}
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
          {activeTab === "youtube-watch" && (
            <div className="graph-container">
              <YoutubeWatchGraph
                youtubeWatchDataGraph={youtubeWatchDataGraph}
                darkMode={darkMode}
              />
            </div>
          )}
        <div className="flex w-35 justify-end mb-4">
          <select
            value={filters.sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className={darkMode ? "select-dark" : "select-light"}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
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
                .slice(0, 20)
                .map((note) => (
                  <KeepNoteCard key={note.id} note={note} darkMode={darkMode} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleTakeoutViewer;
