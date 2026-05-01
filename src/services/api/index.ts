// src/services/api/index.ts
/**
 * Centralized API Service Exports
 * Import all API services from here for better organization
 *
 * Usage:
 * import { getCustomers, createCustomer } from '@/services/api';
 */

// Base API utilities
export * from './baseApi';

// Core API services
export * from './authApi';
export * from './organizationApi';
export * from './userApi';
export * from './customerApi';
export * from './productApi';
export * from './invoiceApi';
export * from './transactionApi';
export * from './reportApi';
export * from './dashboardApi';
export * from './bankAccountApi';
export * from './expenseCategoryApi';
export * from './settingsApi';
export * from './subscriptionApi';
export * from './paymentApi';

// Admin API - explicitly export to avoid conflicts with organizationApi
export {
  getAllOrganizations,
  getAllUsers,
  getSystemStatistics,
  getOrganizationDetails as getAdminOrganizationDetails,
  suspendOrganization as adminSuspendOrganization,
  activateOrganization,
  getAuditLogs,
} from './adminApi';

// Invoice-related services
export * from './invoicePaymentLinks';
export * from './invoiceReminders';
