'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '@/components/particle-background';
import { DashboardLayout } from '@/components/dashboard-layout';
import { FloatingOrb } from '@/components/floating-orb';
import { MentalHealthScore, AnalysisResult, calculateRiskLevel } from '@/lib/dashboard-utils';
import { predictMentalHealth, checkBackendHealth } from '@/lib/api';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import { AuthGuard } from '@/components/auth-guard';
import { getCurrentUser } from '@/lib/auth';

import { ChatPanel } from '@/components/chat-panel';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [scores, setScores] = useState<MentalHealthScore>({
    sleep: 7,
    stress: 45,
    activity: 5,
    mood: 7,
    hydration: 6,
    screenTime: 4,
    focus: 7,
  });


  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Check backend health and get user on mount
  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
    setUser(getCurrentUser());
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisResult = await predictMentalHealth(scores);
      setResult(analysisResult);
      setBackendOnline(true);
    } catch (err) {
      console.error('Backend prediction failed:', err);
      setBackendOnline(false);

      // Graceful fallback to local calculation
      const fallbackResult = calculateRiskLevel(scores);
      setResult(fallbackResult);
      setError(
        'Could not reach the AI backend — showing a local estimate. ' +
          'Make sure the Flask server is running on port 5000.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AuthGuard>
      <div className="bg-background text-foreground overflow-hidden">
        {/* Particle Background */}
        <ParticleBackground />

        {/* Backend status / error banner */}
        {error && (
          <div
            style={{
              position: 'fixed',
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              backdropFilter: 'blur(8px)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.25rem',
              color: '#fca5a5',
              fontSize: '0.875rem',
              maxWidth: '480px',
              textAlign: 'center',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Backend online indicator */}
        {backendOnline !== null && (
          <div
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1.5rem',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(15,20,25,0.7)',
              border: `1px solid ${backendOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              backdropFilter: 'blur(8px)',
              borderRadius: '2rem',
              padding: '0.35rem 0.85rem',
              fontSize: '0.75rem',
              color: backendOnline ? '#6ee7b7' : '#fca5a5',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: backendOnline ? '#10b981' : '#ef4444',
                boxShadow: `0 0 6px ${backendOnline ? '#10b981' : '#ef4444'}`,
                display: 'inline-block',
              }}
            />
            {backendOnline ? 'AI Backend Online' : 'AI Backend Offline'}
          </div>
        )}

        {/* Crisis Banner */}
        <AnimatePresence>
          {result?.riskLevel === 'severe' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border-b border-red-500/20 py-2.5 px-6 relative z-[60] flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-red-400"
            >
               <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
               </span>
               Urgent: High Distress Levels Detected. Local Resources available in "Resources" tab.
            </motion.div>
          )}
        </AnimatePresence>


        {/* Main Dashboard */}
        <DashboardLayout
          scores={scores}
          onScoresChange={setScores}
          result={result}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
        />

        {/* Floating Orb */}
        <FloatingOrb
          isAnalyzing={isAnalyzing}
          message={isAnalyzing ? 'Analyzing...' : 'NeuroSentinel AI'}
        />

        {/* AI Assistant */}
        <ChatPanel context={{ risk_level: result?.riskLevel || 'mild', ...scores }} />
      </div>
    </AuthGuard>
  );
}
