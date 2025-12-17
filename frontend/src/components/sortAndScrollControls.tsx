import { ArrowDown } from "lucide-react";

export const SortAndScrollControls = ({
  sortBy,
  darkMode,
  onSortChange,
}: {
  sortBy: string;
  darkMode: boolean;
  onSortChange: (sortValue: string) => void;
}) => (
  <div className="flex justify-between mb-4 items-center">
    {/* Sort dropdown */}
    <div>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
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
);
