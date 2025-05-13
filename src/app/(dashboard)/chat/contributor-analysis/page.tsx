"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getContributorActivity, ContributorActivityResponseAPI } from '@/utils/api';
import { 
  ArrowLeft, Calendar, User, Github, Loader2, BarChart3, FileSearch, AlertCircle,
  ChevronDown, ChevronUp, FileCode, MessageSquare, Clock, GitPullRequest, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Helper date functions
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getPastDateString = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Collapsible Section component for toggling content visibility
interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  count?: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  defaultOpen = false, 
  count, 
  icon, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <button 
        className="w-full bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title} {count !== undefined && <span className="ml-1.5">({count})</span>}
        </h3>
        <span>
          {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
        </span>
      </button>
      {isOpen && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default function ContributorAnalysisPage() {
  const searchParams = useSearchParams();
  
  // Get query parameters
  const username = searchParams.get('username') || '';
  const owner = searchParams.get('owner') || '';
  const repo = searchParams.get('repo') || '';
  
  // Time range state
  const [startDate, setStartDate] = useState<string>(getPastDateString(30));
  const [endDate, setEndDate] = useState<string>(getTodayDateString());
  
  // Analysis state
  const [activityData, setActivityData] = useState<ContributorActivityResponseAPI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  // Fetch contributor activity data
  const fetchContributorActivity = useCallback(async () => {
    if (!username || !owner || !repo) {
      setError("Missing required parameters: username, owner, or repo");
      return;
    }
    
    if (!startDate || !endDate) {
      setError("Start and end dates are required for analysis");
      return;
    }
    
    if (startDate > endDate) {
      setError("Start date cannot be after end date");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getContributorActivity(owner, repo, username, startDate, endDate);
      setActivityData(data);
      setHasFetched(true);
    } catch (err: any) {
      setError(err.message || "Failed to fetch contributor activity");
    } finally {
      setIsLoading(false);
    }
  }, [username, owner, repo, startDate, endDate]);
  
  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContributorActivity();
  };
  
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-300">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
          <User className="w-8 h-8 mr-3 text-indigo-600" />
          Contributor Analysis
        </h1>
        <Link
          href={`/chat/repository-contributors?owner=${owner}&repo=${repo}`}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Contributors
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
              <Github className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{username}</h2>
              <p className="text-gray-600">{owner}/{repo}</p>
              <a 
                href={`https://github.com/${username}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center mt-1"
              >
                View on GitHub <FileSearch className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
          
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div>
              <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" /> Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input text-sm p-1.5 w-full sm:w-auto"
                max={endDate}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" /> End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input text-sm p-1.5 w-full sm:w-auto"
                min={startDate}
                max={getTodayDateString()}
              />
            </div>
            <div className="self-end">
              <button
                type="submit"
                className="btn btn-primary py-1.5 px-4 w-full sm:w-auto flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Loading...' : 'Analyze Activity'}
              </button>
            </div>
          </form>
        </div>
        
        {error && !isLoading && (
          <div className="my-4 flex items-start rounded-lg border-l-4 border-red-500 bg-red-100 p-4 text-red-700">
            <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {!username || !owner || !repo ? (
          <div className="text-center py-8">
            <User className="w-16 h-16 mx-auto text-gray-300 mb-2" />
            <p className="text-lg font-medium text-gray-600">Missing Required Information</p>
            <p className="text-sm text-gray-500">Please go back and select a contributor to analyze.</p>
          </div>
        ) : !hasFetched && !isLoading && !error ? (
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-2" />
            <p className="text-lg font-medium text-gray-600">Ready to Analyze</p>
            <p className="text-sm text-gray-500">Select a date range and click "Analyze Activity" to see contributor statistics.</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col justify-center items-center py-12 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <p className="text-gray-600 font-medium">Analyzing contribution data...</p>
            <p className="text-sm text-gray-500">This may take a moment</p>
          </div>
        ) : activityData ? (
          <div className="mt-6">
            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Commits</div>
                <div className="text-2xl font-bold text-indigo-600">{activityData.total_commits}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Pull Requests</div>
                <div className="text-2xl font-bold text-indigo-600">{activityData.authored_prs.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Files Changed</div>
                <div className="text-2xl font-bold text-indigo-600">{activityData.unique_files_changed_in_commits.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Lines Changed</div>
                <div className="text-2xl font-bold text-indigo-600">{activityData.total_lines_changed}</div>
              </div>
            </div>
            
            {/* Commits Section */}
            <CollapsibleSection 
              title="Commits" 
              count={activityData.total_commits}
              icon={<Clock className="h-5 w-5 text-indigo-500" />} 
              defaultOpen={true}
            >
              {activityData.commits.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {activityData.commits.map((commit) => (
                    <div key={commit.sha} className="py-3">
                      <a href={commit.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-words">
                        {commit.message.split('\n')[0]}
                      </a>
                      <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                        <span>{new Date(commit.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        {commit.additions !== null && commit.deletions !== null && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded">
                            <span className="text-green-600">+{commit.additions}</span>/
                            <span className="text-red-600">-{commit.deletions}</span>
                          </span>
                        )}
                        {commit.changed_files && commit.changed_files.length > 0 && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-indigo-500 hover:text-indigo-700">
                              {commit.changed_files.length} file(s) changed
                            </summary>
                            <ul className="mt-1 pl-4 list-disc">
                              {commit.changed_files.map((file, idx) => (
                                <li key={idx} className="text-gray-600 text-xs truncate max-w-md" title={file}>
                                  {file}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No commits in this time period</p>
              )}
            </CollapsibleSection>
            
            {/* Pull Requests Section */}
            <CollapsibleSection 
              title="Pull Requests" 
              count={activityData.authored_prs.length}
              icon={<GitPullRequest className="h-5 w-5 text-indigo-500" />}
            >
              {activityData.authored_prs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {activityData.authored_prs.map((pr) => (
                    <div key={pr.number} className="py-3">
                      <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                        #{pr.number}: {pr.title}
                      </a>
                      <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 gap-2">
                        <span className={`px-2 py-0.5 rounded-full ${
                          pr.state === 'open' ? 'bg-green-100 text-green-800' :
                          pr.state === 'closed' && !pr.merged_at ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {pr.state === 'closed' && pr.merged_at ? 'merged' : pr.state}
                        </span>
                        <span>
                          Created: {new Date(pr.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                        {pr.merged_at && (
                          <span>
                            Merged: {new Date(pr.merged_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </span>
                        )}
                        {pr.closed_at && !pr.merged_at && (
                          <span>
                            Closed: {new Date(pr.closed_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                      {pr.description && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-indigo-500 hover:text-indigo-700">
                            View Description
                          </summary>
                          <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-line">
                            {pr.description}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No pull requests in this time period</p>
              )}
            </CollapsibleSection>
            
            {/* Issues Section */}
            <CollapsibleSection 
              title="Issues" 
              count={(activityData.created_issues.length + (activityData.assigned_issues?.length || 0))}
              icon={<AlertCircle className="h-5 w-5 text-indigo-500" />}
            >
              {activityData.created_issues.length > 0 || (activityData.assigned_issues?.length || 0) > 0 ? (
                <div>
                  {activityData.created_issues.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-md text-gray-700 mb-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                        Created Issues ({activityData.created_issues.length})
                      </h4>
                      <div className="divide-y divide-gray-200">
                        {activityData.created_issues.map((issue) => (
                          <div key={issue.number} className="py-2">
                            <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              #{issue.number}: {issue.title}
                            </a>
                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full ${
                                issue.state === 'open' ? 'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {issue.state}
                              </span>
                              <span>
                                Created: {new Date(issue.created_at).toLocaleDateString()}
                              </span>
                              {issue.closed_at && (
                                <span>
                                  Closed: {new Date(issue.closed_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {issue.description && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-xs text-indigo-500 hover:text-indigo-700">
                                  View Description
                                </summary>
                                <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-line">
                                  {issue.description}
                                </div>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(activityData.assigned_issues?.length || 0) > 0 && (
                    <div>
                      <h4 className="font-medium text-md text-gray-700 mb-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                        Assigned Issues ({activityData.assigned_issues?.length})
                      </h4>
                      <div className="divide-y divide-gray-200">
                        {activityData.assigned_issues?.map((issue) => (
                          <div key={issue.number} className="py-2">
                            <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              #{issue.number}: {issue.title}
                            </a>
                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full ${
                                issue.state === 'open' ? 'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {issue.state}
                              </span>
                              <span>
                                Updated: {new Date(issue.updated_at || issue.created_at).toLocaleDateString()}
                              </span>
                              {issue.closed_at && (
                                <span>
                                  Closed: {new Date(issue.closed_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {issue.description && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-xs text-indigo-500 hover:text-indigo-700">
                                  View Description
                                </summary>
                                <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-line">
                                  {issue.description}
                                </div>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">No issues in this time period</p>
              )}
            </CollapsibleSection>
            
            {/* PR Reviews Section */}
            <CollapsibleSection 
              title="Reviews & Comments" 
              count={activityData.reviews_and_review_comments.length + activityData.general_pr_comments.length}
              icon={<MessageSquare className="h-5 w-5 text-indigo-500" />}
            >
              {activityData.reviews_and_review_comments.length > 0 || activityData.general_pr_comments.length > 0 ? (
                <>
                  {/* PR Reviews */}
                  {activityData.reviews_and_review_comments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-md text-gray-700 mb-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                        PR Reviews ({activityData.reviews_and_review_comments.length})
                      </h4>
                      <div className="divide-y divide-gray-200">
                        {activityData.reviews_and_review_comments.map((review, idx) => (
                          <div key={`${review.pr_number}-${idx}`} className="py-2">
                            <a href={review.pr_html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              #{review.pr_number}: {review.pr_title}
                            </a>
                            <div className="ml-4 mt-2">
                              {review.activities.map((activity, actIdx) => (
                                <div key={actIdx} className="mb-2 bg-gray-50 p-2 rounded border border-gray-100">
                                  <div className="flex items-center text-xs text-gray-600 mb-1">
                                    <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                                    {activity.state && (
                                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                        activity.state === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                        activity.state === 'CHANGES_REQUESTED' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {activity.state.replace('_', ' ')}
                                      </span>
                                    )}
                                    <span className="ml-auto">
                                      {new Date(activity.submitted_at || activity.created_at || '').toLocaleString()}
                                    </span>
                                  </div>
                                  {activity.path && activity.line && (
                                    <div className="text-xs text-gray-500 mb-1">
                                      File: <code className="bg-gray-100 px-1 py-0.5 rounded">{activity.path}</code> (Line: {activity.line})
                                    </div>
                                  )}
                                  {activity.body && (
                                    <div className="text-sm text-gray-700 whitespace-pre-line">
                                      {activity.body}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* General PR Comments */}
                  {activityData.general_pr_comments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-md text-gray-700 mb-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                        PR Comments ({activityData.general_pr_comments.length})
                      </h4>
                      <div className="divide-y divide-gray-200">
                        {activityData.general_pr_comments.map((comment, idx) => (
                          <div key={`${comment.pr_number}-${idx}`} className="py-2">
                            <a href={comment.pr_html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              #{comment.pr_number}: {comment.pr_title}
                            </a>
                            <div className="ml-4 mt-2">
                              {comment.comments.map((cmt, cmtIdx) => (
                                <div key={cmtIdx} className="mb-2 bg-gray-50 p-2 rounded border border-gray-100">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Comment</span>
                                    <span>
                                      {new Date(cmt.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-line">
                                    {cmt.body}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">No reviews or comments in this time period</p>
              )}
            </CollapsibleSection>
            
            {/* Files Changed Section */}
            <CollapsibleSection 
              title="Files Changed" 
              count={activityData.unique_files_changed_in_commits.length}
              icon={<FileCode className="h-5 w-5 text-indigo-500" />}
            >
              {activityData.unique_files_changed_in_commits.length > 0 ? (
                <div className="mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activityData.unique_files_changed_in_commits.map((file, idx) => (
                      <div 
                        key={idx} 
                        className="text-sm bg-gray-50 p-2 rounded border border-gray-100 truncate"
                        title={file}
                      >
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No files changed in this time period</p>
              )}
            </CollapsibleSection>
          </div>
        ) : null}
      </div>
    </div>
  );
} 