/**
 * API client for the Mental Health Decision Support System backend.
 * Supports all research-level endpoints:
 *   POST /api/predict          — full multi-model prediction
 *   GET  /api/compare-models   — 7-algorithm comparison table
 *   GET  /api/feature-importance
 *   GET  /api/analytics
 */

import { AnalysisResult, MentalHealthScore, ModelComparisonRow } from './dashboard-utils';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/** Raw shape returned by Flask /api/predict (v3) */
interface BackendPredictResponse {
  status: 'success' | 'error';
  data?: {
    risk_level: 'mild' | 'moderate' | 'severe';
    confidence: number;
    recommendation: string;
    probabilities: { mild: number; moderate: number; severe: number };
    wellness_score: number;
    relapse_risk: number;
    input_features: Record<string, number>;
  };
  message?: string;
}

interface BackendCompareResponse {
  status: 'success' | 'error';
  data?: {
    results: ModelComparisonRow[];
    algorithms_compared: number;
    metric_descriptions: Record<string, string>;
  };
}

interface BackendFeatureImportanceResponse {
  status: 'success' | 'error';
  data?: {
    feature_importance: { feature: string; display_name: string; importance: number }[];
  };
}

interface BackendAnalyticsResponse {
  status: 'success' | 'error';
  data?: {
    total_predictions: number;
    risk_distribution: Record<string, { count: number; percent: number }>;
    average_wellness_score: number;
    average_relapse_risk: number;
    average_confidence: number;
  };
}

/** Insight text per risk level */
const INSIGHTS: Record<string, string> = {
  mild: 'Your mental health metrics show positive trends. Keep maintaining your current wellness practices.',
  moderate: "You're experiencing some challenges. Consider adjusting your sleep schedule and stress management techniques.",
  severe: 'Your wellbeing indicators suggest you need immediate support. Consider reaching out to a healthcare professional.',
};

/**
 * Call the backend /api/predict endpoint and return a complete AnalysisResult.
 */
export async function predictMentalHealth(scores: MentalHealthScore): Promise<AnalysisResult> {
  const payload = {
    sleep_hours:      scores.sleep,
    stress_level:     Math.max(1, Math.min(10, Math.round((scores.stress / 100) * 10))),
    activity_level:   scores.activity,
    mood_score:       scores.mood,
    hydration_level:  scores.hydration,
    screen_time:      scores.screenTime,
    focus_efficiency: scores.focus,
  };

  const response = await fetch(`${BACKEND_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Backend returned ${response.status}`);
  }

  const json: BackendPredictResponse = await response.json();

  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'Unexpected response from backend');
  }

  const { risk_level, confidence, recommendation, probabilities, wellness_score, relapse_risk, input_features } = json.data;

  // Turn single recommendation string → array
  const recommendations = recommendation
    ? recommendation.split('. ').filter(Boolean).map((s) => (s.endsWith('.') ? s : s + '.'))
    : ['Maintain your current wellness routine.'];

  // Build contributions from input_features (normalised 0-1)
  const rawContributions = input_features
    ? Object.entries(input_features).map(([key, val]) => {
        const positiveKeys = ['sleep_hours', 'activity_level', 'mood_score', 'hydration_level', 'focus_efficiency', 'sleep_stress_ratio', 'lifestyle_score', 'digital_wellness'];
        const isPositive = positiveKeys.includes(key);
        return {
          feature: key,
          display_name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          weight: Math.min(1, Math.abs(val) / 15),
          impact: (isPositive ? 'positive' : 'negative') as 'positive' | 'negative',
          direction: (isPositive ? 'decreases_risk' : 'increases_risk') as 'decreases_risk' | 'increases_risk',
          input_value: val,
        };
      }).sort((a, b) => b.weight - a.weight).slice(0, 7)
    : [
        { feature: 'Sleep', display_name: 'Sleep Hours', weight: 0.8, impact: 'positive' as const, direction: 'decreases_risk' as const },
        { feature: 'Stress', display_name: 'Stress Level', weight: 0.4, impact: 'negative' as const, direction: 'increases_risk' as const },
        { feature: 'Activity', display_name: 'Activity Level', weight: 0.6, impact: 'positive' as const, direction: 'decreases_risk' as const },
      ];

  return {
    riskLevel: risk_level,
    confidence,
    recommendations,
    insight: INSIGHTS[risk_level] ?? INSIGHTS.mild,
    contributions: rawContributions,
    wellnessScore: wellness_score,
    relapseRisk: relapse_risk,
    probabilities,
  };
}

/** Simple health-check */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

/** Chat endpoint */
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

/** Fetch the 7-algorithm comparison table */
export async function fetchModelComparison(): Promise<ModelComparisonRow[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/compare-models`);
    const json: BackendCompareResponse = await res.json();
    return json.data?.results ?? [];
  } catch {
    return [];
  }
}

/** Fetch global feature importance */
export async function fetchFeatureImportance(): Promise<{ feature: string; display_name: string; importance: number }[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/feature-importance`);
    const json: BackendFeatureImportanceResponse = await res.json();
    return json.data?.feature_importance ?? [];
  } catch {
    return [];
  }
}

/** Fetch session analytics */
export async function fetchAnalytics() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/analytics`);
    const json: BackendAnalyticsResponse = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
