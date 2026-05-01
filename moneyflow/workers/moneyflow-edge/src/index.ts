/**
 * MoneyFlow Edge API
 * Cloudflare Workers entry point
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { prettyJSON } from 'hono/pretty-json';

import { rateLimitMiddleware } from './middleware/rate-limit';
import { cacheMiddleware } from './middleware/cache';
import { authMiddleware } from './middleware/auth';

import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import cacheRoutes from './routes/cache';
import proxyRoutes from './routes/proxy';

// ============================================
// Environment Types
// ============================================

export interface Env {
  // KV Namespaces
  CACHE: KVNamespace;
  RATE_LIMIT: KVNamespace;
  SESSIONS: KVNamespace;

  // Secrets
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  API_SECRET: string;

  // Variables
  ENVIRONMENT: string;
  API_ORIGIN: string;
}

// ============================================
// App Configuration
// ============================================

const app = new Hono<{ Bindings: Env }>();

// ============================================
// Global Middleware
// ============================================

// Timing header (X-Response-Time)
app.use('*', timing());

// Request logging
app.use('*', logger());

// Security headers
app.use('*', secureHeaders());

// Pretty JSON in development
app.use('*', prettyJSON());

// CORS Configuration
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        'https://mtkcodex.site',
        'https://www.mtkcodex.site',
        'https://moneyflow.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:4173',
      ];

      // Allow all origins in development
      if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
        return origin;
      }
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Organization-ID'],
    exposeHeaders: ['X-Request-ID', 'X-Response-Time', 'X-Cache', 'X-RateLimit-Remaining'],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// Add request ID
app.use('*', async (c, next) => {
  const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();
  c.header('X-Request-ID', requestId);
  await next();
});

// ============================================
// Routes
// ============================================

// Health checks (no auth required)
app.route('/health', healthRoutes);

// Rate limiting for API routes
app.use('/api/*', rateLimitMiddleware);

// Auth routes (special handling)
app.route('/auth', authRoutes);

// Cache management (requires auth)
app.route('/cache', cacheRoutes);

// Main API proxy (requires auth)
app.route('/api', proxyRoutes);

// ============================================
// Error Handlers
// ============================================

// 404 Not Found
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
        path: c.req.path,
      },
    },
    404
  );
});

// Global error handler
app.onError((err, c) => {
  console.error('[Worker Error]', {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  const isDev = c.env.ENVIRONMENT === 'development';

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: isDev ? err.message : 'An internal error occurred',
        ...(isDev && { stack: err.stack }),
      },
    },
    500
  );
});

// ============================================
// Export
// ============================================

export default app;

// Export middleware for reuse
export { authMiddleware, rateLimitMiddleware, cacheMiddleware };
