const AGENT_API_BASE = "http://localhost:8003"; // Example: Use env var or default


// Repository endpoints
export interface RepoStatMetric {
  metric: string;
  count: number;
  change: string; // e.g. "+12.5%"
}

export interface RepoStatsResponse {
  commits: RepoStatMetric;
  prs: RepoStatMetric;
  issues: RepoStatMetric;
  reviews: RepoStatMetric;
}

export interface QualityMetricsResponse {
  build_success_rate: number;
  build_success_note: string;
  deployment_frequency: number;
  deployment_count: number;
}

export async function getRepoStats(
  owner: string,
  repo: string,
  range: "week" | "month" | "quarter" = "month"
): Promise<RepoStatsResponse> {
  const url = new URL(`${AGENT_API_BASE}/repo/stats`);
  url.searchParams.append("owner", owner);
  url.searchParams.append("repo", repo);
  url.searchParams.append("range", range);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      throw new Error(errorData.detail || `Request failed: ${response.statusText}`);
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  return await response.json();
}

export interface ContributorStats {
  username: string;
  commits: number;
  prs: number;
  reviews: number;
}

export async function getTopContributorStats(
  owner: string,
  repo: string,
  range: "week" | "month" | "quarter"
): Promise<ContributorStats[]> {
  const url = new URL(`${AGENT_API_BASE}/repo/contributor-stats`);
  url.searchParams.append("owner", owner);
  url.searchParams.append("repo", repo);
  url.searchParams.append("range", range);

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      throw new Error(errorData.detail || `Request failed: ${response.statusText}`);
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data.contributors;
}

export interface TimelineEntry {
  label: string;
  commits: number;
  prs: number;
  reviews: number;
}

export async function getTeamActivityTimeline(
  owner: string,
  repo: string,
  range: "week" | "month" | "quarter"
): Promise<TimelineEntry[]> {
  const url = new URL(`${AGENT_API_BASE}/repo/team-activity`);
  url.searchParams.append("owner", owner);
  url.searchParams.append("repo", repo);
  url.searchParams.append("time_range", range);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch team activity timeline");
  }

  const data = await response.json();
  return data.timeline;
}

export interface RecentActivityItem {
  url: string;
  type: "commit" | "pr" | "review";
  username: string;
  message: string;
  timestamp: string;
}

export async function getRecentActivity(
  owner: string,
  repo: string
): Promise<RecentActivityItem[]> {
  const url = new URL(`${AGENT_API_BASE}/repo/recent-activity`);
  url.searchParams.append("owner", owner);
  url.searchParams.append("repo", repo);

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recent activity");
  }

  const data = await response.json();
  return data.activity.slice(0, 5); // Only return last 5
}


export interface PRAnalysisResponse {
  prSummary: string;
  contributionAnalysis: string;
  linkedIssuesSummary?: string | null;
  discussionSummary: string;
}

export interface BuildInfo {
  id: number;
  status: "success" | "failure" | string;
  duration_seconds: number;
  started_at: string;
  commit_sha: string;
  build_url: string;
  triggered_by: string;
}

export async function getRecentBuilds(
  owner: string,
  repo: string,
  range: "week" | "month" | "quarter"
): Promise<BuildInfo[]> {
  const url = new URL(`${AGENT_API_BASE}/repo/builds`);
  url.searchParams.append("owner", owner);
  url.searchParams.append("repo", repo);
  url.searchParams.append("range", range);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch recent builds");
  return res.json();
}

