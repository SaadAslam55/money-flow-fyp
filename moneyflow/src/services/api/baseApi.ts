// src/services/api/baseApi.ts
/**
 * Base API Service
 * Provides common utilities, error handling, retry logic, and response formatting
 * for all API services in the application
 */

import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Base API response type
 */
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Paginated API response type
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  perPage: number;
  totalPages: number;
  error: Error | null;
}

/**
 * Standard error handler
 */
export function handleApiError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = (error as { message: unknown });
    return new Error(String(message));
  }
  
  return new Error('An unknown error occurred');
}

/**
 * Extract error message from Supabase error
 */
export function extractErrorMessage(error: PostgrestError | Error | null | unknown): string {
  if (!error) return 'Unknown error';
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  
  return 'An error occurred';
}

/**
 * Check if error is a Supabase PostgrestError
 */
export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error &&
    'hint' in error
  );
}

/**
 * Standard success response
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null };
}

/**
 * Standard error response
 */
export function errorResponse<T>(error: unknown): ApiResponse<T> {
  return { data: null, error: handleApiError(error) };
}

/**
 * Standard paginated success response
 */
export function paginatedSuccessResponse<T>(
  data: T[],
  count: number,
  page: number,
  perPage: number
): PaginatedResponse<T> {
  return {
    data,
    count,
    page,
    perPage,
    totalPages: Math.ceil(count / perPage),
    error: null,
  };
}

/**
 * Standard paginated error response
 */
export function paginatedErrorResponse<T>(
  page: number,
  perPage: number,
  error: unknown
): PaginatedResponse<T> {
  return {
    data: [],
    count: 0,
    page,
    perPage,
    totalPages: 0,
    error: handleApiError(error),
  };
}

/**
 * Validate organization ID
 */
export function validateOrganizationId(organizationId: string | null | undefined): string {
  if (!organizationId) {
    throw new Error('Organization ID is required');
  }
  return organizationId;
}

/**
 * Validate user ID
 */
export function validateUserId(userId: string | null | undefined): string {
  if (!userId) {
    throw new Error('User ID is required');
  }
  return userId;
}

/**
 * Build pagination range
 */
export function buildPaginationRange(page: number, perPage: number) {
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;
  return { start, end };
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 50;
export const MAX_PER_PAGE = 1000;

/**
 * Retry configuration
 */
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_RETRY_DELAY = 1000; // 1 second
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Retry function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = DEFAULT_MAX_RETRIES,
  retryDelay: number = DEFAULT_RETRY_DELAY
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof Error && 
          (error.message.includes('permission') || 
           error.message.includes('not found') ||
           error.message.includes('duplicate') ||
           error.message.includes('validation'))) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }
  }
  
  throw lastError;
}

/**
 * Timeout wrapper for async functions
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Execute query with retry and timeout
 */
export async function executeWithRetryAndTimeout<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const retryDelay = options?.retryDelay ?? DEFAULT_RETRY_DELAY;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  
  return withTimeout(
    withRetry(fn, maxRetries, retryDelay),
    timeout
  );
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: number, perPage: number): {
  page: number;
  perPage: number;
} {
  const validPage = Math.max(1, Math.floor(page) || DEFAULT_PAGE);
  const validPerPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Math.floor(perPage) || DEFAULT_PER_PAGE)
  );
  
  return { page: validPage, perPage: validPerPage };
}

/**
 * Sanitize search string for SQL queries
 */
export function sanitizeSearch(search: string): string {
  // Remove SQL injection patterns
  return search
    .replace(/[;'"]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim()
    .substring(0, 100); // Limit length
}

