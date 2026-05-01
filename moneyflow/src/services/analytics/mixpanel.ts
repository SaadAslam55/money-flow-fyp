// src/services/analytics/mixpanel.ts
/**
 * Mixpanel Analytics Service
 * Integrates with Mixpanel for event tracking and user analytics
 * 
 * Features:
 * - Event tracking
 * - User identification
 * - User properties
 * - Funnel analysis
 * - Cohort analysis
 * 
 * @example
 * ```typescript
 *
import { initializeMixpanel, trackEvent, identifyUser } from '@/services/analytics/mixpanel';
 * 
 * // Initialize on app startup
 * initializeMixpanel();
 * 
 * // Identify user
 * identifyUser('user-123', { email: 'user@example.com' });
 * 
 * // Track event
 * trackEvent('button_click', { button_name: 'submit' });
 * ```
 */

import { logger } from '@/lib/logger';

declare global {
  interface Window {
    mixpanel?: {
      init: (token: string, config?: Record<string, unknown>) => void;
      identify: (id: string) => void;
      track: (eventName: string, properties?: Record<string, unknown>) => void;
      people: {
        set: (properties: Record<string, unknown>) => void;
      };
      register: (properties: Record<string, unknown>) => void;
      reset: () => void;
      SNIPPET_VERSION?: string;
      snippet_version?: string;
      _i?: unknown[];
    };
  }
}

// Safely get Mixpanel token (don't access at module load if it causes issues)
function getMixpanelToken(): string | undefined {
  try {
    return (import.meta as { env?: { VITE_MIXPANEL_TOKEN?: string } }).env?.VITE_MIXPANEL_TOKEN;
  } catch {
    return undefined;
  }
}

// Track initialization state
let mixpanelInitialized = false;
let mixpanelInitPromise: Promise<boolean> | null = null;

/**
 * Wait for Mixpanel to be ready
 * Polls until window.mixpanel is available
 */
function waitForMixpanel(maxAttempts = 50, interval = 100): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;
    const checkMixpanel = () => {
      if (
        typeof window !== 'undefined' &&
        window.mixpanel &&
        typeof window.mixpanel.init === 'function'
      ) {
        resolve(true);
      } else if (attempts >= maxAttempts) {
        resolve(false);
      } else {
        attempts++;
        setTimeout(checkMixpanel, interval);
      }
    };
    checkMixpanel();
  });
}

/**
 * Check if Mixpanel is initialized and ready
 */
export function isMixpanelInitialized(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = getMixpanelToken();
  if (!token) {
    return false;
  }

  // Check if mixpanel object exists and has been initialized
  return mixpanelInitialized && !!window.mixpanel && typeof window.mixpanel.track === 'function';
}

/**
 * Initialize Mixpanel
 * Should be called once at application startup
 *
 * @returns Promise that resolves to true if initialization was successful, false otherwise
 */
