/**
 * Feature Flags Configuration
 *
 * Controls gradual rollout of new features during TiDB migration.
 * Flags can be controlled via environment variables or remote config.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

export interface FeatureFlags {
  // Infrastructure flags
  useNewApi: boolean; // Route requests through NestJS API
  useTiDB: boolean; // Use TiDB for data queries
  useRedisCache: boolean; // Enable Redis caching layer
  useCloudflareWorkers: boolean; // Use Cloudflare Workers edge functions

  // Migration flags
  enableDualWrite: boolean; // Write to both Supabase and TiDB
  enableDataValidation: boolean; // Validate data between systems

  // Feature flags
  enableAdvancedAnalytics: boolean; // TiDB-powered analytics
  enableRealtime: boolean; // Supabase realtime features
  enableEdgeCache: boolean; // Edge caching via Cloudflare

  // Rollout percentages (0-100)
  newApiRolloutPercent: number;
  tidbRolloutPercent: number;
}

export interface FeatureFlagsState extends FeatureFlags {
  // Actions
  setFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
  setFlags: (flags: Partial<FeatureFlags>) => void;
  isEnabled: (key: keyof FeatureFlags) => boolean;
  shouldUseNewApi: () => boolean;
  shouldUseTiDB: () => boolean;
  reset: () => void;
  syncFromRemote: () => Promise<void>;
}

// ============================================
// Default Values
// ============================================

const defaultFlags: FeatureFlags = {
  // All features disabled by default for safe rollout
  useNewApi: false,
  useTiDB: false,
  useRedisCache: false,
  useCloudflareWorkers: false,
  enableDualWrite: false,
  enableDataValidation: true, // Keep validation on
  enableAdvancedAnalytics: false,
  enableRealtime: true, // Keep Supabase realtime
  enableEdgeCache: false,
  newApiRolloutPercent: 0,
  tidbRolloutPercent: 0,
};

// ============================================
// Environment Overrides
// ============================================

function getEnvFlags(): Partial<FeatureFlags> {
  const env = import.meta.env;

  return {
    useNewApi: env.VITE_FEATURE_USE_NEW_API === 'true',
    useTiDB: env.VITE_FEATURE_USE_TIDB === 'true',
    useRedisCache: env.VITE_FEATURE_USE_REDIS_CACHE === 'true',
    useCloudflareWorkers: env.VITE_FEATURE_USE_CLOUDFLARE_WORKERS === 'true',
    enableDualWrite: env.VITE_FEATURE_DUAL_WRITE === 'true',
    newApiRolloutPercent: parseInt(env.VITE_NEW_API_ROLLOUT_PERCENT || '0', 10),
    tidbRolloutPercent: parseInt(env.VITE_TIDB_ROLLOUT_PERCENT || '0', 10),
  };
}

// ============================================
// User Bucketing (for gradual rollout)
// ============================================

/**
 * Simple hash function to bucket users consistently
 * Same user always gets same bucket (0-99)
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
}

function getUserBucket(): number {
  // Try to get consistent user identifier
  const userId =
    localStorage.getItem('userId') || sessionStorage.getItem('sessionId') || 'anonymous';

  return hashString(userId);
}

// ============================================
// Feature Flags Store
// ============================================

export const useFeatureFlags = create<FeatureFlagsState>()(
  persist(
    (set, get) => ({
      // Initial state with env overrides
      ...defaultFlags,
      ...getEnvFlags(),

      // Set single flag
      setFlag: (key, value) => {
        set({ [key]: value });
        logger.info(`[FeatureFlags] Set ${key} = ${value}`);
      },

      // Set multiple flags
      setFlags: (flags) => {
        set(flags);
        logger.info('[FeatureFlags] Updated flags:', flags);
      },

      // Check if flag is enabled
      isEnabled: (key) => {
        const state = get();
        const value = state[key];
        return typeof value === 'boolean' ? value : value > 0;
      },

      // Check if user should use new API (with rollout percentage)
      shouldUseNewApi: () => {
        const state = get();

        // Check master toggle first
        if (!state.useNewApi) {
          return false;
        }

        // If rollout is 100%, always use new API
        if (state.newApiRolloutPercent >= 100) {
          return true;
        }

        // If rollout is 0%, never use new API
        if (state.newApiRolloutPercent <= 0) {
          return false;
        }

        // Check user bucket against rollout percentage
        const bucket = getUserBucket();
        return bucket < state.newApiRolloutPercent;
      },

      // Check if user should use TiDB (with rollout percentage)
      shouldUseTiDB: () => {
        const state = get();

        // New API must be enabled for TiDB to work
        if (!state.shouldUseNewApi()) {
          return false;
        }

        // Check TiDB toggle
        if (!state.useTiDB) {
          return false;
        }

        // If rollout is 100%, always use TiDB
        if (state.tidbRolloutPercent >= 100) {
          return true;
        }

        // If rollout is 0%, never use TiDB
        if (state.tidbRolloutPercent <= 0) {
          return false;
        }

        // Check user bucket
        const bucket = getUserBucket();
        return bucket < state.tidbRolloutPercent;
      },

      // Reset to defaults
      reset: () => {
        set({ ...defaultFlags, ...getEnvFlags() });
        logger.info('[FeatureFlags] Reset to defaults');
      },

      // Sync flags from remote config
      syncFromRemote: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          if (!apiUrl) return;

          const response = await fetch(`${apiUrl}/config/feature-flags`, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const remoteFlags = await response.json();
            set((state) => ({
              ...state,
              ...remoteFlags,
            }));
            logger.info('[FeatureFlags] Synced from remote:', remoteFlags);
          }
        } catch (error) {
          logger.warn('[FeatureFlags] Failed to sync from remote:', error);
        }
      },
    }),
    {
      name: 'moneyflow-feature-flags',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        useNewApi: state.useNewApi,
        useTiDB: state.useTiDB,
        useRedisCache: state.useRedisCache,
        newApiRolloutPercent: state.newApiRolloutPercent,
        tidbRolloutPercent: state.tidbRolloutPercent,
      }),
    }
  )
);

// ============================================
// Utility Functions
// ============================================

/**
 * Get current feature flags as object
 */
export function getFeatureFlags(): FeatureFlags {
  return useFeatureFlags.getState();
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(key: keyof FeatureFlags): boolean {
  return useFeatureFlags.getState().isEnabled(key);
}

/**
 * Check if new API should be used for current user
 */
export function shouldUseNewApi(): boolean {
  return useFeatureFlags.getState().shouldUseNewApi();
}

/**
 * Check if TiDB should be used for current user
 */
export function shouldUseTiDB(): boolean {
  return useFeatureFlags.getState().shouldUseTiDB();
}

/**
 * Initialize feature flags (call on app start)
 */
export async function initFeatureFlags(): Promise<void> {
  // Apply environment overrides
  const envFlags = getEnvFlags();
  useFeatureFlags.getState().setFlags(envFlags);

  // Try to sync from remote config
  await useFeatureFlags.getState().syncFromRemote();

  logger.info('[FeatureFlags] Initialized:', getFeatureFlags());
}

// ============================================
// React Hook for Components
// ============================================

/**
 * Hook to check if a feature is enabled
 */
export function useFeature(key: keyof FeatureFlags): boolean {
  return useFeatureFlags((state) => state.isEnabled(key));
}

/**
 * Hook to get whether new API should be used
 */
export function useNewApi(): boolean {
  return useFeatureFlags((state) => state.shouldUseNewApi());
}
