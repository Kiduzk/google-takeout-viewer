import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useState, useEffect } from "react";

export const YoutubeWatchGraph = ({
  youtubeWatchDataGraph,
  darkMode,
}: {
  youtubeWatchDataGraph: { date: string; count: number }[];
  darkMode: boolean;
}) => {
  // Find min and max dates from data
  const getDateBounds = () => {
    if (youtubeWatchDataGraph.length === 0)
      return { minDate: new Date(), maxDate: new Date() };

    let dates = youtubeWatchDataGraph.map((item) => new Date(item.date));
    return {
      minDate: new Date(Math.min(...dates.map((d) => d.getTime()))),
      maxDate: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };
  };

  const { minDate, maxDate } = getDateBounds();

  // Format dates for input fields
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(formatDateForInput(minDate));
  const [endDate, setEndDate] = useState(formatDateForInput(maxDate));

  // Update date range if data changes
  useEffect(() => {
    if (youtubeWatchDataGraph.length > 0) {
      const { minDate, maxDate } = getDateBounds();
      setStartDate(formatDateForInput(minDate));
      setEndDate(formatDateForInput(maxDate));
    }
  }, [youtubeWatchDataGraph]);

  // Filter data based on selected date range
  const getFilteredData = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Add one day to end date to include the end date in the results
    end.setDate(end.getDate() + 1);

    return youtubeWatchDataGraph.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });
  };

  const filteredData = getFilteredData();

  // Calculate some statistics
  const totalVideos = filteredData.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const avgVideosPerDay = totalVideos / (filteredData.length || 1);

  // Quick filter presets
  const applyQuickFilter = (filter: string) => {
    const now = new Date();
    let start = new Date();

    switch (filter) {
      case "7days":
        start.setDate(now.getDate() - 7);
        break;
      case "1month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "6months":
        start.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        start.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        start = new Date(minDate);
        now.setTime(maxDate.getTime());
        break;
    }

    setStartDate(formatDateForInput(start));
    setEndDate(formatDateForInput(now));
  };

  return (
    <div
      className={`p-4 rounded-lg w-full ${
        darkMode ? "bg-gray-850 bg-opacity-30" : "bg-gray-50"
      }`}
    >
      <div className="mb-4">
        {/* Single row with date inputs and filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="startDate"
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              From:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={formatDateForInput(minDate)}
              max={endDate}
              className={`text-sm p-1 rounded border ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-300 text-gray-800"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="endDate"
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              To:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={formatDateForInput(maxDate)}
              className={`text-sm p-1 rounded border ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-300 text-gray-800"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Quick:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => applyQuickFilter("7days")}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                7d
              </button>
              <button
                onClick={() => applyQuickFilter("1month")}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                1m
              </button>
              <button
                onClick={() => applyQuickFilter("6months")}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                6m
              </button>
              <button
                onClick={() => applyQuickFilter("1year")}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                1y
              </button>
              <button
                onClick={() => applyQuickFilter("all")}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
            </div>
          </div>

          <div
            className={`text-xs ml-auto ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <span className="mr-4">Total: {totalVideos} videos</span>
            <span>Avg: {avgVideosPerDay.toFixed(1)} per day</span>
          </div>
        </div>
      </div>

      <div className="w-full h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid
              stroke={darkMode ? "#444" : "#ccc"}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={darkMode ? "#60a5fa" : "#3b82f6"}
              strokeWidth={2}
              name="Videos Watched"
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: darkMode ? "#bbb" : "#333" }}
              tickMargin={10}
              height={50}
              angle={-30}
              textAnchor="end"
            />
            <YAxis 
              width={45} 
              tick={{ fill: darkMode ? "#bbb" : "#333" }}
              tickFormatter={(value) => Math.round(value)}
            />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? "#333" : "#fff",
                color: darkMode ? "#fff" : "#000",
                border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {filteredData.length === 0 && (
        <div
          className={`text-center py-10 ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          No data available for the selected date range
        </div>
      )}
    </div>
  );
};
