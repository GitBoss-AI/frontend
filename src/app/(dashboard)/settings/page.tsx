"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [githubToken, setGithubToken] = useState("");
  const [repoList, setRepoList] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("githubToken") || "";
    const storedRepos = sessionStorage.getItem("repoList") || "";
    setGithubToken(storedToken);
    setRepoList(storedRepos);
  }, []);

  const handleSave = () => {
    sessionStorage.setItem("githubToken", githubToken);
    sessionStorage.setItem("repoList", repoList);
    setHasChanges(false);
    alert("Settings saved to session.");
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
            hasChanges
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          } transition-colors`}
        >
          Save Changes
        </button>
      </div>

      {/* GitHub Token */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">GitHub API Token</h2>
        <p className="text-sm text-gray-500">
          This token will be used to authenticate requests to the GitHub API. It is stored only in your browser's session.
        </p>
        <input
          type="text"
          value={githubToken}
          onChange={(e) => {
            setGithubToken(e.target.value);
            setHasChanges(true);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          placeholder="ghp_XXXXXXXXXXXXXXXXXXXX"
        />
      </div>

      {/* Repo List */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Repositories to Track</h2>
        <p className="text-sm text-gray-500">
          Enter one or more repositories in the format <code className="font-mono">owner/repo</code>, separated by commas.
        </p>
        <textarea
          value={repoList}
          onChange={(e) => {
            setRepoList(e.target.value);
            setHasChanges(true);
          }}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          placeholder="facebook/react, vercel/next.js"
        />
      </div>
    </div>
  );
}
