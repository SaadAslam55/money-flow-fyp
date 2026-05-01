// FILE: src/components/reports/BalanceSheet.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBalanceSheet } from '@/hooks/useReports';
import { formatDate } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { AlertCircle } from 'lucide-react';
import { ReportExport } from './ReportExport';
import type { BalanceSheetData } from '@/types/report.types';

interface BalanceSheetProps {
  asOfDate: string;
}

export function BalanceSheet({ asOfDate }: BalanceSheetProps) {
  const { data, isLoading, error } = useBalanceSheet(asOfDate);

  if (isLoading) {
    return <Loader size="lg" message="Loading balance sheet..." fullScreen={false} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load balance sheet"
        description={error?.message ?? 'Failed to load balance sheet data'}
      />
    );
  }

  if (!data?.data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No data available"
        description="No balance sheet data available for the selected date"
      />
    );
  }

  const balanceSheet = data.data;
  const isBalanced =
    Math.abs(balanceSheet.assets.total_assets - (balanceSheet.liabilities.total_liabilities + balanceSheet.equity.total_equity)) < 0.01;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Balance Sheet</h3>
          <p className="text-sm text-muted-foreground">As of {formatDate(asOfDate)}</p>
        </div>
        <ReportExport reportType="balance_sheet" reportData={balanceSheet} />
      </div>

      {/* Balance Check */}
      {!isBalanced && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Balance sheet does not balance. Please review the data.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-semibold text-muted-foreground">Current Assets</p>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash</span>
                    <CurrencyDisplay amount={balanceSheet.assets.current_assets.cash} size="sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accounts Receivable</span>
                    <CurrencyDisplay
                      amount={balanceSheet.assets.current_assets.accounts_receivable}
                      size="sm"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inventory</span>
                    <CurrencyDisplay
                      amount={balanceSheet.assets.current_assets.inventory}
                      size="sm"
                    />
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Current Assets</span>
                    <CurrencyDisplay amount={balanceSheet.assets.current_assets.total} size="sm" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Total Assets</span>
                <CurrencyDisplay amount={balanceSheet.assets.total_assets} size="lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <Card>
          <CardHeader>
            <CardTitle>Liabilities & Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-semibold text-muted-foreground">Current Liabilities</p>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accounts Payable</span>
                    <CurrencyDisplay
                      amount={balanceSheet.liabilities.current_liabilities.accounts_payable}
                      size="sm"
                    />
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Current Liabilities</span>
                    <CurrencyDisplay
                      amount={balanceSheet.liabilities.current_liabilities.total}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total Liabilities</span>
                <CurrencyDisplay amount={balanceSheet.liabilities.total_liabilities} size="sm" />
              </div>
              <div>
                <p className="mb-2 font-semibold text-muted-foreground">Equity</p>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retained Earnings</span>
                    <CurrencyDisplay amount={balanceSheet.equity.retained_earnings} size="sm" />
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Equity</span>
                    <CurrencyDisplay amount={balanceSheet.equity.total_equity} size="sm" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Total Liabilities & Equity</span>
                <CurrencyDisplay
                  amount={
                    balanceSheet.liabilities.total_liabilities + balanceSheet.equity.total_equity
                  }
                  size="lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

