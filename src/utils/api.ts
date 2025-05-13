import {getToken} from './auth'


const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://gitboss-ai.emirbosnak.com/api-dev";

const AGENT_API_BASE = process.env.NEXT_PUBLIC_AGENT_API_BASE || "http://localhost:8003"; // Example: Use env var or default


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

export async function getRepoMonthlyStats(
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
  const url = new URL(`${AGENT_API_BASE}/repo/contributors/stats`);
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
  linkedIssuesSummary?: string | null; // Match Optional[str]
}

export async function analyzePullRequest(
  prNumber: number,
  repoOwner: string,
  repoName: string
): Promise<PRAnalysisResponse> { // Add return type
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const url = new URL(`${AGENT_API_BASE}/analyze-pr/`);
  url.searchParams.append('pr_number', String(prNumber));
  url.searchParams.append('repo_owner', repoOwner);
  url.searchParams.append('repo_name', repoName);

  const response = await fetch(url.toString(), {
    method: 'GET', // Or POST if you change the backend endpoint
    headers: {
      'Authorization': `Bearer ${token}`, // Add the JWT token
      'Accept': 'application/json',
    },
    // If using POST, add body: JSON.stringify({ pr_number: ..., ... })
    // and 'Content-Type': 'application/json' header
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

export async function getRepositoryPRs(
  repoOwner: string,
  repoName: string,
  startDate?: string, // Optional YYYY-MM-DD
  endDate?: string,   // Optional YYYY-MM-DD
  state: string = "all" // Add state parameter
): Promise<PRListItemAPI[]> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found.");
  }

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
      'Authorization': `Bearer ${token}`,
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
