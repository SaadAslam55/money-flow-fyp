import { useState, useEffect } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { handleError } from '@/lib/errorHandler';
import { useAuth } from '@/hooks/useAuth';
import { getSalesReport } from '@/services/api/reportsApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SalesReportProps {
  startDate: string;
  endDate: string;
}

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

export function SalesReport({ startDate, endDate }: SalesReportProps) {
  const { organization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [startDate, endDate, organization?.id]);

  const loadData = async () => {
    if (!organization?.id) return;

    setLoading(true);
    setError(null);
    try {
      const { data: result, error: apiError } = await getSalesReport(
        organization.id,
        startDate,
        endDate
      );

      if (apiError) throw apiError;
      if (!result) return;

      // Format data from API response
      const monthlyChart = result.sales_trend.map((item) => ({
        month: new Date(item.date).toLocaleString('default', { month: 'short', day: 'numeric' }),
        sales: item.amount,
      }));

      const topCustomers = result.sales_by_customer.map((c) => ({
        name: c.customer_name,
        total: c.total,
      }));

      const topProducts = result.sales_by_product.map((p) => ({
        name: p.product_name,
        total: p.revenue,
      }));

      setData({
        totalSales: result.total_sales,
        totalInvoices: result.total_invoices,
        averageOrderValue: result.average_invoice_value,
        monthlyChart,
        topCustomers,
        topProducts,
        categoryChart: [],
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load report');
      handleError(err, 'SalesReport');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader size="lg" message="Loading sales report..." fullScreen={false} />;
  }

  if (!data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No data available"
        description="No sales data found for the selected period"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <CurrencyDisplay amount={data.totalSales} size="xl" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold">{data.totalInvoices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Average Order Value</p>
            <CurrencyDisplay amount={data.averageOrderValue} size="xl" />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="sales" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales by Category */}
      {data.categoryChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                >
                  {data.categoryChart.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topCustomers.map((customer: any, index: number) => (
              <div key={customer.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                    {index + 1}
                  </div>
                  <span>{customer.name}</span>
                </div>
                <CurrencyDisplay amount={customer.total} size="sm" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topProducts.map((product: any, index: number) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                    {index + 1}
                  </div>
                  <span>{product.name}</span>
                </div>
                <CurrencyDisplay amount={product.total} size="sm" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
