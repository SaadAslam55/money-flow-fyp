// src/types/api.types.ts
/**
 * API Type Definitions
 *
 * Request/Response types for all API endpoints.
 * These types define the shape of data sent to and received from the API.
 *
 * @module Types/API
 */

import type {
  Customer,
  Product,
  InvoiceStatus,
  PaymentMethod,
  TransactionType,
} from './database.types';

// ============================================
// REQUEST DTOs (Data Transfer Objects)
// ============================================

/**
 * Create invoice request
 */
export interface CreateInvoiceRequest {
  customer_id: string;
  invoice_date: string;
  due_date: string;
  items: CreateInvoiceItemRequest[];
  notes?: string;
  terms?: string;
  footer?: string;
  discount_amount?: number;
}

/**
 * Create invoice item request
 */
export interface CreateInvoiceItemRequest {
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percent?: number;
}

/**
 * Update invoice request
 */
export interface UpdateInvoiceRequest {
  customer_id?: string;
  invoice_date?: string;
  due_date?: string;
  status?: InvoiceStatus;
  notes?: string;
  terms?: string;
  footer?: string;
  discount_amount?: number;
}

/**
 * Create customer request
 */
export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  credit_limit?: number;
  portal_access?: boolean;
  notes?: string;
  tags?: string[];
}

/**
 * Update customer request
 */
export type UpdateCustomerRequest = Partial<CreateCustomerRequest>;

/**
 * Create product request
 */
export interface CreateProductRequest {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  unit_price: number;
  cost_price?: number;
  tax_rate: number;
  is_service: boolean;
  track_inventory: boolean;
  minimum_stock: number;
  maximum_stock?: number;
  image_url?: string;
  is_active?: boolean;
}

/**
 * Update product request
 */
export type UpdateProductRequest = Partial<CreateProductRequest>;

/**
 * Create transaction request
 */
export interface CreateTransactionRequest {
  type: TransactionType;
  category_id?: string;
  amount: number;
  date: string;
  description?: string;
  payment_method: PaymentMethod;
  bank_account_id?: string;
  reference_type?: string;
  reference_id?: string;
  tags?: string[];
}

/**
 * Record payment request
 */
export interface RecordPaymentRequest {
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  notes?: string;
  bank_account_id?: string;
}

/**
 * Adjust stock request
 */
export interface AdjustStockRequest {
  product_id: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  reason: string;
  notes?: string;
}

/**
 * Send invoice email request
 */
export interface SendInvoiceRequest {
  invoice_id: string;
  to: string;
  cc?: string[];
  subject?: string;
  message?: string;
  attach_pdf: boolean;
}

/**
 * Generate report request
 */
export interface GenerateReportRequest {
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'sales' | 'expenses';
  start_date: string;
  end_date: string;
  format?: 'json' | 'pdf' | 'csv' | 'excel';
  filters?: Record<string, any>;
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Invoice response with relations
 */
export interface InvoiceResponse {
  id: string;
  organization_id: string;
  customer_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  total_amount: number;
  paid_amount: number;
  notes?: string;
  terms?: string;
  footer?: string;
  discount_amount?: number;
  created_at: string;
  updated_at: string;
  customer: Pick<Customer, 'id' | 'name' | 'email' | 'phone'>;
  items: InvoiceItemResponse[];
}

/**
 * Invoice item response
 */
export interface InvoiceItemResponse {
  id: string;
  invoice_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percent?: number;
  created_at: string;
  updated_at?: string;
  product?: Pick<Product, 'id' | 'name' | 'sku'>;
}

/**
 * Customer response with stats
 */
export interface CustomerResponse extends Customer {
  total_purchases: number;
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
}

/**
 * Product response with inventory
 */
export interface ProductResponse extends Product {
  total_sold: number;
  stock_value: number;
}

// ============================================
// PAGINATION & SORTING
// ============================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  per_page: number;
}

/**
 * Sort parameters
 */
export interface SortParams<T = any> {
  field: keyof T | string;
  order: 'asc' | 'desc';
}

/**
 * List request parameters
 */
export interface ListRequestParams extends PaginationParams {
  sort?: SortParams;
  filters?: Record<string, any>;
  search?: string;
}

// ============================================
// FILE UPLOAD
// ============================================

/**
 * File upload response
 */
export interface FileUploadResponse {
  url: string;
  path: string;
  size: number;
  mime_type: string;
}

/**
 * Bulk import result
 */
export interface BulkImportResult<T> {
  success_count: number;
  error_count: number;
  total_count: number;
  errors: Array<{
    row: number;
    data: Partial<T>;
    error: string;
  }>;
  imported: T[];
}
