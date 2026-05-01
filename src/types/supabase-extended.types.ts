/**
 * Extended Supabase response types
 * Provides type-safe wrappers for Supabase operations
 */

/**
 * Standard Supabase response type
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

/**
 * Supabase list response type
 */
export interface SupabaseListResponse<T> {
  data: T[] | null;
  error: {
    message: string;
    details?: string;
  } | null;
  count?: number;
}

/**
 * API Error type
 */
export interface ApiError {
  message: string;
  details?: string;
  code?: string;
}

/**
 * Type guard for API errors
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
}

/**
 * Safe error message extractor
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Type guard for checking if a value is not null/undefined
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if an array is not empty
 */
export function isNotEmpty<T>(array: T[] | null | undefined): array is T[] {
  return Array.isArray(array) && array.length > 0;
}

