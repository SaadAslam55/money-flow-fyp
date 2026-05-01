// src/components/products/LowStockAlert.tsx
import { AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types/database.types';

interface LowStockAlertProps {
  products: Product[];
  isLoading?: boolean;
  maxItems?: number;
  showViewAll?: boolean;
}

export function LowStockAlert({
  products,
  isLoading = false,
  maxItems = 5,
  showViewAll = true,
}: LowStockAlertProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading low stock products...</p>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Stock Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-300 bg-green-50">
            <Package className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">All Good!</AlertTitle>
            <AlertDescription className="text-green-700">
              All products have sufficient stock levels.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const displayProducts = products.slice(0, maxItems);
  const remainingCount = products.length - maxItems;

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alerts ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-orange-300 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Action Required</AlertTitle>
          <AlertDescription className="text-orange-700">
            {products.length} product{products.length !== 1 ? 's' : ''} {products.length === 1 ? 'is' : 'are'} running low on stock.
          </AlertDescription>
        </Alert>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Minimum Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts.map((product) => {
                const stockPercentage = product.minimum_stock > 0
                  ? (product.current_stock / product.minimum_stock) * 100
                  : 0;
                const isCritical = product.current_stock === 0;
                const isVeryLow = stockPercentage < 50;

                return (
                  <TableRow
                    key={product.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.sku && (
                          <p className="text-muted-foreground text-xs font-mono">{product.sku}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        isCritical
                          ? 'text-red-600'
                          : isVeryLow
                            ? 'text-orange-600'
                            : 'text-yellow-600'
                      }`}>
                        {product.current_stock}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">units</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{product.minimum_stock} units</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isCritical
                            ? 'destructive'
                            : isVeryLow
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {isCritical
                          ? 'Out of Stock'
                          : isVeryLow
                            ? 'Very Low'
                            : 'Low Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${product.id}`);
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {showViewAll && products.length > maxItems && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/products?filter=lowStock')}
            >
              View All {products.length} Low Stock Products
              {remainingCount > 0 && ` (+${remainingCount} more)`}
            </Button>
          </div>
        )}

        {showViewAll && products.length <= maxItems && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
            >
              Manage Products
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

