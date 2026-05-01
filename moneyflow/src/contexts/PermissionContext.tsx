// src/contexts/PermissionContext.tsx
/**
 * Permission Context
 * Provides permission checking utilities throughout the application
 * Wraps the usePermissions hook for React Context API access
 */

import { createContext, useContext, type ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/constants/permissions';
import type { UserRole } from '@/types/database.types';

/**
 * Permission context type
 */
export interface PermissionContextType {
  userRole: UserRole;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isViewer: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

/**
 * PermissionProvider component props
 */
interface PermissionProviderProps {
  children: ReactNode;
}

/**
 * Permission Provider
 * Wraps the application with permission context
 * 
 * @example
 * ```tsx
 * <PermissionProvider>
 *   <App />
 * </PermissionProvider>
 * ```
 */
export function PermissionProvider({ children }: PermissionProviderProps) {
  const permissions = usePermissions();

  return <PermissionContext.Provider value={permissions}>{children}</PermissionContext.Provider>;
}

/**
 * Hook to access permission context
 * 
 * @throws Error if used outside PermissionProvider
 * @returns Permission context value
 * 
 * @example
 * ```tsx
 * const { hasPermission, isAdmin } = usePermissionContext();
 * 
 * if (hasPermission('financial:create_invoices')) {
 *   // Show create invoice button
 * }
 * ```
 */
export function usePermissionContext(): PermissionContextType {
  const context = useContext(PermissionContext);
  
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  
  return context;
}

