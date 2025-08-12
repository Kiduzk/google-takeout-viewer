import "./App.css";
import { useEffect, useState } from "react";
import {
  Search,
  Play,
  MessageCircle,
  StickyNote,
  Moon,
  Sun,
} from "lucide-react";
import axios from "axios";

import { SearchBar } from "./components/searchBar";
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

  const TabButton = ({
    id,
    label,
    icon: Icon,
    count,
  }: {
    id: string;
    label: string;
    icon: React.ElementType;
    count: number;
  }) => (
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
              <div
                className={`flex items-center gap-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <span>{statusMessage}</span>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {darkMode ? (
                  <Sun className="h-8" size={24} />
                ) : (
                  <Moon size={24} />
                )}
              </button>
              <div className="space-y-6">
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    setFilters({ ...filters, sortBy: e.target.value });
                    setYoutubeWatchData(
                      [...youtubeWatchData].sort((a, b) => {
                        if (filters.sortBy === "alphabetical") {
                          return a.title.localeCompare(b.title);
                        } else if (filters.sortBy === "oldest") {
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
                        if (filters.sortBy === "alphabetical") {
                          return a.title.localeCompare(b.title);
                        } else if (filters.sortBy === "oldest") {
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
                        if (filters.sortBy === "alphabetical") {
                          return a.text.localeCompare(b.text);
                        } else if (filters.sortBy === "oldest") {
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
                        if (filters.sortBy === "alphabetical") {
                          return (a?.textContent || "").localeCompare(
                            b?.textContent || ""
                          );
                        } else if (filters.sortBy === "oldest") {
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
                  }}
                  className={`w-full p-3 rounded-lg border focus:outline-none bg-gray-800 border-gray-700 text-gray-100 ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
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
        </div>
      </div>

      {/* Filter Options */}
      <div className="mt-8 flex gap-3">
        <div className="space-y-6">
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default GoogleTakeoutViewer;
