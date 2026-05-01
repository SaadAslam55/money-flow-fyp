// src/hooks/useAnalytics.ts
/**
 * Analytics Hook
 * Provides analytics tracking functionality
 *
 * Note: This hook provides a unified interface for analytics.
 * Actual implementation depends on configured analytics services.
 */

import { logger } from '@/lib/logger';
import { useCallback } from 'react';
import { ENV_CONFIG } from '@/config/env.config';

/**
 * Analytics event types
 */
export type AnalyticsEvent =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'link_click'
  | 'search'
  | 'download'
  | 'share'
  | 'api_call'
  | 'user_action'
  | 'error'
  | 'performance'
  | 'custom';

// Extended events for middleware use
export type MiddlewareAnalyticsEvent = AnalyticsEvent;

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

/**
 * Hook to track analytics events
 *
 * @example
 * ```tsx
 * let { trackEvent, trackPageView } = useAnalytics();
 *
 * trackEvent({
 *   event: 'button_click',
 *   category: 'navigation',
 *   action: 'click',
 *   label: 'header_menu'
 * });
 * ```
 */
export function useAnalytics() {
  const trackEvent = useCallback((data: AnalyticsEventData) => {
    // Only track in production or if analytics is enabled
    if (!ENV_CONFIG.isProduction && !ENV_CONFIG.analytics.googleAnalyticsId) {
      return;
    }

    // Google Analytics 4
    if (
      ENV_CONFIG.analytics.googleAnalyticsId &&
      typeof window !== 'undefined' &&
      (window as any).gtag
    ) {
      (window as any).gtag('event', data.action || data.event, {
        event_category: data.category,
        event_label: data.label,
        value: data.value,
        ...data,
      });
    }

    // Mixpanel
    if (
      ENV_CONFIG.analytics.mixpanelToken &&
      typeof window !== 'undefined' &&
      (window as any).mixpanel
    ) {
      (window as any).mixpanel.track(data.event, data);
    }

    // Console log in development
    if (ENV_CONFIG.isDevelopment) {

      logger.info('[Analytics]', data instanceof Error ? data.message : String(data));
    }
  }, []);

  const trackPageView = useCallback(
    (path: string, title?: string) => {
      trackEvent({
        event: 'page_view',
        category: 'navigation',
        action: 'page_view',
        label: path,
        page_path: path,
        page_title: title || document.title,
      });
    },
    [trackEvent]
  );

  const trackButtonClick = useCallback(
    (buttonName: string, location?: string) => {
      trackEvent({
        event: 'button_click',
        category: 'interaction',
        action: 'click',
        label: buttonName,
        location,
      });
    },
    [trackEvent]
  );

  const trackFormSubmit = useCallback(
    (formName: string, success: boolean) => {
      trackEvent({
        event: 'form_submit',
        category: 'form',
        action: 'submit',
        label: formName,
        success,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFormSubmit,
    isEnabled: !!(ENV_CONFIG.analytics.googleAnalyticsId || ENV_CONFIG.analytics.mixpanelToken),
  };
}
