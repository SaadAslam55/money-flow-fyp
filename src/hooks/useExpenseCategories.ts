import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as expenseCategoryApi from '@/services/api/expenseCategoryApi';
import { handleError } from '@/lib/errorHandler';
import type { ExpenseCategoryFormData } from '@/schemas/transactionSchemas';

/**
 * Hook for managing expense categories
 */
export function useExpenseCategories() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['expense-categories', organization?.id],
    queryFn: () => expenseCategoryApi.getExpenseCategories(organization!.id),
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes - categories don't change often
  });

  const createMutation = useMutation({
    mutationFn: (data: ExpenseCategoryFormData) =>
      expenseCategoryApi.createExpenseCategory(data as any, organization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useExpenseCategories.createCategory');
      toast.error(`Failed to create category: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExpenseCategoryFormData> }) =>
      expenseCategoryApi.updateExpenseCategory(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useExpenseCategories.updateCategory');
      toast.error(`Failed to update category: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseCategoryApi.deleteExpenseCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useExpenseCategories.deleteCategory');
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => expenseCategoryApi.deactivateCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category deactivated');
    },
    onError: (error: Error) => {
      handleError(error, 'useExpenseCategories.deactivateCategory');
      toast.error(`Failed to deactivate category: ${error.message}`);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => expenseCategoryApi.reactivateCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Category reactivated');
    },
    onError: (error: Error) => {
      handleError(error, 'useExpenseCategories.reactivateCategory');
      toast.error(`Failed to reactivate category: ${error.message}`);
    },
  });

  return {
    categories: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    deactivateCategory: deactivateMutation.mutateAsync,
    reactivateCategory: reactivateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for active categories only - auto-seeds if none exist
 */
export function useActiveCategories() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['active-expense-categories', organization?.id],
    queryFn: async () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      
      const result = await expenseCategoryApi.getActiveCategories(organization.id);
      
      // If no categories exist, seed default ones
      if (result.data && result.data.length === 0) {
        await expenseCategoryApi.seedDefaultCategories(organization.id);
        // Refetch after seeding
        return expenseCategoryApi.getActiveCategories(organization.id);
      }
      
      return result;
    },
    enabled: !!organization?.id,
    staleTime: 300000,
  });

  return {
    categories: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for single category with statistics
 */
export function useExpenseCategory(categoryId: string | null) {
  const query = useQuery({
    queryKey: ['expense-category', categoryId],
    queryFn: () => expenseCategoryApi.getExpenseCategory(categoryId!),
    enabled: !!categoryId,
    staleTime: 60000,
  });

  return {
    category: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for category spending trends
 */
export function useCategorySpendingTrends(categoryId: string | null, months: number = 6) {
  const query = useQuery({
    queryKey: ['category-spending-trends', categoryId, months],
    queryFn: () => expenseCategoryApi.getCategorySpendingTrends(categoryId!, months),
    enabled: !!categoryId,
    staleTime: 300000,
  });

  return {
    trends: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook for categories with spending summary
 */
export function useCategoriesWithSpending(startDate: string, endDate: string) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['categories-with-spending', organization?.id, startDate, endDate],
    queryFn: () =>
      expenseCategoryApi.getCategoriesWithSpending(organization!.id, startDate, endDate),
    enabled: !!organization?.id && !!startDate && !!endDate,
    staleTime: 60000,
  });

  return {
    categories: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
