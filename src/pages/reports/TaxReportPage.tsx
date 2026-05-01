// src/pages/reports/TaxReportPage.tsx
/**
 * Tax Report Page
 * Displays tax summary and breakdown for a selected period
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TaxReport } from '@/components/reports/TaxReport';
import { ReportFiltersComponent } from '@/components/reports/ReportFilters';
import { PageTemplate } from '@/components/common/PageTemplate';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView } from '@/middleware/analyticsMiddleware';
import { EmptyState } from '@/components/common/EmptyState';
import { Shield } from 'lucide-react';
import type { DateRange } from '@/types/report.types';

export default function TaxReportPage() {
  const { hasPermission } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      start: searchParams.get('start') ?? firstDay.toISOString().slice(0, 10),
      end: searchParams.get('end') ?? lastDay.toISOString().slice(0, 10),
    };
  });

  // Track page view
  useEffect(() => {
    trackPageView('/reports/tax', 'Tax Report');
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
      title="Tax Report"
      description="View tax summary and breakdown for any period"
      keywords="tax report, tax summary, GST, tax analysis, financial report"
    >
      <div className="space-y-6">
        <ReportFiltersComponent
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          availableFilters={[]}
        />
        <TaxReport dateRange={dateRange} />
      </div>
    </PageTemplate>
  );
}
