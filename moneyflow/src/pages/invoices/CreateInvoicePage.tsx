// src/pages/invoices/CreateInvoicePage.tsx
/**
 * Create Invoice Page
 * Page for creating a new invoice
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@/components/common/PageTemplate';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView } from '@/middleware/analyticsMiddleware';
import { EmptyState } from '@/components/common/EmptyState';
import { Shield } from 'lucide-react';

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Track page view
  useEffect(() => {
    trackPageView('/invoices/new', 'Create Invoice');
  }, []);

  // Check permission
  if (!hasPermission('financial:create_invoices')) {
    return (
      <PageTemplate
        title="Access Denied"
        description="You don't have permission to create invoices"
      >
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="You need permission to create invoices. Please contact your administrator."
        />
      </PageTemplate>
    );
  }

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/invoices');
  };

  return (
    <>
      <PageTemplate
        title="Create New Invoice"
        description="Create a new invoice for your customer"
        keywords="create invoice, new invoice, invoice form"
      >
        <div className="mx-auto max-w-6xl">
          <InvoiceForm onCancel={handleCancel} />
        </div>
      </PageTemplate>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleConfirmCancel}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to leave? All changes will be lost."
        confirmText="Discard"
        confirmVariant="destructive"
      />
    </>
  );
}
