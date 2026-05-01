// src/components/auth/PermissionGuard.tsx
/**
 * Permission Guard Component
 * Conditionally renders children based on permission checks
 */

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/constants/permissions';
import type { UserRole } from '@/types/database.types';

interface PermissionGuardProps {
  children: ReactNode;
  /** Required permissions - user must have at least one (unless requireAll is true) */
  permissions?: Permission[];
  /** Required roles - user must have one of these roles */
  roles?: UserRole[];
  /** If true, user must have ALL permissions. If false, ANY permission is sufficient */
  requireAll?: boolean;
  /** Fallback component to show if permission check fails */
  fallback?: ReactNode;
  /** If true, renders fallback instead of null when permission check fails */
  showFallback?: boolean;
}

/**
 * Guard component that conditionally renders children based on permissions
 *
 * @example
 * ```tsx
 * <PermissionGuard permissions={['financial:create_invoices']}>
 *   <CreateInvoiceButton />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  children,
  permissions,
  roles,
  requireAll = false,
  fallback = null,
  showFallback = false,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasAnyRole } = usePermissions();

  // Check role-based access first
  if (roles && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  // Check permission-based access
  if (permissions && permissions.length > 0) {
    if (requireAll) {
      if (!hasAllPermissions(permissions)) {
        return showFallback ? <>{fallback}</> : null;
      }
    } else {
      if (!hasAnyPermission(permissions)) {
        return showFallback ? <>{fallback}</> : null;
      }
    }
  }

  // No permissions or roles specified, or checks passed
  return <>{children}</>;
}

/**
 * Higher-order component version of PermissionGuard
 * Wraps a component with permission checking
 *
 * @example
 * ```tsx
 * const ProtectedButton = withPermission(Button, {
 *   permissions: ['financial:delete_invoices']
 * });
 * ```
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<PermissionGuardProps, 'children'>
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard {...options}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}
