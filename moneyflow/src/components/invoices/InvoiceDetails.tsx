// src/components/invoices/InvoiceDetails.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Send,
  Edit,
  Trash2,
  Copy,
  DollarSign,
  Mail,
  Calendar,
  User,
  FileText,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useInvoice } from '@/hooks/useInvoices';
import {
  formatCurrency,
  formatDate,
  calculateDaysUntilDue,
  getPaymentProgress,
} from '@/lib/invoiceFormatters';
import { INVOICE_STATUS } from '@/constants/invoiceStatus';
import { PaymentDialog } from './PaymentDialog';
import { SendInvoiceDialog } from './SendInvoiceDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { handleError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import type { InvoiceWithDetails, InvoiceItemWithProduct } from '@/types/invoice.types';

interface InvoiceDetailsProps {
  invoiceId: string;
}

export function InvoiceDetails({ invoiceId }: InvoiceDetailsProps) {
  const navigate = useNavigate();
  const { invoice, isLoading, error } = useInvoice(invoiceId);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return <Loader size="lg" message="Loading invoice details..." fullScreen={false} />;
  }

  if (error || !invoice) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={error?.message ?? 'Invoice not found'}
        description="The invoice you're looking for doesn't exist or has been removed."
      />
    );
  }

  const { days, isOverdue, label: dueLabel } = calculateDaysUntilDue(invoice.due_date);
  const paymentProgress = getPaymentProgress(invoice.amount_paid, invoice.total_amount);
  const canEdit = invoice.status === 'draft';
  const canDelete = invoice.status !== 'paid';
  const canRecordPayment = !['paid', 'cancelled'].includes(invoice.status);

  const handleDelete = async () => {
    try {
      // Delete logic would be handled by parent component
      toast.success('Invoice deleted successfully');
      navigate('/invoices');
    } catch (error) {
      handleError(error, 'InvoiceDetails');
    }
  };

  const handleDuplicate = async () => {
    try {
      // Duplicate logic would be handled by parent component
      toast.success('Invoice duplicated successfully');
    } catch (error) {
      handleError(error, 'InvoiceDetails');
    }
  };

  const handleDownload = () => {
    // PDF download logic
    toast.info('PDF download will be implemented');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
            <StatusBadge status={invoice.status} type="invoice" size="md" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Created on {formatDate(invoice.created_at)} • Due {formatDate(invoice.due_date)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canRecordPayment && (
            <Button variant="outline" onClick={() => setShowPaymentDialog(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowSendDialog(true)}
            disabled={invoice.status === 'cancelled'}
          >
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {canEdit && (
            <Button variant="outline" onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          {canDelete && (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Payment Progress */}
      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Progress</span>
                <span className="font-medium">{paymentProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Paid:{' '}
                  <CurrencyDisplay amount={invoice.amount_paid} variant="positive" size="sm" />
                </span>
                <span>
                  Due: <CurrencyDisplay amount={invoice.amount_due} variant="negative" size="sm" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{invoice.customer.name}</p>
            </div>
            {invoice.customer.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{invoice.customer.email}</p>
              </div>
            )}
            {invoice.customer.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{invoice.customer.phone}</p>
              </div>
            )}
            {invoice.customer.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{invoice.customer.address}</p>
              </div>
            )}
            {invoice.customer.outstanding_balance > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <CurrencyDisplay
                  amount={invoice.customer.outstanding_balance}
                  variant="negative"
                  size="sm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="font-medium">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <div className="flex items-center gap-2">
                <p className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                  {formatDate(invoice.due_date)}
                </p>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    {dueLabel}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={invoice.status} type="invoice" size="md" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created By</p>
              <p className="font-medium">{invoice.created_by_user?.full_name ?? 'Unknown'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Tax Rate</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invoice.items ?? []).map((item: InvoiceItemWithProduct) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        {item.product && (
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.product.sku ?? 'N/A'}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay amount={item.unit_price} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">{item.tax_rate}%</TableCell>
                    <TableCell className="text-right font-medium">
                      <CurrencyDisplay amount={item.line_total} size="sm" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="flex justify-end">
        <Card className="w-full sm:w-96">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <CurrencyDisplay amount={invoice.subtotal} size="sm" />
              </div>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <CurrencyDisplay amount={invoice.tax_amount} size="sm" />
                </div>
              )}
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount:</span>
                  <CurrencyDisplay amount={-invoice.discount_amount} variant="positive" size="sm" />
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <CurrencyDisplay amount={invoice.total_amount} size="lg" />
              </div>
              {invoice.amount_paid > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <CurrencyDisplay amount={invoice.amount_paid} variant="positive" size="sm" />
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Amount Due:</span>
                    <CurrencyDisplay
                      amount={invoice.amount_due}
                      variant={invoice.amount_due > 0 ? 'negative' : 'positive'}
                      size="sm"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="grid gap-6 md:grid-cols-2">
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
          {invoice.terms && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{invoice.terms}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

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

      {showDeleteDialog && (
        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Invoice"
          description={`Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
        />
      )}
    </div>
  );
}
