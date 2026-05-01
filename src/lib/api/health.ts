/**
 * Health Check Utilities
 *
 * Functions to check the health of various backend services
 * used in the Money Flow application.
 */

// ============================================
// Types
// ============================================

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  message?: string;
  lastChecked: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    api: ServiceHealth;
    supabase: ServiceHealth;
    tidb?: ServiceHealth;
    redis?: ServiceHealth;
    cloudflare?: ServiceHealth;
  };
  timestamp: string;
  version: string;
}

// ============================================
// Health Check Functions
// ============================================

/**
 * Check API health
 */
async function checkApiHealth(apiUrl: string): Promise<ServiceHealth> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (response.ok) {
      return {
        status: latency < 500 ? 'healthy' : 'degraded',
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'unhealthy',
      latency,
      message: `HTTP ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check Supabase health
 */
async function checkSupabaseHealth(supabaseUrl: string): Promise<ServiceHealth> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Supabase health endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    // Supabase returns 400 for HEAD without auth, but it means it's reachable
    if (response.ok || response.status === 400) {
      return {
        status: latency < 500 ? 'healthy' : 'degraded',
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'unhealthy',
      latency,
      message: `HTTP ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check Redis health (via API)
 */
async function checkRedisHealth(apiUrl: string): Promise<ServiceHealth> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${apiUrl}/health/redis`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (response.ok) {
      return {
        status: latency < 100 ? 'healthy' : 'degraded',
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'unhealthy',
      latency,
      message: `HTTP ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check Cloudflare Workers health
 */
async function checkCloudflareHealth(edgeUrl: string): Promise<ServiceHealth> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${edgeUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (response.ok) {
      return {
        status: latency < 100 ? 'healthy' : 'degraded',
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'unhealthy',
      latency,
      message: `HTTP ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

// ============================================
// Main Health Check
// ============================================

/**
 * Perform full system health check
 */
export async function checkSystemHealth(): Promise<SystemHealth> {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const edgeUrl = import.meta.env.VITE_EDGE_API_URL || '';

  // Check services in parallel
  const [apiHealth, supabaseHealth] = await Promise.all([
    apiUrl
      ? checkApiHealth(apiUrl)
      : Promise.resolve<ServiceHealth>({
          status: 'unhealthy',
          latency: 0,
          message: 'API URL not configured',
          lastChecked: new Date().toISOString(),
        }),
    supabaseUrl
      ? checkSupabaseHealth(supabaseUrl)
      : Promise.resolve<ServiceHealth>({
          status: 'unhealthy',
          latency: 0,
          message: 'Supabase URL not configured',
          lastChecked: new Date().toISOString(),
        }),
  ]);

  // Optional services
  const services: SystemHealth['services'] = {
    api: apiHealth,
    supabase: supabaseHealth,
  };

  // Check Redis if API is healthy
  if (apiUrl && apiHealth.status !== 'unhealthy') {
    services.redis = await checkRedisHealth(apiUrl);
  }

  // Check Cloudflare if configured
  if (edgeUrl) {
    services.cloudflare = await checkCloudflareHealth(edgeUrl);
  }

  // Determine overall status
  const statuses = Object.values(services).map((s) => s.status);
  let overall: SystemHealth['overall'] = 'healthy';

  if (statuses.includes('unhealthy')) {
    overall = 'unhealthy';
  } else if (statuses.includes('degraded')) {
    overall = 'degraded';
  }

  return {
    overall,
    services,
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION || '0.0.0',
  };
}

/**
 * Quick health check (just API and Supabase)
 */
export async function quickHealthCheck(): Promise<boolean> {
  const health = await checkSystemHealth();
  return health.overall !== 'unhealthy';
}

// ============================================
// Health Check Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';

export function useSystemHealth(intervalMs: number = 60000) {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      const result = await checkSystemHealth();
      setHealth(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Health check failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkHealth();

    // Set up interval
    const interval = setInterval(checkHealth, intervalMs);

    return () => clearInterval(interval);
  }, [checkHealth, intervalMs]);

  return { health, loading, error, refresh: checkHealth };
}
