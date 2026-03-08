import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult, getMoodColor } from '@/lib/dashboard-utils';
import { AlertCircle, CheckCircle, AlertTriangle, Activity, ShieldCheck, Zap } from 'lucide-react';

interface AIResultCardProps {
  result: AnalysisResult | null;
  isAnalyzing?: boolean;
}

export function AIResultCard({ result, isAnalyzing }: AIResultCardProps) {
  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'mild': return <ShieldCheck className="w-6 h-6" />;
      case 'moderate': return <Activity className="w-6 h-6" />;
      case 'severe': return <AlertCircle className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'mild': return 'Optimal Equilibrium';
      case 'moderate': return 'Adaptive Load Detected';
      case 'severe': return 'Critical Intervention Required';
      default: return 'System Syncing';
    }
  };

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
          {/* Medical AI Scanner Effect */}
          <motion.div 
            animate={{ y: ['0%', '400%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent z-0 opacity-20"
          />

          <div className="relative z-10">
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                      {getRiskIcon(result.riskLevel)}
                   </div>
                   <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Diagnostic Output</h3>
                      <p className="text-lg font-black text-foreground">{getRiskLabel(result.riskLevel)}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">AI Confidence</p>
                   <p className="text-2xl font-black text-primary">{Math.round(result.confidence * 100)}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence * 100}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
               {/* Explainability Column */}
               <div className="p-8 border-r border-white/5 space-y-6">
                  <header>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Feature Attribution</h4>
                  </header>
                  <div className="space-y-4">
                    {result.contributions.map((cont, i) => (
                      <div key={cont.feature} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                          <span className="text-foreground/80">{cont.feature}</span>
                          <span className={cont.impact === 'positive' ? 'text-emerald-400' : 'text-rose-400'}>
                            {cont.impact === 'positive' ? 'Supporting' : 'Stressing'}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${cont.weight * 100}%` }}
                            className={`h-full ${cont.impact === 'positive' ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Decisions & Logic Column */}
               <div className="p-8 space-y-8 bg-black/20">
                  <section>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Automated Directives</h4>
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
                             {i+1}
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
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

