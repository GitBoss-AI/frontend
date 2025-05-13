// src/app/(dashboard)/chat/repository-issues/page.tsx
"use client";

import React, { useState, useCallback, FormEvent, useEffect } from 'react';
import { 
    getRepositoryIssues, IssueItemAPI, RepoIssuesResponseAPI,
    generateIssueSolution, GenerateIssueSolutionRequestAPI, IssueSolutionOverallResponseAPI, StepResponseAPI // Import new API and types
} from '@/utils/api';
import { 
    ListChecks, AlertCircle, Search, Loader2, CalendarDays, Filter, ChevronDown, ChevronUp, 
    ExternalLink, User, Tag, Info, Code, Zap, RotateCcw // Added Zap for Generate Solution, RotateCcw for retry
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

// (Keep getTodayDateString and getPastDateString helpers)
const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getPastDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};


interface CollapsibleIssueProps {
  issue: IssueItemAPI;
  repoOwner: string; // Pass repoOwner
  repoName: string;  // Pass repoName
  onGenerateSolution: (issue: IssueItemAPI) => void; // Callback to trigger solution generation
  solutionData?: IssueSolutionOverallResponseAPI | null;
  isGeneratingSolution?: boolean;
  solutionError?: string | null;
}

const CollapsibleIssue: React.FC<CollapsibleIssueProps> = ({ 
    issue, 
    repoOwner, // Receive repoOwner
    repoName,  // Receive repoName
    onGenerateSolution,
    solutionData,
    isGeneratingSolution,
    solutionError
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    // If solution data or error becomes available, and the details are open, show the solution section
    if ((solutionData || solutionError) && isOpen) {
      setShowSolution(true);
    }
  }, [solutionData, solutionError, isOpen]);
  
  const handleToggleDetails = () => {
    setIsOpen(!isOpen);
    // If closing details, also hide solution section unless it was explicitly opened by generating
    if (isOpen && !solutionData && !solutionError) { 
        setShowSolution(false);
    }
  };

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent CollapsibleIssue click
    setShowSolution(true); // Show solution section immediately
    if (!isOpen) setIsOpen(true); // Open details if not already open
    onGenerateSolution(issue);
  };

  return (
    <li className="py-4 px-2 hover:bg-gray-50/70 transition-colors duration-150 ease-in-out rounded-md border border-gray-200 shadow-sm mb-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <button
            onClick={handleToggleDetails}
            className="w-full text-left focus:outline-none group"
          >
            <div className="flex items-center">
              {isOpen ? <ChevronUp className="w-5 h-5 mr-2 text-indigo-600 transition-transform duration-200" /> : <ChevronDown className="w-5 h-5 mr-2 text-indigo-500 group-hover:text-indigo-600 transition-transform duration-200" />}
              <span className="text-base font-semibold text-indigo-700 group-hover:underline truncate" title={issue.title}>
                #{issue.number}: {issue.title}
              </span>
            </div>
          </button>
          <div className="mt-1 text-xs text-gray-500 ml-7 flex items-center flex-wrap gap-x-3 gap-y-1">
            <span>State: <span className={`px-2 py-0.5 inline-flex text-xs leading-tight font-semibold rounded-full ${issue.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {issue.state}
            </span></span>
            <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
            {issue.closed_at && <span>Closed: {new Date(issue.closed_at).toLocaleDateString()}</span>}
            <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline inline-flex items-center">
              View on GitHub <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
        {/* Generate Solution Button */}
        <button
            onClick={handleGenerateClick}
            className="btn btn-teal text-xs px-3 py-1.5 flex items-center group mt-2 sm:mt-0 ml-auto sm:ml-0" // Adjusted margin for mobile
            disabled={isGeneratingSolution}
            title="Generate potential code solution for this issue"
        >
            {isGeneratingSolution ? 
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : 
                <Zap className="w-4 h-4 mr-1.5 group-hover:text-yellow-300 transition-colors" />
            }
            {isGeneratingSolution ? 'Generating...' : 'Solve Issue'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 ml-7 pl-4 pt-3 border-l-2 border-indigo-100 space-y-4">
          {/* ... (Existing issue details: description, author, labels) ... */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">Description:</h4>
            <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap border border-gray-200">
              {issue.body ? <ReactMarkdown>{issue.body}</ReactMarkdown> : <span className="italic">No description.</span>}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <User className="w-4 h-4 mr-1.5 text-gray-500" /> Author:
            </h4>
            <div className="flex items-center space-x-2 text-sm">
              <Image src={issue.user.avatar_url} alt={issue.user.login} width={24} height={24} className="rounded-full shadow-sm" />
              <a href={issue.user.html_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                {issue.user.login}
              </a>
            </div>
          </div>
          {issue.labels && issue.labels.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <Tag className="w-4 h-4 mr-1.5 text-gray-500" /> Labels:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {issue.labels.map(label => (
                  <span key={label.name} className="px-2 py-0.5 text-xs rounded-full border" style={{ backgroundColor: `#${label.color}33`, borderColor: `#${label.color}`, color: `#${label.color}` }}>
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Solution Display Section */}
      {showSolution && (
        <div className="mt-4 ml-7 pl-4 pt-3 border-l-2 border-teal-200 bg-teal-50/50 rounded-md">
            <h4 className="text-sm font-semibold text-teal-700 mb-2 flex items-center">
                <Code className="w-4 h-4 mr-1.5" /> Generated Solution
            </h4>
            {isGeneratingSolution && (
                <div className="flex items-center text-sm text-gray-600 py-3">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin text-teal-600" />
                    Generating solution, please wait... This might take a minute.
                </div>
            )}
            {solutionError && !isGeneratingSolution && (
                <div className="my-2 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
                    <p className="font-semibold">Error generating solution:</p>
                    <p>{solutionError}</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onGenerateSolution(issue); }}
                        className="btn btn-outline-primary text-xs mt-2"
                    >
                        <RotateCcw className="w-3 h-3 mr-1"/> Retry
                    </button>
                </div>
            )}
            {solutionData && !isGeneratingSolution && !solutionError && (
                <div className="space-y-3">
                    <p className="text-sm text-teal-800">{solutionData.message}</p>
                    {solutionData.steps && solutionData.steps.length > 0 && (
                        <details className="text-xs">
                            <summary className="cursor-pointer text-teal-600 hover:underline">View Workflow Steps ({solutionData.steps.length})</summary>
                            <ul className="mt-2 space-y-1 pl-2">
                                {solutionData.steps.map((step, index) => (
                                    <li key={index} className={`p-1.5 rounded-sm text-gray-700 ${step.status === 'error' ? 'bg-red-100 border-l-2 border-red-500' : step.status === 'success' ? 'bg-green-50 border-l-2 border-green-500' : 'bg-gray-100'}`}>
                                        <strong>{step.step_name}:</strong> {step.status} 
                                        {step.duration_ms && ` (${step.duration_ms.toFixed(0)}ms)`}
                                        {step.error_message && <span className="text-red-600 block text-xs">Error: {step.error_message}</span>}
                                        {/* Optionally, display step.data if useful */}
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )}
                    {solutionData.final_diff ? (
                        <div>
                            <h5 className="text-xs font-semibold text-gray-600 mt-2 mb-1">Suggested Diff:</h5>
                            <pre className="bg-gray-800 text-white p-3 rounded-md text-xs overflow-x-auto max-h-96">
                                <code>{solutionData.final_diff}</code>
                            </pre>
                        </div>
                    ) : (
                        <p className="italic text-gray-500">No diff generated.</p>
                    )}
                </div>
            )}
        </div>
      )}
    </li>
  );
};

