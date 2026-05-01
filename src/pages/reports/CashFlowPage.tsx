// src/pages/reports/CashFlowPage.tsx
/**
 * Cash Flow Report Page
 * Displays cash inflows, outflows, and net cash flow for a selected period
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CashFlowReport } from '@/components/reports/CashFlowReport';
import { ReportFiltersComponent } from '@/components/reports/ReportFilters';
import { PageTemplate } from '@/components/common/PageTemplate';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView } from '@/middleware/analyticsMiddleware';
import { EmptyState } from '@/components/common/EmptyState';
import { Shield } from 'lucide-react';
import type { DateRange } from '@/types/report.types';

export default function CashFlowPage() {
  const { hasPermission } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: searchParams.get('start') ?? firstDay.toISOString().slice(0, 10),
    end: searchParams.get('end') ?? lastDay.toISOString().slice(0, 10),
  });

  // Track page view
  useEffect(() => {
    trackPageView('/reports/cash-flow', 'Cash Flow Report');
  }, []);

  // Update URL params when date range changes
  useEffect(() => {
    setSearchParams({
      start: dateRange.start,
      end: dateRange.end,
    });
  }, [dateRange, setSearchParams]);

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
      title="Cash Flow Statement"
      description="View your cash inflows, outflows, and net cash flow for any period"
      keywords="cash flow, cash flow statement, cash management, financial report"
    >
      <div className="space-y-6">
        <ReportFiltersComponent
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          availableFilters={[]}
        />
        <CashFlowReport dateRange={dateRange} />
      </div>
    </PageTemplate>
  );
}
