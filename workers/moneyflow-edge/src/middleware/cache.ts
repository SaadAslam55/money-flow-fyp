/**
 * Caching Middleware
 * Edge caching with stale-while-revalidate support
 */

import { Context, Next } from 'hono';
import type { Env } from '../index';

// ============================================
// Types
// ============================================

interface CacheConfig {
  ttl: number; // TTL in seconds
  staleWhileRevalidate?: number; // Additional time to serve stale
  tags?: string[]; // Cache tags for invalidation
}

interface CachedResponse {
  data: unknown;
  timestamp: number;
  ttl: number;
  headers?: Record<string, string>;
}

// ============================================
// Configuration
// ============================================

// Routes that can be cached
const cacheableRoutes: Record<string, CacheConfig> = {
  // Reference data - cache longer
  '/api/products': { ttl: 300, staleWhileRevalidate: 60 },
  '/api/customers': { ttl: 180, staleWhileRevalidate: 30 },
  '/api/categories': { ttl: 600, staleWhileRevalidate: 120 },

  // Dashboard/reports - shorter cache
  '/api/reports/dashboard': { ttl: 60, staleWhileRevalidate: 30 },
  '/api/reports/summary': { ttl: 120, staleWhileRevalidate: 60 },
  '/api/analytics': { ttl: 60, staleWhileRevalidate: 30 },

  // Settings - long cache
  '/api/settings': { ttl: 600, staleWhileRevalidate: 120 },
  '/api/organization': { ttl: 300, staleWhileRevalidate: 60 },
};

// ============================================
// Middleware
// ============================================

export async function cacheMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
): Promise<Response | void> {
  // Only cache GET requests
  if (c.req.method !== 'GET') {
    return next();
  }

  // Check if route is cacheable
  const config = getCacheConfig(c.req.path);
  if (!config) {
    c.header('X-Cache', 'BYPASS');
    return next();
  }

  // Build cache key
  const cacheKey = buildCacheKey(c);

  try {
    // Try to get from cache
    const cached = (await c.env.CACHE.get(cacheKey, { type: 'json' })) as CachedResponse | null;

    if (cached) {
      const now = Date.now();
      const age = Math.floor((now - cached.timestamp) / 1000);
      const isStale = age > cached.ttl;
      const maxAge = Math.max(0, cached.ttl - age);

      // Set cache headers
      c.header('X-Cache', isStale ? 'STALE' : 'HIT');
      c.header('Age', String(age));
      c.header('Cache-Control', `public, max-age=${maxAge}`);

      // If stale but within revalidate window, trigger background refresh
      if (isStale && config.staleWhileRevalidate) {
        const staleAge = age - cached.ttl;
        if (staleAge <= config.staleWhileRevalidate) {
          // Return stale data immediately, revalidate in background
          c.executionCtx.waitUntil(revalidateCache(c, cacheKey, config));
          return c.json(cached.data);
        }
      }

      // Return cached data if fresh
      if (!isStale) {
        return c.json(cached.data);
      }
    }

    // Cache miss - fetch fresh data
    c.header('X-Cache', 'MISS');

    await next();

    // Cache successful responses
    if (c.res.status === 200) {
      try {
        const responseData = await c.res.clone().json();

        const cacheEntry: CachedResponse = {
          data: responseData,
          timestamp: Date.now(),
          ttl: config.ttl,
        };

        // Store in cache with expiration
        const totalTtl = config.ttl + (config.staleWhileRevalidate || 0);
        await c.env.CACHE.put(cacheKey, JSON.stringify(cacheEntry), {
          expirationTtl: totalTtl,
        });
      } catch (e) {
        console.error('[Cache] Failed to cache response:', e);
      }
    }
  } catch (error) {
    console.error('[Cache Error]', error);
    return next();
  }
}

// ============================================
// Helpers
// ============================================

function getCacheConfig(path: string): CacheConfig | null {
  // Check exact match
  if (cacheableRoutes[path]) {
    return cacheableRoutes[path];
  }

  // Check prefix match (for paths with IDs)
  for (const [route, config] of Object.entries(cacheableRoutes)) {
    if (path.startsWith(route)) {
      return config;
    }
  }

  return null;
}

function buildCacheKey(c: Context<{ Bindings: Env }>): string {
  const url = new URL(c.req.url);
  const user = c.get('user');

  // Include organization in key for multi-tenant isolation
  const orgId = user?.organizationId || 'public';

  // Sort query params for consistent keys
  const params = new URLSearchParams(url.search);
  params.sort();

  return `cache:${orgId}:${url.pathname}:${params.toString()}`;
}

async function revalidateCache(
  c: Context<{ Bindings: Env }>,
  cacheKey: string,
  config: CacheConfig
): Promise<void> {
  try {
    // Clone the request for background fetch
    const headers = new Headers(c.req.raw.headers);
    headers.set('X-Revalidate', 'true');

    const response = await fetch(c.req.url, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const data = await response.json();

      const cacheEntry: CachedResponse = {
        data,
        timestamp: Date.now(),
        ttl: config.ttl,
      };

      const totalTtl = config.ttl + (config.staleWhileRevalidate || 0);
      await c.env.CACHE.put(cacheKey, JSON.stringify(cacheEntry), {
        expirationTtl: totalTtl,
      });

      console.log('[Cache] Revalidated:', cacheKey);
    }
  } catch (error) {
    console.error('[Cache] Revalidation failed:', error);
  }
}

// ============================================
// Cache Invalidation
// ============================================

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(kv: KVNamespace, pattern: string): Promise<number> {
  const prefix = `cache:${pattern}`;
  const list = await kv.list({ prefix, limit: 1000 });

  let deleted = 0;
  for (const key of list.keys) {
    await kv.delete(key.name);
    deleted++;
  }

  console.log(`[Cache] Invalidated ${deleted} keys matching: ${prefix}`);
  return deleted;
}

/**
 * Invalidate cache for organization
 */
export async function invalidateOrgCache(kv: KVNamespace, organizationId: string): Promise<number> {
  return invalidateCache(kv, organizationId);
}

/**
 * Invalidate cache for specific entity
 */
export async function invalidateEntityCache(
  kv: KVNamespace,
  organizationId: string,
  entity: string
): Promise<number> {
  return invalidateCache(kv, `${organizationId}:/api/${entity}`);
}
