// src/services/analytics/googleAnalytics.ts
/**
 * Google Analytics Service
 * Integrates with Google Analytics 4 (GA4) for event tracking and user analytics
 *
 * Features:
 * - Page view tracking
 * - Custom event tracking
 * - User identification
 * - E-commerce tracking
 * - Error tracking
 *
 * @example
 * ```typescript
 *
import { initializeGoogleAnalytics, trackPageView, trackEvent } from '@/services/analytics/googleAnalytics';
 *
 * // Initialize on app startup
 * initializeGoogleAnalytics();
 *
 * // Track page view
 * trackPageView('/dashboard', 'Dashboard');
 *
 * // Track custom event
 * trackEvent('button_click', { button_name: 'submit' });
 * ```
 */

import { logger } from '@/lib/logger';

declare global {
  interface Window {
    gtag?: (command: string, targetId: string | Date, config?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

const GA_MEASUREMENT_ID = (import.meta as { env?: { VITE_GA_MEASUREMENT_ID?: string } }).env
  ?.VITE_GA_MEASUREMENT_ID;

/**
 * Check if Google Analytics is initialized
 */
export function isGoogleAnalyticsInitialized(): boolean {
  return typeof window !== 'undefined' && !!window.gtag && !!GA_MEASUREMENT_ID;
}

/**
 * Initialize Google Analytics
 * Should be called once at application startup
 *
 * @returns true if initialization was successful, false otherwise
 */
export function initializeGoogleAnalytics(): boolean {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') {
    // Silently skip initialization if GA_MEASUREMENT_ID is not configured
    // This is expected in development and when GA is not enabled
    return false;
  }

  // Prevent double initialization
  if (isGoogleAnalyticsInitialized()) {
    const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
    if (isDev) {
      logger.warn('[Analytics] Google Analytics already initialized');
    }
    return true;
  }

  try {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onerror = () => {

      logger.error('[Analytics] Failed to load Google Analytics script');
    };
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    window.gtag = function gtag(...args: unknown[]) {
      if (window.dataLayer) {
        window.dataLayer.push(args);
      }
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      send_page_view: false, // We'll track page views manually
    });

    const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
    if (isDev) {
      logger.info('[Analytics] Google Analytics initialized successfully');
    }

    return true;
  } catch (error) {

    logger.error('[Analytics] Error initializing Google Analytics:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Track page view
 *
 * @param path - Page path (e.g., '/dashboard')
 * @param title - Page title (optional, defaults to document.title)
 */
export function trackPageView(path: string, title?: string): void {
  if (!isGoogleAnalyticsInitialized()) {
    const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
    if (isDev) {
      logger.info('[Analytics] Page view not tracked (GA not initialized):', path);
    }
    return;
  }

  try {
    window.gtag!('config', GA_MEASUREMENT_ID!, {
      page_path: path,
      page_title: title || document.title,
    });
  } catch (error) {

    logger.error('[Analytics] Error tracking page view:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Track custom event
 *
 * @param eventName - Event name (e.g., 'button_click', 'form_submit')
 * @param parameters - Event parameters (optional)
 */
export function trackEvent(eventName: string, parameters?: Record<string, unknown>): void {
  if (!isGoogleAnalyticsInitialized()) {
    const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
    if (isDev) {
      logger.info('[Analytics] Event not tracked (GA not initialized):', eventName);
    }
    return;
  }

  try {
    window.gtag!('event', eventName, parameters ?? {});
  } catch (error) {

    logger.error('[Analytics] Error tracking event:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Track custom event with category, action, label, and value
 *
 * @param category - Event category (e.g., 'navigation', 'form')
 * @param action - Event action (e.g., 'click', 'submit')
 * @param label - Event label (optional)
 * @param value - Event value (optional)
 */
export function trackCustomEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  trackEvent('custom_event', {
    event_category: category,
    event_action: action,
    event_label: label,
    value,
  });
}

/**
 * Track user login
 *
 * @param method - Login method (e.g., 'email', 'google', 'github')
 */
export function trackLogin(method: string = 'email'): void {
  trackEvent('login', { method });
}

/**
 * Track user signup
 *
 * @param method - Signup method (e.g., 'email', 'google', 'github')
 */
export function trackSignup(method: string = 'email'): void {
  trackEvent('sign_up', { method });
}

/**
 * Track invoice creation
 *
 * @param invoiceId - Invoice ID
 * @param amount - Invoice amount
 */
export function trackInvoiceCreated(invoiceId: string, amount: number): void {
  trackEvent('invoice_created', {
    invoice_id: invoiceId,
    value: amount,
    currency: 'PKR',
  });
}

/**
 * Track payment received
 *
 * @param invoiceId - Invoice ID
 * @param amount - Payment amount
 */
export function trackPaymentReceived(invoiceId: string, amount: number): void {
  trackEvent('payment_received', {
    invoice_id: invoiceId,
    value: amount,
    currency: 'PKR',
  });
}

/**
 * Track subscription upgrade/downgrade
 *
 * @param planId - Subscription plan ID
 * @param planName - Subscription plan name
 * @param amount - Subscription amount
 */
export function trackSubscriptionChange(planId: string, planName: string, amount: number): void {
  trackEvent('subscription_change', {
    plan_id: planId,
    plan_name: planName,
    value: amount,
    currency: 'PKR',
  });
}

/**
 * Track error/exception
 *
 * @param error - Error message or Error object
 * @param fatal - Whether the error is fatal
 */
export function trackError(error: string | Error, fatal: boolean = false): void {
  if (!isGoogleAnalyticsInitialized()) return;

  try {
    const errorMessage = error instanceof Error ? error.message : error;
    window.gtag!('event', 'exception', {
      description: errorMessage,
      fatal,
    });
  } catch (err) {

    logger.error('[Analytics] Error tracking exception:', err instanceof Error ? err.message : String(err));
  }
}

/**
 * Set user properties
 *
 * @param properties - User properties object
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (!isGoogleAnalyticsInitialized()) return;

  try {
    window.gtag!('set', 'user_properties', properties);
  } catch (error) {

    logger.error('[Analytics] Error setting user properties:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Set user ID for tracking
 *
 * @param userId - User ID
 */
export function setUserId(userId: string): void {
  if (!isGoogleAnalyticsInitialized()) return;

  try {
    window.gtag!('config', GA_MEASUREMENT_ID!, {
      user_id: userId,
    });
  } catch (error) {

    logger.error('[Analytics] Error setting user ID:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Clear user ID (on logout)
 */
export function clearUserId(): void {
  if (!isGoogleAnalyticsInitialized()) return;

  try {
    window.gtag!('config', GA_MEASUREMENT_ID!, {
      user_id: null,
    });
  } catch (error) {

    logger.error('[Analytics] Error clearing user ID:', error instanceof Error ? error.message : String(error));
  }
}
