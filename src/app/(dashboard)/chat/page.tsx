"use client";

import { useState } from "react";

const quickPrompts = [
  "Analyze commit patterns",
  "Sprint summary",
  "Find bottlenecks",
  "Review process improvements",
  "Compare sprints",
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your GitBoss AI assistant. I can help you analyze your team's performance, track metrics, and provide insights about your development process. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { role: "user", content: input }]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let response;

      if (
        input.toLowerCase().includes("bottlenecks") ||
        input.toLowerCase().includes("bottleneck")
      ) {
        response =
          "Based on my analysis of your GitHub repositories, I've identified the following potential bottlenecks in your development process:\n\n1. **Code reviews are taking 3.2 days on average** - This is significantly above the industry average of 1.5 days and may be slowing down your deployment cycle.\n\n2. **20% of PRs require more than 2 revision cycles** - This suggests unclear requirements or communication issues.\n\n3. **User authentication module has the highest defect density** - This area might benefit from additional automated tests or a focused refactoring effort.\n\nWould you like me to suggest specific improvements for any of these areas?";
      } else if (
        input.toLowerCase().includes("sprint") &&
        input.toLowerCase().includes("summary")
      ) {
        response =
          "Here's a summary of your current sprint (May 5-11, 2025):\n\n• **Commits**: 87 (↑12% from last sprint)\n• **PRs merged**: 32 (↑4%)\n• **Issues closed**: 28 (↓8%)\n• **Build Success Rate**: 96.7% (↓0.5%)\n\n**Top contributors**:\n1. Alice Chen - 24 commits, 7 PRs\n2. Bob Smith - 19 commits, 6 PRs\n3. Carlos Rodriguez - 15 commits, 4 PRs\n\n**Risk Factors**:\n• 5 high-priority issues still open\n• Frontend test coverage decreased by 2%\n\nShall I prepare a more detailed breakdown by team or feature area?";
      } else if (input.toLowerCase().includes("commit patterns")) {
        response =
          "I've analyzed the commit patterns across your repositories. Here are my findings:\n\n• **Peak commit times**: Tuesday (25%) and Wednesday (22%)\n• **Lowest activity**: Friday (8%) and weekends (5%)\n• **70% of commits happen between 10 AM and 2 PM**\n\n**Commit distribution by developer**:\n• Senior developers: 45% of commits\n• Mid-level developers: 40% of commits\n• Junior developers: 15% of commits\n\nNotably, there's an uneven distribution across your team. For example, Alice contributes 28% of all commits while having similar seniority to other team members who contribute 12-15% each. This might indicate workload imbalance.\n\nWould you like me to analyze specific developers or time periods in more detail?";
      } else {
        response =
          "I've analyzed your repositories and found some interesting patterns. Your team has been consistently improving code quality metrics over the past month, with test coverage increasing by 4.5%. However, there seems to be a bottleneck in the review process as PRs are taking an average of 2.3 days to be reviewed. Would you like more specific insights on any particular aspect of your development workflow?";
      }

      setMessages([
        ...messages,
        { role: "user", content: input },
        { role: "assistant", content: response },
      ]);
      setInput("");
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-full">
      <div className="flex h-full flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <button
            onClick={() => setMessages([])}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Chat
          </button>
        </div>

        {/* Quick prompts */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Quick Prompts:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-white rounded-lg border border-gray-200 p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${message.role === "user" ? "bg-blue-50 ml-8" : "bg-gray-50 mr-8"
                }`}
            >
              <div className="font-medium mb-1">
                {message.role === "user" ? "You" : "GitBoss AI"}
              </div>
              <div className="whitespace-pre-line">{message.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="p-4 rounded-lg bg-gray-50 mr-8">
              <div className="font-medium mb-1">GitBoss AI</div>
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
