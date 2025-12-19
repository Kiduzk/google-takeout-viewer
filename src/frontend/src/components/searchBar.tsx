// Search bar component
import { Search } from "lucide-react";

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  darkMode: boolean;
};

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  darkMode,
}: SearchBarProps) => {
  const getPlaceholderForActiveTab = () => {
    switch (activeTab) {
      case "youtube-watch":
        return "Search through YouTube watch history...";
      case "youtube-search":
        return "Search through YouTube search history...";
      case "comments":
        return "Search through YouTube comments...";
      case "notes":
        return "Search through Google Keep notes...";
      default:
        return "Search...";
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className={darkMode ? "text-gray-400" : "text-gray-500"} />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-500"
            : "bg-white border-gray-200 text-gray-900 focus:ring-blue-400"
        } border`}
        placeholder={getPlaceholderForActiveTab()}
      />
    </div>
  );
};