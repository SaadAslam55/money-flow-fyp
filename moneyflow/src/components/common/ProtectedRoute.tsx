// src/components/common/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, type Permission } from '@/constants/permissions';
import type { UserRole } from '@/types/database.types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requirePermission?: Permission;
}

export function ProtectedRoute({ children, allowedRoles, requirePermission }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/403" replace />;
    }
  }

  // Check permission-based access if permission is specified
  if (requirePermission && !hasPermission(user.role, requirePermission)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
