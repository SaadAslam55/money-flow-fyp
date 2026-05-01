// src/components/dashboard/StatCard.tsx

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import CountUp from 'react-countup';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  color: string;
  loading?: boolean;
  isCurrency?: boolean;
  trendData?: { value: number }[];
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  loading,
  isCurrency = false,
  trendData,
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <Skeleton className="mt-4 h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="relative h-full overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold">
            {isCurrency ? (
              <CountUp end={value} prefix="PKR " separator="," decimals={2} duration={2.5} />
            ) : (
              <CountUp end={value} separator="," duration={2.5} />
            )}
          </div>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="ml-1 text-sm text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Sparkline Background */}
      {trendData && trendData.length > 0 && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 translate-y-6 opacity-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
