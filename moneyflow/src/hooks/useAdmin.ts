// src/hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as adminApi from '@/services/api/adminApi';
import { hasPermission } from '@/constants/permissions';

/**
 * Hook for managing organizations (Super Admin only)
 */
export function useAdminOrganizations(
  filters?: Parameters<typeof adminApi.getAllOrganizations>[0],
  page: number = 1
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const canAccess = user && hasPermission(user.role, 'system:view_all_businesses');

  const query = useQuery({
    queryKey: ['admin-organizations', filters, page],
    queryFn: () => adminApi.getAllOrganizations(filters, page),
    enabled: canAccess || false,
    staleTime: 60000, // 1 minute
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.suspendOrganization(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      toast.success('Organization suspended');
    },
    onError: (error: Error) => {
      toast.error(`Failed to suspend: ${error.message}`);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      toast.success('Organization activated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to activate: ${error.message}`);
    },
  });

  return {
    organizations: query.data?.data ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    suspendOrganization: suspendMutation.mutateAsync,
    activateOrganization: activateMutation.mutateAsync,
    isSuspending: suspendMutation.isPending,
    isActivating: activateMutation.isPending,
    canAccess: canAccess || false,
  };
}

/**
 * Hook for managing all users (Super Admin only)
 */
export function useAdminUsers(
  filters?: Parameters<typeof adminApi.getAllUsers>[0],
  page: number = 1
) {
  const { user } = useAuth();

  const canAccess = user && hasPermission(user.role, 'system:view_all_businesses');

  const query = useQuery({
    queryKey: ['admin-users', filters, page],
    queryFn: () => adminApi.getAllUsers(filters, page),
    enabled: canAccess || false,
    staleTime: 60000,
  });

  return {
    users: query.data?.data ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    canAccess: canAccess || false,
  };
}

/**
 * Hook for system metrics (Super Admin only)
 */
export function useSystemMetrics() {
  const { user } = useAuth();

  const canAccess = user && hasPermission(user.role, 'system:view_platform_analytics');

  const query = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => adminApi.getSystemStatistics(),
    enabled: canAccess || false,
    staleTime: 60000,
    refetchInterval: 60000, // Auto-refresh every minute
  });

  return {
    metrics: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    canAccess: canAccess || false,
  };
}

/**
 * Hook for organization details (Super Admin only)
 */
export function useOrganizationDetails(organizationId: string | null) {
  const { user } = useAuth();

  const canAccess = user && hasPermission(user.role, 'system:view_all_businesses');

  const query = useQuery({
    queryKey: ['admin-organization', organizationId],
    queryFn: () => {
      if (!organizationId) throw new Error('Organization ID is required');
      return adminApi.getOrganizationDetails(organizationId);
    },
    enabled: (canAccess && !!organizationId) || false,
    staleTime: 30000,
  });

  const typedData = query.data?.data as { organization?: Record<string, unknown>; statistics?: Record<string, unknown> } | undefined;
  
  return {
    organization: typedData?.organization,
    statistics: typedData?.statistics,
    isLoading: query.isLoading,
    error: query.error,
    canAccess: canAccess || false,
  };
}

