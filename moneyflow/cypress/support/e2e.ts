/// <reference path="../globals.d.ts" />
/// <reference path="./index.d.ts" />

/**
 * Cypress Support File for E2E Testing
 *
 * This file is loaded before the test files.
 * It initializes support files and registers global behaviors.
 */

// Import commands.js using ES2015 syntax:
import './commands';

// Import the support index:
import './index';

// Alternatively you can use CommonJS syntax:
// require('./commands')
// require('./index')

// Hide fetch/XHR requests in command log
const app = window.top;

if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');

  app.document.head.appendChild(style);
}

// Global error handling
Cypress.on('uncaught:exception', (err: any) => {
  // Ignore specific errors that don't affect test execution
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes('Network request failed') ||
    err.message.includes('Cannot read property')
  ) {
    return false;
  }
  return true;
});

// Before each test
beforeEach(() => {
  // Clear localStorage
  cy.window().then((win: any) => {
    win.localStorage.clear();
  });

  // Clear cookies
  cy.clearCookies();
});

// After each test
afterEach(() => {
  // Optionally clear data after each test
  // cy.task('clearDatabase');
});
