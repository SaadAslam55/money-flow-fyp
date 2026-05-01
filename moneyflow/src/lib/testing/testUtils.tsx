// src/lib/testing/testUtils.tsx
/**
 * Testing Utilities
 * Helpers for testing React components and hooks
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

/**
 * Create a test query client
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * All providers wrapper for testing
 */
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export function AllProviders({ children, queryClient }: AllProvidersProps) {
  const client = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * Custom render function with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  const { queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => <AllProviders queryClient={queryClient}>{children}</AllProviders>,
    ...renderOptions,
  });
}

/**
 * Wait for async operations
 */
export const waitFor = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mock API response
 */
export function mockApiResponse<T>(data: T, delay = 0): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

/**
 * Mock API error
 */
export function mockApiError(message: string, delay = 0): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
}

/**
 * Mock fetch response
 */
export function mockFetchResponse<T>(data: T, options?: { status?: number; statusText?: string }) {
  return Promise.resolve({
    ok: options?.status ? options.status >= 200 && options.status < 300 : true,
    status: options?.status || 200,
    statusText: options?.statusText || 'OK',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
  } as Response);
}

/**
 * Create mock user for testing
 */
export function createMockUser(
  overrides?: Partial<{
    id: string;
    email: string;
    role: string;
    organizationId: string;
  }>
) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'admin',
    organizationId: 'test-org-id',
    ...overrides,
  };
}

/**
 * Create mock organization
 */
export function createMockOrganization(
  overrides?: Partial<{
    id: string;
    name: string;
    slug: string;
  }>
) {
  return {
    id: 'test-org-id',
    name: 'Test Organization',
    slug: 'test-org',
    ...overrides,
  };
}

/**
 * Mock localStorage
 */
export class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }

  get length(): number {
    return this.store.size;
  }
}

/**
 * Mock sessionStorage
 */
export class MockSessionStorage extends MockLocalStorage {}

/**
 * Setup mock storage
 */
export function setupMockStorage() {
  const mockLocalStorage = new MockLocalStorage();
  const mockSessionStorage = new MockSessionStorage();

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  });

  return { mockLocalStorage, mockSessionStorage };
}

/**
 * Mock window.matchMedia
 */
export function setupMockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {}, // Deprecated
      removeListener: () => {}, // Deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  });
}

/**
 * Mock IntersectionObserver
 */
export function setupMockIntersectionObserver() {
  class MockIntersectionObserver {
    // observe = jest.fn();
    // disconnect = jest.fn();
    // unobserve = jest.fn();
    observe = () => {};
    disconnect = () => {};
    unobserve = () => {};
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  });
}

/**
 * Mock ResizeObserver
 */
export function setupMockResizeObserver() {
  class MockResizeObserver {
    // observe = jest.fn();
    // disconnect = jest.fn();
    // unobserve = jest.fn();
    observe = () => {};
    disconnect = () => {};
    unobserve = () => {};
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
  });
}

// Re-export from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };
