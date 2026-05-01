// src/constants/permissions.ts
import type { UserRole } from '@/types/database.types';

/**
 * Permission types
 * Organized by feature area for better maintainability
 */
export type Permission =
  // System Administration
  | 'system:view_all_businesses'
  | 'system:manage_subscriptions'
  | 'system:system_settings'
  | 'system:view_platform_analytics'

  // Business Management
  | 'business:settings'
  | 'business:update_profile'
  | 'business:manage_team'
  | 'business:add_users'
  | 'business:remove_users'
  | 'business:manage_roles'
  | 'business:view_audit_logs'

  // Financial Operations
  | 'financial:create_invoices'
  | 'financial:edit_invoices'
  | 'financial:delete_invoices'
  | 'financial:void_invoices'
  | 'financial:send_invoices'
  | 'financial:record_payments'
  | 'financial:delete_payments'
  | 'financial:create_transactions'
  | 'financial:edit_transactions'
  | 'financial:delete_transactions'
  | 'financial:view_reports'
  | 'financial:export_reports'
  | 'financial:manage_accounts'
  | 'financial:reconcile_accounts'
  | 'financial:manage_categories'

  // Inventory Management
  | 'inventory:view_products'
  | 'inventory:add_products'
  | 'inventory:edit_products'
  | 'inventory:delete_products'
  | 'inventory:adjust_stock'
  | 'inventory:view_stock_movements'
  | 'inventory:receive_stock'
  | 'inventory:transfer_stock'
  // Product Management (alias for inventory)
  | 'products:create'
  | 'products:update'
  | 'products:delete'
  | 'products:import'
  | 'products:export'

  // Customer Management
  | 'customers:view_all'
  | 'customers:view_assigned'
  | 'customers:add'
  | 'customers:edit'
  | 'customers:delete'
  | 'customers:import'
  | 'customers:export'
  | 'customers:manage_portal'

  // Reports & Analytics
  | 'reports:view_basic'
  | 'reports:view_advanced'
  | 'reports:create_custom'
  | 'reports:schedule'
  | 'reports:export';

/**
 * Permission definitions with role access
 * Maps each permission to roles that have access
 */
export const PERMISSIONS: Record<Permission, UserRole[]> = {
  // System Administration
  'system:view_all_businesses': ['super_admin'],
  'system:manage_subscriptions': ['super_admin'],
  'system:system_settings': ['super_admin'],
  'system:view_platform_analytics': ['super_admin'],

  // Business Management
  'business:settings': ['super_admin', 'admin'],
  'business:update_profile': ['super_admin', 'admin'],
  'business:manage_team': ['super_admin', 'admin'],
  'business:add_users': ['super_admin', 'admin'],
  'business:remove_users': ['super_admin', 'admin'],
  'business:manage_roles': ['super_admin', 'admin'],
  'business:view_audit_logs': ['super_admin', 'admin', 'manager'],

  // Financial Operations
  'financial:create_invoices': ['super_admin', 'admin', 'manager', 'accountant', 'cashier'],
  'financial:edit_invoices': ['super_admin', 'admin', 'manager', 'accountant'],
  'financial:delete_invoices': ['super_admin', 'admin', 'manager'],
  'financial:void_invoices': ['super_admin', 'admin', 'manager', 'accountant'],
  'financial:send_invoices': ['super_admin', 'admin', 'manager', 'accountant', 'cashier'],
  'financial:record_payments': ['super_admin', 'admin', 'manager', 'accountant', 'cashier'],
  'financial:delete_payments': ['super_admin', 'admin', 'manager'],
  'financial:create_transactions': ['super_admin', 'admin', 'manager', 'accountant'],
  'financial:edit_transactions': ['super_admin', 'admin', 'manager', 'accountant'],
  'financial:delete_transactions': ['super_admin', 'admin', 'manager'],
  'financial:view_reports': ['super_admin', 'admin', 'manager', 'accountant'],
  'financial:export_reports': ['super_admin', 'admin', 'manager', 'accountant'],
  'financial:manage_accounts': ['super_admin', 'admin'],
  'financial:reconcile_accounts': ['super_admin', 'admin', 'accountant'],
  'financial:manage_categories': ['super_admin', 'admin'],

  // Inventory Management
  'inventory:view_products': ['super_admin', 'admin', 'manager', 'accountant', 'cashier'],
  'inventory:add_products': ['super_admin', 'admin', 'manager', 'accountant'],
  'inventory:edit_products': ['super_admin', 'admin', 'manager', 'accountant'],
  'inventory:delete_products': ['super_admin', 'admin', 'manager'],
  'inventory:adjust_stock': ['super_admin', 'admin', 'manager'],
  'inventory:view_stock_movements': ['super_admin', 'admin', 'manager', 'accountant'],
  'inventory:receive_stock': ['super_admin', 'admin', 'manager'],
  'inventory:transfer_stock': ['super_admin', 'admin', 'manager'],

  // Product Management (alias for inventory)
  'products:create': ['super_admin', 'admin', 'manager', 'accountant'],
  'products:update': ['super_admin', 'admin', 'manager', 'accountant'],
  'products:delete': ['super_admin', 'admin', 'manager'],
  'products:import': ['super_admin', 'admin', 'manager'],
  'products:export': ['super_admin', 'admin', 'manager', 'accountant'],

  // Customer Management
  'customers:view_all': ['super_admin', 'admin', 'manager', 'accountant'],
  'customers:view_assigned': ['super_admin', 'admin', 'manager', 'accountant', 'cashier'],
  'customers:add': ['super_admin', 'admin', 'manager', 'accountant', 'cashier'],
  'customers:edit': ['super_admin', 'admin', 'manager', 'accountant'],
  'customers:delete': ['super_admin', 'admin', 'manager'],
  'customers:import': ['super_admin', 'admin', 'manager'],
  'customers:export': ['super_admin', 'admin', 'manager', 'accountant'],
  'customers:manage_portal': ['super_admin', 'admin'],

  // Reports & Analytics
  'reports:view_basic': ['super_admin', 'admin', 'manager', 'accountant'],
  'reports:view_advanced': ['super_admin', 'admin', 'manager'],
  'reports:create_custom': ['super_admin', 'admin'],
  'reports:schedule': ['super_admin', 'admin'],
  'reports:export': ['super_admin', 'admin', 'manager', 'accountant'],
};

