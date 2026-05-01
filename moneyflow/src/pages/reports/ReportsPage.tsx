// src/pages/reports/ReportsPage.tsx
/**
 * Reports Page
 * Main dashboard for accessing all business reports and analytics
 */

import { useEffect } from 'react';
import { ReportsDashboard } from '@/components/reports/ReportsDashboard';
import { PageTemplate } from '@/components/common/PageTemplate';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView } from '@/middleware/analyticsMiddleware';
import { EmptyState } from '@/components/common/EmptyState';
import { Shield } from 'lucide-react';

export default function ReportsPage() {
  const { hasPermission } = usePermissions();

  // Track page view
  useEffect(() => {
    trackPageView('/reports', 'Reports');
  }, []);

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
      title="Reports"
      description="Analyze your business performance with comprehensive reports"
      keywords="reports, analytics, business performance, financial reports"
    >
      <ReportsDashboard />
    </PageTemplate>
  );
}
