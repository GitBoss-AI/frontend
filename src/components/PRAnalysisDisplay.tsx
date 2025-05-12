"use client";

import React from 'react';
import { PRAnalysisResponse } from '@/utils/api'; // Assuming this interface is in api.ts
import { FileText, Users, Link as LinkIcon, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PRAnalysisDisplayProps {
  analysis: PRAnalysisResponse;
}

const PRAnalysisDisplay: React.FC<PRAnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="mt-3 p-4 border border-blue-200 bg-blue-50 rounded-lg shadow-inner text-sm space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-blue-700 flex items-center mb-1">
          <FileText className="w-4 h-4 mr-2" />
          PR Summary
        </h4>
        <div className="text-gray-700 prose prose-sm max-w-none">
          <ReactMarkdown>{analysis.prSummary}</ReactMarkdown>
        </div>
      </div>

      {analysis.linkedIssuesSummary && (
        <div>
          <h4 className="text-sm font-semibold text-blue-700 flex items-center mb-1">
            <LinkIcon className="w-4 h-4 mr-2" />
            Linked Issues Summary
          </h4>
          <div className="text-gray-700 prose prose-sm max-w-none">
            <ReactMarkdown>{analysis.linkedIssuesSummary}</ReactMarkdown>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-blue-700 flex items-center mb-1">
          <MessageSquare className="w-4 h-4 mr-2" />
          Discussion Summary
        </h4>
        <div className="text-gray-700 prose prose-sm max-w-none">
          <ReactMarkdown>{analysis.discussionSummary}</ReactMarkdown>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-blue-700 flex items-center mb-1">
          <Users className="w-4 h-4 mr-2" />
          Contribution Analysis
        </h4>
        <div className="text-gray-700 prose prose-sm max-w-none">
          <ReactMarkdown>{analysis.contributionAnalysis}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default PRAnalysisDisplay;