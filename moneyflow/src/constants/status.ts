/**
 * Status Constants Library v2.0
 * Production-ready status configurations with zero duplication
 */

import type {
  InvoiceStatus,
  PaymentMethod,
  TransactionType,
  BankAccountType,
} from '@/types/database.types';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  description?: string;
}

interface PaymentMethodConfig {
  value: PaymentMethod;
  label: string;
  icon: string;
  description: string;
}

interface TransactionTypeConfig {
  value: TransactionType;
  label: string;
  color: string;
  bgColor?: string;
  icon: string;
  description: string;
}

interface AccountTypeConfig {
  value: BankAccountType;
  label: string;
  icon: string;
  description: string;
}

interface CurrencyConfig {
  value: string;
  label: string;
  symbol: string;
}

interface ExpenseCategoryConfig {
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface DateRangePreset {
  label: string;
  getValue: () => { start: string; end: string };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  currency: string;
  description: string;
  features: string[];
  limits: {
    users: number | null;
    invoices_per_month: number | null;
    customers: number | null;
    products: number | null;
    storage_mb: number | null;
  };
  features_access: {
    inventory: boolean;
    multi_branch: boolean;
    api_access: boolean;
    advanced_reports: boolean;
    custom_branding: boolean;
    priority_support: boolean;
    whatsapp_integration: boolean;
    multi_currency: boolean;
  };
  popular: boolean;
}

// ============================================================================
// Invoice Status
// ============================================================================

export const INVOICE_STATUS: Record<InvoiceStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'gray',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    icon: 'FileEdit',
    description: 'Invoice is being prepared',
  },
  sent: {
    label: 'Sent',
    color: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: 'Send',
    description: 'Invoice sent to customer',
  },
  paid: {
    label: 'Paid',
    color: 'green',
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-700 dark:text-green-300',
    icon: 'CheckCircle',
    description: 'Payment received in full',
  },
  partially_paid: {
    label: 'Partially Paid',
    color: 'yellow',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    icon: 'Clock',
    description: 'Partial payment received',
  },
  overdue: {
    label: 'Overdue',
    color: 'red',
    bgColor: 'bg-red-100 dark:bg-red-900',
    textColor: 'text-red-700 dark:text-red-300',
    icon: 'AlertCircle',
    description: 'Payment is past due date',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'gray',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    icon: 'XCircle',
    description: 'Invoice cancelled or voided',
  },
};

// ============================================================================
// Transaction Types
// ============================================================================

export const TRANSACTION_TYPES: TransactionTypeConfig[] = [
  {
    value: 'income',
    label: 'Income',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100',
    icon: 'TrendingUp',
    description: 'Money received',
  },
  {
    value: 'expense',
    label: 'Expense',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100',
    icon: 'TrendingDown',
    description: 'Money paid out',
  },
  {
    value: 'transfer',
    label: 'Transfer',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100',
    icon: 'ArrowRightLeft',
    description: 'Transfer between accounts',
  },
] as const;

// ============================================================================
// Payment Methods
// ============================================================================

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    value: 'cash',
    label: 'Cash',
    icon: 'Banknote',
    description: 'Cash payment',
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    icon: 'Building2',
    description: 'Direct bank transfer',
  },
  {
    value: 'card',
    label: 'Card',
    icon: 'CreditCard',
    description: 'Credit or debit card',
  },
  {
    value: 'check',
    label: 'Cheque',
    icon: 'FileCheck',
    description: 'Bank check',
  },
  {
    value: 'upi',
    label: 'UPI',
    icon: 'Smartphone',
    description: 'Unified Payments Interface',
  },
  {
    value: 'jazzcash',
    label: 'JazzCash',
    icon: 'Smartphone',
    description: 'JazzCash mobile wallet',
  },
  {
    value: 'easypaisa',
    label: 'Easypaisa',
    icon: 'Smartphone',
    description: 'Easypaisa mobile wallet',
  },
  {
    value: 'raast',
    label: 'Raast',
    icon: 'Zap',
    description: 'Pakistan instant payment system',
  },
  {
    value: 'other',
    label: 'Other',
    icon: 'MoreHorizontal',
    description: 'Other payment methods',
  },
] as const;

