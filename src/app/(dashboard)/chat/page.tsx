// my_project/frontend copy/src/app/(dashboard)/chat/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { analyzePullRequest, PRAnalysisResponse } from '@/utils/api'; // For the single PR analysis test
import { useUser } from "@/contexts/UserContext";
import { useWebSocketChat, Message as ChatMessage } from '@/hooks/useWebSocketChat'; // Import Message type
import { RefreshCw, MessageSquare, ListChecks, Send, CornerDownLeft } from 'lucide-react';
import Link from 'next/link';
import PRAnalysisDisplay from '@/components/PRAnalysisDisplay';

const quickPrompts = [
  "Analyze commit patterns for owner/repo", // Adjusted to be more generic
  "Provide a sprint summary for owner/repo",
  "Find bottlenecks in owner/repo",
  "Suggest review process improvements for owner/repo",
];

export default function ChatPage() {
  const { user } = useUser();
  const {
    messages: wsMessages, // Renamed to avoid conflict with local messages state
    sendMessage,
    isConnected,
    error: wsError, // Renamed
    isTyping: isAiTyping // Renamed
  } = useWebSocketChat();

  // Local state for chat messages displayed in UI (combining user input and WS responses)
  const [chatDisplayMessages, setChatDisplayMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  // State for the "Test Single PR Analysis" tool
  const [prNumberInput, setPrNumberInput] = useState<string>("33165"); // Default example
  const [repoOwnerInput, setRepoOwnerInput] = useState<string>("facebook"); // Default example
  const [repoNameInput, setRepoNameInput] = useState<string>("react"); // Default example
  const [analysisResult, setAnalysisResult] = useState<PRAnalysisResponse | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Effect to update chatDisplayMessages when new WebSocket messages arrive
  useEffect(() => {
    setChatDisplayMessages(wsMessages);
  }, [wsMessages]);

  // Effect to add an initial greeting from the AI if chat is empty and connected
  useEffect(() => {
    if (isConnected && chatDisplayMessages.length === 0 && !isAiTyping) {
      const initialMessage: ChatMessage = {
        id: `ai_greeting_${Date.now()}`,
        content: "Hello! I'm your GitBoss AI assistant. How can I assist you today? Try asking a question or using a quick prompt.",
        sender: "GitBoss AI",
        timestamp: Date.now(),
        isFromUser: false,
      };
      setChatDisplayMessages([initialMessage]);
    }
  }, [isConnected, chatDisplayMessages.length, isAiTyping]);


  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !isConnected) return;

    // Optimistically add user's message to UI immediately
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: input.trim(),
      sender: user?.username || "User",
      timestamp: Date.now(),
      isFromUser: true,
    };
    setChatDisplayMessages(prev => [...prev, userMessage]);

    sendMessage(input.trim()); // Send to WebSocket backend
    setInput("");
  };

  const handleQuickPrompt = (prompt: string) => {
    // For quick prompts, we can directly send them as if the user typed them.
    // The AI backend should be designed to understand these prompts.
    if (!isConnected) {
      alert("Not connected to the AI assistant. Please check the connection.");
      return;
    }
    const userMessage: ChatMessage = {
      id: `user_prompt_${Date.now()}`,
      content: prompt,
      sender: user?.username || "User",
      timestamp: Date.now(),
      isFromUser: true,
    };
    setChatDisplayMessages(prev => [...prev, userMessage]);
    sendMessage(prompt);
  };

  const handleAnalyzePrViaApi = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    try {
      const prNum = parseInt(prNumberInput, 10);
      if (isNaN(prNum)) {
        throw new Error("PR Number must be a valid integer.");
      }
      if (!repoOwnerInput.trim() || !repoNameInput.trim()) {
           throw new Error("Repo Owner and Repo Name cannot be empty.");
      }
      const result = await analyzePullRequest(prNum, repoOwnerInput.trim(), repoNameInput.trim());
      setAnalysisResult(result);
    } catch (err: any) {
      setAnalysisError(err.message || "Failed to analyze PR.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <div className="h-full p-4 md:p-6 lg:p-8 bg-gray-100">
      <div className="flex h-full flex-col max-w-4xl mx-auto"> {/* Max width for chat area */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-300">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center mb-3 sm:mb-0">
            <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
            AI Assistant
          </h1>
          <Link href="/chat/recent-prs" legacyBehavior>
            <a className="btn btn-primary flex items-center transition-all duration-150 ease-in-out group w-full sm:w-auto">
              <ListChecks className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Browse Recent PRs
            </a>
          </Link>
        </div>

        {/* WebSocket Connection Status */}
        {wsError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
            Connection Error: {wsError}. Please ensure the agent server is running and refresh.
          </div>
        )}
        {!isConnected && !wsError && (
           <div className="mb-4 p-3 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md">
            Connecting to AI assistant...
          </div>
        )}


        {/* Quick Prompts */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 ease-in-out"
                disabled={!isConnected}
                title={!isConnected ? "Connect to AI to use prompts" : prompt}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Display */}
        <div className="flex-1 space-y-4 overflow-y-auto mb-4 p-4 bg-white rounded-xl shadow-lg border border-gray-200 min-h-[300px] max-h-[60vh]">
         {chatDisplayMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isFromUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 shadow-sm ${
                  msg.isFromUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }}></p>
                <div className={`mt-1.5 text-xs opacity-70 ${msg.isFromUser ? 'text-blue-200' : 'text-gray-500'} text-right`}>
                  {msg.sender} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isAiTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-xl px-4 py-3 shadow-sm bg-gray-100 text-gray-800">
                <div className="flex items-center space-x-1.5">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:0.2s]"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:0.4s]"></div>
                  <span className="ml-1 text-xs text-gray-500">GitBoss AI is typing...</span>
                </div>
              </div>
            </div>
          )}
           {chatDisplayMessages.length === 0 && !isAiTyping && !isConnected && (
            <div className="text-center text-gray-500 py-10">
                <p>Waiting for connection to AI assistant...</p>
            </div>
          )}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t border-gray-200">
           <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? "Ask GitBoss AI anything..." : "Connecting to assistant..."}
            className="input flex-1 !text-sm" // Added !text-sm for specificity
            disabled={!isConnected || isAiTyping}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSendMessage(); e.preventDefault();}}}
          />
          <button
            type="submit"
            className="btn btn-primary p-2.5" // Adjusted padding for a more square button
            disabled={!isConnected || isAiTyping || !input.trim()}
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        {/* --- End Chat UI --- */}

        {/* --- Section for Tools (Test Single PR Analysis) --- */}
        <div className="mt-8 p-6 border border-gray-200 rounded-xl bg-white shadow-lg space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Quick Test: Single PR Analysis</h3>
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
                {analysisResult && (
                    <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50 text-sm space-y-1">
                        <p><strong>Summary:</strong> {analysisResult.prSummary}</p>
                        <p><strong>Contributions:</strong> {analysisResult.contributionAnalysis}</p>
                        {analysisResult.linkedIssuesSummary && <p><strong>Linked Issues:</strong> {analysisResult.linkedIssuesSummary}</p>}
                    </div>
                )}
            </div>
        </div>
        {/* --- End Tools Section --- */}

        {analysisResult && (
          <div className="mt-4">
            <PRAnalysisDisplay 
              analysis={analysisResult} 
              prUrl={`https://github.com/${repoOwnerInput}/${repoNameInput}/pull/${prNumberInput}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure these base Tailwind utility classes are effectively available through your globals.css or Tailwind config:
// .input { @apply block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 transition-colors duration-150 ease-in-out; }
// .btn { @apply inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 cursor-pointer; }
// .btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400; }
// .btn-secondary { @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400; } // Adjusted for better contrast