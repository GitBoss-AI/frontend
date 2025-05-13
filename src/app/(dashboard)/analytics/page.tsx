// File: builds/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Info } from "lucide-react";
import {
  BuildInfo,
  getRecentBuilds,
} from "@/utils/api";
import { getRepoList } from "@/utils/session";

function getRangeParam(timeWindow: string): "week" | "month" | "quarter" {
  switch (timeWindow) {
    case "This Week": return "week";
    case "This Month": return "month";
    case "This Quarter": return "quarter";
    default: return "week";
  }
}

const Spinner = ({ label }: { label: string }) => (
  <div className="py-12 text-center">
    <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-2" />
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

export default function AnalyticsPage() {
  const [repos, setRepos] = useState<{ owner: string; repo: string; label: string }[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; repo: string; label: string } | null>(null);
  const [timeWindow, setTimeWindow] = useState("This Week");
  const [builds, setBuilds] = useState<BuildInfo[]>([]);
  const [isLoadingBuilds, setIsLoadingBuilds] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  useEffect(() => {
    const loadedRepos = getRepoList();
    setRepos(loadedRepos);
    const saved = sessionStorage.getItem("selectedRepo");
    if (saved) {
      const parsed = JSON.parse(saved);
      const match = loadedRepos.find(r => r.owner === parsed.owner && r.repo === parsed.repo);
      setSelectedRepo(match || loadedRepos[0] || null);
    } else {
      setSelectedRepo(loadedRepos[0] || null);
    }
  }, []);

  useEffect(() => {
    const cachedWindow = sessionStorage.getItem("analyticsTimeWindow");
    if (cachedWindow) setTimeWindow(cachedWindow);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("analyticsTimeWindow", timeWindow);
  }, [timeWindow]);

  const fetchBuilds = async () => {
    if (!selectedRepo) return;
    setIsLoadingBuilds(true);
    setBuilds([]);
    try {
      const range = getRangeParam(timeWindow);
      const result = await getRecentBuilds(selectedRepo.owner, selectedRepo.repo, range);
      setBuilds(result);
      sessionStorage.setItem("recentBuilds", JSON.stringify(result));
    } catch (err) {
      console.error("Failed to fetch builds", err);
    } finally {
      setIsLoadingBuilds(false);
    }
  };

  useEffect(() => {
    const cached = sessionStorage.getItem("recentBuilds");
    if (cached) setBuilds(JSON.parse(cached));
  }, []);

  const fetchAll = () => {
    sessionStorage.removeItem("recentBuilds");
    setHasFetchedOnce(true);
    fetchBuilds();
  };

  const dailyMetrics = useMemo(() => {
    const map = new Map<string, { success: number; total: number; durationTotal: number }>();
    builds.forEach((b) => {
      const day = new Date(b.started_at).toISOString().slice(0, 10);
      const entry = map.get(day) || { success: 0, total: 0, durationTotal: 0 };
      entry.total++;
      entry.durationTotal += b.duration_seconds;
      if (b.status === "success") entry.success++;
      map.set(day, entry);
    });
    return Array.from(map.entries()).map(([day, { success, total, durationTotal }]) => ({
      day,
      successRate: Math.round((success / total) * 100),
      avgDuration: Math.round(durationTotal / total),
    }));
  }, [builds]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Build & Deployment Insights</h1>
        <div className="flex gap-2 items-center">
          {selectedRepo && (
            <>
              <select
                value={`${selectedRepo.owner}/${selectedRepo.repo}`}
                onChange={(e) => {
                  const [owner, repo] = e.target.value.split("/");
                  const match = repos.find((r) => r.owner === owner && r.repo === repo);
                  if (match) {
                    setSelectedRepo(match);
                    sessionStorage.setItem("selectedRepo", JSON.stringify(match));
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800"
              >
                {repos.map((r) => (
                  <option key={r.label} value={`${r.owner}/${r.repo}`}>{r.label}</option>
                ))}
              </select>

              <select
                className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-800"
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>This Quarter</option>
              </select>

              <button
                onClick={fetchAll}
                disabled={isLoadingBuilds}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasFetchedOnce ? "Refresh" : "Fetch Data"}
              </button>
            </>
          )}
        </div>
      </div>

      {selectedRepo && builds.length > 0 && !isLoadingBuilds && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm">Build Success Rate</h3>
                  <p className="text-2xl font-bold">{dailyMetrics.length ? `${dailyMetrics.at(-1)!.successRate}%` : "N/A"}</p>
                  <span className="text-green-500 text-xs">Calculated from {builds.length} builds</span>
                </div>
                <Info className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm">Deployment Frequency</h3>
                  <p className="text-2xl font-bold">~{(builds.length / dailyMetrics.length).toFixed(1)}/day</p>
                  <span className="text-gray-500 text-xs">{builds.length} total deployments</span>
                </div>
                <Info className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </>
      )}

      {isLoadingBuilds && <Spinner label="Loading deployments..." />}

      <div className="card">
        <h3 className="font-medium mb-4">Daily Success Rate</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="successRate" stroke="#3b82f6" name="Success %" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="font-medium mb-4">Average Build Duration (per day)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgDuration" stroke="#ec4899" name="Avg Duration (s)" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-lg mt-6">Recent Deployments</h3>
        {builds.map((build) => (
          <a
            key={build.id}
            href={build.build_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-4 rounded-md transition shadow-md ${
              build.status === "success"
                ? "bg-green-100 hover:bg-green-200 border border-green-300"
                : build.status === "failure"
                ? "bg-red-100 hover:bg-red-200 border border-red-300"
                : "bg-gray-100 hover:bg-gray-200 border border-gray-300"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold">Build #{build.id}</p>
                <p className="text-xs text-gray-600">{new Date(build.started_at).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Triggered by: {build.triggered_by}</p>
              </div>
              <div className="text-sm font-mono">{build.duration_seconds}s</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
