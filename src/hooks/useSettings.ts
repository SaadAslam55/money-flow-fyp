// src/hooks/useSettings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useAuthStore } from '@/stores/authStore';
import * as settingsApi from '@/services/api/settingsApi';
import { handleError } from '@/lib/errorHandler';
import type {
  InvoiceSettings,
  TaxSettings,
  IntegrationSettings,
  APIKey,
  Webhook,
  NotificationPreferences,
} from '@/services/api/settingsApi';

/**
 * Hook for invoice settings
 */
export function useInvoiceSettings() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['invoice-settings', organization?.id],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return settingsApi.getInvoiceSettings(organization.id);
    },
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (settings: Partial<Omit<InvoiceSettings, 'organization_id' | 'created_at' | 'updated_at'>>) =>
      {
        if (!organization?.id) throw new Error('Organization ID is required');
        return settingsApi.updateInvoiceSettings(organization.id, settings);
      },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-settings'] });
      toast.success('Invoice settings updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useInvoiceSettings.updateInvoiceSettings');
      toast.error(`Failed to update invoice settings: ${error.message}`);
    },
  });

  return {
    settings: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook for tax settings
 */
export function useTaxSettings() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tax-settings', organization?.id],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return settingsApi.getTaxSettings(organization.id);
    },
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (settings: Partial<Omit<TaxSettings, 'organization_id' | 'created_at' | 'updated_at'>>) =>
      {
        if (!organization?.id) throw new Error('Organization ID is required');
        return settingsApi.updateTaxSettings(organization.id, settings);
      },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
      toast.success('Tax settings updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useTaxSettings.updateTaxSettings');
      toast.error(`Failed to update tax settings: ${error.message}`);
    },
  });

  return {
    settings: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook for integration settings
 */
export function useIntegrationSettings() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['integration-settings', organization?.id],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return settingsApi.getIntegrationSettings(organization.id);
    },
    enabled: !!organization?.id,
    staleTime: 300000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (settings: Partial<Omit<IntegrationSettings, 'organization_id' | 'created_at' | 'updated_at'>>) =>
      {
        if (!organization?.id) throw new Error('Organization ID is required');
        return settingsApi.updateIntegrationSettings(organization.id, settings);
      },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
      toast.success('Integration settings updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useIntegrationSettings.updateIntegrationSettings');
      toast.error(`Failed to update integration settings: ${error.message}`);
    },
  });

  return {
    settings: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook for API keys
 */
export function useAPIKeys() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['api-keys', organization?.id],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return settingsApi.getAPIKeys(organization.id);
    },
    enabled: !!organization?.id,
    staleTime: 60000, // 1 minute
  });

  const generateMutation = useMutation({
    mutationFn: ({ name, permissions }: { name: string; permissions: string[] }) =>
      {
        if (!organization?.id) throw new Error('Organization ID is required');
        if (!useAuthStore.getState().user?.id) throw new Error('User ID is required');
        return settingsApi.generateAPIKey(organization.id, useAuthStore.getState().user!.id, name, permissions);
      },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key generated successfully');
      return result.data;
    },
    onError: (error: Error) => {
      handleError(error, 'useAPIKeys.generateAPIKey');
      toast.error(`Failed to generate API key: ${error.message}`);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (apiKeyId: string) => settingsApi.revokeAPIKey(apiKeyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key revoked successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useAPIKeys.revokeAPIKey');
      toast.error(`Failed to revoke API key: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (apiKeyId: string) => settingsApi.deleteAPIKey(apiKeyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key deleted successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useAPIKeys.deleteAPIKey');
      toast.error(`Failed to delete API key: ${error.message}`);
    },
  });

  return {
    apiKeys: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    generateAPIKey: generateMutation.mutateAsync,
    revokeAPIKey: revokeMutation.mutateAsync,
    deleteAPIKey: deleteMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    isRevoking: revokeMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for webhooks
 */
export function useWebhooks() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['webhooks', organization?.id],
    queryFn: () => {
      if (!organization?.id) throw new Error('Organization ID is required');
      return settingsApi.getWebhooks(organization.id);
    },
    enabled: !!organization?.id,
    staleTime: 60000, // 1 minute
  });

  const createMutation = useMutation({
    mutationFn: (webhook: { name: string; url: string; events: string[]; secret: string }) =>
      {
        if (!organization?.id) throw new Error('Organization ID is required');
        return settingsApi.createWebhook(organization.id, webhook);
      },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook created successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useWebhooks.createWebhook');
      toast.error(`Failed to create webhook: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ webhookId, updates }: { webhookId: string; updates: Partial<Omit<Webhook, 'id' | 'organization_id' | 'created_at' | 'updated_at'>> }) =>
      settingsApi.updateWebhook(webhookId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useWebhooks.updateWebhook');
      toast.error(`Failed to update webhook: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (webhookId: string) => settingsApi.deleteWebhook(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook deleted successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useWebhooks.deleteWebhook');
      toast.error(`Failed to delete webhook: ${error.message}`);
    },
  });

  return {
    webhooks: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createWebhook: createMutation.mutateAsync,
    updateWebhook: updateMutation.mutateAsync,
    deleteWebhook: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for notification preferences
 */
export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User ID is required');
      return settingsApi.getNotificationPreferences(user.id);
    },
    enabled: !!user?.id,
    staleTime: 300000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (preferences: Partial<Omit<NotificationPreferences, 'user_id' | 'created_at' | 'updated_at'>>) =>
      {
        if (!user?.id) throw new Error('User ID is required');
        return settingsApi.updateNotificationPreferences(user.id, preferences);
      },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Notification preferences updated successfully');
    },
    onError: (error: Error) => {
      handleError(error, 'useNotificationPreferences.updateNotificationPreferences');
      toast.error(`Failed to update notification preferences: ${error.message}`);
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

