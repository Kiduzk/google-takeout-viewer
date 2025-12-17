import { YouTubeCard } from "./cards/youtubeCard";
import { CommentCard } from "./cards/commentCard";
import { KeepNoteCard } from "./cards/keepsNoteCard";
import type { YoutubeVideo, YoutubeComment, KeepEntry, Tab } from "../types";

export const ContentRenderer = ({
  activeTab,
  youtubeWatchData,
  youtubeSearchData,
  commentsData,
  keepsData,
  youtubeDataLoading,
  commentsDataLoading,
  keepsDataLoading,
  darkMode,
  currentPage,
}: {
  activeTab: Tab;
  youtubeWatchData: YoutubeVideo[];
  youtubeSearchData: YoutubeVideo[];
  commentsData: YoutubeComment[];
  keepsData: KeepEntry[];
  youtubeDataLoading: boolean;
  commentsDataLoading: boolean;
  keepsDataLoading: boolean;
  darkMode: boolean;
  currentPage: number;
}) => {
  return (
    <>
      {activeTab === "youtube-watch" &&
        !youtubeDataLoading &&
        youtubeWatchData.map((video: YoutubeVideo, idx) => (
          <YouTubeCard
            key={`yw-${currentPage}-${idx}-${video.id}`}
            video={video}
            cardType=""
            darkMode={darkMode}
          />
        ))}

      {activeTab === "youtube-search" &&
        !youtubeDataLoading &&
        youtubeSearchData.map((video: YoutubeVideo, idx) => (
          <YouTubeCard
            key={`ys-${currentPage}-${idx}-${video.id}`}
            video={video}
            cardType="search"
            darkMode={darkMode}
          />
        ))}

      {activeTab === "comments" &&
        !commentsDataLoading &&
        commentsData.map((comment, idx) => (
          <CommentCard
            key={`c-${currentPage}-${idx}-${comment.id}`}
            comment={comment}
            darkMode={darkMode}
          />
        ))}

      {activeTab === "notes" && !keepsDataLoading && (
        <div className="notes-grid">
          {keepsData.map((note, idx) => (
            <KeepNoteCard
              key={`n-${currentPage}-${idx}-${note.id}`}
              note={note}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </>
  );
};
