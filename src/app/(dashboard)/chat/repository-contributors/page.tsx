"use client";

import React, { useState, useCallback, FormEvent, useEffect } from 'react';
import { getRepositoryContributors, ContributorListItemAPI } from '@/utils/api';
import { Users, AlertCircle, Search, Loader2, ExternalLink, Github, ArrowLeft, Filter } from 'lucide-react'; // Added Filter
import Link from 'next/link';
import Image from 'next/image';
import { getItem, setItem, removeItem } from '@/utils/storage'; // Import storage utils

// Helper date functions (getTodayDateString, getPastDateString - if needed, otherwise remove)

const CONTRIBUTORS_PAGE_STORAGE_KEY = 'repositoryContributorsPageState';

interface StoredContributorsPageState {
  repoOwner: string;
  repoName: string;
  searchQuery: string;
  contributorsList: ContributorListItemAPI[];
  hasFetched: boolean;
}

export default function RepositoryContributorsPage() {
  const [repoOwner, setRepoOwner] = useState<string>("");
  const [repoName, setRepoName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [contributorsList, setContributorsList] = useState<ContributorListItemAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Effect to load state from localStorage on mount
  useEffect(() => {
    const storedStateString = getItem(CONTRIBUTORS_PAGE_STORAGE_KEY);
    if (storedStateString) {
      try {
        const storedState: StoredContributorsPageState = JSON.parse(storedStateString);
        setRepoOwner(storedState.repoOwner || "");
        setRepoName(storedState.repoName || "");
        setSearchQuery(storedState.searchQuery || "");
        if (storedState.contributorsList && storedState.contributorsList.length > 0) {
          setContributorsList(storedState.contributorsList);
        }
        setHasFetched(storedState.hasFetched || false);
      } catch (e) {
        console.error("Failed to parse stored contributors page state:", e);
        removeItem(CONTRIBUTORS_PAGE_STORAGE_KEY);
      }
    }
  }, []);

  // Effect to save state to localStorage whenever relevant parts change
  useEffect(() => {
    // Only save if hasFetched is true, to avoid overwriting with initial empty state
    // or if there's meaningful data to save.
    if (hasFetched || contributorsList.length > 0) {
      const stateToStore: StoredContributorsPageState = {
        repoOwner,
        repoName,
        searchQuery,
        contributorsList,
        hasFetched,
      };
      setItem(CONTRIBUTORS_PAGE_STORAGE_KEY, JSON.stringify(stateToStore));
    }
  }, [repoOwner, repoName, searchQuery, contributorsList, hasFetched]);

  const fetchContributors = useCallback(async () => {
    if (!repoOwner.trim() || !repoName.trim()) {
      setError("Repository owner and name are required.");
      setHasFetched(true); // Still mark as fetched to save input state
      setContributorsList([]); // Clear list on input error
      return;
    }
    setIsLoading(true);
    setError(null);
    // setContributorsList([]); // Keep previous list during load for better UX, or clear if preferred
    setHasFetched(true);
    try {
      const result = await getRepositoryContributors(repoOwner.trim(), repoName.trim());
      setContributorsList(result);
      if (result.length === 0) {
        setError(`No contributors found for ${repoOwner}/${repoName}. This might also indicate the repository doesn't exist or is private and inaccessible with the current token.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch contributors list.");
      setContributorsList([]); // Clear list on API error
    } finally {
      setIsLoading(false);
    }
  }, [repoOwner, repoName]); // Removed contributorsList from dependencies to avoid loop, managed by useEffect

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchContributors();
  };
  
  // Filter contributors based on search query
  const filteredContributors = contributorsList.filter(contributor => 
    contributor.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-300">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
          <Users className="w-8 h-8 mr-3 text-indigo-600" />
          Repository Contributors
        </h1>
        {/* Modernized Link */}
        <Link
          href="/chat"
          className="flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to AI Assistant
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="contribRepoOwner" className="block text-sm font-medium text-gray-700 mb-1">
              Repository Owner
            </label>
            <input
              type="text"
              id="contribRepoOwner"
              value={repoOwner}
              onChange={(e) => setRepoOwner(e.target.value)}
              placeholder="e.g., facebook"
              className="input w-full"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="contribRepoName" className="block text-sm font-medium text-gray-700 mb-1">
              Repository Name
            </label>
            <input
              type="text"
              id="contribRepoName"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="e.g., react"
              className="input w-full"
              required
            />
          </div>
          <div className="md:col-span-1">
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
              {isLoading ? 'Fetching...' : 'Fetch Contributors'}
            </button>
          </div>
        </form>
      </div>

      {!hasFetched && !isLoading && (
        <div className="my-4 text-center text-gray-500 py-12 bg-white rounded-xl shadow-lg">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium">Enter Repository Details</p>
          <p className="text-sm">Fill in the repository owner and name above, then click "Fetch Contributors" to load the data.</p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col justify-center items-center py-12 text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
          <p className="text-gray-600 font-medium">Loading Contributors...</p>
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

      {!isLoading && !error && hasFetched && contributorsList.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Displaying {filteredContributors.length} of {contributorsList.length} Contributor(s) for <span className="font-medium text-indigo-700">{repoOwner}/{repoName}</span>
            </h2>
            
            {/* Search bar for filtering contributors */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="input pl-10 w-full"
                placeholder="Search contributors by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {filteredContributors.map((contributor) => (
              <div
                key={contributor.username}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-xl transition-shadow duration-200 ease-in-out bg-gray-50/50"
              >
                {contributor.avatar_url ? (
                  <Image
                    src={contributor.avatar_url}
                    alt={`${contributor.username}'s avatar`}
                    width={80}
                    height={80}
                    className="rounded-full mb-3 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full mb-3 bg-gray-300 flex items-center justify-center text-gray-500 shadow-md">
                    <Github className="w-10 h-10" />
                  </div>
                )}
                <Link
                  href={`/chat/contributor-analysis?username=${contributor.username}&owner=${repoOwner}&repo=${repoName}`}
                  className="text-md font-semibold text-indigo-600 hover:text-indigo-700 hover:underline mb-1 text-center"
                >
                  {contributor.username}
                </Link>
                <p className="text-sm text-gray-600">
                  Contributions: <span className="font-bold text-gray-800">{contributor.contributions}</span>
                </p>
                <Link
                  href={contributor.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                  title={`View ${contributor.username}'s profile on GitHub`}
                >
                  View GitHub Profile <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </div>
            ))}
          </div>
          
          {filteredContributors.length === 0 && searchQuery && (
            <div className="text-center py-10">
              <p className="text-gray-600">No contributors matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {!isLoading && hasFetched && contributorsList.length === 0 && !error && (
         <div className="my-4 text-center text-gray-500 py-12 bg-white rounded-xl shadow-lg">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium">No Contributors Found</p>
            <p className="text-sm">No contributors were found for this repository, or the repository might be private/inaccessible.</p>
        </div>
      )}
    </div>
  );
}