'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, Info } from 'lucide-react';
import { MentalHealthScore, calculateRiskLevel, AnalysisResult } from '@/lib/dashboard-utils';

export function WhatIfAnalysis({ currentScores }: { currentScores: MentalHealthScore }) {
  const [targetSleep, setTargetSleep] = useState(currentScores.sleep);
  const [simulation, setSimulation] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const simScores = { ...currentScores, sleep: targetSleep };
    setSimulation(calculateRiskLevel(simScores));
  }, [targetSleep, currentScores]);

  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-white/5 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-2">
            <Calculator className="w-4 h-4" /> What-If Simulator
          </h4>
          <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Predictive Outcome Modeling</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase text-foreground/60 tracking-widest flex justify-between">
          Optimize Sleep Duration
          <span className="text-secondary font-black">{targetSleep}h</span>
        </label>
        <input 
          type="range"
          min="4"
          max="12"
          step="0.5"
          value={targetSleep}
          onChange={(e) => setTargetSleep(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
        />
        
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-bold text-muted-foreground uppercase">Projected Risk</span>
             <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
               simulation?.riskLevel === 'mild' ? 'bg-emerald-500/10 text-emerald-400' :
               simulation?.riskLevel === 'moderate' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
             }`}>
               {simulation?.riskLevel}
             </span>
          </div>
          
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-bold text-muted-foreground uppercase">Stability Shift</span>
             <div className="flex items-center gap-1 text-emerald-400">
                <span className="text-xs font-black">+{Math.round((targetSleep - currentScores.sleep) * 8)}%</span>
                <ArrowRight className="w-3 h-3 -rotate-45" />
             </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-secondary/5 rounded-lg border border-secondary/20">
           <Info className="w-3 h-3 text-secondary mt-0.5" />
           <p className="text-[10px] text-foreground/70 leading-relaxed font-medium">
             Increasing sleep to <b>{targetSleep}h</b> would optimally reduce neural load and improve focus recovery by significant margins.
           </p>
        </div>
      </div>
    </div>
  );
}
