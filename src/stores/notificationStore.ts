// src/stores/notificationStore.ts
/**
 * Notification Store
 *
 * Manages application notifications with unread tracking, limits, and filtering.
 * Production-ready with automatic cleanup and optional persistence.
 *
 * @module Stores/Notification
 */

import { logger } from '@/lib/logger';
import { create } from 'zustand';
import { persist, createJSONStorage, type PersistStorage } from 'zustand/middleware';

// Constants
const DEFAULT_MAX_NOTIFICATIONS = 100;
const MIN_MAX_NOTIFICATIONS = 10;
const MAX_MAX_NOTIFICATIONS = 1000;
const DEFAULT_RECENT_LIMIT = 10;

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  maxNotifications: number;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setMaxNotifications: (max: number) => void;

  // Getters
  getUnreadCount: () => number;
  getRecentNotifications: (limit?: number) => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationById: (id: string) => Notification | null;
}

interface PersistedNotificationState {
  notifications: Notification[];
  maxNotifications: number;
  _version: number;
}

/**
 * Validates notification type
 */
function isValidNotificationType(type: unknown): type is NotificationType {
  return (
    typeof type === 'string' &&
    (type === 'info' || type === 'success' || type === 'warning' || type === 'error')
  );
}

/**
 * Validates notification structure
 */
function isValidNotification(notif: unknown): notif is Notification {
  if (!notif || typeof notif !== 'object') return false;
  const n = notif as Partial<Notification>;
  return (
    typeof n.id === 'string' &&
    isValidNotificationType(n.type) &&
    typeof n.title === 'string' &&
    typeof n.message === 'string' &&
    typeof n.read === 'boolean' &&
    typeof n.createdAt === 'string'
  );
}

/**
 * Generates a unique notification ID
 */
function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Notification store for managing application notifications
 *
 * Features:
 * - Notification management with validation
 * - Unread count tracking
 * - Automatic cleanup (configurable max)
 * - Recent notifications helper
 * - Filtering by type
 * - Optional persistence
 * - Type-safe operations
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      maxNotifications: DEFAULT_MAX_NOTIFICATIONS,

      addNotification: (notification) => {
        // Validate required fields
        if (!notification.title || typeof notification.title !== 'string') {
          logger.error('Notification title is required');
          return;
        }

        if (!notification.message || typeof notification.message !== 'string') {
          logger.error('Notification message is required');
          return;
        }

        if (!isValidNotificationType(notification.type)) {
          logger.error(`Invalid notification type: ${notification.type}`);
          return;
        }

        const newNotification: Notification = {
          ...notification,
          id: generateNotificationId(),
          createdAt: new Date().toISOString(),
          read: false,
        };

        set((state) => {
          const updated = [newNotification, ...state.notifications];
          // Keep only maxNotifications
          const trimmed = updated.slice(0, state.maxNotifications);
          const unreadCount = trimmed.filter((n) => !n.read).length;

          return {
            notifications: trimmed,
            unreadCount,
          };
        });
      },

      markAsRead: (id) => {
        if (!id || typeof id !== 'string') {
          logger.error('Invalid notification ID provided to markAsRead');
          return;
        }

        set((state) => {
          const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
          const unreadCount = updated.filter((n) => !n.read).length;

          return {
            notifications: updated,
            unreadCount,
          };
        });
      },

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) => {
        if (!id || typeof id !== 'string') {
          logger.error('Invalid notification ID provided to removeNotification');
          return;
        }

        set((state) => {
          const updated = state.notifications.filter((n) => n.id !== id);
          const unreadCount = updated.filter((n) => !n.read).length;

          return {
            notifications: updated,
            unreadCount,
          };
        });
      },

      clearAll: () =>
        set({
          notifications: [],
          unreadCount: 0,
        }),

      setMaxNotifications: (max) => {
        const num = Number(max);
        if (!Number.isInteger(num) || num < MIN_MAX_NOTIFICATIONS || num > MAX_MAX_NOTIFICATIONS) {
          logger.error(
            `Invalid max notifications: ${max}. Must be between ${MIN_MAX_NOTIFICATIONS} and ${MAX_MAX_NOTIFICATIONS}`
          );
          return;
        }

        set((state) => {
          const trimmed = state.notifications.slice(0, num);
          const unreadCount = trimmed.filter((n) => !n.read).length;

          return {
            maxNotifications: num,
            notifications: trimmed,
            unreadCount,
          };
        });
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },

      getRecentNotifications: (limit = DEFAULT_RECENT_LIMIT) => {
        const num = Number(limit);
        const validLimit = Number.isInteger(num) && num > 0 ? num : DEFAULT_RECENT_LIMIT;

        return get()
          .notifications.slice(0, validLimit)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getNotificationsByType: (type) => {
        if (!isValidNotificationType(type)) {
          logger.error(`Invalid notification type: ${type}`);
          return [];
        }

        return get().notifications.filter((n) => n.type === type);
      },

      getNotificationById: (id) => {
        if (!id || typeof id !== 'string') {
          return null;
        }

        return get().notifications.find((n) => n.id === id) || null;
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage) as PersistStorage<PersistedNotificationState>,
      partialize: (state) => ({
        notifications: state.notifications.filter((n) => isValidNotification(n)),
        maxNotifications: state.maxNotifications,
        _version: 1,
      }),
      version: 1,
      migrate: (persistedState: unknown, _version: number): PersistedNotificationState => {
        const state = persistedState as Partial<PersistedNotificationState>;
        return {
          notifications: state.notifications
            ? state.notifications.filter((n) => isValidNotification(n))
            : [],
          maxNotifications:
            state.maxNotifications &&
            Number.isInteger(state.maxNotifications) &&
            state.maxNotifications >= MIN_MAX_NOTIFICATIONS &&
            state.maxNotifications <= MAX_MAX_NOTIFICATIONS
              ? state.maxNotifications
              : DEFAULT_MAX_NOTIFICATIONS,
          _version: 1,
        };
      },
      skipHydration: false,
    }
  )
);