export async function analyzePullRequest(
  prNumber: number,
  repoOwner: string,
  repoName: string
): Promise<PRAnalysisResponse> { // Add return type

  const url = new URL(`${AGENT_API_BASE}/analyze-pr/`);
  url.searchParams.append('pr_number', String(prNumber));
  url.searchParams.append('repo_owner', repoOwner);
  url.searchParams.append('repo_name', repoName);

  const response = await fetch(url.toString(), {
    method: 'GET', // Or POST if you change the backend endpoint
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // Handle cases where error response is not JSON
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    // Use detail field from FastAPI's HTTPException if available
    throw new Error(errorData.detail || `API request failed with status ${response.status}`);
  }

  const data: PRAnalysisResponse = await response.json();
  return data;
}

export interface PRListItemAPI {
  number: number;
  title: string;
  state: string;
  url: string;
  created_at: string; // Dates from API will be ISO strings
}

export interface PRListItemAPI {
  number: number;
  title: string;
  state: string;
  url: string;
  created_at: string; // Dates from API will be ISO strings
}


// --- Interfaces for Contributor Activity (matching Pydantic models in app.py) ---

export interface CommitInfoAPI {
  sha: string;
  message: string;
  html_url: string;
  date: string; // datetime from Python will be string in JSON
  additions?: number | null;
  deletions?: number | null;
  changed_files?: string[] | null;
}

// PRInfoAPI can reuse PRListItemAPI if the structure for authored PRs is the same,
// or be more specific if needed (e.g., including description).
// For consistency with the backend model, let's define it as potentially having more details.
export interface PRInfoAPI {
    number: number;
    title: string;
    description?: string | null;
    state: string;
    html_url: string;
    created_at: string; // datetime
    closed_at?: string | null; // datetime
    merged_at?: string | null; // datetime
}


export interface PRActivityDetailAPI {
  type: string; // "review" or "review_comment"
  state?: string | null; // For reviews: APPROVED, CHANGES_REQUESTED, COMMENTED
  body?: string | null;
  submitted_at?: string | null; // datetime
  created_at?: string | null;   // datetime
  html_url: string;
  path?: string | null;
  line?: number | null;
}

export interface PRWithReviewActivityAPI {
  pr_number: number;
  pr_title: string;
  pr_html_url: string;
  pr_description?: string | null;
  activities: PRActivityDetailAPI[];
}

export interface GeneralPRCommentAPI {
  body: string;
  created_at: string; // datetime
  html_url: string;
}

export interface PRWithGeneralCommentsAPI {
  pr_number: number;
  pr_title: string;
  pr_html_url: string;
  pr_description?: string | null;
  comments: GeneralPRCommentAPI[];
}

export interface IssueInfoAPI {
  number: number;
  title: string;
  description?: string | null;
  state: string;
  html_url: string;
  created_at: string; // datetime
  closed_at?: string | null; // datetime
  updated_at?: string | null; // datetime (added for assigned issues)
}

export interface ContributorActivityResponseAPI {
  total_commits: number;
  commits: CommitInfoAPI[];
  total_lines_changed: number;
  unique_files_changed_in_commits: string[];
  authored_prs: PRInfoAPI[];      // Using the more detailed PRInfoAPI
  assigned_prs?: PRInfoAPI[];     // Added for assigned PRs
  reviews_and_review_comments: PRWithReviewActivityAPI[];
  general_pr_comments: PRWithGeneralCommentsAPI[];
  created_issues: IssueInfoAPI[];
  assigned_issues?: IssueInfoAPI[]; // Added for assigned Issues
  closed_issues_by_user: IssueInfoAPI[];
}

export interface IssueUserAPI {
  login: string;
  id: number;
  html_url: string;
  avatar_url: string;
}

export interface IssueLabelAPI {
  name: string;
  color: string;
}

export interface IssueItemAPI {
  id: number;
  number: number;
  title: string;
  body?: string | null;
  state: string;
  created_at: string; // datetime string
  updated_at: string; // datetime string
  closed_at?: string | null; // datetime string
  html_url: string;
  user: IssueUserAPI;
  labels: IssueLabelAPI[];
}

export interface RepoIssuesResponseAPI {
  repository: string;
  time_period: string;
  state_filter: string;
  total_issues: number;
  issues: IssueItemAPI[];
  error?: string | null; // To catch errors returned from the backend
  status_code?: number | null;
  details?: string | null;
}


export async function getRepositoryPRs(
  repoOwner: string,
  repoName: string,
  startDate?: string, // Optional YYYY-MM-DD
  endDate?: string,   // Optional YYYY-MM-DD
  state: string = "all" // Add state parameter
): Promise<PRListItemAPI[]> {

  const url = new URL(`${AGENT_API_BASE}/repository-prs/`);
  url.searchParams.append('repo_owner', repoOwner);
  url.searchParams.append('repo_name', repoName);
  if (startDate) {
    url.searchParams.append('start_date', startDate);
  }
  if (endDate) {
    url.searchParams.append('end_date', endDate);
  }
  url.searchParams.append('state', state);


  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    throw new Error(errorData.detail || `API request failed with status ${response.status}`);
  }

  const data: PRListItemAPI[] = await response.json();
  return data;
}


