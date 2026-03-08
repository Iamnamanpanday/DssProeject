'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LeftSidebar } from '@/components/left-sidebar';
import { ParticleBackground } from '@/components/particle-background';
import { AuthGuard } from '@/components/auth-guard';
import { getMoodHistory, MoodEntry } from '@/lib/user-data';
import { Calendar, Clock, BookOpen, Trash2, PlusCircle, Filter } from 'lucide-react';
import { getMoodColor } from '@/lib/dashboard-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function HistoryPage() {
  const [history, setHistory] = useState<MoodEntry[]>([]);

  useEffect(() => {
    setHistory(getMoodHistory());
  }, []);

  return (
    <AuthGuard>
      <div className="flex bg-background text-foreground min-h-screen overflow-hidden">
        <ParticleBackground />
        <LeftSidebar />

        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex items-end justify-between">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold mb-2"
                >
                  Wellness History
                </motion.h1>
                <p className="text-muted-foreground italic">"Tracking is the first step toward transformation."</p>
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted/50 transition-all">
                  <Filter className="w-4 h-4" /> Filter by Date
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:brightness-110 transition-all">
                  <PlusCircle className="w-4 h-4" /> Add Entry
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Sidebar */}
              <div className="lg:col-span-2 space-y-8">
                {/* Trend Chart */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border p-6"
                  style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}
                >
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> 7-Day Trend
                  </h3>
                  <div className="h-[300px] w-full">
                    {history.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history.slice(-7)}>
                          <defs>
                            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={10} 
                            tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { weekday: 'short' })}
                          />
                          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 10]} />
                          <Tooltip 
                            contentStyle={{ background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                          />
                          <Area type="monotone" dataKey="mood" stroke="var(--primary)" fillOpacity={1} fill="url(#colorMood)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                        No data yet. Start tracking to see trends.
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Journal Timeline */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-secondary" /> Journal Entries
                  </h3>
                  {history.length > 0 ? (
                    history.slice().reverse().map((entry, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative flex gap-6 p-6 rounded-xl border border-border hover:border-primary/30 transition-all"
                        style={{ background: 'var(--glass-bg)' }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full border border-border bg-muted/20 flex flex-col items-center justify-center text-[10px] font-bold">
                            <span className="text-primary">{new Date(entry.date).getDate()}</span>
                            <span className="uppercase">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                          </div>
                          <div className="flex-1 w-px bg-border my-2 group-last:hidden" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-3">
                               <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" 
                                     style={{ background: `${getMoodColor(entry.riskLevel || 'mild')}20`, color: getMoodColor(entry.riskLevel || 'mild') }}>
                                 {entry.riskLevel || 'mild'} risk
                               </span>
                               <span className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                             <button className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                          <p className="text-sm font-medium mb-4">{entry.note || "No notes provided today."}</p>
                          <div className="grid grid-cols-4 gap-4">
                            {[
                              { label: 'Sleep', val: entry.sleep, max: 10 },
                              { label: 'Mood', val: entry.mood, max: 10 },
                              { label: 'Stress', val: entry.stress, max: 100 },
                              { label: 'Activity', val: entry.activity, max: 10 },
                            ].map(m => (
                              <div key={m.label}>
                                <div className="flex justify-between text-[10px] mb-1">
                                  <span>{m.label}</span>
                                  <span className="text-muted-foreground">{m.val}{m.label === 'Sleep' ? 'h' : ''}</span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary/40" style={{ width: `${(m.val / m.max) * 100}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-12 text-center rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                       Your history is empty. Time to start your journey!
                    </div>
                  )}
                </div>
              </div>

              {/* Heatmap/Insights Sidebar */}
              <div className="space-y-8">
                 <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl border border-border p-6"
                  style={{ background: 'var(--glass-bg)' }}
                >
                  <h3 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                    <Calendar className="w-4 h-4" /> 30-Day Activity
                  </h3>
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-[2px] ${i < 5 || i > 25 ? 'bg-primary/40 shadow-[0_0_8px_rgba(59,130,246,0.2)]' : 'bg-muted/10'}`} 
                        title={`Day ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[8px] text-muted-foreground font-bold uppercase tracking-tighter">
                     <span>Less Active</span>
                     <div className="flex gap-1">
                        {[0, 0.2, 0.4, 0.6, 0.8, 1].map(o => <div key={o} className="w-2 h-2 rounded-[1px] bg-primary" style={{ opacity: o }} />)}
                     </div>
                     <span>More Active</span>
                  </div>
                </motion.div>

                <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 p-6">
                  <h4 className="text-sm font-bold text-primary mb-2">History Highlight</h4>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    Your average mood increased by 15% this week compared to last week. Keep focusing on your sleep schedule!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
