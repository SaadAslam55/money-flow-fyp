// src/components/ai/AIExecutiveSummary.tsx
/**
 * AI Executive Summary
 * Generates a narrative business health summary from dashboard metrics
 * Uses backend-first approach with client-side fallback
 */

import { Sparkles, TrendingUp, TrendingDown, Minus, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { useExecutiveSummary, type DashboardMetrics } from '@/hooks/useAI';

interface SummarySegment {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'warning';
  highlight?: string;
}

const sentimentConfig = {
  positive: {
    icon: TrendingUp,
    badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    text: 'text-green-700 dark:text-green-300',
  },
  negative: {
    icon: TrendingDown,
    badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    text: 'text-red-700 dark:text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    text: 'text-amber-700 dark:text-amber-300',
  },
  neutral: {
    icon: Minus,
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    text: 'text-slate-700 dark:text-slate-300',
  },
};

interface AIExecutiveSummaryProps {
  metrics: DashboardMetrics;
  className?: string;
}

export function AIExecutiveSummary({ metrics, className }: AIExecutiveSummaryProps) {
  const { isEnabled } = useAIFeatures();
  const isEnabled_flag = isEnabled('ai_business_insights');

  const { data: summary = [], isLoading } = useExecutiveSummary(metrics);

  if (!isEnabled_flag) return null;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          AI Executive Summary
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Auto-generated
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating summary...
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {summary.map((segment, i) => {
                const Icon = sentimentConfig[segment.sentiment].icon;
                return (
                  <span key={i} className="inline-flex items-center gap-1">
                    {i === 0 && <Icon className={cn('h-3.5 w-3.5', sentimentConfig[segment.sentiment].text)} />}
                    {segment.highlight ? (
                      <>
                        {segment.text.split(segment.highlight)[0]}
                        <span className={cn('rounded px-1 font-medium', sentimentConfig[segment.sentiment].badge)}>
                          {segment.highlight}
                        </span>
                        {segment.text.split(segment.highlight)[1]}
                      </>
                    ) : (
                      segment.text
                    )}
                  </span>
                );
              })}
            </p>

            {/* Sentiment badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {Array.from(new Set(summary.map((s) => s.sentiment))).map((sentiment) => (
                <Badge
                  key={sentiment}
                  variant="secondary"
                  className={cn('text-[10px] capitalize', sentimentConfig[sentiment].badge)}
                >
                  {sentiment}
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
