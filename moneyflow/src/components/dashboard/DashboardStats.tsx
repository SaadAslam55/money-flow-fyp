// src/components/dashboard/DashboardStats.tsx

import { DollarSign, FileText, Users, ShoppingCart } from 'lucide-react';
import { StatCard } from './StatCard';
import type { DashboardStats, ChartData } from '@/types/dashboard.types';

interface DashboardStatsProps {
  stats?: DashboardStats;
  chartData?: ChartData[];
  loading?: boolean;
}

export function DashboardStats({ stats, chartData, loading }: DashboardStatsProps) {
  const revenueTrend = chartData?.map((d) => ({ value: d.revenue }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={stats?.revenue ?? 0}
        change={stats?.revenue_change}
        icon={DollarSign}
        color="bg-green-500"
        loading={loading}
        isCurrency
        trendData={revenueTrend}
      />
      <StatCard
        title="Outstanding Payments"
        value={stats?.outstanding ?? 0}
        change={stats?.outstanding_change}
        icon={FileText}
        color="bg-orange-500"
        loading={loading}
        isCurrency
      />
      <StatCard
        title="Total Customers"
        value={stats?.customers ?? 0}
        change={stats?.customers_change}
        icon={Users}
        color="bg-blue-500"
        loading={loading}
      />
      <StatCard
        title="Invoices This Month"
        value={stats?.invoices ?? 0}
        change={stats?.invoices_change}
        icon={ShoppingCart}
        color="bg-purple-500"
        loading={loading}
      />
    </div>
  );
}
