// src/services/supabase/auth.ts
/**
 * Supabase Authentication Service
 * Handles user authentication, session management, and user operations.
 * Provides type-safe authentication methods with proper error handling.
 *
 * Features:
 * - Email/password authentication
 * - Session management
 * - Password reset and update
 * - OTP verification
 * - Auth state change listeners
 *
 * @example
 * ```typescript
 *
import { signInWithPassword, getCurrentUser, signOut } from '@/services/supabase/auth';
 *
 * // Sign in
 * const { session, user, error } = await signInWithPassword('user@example.com', 'password');
 *
 * // Get current user
 * const { user, error } = await getCurrentUser();
 *
 * // Sign out
 * const { error } = await signOut();
 * ```
 */

import { logger } from '@/lib/logger';
import { supabase } from './client';
import type { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';

/**
 * Get current session
 *
 * Retrieves the current active session for the authenticated user.
 *
 * @returns Current session and error status
 */
export async function getCurrentSession(): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      if (import.meta.env.DEV) {
  
        logger.error('Error getting session:', error instanceof Error ? error.message : String(error));
      }
    }

    return { session: data.session, error };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error getting session:', error instanceof Error ? error.message : String(error));
    }
    return {
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Get current user
 *
 * Retrieves the current authenticated user from Supabase.
 * This method fetches the user from the server to ensure the session is valid.
 *
 * @returns Current user and error status
 */
export async function getCurrentUser(): Promise<{
  user: SupabaseUser | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      if (import.meta.env.DEV) {
  
        logger.error('Error getting user:', error instanceof Error ? error.message : String(error));
      }
    }

    return { user: data.user, error };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error getting user:', error instanceof Error ? error.message : String(error));
    }
    return {
      user: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign in with email and password
 *
 * Authenticates a user with email and password credentials.
 *
 * @param email - User email address
 * @param password - User password
 * @returns Session, user, and error status
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ session: Session | null; user: SupabaseUser | null; error: AuthError | null }> {
  try {
    // Validate inputs
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return {
        session: null,
        user: null,
        error: { message: 'Email is required', status: 400 } as AuthError,
      };
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return {
        session: null,
        user: null,
        error: { message: 'Password is required', status: 400 } as AuthError,
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        session: null,
        user: null,
        error: { message: 'Invalid email format', status: 400 } as AuthError,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (import.meta.env.DEV) {
  
        logger.error('Sign in error:', error instanceof Error ? error.message : String(error));
      }
    }

    return {
      session: data.session,
      user: data.user,
      error,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Sign in error:', error instanceof Error ? error.message : String(error));
    }
    return {
      session: null,
      user: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign up with email and password
 *
 * Creates a new user account with email and password.
 * Sends verification email if email confirmation is enabled.
 *
 * @param email - User email address
 * @param password - User password (should meet minimum requirements)
 * @param metadata - Optional user metadata (e.g., full_name, organization_name)
 * @returns User, session, and error status
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
): Promise<{ user: SupabaseUser | null; session: Session | null; error: AuthError | null }> {
  try {
    // Validate inputs
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return {
        user: null,
        session: null,
        error: { message: 'Email is required', status: 400 } as AuthError,
      };
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return {
        user: null,
        session: null,
        error: { message: 'Password must be at least 6 characters', status: 400 } as AuthError,
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        user: null,
        session: null,
        error: { message: 'Invalid email format', status: 400 } as AuthError,
      };
    }

    // Validate password strength (basic check)
    if (password.length < 6) {
      return {
        user: null,
        session: null,
        error: { message: 'Password must be at least 6 characters long', status: 400 } as AuthError,
      };
    }

    // Check if we're in browser environment for redirect URL
    const redirectUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/auth/verify-email` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: metadata,
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      if (import.meta.env.DEV) {
  
        logger.error('Sign up error:', error instanceof Error ? error.message : String(error));
      }
    }

    return {
      user: data.user,
      session: data.session,
      error,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Sign up error:', error instanceof Error ? error.message : String(error));
    }
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Sign out
 *
 * Signs out the current user and clears the session.
 *
 * @returns Error status
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      if (import.meta.env.DEV) {
  
        logger.error('Sign out error:', error instanceof Error ? error.message : String(error));
      }
    }

    return { error };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Sign out error:', error instanceof Error ? error.message : String(error));
    }
    return { error: error as AuthError };
  }
}

/**
 * Reset password
 *
 * Sends a password reset email to the user.
 *
 * @param email - User email address
 * @returns Error status
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    // Validate email
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return {
        error: { message: 'Email is required', status: 400 } as AuthError,
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        error: { message: 'Invalid email format', status: 400 } as AuthError,
      };
    }

    // Check if we're in browser environment for redirect URL
    const redirectUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      if (import.meta.env.DEV) {
  
        logger.error('Reset password error:', error instanceof Error ? error.message : String(error));
      }
    }

    return { error };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Reset password error:', error instanceof Error ? error.message : String(error));
    }
    return { error: error as AuthError };
  }
}

/**
 * Update password
 *
 * Updates the current user's password.
 *
 * @param newPassword - New password (should meet minimum requirements)
 * @returns Error status
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  try {
    // Validate password
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return {
        error: { message: 'Password must be at least 6 characters long', status: 400 } as AuthError,
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      if (import.meta.env.DEV) {
  
        logger.error('Update password error:', error instanceof Error ? error.message : String(error));
      }
    }

    return { error };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Update password error:', error instanceof Error ? error.message : String(error));
    }
    return { error: error as AuthError };
  }
}

/**
 * Verify OTP
 *
 * Verifies a one-time password (OTP) for email or SMS verification.
 *
 * @param email - User email address
 * @param token - OTP token received via email/SMS
 * @param type - OTP type (default: 'email')
 * @returns Session, user, and error status
 */
export async function verifyOtp(
  email: string,
  token: string,
  type: 'email' | 'sms' | 'phone_change' | 'email_change' = 'email'
): Promise<{ session: Session | null; user: SupabaseUser | null; error: AuthError | null }> {
  try {
    // Validate inputs
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return {
        session: null,
        user: null,
        error: { message: 'Email is required', status: 400 } as AuthError,
      };
    }

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return {
        session: null,
        user: null,
        error: { message: 'OTP token is required', status: 400 } as AuthError,
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        session: null,
        user: null,
        error: { message: 'Invalid email format', status: 400 } as AuthError,
      };
    }

    // Map type to email OTP types (Supabase verifyOtp for email only accepts 'email' or 'email_change')
    const emailOtpType: 'email' | 'email_change' =
      type === 'email' || type === 'email_change' ? type : 'email';

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: emailOtpType,
    });

    if (error) {
      if (import.meta.env.DEV) {
  
        logger.error('OTP verification error:', error instanceof Error ? error.message : String(error));
      }
    }

    return {
      session: data.session,
      user: data.user,
      error,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('OTP verification error:', error instanceof Error ? error.message : String(error));
    }
    return {
      session: null,
      user: null,
      error: error as AuthError,
    };
  }
}

/**
 * Refresh session
 *
 * Refreshes the current session by obtaining a new access token.
 *
 * @returns Refreshed session and error status
 */
export async function refreshSession(): Promise<{
  session: Session | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      if (import.meta.env.DEV) {
  
        logger.error('Session refresh error:', error instanceof Error ? error.message : String(error));
      }
    }

    return { session: data.session, error };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Session refresh error:', error instanceof Error ? error.message : String(error));
    }
    return { session: null, error: error as AuthError };
  }
}

/**
 * Listen to auth state changes
 *
 * Subscribes to authentication state changes (sign in, sign out, token refresh, etc.).
 * Returns a subscription object that can be used to unsubscribe.
 *
 * @param callback - Callback function that receives event type and session
 * @returns Subscription object with unsubscribe method
 *
 * @example
 * ```typescript
 * const { data: { subscription } } = onAuthStateChange((event, session) => {
 *   if (event === 'SIGNED_IN') {
 *     logger.info('User signed in:', session?.user);
 *   }
 * });
 *
 * // Unsubscribe when done
 * subscription.unsubscribe();
 * ```
 */
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  return supabase.auth.onAuthStateChange((event, session) => {
    try {
      callback(event, session);
    } catch (error) {
      if (import.meta.env.DEV) {
  
        logger.error('Error in auth state change callback:', error instanceof Error ? error.message : String(error));
      }
    }
  });
}
