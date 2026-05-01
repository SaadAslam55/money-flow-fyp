// src/components/dashboard/LowStockAlert.tsx

import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { STOCK_LEVELS } from '@/constants/status';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Loader } from '@/components/common/Loader';
import type { Product } from '@/types/database.types';

interface LowStockAlertProps {
  products?: Product[];
  loading?: boolean;
}

export function LowStockAlert({ products, loading }: LowStockAlertProps) {
  const navigate = useNavigate();

  const getStockStatus = (currentStock: number, minimumStock: number) => {
    if (currentStock === 0) {
      return {
        ...STOCK_LEVELS.out_of_stock,
        variant: 'destructive' as const,
      };
    }
    if (currentStock <= minimumStock) {
      return {
        ...STOCK_LEVELS.low_stock,
        variant: 'default' as const,
      };
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Loader size="md" message="Loading stock alerts..." />
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="All products are well stocked"
            description="No low stock alerts at this time"
          />
        </CardContent>
      </Card>
    );
  }

  const outOfStockCount = products.filter((p) => p.current_stock === 0).length;
  const lowStockCount = products.filter(
    (p) => p.current_stock > 0 && p.current_stock <= p.minimum_stock
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Low Stock Alerts</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/products')}
          className="h-8"
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {(outOfStockCount > 0 || lowStockCount > 0) && (
          <Alert variant={outOfStockCount > 0 ? 'destructive' : 'default'} className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {outOfStockCount > 0
                ? `${outOfStockCount} product${outOfStockCount > 1 ? 's' : ''} out of stock`
                : `${lowStockCount} product${lowStockCount > 1 ? 's' : ''} running low`}
            </AlertTitle>
            <AlertDescription>
              {outOfStockCount > 0
                ? 'Some products need immediate restocking'
                : 'Consider restocking these products soon'}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {products.slice(0, 5).map((product) => {
            const status = getStockStatus(product.current_stock, product.minimum_stock);

            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{product.name}</p>
                      {status && (
                        <StatusBadge
                          status={status.label.toLowerCase().replace(' ', '_')}
                          customConfig={{
                            label: status.label,
                            color: status.color,
                            bgColor: status.variant === 'destructive' 
                              ? 'bg-red-100 dark:bg-red-900' 
                              : 'bg-yellow-100 dark:bg-yellow-900',
                            textColor: status.variant === 'destructive'
                              ? 'text-red-700 dark:text-red-300'
                              : 'text-yellow-700 dark:text-yellow-300',
                            icon: status.icon,
                          }}
                          size="sm"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {product.sku && (
                        <>
                          <span>SKU: {product.sku}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        Stock: {product.current_stock} / Min: {product.minimum_stock}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="font-semibold whitespace-nowrap">
                    {product.current_stock === 0 ? (
                      <span className="text-red-600">Out of Stock</span>
                    ) : (
                      <span className="text-yellow-600">
                        {Math.round((product.current_stock / product.minimum_stock) * 100)}%
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {products.length > 5 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/products?filter=low_stock')}
            >
              View {products.length - 5} more products
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

