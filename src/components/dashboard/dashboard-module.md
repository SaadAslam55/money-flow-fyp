# Dashboard Module

## 📖 Overview

The Dashboard Module provides real-time business insights with statistics, charts, and quick actions. It's the central hub showing revenue, invoices, customers, and financial trends.

## 🎯 Module Objectives

- Display real-time business metrics
- Visualize revenue vs expenses
- Show recent invoices and transactions
- Provide quick action shortcuts
- Alert on low stock and overdue payments
- Track month-over-month growth

## 👥 User Roles Involved

| Role           | Dashboard View                       |
| -------------- | ------------------------------------ |
| **Admin**      | Full dashboard with all metrics      |
| **Manager**    | Operations metrics, inventory alerts |
| **Accountant** | Financial metrics, reports           |
| **Cashier**    | Today's sales, recent transactions   |

## 🏗️ Architecture

```
Dashboard Data Flow:
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Dashboard  │────▶│  React Query │────▶│  Supabase  │
│    Page     │◀────│   (Cache)    │◀────│  Functions │
└─────────────┘     └──────────────┘     └────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
   Components        Auto-refresh         Aggregations
   (Stats/Charts)      (30 sec)         (Optimized SQL)
```

## 📁 File Structure

```
src/
├── components/dashboard/
│   ├── DashboardStats.tsx         ✅ Statistics cards
│   ├── StatCard.tsx               ✅ Individual stat card
│   ├── RevenueChart.tsx           ✅ Line/bar chart
│   ├── RecentInvoices.tsx         ✅ Invoice list
│   ├── RecentTransactions.tsx     ⬜ Transaction list
│   ├── TopCustomers.tsx           ⬜ Customer ranking
│   ├── QuickActions.tsx           ✅ Action buttons
│   ├── LowStockAlert.tsx          ⬜ Inventory alerts
│   └── ActivityFeed.tsx           ⬜ Activity timeline
│
├── pages/dashboard/
│   └── DashboardPage.tsx          ✅ Main dashboard
│
├── services/api/
│   └── dashboardApi.ts            ✅ Dashboard APIs
│
├── hooks/
│   └── useDashboard.ts            ✅ Dashboard hook
│
└── types/
    └── dashboard.types.ts         ✅ Dashboard types
✅ Implementation Checklist
Phase 1: Core Statistics ✅

 Dashboard API service
 Dashboard hook with React Query
 Stat card component
 Dashboard stats grid
 Real-time data refresh
 Loading skeletons

Phase 2: Charts ✅

 Revenue chart component
 Recharts integration
 Cash flow visualization
 Responsive chart design
 Date range filtering

Phase 3: Lists ✅

 Recent invoices widget
 Invoice status badges
 Click to view details
 Empty state handling

Phase 4: Quick Actions ✅

 Action button grid
 New invoice button
 New customer button
 New product button
 Record payment button

Phase 5: Advanced Widgets ⬜

 Recent transactions list
 Top customers widget
 Low stock alerts
 Activity feed
 Payment reminders

🔑 Key Features
1. Real-Time Statistics
typescript// Auto-refreshes every 30 seconds
const { stats } = useDashboard();

{
  revenue: 125000,
  revenue_change: 15.3,  // +15.3%
  outstanding: 45000,
  customers: 156,
  invoices: 89
}
2. Interactive Charts
tsx<RevenueChart data={chartData} loading={isLoading} />
// Shows revenue vs expenses for last 6 months
3. Percentage Changes
tsx<StatCard
  title="Total Revenue"
  value={stats.revenue}
  change={stats.revenue_change}  // Shows +/- indicator
  icon={DollarSign}
/>
4. Quick Actions
tsx<QuickActions>
  <ActionButton icon={FileText} onClick={() => navigate('/invoices/new')}>
    New Invoice
  </ActionButton>
</QuickActions>
📊 Statistics Calculated
MetricCalculationRefresh RateTotal RevenueSum of paid invoices (current month)30 secondsOutstandingSum of unpaid invoice amounts30 secondsTotal CustomersCount of active customersOn changeInvoices This MonthCount of invoices (current month)30 seconds
📈 Chart Types
1. Revenue vs Expenses Chart

Type: Line chart (dual axis)
Data: Last 6 months
Update: On data change
Colors: Green (revenue), Red (expenses)

2. Cash Flow Chart (Future)

Type: Area chart
Shows: Net cash flow trend
Period: Customizable (1M, 3M, 6M, 1Y)

3. Sales by Category (Future)

Type: Pie/Donut chart
Shows: Revenue breakdown by product category
Interactive: Click to filter

🔄 Data Refresh Strategy
typescript// React Query configuration
{
  staleTime: 30000,        // 30 seconds
  refetchInterval: 30000,  // Auto-refresh
  cacheTime: 300000,       // 5 minutes cache
}
🎨 UI Components Used

Card - Container for widgets
Badge - Status indicators
Button - Quick actions
Skeleton - Loading states
Alert - Notifications
Recharts - Data visualization

📊 Database Functions Used
get_dashboard_stats()
sql-- Returns aggregated statistics
CREATE FUNCTION get_dashboard_stats(org_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'revenue', (SELECT SUM(total_amount) FROM invoices WHERE ...),
    'outstanding', (SELECT SUM(amount_due) FROM invoices WHERE ...),
    'customers', (SELECT COUNT(*) FROM customers WHERE ...),
    'invoices', (SELECT COUNT(*) FROM invoices WHERE ...)
  );
END;
$$ LANGUAGE plpgsql;
🧪 Testing
typescript// Test dashboard data loading
test('should load dashboard stats', async () => {
  const { result } = renderHook(() => useDashboard());

  await waitFor(() => {
    expect(result.current.stats).toBeDefined();
    expect(result.current.stats?.revenue).toBeGreaterThan(0);
  });
});
🐛 Common Issues & Solutions
Issue: Stats not updating in real-time
Solution: Check React Query refetch interval:
typescriptuseQuery({
  queryKey: ['dashboard-stats'],
  refetchInterval: 30000,  // Enable auto-refresh
});
Issue: Chart data not showing
Solution: Verify data format matches Recharts requirements:
typescript// Correct format
[
  { month: 'Jan', revenue: 1000, expenses: 800 },
  { month: 'Feb', revenue: 1200, expenses: 900 }
]
📱 Responsive Design

Desktop: 4-column grid for stats
Tablet: 2-column grid
Mobile: Single column, stacked layout

🚀 Performance Optimizations

Lazy Loading: Dashboard loads after authentication
Code Splitting: Chart library loaded on demand
Memoization: Stats cards use React.memo
Virtualization: Long lists use react-window (future)

📚 Related Documentation

Recharts Documentation
React Query Guide
Dashboard Design Patterns

```
