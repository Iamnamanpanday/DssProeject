'use client';

import { LeftSidebar } from './left-sidebar';
import { CenterPanel } from './center-panel';
import { RightPanel } from './right-panel';
import { MentalHealthScore, AnalysisResult } from '@/lib/dashboard-utils';

interface DashboardLayoutProps {
  scores: MentalHealthScore;
  onScoresChange: (scores: MentalHealthScore) => void;
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export function DashboardLayout({
  scores,
  onScoresChange,
  result,
  isAnalyzing,
  onAnalyze,
}: DashboardLayoutProps) {
  return (
    <div className="flex w-full h-screen">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Center Panel */}
      <CenterPanel
        scores={scores}
        onScoresChange={onScoresChange}
        result={result}
        isAnalyzing={isAnalyzing}
        onAnalyze={onAnalyze}
      />

      {/* Right Panel */}
      <RightPanel scores={scores} />
    </div>
  );
}
