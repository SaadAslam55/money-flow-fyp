// src/components/dashboard/TopCustomers.tsx

import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/formatters';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Loader } from '@/components/common/Loader';
import type { TopCustomer } from '@/types/dashboard.types';

interface TopCustomersProps {
  customers?: TopCustomer[];
  loading?: boolean;
}

export function TopCustomers({ customers, loading }: TopCustomersProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Loader size="md" message="Loading customers..." />
        </CardContent>
      </Card>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="No customer data yet"
            description="Add customers and create invoices to see top customers here"
            action={{
              label: 'Add Your First Customer',
              onClick: () => navigate('/customers/new'),
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Top Customers</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/customers')}
          className="h-8"
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => navigate(`/customers/${customer.id}`)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{customer.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{customer.invoice_count} invoices</span>
                    {customer.last_purchase_date && (
                      <>
                        <span>•</span>
                        <span>Last: {new Date(customer.last_purchase_date).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <CurrencyDisplay
                    amount={customer.total_revenue}
                    variant="positive"
                    size="sm"
                  />
                </div>
                {customer.outstanding_balance > 0 && (
                  <p className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                    Due: <CurrencyDisplay amount={customer.outstanding_balance} variant="negative" size="sm" />
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

