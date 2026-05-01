// src/constants/roles.ts
import type { UserRole } from '@/types/database.types';

/**
 * Role configuration interface
 */
interface RoleConfig {
  id: UserRole;
  label: string;
  description: string;
  level: number;
  color: string;
  icon: string;
  badge: string;
  capabilities: string[];
  limitations?: string[];
}

/**
 * Role configurations with detailed information
 * Level determines hierarchy (higher = more privileges)
 */
export const ROLES: Record<UserRole, RoleConfig> = {
  super_admin: {
    id: 'super_admin',
    label: 'Super Admin',
    description: 'Platform owner with full system access',
    level: 100,
    color: 'purple',
    icon: 'Crown',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    capabilities: [
      'Access all businesses on the platform',
      'Manage subscription plans',
      'Configure system-wide settings',
      'View platform analytics',
      'Suspend or activate businesses',
      'Full database access',
    ],
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    description: 'Business owner with full business access',
    level: 90,
    color: 'blue',
    icon: 'Shield',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    capabilities: [
      'Full business management',
      'Add and remove team members',
      'Configure business settings',
      'Manage subscription and billing',
      'Access all reports',
      'Customize invoice templates',
      'Manage chart of accounts',
    ],
  },
  manager: {
    id: 'manager',
    label: 'Manager',
    description: 'Operations manager with supervisory access',
    level: 70,
    color: 'green',
    icon: 'UserCog',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    capabilities: [
      'Process invoices and transactions',
      'Manage inventory and stock',
      'Supervise team members',
      'View operational reports',
      'Approve large transactions',
      'Handle customer inquiries',
    ],
    limitations: [
      'Cannot change business settings',
      'Cannot add or remove users',
      'Cannot delete historical data',
      'Cannot modify chart of accounts',
    ],
  },
  accountant: {
    id: 'accountant',
    label: 'Accountant',
    description: 'Financial management and bookkeeping',
    level: 60,
    color: 'yellow',
    icon: 'Calculator',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    capabilities: [
      'Create and manage invoices',
      'Record all transactions',
      'Reconcile bank accounts',
      'Generate financial reports',
      'Prepare tax documents',
      'Manage expense categories',
    ],
    limitations: [
      'Cannot manage inventory',
      'Cannot delete transactions (only void)',
      'Cannot access team management',
      'Cannot change business settings',
    ],
  },
  cashier: {
    id: 'cashier',
    label: 'Cashier',
    description: 'Point of sale and basic transactions',
    level: 40,
    color: 'orange',
    icon: 'CashRegister',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    capabilities: [
      'Process sales quickly',
      'Create invoices',
      'Record payments',
      'Print receipts',
      'View assigned customer data',
      'Add new customers',
    ],
    limitations: [
      'No access to reports',
      'Cannot see profit margins',
      'Cannot modify prices (unless permitted)',
      "Cannot view other cashiers' sales",
      'Cannot delete invoices',
      'Cannot manage inventory',
    ],
  },
  viewer: {
    id: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to data',
    level: 1,
    color: 'gray',
    icon: 'Eye',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    capabilities: [
      'View invoices',
      'View transactions',
      'View customers',
      'View products',
      'View reports (read-only)',
    ],
    limitations: [
      'Cannot create or edit any data',
      'Cannot delete records',
      'Cannot access settings',
      'Cannot manage users',
      'Read-only access only',
    ],
  },
};

/**
 * Role hierarchy in order (highest to lowest)
 */
export const ROLE_HIERARCHY: UserRole[] = [
  'super_admin',
  'admin',
  'manager',
  'accountant',
  'cashier',
  'viewer',
];

/**
 * Roles available for business owners to assign
 * Excludes super_admin and customer as they're special cases
 */
export const ASSIGNABLE_ROLES: UserRole[] = ['admin', 'manager', 'accountant', 'cashier'];

/**
 * Get role level (higher = more privileges)
 * @param role - User role
 */
export function getRoleLevel(role: UserRole): number {
  return ROLES[role]?.level ?? 0;
}

/**
 * Check if user role can access another role's level
 * @param userRole - Current user's role
 * @param requiredRole - Required role level
 */
export function canAccessRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

/**
 * Check if user can manage another user
 * @param managerRole - Manager's role
 * @param targetRole - Target user's role
 */
