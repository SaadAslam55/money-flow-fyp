// src/types/invoice.types.ts
/**
 * Invoice Type Definitions
 *
 * Invoice-specific types for forms, calculations, and extended invoice data.
 * Note: Base invoice types (Invoice, InvoiceStatus, InvoiceFilters) are defined in database.types.ts
 *
 * @module Types/Invoice
 */

import type { Customer, Product, User, InvoiceStatus, PaymentMethod } from './database.types';

/**
 * Invoice form data for create/edit forms
 */
export interface InvoiceFormData {
  customer_id: string;
  invoice_date: string;
  due_date: string;
  items: InvoiceItemFormData[];
  notes?: string;
  terms?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
}

/**
 * Invoice item form data
 */
export interface InvoiceItemFormData {
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

/**
 * Invoice with all related data (customer, items, creator)
 */
export interface InvoiceWithDetails {
  id: string;
  organization_id: string;
  customer_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  notes: string | null;
  terms: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  customer: Customer;
  items: InvoiceItemWithProduct[];
  created_by_user: User;
}

/**
 * Invoice item with product relation
 */
export interface InvoiceItemWithProduct {
  id: string;
  invoice_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
  created_at: string;
  product?: Product;
}

/**
 * Payment record for invoice payments
 */
export interface PaymentRecord {
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  notes?: string;
}

/**
 * Invoice calculation result
 */
export interface InvoiceCalculation {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  items: InvoiceItemCalculation[];
}

/**
 * Invoice item calculation result
 */
export interface InvoiceItemCalculation extends InvoiceItemFormData {
  line_total: number;
  tax_amount: number;
}