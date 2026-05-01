// src/services/supabase/realtime.ts
/**
 * Supabase Realtime Service
 * Handles real-time subscriptions for database changes.
 * Provides type-safe real-time event handling with proper cleanup.
 *
 * Features:
 * - Subscribe to table changes (INSERT, UPDATE, DELETE)
 * - Organization-specific subscriptions
 * - Automatic channel cleanup
 * - Type-safe event payloads
 *
 * @example
 * ```typescript
 *
import { subscribeToTable, subscribeToOrganizationChanges, unsubscribe } from '@/services/supabase/realtime';
 *
 * // Subscribe to all changes
 * const channel = subscribeToTable('invoices', '*', (payload) => {
 *   logger.info('Invoice changed:', payload instanceof Error ? payload.message : String(payload));
 * });
 *
 * // Subscribe to organization-specific changes
 * const orgChannel = subscribeToOrganizationChanges('invoices', 'org-id', (payload) => {
 *   logger.info('Organization invoice changed:', payload instanceof Error ? payload.message : String(payload));
 * });
 *
 * // Unsubscribe when done
 * await unsubscribe(channel);
 * ```
 */

import { logger } from '@/lib/logger';
import { supabase } from './client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Subscribe to table changes
 *
 * Subscribes to all changes (INSERT, UPDATE, DELETE) on a table.
 *
 * @param table - Table name to subscribe to
 * @param filter - Filter string (e.g., 'organization_id=eq.org-123') or '*' for all
 * @param callback - Callback function to handle changes
 * @returns Realtime channel that can be used to unsubscribe
 */
export function subscribeToTable<T extends { [key: string]: any }>(
  table: string,
  filter: string = '*',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
): RealtimeChannel {
  // Validate inputs
  if (!table || typeof table !== 'string' || table.trim().length === 0) {
    throw new Error('Table name is required');
  }

  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  // Sanitize table name
  const sanitizedTable = table.trim().replace(/[^a-zA-Z0-9_]/g, '');
  if (sanitizedTable !== table.trim()) {
    throw new Error('Invalid table name');
  }

  const channelName = `${sanitizedTable}_changes_${Date.now()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: sanitizedTable,
        filter: filter ?? '*',
      },
      (payload) => {
        try {
          callback(payload as RealtimePostgresChangesPayload<T>);
        } catch (error) {
          if (import.meta.env.DEV) {

            logger.error('Error in realtime callback:', error instanceof Error ? error.message : String(error));
          }
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to INSERT events
 *
 * Subscribes only to INSERT events on a table.
 *
 * @param table - Table name to subscribe to
 * @param filter - Filter string (e.g., 'organization_id=eq.org-123') or '*' for all
 * @param callback - Callback function to handle INSERT events
 * @returns Realtime channel that can be used to unsubscribe
 */
export function subscribeToInserts<T extends { [key: string]: any }>(
  table: string,
  filter: string = '*',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
): RealtimeChannel {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  return subscribeToTable<T>(table, filter, (payload) => {
    if (payload.eventType === 'INSERT') {
      callback(payload);
    }
  });
}

/**
 * Subscribe to UPDATE events
 *
 * Subscribes only to UPDATE events on a table.
 *
 * @param table - Table name to subscribe to
 * @param filter - Filter string (e.g., 'organization_id=eq.org-123') or '*' for all
 * @param callback - Callback function to handle UPDATE events
 * @returns Realtime channel that can be used to unsubscribe
 */
export function subscribeToUpdates<T extends { [key: string]: any }>(
  table: string,
  filter: string = '*',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
): RealtimeChannel {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  return subscribeToTable<T>(table, filter, (payload) => {
    if (payload.eventType === 'UPDATE') {
      callback(payload);
    }
  });
}

/**
 * Subscribe to DELETE events
 *
 * Subscribes only to DELETE events on a table.
 *
 * @param table - Table name to subscribe to
 * @param filter - Filter string (e.g., 'organization_id=eq.org-123') or '*' for all
 * @param callback - Callback function to handle DELETE events
 * @returns Realtime channel that can be used to unsubscribe
 */
export function subscribeToDeletes<T extends { [key: string]: any }>(
  table: string,
  filter: string = '*',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
): RealtimeChannel {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  return subscribeToTable<T>(table, filter, (payload) => {
    if (payload.eventType === 'DELETE') {
      callback(payload);
    }
  });
}

/**
 * Subscribe to organization-specific changes
 *
 * Subscribes to all changes on a table filtered by organization ID.
 * This is useful for multi-tenant applications where you only want
 * to receive changes for a specific organization.
 *
 * @param table - Table name to subscribe to
 * @param organizationId - Organization ID to filter by
 * @param callback - Callback function to handle changes
 * @returns Realtime channel that can be used to unsubscribe
 */
export function subscribeToOrganizationChanges<T extends { [key: string]: any }>(
  table: string,
  organizationId: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
): RealtimeChannel {
  // Validate organization ID
  if (!organizationId || typeof organizationId !== 'string' || organizationId.trim().length === 0) {
    throw new Error('Organization ID is required');
  }

  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  // Sanitize organization ID (prevent injection)
  const sanitizedOrgId = organizationId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (sanitizedOrgId !== organizationId.trim()) {
    throw new Error('Invalid organization ID format');
  }

  return subscribeToTable<T>(table, `organization_id=eq.${sanitizedOrgId}`, callback);
}

/**
 * Unsubscribe from channel
 *
 * Removes a specific realtime channel subscription.
 * Always call this when you're done with a subscription to prevent memory leaks.
 *
 * @param channel - Realtime channel to unsubscribe from
 * @returns Unsubscribe result ('ok', 'timed out', or 'error')
 *
 * @example
 * ```typescript
 * const channel = subscribeToTable('invoices', '*', handleChange);
 * // ... use subscription ...
 * await unsubscribe(channel);
 * ```
 */
export function unsubscribe(channel: RealtimeChannel): Promise<'ok' | 'timed out' | 'error'> {
  if (!channel) {
    if (import.meta.env.DEV) {

      logger.warn('Attempted to unsubscribe from null/undefined channel', '');
    }
    return Promise.resolve('error' as const);
  }

  try {
    return supabase.removeChannel(channel);
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error unsubscribing from channel:', error instanceof Error ? error.message : String(error));
    }
    return Promise.resolve('error' as const);
  }
}

/**
 * Unsubscribe from all channels
 *
 * Removes all active realtime channel subscriptions.
 * Useful for cleanup when navigating away from a page or component unmount.
 *
 * @returns Promise that resolves when all channels are removed
 *
 * @example
 * ```typescript
 * // Cleanup on component unmount
 * useEffect(() => {
 *   return () => {
 *     unsubscribeAll();
 *   };
 * }, []);
 * ```
 */
export async function unsubscribeAll(): Promise<void> {
  try {
    await supabase.removeAllChannels();
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error unsubscribing from all channels:', error instanceof Error ? error.message : String(error));
    }
  }
}
