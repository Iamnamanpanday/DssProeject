'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockTrendData } from '@/lib/dashboard-utils';

export function MoodTrendGraph() {
  return (
    <div className="rounded-lg border border-border backdrop-blur-sm p-6 h-full"
      style={{
        background: 'var(--glass-bg)',
        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.08)',
      }}
    >
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Weekly Trends</h3>
        <p className="text-xs text-muted-foreground mt-1">Mood and stress patterns</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={mockTrendData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(203, 213, 225, 0.08)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="rgba(203, 213, 225, 0.4)"
            style={{ fontSize: '11px' }}
          />
          <YAxis
            stroke="rgba(203, 213, 225, 0.4)"
            style={{ fontSize: '11px' }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(26, 31, 46, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '6px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#f5f7fb', fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            animationDuration={1000}
          />
          <Line
            type="monotone"
            dataKey="stress"
            stroke="#dc2626"
            strokeWidth={2}
            dot={{ fill: '#dc2626', r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={true}
            animationDuration={1000}
            opacity={0.8}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 flex gap-8 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3b82f6' }} />
          <span className="text-muted-foreground">Mood</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#dc2626' }} />
          <span className="text-muted-foreground">Stress</span>
        </div>
      </div>
    </div>
  );
}
