// src/services/ai/aiEdgeService.ts
/**
 * AI Edge Service Client
 * Frontend client for calling Supabase Edge Functions
 *
 * Usage:
 *  - Deploy edge function first: supabase functions deploy ai-processing
 *  - The function URL: https://<project-ref>.supabase.co/functions/v1/ai-processing
 *
 * Note: All calls require a valid JWT token (auto-injected by Supabase client)
 */

import { supabase } from '@/services/supabase/client';
import { logger } from '@/lib/logger';

const EDGE_FUNCTION_NAME = 'ai-processing';

interface EdgeResponse<T> {
  data: T | null;
  error: string | null;
}

async function callEdgeFunction<T>(action: string, payload: object): Promise<EdgeResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: { action, ...payload },
    });

    if (error) {
      logger.warn(`Edge function error [${action}]:`, error.message);
      return { data: null, error: error.message };
    }

    return { data: data as T, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Edge function call failed [${action}]:`, msg);
    return { data: null, error: msg };
  }
}

// ============================================================
// Revenue Prediction (Backend)
// ============================================================

export interface RevenuePredictionPayload {
  historicalData: Array<{ month: string; amount: number }>;
  monthsAhead?: number;
}

export interface RevenuePredictionResponse {
  predictions: Array<{ month: string; predicted: number; confidence: number }>;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

export async function predictRevenueBackend(
  payload: RevenuePredictionPayload
): Promise<RevenuePredictionResponse | null> {
  const { data, error } = await callEdgeFunction<RevenuePredictionResponse>('predict-revenue', payload);
  if (error) {
    logger.warn('Revenue prediction backend failed, falling back to client-side');
    return null;
  }
  return data;
}

// ============================================================
// Anomaly Detection (Backend)
// ============================================================

export interface AnomalyDetectionPayload {
  transactions: Array<{
    amount: number;
    date: string;
    category?: string;
    description?: string;
  }>;
}

export interface AnomalyDetectionResponse {
  anomalies: Array<{
    amount: number;
    date: string;
    zScore: number;
    severity: 'critical' | 'warning';
  }>;
  mean: number;
  stdDev: number;
  confidence: number;
}

export async function detectAnomaliesBackend(
  payload: AnomalyDetectionPayload
): Promise<AnomalyDetectionResponse | null> {
  const { data, error } = await callEdgeFunction<AnomalyDetectionResponse>('detect-anomalies', payload);
  if (error) {
    logger.warn('Anomaly detection backend failed, falling back to client-side');
    return null;
  }
  return data;
}

// ============================================================
// Expense Categorization (Backend)
// ============================================================

export interface CategorizePayload {
  description: string;
}

export interface CategorizeResponse {
  category: string;
  confidence: number;
}

export async function categorizeExpenseBackend(
  payload: CategorizePayload
): Promise<CategorizeResponse | null> {
  const { data, error } = await callEdgeFunction<CategorizeResponse>('categorize', payload);
  if (error) {
    logger.warn('Categorization backend failed, falling back to client-side');
    return null;
  }
  return data;
}

// ============================================================
// Business Insights (Backend)
// ============================================================

export interface InsightsPayload {
  totalRevenue: number;
  totalExpenses: number;
  invoiceCount: number;
  overdueCount: number;
  lowStockCount: number;
  customerCount: number;
}

export interface InsightItem {
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actionable: boolean;
  suggestion?: string;
}

export async function generateInsightsBackend(
  payload: InsightsPayload
): Promise<InsightItem[] | null> {
  const { data, error } = await callEdgeFunction<InsightItem[]>('insights', payload);
  if (error) {
    logger.warn('Insights backend failed, falling back to client-side');
    return null;
  }
  return data;
}

// ============================================================
// Executive Summary (Backend)
// ============================================================

export interface SummaryPayload {
  revenue: number;
  revenueChange: number;
  outstanding: number;
  outstandingChange: number;
  customers: number;
  customersChange: number;
  invoices: number;
  overdueCount: number;
  lowStockCount: number;
  topCustomerName?: string;
  topCustomerRevenue?: number;
}

export interface SummarySegment {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'warning';
  highlight?: string;
}

export interface SummaryResponse {
  segments: SummarySegment[];
  generatedAt: string;
}

export async function generateSummaryBackend(
  payload: SummaryPayload
): Promise<SummaryResponse | null> {
  const { data, error } = await callEdgeFunction<SummaryResponse>('generate-summary', payload);
  if (error) {
    logger.warn('Summary backend failed, falling back to client-side');
    return null;
  }
  return data;
}

// ============================================================
// Natural Language Query (Backend)
// ============================================================

export interface NLQueryPayload {
  query: string;
}

export interface NLQueryResponse {
  entity: string;
  filters: Record<string, string | number | boolean>;
  sort?: string;
}

export async function parseQueryBackend(
  payload: NLQueryPayload
): Promise<NLQueryResponse | null> {
  const { data, error } = await callEdgeFunction<NLQueryResponse>('nl-query', payload);
  if (error) {
    logger.warn('NL query backend failed, falling back to client-side');
    return null;
  }
  return data;
}

// ============================================================
// Health Check
// ============================================================

export async function checkAIEdgeHealth(): Promise<boolean> {
  try {
    const { data } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: { action: 'health' },
    });
    return !!data;
  } catch {
    return false;
  }
}

// ============================================================
// Auth Verification Service
// ============================================================

const AUTH_VERIFICATION_FUNCTION = 'auth-verification';

export interface VerificationResponse {
  success: boolean;
  user?: {
    id: string;
    email?: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
  };
  error?: string;
}

export interface VerificationStatus {
  success: boolean;
  verified: {
    email: boolean;
    phone: boolean;
  };
  contact: {
    email: string;
    phone?: string;
  };
}

export async function checkAuthHealth(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke(`${AUTH_VERIFICATION_FUNCTION}/health`, {
      method: 'GET',
    });
    return !error && data?.status === 'healthy';
  } catch {
    return false;
  }
}

export async function verifyEmailWithToken(
  token: string,
  type: 'signup' | 'email_change' = 'signup'
): Promise<VerificationResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(`${AUTH_VERIFICATION_FUNCTION}/verify-email`, {
      body: { token, type },
    });

    if (error) throw error;
    return data as VerificationResponse;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function resendVerificationEmail(
  email: string,
  redirectTo?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke(`${AUTH_VERIFICATION_FUNCTION}/resend-verification`, {
      body: { email, redirectTo },
    });

    if (error) throw error;
    return data as { success: boolean; message: string };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function checkUserVerificationStatus(userId: string): Promise<VerificationStatus | null> {
  try {
    const { data, error } = await supabase.functions.invoke(`${AUTH_VERIFICATION_FUNCTION}/check-verification`, {
      body: { userId },
    });

    if (error) throw error;
    return data as VerificationStatus;
  } catch {
    return null;
  }
}
