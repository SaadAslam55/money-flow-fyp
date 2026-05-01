// src/types/dashboard.types.ts
/**
 * Dashboard Type Definitions
 *
 * Types for dashboard statistics, charts, and activity data.
 *
 * @module Types/Dashboard
 */

/**
 * Dashboard statistics summary
 */
export interface DashboardStats {
  revenue: number;
  revenue_change?: number;
  outstanding: number;
  outstanding_change?: number;
  customers: number;
  customers_change?: number;
  invoices: number;
  invoices_change?: number;
}

/**
 * Chart data point for revenue/expense charts
 */
export interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
}

/**
 * Recent invoice summary for dashboard
 */
export interface RecentInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
  total_amount: number;
  amount_due: number;
  amount_paid: number;
  created_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Top customer statistics for dashboard
 */
export interface TopCustomer {
  id: string;
  name: string;
  email?: string | null;
  total_revenue: number;
  invoice_count: number;
  outstanding_balance: number;
  last_purchase_date?: string | null;
}

/**
 * Activity feed item for dashboard
 */
export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  reference_id?: string | null;
  reference_type?: string | null;
  user_name?: string | null;
  created_at: string;
}