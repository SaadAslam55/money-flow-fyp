// src/components/auth/ProtectedRoute.tsx
/**
 * Protected Route Component
 * Provides route-level permission and authentication checks
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader } from '@/components/common/Loader';
import type { Permission } from '@/constants/permissions';
import type { UserRole } from '@/types/database.types';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Required permissions - user must have at least one (unless requireAll is true) */
  permissions?: Permission[];
  /** Required roles - user must have one of these roles */
  roles?: UserRole[];
  /** If true, user must have ALL permissions. If false, ANY permission is sufficient */
  requireAll?: boolean;
  /** Redirect path if user doesn't have permission */
  redirectTo?: string;
  /** If true, requires user to be authenticated */
  requireAuth?: boolean;
}

/**
 * Route wrapper that checks authentication and permissions
 * Redirects to login or unauthorized page if checks fail
 *
 * @example
 * ```tsx
 * <ProtectedRoute permissions={['system:view_all_businesses']} roles={['super_admin']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  permissions,
  roles,
  requireAll = false,
  redirectTo,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasAnyPermission, hasAllPermissions, hasAnyRole } = usePermissions();
  const location = useLocation();

  // Show loader while auth is initializing
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader message="Checking authentication..." />
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      return <Navigate to={redirectTo || '/unauthorized'} replace />;
    }
  }

  // Check permission-based access
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <Navigate to={redirectTo || '/unauthorized'} replace />;
    }
  }

  // All checks passed
  return <>{children}</>;
}

/**
 * Hook to programmatically check if current user can access a route
 * Useful for conditional navigation
 *
 * @example
 * ```tsx
 * const canAccessAdmin = useCanAccessRoute({
 *   roles: ['super_admin']
 * });
 * ```
 */
export function useCanAccessRoute(options: Omit<ProtectedRouteProps, 'children'>): boolean {
  const { user } = useAuth();
  const { hasAnyPermission, hasAllPermissions, hasAnyRole } = usePermissions();
  const { permissions, roles, requireAll = false, requireAuth = true } = options;

  // Check authentication
  if (requireAuth && !user) {
    return false;
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      return false;
    }
  }

  // Check permission-based access
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);

    if (!hasAccess) {
      return false;
    }
  }

  return true;
}
