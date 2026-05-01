/**
 * Routes Configuration
 * Centralized route definitions with metadata, permissions, and breadcrumbs
 */

import type { UserRole } from '@/types/database.types';

/**
 * Route metadata for navigation, breadcrumbs, and permissions
 */
export interface RouteMetadata {
  path: string;
  title: string;
  description?: string;
  icon?: string;
  breadcrumb?: string;
  requiresAuth: boolean;
  allowedRoles?: UserRole[];
  requirePermission?: string;
  isPublic?: boolean;
  isAdminOnly?: boolean;
  showInNav?: boolean;
  showInSidebar?: boolean;
  parentRoute?: string;
  category?: string;
}

/**
 * Route categories for organization
 */
export const ROUTE_CATEGORIES = {
  AUTH: 'auth',
  DASHBOARD: 'dashboard',
  INVOICES: 'invoices',
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  TRANSACTIONS: 'transactions',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  ADMIN: 'admin',
} as const;

/**
 * Route paths - Single source of truth
 */
export const ROUTE_PATHS = {
  // Root
  ROOT: '/',
  HOME: '/dashboard',

  // Auth
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // Dashboard
  DASHBOARD: '/dashboard',

  // Invoices
  INVOICES: {
    BASE: '/invoices',
    LIST: '/invoices',
    CREATE: '/invoices/new',
    DETAIL: (id: string) => `/invoices/${id}`,
    EDIT: (id: string) => `/invoices/${id}/edit`,
  },

  // Customers
  CUSTOMERS: {
    BASE: '/customers',
    LIST: '/customers',
    CREATE: '/customers/new',
    DETAIL: (id: string) => `/customers/${id}`,
    EDIT: (id: string) => `/customers/${id}/edit`,
  },

  // Products
  PRODUCTS: {
    BASE: '/products',
    LIST: '/products',
    CREATE: '/products/new',
    DETAIL: (id: string) => `/products/${id}`,
    EDIT: (id: string) => `/products/${id}/edit`,
  },

  // Transactions
  TRANSACTIONS: {
    BASE: '/transactions',
    LIST: '/transactions',
    CREATE: '/transactions/new',
    DETAIL: (id: string) => `/transactions/${id}`,
  },

  // Reports
  REPORTS: {
    BASE: '/reports',
    LIST: '/reports',
    PROFIT_LOSS: '/reports/profit-loss',
    BALANCE_SHEET: '/reports/balance-sheet',
    CASH_FLOW: '/reports/cash-flow',
    SALES: '/reports/sales',
    EXPENSES: '/reports/expenses',
  },

  // Settings
  SETTINGS: {
    BASE: '/settings',
    PROFILE: '/settings/profile',
    BUSINESS: '/settings/business',
    TEAM: '/settings/team',
    BILLING: '/settings/billing',
    INTEGRATIONS: '/settings/integrations',
    SECURITY: '/settings/security',
  },

  // Admin
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin',
    ORGANIZATIONS: '/admin/organizations',
    ORGANIZATION_DETAIL: (id: string) => `/admin/organizations/${id}`,
    USERS: '/admin/users',
    SYSTEM: '/admin/system',
  },

  // Subscription
  SUBSCRIPTION: {
    BASE: '/subscription',
    MANAGE: '/subscription/manage',
    CHECKOUT: '/subscription/checkout',
    SUCCESS: '/subscription/success',
  },

  // Error Pages
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/403',
  ERROR: '/500',
} as const;

/**
 * Route metadata configuration
 */
