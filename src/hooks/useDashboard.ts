// src/hooks/useDashboard.ts

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  getDashboardStats,
  getRevenueChartData,
  getRecentInvoices,
  getTopCustomers,
  getActivityFeed,
} from '@/services/api/dashboardApi';
import { getRecentTransactions } from '@/services/api/transactionApi';
import { getLowStockProducts } from '@/services/api/productApi';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { useState, useEffect } from 'react';

// Shared retry configuration for dashboard queries
const sharedRetryConfig = {
  retry: (failureCount: number, error: Error): boolean => {
    const isRetryable =
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('500');
    return isRetryable && failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

export function useDashboard() {
  const { organization, loading: authLoading } = useAuth();
  const orgId = organization?.id;

  // If no organization, return empty data immediately (no loading state)
  const hasOrg = !!orgId && orgId.length > 0;

  // Check if Supabase is configured
  const isConfigured = isSupabaseConfigured();

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats', orgId],
    queryFn: () => getDashboardStats(orgId!),
    enabled: hasOrg && isConfigured,
    refetchInterval: 30000,
    staleTime: 15000,
    ...sharedRetryConfig,
  });

  const chartQuery = useQuery({
    queryKey: ['dashboard-chart', orgId],
    queryFn: () => getRevenueChartData(orgId!),
    enabled: hasOrg && isConfigured,
    staleTime: 60000,
    ...sharedRetryConfig,
  });

  const invoicesQuery = useQuery({
    queryKey: ['dashboard-invoices', orgId],
    queryFn: () => getRecentInvoices(orgId!, 10),
    enabled: hasOrg && isConfigured,
    staleTime: 30000,
    ...sharedRetryConfig,
  });

  const transactionsQuery = useQuery({
    queryKey: ['dashboard-transactions', orgId],
    queryFn: async () => {
      const result = await getRecentTransactions(orgId!, 10);
      return result.data ?? [];
    },
    enabled: hasOrg && isConfigured,
    staleTime: 30000,
    ...sharedRetryConfig,
  });

  const topCustomersQuery = useQuery({
    queryKey: ['dashboard-top-customers', orgId],
    queryFn: () => getTopCustomers(orgId!, 5),
    enabled: hasOrg && isConfigured,
    staleTime: 60000,
    ...sharedRetryConfig,
  });

  const lowStockQuery = useQuery({
    queryKey: ['dashboard-low-stock', orgId],
    queryFn: async () => {
      const result = await getLowStockProducts(orgId!);
      return result.data ?? [];
    },
    enabled: hasOrg && isConfigured,
    staleTime: 60000,
    ...sharedRetryConfig,
  });

  const activityQuery = useQuery({
    queryKey: ['dashboard-activity', orgId],
    queryFn: () => getActivityFeed(orgId!, 10),
    enabled: hasOrg && isConfigured,
    staleTime: 30000,
    ...sharedRetryConfig,
  });

  // Show loading only during initial fetch (isPending = no data yet + fetching)
  // Don't use isFetching which is true during background refetches
  const isInitialLoading =
    authLoading ||
    (hasOrg &&
      isConfigured &&
      // Only block on stats — other sections can render empty
      statsQuery.isPending);

  // Max loading timeout — prevent infinite loading if queries get stuck
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isInitialLoading && !loadingTimedOut) {
      timer = setTimeout(() => setLoadingTimedOut(true), 10000);
    } else if (!isInitialLoading) {
      setLoadingTimedOut(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isInitialLoading, loadingTimedOut]);

  const isLoading = isInitialLoading && !loadingTimedOut;

  // Enhanced error handling
  const getErrorMessage = (error: unknown) => {
    if (!isConfigured) {
      return 'Database connection not configured. Please check your environment variables.';
    }

    if (!hasOrg) {
      return 'No organization selected. Please select an organization to view the dashboard.';
    }

    if (error instanceof Error) {
      if (error.message.includes('500')) {
        return 'Server error occurred. Please try refreshing the page.';
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return 'Network error. Please check your connection and try again.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
      }
      return error.message;
    }

    return 'Failed to load dashboard data. Please try refreshing.';
  };

  // Only show query errors if we have an org - otherwise it's expected
  const error = hasOrg
    ? statsQuery.error ||
      chartQuery.error ||
      invoicesQuery.error ||
      transactionsQuery.error ||
      topCustomersQuery.error ||
      lowStockQuery.error ||
      activityQuery.error
    : null;

  const refetch = () => {
    statsQuery.refetch();
    chartQuery.refetch();
    invoicesQuery.refetch();
    transactionsQuery.refetch();
    topCustomersQuery.refetch();
    lowStockQuery.refetch();
    activityQuery.refetch();
  };

  return {
    stats: statsQuery.data,
    chart: chartQuery.data,
    invoices: invoicesQuery.data,
    transactions: transactionsQuery.data,
    topCustomers: topCustomersQuery.data,
    lowStockProducts: lowStockQuery.data,
    activities: activityQuery.data,
    isLoading,
    error: error ? getErrorMessage(error) : undefined,
    refetch,
    isConfigured,
    hasOrg,
  };
}
