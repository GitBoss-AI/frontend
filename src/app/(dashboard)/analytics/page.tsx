"use client";

import {useEffect, useMemo, useState} from "react";
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
import {BuildInfo, getQualityMetrics, getRecentBuilds, QualityMetricsResponse} from "@/utils/api";
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
    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

// Mock data for latest 10 builds
const recentBuilds = [
  { build: "#2401", success: true, duration: 240, timestamp: "2025-05-13 16:01" },
  { build: "#2400", success: true, duration: 210, timestamp: "2025-05-13 15:00" },
  { build: "#2399", success: false, duration: 180, timestamp: "2025-05-13 13:45" },
  { build: "#2398", success: true, duration: 220, timestamp: "2025-05-13 12:30" },
  { build: "#2397", success: true, duration: 200, timestamp: "2025-05-13 11:00" },
  { build: "#2396", success: false, duration: 195, timestamp: "2025-05-13 09:30" },
  { build: "#2395", success: true, duration: 205, timestamp: "2025-05-13 08:15" },
  { build: "#2394", success: true, duration: 230, timestamp: "2025-05-13 07:00" },
  { build: "#2393", success: true, duration: 250, timestamp: "2025-05-13 05:45" },
  { build: "#2392", success: true, duration: 240, timestamp: "2025-05-13 04:30" },
];

export default function AnalyticsPage() {
  const [repos, setRepos] = useState<{ owner: string; repo: string; label: string; }[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; repo: string; label: string } | null>(null);
  const [timeWindow, setTimeWindow] = useState("This Week");
  const [metrics, setMetrics] = useState<QualityMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [builds, setBuilds] = useState<BuildInfo[]>([]);

  const successRateData = useMemo(() => {
  const weeks: Record<string, { total: number; success: number }> = {};
    builds.forEach((b) => {
      const week = new Date(b.started_at).toISOString().slice(0, 10).slice(0, 7) + "-W" +
        new Date(b.started_at).getWeek();
      if (!weeks[week]) weeks[week] = { total: 0, success: 0 };
      weeks[week].total += 1;
      if (b.status === "success") weeks[week].success += 1;
    });
    return Object.entries(weeks).map(([week, data]) => ({
      week,
      successRate: Math.round((data.success / data.total) * 100),
    }));
  }, [builds]);

  // Helper for week number
  Date.prototype.getWeek = function () {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  };

  const avgDurationPerDay = useMemo(() => {
    const days: Record<string, number[]> = {};
    builds.forEach((b) => {
      const date = new Date(b.started_at).toISOString().slice(0, 10);
      if (!days[date]) days[date] = [];
      days[date].push(b.duration_seconds);
    });
    return Object.entries(days).map(([day, durations]) => ({
      day,
      avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    }));
  }, [builds]);

  useEffect(() => {
    const loadedRepos = getRepoList();
    setRepos(loadedRepos);

    const saved = sessionStorage.getItem("selectedRepo");
    if (saved) {
      const parsed = JSON.parse(saved);
      const match = loadedRepos.find(r => r.owner === parsed.owner && r.repo === parsed.repo);
      if (match) setSelectedRepo(match);
      else if (loadedRepos.length > 0) setSelectedRepo(loadedRepos[0]);
    } else if (loadedRepos.length > 0) {
      setSelectedRepo(loadedRepos[0]);
    }
  }, []);

  useEffect(() => {
    const cachedWindow = sessionStorage.getItem("analyticsTimeWindow");
    if (cachedWindow) setTimeWindow(cachedWindow);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("analyticsTimeWindow", timeWindow);
  }, [timeWindow]);

  useEffect(() => {
    const cached = sessionStorage.getItem("qualityMetrics");
    if (cached) {
      setMetrics(JSON.parse(cached));
      setHasFetchedOnce(true);
    }
  }, []);

  const fetchMetrics = async () => {
    if (!selectedRepo) return;
    setIsLoading(true);
    try {
      const range = getRangeParam(timeWindow);
      const result = await getQualityMetrics(selectedRepo.owner, selectedRepo.repo, range);
      setMetrics(result);
      sessionStorage.setItem("qualityMetrics", JSON.stringify(result));

      const recent = await getRecentBuilds(selectedRepo.owner, selectedRepo.repo, 20);
      setBuilds(recent);
      sessionStorage.setItem("recentBuilds", JSON.stringify(recent));

      setHasFetchedOnce(true);
    } catch (err) {
      console.error("Failed to fetch metrics or builds", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cached = sessionStorage.getItem("recentBuilds");
    if (cached) setBuilds(JSON.parse(cached));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quality Metrics</h1>
        <div className="flex gap-2 items-center">
          {selectedRepo && (
            <>
              <select
                value={`${selectedRepo.owner}/${selectedRepo.repo}`}
                onChange={(e) => {
                  const [owner, repo] = e.target.value.split("/");
                  const match = repos.find(r => r.owner === owner && r.repo === repo);
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
                onClick={fetchMetrics}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasFetchedOnce ? "Refresh" : "Fetch Data"}
              </button>
            </>
          )}
        </div>
      </div>

      {selectedRepo && metrics && !isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm">Build Success Rate</h3>
                    <p className="text-2xl font-bold">{metrics.build_success_rate}%</p>
                    <span className="text-green-500 text-xs">{metrics.build_success_note}</span>
                  </div>
                  <Info className="w-5 h-5 text-gray-400"/>
                </div>
              </div>

              <div className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm">Deployment Frequency</h3>
                    <p className="text-2xl font-bold">{metrics.deployment_frequency}/day</p>
                    <span className="text-gray-500 text-xs">{metrics.deployment_count} total deployments</span>
                  </div>
                  <Info className="w-5 h-5 text-gray-400"/>
                </div>
              </div>
            </div>

            {/* Build History Chart */}
            <div className="card">
              <h3 className="font-medium mb-4">Weekly Success Rate</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={successRateData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="week"/>
                  <YAxis domain={[0, 100]}/>
                  <Tooltip/>
                  <Legend/>
                  <Line type="monotone" dataKey="successRate" stroke="#38bdf8" name="Success %"/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-medium mb-4">Average Build Duration (per day)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={avgDurationPerDay}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="day"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Line type="monotone" dataKey="avgDuration" stroke="#6366f1" name="Avg Duration (s)"/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Deployment List */}
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
                              ? "bg-green-50 hover:bg-green-100 border border-green-200"
                              : build.status === "failure"
                                  ? "bg-red-50 hover:bg-red-100 border border-red-200"
                                  : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold">Build #{build.id}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(build.started_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-sm font-mono">{build.duration_seconds}s</div>
                    </div>
                  </a>
              ))}
            </div>
          </>
      )}

      {isLoading && <Spinner label="Loading quality metrics..."/>}

      {!hasFetchedOnce && !isLoading && (
          <p className="text-sm text-gray-500">Click "Fetch Data" to load quality metrics for the selected
            repository.</p>
      )}
    </div>
  );
}
