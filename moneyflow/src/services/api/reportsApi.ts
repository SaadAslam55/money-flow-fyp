// src/services/api/reportsApi.ts
/**
 * Reports API Service
 * Handles fetching and calculating report data from database
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';

export interface ProfitLossData {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    sales: number;
    other_income: number;
    total: number;
  };
  cogs: {
    product_costs: number;
    gross_profit: number;
    gross_profit_margin: number;
  };
  expenses: Record<string, number>;
  total_expenses: number;
  net_profit: number;
  net_profit_margin: number;
  previous_period?: {
    net_profit: number;
    change_percentage: number;
  };
}

export interface CashFlowData {
  period: { start: string; end: string };
  operating: {
    cash_from_sales: number;
    cash_paid_expenses: number;
    net_operating: number;
  };
  investing: {
    equipment_purchases: number;
    net_investing: number;
  };
  financing: {
    loans_received: number;
    loans_paid: number;
    net_financing: number;
  };
  net_cash_flow: number;
  opening_balance: number;
  closing_balance: number;
}

export interface SalesReportData {
  period: { start: string; end: string };
  total_sales: number;
  total_invoices: number;
  average_invoice_value: number;
  sales_by_product: Array<{ product_name: string; quantity: number; revenue: number }>;
  sales_by_customer: Array<{ customer_name: string; total: number; invoice_count: number }>;
  sales_trend: Array<{ date: string; amount: number }>;
}

export interface ExpenseReportData {
  period: { start: string; end: string };
  total_expenses: number;
  expenses_by_category: Array<{ category: string; amount: number; percentage: number }>;
  expense_trend: Array<{ date: string; amount: number }>;
  top_expenses: Array<{ description: string; amount: number; date: string }>;
}

/**
 * Get Profit & Loss Report Data
 */
