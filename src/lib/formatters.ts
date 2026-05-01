import { logger } from '@/lib/logger';

/**
 * Formatters Library v2.0
 * Production-ready formatting utilities
 * Zero duplication, full type safety, optimized performance
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

type DateFormat = 'short' | 'medium' | 'long' | 'full';
type Conjunction = 'and' | 'or';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  postal_code?: string;
}

interface DateTimeFormatOptions {
  includeSeconds?: boolean;
  includeDate?: boolean;
  includeTime?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DATE_FORMAT_OPTIONS: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  short: { year: '2-digit', month: 'numeric', day: 'numeric' },
  medium: { year: 'numeric', month: 'short', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
};

const TIME_INTERVALS = [
  { name: 'year', seconds: 31536000 },
  { name: 'month', seconds: 2592000 },
  { name: 'week', seconds: 604800 },
  { name: 'day', seconds: 86400 },
  { name: 'hour', seconds: 3600 },
  { name: 'minute', seconds: 60 },
] as const;

const FILE_SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB'] as const;
const COMPACT_NUMBER_UNITS = [
  { threshold: 1_000_000_000, suffix: 'B', divisor: 1_000_000_000 },
  { threshold: 1_000_000, suffix: 'M', divisor: 1_000_000 },
  { threshold: 1_000, suffix: 'K', divisor: 1_000 },
] as const;

// ============================================================================
// Utility Helpers
// ============================================================================

function toDate(date: string | Date): Date {
  return date instanceof Date ? date : new Date(date);
}

function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

function cleanDigits(str: string): string {
  return str.replace(/\D/g, '');
}

function cleanNumeric(str: string): string {
  return str.replace(/[^\d.-]/g, '');
}

function safeFormat<T>(formatter: () => T, fallback: T, errorMessage?: string): T {
  try {
    return formatter();
  } catch (error) {
    const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
    if (errorMessage && isDev) {

      logger.warn(errorMessage, error instanceof Error ? error.message : String(error));
    }
    return fallback;
  }
}

// ============================================================================
// Currency & Numbers
// ============================================================================

/**
 * Format currency with symbol
 * @param amount - The amount to format
 * @param currency - Currency code (default: PKR)
 * @param locale - Locale for formatting (default: en-PK)
 */
export function formatCurrency(
  amount: number,
  currency: string = 'PKR',
  locale: string = 'en-PK'
): string {
  return safeFormat(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount),
    `${currency} ${formatNumber(amount, 2)}`,
    'Currency formatting failed'
  );
}

/**
 * Format amount without currency symbol
 */
export function formatAmount(amount: number, decimals: number = 2): string {
  return formatNumber(amount, decimals);
}

/**
 * Format number with specified decimal places
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatCompactNumber(value: number): string {
  for (const unit of COMPACT_NUMBER_UNITS) {
    if (value >= unit.threshold) {
      return `${(value / unit.divisor).toFixed(1)}${unit.suffix}`;
    }
  }
  return value.toString();
}

/**
 * Format ordinal numbers (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(number: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = number % 100;
  const suffix = suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
  return `${number}${suffix}`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyStr: string): number {
  const cleaned = cleanNumeric(currencyStr);
  return parseFloat(cleaned) || 0;
}

/**
 * Parse percentage string to number
 */
export function parsePercentage(percentageStr: string): number {
  const cleaned = cleanNumeric(percentageStr);
  return parseFloat(cleaned) || 0;
}

// ============================================================================
// Date & Time
// ============================================================================

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date, format: DateFormat = 'medium'): string {
  const dateObj = toDate(date);
  if (!isValidDate(dateObj)) return 'Invalid Date';

  return dateObj.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS[format]);
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date, includeSeconds: boolean = false): string {
  const dateObj = toDate(date);
  if (!isValidDate(dateObj)) return 'Invalid Date';

  return dateObj.toLocaleString('en-US', {
    ...DATE_FORMAT_OPTIONS.medium,
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  });
}

