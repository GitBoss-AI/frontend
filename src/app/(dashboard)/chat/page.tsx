// my_project/frontend copy/src/app/(dashboard)/chat/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { analyzePullRequest, PRAnalysisResponse } from '@/utils/api';
import { useUser } from "@/contexts/UserContext";
import {
  RefreshCw,
  MessageSquare,
  ListChecks,
  Send,
  Users,
  FileSearch,
  Info as InfoIcon
} from 'lucide-react';
import Link from 'next/link'; // Standard import
import { getItem, setItem, removeItem } from '@/utils/storage'; // Import storage utils

const CHAT_PAGE_SINGLE_PR_TOOL_KEY = 'chatPageSinglePRToolState';

interface StoredChatPageSinglePRState {
  prNumberInput: string;
  repoOwnerInput: string;
  repoNameInput: string;
  analysisResult?: PRAnalysisResponse | null; // Optional, as it's a result
}

const quickPrompts = [
  "Analyze commit patterns for owner/repo",
  "Provide a sprint summary for owner/repo",
  "Find bottlenecks in owner/repo",
  "Suggest review process improvements for owner/repo",
];

export default function ChatPage() {
  const { user } = useUser();
  const [input, setInput] = useState("");

  // State for "Test Single PR Analysis" tool
  const [prNumberInput, setPrNumberInput] = useState<string>("33165");
  const [repoOwnerInput, setRepoOwnerInput] = useState<string>("facebook");
  const [repoNameInput, setRepoNameInput] = useState<string>("react");
  const [analysisResult, setAnalysisResult] = useState<PRAnalysisResponse | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Effect to load state for Single PR tool
  useEffect(() => {
    const storedStateString = getItem(CHAT_PAGE_SINGLE_PR_TOOL_KEY);
    if (storedStateString) {
      try {
        const storedState: StoredChatPageSinglePRState = JSON.parse(storedStateString);
        setPrNumberInput(storedState.prNumberInput || "33165");
        setRepoOwnerInput(storedState.repoOwnerInput || "facebook");
        setRepoNameInput(storedState.repoNameInput || "react");
        // Optionally restore analysisResult if desired
        // if (storedState.analysisResult) {
        //   setAnalysisResult(storedState.analysisResult);
        // }
      } catch (e) {
        console.error("Failed to parse stored chat page PR tool state:", e);
        removeItem(CHAT_PAGE_SINGLE_PR_TOOL_KEY);
      }
    }
  }, []);

  // Effect to save state for Single PR tool
  useEffect(() => {
    const stateToStore: StoredChatPageSinglePRState = {
      prNumberInput,
      repoOwnerInput,
      repoNameInput,
      // analysisResult, // Save the result too if you want it to persist across page loads
    };
    setItem(CHAT_PAGE_SINGLE_PR_TOOL_KEY, JSON.stringify(stateToStore));
  }, [prNumberInput, repoOwnerInput, repoNameInput /*, analysisResult */]);

  const handleAnalyzePrViaApi = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisResult(null); // Clear previous result before new fetch
    setAnalysisError(null);
    try {
      const prNum = parseInt(prNumberInput, 10);
      if (isNaN(prNum)) throw new Error("PR Number must be valid.");
      if (!repoOwnerInput.trim() || !repoNameInput.trim()) throw new Error("Owner/Repo required.");
      const result = await analyzePullRequest(prNum, repoOwnerInput.trim(), repoNameInput.trim());
      setAnalysisResult(result);
      // The useEffect above will save the input states; if you want to save the result, add analysisResult to its dependency array and include it in stateToStore.
    } catch (err: any) {
      setAnalysisError(err.message || "Failed to analyze PR.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 bg-gray-100">
      <div className="flex h-full flex-col max-w-4xl mx-auto">
        {/* HEADER SECTION WITH NAVIGATION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-300 gap-4 sm:gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center order-1 sm:order-none">
            <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
            AI Assistant
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto order-2 sm:order-none">
            {/* Link 1: Browse Recent PRs */}
            <Link
              href="/chat/recent-prs"
              className="btn btn-outline-primary flex items-center justify-center transition-all duration-150 ease-in-out group text-sm px-4 py-2.5"
            >
              <ListChecks className="w-5 h-5 mr-2 group-hover:scale-105 transition-transform" />
              Recent PRs
            </Link>

            {/* Link 2: View Contributors */}
            <Link
              href="/chat/repository-contributors"
              className="btn btn-indigo flex items-center justify-center transition-all duration-150 ease-in-out group text-sm px-4 py-2.5"
            >
              <Users className="w-5 h-5 mr-2 group-hover:scale-105 transition-transform" />
              Contributors
            </Link>

            {/* NEW Link 3: View Issues */}
            <Link
              href="/chat/repository-issues"
              className="btn btn-teal flex items-center justify-center transition-all duration-150 ease-in-out group text-sm px-4 py-2.5"
            >
              <InfoIcon className="w-5 h-5 mr-2 group-hover:scale-105 transition-transform" />
              Repo Issues
            </Link>
          </div>
        </div>

        {/* Test Single PR Analysis Section (as before) */}
        <div className="mt-8 p-6 border border-gray-200 rounded-xl bg-white shadow-lg space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                    <FileSearch className="w-5 h-5 mr-2 text-gray-500"/>
                    Quick Test: Single PR Analysis
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div className="sm:col-span-1">
                        <label htmlFor="prNumberInputPage" className="block text-xs font-medium text-gray-600 mb-1">PR #</label>
                        <input id="prNumberInputPage" type="number" value={prNumberInput} onChange={(e) => setPrNumberInput(e.target.value)} placeholder="PR #" className="input w-full"/>
                    </div>
                    <div className="sm:col-span-1">
                        <label htmlFor="repoOwnerInputPage" className="block text-xs font-medium text-gray-600 mb-1">Owner</label>
                        <input id="repoOwnerInputPage" type="text" value={repoOwnerInput} onChange={(e) => setRepoOwnerInput(e.target.value)} placeholder="Owner" className="input w-full"/>
                    </div>
                    <div className="sm:col-span-1">
                        <label htmlFor="repoNameInputPage" className="block text-xs font-medium text-gray-600 mb-1">Repo</label>
                        <input id="repoNameInputPage" type="text" value={repoNameInput} onChange={(e) => setRepoNameInput(e.target.value)} placeholder="Repo" className="input w-full"/>
                    </div>
                    <button onClick={handleAnalyzePrViaApi} className="btn btn-secondary w-full sm:w-auto flex items-center justify-center group" disabled={isLoadingAnalysis}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAnalysis ? 'animate-spin' : 'group-hover:rotate-90 transition-transform'}`} />
                        {isLoadingAnalysis ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
                {analysisError && <p className="text-red-600 text-xs mt-2 bg-red-50 p-2 rounded-md">{analysisError}</p>}
                {analysisResult && ( <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50 text-sm space-y-1"> <p><strong>Summary:</strong> {analysisResult.prSummary}</p> <p><strong>Contributions:</strong> {analysisResult.contributionAnalysis}</p> {analysisResult.linkedIssuesSummary && <p><strong>Linked Issues:</strong> {analysisResult.linkedIssuesSummary}</p>} </div>)}
            </div>
        </div>
      </div>
    </div>
  );
}