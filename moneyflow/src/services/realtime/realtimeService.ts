// src/services/realtime/realtimeService.ts
/**
 * Real-time Collaboration Service - Phase 7: Advanced Features
 * WebSocket-based real-time updates and collaboration
 */

import { supabase } from '@/services/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Presence state for user activity
 */
export interface PresenceState {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  currentPage?: string;
  lastSeen: string;
  isOnline: boolean;
}

/**
 * Real-time event types
 */
export type RealtimeEventType =
  | 'invoice_created'
  | 'invoice_updated'
  | 'invoice_paid'
  | 'customer_created'
  | 'product_updated'
  | 'low_stock_alert'
  | 'payment_received'
  | 'user_joined'
  | 'user_left';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: Record<string, unknown>;
  userId: string;
  timestamp: string;
}

/**
 * Callback types
 */
type PresenceCallback = (state: Record<string, PresenceState[]>) => void;
type EventCallback = (event: RealtimeEvent) => void;
type ChangeCallback<T extends Record<string, unknown>> = (
  payload: RealtimePostgresChangesPayload<T>
) => void;

/**
 * Real-time service class
 */
class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceCallbacks: PresenceCallback[] = [];
  private eventCallbacks: EventCallback[] = [];

  /**
   * Subscribe to organization-wide events
   */
  subscribeToOrganization(
    organizationId: string,
    userId: string,
    userInfo: Omit<PresenceState, 'lastSeen' | 'isOnline'>
  ): RealtimeChannel {
    const channelName = `org:${organizationId}`;

    const existingChannel = this.channels.get(channelName);
    if (existingChannel) {
      return existingChannel;
    }

    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: userId },
      },
    });

    // Track presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresenceState>();
      this.presenceCallbacks.forEach((cb) => cb(state));
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      this.notifyEvent({
        type: 'user_joined',
        payload: { userId: key, presences: newPresences },
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      this.notifyEvent({
        type: 'user_left',
        payload: { userId: key, presences: leftPresences },
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Listen for broadcast events
    channel.on('broadcast', { event: 'activity' }, ({ payload }) => {
      this.notifyEvent(payload as RealtimeEvent);
    });

    // Subscribe and track presence
    channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        void channel.track({
          ...userInfo,
          lastSeen: new Date().toISOString(),
          isOnline: true,
        });
      }
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to table changes
   */
  subscribeToTable<T extends Record<string, unknown>>(
    table: string,
    organizationId: string,
    callback: ChangeCallback<T>
  ): RealtimeChannel {
    const channelName = `table:${table}:${organizationId}`;

    const existingTableChannel = this.channels.get(channelName);
    if (existingTableChannel) {
      return existingTableChannel;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `organization_id=eq.${organizationId}`,
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Broadcast an event to all users in organization
   */
  async broadcastEvent(
    organizationId: string,
    event: Omit<RealtimeEvent, 'timestamp'>
  ): Promise<void> {
    const channelName = `org:${organizationId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'activity',
        payload: {
          ...event,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Update user presence
   */
  async updatePresence(organizationId: string, updates: Partial<PresenceState>): Promise<void> {
    const channelName = `org:${organizationId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      await channel.track({
        ...updates,
        lastSeen: new Date().toISOString(),
        isOnline: true,
      });
    }
  }

  /**
   * Register presence callback
   */
  onPresenceChange(callback: PresenceCallback): () => void {
    this.presenceCallbacks.push(callback);
    return () => {
      this.presenceCallbacks = this.presenceCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Register event callback
   */
  onEvent(callback: EventCallback): () => void {
    this.eventCallbacks.push(callback);
    return () => {
      this.eventCallbacks = this.eventCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all event callbacks
   */
  private notifyEvent(event: RealtimeEvent): void {
    this.eventCallbacks.forEach((cb) => cb(event));
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      void supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      void supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  /**
   * Get online users count
   */
  getOnlineUsers(organizationId: string): PresenceState[] {
    const channelName = `org:${organizationId}`;
    const channel = this.channels.get(channelName);

    if (!channel) return [];

    const state = channel.presenceState<PresenceState>();
    return Object.values(state).flat();
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

export default realtimeService;
