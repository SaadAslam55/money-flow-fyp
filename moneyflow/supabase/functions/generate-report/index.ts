/// <reference path="../deno.d.ts" />
/// <reference path="../http-server.d.ts" />
// supabase/functions/generate-report/index.ts
/**
 * Generate Report Edge Function
 * Generates financial reports (P&L, Balance Sheet, Cash Flow, etc.)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, corsResponse, corsErrorResponse } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/auth.ts';
import { parseJsonBody, validateRequired, isValidDate } from '../_shared/validators.ts';
import { getServiceClient } from '../_shared/auth.ts';

interface ReportRequest {
  report_type: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'sales' | 'expenses';
  start_date: string;
  end_date: string;
  organization_id?: string; // For admin users
}

serve(async (req) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    // Authenticate user
    const authResult = await requireAuth(req, ['admin', 'manager', 'accountant']);
    if (authResult.error || !authResult.user) {
      return corsErrorResponse(
        authResult.error || new Error('Authentication required'),
        401,
        req
      );
    }

    const { user } = authResult;

    // Parse request body
    const { data: body, error: parseError } = await parseJsonBody<ReportRequest>(req);
    if (parseError || !body) {
      return corsErrorResponse(
        parseError || new Error('Invalid request body'),
        400,
        req
      );
    }

    // Validate required fields
    const validation = validateRequired(body.report_type, 'report_type');
    if (!validation.valid) {
      return corsErrorResponse(validation.error!, 400, req);
    }

    // Validate dates
    if (!isValidDate(body.start_date) || !isValidDate(body.end_date)) {
      return corsErrorResponse(
        new Error('Invalid date format'),
        400,
        req
      );
    }

    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);

    if (startDate > endDate) {
      return corsErrorResponse(
        new Error('Start date must be before end date'),
        400,
        req
      );
    }

    // Determine organization ID
    const organizationId = body.organization_id || user.organization_id;

    // Verify user has access to organization
    if (body.organization_id && body.organization_id !== user.organization_id) {
      if (user.role !== 'super_admin') {
        return corsErrorResponse(
          new Error('Access denied to this organization'),
          403,
          req
        );
      }
    }

    const supabase = getServiceClient();

    // Generate report based on type
    let reportData: Record<string, unknown> = {};

    switch (body.report_type) {
      case 'profit_loss':
        reportData = await generateProfitLossReport(
          supabase,
          organizationId,
          startDate,
          endDate
        );
        break;

      case 'balance_sheet':
        reportData = await generateBalanceSheet(
          supabase,
          organizationId,
          endDate
        );
        break;

      case 'cash_flow':
        reportData = await generateCashFlowReport(
          supabase,
          organizationId,
          startDate,
          endDate
        );
        break;

      case 'sales':
        reportData = await generateSalesReport(
          supabase,
          organizationId,
          startDate,
          endDate
        );
        break;

      case 'expenses':
        reportData = await generateExpensesReport(
          supabase,
          organizationId,
          startDate,
          endDate
        );
        break;

      default:
        return corsErrorResponse(
          new Error('Invalid report type'),
          400,
          req
        );
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      user_id: user.id,
      action: 'generate_report',
      entity_type: 'report',
      new_values: {
        report_type: body.report_type,
        start_date: body.start_date,
        end_date: body.end_date,
      },
    });

    return corsResponse(
      {
        success: true,
        data: {
          report_type: body.report_type,
          start_date: body.start_date,
          end_date: body.end_date,
          generated_at: new Date().toISOString(),
          ...reportData,
        },
      },
      200,
      req
    );
  } catch (error) {
    console.error('Report generation error:', error);
    return corsErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500,
      req
    );
  }
});

/**
 * Generate Profit & Loss Report
 */