// ============================================================================
// Bank Account Types
// ============================================================================

export const ACCOUNT_TYPES: AccountTypeConfig[] = [
  {
    value: 'checking',
    label: 'Checking Account',
    icon: 'Landmark',
    description: 'Regular checking account',
  },
  {
    value: 'savings',
    label: 'Savings Account',
    icon: 'PiggyBank',
    description: 'Savings account',
  },
  {
    value: 'credit_card',
    label: 'Credit Card',
    icon: 'CreditCard',
    description: 'Credit card account',
  },
  {
    value: 'cash',
    label: 'Cash',
    icon: 'Wallet',
    description: 'Cash on hand',
  },
] as const;

// ============================================================================
// Currencies
// ============================================================================

export const CURRENCIES: CurrencyConfig[] = [
  { value: 'PKR', label: 'Pakistani Rupee (PKR)', symbol: 'Rs' },
  { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
  { value: 'AED', label: 'UAE Dirham (AED)', symbol: 'د.إ' },
  { value: 'SAR', label: 'Saudi Riyal (SAR)', symbol: '﷼' },
] as const;

// ============================================================================
// Subscription Plans
// ============================================================================

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    currency: 'PKR',
    description: 'Perfect for getting started',
    features: [
      '1 user',
      '50 invoices per month',
      '100 customers',
      '50 products',
      'Basic reports',
      'Email support',
      '30 days data retention',
    ],
    limits: {
      users: 1,
      invoices_per_month: 50,
      customers: 100,
      products: 50,
      storage_mb: 100,
    },
    features_access: {
      inventory: false,
      multi_branch: false,
      api_access: false,
      advanced_reports: false,
      custom_branding: false,
      priority_support: false,
      whatsapp_integration: false,
      multi_currency: false,
    },
    popular: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1500,
    interval: 'month',
    currency: 'PKR',
    description: 'For growing businesses',
    features: [
      '5 users',
      'Unlimited invoices',
      'Unlimited customers',
      'Unlimited products',
      'Inventory tracking',
      'Advanced reports',
      '1 year data retention',
      'Priority email support',
      'Custom invoice templates',
    ],
    limits: {
      users: 5,
      invoices_per_month: null,
      customers: null,
      products: null,
      storage_mb: 1024,
    },
    features_access: {
      inventory: true,
      multi_branch: false,
      api_access: false,
      advanced_reports: true,
      custom_branding: false,
      priority_support: true,
      whatsapp_integration: true,
      multi_currency: true,
    },
    popular: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4900,
    interval: 'month',
    currency: 'PKR',
    description: 'For established businesses',
    features: [
      'Unlimited users',
      'Everything in Pro',
      'Multi-branch support',
      'API access',
      'Custom branding',
      'Advanced integrations',
      'Unlimited data retention',
      'Priority phone support',
      'Dedicated account manager',
      'Custom development',
    ],
    limits: {
      users: null,
      invoices_per_month: null,
      customers: null,
      products: null,
      storage_mb: null,
    },
    features_access: {
      inventory: true,
      multi_branch: true,
      api_access: true,
      advanced_reports: true,
      custom_branding: true,
      priority_support: true,
      whatsapp_integration: true,
      multi_currency: true,
    },
    popular: false,
  },
} as const;

// ============================================================================
// Subscription Status
// ============================================================================

export const SUBSCRIPTION_STATUS: Record<string, StatusConfig> = {
  active: {
    label: 'Active',
    color: 'green',
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-700 dark:text-green-300',
    icon: 'CheckCircle',
  },
  past_due: {
    label: 'Past Due',
    color: 'yellow',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    icon: 'AlertCircle',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'red',
    bgColor: 'bg-red-100 dark:bg-red-900',
    textColor: 'text-red-700 dark:text-red-300',
    icon: 'XCircle',
  },
  suspended: {
    label: 'Suspended',
    color: 'gray',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    icon: 'Pause',
  },
  trialing: {
    label: 'Trial',
    color: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: 'Zap',
  },
} as const;