export default function RepositoryIssuesPage() {
  const [repoOwner, setRepoOwner] = useState<string>("GitBoss-AI");
  const [repoName, setRepoName] = useState<string>("agent");
  const [startDate, setStartDate] = useState<string>(getPastDateString(30));
  const [endDate, setEndDate] = useState<string>(getTodayDateString());
  const [issueStateFilter, setIssueStateFilter] = useState<string>("all");

  const [issuesData, setIssuesData] = useState<RepoIssuesResponseAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // State for individual issue solution generation
  const [solutionResults, setSolutionResults] = useState<{ [issueNumber: number]: IssueSolutionOverallResponseAPI | null }>({});
  const [generatingSolutionFor, setGeneratingSolutionFor] = useState<number | null>(null);
  const [solutionErrors, setSolutionErrors] = useState<{ [issueNumber: number]: string | null }>({});
  

  const fetchIssues = useCallback(async () => {
    if (!repoOwner.trim() || !repoName.trim()) {
      setError("Repository owner and name are required.");
      setHasFetched(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasFetched(true);

    try {
      const result = await getRepositoryIssues(repoOwner.trim(), repoName.trim(), startDate, endDate, issueStateFilter);
      if (result.error) {
        setError(`${result.error}${result.details ? ` (${result.details})` : ''}${result.status_code ? ` (Status: ${result.status_code})` : ''}`);
        setIssuesData(null); // only clear if there's an actual error
        sessionStorage.removeItem("repoIssuesData");
      } else {
        setIssuesData(result);
        sessionStorage.setItem("repoIssuesData", JSON.stringify(result));
        sessionStorage.setItem("repoIssuesMeta", JSON.stringify({ repoOwner, repoName, startDate, endDate, issueStateFilter }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch issues.");
      setIssuesData(null); // only clear if there's an exception
      sessionStorage.removeItem("repoIssuesData");
    } finally {
      setIsLoading(false);
    }
  }, [repoOwner, repoName, startDate, endDate, issueStateFilter]);

  const handleGenerateSolutionForIssue = async (issue: IssueItemAPI) => {

    setGeneratingSolutionFor(issue.number);
    setSolutionErrors(prev => ({ ...prev, [issue.number]: null }));
    setSolutionResults(prev => ({ ...prev, [issue.number]: null }));

    const requestPayload: GenerateIssueSolutionRequestAPI = {
      repo_owner: repoOwner, // Assuming these are available from the page's state or issue context
      repo_name: repoName,
      issue_number: issue.number,
      issue_title: issue.title,
      issue_description: issue.body || "No description provided for this issue.", // Ensure body is not null
    };

    try {
      const result = await generateIssueSolution(requestPayload);
      setSolutionResults(prev => ({ ...prev, [issue.number]: result }));
      if (result.error) {
        setSolutionErrors(prev => ({ ...prev, [issue.number]: result.error || "An unknown error occurred during solution generation." }));
      }
    } catch (err: any) {
      setSolutionErrors(prev => ({ ...prev, [issue.number]: err.message || "Failed to generate solution." }));
    } finally {
      setGeneratingSolutionFor(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchIssues();
  };

  useEffect(() => {
    const cachedData = sessionStorage.getItem("repoIssuesData");
    const cachedMeta = sessionStorage.getItem("repoIssuesMeta");

    if (cachedData && cachedMeta) {
      try {
        const parsedData: RepoIssuesResponseAPI = JSON.parse(cachedData);
        const parsedMeta = JSON.parse(cachedMeta);

        setIssuesData(parsedData);
        setRepoOwner(parsedMeta.repoOwner || "GitBoss-AI");
        setRepoName(parsedMeta.repoName || "agent");
        setStartDate(parsedMeta.startDate || getPastDateString(30));
        setEndDate(parsedMeta.endDate || getTodayDateString());
        setIssueStateFilter(parsedMeta.issueStateFilter || "all");
        setHasFetched(true);
      } catch (e) {
        console.error("Failed to parse cached issues data:", e);
      }
    }
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-100 min-h-screen">
      {/* ... (existing header and form for fetching issues) ... */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-300">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
            <Info className="w-8 h-8 mr-3 text-indigo-600" />
            Repository Issues
          </h1>
          <Link href="/chat" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150">
            &larr; Back to AI Assistant
          </Link>
        </div>
  
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
              <div>
                <label htmlFor="issueRepoOwner" className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input type="text" id="issueRepoOwner" value={repoOwner} onChange={(e) => setRepoOwner(e.target.value)} placeholder="e.g., facebook" className="input w-full"/>
              </div>
              <div>
                <label htmlFor="issueRepoName" className="block text-sm font-medium text-gray-700 mb-1">Repository</label>
                <input type="text" id="issueRepoName" value={repoName} onChange={(e) => setRepoName(e.target.value)} placeholder="e.g., react" className="input w-full"/>
              </div>
               <div>
                <label htmlFor="issueStateFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Filter className="w-4 h-4 mr-1.5 text-gray-500" /> State</label>
                <select id="issueStateFilter" value={issueStateFilter} onChange={(e) => setIssueStateFilter(e.target.value)} className="input w-full appearance-none">
                  <option value="all">All</option><option value="open">Open</option><option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label htmlFor="issueStartDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1.5 text-gray-500" /> Start Date</label>
                <input type="date" id="issueStartDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input w-full" max={endDate || getTodayDateString()}/>
              </div>
              <div>
                <label htmlFor="issueEndDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1.5 text-gray-500" /> End Date</label>
                <input type="date" id="issueEndDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input w-full" min={startDate} max={getTodayDateString()}/>
              </div>
              <div className="lg:pt-6">
                <button type="submit" className="btn btn-primary w-full flex items-center justify-center group" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />}
                  {isLoading ? 'Fetching...' : 'Fetch Issues'}
                </button>
              </div>
            </div>
          </form>
        </div>

      {isLoading && ( /* ... Loading spinner ... */ 
        <div className="flex flex-col justify-center items-center py-12 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <p className="text-gray-600 font-medium">Loading Issues...</p>
        </div>
      )}

      {error && !isLoading && ( /* ... Error display ... */ 
        <div className="my-4 flex items-start rounded-lg border-l-4 border-red-500 bg-red-100 p-4 text-red-700 shadow-md">
            <AlertCircle className="mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
            <div><p className="font-semibold">Error</p><p className="text-sm">{error}</p></div>
        </div>
      )}

      {!isLoading && !error && hasFetched && issuesData && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Found {issuesData.total_issues} Issue(s) for <span className="font-medium text-indigo-700">{issuesData.repository}</span>
            </h2>
            <p className="text-sm text-gray-600">
              Period: {issuesData.time_period} | State Filter: {issuesData.state_filter}
            </p>
          </div>
          {issuesData.issues.length > 0 ? (
            <ul className="divide-y divide-gray-200 max-h-[calc(100vh-32rem)] overflow-y-auto p-2 sm:p-4">
              {issuesData.issues.map((issue) => (
                <CollapsibleIssue 
                  key={issue.id} 
                  issue={issue}
                  repoOwner={repoOwner} // Pass current repoOwner
                  repoName={repoName}   // Pass current repoName
                  onGenerateSolution={handleGenerateSolutionForIssue}
                  solutionData={solutionResults[issue.number]}
                  isGeneratingSolution={generatingSolutionFor === issue.number}
                  solutionError={solutionErrors[issue.number]}
                />
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Info className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              No issues found matching your criteria.
            </div>
          )}
        </div>
      )}
      
      {!isLoading && !error && hasFetched && !issuesData && (
         <div className="my-4 text-center text-gray-500 py-12 bg-white rounded-xl shadow-lg">
            <Info className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium">No Data Available</p>
            <p className="text-sm">Please fetch issues to see results, or check if there was an error in a previous attempt.</p>
        </div>
      )}
    </div>
  );
}