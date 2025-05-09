"use client";
import React, { useState } from "react";
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
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  // const [selectedMetric, setSelectedMetric] = useState("commits");

  return (
    <div className="flex h-screen flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-white py-2 shadow">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              GitBoss AI Dashboard
            </h1>
            <div className="flex gap-4">
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
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="mb-2 flex-1 space-y-2 overflow-y-auto pr-2">
                  <ChatMessage isAI={false} message="Who worked on PR#5?" />
                  <ChatMessage
                    isAI={true}
                    message="PR#5 was worked on by @Ali, @Josh, and @Denise. Would you like to know who reviewed this PR?"
                  />
                  <ChatMessage isAI={false} message="Yes, please." />
                  <ChatMessage
                    isAI={true}
                    message="PR#5 was reviewed by @Ali and @Denise. Both provided feedback on the code quality and suggested improvements to the error handling."
                  />
                  <ChatMessage
                    isAI={false}
                    message="Thanks, can you summarize @Josh's contributions this week?"
                  />
                  <ChatMessage
                    isAI={true}
                    message="Here's a summary of @Josh's contributions this week:

3 Pull Requests opened, 2 merged, and 1 under review.
12 Commits across 2 repositories.
Reviewed 2 PRs, leaving detailed feedback on 3.
Resolved 2 issues related to bug fixes in the authentication module."
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about team performance..."
                    className="flex-1 rounded-md border-gray-300 px-2 py-1 text-sm shadow-sm"
                  />
                  <button className="rounded-md bg-indigo-600 px-2 py-1 text-sm text-white hover:bg-indigo-700">
                    Send
                  </button>
                </div>
              </div>
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
const StatsCard = ({ title, value, icon, change }: StatsCardProps) => (
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

// Component for chat messages
const ChatMessage = ({ isAI, message }: ChatMessageProps) => (
  <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
    <div
      className={`max-w-3/4 rounded-lg p-2 ${isAI ? "bg-gray-100" : "bg-indigo-600 text-white"
        }`}
    >
      <p className="text-xs">{message}</p>
    </div>
  </div>
);

export default Dashboard;
