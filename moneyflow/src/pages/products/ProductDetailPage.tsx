// src/pages/products/ProductDetailPage.tsx
/**
 * Product Detail Page
 * Page for viewing product details, managing inventory, and product actions
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductDetail } from '@/components/products/ProductDetail';
import { StockAdjustmentDialog } from '@/components/products/StockAdjustmentDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { FileX } from 'lucide-react';
import { toast } from 'sonner';
import type { StockAdjustmentFormData } from '@/schemas/productSchemas';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, error } = useProduct(id ?? '');
  const { deleteProduct, adjustStock } = useProducts();
  const { hasPermission } = usePermissions();
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const canEdit = hasPermission('products:update');
  const canDelete = hasPermission('products:delete');
  const canAdjustStock = hasPermission('products:update');

  // Track page view
  useEffect(() => {
    if (id) {
      trackPageView(`/products/${id}`, 'Product Detail');
    }
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate title="Product Details">
        <Loader message="Loading product details..." />
      </PageTemplate>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <PageTemplate
        title="Product Not Found"
        description="The product you're looking for doesn't exist or has been deleted"
      >
        <EmptyState
          icon={FileX}
          title="Product Not Found"
          description={
            error?.message ??
            "The product you're looking for doesn't exist or may have been deleted."
          }
          action={{
            label: 'Back to Products',
            onClick: () => navigate('/products'),
          }}
        />
      </PageTemplate>
    );
  }

  const handleEdit = (productId: string) => {
    trackUserAction('edit_product_clicked', 'products', productId);
    navigate(`/products/${productId}/edit`);
  };

  const handleDelete = (productId: string) => {
    trackUserAction('delete_product_clicked', 'products', productId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteProduct(id);
      trackUserAction('delete_product_success', 'products', id);
      toast.success('Product deleted successfully');
      navigate('/products');
    } catch (error) {
      trackUserAction('delete_product_failed', 'products', id);
      const message = error instanceof Error ? error.message : 'Failed to delete product';
      toast.error(message);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleAdjustStock = (productId: string) => {
    trackUserAction('adjust_stock_clicked', 'products', productId);
    setIsStockDialogOpen(true);
  };

  const handleStockAdjustment = async (data: StockAdjustmentFormData) => {
    try {
      await adjustStock(data);
      trackUserAction('adjust_stock_success', 'products', id ?? '');
      toast.success('Stock adjusted successfully');
      setIsStockDialogOpen(false);
    } catch (error) {
      trackUserAction('adjust_stock_failed', 'products', id ?? '');
      const message = error instanceof Error ? error.message : 'Failed to adjust stock';
      toast.error(message);
      throw error;
    }
  };

  return (
    <>
      <PageTemplate
        title={product.name}
        description="Product details and inventory information"
        keywords={`product, ${product.name}, inventory, stock`}
      >
        <ProductDetail
          product={product}
          isLoading={false}
          {...(canEdit && { onEdit: handleEdit })}
          {...(canDelete && { onDelete: handleDelete })}
          {...(canAdjustStock && { onAdjustStock: handleAdjustStock })}
        />
      </PageTemplate>

      {/* Stock Adjustment Dialog */}
      {canAdjustStock && (
        <StockAdjustmentDialog
          product={product}
          open={isStockDialogOpen}
          onOpenChange={setIsStockDialogOpen}
          onConfirm={handleStockAdjustment}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {canDelete && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Delete Product"
          description={`Are you sure you want to delete ${product.name}? This action cannot be undone and will remove all associated data.`}
          confirmText="Delete"
          confirmVariant="destructive"
        />
      )}
    </>
  );
}
