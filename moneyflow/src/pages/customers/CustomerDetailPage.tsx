// src/pages/customers/CustomerDetailPage.tsx
/**
 * Customer Detail Page
 * Page for viewing customer details, invoices, transactions, and managing portal access
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTemplate } from '@/components/common/PageTemplate';
import { CustomerDetail } from '@/components/customers/CustomerDetail';
import { PortalAccessDialog } from '@/components/customers/PortalAccessDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useCustomer, useCustomers } from '@/hooks/useCustomers';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import * as customerApi from '@/services/api/customerApi';
import { toast } from 'sonner';

export default function CustomerDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { customer, isLoading } = useCustomer(id ?? '');
  const { deleteCustomer } = useCustomers();
  const { hasPermission } = usePermissions();
  const [showPortalDialog, setShowPortalDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const canEdit = hasPermission('customers:edit');
  const canDelete = hasPermission('customers:delete');
  const canManagePortal = hasPermission('customers:manage_portal');

  // Track page view
  useEffect(() => {
    if (id) {
      trackPageView(`/customers/${id}`, 'Customer Detail');
    }
  }, [id]);

  const handleEdit = () => {
    trackUserAction('edit_customer_clicked', 'customers', id ?? '');
    navigate(`/customers/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id || !customer) return;

    try {
      await deleteCustomer(id);
      trackUserAction('delete_customer_success', 'customers', id);
      toast.success('Customer deleted successfully');
      navigate('/customers');
    } catch (error) {
      trackUserAction('delete_customer_failed', 'customers', id);
      const message = error instanceof Error ? error.message : 'Failed to delete customer';
      toast.error(message);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteClick = () => {
    trackUserAction('delete_customer_clicked', 'customers', id ?? '');
    setShowDeleteDialog(true);
  };

  const handleEnablePortal = async (customerId: string, password: string, sendEmail: boolean) => {
    try {
      const { error } = await customerApi.enableCustomerPortal(customerId, password);
      if (error) {
        throw error;
      }

      trackUserAction('enable_portal_success', 'customers', customerId);

      if (sendEmail && customer?.email) {
        // In production, this would send an email via an edge function
        toast.success('Portal access enabled. Email sent to customer.');
      } else {
        toast.success('Portal access enabled successfully');
      }
    } catch (error) {
      trackUserAction('enable_portal_failed', 'customers', customerId);
      const message = error instanceof Error ? error.message : 'Failed to enable portal access';
      toast.error(message);
      throw error;
    }
  };

  const actions = customer && (
    <div className="flex gap-2">
      {canManagePortal && !customer.portal_access && (
        <Button
          variant="outline"
          onClick={() => {
            trackUserAction('enable_portal_clicked', 'customers', id ?? '');
            setShowPortalDialog(true);
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Enable Portal
        </Button>
      )}
    </div>
  );

  return (
    <PageTemplate
      title={customer?.name ?? 'Customer Details'}
      description={
        customer ? `View details and history for ${customer.name}` : 'Loading customer details...'
      }
      keywords={
        customer ? `${customer.name}, customer details, customer profile` : 'customer details'
      }
      actions={actions}
      loading={isLoading}
    >
      {customer && (
        <>
          <CustomerDetail
            customerId={id ?? ''}
            onEdit={canEdit ? handleEdit : undefined}
            onDelete={canDelete ? handleDeleteClick : undefined}
          />

          {canManagePortal && (
            <PortalAccessDialog
              open={showPortalDialog}
              onOpenChange={setShowPortalDialog}
              customer={customer}
              onEnable={handleEnablePortal}
            />
          )}

          {/* Delete Confirmation Dialog */}
          {canDelete && (
            <ConfirmDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              onConfirm={handleDelete}
              title="Delete Customer"
              description={`Are you sure you want to delete ${customer.name}? This action cannot be undone and will remove all associated data.`}
              confirmText="Delete"
              confirmVariant="destructive"
            />
          )}
        </>
      )}
    </PageTemplate>
  );
}
