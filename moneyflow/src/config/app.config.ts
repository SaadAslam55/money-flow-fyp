// src/config/app.config.ts

import { logger } from '@/lib/logger';

/**
 * Application configuration
 * All environment variables and app-wide settings
 */
// Type-safe environment access helper
const getEnv = (key: string): string | undefined => {
  return (import.meta as { env?: Record<string, string> }).env?.[key];
};

export const APP_CONFIG = {
  // App Information
  name: getEnv('VITE_APP_NAME') || 'Money Flow',
  url: getEnv('VITE_APP_URL') || 'http://localhost:5173',
  version: '1.0.0',

  // Supabase Configuration
  supabase: {
    url: getEnv('VITE_SUPABASE_URL') || '',
    anonKey: getEnv('VITE_SUPABASE_ANON_KEY') || '',
  },

  // Stripe Configuration
  stripe: {
    publicKey: getEnv('VITE_STRIPE_PUBLIC_KEY'),
  },

  // Pagination
  itemsPerPage: 50,
  itemsPerPageOptions: [10, 25, 50, 100],

  // File Upload Configuration
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],

  // Date & Time Configuration
  dateFormat: 'MMM dd, yyyy',
  dateTimeFormat: 'MMM dd, yyyy HH:mm',
  timeFormat: 'HH:mm',
  dateInputFormat: 'yyyy-MM-dd',

  // Currency Configuration
  defaultCurrency: 'PKR',
  currencySymbolMap: {
    PKR: 'Rs',
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    AED: 'AED',
    SAR: 'SAR',
    QAR: 'QAR',
  } as Record<string, string>,

  // Tax Configuration
  defaultTaxRate: 17, // 17% GST in Pakistan
  taxRates: [0, 5, 10, 15, 17, 18, 20],

  // Invoice Configuration
  invoicePrefix: 'INV',
  defaultPaymentTerms: 'Net 30',
  defaultInvoiceNotes: 'Thank you for your business!',

  // Features Toggle
  features: {
    inventory: getEnv('VITE_ENABLE_INVENTORY') === 'true',
    multiCurrency: getEnv('VITE_ENABLE_MULTI_CURRENCY') === 'true',
    multiBranch: getEnv('VITE_ENABLE_MULTI_BRANCH') === 'true',
    subscriptions: true,
    customerPortal: true,
    whatsappIntegration: false,
    emailIntegration: true,
    reports: true,
    advancedReports: false,
  },

  // Session Configuration
  sessionTimeout: 60 * 60 * 1000, // 1 hour in milliseconds
  sessionWarningTime: 5 * 60 * 1000, // 5 minutes warning before timeout

  // API Configuration
  apiTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second

  // Storage Keys
  storageKeys: {
    authToken: 'moneyflow-auth',
    theme: 'moneyflow-theme',
    language: 'moneyflow-language',
    recentSearches: 'moneyflow-recent-searches',
    preferences: 'moneyflow-preferences',
  },

  // UI Configuration
  theme: {
    defaultMode: 'light' as 'light' | 'dark' | 'system',
    borderRadius: '0.5rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  // Notification Configuration
  notifications: {
    position: 'top-right' as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
    duration: 5000, // 5 seconds
    maxVisible: 3,
  },

  // Search Configuration
  search: {
    debounceTime: 300, // milliseconds
    minCharacters: 2,
    maxResults: 10,
  },

  // Validation Rules
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
    phone: {
      minLength: 10,
      maxLength: 15,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },

  // External Services
  services: {
    sentry: {
      dsn: getEnv('VITE_SENTRY_DSN'),
      environment: (import.meta as { env?: { MODE?: string } }).env?.MODE ?? 'development',
    },
    analytics: {
      googleAnalyticsId: getEnv('VITE_GA_ID'),
    },
  },

  // Development Configuration
  isDevelopment: (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false,
  isProduction: (import.meta as { env?: { PROD?: boolean } }).env?.PROD ?? false,

  // Support & Help
  support: {
    email: 'support@moneyflow.app',
    phone: '+92-300-1234567',
    website: 'https://moneyflow.app',
    documentation: 'https://docs.moneyflow.app',
    community: 'https://community.moneyflow.app',
  },
} as const;

/**
 * Validate required environment variables
 * Throws error if any required variable is missing
 */
export function validateConfig(): void {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

  const missing = required.filter((key) => !getEnv(key));

  if (missing.length > 0) {
    const message = `❌ Missing required environment variables:\n${missing
      .map((key) => `   - ${key}`)
      .join('\n')}\n\nPlease check your .env file and ensure all required variables are set.`;

    throw new Error(message);
  }

  // Log configuration in development
  if (APP_CONFIG.isDevelopment) {
    logger.info('✅ Configuration validated successfully');
    logger.info('📦 App Config:', {
      name: APP_CONFIG.name,
      version: APP_CONFIG.version,
      mode: (import.meta as { env?: { MODE?: string } }).env?.MODE ?? 'development',
      features: APP_CONFIG.features,
    });
  }
}

/**
 * Get feature flag value
 * @param feature - Feature name
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof APP_CONFIG.features): boolean {
  return APP_CONFIG.features[feature] ?? false;
}

/**
 * Get currency symbol
 * @param currency - Currency code
 */
export function getCurrencySymbol(currency: string): string {
  return APP_CONFIG.currencySymbolMap[currency] || currency;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return APP_CONFIG.isDevelopment;
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return APP_CONFIG.isProduction;
}

/**
 * Get API base URL
 * @returns Supabase REST API base URL
 * @throws Error if Supabase URL is not configured
 */
export function getApiBaseUrl(): string {
  if (!APP_CONFIG.supabase.url) {
    throw new Error(
      'Supabase URL is not configured. Please set VITE_SUPABASE_URL in your .env file.'
    );
  }
  return `${APP_CONFIG.supabase.url}/rest/v1`;
}

/**
 * Get storage URL
 * @returns Supabase Storage API base URL
 * @throws Error if Supabase URL is not configured
 */
export function getStorageUrl(): string {
  if (!APP_CONFIG.supabase.url) {
    throw new Error(
      'Supabase URL is not configured. Please set VITE_SUPABASE_URL in your .env file.'
    );
  }
  return `${APP_CONFIG.supabase.url}/storage/v1`;
}

/**
 * Type-safe config access
 */
export type AppConfig = typeof APP_CONFIG;
