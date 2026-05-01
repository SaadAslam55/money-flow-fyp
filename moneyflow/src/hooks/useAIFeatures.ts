// src/hooks/useAIFeatures.ts
/**
 * AI Feature Flags Hook
 * Check which AI features are enabled by the user
 */

import { useCallback } from 'react';

const AI_FEATURES = [
  'ai_product_suggestions',
  'ai_expense_categorization',
  'ai_business_insights',
  'ai_anomaly_detection',
  'ai_revenue_prediction',
  'ai_churn_prediction',
  'ai_notifications',
] as const;

export type AIFeature = (typeof AI_FEATURES)[number];

function getStoredSettings(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem('ai_settings');
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return AI_FEATURES.reduce((acc, f) => ({ ...acc, [f]: true }), {} as Record<string, boolean>);
}

export function useAIFeatures() {
  const isEnabled = useCallback((feature: AIFeature): boolean => {
    const settings = getStoredSettings();
    return settings[feature] ?? true;
  }, []);

  const isAnyEnabled = useCallback((features: AIFeature[]): boolean => {
    return features.some((f) => isEnabled(f));
  }, [isEnabled]);

  return { isEnabled, isAnyEnabled };
}