/**
 * Permission groups for easier UI rendering
 */
export const PERMISSION_GROUPS = {
  system: {
    label: 'System Administration',
    icon: 'Settings',
    permissions: [
      'system:view_all_businesses',
      'system:manage_subscriptions',
      'system:system_settings',
      'system:view_platform_analytics',
    ] as Permission[],
  },
  business: {
    label: 'Business Management',
    icon: 'Building2',
    permissions: [
      'business:settings',
      'business:update_profile',
      'business:manage_team',
      'business:add_users',
      'business:remove_users',
      'business:manage_roles',
      'business:view_audit_logs',
    ] as Permission[],
  },
  financial: {
    label: 'Financial Operations',
    icon: 'DollarSign',
    permissions: [
      'financial:create_invoices',
      'financial:edit_invoices',
      'financial:delete_invoices',
      'financial:void_invoices',
      'financial:send_invoices',
      'financial:record_payments',
      'financial:delete_payments',
      'financial:create_transactions',
      'financial:edit_transactions',
      'financial:delete_transactions',
      'financial:view_reports',
      'financial:export_reports',
      'financial:manage_accounts',
      'financial:reconcile_accounts',
      'financial:manage_categories',
    ] as Permission[],
  },
  inventory: {
    label: 'Inventory Management',
    icon: 'Package',
    permissions: [
      'inventory:view_products',
      'inventory:add_products',
      'inventory:edit_products',
      'inventory:delete_products',
      'inventory:adjust_stock',
      'inventory:view_stock_movements',
      'inventory:receive_stock',
      'inventory:transfer_stock',
    ] as Permission[],
  },
  customers: {
    label: 'Customer Management',
    icon: 'Users',
    permissions: [
      'customers:view_all',
      'customers:view_assigned',
      'customers:add',
      'customers:edit',
      'customers:delete',
      'customers:import',
      'customers:export',
      'customers:manage_portal',
    ] as Permission[],
  },
  reports: {
    label: 'Reports & Analytics',
    icon: 'BarChart3',
    permissions: [
      'reports:view_basic',
      'reports:view_advanced',
      'reports:create_custom',
      'reports:schedule',
      'reports:export',
    ] as Permission[],
  },
} as const;

/**
 * Check if user role has specific permission
 * @param userRole - User's role
 * @param permission - Permission to check
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles?.includes(userRole) || false;
}

/**
 * Check if user has all specified permissions
 * @param userRole - User's role
 * @param permissions - Array of permissions to check
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Check if user has any of the specified permissions
 * @param userRole - User's role
 * @param permissions - Array of permissions to check
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a user role
 * @param userRole - User's role
 */
export function getAvailablePermissions(userRole: UserRole): Permission[] {
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(userRole))
    .map(([permission]) => permission as Permission);
}

/**
 * Get permission label for UI display
 * @param permission - Permission key
 */
export function getPermissionLabel(permission: Permission): string {
  const parts = permission.split(':');
  const actionPart = parts[1] ?? parts[0] ?? '';
  return actionPart
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get permission description
 * @param permission - Permission key
 */
export function getPermissionDescription(permission: Permission): string {
  const descriptions: Partial<Record<Permission, string>> = {
    'system:view_all_businesses': 'View all businesses on the platform',
    'system:manage_subscriptions': 'Manage subscription plans and billing',
    'business:settings': 'Access business settings and configuration',
    'business:manage_team': 'Add, edit, and remove team members',
    'financial:create_invoices': 'Create new invoices',
    'financial:delete_invoices': 'Permanently delete invoices',
    'financial:view_reports': 'View financial reports and analytics',
    'inventory:adjust_stock': 'Manually adjust inventory levels',
    'customers:view_all': 'View all customer information',
    'reports:create_custom': 'Create custom reports',
  };

  return descriptions[permission] || getPermissionLabel(permission);
}

/**
 * Permission requirement check for routes
 * Used in route configuration
 */
export interface PermissionRequirement {
  permissions: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, ANY permission is enough.
}

/**
 * Check if user meets permission requirements
 * @param userRole - User's role
 * @param requirement - Permission requirement object
 */
export function meetsPermissionRequirement(
  userRole: UserRole,
  requirement: PermissionRequirement
): boolean {
  const { permissions, requireAll = false } = requirement;

  if (requireAll) {
    return hasAllPermissions(userRole, permissions);
  }

  return hasAnyPermission(userRole, permissions);
}
