import { Play, Search, MessageCircle, StickyNote } from "lucide-react";
import { TabButton } from "./TabButton";
import type { Tab } from "../types";

export const TabsSection = ({
  activeTab,
  youtubeWatchTotalCount,
  youtubeSearchTotalCount,
  commentsTotalCount,
  keepsTotalCount,
  darkMode,
  onTabChange,
}: {
  activeTab: Tab;
  youtubeWatchTotalCount: number;
  youtubeSearchTotalCount: number;
  commentsTotalCount: number;
  keepsTotalCount: number;
  darkMode: boolean;
  onTabChange: (tabId: string) => void;
}) => (
  <div className="tabs-container">
    <TabButton
      id="youtube-watch"
      label="Watch History"
      icon={Play}
      count={youtubeWatchTotalCount}
      activeTab={activeTab}
      darkMode={darkMode}
      onClick={onTabChange}
    />
    <TabButton
      id="youtube-search"
      label="Search History"
      icon={Search}
      count={youtubeSearchTotalCount}
      activeTab={activeTab}
      darkMode={darkMode}
      onClick={onTabChange}
    />
    <TabButton
      id="comments"
      label="Comments"
      icon={MessageCircle}
      count={commentsTotalCount}
      activeTab={activeTab}
      darkMode={darkMode}
      onClick={onTabChange}
    />
    <TabButton
      id="notes"
      label="Keep Notes"
      icon={StickyNote}
      count={keepsTotalCount}
      activeTab={activeTab}
      darkMode={darkMode}
      onClick={onTabChange}
    />
  </div>
);
