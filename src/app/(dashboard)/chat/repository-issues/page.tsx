// src/app/(dashboard)/chat/repository-issues/page.tsx
"use client";

import React, { useState, useCallback, FormEvent, useEffect } from 'react';
import { 
    getRepositoryIssues, IssueItemAPI, RepoIssuesResponseAPI,
    generateIssueSolution, GenerateIssueSolutionRequestAPI, IssueSolutionOverallResponseAPI, StepResponseAPI 
} from '@/utils/api';
import { 
    ListChecks, AlertCircle, Search, Loader2, CalendarDays, Filter, ChevronDown, ChevronUp, 
    ExternalLink, User, Tag, Info, Code, Zap, RotateCcw,
    CheckCircle, XCircle, MinusCircle, Settings2 // Icons for step status
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { getItem, setItem, removeItem } from '@/utils/storage'; // Import storage utilities

const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getPastDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Define a key for localStorage
const ISSUES_PAGE_STORAGE_KEY = 'repositoryIssuesPageState';

// Interface for the state we'll store in localStorage
interface StoredIssuesPageState {
  repoOwner: string;
  repoName: string;
  startDate: string;
  endDate: string;
  issueStateFilter: string;
  issuesData?: RepoIssuesResponseAPI | null; // Optional, as it might not always be fetched
  solutionResults?: { [issueNumber: number]: IssueSolutionOverallResponseAPI | null };
}

interface StepDetailDisplayProps {
    step: StepResponseAPI;
}

const StepDetailDisplay: React.FC<StepDetailDisplayProps> = ({ step }) => {
    const [isDataOpen, setIsDataOpen] = useState(false);
    let statusIcon;
    let statusColorClass;

    switch (step.status) {
        case "success":
            statusIcon = <CheckCircle className="w-5 h-5 text-green-500" />;
            statusColorClass = "text-green-700 bg-green-50 border-green-200";
            break;
        case "error":
            statusIcon = <XCircle className="w-5 h-5 text-red-500" />;
            statusColorClass = "text-red-700 bg-red-50 border-red-300";
            break;
        case "skipped":
            statusIcon = <MinusCircle className="w-5 h-5 text-gray-500" />;
            statusColorClass = "text-gray-700 bg-gray-50 border-gray-200";
            break;
        default:
            statusIcon = <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />; // For in-progress if you add that state
            statusColorClass = "text-blue-700 bg-blue-50 border-blue-200";
    }

    const hasData = step.data && (typeof step.data === 'object' ? Object.keys(step.data).length > 0 : typeof step.data === 'string' && step.data.trim() !== '');

    return (
        <div className={`p-3 my-2 rounded-lg border ${statusColorClass} shadow-sm`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {statusIcon}
                    <span className="ml-2 font-medium text-sm">{step.step_name}</span>
                </div>
                {step.duration_ms && (
                    <span className="text-xs text-gray-500">{step.duration_ms.toFixed(0)}ms</span>
                )}
            </div>
            {step.error_message && (
                <p className="mt-1 text-xs text-red-600 pl-7">{step.error_message}</p>
            )}
            {step.status === "skipped" && step.data && typeof step.data === 'string' && (
                 <p className="mt-1 text-xs text-gray-600 pl-7">{step.data}</p>
            )}
            {hasData && step.status !== "skipped" && (
                 <div className="mt-2 pl-7">
                    <button onClick={() => setIsDataOpen(!isDataOpen)} className="text-xs text-indigo-600 hover:underline flex items-center">
                        {isDataOpen ? <ChevronUp className="w-3 h-3 mr-1"/> : <ChevronDown className="w-3 h-3 mr-1"/>}
                        {isDataOpen ? 'Hide Details' : 'Show Details'}
                    </button>
                    {isDataOpen && (
                        <pre className="mt-1 bg-gray-800 text-white p-2.5 rounded-md text-xs overflow-x-auto max-h-60">
                            <code>{JSON.stringify(step.data, null, 2)}</code>
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
};


interface CollapsibleIssueProps {
  issue: IssueItemAPI;
  repoOwner: string;
  repoName: string;
  onGenerateSolution: (issue: IssueItemAPI) => void;
  solutionData?: IssueSolutionOverallResponseAPI | null;
  isGeneratingSolution?: boolean;
  solutionError?: string | null;
}

const CollapsibleIssue: React.FC<CollapsibleIssueProps> = ({ 
    issue, 
    repoOwner,
    repoName,
    onGenerateSolution,
    solutionData,
    isGeneratingSolution,
    solutionError
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  // showSolution will now primarily be controlled by whether we have data/error or are loading for THIS issue
  const shouldShowSolutionSection = isGeneratingSolution || !!solutionData || !!solutionError;


  const handleToggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!isDetailsOpen) setIsDetailsOpen(true); // Open details if initiating solution
    onGenerateSolution(issue);
  };

  return (
    <li className="py-4 px-2 hover:bg-gray-50/70 transition-colors duration-150 ease-in-out rounded-lg border border-gray-200 shadow-sm mb-4"> {/* Increased mb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <button
            onClick={handleToggleDetails}
            className="w-full text-left focus:outline-none group"
          >
            <div className="flex items-center">
              {isDetailsOpen ? <ChevronUp className="w-5 h-5 mr-2 text-indigo-600 transition-transform duration-200" /> : <ChevronDown className="w-5 h-5 mr-2 text-indigo-500 group-hover:text-indigo-600 transition-transform duration-200" />}
              <span className="text-lg font-semibold text-indigo-700 group-hover:underline truncate" title={issue.title}> {/* Increased font size */}
                #{issue.number}: {issue.title}
              </span>
            </div>
          </button>
          <div className="mt-1.5 text-sm text-gray-500 ml-7 flex items-center flex-wrap gap-x-4 gap-y-1"> {/* Increased font size and gap */}
            <span>State: <span className={`px-2.5 py-1 inline-flex text-xs leading-tight font-semibold rounded-full ${issue.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {issue.state}
            </span></span>
            <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
            {issue.closed_at && <span>Closed: {new Date(issue.closed_at).toLocaleDateString()}</span>}
            <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline inline-flex items-center">
              View on GitHub <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>
        <button
            onClick={handleGenerateClick}
            className="btn btn-teal text-sm px-4 py-2 flex items-center group mt-3 sm:mt-0 ml-auto sm:ml-0 self-start sm:self-center" // Adjusted button style
            disabled={isGeneratingSolution}
            title="Generate potential code solution for this issue"
        >
            {isGeneratingSolution ? 
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 
                <Zap className="w-5 h-5 mr-2 group-hover:text-yellow-300 transition-colors" />
            }
            {isGeneratingSolution ? 'Generating...' : 'Solve Issue'}
        </button>
      </div>

      {isDetailsOpen && (
        <div className="mt-4 ml-7 pl-5 pt-4 border-l-2 border-indigo-200 space-y-5"> {/* Increased padding and spacing */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-1.5">Description:</h4> {/* Increased font size */}
            <div className="prose prose-base max-w-none text-gray-700 bg-gray-50 p-4 rounded-md whitespace-pre-wrap border border-gray-200 shadow-sm"> {/* Increased font size and padding */}
              {issue.body ? <ReactMarkdown>{issue.body}</ReactMarkdown> : <span className="italic">No description provided.</span>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-1 flex items-center">
                <User className="w-4 h-4 mr-1.5 text-gray-500" /> Author:
              </h4>
              <div className="flex items-center space-x-2 text-sm">
                <Image src={issue.user.avatar_url} alt={issue.user.login} width={28} height={28} className="rounded-full shadow-sm" /> {/* Increased size */}
                <a href={issue.user.html_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  {issue.user.login}
                </a>
              </div>
            </div>
    
            {issue.labels && issue.labels.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-1 flex items-center">
                  <Tag className="w-4 h-4 mr-1.5 text-gray-500" /> Labels:
                </h4>
                <div className="flex flex-wrap gap-2"> {/* Increased gap */}
                  {issue.labels.map(label => (
                    <span 
                      key={label.name} 
                      className="px-2.5 py-1 text-xs rounded-md border shadow-sm" // Slightly larger padding and shadow
                      style={{ 
                        backgroundColor: `#${label.color}20`, // Lighter background for better text contrast
                        borderColor: `#${label.color}80`, 
                        color: `#${label.color}` // Using a more saturated version of the label color for text could be an option if contrast is an issue
                        // Consider a utility function to determine if text should be light or dark based on label.color
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {shouldShowSolutionSection && (
        <div className="mt-5 ml-7 pl-5 pt-4 border-l-4 border-teal-400 bg-teal-50/30 rounded-r-lg shadow-md"> {/* More prominent border */}
            <h3 className="text-lg font-semibold text-teal-800 mb-3 flex items-center"> {/* Larger title */}
                <Settings2 className="w-6 h-6 mr-2" /> Workflow Progress & Solution
            </h3>
            {isGeneratingSolution && (
                <div className="flex items-center text-md text-gray-700 py-4"> {/* Larger text */}
                    <Loader2 className="w-6 h-6 mr-3 animate-spin text-teal-600" />
                    Generating solution, please wait... This might take a minute.
                </div>
            )}
            {solutionError && !isGeneratingSolution && (
                <div className="my-3 p-4 text-sm text-red-800 bg-red-100 border border-red-300 rounded-md shadow">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2"/>
                        <p className="font-semibold">Error Generating Solution:</p>
                    </div>
                    <p className="mt-1 pl-7">{solutionError}</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onGenerateSolution(issue); }}
                        className="btn btn-outline-primary text-xs mt-3 ml-7"
                    >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5"/> Retry
                    </button>
                </div>
            )}
            {solutionData && !isGeneratingSolution && !solutionError && (
                <div className="space-y-4 pb-3">
                    <p className="text-md text-teal-800">{solutionData.message}</p>
                    
                    {/* Workflow Steps Display */}
                    {solutionData.steps && solutionData.steps.length > 0 && (
                        <div>
                            <h4 className="text-md font-medium text-gray-700 mb-2">Processing Steps:</h4>
                            <div className="space-y-1">
                                {solutionData.steps.map((step, index) => (
                                   <StepDetailDisplay key={index} step={step} />
                                ))}
                            </div>
                        </div>
                    )}

                    {solutionData.final_diff ? (
                        <div>
                            <h4 className="text-md font-medium text-gray-700 mt-3 mb-1.5">Suggested Diff:</h4>
                            <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-x-auto max-h-[500px] shadow-inner"> {/* Larger padding, font, max-height */}
                                <code>{solutionData.final_diff}</code>
                            </pre>
                        </div>
                    ) : (
                        <p className="italic text-gray-600 mt-2">No diff was generated for this solution.</p>
                    )}
                </div>
            )}
        </div>
      )}
    </li>
  );
};
  
export default function RepositoryIssuesPage() {
  // Initialize state with defaults or empty values
  const [repoOwner, setRepoOwner] = useState<string>("alpsencer");
  const [repoName, setRepoName] = useState<string>("infrastack");
  const [startDate, setStartDate] = useState<string>(getPastDateString(30));
  const [endDate, setEndDate] = useState<string>(getTodayDateString());
  const [issueStateFilter, setIssueStateFilter] = useState<string>("all");
  const [issuesData, setIssuesData] = useState<RepoIssuesResponseAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [solutionResults, setSolutionResults] = useState<{ [issueNumber: number]: IssueSolutionOverallResponseAPI | null }>({});
  const [generatingSolutionFor, setGeneratingSolutionFor] = useState<number | null>(null);
  const [solutionErrors, setSolutionErrors] = useState<{ [issueNumber: number]: string | null }>({});

  // Effect to load state from localStorage on mount
  useEffect(() => {
    const storedStateString = getItem(ISSUES_PAGE_STORAGE_KEY);
    if (storedStateString) {
      try {
        const storedState: StoredIssuesPageState = JSON.parse(storedStateString);
        setRepoOwner(storedState.repoOwner || "alpsencer");
        setRepoName(storedState.repoName || "infrastack");
        setStartDate(storedState.startDate || getPastDateString(30));
        setEndDate(storedState.endDate || getTodayDateString());
        setIssueStateFilter(storedState.issueStateFilter || "all");
        if (storedState.issuesData) { // Only set if it was stored
            setIssuesData(storedState.issuesData);
            setHasFetched(true); // Assume if data exists, it was fetched
        }
        if (storedState.solutionResults) {
            setSolutionResults(storedState.solutionResults);
        }
      } catch (e) {
        console.error("Failed to parse stored issues page state:", e);
        removeItem(ISSUES_PAGE_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to save state to localStorage whenever relevant parts change
  useEffect(() => {
    const stateToStore: StoredIssuesPageState = {
      repoOwner,
      repoName,
      startDate,
      endDate,
      issueStateFilter,
      issuesData, // This will save the fetched issues
      solutionResults, // This will save solution results
    };
    setItem(ISSUES_PAGE_STORAGE_KEY, JSON.stringify(stateToStore));
  }, [repoOwner, repoName, startDate, endDate, issueStateFilter, issuesData, solutionResults]);

  const fetchIssues = useCallback(async () => {
    if (!repoOwner.trim() || !repoName.trim()) {
      setError("Repository owner and name are required.");
      setHasFetched(true); 
      setIssuesData(null); 
      return;
    }
    if (!startDate || !endDate) {
        setError("Start and End dates are required.");
        setHasFetched(true);
        setIssuesData(null);
        return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      setHasFetched(true);
      setIssuesData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIssuesData(null); // Clear previous data
    setHasFetched(true);

    try {
      const result = await getRepositoryIssues(
        repoOwner.trim(),
        repoName.trim(),
        startDate,
        endDate,
        issueStateFilter
      );
      
      if (result.error) { // Check for error field in the response
        setError(`${result.error}${result.details ? ` (${result.details})` : ''}${result.status_code ? ` (Status: ${result.status_code})` : ''}`);
        setIssuesData(null);
      } else {
        setIssuesData(result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch issues. Check if the backend API is running and accessible.");
      setIssuesData(null);
    } finally {
      setIsLoading(false);
    }
  }, [repoOwner, repoName, startDate, endDate, issueStateFilter]);

  const handleGenerateSolutionForIssue = async (issue: IssueItemAPI) => {
    setGeneratingSolutionFor(issue.number);
    setSolutionErrors(prev => ({ ...prev, [issue.number]: null })); // Clear previous error for this issue
    setSolutionResults(prev => ({ ...prev, [issue.number]: null })); // Clear previous result

    const requestPayload: GenerateIssueSolutionRequestAPI = {
      repo_owner: repoOwner, 
      repo_name: repoName,
      issue_number: issue.number,
      issue_title: issue.title,
      issue_description: issue.body || "No description provided for this issue.",
    };

    try {
      const result = await generateIssueSolution(requestPayload);
      setSolutionResults(prev => ({ ...prev, [issue.number]: result }));
      if (result.error) { // Check for top-level error in response
        setSolutionErrors(prev => ({ ...prev, [issue.number]: result.error || "An unknown error occurred during solution generation." }));
      } else if (result.steps.some(step => step.status === 'error')) { // Check for errors within steps
        const firstErrorStep = result.steps.find(step => step.status === 'error');
        setSolutionErrors(prev => ({ ...prev, [issue.number]: `Workflow failed at step: ${firstErrorStep?.step_name}. ${firstErrorStep?.error_message || ''}`.trim() }));
      }
    } catch (err: any) {
      setSolutionErrors(prev => ({ ...prev, [issue.number]: err.message || "Failed to generate solution due to a network or unexpected error." }));
    } finally {
      setGeneratingSolutionFor(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchIssues();
  };
  
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-300">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
            <Info className="w-8 h-8 mr-3 text-indigo-600" />
            Repository Issues & Automated Solutions
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

      {isLoading && ( 
        <div className="flex flex-col justify-center items-center py-12 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <p className="text-gray-600 font-medium">Loading Issues...</p>
        </div>
      )}

      {error && !isLoading && ( 
        <div className="my-4 flex items-start rounded-lg border-l-4 border-red-500 bg-red-100 p-4 text-red-700 shadow-md">
            <AlertCircle className="mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
            <div><p className="font-semibold">Error</p><p className="text-sm">{error}</p></div>
        </div>
      )}

      {!isLoading && !error && hasFetched && issuesData && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[60vh] flex flex-col">
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800"> {/* Increased font size */}
              Found {issuesData.total_issues} Issue(s) for <span className="font-medium text-indigo-700">{issuesData.repository}</span>
            </h2>
            <p className="text-sm text-gray-600">
              Period: {issuesData.time_period} | State Filter: {issuesData.state_filter}
            </p>
          </div>
          {issuesData.issues.length > 0 ? (
            <ul className="divide-y divide-gray-200 max-h-[calc(100vh-28rem)] overflow-y-auto p-4 sm:p-6 space-y-3 flex-grow"> {/* Increased padding, spacing and using flex-grow to fill container */}
              {issuesData.issues.map((issue) => (
                <CollapsibleIssue 
                  key={issue.id} 
                  issue={issue}
                  repoOwner={repoOwner}
                  repoName={repoName}
                  onGenerateSolution={handleGenerateSolutionForIssue}
                  solutionData={solutionResults[issue.number]}
                  isGeneratingSolution={generatingSolutionFor === issue.number}
                  solutionError={solutionErrors[issue.number]}
                />
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center text-gray-500 flex-grow flex flex-col items-center justify-center"> {/* Increased padding and using flex for better centering */}
              <Info className="w-20 h-20 mx-auto text-gray-400 mb-5" /> {/* Increased size */}
              <p className="text-xl font-medium">No issues found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
      
      {!isLoading && !error && hasFetched && !issuesData && (
         <div className="my-4 text-center text-gray-500 py-20 bg-white rounded-xl shadow-lg min-h-[50vh] flex flex-col items-center justify-center"> {/* Increased padding, min-height and using flex for better centering */}
            <Info className="w-24 h-24 mx-auto text-gray-400 mb-6" /> {/* Increased size further */}
            <p className="text-2xl font-medium">No Data Available</p> {/* Increased font size */}
            <p className="text-md mt-2">Please fetch issues to see results, or check if an error occurred.</p> {/* Increased font size */}
         </div>
      )}
    </div>
  );
}