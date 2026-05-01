// src/hooks/useUsageLimits.ts
import { logger } from '@/lib/logger';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/services/supabase/client';
import { successResponse, errorResponse } from '@/services/api/baseApi';
import type { SubscriptionPlan } from '@/types/database.types';

/**
 * Subscription plan limits
 */
const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlan,
  {
    users: number | null;
    invoices_per_month: number | null;
    customers: number | null;
    storage_gb: number | null;
  }
> = {
  free: {
    users: 1,
    invoices_per_month: 10,
    customers: 50,
    storage_gb: 1,
  },
  pro: {
    users: 5,
    invoices_per_month: 500,
    customers: 1000,
    storage_gb: 10,
  },
  enterprise: {
    users: null, // Unlimited
    invoices_per_month: null, // Unlimited
    customers: null, // Unlimited
    storage_gb: 100,
  },
};

/**
 * Get usage limits for an organization
 */
async function getUsageLimits(organizationId: string) {
  try {
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('subscription_plan')
      .eq('id', organizationId)
      .single();

    if (orgError) throw orgError;

    const typedOrg = org as { subscription_plan?: SubscriptionPlan };
    const planLimits = SUBSCRIPTION_PLANS[typedOrg.subscription_plan ?? 'free'];

    // Get current usage
    const [userCount, invoiceCount, customerCount] = await Promise.all([
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('is_active', true),
      supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
    ]);

    const limits = {
      users: {
        current: userCount.count ?? 0,
        max: planLimits.users,
        exceeded: planLimits.users !== null && (userCount.count ?? 0) >= planLimits.users,
        percentage: planLimits.users
          ? Math.round(((userCount.count ?? 0) / planLimits.users) * 100)
          : 0,
      },
      invoices_per_month: {
        current: invoiceCount.count ?? 0,
        max: planLimits.invoices_per_month,
        exceeded:
          planLimits.invoices_per_month !== null &&
          (invoiceCount.count ?? 0) >= planLimits.invoices_per_month,
        percentage: planLimits.invoices_per_month
          ? Math.round(((invoiceCount.count ?? 0) / planLimits.invoices_per_month) * 100)
          : 0,
      },
      customers: {
        current: customerCount.count ?? 0,
        max: planLimits.customers,
        exceeded:
          planLimits.customers !== null && (customerCount.count ?? 0) >= planLimits.customers,
        percentage: planLimits.customers
          ? Math.round(((customerCount.count ?? 0) / planLimits.customers) * 100)
          : 0,
      },
      storage_gb: {
        current: 0, // TODO: Calculate actual storage usage
        max: planLimits.storage_gb,
        exceeded: planLimits.storage_gb !== null && 0 >= planLimits.storage_gb,
        percentage: planLimits.storage_gb ? Math.round((0 / planLimits.storage_gb) * 100) : 0,
      },
    };

    return successResponse(limits);
  } catch (error) {

    logger.error('Error fetching usage limits:', error instanceof Error ? error.message : String(error));
    return errorResponse(error);
  }
}

/**
 * Hook for checking usage limits
 */
export function useUsageLimits(organizationId: string | null) {
  const { organization, user } = useAuth();

  const targetOrgId = organizationId || organization?.id;

  const query = useQuery({
    queryKey: ['usage-limits', targetOrgId],
    queryFn: () => {
      if (!targetOrgId) throw new Error('Organization ID is required');
      return getUsageLimits(targetOrgId);
    },
    enabled: !!targetOrgId && !!user,
    staleTime: 60000,
  });

  return {
    limits: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

