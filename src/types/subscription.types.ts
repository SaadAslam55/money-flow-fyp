// src/types/subscription.types.ts
/**
 * Subscription Type Definitions
 * 
 * Types related to subscription plans, billing, and usage
 */

import type { SubscriptionPlan, SubscriptionStatus } from './database.types';

// ============================================
// SUBSCRIPTION TYPES
// ============================================

/**
 * Subscription details
 */
export interface Subscription {
  id: string;
  organization_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription plan details
 */
export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
  limits: PlanLimits;
  popular?: boolean;
}

/**
 * Plan feature
 */
export interface PlanFeature {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  limit?: number;
}

/**
 * Plan limits
 */
export interface PlanLimits {
  users: number; // -1 for unlimited
  customers: number; // -1 for unlimited
  invoices_per_month: number; // -1 for unlimited
  storage_gb: number; // -1 for unlimited
  api_calls_per_month: number; // -1 for unlimited
  support_level: 'email' | 'priority' | 'dedicated';
}

/**
 * Subscription usage
 */
export interface SubscriptionUsage {
  plan: SubscriptionPlan;
  usage: {
    users: number;
    customers: number;
    invoices_this_month: number;
    storage_gb: number;
    api_calls_this_month: number;
  };
  limits: PlanLimits;
  is_over_limit: {
    users: boolean;
    customers: boolean;
    invoices: boolean;
    storage: boolean;
    api_calls: boolean;
  };
}

// ============================================
// BILLING TYPES
// ============================================

/**
 * Billing invoice
 */
export interface BillingInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  due_date: string;
  paid_at?: string | null;
  pdf_url?: string | null;
  hosted_invoice_url?: string | null;
  created_at: string;
}

/**
 * Payment method
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  bank_account?: {
    bank_name: string;
    last4: string;
    account_type: string;
  };
  is_default: boolean;
  created_at: string;
}

/**
 * Billing address
 */
export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

// ============================================
// CHECKOUT TYPES
// ============================================

/**
 * Checkout session request
 */
export interface CheckoutSessionRequest {
  plan_id: SubscriptionPlan;
  organization_id: string;
  success_url: string;
  cancel_url: string;
  trial_days?: number;
}

/**
 * Checkout session response
 */
export interface CheckoutSessionResponse {
  session_id: string | null;
  url: string | null;
  error: Error | null;
}

// ============================================
// SUBSCRIPTION UPDATE TYPES
// ============================================

/**
 * Update subscription plan request
 */
export interface UpdatePlanRequest {
  plan_id: SubscriptionPlan;
  prorate?: boolean;
  billing_cycle_anchor?: 'now' | 'unchanged';
}

/**
 * Update subscription plan response
 */
export interface UpdatePlanResponse {
  subscription: Subscription | null;
  error: Error | null;
}

/**
 * Cancel subscription request
 */
export interface CancelSubscriptionRequest {
  immediately?: boolean;
  feedback?: string;
}

/**
 * Cancel subscription response
 */
export interface CancelSubscriptionResponse {
  subscription: Subscription | null;
  cancel_at_period_end: boolean;
  error: Error | null;
}

/**
 * Resume subscription request
 */
export interface ResumeSubscriptionRequest {
  plan_id?: SubscriptionPlan;
}

/**
 * Resume subscription response
 */
export interface ResumeSubscriptionResponse {
  subscription: Subscription | null;
  error: Error | null;
}

// ============================================
// WEBHOOK TYPES
// ============================================

/**
 * Stripe webhook event type
 */
export type StripeWebhookEvent =
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.updated';

/**
 * Webhook payload
 */
export interface WebhookPayload {
  id: string;
  type: StripeWebhookEvent;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

// ============================================
// TRIAL TYPES
// ============================================

/**
 * Trial information
 */
export interface TrialInfo {
  is_trial: boolean;
  trial_start?: string | null;
  trial_end?: string | null;
  days_remaining?: number;
  will_cancel_at_end?: boolean;
}

// ============================================
// UPGRADE/DOWNGRADE TYPES
// ============================================

/**
 * Plan comparison
 */
export interface PlanComparison {
  current_plan: SubscriptionPlan;
  target_plan: SubscriptionPlan;
  price_difference: number;
  feature_changes: {
    added: PlanFeature[];
    removed: PlanFeature[];
    changed: Array<{
      feature: PlanFeature;
      old_limit?: number;
      new_limit?: number;
    }>;
  };
  prorated_amount?: number;
  effective_date: string;
}