export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  // Super admins can manage everyone
  if (managerRole === 'super_admin') return true;

  // Admins can manage everyone except super admins
  if (managerRole === 'admin') return targetRole !== 'super_admin';

  // Others cannot manage users
  return false;
}

/**
 * Get roles that a user can assign
 * @param userRole - Current user's role
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
  if (userRole === 'super_admin') {
    return ASSIGNABLE_ROLES;
  }

  if (userRole === 'admin') {
    // Admins can assign all roles except super_admin
    return ASSIGNABLE_ROLES;
  }

  // Other roles cannot assign roles
  return [];
}

/**
 * Get role badge classes for UI
 * @param role - User role
 */
export function getRoleBadgeClasses(role: UserRole): string {
  return ROLES[role]?.badge ?? 'bg-gray-100 text-gray-800';
}

/**
 * Get role display name
 * @param role - User role
 */
export function getRoleLabel(role: UserRole): string {
  return ROLES[role]?.label || role;
}

/**
 * Get role description
 * @param role - User role
 */
export function getRoleDescription(role: UserRole): string {
  return ROLES[role]?.description ?? '';
}

/**
 * Get role capabilities list
 * @param role - User role
 */
export function getRoleCapabilities(role: UserRole): string[] {
  return ROLES[role]?.capabilities ?? [];
}

/**
 * Get role limitations list
 * @param role - User role
 */
export function getRoleLimitations(role: UserRole): string[] {
  return ROLES[role]?.limitations ?? [];
}

/**
 * Get role icon name
 * @param role - User role
 */
export function getRoleIcon(role: UserRole): string {
  return ROLES[role]?.icon ?? 'User';
}

/**
 * Get role color
 * @param role - User role
 */
export function getRoleColor(role: UserRole): string {
  return ROLES[role]?.color ?? 'gray';
}

/**
 * Check if role is internal (not a viewer-only role)
 * @param role - User role
 */
export function isInternalRole(role: UserRole): boolean {
  return role !== 'viewer';
}

/**
 * Check if role is administrative
 * @param role - User role
 */
export function isAdminRole(role: UserRole): boolean {
  return ['super_admin', 'admin'].includes(role);
}

/**
 * Check if role can view financial data
 * @param role - User role
 */
export function canViewFinancials(role: UserRole): boolean {
  return ['super_admin', 'admin', 'manager', 'accountant'].includes(role);
}

/**
 * Check if role can manage inventory
 * @param role - User role
 */
export function canManageInventory(role: UserRole): boolean {
  return ['super_admin', 'admin', 'manager'].includes(role);
}

/**
 * Get next role in hierarchy (for promotion)
 * @param currentRole - Current user role
 */
export function getNextRole(currentRole: UserRole): UserRole | null {
  const currentIndex = ROLE_HIERARCHY.indexOf(currentRole);
  if (currentIndex > 0) {
    return ROLE_HIERARCHY[currentIndex - 1] || null;
  }
  return null;
}

/**
 * Get previous role in hierarchy (for demotion)
 * @param currentRole - Current user role
 */
export function getPreviousRole(currentRole: UserRole): UserRole | null {
  const currentIndex = ROLE_HIERARCHY.indexOf(currentRole);
  if (currentIndex < ROLE_HIERARCHY.length - 1) {
    return ROLE_HIERARCHY[currentIndex + 1] || null;
  }
  return null;
}

/**
 * Compare two roles
 * @param role1 - First role
 * @param role2 - Second role
 * @returns Positive if role1 > role2, negative if role1 < role2, 0 if equal
 */
export function compareRoles(role1: UserRole, role2: UserRole): number {
  return getRoleLevel(role1) - getRoleLevel(role2);
}

/**
 * Get recommended role for new team members
 */
export function getDefaultRole(): UserRole {
  return 'cashier';
}

/**
 * Role selection options for dropdowns
 */
export function getRoleOptions(currentUserRole: UserRole): Array<{
  value: UserRole;
  label: string;
  description: string;
  disabled: boolean;
}> {
  const assignableRoles = getAssignableRoles(currentUserRole);

  return ASSIGNABLE_ROLES.map((role) => ({
    value: role,
    label: getRoleLabel(role),
    description: getRoleDescription(role),
    disabled: !assignableRoles.includes(role),
  }));
}
