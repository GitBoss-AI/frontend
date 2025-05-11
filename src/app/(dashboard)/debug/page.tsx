"use client";
import { useState } from "react";
import {
  addRepository,
  getAllRepositories,
  getRepositoryStats,
  getContributorStats,
  getTopPerformers,
  getRecentActivity,
  getTeamTimeline,
} from "@/utils/api"; // Adjust the import path as needed

export default function ApiTestPage() {
  // State for input parameters
  const [userId, setUserId] = useState<number>(1);
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [repoId, setRepoId] = useState<number>(1);
  const [timeWindow, setTimeWindow] = useState<string>("7d");
  const [githubUsername, setGithubUsername] = useState<string>("");
  const [groupBy, setGroupBy] = useState<"week" | "month" | "quarter">("week");

  // State for API responses
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle API calls
  const callApi = async (
    apiFunction: () => Promise<any>,
    functionName: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction();
      setResponse({ functionName, data: result });
      console.log(`${functionName} response:`, result);
    } catch (err: any) {
      setError(`Error in ${functionName}: ${err.message}`);
      console.error(`Error in ${functionName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">GitBoss API Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Input forms */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Common Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <input
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Repository URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  placeholder="https://github.com/username/repo"
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Repository ID
                </label>
                <input
                  type="number"
                  value={repoId}
                  onChange={(e) => setRepoId(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time Window
                </label>
                <input
                  type="text"
                  value={timeWindow}
                  placeholder="7d, 30d, 90d, etc."
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Group By
                </label>
                <select
                  value={groupBy}
                  onChange={(e) =>
                    setGroupBy(e.target.value as "week" | "month" | "quarter")
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="quarter">Quarter</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Repository Endpoints</h2>
            <div className="space-y-4">
              <button
                onClick={() =>
                  callApi(() => addRepository(userId, repoUrl), "addRepository")
                }
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Repository
              </button>

              <button
                onClick={() =>
                  callApi(
                    () => getAllRepositories(userId),
                    "getAllRepositories",
                  )
                }
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Get All Repositories
              </button>

              <button
                onClick={() =>
                  callApi(
                    () => getRepositoryStats(repoUrl, timeWindow),
                    "getRepositoryStats",
                  )
                }
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Get Repository Stats
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Contributor Endpoints
            </h2>
            <div className="space-y-4">
              <button
                onClick={() =>
                  callApi(
                    () =>
                      getContributorStats(
                        githubUsername,
                        repoId,
                        userId,
                        timeWindow,
                      ),
                    "getContributorStats",
                  )
                }
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Get Contributor Stats
              </button>

              <button
                onClick={() =>
                  callApi(
                    () => getTopPerformers(repoId, timeWindow),
                    "getTopPerformers",
                  )
                }
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Get Top Performers
              </button>

              <button
                onClick={() =>
                  callApi(() => getRecentActivity(repoId), "getRecentActivity")
                }
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Get Recent Activity
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Team Endpoints</h2>
            <div className="space-y-4">
              <button
                onClick={() =>
                  callApi(
                    () => getTeamTimeline(repoId, groupBy),
                    "getTeamTimeline",
                  )
                }
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Get Team Timeline
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Results */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>

            {loading && (
              <div className="text-center py-4">
                <p className="text-gray-600">Loading...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-4">
                <p>{error}</p>
              </div>
            )}

            {response && !loading && !error && (
              <div>
                <div className="mb-2 pb-2 border-b">
                  <span className="font-semibold">Function: </span>
                  <span className="text-blue-600">{response.functionName}</span>
                </div>
                <div className="overflow-auto max-h-[500px]">
                  <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
