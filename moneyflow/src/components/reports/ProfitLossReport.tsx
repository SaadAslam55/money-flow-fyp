import { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { handleError } from '@/lib/errorHandler';
import { useAuth } from '@/hooks/useAuth';
import { getProfitLossReport, type ProfitLossData } from '@/services/api/reportsApi';

interface ProfitLossReportProps {
  startDate: string;
  endDate: string;
}

export function ProfitLossReport({ startDate, endDate }: ProfitLossReportProps) {
  const { organization } = useAuth();
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [startDate, endDate, organization?.id]);

  const loadData = async () => {
    if (!organization?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: apiError } = await getProfitLossReport(
        organization.id,
        startDate,
        endDate
      );

      if (apiError) throw apiError;
      setData(result);
    } catch (err: any) {
      const errorMessage = err?.message ?? 'Failed to load report';
      handleError(err, 'ProfitLossReport');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!data) return;

    // Generate CSV
    const rows = [
      ['Profit & Loss Statement'],
      [`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`],
      [''],
      ['REVENUE'],
      ['Sales Revenue', data.revenue.sales.toFixed(2)],
      ['Other Income', data.revenue.other_income.toFixed(2)],
      ['Total Revenue', data.revenue.total.toFixed(2)],
      [''],
      ['COST OF GOODS SOLD'],
      ['Product Costs', data.cogs.product_costs.toFixed(2)],
      ['Gross Profit', data.cogs.gross_profit.toFixed(2)],
      [`Gross Profit Margin`, `${data.cogs.gross_profit_margin.toFixed(2)}%`],
      [''],
      ['EXPENSES'],
      ...Object.entries(data.expenses).map(([category, amount]) => [
        category,
        amount.toFixed(2),
      ]),
      ['Total Expenses', data.total_expenses.toFixed(2)],
      [''],
      ['NET PROFIT', data.net_profit.toFixed(2)],
      [`Net Profit Margin`, `${data.net_profit_margin.toFixed(2)}%`],
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profit-loss-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <Loader size="lg" message="Loading profit & loss report..." fullScreen={false} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load report"
        description={error}
        action={{
          label: 'Retry',
          onClick: loadData,
        }}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No data available"
        description="No profit & loss data found for the selected period"
      />
    );
  }

  const isProfit = data.net_profit >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Profit & Loss Statement</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(startDate)} to {formatDate(endDate)}
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Card */}
      <Card className={isProfit ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Net Profit</p>
              <CurrencyDisplay
                amount={data.net_profit}
                variant={isProfit ? 'positive' : 'negative'}
                size="xl"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Margin: {data.net_profit_margin.toFixed(2)}%
              </p>
            </div>
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                isProfit ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {isProfit ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </div>
          {data.previous_period && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm">
                <span className="text-muted-foreground">vs Previous Period: </span>
                <span
                  className={
                    data.previous_period.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {data.previous_period.change_percentage >= 0 ? '+' : ''}
                  {data.previous_period.change_percentage.toFixed(1)}%
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Section */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sales Revenue</span>
              <CurrencyDisplay amount={data.revenue.sales} size="sm" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Other Income</span>
              <CurrencyDisplay amount={data.revenue.other_income} size="sm" />
            </div>
            <div className="flex justify-between border-t pt-3 font-bold">
              <span>Total Revenue</span>
              <CurrencyDisplay amount={data.revenue.total} size="sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost of Goods Sold */}
      <Card>
        <CardHeader>
          <CardTitle>Cost of Goods Sold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product Costs</span>
              <CurrencyDisplay amount={data.cogs.product_costs} variant="negative" size="sm" />
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-bold">Gross Profit</span>
              <div className="text-right">
                <CurrencyDisplay amount={data.cogs.gross_profit} variant="positive" size="sm" />
                <div className="text-sm text-muted-foreground">
                  {data.cogs.gross_profit_margin.toFixed(2)}% margin
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.expenses)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => (
                <div key={category} className="flex justify-between">
                  <span className="text-muted-foreground">{category}</span>
                  <CurrencyDisplay amount={amount} variant="negative" size="sm" />
                </div>
              ))}
            <div className="flex justify-between border-t pt-3 font-bold">
              <span>Total Expenses</span>
              <CurrencyDisplay amount={data.total_expenses} variant="negative" size="sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Line */}
      <Card className={isProfit ? 'border-green-500' : 'border-red-500'}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Net Profit (Loss)</p>
              <p className="text-sm text-muted-foreground">After all expenses</p>
            </div>
            <div className="text-right">
              <CurrencyDisplay
                amount={data.net_profit}
                variant={isProfit ? 'positive' : 'negative'}
                size="xl"
              />
              <p className="text-sm text-muted-foreground">
                {data.net_profit_margin.toFixed(2)}% of revenue
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
