/**
 * Invoice Hooks
 * React Query hooks for invoice operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRouter } from '@/lib/api/router';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto } from '@/types';

// ============================================
// Types
// ============================================

interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  draft: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

interface RecordPaymentData {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch paginated list of invoices
 */
export function useInvoices(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: queryKeys.invoices.list(filters),
    queryFn: async () => {
      const response = await apiRouter.get<Invoice[]>('/invoices', {
        page: filters.page || 1,
        limit: filters.limit || 20,
        status: filters.status,
        payment_status: filters.paymentStatus,
        customer_id: filters.customerId,
        start_date: filters.startDate,
        end_date: filters.endDate,
        search: filters.search,
        order_by: filters.orderBy || 'created_at',
        order: filters.order || 'desc',
      });
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch single invoice by ID
 */
export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id || ''),
    queryFn: async () => {
      const response = await apiRouter.get<Invoice>(`/invoices/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Fetch overdue invoices
 */
export function useOverdueInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices.overdue(),
    queryFn: async () => {
      const response = await apiRouter.get<Invoice[]>('/invoices/overdue');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch invoice stats for period
 */
export function useInvoiceStats(period: string = 'month') {
  return useQuery({
    queryKey: queryKeys.invoices.stats(period),
    queryFn: async () => {
      const response = await apiRouter.get<InvoiceStats>('/invoices/stats', { period });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch invoices for a specific customer
 */
export function useCustomerInvoices(customerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoices.byCustomer(customerId || ''),
    queryFn: async () => {
      const response = await apiRouter.get<Invoice[]>('/invoices', {
        customer_id: customerId,
      });
      return response.data;
    },
    enabled: !!customerId,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Create new invoice
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvoiceDto) => {
      const response = await apiRouter.post<Invoice>('/invoices', data);
      return response.data;
    },
    onSuccess: (newInvoice) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });

      // Add to cache
      queryClient.setQueryData(queryKeys.invoices.detail(newInvoice.id), newInvoice);

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });

      toast.success('Invoice created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice');
    },
  });
}

/**
 * Update existing invoice
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInvoiceDto }) => {
      const response = await apiRouter.put<Invoice>(`/invoices/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.invoices.detail(id) });

      // Snapshot previous value
      const previousInvoice = queryClient.getQueryData<Invoice>(queryKeys.invoices.detail(id));

      // Optimistically update
      if (previousInvoice) {
        queryClient.setQueryData(queryKeys.invoices.detail(id), {
          ...previousInvoice,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousInvoice };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousInvoice) {
        queryClient.setQueryData(queryKeys.invoices.detail(id), context.previousInvoice);
      }
      toast.error(error.message || 'Failed to update invoice');
    },
    onSettled: (_, __, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
    },
    onSuccess: () => {
      toast.success('Invoice updated successfully');
    },
  });
}

/**
 * Delete invoice (soft delete)
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiRouter.delete(`/invoices/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.invoices.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });

      toast.success('Invoice deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete invoice');
    },
  });
}

/**
 * Send invoice to customer
 */
export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRouter.post<Invoice>(`/invoices/${id}/send`);
      return response.data;
    },
    onSuccess: (invoice) => {
      queryClient.setQueryData(queryKeys.invoices.detail(invoice.id), invoice);
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      toast.success('Invoice sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invoice');
    },
  });
}

/**
 * Record payment for invoice
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      amount,
      paymentMethod,
      reference,
      notes,
    }: RecordPaymentData) => {
      const response = await apiRouter.post<Invoice>(`/invoices/${invoiceId}/record-payment`, {
        amount,
        payment_method: paymentMethod,
        reference,
        notes,
      });
      return response.data;
    },
    onSuccess: (invoice) => {
      queryClient.setQueryData(queryKeys.invoices.detail(invoice.id), invoice);
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.stats('month') });
      toast.success('Payment recorded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
}

/**
 * Mark invoice as paid
 */
export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRouter.post<Invoice>(`/invoices/${id}/mark-paid`);
      return response.data;
    },
    onSuccess: (invoice) => {
      queryClient.setQueryData(queryKeys.invoices.detail(invoice.id), invoice);
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      toast.success('Invoice marked as paid');
    },
  });
}

/**
 * Duplicate invoice
 */
export function useDuplicateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRouter.post<Invoice>(`/invoices/${id}/duplicate`);
      return response.data;
    },
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      toast.success('Invoice duplicated');
      return newInvoice;
    },
  });
}

export default {
  useInvoices,
  useInvoice,
  useOverdueInvoices,
  useInvoiceStats,
  useCustomerInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useSendInvoice,
  useRecordPayment,
  useMarkInvoicePaid,
  useDuplicateInvoice,
};
