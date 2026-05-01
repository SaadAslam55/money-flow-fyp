// src/pages/invoices/EditInvoicePage.tsx
/**
 * Edit Invoice Page
 * Page for editing an existing invoice
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { useInvoice } from '@/hooks/useInvoices';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView } from '@/middleware/analyticsMiddleware';
import { FileX, Shield, Lock } from 'lucide-react';

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoice, isLoading, error } = useInvoice(id ?? '');
  const { hasPermission } = usePermissions();

  // Track page view
  useEffect(() => {
    if (id) {
      trackPageView(`/invoices/${id}/edit`, 'Edit Invoice');
    }
  }, [id]);

  // Check permission
  if (!hasPermission('financial:edit_invoices')) {
    return (
      <PageTemplate title="Access Denied" description="You don't have permission to edit invoices">
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="You need permission to edit invoices. Please contact your administrator."
        />
      </PageTemplate>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate title="Edit Invoice">
        <div className="mx-auto max-w-6xl">
          <Loader message="Loading invoice details..." />
        </div>
      </PageTemplate>
    );
  }

  // Error or not found state
  if (error || !invoice) {
    return (
      <PageTemplate
        title="Invoice Not Found"
        description="The invoice you're looking for doesn't exist or has been deleted"
      >
        <EmptyState
          icon={FileX}
          title="Invoice Not Found"
          description={
            error?.message ??
            "The invoice you're trying to edit doesn't exist or may have been deleted."
          }
        />
      </PageTemplate>
    );
  }

  // Check if invoice can be edited
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return (
      <PageTemplate
        title="Cannot Edit Invoice"
        description={`This invoice cannot be edited because it is ${invoice.status}`}
      >
        <EmptyState
          icon={Lock}
          title="Invoice Cannot Be Edited"
          description={`Invoices with status "${invoice.status}" cannot be edited. You can only edit draft, sent, or partially paid invoices.`}
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Edit Invoice"
      description={`Edit invoice ${invoice.invoice_number}`}
      keywords={`edit invoice, ${invoice.invoice_number}, update invoice`}
    >
      <div className="mx-auto max-w-6xl">
        <InvoiceForm initialData={invoice} onCancel={() => navigate(`/invoices/${id}`)} />
      </div>
    </PageTemplate>
  );
}
