/**
 * Test Utilities and Mocks Export
 *
 * Centralized exports for test utilities, mocks, and helpers
 *
 * @module Tests
 *
 * @example
 * ```typescript
 * import { renderWithProviders, createMockUser, mockUsers } from '@/tests';
 *
 * const user = createMockUser();
 * const { getByText } = renderWithProviders(<Component />, { user });
 * ```
 */

// Test utilities
export * from './setup/testUtils';
export * from './setup/setupTests';

// Mock data
export * from './mocks/mockData';
export { server, setupMockServer } from './mocks/server';
export { handlers } from './mocks/handlers';

