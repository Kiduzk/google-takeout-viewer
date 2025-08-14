import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts";

export const YoutubeWatchGraph = ({
  youtubeWatchDataGraph,
  darkMode,
}: {
  youtubeWatchDataGraph: { date: string; count: number }[];
  darkMode: boolean;
}) => (
  <LineChart
    width={600}
    height={300}
    data={youtubeWatchDataGraph.slice(1, 10)}
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
    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000' }} />
  </LineChart>
);
