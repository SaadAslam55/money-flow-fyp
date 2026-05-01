/**
 * Rate Limiting Middleware
 * Protects API from abuse using KV storage
 */

import { Context, Next } from 'hono';
import type { Env } from '../index';

// ============================================
// Types
// ============================================

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Key prefix for different rate limits
}

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

// ============================================
// Configuration
// ============================================

const defaultConfig: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

// Endpoint-specific limits
const endpointLimits: Record<string, RateLimitConfig> = {
  // Auth endpoints - stricter limits
  '/auth/login': { windowMs: 300000, maxRequests: 5 }, // 5 per 5 min
  '/auth/signup': { windowMs: 3600000, maxRequests: 3 }, // 3 per hour
  '/auth/reset-password': { windowMs: 3600000, maxRequests: 3 },

  // Write operations - moderate limits
  '/api/invoices': { windowMs: 60000, maxRequests: 30 },
  '/api/customers': { windowMs: 60000, maxRequests: 30 },
  '/api/products': { windowMs: 60000, maxRequests: 30 },
  '/api/transactions': { windowMs: 60000, maxRequests: 30 },

  // Expensive operations - strict limits
  '/api/reports': { windowMs: 60000, maxRequests: 10 },
  '/api/analytics': { windowMs: 60000, maxRequests: 10 },
  '/api/export': { windowMs: 60000, maxRequests: 5 },

  // Bulk operations - very strict
  '/api/bulk': { windowMs: 60000, maxRequests: 3 },
};

// ============================================
// Middleware
// ============================================

export async function rateLimitMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
): Promise<Response | void> {
  // Get client identifier
  const ip =
    c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')?.split(',')[0] || 'unknown';

  const path = c.req.path;
  const method = c.req.method;

  // Skip rate limiting for OPTIONS (preflight)
  if (method === 'OPTIONS') {
    return next();
  }

  // Get config for this endpoint
  const config = getConfigForPath(path);
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  // Build rate limit key
  const key = `ratelimit:${config.keyPrefix || 'api'}:${ip}:${normalizePathForKey(path)}`;

  try {
    // Get current rate limit info
    const stored = await c.env.RATE_LIMIT.get(key);
    const now = Date.now();

    let info: RateLimitInfo;

    if (stored) {
      info = JSON.parse(stored);

      // Check if window has expired
      if (now >= info.resetAt) {
        info = { count: 0, resetAt: now + config.windowMs };
      }
    } else {
      info = { count: 0, resetAt: now + config.windowMs };
    }

    // Check if limit exceeded
    if (info.count >= config.maxRequests) {
      const retryAfter = Math.ceil((info.resetAt - now) / 1000);

      // Set rate limit headers
      c.header('Retry-After', String(retryAfter));
      c.header('X-RateLimit-Limit', String(config.maxRequests));
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', String(Math.ceil(info.resetAt / 1000)));

      return c.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests. Please try again in ${retryAfter} seconds.`,
            retryAfter,
          },
        },
        429
      );
    }

    // Increment counter
    info.count++;

    // Store updated info
    await c.env.RATE_LIMIT.put(key, JSON.stringify(info), {
      expirationTtl: windowSeconds + 60, // Extra buffer
    });

    // Set rate limit headers
    c.header('X-RateLimit-Limit', String(config.maxRequests));
    c.header('X-RateLimit-Remaining', String(Math.max(0, config.maxRequests - info.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(info.resetAt / 1000)));

    return next();
  } catch (error) {
    // On error, allow request but log
    console.error('[RateLimit Error]', error);
    return next();
  }
}

// ============================================
// Helpers
// ============================================

function getConfigForPath(path: string): RateLimitConfig {
  // Check for exact match first
  if (endpointLimits[path]) {
    return endpointLimits[path];
  }

  // Check for prefix match
  for (const [pattern, config] of Object.entries(endpointLimits)) {
    if (path.startsWith(pattern)) {
      return config;
    }
  }

  return defaultConfig;
}

function normalizePathForKey(path: string): string {
  // Remove IDs from path for grouping
  // /api/invoices/abc123 -> /api/invoices/:id
  return path.replace(/\/[a-zA-Z0-9-_]{20,}/g, '/:id');
}

// ============================================
// Custom Rate Limiter Factory
// ============================================

export function createRateLimiter(config: RateLimitConfig) {
  return async (c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> => {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const key = `ratelimit:${config.keyPrefix || 'custom'}:${ip}`;
    const windowSeconds = Math.ceil(config.windowMs / 1000);

    const stored = await c.env.RATE_LIMIT.get(key);
    const now = Date.now();

    let info: RateLimitInfo = stored
      ? JSON.parse(stored)
      : { count: 0, resetAt: now + config.windowMs };

    if (now >= info.resetAt) {
      info = { count: 0, resetAt: now + config.windowMs };
    }

    if (info.count >= config.maxRequests) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }

    info.count++;
    await c.env.RATE_LIMIT.put(key, JSON.stringify(info), {
      expirationTtl: windowSeconds + 60,
    });

    return next();
  };
}
