import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts";
import { useState } from "react";

export const YoutubeWatchGraph = ({
  youtubeWatchDataGraph,
  darkMode,
}: {
  youtubeWatchDataGraph: { date: string; count: number }[];
  darkMode: boolean;
}) => {
  const [timeRange, setTimeRange] = useState("all");

  // Filter data based on selected time range
  const getFilteredData = () => {
    const now = new Date();

    return youtubeWatchDataGraph.filter((item) => {
      const itemDate = new Date(item.date);

      switch (timeRange) {
        case "7days":
          return (
            now.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000
          );
        case "1month":
          return (
            now.getTime() - itemDate.getTime() <= 30 * 24 * 60 * 60 * 1000
          );
        case "6months":
          return (
            now.getTime() - itemDate.getTime() <= 180 * 24 * 60 * 60 * 1000
          );
        case "1year":
          return (
            now.getTime() - itemDate.getTime() <= 365 * 24 * 60 * 60 * 1000
          );
        default:
          return true; // "all" case - show all data
      }
    });
  };

  const filteredData = getFilteredData();

  return (
    <div>
      <div className="flex justify-end mb-4">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className={`px-3 py-1 rounded-md text-sm ${
            darkMode
              ? "bg-gray-800 text-gray-200 border-gray-700"
              : "bg-white text-gray-800 border-gray-200"
          } border`}
        >
          <option value="all">All Time</option>
          <option value="1year">Last Year</option>
          <option value="6months">Last 6 Months</option>
          <option value="1month">Last Month</option>
          <option value="7days">Last 7 Days</option>
        </select>
      </div>

      <LineChart
        width={1200}
        height={300}
        data={filteredData}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
        <Line
          type="monotone"
          dataKey="count"
          stroke={darkMode ? "white" : "black"}
          strokeWidth={2}
          name="Videos Watched"
        />
        <XAxis dataKey="date" />
        <YAxis width={80} />
        <Legend align="right" />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? "#333" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        />
      </LineChart>

      {filteredData.length === 0 && (
        <div
          className={`text-center py-10 ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          No data available for the selected time range
        </div>
      )}
    </div>
  );
};
