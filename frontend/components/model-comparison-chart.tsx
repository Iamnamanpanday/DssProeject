'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchModelComparison, fetchFeatureImportance } from '@/lib/api';
import { ModelComparisonRow } from '@/lib/dashboard-utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import { BarChart2, Layers, TrendingUp, Award } from 'lucide-react';

// Colour palette: one distinct colour per algorithm
const ALGO_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899',
];

const RANK_LABEL = ['🥇', '🥈', '🥉', '4th', '5th', '6th', '7th'];

export function ModelComparisonChart() {
  const [rows, setRows] = useState<ModelComparisonRow[]>([]);
  const [importanceData, setImportanceData] = useState<{ feature: string; display_name: string; importance: number }[]>([]);
  const [tab, setTab] = useState<'accuracy' | 'cv' | 'f1' | 'importance'>('cv');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchModelComparison(), fetchFeatureImportance()]).then(([comp, imp]) => {
      setRows(comp);
      setImportanceData(imp.slice(0, 7));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-muted-foreground">
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest">Loading Algorithm Comparison…</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center text-xs text-muted-foreground">
        No comparison data available. Run the training pipeline first.
      </div>
    );
  }

  // Sort by selected metric descending
  const metricKey: keyof ModelComparisonRow =
    tab === 'accuracy' ? 'Test Accuracy' :
    tab === 'f1'       ? 'Macro F1'      :
    tab === 'cv'       ? 'CV Mean (10-fold)' : 'Test Accuracy';

  const sorted = tab === 'importance'
    ? rows
    : [...rows].sort((a, b) => (b[metricKey] as number) - (a[metricKey] as number));

  // Radar data: normalise each metric 0-1 within the range across algorithms
  const radarData = rows.map(row => ({
    algorithm: row.Algorithm.replace(' ', '\n'),
    Accuracy:  Math.round(row['Test Accuracy'] * 100),
    F1:        Math.round(row['Macro F1'] * 100),
    CV:        Math.round(row['CV Mean (10-fold)'] * 100),
  }));

  const TABS = [
    { key: 'cv',         label: '10-Fold CV',  icon: TrendingUp },
    { key: 'accuracy',   label: 'Test Acc.',   icon: Award },
    { key: 'f1',         label: 'Macro F1',    icon: BarChart2 },
    { key: 'importance', label: 'Feature Imp.', icon: Layers },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/70 mb-1">Comparative Algorithm Study</h3>
          <p className="text-lg font-black text-foreground">{rows.length} Algorithms Benchmarked</p>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                tab === key
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab !== 'importance' ? (
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Bar Chart */}
            <div
              className="p-6 rounded-3xl border border-white/10"
              style={{ background: 'rgba(15,20,30,0.6)', backdropFilter: 'blur(20px)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                {tab === 'cv' ? '10-Fold Cross-Validation Mean Accuracy' : tab === 'accuracy' ? 'Test Set Accuracy' : 'Macro-Averaged F1 Score'}
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={sorted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="Algorithm"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700 }}
                    tickFormatter={v => v.split(' ').map((w: string) => w[0]).join('')}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    domain={[0.5, 1]}
                    tickFormatter={v => `${Math.round(v * 100)}%`}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as ModelComparisonRow;
                      return (
                        <div className="bg-black/90 border border-white/10 rounded-xl p-3 text-xs space-y-1">
                          <p className="font-black text-foreground">{d.Algorithm}</p>
                          <p className="text-primary">Test Acc: {Math.round(d['Test Accuracy'] * 100)}%</p>
                          <p className="text-emerald-400">F1: {Math.round(d['Macro F1'] * 100)}%</p>
                          <p className="text-secondary">CV: {Math.round(d['CV Mean (10-fold)'] * 100)}% ± {Math.round(d['CV Std'] * 100)}%</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey={metricKey} radius={[6, 6, 0, 0]}>
                    {sorted.map((_, idx) => (
                      <Cell key={idx} fill={ALGO_COLORS[idx % ALGO_COLORS.length]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ranking Table */}
            <div
              className="rounded-3xl border border-white/10 overflow-hidden"
              style={{ background: 'rgba(15,20,30,0.5)', backdropFilter: 'blur(20px)' }}
            >
              <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Rank</span>
                <span className="col-span-2">Algorithm</span>
                <span className="text-right">Test Acc.</span>
                <span className="text-right">CV Mean ± Std</span>
              </div>
              {sorted.map((row, idx) => (
                <motion.div
                  key={row.Algorithm}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-5 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors items-center"
                >
                  <span className="text-sm">{RANK_LABEL[idx] ?? `${idx + 1}th`}</span>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: ALGO_COLORS[idx % ALGO_COLORS.length] }} />
                    <span className="text-xs font-bold text-foreground">{row.Algorithm}</span>
                  </div>
                  <span className="text-xs font-mono text-right" style={{ color: ALGO_COLORS[idx % ALGO_COLORS.length] }}>
                    {Math.round(row['Test Accuracy'] * 100)}%
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground text-right">
                    {Math.round(row['CV Mean (10-fold)'] * 100)}% ± {Math.round(row['CV Std'] * 100)}%
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Radar Chart */}
            <div
              className="p-6 rounded-3xl border border-white/10"
              style={{ background: 'rgba(15,20,30,0.6)', backdropFilter: 'blur(20px)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Multi-Metric Radar</p>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis
                    dataKey="algorithm"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis domain={[50, 100]} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} />
                  <Radar name="Accuracy (%)" dataKey="Accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                  <Radar name="F1 (%)"       dataKey="F1"       stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Radar name="CV (%)"       dataKey="CV"       stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="importance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Feature Importance horizontal bar chart */}
            <div
              className="p-6 rounded-3xl border border-white/10 space-y-4"
              style={{ background: 'rgba(15,20,30,0.6)', backdropFilter: 'blur(20px)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Random Forest — Global Feature Importance (Gini)
              </p>
              <div className="space-y-3">
                {importanceData.map((item, idx) => (
                  <motion.div
                    key={item.feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground/80">{item.display_name}</span>
                      <span className="text-xs font-mono" style={{ color: ALGO_COLORS[idx % ALGO_COLORS.length] }}>
                        {(item.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.importance * 100 * 8}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.07, ease: 'circOut' }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${ALGO_COLORS[idx % ALGO_COLORS.length]}99, ${ALGO_COLORS[idx % ALGO_COLORS.length]})` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