export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  // Root
  [ROUTE_PATHS.ROOT]: {
    path: ROUTE_PATHS.ROOT,
    title: 'Home',
    requiresAuth: false,
    isPublic: true,
    showInNav: false,
  },

  // Auth Routes
  [ROUTE_PATHS.AUTH.LOGIN]: {
    path: ROUTE_PATHS.AUTH.LOGIN,
    title: 'Login',
    description: 'Sign in to your account',
    requiresAuth: false,
    isPublic: true,
    showInNav: false,
    category: ROUTE_CATEGORIES.AUTH,
  },

  [ROUTE_PATHS.AUTH.SIGNUP]: {
    path: ROUTE_PATHS.AUTH.SIGNUP,
    title: 'Sign Up',
    description: 'Create a new account',
    requiresAuth: false,
    isPublic: true,
    showInNav: false,
    category: ROUTE_CATEGORIES.AUTH,
  },

  [ROUTE_PATHS.AUTH.FORGOT_PASSWORD]: {
    path: ROUTE_PATHS.AUTH.FORGOT_PASSWORD,
    title: 'Forgot Password',
    description: 'Reset your password',
    requiresAuth: false,
    isPublic: true,
    showInNav: false,
    category: ROUTE_CATEGORIES.AUTH,
  },

  [ROUTE_PATHS.AUTH.RESET_PASSWORD]: {
    path: ROUTE_PATHS.AUTH.RESET_PASSWORD,
    title: 'Reset Password',
    requiresAuth: false,
    isPublic: true,
    showInNav: false,
    category: ROUTE_CATEGORIES.AUTH,
  },

  [ROUTE_PATHS.AUTH.VERIFY_EMAIL]: {
    path: ROUTE_PATHS.AUTH.VERIFY_EMAIL,
    title: 'Verify Email',
    requiresAuth: false,
    isPublic: true,
    showInNav: false,
    category: ROUTE_CATEGORIES.AUTH,
  },

  // Dashboard
  [ROUTE_PATHS.DASHBOARD]: {
    path: ROUTE_PATHS.DASHBOARD,
    title: 'Dashboard',
    description: 'Overview of your business',
    icon: 'LayoutDashboard',
    breadcrumb: 'Dashboard',
    requiresAuth: true,
    showInNav: true,
    showInSidebar: true,
    category: ROUTE_CATEGORIES.DASHBOARD,
  },

  // Invoices
  [ROUTE_PATHS.INVOICES.LIST]: {
    path: ROUTE_PATHS.INVOICES.LIST,
    title: 'Invoices',
    description: 'Manage your invoices',
    icon: 'FileText',
    breadcrumb: 'Invoices',
    requiresAuth: true,
    allowedRoles: ['admin', 'manager', 'accountant', 'cashier'],
    showInNav: true,
    showInSidebar: true,
    category: ROUTE_CATEGORIES.INVOICES,
  },

  [ROUTE_PATHS.INVOICES.CREATE]: {
    path: ROUTE_PATHS.INVOICES.CREATE,
    title: 'Create Invoice',
    breadcrumb: 'Create Invoice',
    requiresAuth: true,
    allowedRoles: ['admin', 'manager', 'accountant', 'cashier'],
    parentRoute: ROUTE_PATHS.INVOICES.LIST,
    category: ROUTE_CATEGORIES.INVOICES,
  },

  // Customers
  [ROUTE_PATHS.CUSTOMERS.LIST]: {
    path: ROUTE_PATHS.CUSTOMERS.LIST,
    title: 'Customers',
    description: 'Manage your customers',
    icon: 'Users',
    breadcrumb: 'Customers',
    requiresAuth: true,
    showInNav: true,
    showInSidebar: true,
    category: ROUTE_CATEGORIES.CUSTOMERS,
  },

  [ROUTE_PATHS.CUSTOMERS.CREATE]: {
    path: ROUTE_PATHS.CUSTOMERS.CREATE,
    title: 'Add Customer',
    breadcrumb: 'Add Customer',
    requiresAuth: true,
    parentRoute: ROUTE_PATHS.CUSTOMERS.LIST,
    category: ROUTE_CATEGORIES.CUSTOMERS,
  },

  // Products
  [ROUTE_PATHS.PRODUCTS.LIST]: {
    path: ROUTE_PATHS.PRODUCTS.LIST,
    title: 'Products',
    description: 'Manage your products and inventory',
    icon: 'Package',
    breadcrumb: 'Products',
    requiresAuth: true,
    showInNav: true,
    showInSidebar: true,
    category: ROUTE_CATEGORIES.PRODUCTS,
  },

  [ROUTE_PATHS.PRODUCTS.CREATE]: {
    path: ROUTE_PATHS.PRODUCTS.CREATE,
    title: 'Add Product',
    breadcrumb: 'Add Product',
    requiresAuth: true,
    parentRoute: ROUTE_PATHS.PRODUCTS.LIST,
    category: ROUTE_CATEGORIES.PRODUCTS,
  },

  // Transactions
  [ROUTE_PATHS.TRANSACTIONS.LIST]: {
    path: ROUTE_PATHS.TRANSACTIONS.LIST,
    title: 'Transactions',
    description: 'View all transactions',
    icon: 'ArrowLeftRight',
    breadcrumb: 'Transactions',
    requiresAuth: true,
    showInNav: true,
    showInSidebar: true,
    category: ROUTE_CATEGORIES.TRANSACTIONS,
  },

  // Reports
  [ROUTE_PATHS.REPORTS.LIST]: {
    path: ROUTE_PATHS.REPORTS.LIST,
    title: 'Reports',
    description: 'Business reports and analytics',
    icon: 'BarChart3',
    breadcrumb: 'Reports',
    requiresAuth: true,
    allowedRoles: ['admin', 'manager', 'accountant'],
    showInNav: true,
    showInSidebar: true,
    category: ROUTE_CATEGORIES.REPORTS,
  },

  // Settings
  [ROUTE_PATHS.SETTINGS.BASE]: {
    path: ROUTE_PATHS.SETTINGS.BASE,
    title: 'Settings',
    description: 'Manage your account and preferences',
    icon: 'Settings',
    breadcrumb: 'Settings',
    requiresAuth: true,
    showInNav: true,
    showInSidebar: true,
    category: ROUTE_CATEGORIES.SETTINGS,
  },

  // Admin
  [ROUTE_PATHS.ADMIN.DASHBOARD]: {
    path: ROUTE_PATHS.ADMIN.DASHBOARD,
    title: 'Admin Dashboard',
    description: 'System administration',
    icon: 'Shield',
    breadcrumb: 'Admin',
    requiresAuth: true,
    allowedRoles: ['super_admin'],
    isAdminOnly: true,
    showInNav: false,
    showInSidebar: true,
    category: ROUTE_CATEGORIES.ADMIN,
  },
};

