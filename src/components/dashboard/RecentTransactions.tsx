// src/components/dashboard/RecentTransactions.tsx

import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatRelativeTime } from '@/lib/formatters';
import { TRANSACTION_TYPES } from '@/constants/status';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Loader } from '@/components/common/Loader';
import type { Transaction } from '@/types/database.types';

interface RecentTransactionsProps {
  transactions?: Transaction[];
  loading?: boolean;
}

export function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
  const navigate = useNavigate();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return TrendingUp;
      case 'expense':
        return TrendingDown;
      case 'transfer':
        return ArrowRightLeft;
      default:
        return ArrowRightLeft;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600 dark:text-green-400';
      case 'expense':
        return 'text-red-600 dark:text-red-400';
      case 'transfer':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const config = TRANSACTION_TYPES.find((t) => t.value === type);
    return config?.label || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Loader size="md" message="Loading transactions..." />
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ArrowRightLeft}
            title="No transactions yet"
            description="Record your first transaction to start tracking income and expenses"
            action={{
              label: 'Record Your First Transaction',
              onClick: () => navigate('/transactions/new'),
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Transactions</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/transactions')}
          className="h-8"
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const Icon = getTransactionIcon(transaction.type);
            const colorClass = getTransactionColor(transaction.type);
            const typeLabel = getTransactionTypeLabel(transaction.type);

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => navigate(`/transactions/${transaction.id}`)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${colorClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {transaction.description || typeLabel}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {typeLabel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(transaction.date)}</span>
                      {transaction.category && (
                        <>
                          <span>•</span>
                          <span>{transaction.category.name}</span>
                        </>
                      )}
                      {transaction.bank_account && (
                        <>
                          <span>•</span>
                          <span className="truncate">{transaction.bank_account.account_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <CurrencyDisplay
                    amount={transaction.amount}
                    variant={transaction.type === 'income' ? 'positive' : 'negative'}
                    size="sm"
                  />
                  <p className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                    {formatRelativeTime(transaction.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

