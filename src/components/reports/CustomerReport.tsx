// FILE: src/components/reports/CustomerReport.tsx

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
import { useCustomerReport } from '@/hooks/useReports';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { AlertCircle } from 'lucide-react';
import { ReportExport } from './ReportExport';
import type { DateRange, CustomerReportData } from '@/types/report.types';

interface CustomerReportProps {
  dateRange: DateRange;
}

export function CustomerReport({ dateRange }: CustomerReportProps) {
  const { data, isLoading, error } = useCustomerReport(dateRange);

  const chartData = useMemo(() => {
    if (!data?.data) return [];
    const report = data.data;
    return report.acquisition_trend.map((trend) => ({
      date: formatDate(trend.date, 'short'),
      customers: trend.new_customers,
    }));
  }, [data]);

  if (isLoading) {
    return <Loader size="lg" message="Loading customer report..." fullScreen={false} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load report"
        description={error?.message ?? 'Failed to load customer report'}
      />
    );
  }

  if (!data?.data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No data available"
        description="No customer data available for the selected period"
      />
    );
  }

  const report = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Customer Report</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
          </p>
        </div>
        <ReportExport reportType="customer" reportData={report} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">{report.summary.total_customers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active Customers</p>
            <p className="text-2xl font-bold">{report.summary.active_customers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">New Customers</p>
            <p className="text-2xl font-bold text-green-600">{report.summary.new_customers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <CurrencyDisplay amount={report.summary.total_revenue} size="xl" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Avg Revenue/Customer</p>
            <CurrencyDisplay amount={report.summary.average_revenue_per_customer} size="xl" />
          </CardContent>
        </Card>
      </div>

      {/* Customer Acquisition Trend */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="customers" fill="#6366F1" name="New Customers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Customers */}
      {report.top_customers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.top_customers.map((customer, index) => (
                <div
                  key={customer.customer_id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{customer.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{customer.invoice_count} invoices</span>
                        <span>
                          Outstanding: <CurrencyDisplay amount={customer.outstanding_balance} variant="negative" size="sm" />
                        </span>
                        <span>Last: {formatDate(customer.last_purchase_date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={customer.total_purchases} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Segments */}
      {report.customer_segments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.customer_segments.map((segment) => (
                <div
                  key={segment.segment}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{segment.segment}</p>
                    <p className="text-sm text-muted-foreground">{segment.count} customers</p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={segment.revenue} size="sm" />
                    <p className="text-sm text-muted-foreground">
                      {segment.percentage.toFixed(1)}% of total
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

