// src/pages/invoices/InvoicesPage.tsx
/**
 * Invoices Page
 * Main page for managing invoices with list, filters, statistics, and actions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTemplate } from '@/components/common/PageTemplate';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { PaymentDialog } from '@/components/invoices/PaymentDialog';
import { SendInvoiceDialog } from '@/components/invoices/SendInvoiceDialog';
import { useInvoices } from '@/hooks/useInvoices';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { debounce } from '@/lib/utils';
import { toast } from 'sonner';
import type { InvoiceFilters, InvoiceStatus } from '@/types/database.types';
import type { InvoiceWithDetails } from '@/types/invoice.types';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [page, setPage] = useState(1);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [invoiceToDuplicate, setInvoiceToDuplicate] = useState<string | null>(null);

  const { invoices, count, isLoading, sendInvoice, duplicateInvoice, deleteInvoice } = useInvoices(
    filters,
    page
  );

  const canCreate = hasPermission('financial:create_invoices');
  const canDelete = hasPermission('financial:delete_invoices');
  const canExport = hasPermission('financial:export_reports');

  // Track page view
  useEffect(() => {
    trackPageView('/invoices', 'Invoices');
  }, []);

  // Calculate summary statistics from current page data
  // Note: total uses server-side count for accuracy across pages
  const stats = {
    total: count,
    draft: invoices.filter((i: InvoiceWithDetails) => i.status === 'draft').length,
    sent: invoices.filter((i: InvoiceWithDetails) => i.status === 'sent').length,
    paid: invoices.filter((i: InvoiceWithDetails) => i.status === 'paid').length,
    overdue: invoices.filter((i: InvoiceWithDetails) => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum: number, i: InvoiceWithDetails) => sum + i.total_amount, 0),
    paidAmount: invoices.reduce((sum: number, i: InvoiceWithDetails) => sum + i.amount_paid, 0),
    dueAmount: invoices.reduce((sum: number, i: InvoiceWithDetails) => sum + i.amount_due, 0),
  };

  const handleSearch = debounce((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPage(1);
  }, 500);

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters((prev) => ({ ...prev, status: undefined }));
    } else {
      setFilters((prev) => ({ ...prev, status: [status as InvoiceStatus] }));
    }
    setPage(1);
  };

  const handleDateRangeFilter = (range: string) => {
    const today = new Date();
    let start_date: string | undefined;
    let end_date: string | undefined;

    switch (range) {
      case 'today':
        start_date = end_date = today.toISOString().split('T')[0];
        break;
      case 'this_week': {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        start_date = weekStart.toISOString().split('T')[0];
        end_date = today.toISOString().split('T')[0];
        break;
      }
      case 'this_month':
        start_date = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        end_date = today.toISOString().split('T')[0];
        break;
      case 'last_month': {
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        start_date = lastMonthStart.toISOString().split('T')[0];
        end_date = lastMonthEnd.toISOString().split('T')[0];
        break;
      }
      case 'this_year':
        start_date = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        end_date = today.toISOString().split('T')[0];
        break;
      default:
        start_date = undefined;
        end_date = undefined;
    }

    setFilters((prev) => ({ ...prev, start_date, end_date }));
    setPage(1);
  };

  const handleSend = async (invoiceId: string) => {
    const invoice = invoices.find((i: InvoiceWithDetails) => i.id === invoiceId);
    if (invoice) {
      setSelectedInvoiceId(invoiceId);
      setShowSendDialog(true);
    }
  };

  const handleDownload = async (invoiceId: string) => {
    trackUserAction('download_invoice_pdf_clicked', 'invoices', invoiceId);
    // TODO: Implement PDF download
    toast.info('PDF download feature coming soon');
  };

  const handleDuplicate = (invoiceId: string) => {
    trackUserAction('duplicate_invoice_clicked', 'invoices', invoiceId);
    setInvoiceToDuplicate(invoiceId);
    setShowDuplicateDialog(true);
  };

  const handleConfirmDuplicate = async () => {
    if (!invoiceToDuplicate) return;
    try {
      await duplicateInvoice(invoiceToDuplicate);
      trackUserAction('duplicate_invoice_success', 'invoices', invoiceToDuplicate);
      toast.success('Invoice duplicated successfully');
      setShowDuplicateDialog(false);
      setInvoiceToDuplicate(null);
    } catch (error) {
      trackUserAction('duplicate_invoice_failed', 'invoices', invoiceToDuplicate);
      const message = error instanceof Error ? error.message : 'Failed to duplicate invoice';
      toast.error(message);
    }
  };

  const handleDelete = (invoiceId: string) => {
    trackUserAction('delete_invoice_clicked', 'invoices', invoiceId);
    setInvoiceToDelete(invoiceId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await deleteInvoice(invoiceToDelete);
      trackUserAction('delete_invoice_success', 'invoices', invoiceToDelete);
      toast.success('Invoice deleted successfully');
      setShowDeleteDialog(false);
      setInvoiceToDelete(null);
    } catch (error) {
      trackUserAction('delete_invoice_failed', 'invoices', invoiceToDelete);
      const message = error instanceof Error ? error.message : 'Failed to delete invoice';
      toast.error(message);
    }
  };

  const handleRecordPayment = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setShowPaymentDialog(true);
  };

  const handleExport = () => {
    trackUserAction('export_invoices_clicked', 'invoices');
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon');
  };

  const handleBulkDelete = async (invoiceIds: string[]) => {
    try {
      await Promise.all(invoiceIds.map((id) => deleteInvoice(id)));
      trackUserAction('bulk_delete_invoices', 'invoices', `${invoiceIds.length} invoices`);
      toast.success(`${invoiceIds.length} invoices deleted successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete some invoices';
      toast.error(message);
    }
  };

  const handleBulkSend = async (invoiceIds: string[]) => {
    try {
      await Promise.all(invoiceIds.map((id) => sendInvoice({ id })));
      trackUserAction('bulk_send_invoices', 'invoices', `${invoiceIds.length} invoices`);
      toast.success(`${invoiceIds.length} invoices sent successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send some invoices';
      toast.error(message);
    }
  };

  const selectedInvoice = selectedInvoiceId
    ? invoices.find((i: InvoiceWithDetails) => i.id === selectedInvoiceId)
    : null;

  const actions = canCreate ? (
    <Button
      onClick={() => {
        trackUserAction('create_invoice_clicked', 'invoices', 'new_invoice_button');
        navigate('/invoices/new');
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      New Invoice
    </Button>
  ) : undefined;

  return (
    <PageTemplate
      title="Invoices"
      description="Manage your sales invoices and track payments"
      keywords="invoices, billing, payments, sales"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.draft} draft, {stats.sent} sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CurrencyDisplay amount={stats.totalAmount} size="xl" />
              <p className="mt-1 text-xs text-muted-foreground">From all invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CurrencyDisplay amount={stats.paidAmount} variant="positive" size="xl" />
              <p className="mt-1 text-xs text-muted-foreground">{stats.paid} invoices paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CurrencyDisplay amount={stats.dueAmount} variant="negative" size="xl" />
              <p className="mt-1 text-xs text-muted-foreground">{stats.overdue} overdue invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select onValueChange={handleStatusFilter} defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={handleDateRangeFilter} defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1" />

              {canExport && (
                <Button variant="outline" onClick={handleExport}>
                  <Upload className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Invoices
              </CardTitle>
              <span className="text-sm text-muted-foreground">{count} total</span>
            </div>
          </CardHeader>
          <CardContent>
            <InvoiceList
              invoices={invoices}
              isLoading={isLoading}
              onSend={handleSend}
              onDownload={handleDownload}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onRecordPayment={handleRecordPayment}
              onBulkDelete={canDelete ? handleBulkDelete : undefined}
              onBulkSend={handleBulkSend}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {count > 50 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {Math.ceil(count / 50)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(count / 50)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Dialogs */}
        {selectedInvoice && showPaymentDialog && (
          <PaymentDialog
            invoice={selectedInvoice}
            open={showPaymentDialog}
            onClose={() => {
              setShowPaymentDialog(false);
              setSelectedInvoiceId(null);
            }}
          />
        )}
        {selectedInvoice && showSendDialog && (
          <SendInvoiceDialog
            invoice={selectedInvoice}
            open={showSendDialog}
            onClose={() => {
              setShowSendDialog(false);
              setSelectedInvoiceId(null);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {canDelete && (
          <ConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleConfirmDelete}
            title="Delete Invoice"
            description="Are you sure you want to delete this invoice? This action cannot be undone and will remove all associated data."
            confirmText="Delete"
            confirmVariant="destructive"
          />
        )}

        {/* Duplicate Confirmation Dialog */}
        <ConfirmDialog
          open={showDuplicateDialog}
          onOpenChange={setShowDuplicateDialog}
          onConfirm={handleConfirmDuplicate}
          title="Duplicate Invoice"
          description="Are you sure you want to duplicate this invoice? A new draft invoice will be created."
          confirmText="Duplicate"
        />
      </div>
    </PageTemplate>
  );
}
