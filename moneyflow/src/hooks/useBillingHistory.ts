// src/hooks/useBillingHistory.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import * as invoiceService from '@/services/payments/invoices';
import { handleError } from '@/lib/errorHandler';
import type { BillingInvoice } from '@/types/subscription.types';

/**
 * Hook for fetching billing history (invoices)
 */
export function useBillingHistory() {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['billing-history', organization?.id],
    queryFn: async () => {
      if (!organization?.id) {
        throw new Error('Organization not found');
      }

      const { data, error } = await invoiceService.getBillingHistory(organization.id);

      if (error) {
        throw error;
      }

      return data ?? [];
    },
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    invoices: (query.data ?? []),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching a single invoice by ID
 */
export function useInvoice(invoiceId: string | null) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['invoice', invoiceId, organization?.id],
    queryFn: async () => {
      if (!invoiceId || !organization?.id) {
        throw new Error('Invoice ID or organization not found');
      }

      const { data, error } = await invoiceService.getInvoice(invoiceId, organization.id);

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!invoiceId && !!organization?.id,
    staleTime: 300000, // 5 minutes
  });

  return {
    invoice: query.data as BillingInvoice | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