export interface ContributorListItemAPI {
  username: string;
  contributions: number;
  avatar_url?: string | null; // Optional, as per Pydantic model
  profile_url: string;
}

// --- Function to call the /repository-contributors/ endpoint ---
export async function getRepositoryContributors(
  repoOwner: string,
  repoName: string
): Promise<ContributorListItemAPI[]> {

  const url = new URL(`${AGENT_API_BASE}/repository-contributors/`);
  url.searchParams.append('repo_owner', repoOwner);
  url.searchParams.append('repo_name', repoName);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText || 'Failed to fetch'}`);
    }
    throw new Error(errorData.detail || `API request failed with status ${response.status}`);
  }

  const data: ContributorListItemAPI[] = await response.json();
  return data;
}


// --- Function to call the /contributor-activity/ endpoint ---
export async function getContributorActivity(
  repoOwner: string,
  repoName: string,
  username: string,
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): Promise<ContributorActivityResponseAPI> {

  const url = new URL(`${AGENT_API_BASE}/contributor-activity/`);
  url.searchParams.append('repo_owner', repoOwner);
  url.searchParams.append('repo_name', repoName);
  url.searchParams.append('username', username);
  url.searchParams.append('start_date', startDate);
  url.searchParams.append('end_date', endDate);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}: ${response.statusText || 'Failed to fetch'}` }));
    throw new Error(errorData.detail || `API request failed with status ${response.status}`);
  }
  return response.json();
}




export async function getRepositoryIssues(
  repoOwner: string,
  repoName: string,
  startDate: string, // YYYY-MM-DD
  endDate: string,   // YYYY-MM-DD
  state: string = "all"
): Promise<RepoIssuesResponseAPI> {
  const url = new URL(`${AGENT_API_BASE}/repository-issues/`);
  url.searchParams.append('repo_owner', repoOwner);
  url.searchParams.append('repo_name', repoName);
  url.searchParams.append('start_date', startDate);
  url.searchParams.append('end_date', endDate);
  url.searchParams.append('state', state);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      // Add Authorization header if your endpoint is protected
      // 'Authorization': `Bearer ${your_auth_token_logic_here}`
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText || 'Failed to fetch issues'}`);
    }
    // If the backend returns a structured error in the RepoIssuesResponseAPI format
    if (errorData && errorData.error) {
        // You might want to throw an error or return the errorData directly
        // For simplicity, let's assume the component will check the 'error' field.
        // If you want to always throw, use: throw new Error(errorData.detail || errorData.error || `API request failed with status ${response.status}`);
        return errorData as RepoIssuesResponseAPI; // Ensure this matches the expected error structure
    }
    throw new Error(errorData.detail || `API request failed with status ${response.status}`);
  }

  const data: RepoIssuesResponseAPI = await response.json();
  // If the successful response might still contain an error field (as per Pydantic model)
  if (data.error) {
      // Handle this scenario, e.g., by throwing or logging
      console.warn(`Workspaceed issues for ${repoOwner}/${repoName} but API reported an error: ${data.error}`);
  }
  return data;
}