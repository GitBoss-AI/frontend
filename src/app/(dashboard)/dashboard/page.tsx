"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getRepositoryStats,
  getTeamTimeline,
  getRecentActivity,
} from "@/utils/api";
import { Info } from "lucide-react";

// Mock data for initial rendering
const mockTimelineData = [
  { label: "W1", commits: 40, prs: 12, reviews: 24 },
  { label: "W2", commits: 35, prs: 15, reviews: 20 },
  { label: "W3", commits: 50, prs: 13, reviews: 22 },
  { label: "W4", commits: 55, prs: 18, reviews: 30 },
];

const mockDeveloperData = [
  { name: "Alice", commits: 42, prs: 12, reviews: 28 },
  { name: "Bob", commits: 38, prs: 15, reviews: 20 },
  { name: "Charlie", commits: 30, prs: 10, reviews: 35 },
  { name: "Diana", commits: 25, prs: 8, reviews: 15 },
];

const mockRecentActivity = [
  {
    type: "commit",
    username: "Alice",
    message: "Alice pushed 3 commits to feature/user-auth",
    timestamp: "2h ago",
  },
  {
    type: "pr",
    username: "Bob",
    message: "Bob opened a pull request in main",
    timestamp: "4h ago",
  },
  {
    type: "review",
    username: "Charlie",
    message: "Charlie reviewed pull request #123",
    timestamp: "5h ago",
  },
];

export default function DashboardPage() {
  const [timeWindow, setTimeWindow] = useState("This Month");
  const [repoStats, setRepoStats] = useState({
    commits: 348,
    open_prs: 24,
    reviews: 86,
    issues: 32,
  });
  const [timelineData, setTimelineData] = useState(mockTimelineData);
  const [developerData, setDeveloperData] = useState(mockDeveloperData);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your GitBoss AI assistant. I can help you analyze your team's performance, track metrics, and provide insights about your development process. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // In a real app, we would fetch this data from the API
    // For now, using mock data
    // Example API calls:
    // const fetchData = async () => {
    //   try {
    //     const stats = await getRepositoryStats("github.com/facebook/react");
    //     setRepoStats(stats.stats);
    //
    //     const timeline = await getTeamTimeline(1, "week");
    //     setTimelineData(timeline);
    //
    //     const activity = await getRecentActivity(1);
    //     setRecentActivity(activity.recent_activity);
    //   } catch (error) {
    //     console.error("Error fetching dashboard data:", error);
    //   }
    // };
    //
    // fetchData();
  }, [timeWindow]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    setChatHistory([...chatHistory, { role: "user", content: input }]);

    // In a real app, we would send this to an API and get a response
    // For demo, just add a hardcoded response
    setTimeout(() => {
      let response;

      if (
        input.toLowerCase().includes("brian") &&
        input.toLowerCase().includes("contribution")
      ) {
        response =
          "Here's a summary of Brian's contributions this week: 7 Pull Requests opened, 2 merged, and 1 major review. 12 commits across 7 repositories. Reviewed 2 PRs, leaving detailed feedback on the authentication module.";
      } else if (input.toLowerCase().includes("who")) {
        response =
          "PR#5 was worked on by Bob Walsh and @Dannie Arnold. Would you like to know who reviewed this PR?";
      } else {
        response =
          "I understand your query. Let me analyze the data and provide you with relevant insights...";
      }

      setChatHistory([
        ...chatHistory,
        { role: "user", content: input },
        { role: "assistant", content: response },
      ]);
      setInput("");
    }, 500);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">GitBoss AI Dashboard</h1>
        <div className="flex space-x-2 items-center">
          <select
            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
          <button className="btn btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Total Commits</h3>
              <p className="text-2xl font-bold">{repoStats.commits}</p>
              <span className="text-green-500 text-xs">
                +12.5% from last period
              </span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Open PRs</h3>
              <p className="text-2xl font-bold">{repoStats.open_prs}</p>
              <span className="text-red-500 text-xs">
                -3.2% from last period
              </span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Code Reviews</h3>
              <p className="text-2xl font-bold">{repoStats.reviews}</p>
              <span className="text-green-500 text-xs">
                +8.1% from last period
              </span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Active Issues</h3>
              <p className="text-2xl font-bold">{repoStats.issues}</p>
              <span className="text-green-500 text-xs">
                +2.6% from last period
              </span>
            </div>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-medium mb-4">Team Activity Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="#4263eb"
                  fill="#4263eb"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="prs"
                  stroke="#37b24d"
                  fill="#37b24d"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="reviews"
                  stroke="#f59f00"
                  fill="#f59f00"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-medium mb-4">Developer Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={developerData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="commits" fill="#4263eb" />
                <Bar dataKey="prs" fill="#37b24d" />
                <Bar dataKey="reviews" fill="#f59f00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Assistant & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <h3 className="font-medium mb-4">GitBoss AI Assistant</h3>

          <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${message.role === "assistant"
                    ? "bg-blue-50 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                  }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask about team performance..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input flex-1"
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="font-medium mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 text-sm">
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full ${activity.type === "commit"
                      ? "bg-blue-500"
                      : activity.type === "pr"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                />
                <div>
                  <p>{activity.message}</p>
                  <p className="text-gray-500 text-xs">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
