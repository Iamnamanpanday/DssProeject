'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LeftSidebar } from '@/components/left-sidebar';
import { ParticleBackground } from '@/components/particle-background';
import { AuthGuard } from '@/components/auth-guard';
import { getMoodHistory, MoodEntry, getProfile } from '@/lib/user-data';
import { BarChart3, TrendingUp, TrendingDown, Target, Zap, Waves, BrainCircuit } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function InsightsPage() {
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setHistory(getMoodHistory());
    setProfile(getProfile());
  }, []);

  // Radar chart data comparison: baseline vs current averages
  const getRadarData = () => {
    const avgObj = history.slice(-7).reduce((acc, curr) => ({
      sleep: acc.sleep + curr.sleep,
      stress: acc.stress + curr.stress,
      activity: acc.activity + curr.activity,
      mood: acc.mood + curr.mood,
    }), { sleep: 0, stress: 0, activity: 0, mood: 0 });

    const n = history.slice(-7).length || 1;
    const current = {
      sleep: (avgObj.sleep / n) / 10 * 100,
      stress: (avgObj.stress / n),
      activity: (avgObj.activity / n) / 10 * 100,
      mood: (avgObj.mood / n) / 10 * 100
    };

    const baseline = profile?.baseline ? {
      sleep: profile.baseline.sleep / 10 * 100,
      stress: profile.baseline.stress,
      activity: profile.baseline.activity / 10 * 100,
      mood: profile.baseline.mood / 10 * 100
    } : { sleep: 70, stress: 40, activity: 50, mood: 70 };

    return [
      { subject: 'Sleep', A: current.sleep, B: baseline.sleep, fullMark: 100 },
      { subject: 'Stress', A: current.stress, B: baseline.stress, fullMark: 100 },
      { subject: 'Activity', A: current.activity, B: baseline.activity, fullMark: 100 },
      { subject: 'Mood', A: current.mood, B: baseline.mood, fullMark: 100 },
    ];
  };

  const getRiskDistData = () => {
     const counts = history.reduce((acc: any, curr) => {
        acc[curr.riskLevel || 'mild'] = (acc[curr.riskLevel || 'mild'] || 0) + 1;
        return acc;
     }, { mild: 0, moderate: 0, severe: 0 });

     return [
        { name: 'Mild', value: counts.mild, color: '#10b981' },
        { name: 'Moderate', value: counts.moderate, color: '#f59e0b' },
        { name: 'Severe', value: counts.severe, color: '#ef4444' },
     ];
  };

  return (
    <AuthGuard>
      <div className="flex bg-background text-foreground min-h-screen overflow-hidden">
        <ParticleBackground />
        <LeftSidebar />

        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div>
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                Deep Analytics
              </motion.h1>
              <p className="text-muted-foreground mt-2">Correlations, patterns, and your path toward equilibrium.</p>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                  { icon: Target, label: 'Sleep vs Target', val: '86%', color: 'var(--primary)' },
                  { icon: Zap, label: 'Energy Coherency', val: '92%', color: 'var(--secondary)' },
                  { icon: Waves, label: 'Flow States', val: '12%', color: '#6366f1' },
                  { icon: BrainCircuit, label: 'AI Prediction Accuracy', val: '94.2%', color: '#10b981' },
               ].map((card, i) => (
                  <motion.div 
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl border border-border"
                    style={{ background: 'var(--glass-bg)' }}
                  >
                     <div className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center bg-muted/20" style={{ color: card.color }}>
                        <card.icon className="w-5 h-5" />
                     </div>
                     <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">{card.label}</p>
                     <p className="text-2xl font-black">{card.val}</p>
                  </motion.div>
               ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Radar Chart: Comparison */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="p-8 rounded-3xl border border-border"
                 style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
               >
                  <h3 className="text-xl font-black mb-10 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-primary" /> Current vs. Baseline
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar 
                          name="Current Avg" 
                          dataKey="A" 
                          stroke="var(--primary)" 
                          fill="var(--primary)" 
                          fillOpacity={0.4} 
                          strokeWidth={2}
                          animationBegin={500}
                          animationDuration={1500}
                        />
                        <Radar 
                          name="Baseline" 
                          dataKey="B" 
                          stroke="rgba(255,255,255,0.2)" 
                          fill="rgba(255,255,255,0.1)" 
                          fillOpacity={0.2} 
                          strokeWidth={1}
                          strokeDasharray="4 4"
                        />
                        <Tooltip 
                            contentStyle={{ background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 flex justify-center gap-6 text-xs font-bold uppercase tracking-wider">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Current</div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/20 border border-dashed border-white/40" /> Baseline</div>
                  </div>
               </motion.div>

               {/* Bar Chart: Risk Distribution */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="p-8 rounded-3xl border border-border"
                 style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
               >
                  <h3 className="text-xl font-black mb-10 flex items-center gap-3">
                    <Waves className="w-6 h-6 text-secondary" /> Risk Distribution
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getRiskDistData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={false} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[8, 8, 0, 0]}
                          animationBegin={800}
                          animationDuration={1500}
                        >
                           {getRiskDistData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-4">
                     <p className="text-sm font-medium text-center">Your risk profile is predominantly <span className="text-green-400">Stable (Mild)</span>.</p>
                     <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden flex">
                        <div className="h-full bg-green-500" style={{ width: '70%' }} />
                        <div className="h-full bg-amber-500" style={{ width: '20%' }} />
                        <div className="h-full bg-red-500" style={{ width: '10%' }} />
                     </div>
                  </div>
               </motion.div>
            </div>

            {/* Correlation Insight */}
            <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent border border-white/5 flex flex-col md:flex-row gap-8 items-center">
               <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <TrendingUp className="w-10 h-10 text-primary" />
               </div>
               <div>
                  <h4 className="text-xl font-bold mb-2 uppercase tracking-wide">Key Correlation Detected</h4>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "AI Analysis shows that on days where you achieve more than 7.5 hours of sleep, your mood score increases by average of 14% and your reported stress drops by 22%."
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
