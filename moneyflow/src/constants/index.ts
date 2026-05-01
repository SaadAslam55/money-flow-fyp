// src/constants/index.ts
/**
 * Centralized constants exports
 * Import all constants from here for better organization
 * 
 * Usage:
 * import { ROLES, PERMISSIONS, INVOICE_STATUS, PAYMENT_METHODS } from '@/constants';
 */

// Roles
export {
  ROLES,
  ROLE_HIERARCHY,
  ASSIGNABLE_ROLES,
  getRoleLevel,
  canAccessRole,
  canManageUser,
  getAssignableRoles,
  getRoleBadgeClasses,
  getRoleLabel,
  getRoleDescription,
  getRoleCapabilities,
  getRoleLimitations,
  getRoleIcon,
  getRoleColor,
  isInternalRole,
  isAdminRole,
  canViewFinancials,
  canManageInventory,
  getNextRole,
  getPreviousRole,
  compareRoles,
  getDefaultRole,
  getRoleOptions,
} from './roles';

// Permissions
export {
  PERMISSIONS,
  PERMISSION_GROUPS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getAvailablePermissions,
  getPermissionLabel,
  getPermissionDescription,
  meetsPermissionRequirement,
  type Permission,
  type PermissionRequirement,
} from './permissions';

// Status (comprehensive status library)
export {
  INVOICE_STATUS,
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
  ACCOUNT_TYPES,
  CURRENCIES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  TRANSACTION_STATUSES,
  STOCK_LEVELS,
  PRIORITY_LEVELS,
  DEFAULT_EXPENSE_CATEGORIES,
  DATE_RANGE_PRESETS,
  EXPORT_FORMATS,
  getStatusConfig,
  getPaymentMethodLabel,
  getPaymentMethodConfig,
  getTransactionTypeLabel,
  getTransactionTypeConfig,
  getAccountTypeLabel,
  getCurrencySymbol,
  getSubscriptionPlan,
  hasFeatureAccess,
  type StatusConfig,
  type PaymentMethodConfig,
  type TransactionTypeConfig,
  type AccountTypeConfig,
  type CurrencyConfig,
  type ExpenseCategoryConfig,
  type DateRangePreset,
  type SubscriptionPlan,
} from './status';

// Invoice Status (invoice-specific constants)
// Note: These exports use aliases to avoid conflicts with status.ts exports
export {
  INVOICE_STATUS as INVOICE_STATUS_CONFIG,
  PAYMENT_METHODS as INVOICE_PAYMENT_METHODS,
  INVOICE_ACTIONS,
  DISCOUNT_TYPES,
  TAX_RATES,
  DEFAULT_INVOICE_TERMS,
  DEFAULT_INVOICE_NOTES,
  INVOICE_NUMBER_FORMATS,
  INVOICE_VALIDATION,
  INVOICE_FILTER_OPTIONS,
  EXPORT_FORMATS as INVOICE_EXPORT_FORMATS,
} from './invoiceStatus';

// Subscription Plans (from plans.ts - these take precedence over status.ts exports)
export {
  SUBSCRIPTION_PLANS as SUBSCRIPTION_PLANS_CONFIG,
  getSubscriptionPlan as getSubscriptionPlanConfig,
  hasFeatureAccess as hasFeatureAccessConfig,
  type SubscriptionPlan as SubscriptionPlanType,
} from './plans';

// Messages
export {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  WARNING_MESSAGES,
  INFO_MESSAGES,
  getMessage,
  type SuccessMessageKey,
  type ErrorMessageKey,
  type WarningMessageKey,
  type InfoMessageKey,
} from './messages';

