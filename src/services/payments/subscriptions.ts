// src/services/payments/subscriptions.ts
/**
 * Payment Subscriptions Service
 * Handles subscription management and operations via Supabase Edge Functions
 * Supports local payment methods (JazzCash, EasyPaisa, Raast)
 *
 * Features:
 * - Get subscription details
 * - Update subscription plan
 * - Cancel/resume subscriptions
 * - Get billing history
 *
 * @example
 * ```typescript
 *
import { getSubscriptionDetails, updateSubscriptionPlan } from '@/services/payments/subscriptions';
 *
 * // Get subscription
 * const { data, error } = await getSubscriptionDetails('org-id');
 *
 * // Update plan
 * const { data, error } = await updateSubscriptionPlan('org-id', 'pro');
 * ```
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import type { Subscription } from '@/types/subscription.types';
import type { SubscriptionPlan } from '@/types/database.types';

/**
 * Get subscription details
 *
 * Fetches subscription information for an organization via Supabase Edge Function.
 *
 * @param organizationId - Organization ID
 * @returns Subscription data and error status
 */
export async function getSubscriptionDetails(
  organizationId: string
): Promise<{ data: Subscription | null; error: Error | null }> {
  try {
    // Validate organization ID
    if (
      !organizationId ||
      typeof organizationId !== 'string' ||
      organizationId.trim().length === 0
    ) {
      return {
        data: null,
        error: new Error('Organization ID is required'),
      };
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('get-subscription', {
      body: {
        organizationId: organizationId.trim(),
      },
    });

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('Error fetching subscription:', error instanceof Error ? error.message : String(error));
      }
      return {
        data: null,
        error: new Error(error.message ?? 'Failed to fetch subscription'),
      };
    }

    return {
      data: data?.subscription || data || null,
      error: null,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error fetching subscription:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get subscription'),
    };
  }
}

/**
 * Update subscription plan
 *
 * Updates the subscription plan for an organization via Supabase Edge Function.
 *
 * @param organizationId - Organization ID
 * @param planId - New subscription plan ID ('free', 'pro', 'enterprise')
 * @returns Updated subscription data and error status
 */
export async function updateSubscriptionPlan(
  organizationId: string,
  planId: string
): Promise<{ data: Subscription | null; error: Error | null }> {
  try {
    // Validate inputs
    if (
      !organizationId ||
      typeof organizationId !== 'string' ||
      organizationId.trim().length === 0
    ) {
      return {
        data: null,
        error: new Error('Organization ID is required'),
      };
    }

    if (!planId || typeof planId !== 'string') {
      return {
        data: null,
        error: new Error('Plan ID is required'),
      };
    }

    // Validate plan ID
    const validPlans: SubscriptionPlan[] = ['free', 'pro', 'enterprise'];
    if (!validPlans.includes(planId as SubscriptionPlan)) {
      return {
        data: null,
        error: new Error(`Invalid plan ID. Must be one of: ${validPlans.join(', ')}`),
      };
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('update-subscription-plan', {
      body: {
        organizationId: organizationId.trim(),
        planId: planId.trim(),
      },
    });

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('Error updating subscription plan:', error instanceof Error ? error.message : String(error));
      }
      return {
        data: null,
        error: new Error(error.message ?? 'Failed to update subscription'),
      };
    }

    return {
      data: data?.subscription || data || null,
      error: null,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error updating subscription plan:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update subscription'),
    };
  }
}

/**
 * Cancel subscription
 *
 * Cancels an organization's subscription via Supabase Edge Function.
 * Can cancel immediately or at the end of the billing period.
 *
 * @param organizationId - Organization ID
 * @param immediately - Whether to cancel immediately (default: false, cancels at period end)
 * @returns Updated subscription data and error status
 */
export async function cancelSubscription(
  organizationId: string,
  immediately: boolean = false
): Promise<{ data: Subscription | null; error: Error | null }> {
  try {
    // Validate organization ID
    if (
      !organizationId ||
      typeof organizationId !== 'string' ||
      organizationId.trim().length === 0
    ) {
      return {
        data: null,
        error: new Error('Organization ID is required'),
      };
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: {
        organizationId: organizationId.trim(),
        immediately: Boolean(immediately),
      },
    });

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('Error cancelling subscription:', error instanceof Error ? error.message : String(error));
      }
      return {
        data: null,
        error: new Error(error.message ?? 'Failed to cancel subscription'),
      };
    }

    return {
      data: data?.subscription || data || null,
      error: null,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error cancelling subscription:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to cancel subscription'),
    };
  }
}

/**
 * Resume subscription
 *
 * Resumes a cancelled subscription for an organization via Supabase Edge Function.
 *
 * @param organizationId - Organization ID
 * @returns Updated subscription data and error status
 */
export async function resumeSubscription(
  organizationId: string
): Promise<{ data: Subscription | null; error: Error | null }> {
  try {
    // Validate organization ID
    if (
      !organizationId ||
      typeof organizationId !== 'string' ||
      organizationId.trim().length === 0
    ) {
      return {
        data: null,
        error: new Error('Organization ID is required'),
      };
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('resume-subscription', {
      body: {
        organizationId: organizationId.trim(),
      },
    });

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('Error resuming subscription:', error instanceof Error ? error.message : String(error));
      }
      return {
        data: null,
        error: new Error(error.message ?? 'Failed to resume subscription'),
      };
    }

    return {
      data: data?.subscription || data || null,
      error: null,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error resuming subscription:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to resume subscription'),
    };
  }
}
