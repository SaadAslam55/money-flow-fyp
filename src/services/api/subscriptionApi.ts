// src/services/api/subscriptionApi.ts
/**
 * Subscription API Service
 * Handles subscription management for organizations
 * Supports local payment methods (JazzCash, EasyPaisa, Raast)
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import { successResponse, errorResponse } from './baseApi';
import type { Organization } from '@/types/database.types';

/**
 * Get subscription details for an organization
 */
export async function getSubscription(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select(
        'subscription_plan, subscription_status, payment_provider, payment_customer_id, payment_subscription_id'
      )
      .eq('id', organizationId)
      .single();

    if (error) throw error;

    const typedData = data as Pick<
      Organization,
      | 'subscription_plan'
      | 'subscription_status'
      | 'payment_provider'
      | 'payment_customer_id'
      | 'payment_subscription_id'
    >;
    return successResponse({
      plan: typedData.subscription_plan,
      status: typedData.subscription_status,
      payment_provider: typedData.payment_provider,
      payment_customer_id: typedData.payment_customer_id,
      payment_subscription_id: typedData.payment_subscription_id,
    });
  } catch (error) {
    logger.error('Error fetching subscription:', error instanceof Error ? error.message : String(error));
    return errorResponse(error);
  }
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  organizationId: string,
  plan: 'free' | 'pro' | 'enterprise'
) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update({ subscription_plan: plan })
      .eq('id', organizationId)
      .select('subscription_plan, subscription_status')
      .single();

    if (error) throw error;

    const typedData = data as Pick<Organization, 'subscription_plan' | 'subscription_status'>;
    return successResponse({
      plan: typedData.subscription_plan,
      status: typedData.subscription_status,
    });
  } catch (error) {
    logger.error('Error updating subscription plan:', error instanceof Error ? error.message : String(error));
    return errorResponse(error);
  }
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  organizationId: string,
  status: 'active' | 'past_due' | 'cancelled' | 'suspended' | 'trialing'
) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update({ subscription_status: status })
      .eq('id', organizationId)
      .select('subscription_plan, subscription_status')
      .single();

    if (error) throw error;

    const typedData = data as Pick<Organization, 'subscription_plan' | 'subscription_status'>;
    return successResponse({
      plan: typedData.subscription_plan,
      status: typedData.subscription_status,
    });
  } catch (error) {
    logger.error('Error updating subscription status:', error instanceof Error ? error.message : String(error));
    return errorResponse(error);
  }
}

/**
 * Link payment customer to organization
 * Supports JazzCash, EasyPaisa, and Raast
 */
export async function linkPaymentCustomer(
  organizationId: string,
  paymentProvider: 'jazzcash' | 'easypaisa' | 'raast',
  customerId: string
) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update({
        payment_provider: paymentProvider,
        payment_customer_id: customerId,
      })
      .eq('id', organizationId)
      .select('payment_provider, payment_customer_id, payment_subscription_id')
      .single();

    if (error) throw error;

    const typedData = data as Pick<
      Organization,
      'payment_provider' | 'payment_customer_id' | 'payment_subscription_id'
    >;
    return successResponse({
      payment_provider: typedData.payment_provider,
      payment_customer_id: typedData.payment_customer_id,
      payment_subscription_id: typedData.payment_subscription_id,
    });
  } catch (error) {
    logger.error('Error linking payment customer:', error instanceof Error ? error.message : String(error));
    return errorResponse(error);
  }
}

/**
 * Link payment subscription to organization
 * Supports JazzCash, EasyPaisa, and Raast
 */
export async function linkPaymentSubscription(organizationId: string, subscriptionId: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update({ payment_subscription_id: subscriptionId })
      .eq('id', organizationId)
      .select('payment_provider, payment_customer_id, payment_subscription_id')
      .single();

    if (error) throw error;

    const typedData = data as Pick<
      Organization,
      'payment_provider' | 'payment_customer_id' | 'payment_subscription_id'
    >;
    return successResponse({
      payment_provider: typedData.payment_provider,
      payment_customer_id: typedData.payment_customer_id,
      payment_subscription_id: typedData.payment_subscription_id,
    });
  } catch (error) {
    logger.error('Error linking payment subscription:', error instanceof Error ? error.message : String(error));
    return errorResponse(error);
  }
}

