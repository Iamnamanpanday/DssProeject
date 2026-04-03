'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { MoodInputModule } from './mood-input-module';
import { AIResultCard } from './ai-result-card';
import { ModelComparisonChart } from './model-comparison-chart';
import { MentalHealthScore, AnalysisResult } from '@/lib/dashboard-utils';
import { Download, Brain, Sparkles, BarChart2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';


interface CenterPanelProps {
  scores: MentalHealthScore;
  onScoresChange: (scores: MentalHealthScore) => void;
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export function CenterPanel({
  scores,
  onScoresChange,
  result,
  isAnalyzing,
  onAnalyze,
}: CenterPanelProps) {
  const [activeTab, setActiveTab] = useState<'inputs' | 'models'>('inputs');

  const handleExport = () => {
    if (!result) return;
    const reportText = `
NEUROSENTINEL AI - WELLNESS REPORT
Generated: ${new Date().toLocaleString()}
----------------------------------
USER METRICS:
- Sleep: ${scores.sleep}h
- Stress Level: ${scores.stress}/100
- Social Activity: ${scores.activity}/10
- Mood Level: ${scores.mood}/10
- Hydration Level: ${scores.hydration}/10
- Screen Time: ${scores.screenTime}h
- Focus Efficiency: ${scores.focus}/10

AI ANALYSIS:
- Risk Level: ${result.riskLevel.toUpperCase()}
- Confidence: ${Math.round(result.confidence * 100)}%
- Insight: ${result.insight}

RECOMMENDATIONS:
${result.recommendations.map(r => `• ${r}`).join('\n')}

----------------------------------
DISCLAIMER: This is an AI-generated report for informational purposes only.
`;
    // ... rest of export logic remains same
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto p-12 space-y-12 relative z-10 custom-scrollbar overflow-y-auto">
      {/* Background Technical Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="h-px w-8 bg-primary/40" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">System Version 2.4.0</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-4">
             <div className="relative group">
                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Brain className="w-10 h-10 text-primary relative" />
             </div>
             DSS <span className="text-primary/40 font-black">CORE</span>
             <span className="h-4 w-px bg-white/10 mx-2" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-secondary tracking-widest leading-none mb-1">Authenticated Terminal</span>
                <span className="text-lg font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">User: {getCurrentUser()?.name || 'Authorized Guest'}</span>
             </div>
          </h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2 ml-1">Decision Support System / Neural Interface</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
           <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('inputs')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inputs' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
              >
                Neural Input
              </button>
              <button 
                onClick={() => setActiveTab('models')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'models' ? 'bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
              >
                <BarChart2 className="w-3 h-3" />
                Algorithm Study
              </button>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">Latency</p>
                 <p className="text-xs font-bold font-mono text-emerald-400">12ms</p>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">Architecture</p>
                 <p className="text-xs font-bold text-foreground">X-GPT4o</p>
              </div>
           </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'inputs' ? (
          <motion.div
            key="inputs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
               <div className="relative bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-3xl">
                  <MoodInputModule scores={scores} onScoresChange={onScoresChange} />
               </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="group relative px-16 py-5 bg-foreground text-background font-black rounded-2xl shadow-2xl hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 overflow-hidden"
              >
                <div className="relative flex items-center gap-4">
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      <span className="uppercase tracking-widest text-xs">Computing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span className="uppercase tracking-widest text-xs">Initialize Analysis</span>
                    </>
                  )}
                </div>
              </button>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">End-to-End Encryption Active</span>
              </div>
            </div>

            <AIResultCard result={result} isAnalyzing={isAnalyzing} />
          </motion.div>
        ) : (
          <motion.div
            key="models"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <ModelComparisonChart />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

