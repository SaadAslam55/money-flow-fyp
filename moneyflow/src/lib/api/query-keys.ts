/**
 * Query Keys Factory
 * Centralized query key definitions for React Query
 */

// ============================================
// Query Key Factory
// ============================================

export const queryKeys = {
  // ============================================
  // Customers
  // ============================================
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    search: (query: string) => [...queryKeys.customers.all, 'search', query] as const,
    stats: () => [...queryKeys.customers.all, 'stats'] as const,
  },

  // ============================================
  // Products
  // ============================================
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    lowStock: () => [...queryKeys.products.all, 'low-stock'] as const,
    categories: () => [...queryKeys.products.all, 'categories'] as const,
    search: (query: string) => [...queryKeys.products.all, 'search', query] as const,
  },

  // ============================================
  // Invoices
  // ============================================
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.invoices.lists(), filters] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
    overdue: () => [...queryKeys.invoices.all, 'overdue'] as const,
    draft: () => [...queryKeys.invoices.all, 'draft'] as const,
    stats: (period: string) => [...queryKeys.invoices.all, 'stats', period] as const,
    byCustomer: (customerId: string) =>
      [...queryKeys.invoices.all, 'customer', customerId] as const,
    number: (prefix?: string) => [...queryKeys.invoices.all, 'next-number', prefix] as const,
  },

  // ============================================
  // Transactions
  // ============================================
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
    byInvoice: (invoiceId: string) =>
      [...queryKeys.transactions.all, 'invoice', invoiceId] as const,
    byCustomer: (customerId: string) =>
      [...queryKeys.transactions.all, 'customer', customerId] as const,
    summary: (period: string) => [...queryKeys.transactions.all, 'summary', period] as const,
  },

  // ============================================
  // Reports & Analytics
  // ============================================
  reports: {
    all: ['reports'] as const,
    dashboard: () => [...queryKeys.reports.all, 'dashboard'] as const,
    salesSummary: (period: string) => [...queryKeys.reports.all, 'sales-summary', period] as const,
    revenueChart: (startDate: string, endDate: string) =>
      [...queryKeys.reports.all, 'revenue-chart', startDate, endDate] as const,
    profitLoss: (startDate: string, endDate: string) =>
      [...queryKeys.reports.all, 'profit-loss', startDate, endDate] as const,
    cashFlow: (period: string) => [...queryKeys.reports.all, 'cash-flow', period] as const,
    topCustomers: (limit: number) => [...queryKeys.reports.all, 'top-customers', limit] as const,
    topProducts: (limit: number) => [...queryKeys.reports.all, 'top-products', limit] as const,
    aging: () => [...queryKeys.reports.all, 'aging'] as const,
  },

  // ============================================
  // User & Auth
  // ============================================
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    permissions: () => [...queryKeys.user.all, 'permissions'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    activity: () => [...queryKeys.user.all, 'activity'] as const,
  },

  // ============================================
  // Organization
  // ============================================
  organization: {
    all: ['organization'] as const,
    current: () => [...queryKeys.organization.all, 'current'] as const,
    settings: () => [...queryKeys.organization.all, 'settings'] as const,
    team: () => [...queryKeys.organization.all, 'team'] as const,
    member: (userId: string) => [...queryKeys.organization.all, 'member', userId] as const,
    subscription: () => [...queryKeys.organization.all, 'subscription'] as const,
    usage: () => [...queryKeys.organization.all, 'usage'] as const,
  },

  // ============================================
  // Inventory
  // ============================================
  inventory: {
    all: ['inventory'] as const,
    logs: (productId?: string) =>
      productId
        ? ([...queryKeys.inventory.all, 'logs', productId] as const)
        : ([...queryKeys.inventory.all, 'logs'] as const),
    movements: (filters: Record<string, any>) =>
      [...queryKeys.inventory.all, 'movements', filters] as const,
    alerts: () => [...queryKeys.inventory.all, 'alerts'] as const,
    valuation: () => [...queryKeys.inventory.all, 'valuation'] as const,
  },

  // ============================================
  // Audit
  // ============================================
  audit: {
    all: ['audit'] as const,
    logs: (filters: Record<string, any>) => [...queryKeys.audit.all, 'logs', filters] as const,
    entity: (entityType: string, entityId: string) =>
      [...queryKeys.audit.all, 'entity', entityType, entityId] as const,
  },

  // ============================================
  // Feature Flags
  // ============================================
  flags: {
    all: ['flags'] as const,
    current: () => [...queryKeys.flags.all, 'current'] as const,
  },
};

// ============================================
// Type Exports
// ============================================

export type CustomerQueryKey = ReturnType<typeof queryKeys.customers.list>;
export type ProductQueryKey = ReturnType<typeof queryKeys.products.list>;
export type InvoiceQueryKey = ReturnType<typeof queryKeys.invoices.list>;
export type TransactionQueryKey = ReturnType<typeof queryKeys.transactions.list>;
export type ReportQueryKey = ReturnType<typeof queryKeys.reports.dashboard>;

export default queryKeys;
