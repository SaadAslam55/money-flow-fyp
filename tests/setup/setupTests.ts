/**
 * Test Setup Configuration
 *
 * This file runs before all tests and sets up the testing environment.
 * It configures mocks, global test utilities, and test environment.
 *
 * @module Tests/Setup
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, afterAll, beforeAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

/**
 * MSW Server for API mocking
 * Used in integration tests to mock API responses
 */
export const server = setupServer(...handlers);

/**
 * Setup MSW server before all tests
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

/**
 * Cleanup after each test
 * - Clean up React Testing Library
 * - Reset MSW handlers
 * - Clear all mocks
 */
afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
});

/**
 * Cleanup MSW server after all tests
 */
afterAll(() => {
  server.close();
});

/**
 * Mock window.matchMedia
 * Required for components that use media queries
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Mock IntersectionObserver
 * Required for components that use intersection observer
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

/**
 * Mock ResizeObserver
 * Required for components that use resize observer
 */
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

/**
 * Suppress console errors in tests (optional)
 * Uncomment if you want to suppress expected console errors
 */
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args: unknown[]) => {
//     if (
//       typeof args[0] === 'string' &&
//       (args[0].includes('Warning: ReactDOM.render') ||
//         args[0].includes('Warning: validateDOMNesting'))
//     ) {
//       return;
//     }
//     originalError.call(console, ...args);
//   };
// });
//
// afterAll(() => {
//   console.error = originalError;
// });

/**
 * Mock environment variables for tests
 */
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.VITE_APP_URL = 'http://localhost:5173';

/**
 * Increase timeout for async operations
 */
vi.setConfig({
  testTimeout: 10000,
});

