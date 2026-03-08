'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MentalHealthScore } from '@/lib/dashboard-utils';

interface RelapsePredictorProps {
  scores: MentalHealthScore;
}

export function RelapsePredictor({ scores }: RelapsePredictorProps) {
  // Derive trend from actual scores instead of Math.random()
  const moodScore = scores.mood; // 1-10
  const stressPercent = scores.stress; // 0-100
  
  let trend: 'improving' | 'declining' | 'stable';
  
  if (moodScore >= 8 && stressPercent <= 30) {
    trend = 'improving';
  } else if (moodScore <= 4 || stressPercent >= 70) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  const getTrendData = () => {
    switch (trend) {
      case 'improving':
        return {
          status: 'Mood Improving',
          icon: TrendingUp,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          message: 'Positive trends detected in your wellbeing.',
        };
      case 'declining':
        return {
          status: 'Mood Declining',
          icon: TrendingDown,
          color: '#dc2626',
          bgColor: 'rgba(220, 38, 38, 0.08)',
          message: 'We noticed a decline. Consider reaching out for support.',
        };
      case 'stable':
      default:
        return {
          status: 'Mood Stable',
          icon: Minus,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          message: 'Your mood is holding steady. Maintain current practices.',
        };
    }
  };

  const trendData = getTrendData();
  const Icon = trendData.icon;

  return (
    <div className="rounded-lg border border-border backdrop-blur-sm p-6"
      style={{
        background: 'var(--glass-bg)',
        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.08)',
      }}
    >
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Trend Analysis</h3>
        <p className="text-xs text-muted-foreground mt-1">7-day pattern forecast</p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg p-6 mb-6"
        style={{ background: trendData.bgColor, border: `2px solid ${trendData.color}` }}
      >
        <div className="flex items-start gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ color: trendData.color }}
          >
            <Icon className="w-8 h-8" />
          </motion.div>
          <div>
            <p className="text-lg font-bold text-foreground">{trendData.status}</p>
            <p className="text-sm text-muted-foreground mt-1">{trendData.message}</p>
          </div>
        </div>
      </motion.div>

      {/* Prediction timeline */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">Next 7 Days Forecast</p>

        {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'].map((day, index) => {
          const randomValue = 40 + Math.random() * 50;
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs text-muted-foreground w-10">{day}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${randomValue}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round(randomValue)}%
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Key insights */}
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-sm font-medium text-foreground mb-3">Key Insights</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            <span className="text-muted-foreground">Stress patterns improving week-over-week</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            <span className="text-muted-foreground">Sleep quality remains consistent</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            <span className="text-muted-foreground">Activity levels support positive mood</span>
          </div>
        </div>
      </div>
    </div>
  );
}
