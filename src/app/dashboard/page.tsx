"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { isAuthenticated } from "@/utils/auth";
import ChatInterface from "@/components/ChatInterface";
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MessageSquare,
  GitPullRequest,
  GitCommit,
  AlertCircle,
  Activity,
} from "lucide-react";

// Mock data for visualizations
const mockContributionData = [
  { name: "W1", commits: 45, prs: 12, reviews: 8 },
  { name: "W2", commits: 52, prs: 15, reviews: 10 },
  { name: "W3", commits: 38, prs: 8, reviews: 12 },
  { name: "W4", commits: 65, prs: 18, reviews: 15 },
];

const mockDeveloperData = [
  { name: "Alice", commits: 120, prs: 35, reviews: 28 },
  { name: "Bob", commits: 95, prs: 28, reviews: 42 },
  { name: "Charlie", commits: 150, prs: 45, reviews: 15 },
  { name: "Diana", commits: 85, prs: 22, reviews: 35 },
];

const Dashboard = () => {
  const { user, logout } = useUser();
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin");
    }
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  // const [selectedMetric, setSelectedMetric] = useState("commits");

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white py-2 shadow">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              GitBoss AI Dashboard - Development
            </h1>

            <div className="flex items-center gap-4">
              {/* Controls */}
              <div className="flex gap-2">
                <select
                    className="rounded-md border-gray-300 px-3 py-1 text-sm shadow-sm"
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
                <button className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700">
                  Generate Report
                </button>
              </div>

              {/* User actions */}
              <div className="flex items-center gap-2 border-l pl-4">
                <span className="text-sm text-gray-600">
                  {user?.username || 'User'}
                </span>
                <button
                    onClick={handleLogout}
                    className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full flex-1 overflow-hidden px-4 py-2">
        <div className="flex h-full flex-col gap-2">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <StatsCard
              title="Total Commits"
              value="348"
              icon={<GitCommit className="h-5 w-5" />}
              change="+12.5%"
            />
            <StatsCard
              title="Open PRs"
              value="24"
              icon={<GitPullRequest className="h-5 w-5" />}
              change="-3.2%"
            />
            <StatsCard
              title="Code Reviews"
              value="86"
              icon={<MessageSquare className="h-5 w-5" />}
              change="+8.1%"
            />
            <StatsCard
              title="Active Issues"
              value="32"
              icon={<AlertCircle className="h-5 w-5" />}
              change="+2.4%"
            />
          </div>

          {/* Charts and Activity Section */}
          <div className="grid min-h-0 flex-1 grid-cols-3 gap-4">
            {/* Team Activity Timeline */}
            <div className="col-span-1 flex flex-col rounded-lg bg-white p-3 shadow">
              <h2 className="mb-2 text-center text-sm font-semibold">
                Team Activity Timeline
              </h2>
              <div className="flex flex-1 items-center justify-center">
                <ResponsiveContainer width="95%" height={180}>
                  <LineChart
                    data={mockContributionData}
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ position: "relative", marginTop: "10px" }}
                    />
                    <Line type="monotone" dataKey="commits" stroke="#8884d8" />
                    <Line type="monotone" dataKey="prs" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="reviews" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Developer Comparison */}
            <div className="col-span-1 flex flex-col rounded-lg bg-white p-3 shadow">
              <h2 className="mb-2 text-center text-sm font-semibold">
                Developer Comparison
              </h2>
              <div className="flex flex-1 items-center justify-center">
                <ResponsiveContainer width="95%" height={180}>
                  <BarChart
                    data={mockDeveloperData}
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ position: "relative", marginTop: "10px" }}
                    />
                    <Bar dataKey="commits" fill="#8884d8" />
                    <Bar dataKey="prs" fill="#82ca9d" />
                    <Bar dataKey="reviews" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Chat Interface */}
            <div className="col-span-1 flex flex-col rounded-lg bg-white p-3 shadow">
              <h2 className="mb-2 text-sm font-semibold">
                GitBoss AI Assistant
              </h2>
              <ChatInterface className="flex-1 min-h-0" />
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="rounded-lg bg-white p-3 shadow">
            <h2 className="mb-2 text-sm font-semibold">Recent Activity</h2>
            <div className="grid grid-cols-3 gap-4">
              <ActivityItem
                type="commit"
                user="Alice"
                action="pushed 3 commits to"
                target="feature/user-auth"
                time="2h ago"
              />
              <ActivityItem
                type="pr"
                user="Bob"
                action="opened a pull request in"
                target="main"
                time="4h ago"
              />
              <ActivityItem
                type="review"
                user="Charlie"
                action="reviewed pull request"
                target="#123"
                time="5h ago"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
);
};

type StatsCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
};

// Component for statistics cards
const StatsCard = ({
  title, value, icon, change }: StatsCardProps) => (
  <div className="rounded-lg bg-white p-3 shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
    <div className="mt-1">
      <span
        className={`text-xs ${change.startsWith("+") ? "text-green-500" : "text-red-500"}`}
      >
        {change} from last period
      </span>
    </div>
  </div>
);

type ActivityItemProps = {
  type: "commit" | "pr" | "review" | string;
  user: string;
  action: string;
  target: string;
  time: string;
};

// Component for activity items
const ActivityItem = ({ type, user, action, target, time }: ActivityItemProps) => {
  const getIcon = () => {
    switch (type) {
      case "commit":
        return <GitCommit className="h-4 w-4" />;
      case "pr":
        return <GitPullRequest className="h-4 w-4" />;
      case "review":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-50">
      <div className="text-gray-400">{getIcon()}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs">
          <span className="font-medium text-indigo-600">{user}</span> {action}{" "}
          <span className="font-medium">{target}</span>
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
};

type ChatMessageProps = {
  isAI: boolean;
  message: string;
};

export default Dashboard;
