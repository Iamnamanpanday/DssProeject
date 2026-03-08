'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '@/components/particle-background';
import { getCurrentUser } from '@/lib/auth';
import { saveProfile, UserProfile } from '@/lib/user-data';
import { Brain, ArrowRight, ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import { MoodInputModule } from '@/components/mood-input-module';
import { MentalHealthScore } from '@/lib/dashboard-utils';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    occupation: '',
  });

  const [baseline, setBaseline] = useState<MentalHealthScore>({
    sleep: 7,
    stress: 40,
    activity: 5,
    mood: 7,
    hydration: 6,
    screenTime: 4,
    focus: 7,
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
      setProfile(prev => ({ ...prev, name: currentUser.name || '' }));
    }
  }, [router]);

  const handleComplete = () => {
    const fullProfile: UserProfile = {
      ...profile,
      baseline: { ...baseline }
    };
    saveProfile(fullProfile);
    router.push('/');
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex items-center justify-center p-6">
      <ParticleBackground />

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 w-16 rounded-full transition-all duration-500 ${
                step >= i ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-border backdrop-blur-xl p-10"
              style={{ background: 'var(--glass-bg)' }}
            >
              <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
              <p className="text-muted-foreground mb-8">Let's personalize your NeuroSentinel experience.</p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 ml-1">Age</label>
                    <input
                      type="number"
                      value={profile.age}
                      onChange={e => setProfile({...profile, age: e.target.value})}
                      className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      placeholder="e.g. 25"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 ml-1">Gender</label>
                    <select
                      value={profile.gender}
                      onChange={e => setProfile({...profile, gender: e.target.value})}
                      className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 ml-1">Occupation</label>
                  <input
                    type="text"
                    value={profile.occupation}
                    onChange={e => setProfile({...profile, occupation: e.target.value})}
                    className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={!profile.age || !profile.gender}
                  className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg flex items-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  Next Step <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-border backdrop-blur-xl p-10"
              style={{ background: 'var(--glass-bg)' }}
            >
              <h2 className="text-3xl font-bold mb-2">Establish Baseline</h2>
              <p className="text-muted-foreground mb-8">What does a typical "average" day look like for you lately?</p>

              <div className="bg-muted/10 rounded-xl p-6 border border-border/50">
                <MoodInputModule scores={baseline} onScoresChange={setBaseline} />
              </div>

              <div className="mt-10 flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-8 py-3 text-muted-foreground font-medium flex items-center gap-2 hover:text-foreground transition-all"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg flex items-center gap-2 hover:brightness-110 transition-all"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-border backdrop-blur-xl p-10 text-center"
              style={{ background: 'var(--glass-bg)' }}
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Optional Data Import</h2>
              <p className="text-muted-foreground mb-8">
                If you have historical wellness data (CSV), you can import it here to jumpstart your trends.
              </p>

              <div className="border-2 border-dashed border-border rounded-2xl p-12 mb-8 hover:border-primary/50 transition-colors cursor-pointer group">
                <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-sm font-medium text-muted-foreground">Drag & drop your CSV file or click to browse</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Expected format: date, sleep, stress, activity, mood</p>
              </div>

              <div className="flex justify-between items-center">
                 <button
                  onClick={prevStep}
                  className="px-8 py-3 text-muted-foreground font-medium flex items-center gap-2 hover:text-foreground transition-all"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={handleComplete}
                  className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold rounded-lg shadow-lg hover:shadow-primary/25 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-6 h-6" /> Finish Setup
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
