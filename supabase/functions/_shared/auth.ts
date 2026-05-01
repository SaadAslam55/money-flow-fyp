/// <reference path="../deno.d.ts" />
/// <reference path="../http-server.d.ts" />
// supabase/functions/_shared/auth.ts
/**
 * Authentication utilities for Edge Functions
 * Handles JWT verification and user/organization validation
 *
 * @module EdgeFunctions/Auth
 *
 * @example
 * ```typescript
 * import { verifyAuth, requireAuth } from '../_shared/auth.ts';
 *
 * const authResult = await verifyAuth(request);
 * if (authResult.error) {
 *   return corsErrorResponse(authResult.error, 401, request);
 * }
 * ```
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Get environment variables with validation
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
  );
}

if (!SUPABASE_ANON_KEY) {
  console.warn('SUPABASE_ANON_KEY not set — getUserClient will fall back to service role key');
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  organization_id: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error: Error | null;
}

/**
 * Get Supabase client with service role (bypasses RLS)
 */
export function getServiceClient() {
  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get Supabase client for authenticated user (respects RLS)
 * Uses anon key so RLS policies are enforced for user-scoped queries
 */
export function getUserClient(authToken: string) {
  const key = SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(SUPABASE_URL!, key, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Verify JWT token and extract user information
 */
export async function verifyAuth(request: Request): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        error: new Error('Missing or invalid authorization header'),
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getUserClient(token);

    // Verify token and get user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return {
        user: null,
        error: new Error('Invalid or expired token'),
      };
    }

    // Get user record from database
    const serviceClient = getServiceClient();
    const { data: user, error: userError } = await serviceClient
      .from('users')
      .select('id, email, role, organization_id')
      .eq('auth_user_id', authUser.id)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return {
        user: null,
        error: new Error('User not found or inactive'),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error('Authentication failed'),
    };
  }
}

/**
 * Verify user has required role
 */
export function hasRole(user: AuthUser, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role) || allowedRoles.includes('*');
}

/**
 * Verify user belongs to organization
 */
export function belongsToOrganization(
  user: AuthUser,
  organizationId: string
): boolean {
  return user.organization_id === organizationId;
}

/**
 * Verify user has permission (for future permission system)
 */
export async function hasPermission(
  user: AuthUser,
  permission: string
): Promise<boolean> {
  // super_admin and admin have all permissions by default
  if (user.role === 'super_admin' || user.role === 'admin') {
    return true;
  }

  // Check permission in database
  const serviceClient = getServiceClient();
  const { data } = await serviceClient
    .from('role_permissions')
    .select('permission')
    .eq('role', user.role)
    .eq('permission', permission)
    .single();

  return !!data;
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request: Request,
  allowedRoles?: string[]
): Promise<{ user: AuthUser; error: null } | { user: null; error: Error }> {
  const authResult = await verifyAuth(request);

  if (authResult.error || !authResult.user) {
    return {
      user: null,
      error: authResult.error || new Error('Authentication required'),
    };
  }

  if (allowedRoles && !hasRole(authResult.user, allowedRoles)) {
    return {
      user: null,
      error: new Error('Insufficient permissions'),
    };
  }

  return { user: authResult.user, error: null };
}

