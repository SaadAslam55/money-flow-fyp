/**
 * Product Hooks
 * React Query hooks for product/inventory operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRouter } from '@/lib/api/router';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from 'sonner';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types';

// ============================================
// Types
// ============================================

interface ProductFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
  lowStock?: boolean;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch paginated list of products
 */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: async () => {
      const response = await apiRouter.get<Product[]>('/products', {
        page: filters.page || 1,
        limit: filters.limit || 20,
        status: filters.status,
        category: filters.category,
        search: filters.search,
        low_stock: filters.lowStock,
        order_by: filters.orderBy || 'name',
        order: filters.order || 'asc',
      });
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch single product by ID
 */
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id || ''),
    queryFn: async () => {
      const response = await apiRouter.get<Product>(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Fetch low stock products
 */
export function useLowStockProducts() {
  return useQuery({
    queryKey: queryKeys.products.lowStock(),
    queryFn: async () => {
      const response = await apiRouter.get<Product[]>('/products/low-stock');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch product categories
 */
export function useProductCategories() {
  return useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: async () => {
      const response = await apiRouter.get<string[]>('/products/categories');
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Search products
 */
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.products.search(query),
    queryFn: async () => {
      const response = await apiRouter.get<Product[]>('/products', {
        search: query,
        limit: 10,
      });
      return response.data;
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 30,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Create new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      const response = await apiRouter.post<Product>('/products', data);
      return response.data;
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.setQueryData(queryKeys.products.detail(newProduct.id), newProduct);
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
}

/**
 * Update existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductDto }) => {
      const response = await apiRouter.put<Product>(`/products/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.detail(id) });

      const previousProduct = queryClient.getQueryData<Product>(queryKeys.products.detail(id));

      if (previousProduct) {
        queryClient.setQueryData(queryKeys.products.detail(id), {
          ...previousProduct,
          ...data,
        });
      }

      return { previousProduct };
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(queryKeys.products.detail(id), context.previousProduct);
      }
      toast.error(error.message || 'Failed to update product');
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
    },
  });
}

/**
 * Delete product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiRouter.delete(`/products/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast.success('Product deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
}

/**
 * Update product stock
 */
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      quantity,
      type,
      notes,
    }: {
      id: string;
      quantity: number;
      type: 'add' | 'subtract' | 'set';
      notes?: string;
    }) => {
      const response = await apiRouter.post<Product>(`/products/${id}/stock`, {
        quantity,
        type,
        notes,
      });
      return response.data;
    },
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.products.detail(product.id), product);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lowStock() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      toast.success('Stock updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update stock');
    },
  });
}

/**
 * Bulk update product prices
 */
export function useBulkUpdatePrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; unit_price: number }>) => {
      const response = await apiRouter.post<{ updated: number }>('/products/bulk-update-prices', {
        updates,
      });
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success(`${result.updated} products updated`);
    },
  });
}

export default {
  useProducts,
  useProduct,
  useLowStockProducts,
  useProductCategories,
  useProductSearch,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateStock,
  useBulkUpdatePrices,
};
