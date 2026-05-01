// src/services/api/authApi.ts
/**
 * Authentication API Service
 * Handles user authentication, registration, password management, and session operations
 * Provides type-safe authentication methods with proper error handling
 */

import { supabase } from '@/services/supabase/client';
import type { User, Organization, UserRole } from '@/types/index';
import type { OrganizationInsert, UserInsert } from '@/types/database.types';
import type { AuthError, Session } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

interface SignInResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

interface SignUpResponse {
  user: User | null;
  organization: Organization | null;
  error: Error | null;
}

export async function signIn(email: string, password: string): Promise<SignInResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { user: null, session: null, error: authError };
    }
    if (!authData.user) {
      return { user: null, session: null, error: new Error('No user returned') as AuthError };
    }

    // Use RPC function to get user with organization (bypasses RLS safely)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_with_org');

    if (rpcError || !rpcData || rpcData.error) {
      // Fallback: try direct query (may work after RLS fix is applied)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, organization:organizations(*)')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (userError || !userData) {
        // User doesn't exist in users table - use fallback with session data
        logger.warn('User not found in database, using session data with viewer role');
        return {
          user: {
            id: authData.user.id,
            auth_user_id: authData.user.id,
            email: authData.user.email ?? '',
            first_name: String(authData.user.user_metadata?.first_name ?? ''),
            last_name: String(authData.user.user_metadata?.last_name ?? ''),
            full_name: String(
              authData.user.user_metadata?.full_name ?? authData.user.email ?? 'User'
            ),
            role: 'viewer' as UserRole,
            organization_id: authData.user.user_metadata?.organization_id ?? '',
            is_active: true,
            created_at: authData.user.created_at,
            updated_at: authData.user.created_at,
          } as User,
          session: authData.session,
          error: null,
        };
      }

      // Direct query succeeded
      return {
        user: {
          id: userData.id,
          auth_user_id: userData.auth_user_id,
          email: userData.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          full_name: userData.full_name || authData.user.email || 'User',
          role: userData.role as UserRole,
          organization_id: userData.organization_id,
          organization: userData.organization as Organization | null,
          is_active: userData.is_active,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        } as User,
        session: authData.session,
        error: null,
      };
    }

    // RPC succeeded - extract user and organization from response
    const userData = rpcData.user;
    const orgData = rpcData.organization;

    return {
      user: {
        id: userData.id,
        auth_user_id: userData.auth_user_id,
        email: userData.email,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        full_name: userData.full_name || authData.user.email || 'User',
        role: userData.role as UserRole,
        organization_id: userData.organization_id,
        organization: orgData as Organization | null,
        is_active: userData.is_active,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      } as User,
      session: authData.session,
      error: null,
    };
  } catch (error) {
    logger.error('SignIn error:', error instanceof Error ? error.message : String(error));
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

export async function signUp(
  email: string,
  password: string,
  businessName: string,
  fullName?: string
): Promise<SignUpResponse> {
  try {
    // Parse full name into first and last name
    const nameParts = (fullName || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const displayName = fullName || businessName;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          business_name: businessName,
          first_name: firstName,
          last_name: lastName,
          full_name: displayName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from signup');

    // Generate unique subdomain
    const subdomain = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50); // Limit length

    // Ensure subdomain is unique
    let attempts = 0;
    let finalSubdomain = subdomain;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', finalSubdomain)
        .single();

      if (!existing) {
        break; // Subdomain is available
      }

      // Append number to make it unique
      finalSubdomain = `${subdomain}-${Date.now().toString().slice(-6)}`;
      attempts++;
    }

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: businessName,
        subdomain: finalSubdomain,
        email,
      } satisfies OrganizationInsert)
      .select()
      .single();

    if (orgError) throw orgError;

    const typedOrgData = orgData as Organization;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        organization_id: typedOrgData.id,
        email,
        full_name: displayName,
        role: 'admin',
      } satisfies UserInsert)
      .select()
      .single();

    if (userError) throw userError;

    // Seed default expense categories (ignore errors)
    try {
      await supabase.rpc('seed_default_expense_categories', {
        org_id: typedOrgData.id,
      });
    } catch {
      // Ignore errors for seeding
    }

    return {
      user: userData as User,
      organization: typedOrgData,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      organization: null,
      error: error as Error,
    };
  }
}

export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function getCurrentSession(): Promise<{
  session: Session | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error) {
    return { session: null, error: error as Error };
  }
}

export async function getCurrentUser(): Promise<{
  user: User | null;
  organization: Organization | null;
  error: Error | null;
}> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) throw new Error('Not authenticated');

    // Try RPC function first (bypasses RLS safely)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_with_org');

    if (!rpcError && rpcData && !rpcData.error) {
      const userData = rpcData.user;
      const orgData = rpcData.organization;

      return {
        user: {
          id: userData.id,
          auth_user_id: userData.auth_user_id,
          email: userData.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          full_name: userData.full_name || authData.user.email || 'User',
          role: userData.role as UserRole,
          organization_id: userData.organization_id,
          organization: orgData as Organization | null,
          is_active: userData.is_active,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        } as User,
        organization: orgData as Organization | null,
        error: null,
      };
    }

    // Fallback to direct query
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, organization:organizations(*)')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (userError) throw userError;

    return {
      user: userData as User,
      organization: userData.organization as Organization,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      organization: null,
      error: error as Error,
    };
  }
}

export async function refreshSession(): Promise<{
  session: Session | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error) {
    return { session: null, error: error as Error };
  }
}

export async function verifyEmail(email: string, token: string): Promise<{ error: Error | null }> {
  try {
    // Supabase handles email verification via URL redirects automatically
    // This function is for manual verification if needed
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function resendVerification(email: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
      },
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}
