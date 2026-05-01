// src/lib/index.ts
/**
 * Centralized library exports
 * Import all utility functions from here for better organization
 *
 * Usage:
 * import { formatCurrency, calculateTax, logger } from '@/lib';
 */

// Supabase
export { supabase, getAuthenticatedClient, isSupabaseConfigured } from './supabase';

// Formatters
export {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatPhone,
  formatAddress,
  getInitials,
  formatRelativeTime,
} from './formatters';

// Invoice formatters
export {
  formatInvoiceNumber,
  formatInvoiceStatus,
  calculateDaysUntilDue,
  getPaymentProgress,
  calculateInvoiceAge,
  getRelativeTime,
} from './invoiceFormatters';

// Validators (core only)
export { isValidEmail, isValidPhone, isValidUrl } from './validators';

// Utilities
export * from './utils';

// Error Handling
export {
  handleError,
  getErrorMessage,
  getErrorType,
  formatError,
  AppError,
  ErrorType,
} from './errorHandler';

// Calculations
export {
  calculateTax,
  calculateDiscount,
  calculateSubtotal,
  calculateTotal,
  calculateProfitMargin,
  calculateProfit,
  calculatePercentageChange,
  calculateCompoundInterest,
  calculateSimpleInterest,
  calculateInstallmentPayment,
  roundTo,
  calculateAverage,
  calculateSum,
  calculateMin,
  calculateMax,
} from './calculations';

// Logger
export { logger, configureLogger, LogLevel } from './logger';
export type { LogEntry } from './logger';

// Pakistani Localization
export {
  formatPakistaniNumber,
  formatPKR,
  numberToPakistaniWords,
  validateCNIC,
  formatCNICInput,
  validatePakistaniPhone,
  calculatePakistaniTax,
  PAKISTANI_TAX_CATEGORIES,
} from './pkLocalisation';
export type { PakistaniTaxCategory } from './pkLocalisation';

// CSV Export
export { exportToCSV } from './csvExport';
