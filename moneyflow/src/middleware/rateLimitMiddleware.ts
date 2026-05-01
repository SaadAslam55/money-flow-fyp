// src/middleware/rateLimitMiddleware.ts
/**
 * Rate Limiting Middleware - Phase 6: Security & Performance
 * Client-side rate limiting for API calls
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blocked?: boolean;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  default: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
  auth: { maxRequests: 5, windowMs: 60000, blockDurationMs: 300000 }, // 5 auth attempts per minute, 5 min block
  api: { maxRequests: 60, windowMs: 60000 }, // 60 API calls per minute
  upload: { maxRequests: 10, windowMs: 60000 }, // 10 uploads per minute
  export: { maxRequests: 5, windowMs: 300000 }, // 5 exports per 5 minutes
};

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  key: string,
  configName: keyof typeof RATE_LIMIT_CONFIGS = 'default'
): { allowed: boolean; remaining: number; resetIn: number } {
  // Default config always exists
  const config = RATE_LIMIT_CONFIGS[configName] ?? { maxRequests: 100, windowMs: 60000 };
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // Check if blocked
  if (entry?.blocked && entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.blockedUntil - now,
    };
  }

  // Reset if window expired
  if (!entry || now - entry.firstRequest > config.windowMs) {
    entry = { count: 0, firstRequest: now };
    rateLimitStore.set(key, entry);
  }

  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    if (config.blockDurationMs) {
      entry.blocked = true;
      entry.blockedUntil = now + config.blockDurationMs;
    }

    return {
      allowed: false,
      remaining: 0,
      resetIn: config.windowMs - (now - entry.firstRequest),
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: config.windowMs - (now - entry.firstRequest),
  };
}

/**
 * Rate limit decorator for async functions
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  key: string,
  configName: keyof typeof RATE_LIMIT_CONFIGS = 'default'
): T {
  return (async (...args: Parameters<T>) => {
    const result = checkRateLimit(key, configName);

    if (!result.allowed) {
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(result.resetIn / 1000)} seconds.`,
        result.resetIn
      );
    }

    return fn(...args);
  }) as T;
}

/**
 * Custom error for rate limiting
 */
export class RateLimitError extends Error {
  public resetIn: number;

  constructor(message: string, resetIn: number) {
    super(message);
    this.name = 'RateLimitError';
    this.resetIn = resetIn;
  }
}

/**
 * Clear rate limit for a specific key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get rate limit status for a key
 */
export function getRateLimitStatus(
  key: string,
  configName: keyof typeof RATE_LIMIT_CONFIGS = 'default'
): { count: number; remaining: number; blocked: boolean } {
  const config = RATE_LIMIT_CONFIGS[configName] ?? { maxRequests: 100, windowMs: 60000 };
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return { count: 0, remaining: config.maxRequests, blocked: false };
  }

  const now = Date.now();
  const isBlocked = entry.blocked && entry.blockedUntil ? now < entry.blockedUntil : false;

  return {
    count: entry.count,
    remaining: Math.max(0, config.maxRequests - entry.count),
    blocked: isBlocked,
  };
}
