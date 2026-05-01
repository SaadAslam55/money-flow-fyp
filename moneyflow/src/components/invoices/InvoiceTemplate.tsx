// src/components/invoices/InvoiceTemplate.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InvoiceLineItems } from './InvoiceLineItems';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { formatDate } from '@/lib/invoiceFormatters';
import type { InvoiceWithDetails } from '@/types/invoice.types';
import { useAuth } from '@/hooks/useAuth';
import { Building, Mail, Phone, Calendar, FileText, User } from 'lucide-react';

interface InvoiceTemplateProps {
  invoice: InvoiceWithDetails;
  showStatus?: boolean;
}

/**
 * InvoiceTemplate - Professional invoice template for rendering and PDF generation
 * 
 * @example
 * <InvoiceTemplate invoice={invoice} showStatus />
 */
export function InvoiceTemplate({ invoice, showStatus = true }: InvoiceTemplateProps) {
  const { organization } = useAuth();

  return (
    <Card className="mx-auto max-w-4xl border-2 print:border-0 print:shadow-none">
      <CardContent className="p-8 print:p-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between print:mb-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold print:text-2xl">INVOICE</h1>
            {showStatus && (
              <div className="mt-2">
                <StatusBadge status={invoice.status} type="invoice" size="md" />
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="mb-1 text-sm font-medium text-muted-foreground">
              Invoice Number
            </div>
            <div className="text-xl font-bold">{invoice.invoice_number}</div>
          </div>
        </div>

        <Separator className="mb-6 print:mb-4" />

        {/* Company and Customer Info */}
        <div className="mb-8 grid gap-8 sm:grid-cols-2 print:mb-6 print:grid-cols-2">
          {/* From (Company) */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">From</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">
                {organization?.name ?? 'Your Company Name'}
              </p>
              {organization?.address && (
                <p className="text-muted-foreground">{organization.address}</p>
              )}
              {organization?.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{organization.email}</span>
                </div>
              )}
              {organization?.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{organization.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* To (Customer) */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Bill To</h3>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{invoice.customer.name}</p>
              {invoice.customer.address && (
                <p className="text-muted-foreground">{invoice.customer.address}</p>
              )}
              {invoice.customer.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{invoice.customer.email}</span>
                </div>
              )}
              {invoice.customer.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{invoice.customer.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Dates */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 print:mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground text-sm">Invoice Date: </span>
              <span className="font-medium">{formatDate(invoice.invoice_date)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground text-sm">Due Date: </span>
              <span className="font-medium">{formatDate(invoice.due_date)}</span>
            </div>
          </div>
        </div>

        <Separator className="mb-6 print:mb-4" />

        {/* Line Items */}
        <InvoiceLineItems items={invoice.items} showProductInfo />

        {/* Totals */}
        <div className="mt-6 print:mt-4">
          <div className="ml-auto max-w-md space-y-2">
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
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <CurrencyDisplay amount={invoice.amount_paid} variant="positive" size="sm" />
                </div>
                <div className="flex justify-between text-sm font-semibold">
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
        </div>

        {/* Notes and Terms */}
        {(invoice.notes || invoice.terms) && (
          <>
            <Separator className="my-6 print:my-4" />
            <div className="space-y-4 print:space-y-3">
              {invoice.notes && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold">Notes</h4>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold">Payment Terms</h4>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                    {invoice.terms}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <Separator className="my-6 print:my-4" />
        <div className="text-center text-muted-foreground text-xs print:text-xs">
          <p>Thank you for your business!</p>
          <p className="mt-1">
            This is a computer-generated invoice. No signature required.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

