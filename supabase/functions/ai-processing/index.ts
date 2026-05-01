// supabase/functions/ai-processing/index.ts
/**
 * AI Processing Edge Function
 * Backend AI processing for MoneyFlow
 *
 * Endpoints:
 *  POST /predict-revenue    - Revenue forecasting with linear regression
 *  POST /detect-anomalies   - Statistical anomaly detection in transactions
 *  POST /categorize         - NLP-based expense categorization
 *  POST /insights           - Business insights from aggregated data
 *
 * Usage:
 *  Deploy: supabase functions deploy ai-processing
 *  Invoke: POST https://<project>.supabase.co/functions/v1/ai-processing
 *          Headers: { Authorization: Bearer <token> }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: 'predict-revenue' | 'detect-anomalies' | 'categorize' | 'insights' | 'generate-summary' | 'nl-query' | 'health';
  organizationId?: string;
  data?: Record<string, unknown>;
}

// Linear regression for revenue prediction
function predictRevenue(historicalData: Array<{ month: string; amount: number }>, monthsAhead = 3) {
  const n = historicalData.length;
  if (n < 3) {
    return {
      predictions: [],
      confidence: 0.3,
      trend: 'stable' as const,
      factors: ['Insufficient historical data (need 3+ months)'],
    };
  }

  const x = historicalData.map((_, i) => i);
  const y = historicalData.map((d) => d.amount);

  const avgX = x.reduce((a, b) => a + b, 0) / n;
  const avgY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - avgX) * (y[i] - avgY);
    denominator += Math.pow(x[i] - avgX, 2);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = avgY - slope * avgX;

  const predictions = Array.from({ length: monthsAhead }, (_, i) => ({
    month: `Month ${n + i + 1}`,
    predicted: Math.max(0, Math.round(intercept + slope * (n + i))),
    confidence: Math.max(0.3, 0.9 - i * 0.15),
  }));

  const variance = y.reduce((sum, val) => sum + Math.pow(val - avgY, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const cv = avgY > 0 ? stdDev / avgY : 1;
  const confidence = Math.max(0.3, Math.min(0.95, 1 - cv));

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (slope > avgY * 0.05) trend = 'up';
  else if (slope < -avgY * 0.05) trend = 'down';

  return {
    predictions,
    confidence,
    trend,
    factors: [
      `Based on ${n} months of data`,
      `Average monthly revenue: ${Math.round(avgY).toLocaleString()}`,
      trend === 'up' ? 'Positive growth trend detected' : trend === 'down' ? 'Declining trend detected' : 'Stable revenue pattern',
    ],
  };
}

// Statistical anomaly detection
function detectAnomalies(
  transactions: Array<{ amount: number; date: string; category?: string; description?: string }>
) {
  if (transactions.length < 10) {
    return { anomalies: [], confidence: 0, message: 'Need at least 10 transactions for anomaly detection' };
  }

  const amounts = transactions.map((t) => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  const anomalies = transactions
    .filter((t) => {
      const zScore = stdDev > 0 ? Math.abs((t.amount - mean) / stdDev) : 0;
      return zScore > 2.5; // More than 2.5 standard deviations
    })
    .map((t) => ({
      ...t,
      zScore: stdDev > 0 ? Math.abs((t.amount - mean) / stdDev) : 0,
      severity: t.amount > mean + 3 * stdDev ? 'critical' : 'warning',
    }));

  return {
    anomalies,
    mean: Math.round(mean),
    stdDev: Math.round(stdDev),
    confidence: Math.min(0.95, transactions.length / 100),
  };
}

// Expense categorization with keyword matching
function categorizeExpense(description: string): string {
  const lower = description.toLowerCase();

  const categories = [
    { category: 'Equipment', keywords: ['equipment', 'computer', 'laptop', 'hardware', 'machine', 'pc', 'desktop'] },
    { category: 'Office Supplies', keywords: ['paper', 'pen', 'printer', 'ink', 'stationery', 'office'] },
    { category: 'Utilities', keywords: ['electricity', 'water', 'gas', 'internet', 'phone', 'utility', 'lesco', 'iesco', 'ptcl', 'wateen'] },
    { category: 'Rent', keywords: ['rent', 'lease', 'property', 'building'] },
    { category: 'Travel', keywords: ['travel', 'flight', 'hotel', 'taxi', 'uber', 'careem', 'transport'] },
    { category: 'Marketing', keywords: ['marketing', 'advertising', 'ads', 'promotion', 'campaign', 'facebook', 'google ads'] },
    { category: 'Software', keywords: ['software', 'subscription', 'saas', 'license', 'app'] },
    { category: 'Professional Services', keywords: ['consulting', 'legal', 'accounting', 'lawyer', 'ca'] },
    { category: 'Insurance', keywords: ['insurance', 'policy', 'premium'] },
    { category: 'Meals', keywords: ['meal', 'food', 'lunch', 'dinner', 'restaurant', 'catering'] },
    { category: 'Freight', keywords: ['shipping', 'freight', 'courier', 'tcs', 'leopards', 'delivery'] },
    { category: 'Government', keywords: ['tax', 'fbr', 'gst', 'customs', 'duty', 'stamp'] },
    { category: 'Digital Payments', keywords: ['jazzcash', 'easypaisa', 'raast', 'sadapay', 'nayapay'] },
  ];

  for (const { category, keywords } of categories) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }

  return 'Other';
}

// Generate business insights
function generateInsights(data: {
  totalRevenue: number;
  totalExpenses: number;
  invoiceCount: number;
  overdueCount: number;
  lowStockCount: number;
  customerCount: number;
}) {
  const insights: Array<{
    type: string;
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
    actionable: boolean;
    suggestion?: string;
  }> = [];

  if (data.overdueCount > 0) {
    insights.push({
      type: 'revenue',
      title: 'Overdue Invoices',
      description: `${data.overdueCount} invoices are past due`,
      severity: data.overdueCount > 5 ? 'critical' : 'warning',
      actionable: true,
      suggestion: 'Send payment reminders to customers',
    });
  }

  if (data.lowStockCount > 0) {
    insights.push({
      type: 'inventory',
      title: 'Low Stock Alert',
      description: `${data.lowStockCount} products need reordering`,
      severity: data.lowStockCount > 5 ? 'critical' : 'warning',
      actionable: true,
      suggestion: 'Review and restock inventory',
    });
  }

  if (data.totalRevenue > 0 && data.totalExpenses > 0) {
    const margin = (data.totalRevenue - data.totalExpenses) / data.totalRevenue;
    if (margin < 0.1) {
      insights.push({
        type: 'revenue',
        title: 'Low Profit Margin',
        description: `Profit margin is ${(margin * 100).toFixed(1)}%`,
        severity: 'warning',
        actionable: true,
        suggestion: 'Review pricing strategy or reduce expenses',
      });
    }
  }

  if (data.customerCount === 0) {
    insights.push({
      type: 'customer',
      title: 'No Customers Yet',
      description: 'Add customers to start invoicing',
      severity: 'info',
      actionable: true,
      suggestion: 'Create your first customer profile',
    });
  }

  return insights;
}

// Generate executive summary from business metrics
function generateSummary(metrics: {
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
}) {
  const segments: Array<{
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral' | 'warning';
    highlight?: string;
  }> = [];

  if (metrics.revenueChange > 10) {
    segments.push({
      text: `Revenue is performing strongly with a +${metrics.revenueChange.toFixed(1)}% increase. `,
      sentiment: 'positive',
      highlight: `+${metrics.revenueChange.toFixed(1)}%`,
    });
  } else if (metrics.revenueChange < -5) {
    segments.push({
      text: `Revenue has declined by ${Math.abs(metrics.revenueChange).toFixed(1)}%. `,
      sentiment: 'negative',
      highlight: `${metrics.revenueChange.toFixed(1)}%`,
    });
  } else {
    segments.push({
      text: `Revenue is stable (${metrics.revenueChange.toFixed(1)}%). `,
      sentiment: 'neutral',
    });
  }

  if (metrics.outstanding > metrics.revenue * 0.3) {
    segments.push({
      text: `Outstanding payments of ${metrics.outstanding.toLocaleString()} represent a significant portion of revenue. Collection efforts may be needed. `,
      sentiment: 'warning',
      highlight: `${metrics.outstanding.toLocaleString()}`,
    });
  }

  if (metrics.overdueCount > 5) {
    segments.push({
      text: `${metrics.overdueCount} overdue invoices require immediate attention. `,
      sentiment: 'warning',
      highlight: `${metrics.overdueCount} overdue`,
    });
  }

  if (metrics.lowStockCount > 3) {
    segments.push({
      text: `${metrics.lowStockCount} products need restocking to avoid stockouts. `,
      sentiment: 'warning',
      highlight: `${metrics.lowStockCount} low stock`,
    });
  }

  if (metrics.topCustomerName && metrics.topCustomerRevenue) {
    segments.push({
      text: `Top customer ${metrics.topCustomerName} contributed ${metrics.topCustomerRevenue.toLocaleString()}. `,
      sentiment: 'positive',
      highlight: metrics.topCustomerName,
    });
  }

  if (segments.length === 0) {
    segments.push({
      text: 'Business metrics are steady. Continue monitoring key indicators.',
      sentiment: 'neutral',
    });
  }

  return { segments, generatedAt: new Date().toISOString() };
}

// Parse natural language query into structured filters
function parseNaturalLanguageQuery(query: string) {
  const lower = query.toLowerCase();
  const result: {
    entity: string;
    filters: Record<string, string | number | boolean>;
    sort?: string;
  } = { entity: 'unknown', filters: {} };

  // Entity detection
  const entityPatterns = [
    { entity: 'invoices', patterns: ['invoice', 'bill', 'receipt'] },
    { entity: 'customers', patterns: ['customer', 'client', 'buyer'] },
    { entity: 'transactions', patterns: ['transaction', 'expense', 'income'] },
    { entity: 'products', patterns: ['product', 'item', 'stock'] },
  ];
  for (const { entity, patterns } of entityPatterns) {
    if (patterns.some((p) => lower.includes(p))) {
      result.entity = entity;
      break;
    }
  }

  // Status detection
  const statusPatterns = [
    { status: 'overdue', patterns: ['overdue', 'past due', 'late', 'unpaid'] },
    { status: 'paid', patterns: ['paid', 'settled', 'completed'] },
    { status: 'draft', patterns: ['draft', 'pending'] },
  ];
  for (const { status, patterns } of statusPatterns) {
    if (patterns.some((p) => lower.includes(p))) {
      result.filters.status = status;
      break;
    }
  }

  // Date range detection
  const datePatterns = [
    { range: 'today', patterns: ['today', 'this day'] },
    { range: 'week', patterns: ['this week', 'past week'] },
    { range: 'month', patterns: ['this month', 'past month', 'last 30 days'] },
    { range: 'quarter', patterns: ['this quarter', 'past quarter'] },
    { range: 'year', patterns: ['this year', 'past year', 'annual'] },
  ];
  for (const { range, patterns } of datePatterns) {
    if (patterns.some((p) => lower.includes(p))) {
      result.filters.dateRange = range;
      break;
    }
  }

  // Amount detection
  const amountMatch = lower.match(/over\s+(\d+(?:,\d{3})*)/) || lower.match(/above\s+(\d+(?:,\d{3})*)/);
  if (amountMatch && amountMatch[1]) {
    result.filters.amountMin = parseInt(amountMatch[1].replace(/,/g, ''), 10);
  }

  result.sort = 'date_desc';

  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, data: payload } = (await req.json()) as RequestBody;

    let result: unknown;

    switch (action) {
      case 'predict-revenue': {
        const historicalData = payload?.historicalData as Array<{ month: string; amount: number }>;
        const monthsAhead = (payload?.monthsAhead as number) || 3;
        result = predictRevenue(historicalData, monthsAhead);
        break;
      }

      case 'detect-anomalies': {
        const transactions = payload?.transactions as Array<{
          amount: number;
          date: string;
          category?: string;
          description?: string;
        }>;
        result = detectAnomalies(transactions);
        break;
      }

      case 'categorize': {
        const description = payload?.description as string;
        result = { category: categorizeExpense(description || ''), confidence: 0.85 };
        break;
      }

      case 'insights': {
        const businessData = payload as {
          totalRevenue: number;
          totalExpenses: number;
          invoiceCount: number;
          overdueCount: number;
          lowStockCount: number;
          customerCount: number;
        };
        result = generateInsights(businessData);
        break;
      }

      case 'generate-summary': {
        const metrics = payload as {
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
        };
        result = generateSummary(metrics);
        break;
      }

      case 'nl-query': {
        const query = payload?.query as string;
        result = parseNaturalLanguageQuery(query || '');
        break;
      }

      case 'health': {
        result = { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
