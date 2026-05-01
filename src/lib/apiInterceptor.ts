// src/lib/apiInterceptor.ts
/**
 * API Interceptor for handling 401 errors and auto token refresh
 * Wraps Supabase client calls to automatically refresh tokens on 401
 */

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

/**
 * Refresh the current session
 * @returns true if refresh was successful, false otherwise
 */
export async function refreshAuthToken(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      throw error;
    }

    if (!data.session) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * Handle 401 errors by attempting to refresh the token and retry the request
 * @param requestFn Function that makes the API request
 * @param retries Number of retry attempts (default: 1)
 * @returns Result of the request
 */
export async function withAuthRetry<T>(requestFn: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await requestFn();
  } catch (error: any) {
    // Check if this is a 401 error
    const is401 =
      error?.status === 401 ||
      error?.code === '401' ||
      error?.message?.includes('JWT') ||
      error?.message?.includes('expired') ||
      error?.message?.includes('unauthorized');

    if (is401 && retries > 0) {
      // Attempt to refresh the token
      const refreshed = await refreshAuthToken();

      if (refreshed) {
        // Retry the request with the new token
        return withAuthRetry(requestFn, retries - 1);
      } else {
        // Refresh failed, redirect to login
        toast.error('Session expired. Please log in again.');

        // Clear auth and redirect to login
        await supabase.auth.signOut();
        window.location.href = '/auth/login';
        throw new Error('Session expired');
      }
    }

    // Not a 401 or no retries left, throw the error
    throw error;
  }
}

/**
 * Wrap a Supabase query to handle auth errors automatically
 * @param queryFn Function that returns a Supabase query
 * @returns Query result with auto-retry on 401
 */
export async function withAuthQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  return withAuthRetry(async () => {
    const result = await queryFn();

    // Check if the error is auth-related
    if (result.error) {
      const isAuthError =
        result.error.code === 'PGRST301' || // JWT expired
        result.error.message?.includes('JWT') ||
        result.error.message?.includes('expired');

      if (isAuthError) {
        throw { status: 401, ...result.error };
      }
    }

    return result;
  });
}

/**
 * Setup global auth state listener to handle session expiry
 */
export function setupAuthInterceptor() {
  let isRefreshing = false;

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      isRefreshing = false;
    } else if (event === 'SIGNED_OUT') {
      isRefreshing = false;
    }
  });

  // Add global error handler for fetch
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // If we get a 401 and we're not already refreshing
      if (response.status === 401 && !isRefreshing) {
        isRefreshing = true;

        const refreshed = await refreshAuthToken();

        if (refreshed) {
          // Retry the request
          return originalFetch(...args);
        } else {
          // Redirect to login
          toast.error('Session expired. Please log in again.');
          await supabase.auth.signOut();
          window.location.href = '/auth/login';
        }
      }

      return response;
    };
  }
}
