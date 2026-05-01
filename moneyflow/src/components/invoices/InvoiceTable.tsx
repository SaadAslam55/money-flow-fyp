// src/components/invoices/InvoiceTable.tsx
/**
 * InvoiceTable Component
 * Reusable table component for displaying invoices
 * Can be used independently or as part of InvoiceList
 */

import { useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, DollarSign, Send, Download, Copy, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, calculateDaysUntilDue } from '@/lib/invoiceFormatters';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { InvoiceWithDetails } from '@/types/invoice.types';
import type { InvoiceStatus } from '@/types/database.types';

interface InvoiceTableProps {
  invoices: InvoiceWithDetails[];
  onView?: (invoiceId: string) => void;
  onRecordPayment?: (invoiceId: string) => void;
  onSend?: (invoiceId: string) => void;
  onDownload?: (invoiceId: string) => void;
  onDuplicate?: (invoiceId: string) => void;
  onDelete?: (invoiceId: string) => void;
  showActions?: boolean;
}

export function InvoiceTable({
  invoices,
  onView,
  onRecordPayment,
  onSend,
  onDownload,
  onDuplicate,
  onDelete,
  showActions = true,
}: InvoiceTableProps) {
  const navigate = useNavigate();

  const handleView = (invoiceId: string) => {
    if (onView) {
      onView(invoiceId);
    } else {
      navigate(`/invoices/${invoiceId}`);
    }
  };


  const getDueDateBadge = (invoice: InvoiceWithDetails) => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return null;
    }

    const { isOverdue, label } = calculateDaysUntilDue(invoice.due_date);

    if (isOverdue) {
      return <span className="text-xs font-medium text-red-600">{label}</span>;
    } else if (new Date(invoice.due_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) {
      return <span className="text-xs font-medium text-orange-600">{label}</span>;
    }

    return null;
  };

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No invoices to display"
        description="There are no invoices to show in this table"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Invoice #</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Due Date</TableHead>
            <TableHead className="font-semibold text-right">Amount</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            {showActions && <TableHead className="w-12"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleView(invoice.id)}
            >
              <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{invoice.customer.name}</div>
                  {invoice.customer.email && (
                    <div className="text-muted-foreground text-sm">{invoice.customer.email}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div
                    className={
                      new Date(invoice.due_date) < new Date() && invoice.status !== 'paid'
                        ? 'text-destructive font-medium'
                        : ''
                    }
                  >
                    {formatDate(invoice.due_date)}
                  </div>
                  {getDueDateBadge(invoice)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <CurrencyDisplay amount={invoice.total_amount} size="sm" />
                  {invoice.amount_due > 0 && invoice.status !== 'paid' && (
                    <div className="text-muted-foreground text-sm mt-1">
                      Due: <CurrencyDisplay amount={invoice.amount_due} variant="negative" size="sm" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={invoice.status} type="invoice" size="sm" />
              </TableCell>
              {showActions && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleView(invoice.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && onRecordPayment && (
                        <DropdownMenuItem onClick={() => onRecordPayment(invoice.id)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Record Payment
                        </DropdownMenuItem>
                      )}
                      {onSend && (
                        <DropdownMenuItem onClick={() => onSend(invoice.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          Send Invoice
                        </DropdownMenuItem>
                      )}
                      {onDownload && (
                        <DropdownMenuItem onClick={() => onDownload(invoice.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                      )}
                      {onDuplicate && (
                        <DropdownMenuItem onClick={() => onDuplicate(invoice.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onDelete && invoice.status !== 'paid' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(invoice.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

