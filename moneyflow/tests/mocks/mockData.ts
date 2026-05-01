/**
 * Mock Data
 *
 * Centralized mock data for testing.
 * Provides consistent test data across all test files.
 *
 * @module Tests/Mocks
 */

import type { User, Organization, Invoice, Customer, Product } from '@/types/database.types';

/**
 * Mock users
 */
export const mockUsers: User[] = [
  {
    id: 'user-1',
    auth_user_id: 'auth-user-1',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    organization_id: 'org-1',
    is_active: true,
    avatar_url: null,
    phone: '+923001234567',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    auth_user_id: 'auth-user-2',
    email: 'manager@example.com',
    full_name: 'Manager User',
    role: 'manager',
    organization_id: 'org-1',
    is_active: true,
    avatar_url: null,
    phone: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

/**
 * Mock organizations
 */
export const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Test Organization',
    subdomain: 'test-org',
    logo_url: null,
    email: 'org@example.com',
    phone: '+923001234567',
    address: '123 Test Street',
    city: 'Karachi',
    country: 'PK',
    tax_id: 'TAX-123',
    fiscal_year_start: '2024-01-01',
    currency: 'PKR',
    timezone: 'Asia/Karachi',
    subscription_plan: 'pro',
    subscription_status: 'active',
    stripe_customer_id: null,
    stripe_subscription_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

/**
 * Mock customers
 */
export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    organization_id: 'org-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+923001234567',
    address: '123 Customer St',
    city: 'Karachi',
    country: 'PK',
    tax_id: null,
    credit_limit: 10000,
    outstanding_balance: 0,
    portal_access: false,
    portal_password_hash: null,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cust-2',
    organization_id: 'org-1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+923007654321',
    address: null,
    city: null,
    country: 'PK',
    tax_id: null,
    credit_limit: 5000,
    outstanding_balance: 0,
    portal_access: false,
    portal_password_hash: null,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

/**
 * Mock products
 */
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    organization_id: 'org-1',
    name: 'Test Product 1',
    description: 'Test description 1',
    sku: 'SKU-001',
    barcode: null,
    category: 'Electronics',
    unit_price: 1000,
    cost_price: 500,
    tax_rate: 17,
    is_service: false,
    track_inventory: true,
    current_stock: 100,
    minimum_stock: 10,
    maximum_stock: null,
    image_url: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    organization_id: 'org-1',
    name: 'Test Product 2',
    description: 'Test description 2',
    sku: 'SKU-002',
    barcode: null,
    category: 'Services',
    unit_price: 500,
    cost_price: 200,
    tax_rate: 17,
    is_service: true,
    track_inventory: false,
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: null,
    image_url: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

/**
 * Mock invoices
 */
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoice_number: 'INV-001',
    customer_id: 'cust-1',
    organization_id: 'org-1',
    invoice_date: '2024-01-01',
    due_date: '2024-01-31',
    status: 'draft',
    subtotal: 1000,
    tax_amount: 170,
    discount_amount: 0,
    total_amount: 1170,
    amount_paid: 0,
    amount_due: 1170,
    notes: null,
    terms: 'Net 30',
    footer: null,
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-002',
    customer_id: 'cust-2',
    organization_id: 'org-1',
    invoice_date: '2024-01-15',
    due_date: '2024-02-14',
    status: 'sent',
    subtotal: 2000,
    tax_amount: 340,
    discount_amount: 100,
    total_amount: 2240,
    amount_paid: 0,
    amount_due: 2240,
    notes: 'Thank you for your business',
    terms: 'Net 30',
    footer: null,
    created_by: 'user-1',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

/**
 * Mock API responses
 */
export const mockApiResponses = {
  success: { success: true, data: null },
  error: { success: false, error: 'Test error' },
  paginated: <T>(data: T[], page = 1, pageSize = 10) => ({
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total: data.length,
      totalPages: Math.ceil(data.length / pageSize),
    },
  }),
};

/**
 * Mock authentication responses
 */
export const mockAuthResponses = {
  signInSuccess: {
    user: mockUsers[0],
    session: {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
    },
  },
  signInError: {
    error: 'Invalid credentials',
  },
  signOutSuccess: {
    success: true,
  },
};

