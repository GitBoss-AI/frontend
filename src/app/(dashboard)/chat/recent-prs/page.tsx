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
  // Default to last 7 days
  const [startDate, setStartDate] = useState<string>(getPastDateString(7));
  const [endDate, setEndDate] = useState<string>(getTodayDateString());
  const [prStateFilter, setPrStateFilter] = useState<string>("all"); // "all", "open", "closed", "merged"


  const [prList, setPrList] = useState<PRListItemAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchPRs = useCallback(async () => {
    if (!repoOwner.trim() || !repoName.trim()) {
      setError("Repository owner and name are required.");
      setHasFetched(true);
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date.");
      setHasFetched(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrList([]);
    setHasFetched(true);
    try {
      const result = await getRepositoryPRs(
        repoOwner.trim(),
        repoName.trim(),
        startDate || undefined, // Pass undefined if empty to match Optional[str]
        endDate || undefined,   // Pass undefined if empty
        prStateFilter
      );
      setPrList(result);
      if (result.length === 0) {
        setError(`No PRs found for ${repoOwner}/${repoName} matching the criteria.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch PR list.");
    } finally {
      setIsLoading(false);
    }
  }, [repoOwner, repoName, startDate, endDate, prStateFilter]);

  // Optional: Fetch PRs on initial load if desired
  // useEffect(() => {
  //   fetchPRs();
  // }, []); // Empty dependency array means it runs once on mount

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPRs();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <ListChecks className="w-7 h-7 mr-3 text-blue-600" />
          Recent Pull Requests
        </h1>
        <Link href="/chat" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150">
          &larr; Back to Chat
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="prRepoOwnerPage" className="block text-sm font-medium text-gray-700 mb-1">
                Owner
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
                Repository
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
                <Filter className="w-4 h-4 mr-1 text-gray-500" /> State
              </label>
              <select
                id="prStateFilter"
                value={prStateFilter}
                onChange={(e) => setPrStateFilter(e.target.value)}
                className="input w-full"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed (Not Merged)</option>
                <option value="merged">Merged</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="prStartDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <CalendarDays className="w-4 h-4 mr-1 text-gray-500" /> Start Date
              </label>
              <input
                type="date"
                id="prStartDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input w-full"
                max={getTodayDateString()} // Optional: prevent future start dates
              />
            </div>
            <div>
              <label htmlFor="prEndDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <CalendarDays className="w-4 h-4 mr-1 text-gray-500" /> End Date
              </label>
              <input
                type="date"
                id="prEndDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full"
                min={startDate} // Optional: end date cannot be before start date
                max={getTodayDateString()} // Optional: prevent future end dates
              />
            </div>
            <div className="lg:col-start-4"> {/* Aligns button to the right on larger screens */}
              <button
                type="submit"
                className="btn btn-primary w-full flex items-center justify-center transition-all duration-150 ease-in-out transform hover:scale-105 mt-3 md:mt-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Fetching...' : 'Fetch PRs'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ... (Loading, Error, PR List display sections as before, no changes needed there) ... */}
       {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="ml-3 text-gray-600">Loading Pull Requests...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="my-4 flex items-center rounded-lg border-l-4 border-red-500 bg-red-100 p-4 text-red-700 shadow-md">
          <AlertCircle className="mr-3 h-6 w-6 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!isLoading && !error && hasFetched && prList.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">
            Found {prList.length} PR(s) for <span className="font-bold text-blue-600">{repoOwner}/{repoName}</span>
            {startDate && endDate && ` (from ${startDate} to ${endDate})`}
            {prStateFilter !== "all" && ` - State: ${prStateFilter}`}
          </h2>
          <ul className="divide-y divide-gray-200 max-h-[calc(100vh-20rem)] overflow-y-auto">
            {prList.map((pr) => (
              <li key={pr.number} className="p-4 hover:bg-blue-50 transition-colors duration-150 ease-in-out">
                <div className="flex items-center justify-between">
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
                  </div>
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 p-1 text-gray-500 hover:text-blue-600 transition-colors duration-150 ease-in-out"
                    title="View PR on GitHub"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  State: {' '}
                  <span
                    className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pr.state === 'open' ? 'bg-green-100 text-green-700' :
                      pr.state === 'closed' ? 'bg-red-100 text-red-700' :
                      pr.state === 'merged' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pr.state}
                  </span>
                  <span className="mx-2 text-gray-400">|</span>
                  Created: {new Date(pr.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && hasFetched && prList.length === 0 && !error && (
         <div className="my-4 text-center text-gray-500 py-10 bg-white rounded-xl shadow-lg">
            <ListChecks className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            No pull requests found matching your criteria.
        </div>
      )}
    </div>
  );
}