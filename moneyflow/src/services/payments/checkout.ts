// src/services/payments/checkout.ts
/**
 * Payment Checkout Service
 * Handles payment checkout flow for subscriptions and invoices
 * Supports local payment methods: JazzCash, EasyPaisa, and Raast
 *
 * Features:
 * - Create checkout sessions for subscription payments
 * - Redirect to payment provider checkout pages
 * - Verify checkout session completion
 * - Get available payment providers for organization
 *
 * @example
 * ```typescript
 *
import { createCheckoutSession, redirectToCheckout } from '@/services/payments/checkout';
 *
 * // Create checkout session
 * const { sessionId, url, error } = await createCheckoutSession(
 *   'pro',
 *   'org-id',
 *   'jazzcash',
 *   'https://yourapp.com/success',
 *   'https://yourapp.com/cancel'
 * );
 *
 * // Redirect to checkout
 * await redirectToCheckout('pro', 'org-id', 'jazzcash');
 * ```
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import type { PaymentProvider } from '@/types/database.types';
import type { CheckoutSessionResponse } from '@/types/subscription.types';
import { ROUTE_PATHS } from '@/config/routes.config';

/**
 * Create checkout session for subscription payment
 *
 * Creates a checkout session via Supabase Edge Function and returns payment URL.
 * Supports JazzCash, EasyPaisa, and Raast payment methods.
 *
 * @param planId - Subscription plan ID ('free', 'pro', 'enterprise')
 * @param organizationId - Organization ID
 * @param paymentProvider - Payment provider to use (default: 'jazzcash')
 * @param successUrl - URL to redirect after successful payment
 * @param cancelUrl - URL to redirect if payment is cancelled
 * @returns Checkout session response with session ID, payment URL, and error
 */
