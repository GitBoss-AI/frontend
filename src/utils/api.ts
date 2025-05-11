const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://gitboss-ai.emirbosnak.com/api-dev";

// Repository endpoints
export async function addRepository(userId: number, repoUrl: string) {
  const response = await fetch(`${API_BASE}/repo/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      repo_url: repoUrl,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add repository");
  }

  return response.json();
}

export async function getAllRepositories(userId: number) {
  const response = await fetch(`${API_BASE}/repo/getAll?user_id=${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch repositories");
  }

  return response.json();
}

export async function getRepositoryStats(
  repoUrl: string,
  timeWindow: string = "7d",
) {
  const response = await fetch(
    `${API_BASE}/repo/stats?repo_url=${encodeURIComponent(repoUrl)}&time_window=${timeWindow}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch repository stats");
  }

  return response.json();
}

// Contributor endpoints
export async function getContributorStats(
  githubUsername: string,
  repoId: number,
  userId: number,
  timeWindow: string = "7d",
) {
  const response = await fetch(
    `${API_BASE}/contributor/stats?github_username=${githubUsername}&repo_id=${repoId}&user_id=${userId}&time_window=${timeWindow}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch contributor stats");
  }

  return response.json();
}

export async function getTopPerformers(
  repoId: number,
  timeWindow: string = "1w",
) {
  const response = await fetch(
    `${API_BASE}/contributor/topPerformers?repo_id=${repoId}&time_window=${timeWindow}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch top performers");
  }

  return response.json();
}

export async function getRecentActivity(repoId: number) {
  const response = await fetch(
    `${API_BASE}/contributor/recent-activity?repo_id=${repoId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recent activity");
  }

  return response.json();
}

// Team endpoints
export async function getTeamTimeline(
  repoId: number,
  groupBy: "week" | "month" | "quarter" = "week",
) {
  const response = await fetch(
    `${API_BASE}/team/timeline?repo_id=${repoId}&group_by=${groupBy}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch team timeline");
  }

  return response.json();
}
