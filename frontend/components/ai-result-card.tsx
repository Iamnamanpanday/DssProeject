'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult, getMoodColor } from '@/lib/dashboard-utils';
import { AlertCircle, CheckCircle, AlertTriangle, Activity, ShieldCheck,
         Zap, TrendingUp, Brain, BarChart2 } from 'lucide-react';
import { ProbabilityDistribution } from './probability-distribution';

interface AIResultCardProps {
  result: AnalysisResult | null;
  isAnalyzing?: boolean;
}

type Tab = 'overview' | 'probabilities' | 'features';

const getRiskIcon = (level: string) => {
  switch (level) {
    case 'mild':     return <ShieldCheck className="w-6 h-6" />;
    case 'moderate': return <Activity    className="w-6 h-6" />;
    case 'severe':   return <AlertCircle className="w-6 h-6" />;
    default:         return <Zap         className="w-6 h-6" />;
  }
};

const getRiskLabel = (level: string) => {
  switch (level) {
    case 'mild':     return 'Optimal Equilibrium';
    case 'moderate': return 'Adaptive Load Detected';
    case 'severe':   return 'Critical Intervention Required';
    default:         return 'System Syncing';
  }
};

const RISK_COLOR: Record<string, string> = {
  mild:     '#10b981',
  moderate: '#f59e0b',
  severe:   '#ef4444',
};

export function AIResultCard({ result, isAnalyzing }: AIResultCardProps) {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="rounded-3xl border border-white/10 overflow-hidden relative"
          style={{
            background: 'linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Scanner animation */}
          <motion.div
            animate={{ y: ['0%', '400%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent z-0 opacity-20"
          />

          <div className="relative z-10">
            {/* ── Header ── */}
            <div className="p-8 border-b border-white/5 bg-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl border"
                    style={{
                      background: `${RISK_COLOR[result.riskLevel]}22`,
                      borderColor: `${RISK_COLOR[result.riskLevel]}44`,
                      color: RISK_COLOR[result.riskLevel],
                    }}
                  >
                    {getRiskIcon(result.riskLevel)}
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Diagnostic Output</h3>
                    <p className="text-lg font-black text-foreground">{getRiskLabel(result.riskLevel)}</p>
                  </div>
                </div>

                {/* Confidence + Wellness score in header */}
                <div className="flex items-end gap-6 text-right">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">AI Confidence</p>
                    <p className="text-2xl font-black" style={{ color: RISK_COLOR[result.riskLevel] }}>
                      {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                  {result.wellnessScore !== undefined && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Wellness Score</p>
                      <p className="text-2xl font-black text-primary">{Math.round(result.wellnessScore)}<span className="text-sm text-muted-foreground">/100</span></p>
                    </div>
                  )}
                  {result.relapseRisk !== undefined && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Relapse Risk</p>
                      <p className="text-2xl font-black" style={{ color: result.relapseRisk > 0.6 ? '#ef4444' : result.relapseRisk > 0.4 ? '#f59e0b' : '#10b981' }}>
                        {Math.round(result.relapseRisk * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Confidence bar */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence * 100}%` }}
                  transition={{ duration: 1.5, ease: 'circOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${RISK_COLOR[result.riskLevel]}88, ${RISK_COLOR[result.riskLevel]})`,
                    boxShadow: `0 0 8px ${RISK_COLOR[result.riskLevel]}66`,
                  }}
                />
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 p-4 border-b border-white/5 bg-black/10">
              {([
                { key: 'overview',      label: 'Overview',           icon: Brain      },
                { key: 'probabilities', label: 'Probability Analysis',icon: TrendingUp },
                { key: 'features',      label: 'Feature Attribution', icon: BarChart2  },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    tab === key
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">
              {tab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-1 md:grid-cols-2"
                >
                  {/* SHAP / Contribution column */}
                  <div className="p-8 border-r border-white/5 space-y-6">
                    <header>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
                        Feature Attribution (SHAP)
                      </h4>
                    </header>
                    <div className="space-y-4">
                      {result.contributions.slice(0, 7).map((cont) => (
                        <div key={cont.feature} className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                            <span className="text-foreground/80">{cont.display_name || cont.feature}</span>
                            <span className={cont.direction === 'decreases_risk' ? 'text-emerald-400' : 'text-rose-400'}>
                              {cont.direction === 'decreases_risk' ? '▼ Reduces Risk' : '▲ Raises Risk'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cont.weight * 100}%` }}
                              transition={{ duration: 0.8, ease: 'circOut' }}
                              className={`h-full rounded-full ${
                                cont.direction === 'decreases_risk' ? 'bg-emerald-500/50' : 'bg-rose-500/50'
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations + Insight */}
                  <div className="p-8 space-y-8 bg-black/20">
                    <section>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
                        Automated Directives
                      </h4>
                      <div className="space-y-3">
                        {result.recommendations.map((rec, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                          >
                            <div className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary flex-shrink-0">
                              {i + 1}
                            </div>
                            <p className="text-xs font-medium text-foreground/90">{rec}</p>
                          </motion.div>
                        ))}
                      </div>
                    </section>

                    <section className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-2 italic">Neural Insight</p>
                      <p className="text-xs text-foreground/80 leading-relaxed italic">{result.insight}</p>
                    </section>
                  </div>
                </motion.div>
              )}

              {tab === 'probabilities' && result.probabilities && (
                <motion.div
                  key="probabilities"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-8"
                >
                  <ProbabilityDistribution
                    probabilities={result.probabilities}
                    wellnessScore={result.wellnessScore ?? 50}
                    relapseRisk={result.relapseRisk ?? 0.3}
                    riskLevel={result.riskLevel}
                  />
                </motion.div>
              )}

              {tab === 'probabilities' && !result.probabilities && (
                <motion.div
                  key="probabilities-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center text-xs text-muted-foreground"
                >
                  Probability data unavailable (backend offline — showing local estimate).
                </motion.div>
              )}

              {tab === 'features' && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-8 space-y-4"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    All Feature Contributions — Sorted by Impact
                  </p>
                  <div className="space-y-3">
                    {result.contributions.map((cont, idx) => (
                      <motion.div
                        key={cont.feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <span className="text-[10px] font-black text-muted-foreground w-4">{idx + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-bold text-foreground/80">{cont.display_name || cont.feature}</span>
                            <span
                              className="text-[10px] font-black"
                              style={{ color: cont.direction === 'decreases_risk' ? '#10b981' : '#ef4444' }}
                            >
                              {cont.direction === 'decreases_risk' ? '▼' : '▲'} {(cont.weight * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cont.weight * 100}%` }}
                              transition={{ duration: 0.7, delay: idx * 0.05 }}
                              className="h-full rounded-full"
                              style={{
                                background: cont.direction === 'decreases_risk'
                                  ? 'linear-gradient(90deg, #10b98166, #10b981)'
                                  : 'linear-gradient(90deg, #ef444466, #ef4444)',
                              }}
                            />
                          </div>
                        </div>
                        {cont.input_value !== undefined && (
                          <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">
                            {cont.input_value.toFixed(1)}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
