// src/pages/index.ts
/**
 * Centralized page exports
 * Import pages from here for better organization
 */

// Error pages
export { default as ErrorPage } from './ErrorPage';
export { default as NotFoundPage } from './NotFoundPage';
export { default as UnauthorizedPage } from './UnauthorizedPage';

// Auth pages
export * from './auth';

// Dashboard pages
export * from './dashboard';

// Admin pages
export * from './admin';

// Customer pages
export * from './customers';

// Invoice pages
export * from './invoices';

// Product pages
export * from './products';

// Transaction pages
export * from './transactions';

// Report pages
export * from './reports';

// Settings pages
export * from './settings';

// Subscription pages
export * from './subscription';

