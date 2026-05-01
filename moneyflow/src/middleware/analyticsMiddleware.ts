// src/middleware/analyticsMiddleware.ts
/**
 * Analytics Middleware
 * Utility functions for tracking analytics events on route changes, API calls, and user actions
 */

import { logger } from '@/lib/logger';
import type { AnalyticsEventData, AnalyticsEvent } from '@/hooks/useAnalytics';

/**
 * Analytics tracking options
 */
export interface AnalyticsOptions {
  enabled?: boolean;
  trackPageViews?: boolean;
  trackAPI?: boolean;
  trackUserActions?: boolean;
}

/**
 * Track page view
 *
 * @param path - Current path
 * @param title - Page title
 * @param options - Analytics options
 *
 * @example
 * ```ts
 * trackPageView('/dashboard', 'Dashboard', { enabled: true });
 * ```
 */
export function trackPageView(path: string, title?: string, options: AnalyticsOptions = {}): void {
  if (options.enabled === false) {
    return;
  }

  if (options.trackPageViews === false) {
    return;
  }

  // Track page view event
  const eventData: AnalyticsEventData = {
    event: 'page_view' as AnalyticsEvent,
    category: 'navigation',
    action: 'page_view',
    label: path,
    page_path: path,
    page_title: title || document.title,
  };

  // Send to analytics service (if configured)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }

  // Log in development
  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {

    logger.info('[Analytics] Page View:', { path, title });
  }
}

/**
 * Track API call
 *
 * @param method - HTTP method
 * @param endpoint - API endpoint
 * @param status - Response status
 * @param duration - Request duration in ms
 * @param options - Analytics options
 *
 * @example
 * ```ts
 * trackAPICall('GET', '/api/invoices', 200, 150, { enabled: true });
 * ```
 */
export function trackAPICall(
  method: string,
  endpoint: string,
  status?: number,
  duration?: number,
  options: AnalyticsOptions = {}
): void {
  if (options.enabled === false) {
    return;
  }

  if (options.trackAPI === false) {
    return;
  }

  const eventData: AnalyticsEventData = {
    event: 'api_call' as AnalyticsEvent,
    category: 'api',
    action: method.toLowerCase(),
    label: endpoint,
    value: duration,
    status_code: status,
    duration_ms: duration,
  };

  // Send to analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'api_call', {
      method,
      endpoint,
      status,
      duration,
    });
  }

  // Log in development
  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {

    logger.info('[Analytics] API Call:', { method, endpoint, status, duration });
  }
}

/**
 * Track user action
 *
 * @param action - Action name
 * @param category - Action category
 * @param label - Action label
 * @param value - Action value
 * @param options - Analytics options
 *
 * @example
 * ```ts
 * trackUserAction('button_click', 'navigation', 'header_menu', 1);
 * ```
 */
export function trackUserAction(
  action: string,
  category: string,
  label?: string,
  value?: number,
  options: AnalyticsOptions = {}
): void {
  if (options.enabled === false) {
    return;
  }

  if (options.trackUserActions === false) {
    return;
  }

  const eventData: AnalyticsEventData = {
    event: 'user_action' as AnalyticsEvent,
    category,
    action,
    label,
    value,
  };

  // Send to analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }

  // Log in development
  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {

    logger.info('[Analytics] User Action:', { action, category, label, value });
  }
}

/**
 * Track form submission
 *
 * @param formName - Form name
 * @param success - Whether submission was successful
 * @param options - Analytics options
 *
 * @example
 * ```ts
 * trackFormSubmit('invoice_form', true);
 * ```
 */
export function trackFormSubmit(
  formName: string,
  success: boolean,
  options: AnalyticsOptions = {}
): void {
  trackUserAction('form_submit', 'form', formName, success ? 1 : 0, options);
}

/**
 * Track error
 *
 * @param error - Error message or object
 * @param context - Error context
 * @param options - Analytics options
 *
 * @example
 * ```ts
 * trackError('Failed to load invoices', 'InvoiceList', { enabled: true });
 * ```
 */
export function trackError(
  error: string | Error,
  context?: string,
  options: AnalyticsOptions = {}
): void {
  if (options.enabled === false) {
    return;
  }

  const errorMessage = error instanceof Error ? error.message : error;

  const eventData: AnalyticsEventData = {
    event: 'error' as AnalyticsEvent,
    category: 'error',
    action: 'error_occurred',
    label: context ?? 'unknown',
    error_message: errorMessage,
  };

  // Send to analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'exception', {
      description: errorMessage,
      fatal: false,
    });
  }

  // Log in development
  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {

    logger.error('[Analytics] Error:', { error: errorMessage, context });
  }
}

/**
 * Track performance metric
 *
 * @param metric - Metric name
 * @param value - Metric value
 * @param unit - Metric unit (e.g., 'ms', 'bytes')
 * @param options - Analytics options
 *
 * @example
 * ```ts
 * trackPerformance('page_load', 1200, 'ms');
 * ```
 */
export function trackPerformance(
  metric: string,
  value: number,
  unit: string = 'ms',
  options: AnalyticsOptions = {}
): void {
  if (options.enabled === false) {
    return;
  }

  const eventData: AnalyticsEventData = {
    event: 'performance' as AnalyticsEvent,
    category: 'performance',
    action: metric,
    value,
    unit,
  };

  // Send to analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'timing_complete', {
      name: metric,
      value,
    });
  }

  // Log in development
  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {

    logger.info('[Analytics] Performance:', { metric, value, unit });
  }
}

/**
 * Create analytics middleware for route changes
 *
 * @param options - Analytics options
 * @returns Function to track route changes
 *
 * @example
 * ```ts
 * const routeTracker = createRouteTracker({ enabled: true });
 * // Use with React Router
 * ```
 */
export function createRouteTracker(options: AnalyticsOptions = {}) {
  return (path: string, title?: string) => {
    trackPageView(path, title, options);
  };
}
