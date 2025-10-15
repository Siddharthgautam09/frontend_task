import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Example data structure for analytics over time
// You can replace this with real analytics data from props
const sampleData = [
  { name: "Jan", Projects: 12, Tasks: 30 },
  { name: "Feb", Projects: 18, Tasks: 45 },
  { name: "Mar", Projects: 22, Tasks: 50 },
  { name: "Apr", Projects: 15, Tasks: 38 },
  { name: "May", Projects: 25, Tasks: 60 },
  { name: "Jun", Projects: 20, Tasks: 55 },
];

interface DashboardLineChartProps {
  data?: Array<{ name: string; Projects: number; Tasks: number }>;
}

const DashboardLineChart: React.FC<DashboardLineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data || sampleData}
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Projects" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="Tasks" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DashboardLineChart;
