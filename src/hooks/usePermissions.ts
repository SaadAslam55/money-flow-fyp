// src/hooks/usePermissions.ts
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { hasPermission, getAvailablePermissions } from '@/constants/permissions';
import type { Permission } from '@/constants/permissions';
import type { UserRole } from '@/types/database.types';

/**
 * Hook for checking user permissions
 * Provides permission checking utilities based on user role
 */
export function usePermissions() {
  const { user } = useAuth();

  const userRole = useMemo(() => {
    return (user?.role ?? 'viewer');
  }, [user?.role]);

  const permissions = useMemo(() => {
    return getAvailablePermissions(userRole);
  }, [userRole]);

  /**
   * Check if user has a specific permission
   */
  const hasPermissionCheck = useMemo(
    () => (permission: Permission) => {
      if (!user) return false;
      return hasPermission(userRole, permission);
    },
    [user, userRole]
  );

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useMemo(
    () => (permissionList: Permission[]) => {
      if (!user) return false;
      return permissionList.some((permission) => hasPermission(userRole, permission));
    },
    [user, userRole]
  );

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useMemo(
    () => (permissionList: Permission[]) => {
      if (!user) return false;
      return permissionList.every((permission) => hasPermission(userRole, permission));
    },
    [user, userRole]
  );

  /**
   * Check if user has a specific role
   */
  const hasRoleCheck = useMemo(
    () => (role: UserRole) => {
      if (!user) return false;
      return userRole === role;
    },
    [user, userRole]
  );

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useMemo(
    () => (roleList: UserRole[]) => {
      if (!user) return false;
      return roleList.includes(userRole);
    },
    [user, userRole]
  );

  return {
    userRole,
    permissions,
    hasPermission: hasPermissionCheck,
    hasAnyPermission,
    hasAllPermissions,
    hasRole: hasRoleCheck,
    hasAnyRole,
    isAdmin: hasRoleCheck('admin') || hasRoleCheck('super_admin'),
    isManager: hasRoleCheck('manager'),
    isViewer: hasRoleCheck('viewer'),
  };
}

