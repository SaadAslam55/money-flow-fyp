// src/hooks/useInvoices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as invoiceApi from '@/services/api/invoiceApi';
import { handleError } from '@/lib/errorHandler';
import type { InvoiceFormData, PaymentRecord } from '@/types/invoice.types';
import type { InvoiceFilters } from '@/types/database.types';

export function useInvoices(filters?: InvoiceFilters, page: number = 1) {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch invoices
  const query = useQuery({
    queryKey: ['invoices', organization?.id, filters, page],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return invoiceApi.getInvoices(organization.id, filters, page);
    },
    enabled: !!organization?.id,
    staleTime: 30000, // 30 seconds
  });

  // Create invoice
  const createMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      if (!organization?.id) throw new Error('Organization ID is required');
      if (!user?.id) throw new Error('User ID is required');
      const result = await invoiceApi.createInvoice(data, organization.id, user.id);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useInvoices.createInvoice');
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });

  // Update invoice
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InvoiceFormData> }) => {
      const result = await invoiceApi.updateInvoice(id, data);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useInvoices.updateInvoice');
      toast.error(`Failed to update invoice: ${error.message}`);
    },
  });

  // Delete invoice
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await invoiceApi.deleteInvoice(id);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useInvoices.deleteInvoice');
      toast.error(`Failed to delete invoice: ${error.message}`);
    },
  });

  // Update status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const result = await invoiceApi.updateInvoiceStatus(id, status);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice status updated');
    },
    onError: (error: Error) => {
      handleError(error, 'useInvoices.updateStatus');
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  // Record payment
  const recordPaymentMutation = useMutation({
    mutationFn: async (payment: PaymentRecord) => {
      const result = await invoiceApi.recordPayment(payment);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useInvoices.recordPayment');
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });

  // Send invoice
  const sendMutation = useMutation({
    mutationFn: async ({ id, email, message }: { id: string; email?: string; message?: string }) => {
      const result = await invoiceApi.sendInvoice(id, email, message);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice sent successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useInvoices.sendInvoice');
      toast.error(`Failed to send invoice: ${error.message}`);
    },
  });

  // Duplicate invoice
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User ID is required');
      const result = await invoiceApi.duplicateInvoice(id, user.id);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice duplicated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useInvoices.duplicateInvoice');
      toast.error(`Failed to duplicate invoice: ${error.message}`);
    },
  });

  // Download PDF
  const downloadPDFMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await invoiceApi.downloadInvoicePDF(id);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      toast.success('PDF downloaded successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useInvoices.downloadPDF');
      toast.error(`Failed to download PDF: ${error.message}`);
    },
  });

  return {
    invoices: query.data?.data ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    createInvoice: createMutation.mutateAsync,
    updateInvoice: updateMutation.mutateAsync,
    deleteInvoice: deleteMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    recordPayment: recordPaymentMutation.mutateAsync,
    sendInvoice: sendMutation.mutateAsync,
    duplicateInvoice: duplicateMutation.mutateAsync,
    downloadInvoicePDF: downloadPDFMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useInvoice(invoiceId: string) {
  const query = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceApi.getInvoice(invoiceId),
    enabled: !!invoiceId,
    staleTime: 30000,
  });

  return {
    invoice: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
