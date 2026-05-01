// src/services/api/dashboardApi.ts
/**
 * Dashboard API Service
 * Handles dashboard data aggregation and statistics
 * Includes revenue, expenses, cash flow, and activity metrics
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import { withAuthQuery } from '@/lib/apiInterceptor';
import type {
  DashboardStats,
  ChartData,
  RecentInvoice,
  TopCustomer,
  ActivityItem,
} from '@/types/dashboard.types';
import type { Transaction, Invoice, Customer, Product } from '@/types/database.types';

const FALLBACK_STATS: DashboardStats = {
  revenue: 0,
  revenue_change: 0,
  outstanding: 0,
  customers: 0,
  invoices: 0,
};

const FALLBACK_CHART_DATA: ChartData[] = [
  { month: 'Jan', revenue: 0, expenses: 0 },
  { month: 'Feb', revenue: 0, expenses: 0 },
  { month: 'Mar', revenue: 0, expenses: 0 },
  { month: 'Apr', revenue: 0, expenses: 0 },
  { month: 'May', revenue: 0, expenses: 0 },
  { month: 'Jun', revenue: 0, expenses: 0 },
];

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(organizationId: string): Promise<DashboardStats> {
  try {
    // Validate input
    if (!organizationId) {
      logger.warn('getDashboardStats: No organization ID provided');
      return FALLBACK_STATS;
    }

    // Check Supabase configuration
    if (!supabase) {
      logger.error('getDashboardStats: Supabase client not initialized');
      return FALLBACK_STATS;
    }

    const result = await withAuthQuery(async () => {
      // Get current month stats
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const lastMonth = new Date(currentMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Execute queries in parallel for better performance
      const [revenueResult, lastRevenueResult, outstandingResult, customerResult, invoiceResult] =
        await Promise.all([
          // Get revenue (current month)
          supabase
            .from('transactions')
            .select('amount')
            .eq('organization_id', organizationId)
            .eq('type', 'income')
            .gte('date', currentMonth.toISOString().split('T')[0]),

          // Get revenue (last month) for comparison
          supabase
            .from('transactions')
            .select('amount')
            .eq('organization_id', organizationId)
            .eq('type', 'income')
            .gte('date', lastMonth.toISOString().split('T')[0])
            .lt('date', currentMonth.toISOString().split('T')[0]),

          // Get outstanding payments
          supabase
            .from('invoices')
            .select('amount_due')
            .eq('organization_id', organizationId)
            .in('status', ['sent', 'overdue', 'partially_paid']),

          // Get customer count
          supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId),

          // Get invoice count (current month)
          supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .gte('invoice_date', currentMonth.toISOString().split('T')[0]),
        ]);

      // Check for errors
      const errors = [
        revenueResult.error,
        lastRevenueResult.error,
        outstandingResult.error,
        customerResult.error,
        invoiceResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        logger.error('getDashboardStats: Database errors:', errors);
        throw new Error('Database query failed');
      }

      // Process data
      const typedCurrentRevenue = (revenueResult.data ?? []) as Array<Pick<Transaction, 'amount'>>;
      const revenue = typedCurrentRevenue.reduce((sum, t) => sum + (t.amount ?? 0), 0);

      const typedLastRevenue = (lastRevenueResult.data ?? []) as Array<Pick<Transaction, 'amount'>>;
      const lastMonthRevenue = typedLastRevenue.reduce((sum, t) => sum + (t.amount ?? 0), 0);
      const revenueChange =
        lastMonthRevenue > 0 ? ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      const typedOutstanding = (outstandingResult.data ?? []) as Array<Pick<Invoice, 'amount_due'>>;
      const outstanding = typedOutstanding.reduce((sum, i) => sum + (i.amount_due ?? 0), 0);

      const customers = customerResult.count ?? 0;
      const invoices = invoiceResult.count ?? 0;

      const stats: DashboardStats = {
        revenue,
        revenue_change: revenueChange,
        outstanding,
        customers,
        invoices,
      };

      return { data: stats, error: null };
    });

    return result.data || FALLBACK_STATS;
  } catch (error) {
    logger.error(
      'Error fetching dashboard stats:',
      error instanceof Error ? error.message : String(error)
    );
    // Return fallback data instead of throwing to prevent dashboard from breaking
    return FALLBACK_STATS;
  }
}

/**
 * Get revenue chart data (last 6 months)
 */
