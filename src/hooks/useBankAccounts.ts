import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as bankAccountApi from '@/services/api/bankAccountApi';
import { handleError } from '@/lib/errorHandler';
import type { BankAccountFormData, BankReconciliationFormData } from '@/schemas/transactionSchemas';

/**
 * Hook for managing bank accounts
 */
export function useBankAccounts() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['bank-accounts', organization?.id],
    queryFn: () => bankAccountApi.getBankAccounts(organization!.id),
    enabled: !!organization?.id,
    staleTime: 60000, // 1 minute
  });

  const createMutation = useMutation({
    mutationFn: (data: BankAccountFormData) =>
      bankAccountApi.createBankAccount(data as any, organization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Bank account created successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useBankAccounts.createBankAccount');
      toast.error(`Failed to create bank account: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BankAccountFormData> }) =>
      bankAccountApi.updateBankAccount(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Bank account updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useBankAccounts.updateBankAccount');
      toast.error(`Failed to update bank account: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bankAccountApi.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Bank account deleted successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useBankAccounts.deleteBankAccount');
      toast.error(`Failed to delete bank account: ${error.message}`);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => bankAccountApi.deactivateBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Bank account deactivated');
    },
    onError: (error: Error) => {
      handleError(error, 'useBankAccounts.deactivateBankAccount');
      toast.error(`Failed to deactivate account: ${error.message}`);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => bankAccountApi.reactivateBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Bank account reactivated');
    },
    onError: (error: Error) => {
      handleError(error, 'useBankAccounts.reactivateBankAccount');
      toast.error(`Failed to reactivate account: ${error.message}`);
    },
  });

  return {
    bankAccounts: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createBankAccount: createMutation.mutateAsync,
    updateBankAccount: updateMutation.mutateAsync,
    deleteBankAccount: deleteMutation.mutateAsync,
    deactivateBankAccount: deactivateMutation.mutateAsync,
    reactivateBankAccount: reactivateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for fetching single bank account with details
 */
export function useBankAccount(bankAccountId: string | null) {
  const query = useQuery({
    queryKey: ['bank-account', bankAccountId],
    queryFn: () => bankAccountApi.getBankAccount(bankAccountId!),
    enabled: !!bankAccountId,
    staleTime: 30000,
  });

  return {
    bankAccount: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for active bank accounts only
 */
export function useActiveBankAccounts() {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['active-bank-accounts', organization?.id],
    queryFn: () => bankAccountApi.getActiveBankAccounts(organization!.id),
    enabled: !!organization?.id,
    staleTime: 60000,
  });

  return {
    bankAccounts: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook for bank reconciliation
 */
export function useBankReconciliation() {
  const queryClient = useQueryClient();

  const reconcileMutation = useMutation({
    mutationFn: ({
      bankAccountId,
      data,
    }: {
      bankAccountId: string;
      data: BankReconciliationFormData;
    }) =>
      bankAccountApi.reconcileBankAccount(
        bankAccountId,
        data.statement_balance,
        data.statement_date,
        data.notes || undefined
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      if (result.data?.was_adjusted) {
        toast.success('Bank account reconciled with adjustment');
      } else {
        toast.success('Bank account reconciled successfully');
      }
    },
    onError: (error: Error) => {
      handleError(error, 'useBankAccounts.reconcileAccount');
      toast.error(`Reconciliation failed: ${error.message}`);
    },
  });

  return {
    reconcileAccount: reconcileMutation.mutateAsync,
    isReconciling: reconcileMutation.isPending,
  };
}

/**
 * Hook for account balance history
 */
export function useAccountBalanceHistory(
  bankAccountId: string | null,
  startDate: string,
  endDate: string
) {
  const query = useQuery({
    queryKey: ['account-balance-history', bankAccountId, startDate, endDate],
    queryFn: () => bankAccountApi.getAccountBalanceHistory(bankAccountId!, startDate, endDate),
    enabled: !!bankAccountId && !!startDate && !!endDate,
    staleTime: 60000,
  });

  return {
    history: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for total balance across all accounts
 */
export function useTotalBalance() {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['total-balance', organization?.id],
    queryFn: () => bankAccountApi.getTotalBalance(organization!.id),
    enabled: !!organization?.id,
    staleTime: 60000,
  });

  return {
    totals: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
