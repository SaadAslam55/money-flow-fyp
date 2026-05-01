// src/pages/products/CreateProductPage.tsx
/**
 * Create Product Page
 * Page for creating a new product or service
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@/components/common/PageTemplate';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductForm } from '@/components/products/ProductForm';
import { useProducts } from '@/hooks/useProducts';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackFormSubmit } from '@/middleware/analyticsMiddleware';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductFormData } from '@/schemas/productSchemas';

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { createProduct, isCreating } = useProducts();
  const { hasPermission } = usePermissions();

  // Track page view
  useEffect(() => {
    trackPageView('/products/new', 'Create Product');
  }, []);

  // Check permission
  if (!hasPermission('products:create')) {
    return (
      <PageTemplate
        title="Access Denied"
        description="You don't have permission to create products"
      >
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="You need permission to create products. Please contact your administrator."
        />
      </PageTemplate>
    );
  }

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await createProduct(data);
      trackFormSubmit('create_product_form', true);
      toast.success('Product created successfully');
      navigate('/products');
    } catch (error) {
      trackFormSubmit('create_product_form', false);
      const message = error instanceof Error ? error.message : 'Failed to create product';
      toast.error(message);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <PageTemplate
      title="Create Product"
      description="Add a new product or service to your catalog"
      keywords="create product, new product, add product, product form"
    >
      <div className="max-w-4xl mx-auto">
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isCreating ? 'Creating...' : 'Create Product'}
        />
      </div>
    </PageTemplate>
  );
}

