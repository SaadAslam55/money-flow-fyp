import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as transactionApi from '@/services/api/transactionApi';
import { handleError } from '@/lib/errorHandler';
import type { TransactionFormData } from '@/schemas/transactionSchemas';
import type { TransactionFilters } from '@/types/database.types';

/**
 * Hook for managing transactions list with filters
 */
export function useTransactions(filters?: TransactionFilters, page: number = 1) {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', organization?.id, filters, page],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return transactionApi.getTransactions(organization.id, filters, page);
    },
    enabled: !!organization?.id,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  const createMutation = useMutation({
    mutationFn: ({ data, file }: { data: TransactionFormData; file?: File }) => {
      if (!organization?.id) throw new Error('Organization ID is required');
      if (!user?.id) throw new Error('User ID is required');
      // Clean data to match database schema - remove fields that don't exist in DB
      const { tags, ...cleanData } = data as TransactionFormData & { tags?: string[] };
      return transactionApi.createTransaction(cleanData as any, organization.id, user.id, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-data'] });
      toast.success('Transaction recorded successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useTransactions.createTransaction');
      toast.error(`Failed to record transaction: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      file,
    }: {
      id: string;
      data: Partial<TransactionFormData>;
      file?: File;
    }) => {
      // Clean data to match database schema - remove fields that don't exist in DB
      const { tags, ...cleanData } = data as Partial<TransactionFormData> & { tags?: string[] };
      return transactionApi.updateTransaction(id, cleanData as any, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-data'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useTransactions.updateTransaction');
      toast.error(`Failed to update transaction: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-data'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useTransactions.deleteTransaction');
      toast.error(`Failed to delete transaction: ${error.message}`);
    },
  });

  return {
    transactions: query.data?.data ?? [],
    count: query.data?.count ?? 0,
    page: query.data?.page || page,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for fetching single transaction
 */
export function useTransaction(transactionId: string | null) {
  const query = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => {
      if (!transactionId) throw new Error('Transaction ID is required');
      return transactionApi.getTransaction(transactionId);
    },
    enabled: !!transactionId,
    staleTime: 30000,
  });

  return {
    transaction: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for transaction summary statistics
 */
export function useTransactionSummary(startDate: string, endDate: string) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['transaction-summary', organization?.id, startDate, endDate],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return transactionApi.getTransactionSummary(organization.id, startDate, endDate);
    },
    enabled: !!organization?.id && !!startDate && !!endDate,
    staleTime: 60000, // 1 minute
  });

  return {
    summary: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for cash flow chart data
 */
export function useCashFlowData(months: number = 6) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['cash-flow-data', organization?.id, months],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return transactionApi.getCashFlowData(organization.id, months);
    },
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes
  });

  return {
    data: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for recent transactions
 */
export function useRecentTransactions(limit: number = 10) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['recent-transactions', organization?.id, limit],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return transactionApi.getRecentTransactions(organization.id, limit);
    },
    enabled: !!organization?.id,
    staleTime: 30000,
  });

  return {
    transactions: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
