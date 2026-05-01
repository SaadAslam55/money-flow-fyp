// FILE: src/components/reports/ProductReport.tsx

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductReport } from '@/hooks/useReports';
import { formatPercentage, formatDate, formatCurrency } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { AlertCircle } from 'lucide-react';
import { ReportExport } from './ReportExport';
import type { DateRange, ProductReportData } from '@/types/report.types';

interface ProductReportProps {
  dateRange: DateRange;
}

export function ProductReport({ dateRange }: ProductReportProps) {
  const { data, isLoading, error } = useProductReport(dateRange);

  const topProductsChart = useMemo(() => {
    if (!data?.data) return [];
    const report = data.data;
    return report.top_products.slice(0, 10).map((product) => ({
      name: product.name.length > 15 ? `${product.name.substring(0, 15)  }...` : product.name,
      revenue: product.revenue,
      quantity: product.quantity_sold,
    }));
  }, [data]);

  const categoryChart = useMemo(() => {
    if (!data?.data) return [];
    const report = data.data;
    return report.category_performance.map((cat) => ({
      name: cat.category ?? 'Uncategorized',
      revenue: cat.revenue,
      quantity: cat.quantity_sold,
    }));
  }, [data]);

  if (isLoading) {
    return <Loader size="lg" message="Loading product report..." fullScreen={false} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load report"
        description={error?.message ?? 'Failed to load product report'}
      />
    );
  }

  if (!data?.data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No data available"
        description="No product data available for the selected period"
      />
    );
  }

  const report = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Product Report</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
          </p>
        </div>
        <ReportExport reportType="product" reportData={report} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold">{report.summary.total_products}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Products Sold</p>
            <p className="text-2xl font-bold">{report.summary.products_sold}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Quantity Sold</p>
            <p className="text-2xl font-bold">{report.summary.total_quantity_sold}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <CurrencyDisplay amount={report.summary.total_revenue} size="xl" />
          </CardContent>
        </Card>
      </div>

      {/* Top Products Chart */}
      {topProductsChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#6366F1" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Products Table */}
      {report.top_products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.top_products.map((product, index) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>Qty: {product.quantity_sold}</span>
                        <span>Margin: {formatPercentage(product.profit_margin)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={product.revenue} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Performance */}
      {categoryChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.category_performance.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{category.category ?? 'Uncategorized'}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.products_count} products • {category.quantity_sold} units sold
                    </p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={category.revenue} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Valuation */}
      {report.stock_valuation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stock Valuation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.stock_valuation.slice(0, 10).map((stock) => (
                <div
                  key={stock.product_id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{stock.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {stock.current_stock} units
                    </p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={stock.value} size="sm" />
                    <p className="text-sm text-muted-foreground">
                      @ <CurrencyDisplay amount={stock.cost_price} size="sm" />/unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Performing Products */}
      {report.low_performing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Low Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.low_performing.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {product.quantity_sold} • Revenue: <CurrencyDisplay amount={product.revenue} size="sm" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

