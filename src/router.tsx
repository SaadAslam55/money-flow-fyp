// src/router.tsx
/**
 * Application Router Configuration
 *
 * Production-ready router setup with:
 * - Lazy loading for code splitting
 * - Error boundaries for route-level errors
 * - Protected routes with role/permission checks
 * - Suspense for loading states
 * - Route metadata integration
 * - Comprehensive error handling
 *
 * @module Router
 */

import { lazy } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { RouteWrapper } from './router/RouteWrapper';
import { invoiceRoutes } from './router/invoiceRoutes';
import { ROUTE_PATHS } from './config/routes.config';
import ErrorPage from './pages/ErrorPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import type { UserRole } from './types/database.types';
import { logger } from '@/lib/logger';
import { AppLayoutWrapper } from '@/components/layout/AppLayoutWrapper';
import { createLazyPage } from './router/lazyPage';

// Landing Page
import LandingPage from './pages/LandingPage';

// Development-only pages
const TestConnectionPage = lazy(() => import('./pages/TestConnectionPage'));

// ============================================================================
// Auth Pages (eagerly loaded - needed immediately)
// ============================================================================
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';

// ============================================================================
// Main Pages (lazy loaded for code splitting)
// ============================================================================

// Dashboard
const DashboardPage = createLazyPage(() => import('./pages/dashboard/DashboardPage'));

// Customers
const CustomersPage = createLazyPage(() => import('./pages/customers/CustomersPage'));
const CreateCustomerPage = createLazyPage(() => import('./pages/customers/CreateCustomerPage'));
const EditCustomerPage = createLazyPage(() => import('./pages/customers/EditCustomerPage'));
const CustomerDetailPage = createLazyPage(() => import('./pages/customers/CustomerDetailPage'));

// Products
const ProductsPage = createLazyPage(() => import('./pages/products/ProductsPage'));
const CreateProductPage = createLazyPage(() => import('./pages/products/CreateProductPage'));
const EditProductPage = createLazyPage(() => import('./pages/products/EditProductPage'));
const ProductDetailPage = createLazyPage(() => import('./pages/products/ProductDetailPage'));

// Transactions
const TransactionsPage = createLazyPage(() => import('./pages/transactions/TransactionsPage'));

// Reports
const ReportsPage = createLazyPage(() => import('./pages/reports/ReportsPage'));
const ProfitLossPage = createLazyPage(() => import('./pages/reports/ProfitLossPage'));
const BalanceSheetPage = createLazyPage(() => import('./pages/reports/BalanceSheetPage'));
const CashFlowPage = createLazyPage(() => import('./pages/reports/CashFlowPage'));
const SalesReportPage = createLazyPage(() => import('./pages/reports/SalesReportPage'));
const ExpenseReportPage = createLazyPage(() => import('./pages/reports/ExpenseReportPage'));
const TaxReportPage = createLazyPage(() => import('./pages/reports/TaxReportPage'));
const CustomerReportPage = createLazyPage(() => import('./pages/reports/CustomerReportPage'));
const ProductReportPage = createLazyPage(() => import('./pages/reports/ProductReportPage'));
const CustomReportPage = createLazyPage(() => import('./pages/reports/CustomReportPage'));

// Settings
const SettingsPage = createLazyPage(() => import('./pages/settings/SettingsPage'));

// Subscription
const SubscriptionPage = createLazyPage(() => import('./pages/subscription/SubscriptionPage'));
const ManageSubscriptionPage = createLazyPage(
  () => import('./pages/subscription/ManageSubscriptionPage')
);
const CheckoutPage = createLazyPage(() => import('./pages/subscription/CheckoutPage'));
const SuccessPage = createLazyPage(() => import('./pages/subscription/SuccessPage'));

// Admin
const AdminPage = createLazyPage(() => import('./pages/admin/AdminPage'));

// ============================================================================
// Route Configuration
// ============================================================================

/**
 * Application routes configuration
 * Uses ROUTE_PATHS from routes.config.ts for consistency
 */
