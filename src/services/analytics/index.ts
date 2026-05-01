// src/services/analytics/index.ts
/**
 * Centralized Analytics Service Exports
 * Import all analytics services from here for better organization
 *
 * Usage:
 *
import { initializeGoogleAnalytics, trackPageView } from '@/services/analytics';
 */

import { logger } from '@/lib/logger';

// Import functions directly to avoid circular dependency issues
import {
  initializeGoogleAnalytics,
  isGoogleAnalyticsInitialized,
  trackPageView as trackGAPageView,
  trackEvent as trackGAEvent,
  trackCustomEvent as trackGACustomEvent,
  trackLogin as trackGALogin,
  trackSignup as trackGASignup,
  trackInvoiceCreated as trackGAInvoiceCreated,
  trackPaymentReceived as trackGAPaymentReceived,
  trackSubscriptionChange as trackGASubscriptionChange,
  trackError as trackGAError,
  setUserProperties as setGAUserProperties,
  setUserId as setGAUserId,
  clearUserId as clearGAUserId,
} from './googleAnalytics';

import {
  initializeMixpanel,
  isMixpanelInitialized,
  trackEvent as trackMixpanelEvent,
  identifyUser as identifyMixpanelUser,
  setUserProperties as setMixpanelUserProperties,
  trackPageView as trackMixpanelPageView,
  trackLogin as trackMixpanelLogin,
  trackSignup as trackMixpanelSignup,
  trackInvoiceCreated as trackMixpanelInvoiceCreated,
  trackPaymentReceived as trackMixpanelPaymentReceived,
  trackSubscriptionChange as trackMixpanelSubscriptionChange,
  resetUser as resetMixpanelUser,
} from './mixpanel';

// Re-export all functions for convenience
export {
  initializeGoogleAnalytics,
  isGoogleAnalyticsInitialized,
  trackGAPageView,
  trackGAEvent,
  trackGACustomEvent,
  trackGALogin,
  trackGASignup,
  trackGAInvoiceCreated,
  trackGAPaymentReceived,
  trackGASubscriptionChange,
  trackGAError,
  setGAUserProperties,
  setGAUserId,
  clearGAUserId,
  initializeMixpanel,
  isMixpanelInitialized,
  trackMixpanelEvent,
  identifyMixpanelUser,
  setMixpanelUserProperties,
  trackMixpanelPageView,
  trackMixpanelLogin,
  trackMixpanelSignup,
  trackMixpanelInvoiceCreated,
  trackMixpanelPaymentReceived,
  trackMixpanelSubscriptionChange,
  resetMixpanelUser,
};

/**
 * Initialize all analytics services
 * Call this at application startup
 *
 * @returns Object with initialization status for each service
 */
export function initializeAnalytics(): {
  googleAnalytics: boolean;
  mixpanel: boolean;
} {
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    return {
      googleAnalytics: false,
      mixpanel: false,
    };
  }

  try {
    // Initialize services with error handling
    let gaInitialized = false;
    let mixpanelInitialized = false;

    try {
      gaInitialized = initializeGoogleAnalytics();
    } catch (error) {
      // Only log GA errors if we're in development mode
      const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
      if (isDev) {
        logger.error(
          '[Analytics] Failed to initialize Google Analytics:',
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    try {
      mixpanelInitialized = initializeMixpanel();
    } catch (error) {
      // Only log Mixpanel errors if we're in development mode
      const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
      if (isDev) {
        logger.error(
          '[Analytics] Failed to initialize Mixpanel:',
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    return {
      googleAnalytics: gaInitialized,
      mixpanel: mixpanelInitialized,
    };
  } catch (error) {
    // Catch any unexpected errors
    const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
    if (isDev) {
      logger.error(
        '[Analytics] Failed to initialize analytics:',
        error instanceof Error ? error.message : String(error)
      );
    }
    return {
      googleAnalytics: false,
      mixpanel: false,
    };
  }
}

/**
 * Check if any analytics service is initialized
 */
export function isAnalyticsInitialized(): boolean {
  return isGoogleAnalyticsInitialized() || isMixpanelInitialized();
}

/**
 * Track page view across all initialized analytics services
 *
 * @param path - Page path
 * @param title - Page title
 */
export function trackPageView(path: string, title?: string): void {
  if (isGoogleAnalyticsInitialized()) {
    trackGAPageView(path, title);
  }
  if (isMixpanelInitialized()) {
    trackMixpanelPageView(path, title);
  }
}

/**
 * Track event across all initialized analytics services
 *
 * @param eventName - Event name
 * @param properties - Event properties
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (isGoogleAnalyticsInitialized()) {
    trackGAEvent(eventName, properties);
  }
  if (isMixpanelInitialized()) {
    trackMixpanelEvent(eventName, properties);
  }
}

/**
 * Identify user across all initialized analytics services
 *
 * @param userId - User ID
 * @param properties - User properties
 */
export function identifyUserAcrossServices(
  userId: string,
  properties?: Record<string, unknown>
): void {
  if (isGoogleAnalyticsInitialized()) {
    setGAUserId(userId);
    if (properties) {
      setGAUserProperties(properties);
    }
  }
  if (isMixpanelInitialized()) {
    identifyMixpanelUser(userId, properties);
  }
}

/**
 * Reset user across all initialized analytics services (on logout)
 */
export function resetUserAcrossServices(): void {
  if (isGoogleAnalyticsInitialized()) {
    clearGAUserId();
  }
  if (isMixpanelInitialized()) {
    resetMixpanelUser();
  }
}
