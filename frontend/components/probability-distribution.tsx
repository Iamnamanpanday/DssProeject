'use client';

import { motion } from 'framer-motion';
import { RiskProbabilities } from '@/lib/dashboard-utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  probabilities: RiskProbabilities;
  wellnessScore: number;
  relapseRisk: number;
  riskLevel: string;
}

const RISK_CONFIG = {
  mild:     { color: '#10b981', label: 'Low Risk',  bg: 'rgba(16,185,129,0.12)' },
  moderate: { color: '#f59e0b', label: 'Moderate',  bg: 'rgba(245,158,11,0.12)' },
  severe:   { color: '#ef4444', label: 'High Risk', bg: 'rgba(239,68,68,0.12)'  },
};

export function ProbabilityDistribution({ probabilities, wellnessScore, relapseRisk, riskLevel }: Props) {
  const pieData = [
    { name: 'Mild',     value: Math.round(probabilities.mild     * 100), color: '#10b981' },
    { name: 'Moderate', value: Math.round(probabilities.moderate * 100), color: '#f59e0b' },
    { name: 'Severe',   value: Math.round(probabilities.severe   * 100), color: '#ef4444' },
  ];

  const cfg = RISK_CONFIG[riskLevel as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.mild;

  // Map wellness score 0-100 to an arc sweep (0–180 degrees in SVG space)
  const wellnessAngle = (wellnessScore / 100) * 180;

  return (
    <div className="space-y-5">

      {/* ── Row 1: Pie + Stats ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Pie chart */}
        <div
          className="p-5 rounded-2xl border border-white/10 flex flex-col items-center"
          style={{ background: 'rgba(15,20,30,0.6)', backdropFilter: 'blur(20px)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Class Probabilities</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={38} outerRadius={58}
                paddingAngle={3}
                dataKey="value"
                startAngle={90} endAngle={-270}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-black/90 border border-white/10 rounded-lg px-3 py-2 text-xs">
                      <p style={{ color: payload[0].payload.color }} className="font-black">
                        {payload[0].name}: {payload[0].value}%
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex gap-3 mt-1">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />
                <span className="text-[9px] font-bold text-muted-foreground">{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wellness Score Semi-gauge */}
        <div
          className="p-5 rounded-2xl border border-white/10 flex flex-col items-center"
          style={{ background: 'rgba(15,20,30,0.6)', backdropFilter: 'blur(20px)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Wellness Score</p>
          <div className="relative w-full flex justify-center" style={{ height: 100 }}>
            <svg viewBox="0 0 120 70" className="w-36">
              {/* Background arc */}
              <path
                d="M 10 60 A 50 50 0 0 1 110 60"
                fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round"
              />
              {/* Foreground arc */}
              <motion.path
                d="M 10 60 A 50 50 0 0 1 110 60"
                fill="none"
                stroke={cfg.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="157"
                initial={{ strokeDashoffset: 157 }}
                animate={{ strokeDashoffset: 157 - (wellnessScore / 100) * 157 }}
                transition={{ duration: 1.2, ease: 'circOut' }}
                style={{ filter: `drop-shadow(0 0 6px ${cfg.color}88)` }}
              />
              {/* Score text */}
              <text x="60" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="inherit">
                {Math.round(wellnessScore)}
              </text>
              <text x="60" y="68" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="700" fontFamily="inherit">
                /100
              </text>
            </svg>
          </div>
          <div
            className="mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            {wellnessScore >= 80 ? 'Excellent' : wellnessScore >= 60 ? 'Good' : wellnessScore >= 40 ? 'Fair' : 'Poor'}
          </div>
        </div>
      </div>

      {/* ── Row 2: Relapse Risk Bar ── */}
      <div
        className="p-5 rounded-2xl border border-white/10 space-y-3"
        style={{ background: 'rgba(15,20,30,0.6)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Relapse / Deterioration Risk</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Probability of worsening at next observation</p>
          </div>
          <div className="text-right">
            <p
              className="text-xl font-black"
              style={{ color: relapseRisk > 0.6 ? '#ef4444' : relapseRisk > 0.4 ? '#f59e0b' : '#10b981' }}
            >
              {Math.round(relapseRisk * 100)}%
            </p>
            <p className="text-[9px] font-bold text-muted-foreground">
              {relapseRisk > 0.6 ? 'HIGH' : relapseRisk > 0.4 ? 'MODERATE' : 'LOW'}
            </p>
          </div>
        </div>
        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${relapseRisk * 100}%` }}
            transition={{ duration: 1.2, ease: 'circOut' }}
            className="h-full rounded-full"
            style={{
              background: relapseRisk > 0.6
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                : relapseRisk > 0.4
                ? 'linear-gradient(90deg, #10b981, #f59e0b)'
                : 'linear-gradient(90deg, #6366f1, #10b981)',
              boxShadow: `0 0 10px ${relapseRisk > 0.6 ? '#ef4444' : relapseRisk > 0.4 ? '#f59e0b' : '#10b981'}44`,
            }}
          />
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground/50 font-bold uppercase">
          <span>Stable</span>
          <span>Moderate Risk</span>
          <span>High Risk</span>
        </div>
      </div>

      {/* ── Row 3: Per-class probability bars ── */}
      <div
        className="p-5 rounded-2xl border border-white/10 space-y-3"
        style={{ background: 'rgba(15,20,30,0.6)', backdropFilter: 'blur(20px)' }}
      >
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Probability Distribution</p>
        {pieData.map((d, idx) => (
          <div key={d.name} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold" style={{ color: d.color }}>{d.name}</span>
              <span className="text-xs font-mono text-foreground/70">{d.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${d.value}%` }}
                transition={{ duration: 0.9, delay: idx * 0.1, ease: 'circOut' }}
                className="h-full rounded-full"
                style={{ background: d.color, opacity: 0.7 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
