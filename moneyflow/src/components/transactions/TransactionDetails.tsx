import { useState } from 'react';
import { Download, Edit, Trash2, Calendar, DollarSign, Tag, CreditCard, Building2, FileText, User, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useTransaction } from '@/hooks/useTransactions';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { PAYMENT_METHODS, TRANSACTION_TYPES } from '@/constants/status';
import type { Transaction } from '@/types/database.types';

interface TransactionDetailsProps {
  transactionId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (transactionId: string) => void;
  onDelete?: (transactionId: string) => void;
}

export function TransactionDetails({
  transactionId,
  open,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailsProps) {
  // All hooks must be called before any early returns
  const { transaction, isLoading } = useTransaction(transactionId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'expense':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Loader message="Loading transaction details..." />
        ) : !transaction ? (
          <EmptyState
            icon={FileText}
            title="Transaction not found"
            description="The transaction you're looking for doesn't exist or has been deleted."
          />
        ) : (
          <div className="space-y-6">
            {/* Header with Type and Amount */}
            <Card
              className={
                transaction.type === 'expense'
                  ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900'
                  : transaction.type === 'income'
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900'
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900'
              }
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(transaction.type)}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge
                          status={transaction.type === 'income' ? 'active' : transaction.type === 'expense' ? 'inactive' : 'pending'}
                          type="custom"
                          label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {transaction.type !== 'transfer' && (
                        <span className={transaction.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                          {transaction.type === 'expense' ? '-' : '+'}
                        </span>
                      )}
                      <CurrencyDisplay
                        amount={transaction.amount}
                        variant={transaction.type === 'expense' ? 'negative' : transaction.type === 'income' ? 'positive' : 'default'}
                        size="xl"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="font-medium">
                      {transaction.description || (
                        <span className="text-muted-foreground italic">No description</span>
                      )}
                    </p>
                  </div>

                  {(transaction as any).reference_number && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
                      <p className="font-medium">{(transaction as any).reference_number}</p>
                    </div>
                  )}

                  {transaction.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{transaction.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-medium">{formatDate(transaction.date)}</p>
                  </div>

                  {transaction.category && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Category</p>
                      <div className="flex items-center gap-2">
                        {(transaction.category as any)?.color && (
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: (transaction.category as any).color }}
                          />
                        )}
                        <p className="font-medium">{transaction.category.name}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                    <p className="font-medium">
                      {PAYMENT_METHODS.find((m) => m.value === transaction.payment_method)
                        ?.label || transaction.payment_method}
                    </p>
                  </div>

                  {transaction.bank_account ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Bank Account</p>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {transaction.bank_account.account_name}
                          {transaction.bank_account.bank_name && (
                            <span className="text-muted-foreground text-sm ml-1">
                              ({transaction.bank_account.bank_name})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                      <p className="font-medium">Cash</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Receipt */}
            {transaction.receipt_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Receipt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Receipt attached</p>
                        <p className="text-sm text-muted-foreground">Click to view</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(transaction.receipt_url!, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {transaction.created_by_user && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created by:</span>
                    <span className="font-medium">
                      {transaction.created_by_user.full_name || transaction.created_by_user.email}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDateTime(transaction.created_at)}</span>
                </div>
                {transaction.updated_at !== transaction.created_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last updated:</span>
                    <span className="font-medium">{formatDateTime(transaction.updated_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {(onEdit || onDelete) && (
              <>
                <Separator />
                <div className="flex justify-end gap-3">
                  {onEdit && (
                    <Button variant="outline" onClick={() => onEdit(transaction.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {transaction && onDelete && (
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={() => {
              onDelete(transaction.id);
              onClose();
              setDeleteDialogOpen(false);
            }}
            title="Delete Transaction"
            description="Are you sure you want to delete this transaction? This action cannot be undone."
            confirmText="Delete"
            confirmVariant="destructive"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

