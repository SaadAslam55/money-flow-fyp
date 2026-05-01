// src/hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as customerApi from '@/services/api/customerApi';
import { handleError } from '@/lib/errorHandler';
import type { CustomerFormData } from '@/schemas/customerSchemas';

export function useCustomers(filters?: { search?: string; status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }, page: number = 1) {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customers', organization?.id, filters, page],
    queryFn: () => customerApi.getCustomers(organization!.id, filters, page),
    enabled: !!organization?.id,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) =>
      customerApi.createCustomer(data as any, organization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Customer created successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useCustomers.createCustomer');
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerFormData> }) =>
      customerApi.updateCustomer(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useCustomers.updateCustomer');
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useCustomers.deleteCustomer');
      toast.error(`Failed to delete customer: ${error.message}`);
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => customerApi.importCustomersFromCSV(file, organization!.id),
    onSuccess: (result: { count: number; skipped: number; error: Error | null }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(`Imported ${result.count} customers${result.skipped ? ` (${result.skipped} skipped)` : ''}`);
    },
    onError: (error: Error) => {
      handleError(error, 'useCustomers.importCustomers');
      toast.error(`Failed to import customers: ${error.message}`);
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => customerApi.exportCustomersToCSV(organization!.id),
    onSuccess: (result: { data: string | null; error: Error | null }) => {
      if (result.data) {
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `customers-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Customers exported successfully');
      }
    },
    onError: (error: Error) => {
      handleError(error, 'useCustomers.exportCustomers');
      toast.error(`Failed to export customers: ${error.message}`);
    },
  });

  return {
    customers: query.data?.data ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    createCustomer: createMutation.mutateAsync,
    updateCustomer: updateMutation.mutateAsync,
    deleteCustomer: deleteMutation.mutateAsync,
    importCustomers: importMutation.mutateAsync,
    exportCustomers: exportMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isImporting: importMutation.isPending,
    isExporting: exportMutation.isPending,
  };
}

export function useCustomer(customerId: string) {
  const query = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerApi.getCustomer(customerId),
    enabled: !!customerId,
    staleTime: 30000,
  });

  return {
    customer: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}