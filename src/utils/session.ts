export function getGitHubToken(): string | null {
  return sessionStorage.getItem("githubToken");
}

export function getRepoList(): { owner: string; repo: string; label: string }[] {
  const list = sessionStorage.getItem("repoList");
  if (!list) return [];
  return list
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((full) => {
      const [owner, repo] = full.split("/");
      return { owner, repo, label: `${owner}/${repo}` };
    });
}
