// src/hooks/useSubscription.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as subscriptionApi from '@/services/api/subscriptionApi';
import { handleError } from '@/lib/errorHandler';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'suspended' | 'trialing';

/**
 * Hook for managing organization subscription
 */
export function useSubscription() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subscription', organization?.id],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return subscriptionApi.getSubscription(organization.id);
    },
    enabled: !!organization?.id,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const updatePlanMutation = useMutation({
    mutationFn: (plan: SubscriptionPlan) => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return subscriptionApi.updateSubscriptionPlan(organization.id, plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success('Subscription plan updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useSubscription.updatePlan');
      toast.error(`Failed to update subscription: ${error.message}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: SubscriptionStatus) => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return subscriptionApi.updateSubscriptionStatus(organization.id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success('Subscription status updated');
    },
    onError: (error: Error) => {
      handleError(error, 'useSubscription.updateStatus');
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const linkStripeCustomerMutation = useMutation({
    mutationFn: (stripeCustomerId: string) => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return subscriptionApi.linkStripeCustomer(organization.id, stripeCustomerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Stripe customer linked successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useSubscription.linkStripeCustomer');
      toast.error(`Failed to link Stripe customer: ${error.message}`);
    },
  });

  const linkStripeSubscriptionMutation = useMutation({
    mutationFn: (stripeSubscriptionId: string) => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return subscriptionApi.linkStripeSubscription(organization.id, stripeSubscriptionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Stripe subscription linked successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useSubscription.linkStripeSubscription');
      toast.error(`Failed to link Stripe subscription: ${error.message}`);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return subscriptionApi.cancelSubscription(organization.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useSubscription.cancel');
      toast.error(`Failed to cancel subscription: ${error.message}`);
    },
  });

  interface SubscriptionData {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    payment_provider?: string | null;
    payment_customer_id?: string | null;
    payment_subscription_id?: string | null;
    current_period_start?: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    trial_end?: string;
  }

  return {
    subscription: query.data?.data as SubscriptionData | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updatePlan: updatePlanMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    linkStripeCustomer: linkStripeCustomerMutation.mutateAsync,
    linkStripeSubscription: linkStripeSubscriptionMutation.mutateAsync,
    cancelSubscription: cancelMutation.mutateAsync,
    isUpdatingPlan: updatePlanMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isLinkingCustomer: linkStripeCustomerMutation.isPending,
    isLinkingSubscription: linkStripeSubscriptionMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}

/**
 * Hook for subscription usage statistics
 */
export function useSubscriptionUsage() {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['subscription-usage', organization?.id],
    queryFn: () => subscriptionApi.getSubscriptionUsage(organization!.id),
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes
  });

  return {
    usage: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for checking if a feature is available based on subscription plan
 */
export function useFeatureAccess() {
  const { subscription } = useSubscription();

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;

    const { plan } = subscription;
    const { status } = subscription;

    // Only active and trialing subscriptions have access
    if (status !== 'active' && status !== 'trialing') {
      return false;
    }

    // Feature access based on plan
    const features: Record<SubscriptionPlan, string[]> = {
      free: ['basic_invoicing', 'basic_reports', 'customer_management'],
      pro: [
        'basic_invoicing',
        'basic_reports',
        'customer_management',
        'advanced_reports',
        'recurring_invoices',
        'inventory_management',
        'multi_user',
        'api_access',
      ],
      enterprise: [
        'basic_invoicing',
        'basic_reports',
        'customer_management',
        'advanced_reports',
        'recurring_invoices',
        'inventory_management',
        'multi_user',
        'api_access',
        'white_label',
        'priority_support',
        'custom_integrations',
        'advanced_analytics',
      ],
    };

    return features[plan]?.includes(feature) || false;
  };

  const canUpgrade = (): boolean => {
    if (!subscription) return false;
    return subscription.plan !== 'enterprise';
  };

  return {
    hasFeature,
    canUpgrade,
    plan: subscription?.plan,
    status: subscription?.status,
  };
}
