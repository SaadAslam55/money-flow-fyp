/**
 * MSW Server Setup
 *
 * Mock Service Worker server configuration for tests.
 * Provides a centralized server instance for API mocking.
 *
 * @module Tests/Mocks/Server
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW Server instance
 * Use this in your tests to control the mock server
 */
export const server = setupServer(...handlers);

/**
 * Setup server before all tests
 */
export function setupMockServer() {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
}

