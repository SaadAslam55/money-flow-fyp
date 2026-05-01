// src/components/subscription/BillingHistory.tsx
import { logger } from '@/lib/logger';
import { useState } from 'react';
import { Download, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBillingHistory } from '@/hooks/useBillingHistory';
import { formatDate } from '@/lib/formatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { toast } from 'sonner';
import * as invoiceService from '@/services/payments/invoices';
import type { BillingInvoice } from '@/types/subscription.types';

interface BillingHistoryProps {
  organizationId?: string;
  limit?: number;
}

/**
 * Component for displaying billing history (invoices)
 */
export function BillingHistory({ organizationId, limit }: BillingHistoryProps) {
  const { invoices, isLoading, error, refetch } = useBillingHistory();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const displayInvoices = limit ? invoices.slice(0, limit) : invoices;

  const handleDownload = async (invoice: BillingInvoice) => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }

    setDownloadingIds((prev) => new Set(prev).add(invoice.id));

    try {
      const { url, error: downloadError } = await invoiceService.downloadInvoice(
        invoice.id,
        organizationId
      );

      if (downloadError || !url) {
        toast.error(downloadError?.message ?? 'Failed to download invoice');
        return;
      }

      // Open PDF in new tab
      window.open(url, '_blank');
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error('Failed to download invoice');

      logger.error('Download error:', error instanceof Error ? error.message : String(error));
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(invoice.id);
        return next;
      });
    }
  };


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your payment and invoice history</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader message="Loading billing history..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your payment and invoice history</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="Failed to load billing history"
            description="Unable to load your billing history. Please try again."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your payment and invoice history</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description="Your billing history will appear here once you have invoices."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>
          {limit ? `Showing ${displayInvoices.length} of ${invoices.length} invoices` : `${invoices.length} invoices`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{formatDate(invoice.created_at, 'medium')}</TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={invoice.amount} currency={invoice.currency} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={invoice.status === 'paid' ? 'active' : invoice.status === 'uncollectible' ? 'inactive' : 'pending'}
                      type="custom"
                      label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {invoice.hosted_invoice_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(invoice.hosted_invoice_url!, '_blank')}
                          title="View invoice"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(invoice)}
                        disabled={downloadingIds.has(invoice.id)}
                        title="Download invoice"
                      >
                        {downloadingIds.has(invoice.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

