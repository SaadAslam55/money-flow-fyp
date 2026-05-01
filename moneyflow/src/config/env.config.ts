

/**
 * Environment Configuration
 * Type-safe environment variable handling with validation
 */

/**
 * Environment variable schema with defaults and validation
 */
interface EnvConfig {
  // App Configuration
  appName: string;
  appUrl: string;
  apiUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // Supabase Configuration
  supabase: {
    url: string;
    anonKey: string;
  };

  // Stripe Configuration
  stripe: {
    publicKey: string | undefined;
  };

  // Analytics & Monitoring
  analytics: {
    googleAnalyticsId: string | undefined;
    mixpanelToken: string | undefined;
    sentryDsn: string | undefined;
  };

  // Feature Flags (from env)
  features: {
    inventory: boolean;
    multiCurrency: boolean;
    multiBranch: boolean;
  };

  // API Configuration
  api: {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

// Type-safe environment access
const env = (import.meta as { env?: Record<string, string> }).env ?? {};

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, defaultValue?: string): string {
  const value = env[key];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable
 */
function getOptionalEnv(key: string): string | undefined {
  return env[key] || undefined;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnv(key: string, defaultValue = false): boolean {
  const value = env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnv(key: string, defaultValue: number): number {
  const value = env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return defaultValue;
  }
  return parsed;
}

/**
 * Validate required environment variables
 */
function validateRequiredEnv(): void {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing: string[] = [];

  for (const key of required) {
    if (!env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const message = [
      '❌ Missing required environment variables:',
      ...missing.map((key) => `   - ${key}`),
      '',
      'Please check your .env file and ensure all required variables are set.',
      'See .env.example for reference.',
    ].join('\n');

    throw new Error(message);
  }
}

/**
 * Environment configuration object
 */
export const ENV_CONFIG: EnvConfig = {
  // App Configuration
  appName: getEnv('VITE_APP_NAME', 'Money Flow'),
  appUrl: getEnv('VITE_APP_URL', 'http://localhost:5173'),
  apiUrl: getEnv('VITE_API_URL', 'http://localhost:3000'),
  nodeEnv: ((import.meta as { env?: { MODE?: string } }).env?.MODE ??
    'development') as EnvConfig['nodeEnv'],
  isDevelopment: (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false,
  isProduction: (import.meta as { env?: { PROD?: boolean } }).env?.PROD ?? false,
  isTest: (import.meta as { env?: { MODE?: string } }).env?.MODE === 'test',

  // Supabase Configuration
  supabase: {
    url: getEnv('VITE_SUPABASE_URL', ''),
    anonKey: getEnv('VITE_SUPABASE_ANON_KEY', ''),
  },

  // Stripe Configuration
  stripe: {
    publicKey: getOptionalEnv('VITE_STRIPE_PUBLIC_KEY'),
  },

  // Analytics & Monitoring
  analytics: {
    googleAnalyticsId: getOptionalEnv('VITE_GA_ID') || getOptionalEnv('VITE_GA_MEASUREMENT_ID'),
    mixpanelToken: getOptionalEnv('VITE_MIXPANEL_TOKEN'),
    sentryDsn: getOptionalEnv('VITE_SENTRY_DSN'),
  },

  // Feature Flags
  features: {
    inventory: getBooleanEnv('VITE_ENABLE_INVENTORY', false),
    multiCurrency: getBooleanEnv('VITE_ENABLE_MULTI_CURRENCY', false),
    multiBranch: getBooleanEnv('VITE_ENABLE_MULTI_BRANCH', false),
  },

  // API Configuration
  api: {
    timeout: getNumberEnv('VITE_API_TIMEOUT', 30000),
    retryAttempts: getNumberEnv('VITE_API_RETRY_ATTEMPTS', 3),
    retryDelay: getNumberEnv('VITE_API_RETRY_DELAY', 1000),
  },
};

/**
 * Initialize and validate environment configuration
 * Call this at app startup
 */
export function initEnvConfig(): void {
  try {
    validateRequiredEnv();

    if (ENV_CONFIG.isDevelopment) {
      console.info('✅ Environment configuration loaded successfully');
      console.info('📦 Environment:', {
        mode: ENV_CONFIG.nodeEnv,
        appName: ENV_CONFIG.appName,
        appUrl: ENV_CONFIG.appUrl,
        supabaseUrl: ENV_CONFIG.supabase.url ? '✅ Set' : '❌ Missing',
        stripeKey: ENV_CONFIG.stripe.publicKey ? '✅ Set' : '⚠️ Optional',
      });
    }
  } catch (error) {
    // Log error but don't throw - allow app to render with error UI
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Use console directly to avoid circular dependency issues
    console.error('❌ Environment configuration error:', errorMessage);

    // In production, show user-friendly error
    if (ENV_CONFIG.isProduction && typeof window !== 'undefined') {
      console.error(
        '%c⚠️ Configuration Error',
        'color: red; font-weight: bold; font-size: 14px;',
        '\n' + errorMessage + '\n\nPlease check your environment variables.'
      );
    }

    // Don't throw - let the app render and show error UI
    // Individual services will handle missing config gracefully
  }
}

/**
 * Check if a feature is enabled via environment variable
 */
export function isFeatureEnabled(feature: keyof EnvConfig['features']): boolean {
  return ENV_CONFIG.features[feature] ?? false;
}

/**
 * Get Supabase URL
 */
export function getSupabaseUrl(): string {
  return ENV_CONFIG.supabase.url;
}

/**
 * Get Supabase Anon Key
 */
export function getSupabaseAnonKey(): string {
  return ENV_CONFIG.supabase.anonKey;
}

/**
 * Get Stripe Public Key
 */
export function getStripePublicKey(): string | undefined {
  return ENV_CONFIG.stripe.publicKey;
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return !!(
    ENV_CONFIG.analytics.googleAnalyticsId ||
    ENV_CONFIG.analytics.mixpanelToken ||
    ENV_CONFIG.analytics.sentryDsn
  );
}

/**
 * Get API base URL
 * @returns API base URL from environment or Supabase REST API URL
 */
export function getApiBaseUrl(): string {
  // If custom API URL is set, use it; otherwise use Supabase REST API
  if (ENV_CONFIG.apiUrl && ENV_CONFIG.apiUrl !== 'http://localhost:3000') {
    return ENV_CONFIG.apiUrl;
  }
  return `${ENV_CONFIG.supabase.url}/rest/v1`;
}

/**
 * Type-safe environment config
 */
export type EnvConfigType = typeof ENV_CONFIG;

// Initialize on module load (only in browser)
if (typeof window !== 'undefined') {
  initEnvConfig();
}
