/**
 * React Query Client Configuration
 * Centralized query client with error handling and caching
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// ============================================
// Error Handler
// ============================================

function handleQueryError(error: any, query?: any) {
  // Log for debugging
  logger.error('[Query Error]', error);

  // Don't show toast for background refetches that had previous data
  if (query?.state?.data !== undefined) {
    toast.error(`Background refresh failed: ${error.message}`);
    return;
  }

  // Handle specific error codes
  const errorMessage = error.message || 'An error occurred';
  const errorCode = error.code || 'UNKNOWN';

  switch (error.status) {
    case 401:
      // Redirect to login or refresh token
      toast.error('Session expired. Please log in again.');
      // Optionally trigger logout/redirect
      break;

    case 403:
      toast.error('You do not have permission to perform this action.');
      break;

    case 404:
      // Don't show toast for 404s - might be expected
      break;

    case 429:
      toast.error('Too many requests. Please wait a moment.');
      break;

    case 500:
    case 502:
    case 503:
      toast.error('Server error. Please try again later.');
      break;

    default:
      // Only show toast for unexpected errors
      if (error.status !== 0) {
        toast.error(errorMessage);
      }
  }
}

function handleMutationError(error: any) {
  logger.error('[Mutation Error]', error);

  const errorMessage = error.message || 'Failed to save changes';
  toast.error(errorMessage);
}

// ============================================
// Query Client
// ============================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes
      staleTime: 1000 * 60 * 5,

      // Keep in cache for 30 minutes
      gcTime: 1000 * 60 * 30,

      // Retry logic
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for server/network errors
        return failureCount < 3;
      },

      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Don't retry mutations
      retry: false,
    },
  },

  queryCache: new QueryCache({
    onError: (error, query) => {
      handleQueryError(error, query);
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      handleMutationError(error);
    },
  }),
});

// ============================================
// Utility Functions
// ============================================

/**
 * Invalidate all queries for an entity
 */
export function invalidateEntity(entity: string): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: [entity] });
}

/**
 * Prefetch query data
 */
export async function prefetchQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>
): Promise<void> {
  await queryClient.prefetchQuery({ queryKey, queryFn });
}

/**
 * Set query data directly (for optimistic updates)
 */
export function setQueryData<T>(queryKey: readonly unknown[], data: T): void {
  queryClient.setQueryData(queryKey, data);
}

/**
 * Get cached query data
 */
export function getQueryData<T>(queryKey: readonly unknown[]): T | undefined {
  return queryClient.getQueryData(queryKey);
}

/**
 * Cancel ongoing queries
 */
export async function cancelQueries(queryKey: readonly unknown[]): Promise<void> {
  await queryClient.cancelQueries({ queryKey });
}

/**
 * Reset query state (for logout)
 */
export function resetQueries(): void {
  queryClient.clear();
}

export default queryClient;
