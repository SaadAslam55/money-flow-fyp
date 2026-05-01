// src/components/admin/TenantMetrics.tsx
import { Building2, Users, FileText, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CountUp from 'react-countup';
import { formatCurrency } from '@/lib/formatters';

interface TenantMetricsProps {
  metrics?: {
    total_organizations: number;
    total_users: number;
    total_customers: number;
    total_invoices: number;
    total_revenue: number;
    plan_distribution?: Record<string, number>;
    status_distribution?: Record<string, number>;
  };
  loading?: boolean;
}

export function TenantMetrics({ metrics, loading }: TenantMetricsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Organizations',
      value: metrics?.total_organizations ?? 0,
      icon: Building2,
      color: 'bg-blue-500',
      description: 'Active businesses on platform',
    },
    {
      title: 'Total Users',
      value: metrics?.total_users ?? 0,
      icon: Users,
      color: 'bg-green-500',
      description: 'Registered users across all orgs',
    },
    {
      title: 'Total Customers',
      value: metrics?.total_customers ?? 0,
      icon: Users,
      color: 'bg-purple-500',
      description: 'Customers across all organizations',
    },
    {
      title: 'Total Revenue',
      value: metrics?.total_revenue ?? 0,
      icon: DollarSign,
      color: 'bg-orange-500',
      description: 'Total revenue from paid invoices',
      isCurrency: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.isCurrency ? (
                  <CountUp end={stat.value} prefix="PKR " separator="," decimals={0} duration={2} />
                ) : (
                  <CountUp end={stat.value} separator="," duration={2} />
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
