export interface MentalHealthScore {
  sleep: number;
  stress: number;
  activity: number;
  mood: number;
  hydration: number; // 0-10
  screenTime: number; // 0-12 hours
  focus: number; // 0-10
}

export interface FeatureContribution {
  feature: string;
  display_name: string;
  weight: number;
  shap_value?: number;
  input_value?: number;
  impact: 'positive' | 'negative' | 'neutral';
  direction?: 'increases_risk' | 'decreases_risk';
}

export interface RiskProbabilities {
  mild: number;
  moderate: number;
  severe: number;
}

export interface ModelComparisonRow {
  Algorithm: string;
  'Test Accuracy': number;
  'Macro F1': number;
  'CV Mean (10-fold)': number;
  'CV Std': number;
}

export interface AnalysisResult {
  riskLevel: 'mild' | 'moderate' | 'severe';
  confidence: number;
  recommendations: string[];
  insight: string;
  contributions: FeatureContribution[];
  // NEW fields from research-level backend
  wellnessScore?: number;          // 0–100 continuous score
  relapseRisk?: number;            // 0–1 probability
  probabilities?: RiskProbabilities; // per-class probabilities
}

export function calculateRiskLevel(scores: MentalHealthScore): AnalysisResult {
  const { sleep, stress, activity, mood, hydration, screenTime, focus } = scores;

  const contributions: FeatureContribution[] = [
    { feature: 'Sleep', display_name: 'Sleep Hours', weight: (sleep / 12), impact: sleep > 7 ? 'positive' : 'negative', direction: sleep > 7 ? 'decreases_risk' : 'increases_risk' },
    { feature: 'Stress', display_name: 'Stress Level', weight: (stress / 100), impact: stress < 40 ? 'positive' : 'negative', direction: stress < 40 ? 'decreases_risk' : 'increases_risk' },
    { feature: 'Activity', display_name: 'Activity Level', weight: (activity / 10), impact: activity > 5 ? 'positive' : 'negative', direction: activity > 5 ? 'decreases_risk' : 'increases_risk' },
    { feature: 'Mood', display_name: 'Mood Score', weight: (mood / 10), impact: mood > 6 ? 'positive' : 'negative', direction: mood > 6 ? 'decreases_risk' : 'increases_risk' },
    { feature: 'Hydration', display_name: 'Hydration Level', weight: (hydration / 10), impact: hydration > 7 ? 'positive' : 'negative', direction: hydration > 7 ? 'decreases_risk' : 'increases_risk' },
    { feature: 'Screen Time', display_name: 'Screen Time', weight: (screenTime / 12), impact: screenTime < 5 ? 'positive' : 'negative', direction: screenTime < 5 ? 'decreases_risk' : 'increases_risk' },
    { feature: 'Focus', display_name: 'Focus Efficiency', weight: (focus / 10), impact: focus > 6 ? 'positive' : 'negative', direction: focus > 6 ? 'decreases_risk' : 'increases_risk' },
  ];

  // Calculate overall wellness score (0-100)
  const overallScore =
    (sleep / 12 * 20) +
    ((100 - stress) / 100 * 20) +
    (activity / 10 * 15) +
    (mood / 10 * 15) +
    (hydration / 10 * 10) +
    ((12 - screenTime) / 12 * 10) +
    (focus / 10 * 10);

  let riskLevel: 'mild' | 'moderate' | 'severe';
  const confidence = 0.88 + (Math.random() * 0.08);

  if (overallScore >= 70) {
    riskLevel = 'mild';
  } else if (overallScore >= 45) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'severe';
  }

  const mildProb = riskLevel === 'mild' ? confidence : (riskLevel === 'moderate' ? 0.2 : 0.05);
  const modProb  = riskLevel === 'moderate' ? confidence : (riskLevel === 'mild' ? 0.15 : 0.2);
  const sevProb  = 1 - mildProb - modProb;

  const recommendations = generateRecommendations(scores, riskLevel);
  const insight = generateInsight(scores, riskLevel);

  return {
    riskLevel,
    confidence: Math.round(confidence * 100) / 100,
    recommendations,
    insight,
    contributions: contributions.sort((a, b) => b.weight - a.weight),
    wellnessScore: Math.round(overallScore * 10) / 10,
    relapseRisk: riskLevel === 'severe' ? 0.7 : riskLevel === 'moderate' ? 0.4 : 0.15,
    probabilities: {
      mild: Math.round(mildProb * 100) / 100,
      moderate: Math.round(modProb * 100) / 100,
      severe: Math.max(0, Math.round(sevProb * 100) / 100),
    },
  };
}


function generateRecommendations(scores: MentalHealthScore, riskLevel: string): string[] {
  const recommendations: string[] = [];

  if (scores.sleep < 7) recommendations.push('Prioritize 8 hours of restorative sleep');
  if (scores.stress > 60) recommendations.push('Engage in 5 minutes of deep belly breathing');
  if (scores.hydration < 6) recommendations.push('Increase your water intake for cognitive clarity');
  if (scores.screenTime > 8) recommendations.push('Reduce digital exposure to lower mental fatigue');
  if (scores.focus < 5) recommendations.push('Try a 25-minute Pomodoro focus session');

  if (recommendations.length === 0) {
    recommendations.push('Maintain your excellent wellness rhythm');
    recommendations.push('Explore new mindfulness practices');
  }

  return recommendations.slice(0, 3);
}

function generateInsight(scores: MentalHealthScore, riskLevel: string): string {
  const insights = {
    mild: `Your neural synchronization is optimal. You're maintaining a high state of resilience.`,
    moderate: `Subtle imbalances detected. Minor adjustments to hydration and screen time could restore balance.`,
    severe: `Significant distress signals present. Prioritize immediate rest and professional grounding.`,
  };

  return insights[riskLevel as keyof typeof insights] || insights.mild;
}


export function getMoodColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'mild':    return '#10b981';
    case 'moderate': return '#f59e0b';
    case 'severe':  return '#ef4444';
    default:        return '#00d4ff';
  }
}

export function getStabilityPercentage(scores: MentalHealthScore): number {
  const { sleep, stress, activity, mood, hydration, screenTime, focus } = scores;
  return Math.round((
    (sleep / 12) +
    ((100 - stress) / 100) +
    (activity / 10) +
    (mood / 10) +
    (hydration / 10) +
    ((12 - screenTime) / 12) +
    (focus / 10)
  ) / 7 * 100);
}

export const mockTrendData = [
  { date: 'Mon', mood: 6, stress: 65 },
  { date: 'Tue', mood: 7, stress: 60 },
  { date: 'Wed', mood: 5, stress: 72 },
  { date: 'Thu', mood: 8, stress: 55 },
  { date: 'Fri', mood: 7, stress: 58 },
  { date: 'Sat', mood: 9, stress: 40 },
  { date: 'Sun', mood: 8, stress: 45 },
];
