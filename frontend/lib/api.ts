/**
 * API client for the Mental Health Decision Support System backend.
 * Backend runs at http://localhost:5000
 */

import { AnalysisResult, MentalHealthScore } from './dashboard-utils';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/** Raw shape returned by the Flask /api/predict endpoint */
interface BackendPredictResponse {
  status: 'success' | 'error';
  data?: {
    risk_level: 'mild' | 'moderate' | 'severe';
    confidence: number;
    recommendation: string;
    input_features: {
      sleep_hours: number;
      stress_level: number;
      activity_level: number;
      mood_score: number;
    };
    contributions?: { feature: string; weight: number; impact: 'positive' | 'negative' | 'neutral' }[];
  };
  message?: string;
}


/** Insight text per risk level */
const INSIGHTS: Record<string, string> = {
  mild: 'Your mental health metrics show positive trends. Keep maintaining your current wellness practices.',
  moderate:
    "You're experiencing some challenges. Consider adjusting your sleep schedule and stress management techniques.",
  severe:
    'Your wellbeing indicators suggest you need immediate support. Consider reaching out to a healthcare professional.',
};

/**
 * Call the backend /api/predict endpoint.
 *
 * Scale conversions applied here so neither the backend nor UI components
 * need to know about each other's representation:
 *   - stress (0–100 UI)  → stress_level (1–10 backend)
 *   - sleep (0–12)       → sleep_hours  (unchanged)
 *   - activity (1–10)    → activity_level (unchanged)
 *   - mood (1–10)        → mood_score  (unchanged)
 */
export async function predictMentalHealth(scores: MentalHealthScore): Promise<AnalysisResult> {
  const payload = {
    sleep_hours: scores.sleep,
    stress_level: Math.max(1, Math.min(10, Math.round((scores.stress / 100) * 10))),
    activity_level: scores.activity,
    mood_score: scores.mood,
    hydration_level: scores.hydration,
    screen_time: scores.screenTime,
    focus_efficiency: scores.focus,
  };


  const response = await fetch(`${BACKEND_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody: BackendPredictResponse = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Backend returned ${response.status}`);
  }

  const json: BackendPredictResponse = await response.json();

  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'Unexpected response from backend');
  }

  const { risk_level, confidence, recommendation } = json.data;

  // Map backend single-string recommendation to recommendations array
  const recommendations = recommendation
    ? recommendation.split('. ').filter(Boolean).map((s) => (s.endsWith('.') ? s : s + '.'))
    : ['Maintain your current wellness routine.'];

  return {
    riskLevel: risk_level,
    confidence,
    recommendations,
    insight: INSIGHTS[risk_level] ?? INSIGHTS.mild,
    contributions: json.data?.contributions || [
      { feature: 'Sleep', weight: 0.8, impact: 'positive' },
      { feature: 'Stress', weight: 0.4, impact: 'negative' },
      { feature: 'Activity', weight: 0.6, impact: 'positive' }
    ],
  };
}


/** Simple health-check to verify the backend is reachable */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Send a message to the AI chatbot with current context
 */
export async function sendChatMessage(message: string, context: any): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) throw new Error('Chat service unavailable');
  const json = await response.json();
  return json.data.reply;
}
