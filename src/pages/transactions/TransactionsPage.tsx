// src/pages/transactions/TransactionsPage.tsx
/**
 * Transactions Page
 * Main page for viewing, creating, editing, and managing financial transactions
 */

import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Download, Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { PageTemplate } from '@/components/common/PageTemplate';
import { SearchBar } from '@/components/common/SearchBar';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionDetails } from '@/components/transactions/TransactionDetails';
import { TransactionFiltersComponent } from '@/components/transactions/TransactionFilters';
import { BankReconciliation } from '@/components/transactions/BankReconciliation';
import { useTransactions, useTransactionSummary } from '@/hooks/useTransactions';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { exportToCSV } from '@/lib/csvExport';
import type { TransactionFormData } from '@/schemas/transactionSchemas';
import type { TransactionFilters } from '@/types/database.types';

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(location.pathname.endsWith('/new'));
  const [showReconcileDialog, setShowReconcileDialog] = useState(false);

  // Sync dialog with URL for quick actions
  useEffect(() => {
    if (location.pathname.endsWith('/new')) {
      setShowCreateDialog(true);
    }
  }, [location.pathname]);
  const [viewingTransactionId, setViewingTransactionId] = useState<string | null>(null);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const { hasPermission } = usePermissions();

  // Date range for summary (current month by default)
  const [dateRange] = useState<{ start: string; end: string }>(() => {
    const firstOfMonthIso = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    const todayIso = new Date().toISOString();
    return {
      start: firstOfMonthIso.slice(0, 10),
      end: todayIso.slice(0, 10),
    };
  });

  const { transactions, count, totalPages, isLoading, createTransaction, updateTransaction, deleteTransaction, isCreating, isUpdating } = useTransactions(filters, page);

  const { summary } = useTransactionSummary(dateRange.start, dateRange.end);

  // Track page view
  useEffect(() => {
    trackPageView('/transactions', 'Transactions');
  }, []);

  const canCreate = hasPermission('financial:create_transactions');
  const canDelete = hasPermission('financial:delete_transactions');
  const canReconcile = hasPermission('financial:reconcile_accounts');

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.category_id && filters.category_id.length > 0) count++;
    if (filters.bank_account_id && filters.bank_account_id.length > 0) count++;
    if (filters.payment_method && filters.payment_method.length > 0) count++;
    if (filters.date_from) count++;
    if (filters.date_to) count++;
    if (filters.amount_min !== undefined) count++;
    if (filters.amount_max !== undefined) count++;
    return count;
  }, [filters]);

  const handleSearch = (search: string) => {
    setSearchQuery(search);
    setFilters((prev) => ({ ...prev, search: search || undefined }));
    setPage(1);
    if (search) {
      trackUserAction('transaction_search', 'transactions', search);
    }
  };

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPage(1);
    trackUserAction(
      'transaction_filters_changed',
      'transactions',
      Object.keys(newFilters).join(',')
    );
  };

  const handleCreate = async (data: TransactionFormData, file?: File) => {
    trackUserAction('transaction_create_initiated', 'transactions', data.type);
    await createTransaction({ data, file });
    setShowCreateDialog(false);
    trackUserAction('transaction_created', 'transactions', data.type);
  };

  const handleView = (transactionId: string) => {
    trackUserAction('transaction_viewed', 'transactions', transactionId);
    setViewingTransactionId(transactionId);
  };

  const handleEdit = (transactionId: string) => {
    trackUserAction('transaction_edit_initiated', 'transactions', transactionId);
    setViewingTransactionId(null); // Close details dialog if open
    setEditingTransactionId(transactionId);
  };

  const handleUpdate = async (data: TransactionFormData, file?: File) => {
    if (!editingTransactionId) return;
    trackUserAction('transaction_update_initiated', 'transactions', editingTransactionId);
    await updateTransaction({ id: editingTransactionId, data, file });
    setEditingTransactionId(null);
    trackUserAction('transaction_updated', 'transactions', editingTransactionId);
  };

  // Get the transaction being edited
  const editingTransaction = editingTransactionId 
    ? transactions.find(t => t.id === editingTransactionId) 
    : null;

  const handleDeleteClick = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (transactionToDelete) {
      trackUserAction('transaction_delete_initiated', 'transactions', transactionToDelete);
      await deleteTransaction(transactionToDelete);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
      trackUserAction('transaction_deleted', 'transactions', transactionToDelete);
    }
  };

  const handleExport = () => {
    trackUserAction('transaction_export_clicked', 'transactions', 'export');
    exportToCSV(
      transactions,
      [
        { key: 'date', label: 'Date' },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description' },
        { key: 'amount', label: 'Amount' },
        { key: 'payment_method', label: 'Payment Method' },
        { key: 'category_id', label: 'Category' },
        { key: 'bank_account_id', label: 'Bank Account' },
      ],
      'transactions'
    );
  };

  const handlePageChange = (newPage: number) => {
    trackUserAction('transaction_page_changed', 'transactions', newPage.toString());
    setPage(newPage);
  };

  return (
    <PageTemplate
      title="Transactions"
      description="Track all your income and expenses"
      keywords="transactions, income, expenses, cash flow, financial records"
      actions={
        <div className="flex flex-wrap gap-2">
          {canReconcile && (
            <Button
              variant="outline"
              onClick={() => {
                trackUserAction('reconcile_clicked', 'transactions', 'header');
                setShowReconcileDialog(true);
              }}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Reconcile
            </Button>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {canCreate && (
            <Button
              onClick={() => {
                trackUserAction('create_transaction_clicked', 'transactions', 'header');
                setShowCreateDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Total Income</p>
                    <CurrencyDisplay amount={summary.total_income} variant="positive" size="xl" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {summary.income_count} transactions
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Total Expenses</p>
                    <CurrencyDisplay amount={summary.total_expenses} variant="negative" size="xl" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {summary.expense_count} transactions
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Net Cash Flow</p>
                    <CurrencyDisplay
                      amount={summary.net_cashflow}
                      variant={summary.net_cashflow >= 0 ? 'positive' : 'negative'}
                      size="xl"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">This month</p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      summary.net_cashflow >= 0
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-red-100 dark:bg-red-900'
                    }`}
                  >
                    <DollarSign
                      className={`h-6 w-6 ${
                        summary.net_cashflow >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <SearchBar
              placeholder="Search transactions..."
              value={searchQuery}
              onSearch={handleSearch}
            />
          </div>
          <TransactionFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Transaction List */}
        <Card>
          <CardContent className="p-6">
            <TransactionList
              transactions={transactions}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNum)}
                              isActive={pageNum === page}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (pageNum === page - 2 || pageNum === page + 2) {
                        return (
                          <PaginationItem key={pageNum}>
                            <span className="px-4">...</span>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                        className={
                          page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Showing {transactions.length} of {count} transactions
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Transaction Dialog */}
        <Dialog 
          open={showCreateDialog} 
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open && location.pathname.endsWith('/new')) {
              navigate('/transactions', { replace: true });
            }
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Record New Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateDialog(false)}
              isSubmitting={isCreating}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Transaction Dialog */}
        <Dialog open={!!editingTransactionId} onOpenChange={(open) => !open && setEditingTransactionId(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            {editingTransaction && (
              <TransactionForm
                initialData={{
                  type: editingTransaction.type,
                  amount: editingTransaction.amount,
                  date: editingTransaction.date,
                  description: editingTransaction.description || '',
                  category_id: editingTransaction.category_id || undefined,
                  bank_account_id: editingTransaction.bank_account_id || undefined,
                  payment_method: (editingTransaction.payment_method || 'cash') as 'cash' | 'bank_transfer' | 'card' | 'check' | 'upi' | 'other' | 'jazzcash' | 'easypaisa' | 'raast',
                  notes: editingTransaction.notes || '',
                  receipt_url: editingTransaction.receipt_url || undefined,
                }}
                onSubmit={handleUpdate}
                onCancel={() => setEditingTransactionId(null)}
                submitLabel="Update Transaction"
                isSubmitting={isUpdating}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Transaction Details Dialog */}
        <TransactionDetails
          transactionId={viewingTransactionId}
          open={!!viewingTransactionId}
          onClose={() => setViewingTransactionId(null)}
          onEdit={handleEdit}
          onDelete={canDelete ? handleDeleteClick : undefined}
        />

        {/* Bank Reconciliation Dialog */}
        {canReconcile && (
          <BankReconciliation
            open={showReconcileDialog}
            onClose={() => setShowReconcileDialog(false)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="Delete Transaction"
          description="Are you sure you want to delete this transaction? This action cannot be undone."
          confirmText="Delete"
          confirmVariant="destructive"
        />
      </div>
    </PageTemplate>
  );
}
