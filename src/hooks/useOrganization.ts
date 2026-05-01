// src/hooks/useOrganization.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as organizationApi from '@/services/api/organizationApi';
import { handleError } from '@/lib/errorHandler';
import type { Organization } from '@/types';
import { useUsers } from './useUser';

/**
 * Hook for managing current organization
 */
export function useOrganization() {
  const { organization, updateOrganization: updateAuthOrganization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['organization', organization?.id],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return organizationApi.getOrganization(organization.id);
    },
    enabled: !!organization?.id,
    staleTime: 60000, // 1 minute
  });

  const updateMutation = useMutation({
    mutationFn: ({ updates, logoFile }: { updates: Partial<Organization>; logoFile?: File }) => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return organizationApi.updateOrganization(organization.id, updates, logoFile);
    },
    onSuccess: (response) => {
      // Update auth store with new organization data for immediate UI sync
      if (response.data) {
        updateAuthOrganization(response.data);
      }
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Organization updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useOrganization.updateOrganization');
      toast.error(`Failed to update organization: ${error.message}`);
    },
  });

  return {
    organization: query.data?.data || organization,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateOrganization: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook for organization statistics
 */
export function useOrganizationStats() {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['organization-stats', organization?.id],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return organizationApi.getOrganizationStats(organization.id);
    },
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes
  });

  return {
    stats: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for team members in organization
 * Uses useUsers hook for team member management
 */
export function useTeamMembers() {
  // Delegate to useUsers hook for team member management
  // This provides a consistent interface for team member operations
  const usersHook = useUsers();
  
  return {
    teamMembers: usersHook.users,
    count: usersHook.count,
    isLoading: usersHook.isLoading,
    error: usersHook.error,
    refetch: usersHook.refetch,
    inviteTeamMember: usersHook.createUser,
    removeTeamMember: usersHook.deleteUser,
    updateTeamMemberRole: usersHook.updateUser,
    isInviting: usersHook.isCreating,
    isRemoving: usersHook.isDeleting,
    isUpdatingRole: usersHook.isUpdating,
  };
}

