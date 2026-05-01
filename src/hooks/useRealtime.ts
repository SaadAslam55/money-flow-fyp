// src/hooks/useRealtime.ts
/**
 * Real-time Hooks - Phase 7: Advanced Features
 * React hooks for real-time collaboration features
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { realtimeService, type PresenceState, type RealtimeEvent } from '@/services/realtime';

/**
 * Hook for organization-wide real-time presence
 */
export function usePresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.organization_id) return;

    // Subscribe to organization channel
    const _channel = realtimeService.subscribeToOrganization(user.organization_id, user.id, {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url ?? undefined,
    });

    setIsConnected(true);

    // Listen for presence changes
    const unsubscribe = realtimeService.onPresenceChange((state) => {
      const users = Object.values(state).flat();
      setOnlineUsers(users);
    });

    return () => {
      unsubscribe();
      realtimeService.unsubscribe(`org:${user.organization_id}`);
      setIsConnected(false);
    };
  }, [user?.organization_id, user?.id, user?.email, user?.full_name, user?.avatar_url]);

  const updateCurrentPage = useCallback(
    (page: string) => {
      if (user?.organization_id) {
        void realtimeService.updatePresence(user.organization_id, { currentPage: page });
      }
    },
    [user?.organization_id]
  );

  return {
    onlineUsers,
    isConnected,
    updateCurrentPage,
    onlineCount: onlineUsers.length,
  };
}

/**
 * Hook for real-time events
 */
export function useRealtimeEvents(onEvent?: (event: RealtimeEvent) => void) {
  const { user } = useAuth();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  useEffect(() => {
    const unsubscribe = realtimeService.onEvent((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep last 50 events
      onEvent?.(event);
    });

    return unsubscribe;
  }, [onEvent]);

  const broadcastEvent = useCallback(
    async (type: RealtimeEvent['type'], payload: Record<string, unknown>) => {
      if (user?.organization_id) {
        await realtimeService.broadcastEvent(user.organization_id, {
          type,
          payload,
          userId: user.id,
        });
      }
    },
    [user?.organization_id, user?.id]
  );

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    broadcastEvent,
    clearEvents,
  };
}

/**
 * Hook for table-specific real-time updates
 */
export function useTableSubscription<T extends Record<string, unknown>>(
  table: string,
  onInsert?: (record: T) => void,
  onUpdate?: (record: T) => void,
  onDelete?: (record: T) => void
) {
  const { user } = useAuth();
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  onInsertRef.current = onInsert;
  onUpdateRef.current = onUpdate;
  onDeleteRef.current = onDelete;

  useEffect(() => {
    if (!user?.organization_id) return;

    const _channel = realtimeService.subscribeToTable<T>(table, user.organization_id, (payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          onInsertRef.current?.(payload.new);
          break;
        case 'UPDATE':
          onUpdateRef.current?.(payload.new);
          break;
        case 'DELETE':
          onDeleteRef.current?.(payload.old as T);
          break;
      }
    });

    return () => {
      realtimeService.unsubscribe(`table:${table}:${user.organization_id}`);
    };
  }, [user?.organization_id, table]);
}

/**
 * Hook for invoice real-time updates
 */
export function useInvoiceRealtime(
  onInvoiceCreated?: (invoice: Record<string, unknown>) => void,
  onInvoicePaid?: (invoice: Record<string, unknown>) => void
) {
  useTableSubscription('invoices', onInvoiceCreated, (invoice) => {
    if (invoice.status === 'paid') {
      onInvoicePaid?.(invoice);
    }
  });
}

/**
 * Hook for notification real-time
 */
export function useNotificationRealtime(
  onNotification: (notification: Record<string, unknown>) => void
) {
  useTableSubscription('notifications', onNotification);
}

export type { PresenceState, RealtimeEvent };

// Re-export from useSupabaseRealtime for consolidated access
// Prefer using useSupabaseRealtime for direct Supabase realtime subscriptions
export {
  useSupabaseRealtime,
  useInvoiceRealtime as useInvoiceRealtimeDirect,
  useCustomerRealtime as useCustomerRealtimeDirect,
  useProductRealtime,
  useTransactionRealtime as useTransactionRealtimeDirect,
  useUserRealtime,
} from './useSupabaseRealtime';
