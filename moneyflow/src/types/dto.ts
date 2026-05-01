/**
 * Data Transfer Objects (DTOs)
 * Types for API request/response payloads
 */

// ============================================
// Invoice DTOs
// ============================================

export interface CreateInvoiceDto {
  customer_id: string;
  organization_id: string;
  invoice_date?: string;
  due_date?: string;
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  payment_status?: 'UNPAID' | 'PARTIAL' | 'PAID';
  notes?: string;
  terms?: string;
  items: CreateInvoiceItemDto[];
  tax_rate?: number;
  discount_amount?: number;
  discount_type?: 'FIXED' | 'PERCENTAGE';
}

export interface UpdateInvoiceDto {
  customer_id?: string;
  invoice_date?: string;
  due_date?: string;
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  payment_status?: 'UNPAID' | 'PARTIAL' | 'PAID';
  notes?: string;
  terms?: string;
  items?: UpdateInvoiceItemDto[];
  tax_rate?: number;
  discount_amount?: number;
  discount_type?: 'FIXED' | 'PERCENTAGE';
}

export interface CreateInvoiceItemDto {
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  discount?: number;
}

export interface UpdateInvoiceItemDto extends Partial<CreateInvoiceItemDto> {
  id?: string;
}

// ============================================
// Customer DTOs
// ============================================

export interface CreateCustomerDto {
  organization_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  notes?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  credit_limit?: number;
  payment_terms?: number;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  notes?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  credit_limit?: number;
  payment_terms?: number;
}

// ============================================
// Product DTOs
// ============================================

export interface CreateProductDto {
  organization_id: string;
  name: string;
  sku?: string;
  description?: string;
  category?: string;
  unit_price: number;
  cost_price?: number;
  stock_quantity?: number;
  reorder_level?: number;
  unit?: string;
  tax_rate?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  image_url?: string;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  description?: string;
  category?: string;
  unit_price?: number;
  cost_price?: number;
  stock_quantity?: number;
  reorder_level?: number;
  unit?: string;
  tax_rate?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  image_url?: string;
}

// ============================================
// Transaction DTOs
// ============================================

export interface CreateTransactionDto {
  organization_id: string;
  invoice_id?: string;
  customer_id?: string;
  type: 'INCOME' | 'EXPENSE' | 'PAYMENT' | 'REFUND';
  amount: number;
  payment_method?: string;
  reference?: string;
  description?: string;
  transaction_date?: string;
  category?: string;
}

export interface UpdateTransactionDto {
  type?: 'INCOME' | 'EXPENSE' | 'PAYMENT' | 'REFUND';
  amount?: number;
  payment_method?: string;
  reference?: string;
  description?: string;
  transaction_date?: string;
  category?: string;
}

// ============================================
// User DTOs
// ============================================

export interface CreateUserDto {
  email: string;
  password: string;
  full_name: string;
  organization_id?: string;
  role?: 'user' | 'admin' | 'super_admin';
}

export interface UpdateUserDto {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role?: 'user' | 'admin' | 'super_admin';
  preferences?: Record<string, any>;
}

// ============================================
// Organization DTOs
// ============================================

export interface CreateOrganizationDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  logo_url?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  logo_url?: string;
  settings?: Record<string, any>;
}

// ============================================
// Auth DTOs
// ============================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  email: string;
  password: string;
  full_name: string;
  organization_name?: string;
}

export interface ResetPasswordDto {
  email: string;
}

export interface UpdatePasswordDto {
  current_password: string;
  new_password: string;
}

// ============================================
// Report/Analytics DTOs
// ============================================

export interface ReportFiltersDto {
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  customer_id?: string;
  product_id?: string;
  category?: string;
}

export interface ExportDto {
  format: 'csv' | 'xlsx' | 'pdf';
  filters?: ReportFiltersDto;
  columns?: string[];
}
