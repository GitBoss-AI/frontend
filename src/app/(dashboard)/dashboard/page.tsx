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
  getRepoMonthlyStats,
  getTeamTimeline,
  ContributorStats, getTopContributorStats,
  getTeamActivityTimeline, TimelineEntry
} from "@/utils/api";
import { Info } from "lucide-react";

const predefinedRepos = [
  { owner: "vercel", repo: "next.js", label: "vercel/next.js" },
  { owner: "facebook", repo: "react", label: "facebook/react" },
  { owner: "microsoft", repo: "vscode", label: "microsoft/vscode" },
  { owner: "cli", repo: "cli", label: "cli/cli"},
];

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

function getRangeParam(timeWindow: string): "week" | "month" | "quarter" {
  switch (timeWindow) {
    case "This Week":
      return "week";
    case "This Month":
      return "month";
    case "This Quarter":
      return "quarter";
    default:
      return "week"; // fallback
  }
}

export default function DashboardPage() {
  const [timeWindow, setTimeWindow] = useState("This Week");
  const [selectedRepo, setSelectedRepo] = useState(predefinedRepos[0]);
  const [repoStats, setRepoStats] = useState({
    commits: 0,
    commitsChange: "—",
    open_prs: 0,
    prsChange: "—",
    reviews: 0,
    reviewsChange: "—",
    issues: 0,
    issuesChange: "—",
  });
  const [topContributors, setTopContributors] = useState<ContributorStats[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);


  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingContributors, setIsLoadingContributors] = useState(false);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  const [sortKey, setSortKey] = useState<"commits" | "prs" | "reviews">("commits");

  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your GitBoss AI assistant. I can help you analyze your team's performance, track metrics, and provide insights about your development process. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const range = getRangeParam(timeWindow);

    // Repo stats
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const stats = await getRepoMonthlyStats(selectedRepo.owner, selectedRepo.repo, range);
        setRepoStats({
          commits: stats.commits.count,
          commitsChange: stats.commits.change,
          open_prs: stats.prs.count,
          prsChange: stats.prs.change,
          reviews: stats.reviews.count,
          reviewsChange: stats.reviews.change,
          issues: stats.issues.count,
          issuesChange: stats.issues.change,
        });
      } catch (err) {
        console.error("❌ Failed to load stats", err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    // Top contributors
    const fetchContributors = async () => {
      setIsLoadingContributors(true);
      try {
        const contributors = await getTopContributorStats(selectedRepo.owner, selectedRepo.repo, range);
        setTopContributors(contributors);
      } catch (err) {
        console.error("❌ Failed to load contributors", err);
      } finally {
        setIsLoadingContributors(false);
      }
    };

    // Team timeline
    const fetchTimeline = async () => {
      setIsLoadingTimeline(true);
      try {
        const timeline = await getTeamActivityTimeline(selectedRepo.owner, selectedRepo.repo, range);
        setTimelineData(timeline);
      } catch (err) {
        console.error("❌ Failed to load timeline", err);
      } finally {
        setIsLoadingTimeline(false);
      }
    };

    fetchStats();
    fetchContributors();
    fetchTimeline();
  }, [selectedRepo.owner, selectedRepo.repo, timeWindow]);



  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setChatHistory([...chatHistory, { role: "user", content: input }]);

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
                value={`${selectedRepo.owner}/${selectedRepo.repo}`}
                onChange={(e) => {
                  const [owner, repo] = e.target.value.split("/");
                  const match = predefinedRepos.find(r => r.owner === owner && r.repo === repo);
                  if (match) {
                    console.log("🔄 Changing selectedRepo to:", match);
                    setSelectedRepo(match);
                  }
                }}
            >
              {predefinedRepos.map((r) => (
                  <option key={r.label} value={`${r.owner}/${r.repo}`}>
                    {r.label}
                  </option>
              ))}
            </select>
            <select
                className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
            </select>
          </div>
        </div>

        <h2 className="text-lg text-gray-700 font-semibold">
          Stats for: <span className="font-mono">{selectedRepo.label}</span>
        </h2>
        {/* Stats Cards */}
        {isLoadingStats ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {label: "Total Commits", value: repoStats.commits, change: repoStats.commitsChange},
                {label: "Open PRs", value: repoStats.open_prs, change: repoStats.prsChange},
                {label: "Code Reviews", value: repoStats.reviews, change: repoStats.reviewsChange},
                {label: "Active Issues", value: repoStats.issues, change: repoStats.issuesChange},
              ].map((stat, index) => (
                  <div className="card" key={index}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-500 text-sm">{stat.label}</h3>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <span
                            className={`text-xs ${
                                stat.change.startsWith("-") ? "text-red-500" : "text-green-500"
                            }`}
                        >
                      {stat.change} from last period
                    </span>
                      </div>
                      <Info className="w-5 h-5 text-gray-400"/>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-medium mb-4">Team Activity Timeline</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={timelineData}
                    margin={{top: 5, right: 30, left: 0, bottom: 5}}
                >
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="label"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Area type="monotone" dataKey="commits" stroke="#4263eb" fill="#4263eb" fillOpacity={0.2}/>
                  <Area type="monotone" dataKey="prs" stroke="#37b24d" fill="#37b24d" fillOpacity={0.2}/>
                  <Area type="monotone" dataKey="reviews" stroke="#f59f00" fill="#f59f00" fillOpacity={0.2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Top Contributors</h3>
              <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as "commits" | "prs" | "reviews")}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="commits">Sort by Commits</option>
                <option value="prs">Sort by PRs</option>
                <option value="reviews">Sort by Reviews</option>
              </select>
            </div>

            {isLoadingContributors ? (
                <p className="text-sm text-gray-500">Loading contributor stats...</p>
            ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={[...topContributors].sort((a, b) => b[sortKey] - a[sortKey])}
                        margin={{top: 5, right: 30, left: 0, bottom: 5}}
                    >
                      <CartesianGrid strokeDasharray="3 3"/>
                      <XAxis
                          dataKey="username"
                          angle={-30}
                          textAnchor="end"
                          height={60}
                          tickFormatter={(name) =>
                              name.length > 10 ? name.slice(0, 10) + "…" : name
                          }
                      />
                      <YAxis/>
                      <Tooltip/>
                      <Legend/>
                      <Bar dataKey="commits" fill="#4263eb" name="Commits"/>
                      <Bar dataKey="prs" fill="#37b24d" name="PRs"/>
                      <Bar dataKey="reviews" fill="#f59f00" name="Reviews"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            )}
          </div>
        </div>

          {/* Assistant and Recent Activity */}
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
