// src/lib/errorHandler.ts

import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Error types
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Extract user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    // Supabase PostgrestError
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    // API error response
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get error type from error
 */
export function getErrorType(error: unknown): ErrorType {
  if (error instanceof AppError) {
    return error.type;
  }

  if (typeof error === 'object' && error !== null) {
    // Supabase auth errors
    if ('status' in error) {
      const status = error.status as number;
      if (status === 401 || status === 403) return ErrorType.AUTH;
      if (status === 404) return ErrorType.NOT_FOUND;
      if (status >= 500) return ErrorType.SERVER;
    }

    // Network errors
    if ('code' in error && error.code === 'ECONNREFUSED') {
      return ErrorType.NETWORK;
    }
  }

  return ErrorType.UNKNOWN;
}

/**
 * Handle error and show appropriate toast notification
 */
export function handleError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const type = getErrorType(error);

  // Log error in development
    if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {

    logger.error(`[${context ?? 'Error'}]`, error instanceof Error ? error.message : String(error));
  }

  // Show user-friendly toast based on error type
  switch (type) {
    case ErrorType.AUTH:
      toast.error('Authentication Error', {
        description: message ?? 'Please log in again to continue.',
      });
      break;

    case ErrorType.PERMISSION:
      toast.error('Permission Denied', {
        description: message ?? 'You do not have permission to perform this action.',
      });
      break;

    case ErrorType.VALIDATION:
      toast.error('Validation Error', {
        description: message ?? 'Please check your input and try again.',
      });
      break;

    case ErrorType.NOT_FOUND:
      toast.error('Not Found', {
        description: message ?? 'The requested resource was not found.',
      });
      break;

    case ErrorType.NETWORK:
      toast.error('Network Error', {
        description: message ?? 'Please check your internet connection and try again.',
      });
      break;

    case ErrorType.SERVER:
      toast.error('Server Error', {
        description: message ?? 'Something went wrong on our end. Please try again later.',
      });
      break;

    default:
      toast.error('Error', {
        description: message ?? 'An unexpected error occurred. Please try again.',
      });
  }
}

/**
 * Handle error and return formatted error object
 */
export function formatError(error: unknown): {
  message: string;
  type: ErrorType;
  code?: string;
} {
  return {
    message: getErrorMessage(error),
    type: getErrorType(error),
    code: typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : undefined,
  };
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
 * Extract Supabase error details
 */
export function getSupabaseError(error: PostgrestError): {
  message: string;
  code: string;
  details?: string;
  hint?: string;
} {
  return {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  };
}

/**
 * Safe async error handler wrapper
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const formattedError = error instanceof Error ? error : new Error(getErrorMessage(error));
    
    if (errorHandler) {
      errorHandler(error);
    } else {
      handleError(error);
    }

    return { data: null, error: formattedError };
  }
}

