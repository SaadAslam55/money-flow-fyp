import React from 'react';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/formatters';
import { PAYMENT_METHODS } from '@/constants/status';
import type { Transaction } from '@/types/database.types';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onView: (transactionId: string) => void;
  onEdit: (transactionId: string) => void;
  onDelete: (transactionId: string) => void;
}

export function TransactionList({
  transactions,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  if (isLoading) {
    return <Loader message="Loading transactions..." />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No transactions found"
        description="Start recording your income and expenses to track your cash flow."
      />
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Bank Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction: Transaction) => (
              <TableRow
                key={transaction.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onView(transaction.id)}
              >
                <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(transaction.type)}
                    <StatusBadge
                      status={
                        transaction.type === 'income'
                          ? 'active'
                          : transaction.type === 'expense'
                            ? 'inactive'
                            : 'pending'
                      }
                      type="custom"
                      label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="max-w-xs">
                      <div className="truncate font-medium">
                        {transaction.description ?? 'No description'}
                      </div>
                    </div>
                    {transaction.receipt_url && (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.category ? (
                    <span>{transaction.category.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell>
                  {PAYMENT_METHODS.find((m) => m.value === transaction.payment_method)?.label ||
                    transaction.payment_method}
                </TableCell>
                <TableCell>
                  {transaction.bank_account ? (
                    <span className="text-sm">{transaction.bank_account.account_name}</span>
                  ) : (
                    <span className="text-muted-foreground">Cash</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {transaction.type !== 'transfer' && (
                    <span
                      className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}
                    >
                      {transaction.type === 'expense' ? '-' : '+'}
                    </span>
                  )}
                  <CurrencyDisplay
                    amount={transaction.amount}
                    variant={
                      transaction.type === 'expense'
                        ? 'negative'
                        : transaction.type === 'income'
                          ? 'positive'
                          : 'default'
                    }
                    size="sm"
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(transaction.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(transaction.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {transaction.receipt_url && (
                        <DropdownMenuItem
                          onClick={() => window.open(transaction.receipt_url!, '_blank')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Receipt
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(transaction.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {transactions.map((transaction: Transaction) => (
          <div
            key={transaction.id}
            className="cursor-pointer space-y-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            onClick={() => onView(transaction.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(transaction.type)}
                <div>
                  <div className="font-medium capitalize">{transaction.type}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {transaction.type !== 'transfer' && (
                    <span
                      className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}
                    >
                      {transaction.type === 'expense' ? '-' : '+'}
                    </span>
                  )}
                  <CurrencyDisplay
                    amount={transaction.amount}
                    variant={
                      transaction.type === 'expense'
                        ? 'negative'
                        : transaction.type === 'income'
                          ? 'positive'
                          : 'default'
                    }
                    size="lg"
                  />
                </div>
                {transaction.receipt_url && (
                  <FileText className="mt-1 inline-block h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="text-sm">
              {transaction.description || (
                <span className="text-muted-foreground">No description</span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-2 text-xs">
              {transaction.category && (
                <StatusBadge
                  status="active"
                  type="custom"
                  label={transaction.category.name}
                  size="sm"
                />
              )}
              <StatusBadge
                status="active"
                type="custom"
                label={
                  PAYMENT_METHODS.find((m) => m.value === transaction.payment_method)?.label ||
                  transaction.payment_method
                }
                size="sm"
              />
              {transaction.bank_account && (
                <StatusBadge
                  status="active"
                  type="custom"
                  label={transaction.bank_account.account_name}
                  size="sm"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end border-t pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(transaction.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(transaction.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {transaction.receipt_url && (
                    <DropdownMenuItem
                      onClick={() => window.open(transaction.receipt_url!, '_blank')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Receipt
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(transaction.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
