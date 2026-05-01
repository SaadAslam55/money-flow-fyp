// src/hooks/useApiQuery.ts
/**
 * Custom React Query hooks for API calls
 * Provides consistent interface for data fetching with loading states,
 * error handling, caching, and optimistic updates
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/services/api/baseApi';

/**
 * Custom query options
 */
export interface ApiQueryOptions<T>
  extends Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'> {
  showErrorToast?: boolean;
  errorMessage?: string;
}

/**
 * Custom mutation options
 */
export interface ApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  invalidateKeys?: QueryKey[];
}

/**
 * Enhanced useQuery hook with standardized error handling
 */
export function useApiQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<ApiResponse<T>>,
  options?: ApiQueryOptions<T>
) {
  const {
    showErrorToast = true,
    errorMessage = 'Failed to fetch data',
    ...reactQueryOptions
  } = options || {};

  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();

      if (response.error) {
        const error = new Error(response.error.message || errorMessage);
        logger.error('Query failed:', error);

        if (showErrorToast) {
          toast.error(error.message);
        }

        throw error;
      }

      if (response.data === null) {
        throw new Error('No data returned');
      }

      return response.data;
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (
        error.message.includes('permission') ||
        error.message.includes('unauthorized') ||
        error.message.includes('not found')
      ) {
        return false;
      }
      // Retry up to 2 times on network errors
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    ...reactQueryOptions,
  });
}

/**
 * Enhanced useMutation hook with standardized success/error handling
 */
export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: ApiMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();

  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    errorMessage = 'Operation failed',
    invalidateKeys = [],
    onSuccess,
    onError,
    ...reactQueryOptions
  } = options || {};

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const response = await mutationFn(variables);

      if (response.error) {
        const error = new Error(response.error.message || errorMessage);
        logger.error('Mutation failed:', error);
        throw error;
      }

      if (response.data === null) {
        throw new Error('No data returned from mutation');
      }

      return response.data;
    },
    onSuccess: (data, variables, context) => {
      if (showSuccessToast) {
        toast.success(successMessage);
      }

      // Invalidate related queries
      if (invalidateKeys.length > 0) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      // @ts-expect-error - React Query v5 types mismatch
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (showErrorToast) {
        toast.error(error.message || errorMessage);
      }

      logger.error('Mutation error:', error);
      // @ts-expect-error - React Query v5 types mismatch
      onError?.(error, variables, context);
    },
    ...reactQueryOptions,
  });
}

/**
 * Hook for paginated queries
 */
export function usePaginatedApiQuery<T>(
  queryKey: QueryKey,
  queryFn: (page: number) => Promise<ApiResponse<{ data: T[]; count: number }>>,
  options?: ApiQueryOptions<{ data: T[]; count: number }>
) {
  return useApiQuery(
    queryKey,
    () => queryFn((queryKey[1] as number) || 1), // Extract page from queryKey or default to 1
    {
      ...options,
      placeholderData: (previousData) => previousData, // Replacement for keepPreviousData in v5
    }
  );
}

/**
 * Hook for infinite scroll queries
 */
export function useInfiniteApiQuery<T>(
  queryKey: QueryKey,
  queryFn: (page: number) => Promise<ApiResponse<{ data: T[]; hasMore: boolean }>>,
  options?: ApiQueryOptions<{ data: T[]; hasMore: boolean }>
) {
  return useApiQuery(queryKey, () => queryFn(1), options);
}

/**
 * Hook to invalidate queries
 */
export function useInvalidateQuery() {
  const queryClient = useQueryClient();

  return (queryKeys: QueryKey | QueryKey[]) => {
    const keys = Array.isArray(queryKeys[0]) ? queryKeys : [queryKeys];
    keys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key as QueryKey });
    });
  };
}

/**
 * Hook to prefetch queries
 */
export function usePrefetchQuery() {
  const queryClient = useQueryClient();

  return <T>(queryKey: QueryKey, queryFn: () => Promise<ApiResponse<T>>) => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const response = await queryFn();
        if (response.error || response.data === null) {
          throw new Error(response.error?.message || 'Prefetch failed');
        }
        return response.data;
      },
    });
  };
}