export function initializeMixpanel(): boolean {
  // Safely check environment
  const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;

  if (typeof window === 'undefined') {
    return false;
  }

  const token = getMixpanelToken();
  if (!token) {
    // Silently skip when no token is configured - this is expected in development
    // No logging needed as this is the normal state when analytics is not set up
    return false;
  }

  // Prevent double initialization
  if (mixpanelInitialized && isMixpanelInitialized()) {
    if (isDev) {
      logger.warn('[Analytics] Mixpanel already initialized');
    }
    return true;
  }

  // If initialization is in progress, return false (will be ready soon)
  if (mixpanelInitPromise) {
    return false;
  }

  // Load Mixpanel script dynamically only if token is available
  // This prevents the script from loading when no token is configured
  // We use the official Mixpanel snippet pattern but load it conditionally
  try {
    // Create the Mixpanel stub if it doesn't exist
    // This follows the official Mixpanel snippet pattern
    if (!window.mixpanel) {
      (function (d: Document, w: Window) {
        const mp = (w.mixpanel = [] as any);
        mp._i = [];
        mp.init = function (token: string, config?: Record<string, unknown>) {
          // This will be replaced by the real Mixpanel script
          mp._i.push(['init', token, config]);
        };
        mp.track = function (eventName: string, properties?: Record<string, unknown>) {
          mp._i.push(['track', eventName, properties]);
        };
        mp.identify = function (id: string) {
          mp._i.push(['identify', id]);
        };
        mp.reset = function () {
          mp._i.push(['reset']);
        };
        mp.people = {
          set: function (properties: Record<string, unknown>) {
            mp._i.push(['people.set', properties]);
          },
        };
        mp.register = function (properties: Record<string, unknown>) {
          mp._i.push(['register', properties]);
        };
      })(document, window);
    }

    // Load the actual Mixpanel script
    mixpanelInitPromise = new Promise<boolean>((resolve) => {
      // Check if script is already loading or loaded
      const existingScript = document.querySelector('script[src*="mixpanel-2-latest.min.js"]');
      if (existingScript) {
        // Script already exists, wait for it to be ready
        waitForMixpanel().then((ready) => {
          if (ready && window.mixpanel && typeof window.mixpanel.init === 'function') {
            try {
              window.mixpanel.init(token, {
                debug: isDev,
                track_pageview: false,
                persistence: 'localStorage',
                ignore_dnt: false,
              });
              mixpanelInitialized = true;
              if (isDev) {
                logger.info('[Analytics] Mixpanel initialized successfully');
              }
              resolve(true);
            } catch (error) {
              logger.error(
                '[Analytics] Error initializing Mixpanel:',
                error instanceof Error ? error.message : String(error)
              );
              resolve(false);
            }
          } else {
            resolve(false);
          }
          mixpanelInitPromise = null;
        });
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
      script.crossOrigin = 'anonymous';

      script.onerror = () => {
        logger.error('[Analytics] Failed to load Mixpanel script');
        mixpanelInitPromise = null;
        resolve(false);
      };

      script.onload = () => {
        waitForMixpanel().then((ready) => {
          if (ready && window.mixpanel && typeof window.mixpanel.init === 'function') {
            try {
              window.mixpanel.init(token, {
                debug: isDev,
                track_pageview: false,
                persistence: 'localStorage',
                ignore_dnt: false,
              });
              mixpanelInitialized = true;
              if (isDev) {
                logger.info('[Analytics] Mixpanel initialized successfully');
              }
              resolve(true);
            } catch (error) {
              logger.error(
                '[Analytics] Error initializing Mixpanel:',
                error instanceof Error ? error.message : String(error)
              );
              resolve(false);
            }
          } else {
            resolve(false);
          }
          mixpanelInitPromise = null;
        });
      };

      document.head.appendChild(script);
    });

    return false; // Will be ready asynchronously
  } catch (error) {
    logger.error(
      '[Analytics] Error initializing Mixpanel:',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

/**
 * Track event
 *
 * @param eventName - Event name (e.g., 'Button Clicked', 'Form Submitted')
 * @param properties - Event properties (optional)
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  // Check if Mixpanel is ready
  if (!isMixpanelInitialized()) {
    // Silently fail when Mixpanel is not initialized - this is expected when no token is configured
    return;
  }

  // Double-check mixpanel exists before calling
  if (!window.mixpanel || typeof window.mixpanel.track !== 'function') {
    // Silently fail when Mixpanel object is not available
    return;
  }

  try {
    window.mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      '[Analytics] Error tracking event:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Identify user
 * Associates events with a specific user ID
 *
 * @param userId - User ID
 * @param properties - User properties (optional)
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!isMixpanelInitialized() || !window.mixpanel) return;

  try {
    if (typeof window.mixpanel.identify === 'function') {
      window.mixpanel.identify(userId);
    }

    if (properties && window.mixpanel.people && typeof window.mixpanel.people.set === 'function') {
      window.mixpanel.people.set(properties);
    }

    if (properties && typeof window.mixpanel.register === 'function') {
      window.mixpanel.register(properties);
    }
  } catch (error) {
    logger.error(
      '[Analytics] Error identifying user:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Set user properties
 * Updates user profile properties
 *
 * @param properties - User properties object
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (!isMixpanelInitialized() || !window.mixpanel) return;

  try {
    if (window.mixpanel.people && typeof window.mixpanel.people.set === 'function') {
      window.mixpanel.people.set(properties);
    }
    if (typeof window.mixpanel.register === 'function') {
      window.mixpanel.register(properties);
    }
  } catch (error) {
    logger.error(
      '[Analytics] Error setting user properties:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Track page view
 *
 * @param path - Page path (e.g., '/dashboard')
 * @param title - Page title (optional, defaults to document.title)
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent('Page Viewed', {
    path,
    title: title || document.title,
  });
}

/**
 * Track user login
 *
 * @param method - Login method (e.g., 'email', 'google', 'github')
 */
export function trackLogin(method: string = 'email'): void {
  trackEvent('User Logged In', { method });
}

/**
 * Track user signup
 *
 * @param method - Signup method (e.g., 'email', 'google', 'github')
 */
export function trackSignup(method: string = 'email'): void {
  trackEvent('User Signed Up', { method });
}

/**
 * Track invoice creation
 *
 * @param invoiceId - Invoice ID
 * @param amount - Invoice amount
 */
export function trackInvoiceCreated(invoiceId: string, amount: number): void {
  trackEvent('Invoice Created', {
    invoice_id: invoiceId,
    amount,
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
  trackEvent('Payment Received', {
    invoice_id: invoiceId,
    amount,
    currency: 'PKR',
  });
}

/**
 * Track subscription change
 *
 * @param planId - Subscription plan ID
 * @param planName - Subscription plan name
 * @param amount - Subscription amount
 */
export function trackSubscriptionChange(planId: string, planName: string, amount: number): void {
  trackEvent('Subscription Changed', {
    plan_id: planId,
    plan_name: planName,
    amount,
    currency: 'PKR',
  });
}

/**
 * Reset user (on logout)
 * Clears user identification and properties
 */
export function resetUser(): void {
  if (!isMixpanelInitialized() || !window.mixpanel) return;

  try {
    if (typeof window.mixpanel.reset === 'function') {
      window.mixpanel.reset();
    }
  } catch (error) {
    logger.error(
      '[Analytics] Error resetting user:',
      error instanceof Error ? error.message : String(error)
    );
  }
}
