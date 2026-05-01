// src/components/customers/CustomerDetail.tsx
import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar,
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { formatDate } from '@/lib/formatters';
import { useCustomer } from '@/hooks/useCustomers';
import type { Customer, Invoice, Transaction } from '@/types/database.types';

interface CustomerDetailProps {
  customerId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CustomerDetail({ customerId, onEdit, onDelete }: CustomerDetailProps) {
  const { customer, isLoading, error } = useCustomer(customerId);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return <Loader size="lg" message="Loading customer details..." fullScreen={false} />;
  }

  if (error || !customer) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={error?.message ?? 'Customer not found'}
        description="The customer you're looking for doesn't exist or has been removed."
      />
    );
  }

  const invoices = (customer as any).invoices ?? [];
  const transactions = (customer as any).transactions ?? [];
  const totalPurchases = (customer as any).total_purchases ?? 0;
  const lastPurchaseDate = (customer as any).last_purchase_date;

  // Calculate statistics
  const paidInvoices = invoices.filter((inv: Invoice) => inv.status === 'paid');
  const pendingInvoices = invoices.filter((inv: Invoice) => 
    ['sent', 'partially_paid', 'overdue'].includes(inv.status)
  );
  const totalInvoices = invoices.length;
  const averageInvoiceAmount = totalInvoices > 0 
    ? invoices.reduce((sum: number, inv: Invoice) => sum + inv.total_amount, 0) / totalInvoices 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">{customer.name}</h2>
          {customer.portal_access && (
            <Badge variant="secondary" className="mt-2">
              Portal Access Enabled
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay
              amount={customer.outstanding_balance}
              variant={customer.outstanding_balance > 0 ? 'negative' : 'default'}
              size="xl"
            />
            {customer.outstanding_balance > customer.credit_limit && (
              <p className="text-xs text-destructive mt-1">Over credit limit</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={totalPurchases} size="xl" />
            <p className="text-xs text-muted-foreground mt-1">
              {paidInvoices.length} paid invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDisplay amount={customer.credit_limit} size="xl" />
            <p className="text-xs text-muted-foreground mt-1">
              {customer.credit_limit > 0 ? 'Credit enabled' : 'No credit limit'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingInvoices.length} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="transactions">
            Transactions ({transactions.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                  </div>
                )}
                {(customer.address || customer.city || customer.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {[
                          customer.address,
                          customer.city,
                          customer.country,
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                {customer.tax_id && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Tax ID</p>
                      <p className="text-sm text-muted-foreground">{customer.tax_id}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Credit Limit</span>
                    <CurrencyDisplay amount={customer.credit_limit} size="sm" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Outstanding Balance</span>
                    <CurrencyDisplay
                      amount={customer.outstanding_balance}
                      variant={customer.outstanding_balance > 0 ? 'negative' : 'default'}
                      size="sm"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Available Credit</span>
                    <CurrencyDisplay
                      amount={Math.max(0, customer.credit_limit - customer.outstanding_balance)}
                      size="sm"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Purchases</span>
                    <CurrencyDisplay amount={totalPurchases} size="sm" />
                  </div>
                  <Separator />
                  {averageInvoiceAmount > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Average Invoice</span>
                        <CurrencyDisplay amount={averageInvoiceAmount} size="sm" />
                      </div>
                      <Separator />
                    </>
                  )}
                  {lastPurchaseDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Purchase</span>
                      <span className="font-medium">{formatDate(lastPurchaseDate)}</span>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No invoices found"
                  description="This customer hasn't received any invoices yet."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice: Invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number || invoice.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} type="invoice" />
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={invoice.total_amount} size="sm" />
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay
                            amount={invoice.amount_due}
                            variant={invoice.amount_due > 0 ? 'negative' : 'default'}
                            size="sm"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No transactions found"
                  description="This customer doesn't have any transaction history yet."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: Transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            transaction.type === 'income' ? 'default' : 'secondary'
                          }>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.description ?? 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay
                            amount={transaction.amount}
                            variant={transaction.type === 'income' ? 'positive' : 'negative'}
                            size="sm"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

