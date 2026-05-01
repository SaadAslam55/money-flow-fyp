// src/components/dashboard/RecentInvoices.tsx

import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/formatters';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Loader } from '@/components/common/Loader';
import type { RecentInvoice } from '@/types/dashboard.types';

interface RecentInvoicesProps {
  invoices?: RecentInvoice[];
  loading?: boolean;
}

export function RecentInvoices({ invoices, loading }: RecentInvoicesProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Loader size="md" message="Loading invoices..." />
        </CardContent>
      </Card>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Create your first invoice to get started"
            action={{
              label: 'Create Your First Invoice',
              onClick: () => navigate('/invoices/new'),
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Invoices</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/invoices')}
          className="h-8"
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => navigate(`/invoices/${invoice.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{invoice.invoice_number}</p>
                  <StatusBadge status={invoice.status} type="invoice" size="sm" />
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {invoice.customer.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(invoice.invoice_date)}
                </p>
              </div>
              <div className="text-right ml-4">
                <CurrencyDisplay amount={invoice.total_amount} size="sm" />
                {invoice.amount_due > 0 && (
                  <p className="text-sm text-muted-foreground whitespace-nowrap mt-1">
                    Due: <CurrencyDisplay amount={invoice.amount_due} variant="negative" size="sm" />
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}