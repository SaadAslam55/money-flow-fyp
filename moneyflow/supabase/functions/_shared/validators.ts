// supabase/functions/_shared/validators.ts
/**
 * Input validation utilities for Edge Functions
 * Provides common validation functions for production-ready Edge Functions
 *
 * @module EdgeFunctions/Validators
 *
 * Features:
 * - UUID validation
 * - Email validation
 * - String length validation
 * - Number range validation
 * - Date validation
 * - Array validation
 * - Enum validation
 * - Object field validation
 * - Input sanitization (XSS prevention)
 * - JSON body parsing
 * - Pagination validation
 *
 * @example
 * ```typescript
 * import { validateRequired, isValidUUID, parseJsonBody } from '../_shared/validators.ts';
 *
 * const { data, error } = await parseJsonBody<CreateInvoiceRequest>(request);
 * if (error) return corsErrorResponse(error, 400, request);
 *
 * const validation = validateRequired(data.customer_id, 'customer_id');
 * if (!validation.valid) return corsErrorResponse(validation.error, 400, request);
 * ```
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate UUID format
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required field
 */
export function validateRequired(
  value: unknown,
  fieldName: string
): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }
  return { valid: true };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (value.length < min) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${min} characters`,
    };
  }
  if (value.length > max) {
    return {
      valid: false,
      error: `${fieldName} must be at most ${max} characters`,
    };
  }
  return { valid: true };
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (value < min) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${min}`,
    };
  }
  if (value > max) {
    return {
      valid: false,
      error: `${fieldName} must be at most ${max}`,
    };
  }
  return { valid: true };
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

/**
 * Validate date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
}

/**
 * Validate array is not empty
 */
export function validateArrayNotEmpty<T>(
  array: T[],
  fieldName: string
): ValidationResult {
  if (!Array.isArray(array) || array.length === 0) {
    return {
      valid: false,
      error: `${fieldName} must not be empty`,
    };
  }
  return { valid: true };
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: T[],
  fieldName: string
): ValidationResult {
  if (!allowedValues.includes(value as T)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Validate object has required fields
 */
export function validateObjectFields(
  obj: Record<string, unknown>,
  requiredFields: string[]
): ValidationResult {
  const missingFields = requiredFields.filter(
    (field) => !(field in obj) || obj[field] === null || obj[field] === undefined
  );

  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and parse JSON body
 */
export async function parseJsonBody<T>(
  request: Request
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        data: null,
        error: new Error('Content-Type must be application/json'),
      };
    }

    const body = await request.json();
    return { data: body as T, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Invalid JSON body'),
    };
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page?: number,
  pageSize?: number
): ValidationResult {
  if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
    return {
      valid: false,
      error: 'Page must be a positive integer',
    };
  }

  if (pageSize !== undefined) {
    if (pageSize < 1 || pageSize > 100 || !Number.isInteger(pageSize)) {
      return {
        valid: false,
        error: 'Page size must be between 1 and 100',
      };
    }
  }

  return { valid: true };
}