export async function getProfitLossReport(
  organizationId: string,
  startDate: string,
  endDate: string
): Promise<{ data: ProfitLossData | null; error: Error | null }> {
  try {
    // Get income transactions
    const { data: incomeData, error: incomeError } = await supabase
      .from('transactions')
      .select('amount, category:expense_categories(name)')
      .eq('organization_id', organizationId)
      .eq('type', 'income')
      .gte('date', startDate)
      .lte('date', endDate);

    if (incomeError) throw incomeError;

    // Get expense transactions
    const { data: expenseData, error: expenseError } = await supabase
      .from('transactions')
      .select('amount, category:expense_categories(name)')
      .eq('organization_id', organizationId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (expenseError) throw expenseError;

    // Get invoice revenue
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('total_amount, subtotal')
      .eq('organization_id', organizationId)
      .in('status', ['paid', 'partially_paid'])
      .gte('invoice_date', startDate)
      .lte('invoice_date', endDate);

    if (invoiceError) throw invoiceError;

    // Calculate revenue
    const salesRevenue = invoiceData?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
    const otherIncome = incomeData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const totalRevenue = salesRevenue + otherIncome;

    // Calculate expenses by category
    const expensesByCategory: Record<string, number> = {};
    expenseData?.forEach((t) => {
      const categoryName = (t.category as {name?:string} | null)?.name || 'Uncategorized';
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + t.amount;
    });

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amt) => sum + amt, 0);

    // Calculate COGS (simplified - using product costs from invoices)
    const productCosts = invoiceData?.reduce((sum, inv) => {
      // Estimate COGS as 60% of subtotal (simplified)
      return sum + ((inv.subtotal || 0) * 0.6);
    }, 0) || 0;

    const grossProfit = totalRevenue - productCosts;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const netProfit = grossProfit - totalExpenses;
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const result: ProfitLossData = {
      period: { start: startDate, end: endDate },
      revenue: {
        sales: salesRevenue,
        other_income: otherIncome,
        total: totalRevenue,
      },
      cogs: {
        product_costs: productCosts,
        gross_profit: grossProfit,
        gross_profit_margin: grossProfitMargin,
      },
      expenses: expensesByCategory,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      net_profit_margin: netProfitMargin,
    };

    return { data: result, error: null };
  } catch (error) {
    logger.error('Error fetching P&L report:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get Cash Flow Report Data
 */
export async function getCashFlowReport(
  organizationId: string,
  startDate: string,
  endDate: string
): Promise<{ data: CashFlowData | null; error: Error | null }> {
  try {
    // Get all transactions for the period
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('type, amount, date, category:expense_categories(name)')
      .eq('organization_id', organizationId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (txnError) throw txnError;

    // Get bank account balances
    const { data: bankAccounts, error: bankError } = await supabase
      .from('bank_accounts')
      .select('current_balance')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (bankError) throw bankError;

    // Calculate operating cash flow
    const cashFromSales = transactions
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const cashPaidExpenses = transactions
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const netOperating = cashFromSales - cashPaidExpenses;

    // Simplified investing and financing (would need more data in real scenario)
    const netInvesting = 0;
    const netFinancing = 0;

    const netCashFlow = netOperating + netInvesting + netFinancing;
    const closingBalance = bankAccounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;
    const openingBalance = closingBalance - netCashFlow;

    const result: CashFlowData = {
      period: { start: startDate, end: endDate },
      operating: {
        cash_from_sales: cashFromSales,
        cash_paid_expenses: cashPaidExpenses,
        net_operating: netOperating,
      },
      investing: {
        equipment_purchases: 0,
        net_investing: netInvesting,
      },
      financing: {
        loans_received: 0,
        loans_paid: 0,
        net_financing: netFinancing,
      },
      net_cash_flow: netCashFlow,
      opening_balance: openingBalance,
      closing_balance: closingBalance,
    };

    return { data: result, error: null };
  } catch (error) {
    logger.error('Error fetching cash flow report:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get Sales Report Data
 */
export async function getSalesReport(
  organizationId: string,
  startDate: string,
  endDate: string
): Promise<{ data: SalesReportData | null; error: Error | null }> {
  try {
    // Get invoices with items and customer info
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select(`
        id,
        total_amount,
        invoice_date,
        customer:customers(name)
      `)
      .eq('organization_id', organizationId)
      .in('status', ['paid', 'partially_paid', 'sent'])
      .gte('invoice_date', startDate)
      .lte('invoice_date', endDate);

    if (invError) throw invError;

    // Get invoice items for product breakdown
    const { data: invoiceItems, error: itemsError } = await supabase
      .from('invoice_items')
      .select(`
        quantity,
        total,
        product:products(name),
        invoice:invoices!inner(organization_id, invoice_date, status)
      `)
      .eq('invoice.organization_id', organizationId)
      .gte('invoice.invoice_date', startDate)
      .lte('invoice.invoice_date', endDate);

    if (itemsError) throw itemsError;

    const totalSales = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
    const totalInvoices = invoices?.length || 0;
    const averageInvoiceValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;

    // Sales by product
    const productSales: Record<string, { quantity: number; revenue: number }> = {};
    invoiceItems?.forEach((item) => {
      const productName = (item.product as {name?:string} | null)?.name || 'Unknown Product';
      if (!productSales[productName]) {
        productSales[productName] = { quantity: 0, revenue: 0 };
      }
      productSales[productName].quantity += item.quantity || 0;
      productSales[productName].revenue += item.total || 0;
    });

    const salesByProduct = Object.entries(productSales)
      .map(([product_name, data]) => ({
        product_name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by customer
    const customerSales: Record<string, { total: number; invoice_count: number }> = {};
    invoices?.forEach((inv) => {
      const customerName = (inv.customer as {name?:string} | null)?.name || 'Unknown Customer';
      if (!customerSales[customerName]) {
        customerSales[customerName] = { total: 0, invoice_count: 0 };
      }
      customerSales[customerName].total += inv.total_amount || 0;
      customerSales[customerName].invoice_count += 1;
    });

    const salesByCustomer = Object.entries(customerSales)
      .map(([customer_name, data]) => ({
        customer_name,
        total: data.total,
        invoice_count: data.invoice_count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Sales trend by date
    const dailySales: Record<string, number> = {};
    invoices?.forEach((inv) => {
      const date = inv.invoice_date;
      dailySales[date] = (dailySales[date] || 0) + (inv.total_amount || 0);
    });

    const salesTrend = Object.entries(dailySales)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const result: SalesReportData = {
      period: { start: startDate, end: endDate },
      total_sales: totalSales,
      total_invoices: totalInvoices,
      average_invoice_value: averageInvoiceValue,
      sales_by_product: salesByProduct,
      sales_by_customer: salesByCustomer,
      sales_trend: salesTrend,
    };

    return { data: result, error: null };
  } catch (error) {
    logger.error('Error fetching sales report:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get Expense Report Data
 */
export async function getExpenseReport(
  organizationId: string,
  startDate: string,
  endDate: string
): Promise<{ data: ExpenseReportData | null; error: Error | null }> {
  try {
    // Get expense transactions with categories
    const { data: expenses, error: expError } = await supabase
      .from('transactions')
      .select('amount, date, description, category:expense_categories(name)')
      .eq('organization_id', organizationId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('amount', { ascending: false });

    if (expError) throw expError;

    const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

    // Expenses by category
    const categoryTotals: Record<string, number> = {};
    expenses?.forEach((e) => {
      const categoryName = (e.category as {name?:string} | null)?.name || 'Uncategorized';
      categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + e.amount;
    });

    const expensesByCategory = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Expense trend by date
    const dailyExpenses: Record<string, number> = {};
    expenses?.forEach((e) => {
      dailyExpenses[e.date] = (dailyExpenses[e.date] || 0) + e.amount;
    });

    const expenseTrend = Object.entries(dailyExpenses)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top expenses
    const topExpenses = (expenses || [])
      .slice(0, 10)
      .map((e) => ({
        description: e.description || 'No description',
        amount: e.amount,
        date: e.date,
      }));

    const result: ExpenseReportData = {
      period: { start: startDate, end: endDate },
      total_expenses: totalExpenses,
      expenses_by_category: expensesByCategory,
      expense_trend: expenseTrend,
      top_expenses: topExpenses,
    };

    return { data: result, error: null };
  } catch (error) {
    logger.error('Error fetching expense report:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get Tax Report Data
 */
export async function getTaxReport(
  organizationId: string,
  startDate: string,
  endDate: string
) {
  try {
    // Get invoices with tax info
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('total_amount, tax_amount, subtotal, status')
      .eq('organization_id', organizationId)
      .gte('invoice_date', startDate)
      .lte('invoice_date', endDate);

    if (invError) throw invError;

    const taxCollected = invoices
      ?.filter(inv => ['paid', 'partially_paid'].includes(inv.status))
      .reduce((sum, inv) => sum + (inv.tax_amount || 0), 0) || 0;

    const taxableRevenue = invoices
      ?.filter(inv => ['paid', 'partially_paid'].includes(inv.status))
      .reduce((sum, inv) => sum + (inv.subtotal || 0), 0) || 0;

    return {
      data: {
        period: { start: startDate, end: endDate },
        tax_collected: taxCollected,
        taxable_revenue: taxableRevenue,
        effective_tax_rate: taxableRevenue > 0 ? (taxCollected / taxableRevenue) * 100 : 0,
        invoices_count: invoices?.length || 0,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching tax report:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get Customer Report Data
 */
export async function getCustomerReport(
  organizationId: string,
  startDate: string,
  endDate: string
) {
  try {
    // Get customers with invoice data
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('id, name, email, created_at')
      .eq('organization_id', organizationId);

    if (custError) throw custError;

    // Get invoices for the period
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('customer_id, total_amount, status')
      .eq('organization_id', organizationId)
      .gte('invoice_date', startDate)
      .lte('invoice_date', endDate);

    if (invError) throw invError;

    // Calculate customer metrics
    const customerMetrics = customers?.map((customer) => {
      const customerInvoices = invoices?.filter((inv) => inv.customer_id === customer.id) || [];
      const totalRevenue = customerInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const paidInvoices = customerInvoices.filter((inv) => inv.status === 'paid').length;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        total_revenue: totalRevenue,
        invoice_count: customerInvoices.length,
        paid_invoices: paidInvoices,
        created_at: customer.created_at,
      };
    }) || [];

    const totalCustomers = customers?.length || 0;
    const activeCustomers = customerMetrics.filter((c) => c.invoice_count > 0).length;
    const totalRevenue = customerMetrics.reduce((sum, c) => sum + c.total_revenue, 0);

    return {
      data: {
        period: { start: startDate, end: endDate },
        total_customers: totalCustomers,
        active_customers: activeCustomers,
        total_revenue: totalRevenue,
        average_revenue_per_customer: activeCustomers > 0 ? totalRevenue / activeCustomers : 0,
        top_customers: customerMetrics
          .sort((a, b) => b.total_revenue - a.total_revenue)
          .slice(0, 10),
      },
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching customer report:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get Product Report Data
 */
export async function getProductReport(
  organizationId: string,
  startDate: string,
  endDate: string
) {
  try {
    // Get products with stock info
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, sku, unit_price, stock_quantity, is_active')
      .eq('organization_id', organizationId);

    if (prodError) throw prodError;

    // Get invoice items for sales data
    const { data: invoiceItems, error: itemsError } = await supabase
      .from('invoice_items')
      .select(`
        product_id,
        quantity,
        total,
        invoice:invoices!inner(organization_id, invoice_date, status)
      `)
      .eq('invoice.organization_id', organizationId)
      .gte('invoice.invoice_date', startDate)
      .lte('invoice.invoice_date', endDate);

    if (itemsError) throw itemsError;

    // Calculate product metrics
    const productMetrics = products?.map((product) => {
      const productSales = invoiceItems?.filter((item) => item.product_id === product.id) || [];
      const totalQuantitySold = productSales.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalRevenue = productSales.reduce((sum, item) => sum + (item.total || 0), 0);

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        unit_price: product.unit_price,
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
        quantity_sold: totalQuantitySold,
        revenue: totalRevenue,
      };
    }) || [];

    const totalProducts = products?.length || 0;
    const activeProducts = products?.filter((p) => p.is_active).length || 0;
    const lowStockProducts = products?.filter((p) => (p.stock_quantity || 0) < 10).length || 0;
    const totalRevenue = productMetrics.reduce((sum, p) => sum + p.revenue, 0);

    return {
      data: {
        period: { start: startDate, end: endDate },
        total_products: totalProducts,
        active_products: activeProducts,
        low_stock_products: lowStockProducts,
        total_revenue: totalRevenue,
        top_products: productMetrics
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10),
        low_stock_items: productMetrics
          .filter((p) => (p.stock_quantity || 0) < 10)
          .slice(0, 10),
      },
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching product report:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Export report to CSV
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}
