// src/lib/security/rateLimiting.ts
/**
 * Rate Limiting Utilities
 * Client-side rate limiting to prevent abuse and reduce server load
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limit store
 */
class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (entry && Date.now() > entry.resetTime) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  increment(key: string, windowMs: number): RateLimitEntry {
    const existing = this.get(key);

    if (existing) {
      existing.count++;
      return existing;
    }

    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: Date.now() + windowMs,
    };

    this.set(key, newEntry);
    return newEntry;
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimitStore = new RateLimitStore();

// Cleanup every 5 minutes (only in browser, with cleanup support)
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => rateLimitStore.cleanup(), 5 * 60 * 1000);
}

export function stopCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

if (typeof window !== 'undefined') {
  startCleanup();
}

/**
 * Rate limiter class
 */
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  check(key: string): { allowed: boolean; retryAfter?: number; remaining?: number } {
    const entry = rateLimitStore.increment(key, this.config.windowMs);

    if (entry.count > this.config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
      return {
        allowed: false,
        retryAfter,
        remaining: 0,
      };
    }

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    rateLimitStore.reset(key);
  }
}

/**
 * Create a rate limiter
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  // API requests: 60 requests per minute
  api: createRateLimiter({
    maxRequests: 60,
    windowMs: 60 * 1000,
    message: 'Too many API requests. Please try again later.',
  }),

  // Authentication: 5 attempts per 15 minutes
  auth: createRateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many authentication attempts. Please try again later.',
  }),

  // Search: 30 requests per minute
  search: createRateLimiter({
    maxRequests: 30,
    windowMs: 60 * 1000,
    message: 'Too many search requests. Please slow down.',
  }),

  // File upload: 10 uploads per hour
  upload: createRateLimiter({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
    message: 'Upload limit reached. Please try again later.',
  }),

  // Email: 3 emails per hour
  email: createRateLimiter({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    message: 'Email limit reached. Please try again later.',
  }),
};

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          lastCall = Date.now();
          func.apply(this, args);
        },
        delay - (now - lastCall)
      );
    }
  };
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Request deduplication (prevent duplicate concurrent requests)
 */
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.pendingRequests.get(key);

    if (existing) {
      return existing as Promise<T>;
    }

    const promise = fn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(key?: string): void {
    if (key) {
      this.pendingRequests.delete(key);
    } else {
      this.pendingRequests.clear();
    }
  }
}

export const requestDeduplicator = new RequestDeduplicator();

/**
 * Check rate limit with automatic retry delay
 */
export async function withRateLimit<T>(
  limiter: RateLimiter,
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const result = limiter.check(key);

  if (!result.allowed) {
    throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter} seconds.`);
  }

  return fn();
}
