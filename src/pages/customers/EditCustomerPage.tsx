// src/pages/customers/EditCustomerPage.tsx
/**
 * Edit Customer Page
 * Page for editing an existing customer
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { useCustomer, useCustomers } from '@/hooks/useCustomers';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackFormSubmit } from '@/middleware/analyticsMiddleware';
import { Shield, UserX } from 'lucide-react';
import type { CustomerFormData } from '@/schemas/customerSchemas';

export default function EditCustomerPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { customer, isLoading } = useCustomer(id ?? '');
  const { updateCustomer, isUpdating } = useCustomers();
  const { hasPermission } = usePermissions();

  // Track page view
  useEffect(() => {
    if (id) {
      trackPageView(`/customers/${id}/edit`, 'Edit Customer');
    }
  }, [id]);

  // Check permission
  if (!hasPermission('customers:edit')) {
    return (
      <PageTemplate title="Access Denied" description="You don't have permission to edit customers">
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="You need permission to edit customers. Please contact your administrator."
        />
      </PageTemplate>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate title="Edit Customer">
        <div className="mx-auto max-w-4xl">
          <Loader message="Loading customer details..." />
        </div>
      </PageTemplate>
    );
  }

  // Customer not found
  if (!customer) {
    return (
      <PageTemplate
        title="Customer Not Found"
        description="The customer you're looking for doesn't exist or has been deleted"
      >
        <EmptyState
          icon={UserX}
          title="Customer Not Found"
          description="The customer you're trying to edit doesn't exist or may have been deleted."
        />
      </PageTemplate>
    );
  }

  const handleSubmit = async (data: CustomerFormData) => {
    if (!id) return;

    try {
      await updateCustomer({ id, data });
      trackFormSubmit('edit_customer_form', true);
      navigate(`/customers/${id}`);
    } catch (error) {
      trackFormSubmit('edit_customer_form', false);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(`/customers/${id}`);
  };

  // Map customer data to form data
  const initialData: Partial<CustomerFormData> = {
    name: customer.name,
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    address: customer.address ?? '',
    city: customer.city ?? '',
    country: customer.country ?? 'Pakistan',
    tax_id: customer.tax_id ?? '',
    credit_limit: customer.credit_limit,
    notes: customer.notes ?? '',
    portal_access: customer.portal_access,
  };

  return (
    <PageTemplate
      title="Edit Customer"
      description={`Edit information for ${customer.name}`}
      keywords={`edit customer, ${customer.name}, update customer`}
    >
      <div className="mx-auto max-w-4xl">
        <CustomerForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isUpdating ? 'Saving...' : 'Save Changes'}
        />
      </div>
    </PageTemplate>
  );
}
