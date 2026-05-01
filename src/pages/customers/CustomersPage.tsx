// src/pages/customers/CustomersPage.tsx
/**
 * Customers Page
 * Main page for managing customers with list, stats, and import/export
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTemplate } from '@/components/common/PageTemplate';
import { CustomerList } from '@/components/customers/CustomerList';
import { CustomerStats } from '@/components/customers/CustomerStats';
import { CustomerImport } from '@/components/customers/CustomerImport';
import { useCustomers } from '@/hooks/useCustomers';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const { hasPermission } = usePermissions();
  const { importCustomers } = useCustomers();

  const canCreate = hasPermission('customers:add');
  const canImport = hasPermission('customers:import');
  const canExport = hasPermission('customers:export');

  // Track page view
  useEffect(() => {
    trackPageView('/customers', 'Customers');
  }, []);

  const handleCreate = () => {
    trackUserAction('create_customer_clicked', 'customers', 'new_customer_button');
    navigate('/customers/new');
  };

  const handleImport = async (file: File): Promise<{ count: number; skipped: number; error: Error | null }> => {
    trackUserAction('import_customers_started', 'customers', 'import_dialog');
    return await importCustomers(file);
  };

  const handleEdit = (customer: { id: string }) => {
    trackUserAction('edit_customer_clicked', 'customers', customer.id);
    navigate(`/customers/${customer.id}/edit`);
  };

  const handleView = (customer: { id: string }) => {
    trackUserAction('view_customer_clicked', 'customers', customer.id);
    navigate(`/customers/${customer.id}`);
  };

  const actions = (
    <div className="flex gap-2">
      {canImport && (
        <Button variant="outline" onClick={() => setShowImportDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      )}
      {canCreate && (
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      )}
    </div>
  );

  return (
    <PageTemplate
      title="Customers"
      description="Manage your customer relationships and contact information"
      keywords="customers, client management, contacts, customer relationships"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Statistics */}
        <CustomerStats />

        {/* Customer List */}
        <CustomerList
          onEdit={handleEdit}
          onView={handleView}
          onImport={canImport ? () => setShowImportDialog(true) : undefined}
          onExport={
            canExport ? () => trackUserAction('export_customers_clicked', 'customers') : undefined
          }
          onCreate={canCreate ? handleCreate : undefined}
        />
      </div>

      {/* Import Dialog */}
      {canImport && (
        <CustomerImport
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onImport={handleImport}
        />
      )}
    </PageTemplate>
  );
}
