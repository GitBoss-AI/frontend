"use client";

import { useState, useEffect } from "react";
import {
  getRepoMonthlyStats,
  ContributorStats,
  getTopContributorStats,
  getTeamActivityTimeline,
  TimelineEntry,
  getRecentActivity,
  RecentActivityItem,
} from "@/utils/api";
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
import { Info } from "lucide-react";

const predefinedRepos = [
  { owner: "vercel", repo: "next.js", label: "vercel/next.js" },
  { owner: "facebook", repo: "react", label: "facebook/react" },
  { owner: "microsoft", repo: "vscode", label: "microsoft/vscode" },
  { owner: "cli", repo: "cli", label: "cli/cli" },
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
      return "week";
  }
}

const Spinner = ({ label }: { label: string }) => (
  <div className="py-12 text-center">
    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

export default function DashboardPage() {
  const [timeWindow, setTimeWindow] = useState("This Week");
  const [selectedRepo, setSelectedRepo] = useState(predefinedRepos[0]);
  const [repoStats, setRepoStats] = useState<any>(null);
  const [topContributors, setTopContributors] = useState<ContributorStats[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [sortKey, setSortKey] = useState<"commits" | "prs" | "reviews">("commits");

  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingContributors, setIsLoadingContributors] = useState(false);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [isLoadingRecentActivity, setIsLoadingRecentActivity] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  // Load from sessionStorage
  useEffect(() => {
    const cached = sessionStorage.getItem("dashboardData");
    if (cached) {
      const parsed = JSON.parse(cached);
      setRepoStats(parsed.stats);
      setTopContributors(parsed.contributors);
      setTimelineData(parsed.timeline);
      setRecentActivity(parsed.recent);
      setHasFetchedOnce(true);
    }
  }, []);

  const fetchDashboardData = async () => {
    const range = getRangeParam(timeWindow);
    setHasFetchedOnce(true);
    setIsLoadingStats(true);
    setIsLoadingContributors(true);
    setIsLoadingTimeline(true);
    setIsLoadingRecentActivity(true);

    try {
      const [stats, contributors, timeline, recent] = await Promise.all([
        getRepoMonthlyStats(selectedRepo.owner, selectedRepo.repo, range),
        getTopContributorStats(selectedRepo.owner, selectedRepo.repo, range),
        getTeamActivityTimeline(selectedRepo.owner, selectedRepo.repo, range),
        getRecentActivity(selectedRepo.owner, selectedRepo.repo),
      ]);

      const formattedStats = {
        commits: stats.commits.count,
        commitsChange: stats.commits.change,
        open_prs: stats.prs.count,
        prsChange: stats.prs.change,
        reviews: stats.reviews.count,
        reviewsChange: stats.reviews.change,
        issues: stats.issues.count,
        issuesChange: stats.issues.change,
      };

      setRepoStats(formattedStats);
      setTopContributors(contributors);
      setTimelineData(timeline);
      setRecentActivity(recent);

      sessionStorage.setItem(
        "dashboardData",
        JSON.stringify({
          stats: formattedStats,
          contributors,
          timeline,
          recent,
        })
      );
    } catch (err) {
      console.error("❌ Failed to load dashboard data", err);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingContributors(false);
      setIsLoadingTimeline(false);
      setIsLoadingRecentActivity(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">GitBoss AI Dashboard</h1>
        <div className="flex gap-2 items-center">
          <select
            value={`${selectedRepo.owner}/${selectedRepo.repo}`}
            onChange={(e) => {
              const [owner, repo] = e.target.value.split("/");
              const match = predefinedRepos.find((r) => r.owner === owner && r.repo === repo);
              if (match) setSelectedRepo(match);
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {predefinedRepos.map((r) => (
              <option key={r.label} value={`${r.owner}/${r.repo}`}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500"
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
          </select>

          <button
            onClick={fetchDashboardData}
            disabled={isLoadingStats || isLoadingContributors || isLoadingTimeline || isLoadingRecentActivity}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {hasFetchedOnce ? "Refresh" : "Fetch Data"}
          </button>
        </div>
      </div>

      <h2 className="text-lg text-gray-700 font-semibold mb-2">
        Stats for: <span className="font-mono">{selectedRepo.label}</span>
      </h2>

      {isLoadingStats ? (
        <Spinner label="Loading stats..." />
      ) : repoStats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Commits", value: repoStats.commits, change: repoStats.commitsChange },
            { label: "Open PRs", value: repoStats.open_prs, change: repoStats.prsChange },
            { label: "Code Reviews", value: repoStats.reviews, change: repoStats.reviewsChange },
            { label: "Active Issues", value: repoStats.issues, change: repoStats.issuesChange },
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
                <Info className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Click "Fetch Data" to load statistics.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-medium mb-4">Team Activity Timeline</h3>
          {isLoadingTimeline ? (
            <Spinner label="Loading timeline..." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="commits" stroke="#4263eb" fill="#4263eb" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="prs" stroke="#37b24d" fill="#37b24d" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="reviews" stroke="#f59f00" fill="#f59f00" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
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
            <Spinner label="Loading contributors..." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...topContributors].sort((a, b) => b[sortKey] - a[sortKey])}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="username"
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    tickFormatter={(name) => (name.length > 10 ? name.slice(0, 10) + "…" : name)}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="commits" fill="#4263eb" name="Commits" />
                  <Bar dataKey="prs" fill="#37b24d" name="PRs" />
                  <Bar dataKey="reviews" fill="#f59f00" name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-medium mb-4">Recent Activity</h3>
        {isLoadingRecentActivity ? (
          <Spinner label="Loading activity..." />
        ) : (
          <div className="flex space-x-3 overflow-x-auto scrollbar-thin pr-2">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-gray-100 p-2 rounded-lg w-48 shadow text-sm"
              >
                <div className="flex items-center mb-1 space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "commit"
                        ? "bg-blue-500"
                        : activity.type === "pr"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <span className="font-semibold">{activity.username}</span>
                </div>
                <p className="text-xs text-gray-700 truncate">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
