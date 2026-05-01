// src/types/report.types.ts
/**
 * Report Type Definitions
 *
 * Types for financial reports including P&L, balance sheet, cash flow, and analytics.
 *
 * @module Types/Report
 */

/**
 * Date range for report filtering
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Profit & Loss (Income Statement) report data
 */
export interface ProfitLossData {
  period: DateRange;
  revenue: {
    sales: number;
    other_income: number;
    total: number;
  };
  cost_of_goods_sold: {
    product_costs: number;
    gross_profit: number;
    gross_profit_margin: number;
  };
  operating_expenses: {
    [category: string]: number;
  };
  total_expenses: number;
  earnings_before_tax: number;
  tax: number;
  net_profit: number;
  net_profit_margin: number;
  previous_period?: {
    net_profit: number;
    change_percentage: number;
  };
}

/**
 * Balance Sheet report data
 */
export interface BalanceSheetData {
  date: string;
  assets: {
    current_assets: {
      cash: number;
      accounts_receivable: number;
      inventory: number;
      total: number;
    };
    total_assets: number;
  };
  liabilities: {
    current_liabilities: {
      accounts_payable: number;
      total: number;
    };
    total_liabilities: number;
  };
  equity: {
    retained_earnings: number;
    total_equity: number;
  };
}

/**
 * Cash Flow Statement report data
 */
export interface CashFlowData {
  period: DateRange;
  operating_activities: {
    net_income: number;
    adjustments: {
      depreciation: number;
      changes_in_receivables: number;
      changes_in_payables: number;
    };
    net_cash_from_operations: number;
  };
  investing_activities: {
    purchases: number;
    net_cash_from_investing: number;
  };
  financing_activities: {
    owner_contributions: number;
    owner_withdrawals: number;
    net_cash_from_financing: number;
  };
  net_change_in_cash: number;
  beginning_cash: number;
  ending_cash: number;
}

/**
 * Sales report data with breakdowns by status, customer, product, and period
 */
export interface SalesReportData {
  period: DateRange;
  summary: {
    total_sales: number;
    total_invoices: number;
    average_invoice_value: number;
    total_customers: number;
  };
  by_status: {
    status: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  by_customer: {
    customer_id: string;
    customer_name: string;
    total_sales: number;
    invoice_count: number;
    average_order_value: number;
  }[];
  by_product: {
    product_id: string;
    product_name: string;
    quantity_sold: number;
    total_revenue: number;
  }[];
  by_period: {
    date: string;
    sales: number;
    invoices: number;
  }[];
}

/**
 * Expense report data with breakdowns by category, payment method, and period
 */
export interface ExpenseReportData {
  period: DateRange;
  summary: {
    total_expenses: number;
    total_transactions: number;
    average_expense: number;
    categories_count: number;
  };
  by_category: {
    category_id: string;
    category_name: string;
    amount: number;
    percentage: number;
    transaction_count: number;
  }[];
  by_payment_method: {
    payment_method: string;
    amount: number;
    percentage: number;
  }[];
  by_period: {
    date: string;
    amount: number;
    count: number;
  }[];
  top_expenses: {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
  }[];
}

/**
 * Tax report data with tax collected, paid, and liability calculations
 */
export interface TaxReportData {
  period: DateRange;
  summary: {
    taxable_sales: number;
    tax_collected: number;
    tax_paid: number;
    net_tax_liability: number;
  };
  by_rate: {
    tax_rate: number;
    taxable_amount: number;
    tax_amount: number;
  }[];
  sales_details: {
    invoice_number: string;
    date: string;
    customer: string;
    amount: number;
    tax: number;
  }[];
  purchase_details: {
    date: string;
    description: string;
    amount: number;
    tax: number;
  }[];
}

/**
 * Customer analytics report data
 */
export interface CustomerReportData {
  period: DateRange;
  summary: {
    total_customers: number;
    active_customers: number;
    new_customers: number;
    total_revenue: number;
    average_revenue_per_customer: number;
  };
  top_customers: {
    customer_id: string;
    name: string;
    total_purchases: number;
    invoice_count: number;
    outstanding_balance: number;
    last_purchase_date: string;
  }[];
  customer_segments: {
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
  }[];
  acquisition_trend: {
    date: string;
    new_customers: number;
  }[];
}

/**
 * Product performance report data
 */
export interface ProductReportData {
  period: DateRange;
  summary: {
    total_products: number;
    products_sold: number;
    total_quantity_sold: number;
    total_revenue: number;
  };
  top_products: {
    product_id: string;
    name: string;
    quantity_sold: number;
    revenue: number;
    profit_margin: number;
  }[];
  category_performance: {
    category: string;
    products_count: number;
    quantity_sold: number;
    revenue: number;
  }[];
  stock_valuation: {
    product_id: string;
    name: string;
    current_stock: number;
    cost_price: number;
    value: number;
  }[];
  low_performing: {
    product_id: string;
    name: string;
    quantity_sold: number;
    revenue: number;
  }[];
}

/**
 * Report filter options
 */
export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  customer_id?: string[];
  product_id?: string[];
  category_id?: string[];
  status?: string[];
  payment_method?: string[];
  comparison_period?: boolean;
}

/**
 * Report export configuration
 */
export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  include_charts: boolean;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Available report types
 */
export type ReportType = 
  | 'profit_loss'
  | 'balance_sheet'
  | 'cash_flow'
  | 'sales'
  | 'expenses'
  | 'tax'
  | 'customer'
  | 'product';