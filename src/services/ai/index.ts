// src/services/ai/index.ts
/**
 * AI Service - Phase 7: Advanced Features
 * Central export point for AI-powered features
 */

export {
  getProductSuggestions,
  getPricingSuggestion,
  getBusinessInsights,
  predictRevenue,
  categorizeExpense,
  detectAnomalies,
  predictChurn,
} from './aiService';

export type {
  AISuggestion,
  AIInsight,
  PredictionResult,
  ChurnPrediction,
} from './aiService';
