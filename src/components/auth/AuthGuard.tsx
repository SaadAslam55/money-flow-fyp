// src/components/auth/AuthGuard.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import type { UserRole } from '@/types/database.types';
import type { Permission } from '@/constants/permissions';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requirePermission?: Permission;
  fallback?: ReactNode;
}

/**
 * AuthGuard component - Wrapper around ProtectedRoute
 * Provides a simpler API for protecting routes with authentication
 * 
 * @example
 * <AuthGuard allowedRoles={['admin', 'manager']}>
 *   <SettingsPage />
 * </AuthGuard>
 */
export function AuthGuard({ 
  children, 
  allowedRoles, 
  requirePermission,
  fallback 
}: AuthGuardProps) {
  const { loading, isAuthenticated } = useAuth();

  // Show custom fallback or default loading
  if (loading) {
    return (
      fallback || (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )
    );
  }

  // If not authenticated, ProtectedRoute will handle redirect
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <ProtectedRoute 
      allowedRoles={allowedRoles} 
      requirePermission={requirePermission}
    >
      {children}
    </ProtectedRoute>
  );
}