/**
 * Link Stripe customer to organization
 */
export async function linkStripeCustomer(organizationId: string, stripeCustomerId: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update({
        payment_provider: 'stripe',
        payment_customer_id: stripeCustomerId,
      })
      .eq('id', organizationId)
      .select('payment_provider, payment_customer_id, payment_subscription_id')
      .single();

    if (error) throw error;

    const typedData = data as Pick<
      Organization,
      'payment_provider' | 'payment_customer_id' | 'payment_subscription_id'
    >;
    return successResponse({
      payment_provider: typedData.payment_provider,
      payment_customer_id: typedData.payment_customer_id,
      payment_subscription_id: typedData.payment_subscription_id,
    });
  } catch (error) {
    logger.error('Error linking Stripe customer:', error instanceof Error ? error.message : String(error));
    return errorResponse(error);
  }
}

/**
 * Link Stripe subscription to organization
 */
export async function linkStripeSubscription(organizationId: string, stripeSubscriptionId: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update({ payment_subscription_id: stripeSubscriptionId })
      .eq('id', organizationId)
      .select('payment_provider, payment_customer_id, payment_subscription_id')
      .single();

    if (error) throw error;

    const typedData = data as Pick<
      Organization,
      'payment_provider' | 'payment_customer_id' | 'payment_subscription_id'
    >;
    return successResponse({
      payment_provider: typedData.payment_provider,
      payment_customer_id: typedData.payment_customer_id,
      payment_subscription_id: typedData.payment_subscription_id,
    });
  } catch (error) {
    logger.error('Error linking Stripe subscription:', error instanceof Error ? error.message : String(error));
    return errorResponse(error);
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update({
        subscription_status: 'cancelled',
        subscription_plan: 'free',
      })
      .eq('id', organizationId)
      .select('subscription_plan, subscription_status')
      .single();

    if (error) throw error;

    const typedData = data as Pick<Organization, 'subscription_plan' | 'subscription_status'>;
    return successResponse({
      plan: typedData.subscription_plan,
      status: typedData.subscription_status,
    });
  } catch (error) {
    logger.error('Error cancelling subscription:', error instanceof Error ? error.message : String(error));
    return errorResponse(error);
  }
}

/**
 * Get subscription usage statistics
 */
export async function getSubscriptionUsage(organizationId: string) {
  try {
    // Get organization subscription details
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('subscription_plan')
      .eq('id', organizationId)
      .single();

    if (orgError) throw orgError;
    if (!org) throw new Error('Organization not found');

    // Get user count
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    // Get customer count
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    // Get invoice count (this month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const { count: invoiceCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('invoice_date', currentMonth.toISOString().split('T')[0]);

    // Plan limits (example - adjust based on your plan structure)
    const planLimits: Record<
      string,
      { users: number; customers: number; invoices_per_month: number }
    > = {
      free: { users: 1, customers: 10, invoices_per_month: 10 },
      pro: { users: 5, customers: 100, invoices_per_month: 500 },
      enterprise: { users: -1, customers: -1, invoices_per_month: -1 }, // -1 = unlimited
    };

    const typedOrg = org as Pick<Organization, 'subscription_plan'>;
    const limits = planLimits[typedOrg.subscription_plan] ?? planLimits.free;

    return successResponse({
      plan: typedOrg.subscription_plan,
      usage: {
        users: userCount ?? 0,
        customers: customerCount ?? 0,
        invoices_this_month: invoiceCount ?? 0,
      },
      limits: limits!,
      is_over_limit: {
        users: limits!.users !== -1 && (userCount ?? 0) > limits!.users,
        customers: limits!.customers !== -1 && (customerCount ?? 0) > limits!.customers,
        invoices:
          limits!.invoices_per_month !== -1 && (invoiceCount ?? 0) > limits!.invoices_per_month,
      },
    });
  } catch (error) {
    logger.error('Error fetching subscription usage:', error instanceof Error ? error.message : String(error));
    return errorResponse(error);
  }
}
