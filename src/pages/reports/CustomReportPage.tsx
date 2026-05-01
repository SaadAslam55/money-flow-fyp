// src/pages/reports/CustomReportPage.tsx
/**
 * Custom Report Builder Page
 * Allows users to create custom reports with selected columns, filters, and groupings
 */

import { useEffect } from 'react';
import { PageTemplate } from '@/components/common/PageTemplate';
import { CustomReportBuilder } from '@/components/reports/CustomReportBuilder';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView } from '@/middleware/analyticsMiddleware';
import { EmptyState } from '@/components/common/EmptyState';
import { Shield } from 'lucide-react';

export default function CustomReportPage() {
  const { hasPermission } = usePermissions();

  // Track page view
  useEffect(() => {
    trackPageView('/reports/custom', 'Custom Report Builder');
  }, []);

  // Check permission
  if (!hasPermission('reports:create_custom')) {
    return (
      <PageTemplate
        title="Access Denied"
        description="You don't have permission to create custom reports"
      >
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="You need permission to create custom reports. Please contact your administrator."
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Custom Report Builder"
      description="Create custom reports tailored to your needs"
      keywords="custom report, report builder, analytics"
    >
      <CustomReportBuilder />
    </PageTemplate>
  );
}
