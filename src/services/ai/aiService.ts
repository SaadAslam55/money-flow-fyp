// src/services/ai/aiService.ts
/**
 * AI Service - Phase 7: Advanced Features
 * AI-powered features for smart suggestions and automation
 */

import { supabase } from '@/services/supabase/client';
import { logger } from '@/lib/logger';

/**
 * AI Suggestion types
 */
export interface AISuggestion {
  id: string;
  type: 'product' | 'customer' | 'price' | 'discount' | 'payment_term';
  value: string | number;
  confidence: number;
  reason: string;
}

export interface AIInsight {
  id: string;
  type: 'revenue' | 'expense' | 'customer' | 'inventory' | 'trend';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actionable: boolean;
  suggestedAction?: string;
}

export interface PredictionResult {
  value: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

/**
 * Get AI-powered product suggestions based on customer history
 */
export async function getProductSuggestions(
  customerId: string,
  organizationId: string
): Promise<AISuggestion[]> {
  try {
    // Get customer's purchase history
    const { data: invoices } = await supabase
      .from('invoices')
      .select('invoice_items(product_id, quantity, unit_price)')
      .eq('customer_id', customerId)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!invoices || invoices.length === 0) {
      return [];
    }

    // Analyze purchase patterns (simplified AI logic)
    const productFrequency = new Map<string, number>();

    invoices.forEach((invoice) => {
      const items = invoice.invoice_items as Array<{ product_id: string; quantity: number }>;
      items?.forEach((item) => {
        const count = productFrequency.get(item.product_id) || 0;
        productFrequency.set(item.product_id, count + item.quantity);
      });
    });

    // Get top products
    const sortedProducts = Array.from(productFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Get product details
    const productIds = sortedProducts.map(([id]) => id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name, unit_price')
      .in('id', productIds);

    return sortedProducts.map(([productId, frequency], index) => {
      const product = products?.find((p) => p.id === productId);
      return {
        id: `suggestion-${index}`,
        type: 'product' as const,
        value: product?.name || productId,
        suggestedPrice: product?.unit_price,
        confidence: Math.min(0.95, 0.5 + (frequency / 20) * 0.45),
        reason: `Purchased ${frequency} times in recent orders`,
      };
    });
  } catch (error) {
    logger.error('Error getting product suggestions:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Get AI-powered pricing suggestions
 */
export async function getPricingSuggestion(
  productId: string,
  customerId: string,
  organizationId: string
): Promise<AISuggestion | null> {
  try {
    // Get product info
    const { data: product } = await supabase
      .from('products')
      .select('unit_price, cost_price')
      .eq('id', productId)
      .single();

    if (!product) return null;

    // Get customer's purchase history for this product
    const { data: history } = await supabase
      .from('invoice_items')
      .select('unit_price, quantity, invoices!inner(customer_id)')
      .eq('product_id', productId)
      .eq('invoices.customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate suggested price based on history
    let suggestedPrice = product.unit_price;
    let reason = 'Standard pricing';

    if (history && history.length > 0) {
      const avgPrice = history.reduce((sum, h) => sum + (h.unit_price || 0), 0) / history.length;
      const totalQuantity = history.reduce((sum, h) => sum + (h.quantity || 0), 0);

      // Loyal customer discount
      if (totalQuantity > 50) {
        suggestedPrice = avgPrice * 0.95;
        reason = 'Loyal customer - 5% discount suggested';
      } else if (totalQuantity > 20) {
        suggestedPrice = avgPrice * 0.97;
        reason = 'Repeat customer - 3% discount suggested';
      }
    }

    return {
      id: 'price-suggestion',
      type: 'price',
      value: Math.round(suggestedPrice * 100) / 100,
      confidence: 0.85,
      reason,
    };
  } catch (error) {
    logger.error('Error getting pricing suggestion:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Get business insights based on data analysis
 */
export async function getBusinessInsights(organizationId: string): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];

  try {
    // Check for low stock items (stock below minimum_stock threshold)
    const { data: lowStock } = await supabase
      .from('products')
      .select('id, name, current_stock, minimum_stock')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    const criticalStock = lowStock?.filter(
      (p) => p.current_stock <= (p.minimum_stock || 10)
    );

    if (criticalStock && criticalStock.length > 0) {
      insights.push({
        id: 'low-stock',
        type: 'inventory',
        title: 'Low Stock Alert',
        description: `${criticalStock.length} products are running low on stock`,
        severity: criticalStock.length > 5 ? 'critical' : 'warning',
        actionable: true,
        suggestedAction: 'Review and reorder inventory',
      });
    }

    // Check for overdue invoices
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: overdueInvoices, count: overdueCount } = await supabase
      .from('invoices')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .in('status', ['sent', 'partially_paid'])
      .lt('due_date', thirtyDaysAgo.toISOString());

    if (overdueCount && overdueCount > 0) {
      insights.push({
        id: 'overdue-invoices',
        type: 'revenue',
        title: 'Overdue Invoices',
        description: `${overdueCount} invoices are overdue by more than 30 days`,
        severity: overdueCount > 10 ? 'critical' : 'warning',
        actionable: true,
        suggestedAction: 'Send payment reminders to customers',
      });
    }

    // Revenue trend analysis
    const currentMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString();

    const { data: currentRevenue } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('organization_id', organizationId)
      .eq('status', 'paid')
      .gte('updated_at', currentMonthStart);

    const { data: lastRevenue } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('organization_id', organizationId)
      .eq('status', 'paid')
      .gte('updated_at', lastMonthStart)
      .lt('updated_at', currentMonthStart);

    const currentTotal = currentRevenue?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;
    const lastTotal = lastRevenue?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

    if (lastTotal > 0) {
      const change = ((currentTotal - lastTotal) / lastTotal) * 100;

      if (change < -10) {
        insights.push({
          id: 'revenue-decline',
          type: 'revenue',
          title: 'Revenue Decline',
          description: `Revenue is down ${Math.abs(change).toFixed(1)}% compared to last month`,
          severity: change < -20 ? 'critical' : 'warning',
          actionable: true,
          suggestedAction: 'Review sales strategy and customer engagement',
        });
      } else if (change > 20) {
        insights.push({
          id: 'revenue-growth',
          type: 'revenue',
          title: 'Strong Revenue Growth',
          description: `Revenue is up ${change.toFixed(1)}% compared to last month`,
          severity: 'info',
          actionable: false,
        });
      }
    }

    // Top customer analysis
    const { data: topCustomers } = await supabase
      .from('invoices')
      .select('customer_id, total_amount')
      .eq('organization_id', organizationId)
      .eq('status', 'paid');

    if (topCustomers && topCustomers.length > 0) {
      const customerRevenue = new Map<string, number>();
      topCustomers.forEach((inv) => {
        const current = customerRevenue.get(inv.customer_id) || 0;
        customerRevenue.set(inv.customer_id, current + (inv.total_amount || 0));
      });

      const totalRevenue = Array.from(customerRevenue.values()).reduce((a, b) => a + b, 0);
      const topCustomerRevenue = Math.max(...Array.from(customerRevenue.values()));
      const topCustomerShare = (topCustomerRevenue / totalRevenue) * 100;

      if (topCustomerShare > 40) {
        insights.push({
          id: 'customer-concentration',
          type: 'customer',
          title: 'High Customer Concentration',
          description: `Top customer accounts for ${topCustomerShare.toFixed(1)}% of revenue`,
          severity: 'warning',
          actionable: true,
          suggestedAction: 'Diversify customer base to reduce risk',
        });
      }
    }

    return insights;
  } catch (error) {
    logger.error('Error getting business insights:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Predict future revenue
 */
export async function predictRevenue(
  organizationId: string,
  months: number = 3
): Promise<PredictionResult> {
  try {
    // Get historical revenue data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: historicalData } = await supabase
      .from('invoices')
      .select('total_amount, updated_at')
      .eq('organization_id', organizationId)
      .eq('status', 'paid')
      .gte('updated_at', sixMonthsAgo.toISOString())
      .order('updated_at', { ascending: true });

    if (!historicalData || historicalData.length < 3) {
      return {
        value: 0,
        confidence: 0.3,
        trend: 'stable',
        factors: ['Insufficient historical data'],
      };
    }

    // Group by month
    const monthlyRevenue: number[] = [];
    const monthMap = new Map<string, number>();

    historicalData.forEach((inv) => {
      if (inv.updated_at) {
        const monthKey = inv.updated_at.substring(0, 7);
        const current = monthMap.get(monthKey) || 0;
        monthMap.set(monthKey, current + (inv.total_amount || 0));
      }
    });

    monthlyRevenue.push(...Array.from(monthMap.values()));

    // Simple linear regression for prediction
    const n = monthlyRevenue.length;
    const avgX = (n - 1) / 2;
    const avgY = monthlyRevenue.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;

    monthlyRevenue.forEach((y, x) => {
      numerator += (x - avgX) * (y - avgY);
      denominator += (x - avgX) ** 2;
    });

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = avgY - slope * avgX;

    // Predict future value
    const predictedValue = intercept + slope * (n + months - 1);

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (slope > avgY * 0.05) trend = 'up';
    else if (slope < -avgY * 0.05) trend = 'down';

    // Calculate confidence based on data consistency
    const variance = monthlyRevenue.reduce((sum, val) => sum + (val - avgY) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avgY; // Coefficient of variation
    const confidence = Math.max(0.4, Math.min(0.9, 1 - cv));

    return {
      value: Math.max(0, Math.round(predictedValue)),
      confidence,
      trend,
      factors: [
        `Based on ${n} months of data`,
        `Average monthly revenue: ${avgY.toFixed(0)}`,
        trend === 'up'
          ? 'Positive growth trend'
          : trend === 'down'
            ? 'Declining trend'
            : 'Stable revenue',
      ],
    };
  } catch (error) {
    logger.error('Error predicting revenue:', error instanceof Error ? error.message : String(error));
    return {
      value: 0,
      confidence: 0,
      trend: 'stable',
      factors: ['Error in prediction'],
    };
  }
}

/**
 * Auto-categorize expense
 */
export function categorizeExpense(description: string): string {
  const lowerDesc = description.toLowerCase();

  // Check more specific categories first to avoid false matches
  // Order matters: check 'equipment' before 'office' to handle 'office equipment' correctly
  const categoryChecks: Array<{ category: string; keywords: string[] }> = [
    { category: 'Equipment', keywords: ['equipment', 'computer', 'laptop', 'hardware', 'machine'] },
    { category: 'Office Supplies', keywords: ['paper', 'pen', 'printer', 'ink', 'stationery', 'office supplies', 'desk supplies'] },
    { category: 'Utilities', keywords: ['electricity', 'water', 'gas', 'internet', 'phone', 'utility', 'lesco', 'iesco', 'gepco', 'sui gas', 'ptcl', 'wateen'] },
    { category: 'Rent', keywords: ['rent', 'lease', 'property'] },
    { category: 'Travel', keywords: ['travel', 'flight', 'hotel', 'taxi', 'uber', 'careem', 'transport', 'accommodation', 'bykea'] },
    { category: 'Marketing', keywords: ['marketing', 'advertising', 'ads', 'promotion', 'campaign', 'facebook ads', 'google ads'] },
    { category: 'Software', keywords: ['software', 'subscription', 'saas', 'license', 'app'] },
    { category: 'Professional Services', keywords: ['consulting', 'legal', 'accounting', 'lawyer', 'ca', 'chartered accountant'] },
    { category: 'Insurance', keywords: ['insurance', 'policy', 'premium'] },
    { category: 'Meals', keywords: ['meal', 'food', 'lunch', 'dinner', 'restaurant', 'catering', 'biryani', 'chai'] },
    { category: 'Freight & Shipping', keywords: ['shipping', 'freight', 'courier', 'tcs', 'leopards', 'daewoo', 'cargo', 'delivery'] },
    { category: 'Government & Tax', keywords: ['fbr', 'tax', 'gst', 'sales tax', 'income tax', 'customs', 'duty', 'stamp'] },
    { category: 'Digital Payments', keywords: ['jazzcash', 'easypaisa', 'raast', 'sadapay', 'nayapay', 'bank transfer', 'online payment'] },
  ];

  for (const { category, keywords } of categoryChecks) {
    if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
      return category;
    }
  }

  // Check for generic 'office' last (after equipment check)
  if (lowerDesc.includes('office') && !lowerDesc.includes('equipment')) {
    return 'Office Supplies';
  }

  return 'Other';
}

/**
 * Predict customer churn risk using RFM analysis
 * R = Recency (days since last purchase)
 * F = Frequency (number of purchases)
 * M = Monetary (total revenue from customer)
 */
export interface ChurnPrediction {
  customerId: string;
  customerName: string;
  riskScore: number; // 0-1, higher = more likely to churn
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recencyDays: number;
  frequency: number;
  monetaryValue: number;
  lastPurchaseDate: string | null;
  recommendation: string;
}

export async function predictChurn(organizationId: string): Promise<ChurnPrediction[]> {
  try {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, outstanding_balance')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (!customers || customers.length === 0) return [];

    const { data: invoices } = await supabase
      .from('invoices')
      .select('customer_id, total_amount, created_at, status')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (!invoices || invoices.length === 0) return [];

    const now = new Date();
    const customerMap = new Map<string, { total: number; count: number; lastDate: Date | null }>();

    invoices.forEach((inv) => {
      if (!inv.customer_id) return;
      const existing = customerMap.get(inv.customer_id) || { total: 0, count: 0, lastDate: null };
      existing.total += inv.total_amount || 0;
      existing.count += 1;
      const invDate = inv.created_at ? new Date(inv.created_at) : null;
      if (invDate && (!existing.lastDate || invDate > existing.lastDate)) {
        existing.lastDate = invDate;
      }
      customerMap.set(inv.customer_id, existing);
    });

    const maxRecency = Math.max(...Array.from(customerMap.values()).map((v) =>
      v.lastDate ? (now.getTime() - v.lastDate.getTime()) / (1000 * 60 * 60 * 24) : 365
    ));
    const maxFrequency = Math.max(...Array.from(customerMap.values()).map((v) => v.count), 1);
    const maxMonetary = Math.max(...Array.from(customerMap.values()).map((v) => v.total), 1);

    return customers.map((customer) => {
      const data = customerMap.get(customer.id);
      const recencyDays = data?.lastDate
        ? Math.floor((now.getTime() - data.lastDate.getTime()) / (1000 * 60 * 60 * 24))
        : 365;
      const frequency = data?.count || 0;
      const monetary = data?.total || 0;

      // Normalize RFM scores (0-1)
      const rScore = maxRecency > 0 ? 1 - Math.min(recencyDays / maxRecency, 1) : 0;
      const fScore = maxFrequency > 0 ? frequency / maxFrequency : 0;
      const mScore = maxMonetary > 0 ? monetary / maxMonetary : 0;

      // Weighted churn risk: low recency + low frequency = high churn risk
      const riskScore = (1 - rScore) * 0.4 + (1 - fScore) * 0.35 + (1 - mScore) * 0.25;

      let riskLevel: ChurnPrediction['riskLevel'] = 'low';
      if (riskScore > 0.8) riskLevel = 'critical';
      else if (riskScore > 0.6) riskLevel = 'high';
      else if (riskScore > 0.4) riskLevel = 'medium';

      let recommendation = 'Customer is engaged. Maintain regular communication.';
      if (riskLevel === 'medium') recommendation = 'Send a personalized offer or check-in email.';
      if (riskLevel === 'high') recommendation = 'Offer a discount or loyalty reward to re-engage.';
      if (riskLevel === 'critical') recommendation = 'Immediate outreach required. Call customer personally.';

      return {
        customerId: customer.id,
        customerName: customer.name,
        riskScore: Math.round(riskScore * 100) / 100,
        riskLevel,
        recencyDays,
        frequency,
        monetaryValue: monetary,
        lastPurchaseDate: data?.lastDate?.toISOString() ?? null,
        recommendation,
      };
    }).filter((c) => c.riskLevel !== 'low').sort((a, b) => b.riskScore - a.riskScore);
  } catch (error) {
    logger.error('Error predicting churn:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Detect anomalies in transaction patterns
 * Compares recent spending against historical averages
 */
export async function detectAnomalies(
  organizationId: string
): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];

  try {
    // Get last 3 months of expense data
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: recentExpenses } = await supabase
      .from('transactions')
      .select('amount, date, category_id, description')
      .eq('organization_id', organizationId)
      .eq('type', 'expense')
      .gte('date', threeMonthsAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (!recentExpenses || recentExpenses.length < 10) return insights;

    // Get previous 3 months for comparison
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: previousExpenses } = await supabase
      .from('transactions')
      .select('amount, date, category_id')
      .eq('organization_id', organizationId)
      .eq('type', 'expense')
      .gte('date', sixMonthsAgo.toISOString().split('T')[0])
      .lt('date', threeMonthsAgo.toISOString().split('T')[0]);

    if (!previousExpenses || previousExpenses.length === 0) return insights;

    // Calculate averages
    const recentTotal = recentExpenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const previousTotal = previousExpenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const recentAvg = recentTotal / 3;
    const previousAvg = previousTotal / 3;

    // Check for spending spike (>50% increase)
    if (previousAvg > 0 && recentAvg > previousAvg * 1.5) {
      const increase = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
      insights.push({
        id: 'spending-spike',
        type: 'expense',
        title: 'Unusual Spending Increase',
        description: `Monthly expenses increased by ${increase}% compared to the previous quarter`,
        severity: increase > 100 ? 'critical' : 'warning',
        actionable: true,
        suggestedAction: 'Review recent expenses for unusual charges',
      });
    }

    // Check for single large transactions (>3x average)
    const avgTransaction = recentTotal / recentExpenses.length;
    const largeTransactions = recentExpenses.filter(
      (t) => (t.amount || 0) > avgTransaction * 3
    );

    if (largeTransactions.length > 0) {
      insights.push({
        id: 'large-transactions',
        type: 'expense',
        title: 'Unusually Large Transactions',
        description: `${largeTransactions.length} transactions exceed 3x your average expense amount`,
        severity: 'warning',
        actionable: true,
        suggestedAction: 'Verify these transactions are legitimate',
      });
    }
  } catch (error) {
    logger.error('Error detecting anomalies:', error instanceof Error ? error.message : String(error));
  }

  return insights;
}