async function generateProfitLossReport(
  supabase: ReturnType<typeof getServiceClient>,
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  // Get income (from invoices)
  const { data: income } = await supabase
    .from('invoices')
    .select('total_amount, amount_paid')
    .eq('organization_id', organizationId)
    .eq('status', 'paid')
    .gte('invoice_date', startDate.toISOString())
    .lte('invoice_date', endDate.toISOString());

  const totalIncome = income?.reduce((sum, inv) => sum + inv.amount_paid, 0) || 0;

  // Get expenses
  const { data: expenses } = await supabase
    .from('transactions')
    .select('amount')
    .eq('organization_id', organizationId)
    .eq('type', 'expense')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  const netProfit = totalIncome - totalExpenses;

  return {
    income: {
      total: totalIncome,
      breakdown: income || [],
    },
    expenses: {
      total: totalExpenses,
      breakdown: expenses || [],
    },
    net_profit: netProfit,
    profit_margin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
  };
}

/**
 * Generate Balance Sheet
 */
async function generateBalanceSheet(
  supabase: ReturnType<typeof getServiceClient>,
  organizationId: string,
  asOfDate: Date
) {
  // Get assets (bank accounts)
  const { data: bankAccounts } = await supabase
    .from('bank_accounts')
    .select('current_balance, currency')
    .eq('organization_id', organizationId)
    .eq('is_active', true);

  const totalAssets = bankAccounts?.reduce((sum, acc) => sum + acc.current_balance, 0) || 0;

  // Get liabilities (outstanding invoices)
  const { data: outstandingInvoices } = await supabase
    .from('invoices')
    .select('amount_due')
    .eq('organization_id', organizationId)
    .in('status', ['sent', 'partially_paid', 'overdue'])
    .lte('invoice_date', asOfDate.toISOString());

  const totalLiabilities = outstandingInvoices?.reduce((sum, inv) => sum + inv.amount_due, 0) || 0;

  const equity = totalAssets - totalLiabilities;

  return {
    assets: {
      total: totalAssets,
      breakdown: bankAccounts || [],
    },
    liabilities: {
      total: totalLiabilities,
      breakdown: outstandingInvoices || [],
    },
    equity,
  };
}

/**
 * Generate Cash Flow Report
 */
async function generateCashFlowReport(
  supabase: ReturnType<typeof getServiceClient>,
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  // Operating activities (invoices and expenses)
  const { data: operating } = await supabase
    .from('transactions')
    .select('type, amount, date')
    .eq('organization_id', organizationId)
    .in('type', ['income', 'expense'])
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  const operatingCashFlow = operating?.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount);
  }, 0) || 0;

  // Investing activities (transfers)
  const { data: investing } = await supabase
    .from('transactions')
    .select('amount')
    .eq('organization_id', organizationId)
    .eq('type', 'transfer')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  const investingCashFlow = investing?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const netCashFlow = operatingCashFlow + investingCashFlow;

  return {
    operating_activities: {
      cash_flow: operatingCashFlow,
      transactions: operating || [],
    },
    investing_activities: {
      cash_flow: investingCashFlow,
      transactions: investing || [],
    },
    net_cash_flow: netCashFlow,
  };
}

/**
 * Generate Sales Report
 */
async function generateSalesReport(
  supabase: ReturnType<typeof getServiceClient>,
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, customer:customers(name)')
    .eq('organization_id', organizationId)
    .gte('invoice_date', startDate.toISOString())
    .lte('invoice_date', endDate.toISOString())
    .order('invoice_date', { ascending: false });

  const totalSales = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
  const paidSales = invoices?.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount_paid, 0) || 0;

  return {
    total_sales: totalSales,
    paid_sales: paidSales,
    outstanding_sales: totalSales - paidSales,
    invoice_count: invoices?.length || 0,
    invoices: invoices || [],
  };
}

/**
 * Generate Expenses Report
 */
async function generateExpensesReport(
  supabase: ReturnType<typeof getServiceClient>,
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const { data: expenses } = await supabase
    .from('transactions')
    .select('*, category:expense_categories(name)')
    .eq('organization_id', organizationId)
    .eq('type', 'expense')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('date', { ascending: false });

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  // Group by category
  const byCategory: Record<string, number> = {};
  expenses?.forEach((exp) => {
    const categoryName = (exp.category as { name: string })?.name || 'Uncategorized';
    byCategory[categoryName] = (byCategory[categoryName] || 0) + exp.amount;
  });

  return {
    total_expenses: totalExpenses,
    expense_count: expenses?.length || 0,
    by_category: byCategory,
    expenses: expenses || [],
  };
}

