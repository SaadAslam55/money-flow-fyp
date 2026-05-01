/**
 * Test Utilities
 *
 * Reusable utilities and helpers for writing tests.
 * Provides custom render functions, test data factories, and common assertions.
 *
 * @module Tests/Utils
 *
 * @example
 * ```typescript
 * import { renderWithProviders, createMockUser } from './testUtils';
 *
 * const user = createMockUser({ email: 'test@example.com' });
 * const { getByText } = renderWithProviders(<Component />, { user });
 * ```
 */

import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { vi } from 'vitest';
import type { User, Organization } from '@/types/database.types';

/**
 * Custom render function with all providers
 * Wraps components with React Query, Router, and other necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: {
    user?: User | null;
    organization?: Organization | null;
    initialEntries?: string[];
    queryClient?: QueryClient;
  } & Omit<RenderOptions, 'wrapper'> = {}
) {
  const {
    user = null,
    organization = null,
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Create mock user for testing
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-123',
    auth_user_id: 'auth-user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'admin',
    organization_id: 'org-123',
    is_active: true,
    avatar_url: null,
    phone: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create mock organization for testing
 */
export function createMockOrganization(
  overrides?: Partial<Organization>
): Organization {
  return {
    id: 'org-123',
    name: 'Test Organization',
    slug: 'test-org',
    logo_url: null,
    website: null,
    email: 'org@example.com',
    phone: null,
    address: null,
    city: null,
    state: null,
    country: 'PK',
    postal_code: null,
    tax_id: null,
    currency: 'PKR',
    timezone: 'Asia/Karachi',
    subscription_plan: 'free',
    subscription_status: 'active',
    subscription_started_at: '2024-01-01T00:00:00Z',
    subscription_ends_at: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Wait for async operations to complete
 */
export function waitForAsync() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Wait for a specific condition
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();
  while (!condition() && Date.now() - startTime < timeout) {
    await waitForAsync();
  }
  if (!condition()) {
    throw new Error('Condition not met within timeout');
  }
}

/**
 * Mock Supabase client
 */
export function createMockSupabaseClient() {
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
    })),
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  };
}

/**
 * Create mock invoice
 */
export function createMockInvoice(overrides?: Partial<any>) {
  return {
    id: 'inv-123',
    invoice_number: 'INV-001',
    customer_id: 'cust-123',
    organization_id: 'org-123',
    invoice_date: '2024-01-01',
    due_date: '2024-01-31',
    status: 'draft',
    subtotal: 1000,
    tax_amount: 170,
    discount_amount: 0,
    total_amount: 1170,
    amount_paid: 0,
    amount_due: 1170,
    currency: 'PKR',
    notes: null,
    terms: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create mock customer
 */
export function createMockCustomer(overrides?: Partial<any>) {
  return {
    id: 'cust-123',
    organization_id: 'org-123',
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '+923001234567',
    address: null,
    city: null,
    country: 'PK',
    tax_id: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create mock product
 */
export function createMockProduct(overrides?: Partial<any>) {
  return {
    id: 'prod-123',
    organization_id: 'org-123',
    name: 'Test Product',
    description: 'Test description',
    sku: 'SKU-001',
    category: null,
    unit_price: 100,
    cost_price: 50,
    tax_rate: 17,
    stock_quantity: 100,
    track_inventory: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Mock router navigation
 */
export const mockNavigate = vi.fn();
export const mockUseNavigate = () => mockNavigate;
export const mockUseLocation = () => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
});

/**
 * Mock useAuth hook
 */
export function createMockUseAuth(overrides?: {
  user?: User | null;
  organization?: Organization | null;
  isAuthenticated?: boolean;
  loading?: boolean;
}) {
  return {
    user: overrides?.user ?? createMockUser(),
    organization: overrides?.organization ?? createMockOrganization(),
    isAuthenticated: overrides?.isAuthenticated ?? true,
    loading: overrides?.loading ?? false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
  };
}

/**
 * Helper to test async operations
 */
export async function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Create test query client with no retries
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