export async function getRevenueChartData(organizationId: string): Promise<ChartData[]> {
  try {
    // Validate input
    if (!organizationId) {
      logger.warn('getRevenueChartData: No organization ID provided');
      return FALLBACK_CHART_DATA;
    }

    const result = await withAuthQuery(async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setDate(1);

      // Get income and expense transactions in parallel
      const [incomeResult, expenseResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('amount, date')
          .eq('organization_id', organizationId)
          .eq('type', 'income')
          .gte('date', sixMonthsAgo.toISOString().split('T')[0])
          .order('date'),

        supabase
          .from('transactions')
          .select('amount, date')
          .eq('organization_id', organizationId)
          .eq('type', 'expense')
          .gte('date', sixMonthsAgo.toISOString().split('T')[0])
          .order('date'),
      ]);

      if (incomeResult.error) throw incomeResult.error;
      if (expenseResult.error) throw expenseResult.error;

      // Group by month
      const monthlyData: Record<string, { revenue: number; expenses: number }> = {};

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyData[month] = { revenue: 0, expenses: 0 };
      }

      // Aggregate income
      const typedIncomeData = (incomeResult.data ?? []) as Array<
        Pick<Transaction, 'amount' | 'date'>
      >;
      typedIncomeData.forEach((item) => {
        if (!item.date) return;
        const month = new Date(item.date).toLocaleString('default', { month: 'short' });
        if (monthlyData[month]) {
          monthlyData[month].revenue += item.amount ?? 0;
        }
      });

      // Aggregate expenses
      const typedExpenseData = (expenseResult.data ?? []) as Array<
        Pick<Transaction, 'amount' | 'date'>
      >;
      typedExpenseData.forEach((item) => {
        if (!item.date) return;
        const month = new Date(item.date).toLocaleString('default', { month: 'short' });
        if (monthlyData[month]) {
          monthlyData[month].expenses += item.amount ?? 0;
        }
      });

      const chartData = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
      }));

      return { data: chartData, error: null };
    });

    return result.data || FALLBACK_CHART_DATA;
  } catch (error) {
    logger.error(
      'Error fetching chart data:',
      error instanceof Error ? error.message : String(error)
    );
    return FALLBACK_CHART_DATA;
  }
}

/**
 * Get recent invoices
 */
