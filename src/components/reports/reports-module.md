# Reports Module

## 📖 Overview

The Reports Module provides comprehensive financial reporting and analytics with visual charts and exportable data.

## 🎯 Module Objectives

- Generate profit & loss statements
- Create revenue reports
- Analyze expenses by category
- Track cash flow trends
- Export reports to PDF/Excel
- Schedule automated reports
- Compare periods
- Visualize data with charts

## 👥 User Roles Involved

| Role           | Access Level | Permissions              |
| -------------- | ------------ | ------------------------ |
| **Admin**      | Full Access  | All reports              |
| **Manager**    | Full Access  | All reports              |
| **Accountant** | Full Access  | All reports              |
| **Cashier**    | Limited      | Basic sales reports only |

## 🏗️ Architecture

```
Report Generation Flow:
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  Report      │────▶│  Data         │────▶│  Rendering   │
│  Request     │     │  Aggregation  │     │  (PDF/Excel) │
└──────────────┘     └───────────────┘     └──────────────┘
       │                     │                     │
       ▼                     ▼                     ▼
  Date Range          SQL Functions        Formatted
  Filters             Analytics            Document
  Report Type         Calculations         + Charts
📁 File Structure
src/
├── components/reports/
│   ├── ProfitLossReport.tsx         ⬜ P&L statement
│   ├── SalesReport.tsx              ⬜ Revenue analysis
│   ├── ExpenseReport.tsx            ⬜ Expense breakdown
│   ├── CashFlowReport.tsx           ⬜ Cash flow statement
│   ├── TaxReport.tsx                ⬜ Tax summary
│   ├── ReportFilters.tsx            ⬜ Date range & filters
│   └── ReportExport.tsx             ⬜ Export functionality
│
├── pages/reports/
│   ├── ReportsPage.tsx              ⬜ Main reports dashboard
│   ├── ProfitLossPage.tsx           ⬜ P&L report page
│   ├── SRetryMContinueReports Module (Continued)
├── pages/reports/
│   ├── ReportsPage.tsx              ⬜ Main reports dashboard
│   ├── ProfitLossPage.tsx           ⬜ P&L report page
│   ├── SalesReportPage.tsx          ⬜ Sales analysis page
│   └── CustomReportPage.tsx         ⬜ Custom report builder
│
├── services/api/
│   └── reportApi.ts                 ⬜ Report generation API
│
├── hooks/
│   ├── useReports.ts                ⬜ Report hooks
│   └── useReportExport.ts           ⬜ Export hooks
│
└── schemas/
    └── reportSchemas.ts             ⬜ Report validation
✅ Implementation Checklist
Phase 1: Core Setup ⬜

 Report types and interfaces
 Date range utilities
 SQL aggregation functions
 React Query hooks
 Export utilities

Phase 2: Profit & Loss ⬜

 Income calculation
 Expense categorization
 Gross profit calculation
 Net profit calculation
 Period comparison
 Visual charts

Phase 3: Sales Reports ⬜

 Revenue by period
 Revenue by customer
 Revenue by product
 Payment method breakdown
 Outstanding invoices

Phase 4: Expense Reports ⬜

 Expenses by category
 Expenses by vendor
 Expenses by payment method
 Month-over-month comparison
 Budget vs actual

Phase 5: Export Features ⬜

 PDF generation
 Excel export
 CSV export
 Email delivery
 Scheduled reports

Phase 6: Advanced Analytics ⬜

 Custom report builder
 Dashboard widgets
 Trend analysis
 Forecasting
 Budget tracking
 KPI monitoring

🔑 Key Features
1. Profit & Loss Statement
sql-- Database function for P&L
CREATE OR REPLACE FUNCTION get_profit_loss(
  org_id UUID,
  start_date DATE,
  end_date DATE
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH income AS (
    SELECT
      'Sales Revenue' as line_item,
      COALESCE(SUM(total_amount), 0) as amount
    FROM invoices
    WHERE organization_id = org_id
    AND status = 'paid'
    AND invoice_date BETWEEN start_date AND end_date
  ),
  cogs AS (
    SELECT
      'Cost of Goods Sold' as line_item,
      COALESCE(SUM(ii.quantity * COALESCE(p.cost_price, 0)), 0) as amount
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    LEFT JOIN products p ON ii.product_id = p.id
    WHERE i.organization_id = org_id
    AND i.status = 'paid'
    AND i.invoice_date BETWEEN start_date AND end_date
  ),
  expenses AS (
    SELECT
      COALESCE(ec.name, 'Uncategorized') as line_item,
      COALESCE(SUM(t.amount), 0) as amount
    FROM transactions t
    LEFT JOIN expense_categories ec ON t.category_id = ec.id
    WHERE t.organization_id = org_id
    AND t.type = 'expense'
    AND t.date BETWEEN start_date AND end_date
    GROUP BY ec.name
  )
  SELECT json_build_object(
    'revenue', (SELECT json_agg(income) FROM income),
    'cogs', (SELECT json_agg(cogs) FROM cogs),
    'expenses', (SELECT json_agg(expenses) FROM expenses),
    'gross_profit', (SELECT amount FROM income) - (SELECT amount FROM cogs),
    'net_profit', (SELECT amount FROM income) - (SELECT amount FROM cogs) -
                  COALESCE((SELECT SUM(amount) FROM expenses), 0)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
2. Revenue Analysis
typescriptexport async function getRevenueReport(
  organizationId: string,
  startDate: string,
  endDate: string,
  groupBy: 'customer' | 'product' | 'period' = 'period'
) {
  let query = supabase
    .from('invoices')
    .select(`
      id,
      invoice_date,
      total_amount,
      customer:customers(id, name),
      items:invoice_items(
        quantity,
        unit_price,
        product:products(id, name, category)
      )
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'paid')
    .gte('invoice_date', startDate)
    .lte('invoice_date', endDate);

  const { data, error } = await query;
  if (error) throw error;

  // Group data based on groupBy parameter
  switch (groupBy) {
    case 'customer':
      return groupByCustomer(data);
    case 'product':
      return groupByProduct(data);
    case 'period':
      return groupByPeriod(data);
  }
}

