// src/stores/cacheStore.ts
/**
 * Client-Side Cache Store
 *
 * Manages temporary data caching with TTL support, size limits, and automatic cleanup.
 * Production-ready with memory management and error handling.
 *
 * @module Stores/Cache
 */

import { logger } from '@/lib/logger';
import { create } from 'zustand';

// Constants
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const MIN_TTL = 1000; // 1 second
const MAX_TTL = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_MAX_SIZE = 100;
const MIN_MAX_SIZE = 10;
const MAX_MAX_SIZE = 1000;
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheState {
  // State
  cache: Map<string, CacheEntry<unknown>>;
  maxSize: number;

  // Actions
  set: <T>(key: string, data: T, ttl?: number) => void;
  get: <T>(key: string) => T | null;
  remove: (key: string) => void;
  clear: () => void;
  clearExpired: () => void;
  setMaxSize: (size: number) => void;

  // Getters
  has: (key: string) => boolean;
  size: () => number;
  getKeys: () => string[];
}

/**
 * Client-side cache store for temporary data
 *
 * Features:
 * - TTL (Time To Live) support with validation
 * - Automatic expiration cleanup
 * - Size limits to prevent memory issues
 * - Type-safe get/set operations
 * - Memory-efficient
 * - Error handling
 *
 * Note: This store does NOT persist to localStorage/sessionStorage
 * as it's meant for temporary in-memory caching only.
 */
export const useCacheStore = create<CacheState>()((set, get) => ({
  // Initial state
  cache: new Map(),
  maxSize: DEFAULT_MAX_SIZE,

  set: <T>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    if (!key || typeof key !== 'string') {

      logger.error('Invalid cache key provided to set');
      return;
    }

    const numTtl = Number(ttl);
    if (!Number.isInteger(numTtl) || numTtl < MIN_TTL || numTtl > MAX_TTL) {

      logger.error(
        `Invalid TTL: ${ttl}. Must be between ${MIN_TTL}ms and ${MAX_TTL}ms`
      );
      return;
    }

    // Check size limit
    const currentSize = get().cache.size;
    const { maxSize } = get();

    if (currentSize >= maxSize && !get().cache.has(key)) {
      // Remove oldest entry if at capacity
      const firstKey = get().cache.keys().next().value;
      if (firstKey) {
        get().remove(firstKey);
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: numTtl,
    };

    set((state) => {
      const newCache = new Map(state.cache);
      newCache.set(key, entry);
      return { cache: newCache };
    });
  },

  get: <T>(key: string): T | null => {
    if (!key || typeof key !== 'string') {

      logger.error('Invalid cache key provided to get');
      return null;
    }

    const entry = get().cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Remove expired entry
      get().remove(key);
      return null;
    }

    return entry.data;
  },

  remove: (key: string) => {
    if (!key || typeof key !== 'string') {

      logger.error('Invalid cache key provided to remove');
      return;
    }

    set((state) => {
      const newCache = new Map(state.cache);
      newCache.delete(key);
      return { cache: newCache };
    });
  },

  clear: () =>
    set({
      cache: new Map(),
    }),

  clearExpired: () => {
    set((state) => {
      const now = Date.now();
      const newCache = new Map();

      state.cache.forEach((entry, key) => {
        if (now - entry.timestamp <= entry.ttl) {
          newCache.set(key, entry);
        }
      });

      return { cache: newCache };
    });
  },

  setMaxSize: (size: number) => {
    const num = Number(size);
    if (!Number.isInteger(num) || num < MIN_MAX_SIZE || num > MAX_MAX_SIZE) {

      logger.error(
        `Invalid max size: ${size}. Must be between ${MIN_MAX_SIZE} and ${MAX_MAX_SIZE}`
      );
      return;
    }

    set((state) => {
      // Trim cache if new max size is smaller
      if (state.cache.size > num) {
        const entries = Array.from(state.cache.entries());
        const trimmed = entries.slice(0, num);
        return {
          maxSize: num,
          cache: new Map(trimmed),
        };
      }

      return { maxSize: num };
    });
  },

  has: (key: string) => {
    if (!key || typeof key !== 'string') {
      return false;
    }

    const entry = get().cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      get().remove(key);
      return false;
    }

    return true;
  },

  size: () => {
    return get().cache.size;
  },

  getKeys: () => {
    return Array.from(get().cache.keys());
  },
}));

// Auto-cleanup expired entries every minute (only in browser)
if (typeof window !== 'undefined') {
  let cleanupInterval: ReturnType<typeof setInterval> | null = null;

  // Start cleanup interval
  const startCleanup = () => {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(() => {
      useCacheStore.getState().clearExpired();
    }, CLEANUP_INTERVAL);
  };

  // Stop cleanup interval (for testing or cleanup)
  const stopCleanup = () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  };

  // Start cleanup on initialization
  startCleanup();

  // Cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopCleanup);
  }
}
