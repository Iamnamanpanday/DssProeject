'use client';

import { motion } from 'framer-motion';
import { MoodTrendGraph } from './mood-trend-graph';
import { StabilityGauge } from './stability-gauge';
import { RelapsePredictor } from './relapse-predictor';
import { WhatIfAnalysis } from './what-if-analysis';
import { BreathingTool } from './breathing-tool';
import { WellnessStats } from './wellness-stats';
import { MentalHealthScore } from '@/lib/dashboard-utils';

interface RightPanelProps {
  scores: MentalHealthScore;
}

export function RightPanel({ scores }: RightPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-[420px] space-y-6 px-6 py-8 overflow-y-auto custom-scrollbar"
      style={{
        background: 'rgba(15, 20, 25, 0.4)',
        backdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Stability Gauge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <StabilityGauge scores={scores} />
      </motion.div>

      {/* What-If Simulation (New) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.22 }}
      >
        <WhatIfAnalysis currentScores={scores} />
      </motion.div>

      {/* Wellness stats (New) */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <WellnessStats scores={scores} />
      </motion.div>

      {/* Breathing Tool (New) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <BreathingTool />
      </motion.div>

      {/* Mood Trend Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <MoodTrendGraph />
      </motion.div>

      {/* Relapse Predictor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <RelapsePredictor scores={scores} />
      </motion.div>
    </motion.div>
  );
}

