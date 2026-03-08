'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeftSidebar } from '@/components/left-sidebar';
import { ParticleBackground } from '@/components/particle-background';
import { AuthGuard } from '@/components/auth-guard';
import { Heart, Phone, Info, ExternalLink, Zap, ShieldCheck, Waves, Wind } from 'lucide-react';

export default function ResourcesPage() {
  const [breathingActive, setBreathingActive] = useState(false);

  const hotlines = [
    { name: 'Vandrevala Foundation', phone: '1860-266-2345', detail: 'General Support' },
    { name: 'iCall (TISS)', phone: '9152987821', detail: 'Mon-Sat, 10am-8pm' },
    { name: 'Kiran Helpline', phone: '1800-599-0019', detail: '24/7 Government' },
    { name: 'Sneha Foundation', phone: '044-24640050', detail: 'Crisis & Suicide Prevention' },
  ];

  const tips = [
     { icon: ShieldCheck, title: 'Check Your Baseline', desc: 'When overwhelmed, compare today to your baseline in Analytics.' },
     { icon: Zap, title: 'Ground Yourself', desc: 'Identify 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.' },
     { icon: Waves, title: 'Hydrate', desc: 'Dehydration can mimic stress symptoms.' },
  ];

  return (
    <AuthGuard>
      <div className="flex bg-background text-foreground min-h-screen overflow-hidden">
        <ParticleBackground />
        <LeftSidebar />

        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-12 pb-12">
            {/* Header */}
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-black mb-2"
              >
                Safe Space Resources
              </motion.h1>
              <p className="text-muted-foreground">Immediate support and self-help tools when you need them most.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Emergency Contacts */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="p-8 rounded-3xl border border-border"
                 style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
               >
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                    <Phone className="w-6 h-6 text-red-400" /> Crisis Hotlines
                  </h3>
                  <div className="space-y-4">
                     {hotlines.map((h, i) => (
                        <div key={h.name} className="p-4 rounded-xl bg-muted/20 border border-border hover:border-red-400/30 transition-all group flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold text-foreground">{h.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{h.detail}</p>
                           </div>
                           <a href={`tel:${h.phone}`} className="flex items-center gap-2 text-red-400 font-black text-sm group-hover:scale-110 transition-transform">
                              {h.phone} <ExternalLink className="w-3 h-3" />
                           </a>
                        </div>
                     ))}
                  </div>
                  <div className="mt-8 p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-xs text-center font-black uppercase tracking-widest animate-pulse">
                     If in immediate danger, dial 112 directly.
                  </div>
               </motion.div>

               {/* Breathing Tool */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="p-8 rounded-3xl border border-border flex flex-col items-center justify-center relative overflow-hidden"
                 style={{ background: 'rgba(59, 130, 246, 0.05)', backdropFilter: 'blur(20px)' }}
               >
                  <div className="text-center mb-10 z-10">
                     <h3 className="text-xl font-black mb-2 flex items-center gap-3 justify-center">
                       <Wind className="w-6 h-6 text-primary" /> Box Breathing
                     </h3>
                     <p className="text-sm text-muted-foreground italic">Sync your mind, steady your heart.</p>
                  </div>

                  <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                     {/* Breathing Circle */}
                     <motion.div 
                        animate={breathingActive ? { scale: [1, 1.8, 1.8, 1] } : { scale: 1 }}
                        transition={breathingActive ? { duration: 16, repeat: Infinity, times: [0, 0.25, 0.5, 1], ease: 'easeInOut' } : {}}
                        className="absolute inset-0 rounded-full bg-primary/20 border border-primary/40 blur-xl"
                     />
                     <motion.div 
                        animate={breathingActive ? { scale: [1, 1.8, 1.8, 1] } : { scale: 1 }}
                        transition={breathingActive ? { duration: 16, repeat: Infinity, times: [0, 0.25, 0.5, 1], ease: 'easeInOut' } : {}}
                        className="w-24 h-24 rounded-full border-2 border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)] z-10 flex items-center justify-center"
                     >
                        <AnimatePresence mode="wait">
                           {breathingActive ? (
                              <motion.span 
                                key="text" 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                className="text-[10px] font-black uppercase tracking-tighter"
                              >
                                {/** Cycle text logic simulation */}
                                {/* Inhale | Hold | Exhale | Hold */}
                                Breathing
                              </motion.span>
                           ) : (
                              <Heart className="w-8 h-8 text-primary" />
                           )}
                        </AnimatePresence>
                     </motion.div>
                  </div>

                  <button 
                    onClick={() => setBreathingActive(!breathingActive)}
                    className="relative z-10 px-10 py-3 bg-primary text-primary-foreground font-black rounded-full hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/25"
                  >
                     {breathingActive ? 'Stop Session' : 'Start Session'}
                  </button>
               </motion.div>
            </div>

            {/* AI Wellness Tips Grid */}
            <div className="space-y-6">
               <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
                  <Info className="w-4 h-4" /> AI Wellness Tips
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tips.map((t, i) => (
                     <motion.div 
                        key={t.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-default"
                     >
                        <t.icon className="w-8 h-8 text-secondary mb-4" />
                        <h4 className="text-lg font-bold mb-2">{t.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* Disclaimer Disclaimer */}
            <div className="p-6 rounded-xl border border-border border-dashed text-center">
              <p className="text-[10px] text-muted-foreground italic max-w-2xl mx-auto uppercase tracking-wider">
                NeuroSentinel is an AI support tool. It is not a clinical replacement for professional psychiatric help. If you are experiencing a life-threatening emergency, please contact professional emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
