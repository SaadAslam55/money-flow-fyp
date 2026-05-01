// src/hooks/useOptimisticUpdate.ts
/**
 * Optimistic UI Updates Hook
 * Provides utilities for implementing optimistic updates with rollback on error
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface OptimisticUpdateOptions<TData, TVariables> {
  queryKey: unknown[];
  updateFn: (oldData: TData, variables: TVariables) => TData;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
}

/**
 * Hook for implementing optimistic updates with automatic rollback
 */
export function useOptimisticUpdate<TData, TVariables>({
  queryKey,
  updateFn,
  onError,
  showErrorToast = true,
}: OptimisticUpdateOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  const performOptimisticUpdate = useCallback(
    async (variables: TVariables, mutationFn: (vars: TVariables) => Promise<TData>) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData<TData>(queryKey, updateFn(previousData, variables));
      }

      try {
        // Perform the actual mutation
        const result = await mutationFn(variables);
        return result;
      } catch (error) {
        // On error, roll back to the previous value
        if (previousData) {
          queryClient.setQueryData<TData>(queryKey, previousData);
        }

        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error('Optimistic update failed, rolling back:', errorObj);

        if (showErrorToast) {
          toast.error('Update failed', {
            description: errorObj.message,
          });
        }

        onError?.(errorObj);
        throw error;
      } finally {
        // Always refetch to ensure data is in sync with server
        queryClient.invalidateQueries({ queryKey });
      }
    },
    [queryClient, queryKey, updateFn, onError, showErrorToast]
  );

  return { performOptimisticUpdate };
}

/**
 * Hook for optimistic list updates (add, remove, update items)
 */
export function useOptimisticListUpdate<TItem extends { id: string }>(queryKey: unknown[]) {
  const queryClient = useQueryClient();

  const addItemOptimistically = useCallback(
    (newItem: TItem) => {
      queryClient.setQueryData<TItem[]>(queryKey, (old) => {
        if (!old) return [newItem];
        return [newItem, ...old];
      });
    },
    [queryClient, queryKey]
  );

  const removeItemOptimistically = useCallback(
    (itemId: string) => {
      queryClient.setQueryData<TItem[]>(queryKey, (old) => {
        if (!old) return [];
        return old.filter((item) => item.id !== itemId);
      });
    },
    [queryClient, queryKey]
  );

  const updateItemOptimistically = useCallback(
    (itemId: string, updates: Partial<TItem>) => {
      queryClient.setQueryData<TItem[]>(queryKey, (old) => {
        if (!old) return [];
        return old.map((item) => (item.id === itemId ? { ...item, ...updates } : item));
      });
    },
    [queryClient, queryKey]
  );

  const reorderItemsOptimistically = useCallback(
    (fromIndex: number, toIndex: number) => {
      queryClient.setQueryData<TItem[]>(queryKey, (old) => {
        if (!old) return [];
        const newList = [...old];
        const [removed] = newList.splice(fromIndex, 1);
        if (removed) {
          newList.splice(toIndex, 0, removed);
        }
        return newList;
      });
    },
    [queryClient, queryKey]
  );

  return {
    addItemOptimistically,
    removeItemOptimistically,
    updateItemOptimistically,
    reorderItemsOptimistically,
  };
}

/**
 * Hook for optimistic pagination updates
 */
export function useOptimisticPaginatedUpdate<TItem>(
  queryKey: unknown[],
  page: number,
  perPage: number
) {
  const queryClient = useQueryClient();

  const updatePaginatedItem = useCallback(
    (itemId: string, updates: Partial<TItem>) => {
      const cacheKey = [...queryKey, { page, perPage }];
      queryClient.setQueryData<{ data: TItem[]; count: number }>(cacheKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((item: TItem) =>
            (item as TItem & { id: string }).id === itemId
              ? ({ ...item, ...updates } as TItem)
              : item
          ),
        };
      });
    },
    [queryClient, queryKey, page, perPage]
  );

  return { updatePaginatedItem };
}
