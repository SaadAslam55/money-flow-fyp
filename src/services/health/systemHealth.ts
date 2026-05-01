// src/services/health/systemHealth.ts
/**
 * System Health Monitoring Service
 * Industry-standard health checks for all backend services
 * Monitors Supabase, Edge Functions, Auth, and Database connectivity
 *
 * Usage:
 *   import { checkSystemHealth } from '@/services/health/systemHealth';
 *   const health = await checkSystemHealth();
 *   if (!health.healthy) {
 *     // Handle degraded service
 *   }
 */

import { supabase } from '@/services/supabase/client';
import { logger } from '@/lib/logger';
import {
  checkAIEdgeHealth,
  checkAuthHealth,
} from '@/services/ai/aiEdgeService';

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  lastChecked: string;
  error?: string;
}

export interface SystemHealthStatus {
  healthy: boolean;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: ServiceHealth[];
  degraded: string[];
  unavailable: string[];
}

const HEALTH_CHECKS = {
  database: async (): Promise<Omit<ServiceHealth, 'name'>> => {
    const start = performance.now();
    try {
      const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return {
        status: 'healthy' as const,
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Database connection failed',
      };
    }
  },

  auth: async (): Promise<Omit<ServiceHealth, 'name'>> => {
    const start = performance.now();
    try {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      return {
        status: 'healthy' as const,
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Auth service unavailable',
      };
    }
  },

  aiEdgeFunction: async (): Promise<Omit<ServiceHealth, 'name'>> => {
    const start = performance.now();
    try {
      const healthy = await checkAIEdgeHealth();
      return {
        status: healthy ? 'healthy' : ('degraded' as const),
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
        error: healthy ? undefined : 'AI Edge Function returned unhealthy status',
      };
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'AI Edge Function unreachable',
      };
    }
  },

  authEdgeFunction: async (): Promise<Omit<ServiceHealth, 'name'>> => {
    const start = performance.now();
    try {
      const healthy = await checkAuthHealth();
      return {
        status: healthy ? 'healthy' : ('degraded' as const),
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
        error: healthy ? undefined : 'Auth Edge Function returned unhealthy status',
      };
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Auth Edge Function unreachable',
      };
    }
  },

  realtime: async (): Promise<Omit<ServiceHealth, 'name'>> => {
    const start = performance.now();
    try {
      const channel = supabase.channel('health-check');
      const subscribed = await new Promise<boolean>((resolve) => {
        channel
          .subscribe((status) => {
            resolve(status === 'SUBSCRIBED');
            channel.unsubscribe();
          });
        // Timeout after 5 seconds
        setTimeout(() => {
          resolve(false);
          channel.unsubscribe();
        }, 5000);
      });

      return {
        status: subscribed ? 'healthy' : ('degraded' as const),
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
        error: subscribed ? undefined : 'Realtime subscription timeout',
      };
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Realtime service error',
      };
    }
  },

  storage: async (): Promise<Omit<ServiceHealth, 'name'>> => {
    const start = performance.now();
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      return {
        status: 'healthy' as const,
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Storage service unavailable',
      };
    }
  },
};

/**
 * Check all system services health
 */
export async function checkSystemHealth(): Promise<SystemHealthStatus> {
  logger.info('Running system health checks...');

  const services: ServiceHealth[] = [];
  const degraded: string[] = [];
  const unavailable: string[] = [];

  const results = await Promise.allSettled([
    HEALTH_CHECKS.database().then(r => ({ ...r, name: 'Database' })),
    HEALTH_CHECKS.auth().then(r => ({ ...r, name: 'Auth' })),
    HEALTH_CHECKS.aiEdgeFunction().then(r => ({ ...r, name: 'AI Edge Function' })),
    HEALTH_CHECKS.authEdgeFunction().then(r => ({ ...r, name: 'Auth Edge Function' })),
    HEALTH_CHECKS.realtime().then(r => ({ ...r, name: 'Realtime' })),
    HEALTH_CHECKS.storage().then(r => ({ ...r, name: 'Storage' })),
  ]);

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      services.push(result.value as ServiceHealth);
      if (result.value.status === 'degraded') {
        degraded.push(result.value.name);
      } else if (result.value.status === 'unhealthy') {
        unavailable.push(result.value.name);
      }
    } else {
      services.push({
        name: 'Unknown',
        status: 'unhealthy',
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        error: result.reason instanceof Error ? result.reason.message : 'Check failed',
      });
      unavailable.push('Unknown');
    }
  });

  const healthy = unavailable.length === 0;
  const overallStatus: SystemHealthStatus['overallStatus'] = unavailable.length > 0
    ? 'unhealthy'
    : degraded.length > 0
      ? 'degraded'
      : 'healthy';

  const status: SystemHealthStatus = {
    healthy,
    overallStatus,
    timestamp: new Date().toISOString(),
    services,
    degraded,
    unavailable,
  };

  if (!healthy) {
    logger.warn('System health check failed:', status);
  } else if (degraded.length > 0) {
    logger.info('System degraded:', degraded);
  } else {
    logger.info('All systems healthy');
  }

  return status;
}

/**
 * Quick health check for specific service
 */
export async function checkServiceHealth(serviceName: keyof typeof HEALTH_CHECKS): Promise<ServiceHealth> {
  const check = HEALTH_CHECKS[serviceName];
  const result = await check();
  return { ...result, name: serviceName };
}

/**
 * Check if user email is verified
 */
export async function checkEmailVerification(): Promise<{
  verified: boolean;
  email?: string;
  verifiedAt?: string;
}> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { verified: false };

    return {
      verified: !!user.email_confirmed_at,
      email: user.email,
      verifiedAt: user.email_confirmed_at || undefined,
    };
  } catch {
    return { verified: false };
  }
}
