// src/hooks/useFetch.ts
/**
 * Fetch Hook
 * Custom hook for data fetching with React Query
 * 
 * Note: This hook is a wrapper around React Query's useQuery.
 * For most use cases, use React Query directly or domain-specific hooks.
 */

import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

export interface UseFetchOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  url: string;
  enabled?: boolean;
  headers?: Record<string, string>;
}

/**
 * Hook to fetch data from an API endpoint
 * 
 * @param options - Fetch options
 * @returns Query result
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useFetch({
 *   url: '/api/users',
 *   enabled: true
 * });
 * ```
 */
export function useFetch<TData = unknown, TError = Error>(
  options: UseFetchOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { url, enabled = true, headers, ...queryOptions } = options;

  return useQuery<TData, TError>({
    queryKey: [url, headers],
    queryFn: async () => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json() as Promise<TData>;
    },
    enabled,
    ...queryOptions,
  });
}

