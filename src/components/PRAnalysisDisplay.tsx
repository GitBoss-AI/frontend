// src/components/PRAnalysisDisplay.tsx
"use client";

import React from 'react';
import { PRAnalysisResponse } from '@/utils/api';
import { FileText, Users, Link as LinkIcon, MessageSquare, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PRAnalysisDisplayProps {
  analysis: PRAnalysisResponse;
  prUrl?: string;
}

const PRAnalysisDisplay: React.FC<PRAnalysisDisplayProps> = ({ analysis, prUrl }) => {
  if (!analysis) return null;

  return (
    <div className="mt-3 p-4 border border-indigo-200 bg-indigo-50 rounded-lg shadow-inner text-sm space-y-4"> {/* Adjusted colors and spacing */}
      
      {/* PR Summary */}
      <div>
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-semibold text-indigo-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            PR Summary
          </h4>
          {prUrl && (
            <a 
              href={prUrl}
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-indigo-600 hover:text-indigo-800 text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              View on GitHub
            </a>
          )}
        </div>
        <div className="text-gray-700 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"> {/* Tailwind prose classes for MD styling */}
          <ReactMarkdown>{analysis.prSummary}</ReactMarkdown>
        </div>
      </div>

      {/* Linked Issues Summary */}
      {analysis.linkedIssuesSummary && (
        <div>
          <h4 className="text-sm font-semibold text-indigo-700 flex items-center mb-1">
            <LinkIcon className="w-4 h-4 mr-2" />
            Linked Issues Summary
          </h4>
          <div className="text-gray-700 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
            <ReactMarkdown>{analysis.linkedIssuesSummary}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Contribution Analysis */}
      <div>
        <h4 className="text-sm font-semibold text-indigo-700 flex items-center mb-1">
          <Users className="w-4 h-4 mr-2" />
          Contribution Analysis
        </h4>
        <div className="text-gray-700 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
          <ReactMarkdown>{analysis.contributionAnalysis}</ReactMarkdown>
        </div>
      </div>

      
      {analysis.discussionSummary && (
        <div>
          <h4 className="text-sm font-semibold text-indigo-700 flex items-center mb-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Discussion Summary
          </h4>
          <div className="text-gray-700 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
            <ReactMarkdown>{analysis.discussionSummary}</ReactMarkdown>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default PRAnalysisDisplay;