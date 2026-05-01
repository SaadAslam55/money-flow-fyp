/**
 * Middleware Index
 * Central export for all middleware
 */

export { authMiddleware, optionalAuthMiddleware, requireRole } from './auth';
export type { AuthUser } from './auth';

export { rateLimitMiddleware, createRateLimiter } from './rate-limit';

export {
  cacheMiddleware,
  invalidateCache,
  invalidateOrgCache,
  invalidateEntityCache,
} from './cache';
