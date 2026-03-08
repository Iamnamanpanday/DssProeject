'use client';

export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  baseline: {
    sleep: number;
    stress: number;
    activity: number;
    mood: number;
  };
}

export interface MoodEntry {
  date: string;
  sleep: number;
  stress: number;
  activity: number;
  mood: number;
  note?: string;
  riskLevel?: string;
}

const PROFILE_KEY = 'neuros_user_profile';
const HISTORY_KEY = 'neuros_mood_history';

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const hasCompletedOnboarding = (): boolean => {
  return getProfile() !== null;
};

export const saveMoodEntry = (entry: MoodEntry) => {
  const history = getMoodHistory();
  history.push(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getMoodHistory = (): MoodEntry[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};
