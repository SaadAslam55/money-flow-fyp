// src/hooks/useSupabaseRealtime.ts
import { logger } from '@/lib/logger';
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { handleError } from '@/lib/errorHandler';

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';
export type RealtimeChannel = 'invoices' | 'customers' | 'products' | 'transactions' | 'users';

export interface RealtimeCallback<T = any> {
  (payload: {
    eventType: RealtimeEventType;
    new: T | null;
    old: T | null;
    table: string;
  }): void;
}

/**
 * Hook for subscribing to Supabase realtime changes
 * Automatically handles authentication and cleanup
 */
export function useSupabaseRealtime<T = any>(
  channel: RealtimeChannel,
  table: string,
  callback: RealtimeCallback<T>,
  filters?: {
    organizationId?: string;
    userId?: string;
  }
) {
  const { organization, user } = useAuth();
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!organization?.id) {
      return;
    }

    // Create channel
    const channelName = `${channel}-${organization.id}`;
    const channelInstance = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filters?.organizationId
            ? `organization_id=eq.${filters.organizationId}`
            : undefined,
        },
        (payload) => {
          const eventType = payload.eventType as RealtimeEventType;
          callbackRef.current({
            eventType,
            new: payload.new as T | null,
            old: payload.old as T | null,
            table,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info(`Realtime subscription active for ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          handleError(new Error(`Realtime channel error: ${channelName}`), 'useSupabaseRealtime');
        }
      });

    subscriptionRef.current = channelInstance;

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [channel, table, organization?.id, filters?.organizationId, filters?.userId]);

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  }, []);

  return {
    unsubscribe,
    isSubscribed: subscriptionRef.current !== null,
  };
}

/**
 * Hook for subscribing to invoice realtime updates
 */
export function useInvoiceRealtime(callback: RealtimeCallback) {
  const { organization } = useAuth();
  return useSupabaseRealtime('invoices', 'invoices', callback, {
    organizationId: organization?.id,
  });
}

/**
 * Hook for subscribing to customer realtime updates
 */
export function useCustomerRealtime(callback: RealtimeCallback) {
  const { organization } = useAuth();
  return useSupabaseRealtime('customers', 'customers', callback, {
    organizationId: organization?.id,
  });
}

/**
 * Hook for subscribing to product realtime updates
 */
export function useProductRealtime(callback: RealtimeCallback) {
  const { organization } = useAuth();
  return useSupabaseRealtime('products', 'products', callback, {
    organizationId: organization?.id,
  });
}

/**
 * Hook for subscribing to transaction realtime updates
 */
export function useTransactionRealtime(callback: RealtimeCallback) {
  const { organization } = useAuth();
  return useSupabaseRealtime('transactions', 'transactions', callback, {
    organizationId: organization?.id,
  });
}

/**
 * Hook for subscribing to user realtime updates (team members)
 */
export function useUserRealtime(callback: RealtimeCallback) {
  const { organization } = useAuth();
  return useSupabaseRealtime('users', 'users', callback, {
    organizationId: organization?.id,
  });
}


