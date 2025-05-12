"use client";
import { useState, useEffect } from "react";
import {
  addRepository,
  getAllRepositories,
  getRepositoryStats,
  getContributorStats,
  getTopPerformers,
  getRecentActivity,
  getTeamTimeline,
} from "@/utils/api"; // Adjust the import path as needed
import { useUser } from "@/contexts/UserContext";

export default function ApiTestPage() {
  // State for input parameters
  const [userId, setUserId] = useState<number>(1);
  const { user, loading } = useUser(); // Properly destructure values from useUser hook
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [repoId, setRepoId] = useState<number>(1);
  const [timeWindow, setTimeWindow] = useState<string>("7d");
  const [githubUsername, setGithubUsername] = useState<string>("");
  const [groupBy, setGroupBy] = useState<"week" | "month" | "quarter">("week");

  // State for API responses
  const [response, setResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<any>(null);

  // Update userId when user context changes
  useEffect(() => {
    if (user && user.id) {
      setUserId(Number(user.id));
    }
  }, [user]);

  // Function to handle API calls
  const callApi = async (
    apiFunction: () => Promise<any>,
    functionName: string,
    params: any,
  ) => {
    setApiLoading(true);
    setError(null);

    // Store request details
    setRequestDetails({
      function: functionName,
      parameters: params,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await apiFunction();
      setResponse({ functionName, data: result });
      console.log(`${functionName} response:`, result);
    } catch (err: any) {
      setError(`Error in function: ${functionName}: \n ${err.message}`);
      console.error(`Error in function: ${functionName}:`, err);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">GitBoss API Test Page</h1>

      {/* User Information Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        {loading ? (
          <p className="text-gray-600">Loading user information...</p>
        ) : user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">User ID</p>
              <p className="text-lg">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Username</p>
              <p className="text-lg">{user.username}</p>
            </div>
            {/* Display additional user properties if available */}
            {Object.entries(user).map(([key, value]) => {
              // Skip id and username as they're already displayed
              if (key !== "id" && key !== "username") {
                return (
                  <div key={key}>
                    <p className="text-sm font-medium text-gray-500">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </p>
                    <p className="text-lg">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <p className="text-yellow-600">
            Not logged in. Some functionality may be limited.
          </p>
        )}
      </div>

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
                {user && (
                  <p className="text-xs text-gray-500 mt-1">
                    This value is automatically set from your user account.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Repository URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  placeholder="https://github.com/username/repo"
                  onChange={(e) =>
                    setRepoUrl(
                      e.target.value
                        .replace("https://", "")
                        .replace("www.", ""),
                    )
                  }
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
                {user && user.username && githubUsername === "" && (
                  <button
                    onClick={() => setGithubUsername(user.username)}
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Use my username
                  </button>
                )}
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
                  callApi(
                    () => addRepository(userId, repoUrl),
                    "addRepository",
                    {
                      userId,
                      repoUrl,
                    },
                  )
                }
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!user}
              >
                Add Repository
              </button>

              <button
                onClick={() =>
                  callApi(
                    () => getAllRepositories(userId),
                    "getAllRepositories",
                    { userId },
                  )
                }
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!user}
              >
                Get All Repositories
              </button>

              <button
                onClick={() =>
                  callApi(
                    () => getRepositoryStats(repoUrl, timeWindow, repoId),
                    "getRepositoryStats",
                    { repoUrl, timeWindow },
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
                    { githubUsername, repoId, userId, timeWindow },
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
                    { repoId, timeWindow },
                  )
                }
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Get Top Performers
              </button>

              <button
                onClick={() =>
                  callApi(
                    () => getRecentActivity(repoId),
                    "getRecentActivity",
                    {
                      repoId,
                    },
                  )
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
                    { repoId, groupBy },
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
        <div className="space-y-6">
          {/* Request Details Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Request Details</h2>

            {requestDetails ? (
              <div>
                <div className="mb-2 pb-2 border-b">
                  <span className="font-semibold">API Function: </span>
                  <span className="text-blue-600">
                    {requestDetails.function}
                  </span>
                </div>
                <div className="mb-2 pb-2 border-b">
                  <span className="font-semibold">Timestamp: </span>
                  <span className="text-blue-600">
                    {requestDetails.timestamp}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Parameters: </span>
                </div>
                <div className="overflow-auto max-h-[200px]">
                  <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                    {JSON.stringify(requestDetails.parameters, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                No request made yet. Click one of the API buttons to see request
                details.
              </p>
            )}
          </div>

          {/* Response Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>

            {apiLoading && (
              <div className="text-center py-4">
                <p className="text-gray-600">Loading...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-4">
                <p>{error}</p>
              </div>
            )}

            {response && !apiLoading && !error && (
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
