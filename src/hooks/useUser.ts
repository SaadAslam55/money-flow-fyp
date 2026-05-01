// src/hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import * as userApi from '@/services/api/userApi';
import { handleError } from '@/lib/errorHandler';
import type { User } from '@/types';

/**
 * Hook for managing current user profile
 */
export function useUser() {
  const { user, organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User ID is required');
      return userApi.getUser(user.id);
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<User>) => {
      if (!user?.id) throw new Error('User ID is required');
      return userApi.updateUser(user.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useUser.updateUser');
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  return {
    user: query.data?.data || user,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook for managing users in an organization (admin/manager only)
 */
export function useUsers(
  filters?: {
    search?: string;
    role?: string[];
    isActive?: boolean;
    sortBy?: 'name' | 'role' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  },
  page: number = 1
) {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['users', organization?.id, filters, page],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return userApi.getUsers(organization.id, filters, page);
    },
    enabled: !!organization?.id,
    staleTime: 30000, // 30 seconds
  });

  const createMutation = useMutation({
    mutationFn: (userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_login'>) =>
      {
        if (!organization?.id) throw new Error('Organization ID is required');
        return userApi.createUser(userData, organization.id);
      },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useUsers.createUser');
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      userApi.updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useUsers.updateUser');
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useUsers.deleteUser');
      toast.error(`Failed to deactivate user: ${error.message}`);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => userApi.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User activated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useUsers.activateUser');
      toast.error(`Failed to activate user: ${error.message}`);
    },
  });

  return {
    users: query.data?.data ?? [],
    count: query.data?.count ?? 0,
    page: query.data?.page || page,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    activateUser: activateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isActivating: activateMutation.isPending,
  };
}

/**
 * Hook for fetching a single user by ID
 */
export function useUserById(userId: string | null) {
  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return userApi.getUser(userId);
    },
    enabled: !!userId,
    staleTime: 60000,
  });

  return {
    user: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for managing user preferences
 */
export function useUserPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User ID is required');
      return userApi.getUserPreferences(user.id);
    },
    enabled: !!user?.id,
    staleTime: 300000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (preferences: Partial<userApi.UserPreferences>) => {
      if (!user?.id) throw new Error('User ID is required');
      return userApi.updateUserPreferences(user.id, preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Preferences saved successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useUserPreferences.updatePreferences');
      toast.error(`Failed to save preferences: ${error.message}`);
    },
  });

  return {
    preferences: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updatePreferences: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
