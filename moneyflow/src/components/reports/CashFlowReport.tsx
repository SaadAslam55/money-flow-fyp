// FILE: src/components/reports/CashFlowReport.tsx

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCashFlowStatement } from '@/hooks/useReports';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { ReportExport } from './ReportExport';
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
import type { DateRange, CashFlowData } from '@/types/report.types';

interface CashFlowReportProps {
  dateRange: DateRange;
}

export function CashFlowReport({ dateRange }: CashFlowReportProps) {
  const { data, isLoading, error } = useCashFlowStatement(dateRange);

  const chartData = useMemo(() => {
    if (!data?.data) return [];
    const cashFlow = data.data;
    return [
      {
        name: 'Operating',
        value: cashFlow.operating_activities.net_cash_from_operations,
        type: 'Operating Activities',
      },
      {
        name: 'Investing',
        value: cashFlow.investing_activities.net_cash_from_investing,
        type: 'Investing Activities',
      },
      {
        name: 'Financing',
        value: cashFlow.financing_activities.net_cash_from_financing,
        type: 'Financing Activities',
      },
    ];
  }, [data]);

  if (isLoading) {
    return <Loader size="lg" message="Loading cash flow report..." fullScreen={false} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load report"
        description={error?.message ?? 'Failed to load cash flow report'}
      />
    );
  }

  if (!data?.data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No data available"
        description="No cash flow data available for the selected period"
      />
    );
  }

  const cashFlow = data.data;
  const isPositive = cashFlow.net_change_in_cash >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Cash Flow Statement</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
          </p>
        </div>
        <ReportExport reportType="cash_flow" reportData={cashFlow} />
      </div>

      {/* Summary Card */}
      <Card className={isPositive ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Net Change in Cash</p>
              <CurrencyDisplay
                amount={cashFlow.net_change_in_cash}
                variant={isPositive ? 'positive' : 'negative'}
                size="xl"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Ending Cash: <CurrencyDisplay amount={cashFlow.ending_cash} size="sm" />
              </p>
            </div>
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                isPositive ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow by Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  name="Cash Flow"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Operating Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Operating Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Income</span>
              <CurrencyDisplay amount={cashFlow.operating_activities.net_income} size="sm" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Depreciation</span>
              <CurrencyDisplay
                amount={cashFlow.operating_activities.adjustments.depreciation}
                size="sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Changes in Receivables</span>
              <CurrencyDisplay
                amount={cashFlow.operating_activities.adjustments.changes_in_receivables}
                size="sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Changes in Payables</span>
              <CurrencyDisplay
                amount={cashFlow.operating_activities.adjustments.changes_in_payables}
                size="sm"
              />
            </div>
            <div className="flex justify-between border-t pt-3 font-bold">
              <span>Net Cash from Operations</span>
              <CurrencyDisplay
                amount={cashFlow.operating_activities.net_cash_from_operations}
                variant="positive"
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investing Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Investing Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchases</span>
              <CurrencyDisplay
                amount={cashFlow.investing_activities.purchases}
                variant="negative"
                size="sm"
              />
            </div>
            <div className="flex justify-between border-t pt-3 font-bold">
              <span>Net Cash from Investing</span>
              <CurrencyDisplay
                amount={cashFlow.investing_activities.net_cash_from_investing}
                variant="negative"
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financing Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Financing Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner Contributions</span>
              <CurrencyDisplay
                amount={cashFlow.financing_activities.owner_contributions}
                variant="positive"
                size="sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner Withdrawals</span>
              <CurrencyDisplay
                amount={cashFlow.financing_activities.owner_withdrawals}
                variant="negative"
                size="sm"
              />
            </div>
            <div className="flex justify-between border-t pt-3 font-bold">
              <span>Net Cash from Financing</span>
              <CurrencyDisplay
                amount={cashFlow.financing_activities.net_cash_from_financing}
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Beginning Cash</span>
              <CurrencyDisplay amount={cashFlow.beginning_cash} size="sm" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Change in Cash</span>
              <CurrencyDisplay
                amount={cashFlow.net_change_in_cash}
                variant={isPositive ? 'positive' : 'negative'}
                size="sm"
              />
            </div>
            <div className="flex justify-between border-t pt-3 font-bold text-lg">
              <span>Ending Cash</span>
              <CurrencyDisplay amount={cashFlow.ending_cash} size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

