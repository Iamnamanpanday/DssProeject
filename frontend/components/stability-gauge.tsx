'use client';

import { motion } from 'framer-motion';
import { MentalHealthScore, getStabilityPercentage, getMoodColor } from '@/lib/dashboard-utils';

interface StabilityGaugeProps {
  scores: MentalHealthScore;
}

export function StabilityGauge({ scores }: StabilityGaugeProps) {
  const percentage = getStabilityPercentage(scores);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine status based on percentage
  let status = 'Optimal';
  let statusColor = '#10b981';
  if (percentage < 60) {
    status = 'Needs Support';
    statusColor = '#dc2626';
  } else if (percentage < 80) {
    status = 'Fair';
    statusColor = '#f59e0b';
  }

  return (
    <div className="rounded-lg border border-border backdrop-blur-sm p-6"
      style={{
        background: 'var(--glass-bg)',
        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.08)',
      }}
    >
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Stability Index</h3>
        <p className="text-xs text-muted-foreground mt-1">Overall wellness assessment</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative w-36 h-36">
          <svg
            width="144"
            height="144"
            viewBox="0 0 144 144"
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r="42"
              fill="none"
              stroke="rgba(203, 213, 225, 0.1)"
              strokeWidth="5"
            />
            {/* Progress circle */}
            <motion.circle
              cx="72"
              cy="72"
              r="42"
              fill="none"
              stroke={statusColor}
              strokeWidth="5"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-primary">{percentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">Stability</p>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <p className="text-lg font-semibold" style={{ color: statusColor }}>
            {status}
          </p>
        </motion.div>
      </div>

      {/* Score breakdown */}
      <div className="mt-8 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sleep: {scores.sleep.toFixed(1)}/10</span>
          <span className="text-foreground font-medium text-primary">{(scores.sleep / 10 * 25).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${(scores.sleep / 10) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>

        <div className="flex justify-between text-sm mt-3">
          <span className="text-muted-foreground">Activity: {scores.activity.toFixed(1)}/10</span>
          <span className="text-foreground font-medium text-primary">{(scores.activity / 10 * 25).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(scores.activity / 10) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>

        <div className="flex justify-between text-sm mt-3">
          <span className="text-muted-foreground">Stress: {(100 - scores.stress).toFixed(1)}/100</span>
          <span className="text-foreground font-medium text-primary">{((100 - scores.stress) / 100 * 25).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-destructive to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${((100 - scores.stress) / 100) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </div>
  );
}
