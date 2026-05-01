/**
 * Customer Hooks
 * React Query hooks for customer operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRouter } from '@/lib/api/router';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types';

// ============================================
// Types
// ============================================

interface CustomerFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch paginated list of customers
 */
export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: async () => {
      const response = await apiRouter.get<Customer[]>('/customers', {
        page: filters.page || 1,
        limit: filters.limit || 20,
        status: filters.status,
        search: filters.search,
        order_by: filters.orderBy || 'name',
        order: filters.order || 'asc',
      });
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch single customer by ID
 */
export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id || ''),
    queryFn: async () => {
      const response = await apiRouter.get<Customer>(`/customers/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Search customers
 */
export function useCustomerSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.customers.search(query),
    queryFn: async () => {
      const response = await apiRouter.get<Customer[]>('/customers', {
        search: query,
        limit: 10,
      });
      return response.data;
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Fetch customer stats
 */
export function useCustomerStats() {
  return useQuery({
    queryKey: queryKeys.customers.stats(),
    queryFn: async () => {
      const response = await apiRouter.get<{
        total: number;
        active: number;
        inactive: number;
        withBalance: number;
        totalBalance: number;
      }>('/customers/stats');
      return response.data;
    },
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Create new customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerDto) => {
      const response = await apiRouter.post<Customer>('/customers', data);
      return response.data;
    },
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      queryClient.setQueryData(queryKeys.customers.detail(newCustomer.id), newCustomer);
      toast.success('Customer created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create customer');
    },
  });
}

/**
 * Update existing customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerDto }) => {
      const response = await apiRouter.put<Customer>(`/customers/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.customers.detail(id) });

      const previousCustomer = queryClient.getQueryData<Customer>(queryKeys.customers.detail(id));

      if (previousCustomer) {
        queryClient.setQueryData(queryKeys.customers.detail(id), {
          ...previousCustomer,
          ...data,
        });
      }

      return { previousCustomer };
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousCustomer) {
        queryClient.setQueryData(queryKeys.customers.detail(id), context.previousCustomer);
      }
      toast.error(error.message || 'Failed to update customer');
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
    },
    onSuccess: () => {
      toast.success('Customer updated successfully');
    },
  });
}

/**
 * Delete customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiRouter.delete(`/customers/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: queryKeys.customers.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
      toast.success('Customer deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete customer');
    },
  });
}

/**
 * Update customer balance
 */
export function useUpdateCustomerBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      amount,
      type,
    }: {
      id: string;
      amount: number;
      type: 'add' | 'subtract';
    }) => {
      const response = await apiRouter.post<Customer>(`/customers/${id}/balance`, {
        amount,
        type,
      });
      return response.data;
    },
    onSuccess: (customer) => {
      queryClient.setQueryData(queryKeys.customers.detail(customer.id), customer);
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
    },
  });
}

export default {
  useCustomers,
  useCustomer,
  useCustomerSearch,
  useCustomerStats,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useUpdateCustomerBalance,
};