export const router = createBrowserRouter([
  // Root route - Landing Page
  {
    path: ROUTE_PATHS.ROOT,
    element: (
      <RouteWrapper requiresAuth={false} loadingMessage="Loading...">
        <LandingPage />
      </RouteWrapper>
    ),
  },

  // ============================================================================
  // Auth Routes (Public)
  // ============================================================================
  {
    path: ROUTE_PATHS.AUTH.BASE,
    children: [
      {
        path: 'login',
        element: (
          <RouteWrapper requiresAuth={false} loadingMessage="Loading login page...">
            <LoginPage />
          </RouteWrapper>
        ),
      },
      {
        path: 'signup',
        element: (
          <RouteWrapper requiresAuth={false} loadingMessage="Loading signup page...">
            <SignupPage />
          </RouteWrapper>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <RouteWrapper requiresAuth={false} loadingMessage="Loading forgot password page...">
            <ForgotPasswordPage />
          </RouteWrapper>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <RouteWrapper requiresAuth={false} loadingMessage="Loading reset password page...">
            <ResetPasswordPage />
          </RouteWrapper>
        ),
      },
      {
        path: 'verify-email',
        element: (
          <RouteWrapper requiresAuth={false} loadingMessage="Loading verify email page...">
            <VerifyEmailPage />
          </RouteWrapper>
        ),
      },
      {
        path: 'callback',
        element: (
          <RouteWrapper requiresAuth={false} loadingMessage="Verifying authentication...">
            <AuthCallbackPage />
          </RouteWrapper>
        ),
      },
    ],
  },

  // ============================================================================
  // Protected App Routes (With Layout)
  // ============================================================================
  {
    element: (
      <RouteWrapper requiresAuth={true}>
        <AppLayoutWrapper />
      </RouteWrapper>
    ),
    children: [
      // Dashboard
      {
        path: ROUTE_PATHS.DASHBOARD,
        element: (
          <RouteWrapper loadingMessage="Loading dashboard...">
            <DashboardPage />
          </RouteWrapper>
        ),
      },

      // Invoice Routes (already include paths like 'invoices')
      ...invoiceRoutes,

      // Customer Routes
      {
        path: ROUTE_PATHS.CUSTOMERS.BASE,
        children: [
          {
            index: true,
            element: (
              <RouteWrapper
                loadingMessage="Loading customers..."
                requirePermission="customers:view_all"
              >
                <CustomersPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'new',
            element: (
              <RouteWrapper
                loadingMessage="Loading create customer page..."
                requirePermission="customers:add"
              >
                <CreateCustomerPage />
              </RouteWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <RouteWrapper
                loadingMessage="Loading customer details..."
                requirePermission="customers:view_all"
              >
                <CustomerDetailPage />
              </RouteWrapper>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <RouteWrapper
                loadingMessage="Loading edit customer page..."
                requirePermission="customers:edit"
                allowedRoles={['super_admin', 'admin', 'manager'] as UserRole[]}
              >
                <EditCustomerPage />
              </RouteWrapper>
            ),
          },
        ],
      },

      // Product Routes
      {
        path: ROUTE_PATHS.PRODUCTS.BASE,
        children: [
          {
            index: true,
            element: (
              <RouteWrapper
                loadingMessage="Loading products..."
                requirePermission="inventory:view_products"
              >
                <ProductsPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'new',
            element: (
              <RouteWrapper
                loadingMessage="Loading create product page..."
                requirePermission="inventory:add_products"
              >
                <CreateProductPage />
              </RouteWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <RouteWrapper
                loadingMessage="Loading product details..."
                requirePermission="inventory:view_products"
              >
                <ProductDetailPage />
              </RouteWrapper>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <RouteWrapper
                loadingMessage="Loading edit product page..."
                requirePermission="inventory:edit_products"
                allowedRoles={['super_admin', 'admin', 'manager'] as UserRole[]}
              >
                <EditProductPage />
              </RouteWrapper>
            ),
          },
        ],
      },

      // Transaction Routes
      {
        path: ROUTE_PATHS.TRANSACTIONS.BASE,
        element: (
          <RouteWrapper
            loadingMessage="Loading transactions..."
            requirePermission="financial:create_transactions"
          >
            <TransactionsPage />
          </RouteWrapper>
        ),
      },

      // Report Routes
      {
        path: ROUTE_PATHS.REPORTS.BASE,
        children: [
          {
            index: true,
            element: (
              <RouteWrapper loadingMessage="Loading reports..." requirePermission="reports:view_basic">
                <ReportsPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'profit-loss',
            element: (
              <RouteWrapper loadingMessage="Loading Profit & Loss..." requirePermission="reports:view_basic">
                <ProfitLossPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'balance-sheet',
            element: (
              <RouteWrapper loadingMessage="Loading Balance Sheet..." requirePermission="reports:view_basic">
                <BalanceSheetPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'cash-flow',
            element: (
              <RouteWrapper loadingMessage="Loading Cash Flow..." requirePermission="reports:view_basic">
                <CashFlowPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'sales',
            element: (
              <RouteWrapper loadingMessage="Loading Sales Report..." requirePermission="reports:view_basic">
                <SalesReportPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'expenses',
            element: (
              <RouteWrapper loadingMessage="Loading Expense Report..." requirePermission="reports:view_basic">
                <ExpenseReportPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'tax',
            element: (
              <RouteWrapper loadingMessage="Loading Tax Report..." requirePermission="reports:view_basic">
                <TaxReportPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'customer',
            element: (
              <RouteWrapper loadingMessage="Loading Customer Report..." requirePermission="reports:view_basic">
                <CustomerReportPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'product',
            element: (
              <RouteWrapper loadingMessage="Loading Product Report..." requirePermission="reports:view_basic">
                <ProductReportPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'custom',
            element: (
              <RouteWrapper loadingMessage="Loading Custom Report..." requirePermission="reports:view_basic">
                <CustomReportPage />
              </RouteWrapper>
            ),
          },
        ],
      },

      // Settings Routes
      {
        path: ROUTE_PATHS.SETTINGS.BASE,
        element: (
          <RouteWrapper loadingMessage="Loading settings..." requirePermission="business:settings">
            <SettingsPage />
          </RouteWrapper>
        ),
      },

      // Subscription Routes
      {
        path: ROUTE_PATHS.SUBSCRIPTION.BASE,
        children: [
          {
            index: true,
            element: (
              <RouteWrapper
                loadingMessage="Loading subscription..."
                requirePermission="business:settings"
              >
                <SubscriptionPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'manage',
            element: (
              <RouteWrapper
                loadingMessage="Loading subscription management..."
                requirePermission="business:settings"
              >
                <ManageSubscriptionPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'checkout',
            element: (
              <RouteWrapper
                loadingMessage="Loading checkout..."
                requirePermission="business:settings"
              >
                <CheckoutPage />
              </RouteWrapper>
            ),
          },
        ],
      },

      // Admin Routes
      {
        path: ROUTE_PATHS.ADMIN.BASE,
        children: [
          {
            index: true,
            element: (
              <RouteWrapper
                loadingMessage="Loading admin dashboard..."
                allowedRoles={['super_admin'] as UserRole[]}
              >
                <AdminPage />
              </RouteWrapper>
            ),
          },
          {
            path: 'organizations/:id',
            element: (
              <RouteWrapper
                loadingMessage="Loading organization details..."
                allowedRoles={['super_admin'] as UserRole[]}
              >
                <AdminPage />
              </RouteWrapper>
            ),
          },
        ],
      },
    ],
  },

  // ============================================================================
  // Public Subscription Success
  // ============================================================================
  {
    path: ROUTE_PATHS.SUBSCRIPTION.SUCCESS,
    element: (
      <RouteWrapper requiresAuth={false} loadingMessage="Loading success page...">
        <SuccessPage />
      </RouteWrapper>
    ),
  },

  // ============================================================================
  // Development Routes (Development Only)
  // ============================================================================
  ...((import.meta as { env?: { DEV?: boolean } }).env?.DEV
    ? [
        {
          path: '/test-connection',
          element: (
            <RouteWrapper requiresAuth={false} loadingMessage="Loading connection test...">
              <TestConnectionPage />
            </RouteWrapper>
          ),
        },
      ]
    : []),

  // ============================================================================
  // Error Routes
  // ============================================================================
  {
    path: ROUTE_PATHS.UNAUTHORIZED,
    element: (
      <RouteWrapper requiresAuth={false} loadingMessage="Loading...">
        <UnauthorizedPage />
      </RouteWrapper>
    ),
    errorElement: (
      <RouteWrapper requiresAuth={false} loadingMessage="Loading...">
        <ErrorPage />
      </RouteWrapper>
    ),
  },
  {
    path: ROUTE_PATHS.ERROR,
    element: (
      <RouteWrapper requiresAuth={false} loadingMessage="Loading...">
        <ErrorPage />
      </RouteWrapper>
    ),
    errorElement: (
      <RouteWrapper requiresAuth={false} loadingMessage="Loading...">
        <ErrorPage />
      </RouteWrapper>
    ),
  },

  // ============================================================================
  // 404 Route (catch-all)
  // ============================================================================
  {
    path: '*',
    element: (
      <RouteWrapper requiresAuth={false} loadingMessage="Loading...">
        <NotFoundPage />
      </RouteWrapper>
    ),
    errorElement: (
      <RouteWrapper requiresAuth={false} loadingMessage="Loading...">
        <ErrorPage />
      </RouteWrapper>
    ),
  },
] satisfies RouteObject[]);
