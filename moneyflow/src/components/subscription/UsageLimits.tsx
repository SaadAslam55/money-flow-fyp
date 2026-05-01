// src/components/subscription/UsageLimits.tsx
import { Users, FileText, UsersRound, Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import * as subscriptionApi from '@/services/api/subscriptionApi';
import { useQuery } from '@tanstack/react-query';

interface UsageItem {
  label: string;
  icon: React.ReactNode;
  current: number;
  max: number | null;
  unit?: string;
}

/**
 * Component for displaying usage limits and current usage
 */
export function UsageLimits() {
  const { organization } = useAuth();
  const { subscription } = useSubscription();

  const { data: usageData, isLoading } = useQuery({
    queryKey: ['subscription-usage', organization?.id],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return subscriptionApi.getSubscriptionUsage(organization.id);
    },
    enabled: !!organization?.id,
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>Your current usage against plan limits</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader message="Loading usage data..." />
        </CardContent>
      </Card>
    );
  }

  const usage = usageData?.data;
  if (!usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>Your current usage against plan limits</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="Unable to load usage data"
            description="Failed to load your usage information. Please try again later."
          />
        </CardContent>
      </Card>
    );
  }

  const typedUsage = usage as { usage: { users: number; invoices_this_month: number; customers: number }; limits: { users: number; invoices_per_month: number; customers: number }; is_over_limit: Record<string, boolean> };
  
  const usageItems: UsageItem[] = [
    {
      label: 'Users',
      icon: <Users className="h-5 w-5" />,
      current: typedUsage.usage.users,
      max: typedUsage.limits.users === -1 ? null : typedUsage.limits.users,
    },
    {
      label: 'Invoices (This Month)',
      icon: <FileText className="h-5 w-5" />,
      current: typedUsage.usage.invoices_this_month,
      max: typedUsage.limits.invoices_per_month === -1 ? null : typedUsage.limits.invoices_per_month,
    },
    {
      label: 'Customers',
      icon: <UsersRound className="h-5 w-5" />,
      current: typedUsage.usage.customers,
      max: typedUsage.limits.customers === -1 ? null : typedUsage.limits.customers,
    },
  ];

  const hasOverLimit = Object.values(typedUsage.is_over_limit ?? {}).some((val) => val);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage & Limits</CardTitle>
        <CardDescription>Your current usage against plan limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasOverLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You've exceeded some of your plan limits. Consider upgrading to continue using all
              features.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {usageItems.map((item) => {
            const percentage =
              item.max !== null && item.max > 0 ? (item.current / item.max) * 100 : 0;
            const isOverLimit = item.max !== null && item.current > item.max;
            const isNearLimit = item.max !== null && percentage >= 80 && !isOverLimit;

            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {item.current}
                      {item.max !== null && ` / ${item.max}`}
                    </span>
                    {isOverLimit && (
                      <StatusBadge
                        status="inactive"
                        type="custom"
                        label="Over Limit"
                      />
                    )}
                    {isNearLimit && !isOverLimit && (
                      <StatusBadge
                        status="pending"
                        type="custom"
                        label="Near Limit"
                      />
                    )}
                  </div>
                </div>
                {item.max !== null && (
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={isOverLimit ? 'bg-destructive' : ''}
                  />
                )}
                {item.max === null && (
                  <p className="text-xs text-muted-foreground">Unlimited</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

