// src/middleware/authMiddleware.ts
/**
 * Authentication Middleware
 * Utility functions for authentication checks in routes, API calls, and components
 */

import type { User } from '@/types/database.types';

/**
 * Authentication check result
 */
export interface AuthCheckResult {
  isAuthenticated: boolean;
  user: User | null;
  error?: string;
}

/**
 * Check if user is authenticated
 * 
 * @param user - User object or null
 * @returns Authentication check result
 * 
 * @example
 * ```ts
 * const result = checkAuthentication(user);
 * if (!result.isAuthenticated) {
 *   redirectToLogin();
 * }
 * ```
 */
export function checkAuthentication(user: User | null): AuthCheckResult {
  if (!user) {
    return {
      isAuthenticated: false,
      user: null,
      error: 'User is not authenticated',
    };
  }

  // Check if user has required fields
  if (!user.id || !user.email) {
    return {
      isAuthenticated: false,
      user: null,
      error: 'Invalid user data',
    };
  }

  return {
    isAuthenticated: true,
    user,
  };
}

/**
 * Require authentication - throws error if not authenticated
 * 
 * @param user - User object or null
 * @throws Error if user is not authenticated
 * 
 * @example
 * ```ts
 * try {
 *   requireAuthentication(user);
 *   // User is authenticated, proceed
 * } catch (error) {
 *   // Handle authentication error
 * }
 * ```
 */
export function requireAuthentication(user: User | null): asserts user is User {
  const result = checkAuthentication(user);
  
  if (!result.isAuthenticated) {
    throw new Error(result.error ?? 'Authentication required');
  }
}

/**
 * Check if user has a specific role
 * 
 * @param user - User object or null
 * @param allowedRoles - Array of allowed roles
 * @returns Whether user has one of the allowed roles
 * 
 * @example
 * ```ts
 * if (checkUserRole(user, ['admin', 'manager'])) {
 *   // User has admin or manager role
 * }
 * ```
 */
export function checkUserRole(
  user: User | null,
  allowedRoles: string[]
): boolean {
  if (!user?.role) {
    return false;
  }

  return allowedRoles.includes(user.role);
}

/**
 * Require specific role - throws error if user doesn't have required role
 * 
 * @param user - User object or null
 * @param allowedRoles - Array of allowed roles
 * @throws Error if user doesn't have required role
 */
export function requireRole(
  user: User | null,
  allowedRoles: string[]
): void {
  requireAuthentication(user);
  
  if (!checkUserRole(user, allowedRoles)) {
    throw new Error(
      `Access denied. Required roles: ${allowedRoles.join(', ')}`
    );
  }
}

/**
 * Check if user is admin (admin or super_admin)
 * 
 * @param user - User object or null
 * @returns Whether user is admin
 */
export function isAdmin(user: User | null): boolean {
  return checkUserRole(user, ['admin', 'super_admin']);
}

/**
 * Check if user is super admin
 * 
 * @param user - User object or null
 * @returns Whether user is super admin
 */
export function isSuperAdmin(user: User | null): boolean {
  return checkUserRole(user, ['super_admin']);
}

/**
 * Get authentication headers for API requests
 * 
 * @param accessToken - User's access token
 * @returns Headers object with authorization
 * 
 * @example
 * ```ts
 * const headers = getAuthHeaders(user?.access_token);
 * fetch('/api/data', { headers });
 * ```
 */
export function getAuthHeaders(accessToken?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Validate session token (placeholder for actual validation)
 * 
 * @param token - Session token
 * @returns Whether token is valid
 */
export function validateSessionToken(token: string | null | undefined): boolean {
  if (!token) {
    return false;
  }

  // Basic validation - in production, verify with backend
  return token.length > 0;
}

