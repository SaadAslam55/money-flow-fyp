// src/pages/dashboard/DashboardPage.tsx
/**
 * Dashboard Page
 * Main dashboard page showing business overview with statistics, charts, and recent activity
 */

import { useEffect, useCallback, useState } from 'react';
import { RefreshCw, AlertTriangle, WifiOff, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentInvoices } from '@/components/dashboard/RecentInvoices';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { TopCustomers } from '@/components/dashboard/TopCustomers';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { BentoGrid } from '@/components/dashboard/BentoGrid';
import { AIAlertsPanel, AIExecutiveSummary } from '@/components/ai';
import { RadialProgress } from '@/components/dashboard/RadialProgress';
import { DashboardDateRange, type DateRange } from '@/components/dashboard/DashboardDateRange';
import { PageTemplate } from '@/components/common/PageTemplate';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    stats,
    chart,
    invoices,
    transactions,
    topCustomers,
    lowStockProducts,
    activities,
    isLoading,
    refetch,
    error,
    isConfigured,
    hasOrg,
  } = useDashboard();

  const [dateRange, setDateRange] = useState<DateRange>('this_month');

  // Track page view
  useEffect(() => {
    trackPageView('/dashboard', 'Dashboard');
  }, []);

  // Handle refresh with analytics
  const handleRefresh = useCallback(() => {
    trackUserAction('refresh_dashboard', 'dashboard');
    refetch();
    toast.success('Dashboard refreshed');
  }, [refetch]);

  // Get display name - prefer full_name, fallback to first part of email, then 'there'
  const getDisplayName = (): string => {
    if (user?.full_name && user.full_name !== user.email) {
      // Get first name from full name
      return user.full_name.split(' ')[0] ?? 'there';
    }
    // Fallback to email username if no name set
    if (user?.email) {
      const emailName = user.email.split('@')[0] ?? '';
      // Capitalize first letter
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'there';
  };

  const firstName = getDisplayName();

  // Get error icon based on error type
  const getErrorIcon = () => {
    if (!isConfigured) return <Database className="h-4 w-4" />;
    if (error?.includes('network') || error?.includes('connection'))
      return <WifiOff className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  // Render configuration error alert
  if (!isConfigured) {
    return (
      <PageTemplate
        title={`Welcome back, ${firstName}`}
        description="Dashboard configuration issue detected"
        loading={false}
      >
        <Alert variant="destructive" className="mb-6">
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuration Error:</strong> Database connection is not properly configured.
            Please check your environment variables and ensure Supabase is properly set up. Contact
            your administrator if this issue persists.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center p-8">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </PageTemplate>
    );
  }

  // Render organization selection error
  if (!hasOrg) {
    return (
      <PageTemplate
        title={`Welcome back, ${firstName}`}
        description="Please select an organization to continue"
        loading={false}
      >
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No organization selected. Please select an organization to view the dashboard.
          </AlertDescription>
        </Alert>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Welcome back, ${firstName}`}
      description="Here's what's happening with your business today"
      keywords="dashboard, overview, business metrics, revenue, invoices, customers"
      loading={isLoading}
      error={error}
      actions={
        <div className="flex items-center gap-3">
          <DashboardDateRange value={dateRange} onChange={setDateRange} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          {getErrorIcon()}
          <AlertDescription>
            <strong>Error:</strong> {error}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} className="h-8">
                <RefreshCw className="mr-2 h-3 w-3" />
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Statistics Cards */}
        <DashboardStats stats={stats} chartData={chart} loading={isLoading} />

        {/* AI Executive Summary */}
        {!isLoading && stats && (
          <AIExecutiveSummary
            metrics={{
              revenue: stats.revenue ?? 0,
              revenueChange: stats.revenue_change ?? 0,
              outstanding: stats.outstanding ?? 0,
              outstandingChange: stats.outstanding_change ?? 0,
              customers: stats.customers ?? 0,
              customersChange: stats.customers_change ?? 0,
              invoices: stats.invoices ?? 0,
              invoicesChange: stats.invoices_change ?? 0,
              overdueCount: invoices?.filter((inv) => inv.status === 'overdue').length ?? 0,
              lowStockCount: lowStockProducts?.length ?? 0,
              topCustomerName: topCustomers?.[0]?.name,
              topCustomerRevenue: topCustomers?.[0]?.total_revenue,
            }}
          />
        )}

        {/* Bento Grid Layout */}
        <BentoGrid className="gap-6">
          {/* Revenue Chart - spans 3 cols */}
          <div className="md:col-span-2 lg:col-span-3">
            <RevenueChart data={chart} loading={isLoading} />
          </div>

          {/* AI Alerts Panel - combines insights + anomaly detection */}
          <div className="md:col-span-1">
            <AIAlertsPanel maxItems={4} />
          </div>

          {/* Radial Progress - Growth Goal */}
          <div className="md:col-span-1">
            <Card className="flex h-full flex-col items-center justify-center p-6">
              <RadialProgress
                value={
                  stats?.revenue_change
                    ? Math.min(Math.max(stats.revenue_change, 0) * 5, 100)
                    : 0
                }
                label="Growth Goal"
                sublabel={`${Math.round(stats?.revenue_change ?? 0)}% this month`}
                color="text-indigo-600"
              />
            </Card>
          </div>

          {/* Quick Actions - spans 3 cols */}
          <div className="md:col-span-2 lg:col-span-3">
            <QuickActions />
          </div>
        </BentoGrid>

        {/* Recent Invoices and Transactions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentInvoices invoices={invoices} loading={isLoading} />
          <RecentTransactions transactions={transactions} loading={isLoading} />
        </div>

        {/* Top Customers and Low Stock Alerts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TopCustomers customers={topCustomers} loading={isLoading} />
          <LowStockAlert products={lowStockProducts} loading={isLoading} />
        </div>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} loading={isLoading} />
      </div>
    </PageTemplate>
  );
}
