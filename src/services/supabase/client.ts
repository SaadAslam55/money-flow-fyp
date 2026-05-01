// src/services/supabase/client.ts
/**
 * Supabase Client Service
 * Production-ready Supabase client configuration with proper authentication,
 * session management, and error handling.
 *
 * Features:
 * - Type-safe database client with TypeScript types
 * - Automatic session persistence and refresh
 * - PKCE flow for enhanced security
 * - Realtime connection management
 * - Environment variable validation
 *
 * @example
 * ```typescript
 *
import { supabase, getAuthenticatedClient, isSupabaseConfigured } from '@/services/supabase/client';
 *
 * // Use default client
 * const { data, error } = await supabase.from('invoices').select('*');
 *
 * // Get authenticated client with fresh token
 * const authClient = await getAuthenticatedClient();
 *
 * // Check configuration
 * if (isSupabaseConfigured()) {
 *   // Supabase is ready
 * }
 * ```
 */

import { logger } from '@/lib/logger';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables (don't throw at module load)
let supabaseConfigError: Error | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  supabaseConfigError = new Error(
    `Missing Supabase environment variables: ${missingVars.join(', ')} are required. ` +
      'Please set them in your .env file.'
  );
  
  // Log error but don't throw at module load
  if (typeof window !== 'undefined') {
    logger.error('Supabase configuration error:', supabaseConfigError.message);
  }
}

// Validate URL format
if (supabaseUrl && !supabaseConfigError) {
  try {
    new URL(supabaseUrl);
  } catch {
    supabaseConfigError = new Error('Invalid VITE_SUPABASE_URL format. Must be a valid URL.');
    if (typeof window !== 'undefined') {
      logger.error('Supabase configuration error:', supabaseConfigError.message);
    }
  }
}

/**
 * Production-ready Supabase client
 * Configured with proper options for production use
 * 
 * Note: If environment variables are missing, this will be a client with invalid config.
 * Use isSupabaseConfigured() to check before using.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'moneyflow-auth',
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'moneyflow-web@1.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Get authenticated Supabase client with user's access token
 *
 * Creates a new client instance with the current user's access token.
 * Useful for server-side operations or when you need a fresh token.
 *
 * @returns Authenticated Supabase client
 * @throws Error if no active session exists
 *
 * @example
 * ```typescript
 * const authClient = await getAuthenticatedClient();
 * const { data } = await authClient.from('invoices').select('*');
 * ```
 */
export async function getAuthenticatedClient(): Promise<SupabaseClient> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(`Failed to get session: ${error.message}`);
    }

    if (!session) {
      throw new Error('No active session. Please log in.');
    }

    if (!session.access_token) {
      throw new Error('Session does not contain access token');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
      auth: {
        persistSession: false, // Don't persist for this temporary client
      },
    });
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error creating authenticated client:', error instanceof Error ? error.message : String(error));
    }
    throw error instanceof Error ? error : new Error('Failed to create authenticated client');
  }
}

/**
 * Check if Supabase client is properly configured
 *
 * Validates that all required environment variables are set and URLs are valid.
 *
 * @returns true if Supabase is properly configured, false otherwise
 */
export function isSupabaseConfigured(): boolean {
  return supabaseConfigError === null && !!supabaseUrl && !!supabaseAnonKey;
}

/**
 * Get Supabase configuration error if any
 * 
 * @returns Error object if configuration is invalid, null otherwise
 */
export function getSupabaseConfigError(): Error | null {
  return supabaseConfigError;
}
