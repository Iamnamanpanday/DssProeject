'use client';

import { GradientSlider } from './gradient-slider';
import { MentalHealthScore } from '@/lib/dashboard-utils';

interface MoodInputModuleProps {
  scores: MentalHealthScore;
  onScoresChange: (scores: MentalHealthScore) => void;
}

export function MoodInputModule({ scores, onScoresChange }: MoodInputModuleProps) {
  const handleSleepChange = (sleep: number) => onScoresChange({ ...scores, sleep });
  const handleStressChange = (stress: number) => onScoresChange({ ...scores, stress });
  const handleActivityChange = (activity: number) => onScoresChange({ ...scores, activity });
  const handleMoodChange = (mood: number) => onScoresChange({ ...scores, mood });
  const handleHydrationChange = (hydration: number) => onScoresChange({ ...scores, hydration });
  const handleScreenTimeChange = (screenTime: number) => onScoresChange({ ...scores, screenTime });
  const handleFocusChange = (focus: number) => onScoresChange({ ...scores, focus });

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center py-6 bg-white/5 rounded-2xl border border-white/10 mb-8 backdrop-blur-md">
        <h3 className="text-xl font-black text-foreground uppercase tracking-widest flex items-center justify-center gap-3">
          Neural Input Vector
        </h3>
        <p className="text-[10px] text-primary/80 font-black uppercase tracking-[0.2em]">
          Synchronizing 7 biological markers with AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GradientSlider
          value={scores.sleep}
          onChange={handleSleepChange}
          label="Sleep"
          min={0}
          max={12}
          gradientStart="#7c3aed"
          gradientEnd="#2563eb"
          unit="h"
        />

        <GradientSlider
          value={scores.stress}
          onChange={handleStressChange}
          label="Stress"
          min={0}
          max={100}
          gradientStart="#f59e0b"
          gradientEnd="#ef4444"
          unit="%"
        />

        <GradientSlider
          value={scores.activity}
          onChange={handleActivityChange}
          label="Activity"
          min={0}
          max={10}
          gradientStart="#10b981"
          gradientEnd="#00d4ff"
          unit="/10"
        />

        <GradientSlider
          value={scores.mood}
          onChange={handleMoodChange}
          label="Mood"
          min={0}
          max={10}
          gradientStart="#a855f7"
          gradientEnd="#d946ef"
          unit="/10"
        />

        <GradientSlider
          value={scores.hydration}
          onChange={handleHydrationChange}
          label="Hydration"
          min={0}
          max={10}
          gradientStart="#0ea5e9"
          gradientEnd="#2563eb"
          unit="/10"
        />

        <GradientSlider
          value={scores.screenTime}
          onChange={handleScreenTimeChange}
          label="Screen Time"
          min={0}
          max={12}
          gradientStart="#ef4444"
          gradientEnd="#7c3aed"
          unit="h"
        />

        <div className="md:col-span-2">
          <GradientSlider
            value={scores.focus}
            onChange={handleFocusChange}
            label="Focus Efficiency"
            min={0}
            max={10}
            gradientStart="#14b8a6"
            gradientEnd="#10b981"
            unit="/10"
          />
        </div>
      </div>
    </div>
  );
}


