import { ArrowUp } from "lucide-react";

export const ScrollToTop = ({ darkMode }: { darkMode: boolean }) => (
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
);
