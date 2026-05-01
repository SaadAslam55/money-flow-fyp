import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Edit, Trash2, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPercentage } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Product } from '@/types/database.types';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onAdjustStock?: (productId: string) => void;
}

export function ProductList({
  products,
  isLoading,
  onEdit,
  onDelete,
  onAdjustStock,
}: ProductListProps) {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Calculate profit margin
  const getProfitMargin = (product: Product) => {
    if (!product.cost_price || product.cost_price === 0) return null;
    return ((product.unit_price - product.cost_price) / product.unit_price) * 100;
  };

  // Check if stock is low
  const isLowStock = (product: Product) => {
    return product.track_inventory && product.current_stock <= product.minimum_stock;
  };

  if (isLoading) {
    return <Loader size="lg" message="Loading products..." />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="Create your first product to get started"
        action={{
          label: 'Add Product',
          onClick: () => navigate('/products/new'),
        }}
      />
    );
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await onDelete(deleteConfirm);
      setDeleteConfirm(null);
    } catch (error) {

      logger.error('Failed to delete product:', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Profit Margin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const profitMargin = getProfitMargin(product);
              const lowStock = isLowStock(product);

              return (
                <TableRow
                  key={product.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full rounded-md object-cover"
                          />
                        ) : (
                          <Package className="text-muted-foreground h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.sku && (
                          <div className="text-muted-foreground text-sm">SKU: {product.sku}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="outline">{product.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <CurrencyDisplay amount={product.unit_price} size="sm" />
                      {product.cost_price && (
                        <div className="text-muted-foreground text-sm mt-1">
                          Cost: <CurrencyDisplay amount={product.cost_price} size="sm" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.is_service ? (
                      <Badge variant="secondary">Service</Badge>
                    ) : product.track_inventory ? (
                      <div>
                        <div className={`font-medium ${lowStock ? 'text-orange-600' : ''}`}>
                          {product.current_stock} units
                        </div>
                        {lowStock && (
                          <div className="flex items-center gap-1 text-sm text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            Low stock
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not tracked</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {profitMargin !== null ? (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className={profitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPercentage(profitMargin)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
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
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/products/${product.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(product.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {product.track_inventory && onAdjustStock && (
                          <DropdownMenuItem onClick={() => onAdjustStock(product.id)}>
                            <Package className="mr-2 h-4 w-4" />
                            Adjust Stock
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirm(product.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {products.map((product) => {
          const profitMargin = getProfitMargin(product);
          const lowStock = isLowStock(product);

          return (
            <div
              key={product.id}
              className="hover:bg-muted/50 cursor-pointer space-y-3 rounded-lg border p-4"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <Package className="text-muted-foreground h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    {product.sku && (
                      <div className="text-muted-foreground text-sm">SKU: {product.sku}</div>
                    )}
                    {product.category && (
                      <Badge variant="outline" className="mt-1">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {product.track_inventory && onAdjustStock && (
                      <DropdownMenuItem onClick={() => onAdjustStock(product.id)}>
                        <Package className="mr-2 h-4 w-4" />
                        Adjust Stock
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setDeleteConfirm(product.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t pt-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Price</div>
                  <CurrencyDisplay amount={product.unit_price} size="sm" />
                </div>
                <div>
                  <div className="text-muted-foreground">Stock</div>
                  {product.is_service ? (
                    <Badge variant="secondary" className="mt-1">
                      Service
                    </Badge>
                  ) : product.track_inventory ? (
                    <div className={`font-medium ${lowStock ? 'text-orange-600' : ''}`}>
                      {product.current_stock} units
                      {lowStock && (
                        <div className="flex items-center gap-1 text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          Low
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not tracked</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-2">
                {profitMargin !== null && (
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className={profitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatPercentage(profitMargin)} margin
                    </span>
                  </div>
                )}
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
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
