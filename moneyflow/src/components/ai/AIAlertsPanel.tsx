// src/components/ai/AIAlertsPanel.tsx
/**
 * AI Alerts Panel
 * Combines business insights + anomaly detection into actionable alerts
 */

import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  UserX,
  DollarSign,
  Sparkles,
  Loader2,
  X,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBusinessInsights, useAnomalyDetection, useChurnPrediction } from '@/hooks/useAI';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { useNotificationStore } from '@/stores/notificationStore';
import { cn } from '@/lib/utils';

const severityConfig = {
  info: {
    icon: Sparkles,
    border: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  low: {
    icon: Sparkles,
    border: 'border-slate-200 dark:border-slate-800',
    bg: 'bg-slate-50 dark:bg-slate-950/20',
    text: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  medium: {
    icon: AlertTriangle,
    border: 'border-yellow-200 dark:border-yellow-800',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-200 dark:border-amber-800',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  },
  high: {
    icon: AlertTriangle,
    border: 'border-orange-200 dark:border-orange-800',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  },
  critical: {
    icon: AlertTriangle,
    border: 'border-red-200 dark:border-red-800',
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
};

const typeIconMap: Record<string, React.ElementType> = {
  revenue: DollarSign,
  expense: DollarSign,
  inventory: Package,
  customer: Users,
  trend: TrendingUp,
  churn: UserX,
};

interface AIAlertsPanelProps {
  maxItems?: number;
  showDismiss?: boolean;
  className?: string;
  onInsightAction?: (insightId: string, action: string) => void;
}

export function AIAlertsPanel({
  maxItems = 5,
  showDismiss = true,
  className,
  onInsightAction,
}: AIAlertsPanelProps) {
  const navigate = useNavigate();
  const { isEnabled } = useAIFeatures();
  const insightsEnabled = isEnabled('ai_business_insights');
  const anomaliesEnabled = isEnabled('ai_anomaly_detection');
  const churnEnabled = isEnabled('ai_churn_prediction');

  const { data: insights, isLoading: insightsLoading } = useBusinessInsights();
  const { data: anomalies, isLoading: anomaliesLoading } = useAnomalyDetection();
  const { data: churnPredictions, isLoading: churnLoading } = useChurnPrediction();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const isLoading = insightsLoading || anomaliesLoading || churnLoading;

  if (!insightsEnabled && !anomaliesEnabled && !churnEnabled) return null;

  // Convert churn predictions to alert format (memoized for stable deps)
  const churnAlerts = useMemo(
    () =>
      (churnPredictions ?? []).slice(0, 3).map((c) => ({
        id: `churn-${c.customerId}`,
        type: 'churn' as const,
        title: `${c.customerName} — Churn Risk`,
        description: `Last purchase ${c.recencyDays} days ago. ${c.recommendation}`,
        severity: c.riskLevel as 'low' | 'medium' | 'high' | 'critical',
        actionable: true,
        suggestedAction: c.recommendation,
      })),
    [churnPredictions]
  );

  // Combine and deduplicate, respecting feature toggles
  const allAlerts = [
    ...(insightsEnabled ? (insights ?? []) : []),
    ...(anomaliesEnabled ? (anomalies ?? []) : []),
    ...(churnEnabled ? churnAlerts : []),
  ].slice(0, maxItems);

  // Track which critical alerts have already been pushed to prevent duplicates
  const notifiedIds = useRef(new Set<string>());

  // Push critical alerts to notification store on first load
  useEffect(() => {
    if (!insights && !anomalies && !churnPredictions) return;
    const criticalAlerts = [
      ...(insightsEnabled ? (insights ?? []).filter((i) => i.severity === 'critical') : []),
      ...(anomaliesEnabled ? (anomalies ?? []).filter((a) => a.severity === 'critical') : []),
      ...(churnEnabled ? churnAlerts.filter((a) => a.severity === 'critical') : []),
    ];
    criticalAlerts.forEach((alert) => {
      if (!notifiedIds.current.has(alert.id)) {
        notifiedIds.current.add(alert.id);
        addNotification({
          type: 'warning',
          title: alert.title,
          message: alert.description,
          actionUrl: alert.actionable ? '/dashboard' : undefined,
          actionLabel: alert.suggestedAction ?? 'View',
        });
      }
    });
  }, [insights, anomalies, churnAlerts, insightsEnabled, anomaliesEnabled, churnEnabled, addNotification]);

  const handleAction = (insight: (typeof allAlerts)[number]) => {
    if (onInsightAction) {
      onInsightAction(insight.id, insight.suggestedAction ?? '');
      return;
    }
    // Default navigation based on insight type
    switch (insight.type) {
      case 'inventory':
        navigate('/products');
        break;
      case 'revenue':
        navigate('/invoices');
        break;
      case 'expense':
        navigate('/transactions');
        break;
      case 'customer':
        navigate('/customers');
        break;
      case 'churn':
        navigate('/customers');
        break;
      default:
        navigate('/reports');
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            AI Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allAlerts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            AI Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-4 text-center">
            <Sparkles className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">All systems healthy</p>
            <p className="text-xs text-muted-foreground/70">
              No alerts or anomalies detected
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          AI Alerts
          <Badge variant="secondary" className="h-auto px-1.5 py-0 text-[10px]">
            {allAlerts.length}
          </Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-indigo-600 dark:text-indigo-400"
          onClick={() => navigate('/reports')}
        >
          View All
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {allAlerts.map((insight) => {
          const config = severityConfig[insight.severity];
          const Icon = typeIconMap[insight.type] ?? config.icon;
          return (
            <div
              key={insight.id}
              className={cn(
                'relative rounded-lg border p-3',
                config.border,
                config.bg
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.text)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm font-medium', config.text)}>
                      {insight.title}
                    </p>
                    <Badge variant="secondary" className={cn('h-auto px-1 py-0 text-[10px]', config.badge)}>
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {insight.description}
                  </p>
                  {insight.actionable && insight.suggestedAction && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-auto p-0 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      onClick={() => handleAction(insight)}
                    >
                      {insight.suggestedAction}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
                {showDismiss && (
                  <button
                    className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground"
                    aria-label="Dismiss alert"
                    onClick={() => {
                      // In a real app, this would track dismissed IDs
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
