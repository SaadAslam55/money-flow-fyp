// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as productApi from '@/services/api/productApi';
import { handleError } from '@/lib/errorHandler';
import type { ProductFormData, StockAdjustmentFormData } from '@/schemas/productSchemas';

export function useProducts(filters?: { search?: string; category?: string; lowStock?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['products', organization?.id, filters],
    queryFn: () => productApi.getProducts(organization!.id, filters),
    enabled: !!organization?.id,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => productApi.createProduct(data as Parameters<typeof productApi.createProduct>[0], organization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useProducts.createProduct');
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      productApi.updateProduct(id, data as Parameters<typeof productApi.updateProduct>[1]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useProducts.updateProduct');
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useProducts.deleteProduct');
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: (data: StockAdjustmentFormData & { userId?: string }) =>
      productApi.adjustStock(
        data.product_id,
        data.adjustment,
        data.reason,
        data.notes,
        data.userId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success('Stock adjusted successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useProducts.adjustStock');
      toast.error(`Failed to adjust stock: ${error.message}`);
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => productApi.importProductsFromCSV(file, organization!.id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        `Imported ${result.count} products${result.skipped ? ` (${result.skipped} skipped)` : ''}`
      );
    },
    onError: (error: Error) => {
      handleError(error, 'useProducts.importProducts');
      toast.error(`Failed to import products: ${error.message}`);
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => productApi.exportProductsToCSV(organization!.id),
    onSuccess: (result) => {
      if (result.data) {
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Products exported successfully');
      }
    },
    onError: (error: Error) => {
      handleError(error, 'useProducts.exportProducts');
      toast.error(`Failed to export products: ${error.message}`);
    },
  });

  return {
    products: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    adjustStock: adjustStockMutation.mutateAsync,
    importProducts: importMutation.mutateAsync,
    exportProducts: exportMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAdjustingStock: adjustStockMutation.isPending,
    isImporting: importMutation.isPending,
    isExporting: exportMutation.isPending,
  };
}

export function useProduct(productId: string) {
  const query = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.getProduct(productId),
    enabled: !!productId,
    staleTime: 30000,
  });

  return {
    product: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useLowStockProducts() {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['low-stock-products', organization?.id],
    queryFn: () => productApi.getLowStockProducts(organization!.id),
    enabled: !!organization?.id,
    staleTime: 60000,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  return {
    products: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useProductCategories() {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['product-categories', organization?.id],
    queryFn: () => productApi.getProductCategories(organization!.id),
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes
  });

  return {
    categories: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