/**
 * Get route metadata by path
 * @param path - Route path to look up
 * @returns Route metadata if found, undefined otherwise
 */
export function getRouteMetadata(path: string): RouteMetadata | undefined {
  // Try exact match first
  if (ROUTE_METADATA[path]) {
    return ROUTE_METADATA[path];
  }

  // Try pattern matching for dynamic routes (e.g., /invoices/:id)
  for (const [routePath, metadata] of Object.entries(ROUTE_METADATA)) {
    // Check if this is a dynamic route pattern
    if (routePath.includes(':')) {
      // Convert route pattern to regex (e.g., /invoices/:id -> /invoices/[^/]+)
      const pattern = routePath.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(path)) {
        return metadata;
      }
    } else if (path.startsWith(routePath)) {
      // For static routes, check if path starts with route path
      return metadata;
    }
  }

  return undefined;
}

/**
 * Get breadcrumb trail for a route
 */
export function getBreadcrumbs(path: string): Array<{ label: string; path: string }> {
  const breadcrumbs: Array<{ label: string; path: string }> = [];
  const metadata = getRouteMetadata(path);

  if (!metadata) {
    return breadcrumbs;
  }

  // Add parent routes
  if (metadata.parentRoute) {
    const parentMetadata = getRouteMetadata(metadata.parentRoute);
    if (parentMetadata) {
      breadcrumbs.push({
        label: parentMetadata.breadcrumb || parentMetadata.title,
        path: parentMetadata.path,
      });
    }
  }

  // Add current route
  if (metadata.breadcrumb) {
    breadcrumbs.push({
      label: metadata.breadcrumb,
      path: metadata.path,
    });
  }

  return breadcrumbs;
}

/**
 * Check if route requires authentication
 */
export function isRouteProtected(path: string): boolean {
  const metadata = getRouteMetadata(path);
  return metadata?.requiresAuth ?? true;
}

/**
 * Check if route is public
 */
export function isRoutePublic(path: string): boolean {
  const metadata = getRouteMetadata(path);
  return metadata?.isPublic ?? false;
}

/**
 * Get allowed roles for a route
 */
export function getAllowedRoles(path: string): UserRole[] | undefined {
  const metadata = getRouteMetadata(path);
  return metadata?.allowedRoles;
}

/**
 * Get routes for navigation
 */
export function getNavRoutes(): RouteMetadata[] {
  return Object.values(ROUTE_METADATA).filter(
    (route) => route.showInNav && route.requiresAuth && !route.isPublic
  );
}

/**
 * Get routes for sidebar
 */
export function getSidebarRoutes(): RouteMetadata[] {
  return Object.values(ROUTE_METADATA).filter(
    (route) => route.showInSidebar && route.requiresAuth && !route.isPublic
  );
}

/**
 * Get routes by category
 */
export function getRoutesByCategory(category: string): RouteMetadata[] {
  return Object.values(ROUTE_METADATA).filter((route) => route.category === category);
}

/**
 * Check if user can access route based on role
 */
export function canAccessRoute(path: string, userRole?: UserRole): boolean {
  const metadata = getRouteMetadata(path);

  if (!metadata) {
    return false;
  }

  // Public routes are accessible
  if (metadata.isPublic) {
    return true;
  }

  // Protected routes require auth
  if (metadata.requiresAuth && !userRole) {
    return false;
  }

  // Check role restrictions
  if (metadata.allowedRoles && userRole) {
    return metadata.allowedRoles.includes(userRole);
  }

  // Admin-only routes
  if (metadata.isAdminOnly && userRole !== 'super_admin') {
    return false;
  }

  return true;
}