export async function createCheckoutSession(
  planId: string,
  organizationId: string,
  paymentProvider: PaymentProvider = 'jazzcash',
  successUrl?: string,
  cancelUrl?: string
): Promise<CheckoutSessionResponse> {
  try {
    // Validate inputs
    if (!planId || !organizationId) {
      return {
        session_id: null,
        url: null,
        error: new Error('Plan ID and Organization ID are required'),
      };
    }

    // Validate plan ID
    const validPlans = ['free', 'pro', 'enterprise'];
    if (!validPlans.includes(planId)) {
      return {
        session_id: null,
        url: null,
        error: new Error(`Invalid plan ID. Must be one of: ${validPlans.join(', ')}`),
      };
    }

    // Validate payment provider
    const validProviders: PaymentProvider[] = ['jazzcash', 'easypaisa', 'raast'];
    if (!validProviders.includes(paymentProvider)) {
      return {
        session_id: null,
        url: null,
        error: new Error(`Invalid payment provider. Must be one of: ${validProviders.join(', ')}`),
      };
    }

    // Set default URLs if not provided
    const defaultSuccessUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${ROUTE_PATHS.SUBSCRIPTION.SUCCESS}`
        : ROUTE_PATHS.SUBSCRIPTION.SUCCESS;
    const defaultCancelUrl =
      typeof window !== 'undefined' ? `${window.location.origin}${ROUTE_PATHS.SUBSCRIPTION.BASE}` : ROUTE_PATHS.SUBSCRIPTION.BASE;

    const finalSuccessUrl = successUrl || defaultSuccessUrl;
    const finalCancelUrl = cancelUrl || defaultCancelUrl;

    // Validate URLs
    try {
      new URL(finalSuccessUrl);
      new URL(finalCancelUrl);
    } catch {
      return {
        session_id: null,
        url: null,
        error: new Error('Invalid success or cancel URL format'),
      };
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        planId,
        organizationId,
        paymentProvider,
        successUrl: finalSuccessUrl,
        cancelUrl: finalCancelUrl,
      },
    });

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('Error creating checkout session:', error instanceof Error ? error.message : String(error));
      }
      return {
        session_id: null,
        url: null,
        error: new Error(error.message ?? 'Failed to create checkout session'),
      };
    }

    return {
      session_id: data?.session_id || data?.sessionId || data?.id || null,
      url: data?.paymentUrl || data?.checkoutUrl || data?.url || null,
      error: null,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error creating checkout session:', error instanceof Error ? error.message : String(error));
    }
    return {
      session_id: null,
      url: null,
      error: error instanceof Error ? error : new Error('Checkout session creation failed'),
    };
  }
}

/**
 * Redirect to payment checkout
 *
 * Creates a checkout session and redirects user to payment provider's checkout page.
 * Supports JazzCash, EasyPaisa, and Raast.
 *
 * @param planId - Subscription plan ID ('free', 'pro', 'enterprise')
 * @param organizationId - Organization ID
 * @param paymentProvider - Payment provider to use (default: 'jazzcash')
 * @returns Error object if redirect fails, null on success
 * @throws Error if called outside browser environment
 */
export async function redirectToCheckout(
  planId: string,
  organizationId: string,
  paymentProvider: PaymentProvider = 'jazzcash'
): Promise<{ error: Error | null }> {
  try {
    if (typeof window === 'undefined') {
      return { error: new Error('redirectToCheckout can only be called in browser environment') };
    }

    const successUrl = `${window.location.origin}${ROUTE_PATHS.SUBSCRIPTION.SUCCESS}?session_id={SESSION_ID}`;
    const cancelUrl = `${window.location.origin}${ROUTE_PATHS.SUBSCRIPTION.BASE}`;

    const { url, error: sessionError } = await createCheckoutSession(
      planId,
      organizationId,
      paymentProvider,
      successUrl,
      cancelUrl
    );

    if (sessionError || !url) {
      return { error: sessionError || new Error('Failed to create payment session') };
    }

    // Redirect to payment provider
    window.location.href = url;

    return { error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error redirecting to checkout:', error instanceof Error ? error.message : String(error));
    }
    return {
      error: error instanceof Error ? error : new Error('Checkout redirect failed'),
    };
  }
}

/**
 * Verify checkout session
 *
 * Validates payment completion after redirect from payment provider.
 * Checks if the checkout session was successfully completed.
 *
 * @param sessionId - Checkout session ID from payment provider
 * @returns Verification result with validity status and error
 */
export async function verifyCheckoutSession(
  sessionId: string
): Promise<{ valid: boolean; error: Error | null }> {
  try {
    // Validate session ID
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return {
        valid: false,
        error: new Error('Session ID is required'),
      };
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('verify-checkout-session', {
      body: {
        sessionId: sessionId.trim(),
      },
    });

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('Error verifying checkout session:', error instanceof Error ? error.message : String(error));
      }
      return {
        valid: false,
        error: new Error(error.message ?? 'Session verification failed'),
      };
    }

    return {
      valid: data?.valid === true || data?.success === true || false,
      error: null,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error verifying checkout session:', error instanceof Error ? error.message : String(error));
    }
    return {
      valid: false,
      error: error instanceof Error ? error : new Error('Session verification failed'),
    };
  }
}

/**
 * Get available payment providers for an organization
 *
 * Fetches the list of payment providers configured and available for an organization.
 *
 * @param organizationId - Organization ID
 * @returns Available payment providers and error status
 */
export async function getAvailablePaymentProviders(
  organizationId: string
): Promise<{ providers: PaymentProvider[]; error: Error | null }> {
  try {
    // Validate organization ID
    if (
      !organizationId ||
      typeof organizationId !== 'string' ||
      organizationId.trim().length === 0
    ) {
      return {
        providers: [],
        error: new Error('Organization ID is required'),
      };
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('get-payment-providers', {
      body: {
        organizationId: organizationId.trim(),
      },
    });

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('Error fetching payment providers:', error instanceof Error ? error.message : String(error));
      }
      // Return default providers on error (graceful fallback)
      return {
        providers: ['jazzcash', 'easypaisa', 'raast'],
        error: null, // Don't fail if providers can't be fetched
      };
    }

    // Validate and filter providers
    const validProviders: PaymentProvider[] = ['jazzcash', 'easypaisa', 'raast'];
    const providers = (data?.providers ?? ['jazzcash', 'easypaisa', 'raast']).filter((p: string) =>
      validProviders.includes(p as PaymentProvider)
    ) as PaymentProvider[];

    return {
      providers: providers.length > 0 ? providers : ['jazzcash', 'easypaisa', 'raast'],
      error: null,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error fetching payment providers:', error instanceof Error ? error.message : String(error));
    }
    // Return default providers on error (graceful fallback)
    return {
      providers: ['jazzcash', 'easypaisa', 'raast'],
      error: null, // Don't fail if providers can't be fetched
    };
  }
}
