// src/hooks/useOrganizationRealtime.ts
/**
 * Real-time organization updates hook
 * Listens to organization changes via Supabase Realtime
 */

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface OrganizationChange {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}

export interface UseOrganizationRealtimeOptions {
  onInsert?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  showToasts?: boolean;
  organizationId?: string; // Filter by specific organization
}

/**
 * Hook to subscribe to real-time organization changes
 */
export function useOrganizationRealtime(options: UseOrganizationRealtimeOptions = {}) {
  const { onInsert, onUpdate, onDelete, showToasts = true, organizationId } = options;

  const handleInsert = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      if (showToasts) {
        const orgName = (payload.new as Record<string, any>)?.name as string;
        toast.success(`New organization created: ${orgName}`);
      }
      onInsert?.(payload);
    },
    [onInsert, showToasts]
  );

  const handleUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      if (showToasts) {
        const newData = payload.new as Record<string, any>;
        const oldData = payload.old as Record<string, any>;
        const orgName = newData?.name as string;
        const oldStatus = oldData?.subscription_status as string;
        const newStatus = newData?.subscription_status as string;

        if (oldStatus !== newStatus) {
          toast.info(`Organization ${orgName} status changed to ${newStatus}`);
        }
      }
      onUpdate?.(payload);
    },
    [onUpdate, showToasts]
  );

  const handleDelete = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      if (showToasts) {
        const oldData = payload.old as Record<string, any>;
        const orgName = oldData?.name as string;
        toast.warning(`Organization deleted: ${orgName}`);
      }
      onDelete?.(payload);
    },
    [onDelete, showToasts]
  );

  useEffect(() => {
    // Create the channel
    const channel = supabase.channel('organizations-changes');

    // Build the subscription query
    const subscription = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'organizations',
        ...(organizationId ? { filter: `id=eq.${organizationId}` } : {}),
      },
      (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            handleInsert(payload);
            break;
          case 'UPDATE':
            handleUpdate(payload);
            break;
          case 'DELETE':
            handleDelete(payload);
            break;
        }
      }
    );

    // Subscribe to the channel
    subscription.subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, handleInsert, handleUpdate, handleDelete]);
}

/**
 * Hook to subscribe to real-time updates for a specific organization
 */
export function useOrganizationRealtimeById(
  organizationId: string,
  options: Omit<UseOrganizationRealtimeOptions, 'organizationId'> = {}
) {
  return useOrganizationRealtime({
    ...options,
    organizationId,
  });
}

/**
 * Hook to subscribe to all organization changes (Super Admin only)
 */
export function useAllOrganizationsRealtime(
  options: Omit<UseOrganizationRealtimeOptions, 'organizationId'> = {}
) {
  return useOrganizationRealtime(options);
}
