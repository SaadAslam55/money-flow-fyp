// src/services/notifications/push.ts
/**
 * Push Notification Service
 * Handles browser push notifications using the Web Push API
 *
 * Features:
 * - Browser notification permission management
 * - Custom notification display with actions
 * - Push subscription management
 * - Notification click handling
 *
 * @example
 * ```typescript
 *
import {
 *   requestNotificationPermission,
 *   showNotification,
 *   showSuccessNotification
 * } from '@/services/notifications/push';
 *
 * // Request permission
 * const permission = await requestNotificationPermission();
 *
 * // Show notification
 * await showNotification({
 *   title: 'New Invoice',
 *   body: 'Invoice INV-001 has been created',
 *   icon: '/icon-192x192.png'
 * });
 *
 * // Show success notification
 * await showSuccessNotification('Invoice created successfully');
 * ```
 */

import { logger } from '@/lib/logger';

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Request notification permission from user
 *
 * @returns Notification permission status ('granted', 'denied', or 'default')
 * @throws Error if notifications are not supported
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined') {
    throw new Error('Window object is not available');
  }

  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications');
  }

  // Return current permission if already granted or denied
  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  // Request permission from user
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {

    logger.error('Error requesting notification permission:', error instanceof Error ? error.message : String(error));
    throw new Error('Failed to request notification permission');
  }
}

/**
 * Check if notifications are supported in the current browser
 *
 * @returns true if both Notification API and Service Worker are supported
 */
export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Show browser notification
 *
 * @param options - Notification options including title, body, and display settings
 * @returns Result object with success status and optional error message
 */
export async function showNotification(
  options: PushNotificationOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Window object is not available' };
    }

    if (!isNotificationSupported()) {
      return { success: false, error: 'Notifications not supported in this browser' };
    }

    // Validate required fields
    if (!options.title || !options.body) {
      return { success: false, error: 'Title and body are required' };
    }

    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
      return {
        success: false,
        error:
          permission === 'denied'
            ? 'Notification permission denied by user'
            : 'Notification permission not granted',
      };
    }

    const notificationOptions: NotificationOptions & { actions?: any[] } = {
      body: options.body,
      icon: options.icon ?? '/icon-192x192.png',
      badge: options.badge ?? '/icon-72x72.png',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      data: options.data ?? {},
    };

    // Add image and actions if provided (not all browsers support these)
    if (options.image) {
      (notificationOptions as any).image = options.image;
    }

    // Add actions if provided
    if (options.actions && options.actions.length > 0) {
      notificationOptions.actions = options.actions;
    }

    const notification = new Notification(options.title, notificationOptions);

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();

      if (options.data?.url) {
        window.location.href = options.data.url as string;
      }
    };

    // Handle notification close
    notification.onclose = () => {
      // Optional: Track notification dismissal
      if (options.data?.onClose) {
        (options.data.onClose as () => void)();
      }
    };

    // Auto-close after 5 seconds (unless requireInteraction is true)
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    return { success: true };
  } catch (error) {

    logger.error('Error showing notification:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to show notification',
    };
  }
}

/**
 * Show success notification
 *
 * @param message - Success message to display
 * @returns Result object with success status
 */
export function showSuccessNotification(
  message: string
): Promise<{ success: boolean; error?: string }> {
  return showNotification({
    title: 'Success',
    body: message,
    icon: '/icon-192x192.png',
    tag: 'success',
  });
}

/**
 * Show error notification
 *
 * @param message - Error message to display
 * @returns Result object with success status
 */
export function showErrorNotification(
  message: string
): Promise<{ success: boolean; error?: string }> {
  return showNotification({
    title: 'Error',
    body: message,
    icon: '/icon-192x192.png',
    tag: 'error',
    requireInteraction: true, // Keep error notifications visible until user dismisses
  });
}

/**
 * Show info notification
 *
 * @param message - Info message to display
 * @returns Result object with success status
 */
export function showInfoNotification(
  message: string
): Promise<{ success: boolean; error?: string }> {
  return showNotification({
    title: 'Info',
    body: message,
    icon: '/icon-192x192.png',
    tag: 'info',
  });
}

/**
 * Show warning notification
 *
 * @param message - Warning message to display
 * @returns Result object with success status
 */
export function showWarningNotification(
  message: string
): Promise<{ success: boolean; error?: string }> {
  return showNotification({
    title: 'Warning',
    body: message,
    icon: '/icon-192x192.png',
    tag: 'warning',
  });
}

/**
 * Subscribe to push notifications (requires service worker)
 *
 * @param publicKey - VAPID public key for push notifications
 * @returns Push subscription object or error
 */
export async function subscribeToPushNotifications(
  publicKey: string
): Promise<{ subscription: PushSubscription | null; error?: string }> {
  try {
    if (typeof navigator === 'undefined') {
      return { subscription: null, error: 'Navigator object is not available' };
    }

    if (!isNotificationSupported()) {
      return { subscription: null, error: 'Push notifications not supported in this browser' };
    }

    if (!publicKey) {
      return { subscription: null, error: 'Public key is required' };
    }

    // Convert VAPID key from base64 URL to Uint8Array
    const key = publicKey.replace(/[_-]/g, (m) => (m === '_' ? '+' : '/'));
    const keyArray = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyArray,
    });

    return { subscription };
  } catch (error) {

    logger.error('Error subscribing to push notifications:', error instanceof Error ? error.message : String(error));
    return {
      subscription: null,
      error: error instanceof Error ? error.message : 'Failed to subscribe to push notifications',
    };
  }
}

/**
 * Unsubscribe from push notifications
 *
 * @returns Success status and optional error
 */
export async function unsubscribeFromPushNotifications(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (typeof navigator === 'undefined') {
      return { success: false, error: 'Navigator object is not available' };
    }

    if (!isNotificationSupported()) {
      return { success: false, error: 'Push notifications not supported' };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return { success: true };
    }

    return { success: true }; // Already unsubscribed
  } catch (error) {

    logger.error('Error unsubscribing from push notifications:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unsubscribe',
    };
  }
}
