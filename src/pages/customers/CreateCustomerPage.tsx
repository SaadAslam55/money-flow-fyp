// src/pages/customers/CreateCustomerPage.tsx
/**
 * Create Customer Page
 * Page for creating a new customer
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@/components/common/PageTemplate';
import { EmptyState } from '@/components/common/EmptyState';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { useCustomers } from '@/hooks/useCustomers';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackFormSubmit } from '@/middleware/analyticsMiddleware';
import { Shield } from 'lucide-react';
import type { CustomerFormData } from '@/schemas/customerSchemas';

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const { createCustomer, isCreating } = useCustomers();
  const { hasPermission } = usePermissions();

  // Track page view
  useEffect(() => {
    trackPageView('/customers/new', 'Create Customer');
  }, []);

  // Check permission
  if (!hasPermission('customers:add')) {
    return (
      <PageTemplate
        title="Access Denied"
        description="You don't have permission to create customers"
      >
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="You need permission to create customers. Please contact your administrator."
        />
      </PageTemplate>
    );
  }

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomer(data);
      trackFormSubmit('create_customer_form', true);
      navigate('/customers');
    } catch (error) {
      trackFormSubmit('create_customer_form', false);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  return (
    <PageTemplate
      title="Create New Customer"
      description="Add a new customer to your system"
      keywords="create customer, add customer, new customer"
    >
      <div className="mx-auto max-w-4xl">
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isCreating ? 'Creating...' : 'Create Customer'}
        />
      </div>
    </PageTemplate>
  );
}
