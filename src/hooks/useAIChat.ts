// src/hooks/useAIChat.ts
import { useState, useCallback } from 'react';
import { useBusinessInsights, useAnomalyDetection, useRevenuePrediction } from './useAI';
import { useDashboard } from './useDashboard';

interface ChatResponse {
  message: string;
  type?: 'insight' | 'alert' | 'suggestion' | 'general';
  actions?: {
    id: string;
    label: string;
    navigate?: string;
  }[];
  executeAction?: () => void;
}

export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  // Use existing AI hooks
  const { data: insights } = useBusinessInsights();
  const { data: anomalies } = useAnomalyDetection();
  const { data: prediction } = useRevenuePrediction(1);
  const { stats } = useDashboard();

  const sendMessage = useCallback(async (message: string, context?: any): Promise<ChatResponse> => {
    setIsLoading(true);
    setError(null);
    setHistory(prev => [...prev, message]);

    try {
      const lowerMessage = message.toLowerCase();

      // Check for insights/alert queries
      if (lowerMessage.includes('insight') || lowerMessage.includes('alert')) {
        return handleInsightQuery(insights || [], anomalies || []);
      }

      // Check for revenue queries
      if (lowerMessage.includes('revenue') || lowerMessage.includes('income') || lowerMessage.includes('forecast')) {
        return handleRevenueQuery(stats, prediction);
      }

      // Check for invoice queries
      if (lowerMessage.includes('invoice') || lowerMessage.includes('bill') || lowerMessage.includes('overdue')) {
        return handleInvoiceQuery(stats);
      }

      // Check for customer queries
      if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
        return handleCustomerQuery(stats);
      }

      // Check for stock/inventory queries
      if (lowerMessage.includes('stock') || lowerMessage.includes('inventory') || lowerMessage.includes('product')) {
        return handleStockQuery();
      }

      // Check for anomaly queries
      if (lowerMessage.includes('anomaly') || lowerMessage.includes('unusual') || lowerMessage.includes('abnormal')) {
        return handleAnomalyQuery(anomalies || []);
      }

      // Default response with suggestions
      return {
        message: `I understand you're asking about "${message}". Here's what I can help with:\n\n• **Business Insights** - Get AI-powered insights\n• **Revenue & Forecasts** - Track your revenue trends\n• **Invoice Management** - Find and manage invoices\n• **Customer Analytics** - Understand your customers\n• **Inventory Status** - Check stock levels\n• **Anomaly Detection** - Spot unusual patterns\n\nCan you be more specific? Or try one of the quick actions below.`,
        type: 'general',
        actions: [
          { id: 'show_insights', label: '📊 Show Insights' },
          { id: 'show_revenue', label: '💰 Revenue Summary' },
          { id: 'show_alerts', label: '⚠️ Critical Alerts' },
        ]
      };
    } catch (err) {
      setError('Failed to get response');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [insights, anomalies, prediction, stats]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { sendMessage, isLoading, error, history, clearHistory };
}

// Helper functions for different query types
function handleInsightQuery(insights: any[], anomalies: any[]): ChatResponse {
  const critical = insights?.filter(i => i.severity === 'critical') || [];
  const warnings = insights?.filter(i => i.severity === 'warning') || [];
  const anomaliesList = anomalies || [];

  let message = '📊 **Business Insights & Alerts**\n\n';

  if (critical.length > 0) {
    message += `⚠️ **Critical Alerts (${critical.length})**\n`;
    critical.slice(0, 3).forEach(i => {
      message += `• ${i.title}: ${i.description}\n`;
    });
    message += '\n';
  }

  if (warnings.length > 0) {
    message += `⚠️ **Warnings (${warnings.length})**\n`;
    warnings.slice(0, 3).forEach(i => {
      message += `• ${i.title}: ${i.description}\n`;
    });
    message += '\n';
  }

  if (anomaliesList.length > 0) {
    message += `🔍 **Anomalies Detected (${anomaliesList.length})**\n`;
    anomaliesList.slice(0, 3).forEach(a => {
      message += `• ${a.title}: ${a.description}\n`;
    });
    message += '\n';
  }

  if (critical.length === 0 && warnings.length === 0 && anomaliesList.length === 0) {
    message += '✅ All systems healthy! No critical alerts or anomalies detected.\n\n';
    message += 'Your business metrics are within normal ranges. Keep up the good work!';
  }

  return {
    message,
    type: 'alert',
    actions: [
      { id: 'view_all_alerts', label: '📋 View All Alerts', navigate: '/reports' },
      { id: 'view_insights', label: '🔍 Detailed Insights', navigate: '/reports' },
    ]
  };
}

function handleRevenueQuery(stats: any, prediction: any): ChatResponse {
  const revenue = stats?.revenue || 0;
  const change = stats?.revenue_change || 0;
  const outstanding = stats?.outstanding || 0;
  const forecast = prediction?.value || 0;
  const trend = prediction?.trend || 'stable';

  let message = '💰 **Revenue Summary**\n\n';
  message += `• **Total Revenue:** PKR ${revenue.toLocaleString()}\n`;
  message += `• **Change:** ${change >= 0 ? '+' : ''}${change.toFixed(1)}% ${change >= 0 ? '📈' : '📉'}\n`;
  message += `• **Outstanding:** PKR ${outstanding.toLocaleString()}\n`;

  if (forecast > 0) {
    message += `• **Next Month Forecast:** PKR ${forecast.toLocaleString()}\n`;
    message += `• **Trend:** ${trend === 'up' ? '📈 Growing' : trend === 'down' ? '📉 Declining' : '➡️ Stable'}\n`;
  }

  message += '\nWould you like more detailed revenue analytics?';

  return {
    message,
    type: 'insight',
    actions: [
      { id: 'view_revenue_chart', label: '📈 View Chart', navigate: '/reports' },
      { id: 'view_invoices', label: '📄 View Invoices', navigate: '/invoices' },
    ]
  };
}

function handleInvoiceQuery(stats: any): ChatResponse {
  const invoices = stats?.invoices || 0;
  const outstanding = stats?.outstanding || 0;
  const change = stats?.invoices_change || 0;

  let message = '📄 **Invoice Overview**\n\n';
  message += `• **Invoices This Month:** ${invoices}\n`;
  message += `• **Change:** ${change >= 0 ? '+' : ''}${change.toFixed(1)}%\n`;
  message += `• **Outstanding Amount:** PKR ${outstanding.toLocaleString()}\n\n`;

  if (outstanding > 0) {
    message += '⚠️ You have outstanding payments that need attention.';
  } else {
    message += '✅ All invoices are paid! Great job!';
  }

  return {
    message,
    type: 'general',
    actions: [
      { id: 'view_invoices', label: '📋 View All Invoices', navigate: '/invoices' },
      { id: 'create_invoice', label: '✏️ Create New Invoice', navigate: '/invoices/new' },
    ]
  };
}

function handleCustomerQuery(stats: any): ChatResponse {
  const customers = stats?.customers || 0;
  const change = stats?.customers_change || 0;

  let message = '👥 **Customer Analytics**\n\n';
  message += `• **Total Customers:** ${customers}\n`;
  message += `• **Growth:** ${change >= 0 ? '+' : ''}${change.toFixed(1)}%\n\n`;

  if (change > 0) {
    message += '📈 Your customer base is growing! Keep up the great work.';
  } else if (change < 0) {
    message += '📉 Customer count has decreased. Let\'s analyze why.';
  } else {
    message += '➡️ Customer count is stable. Consider marketing to grow.';
  }

  return {
    message,
    type: 'insight',
    actions: [
      { id: 'view_customers', label: '👥 View All Customers', navigate: '/customers' },
      { id: 'add_customer', label: '➕ Add Customer', navigate: '/customers/new' },
    ]
  };
}

function handleStockQuery(): ChatResponse {
  return {
    message: '📦 **Inventory Management**\n\nTo check stock levels, you can:\n\n• View all products in inventory\n• Filter by low stock items\n• Check product details\n• Update stock levels\n\nWould you like to view your inventory now?',
    type: 'general',
    actions: [
      { id: 'view_inventory', label: '📦 View Inventory', navigate: '/products' },
      { id: 'view_low_stock', label: '⚠️ Low Stock Items', navigate: '/products?filter=low_stock' },
    ]
  };
}

function handleAnomalyQuery(anomalies: any[]): ChatResponse {
  if (!anomalies || anomalies.length === 0) {
    return {
      message: '🔍 **Anomaly Detection**\n\nNo anomalies detected! Your business data is showing normal patterns.\n\n✅ All metrics are within expected ranges.',
      type: 'general',
      actions: [
        { id: 'view_insights', label: '📊 View Insights', navigate: '/reports' },
      ]
    };
  }

  let message = '🔍 **Anomalies Detected**\n\n';
  anomalies.slice(0, 5).forEach((a, i) => {
    message += `${i + 1}. ${a.title}\n   ${a.description}\n\n`;
  });

  if (anomalies.length > 5) {
    message += `... and ${anomalies.length - 5} more anomalies.\n\n`;
  }

  message += '⚠️ These anomalies may require your attention.';

  return {
    message,
    type: 'alert',
    actions: [
      { id: 'view_all_anomalies', label: '🔍 View All', navigate: '/reports' },
    ]
  };
}