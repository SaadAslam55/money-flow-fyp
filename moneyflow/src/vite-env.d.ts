/// <reference types="vite/client" />

/**
 * Vite Environment Variables Type Definitions
 *
 * This file provides TypeScript type definitions for all environment variables
 * used in the Money Flow application. It ensures type safety when accessing
 * `import.meta.env` throughout the codebase.
 *
 * @module ViteEnv
 *
 * @example
 * ```typescript
 * // Type-safe access to environment variables
 * const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // ✅ TypeScript knows this exists
 * const analyticsId = import.meta.env.VITE_GA_MEASUREMENT_ID; // ✅ Optional, may be undefined
 * ```
 *
 * @see {@link https://vitejs.dev/guide/env-and-mode.html | Vite Environment Variables}
 */

/**
 * Environment variables interface
 * All variables prefixed with `VITE_` are exposed to the client-side code
 */
interface ImportMetaEnv {
  // ============================================================================
  // Required Environment Variables
  // ============================================================================

  /**
   * Supabase project URL
   * @example "https://your-project.supabase.co"
   * @required
   */
  readonly VITE_SUPABASE_URL: string;

  /**
   * Supabase anonymous/public key
   * Used for client-side authentication and database access
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * @required
   */
  readonly VITE_SUPABASE_ANON_KEY: string;

  // ============================================================================
  // Application Configuration
  // ============================================================================

  /**
   * Application name
   * Used for branding, page titles, and display purposes
   * @default "Money Flow"
   * @example "Money Flow"
   */
  readonly VITE_APP_NAME?: string;

  /**
   * Application base URL
   * Used for generating absolute URLs, email links, and redirects
   * @default "http://localhost:5173" (development)
   * @example "https://app.moneyflow.com"
   */
  readonly VITE_APP_URL?: string;

  /**
   * API base URL
   * Custom API endpoint (if not using Supabase REST API)
   * @default Supabase REST API URL
   * @example "https://api.moneyflow.com"
   */
  readonly VITE_API_URL?: string;

  // ============================================================================
  // Payment Provider Configuration
  // ============================================================================

  /**
   * Stripe public key
   * Used for Stripe payment processing
   * @optional - Only required if using Stripe payments
   * @example "pk_live_51..."
   */
  readonly VITE_STRIPE_PUBLIC_KEY?: string;

  // ============================================================================
  // Analytics & Monitoring
  // ============================================================================

  /**
   * Google Analytics Measurement ID
   * Used for Google Analytics 4 tracking
   * @optional
   * @example "G-XXXXXXXXXX"
   * @see {@link https://developers.google.com/analytics/devguides/collection/ga4 | GA4 Documentation}
   */
  readonly VITE_GA_MEASUREMENT_ID?: string;

  /**
   * Google Analytics ID (legacy/alternative)
   * Alternative name for Google Analytics ID
   * @optional
   * @example "G-XXXXXXXXXX"
   */
  readonly VITE_GA_ID?: string;

  /**
   * Mixpanel project token
   * Used for Mixpanel analytics tracking
   * @optional
   * @example "abc123def456..."
   * @see {@link https://developer.mixpanel.com/docs/javascript | Mixpanel Documentation}
   */
  readonly VITE_MIXPANEL_TOKEN?: string;

  /**
   * Sentry DSN (Data Source Name)
   * Used for error tracking and monitoring
   * @optional
   * @example "https://abc123@o123456.ingest.sentry.io/123456"
   * @see {@link https://docs.sentry.io/platforms/javascript/ | Sentry Documentation}
   */
  readonly VITE_SENTRY_DSN?: string;

  // ============================================================================
  // Feature Flags
  // ============================================================================

  /**
   * Enable inventory management features
   * Controls whether inventory tracking is available
   * @default "false"
   * @example "true" | "false"
   */
  readonly VITE_ENABLE_INVENTORY?: string;

  /**
   * Enable multi-currency support
   * Controls whether multiple currencies can be used
   * @default "false"
   * @example "true" | "false"
   */
  readonly VITE_ENABLE_MULTI_CURRENCY?: string;

  /**
   * Enable multi-branch support
   * Controls whether multiple business branches are supported
   * @default "false"
   * @example "true" | "false"
   */
  readonly VITE_ENABLE_MULTI_BRANCH?: string;

  // ============================================================================
  // API Configuration
  // ============================================================================

  /**
   * API request timeout in milliseconds
   * Maximum time to wait for API responses
   * @default "30000" (30 seconds)
   * @example "60000"
   */
  readonly VITE_API_TIMEOUT?: string;

  /**
   * API retry attempts
   * Number of times to retry failed API requests
   * @default "3"
   * @example "5"
   */
  readonly VITE_API_RETRY_ATTEMPTS?: string;

  /**
   * API retry delay in milliseconds
   * Delay between retry attempts
   * @default "1000" (1 second)
   * @example "2000"
   */
  readonly VITE_API_RETRY_DELAY?: string;
}

/**
 * Vite ImportMeta interface extension
 * Provides type-safe access to environment variables and Vite-specific properties
 */
interface ImportMeta {
  /**
   * Environment variables
   * All variables prefixed with `VITE_` are available here
   */
  readonly env: ImportMetaEnv;

  /**
   * Vite build mode
   * @example "development" | "production" | "test"
   */
  readonly MODE: string;

  /**
   * Development mode flag
   * True when running in development mode
   */
  readonly DEV: boolean;

  /**
   * Production mode flag
   * True when running in production mode
   */
  readonly PROD: boolean;

  /**
   * Base URL for the application
   * Used for resolving relative paths
   * @example "/" | "/app/"
   */
  readonly BASE_URL: string;

  /**
   * Server-side rendering flag
   * True when running in SSR mode
   */
  readonly SSR: boolean;
}
