// src/pages/reports/SalesReportPage.tsx
/**
 * Sales Report Page
 * Analyzes sales performance, revenue trends, and top customers
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SalesReport } from '@/components/reports/SalesReport';
import { ReportFiltersComponent } from '@/components/reports/ReportFilters';
import { PageTemplate } from '@/components/common/PageTemplate';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView } from '@/middleware/analyticsMiddleware';
import { EmptyState } from '@/components/common/EmptyState';
import { Shield } from 'lucide-react';
import type { DateRange } from '@/types/report.types';

export default function SalesReportPage() {
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
    trackPageView('/reports/sales', 'Sales Report');
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
      title="Sales Report"
      description="Analyze your sales performance, revenue trends, and top customers"
      keywords="sales report, revenue analysis, sales trends, customer analytics"
    >
      <div className="space-y-6">
        <ReportFiltersComponent
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          availableFilters={['customer', 'status']}
        />
        <SalesReport startDate={dateRange.start} endDate={dateRange.end} />
      </div>
    </PageTemplate>
  );
}
