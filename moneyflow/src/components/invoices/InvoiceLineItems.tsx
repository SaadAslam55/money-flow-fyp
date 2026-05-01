// src/components/invoices/InvoiceLineItems.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import type { InvoiceItemWithProduct } from '@/types/invoice.types';
import { Package } from 'lucide-react';

interface InvoiceLineItemsProps {
  items: InvoiceItemWithProduct[];
  showProductInfo?: boolean;
  className?: string;
}

/**
 * InvoiceLineItems - Component for displaying invoice line items in a table
 * 
 * @example
 * <InvoiceLineItems items={invoice.items} showProductInfo />
 */
export function InvoiceLineItems({ 
  items, 
  showProductInfo = true,
  className 
}: InvoiceLineItemsProps) {
  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <EmptyState
            icon={Package}
            title="No items in this invoice"
            description="Add items to create a complete invoice"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Invoice Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Description</TableHead>
                {showProductInfo && <TableHead>Product</TableHead>}
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Tax Rate</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const subtotal = item.quantity * item.unit_price;
                const taxAmount = subtotal * (item.tax_rate / 100);
                const lineTotal = subtotal + taxAmount;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium">{item.description}</p>
                        {item.product?.sku && (
                          <p className="text-muted-foreground text-xs">
                            SKU: {item.product.sku}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    {showProductInfo && (
                      <TableCell>
                        {item.product ? (
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            {item.product.sku && (
                              <p className="text-muted-foreground text-xs">
                                {item.product.sku}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Manual Entry</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay amount={item.unit_price} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      {item.tax_rate > 0 ? `${item.tax_rate}%` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <CurrencyDisplay amount={lineTotal} size="sm" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

