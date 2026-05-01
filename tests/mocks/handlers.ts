/**
 * MSW Request Handlers
 *
 * Mock Service Worker handlers for API mocking in tests.
 * Intercepts HTTP requests and returns mock responses.
 *
 * @module Tests/Mocks/Handlers
 *
 * @see https://mswjs.io/docs/getting-started
 */

import { http, HttpResponse } from 'msw';
import { mockUsers, mockOrganizations, mockCustomers, mockProducts, mockInvoices } from './mockData';

/**
 * API base URL
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:54321/rest/v1';

/**
 * MSW request handlers
 * Handles all API requests in tests
 */
export const handlers = [
  // ============================================================================
  // Authentication Handlers
  // ============================================================================

  http.post(`${API_BASE}/auth/v1/token`, async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string };
    
    if (body.email === 'admin@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUsers[0],
      });
    }

    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.get(`${API_BASE}/auth/v1/user`, () => {
    return HttpResponse.json(mockUsers[0]);
  }),

  // ============================================================================
  // Users Handlers
  // ============================================================================

  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json(mockUsers);
  }),

  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  // ============================================================================
  // Organizations Handlers
  // ============================================================================

  http.get(`${API_BASE}/organizations`, () => {
    return HttpResponse.json(mockOrganizations);
  }),

  http.get(`${API_BASE}/organizations/:id`, ({ params }) => {
    const org = mockOrganizations.find((o) => o.id === params.id);
    if (!org) {
      return HttpResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    return HttpResponse.json(org);
  }),

  // ============================================================================
  // Customers Handlers
  // ============================================================================

  http.get(`${API_BASE}/customers`, () => {
    return HttpResponse.json(mockCustomers);
  }),

  http.get(`${API_BASE}/customers/:id`, ({ params }) => {
    const customer = mockCustomers.find((c) => c.id === params.id);
    if (!customer) {
      return HttpResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return HttpResponse.json(customer);
  }),

  http.post(`${API_BASE}/customers`, async ({ request }) => {
    const body = await request.json();
    const newCustomer = {
      id: `cust-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newCustomer, { status: 201 });
  }),

  http.patch(`${API_BASE}/customers/:id`, async ({ params, request }) => {
    const body = await request.json();
    const customer = mockCustomers.find((c) => c.id === params.id);
    if (!customer) {
      return HttpResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return HttpResponse.json({ ...customer, ...body, updated_at: new Date().toISOString() });
  }),

  http.delete(`${API_BASE}/customers/:id`, ({ params }) => {
    const customer = mockCustomers.find((c) => c.id === params.id);
    if (!customer) {
      return HttpResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true });
  }),

  // ============================================================================
  // Products Handlers
  // ============================================================================

  http.get(`${API_BASE}/products`, () => {
    return HttpResponse.json(mockProducts);
  }),

  http.get(`${API_BASE}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  http.post(`${API_BASE}/products`, async ({ request }) => {
    const body = await request.json();
    const newProduct = {
      id: `prod-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  // ============================================================================
  // Invoices Handlers
  // ============================================================================

  http.get(`${API_BASE}/invoices`, () => {
    return HttpResponse.json(mockInvoices);
  }),

  http.get(`${API_BASE}/invoices/:id`, ({ params }) => {
    const invoice = mockInvoices.find((i) => i.id === params.id);
    if (!invoice) {
      return HttpResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return HttpResponse.json(invoice);
  }),

  http.post(`${API_BASE}/invoices`, async ({ request }) => {
    const body = await request.json();
    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoice_number: `INV-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newInvoice, { status: 201 });
  }),

  http.patch(`${API_BASE}/invoices/:id`, async ({ params, request }) => {
    const body = await request.json();
    const invoice = mockInvoices.find((i) => i.id === params.id);
    if (!invoice) {
      return HttpResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return HttpResponse.json({ ...invoice, ...body, updated_at: new Date().toISOString() });
  }),

  // ============================================================================
  // Dashboard Handlers
  // ============================================================================

  http.get(`${API_BASE}/dashboard/stats`, () => {
    return HttpResponse.json({
      totalRevenue: 100000,
      totalExpenses: 50000,
      totalInvoices: 50,
      totalCustomers: 20,
      pendingInvoices: 10,
      overdueInvoices: 5,
    });
  }),

  // ============================================================================
  // Reports Handlers
  // ============================================================================

  http.post(`${API_BASE}/reports/generate`, async ({ request }) => {
    const body = await request.json() as { report_type: string };
    return HttpResponse.json({
      report_type: body.report_type,
      data: [],
      generated_at: new Date().toISOString(),
    });
  }),

  // ============================================================================
  // Fallback Handler
  // ============================================================================

  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return HttpResponse.json(
      { error: 'Unhandled request in tests' },
      { status: 500 }
    );
  }),
];

