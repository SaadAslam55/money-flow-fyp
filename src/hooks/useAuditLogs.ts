// src/hooks/useAuditLogs.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import * as adminApi from '@/services/api/adminApi';
import { hasPermission } from '@/constants/permissions';

/**
 * Hook for fetching audit logs (Super Admin and Admin)
 */
export function useAuditLogs(
  filters?: Parameters<typeof adminApi.getAuditLogs>[0],
  page: number = 1
) {
  const { user } = useAuth();

  const canAccess =
    user &&
    (hasPermission(user.role, 'business:view_audit_logs') ||
      hasPermission(user.role, 'system:view_all_businesses'));

  const query = useQuery({
    queryKey: ['admin-audit-logs', filters, page],
    queryFn: () => adminApi.getAuditLogs(filters, page),
    enabled: canAccess || false,
    staleTime: 30000,
  });

  return {
    logs: query.data?.data ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    canAccess: canAccess || false,
  };
}