function groupByPeriod(invoices: any[]) {
  const periods: Record<string, number> = {};

  invoices.forEach(invoice => {
    const month = new Date(invoice.invoice_date).toLocaleString('default', {
      month: 'short',
      year: 'numeric'
    });
    periods[month] = (periods[month] || 0) + invoice.total_amount;
  });

  return Object.entries(periods).map(([period, revenue]) => ({
    period,
    revenue,
  }));
}
3. Expense Breakdown
typescriptexport async function getExpenseBreakdown(
  organizationId: string,
  startDate: string,
  endDate: string
) {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      category:expense_categories(name),
      date
    `)
    .eq('organization_id', organizationId)
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  // Group by category
  const byCategory: Record<string, { amount: number; count: number }> = {};
  let totalExpenses = 0;

  transactions?.forEach((transaction: any) => {
    const category = transaction.category?.name || 'Uncategorized';

    if (!byCategory[category]) {
      byCategory[category] = { amount: 0, count: 0 };
    }

    byCategory[category].amount += transaction.amount;
    byCategory[category].count += 1;
    totalExpenses += transaction.amount;
  });

  // Calculate percentages
  return Object.entries(byCategory)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: (data.amount / totalExpenses) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
}
4. PDF Report Generation
typescript// Supabase Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { report_type, start_date, end_date, organization_id } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Generate report data
  const { data: reportData } = await supabase
    .rpc(`get_${report_type}_report`, {
      org_id: organization_id,
      start_date,
      end_date,
    });

  // Generate PDF using HTML template
  const html = generateReportHTML(report_type, reportData, {
    start_date,
    end_date,
  });

  // Convert to PDF (using puppeteer or similar)
  const pdfBuffer = await generatePDF(html);

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${report_type}_${start_date}_${end_date}.pdf"`,
    },
  });
});
📊 Database Functions
sql-- Sales summary function
CREATE OR REPLACE FUNCTION get_sales_summary(
  org_id UUID,
  start_date DATE,
  end_date DATE
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH sales_data AS (
    SELECT
      COUNT(*) as invoice_count,
      SUM(total_amount) as total_revenue,
      SUM(amount_paid) as total_paid,
      SUM(amount_due) as total_outstanding,
      AVG(total_amount) as avg_invoice_value
    FROM invoices
    WHERE organization_id = org_id
    AND invoice_date BETWEEN start_date AND end_date
    AND status != 'cancelled'
  ),
  top_customers AS (
    SELECT
      c.name,
      SUM(i.total_amount) as revenue
    FROM invoices i
    JOIN customers c ON i.customer_id = c.id
    WHERE i.organization_id = org_id
    AND i.invoice_date BETWEEN start_date AND end_date
    AND i.status = 'paid'
    GROUP BY c.id, c.name
    ORDER BY revenue DESC
    LIMIT 5
  ),
  top_products AS (
    SELECT
      p.name,
      SUM(ii.quantity) as quantity_sold,
      SUM(ii.line_total) as revenue
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    LEFT JOIN products p ON ii.product_id = p.id
    WHERE i.organization_id = org_id
    AND i.invoice_date BETWEEN start_date AND end_date
    AND i.status = 'paid'
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT 5
  )
  SELECT json_build_object(
    'summary', (SELECT row_to_json(sales_data) FROM sales_data),
    'top_customers', (SELECT json_agg(top_customers) FROM top_customers),
    'top_products', (SELECT json_agg(top_products) FROM top_products)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tax summary function
CREATE OR REPLACE FUNCTION get_tax_summary(
  org_id UUID,
  start_date DATE,
  end_date DATE
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH tax_collected AS (
    SELECT
      COALESCE(SUM(tax_amount), 0) as total_tax
    FROM invoices
    WHERE organization_id = org_id
    AND status = 'paid'
    AND invoice_date BETWEEN start_date AND end_date
  ),
  tax_by_rate AS (
    SELECT
      ii.tax_rate,
      SUM(ii.quantity * ii.unit_price * ii.tax_rate / 100) as tax_amount
    FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE i.organization_id = org_id
    AND i.status = 'paid'
    AND i.invoice_date BETWEEN start_date AND end_date
    GROUP BY ii.tax_rate
    ORDER BY ii.tax_rate
  )
  SELECT json_build_object(
    'total_tax_collected', (SELECT total_tax FROM tax_collected),
    'by_tax_rate', (SELECT json_agg(tax_by_rate) FROM tax_by_rate)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
🔄 State Management
typescript// Report hooks
export function useProfitLoss(startDate: string, endDate: string) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['profit-loss', organization?.id, startDate, endDate],
    queryFn: () => getProfitLoss(organization!.id, startDate, endDate),
    enabled: !!organization?.id && !!startDate && !!endDate,
    staleTime: 300000, // 5 minutes
  });
}

export function useReportExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (reportData: any, reportType: string) => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          report_type: reportType,
          data: reportData,
        },
      });

      if (error) throw error;

      // Download PDF
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPDF, isExporting };
}
🧪 Testing
typescript// Test profit & loss calculation
test('should calculate profit and loss correctly', async () => {
  // Create test data
  await createTestInvoice({ total_amount: 10000, status: 'paid' });
  await createTestTransaction({ type: 'expense', amount: 3000 });

  const report = await getProfitLoss(
    organizationId,
    '2024-01-01',
    '2024-01-31'
  );

  expect(report.revenue).toBe(10000);
  expect(report.expenses).toBe(3000);
  expect(report.net_profit).toBe(7000);
});

// Test revenue grouping
test('should group revenue by customer', async () => {
  const customer1 = await createTestCustomer({ name: 'Customer A' });
  const customer2 = await createTestCustomer({ name: 'Customer B' });

  await createTestInvoice({ customer_id: customer1.id, total_amount: 5000 });
  await createTestInvoice({ customer_id: customer2.id, total_amount: 3000 });

  const report = await getRevenueReport(
    organizationId,
    '2024-01-01',
    '2024-12-31',
    'customer'
  );

  expect(report).toHaveLength(2);
  expect(report[0].revenue).toBe(5000);
});
```

## 📚 Related Documentation

- [Financial Reporting Guide](../guides/financial-reporting.md)
- [Tax Reports](../guides/tax-reports.md)
- [Custom Reports](../guides/custom-reports.md)

---
