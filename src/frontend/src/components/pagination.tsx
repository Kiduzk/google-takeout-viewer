import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({
  currentPage,
  totalPages,
  darkMode,
  onPreviousClick,
  onNextClick,
}: {
  currentPage: number;
  totalPages: number;
  darkMode: boolean;
  onPreviousClick: () => void;
  onNextClick: () => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-6 gap-2">
      <button
        onClick={onPreviousClick}
        disabled={currentPage === 1}
        className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
          currentPage === 1
            ? `opacity-50 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`
            : darkMode
              ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <ChevronLeft size={16} />
        <span className="ml-1">Previous</span>
      </button>

      <div className={`px-4 py-2 font-medium ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
        Page {currentPage} of {totalPages}
      </div>

      <button
        onClick={onNextClick}
        disabled={currentPage === totalPages}
        className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
          currentPage === totalPages
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
  );
};
