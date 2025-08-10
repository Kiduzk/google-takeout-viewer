// Filters component
import { X } from "lucide-react"

interface FilterValues {
    dateRange: string;
    sortBy: string;
    channels: string[],
    labels: string[],
    contentType: string,
}

interface FilterPanelProps {
  filterOpen: boolean;
  filters: FilterValues;
  setFilterOpen: (open: boolean) => void;
  setFilters: (filterValues: any) => void;
  activeTab: string
}

export const FilterPanel = ({
  filterOpen,
  setFilterOpen,
  filters, 
  setFilters, 
  activeTab
}: FilterPanelProps) => (
  <div
    className={`fixed inset-0 backdrop-blur-sm bg-black/20 z-50 transition-all duration-300 ${
      filterOpen ? "opacity-100 visible" : "opacity-0 invisible"
    }`}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setFilterOpen(false);
      }
    }}
  >
    <div
      className={`fixed right-0 top-0 h-full w-96 shadow-xl transform transition-transform duration-300 ${
        filterOpen ? "translate-x-0" : "translate-x-full"
      } bg-gray-900`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-100">Filters</h3>
          <button
            onClick={() => setFilterOpen(false)}
            className="p-2 rounded-lg transition-colors hover:bg-gray-800 text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">
              Date Range
            </label>
            <div className="space-y-2">
              {["all", "today", "week", "month", "year"].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="dateRange"
                    value={option}
                    checked={filters.dateRange === option}
                    onChange={(e) =>
                      setFilters({ ...filters, dateRange: e.target.value })
                    }
                    className="mr-3 text-blue-600"
                  />
                  <span className="capitalize text-gray-300">
                    {option === "all" ? "All Time" : `Last ${option}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-700 text-gray-100"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
              {activeTab === "youtube" && (
                <option value="duration">By Duration</option>
              )}
            </select>
          </div>

          {/* Content Type Filter (Keep Notes) */}
          {activeTab === "notes" && (
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Content Type
              </label>
              <div className="space-y-2">
                {["all", "pinned", "todos", "regular"].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="contentType"
                      value={type}
                      checked={filters.contentType === type}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          contentType: e.target.value,
                        })
                      }
                      className="mr-3 text-blue-600"
                    />
                    <span className="capitalize text-gray-300">
                      {type === "all"
                        ? "All Notes"
                        : type === "todos"
                          ? "To-Do Lists"
                          : type}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter Actions */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() =>
              setFilters({
                dateRange: "all",
                sortBy: "newest",
                channels: [],
                labels: [],
                contentType: "all",
              })
            }
            className="flex-1 py-3 px-4 rounded-lg border transition-colors border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Clear All
          </button>
          <button
            onClick={() => setFilterOpen(false)}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </div>
);
