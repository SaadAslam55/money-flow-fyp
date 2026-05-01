// src/middleware/index.ts
/**
 * Centralized middleware exports
 * Import all middleware functions from here for better organization
 *
 * Usage:
 * import { checkAuthentication, requirePermission, trackPageView } from '@/middleware';
 */

// Authentication Middleware
export {
  checkAuthentication,
  requireAuthentication,
  checkUserRole,
  requireRole,
  isAdmin,
  isSuperAdmin,
  getAuthHeaders,
  validateSessionToken,
  type AuthCheckResult,
} from './authMiddleware';

// Permission Middleware
export {
  checkPermission,
  requirePermission,
  hasAnyPermission,
  hasAllPermissions,
  getAvailablePermissions,
  canPerformAction,
  canAccessRoute,
  type PermissionCheckResult,
} from './permissionMiddleware';

// Analytics Middleware
export {
  trackPageView,
  trackAPICall,
  trackUserAction,
  trackFormSubmit,
  trackError,
  trackPerformance,
  createRouteTracker,
  type AnalyticsOptions,
} from './analyticsMiddleware';

// Rate Limiting Middleware (Phase 6)
export {
  checkRateLimit,
  withRateLimit,
  clearRateLimit,
  clearAllRateLimits,
  getRateLimitStatus,
  RateLimitError,
  RATE_LIMIT_CONFIGS,
} from './rateLimitMiddleware';

// Security Middleware (Phase 6)
export {
  generateCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  addCSRFHeader,
  sanitizeInput,
  sanitizeHTML,
  isValidRedirectUrl,
  isSecureContext,
  updateSessionActivity,
  isSessionExpired,
  clearSession,
  checkPasswordStrength,
  SECURITY_HEADERS,
  CSP_DIRECTIVES,
  buildCSPHeader,
  type PasswordStrength,
} from './securityMiddleware';
