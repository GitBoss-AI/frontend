// src/app/(dashboard)/chat/repository-issues/page.tsx
"use client";

import React, { useState, useCallback, FormEvent, useEffect } from 'react';
import { getRepositoryIssues, IssueItemAPI, RepoIssuesResponseAPI } from '@/utils/api';
import { ListChecks, AlertCircle, Search, Loader2, CalendarDays, Filter, ChevronDown, ChevronUp, ExternalLink, User, Tag, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown'; // <--- IMPORT THIS


const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getPastDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

interface CollapsibleIssueProps {
    issue: IssueItemAPI;
  }
  
  const CollapsibleIssue: React.FC<CollapsibleIssueProps> = ({ issue }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <li className="py-4 px-2 hover:bg-gray-50/70 transition-colors duration-150 ease-in-out rounded-md border border-gray-200 shadow-sm"> {/* Added border and shadow */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full text-left focus:outline-none group" // Added group for potential hover effects on icon
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
        </div>
  
        {isOpen && (
          <div className="mt-3 ml-7 pl-4 pt-3 border-l-2 border-indigo-100 space-y-4"> {/* Increased padding and spacing */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Description:</h4>
              <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap border border-gray-200"> {/* Added border to description box */}
                {issue.body ? (
                  <ReactMarkdown>{issue.body}</ReactMarkdown> // <--- USE ReactMarkdown HERE
                ) : (
                  <span className="italic">No description provided.</span>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <User className="w-4 h-4 mr-1.5 text-gray-500" /> Author:
              </h4>
              <div className="flex items-center space-x-2 text-sm">
                <Image src={issue.user.avatar_url} alt={issue.user.login} width={24} height={24} className="rounded-full shadow-sm" /> {/* Added shadow */}
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
                    <span 
                      key={label.name} 
                      className="px-2 py-0.5 text-xs rounded-full border" 
                      // A simple heuristic for contrasting text color, might need a proper library for accessibility
                      style={{ 
                        backgroundColor: `#${label.color}33`, // Lighter background with some opacity
                        borderColor: `#${label.color}`, 
                        color: `#${label.color}` // Darken the text color or use a contrast checker
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500 pt-2">
              <p><strong>ID:</strong> {issue.id}</p>
              <p><strong>Last Updated:</strong> {new Date(issue.updated_at).toLocaleString()}</p>
            </div>
          </div>
        )}
      </li>
    );
  };
  
  
  export default function RepositoryIssuesPage() {
    const [repoOwner, setRepoOwner] = useState<string>("alpsencer"); // Default for easier testing
    const [repoName, setRepoName] = useState<string>("infrastack");  // Default for easier testing
    const [startDate, setStartDate] = useState<string>(getPastDateString(30));
    const [endDate, setEndDate] = useState<string>(getTodayDateString());
    const [issueStateFilter, setIssueStateFilter] = useState<string>("all");
  
    const [issuesData, setIssuesData] = useState<RepoIssuesResponseAPI | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
  
    const fetchIssues = useCallback(async () => {
      if (!repoOwner.trim() || !repoName.trim()) {
        setError("Repository owner and name are required.");
        setHasFetched(true); // Mark as fetched even if input error
        setIssuesData(null); // Clear any previous data
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
      setIssuesData(null);
      setHasFetched(true);
  
      try {
        const result = await getRepositoryIssues(
          repoOwner.trim(),
          repoName.trim(),
          startDate,
          endDate,
          issueStateFilter
        );
        
        if (result.error) {
          setError(`${result.error}${result.details ? ` (Details: ${result.details})` : ''}${result.status_code ? ` (Status: ${result.status_code})` : ''}`);
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
  
    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      fetchIssues();
    };
    
    // Optional: Fetch on mount with default values
    // useEffect(() => {
    //   fetchIssues();
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);
  
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-100 min-h-screen">
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
              <ul className="divide-y divide-gray-200 max-h-[calc(100vh-32rem)] overflow-y-auto p-2 sm:p-4 space-y-1"> {/* Adjusted max-height and padding */}
                {issuesData.issues.map((issue) => (
                  <CollapsibleIssue key={issue.id} issue={issue} />
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
              <p className="text-lg font-medium">No Data Fetched</p>
              <p className="text-sm">Enter repository details and click "Fetch Issues" to load data, or an error might have occurred.</p>
          </div>
        )}
      </div>
    );
  }

// Ensure your Tailwind CSS setup (`globals.css` or `tailwind.config.js`)
// effectively provides styles for classes like `input`, `btn`, `btn-primary`, `prose`, etc.
// For example, in your globals.css or equivalent:
// .input { @apply block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 transition-colors; }
// .btn { @apply inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 cursor-pointer; }
// .btn-primary { @apply bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400; }