// ============================================================================
// Transaction Status
// ============================================================================

export const TRANSACTION_STATUSES = [
  { value: 'completed', label: 'Completed', color: 'text-green-600' },
  { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
] as const;

// ============================================================================
// Stock Levels
// ============================================================================

export const STOCK_LEVELS = {
  in_stock: {
    label: 'In Stock',
    color: 'green',
    icon: 'Check',
  },
  low_stock: {
    label: 'Low Stock',
    color: 'yellow',
    icon: 'AlertTriangle',
  },
  out_of_stock: {
    label: 'Out of Stock',
    color: 'red',
    icon: 'XCircle',
  },
} as const;

// ============================================================================
// Priority Levels
// ============================================================================

export const PRIORITY_LEVELS = {
  low: {
    label: 'Low',
    color: 'gray',
    icon: 'ArrowDown',
  },
  medium: {
    label: 'Medium',
    color: 'yellow',
    icon: 'Minus',
  },
  high: {
    label: 'High',
    color: 'orange',
    icon: 'ArrowUp',
  },
  urgent: {
    label: 'Urgent',
    color: 'red',
    icon: 'AlertCircle',
  },
} as const;

// ============================================================================
// Expense Categories
// ============================================================================

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  {
    name: 'Office Supplies',
    description: 'Stationery, paper, pens, and other office materials',
    color: '#3B82F6',
    icon: 'Briefcase',
  },
  {
    name: 'Utilities',
    description: 'Electricity, water, gas, internet, phone',
    color: '#10B981',
    icon: 'Zap',
  },
  {
    name: 'Rent',
    description: 'Office or business space rent',
    color: '#8B5CF6',
    icon: 'Home',
  },
  {
    name: 'Salaries',
    description: 'Employee wages and salaries',
    color: '#F59E0B',
    icon: 'Users',
  },
  {
    name: 'Marketing',
    description: 'Advertising, promotions, marketing materials',
    color: '#EC4899',
    icon: 'Megaphone',
  },
  {
    name: 'Travel',
    description: 'Business travel, transportation, fuel',
    color: '#14B8A6',
    icon: 'Plane',
  },
  {
    name: 'Equipment',
    description: 'Computers, machinery, tools',
    color: '#6366F1',
    icon: 'Monitor',
  },
  {
    name: 'Maintenance',
    description: 'Repairs and maintenance',
    color: '#EF4444',
    icon: 'Wrench',
  },
  {
    name: 'Insurance',
    description: 'Business insurance premiums',
    color: '#06B6D4',
    icon: 'Shield',
  },
  {
    name: 'Professional Services',
    description: 'Legal, accounting, consulting fees',
    color: '#84CC16',
    icon: 'FileText',
  },
  {
    name: 'Inventory',
    description: 'Product purchases and inventory',
    color: '#F97316',
    icon: 'Package',
  },
  {
    name: 'Other',
    description: 'Miscellaneous expenses',
    color: '#64748B',
    icon: 'MoreHorizontal',
  },
] as const;

