// src/services/api/reportApi.ts
/**
 * Report API Service
 * Handles report generation for financial statements and analytics
 * Includes Profit & Loss, Balance Sheet, Cash Flow, Sales, Expenses, Tax, Customer, and Product reports
 */

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/errorHandler';
import { supabase } from '@/services/supabase/client';
import type {
  ProfitLossData,
  BalanceSheetData,
  CashFlowData,
  SalesReportData,
  ExpenseReportData,
  TaxReportData,
  CustomerReportData,
  ProductReportData,
  DateRange,
  ReportFilters,
} from '@/types/report.types';
import type { Product, Customer, Invoice, InvoiceItem, Transaction } from '@/types/database.types';

/**
 * Generate Profit & Loss Report
 */
export async function getProfitLossReport(
  organizationId: string,
  dateRange: DateRange,
  includeComparison: boolean = false
): Promise<{ data: ProfitLossData | null; error: Error | null }> {
  try {
    // Get income transactions
    const { data: incomeData, error: incomeError } = await supabase
      .from('transactions')
      .select('amount, category:expense_categories(name)')
      .eq('organization_id', organizationId)
      .eq('type', 'income')
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    if (incomeError) throw incomeError;

    // Get expense transactions
    const { data: expenseData, error: expenseError } = await supabase
      .from('transactions')
      .select('amount, category:expense_categories(name)')
      .eq('organization_id', organizationId)
      .eq('type', 'expense')
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    if (expenseError) throw expenseError;

    // Get invoice revenue
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('total_amount, subtotal')
      .eq('organization_id', organizationId)
      .in('status', ['paid', 'partially_paid'])
      .gte('invoice_date', dateRange.start)
      .lte('invoice_date', dateRange.end);

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

    // Calculate COGS (simplified)
    const productCosts = invoiceData?.reduce((sum, inv) => sum + ((inv.subtotal || 0) * 0.6), 0) || 0;
    const grossProfit = totalRevenue - productCosts;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netProfit = grossProfit - totalExpenses;
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const result: ProfitLossData = {
      period: { start: dateRange.start, end: dateRange.end },
      revenue: {
        sales: salesRevenue,
        other_income: otherIncome,
        total: totalRevenue,
      },
      cost_of_goods_sold: {
        product_costs: productCosts,
        gross_profit: grossProfit,
        gross_profit_margin: grossProfitMargin,
      },
      operating_expenses: expensesByCategory,
      total_expenses: totalExpenses,
      earnings_before_tax: netProfit,
      tax: 0,
      net_profit: netProfit,
      net_profit_margin: netProfitMargin,
    };

    return { data: result, error: null };
  } catch (error) {
    logger.error(`Error fetching P&L report: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Generate Balance Sheet
 */
export async function getBalanceSheet(
  organizationId: string,
  asOfDate: string
): Promise<{ data: BalanceSheetData | null; error: Error | null }> {
  try {
    // Get bank account balances (Assets)
    const { data: bankAccounts, error: bankError } = await supabase
      .from('bank_accounts')
      .select('current_balance, account_name')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (bankError) throw bankError;

    // Get accounts receivable (unpaid invoices)
    const { data: receivables, error: recError } = await supabase
      .from('invoices')
      .select('total_amount, amount_paid')
      .eq('organization_id', organizationId)
      .in('status', ['sent', 'partially_paid'])
      .lte('invoice_date', asOfDate);

    if (recError) throw recError;

    const cashBalance = bankAccounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;
    const accountsReceivable = receivables?.reduce((sum, inv) => 
      sum + ((inv.total_amount || 0) - (inv.amount_paid || 0)), 0) || 0;

    const totalAssets = cashBalance + accountsReceivable;

    const result: BalanceSheetData = {
      date: asOfDate,
      assets: {
        current_assets: {
          cash: cashBalance,
          accounts_receivable: accountsReceivable,
          inventory: 0,
          total: cashBalance + accountsReceivable,
        },
        total_assets: totalAssets,
      },
      liabilities: {
        current_liabilities: {
          accounts_payable: 0,
          total: 0,
        },
        total_liabilities: 0,
      },
      equity: {
        retained_earnings: totalAssets,
        total_equity: totalAssets,
      },
    };

    return { data: result, error: null };
  } catch (error) {
    logger.error(`Error fetching balance sheet: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Generate Cash Flow Statement
 */
export async function getCashFlowStatement(
  organizationId: string,
  dateRange: DateRange
): Promise<{ data: CashFlowData | null; error: Error | null }> {
  try {
    // Get all transactions for the period
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('organization_id', organizationId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    if (txnError) throw txnError;

    // Get bank account balances
    const { data: bankAccounts, error: bankError } = await supabase
      .from('bank_accounts')
      .select('current_balance')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (bankError) throw bankError;

    const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
    const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
    const netCashFromOperations = income - expenses;
    const endingCash = bankAccounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;
    const beginningCash = endingCash - netCashFromOperations;

    const result: CashFlowData = {
      period: dateRange,
      operating_activities: {
        net_income: income - expenses,
        adjustments: {
          depreciation: 0,
          changes_in_receivables: 0,
          changes_in_payables: 0,
        },
        net_cash_from_operations: netCashFromOperations,
      },
      investing_activities: {
        purchases: 0,
        net_cash_from_investing: 0,
      },
      financing_activities: {
        owner_contributions: 0,
        owner_withdrawals: 0,
        net_cash_from_financing: 0,
      },
      net_change_in_cash: netCashFromOperations,
      beginning_cash: beginningCash,
      ending_cash: endingCash,
    };

    return { data: result, error: null };
  } catch (error) {
    logger.error(`Error fetching cash flow statement: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Generate Sales Report
 */
export async function getSalesReport(
  organizationId: string,
  dateRange: DateRange,
  _filters?: ReportFilters
): Promise<{ data: SalesReportData | null; error: Error | null }> {
  try {
    // Get summary
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select(
        `
        id,
        invoice_number,
        invoice_date,
        total_amount,
        status,
        customer_id,
        customers(id, name),
        invoice_items(
          product_id,
          quantity,
          unit_price,
          line_total,
          products(id, name)
        )
      `
      )
      .eq('organization_id', organizationId)
      .gte('invoice_date', dateRange.start)
      .lte('invoice_date', dateRange.end);

    if (invoicesError) throw invoicesError;

    // Process data
    type InvoiceWithRelations = Pick<
      Invoice,
      'total_amount' | 'customer_id' | 'status' | 'invoice_date'
    > & {
      customers?: { name?: string } | null;
      invoice_items?: Array<{
        product_id?: string | null;
        quantity: number;
        line_total: number;
        products?: { name?: string } | null;
      }>;
    };

    const typedInvoices = (invoices ?? []) as InvoiceWithRelations[];
    const totalSales = typedInvoices.reduce((sum, inv) => sum + (inv.total_amount ?? 0), 0);
    const uniqueCustomers = new Set(typedInvoices.map((inv) => inv.customer_id).filter(Boolean))
      .size;

    // Group by status
    type StatusAccumulator = Record<string, { count: number; amount: number }>;
    const byStatus = Object.entries(
      typedInvoices.reduce((acc: StatusAccumulator, inv) => {
        const status = inv.status ?? 'unknown';
        acc[status] = acc[status] ?? { count: 0, amount: 0 };
        acc[status].count++;
        acc[status].amount += inv.total_amount ?? 0;
        return acc;
      }, {} as StatusAccumulator)
    ).map(([status, data]) => ({
      status,
      count: data.count,
      amount: data.amount,
      percentage: totalSales > 0 ? (data.amount / totalSales) * 100 : 0,
    }));

    // Group by customer
    type CustomerData = {
      customer_id: string;
      customer_name: string;
      total_sales: number;
      invoice_count: number;
    };
    const customerMap = new Map<string, CustomerData>();
    typedInvoices.forEach((inv) => {
      const customerId = inv.customer_id;
      if (!customerId) return;
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customer_id: customerId,
          customer_name: inv.customers?.name ?? 'Unknown',
          total_sales: 0,
          invoice_count: 0,
        });
      }
      const customer = customerMap.get(customerId);
      if (customer) {
        customer.total_sales += inv.total_amount ?? 0;
        customer.invoice_count++;
      }
    });

    const byCustomer = Array.from(customerMap.values())
      .map((c) => ({
        ...c,
        average_order_value: c.invoice_count > 0 ? c.total_sales / c.invoice_count : 0,
      }))
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, 10);

    // Group by product
    type ProductData = {
      product_id: string;
      product_name: string;
      quantity_sold: number;
      total_revenue: number;
    };
    const productMap = new Map<string, ProductData>();
    typedInvoices.forEach((inv) => {
      inv.invoice_items?.forEach((item) => {
        const productId = item.product_id;
        if (!productId) return;

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product_id: productId,
            product_name: item.products?.name ?? 'Unknown',
            quantity_sold: 0,
            total_revenue: 0,
          });
        }
        const product = productMap.get(productId);
        if (product) {
          product.quantity_sold += item.quantity;
          product.total_revenue += item.line_total;
        }
      });
    });

    const byProduct = Array.from(productMap.values())
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    // Group by period (daily)
    type PeriodData = {
      date: string;
      sales: number;
      invoices: number;
    };
    const periodMap = new Map<string, PeriodData>();
    typedInvoices.forEach((inv) => {
      const date = inv.invoice_date;
      if (!periodMap.has(date)) {
        periodMap.set(date, { date, sales: 0, invoices: 0 });
      }
      const period = periodMap.get(date);
      if (period) {
        period.sales += inv.total_amount ?? 0;
        period.invoices++;
      }
    });

    const byPeriod = Array.from(periodMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const invoiceCount = invoices.length ?? 0;
    const reportData: SalesReportData = {
      period: dateRange,
      summary: {
        total_sales: totalSales,
        total_invoices: invoiceCount,
        average_invoice_value: invoiceCount > 0 ? totalSales / invoiceCount : 0,
        total_customers: uniqueCustomers,
      },
      by_status: byStatus,
      by_customer: byCustomer,
      by_product: byProduct,
      by_period: byPeriod,
    };

    return { data: reportData, error: null };
  } catch (error) {
    logger.error(`Error generating sales report: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Generate Expense Report
 */
export async function getExpenseReport(
  organizationId: string,
  dateRange: DateRange,
  filters?: ReportFilters
): Promise<{ data: ExpenseReportData | null; error: Error | null }> {
  try {
    let query = supabase
      .from('transactions')
      .select(
        `
        id,
        date,
        amount,
        description,
        payment_method,
        category_id,
        expense_categories(id, name)
      `
      )
      .eq('organization_id', organizationId)
      .eq('type', 'expense')
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    if (filters?.category_id) {
      query = query.in('category_id', filters.category_id);
    }

    if (filters?.payment_method) {
      query = query.in('payment_method', filters.payment_method);
    }

    const { data: expenses, error: expensesError } = await query;

    if (expensesError) throw expensesError;

    type ExpenseWithCategory = Pick<
      Transaction,
      'id' | 'amount' | 'date' | 'description' | 'category_id' | 'payment_method'
    > & {
      expense_categories?: { name?: string } | null;
    };

    const typedExpenses = (expenses ?? []) as ExpenseWithCategory[];
    const totalExpenses = typedExpenses.reduce((sum, exp) => sum + (exp.amount ?? 0), 0);

    // Group by category
    type CategoryData = {
      category_id: string;
      category_name: string;
      amount: number;
      transaction_count: number;
    };
    const categoryMap = new Map<string, CategoryData>();
    typedExpenses.forEach((exp) => {
      const categoryId = exp.category_id ?? 'uncategorized';
      const categoryName = exp.expense_categories?.name ?? 'Uncategorized';

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          category_id: categoryId,
          category_name: categoryName,
          amount: 0,
          transaction_count: 0,
        });
      }
      const category = categoryMap.get(categoryId);
      if (category) {
        category.amount += exp.amount ?? 0;
        category.transaction_count++;
      }
    });

    const byCategory = Array.from(categoryMap.values())
      .map((c) => ({
        ...c,
        percentage: totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Group by payment method
    type PaymentMethodData = {
      payment_method: string;
      amount: number;
    };
    const paymentMethodMap = new Map<string, PaymentMethodData>();
    typedExpenses.forEach((exp) => {
      const method = exp.payment_method ?? 'unknown';
      if (!paymentMethodMap.has(method)) {
        paymentMethodMap.set(method, { payment_method: method, amount: 0 });
      }
      const paymentMethod = paymentMethodMap.get(method);
      if (paymentMethod) {
        paymentMethod.amount += exp.amount ?? 0;
      }
    });

    const byPaymentMethod = Array.from(paymentMethodMap.values())
      .map((pm) => ({
        ...pm,
        percentage: totalExpenses > 0 ? (pm.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Group by period
    type ExpensePeriodData = {
      date: string;
      amount: number;
      count: number;
    };
    const periodMap = new Map<string, ExpensePeriodData>();
    typedExpenses.forEach((exp) => {
      const { date } = exp;
      if (!periodMap.has(date)) {
        periodMap.set(date, { date, amount: 0, count: 0 });
      }
      const period = periodMap.get(date);
      if (period) {
        period.amount += exp.amount ?? 0;
        period.count++;
      }
    });

    const byPeriod = Array.from(periodMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Top expenses
    const topExpenses = typedExpenses
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
      .slice(0, 10)
      .map((exp) => ({
        id: exp.id,
        date: exp.date,
        description: exp.description ?? '',
        amount: exp.amount ?? 0,
        category: exp.expense_categories?.name ?? 'Uncategorized',
      }));

    const expenseCount = expenses.length ?? 0;
    const reportData: ExpenseReportData = {
      period: dateRange,
      summary: {
        total_expenses: totalExpenses,
        total_transactions: expenseCount,
        average_expense: expenseCount > 0 ? totalExpenses / expenseCount : 0,
        categories_count: categoryMap.size,
      },
      by_category: byCategory,
      by_payment_method: byPaymentMethod,
      by_period: byPeriod,
      top_expenses: topExpenses,
    };

    return { data: reportData, error: null };
  } catch (error) {
    logger.error(`Error generating expense report: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Generate Tax Report
 */
export async function getTaxReport(
  organizationId: string,
  dateRange: DateRange
): Promise<{ data: TaxReportData | null; error: Error | null }> {
  try {
    // Get invoices for sales tax
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select(
        `
        invoice_number,
        invoice_date,
        customers(name),
        subtotal,
        tax_amount,
        total_amount
      `
      )
      .eq('organization_id', organizationId)
      .gte('invoice_date', dateRange.start)
      .lte('invoice_date', dateRange.end)
      .neq('status', 'cancelled');

    if (invoicesError) throw invoicesError;

    // Get expenses for purchase tax
    const { data: expenses, error: expensesError } = await supabase
      .from('transactions')
      .select('date, description, amount')
      .eq('organization_id', organizationId)
      .eq('type', 'expense')
      .gte('date', dateRange.start)
      .lte('date', dateRange.end);

    if (expensesError) throw expensesError;

    type InvoiceForTax = Pick<
      Invoice,
      'invoice_number' | 'invoice_date' | 'subtotal' | 'tax_amount'
    > & {
      customers?: { name?: string } | null;
    };
    type ExpenseForTax = Pick<Transaction, 'date' | 'description' | 'amount'>;

    const typedInvoices = (invoices ?? []) as InvoiceForTax[];
    const taxableSales = typedInvoices.reduce((sum, inv) => sum + (inv.subtotal ?? 0), 0);
    const taxCollected = typedInvoices.reduce((sum, inv) => sum + (inv.tax_amount ?? 0), 0);

    // Estimate tax paid on expenses (simplified - would need actual tax data)
    const taxPaid = 0; // Would calculate from expense receipts with tax info

    // Group by tax rate
    const byRate: Array<{ tax_rate: number; taxable_amount: number; tax_amount: number }> = [
      {
        tax_rate: 17,
        taxable_amount: taxableSales,
        tax_amount: taxCollected,
      },
    ];

    const salesDetails = typedInvoices.map((inv) => ({
      invoice_number: inv.invoice_number,
      date: inv.invoice_date,
      customer: inv.customers?.name ?? 'Unknown',
      amount: inv.subtotal ?? 0,
      tax: inv.tax_amount ?? 0,
    }));

    const typedExpenses = (expenses ?? []) as ExpenseForTax[];
    const purchaseDetails = typedExpenses.map((exp) => ({
      date: exp.date,
      description: exp.description ?? '',
      amount: exp.amount ?? 0,
      tax: 0, // Would get from receipt
    }));

    const reportData: TaxReportData = {
      period: dateRange,
      summary: {
        taxable_sales: taxableSales,
        tax_collected: taxCollected,
        tax_paid: taxPaid,
        net_tax_liability: taxCollected - taxPaid,
      },
      by_rate: byRate,
      sales_details: salesDetails,
      purchase_details: purchaseDetails,
    };

    return { data: reportData, error: null };
  } catch (error) {
    logger.error(`Error generating tax report: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Generate Customer Report
 */
export async function getCustomerReport(
  organizationId: string,
  dateRange: DateRange
): Promise<{ data: CustomerReportData | null; error: Error | null }> {
  try {
    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name, created_at, outstanding_balance')
      .eq('organization_id', organizationId);

    if (customersError) throw customersError;

    // Get invoices in period
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('customer_id, total_amount, invoice_date, status')
      .eq('organization_id', organizationId)
      .gte('invoice_date', dateRange.start)
      .lte('invoice_date', dateRange.end)
      .eq('status', 'paid');

    if (invoicesError) throw invoicesError;

    const typedCustomersForReport = (customers ?? []) as Pick<
      Customer,
      'id' | 'name' | 'created_at' | 'outstanding_balance'
    >[];
    const typedInvoices = (invoices ?? []) as Pick<
      Invoice,
      'customer_id' | 'total_amount' | 'invoice_date' | 'status'
    >[];

    const totalRevenue = typedInvoices.reduce((sum, inv) => sum + (inv.total_amount ?? 0), 0);
    const activeCustomers = new Set(typedInvoices.map((inv) => inv.customer_id).filter(Boolean))
      .size;
    const newCustomers = typedCustomersForReport.filter(
      (c) => c.created_at >= dateRange.start && c.created_at <= dateRange.end
    ).length;

    // Top customers
    type CustomerSalesData = {
      customer_id: string;
      name: string;
      total_purchases: number;
      invoice_count: number;
      outstanding_balance: number;
      last_purchase_date: string;
    };
    const customerSales = new Map<string, CustomerSalesData>();
    typedInvoices.forEach((inv) => {
      const customerId = inv.customer_id;
      if (!customerId) return;
      if (!customerSales.has(customerId)) {
        const customer = typedCustomersForReport.find((c) => c.id === customerId);
        customerSales.set(customerId, {
          customer_id: customerId,
          name: customer?.name ?? 'Unknown',
          total_purchases: 0,
          invoice_count: 0,
          outstanding_balance: customer?.outstanding_balance ?? 0,
          last_purchase_date: inv.invoice_date,
        });
      }
      const customerData = customerSales.get(customerId);
      if (customerData) {
        customerData.total_purchases += inv.total_amount ?? 0;
        customerData.invoice_count++;
        if (inv.invoice_date > customerData.last_purchase_date) {
          customerData.last_purchase_date = inv.invoice_date;
        }
      }
    });

    const topCustomers = Array.from(customerSales.values())
      .sort((a, b) => b.total_purchases - a.total_purchases)
      .slice(0, 10);

    // Customer segments (simplified)
    const segments = [
      {
        segment: 'High Value (>50k)',
        count: topCustomers.filter((c) => c.total_purchases > 50000).length,
        revenue: topCustomers
          .filter((c) => c.total_purchases > 50000)
          .reduce((sum, c) => sum + c.total_purchases, 0),
        percentage: 0,
      },
      {
        segment: 'Medium Value (10k-50k)',
        count: topCustomers.filter((c) => c.total_purchases >= 10000 && c.total_purchases <= 50000)
          .length,
        revenue: topCustomers
          .filter((c) => c.total_purchases >= 10000 && c.total_purchases <= 50000)
          .reduce((sum, c) => sum + c.total_purchases, 0),
        percentage: 0,
      },
      {
        segment: 'Low Value (<10k)',
        count: topCustomers.filter((c) => c.total_purchases < 10000).length,
        revenue: topCustomers
          .filter((c) => c.total_purchases < 10000)
          .reduce((sum, c) => sum + c.total_purchases, 0),
        percentage: 0,
      },
    ].map((seg) => ({
      ...seg,
      percentage: (seg.revenue / totalRevenue) * 100,
    }));

    // Acquisition trend
    const acquisitionMap = new Map<string, number>();
    const typedCustomersForAcquisition = (customers ?? []) as Array<Pick<Customer, 'created_at'>>;
    typedCustomersForAcquisition.forEach((c) => {
      const dateStr = c.created_at.split('T')[0];
      if (dateStr && dateStr >= dateRange.start && dateStr <= dateRange.end) {
        acquisitionMap.set(dateStr, (acquisitionMap.get(dateStr) ?? 0) + 1);
      }
    });

    const acquisitionTrend = Array.from(acquisitionMap.entries())
      .map(([date, count]) => ({ date, new_customers: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const customerCount = customers.length ?? 0;
    const reportData: CustomerReportData = {
      period: dateRange,
      summary: {
        total_customers: customerCount,
        active_customers: activeCustomers,
        new_customers: newCustomers,
        total_revenue: totalRevenue,
        average_revenue_per_customer: activeCustomers > 0 ? totalRevenue / activeCustomers : 0,
      },
      top_customers: topCustomers,
      customer_segments: segments,
      acquisition_trend: acquisitionTrend,
    };

    return { data: reportData, error: null };
  } catch (error) {
    logger.error(`Error generating customer report: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Generate Product Report
 */
export async function getProductReport(
  organizationId: string,
  dateRange: DateRange
): Promise<{ data: ProductReportData | null; error: Error | null }> {
  try {
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, current_stock, cost_price, unit_price')
      .eq('organization_id', organizationId);

    if (productsError) throw productsError;

    // Get invoice items in period
    const { data: invoiceItems, error: itemsError } = await supabase
      .from('invoice_items')
      .select(
        `
        product_id,
        quantity,
        unit_price,
        line_total,
        invoice:invoices!inner(
          invoice_date,
          organization_id
        )
      `
      )
      .eq('invoice.organization_id', organizationId)
      .gte('invoice.invoice_date', dateRange.start)
      .lte('invoice.invoice_date', dateRange.end);

    if (itemsError) throw itemsError;

    const typedProducts = (products ?? []) as Pick<
      Product,
      'id' | 'name' | 'category' | 'current_stock' | 'cost_price' | 'unit_price'
    >[];
    const typedInvoiceItems = (invoiceItems ?? []) as Array<
      Pick<InvoiceItem, 'product_id' | 'quantity' | 'unit_price' | 'line_total'>
    >;

    const totalQuantitySold = typedInvoiceItems.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    );
    const totalRevenue = typedInvoiceItems.reduce((sum, item) => sum + (item.line_total ?? 0), 0);
    const productsSold = new Set(typedInvoiceItems.map((item) => item.product_id).filter(Boolean))
      .size;

    // Top products
    type ProductSalesData = {
      product_id: string;
      name: string;
      quantity_sold: number;
      revenue: number;
      cost_price: number;
      unit_price: number;
    };
    const productSales = new Map<string, ProductSalesData>();
    typedInvoiceItems.forEach((item) => {
      const productId = item.product_id;
      if (!productId) return;

      if (!productSales.has(productId)) {
        const product = typedProducts.find((p) => p.id === productId);
        productSales.set(productId, {
          product_id: productId,
          name: product?.name ?? 'Unknown',
          quantity_sold: 0,
          revenue: 0,
          cost_price: product?.cost_price ?? 0,
          unit_price: product?.unit_price ?? 0,
        });
      }
      const productData = productSales.get(productId);
      if (productData) {
        productData.quantity_sold += item.quantity ?? 0;
        productData.revenue += item.line_total ?? 0;
      }
    });

    const topProducts = Array.from(productSales.values())
      .map((p) => ({
        ...p,
        profit_margin: p.unit_price > 0 ? ((p.unit_price - p.cost_price) / p.unit_price) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Category performance
    type CategoryPerformanceData = {
      category: string;
      products_count: number;
      quantity_sold: number;
      revenue: number;
    };
    const categoryMap = new Map<string, CategoryPerformanceData>();
    typedInvoiceItems.forEach((item) => {
      const productId = item.product_id;
      if (!productId) return;
      const product = typedProducts.find((p) => p.id === productId);
      const category = product?.category ?? 'Uncategorized';

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          products_count: 0,
          quantity_sold: 0,
          revenue: 0,
        });
      }
      const categoryData = categoryMap.get(category);
      if (categoryData) {
        categoryData.quantity_sold += item.quantity ?? 0;
        categoryData.revenue += item.line_total ?? 0;
      }
    });

    const categoryPerformance = Array.from(categoryMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    // Stock valuation
    const stockValuation = typedProducts
      .filter((p) => (p.current_stock ?? 0) > 0 && p.cost_price)
      .map((p) => ({
        product_id: p.id,
        name: p.name ?? '',
        current_stock: p.current_stock ?? 0,
        cost_price: p.cost_price ?? 0,
        value: (p.current_stock ?? 0) * (p.cost_price ?? 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

    // Low performing products
    const allProductSales = Array.from(productSales.values());
    const lowPerforming = allProductSales.sort((a, b) => a.revenue - b.revenue).slice(0, 10);

    const reportData: ProductReportData = {
      period: dateRange,
      summary: {
        total_products: typedProducts.length,
        products_sold: productsSold,
        total_quantity_sold: totalQuantitySold,
        total_revenue: totalRevenue,
      },
      top_products: topProducts,
      category_performance: categoryPerformance,
      stock_valuation: stockValuation,
      low_performing: lowPerforming,
    };

    return { data: reportData, error: null };
  } catch (error) {
    logger.error(`Error generating product report: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Export Report to PDF
 */
export async function exportReportToPDF(
  reportType: string,
  reportData: unknown,
  organizationId: string
): Promise<{ data: Blob | null; error: Error | null }> {
  try {
    const result = await supabase.functions.invoke('generate-report-pdf', {
      body: {
        report_type: reportType,
        report_data: reportData,
        organization_id: organizationId,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = result;

    if (error) throw error;

    // Convert base64 to blob
    type PDFResponse = { pdf?: string };
    const pdfData = data as PDFResponse;
    if (!pdfData.pdf) {
      throw new Error('No PDF data returned from function');
    }
    const binaryString = atob(pdfData.pdf);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });

    return { data: blob, error: null };
  } catch (error) {
    logger.error(`Error exporting report to PDF: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Export Report to Excel
 */
export function exportReportToExcel(
  _reportType: string,
  reportData: unknown
): { data: Blob | null; error: Error | null } {
  try {
    // This would use a library like xlsx or exceljs
    // For now, returning a simplified CSV
    const csvContent = convertToCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });

    return { data: blob, error: null };
  } catch (error) {
    logger.error(`Error exporting report to Excel: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Helper: Convert data to CSV
 */
function convertToCSV(data: unknown): string {
  // Simplified CSV conversion
  return JSON.stringify(data);
}

/**
 * Schedule Report Generation
 */
export async function scheduleReport(
  organizationId: string,
  reportType: string,
  frequency: 'daily' | 'weekly' | 'monthly',
  recipients: string[]
): Promise<{ data: unknown; error: Error | null }> {
  try {
    const result = await supabase
      .from('scheduled_reports')
      .insert({
        organization_id: organizationId,
        report_type: reportType,
        frequency,
        recipients,
        is_active: true,
      })
      .select()
      .single();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = result;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error(`Error scheduling report: ${getErrorMessage(error)}`, 'reportApi', error);
    return { data: null, error: error as Error };
  }
}
