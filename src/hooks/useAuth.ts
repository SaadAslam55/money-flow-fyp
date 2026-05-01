// src/hooks/useAuth.ts
import { logger } from '@/lib/logger';
import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import * as authApi from '@/services/api/authApi';
import { handleError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types/index';

/**
 * Minimal user type for session-based initialization
 * Used when creating user from Supabase session before full profile load
 */
type SessionUser = Omit<User, 'organization_id'> & {
  organization_id: string | null;
};

/**
 * Custom hook for authentication
 * Provides authentication state and methods
 */
export function useAuth() {
  const {
    user,
    organization,
    isAuthenticated,
    loading,
    error,
    setUser,
    setOrganization,
    setLoading,
    setError,
    clearAuth,
    updateUser,
    updateOrganization,
  } = useAuthStore();

  // Use ref to store subscription for cleanup
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  /**
   * Load current user and organization
   */
  const loadUser = useCallback(async () => {
    try {
      const { user: userData, organization: orgData, error } = await authApi.getCurrentUser();

      if (error) {
        throw error;
      }

      if (userData) {
        setUser(userData);
        if (orgData) {
          setOrganization(orgData);
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      const err = error as Error;
      handleError(err, 'useAuth.loadUser');
      setError(err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [setUser, setOrganization, setError, setLoading, clearAuth]);

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(async () => {
    try {
      // If we already have valid user+org from persisted state, just verify session
      const currentUser = useAuthStore.getState().user;
      const currentOrg = useAuthStore.getState().organization;

      if (currentUser && currentOrg) {
        // Quick session check — don't re-fetch user/org if already loaded
        const { session } = await authApi.getCurrentSession();
        if (session?.user) {
          // Session is still valid — keep existing data, no loading flicker
          setUser(currentUser);
          setOrganization(currentOrg);
          setLoading(false);
          return;
        }
        // Session expired — clear auth
        clearAuth();
        setLoading(false);
        return;
      }

      // No persisted data — full initialization
      setLoading(true);
      const { session } = await authApi.getCurrentSession();

      if (session?.user) {
        // Try to load full user data from database
        const { user: fullUser, organization: org, error } = await authApi.getCurrentUser();
        
        if (!error && fullUser) {
          setUser(fullUser);
          if (org) {
            setOrganization(org);
          }
        } else {
          // Fallback to minimal user from session
          const minimalUser: SessionUser = {
            id: session.user.id,
            auth_user_id: session.user.id,
            email: session.user.email ?? '',
            first_name: String(session.user.user_metadata?.first_name ?? 'User'),
            last_name: String(session.user.user_metadata?.last_name ?? ''),
            full_name: String(session.user.user_metadata?.full_name ?? session.user.email ?? 'User'),
            role: 'viewer' as UserRole,
            organization_id: null,
            organization: undefined,
            is_active: true,
            created_at: session.user.created_at,
            updated_at: session.user.created_at,
          };
          setUser(minimalUser as User);
        }
      }
      setLoading(false);
    } catch (error) {
      const err = error as Error;
      handleError(err, 'useAuth.initializeAuth');
      setError(err);
      setLoading(false);
    }
  }, [setLoading, setError, setUser, setOrganization]);

  // Initialize auth state on mount
  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  // Listen for auth state changes
  useEffect(() => {
    const setupSubscription = () => {
      try {
        const authStateResult = supabase.auth.onAuthStateChange((event, session) => {
          // Only handle sign out - sign in is handled by the login form
          if (event === 'SIGNED_OUT') {
            clearAuth();
          } else if (event === 'PASSWORD_RECOVERY' && session) {
            toast.info('Please set your new password');
          }
          // Don't call loadUser() here - it causes RLS permission issues
          // User data is set directly in the signIn function
        });

        // Supabase onAuthStateChange returns { data: { subscription } }
        // Extract the subscription object which has the unsubscribe method
        const subscription = authStateResult?.data?.subscription;

        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscriptionRef.current = subscription;
        } else {
          logger.warn('Auth state subscription object not found or invalid');
        }
      } catch (error) {
        logger.error(
          'Failed to setup auth state subscription:',
          error instanceof Error ? error.message : String(error)
        );
        handleError(error as Error, 'useAuth.setupSubscription');
      }
    };

    setupSubscription();

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        try {
          // Check if unsubscribe method exists before calling
          if (
            subscriptionRef.current &&
            typeof subscriptionRef.current.unsubscribe === 'function'
          ) {
            subscriptionRef.current.unsubscribe();
          }
        } catch (error) {
          // Silently handle unsubscribe errors (subscription may already be closed)
          const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
          if (isDev) {
            logger.warn(
              'Error unsubscribing from auth state:',
              error instanceof Error ? error.message : String(error)
            );
          }
        } finally {
          subscriptionRef.current = null;
        }
      }
    };
  }, [loadUser, clearAuth]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        const { user: userData, session, error } = await authApi.signIn(email, password);

        if (error) {
          setLoading(false);
          return { error };
        }

        if (userData && session) {
          // Set user data directly from signIn response
          setUser(userData);
          if (userData.organization) {
            setOrganization(userData.organization);
          } else if (userData.organization_id) {
            // User has organization_id but no nested org object — refetch full user+org
            try {
              const { organization: orgData } = await authApi.getCurrentUser();
              if (orgData) {
                setOrganization(orgData);
              }
            } catch {
              // Organization fetch failed — will show "no org" message on dashboard
              logger.warn('Failed to load organization after sign in');
            }
          }
          setLoading(false);
          return { error: null };
        }

        setLoading(false);
        return { error: new Error('Authentication failed') };
      } catch (error) {
        setLoading(false);
        handleError(error, 'useAuth.signIn');
        return { error: error as Error };
      }
    },
    [setUser, setOrganization, setLoading]
  );

  /**
   * Sign up with email, password, business name, and full name
   */
  const signUp = useCallback(
    async (email: string, password: string, businessName: string, fullName?: string) => {
      try {
        setLoading(true);
        const {
          user: userData,
          organization: orgData,
          error,
        } = await authApi.signUp(email, password, businessName, fullName);

        if (error) {
          return { error };
        }

        if (userData && orgData) {
          setUser(userData);
          setOrganization(orgData);
          return { error: null };
        }

        return { error: new Error('Registration failed') };
      } catch (error) {
        handleError(error, 'useAuth.signUp');
        return { error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setUser, setOrganization]
  );

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await authApi.signOut();

      if (error) {
        handleError(error, 'useAuth.signOut');
        return { error };
      }

      clearAuth();
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error) {
      handleError(error, 'useAuth.signOut');
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearAuth]);

  /**
   * Reset password (send reset email)
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await authApi.resetPassword(email);
      return { error };
    } catch (error) {
      handleError(error, 'useAuth.resetPassword');
      return { error: error as Error };
    }
  }, []);

  /**
   * Verify email address
   */
  const verifyEmail = useCallback(
    async (email: string, token: string) => {
      try {
        const { error } = await authApi.verifyEmail(email, token);
        if (!error) {
          await loadUser();
        }
        return { error };
      } catch (error) {
        handleError(error, 'useAuth.verifyEmail');
        return { error: error as Error };
      }
    },
    [loadUser]
  );

  /**
   * Resend verification email
   */
  const resendVerification = useCallback(async (email: string) => {
    try {
      const { error } = await authApi.resendVerification(email);
      return { error };
    } catch (error) {
      handleError(error, 'useAuth.resendVerification');
      return { error: error as Error };
    }
  }, []);

  /**
   * Update password
   */
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await authApi.updatePassword(newPassword);
      return { error };
    } catch (error) {
      handleError(error, 'useAuth.updatePassword');
      return { error: error as Error };
    }
  }, []);

  /**
   * Refresh session
   */
  const refreshSession = useCallback(async () => {
    try {
      const { session, error } = await authApi.refreshSession();
      if (session && !error) {
        await loadUser();
      }
      return { session, error };
    } catch (error) {
      handleError(error, 'useAuth.refreshSession');
      return { session: null, error: error as Error };
    }
  }, [loadUser]);

  return {
    user,
    organization,
    isAuthenticated,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
    verifyEmail,
    resendVerification,
    reloadUser: loadUser,
    updateUser,
    updateOrganization,
  };
}