// ============================================================================
// Date Range Presets
// ============================================================================

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: 'Today',
    getValue: () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const today = todayStr || new Date().toISOString().slice(0, 10);
      return { start: today, end: today };
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0] || yesterday.toISOString().slice(0, 10);
      return { start: dateStr, end: dateStr };
    },
  },
  {
    label: 'This Week',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      return {
        start: firstDay.toISOString().split('T')[0] || firstDay.toISOString().slice(0, 10),
        end: lastDay.toISOString().split('T')[0] || lastDay.toISOString().slice(0, 10),
      };
    },
  },
  {
    label: 'This Month',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        start: firstDay.toISOString().split('T')[0] || firstDay.toISOString().slice(0, 10),
        end: lastDay.toISOString().split('T')[0] || lastDay.toISOString().slice(0, 10),
      };
    },
  },
  {
    label: 'Last Month',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        start: firstDay.toISOString().split('T')[0] || firstDay.toISOString().slice(0, 10),
        end: lastDay.toISOString().split('T')[0] || lastDay.toISOString().slice(0, 10),
      };
    },
  },
  {
    label: 'This Quarter',
    getValue: () => {
      const today = new Date();
      const quarter = Math.floor(today.getMonth() / 3);
      const firstDay = new Date(today.getFullYear(), quarter * 3, 1);
      const lastDay = new Date(today.getFullYear(), quarter * 3 + 3, 0);
      return {
        start: firstDay.toISOString().split('T')[0] || firstDay.toISOString().slice(0, 10),
        end: lastDay.toISOString().split('T')[0] || lastDay.toISOString().slice(0, 10),
      };
    },
  },
  {
    label: 'This Year',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), 0, 1);
      const lastDay = new Date(today.getFullYear(), 11, 31);
      return {
        start: firstDay.toISOString().split('T')[0] || firstDay.toISOString().slice(0, 10),
        end: lastDay.toISOString().split('T')[0] || lastDay.toISOString().slice(0, 10),
      };
    },
  },
  {
    label: 'Last Year',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear() - 1, 0, 1);
      const lastDay = new Date(today.getFullYear() - 1, 11, 31);
      return {
        start: firstDay.toISOString().split('T')[0] || firstDay.toISOString().slice(0, 10),
        end: lastDay.toISOString().split('T')[0] || lastDay.toISOString().slice(0, 10),
      };
    },
  },
] as const;

// ============================================================================
// Export Formats
// ============================================================================

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV (Comma Separated)' },
  { value: 'excel', label: 'Excel (XLSX)' },
  { value: 'pdf', label: 'PDF Report' },
] as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get status configuration by type and value
 */
export function getStatusConfig(
  type: 'invoice' | 'subscription',
  value: string
): StatusConfig | null {
  if (type === 'invoice' && value in INVOICE_STATUS) {
    return INVOICE_STATUS[value as InvoiceStatus];
  }
  if (type === 'subscription' && value in SUBSCRIPTION_STATUS) {
    return SUBSCRIPTION_STATUS[value] as StatusConfig;
  }
  return null;
}

/**
 * Get payment method label
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const config = PAYMENT_METHODS.find((m) => m.value === method);
  return config?.label || method;
}

/**
 * Get payment method config
 */
export function getPaymentMethodConfig(method: PaymentMethod): PaymentMethodConfig | undefined {
  return PAYMENT_METHODS.find((m) => m.value === method);
}

/**
 * Get transaction type label
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  const config = TRANSACTION_TYPES.find((t) => t.value === type);
  return config?.label || type;
}

/**
 * Get transaction type config
 */
export function getTransactionTypeConfig(type: TransactionType): TransactionTypeConfig | undefined {
  return TRANSACTION_TYPES.find((t) => t.value === type);
}

/**
 * Get account type label
 */
export function getAccountTypeLabel(type: BankAccountType): string {
  const config = ACCOUNT_TYPES.find((a) => a.value === type);
  return config?.label || type;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const config = CURRENCIES.find((c) => c.value === currency);
  return config?.symbol || currency;
}

/**
 * Get subscription plan
 */
export function getSubscriptionPlan(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS[planId] || null;
}

/**
 * Check if feature is available in plan
 */
export function hasFeatureAccess(
  planId: string,
  feature: keyof SubscriptionPlan['features_access']
): boolean {
  const plan = getSubscriptionPlan(planId);
  return plan?.features_access[feature] || false;
}

// ============================================================================
// Type Exports
// ============================================================================

export type {
  StatusConfig,
  PaymentMethodConfig,
  TransactionTypeConfig,
  AccountTypeConfig,
  CurrencyConfig,
  ExpenseCategoryConfig,
  DateRangePreset,
  SubscriptionPlan,
};
