'use client';

import { Droplets, Monitor, Target } from 'lucide-react';
import { MentalHealthScore } from '@/lib/dashboard-utils';
import { motion } from 'framer-motion';

export function WellnessStats({ scores }: { scores: MentalHealthScore }) {
  const stats = [
    { label: 'Hydration', value: scores.hydration, max: 10, unit: '/10', icon: Droplets, color: '#3b82f6' },
    { label: 'Screen Time', value: scores.screenTime, max: 12, unit: 'h', icon: Monitor, color: '#ef4444' },
    { label: 'Focus Score', value: scores.focus, max: 10, unit: '/10', icon: Target, color: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
       <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-foreground/80">Biological Telemetry</h4>
       <div className="space-y-6">
          {stats.map((stat, i) => (
             <motion.div 
               key={stat.label}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
             >
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-2">
                      <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                      <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest">{stat.label}</span>
                   </div>
                   <span className="text-xs font-black text-foreground">{stat.value}{stat.unit}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="h-full rounded-full"
                     style={{ background: stat.color, filter: `drop-shadow(0 0 4px ${stat.color})` }}
                   />
                </div>
             </motion.div>
          ))}
       </div>
    </div>
  );
}
