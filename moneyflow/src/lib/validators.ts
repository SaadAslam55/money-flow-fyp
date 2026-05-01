// src/lib/validators.ts
/**
 * Validation Utilities
 * Reusable validation functions and helpers for form validation
 */

import { z } from 'zod';

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[\d\s-()]+$/,
  phonePK: /^(\+92|0)[0-9]{10}$/,
  url: /^https?:\/\/.+/,
  sku: /^[A-Za-z0-9-]*$/,
  iban: /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/i,
  swift: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i,
  taxId: /^[A-Z0-9-]+$/i,
  hexColor: /^#[0-9A-F]{6}$/i,
  dateISO: /^\d{4}-\d{2}-\d{2}$/,
  currency: /^[A-Z]{3}$/,
} as const;

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be less than ${max} characters`,
  invalidEmail: 'Invalid email address',
  invalidPhone: 'Invalid phone number format',
  invalidUrl: 'Invalid URL format',
  invalidNumber: 'Must be a valid number',
  positiveNumber: 'Must be greater than 0',
  nonNegativeNumber: 'Cannot be negative',
  maxValue: (max: number) => `Value cannot exceed ${max}`,
  minValue: (min: number) => `Value must be at least ${min}`,
  passwordWeak: 'Password is too weak',
  passwordsMismatch: "Passwords don't match",
  dateInPast: 'Date cannot be in the past',
  dateInFuture: 'Date cannot be in the future',
  dateRangeInvalid: 'End date must be after start date',
} as const;

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, VALIDATION_MESSAGES.required('Email'))
  .email(VALIDATION_MESSAGES.invalidEmail)
  .max(255, VALIDATION_MESSAGES.maxLength('Email', 255));

/**
 * Phone validation schema (flexible)
 */
export const phoneSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.phone, VALIDATION_MESSAGES.invalidPhone)
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number is too long')
  .optional()
  .or(z.literal(''))
  .transform((val) => (val === '' ? undefined : val));

/**
 * Pakistani phone validation schema
 */
export const phonePKSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.phonePK, 'Invalid Pakistani phone number format')
  .optional()
  .or(z.literal(''))
  .transform((val) => (val === '' ? undefined : val));

/**
 * URL validation schema
 */
export const urlSchema = z.string().url(VALIDATION_MESSAGES.invalidUrl).optional().nullable();

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Strong password validation schema
 */
export const strongPasswordSchema = passwordSchema.refine((password) => password.length >= 12, {
  message: 'For stronger security, use at least 12 characters',
});

/**
 * Currency amount validation schema
 */
export const currencyAmountSchema = z
  .number({
    required_error: VALIDATION_MESSAGES.required('Amount'),
    invalid_type_error: VALIDATION_MESSAGES.invalidNumber,
  })
  .min(0, VALIDATION_MESSAGES.nonNegativeNumber)
  .max(999999999.99, VALIDATION_MESSAGES.maxValue(999999999.99))
  .multipleOf(0.01, 'Amount must have at most 2 decimal places');

/**
 * Positive currency amount validation schema
 */
export const positiveCurrencyAmountSchema = currencyAmountSchema.refine((val) => val > 0, {
  message: VALIDATION_MESSAGES.positiveNumber,
});

/**
 * Percentage validation schema
 */
export const percentageSchema = z
  .number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100%')
  .multipleOf(0.01, 'Percentage must have at most 2 decimal places');

/**
 * Date validation schema (ISO format)
 */
export const dateISOSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.dateISO, 'Date must be in YYYY-MM-DD format')
  .refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    },
    { message: 'Invalid date' }
  );

/**
 * Date in past validation schema
 */
export const datePastSchema = dateISOSchema.refine(
  (date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d <= today;
  },
  { message: VALIDATION_MESSAGES.dateInPast }
);

/**
 * Date in future validation schema
 */
export const dateFutureSchema = dateISOSchema.refine(
  (date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  },
  { message: VALIDATION_MESSAGES.dateInFuture }
);

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * SKU validation schema
 */
export const skuSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.sku, 'SKU must contain only letters, numbers, and hyphens')
  .max(100, 'SKU is too long')
  .optional()
  .or(z.literal(''))
  .transform((val) => (val === '' ? undefined : val?.toUpperCase()));

/**
 * Tax ID validation schema
 */
export const taxIdSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.taxId, 'Invalid tax ID format')
  .max(100, 'Tax ID is too long')
  .optional()
  .or(z.literal(''))
  .transform((val) => (val === '' ? undefined : val));

/**
 * IBAN validation schema
 */
export const ibanSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.iban, 'Invalid IBAN format')
  .max(34, 'IBAN must be less than 34 characters')
  .optional()
  .nullable();

/**
 * SWIFT code validation schema
 */
export const swiftSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.swift, 'Invalid SWIFT code format')
  .refine((val) => val.length === 8 || val.length === 11, 'SWIFT code must be 8 or 11 characters')
  .optional()
  .nullable();

/**
 * Hex color validation schema
 */
export const hexColorSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.hexColor, 'Color must be a valid hex code (e.g., #FF0000)')
  .optional()
  .nullable();

/**
 * Currency code validation schema
 */
export const currencyCodeSchema = z
  .string()
  .length(3, 'Currency must be a 3-letter code (e.g., PKR, USD)')
  .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters only')
  .default('PKR');

/**
 * File validation schema
 */
export const fileSchema = z
  .instanceof(File, { message: 'Must be a file' })
  .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
  .refine((file) => {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/csv',
    ];
    return validTypes.includes(file.type) || file.name.match(/\.(jpg|jpeg|png|pdf|csv)$/i);
  }, 'Invalid file type. Allowed: JPG, PNG, PDF, CSV');

/**
 * Image file validation schema
 */
export const imageFileSchema = z
  .instanceof(File, { message: 'Must be an image file' })
  .refine((file) => file.size <= 5 * 1024 * 1024, 'Image size must be less than 5MB')
  .refine((file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    return validTypes.includes(file.type) || file.name.match(/\.(jpg|jpeg|png|webp)$/i);
  }, 'Invalid image type. Allowed: JPG, PNG, WebP');

/**
 * CSV file validation schema
 */
export const csvFileSchema = z
  .instanceof(File, { message: 'Must be a CSV file' })
  .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
  .refine((file) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/plain'];
    return validTypes.includes(file.type) || file.name.endsWith('.csv');
  }, 'Only CSV files are allowed');

/**
 * Date range validation helper
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
}

/**
 * Create date range schema
 */
export function createDateRangeSchema() {
  return z
    .object({
      start_date: dateISOSchema,
      end_date: dateISOSchema,
    })
    .refine((data) => validateDateRange(data.start_date, data.end_date), {
      message: VALIDATION_MESSAGES.dateRangeInvalid,
      path: ['end_date'],
    });
}

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;
  else feedback.push('Use 12+ characters for better security');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 3) strength = 'fair';
  else if (score <= 4) strength = 'good';
  else strength = 'strong';

  return { score, strength, feedback };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION_PATTERNS.email.test(email);
}

/**
 * Validate phone format
 */
export function isValidPhone(phone: string): boolean {
  return VALIDATION_PATTERNS.phone.test(phone);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

/**
 * Validate and sanitize number input
 */
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    return isNaN(input) ? null : input;
  }

  const cleaned = input.replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Format validation error for display
 */
export function formatValidationError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });

  return formatted;
}

/**
 * Get first validation error message
 */
export function getFirstError(error: z.ZodError): string | null {
  if (error.errors.length === 0) return null;
  return error.errors[0]?.message ?? null;
}

/**
 * Safe parse with error formatting
 */
export function safeParseWithErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: formatValidationError(result.error),
  };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[],
  allowedExtensions?: string[]
): boolean {
  if (allowedTypes.includes(file.type)) return true;

  if (allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  return false;
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  file: File,
  maxWidth?: number,
  maxHeight?: number
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(false);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const valid = (!maxWidth || img.width <= maxWidth) && (!maxHeight || img.height <= maxHeight);
      resolve(valid);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };

    img.src = url;
  });
}

/**
 * Debounce validation function
 */
export function debounceValidation<T>(
  validator: (value: T) => Promise<boolean> | boolean,
  delay: number = 300
): (value: T) => Promise<boolean> {
  let timeoutId: NodeJS.Timeout;

  return (value: T) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const result = await validator(value);
        resolve(result);
      }, delay);
    });
  };
}

/**
 * Async validation helper
 */
export async function asyncValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ valid: boolean; data?: T; errors?: Record<string, string> }> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { valid: true, data: result.data };
  }

  return {
    valid: false,
    errors: formatValidationError(result.error),
  };
}

// ---------------------------------------------------------------------------
// Additional validator helpers required by central exports
// ---------------------------------------------------------------------------
export function isValidIBAN(iban: string): boolean {
  return VALIDATION_PATTERNS.iban.test(iban);
}

export function isValidZipCode(zip: string): boolean {
  return /^[A-Za-z0-9\- ]{3,10}$/.test(zip);
}

export function validateRequired(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

export function validateLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
