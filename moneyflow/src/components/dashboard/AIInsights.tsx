import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBusinessInsights, useRevenuePrediction } from '@/hooks/useAI';
import { formatCurrency } from '@/lib/formatters';

const severityConfig = {
  info: { icon: Info, color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100/50 dark:border-blue-900/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100/50 dark:border-amber-900/20' },
  critical: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', border: 'border-red-100/50 dark:border-red-900/20' },
};

export function AIInsights() {
  const navigate = useNavigate();
  const { data: insights, isLoading: insightsLoading } = useBusinessInsights();
  const { data: prediction, isLoading: predictionLoading } = useRevenuePrediction(1);

  const isLoading = insightsLoading || predictionLoading;

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-purple-950/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          AI Insights
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-indigo-600 dark:text-indigo-400"
          onClick={() => navigate('/reports')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Revenue Prediction */}
            {prediction && prediction.confidence > 0 && (
              <div className="rounded-lg border border-indigo-100/50 bg-white/60 p-3 shadow-sm dark:border-indigo-900/20 dark:bg-black/20">
                <p className="flex items-center gap-1.5 text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  {prediction.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
                  {prediction.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                  Revenue Forecast
                </p>
                <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                  Next month projected: {formatCurrency(prediction.value)} ({Math.round(prediction.confidence * 100)}% confidence, trending {prediction.trend})
                </p>
              </div>
            )}

            {/* Business Insights */}
            {insights && insights.length > 0 ? (
              insights.slice(0, 3).map((insight) => {
                const config = severityConfig[insight.severity];
                const Icon = config.icon;
                return (
                  <div
                    key={insight.id}
                    className={`rounded-lg border bg-white/60 p-3 shadow-sm dark:bg-black/20 ${config.border}`}
                  >
                    <p className={`flex items-center gap-1.5 text-sm font-medium ${config.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {insight.title}
                    </p>
                    <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                      {insight.description}
                    </p>
                    {insight.actionable && insight.suggestedAction && (
                      <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        → {insight.suggestedAction}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              !prediction && (
                <div className="rounded-lg border border-indigo-100/50 bg-white/60 p-3 shadow-sm dark:border-indigo-900/20 dark:bg-black/20">
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">All Good!</p>
                  <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                    No critical insights right now. Keep managing your business effectively.
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
