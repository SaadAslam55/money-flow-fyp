/**
 * Health Check Routes
 * Monitoring and readiness endpoints
 */

import { Hono } from 'hono';
import type { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// ============================================
// Basic Health Check
// ============================================

app.get('/', (c) => {
  return c.json({
    status: 'healthy',
    service: 'moneyflow-edge',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
    region: c.req.header('CF-Ray')?.split('-')[1] || 'unknown',
    colo: c.req.header('CF-IPCountry') || 'unknown',
  });
});

// ============================================
// Readiness Check
// ============================================

app.get('/ready', async (c) => {
  const checks: Record<string, { status: boolean; latency?: number; error?: string }> = {};
  const startTime = Date.now();

  // Check KV Cache
  try {
    const kvStart = Date.now();
    await c.env.CACHE.get('health-check-key');
    checks.kv_cache = {
      status: true,
      latency: Date.now() - kvStart,
    };
  } catch (error) {
    checks.kv_cache = {
      status: false,
      error: (error as Error).message,
    };
  }

  // Check KV Rate Limit
  try {
    const kvStart = Date.now();
    await c.env.RATE_LIMIT.get('health-check-key');
    checks.kv_rate_limit = {
      status: true,
      latency: Date.now() - kvStart,
    };
  } catch (error) {
    checks.kv_rate_limit = {
      status: false,
      error: (error as Error).message,
    };
  }

  // Check KV Sessions
  try {
    const kvStart = Date.now();
    await c.env.SESSIONS.get('health-check-key');
    checks.kv_sessions = {
      status: true,
      latency: Date.now() - kvStart,
    };
  } catch (error) {
    checks.kv_sessions = {
      status: false,
      error: (error as Error).message,
    };
  }

  // Check Origin API
  if (c.env.API_ORIGIN) {
    try {
      const originStart = Date.now();
      const response = await fetch(`${c.env.API_ORIGIN}/health`, {
        method: 'GET',
        headers: { 'User-Agent': 'CloudflareWorker/HealthCheck' },
        signal: AbortSignal.timeout(5000),
      });
      checks.origin_api = {
        status: response.ok,
        latency: Date.now() - originStart,
      };
    } catch (error) {
      checks.origin_api = {
        status: false,
        error: (error as Error).message,
      };
    }
  }

  // Aggregate status
  const allHealthy = Object.values(checks).every((check) => check.status);
  const totalLatency = Date.now() - startTime;

  return c.json(
    {
      status: allHealthy ? 'ready' : 'degraded',
      checks,
      totalLatency,
      timestamp: new Date().toISOString(),
    },
    allHealthy ? 200 : 503
  );
});

// ============================================
// Liveness Check
// ============================================

app.get('/live', (c) => {
  return c.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Version Info
// ============================================

app.get('/version', (c) => {
  return c.json({
    service: 'moneyflow-edge',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
    runtime: 'cloudflare-workers',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Metrics (basic)
// ============================================

app.get('/metrics', async (c) => {
  // Get cache stats
  let cacheKeys = 0;
  try {
    const cacheList = await c.env.CACHE.list({ limit: 1 });
    cacheKeys = cacheList.keys.length;
  } catch {
    // Ignore
  }

  return c.json({
    uptime: 'N/A', // Workers don't have persistent uptime
    memory: 'N/A', // Not available in Workers
    cache: {
      estimated_keys: cacheKeys,
    },
    timestamp: new Date().toISOString(),
  });
});

export default app;
