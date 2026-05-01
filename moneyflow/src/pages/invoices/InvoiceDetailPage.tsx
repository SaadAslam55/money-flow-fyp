// src/pages/invoices/InvoiceDetailPage.tsx
/**
 * Invoice Detail Page
 * Page for viewing invoice details, recording payments, and managing invoice actions
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Download,
  Edit,
  Trash2,
  DollarSign,
  MoreVertical,
  Copy,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useInvoice, useInvoices } from '@/hooks/useInvoices';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { formatDate, calculateDaysUntilDue, getRelativeTime } from '@/lib/invoiceFormatters';
import { INVOICE_STATUS } from '@/constants/invoiceStatus';
import { PaymentDialog } from '@/components/invoices/PaymentDialog';
import { SendInvoiceDialog } from '@/components/invoices/SendInvoiceDialog';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoice, isLoading } = useInvoice(id ?? '');
  const { deleteInvoice, duplicateInvoice, downloadInvoicePDF } = useInvoices();
  const { hasPermission } = usePermissions();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const canEdit = hasPermission('financial:edit_invoices');
  const canDelete = hasPermission('financial:delete_invoices');
  const canSend = hasPermission('financial:send_invoices');

  // Track page view
  useEffect(() => {
    if (id) {
      trackPageView(`/invoices/${id}`, 'Invoice Detail');
    }
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <PageTemplate title="Invoice Details">
        <Loader message="Loading invoice details..." />
      </PageTemplate>
    );
  }

  // Not found state
  if (!invoice) {
    return (
      <PageTemplate
        title="Invoice Not Found"
        description="The invoice you're looking for doesn't exist or has been deleted"
      >
        <EmptyState
          icon={FileText}
          title="Invoice Not Found"
          description="The invoice you're looking for doesn't exist or has been deleted."
          action={{
            label: 'Back to Invoices',
            onClick: () => navigate('/invoices'),
          }}
        />
      </PageTemplate>
    );
  }

  const statusConfig = INVOICE_STATUS[invoice.status];
  const { label: dueDateLabel, isOverdue } = calculateDaysUntilDue(invoice.due_date);

  // Handlers
  const handleEdit = () => {
    trackUserAction('edit_invoice_clicked', 'invoices', id ?? '');
    navigate(`/invoices/${id}/edit`);
  };

  const handleDownload = async () => {
    if (!id) return;
    trackUserAction('download_invoice_pdf_clicked', 'invoices', id);
    try {
      await downloadInvoicePDF(id);
      toast.success('Invoice PDF downloaded');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download PDF';
      toast.error(message);
    }
  };

  const handleDuplicate = () => {
    trackUserAction('duplicate_invoice_clicked', 'invoices', id ?? '');
    setShowDuplicateDialog(true);
  };

  const handleConfirmDuplicate = async () => {
    if (!id) return;
    try {
      await duplicateInvoice(id);
      trackUserAction('duplicate_invoice_success', 'invoices', id);
      toast.success('Invoice duplicated successfully');
      setShowDuplicateDialog(false);
    } catch (error) {
      trackUserAction('duplicate_invoice_failed', 'invoices', id);
      const message = error instanceof Error ? error.message : 'Failed to duplicate invoice';
      toast.error(message);
    }
  };

  const handleDelete = () => {
    trackUserAction('delete_invoice_clicked', 'invoices', id ?? '');
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteInvoice(id);
      trackUserAction('delete_invoice_success', 'invoices', id);
      toast.success('Invoice deleted successfully');
      navigate('/invoices');
    } catch (error) {
      trackUserAction('delete_invoice_failed', 'invoices', id);
      const message = error instanceof Error ? error.message : 'Failed to delete invoice';
      toast.error(message);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleSend = () => {
    trackUserAction('send_invoice_clicked', 'invoices', id ?? '');
    setShowSendDialog(true);
  };

  const handleRecordPayment = () => {
    trackUserAction('record_payment_clicked', 'invoices', id ?? '');
    setShowPaymentDialog(true);
  };

  const actions = (
    <div className="flex gap-2">
      {canSend && (
        <Button variant="outline" onClick={handleSend}>
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      )}
      <Button
        variant="outline"
        onClick={handleRecordPayment}
        disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
      >
        <DollarSign className="mr-2 h-4 w-4" />
        Record Payment
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Invoice
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Invoice
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <PageTemplate
      title={invoice.invoice_number}
      description={`Invoice created ${getRelativeTime(invoice.created_at)}`}
      keywords={`invoice, ${invoice.invoice_number}, ${invoice.customer.name}`}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center gap-4">
          <StatusBadge
            status={
              invoice.status === 'paid'
                ? 'active'
                : invoice.status === 'overdue'
                  ? 'inactive'
                  : 'pending'
            }
            type="invoice"
            label={statusConfig.label}
          />
          <span className="text-sm text-muted-foreground">
            Created {getRelativeTime(invoice.created_at)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Invoice Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Parties Info */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Bill To */}
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">BILL TO</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{invoice.customer.name}</p>
                        </div>
                      </div>
                      {invoice.customer.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${invoice.customer.email}`}
                            className="text-indigo-600 hover:underline"
                          >
                            {invoice.customer.email}
                          </a>
                        </div>
                      )}
                      {invoice.customer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`tel:${invoice.customer.phone}`}
                            className="text-indigo-600 hover:underline"
                          >
                            {invoice.customer.phone}
                          </a>
                        </div>
                      )}
                      {invoice.customer.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <p className="text-muted-foreground">{invoice.customer.address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoice Info */}
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                      INVOICE INFO
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Invoice Number:</span>
                        <span className="font-medium">{invoice.invoice_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Invoice Date:
                        </span>
                        <span className="font-medium">{formatDate(invoice.invoice_date)}</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Due Date:
                        </span>
                        <div className="text-right">
                          <span
                            className={`font-medium ${
                              isOverdue && invoice.status !== 'paid' ? 'text-destructive' : ''
                            }`}
                          >
                            {formatDate(invoice.due_date)}
                          </span>
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <p
                              className={`text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}
                            >
                              {dueDateLabel}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Line Items */}
                <div>
                  <h3 className="mb-3 font-semibold">Items</h3>
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium">Description</th>
                          <th className="w-20 p-3 text-right text-sm font-medium">Qty</th>
                          <th className="w-28 p-3 text-right text-sm font-medium">Price</th>
                          <th className="w-20 p-3 text-right text-sm font-medium">Tax</th>
                          <th className="w-28 p-3 text-right text-sm font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invoice.items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3">
                              <div className="font-medium">{item.description}</div>
                              {item.product && (
                                <div className="text-sm text-muted-foreground">
                                  SKU: {item.product.sku}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-right">{item.quantity}</td>
                            <td className="p-3 text-right">
                              <CurrencyDisplay amount={item.unit_price} size="sm" />
                            </td>
                            <td className="p-3 text-right text-sm text-muted-foreground">
                              {item.tax_rate}%
                            </td>
                            <td className="p-3 text-right font-medium">
                              <CurrencyDisplay amount={item.line_total} size="sm" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-3">
                  <Separator />
                  <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <CurrencyDisplay amount={invoice.subtotal} size="sm" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (GST):</span>
                        <CurrencyDisplay amount={invoice.tax_amount} size="sm" />
                      </div>
                      {invoice.discount_amount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount:</span>
                          <CurrencyDisplay
                            amount={-invoice.discount_amount}
                            variant="negative"
                            size="sm"
                          />
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <CurrencyDisplay amount={invoice.total_amount} size="lg" />
                      </div>
                      {invoice.amount_paid > 0 && (
                        <>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Amount Paid:</span>
                            <CurrencyDisplay
                              amount={-invoice.amount_paid}
                              variant="negative"
                              size="sm"
                            />
                          </div>
                          <div className="flex justify-between border-t pt-2 text-lg font-bold">
                            <span>Amount Due:</span>
                            <CurrencyDisplay
                              amount={invoice.amount_due}
                              variant={invoice.amount_due > 0 ? 'negative' : 'positive'}
                              size="lg"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes & Terms */}
                {(invoice.notes || invoice.terms) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      {invoice.notes && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold">Notes</h3>
                          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {invoice.notes}
                          </p>
                        </div>
                      )}
                      {invoice.terms && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold">Payment Terms</h3>
                          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {invoice.terms}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 text-sm text-muted-foreground">Current Status</div>
                  <StatusBadge
                    status={
                      invoice.status === 'paid'
                        ? 'active'
                        : invoice.status === 'overdue'
                          ? 'inactive'
                          : 'pending'
                    }
                    type="invoice"
                    label={statusConfig.label}
                    size="lg"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{statusConfig.description}</p>
                </div>
                {invoice.status !== 'paid' && invoice.amount_due > 0 && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleRecordPayment}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Record Payment
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <CurrencyDisplay amount={invoice.total_amount} size="sm" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <CurrencyDisplay amount={invoice.amount_paid} variant="positive" size="sm" />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount Due:</span>
                  <CurrencyDisplay
                    amount={invoice.amount_due}
                    variant={invoice.amount_due > 0 ? 'negative' : 'positive'}
                    size="lg"
                  />
                </div>
                {invoice.amount_paid > 0 && invoice.amount_due > 0 && (
                  <div className="pt-2">
                    <div className="mb-2 text-xs text-muted-foreground">Payment Progress</div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-600 transition-all"
                        style={{
                          width: `${Math.min((invoice.amount_paid / invoice.total_amount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {Math.round((invoice.amount_paid / invoice.total_amount) * 100)}% paid
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created by:</span>
                    <span className="font-medium">{invoice.created_by_user.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{formatDate(invoice.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last updated:</span>
                    <span className="font-medium">{formatDate(invoice.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogs */}
        {showPaymentDialog && (
          <PaymentDialog
            invoice={invoice}
            open={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
          />
        )}
        {showSendDialog && (
          <SendInvoiceDialog
            invoice={invoice}
            open={showSendDialog}
            onClose={() => setShowSendDialog(false)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {canDelete && (
          <ConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleConfirmDelete}
            title="Delete Invoice"
            description={`Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone and will remove all associated data.`}
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
          description={`Are you sure you want to duplicate invoice ${invoice.invoice_number}? A new draft invoice will be created.`}
          confirmText="Duplicate"
        />
      </div>
    </PageTemplate>
  );
}
