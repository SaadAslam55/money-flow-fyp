// src/router/RouteWrapper.tsx
/**
 * Route Wrapper Component
 *
 * Reusable wrapper for routes that provides:
 * - Error boundary
 * - Authentication provider
 * - Protected route (optional)
 * - Suspense for lazy-loaded components
 * - Loading states
 *
 * @module Router/RouteWrapper
 */

import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Loader } from '@/components/common/Loader';
import type { UserRole } from '@/types/database.types';
import type { Permission } from '@/constants/permissions';

interface RouteWrapperProps {
  children: ReactNode;
  requiresAuth?: boolean;
  allowedRoles?: UserRole[];
  requirePermission?: Permission;
  loadingMessage?: string;
}

/**
 * Route wrapper component
 *
 * @param children - Route component to render
 * @param requiresAuth - Whether route requires authentication (default: true)
 * @param allowedRoles - Allowed user roles for this route
 * @param requirePermission - Required permission for this route
 * @param loadingMessage - Custom loading message
 */
export function RouteWrapper({
  children,
  requiresAuth = true,
  allowedRoles,
  requirePermission,
  loadingMessage = 'Loading page...',
}: RouteWrapperProps) {
  const content = (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader message={loadingMessage} fullScreen />
        </div>
      }
    >
      {children}
    </Suspense>
  );

  const wrappedContent = requiresAuth ? (
    <AuthProvider>
      <ProtectedRoute allowedRoles={allowedRoles} requirePermission={requirePermission}>
        {content}
      </ProtectedRoute>
    </AuthProvider>
  ) : (
    content
  );

  return <ErrorBoundary>{wrappedContent}</ErrorBoundary>;
}
