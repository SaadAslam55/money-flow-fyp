// src/pages/products/ProductsPage.tsx
/**
 * Products Page
 * Main page for managing products with list, filters, import/export, and inventory management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTemplate } from '@/components/common/PageTemplate';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ProductList } from '@/components/products/ProductList';
import { ProductFilter } from '@/components/products/ProductFilter';
import { ProductImport } from '@/components/products/ProductImport';
import { LowStockAlert } from '@/components/products/LowStockAlert';
import { useProducts, useLowStockProducts } from '@/hooks/useProducts';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { toast } from 'sonner';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    lowStock: false,
    isActive: true,
    sortBy: 'name' as 'name' | 'price' | 'stock',
    sortOrder: 'asc' as 'asc' | 'desc',
  });
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { products, isLoading, deleteProduct, exportProducts, isExporting } = useProducts(filters);
  const { products: lowStockProducts } = useLowStockProducts();

  const canCreate = hasPermission('products:create');
  const canImport = hasPermission('products:import');
  const canExport = hasPermission('products:export');
  const canDelete = hasPermission('products:delete');

  // Track page view
  useEffect(() => {
    trackPageView('/products', 'Products');
  }, []);

  const handleEdit = (productId: string) => {
    trackUserAction('edit_product_clicked', 'products', productId);
    navigate(`/products/${productId}/edit`);
  };

  const handleDelete = (productId: string) => {
    trackUserAction('delete_product_clicked', 'products', productId);
    setProductToDelete(productId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete);
      trackUserAction('delete_product_success', 'products', productToDelete);
      toast.success('Product deleted successfully');
      setShowDeleteDialog(false);
      setProductToDelete(null);
    } catch (error: unknown) {
      trackUserAction('delete_product_failed', 'products', productToDelete);
      const message = error instanceof Error ? error.message : 'Failed to delete product';
      toast.error(message);
    }
  };

  const handleAdjustStock = (productId: string) => {
    trackUserAction('adjust_stock_clicked', 'products', productId);
    navigate(`/products/${productId}`);
  };

  const handleExport = async () => {
    trackUserAction('export_products_clicked', 'products');
    try {
      await exportProducts();
      toast.success('Products exported successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to export products';
      toast.error(message);
    }
  };

  const handleImport = () => {
    trackUserAction('import_products_clicked', 'products');
    setIsImportDialogOpen(true);
  };

  const handleCreate = () => {
    trackUserAction('create_product_clicked', 'products', 'new_product_button');
    navigate('/products/new');
  };

  const actions = (
    <div className="flex gap-2">
      {canImport && (
        <Button variant="outline" onClick={handleImport}>
          <Download className="mr-2 h-4 w-4" />
          Import
        </Button>
      )}
      {canExport && (
        <Button variant="outline" onClick={handleExport} disabled={isExporting}>
          <Upload className="mr-2 h-4 w-4" />
          Export
        </Button>
      )}
      {canCreate && (
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      )}
    </div>
  );

  return (
    <>
      <PageTemplate
        title="Products"
        description="Manage your product catalog and inventory"
        keywords="products, inventory, catalog, stock management"
        actions={actions}
      >
        <div className="space-y-6">
          {/* Low Stock Alert */}
          {lowStockProducts && lowStockProducts.length > 0 && (
            <LowStockAlert products={lowStockProducts} maxItems={3} />
          )}

          {/* Filters */}
          <ProductFilter filters={filters} onFiltersChange={setFilters} />

          {/* Product List */}
          <ProductList
            products={products}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdjustStock={hasPermission('products:update') ? handleAdjustStock : undefined}
          />
        </div>
      </PageTemplate>

      {/* Import Dialog */}
      {canImport && (
        <ProductImport open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
      )}

      {/* Delete Confirmation Dialog */}
      {canDelete && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone and will remove all associated data."
          confirmText="Delete"
          confirmVariant="destructive"
        />
      )}
    </>
  );
}
