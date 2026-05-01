/**
 * API Hooks Index
 * Central export point for all API React Query hooks
 */

// Invoice Hooks
export {
  useInvoices,
  useInvoice,
  useOverdueInvoices,
  useInvoiceStats,
  useCustomerInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useSendInvoice,
  useRecordPayment,
  useMarkInvoicePaid,
  useDuplicateInvoice,
} from './use-invoices';

// Customer Hooks
export {
  useCustomers,
  useCustomer,
  useCustomerSearch,
  useCustomerStats,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useUpdateCustomerBalance,
} from './use-customers';

// Product Hooks
export {
  useProducts,
  useProduct,
  useLowStockProducts,
  useProductCategories,
  useProductSearch,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateStock,
  useBulkUpdatePrices,
} from './use-products';
