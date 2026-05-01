// src/router/invoiceRoutes.tsx
/**
 * Invoice Routes Configuration
 * Modular route definitions for invoice-related pages
 * All routes are protected and require authentication with proper role/permission checks
 *
 * Usage:
 * Import and spread into your router configuration:
 *
import { invoiceRoutes } from '@/router/invoiceRoutes';
 * ...invoiceRoutes
 */

import type { RouteObject } from 'react-router-dom';
import { RouteWrapper } from './RouteWrapper';
import type { UserRole } from '@/types/database.types';
import { createLazyPage } from './lazyPage';

// Lazy load invoice pages for code splitting
const InvoicesPage = createLazyPage(() => import('@/pages/invoices/InvoicesPage'));
const CreateInvoicePage = createLazyPage(() => import('@/pages/invoices/CreateInvoicePage'));
const InvoiceDetailPage = createLazyPage(() => import('@/pages/invoices/InvoiceDetailPage'));
const EditInvoicePage = createLazyPage(() => import('@/pages/invoices/EditInvoicePage'));

/**
 * Invoice routes configuration
 * All routes are protected and require authentication
 * Uses proper role-based and permission-based access control
 */
export const invoiceRoutes: RouteObject[] = [
  {
    path: 'invoices',
    children: [
      {
        index: true,
        element: (
          <RouteWrapper
            loadingMessage="Loading invoices..."
            allowedRoles={['super_admin', 'admin', 'manager', 'accountant', 'cashier'] as UserRole[]}
            requirePermission="financial:create_invoices"
          >
            <InvoicesPage />
          </RouteWrapper>
        ),
      },
      {
        path: 'new',
        element: (
          <RouteWrapper
            loadingMessage="Loading create invoice page..."
            allowedRoles={['super_admin', 'admin', 'manager', 'accountant', 'cashier'] as UserRole[]}
            requirePermission="financial:create_invoices"
          >
            <CreateInvoicePage />
          </RouteWrapper>
        ),
      },
      {
        path: ':id',
        element: (
          <RouteWrapper
            loadingMessage="Loading invoice details..."
            allowedRoles={['super_admin', 'admin', 'manager', 'accountant', 'cashier'] as UserRole[]}
            requirePermission="financial:create_invoices"
          >
            <InvoiceDetailPage />
          </RouteWrapper>
        ),
      },
      {
        path: ':id/edit',
        element: (
          <RouteWrapper
            loadingMessage="Loading edit invoice page..."
            allowedRoles={['super_admin', 'admin', 'manager', 'accountant'] as UserRole[]}
            requirePermission="financial:edit_invoices"
          >
            <EditInvoicePage />
          </RouteWrapper>
        ),
      },
    ],
  },
];

/**
 * Invoice route metadata
 * Used for breadcrumbs, navigation, and route information
 * Aligned with ROUTE_PATHS from routes.config.ts
 * Uses pattern-based keys for dynamic routes (e.g., /invoices/:id)
 */
export const invoiceRouteMetadata = {
  '/invoices': {
    title: 'Invoices',
    description: 'Manage your sales invoices',
    breadcrumb: 'Invoices',
    permission: 'financial:create_invoices' as const,
    allowedRoles: ['super_admin', 'admin', 'manager', 'accountant', 'cashier'] as UserRole[],
  },
  '/invoices/new': {
    title: 'Create Invoice',
    description: 'Create a new invoice',
    breadcrumb: 'New Invoice',
    permission: 'financial:create_invoices' as const,
    allowedRoles: ['super_admin', 'admin', 'manager', 'accountant', 'cashier'] as UserRole[],
  },
  '/invoices/:id': {
    title: 'Invoice Details',
    description: 'View invoice details',
    breadcrumb: 'Invoice Details',
    permission: 'financial:create_invoices' as const,
    allowedRoles: ['super_admin', 'admin', 'manager', 'accountant', 'cashier'] as UserRole[],
  },
  '/invoices/:id/edit': {
    title: 'Edit Invoice',
    description: 'Edit invoice details',
    breadcrumb: 'Edit Invoice',
    permission: 'financial:edit_invoices' as const,
    allowedRoles: ['super_admin', 'admin', 'manager', 'accountant'] as UserRole[],
  },
} as const;
