// src/pages/reports/BalanceSheetPage.tsx
/**
 * Balance Sheet Report Page
 * Displays assets, liabilities, and equity as of a specific date
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BalanceSheet } from '@/components/reports/BalanceSheet';
import { PageTemplate } from '@/components/common/PageTemplate';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView } from '@/middleware/analyticsMiddleware';
import { EmptyState } from '@/components/common/EmptyState';
import { Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BalanceSheetPage() {
  const { hasPermission } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [asOfDate, setAsOfDate] = useState<string>(
    () => searchParams.get('date') ?? new Date().toISOString().slice(0, 10)
  );

  // Track page view
  useEffect(() => {
    trackPageView('/reports/balance-sheet', 'Balance Sheet Report');
  }, []);

  // Update URL params when date changes
  useEffect(() => {
    setSearchParams({ date: asOfDate });
  }, [asOfDate, setSearchParams]);

  // Check permission
  if (!hasPermission('reports:view_basic')) {
    return (
      <PageTemplate title="Access Denied" description="You don't have permission to view reports">
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="You need permission to view reports. Please contact your administrator."
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Balance Sheet"
      description="View your assets, liabilities, and equity as of a specific date"
      keywords="balance sheet, assets, liabilities, equity, financial report"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Date Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="asOfDate">As of Date</Label>
              <Input
                id="asOfDate"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </CardContent>
        </Card>
        <BalanceSheet asOfDate={asOfDate} />
      </div>
    </PageTemplate>
  );
}
