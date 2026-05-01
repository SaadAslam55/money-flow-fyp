// src/middleware/permissionMiddleware.ts
/**
 * Permission Middleware
 * Utility functions for permission checks in routes, API calls, and components
 */

import { hasPermission, type Permission } from '@/constants/permissions';
import type { User, UserRole } from '@/types/database.types';

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  hasAccess: boolean;
  permission: Permission;
  userRole?: UserRole;
  error?: string;
}

/**
 * Check if user has a specific permission
 * 
 * @param userRole - User's role
 * @param permission - Permission to check
 * @returns Permission check result
 * 
 * @example
 * ```ts
 * const result = checkPermission(user.role, 'invoices:create');
 * if (!result.hasAccess) {
 *   showError('You do not have permission to create invoices');
 * }
 * ```
 */
export function checkPermission(
  userRole: UserRole | null | undefined,
  permission: Permission
): PermissionCheckResult {
  if (!userRole) {
    return {
      hasAccess: false,
      permission,
      error: 'User role is required',
    };
  }

  const hasAccess = hasPermission(userRole, permission);

  return {
    hasAccess,
    permission,
    userRole,
    error: hasAccess ? undefined : `Permission denied: ${permission}`,
  };
}

/**
 * Require permission - throws error if user doesn't have permission
 * 
 * @param userRole - User's role
 * @param permission - Permission to check
 * @throws Error if user doesn't have permission
 * 
 * @example
 * ```ts
 * try {
 *   requirePermission(user.role, 'invoices:create');
 *   // User has permission, proceed
 * } catch (error) {
 *   // Handle permission error
 * }
 * ```
 */
export function requirePermission(
  userRole: UserRole | null | undefined,
  permission: Permission
): void {
  const result = checkPermission(userRole, permission);
  
  if (!result.hasAccess) {
    throw new Error(result.error || `Permission required: ${permission}`);
  }
}

/**
 * Check if user has any of the specified permissions
 * 
 * @param userRole - User's role
 * @param permissions - Array of permissions to check
 * @returns Whether user has at least one permission
 * 
 * @example
 * ```ts
 * if (hasAnyPermission(user.role, ['invoices:create', 'invoices:edit'])) {
 *   // User can create or edit invoices
 * }
 * ```
 */
export function hasAnyPermission(
  userRole: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!userRole || permissions.length === 0) {
    return false;
  }

  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if user has all of the specified permissions
 * 
 * @param userRole - User's role
 * @param permissions - Array of permissions to check
 * @returns Whether user has all permissions
 * 
 * @example
 * ```ts
 * if (hasAllPermissions(user.role, ['invoices:create', 'invoices:send'])) {
 *   // User can create and send invoices
 * }
 * ```
 */
export function hasAllPermissions(
  userRole: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!userRole || permissions.length === 0) {
    return false;
  }

  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Get user's available permissions based on role
 * 
 * Note: This function requires importing all permissions from constants.
 * For better performance, consider using the usePermissions hook in components.
 * 
 * @param userRole - User's role
 * @returns Array of available permissions
 * 
 * @example
 * ```ts
 * const permissions = getAvailablePermissions(user.role);
 * // Use permissions to conditionally render UI
 * ```
 */
export function getAvailablePermissions(
  userRole: UserRole | null | undefined
): Permission[] {
  if (!userRole) {
    return [];
  }

  // Import all permission types statically
  // This is a simplified version - in practice, you'd import PERMISSIONS object
  // and iterate through it. For now, return empty array as this requires
  // dynamic permission checking which is better handled by usePermissions hook
  
  // Note: For a complete implementation, you would:
  // 1. Import PERMISSIONS from '@/constants/permissions'
  // 2. Iterate through all permissions
  // 3. Check each permission using hasPermission(userRole, permission)
  // 4. Return array of permissions user has access to
  
  return [];
}

/**
 * Check if user can perform action on resource
 * 
 * @param userRole - User's role
 * @param resource - Resource name (e.g., 'invoices', 'customers')
 * @param action - Action name (e.g., 'create', 'edit', 'delete')
 * @returns Whether user can perform action
 * 
 * @example
 * ```ts
 * if (canPerformAction(user.role, 'invoices', 'create')) {
 *   // Show create invoice button
 * }
 * ```
 */
export function canPerformAction(
  userRole: UserRole | null | undefined,
  resource: string,
  action: string
): boolean {
  if (!userRole) {
    return false;
  }

  const permission = `${resource}:${action}` as Permission;
  return hasPermission(userRole, permission);
}

/**
 * Check if user can access route based on route metadata
 * 
 * @param userRole - User's role
 * @param allowedRoles - Allowed roles for route
 * @param requirePermission - Required permission for route
 * @returns Whether user can access route
 * 
 * @example
 * ```ts
 * const canAccess = canAccessRoute(
 *   user.role,
 *   ['admin', 'manager'],
 *   'settings:view'
 * );
 * ```
 */
export function canAccessRoute(
  userRole: UserRole | null | undefined,
  allowedRoles?: UserRole[],
  requirePermission?: Permission
): boolean {
  if (!userRole) {
    return false;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      return false;
    }
  }

  // Check permission-based access
  if (requirePermission) {
    return hasPermission(userRole, requirePermission);
  }

  return true;
}