export async function getRecentInvoices(
  organizationId: string,
  limit: number = 10
): Promise<RecentInvoice[]> {
  try {
    // Validate input
    if (!organizationId) {
      logger.warn('getRecentInvoices: No organization ID provided');
      return [];
    }

    const result = await withAuthQuery(async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(
          `
          id,
          invoice_number,
          invoice_date,
          due_date,
          status,
          total_amount,
          amount_due,
          amount_paid,
          created_at,
          customer:customers(id, name, email)
        `
        )
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const raw = (data ?? []) as Array<Record<string, unknown>>;
      const invoices = raw.map((inv) => {
        const rawCustomer = inv.customer;
        const customerObj = Array.isArray(rawCustomer)
          ? rawCustomer[0] || { id: '', name: '', email: '' }
          : (rawCustomer ?? { id: '', name: '', email: '' });
        return {
          id: inv.id,
          invoice_number: inv.invoice_number,
          invoice_date: inv.invoice_date,
          due_date: inv.due_date,
          status: inv.status,
          total_amount: inv.total_amount,
          amount_due: inv.amount_due,
          amount_paid: inv.amount_paid,
          created_at: inv.created_at,
          customer: {
            id: customerObj.id ?? '',
            name: customerObj.name ?? '',
            email: customerObj.email ?? '',
          },
        } as RecentInvoice;
      });

      return { data: invoices, error: null };
    });

    return result.data || [];
  } catch (error) {
    logger.error(
      'Error fetching recent invoices:',
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

/**
 * Get top customers by revenue
 */
export async function getTopCustomers(
  organizationId: string,
  limit: number = 5
): Promise<TopCustomer[]> {
  try {
    // Validate input
    if (!organizationId) {
      logger.warn('getTopCustomers: No organization ID provided');
      return [];
    }

    const result = await withAuthQuery(async () => {
      // Get customers with their invoice totals
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, email, outstanding_balance')
        .eq('organization_id', organizationId)
        .order('outstanding_balance', { ascending: false })
        .limit(limit * 2); // Get more to filter by revenue

      if (customersError) throw customersError;

      // Get invoice data for each customer
      const typedCustomers = (customers ?? []) as Array<
        Pick<Customer, 'id' | 'name' | 'email' | 'outstanding_balance'>
      >;

      // Process customers with revenue calculation
      const customersWithRevenue = await Promise.all(
        typedCustomers.map(async (customer) => {
          try {
            const { data: invoices, error: invoicesError } = await supabase
              .from('invoices')
              .select('total_amount, invoice_date, status')
              .eq('organization_id', organizationId)
              .eq('customer_id', customer.id)
              .in('status', ['paid', 'partially_paid']);

            if (invoicesError) throw invoicesError;

            const typedInvoices = (invoices ?? []) as Array<
              Pick<Invoice, 'total_amount' | 'invoice_date'>
            >;
            const totalRevenue = typedInvoices.reduce(
              (sum, inv) => sum + (inv.total_amount ?? 0),
              0
            );
            const invoiceCount = typedInvoices.length;
            const lastPurchase =
              typedInvoices
                .map((inv) => inv.invoice_date)
                .filter(Boolean)
                .sort()
                .reverse()[0] || null;

            return {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              total_revenue: totalRevenue,
              invoice_count: invoiceCount,
              outstanding_balance: customer.outstanding_balance ?? 0,
              last_purchase_date: lastPurchase,
            };
          } catch (error) {
            logger.error(`Error fetching invoices for customer ${customer.id}:`, error);
            // Return customer with zero revenue if invoice fetch fails
            return {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              total_revenue: 0,
              invoice_count: 0,
              outstanding_balance: customer.outstanding_balance ?? 0,
              last_purchase_date: null,
            };
          }
        })
      );

      // Sort by revenue and return top N
      const topCustomers = customersWithRevenue.sort((a, b) => b.total_revenue - a.total_revenue).slice(0, limit);
      return { data: topCustomers, error: null };
    });

    return result.data || [];
  } catch (error) {
    logger.error(
      'Error fetching top customers:',
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

/**
 * Get recent activity feed
 */
export async function getActivityFeed(
  organizationId: string,
  limit: number = 10
): Promise<ActivityItem[]> {
  try {
    // Validate input
    if (!organizationId) {
      logger.warn('getActivityFeed: No organization ID provided');
      return [];
    }

    const result = await withAuthQuery(async () => {
      const activities: ActivityItem[] = [];

      // Execute all queries in parallel for better performance
      const [invoicesResult, transactionsResult, customersResult, productsResult] =
        await Promise.all([
          // Get recent invoices
          supabase
            .from('invoices')
            .select(
              `
            id,
            invoice_number,
            status,
            created_at,
            created_by_user:users!invoices_created_by_fkey(full_name)
          `
            )
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(limit),

          // Get recent transactions
          supabase
            .from('transactions')
            .select(
              `
            id,
            type,
            amount,
            description,
            created_at,
            created_by_user:users!transactions_created_by_fkey(full_name)
          `
            )
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(limit),

          // Get recent customers
          supabase
            .from('customers')
            .select('id, name, created_at')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(limit),

          // Get recent products
          supabase
            .from('products')
            .select('id, name, created_at')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(limit),
        ]);

      // Check for errors
      const errors = [
        invoicesResult.error,
        transactionsResult.error,
        customersResult.error,
        productsResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        logger.error('getActivityFeed: Database errors:', errors);
        throw new Error('Database query failed');
      }

      // Process invoices
      const typedInvoices = (invoicesResult.data ?? []) as Array<
        Pick<Invoice, 'id' | 'invoice_number' | 'status' | 'created_at'> & {
          created_by_user?: { full_name?: string } | null;
        }
      >;
      typedInvoices.forEach((invoice) => {
        let description = '';
        let type = 'invoice_created';

        if (invoice.status === 'paid') {
          description = `Invoice ${invoice.invoice_number} was paid`;
          type = 'invoice_paid';
        } else if (invoice.status === 'sent') {
          description = `Invoice ${invoice.invoice_number} was sent`;
          type = 'invoice_updated';
        } else {
          description = `Invoice ${invoice.invoice_number} was created`;
          type = 'invoice_created';
        }

        activities.push({
          id: `invoice-${invoice.id}`,
          type,
          description,
          reference_id: invoice.id,
          reference_type: 'invoice',
          user_name: invoice.created_by_user?.full_name || null,
          created_at: invoice.created_at,
        });
      });

      // Process transactions
      const typedTransactions = (transactionsResult.data ?? []) as Array<
        Pick<Transaction, 'id' | 'type' | 'description' | 'created_at'> & {
          created_by_user?: { full_name?: string } | null;
        }
      >;
      typedTransactions.forEach((transaction) => {
        const typeLabel = transaction.type === 'income' ? 'Income' : 'Expense';
        activities.push({
          id: `transaction-${transaction.id}`,
          type: transaction.type === 'income' ? 'payment_received' : 'transaction_created',
          description: `${typeLabel} transaction: ${transaction.description ?? 'No description'}`,
          reference_id: transaction.id,
          reference_type: 'transaction',
          user_name: transaction.created_by_user?.full_name || null,
          created_at: transaction.created_at,
        });
      });

      // Process customers
      const typedCustomers = (customersResult.data ?? []) as Array<
        Pick<Customer, 'id' | 'name' | 'created_at'>
      >;
      typedCustomers.forEach((customer) => {
        activities.push({
          id: `customer-${customer.id}`,
          type: 'customer_created',
          description: `Customer ${customer.name} was added`,
          reference_id: customer.id,
          reference_type: 'customer',
          user_name: null,
          created_at: customer.created_at,
        });
      });

      // Process products
      const typedProducts = (productsResult.data ?? []) as Array<
        Pick<Product, 'id' | 'name' | 'created_at'>
      >;
      typedProducts.forEach((product) => {
        activities.push({
          id: `product-${product.id}`,
          type: 'product_created',
          description: `Product ${product.name} was added`,
          reference_id: product.id,
          reference_type: 'product',
          user_name: null,
          created_at: product.created_at,
        });
      });

      // Sort by created_at and return most recent
      const sortedActivities = activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
      
      return { data: sortedActivities, error: null };
    });

    return result.data || [];
  } catch (error) {
    logger.error(
      'Error fetching activity feed:',
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}
