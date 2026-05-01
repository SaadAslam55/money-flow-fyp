// FILE: src/components/reports/ExpenseReport.tsx

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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseReport } from '@/hooks/useReports';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { AlertCircle } from 'lucide-react';
import { ReportExport } from './ReportExport';
import type { DateRange, ExpenseReportData } from '@/types/report.types';

interface ExpenseReportProps {
  dateRange: DateRange;
  filters?: Record<string, unknown>;
}

const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6'];

export function ExpenseReport({ dateRange, filters }: ExpenseReportProps) {
  const { data, isLoading, error } = useExpenseReport(dateRange, filters);

  const chartData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.by_period.map((period) => ({
      date: formatDate(period.date, 'short'),
      amount: period.amount,
      count: period.count,
    }));
  }, [data]);

  const categoryChartData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.by_category.slice(0, 8).map((cat) => ({
      name: cat.category_name,
      value: cat.amount,
      percentage: cat.percentage,
    }));
  }, [data]);

  if (isLoading) {
    return <Loader size="lg" message="Loading expense report..." fullScreen={false} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load report"
        description={error?.message ?? 'Failed to load expense report'}
      />
    );
  }

  if (!data?.data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No data available"
        description="No expense data available for the selected period"
      />
    );
  }

  const reportData = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Expense Report</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
          </p>
        </div>
        <ReportExport reportType="expenses" reportData={reportData} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(reportData.summary.total_expenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold">{reportData.summary.total_transactions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Average Expense</p>
            <CurrencyDisplay amount={reportData.summary.average_expense} size="xl" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-2xl font-bold">{reportData.summary.categories_count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses by Period Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Expenses by Category Pie Chart */}
      {categoryChartData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expenses by Payment Method */}
          {reportData.by_payment_method.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.by_payment_method.map((method) => (
                    <div key={method.payment_method} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span className="capitalize">{method.payment_method.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <CurrencyDisplay amount={method.amount} size="sm" />
                        <div className="text-sm text-muted-foreground">
                          {method.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top Expenses Table */}
      {reportData.top_expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.top_expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{formatDate(expense.date)}</span>
                      <span className="capitalize">{expense.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={expense.amount} variant="negative" size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses by Category Table */}
      {reportData.by_category.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.by_category.map((category) => (
                <div
                  key={category.category_id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{category.category_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.transaction_count} transaction{category.transaction_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={category.amount} variant="negative" size="sm" />
                    <p className="text-sm text-muted-foreground">
                      {category.percentage.toFixed(1)}% of total
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

