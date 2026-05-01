// src/components/products/ProductDetail.tsx
import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  DollarSign,
  Box,
  AlertTriangle,
  Edit,
  Trash2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Calendar,
  Tag,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate, formatPercentage } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Product } from '@/types/database.types';

interface ProductDetailProps {
  product: Product | null;
  isLoading: boolean;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  onAdjustStock?: (productId: string) => void;
}

export function ProductDetail({
  product,
  isLoading,
  onEdit,
  onDelete,
  onAdjustStock,
}: ProductDetailProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return <Loader size="lg" message="Loading product details..." fullScreen={false} />;
  }

  if (!product) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Product not found"
        description="The product you're looking for doesn't exist or has been removed."
      />
    );
  }

  // Calculate derived values
  const priceWithTax = product.unit_price * (1 + product.tax_rate / 100);
  const profitMargin =
    product.cost_price && product.cost_price > 0
      ? ((product.unit_price - product.cost_price) / product.unit_price) * 100
      : null;
  const profitAmount = product.cost_price ? product.unit_price - product.cost_price : null;
  const isLowStock = product.track_inventory && product.current_stock <= product.minimum_stock;
  const inventoryValue = product.cost_price
    ? product.current_stock * product.cost_price
    : product.current_stock * product.unit_price;

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete(product.id);
      navigate('/products');
    } catch (error) {

      logger.error('Failed to delete product:', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-1 text-muted-foreground">
              {product.sku && <span className="font-mono">{product.sku}</span>}
              {product.sku && product.category && ' • '}
              {product.category && <span>{product.category}</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onAdjustStock && product.track_inventory && (
            <Button variant="outline" onClick={() => onAdjustStock(product.id)}>
              <Box className="mr-2 h-4 w-4" />
              Adjust Stock
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(product.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {isLowStock && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            Low stock alert! Current stock ({product.current_stock}) is at or below minimum level (
            {product.minimum_stock}).
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.image_url && (
              <div className="mb-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-48 w-full rounded-lg border object-cover"
                />
              </div>
            )}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1">{product.description ?? 'No description provided'}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <StatusBadge
                    status={product.is_service ? 'service' : 'product'}
                    type="custom"
                    customConfig={{
                      label: product.is_service ? 'Service' : 'Product',
                      color: 'blue',
                      bgColor: 'bg-blue-100 dark:bg-blue-900',
                      textColor: 'text-blue-700 dark:text-blue-300',
                      icon: 'Package',
                    }}
                    size="sm"
                    className="mt-1"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge
                    status={product.is_active ? 'active' : 'inactive'}
                    type="custom"
                    customConfig={{
                      label: product.is_active ? 'Active' : 'Inactive',
                      color: product.is_active ? 'green' : 'gray',
                      bgColor: product.is_active
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-gray-100 dark:bg-gray-800',
                      textColor: product.is_active
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300',
                      icon: product.is_active ? 'CheckCircle' : 'Circle',
                    }}
                    size="sm"
                    className="mt-1"
                  />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="mt-1 text-sm">{formatDate(product.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="mt-1 text-sm">{formatDate(product.updated_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing & Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pricing */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Selling Price</p>
                <CurrencyDisplay amount={product.unit_price} size="xl" className="mt-1" />
              </div>
              {product.cost_price && product.cost_price > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Price</p>
                    <CurrencyDisplay amount={product.cost_price} size="lg" className="mt-1" />
                  </div>
                  {profitAmount !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">Profit</p>
                      <CurrencyDisplay
                        amount={profitAmount}
                        variant="positive"
                        size="lg"
                        className="mt-1"
                      />
                    </div>
                  )}
                  {profitMargin !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <div className="mt-1 flex items-center gap-2">
                        {profitMargin >= 30 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : profitMargin >= 15 ? (
                          <BarChart3 className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <p
                          className={`text-lg font-medium ${
                            profitMargin >= 30
                              ? 'text-green-600'
                              : profitMargin >= 15
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {formatPercentage(profitMargin)}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Tax Rate</p>
                <p className="mt-1">{formatPercentage(product.tax_rate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price with Tax</p>
                <CurrencyDisplay amount={priceWithTax} size="xl" className="mt-1" />
              </div>
            </div>

            {/* Inventory */}
            {product.track_inventory && !product.is_service && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Box className="h-4 w-4" />
                      Current Stock
                    </p>
                    <p className="mt-1 text-2xl font-bold">{product.current_stock} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Minimum Stock Level</p>
                    <p className="mt-1">{product.minimum_stock} units</p>
                  </div>
                  {product.cost_price && (
                    <div>
                      <p className="text-sm text-muted-foreground">Inventory Value</p>
                      <CurrencyDisplay amount={inventoryValue} size="lg" className="mt-1" />
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Product"
          description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      )}
    </div>
  );
}
