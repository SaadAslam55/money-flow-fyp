// src/pages/products/EditProductPage.tsx
/**
 * Edit Product Page
 * Page for editing an existing product
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductForm } from '@/components/products/ProductForm';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackFormSubmit } from '@/middleware/analyticsMiddleware';
import { FileX, Shield } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductFormData } from '@/schemas/productSchemas';

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, error } = useProduct(id ?? '');
  const { updateProduct, isUpdating } = useProducts();
  const { hasPermission } = usePermissions();

  // Track page view
  useEffect(() => {
    if (id) {
      trackPageView(`/products/${id}/edit`, 'Edit Product');
    }
  }, [id]);

  // Check permission
  if (!hasPermission('products:update')) {
    return (
      <PageTemplate
        title="Access Denied"
        description="You don't have permission to edit products"
      >
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="You need permission to edit products. Please contact your administrator."
        />
      </PageTemplate>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate title="Edit Product">
        <div className="max-w-4xl mx-auto">
          <Loader message="Loading product details..." />
        </div>
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
          description={error?.message ?? "The product you're trying to edit doesn't exist or may have been deleted."}
        />
      </PageTemplate>
    );
  }

  const handleSubmit = async (data: ProductFormData) => {
    if (!product?.id) return;
    try {
      await updateProduct({ id: product.id, data });
      trackFormSubmit('edit_product_form', true);
      toast.success('Product updated successfully');
      navigate(`/products/${product.id}`);
    } catch (error) {
      trackFormSubmit('edit_product_form', false);
      const message = error instanceof Error ? error.message : 'Failed to update product';
      toast.error(message);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <PageTemplate
      title="Edit Product"
      description={`Update information for ${product.name}`}
      keywords={`edit product, ${product.name}, update product`}
    >
      <div className="max-w-4xl mx-auto">
        <ProductForm
          initialData={product as Partial<ProductFormData>}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isUpdating ? 'Updating...' : 'Update Product'}
        />
      </div>
    </PageTemplate>
  );
}

