// Search bar component
import { Search } from "lucide-react";

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  darkMode,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeTab: string;
  darkMode: boolean;
}) => (
  <div className="relative">
    <Search
      className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
        darkMode ? "text-gray-400" : "text-gray-400"
      }`}
      size={20}
    />
    <input
      type="text"
      placeholder={`Search through your ${
        activeTab === "youtube-watch"
          ? "YouTube watch history"
          : activeTab === "youtube-search"
            ? "YouTube search history"
            : activeTab === "comments"
              ? "YouTube comments"
              : "notes"
      }...`}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className={`w-full pl-12 pr-4 py-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    />
  </div>
);