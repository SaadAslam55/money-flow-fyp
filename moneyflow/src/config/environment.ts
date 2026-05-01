import { logger } from '@/lib/logger';

/**
 * Environment Configuration
 * Centralized environment and feature configuration
 */

// ============================================
// Types
// ============================================

export interface Environment {
  // API Endpoints
  apiUrl: string;
  edgeApiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;

  // Feature Flags (defaults, can be overridden)
  features: {
    useNewApi: boolean;
    useTiDB: boolean;
    useEdgeCache: boolean;
    enableAnalytics: boolean;
    enableRealtime: boolean;
  };

  // Rollout Percentages
  rollout: {
    newApiPercent: number;
    tidbPercent: number;
  };

  // App Config
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';

  // Debugging
  debug: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// ============================================
// Environment Detection
// ============================================

function getEnvironment(): Environment {
  const isDev = import.meta.env.DEV;
  const mode = import.meta.env.MODE as Environment['environment'];

  return {
    // API Endpoints
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
    edgeApiUrl: import.meta.env.VITE_EDGE_API_URL || 'https://api.mtkcodex.site',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

    // Feature Flags (environment defaults)
    features: {
      useNewApi: import.meta.env.VITE_USE_NEW_API === 'true',
      useTiDB: import.meta.env.VITE_USE_TIDB === 'true',
      useEdgeCache: import.meta.env.VITE_USE_EDGE_CACHE === 'true',
      enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      enableRealtime: import.meta.env.VITE_ENABLE_REALTIME !== 'false', // Default true
    },

    // Rollout Percentages
    rollout: {
      newApiPercent: parseInt(import.meta.env.VITE_NEW_API_ROLLOUT || '0', 10),
      tidbPercent: parseInt(import.meta.env.VITE_TIDB_ROLLOUT || '0', 10),
    },

    // App Config
    appName: 'Money Flow',
    appVersion: import.meta.env.VITE_APP_VERSION || '2.0.0',
    environment: mode || 'development',

    // Debugging
    debug: isDev || import.meta.env.VITE_DEBUG === 'true',
    logLevel: isDev ? 'debug' : 'error',
  };
}

// ============================================
// Singleton Export
// ============================================

export const env = getEnvironment();

// ============================================
// Validation
// ============================================

export function validateEnvironment(): void {
  const errors: string[] = [];

  if (!env.supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is required');
  }

  if (!env.supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }

  if (errors.length > 0) {
    logger.error('Environment validation failed:', errors);
    if (env.environment === 'production') {
      throw new Error(`Missing required environment variables: ${errors.join(', ')}`);
    }
  }
}

// ============================================
// Helpers
// ============================================

export function isDevelopment(): boolean {
  return env.environment === 'development';
}

export function isProduction(): boolean {
  return env.environment === 'production';
}

export function isStaging(): boolean {
  return env.environment === 'staging';
}

export function getApiBaseUrl(): string {
  if (env.features.useEdgeCache) {
    return env.edgeApiUrl;
  }
  return env.apiUrl;
}

// Export default
export default env;
