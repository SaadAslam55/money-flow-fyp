// src/hooks/index.ts
/**
 * Centralized hook exports
 * Import all hooks from here for better organization
 * 
 * Usage:
 * import { useAuth, useCustomers, useDebounce } from '@/hooks';
 */

// Authentication & User
export { useAuth } from './useAuth';
export { useUser, useUsers } from './useUser';
export { usePermissions } from './usePermissions';
export { useOrganization, useOrganizationStats, useTeamMembers } from './useOrganization';

// Business Data
export { useCustomers } from './useCustomers';
export { useProducts, useLowStockProducts } from './useProducts';
export { useInvoices } from './useInvoices';
export { useTransactions, useTransaction, useTransactionSummary, useCashFlowData } from './useTransactions';
// Reports hooks - export individual hooks
export {
  useProfitLossReport,
  useBalanceSheet,
  useCashFlowStatement,
  useSalesReport,
  useExpenseReport,
  useTaxReport,
  useCustomerReport,
  useProductReport,
} from './useReports';
export { useDashboard } from './useDashboard';

// Settings & Configuration
// Settings hooks - export individual hooks
export {
  useInvoiceSettings,
  useTaxSettings,
  useIntegrationSettings,
  useAPIKeys,
  useWebhooks,
  useNotificationPreferences,
} from './useSettings';
export { useSubscription } from './useSubscription';
export { useBillingHistory } from './useBillingHistory';
export { useUsageLimits } from './useUsageLimits';
export { useBankAccounts, useActiveBankAccounts, useBankReconciliation } from './useBankAccounts';
export { useExpenseCategories, useActiveCategories } from './useExpenseCategories';

// Admin
// Admin hooks - export individual hooks
export {
  useAdminOrganizations,
  useAdminUsers,
} from './useAdmin';
export { useAuditLogs } from './useAuditLogs';

// UI & Utilities
export { useDebounce } from './useDebounce';
export { usePageTitle, type PageMeta } from './usePageTitle';
export { useCopyToClipboard } from './useCopyToClipboard';
export { useToast, toast } from './useToast';
export { useTheme } from './useTheme';
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, usePrefersDarkMode, usePrefersReducedMotion } from './useMediaQuery';
export { useLocalStorage } from './useLocalStorage';
export { useModal } from './useModal';
export { usePagination, type UsePaginationOptions, type UsePaginationReturn } from './usePagination';
export { useOutsideClick } from './useOutsideClick';
export { useOnlineStatus } from './useOnlineStatus';
export { useKeyboardShortcut, KEYBOARD_SHORTCUTS } from './useKeyboardShortcut';
export { useInterval } from './useInterval';
export { useFetch } from './useFetch';
export { useDarkMode } from './useDarkMode';
export { useAnalytics } from './useAnalytics';
export { useStripePayment, type StripePaymentOptions, type StripePaymentResult } from './useStripePayment';
export { useSupabaseRealtime } from './useSupabaseRealtime';

// AI Features
export { useAIFeatures, type AIFeature } from './useAIFeatures';
export { useCountUp, useCurrencyCountUp } from './useCountUp';

