'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';

export function BreathingTool() {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [isActive, setIsActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      if (phase === 'Inhale') {
        timer = setTimeout(() => setPhase('Hold'), 4000);
      } else if (phase === 'Hold') {
        timer = setTimeout(() => setPhase('Exhale'), 4000);
      } else if (phase === 'Exhale') {
        timer = setTimeout(() => {
          setPhase('Inhale');
          setCycleCount(c => c + 1);
        }, 4000);
      }
    }
    return () => clearTimeout(timer);
  }, [isActive, phase]);

  const reset = () => {
    setIsActive(false);
    setPhase('Inhale');
    setCycleCount(0);
  };

  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-white/5 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <Wind className="w-4 h-4" /> Neural Reset
          </h4>
          <p className="text-[10px] text-muted-foreground font-medium">Box breathing protocol active</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button 
            onClick={reset}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative h-48 flex items-center justify-center overflow-hidden">
        {/* Pulsing Core */}
        <motion.div
          animate={{
            scale: !isActive ? 1 : phase === 'Inhale' ? 1.5 : phase === 'Hold' ? 1.5 : 1,
            opacity: !isActive ? 0.3 : 1,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary blur-2xl opacity-40 absolute"
        />
        
        <motion.div
          animate={{
            scale: !isActive ? 1 : phase === 'Inhale' ? 1.5 : phase === 'Hold' ? 1.5 : 1,
            backgroundColor: phase === 'Inhale' ? 'rgba(59, 130, 246, 0.4)' : phase === 'Hold' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(16, 185, 129, 0.4)',
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center z-10 relative backdrop-blur-lg"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-xs font-black uppercase tracking-widest text-white"
            >
              {isActive ? phase : 'Ready'}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Outer Ring */}
        <motion.div
           animate={isActive ? { rotate: 360 } : {}}
           transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
           className="absolute w-32 h-32 rounded-full border border-dashed border-white/10"
        />
      </div>

      <div className="flex justify-between items-center px-2">
        <div className="text-[10px] font-black uppercase text-muted-foreground">Cycles Complete</div>
        <div className="text-lg font-black text-foreground">{cycleCount}</div>
      </div>
    </div>
  );
}
