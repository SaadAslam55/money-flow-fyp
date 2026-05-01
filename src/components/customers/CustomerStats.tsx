// src/components/customers/CustomerStats.tsx
import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/common/Loader';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import * as customerApi from '@/services/api/customerApi';

export function CustomerStats() {
  const { organization } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-statistics', organization?.id],
    queryFn: () => customerApi.getCustomerStatistics(organization!.id),
    enabled: !!organization?.id,
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return <Loader size="lg" message="Loading customer statistics..." />;
  }

  if (error || !data?.data) {
    return (
      <EmptyState
        icon={Users}
        title="Failed to load statistics"
        description={error?.message ?? "Unable to load customer statistics at this time."}
      />
    );
  }

  const stats = data.data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_customers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.new_this_month} new this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Outstanding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyDisplay
            amount={stats.total_outstanding}
            variant={stats.total_outstanding > 0 ? 'negative' : 'default'}
            size="xl"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Across all customers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            New This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.new_this_month}</div>
          <p className="text-xs text-muted-foreground mt-1">
            New customers added
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Average Purchase
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.average_purchase ? (
            <CurrencyDisplay amount={stats.average_purchase} size="xl" />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">N/A</span>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Per customer
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