/**
 * Format time only
 */
export function formatTime(date: string | Date, includeSeconds: boolean = false): string {
  const dateObj = toDate(date);
  if (!isValidDate(dateObj)) return 'Invalid Time';

  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  });
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = toDate(date);
  if (!isValidDate(dateObj)) return 'Invalid Date';

  const diffInSeconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';

  for (const interval of TIME_INTERVALS) {
    const value = Math.floor(diffInSeconds / interval.seconds);
    if (value >= 1) {
      return `${value} ${interval.name}${value !== 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
}

/**
 * Format duration in seconds to human readable
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Format quarter (e.g., "Q1 2024")
 */
export function formatQuarter(date: Date | string): string {
  const dateObj = toDate(date);
  const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
  return `Q${quarter} ${dateObj.getFullYear()}`;
}

/**
 * Format month-year (e.g., "January 2024")
 */
export function formatMonthYear(date: Date | string): string {
  const dateObj = toDate(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

// ============================================================================
// Contact Information
// ============================================================================

/**
 * Format phone number (supports Pakistani and US formats)
 */
export function formatPhone(phone: string): string {
  const cleaned = cleanDigits(phone);

  // International Pakistani: +92 XXX XXXXXXX
  if (cleaned.startsWith('92') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }

  // Local Pakistani: 0XXX XXXXXXX
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }

  // US format: (123) 456-7890
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Format address
 */
export function formatAddress(address: Address): string {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode || address.postal_code,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
}

// ============================================================================
// Business & Documents
// ============================================================================

/**
 * Format invoice number with padding
 */
export function formatInvoiceNumber(
  number: number,
  prefix: string = 'INV',
  digits: number = 5
): string {
  return `${prefix}-${number.toString().padStart(digits, '0')}`;
}

/**
 * Format tax/GST number
 */
export function formatTaxNumber(taxNumber: string): string {
  const cleaned = taxNumber.replace(/[^a-zA-Z0-9]/g, '');

  // Pakistani NTN format: XXX-XXX-XXX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return taxNumber;
}

/**
 * Mask tax ID (show only first and last 2 characters)
 */
export function maskTaxId(taxId: string): string {
  if (taxId.length <= 4) return taxId;

  const visible = 2;
  const start = taxId.slice(0, visible);
  const end = taxId.slice(-visible);
  const masked = '*'.repeat(taxId.length - visible * 2);

  return `${start}${masked}${end}`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = (bytes / Math.pow(k, i)).toFixed(2);

  return `${parseFloat(size)} ${FILE_SIZE_UNITS[i]}`;
}

// ============================================================================
// Payment Cards
// ============================================================================

/**
 * Format card number with spaces
 */
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cleanDigits(cardNumber);
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ');
}

/**
 * Mask card number (show only last 4 digits)
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cleanDigits(cardNumber);
  if (cleaned.length < 4) return cardNumber;

  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
}

// ============================================================================
// Text Formatting
// ============================================================================

/**
 * Format status (convert snake_case to Title Case)
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format name (capitalize first letter of each word)
 */
export function formatName(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format boolean to Yes/No
 */
export function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}

/**
 * Format list with conjunction
 */
export function formatList(items: string[], conjunction: Conjunction = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return items.join(` ${conjunction} `);

  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  // Currency & Numbers
  formatCurrency,
  formatAmount,
  formatNumber,
  formatPercentage,
  formatCompactNumber,
  formatOrdinal,
  parseCurrency,
  parsePercentage,

  // Date & Time
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatDuration,
  formatQuarter,
  formatMonthYear,

  // Contact
  formatPhone,
  formatAddress,

  // Business
  formatInvoiceNumber,
  formatTaxNumber,
  maskTaxId,
  formatFileSize,

  // Payment
  formatCardNumber,
  maskCardNumber,

  // Text
  formatStatus,
  formatName,
  getInitials,
  truncateText,
  formatBoolean,
  formatList,
};
