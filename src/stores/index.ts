// src/stores/index.ts
/**
 * Centralized Store Exports
 *
 * This is the main entry point for all Zustand stores in the application.
 * Import stores from here for better organization and tree-shaking support.
 *
 * @module Stores
 *
 * @example
 * ```typescript
 * // Import stores
 * import { useAuthStore, useUIStore, useCartStore } from '@/stores';
 *
 * // Import types
 * import type { CartItem, Notification, NotificationType } from '@/stores';
 *
 * // Usage in component
 * function MyComponent() {
 *   const { user, isAuthenticated } = useAuthStore();
 *   const { theme, setTheme } = useUIStore();
 *   const { items, getTotal } = useCartStore();
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @see {@link ./README.md | Stores Documentation}
 */

// ============================================================================
// Authentication Store
// ============================================================================
/**
 * Authentication Store
 *
 * Manages user authentication state, organization context, and auth operations.
 *
 * @example
 * ```typescript
 * import { useAuthStore } from '@/stores';
 *
 * const { user, organization, isAuthenticated, setUser, clearAuth } = useAuthStore();
 * ```
 */
export { useAuthStore } from './authStore';

// ============================================================================
// Organization Store
// ============================================================================
/**
 * Organization Store
 *
 * Manages multiple organizations for users who belong to multiple organizations.
 *
 * @example
 * ```typescript
 * import { useOrganizationStore } from '@/stores';
 *
 * const { *   currentOrganization, *   organizations, *   setCurrentOrganization, *   addOrganization
 * } = useOrganizationStore();
 * ```
 */
export { useOrganizationStore } from './organizationStore';

// ============================================================================
// UI Store
// ============================================================================
/**
 * UI State Store
 *
 * Manages application UI state (theme, sidebar, modals, view preferences).
 *
 * @example
 * ```typescript
 * import { useUIStore } from '@/stores';
 *
 * const { *   theme, *   setTheme, *   sidebarState, *   toggleSidebar, *   openModal, *   closeModal
 * } = useUIStore();
 * ```
 */
export { useUIStore } from './uiStore';
export type { Theme, SidebarState, ViewMode } from './uiStore';

// ============================================================================
// Cart Store
// ============================================================================
/**
 * Shopping Cart Store
 *
 * Manages POS shopping cart functionality with calculations and session persistence.
 *
 * @example
 * ```typescript
 * import { useCartStore } from '@/stores';
 * import type { CartItem } from '@/stores';
 *
 * const { *   items, *   addItem, *   removeItem, *   getTotal, *   clearCart
 * } = useCartStore();
 * ```
 */
export { useCartStore } from './cartStore';
export type { CartItem } from './cartStore';

// ============================================================================
// Notification Store
// ============================================================================
/**
 * Notification Store
 *
 * Manages application notifications with unread tracking and filtering.
 *
 * @example
 * ```typescript
 * import { useNotificationStore } from '@/stores';
 * import type { Notification, NotificationType } from '@/stores';
 *
 * const { *   notifications, *   unreadCount, *   addNotification, *   markAsRead
 * } = useNotificationStore();
 * ```
 */
export { useNotificationStore } from './notificationStore';
export type { Notification, NotificationType } from './notificationStore';

// ============================================================================
// Cache Store
// ============================================================================
/**
 * Client-Side Cache Store
 *
 * Manages temporary data caching with TTL support and automatic cleanup.
 *
 * @example
 * ```typescript
 * import { useCacheStore } from '@/stores';
 *
 * const { set, get, has, clear } = useCacheStore();
 *
 * // Set with default TTL (5 minutes)
 * set('key', data);
 *
 * // Set with custom TTL (10 minutes)
 * set('key', data, 10 * 60 * 1000);
 *
 * // Get cached data
 * const cached = get('key');
 * ```
 */
export { useCacheStore } from './cacheStore';
