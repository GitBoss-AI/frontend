"use client";

import React from 'react';
import { PRAnalysisResponse } from '@/utils/api'; // Assuming this interface is in api.ts
import { FileText, Users, Link as LinkIcon } from 'lucide-react';

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
        <p className="text-gray-700 whitespace-pre-wrap">{analysis.prSummary}</p>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-blue-700 flex items-center mb-1">
          <Users className="w-4 h-4 mr-2" />
          Contribution Analysis
        </h4>
        <p className="text-gray-700 whitespace-pre-wrap">{analysis.contributionAnalysis}</p>
      </div>
      {analysis.linkedIssuesSummary && (
        <div>
          <h4 className="text-sm font-semibold text-blue-700 flex items-center mb-1">
            <LinkIcon className="w-4 h-4 mr-2" />
            Linked Issues Summary
          </h4>
          <p className="text-gray-700 whitespace-pre-wrap">{analysis.linkedIssuesSummary}</p>
        </div>
      )}
    </div>
  );
};

export default PRAnalysisDisplay;