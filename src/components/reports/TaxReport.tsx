// FILE: src/components/reports/TaxReport.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTaxReport } from '@/hooks/useReports';
import { formatDate } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { AlertCircle } from 'lucide-react';
import { ReportExport } from './ReportExport';
import type { DateRange, TaxReportData } from '@/types/report.types';

interface TaxReportProps {
  dateRange: DateRange;
}

export function TaxReport({ dateRange }: TaxReportProps) {
  const { data, isLoading, error } = useTaxReport(dateRange);

  if (isLoading) {
    return <Loader size="lg" message="Loading tax report..." fullScreen={false} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load report"
        description={error?.message ?? 'Failed to load tax report'}
      />
    );
  }

  if (!data?.data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No data available"
        description="No tax data available for the selected period"
      />
    );
  }

  const taxData = data.data;
  const isLiability = taxData.summary.net_tax_liability >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Tax Report</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
          </p>
        </div>
        <ReportExport reportType="tax" reportData={taxData} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Taxable Sales</p>
            <CurrencyDisplay amount={taxData.summary.taxable_sales} size="xl" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Tax Collected</p>
            <CurrencyDisplay amount={taxData.summary.tax_collected} variant="positive" size="xl" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Tax Paid</p>
            <CurrencyDisplay amount={taxData.summary.tax_paid} variant="negative" size="xl" />
          </CardContent>
        </Card>
        <Card className={isLiability ? 'border-orange-200 bg-orange-50' : ''}>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Net Tax Liability</p>
            <CurrencyDisplay
              amount={taxData.summary.net_tax_liability}
              variant={isLiability ? 'negative' : 'positive'}
              size="xl"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tax by Rate */}
      {taxData.by_rate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tax by Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {taxData.by_rate.map((rate, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{rate.tax_rate}% Tax Rate</p>
                    <p className="text-sm text-muted-foreground">
                      Taxable Amount: <CurrencyDisplay amount={rate.taxable_amount} size="sm" />
                    </p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={rate.tax_amount} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Details */}
      {taxData.sales_details.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Tax Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxData.sales_details.map((sale, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell className="text-right">
                        <CurrencyDisplay amount={sale.amount} size="sm" />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <CurrencyDisplay amount={sale.tax} size="sm" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Details */}
      {taxData.purchase_details.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Tax Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxData.purchase_details.map((purchase, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(purchase.date)}</TableCell>
                      <TableCell>{purchase.description}</TableCell>
                      <TableCell className="text-right">
                        <CurrencyDisplay amount={purchase.amount} size="sm" />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <CurrencyDisplay amount={purchase.tax} size="sm" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

