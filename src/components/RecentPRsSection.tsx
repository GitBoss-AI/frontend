"use client";

import React, { useState, useCallback, FormEvent, useEffect } from 'react';
import { getRepositoryPRs, PRListItemAPI } from '@/utils/api';
import { ListChecks, AlertCircle, ExternalLink, Search, Loader2, CalendarDays, Filter } from 'lucide-react';
import Link from 'next/link';

// Helper to get today's date in YYYY-MM-DD format for input default
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get a date N days ago in YYYY-MM-DD format
const getPastDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function RecentPRsPage() {
  const [repoOwner, setRepoOwner] = useState<string>("facebook");
  const [repoName, setRepoName] = useState<string>("react");
  const [startDate, setStartDate] = useState<string>(getPastDateString(7)); // Default to last 7 days
  const [endDate, setEndDate] = useState<string>(getTodayDateString());
  const [prStateFilter, setPrStateFilter] = useState<string>("all"); // "all", "open", "closed", "merged"

  const [prList, setPrList] = useState<PRListItemAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false); // To track if a fetch has been attempted

  const fetchPRs = useCallback(async () => {
    if (!repoOwner.trim() || !repoName.trim()) {
      setError("Repository owner and name are required.");
      setHasFetched(true); // Mark as fetched even if input error
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date.");
      setHasFetched(true); // Mark as fetched even if input error
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrList([]); // Clear previous list
    setHasFetched(true); // Mark that a fetch attempt is being made

    try {
      const result = await getRepositoryPRs(
        repoOwner.trim(),
        repoName.trim(),
        startDate || undefined, // Pass undefined if empty string, API handles Optional
        endDate || undefined,   // Pass undefined if empty string
        prStateFilter
      );
      setPrList(result);
      if (result.length === 0) {
        // No explicit error needed here, the UI will show "No pull requests found..."
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch PR list.");
    } finally {
      setIsLoading(false);
    }
  }, [repoOwner, repoName, startDate, endDate, prStateFilter]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPRs();
  };

  // Automatically fetch PRs when the component mounts with default values
  useEffect(() => {
    fetchPRs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount to load initial data

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-100 min-h-screen"> {/* Light gray background */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-300">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
          <ListChecks className="w-8 h-8 mr-3 text-blue-600" />
          Recent Pull Requests
        </h1>
        <Link href="/chat" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150">
          &larr; Back to Chat
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
            <div>
              <label htmlFor="prRepoOwnerPage" className="block text-sm font-medium text-gray-700 mb-1">
                Repository Owner
              </label>
              <input
                type="text"
                id="prRepoOwnerPage"
                value={repoOwner}
                onChange={(e) => setRepoOwner(e.target.value)}
                placeholder="e.g., facebook"
                className="input w-full"
              />
            </div>
            <div>
              <label htmlFor="prRepoNamePage" className="block text-sm font-medium text-gray-700 mb-1">
                Repository Name
              </label>
              <input
                type="text"
                id="prRepoNamePage"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="e.g., react"
                className="input w-full"
              />
            </div>
            <div>
              <label htmlFor="prStateFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Filter className="w-4 h-4 mr-1.5 text-gray-500" /> State
              </label>
              <select
                id="prStateFilter"
                value={prStateFilter}
                onChange={(e) => setPrStateFilter(e.target.value)}
                className="input w-full appearance-none" // Added appearance-none for custom arrow if needed
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed (Not Merged)</option>
                <option value="merged">Merged</option>
              </select>
            </div>
            <div>
              <label htmlFor="prStartDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <CalendarDays className="w-4 h-4 mr-1.5 text-gray-500" /> Start Date
              </label>
              <input
                type="date"
                id="prStartDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input w-full"
                max={endDate || getTodayDateString()} // Start date can't be after end date or today
              />
            </div>
            <div>
              <label htmlFor="prEndDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <CalendarDays className="w-4 h-4 mr-1.5 text-gray-500" /> End Date
              </label>
              <input
                type="date"
                id="prEndDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full"
                min={startDate} // End date can't be before start date
                max={getTodayDateString()}
              />
            </div>
            <div className="lg:pt-6"> {/* Align button with inputs on larger screens */}
              <button
                type="submit"
                className="btn btn-primary w-full flex items-center justify-center transition-all duration-150 ease-in-out group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                )}
                {isLoading ? 'Fetching...' : 'Fetch PRs'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="flex flex-col justify-center items-center py-12 text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
          <p className="text-gray-600 font-medium">Loading Pull Requests...</p>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="my-4 flex items-start rounded-lg border-l-4 border-red-500 bg-red-100 p-4 text-red-700 shadow-md">
          <AlertCircle className="mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error Fetching Data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && hasFetched && prList.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Showing {prList.length} Pull Request(s)
            </h2>
            <p className="text-sm text-gray-600">
              For repository: <span className="font-medium text-blue-700">{repoOwner}/{repoName}</span>
              {startDate && endDate && ` | Dates: ${startDate} to ${endDate}`}
              {prStateFilter !== "all" && ` | State: ${prStateFilter}`}
            </p>
          </div>
          <ul className="divide-y divide-gray-200 max-h-[calc(100vh-25rem)] overflow-y-auto"> {/* Adjusted max-height */}
            {prList.map((pr) => (
              <li key={pr.number} className="p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-blue-600 hover:text-blue-700 hover:underline truncate block"
                      title={pr.title}
                    >
                      #{pr.number}: {pr.title}
                    </a>
                    <p className="mt-1 text-xs text-gray-500">
                      Created: {new Date(pr.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end sm:flex-row sm:items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-tight font-semibold rounded-full whitespace-nowrap ${
                        pr.state === 'open' ? 'bg-green-100 text-green-800' :
                        pr.state === 'closed' ? 'bg-red-100 text-red-800' :
                        pr.state === 'merged' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {pr.state.charAt(0).toUpperCase() + pr.state.slice(1)}
                    </span>
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-all duration-150 ease-in-out"
                      title="View PR on GitHub"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && hasFetched && prList.length === 0 && !error && (
         <div className="my-4 text-center text-gray-500 py-12 bg-white rounded-xl shadow-lg">
            <ListChecks className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium">No Pull Requests Found</p>
            <p className="text-sm">Try adjusting your filters or date range.</p>
        </div>
      )}
    </div>
  );
}

// Ensure these base Tailwind utility classes are effectively available through your globals.css or Tailwind config:
// .input { @apply block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 transition-shadow duration-150 ease-in-out; }
// .btn { @apply inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 cursor-pointer; }
// .btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400; }