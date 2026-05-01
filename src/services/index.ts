// src/services/index.ts
/**
 * Centralized Service Exports
 *
 * This is the main entry point for all service layer functionality.
 * Import services from here for better organization and tree-shaking support.
 *
 * @module Services
 *
 * @example
 * ```typescript
 * // Import API services
 * import { getCustomers, createCustomer } from '@/services';
 *
 * // Import Supabase services
 * import { supabase, signInWithPassword, uploadFile } from '@/services';
 *
 * // Import payment services
 * import { createCheckoutSession, redirectToCheckout } from '@/services';
 *
 * // Import notification services
 * import { sendEmail, sendInvoiceEmail } from '@/services';
 *
 * // Import analytics services
 * import { initializeAnalytics, trackPageView } from '@/services';
 * ```
 *
 * @see {@link https://github.com/microsoft/TypeScript/issues/37238 | TypeScript Barrel Exports}
 * @see {@link ./README.md | Services Documentation}
 */

// ============================================================================
// API Services
// ============================================================================
/**
 * API Service Layer
 *
 * Provides standardized API calls for all business operations including:
 * - Authentication & Authorization
 * - Customer, Product, Invoice management
 * - Transactions & Reports
 * - Settings & Configuration
 *
 * @example
 * ```typescript
 * import { getCustomers, createCustomer, updateCustomer } from '@/services';
 *
 * const { data, error } = await getCustomers(organizationId, filters);
 * ```
 */
export * from './api';

// ============================================================================
// Supabase Services
// ============================================================================
/**
 * Supabase Service Layer
 *
 * Provides direct access to Supabase functionality:
 * - Database queries with RLS support
 * - Authentication & session management
 * - File storage operations
 * - Real-time subscriptions
 *
 * Note: Auth functions are available via the API layer (recommended).
 * Use Supabase exports for advanced use cases or direct database access.
 *
 * @example
 * ```typescript
 * import { supabase, uploadFile, subscribeToTable } from '@/services';
 *
 * // For auth, use API layer instead:
 * import { signInWithPassword } from '@/services/api';
 * ```
 */
// Export Supabase client and utilities (non-conflicting exports)
export { supabase, getAuthenticatedClient, isSupabaseConfigured } from './supabase/client';

// Export database utilities
export {
  executeQuery,
  executeQueryWithRetry,
  checkTableAccess,
  getTableCount,
  batchInsert,
  executeRPC,
} from './supabase/database';

// Export storage utilities
export {
  uploadFile,
  getPublicUrl,
  getSignedUrl,
  deleteFile,
  listFiles,
  downloadFile,
  copyFile,
  moveFile,
} from './supabase/storage';

// Export realtime utilities
export {
  subscribeToTable,
  subscribeToInserts,
  subscribeToUpdates,
  subscribeToDeletes,
  subscribeToOrganizationChanges,
  unsubscribe,
  unsubscribeAll,
} from './supabase/realtime';

// Export Supabase auth with explicit names to avoid conflicts with API layer
// Use API layer auth functions for standard use cases
export {
  getCurrentSession as getSupabaseSession,
  getCurrentUser as getSupabaseUser,
  signInWithPassword as signInWithSupabasePassword,
  signUpWithPassword as signUpWithSupabasePassword,
  signOut as signOutFromSupabase,
  resetPassword as resetSupabasePassword,
  updatePassword as updateSupabasePassword,
  verifyOtp as verifySupabaseOtp,
  refreshSession as refreshSupabaseSession,
  onAuthStateChange,
} from './supabase/auth';

// ============================================================================
// Payment Services
// ============================================================================
/**
 * Payment Service Layer
 *
 * Handles payment processing and subscription management:
 * - Checkout session creation
 * - Subscription lifecycle management
 * - Invoice billing
 * - Webhook event handling
 *
 * Note: Subscription management functions are also available via the API layer.
 * Use payment services for checkout and billing operations.
 *
 * @example
 * ```typescript
 * import { createCheckoutSession, redirectToCheckout } from '@/services';
 *
 * const { error } = await redirectToCheckout(planId, organizationId, 'jazzcash');
 * ```
 */
// Export checkout services
export * from './payments/checkout';

// Export subscription services (with explicit names to avoid conflicts)
export {
  getSubscriptionDetails,
  updateSubscriptionPlan as updatePaymentSubscriptionPlan,
  cancelSubscription as cancelPaymentSubscription,
  resumeSubscription,
} from './payments/subscriptions';

// Export invoice services (with explicit names to avoid conflicts)
export {
  getInvoice as getBillingInvoice,
  downloadInvoice,
  getBillingHistory as getPaymentBillingHistory,
} from './payments/invoices';

// Export webhook handlers
export * from './payments/webhooks';

// ============================================================================
// Payment Provider Integrations
// ============================================================================
/**
 * Payment Provider Integrations
 *
 * Direct integrations with Pakistani payment providers:
 * - JazzCash payment processing
 * - EasyPaisa payment processing
 * - Raast QR code generation
 *
 * @example
 * ```typescript
 * import { initiateJazzCashPayment, generateRaastQRData } from '@/services';
 *
 * const { data, error } = await initiateJazzCashPayment(paymentData);
 * ```
 */
export * from './payment-providers';

// ============================================================================
// Notification Services
// ============================================================================
/**
 * Notification Service Layer
 *
 * Multi-channel notification delivery:
 * - Email notifications (invoices, reminders, welcome emails)
 * - Push notifications (browser notifications)
 * - WhatsApp messaging (invoice sharing, reminders)
 *
 * @example
 * ```typescript
 * import { sendEmail, sendInvoiceEmail, showNotification } from '@/services';
 *
 * const { success } = await sendInvoiceEmail(customerEmail, invoiceId, invoiceNumber);
 * ```
 */
export * from './notifications';

// ============================================================================
// Analytics Services
// ============================================================================
/**
 * Analytics Service Layer
 *
 * Unified analytics tracking across multiple providers:
 * - Google Analytics 4 integration
 * - Mixpanel integration
 * - Cross-platform event tracking
 *
 * Note: Individual provider exports are available via the analytics module.
 * Use the unified functions for cross-platform tracking.
 *
 * @example
 * ```typescript
 * import {
 *   initializeAnalytics,
 *   trackPageView,
 *   trackEvent
 * } from '@/services';
 *
 * // Initialize at app startup
 * initializeAnalytics();
 *
 * // Track events
 * trackPageView('/dashboard', 'Dashboard');
 * trackEvent('invoice_created', { invoiceId: '123' });
 * ```
 */
export * from './analytics';
