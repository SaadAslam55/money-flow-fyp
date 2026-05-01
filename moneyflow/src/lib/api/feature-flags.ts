/**
 * Feature Flags Service
 * Controls gradual rollout of new API and TiDB features
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

export interface FeatureFlags {
  // API Backend flags
  useNewApi: boolean; // Use NestJS API instead of Supabase direct
  useTiDB: boolean; // Use TiDB for data queries
  useEdgeApi: boolean; // Use Cloudflare Workers for edge operations

  // Feature flags
  enableAnalytics: boolean; // TiDB-powered analytics
  enableRealtime: boolean; // Keep Supabase realtime
  enableCache: boolean; // Use Redis caching
  enableDualWrite: boolean; // Write to both databases

  // Rollout percentages (0-100)
  newApiRollout: number;
  tidbRollout: number;
}

interface FeatureFlagsState extends FeatureFlags {
  // Actions
  setFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
  setFlags: (flags: Partial<FeatureFlags>) => void;
  isEnabled: (key: keyof FeatureFlags) => boolean;
  shouldUseNewApi: () => boolean;
  shouldUseTiDB: () => boolean;
  reset: () => void;
}

// ============================================
// Default Values
// ============================================

const defaultFlags: FeatureFlags = {
  useNewApi: false,
  useTiDB: false,
  useEdgeApi: false,
  enableAnalytics: false,
  enableRealtime: true,
  enableCache: false,
  enableDualWrite: false,
  newApiRollout: 0,
  tidbRollout: 0,
};

// ============================================
// Utility Functions
// ============================================

/**
 * Hash user ID for consistent bucket assignment
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
}

/**
 * Get current user ID for rollout bucketing
 */
function getCurrentUserId(): string {
  // Try to get from localStorage (set during auth)
  const userId = localStorage.getItem('userId');
  if (userId) return userId;

  // Generate anonymous ID if needed
  let anonId = localStorage.getItem('anonId');
  if (!anonId) {
    anonId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonId', anonId);
  }
  return anonId;
}

// ============================================
// Zustand Store
// ============================================

export const useFeatureFlags = create<FeatureFlagsState>()(
  persist(
    (set, get) => ({
      ...defaultFlags,

      setFlag: (key, value) => {
        set({ [key]: value });
      },

      setFlags: (flags) => {
        set(flags);
      },

      isEnabled: (key) => {
        const state = get();
        const value = state[key];
        return typeof value === 'boolean' ? value : value > 0;
      },

      shouldUseNewApi: () => {
        const state = get();

        // If feature is disabled, don't use new API
        if (!state.useNewApi) return false;

        // If 100% rollout, always use new API
        if (state.newApiRollout >= 100) return true;

        // If 0% rollout, never use new API
        if (state.newApiRollout <= 0) return false;

        // Check if user is in rollout bucket
        const userId = getCurrentUserId();
        const bucket = hashUserId(userId);
        return bucket < state.newApiRollout;
      },

      shouldUseTiDB: () => {
        const state = get();

        if (!state.useTiDB) return false;
        if (state.tidbRollout >= 100) return true;
        if (state.tidbRollout <= 0) return false;

        const userId = getCurrentUserId();
        const bucket = hashUserId(userId);
        return bucket < state.tidbRollout;
      },

      reset: () => set(defaultFlags),
    }),
    {
      name: 'moneyflow-feature-flags',
      partialize: (state) => ({
        // Only persist the flag values, not the methods
        useNewApi: state.useNewApi,
        useTiDB: state.useTiDB,
        useEdgeApi: state.useEdgeApi,
        enableAnalytics: state.enableAnalytics,
        enableRealtime: state.enableRealtime,
        enableCache: state.enableCache,
        enableDualWrite: state.enableDualWrite,
        newApiRollout: state.newApiRollout,
        tidbRollout: state.tidbRollout,
      }),
    }
  )
);

// ============================================
// Remote Flag Sync
// ============================================

/**
 * Sync feature flags from server
 */
export async function syncFeatureFlags(): Promise<void> {
  try {
    const response = await fetch('/api/v1/feature-flags');

    if (response.ok) {
      const flags = await response.json();
      const store = useFeatureFlags.getState();

      // Update each flag
      Object.entries(flags).forEach(([key, value]) => {
        if (key in defaultFlags) {
          store.setFlag(key as keyof FeatureFlags, value as any);
        }
      });

      logger.info('[FeatureFlags] Synced from server');
    }
  } catch (error) {
    logger.warn('[FeatureFlags] Failed to sync:', error);
  }
}

/**
 * Initialize feature flags (call on app start)
 */
export async function initFeatureFlags(): Promise<void> {
  // Load from environment variables first
  const envFlags: Partial<FeatureFlags> = {};

  if (import.meta.env.VITE_USE_NEW_API === 'true') {
    envFlags.useNewApi = true;
  }
  if (import.meta.env.VITE_USE_TIDB === 'true') {
    envFlags.useTiDB = true;
  }
  if (import.meta.env.VITE_USE_EDGE_API === 'true') {
    envFlags.useEdgeApi = true;
  }
  if (import.meta.env.VITE_NEW_API_ROLLOUT) {
    envFlags.newApiRollout = parseInt(import.meta.env.VITE_NEW_API_ROLLOUT, 10);
  }
  if (import.meta.env.VITE_TIDB_ROLLOUT) {
    envFlags.tidbRollout = parseInt(import.meta.env.VITE_TIDB_ROLLOUT, 10);
  }

  // Apply env flags
  if (Object.keys(envFlags).length > 0) {
    useFeatureFlags.getState().setFlags(envFlags);
  }

  // Then try to sync from server (won't override if request fails)
  await syncFeatureFlags();
}

// ============================================
// React Hook Helpers
// ============================================

/**
 * Get feature flag value
 */
export function getFlag<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] {
  return useFeatureFlags.getState()[key];
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(key: keyof FeatureFlags): boolean {
  return useFeatureFlags.getState().isEnabled(key);
}

// Export default instance for direct access
export default useFeatureFlags;
