// src/hooks/useAI.ts
/**
 * AI Hooks - Phase 7: Advanced Features
 * React hooks for AI-powered features
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/services/supabase/client';
import {
  getProductSuggestions,
  getPricingSuggestion,
  getBusinessInsights,
  predictRevenue,
  categorizeExpense,
  detectAnomalies,
  predictChurn,
  type AISuggestion,
  type AIInsight,
  type PredictionResult,
  type ChurnPrediction,
} from '@/services/ai';

/**
 * Hook for product suggestions based on customer history
 */
export function useProductSuggestions(customerId: string | undefined) {
  const { user } = useAuth();
  const organizationId = user?.organization_id;

  return useQuery({
    queryKey: ['ai', 'product-suggestions', customerId, organizationId],
    queryFn: async () => {
      if (!customerId || !organizationId) {
        return [];
      }
      return getProductSuggestions(customerId, organizationId);
    },
    enabled: !!customerId && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for pricing suggestions
 */
export function usePricingSuggestion(
  productId: string | undefined,
  customerId: string | undefined
) {
  const { user } = useAuth();
  const organizationId = user?.organization_id;

  return useQuery({
    queryKey: ['ai', 'pricing-suggestion', productId, customerId, organizationId],
    queryFn: async () => {
      if (!productId || !customerId || !organizationId) {
        return null;
      }
      return getPricingSuggestion(productId, customerId, organizationId);
    },
    enabled: !!productId && !!customerId && !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for business insights
 */
export function useBusinessInsights() {
  const { user } = useAuth();
  const organizationId = user?.organization_id;

  return useQuery<AIInsight[]>({
    queryKey: ['ai', 'business-insights', organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return [];
      }
      return getBusinessInsights(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });
}

/**
 * Hook for revenue prediction
 * Tries Edge Function first, falls back to client-side processing
 */
export function useRevenuePrediction(months: number = 3) {
  const { user } = useAuth();
  const organizationId = user?.organization_id;

  return useQuery<PredictionResult>({
    queryKey: ['ai', 'revenue-prediction', organizationId, months],
    queryFn: async () => {
      if (!organizationId) {
        return { value: 0, confidence: 0, trend: 'stable' as const, factors: [] };
      }

      // Try Edge Function first
      const { predictRevenueBackend } = await import('@/services/ai/aiEdgeService');
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: historicalData } = await supabase
        .from('invoices')
        .select('total_amount, updated_at')
        .eq('organization_id', organizationId)
        .eq('status', 'paid')
        .gte('updated_at', sixMonthsAgo.toISOString())
        .order('updated_at', { ascending: true });

      const monthMap = new Map<string, number>();
      historicalData?.forEach((inv) => {
        if (inv.updated_at) {
          const monthKey = inv.updated_at.substring(0, 7);
          monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + (inv.total_amount || 0));
        }
      });

      const backendPayload = {
        historicalData: Array.from(monthMap.entries()).map(([month, amount]) => ({ month, amount })),
        monthsAhead: months,
      };

      const backendResult = await predictRevenueBackend(backendPayload);
      if (backendResult) {
        // Map backend response to PredictionResult shape
        return {
          value: backendResult.predictions[0]?.predicted || 0,
          confidence: backendResult.confidence,
          trend: backendResult.trend,
          factors: backendResult.factors,
        };
      }

      // Fall back to client-side
      return predictRevenue(organizationId, months);
    },
    enabled: !!organizationId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export type { AISuggestion, AIInsight, PredictionResult, ChurnPrediction };

// ============================================================
// Executive Summary
// ============================================================

export interface DashboardMetrics {
  revenue: number;
  revenueChange: number;
  outstanding: number;
  outstandingChange: number;
  customers: number;
  customersChange: number;
  invoices: number;
  invoicesChange: number;
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

// Client-side fallback for executive summary
function generateExecutiveSummaryFallback(metrics: DashboardMetrics): SummarySegment[] {
  const segments: SummarySegment[] = [];

  if (metrics.revenueChange > 10) {
    segments.push({ text: `Revenue is performing strongly with a ${metrics.revenueChange.toFixed(1)}% increase. `, sentiment: 'positive', highlight: `+${metrics.revenueChange.toFixed(1)}%` });
  } else if (metrics.revenueChange < -5) {
    segments.push({ text: `Revenue has declined by ${Math.abs(metrics.revenueChange).toFixed(1)}% compared to last period. `, sentiment: 'negative', highlight: `${metrics.revenueChange.toFixed(1)}%` });
  } else {
    segments.push({ text: `Revenue is stable with minimal change (${metrics.revenueChange.toFixed(1)}%). `, sentiment: 'neutral' });
  }

  if (metrics.outstanding > metrics.revenue * 0.3) {
    segments.push({ text: `Outstanding payments are elevated at ${Math.round(metrics.outstanding).toLocaleString()}. Consider follow-up actions.`, sentiment: 'warning' });
  } else if (metrics.outstandingChange < -10) {
    segments.push({ text: `Collection efficiency has improved with outstanding payments down ${Math.abs(metrics.outstandingChange).toFixed(1)}%.`, sentiment: 'positive' });
  }

  if (metrics.customersChange > 5) {
    segments.push({ text: `Customer base grew by ${metrics.customersChange.toFixed(1)}% this period.`, sentiment: 'positive' });
  } else if (metrics.customersChange < 0) {
    segments.push({ text: `Customer count decreased by ${Math.abs(metrics.customersChange).toFixed(1)}% — review retention strategies.`, sentiment: 'negative' });
  }

  if (metrics.overdueCount > 0) {
    segments.push({ text: `${metrics.overdueCount} invoices are overdue. Send reminders to accelerate cash flow.`, sentiment: 'warning' });
  }

  if (metrics.lowStockCount > 0) {
    segments.push({ text: `${metrics.lowStockCount} products are low on stock. Review inventory levels.`, sentiment: 'warning' });
  }

  if (metrics.topCustomerName) {
    segments.push({ text: `Top customer: ${metrics.topCustomerName} contributed ${Math.round(metrics.topCustomerRevenue || 0).toLocaleString()}.`, sentiment: 'positive' });
  }

  return segments;
}

/**
 * Hook for AI executive summary
 * Tries Edge Function first, falls back to client-side processing
 */
export function useExecutiveSummary(metrics: DashboardMetrics | null) {
  return useQuery<SummarySegment[]>({
    queryKey: ['ai', 'executive-summary', metrics],
    queryFn: async () => {
      if (!metrics) return [];

      // Try Edge Function first
      try {
        const { generateSummaryBackend } = await import('@/services/ai/aiEdgeService');
        const backendResult = await generateSummaryBackend(metrics);
        if (backendResult && backendResult.segments.length > 0) {
          return backendResult.segments;
        }
      } catch {
        // Fall through to client-side
      }

      // Fall back to client-side
      return generateExecutiveSummaryFallback(metrics);
    },
    enabled: !!metrics,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// ============================================================
// Natural Language Search
// ============================================================

export interface ParsedQuery {
  entity: 'invoices' | 'customers' | 'transactions' | 'products' | 'unknown';
  filters: {
    status?: string;
    dateRange?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'last_month' | 'last_quarter';
    amountMin?: number;
    amountMax?: number;
    category?: string;
    searchTerm?: string;
  };
  sort?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

// Client-side fallback for NL query parsing
function parseNaturalLanguageQueryFallback(raw: string): ParsedQuery {
  const lower = raw.toLowerCase();
  const result: ParsedQuery = { entity: 'unknown', filters: {} };

  // Entity detection
  if (/invoice|bill|receipt|payment due|unpaid/.test(lower)) result.entity = 'invoices';
  else if (/customer|client|buyer|party|debtor/.test(lower)) result.entity = 'customers';
  else if (/transaction|expense|income|spending|payment made|cash out/.test(lower)) result.entity = 'transactions';
  else if (/product|item|stock|inventory|goods/.test(lower)) result.entity = 'products';

  // Status detection
  if (/overdue|past due|late|unpaid|pending payment/.test(lower)) result.filters.status = 'overdue';
  else if (/paid|settled|completed|received/.test(lower)) result.filters.status = 'paid';
  else if (/draft|unpublished|pending/.test(lower)) result.filters.status = 'draft';
  else if (/sent|emailed|dispatched/.test(lower)) result.filters.status = 'sent';

  // Date range detection
  if (/today|this day/.test(lower)) result.filters.dateRange = 'today';
  else if (/this week|past week|last 7 days/.test(lower)) result.filters.dateRange = 'week';
  else if (/this month|past month|last 30 days/.test(lower)) result.filters.dateRange = 'month';
  else if (/last month|previous month/.test(lower)) result.filters.dateRange = 'last_month';
  else if (/this quarter|past quarter|last 3 months/.test(lower)) result.filters.dateRange = 'quarter';
  else if (/last quarter|previous quarter/.test(lower)) result.filters.dateRange = 'last_quarter';
  else if (/this year|past year|last 12 months|annual/.test(lower)) result.filters.dateRange = 'year';

  // Amount detection
  const overMatch = lower.match(/over\s+(\d+(?:,\d{3})*)/);
  const aboveMatch = lower.match(/above\s+(\d+(?:,\d{3})*)/);
  const moreThanMatch = lower.match(/more\s+than\s+(\d+(?:,\d{3})*)/);
  if (overMatch?.[1] || aboveMatch?.[1] || moreThanMatch?.[1]) {
    result.filters.amountMin = parseInt((overMatch?.[1] || aboveMatch?.[1] || moreThanMatch?.[1]!).replace(/,/g, ''), 10);
  }

  const underMatch = lower.match(/under\s+(\d+(?:,\d{3})*)/);
  const belowMatch = lower.match(/below\s+(\d+(?:,\d{3})*)/);
  const lessThanMatch = lower.match(/less\s+than\s+(\d+(?:,\d{3})*)/);
  if (underMatch?.[1] || belowMatch?.[1] || lessThanMatch?.[1]) {
    result.filters.amountMax = parseInt((underMatch?.[1] || belowMatch?.[1] || lessThanMatch?.[1]!).replace(/,/g, ''), 10);
  }

  const rangeMatch = lower.match(/between\s+(\d+(?:,\d{3})*)\s+and\s+(\d+(?:,\d{3})*)/);
  if (rangeMatch?.[1] && rangeMatch?.[2]) {
    result.filters.amountMin = parseInt(rangeMatch[1].replace(/,/g, ''), 10);
    result.filters.amountMax = parseInt(rangeMatch[2].replace(/,/g, ''), 10);
  }

  return result;
}

/**
 * Hook for natural language search query parsing
 * Tries Edge Function first, falls back to client-side processing
 */
export function useNLSearch() {
  return {
    parseQuery: async (query: string): Promise<ParsedQuery> => {
      if (!query.trim()) return { entity: 'unknown', filters: {} };

      // Try Edge Function first
      try {
        const { parseQueryBackend } = await import('@/services/ai/aiEdgeService');
        const backendResult = await parseQueryBackend({ query });
        if (backendResult) {
          return {
            entity: (backendResult.entity as ParsedQuery['entity']) || 'unknown',
            filters: backendResult.filters || {},
            sort: undefined,
          };
        }
      } catch {
        // Fall through to client-side
      }

      // Fall back to client-side
      return parseNaturalLanguageQueryFallback(query);
    },
  };
}

/**
 * Hook for customer churn prediction using RFM analysis
 */
export function useChurnPrediction() {
  const { user } = useAuth();
  const organizationId = user?.organization_id;

  return useQuery<ChurnPrediction[]>({
    queryKey: ['ai', 'churn-prediction', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return predictChurn(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook for AI expense categorization
 */
export function useCategorizeExpense() {
  return {
    categorize: (description: string) => categorizeExpense(description),
  };
}

/**
 * Hook for anomaly detection in transaction patterns
 * Tries Edge Function first, falls back to client-side processing
 */
export function useAnomalyDetection() {
  const { user } = useAuth();
  const organizationId = user?.organization_id;

  return useQuery<AIInsight[]>({
    queryKey: ['ai', 'anomaly-detection', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      // Try Edge Function first
      try {
        const { detectAnomaliesBackend } = await import('@/services/ai/aiEdgeService');
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, date, description')
          .eq('organization_id', organizationId)
          .eq('type', 'expense')
          .order('date', { ascending: false })
          .limit(100);

        const backendResult = await detectAnomaliesBackend({
          transactions: (transactions || []).map((t: { amount: number | null; date: string | null; description: string | null }) => ({
            amount: t.amount || 0,
            date: t.date || '',
            description: t.description || '',
          })),
        });

        if (backendResult && backendResult.anomalies.length > 0) {
          return backendResult.anomalies.map((a, i) => ({
            id: `anomaly-${i}`,
            type: 'expense' as const,
            title: a.severity === 'critical' ? 'Critical Anomaly Detected' : 'Spending Anomaly',
            description: `Transaction of ${a.amount} on ${a.date} - ${a.severity} level`,
            severity: a.severity,
            actionable: true,
            suggestedAction: 'Review this transaction for legitimacy',
          }));
        }
      } catch {
        // Fall through to client-side
      }

      // Fall back to client-side
      return detectAnomalies(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // Refresh hourly
  });
}
