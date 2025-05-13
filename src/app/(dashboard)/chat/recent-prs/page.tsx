"use client";

import React, { useState, useCallback, FormEvent } from 'react';
import { getRepositoryPRs, PRListItemAPI, analyzePullRequest, PRAnalysisResponse } from '@/utils/api';
import {
  ListChecks, AlertCircle, ExternalLink, Search, Loader2, CalendarDays, Filter, ChevronDown, ChevronUp, FileText, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import PRAnalysisDisplay from '@/components/PRAnalysisDisplay'; // Import the new component

// Helper date functions (getTodayDateString, getPastDateString - keep as before)
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};
const getPastDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export default function RecentPRsPage() {
  // State for the PR list form
  const [listRepoOwner, setListRepoOwner] = useState<string>("");
  const [listRepoName, setListRepoName] = useState<string>("");
  const [listStartDate, setListStartDate] = useState<string>(getPastDateString(7));
  const [listEndDate, setListEndDate] = useState<string>(getTodayDateString());
  const [listPrStateFilter, setListPrStateFilter] = useState<string>("all");

  const [prList, setPrList] = useState<PRListItemAPI[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [hasFetchedList, setHasFetchedList] = useState(false);

  // State for individual PR analyses (keyed by PR number)
  const [analyses, setAnalyses] = useState<{ [key: number]: PRAnalysisResponse | null }>({});
  const [loadingAnalyses, setLoadingAnalyses] = useState<{ [key: number]: boolean }>({});
  const [errorAnalyses, setErrorAnalyses] = useState<{ [key: number]: string | null }>({});
  const [expandedAnalyses, setExpandedAnalyses] = useState<{ [key: number]: boolean }>({});

  // State for the general "Analyze Single PR" tool
  const [singlePrOwner, setSinglePrOwner] = useState<string>("");
  const [singlePrRepo, setSinglePrRepo] = useState<string>("");
  const [singlePrNumber, setSinglePrNumber] = useState<string>("");
  const [singlePrAnalysisResult, setSinglePrAnalysisResult] = useState<PRAnalysisResponse | null>(null);
  const [isLoadingSingleAnalysis, setIsLoadingSingleAnalysis] = useState(false);
  const [singleAnalysisError, setSingleAnalysisError] = useState<string | null>(null);


  const fetchPRList = useCallback(async () => {
    if (!listRepoOwner.trim() || !listRepoName.trim()) {
      setListError("Repository owner and name are required for listing.");
      setHasFetchedList(true);
      return;
    }
    if (listStartDate && listEndDate && listStartDate > listEndDate) {
      setListError("Start date cannot be after end date for listing.");
      setHasFetchedList(true);
      return;
    }
    setIsLoadingList(true);
    setListError(null);
    setPrList([]);
    setHasFetchedList(true);
    try {
      const result = await getRepositoryPRs(
        listRepoOwner.trim(),
        listRepoName.trim(),
        listStartDate || undefined,
        listEndDate || undefined,
        listPrStateFilter
      );
      setPrList(result);
      if (result.length === 0) {
        // setListError (or just let the UI handle "No PRs found")
      }
    } catch (err: any) {
      setListError(err.message || "Failed to fetch PR list.");
    } finally {
      setIsLoadingList(false);
    }
  }, [listRepoOwner, listRepoName, listStartDate, listEndDate, listPrStateFilter]);

  const handleListFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPRList();
  };

  const handleAnalyzeListedPR = async (prNumber: number, owner: string, repo: string) => {
    setLoadingAnalyses(prev => ({ ...prev, [prNumber]: true }));
    setErrorAnalyses(prev => ({ ...prev, [prNumber]: null }));
    setAnalyses(prev => ({ ...prev, [prNumber]: null })); // Clear previous result for this PR

    try {
      const result = await analyzePullRequest(prNumber, owner, repo);
      setAnalyses(prev => ({ ...prev, [prNumber]: result }));
      setExpandedAnalyses(prev => ({ ...prev, [prNumber]: true })); // Expand on success
    } catch (err: any) {
      setErrorAnalyses(prev => ({ ...prev, [prNumber]: err.message || "Failed to analyze PR." }));
      setExpandedAnalyses(prev => ({ ...prev, [prNumber]: true })); // Still expand to show error
    } finally {
      setLoadingAnalyses(prev => ({ ...prev, [prNumber]: false }));
    }
  };

  const toggleAnalysisDisplay = (prNumber: number) => {
    setExpandedAnalyses(prev => ({ ...prev, [prNumber]: !prev[prNumber] }));
  };

  const handleAnalyzeSinglePR = async (e: FormEvent) => {
    e.preventDefault();
    if (!singlePrOwner.trim() || !singlePrRepo.trim() || !singlePrNumber.trim()) {
        setSingleAnalysisError("Owner, Repository, and PR Number are required.");
        return;
    }
    const prNum = parseInt(singlePrNumber, 10);
    if (isNaN(prNum)) {
        setSingleAnalysisError("PR Number must be an integer.");
        return;
    }

    setIsLoadingSingleAnalysis(true);
    setSingleAnalysisError(null);
    setSinglePrAnalysisResult(null);
    try {
        const result = await analyzePullRequest(prNum, singlePrOwner.trim(), singlePrRepo.trim());
        setSinglePrAnalysisResult(result);
    } catch (err: any) {
        setSingleAnalysisError(err.message || "Failed to analyze PR.");
    } finally {
        setIsLoadingSingleAnalysis(false);
    }
  };


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-gray-300">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
          <ListChecks className="w-8 h-8 mr-3 text-blue-600" />
          Pull Request Center
        </h1>
        <Link href="/chat" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150">
          &larr; Back to AI Assistant
        </Link>
      </div>

      {/* Section for General Single PR Analysis Tool */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-indigo-600" />
            Analyze a Specific Pull Request
        </h2>
        <form onSubmit={handleAnalyzeSinglePR} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="singlePrOwner" className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                    <input type="text" id="singlePrOwner" value={singlePrOwner} onChange={e => setSinglePrOwner(e.target.value)} placeholder="e.g., facebook" className="input w-full"/>
                </div>
                <div>
                    <label htmlFor="singlePrRepo" className="block text-sm font-medium text-gray-700 mb-1">Repository</label>
                    <input type="text" id="singlePrRepo" value={singlePrRepo} onChange={e => setSinglePrRepo(e.target.value)} placeholder="e.g., react" className="input w-full"/>
                </div>
                <div>
                    <label htmlFor="singlePrNumber" className="block text-sm font-medium text-gray-700 mb-1">PR Number</label>
                    <input type="number" id="singlePrNumber" value={singlePrNumber} onChange={e => setSinglePrNumber(e.target.value)} placeholder="e.g., 33165" className="input w-full"/>
                </div>
                <button type="submit" className="btn btn-indigo w-full flex items-center justify-center group" disabled={isLoadingSingleAnalysis}>
                    {isLoadingSingleAnalysis ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2 group-hover:text-yellow-300 transition-colors" />}
                    {isLoadingSingleAnalysis ? 'Analyzing...' : 'Analyze PR'}
                </button>
            </div>
            {singleAnalysisError && (
                <div className="mt-3 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
                    {singleAnalysisError}
                </div>
            )}
            {singlePrAnalysisResult && !isLoadingSingleAnalysis && (
                <PRAnalysisDisplay 
                    analysis={singlePrAnalysisResult} 
                    prUrl={`https://github.com/${singlePrOwner}/${singlePrRepo}/pull/${singlePrNumber}`} 
                />
            )}
        </form>
      </div>


      {/* Section for Listing PRs */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Filter Recent Pull Requests</h2>
        <form onSubmit={handleListFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
            <div>
              <label htmlFor="listRepoOwner" className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input type="text" id="listRepoOwner" value={listRepoOwner} onChange={(e) => setListRepoOwner(e.target.value)} placeholder="e.g., facebook" className="input w-full" required/>
            </div>
            <div>
              <label htmlFor="listRepoName" className="block text-sm font-medium text-gray-700 mb-1">Repository</label>
              <input type="text" id="listRepoName" value={listRepoName} onChange={(e) => setListRepoName(e.target.value)} placeholder="e.g., react" className="input w-full" required/>
            </div>
            <div>
              <label htmlFor="listPrStateFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Filter className="w-4 h-4 mr-1.5 text-gray-500" /> State</label>
              <select id="listPrStateFilter" value={listPrStateFilter} onChange={(e) => setListPrStateFilter(e.target.value)} className="input w-full appearance-none">
                <option value="all">All</option><option value="open">Open</option><option value="closed">Closed (Not Merged)</option><option value="merged">Merged</option>
              </select>
            </div>
            <div>
              <label htmlFor="listStartDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <CalendarDays className="w-4 h-4 mr-1.5 text-gray-500" /> Start Date</label>
              <input type="date" id="listStartDate" value={listStartDate} onChange={(e) => setListStartDate(e.target.value)} className="input w-full" max={listEndDate || getTodayDateString()}/>
            </div>
            <div>
              <label htmlFor="listEndDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <CalendarDays className="w-4 h-4 mr-1.5 text-gray-500" /> End Date</label>
              <input type="date" id="listEndDate" value={listEndDate} onChange={(e) => setListEndDate(e.target.value)} className="input w-full" min={listStartDate} max={getTodayDateString()}/>
            </div>
            <div className="lg:pt-6">
              <button type="submit" className="btn btn-primary w-full flex items-center justify-center group" disabled={isLoadingList}>
                {isLoadingList ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />}
                {isLoadingList ? 'Fetching List...' : 'Fetch List'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {!hasFetchedList && !isLoadingList && (
        <div className="my-4 text-center text-gray-500 py-12 bg-white rounded-xl shadow-lg">
          <ListChecks className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium">Enter Repository Details</p>
          <p className="text-sm">Fill in the repository owner and name above, then click "Fetch List" to load the pull requests.</p>
        </div>
      )}

      {isLoadingList && (
        <div className="flex flex-col justify-center items-center py-12 text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
          <p className="text-gray-600 font-medium">Loading Pull Request List...</p>
        </div>
      )}

      {listError && !isLoadingList && (
        <div className="my-4 flex items-start rounded-lg border-l-4 border-red-500 bg-red-100 p-4 text-red-700 shadow-md">
          <AlertCircle className="mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
          <div><p className="font-semibold">Error Fetching List</p><p className="text-sm">{listError}</p></div>
        </div>
      )}

      {!isLoadingList && !listError && hasFetchedList && prList.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Showing {prList.length} Pull Request(s)
            </h2>
            {/* ... Sub-header for list filters ... */}
          </div>
          <ul className="divide-y divide-gray-200">
            {prList.map((pr) => (
              <li key={pr.number} className="p-4 hover:bg-gray-50/50 transition-colors duration-150 ease-in-out">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <a href={pr.url} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-blue-600 hover:text-blue-700 hover:underline truncate block" title={pr.title}>
                      #{pr.number}: {pr.title}
                    </a>
                    <p className="mt-1 text-xs text-gray-500">
                      Created: {new Date(pr.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       <span className="mx-1.5 text-gray-300">|</span>
                       State: {' '}
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-tight font-semibold rounded-full ${
                        pr.state === 'open' ? 'bg-green-100 text-green-800' :
                        pr.state === 'closed' ? 'bg-red-100 text-red-800' :
                        pr.state === 'merged' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'}`}>
                        {pr.state.charAt(0).toUpperCase() + pr.state.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (!expandedAnalyses[pr.number] && !analyses[pr.number]) { // Fetch only if not expanded and no data yet
                             handleAnalyzeListedPR(pr.number, listRepoOwner, listRepoName); // Use owner/name from list form
                        } else {
                            toggleAnalysisDisplay(pr.number); // Just toggle if data exists or was attempted
                        }
                      }}
                      className="btn btn-outline-indigo text-xs px-3 py-1.5 flex items-center group"
                      disabled={!!loadingAnalyses[pr.number]}
                    >
                      {loadingAnalyses[pr.number] ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> :
                       expandedAnalyses[pr.number] ? <ChevronUp className="w-4 h-4 mr-1.5" /> : <ChevronDown className="w-4 h-4 mr-1.5" />
                      }
                      {loadingAnalyses[pr.number] ? 'Analyzing...' : (expandedAnalyses[pr.number] ? 'Hide' : 'Analyze')}
                    </button>
                    <a href={pr.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-all" title="View on GitHub">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                {expandedAnalyses[pr.number] && (
                  <div className="mt-2 pl-2">
                    {loadingAnalyses[pr.number] && <p className="text-sm text-gray-500 py-2 flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Loading analysis...</p>}
                    {errorAnalyses[pr.number] && <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md">{errorAnalyses[pr.number]}</p>}
                    {analyses[pr.number] && !loadingAnalyses[pr.number] && !errorAnalyses[pr.number] && (
                      <PRAnalysisDisplay 
                        analysis={analyses[pr.number]!} 
                        prUrl={pr.url}
                      />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLoadingList && hasFetchedList && prList.length === 0 && !listError && (
         <div className="my-4 text-center text-gray-500 py-12 bg-white rounded-xl shadow-lg">
            {/* ... No PRs found message ... */}
            <ListChecks className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium">No Pull Requests Found</p>
            <p className="text-sm">Try adjusting your filters or date range.</p>
        </div>
      )}
    </div>
  );
}

// Add/ensure these utility classes in your globals.css or your Tailwind config:
// .input { @apply block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 transition-all duration-150 ease-in-out; }
// .btn { @apply inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 cursor-pointer; }
// .btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400; }
// .btn-indigo { @apply bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400; }
// .btn-outline-indigo { @apply bg-transparent border-indigo-600 text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-500 disabled:border-gray-300 disabled:text-gray-400; }