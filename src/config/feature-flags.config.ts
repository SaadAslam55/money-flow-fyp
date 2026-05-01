/**
 * Feature Flags Configuration
 * Centralized feature flag management with runtime toggles
 */

import { ENV_CONFIG } from './env.config';
import { APP_CONFIG } from './app.config';

/**
 * Feature flag definition
 */
export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  enabledByDefault?: boolean;
  category: 'core' | 'premium' | 'experimental' | 'integration' | 'ui';
  requiresRestart?: boolean;
  dependencies?: string[]; // Other feature flags that must be enabled
  metadata?: Record<string, unknown>;
}

/**
 * Feature flag categories
 */
export const FEATURE_CATEGORIES = {
  CORE: 'core',
  PREMIUM: 'premium',
  EXPERIMENTAL: 'experimental',
  INTEGRATION: 'integration',
  UI: 'ui',
} as const;

/**
 * Feature flag keys - Single source of truth
 */
export const FEATURE_KEYS = {
  // Core Features
  INVENTORY: 'inventory',
  MULTI_CURRENCY: 'multiCurrency',
  MULTI_BRANCH: 'multiBranch',
  SUBSCRIPTIONS: 'subscriptions',
  CUSTOMER_PORTAL: 'customerPortal',

  // Integrations
  WHATSAPP_INTEGRATION: 'whatsappIntegration',
  EMAIL_INTEGRATION: 'emailIntegration',
  STRIPE_PAYMENTS: 'stripePayments',

  // Reports
  REPORTS: 'reports',
  ADVANCED_REPORTS: 'advancedReports',
  CUSTOM_REPORTS: 'customReports',
  SCHEDULED_REPORTS: 'scheduledReports',

  // UI Features
  DARK_MODE: 'darkMode',
  MULTI_LANGUAGE: 'multiLanguage',
  CUSTOM_THEMES: 'customThemes',

  // Experimental
  AI_ASSISTANT: 'aiAssistant',
  VOICE_COMMANDS: 'voiceCommands',
  MOBILE_APP: 'mobileApp',
} as const;

/**
 * Feature flags configuration
 */
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Core Features
  [FEATURE_KEYS.INVENTORY]: {
    key: FEATURE_KEYS.INVENTORY,
    name: 'Inventory Management',
    description: 'Track and manage product inventory',
    enabled: ENV_CONFIG.features.inventory || APP_CONFIG.features.inventory,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.CORE,
    requiresRestart: false,
  },

  [FEATURE_KEYS.MULTI_CURRENCY]: {
    key: FEATURE_KEYS.MULTI_CURRENCY,
    name: 'Multi-Currency',
    description: 'Support for multiple currencies',
    enabled: ENV_CONFIG.features.multiCurrency || APP_CONFIG.features.multiCurrency,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.CORE,
    requiresRestart: false,
  },

  [FEATURE_KEYS.MULTI_BRANCH]: {
    key: FEATURE_KEYS.MULTI_BRANCH,
    name: 'Multi-Branch',
    description: 'Manage multiple business branches',
    enabled: ENV_CONFIG.features.multiBranch || APP_CONFIG.features.multiBranch,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.CORE,
    requiresRestart: false,
  },

  [FEATURE_KEYS.SUBSCRIPTIONS]: {
    key: FEATURE_KEYS.SUBSCRIPTIONS,
    name: 'Subscriptions',
    description: 'Subscription billing and management',
    enabled: APP_CONFIG.features.subscriptions ?? true,
    enabledByDefault: true,
    category: FEATURE_CATEGORIES.CORE,
    requiresRestart: false,
  },

  [FEATURE_KEYS.CUSTOMER_PORTAL]: {
    key: FEATURE_KEYS.CUSTOMER_PORTAL,
    name: 'Customer Portal',
    description: 'Self-service portal for customers',
    enabled: APP_CONFIG.features.customerPortal ?? true,
    enabledByDefault: true,
    category: FEATURE_CATEGORIES.CORE,
    requiresRestart: false,
  },

  // Integrations
  [FEATURE_KEYS.WHATSAPP_INTEGRATION]: {
    key: FEATURE_KEYS.WHATSAPP_INTEGRATION,
    name: 'WhatsApp Integration',
    description: 'Send invoices and notifications via WhatsApp',
    enabled: APP_CONFIG.features.whatsappIntegration ?? false,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.INTEGRATION,
    requiresRestart: false,
    dependencies: [FEATURE_KEYS.EMAIL_INTEGRATION],
  },

  [FEATURE_KEYS.EMAIL_INTEGRATION]: {
    key: FEATURE_KEYS.EMAIL_INTEGRATION,
    name: 'Email Integration',
    description: 'Send invoices and notifications via email',
    enabled: APP_CONFIG.features.emailIntegration ?? true,
    enabledByDefault: true,
    category: FEATURE_CATEGORIES.INTEGRATION,
    requiresRestart: false,
  },

  [FEATURE_KEYS.STRIPE_PAYMENTS]: {
    key: FEATURE_KEYS.STRIPE_PAYMENTS,
    name: 'Stripe Payments',
    description: 'Accept payments via Stripe',
    enabled: !!ENV_CONFIG.stripe.publicKey,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.INTEGRATION,
    requiresRestart: true,
  },

  // Reports
  [FEATURE_KEYS.REPORTS]: {
    key: FEATURE_KEYS.REPORTS,
    name: 'Reports',
    description: 'Basic reporting functionality',
    enabled: APP_CONFIG.features.reports ?? true,
    enabledByDefault: true,
    category: FEATURE_CATEGORIES.CORE,
    requiresRestart: false,
  },

  [FEATURE_KEYS.ADVANCED_REPORTS]: {
    key: FEATURE_KEYS.ADVANCED_REPORTS,
    name: 'Advanced Reports',
    description: 'Advanced reporting with custom filters and exports',
    enabled: APP_CONFIG.features.advancedReports ?? false,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.PREMIUM,
    requiresRestart: false,
    dependencies: [FEATURE_KEYS.REPORTS],
  },

  [FEATURE_KEYS.CUSTOM_REPORTS]: {
    key: FEATURE_KEYS.CUSTOM_REPORTS,
    name: 'Custom Reports',
    description: 'Build custom reports with drag-and-drop builder',
    enabled: false,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.PREMIUM,
    requiresRestart: false,
    dependencies: [FEATURE_KEYS.ADVANCED_REPORTS],
  },

  [FEATURE_KEYS.SCHEDULED_REPORTS]: {
    key: FEATURE_KEYS.SCHEDULED_REPORTS,
    name: 'Scheduled Reports',
    description: 'Automatically generate and email reports on schedule',
    enabled: false,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.PREMIUM,
    requiresRestart: false,
    dependencies: [FEATURE_KEYS.REPORTS, FEATURE_KEYS.EMAIL_INTEGRATION],
  },

  // UI Features
  [FEATURE_KEYS.DARK_MODE]: {
    key: FEATURE_KEYS.DARK_MODE,
    name: 'Dark Mode',
    description: 'Dark theme support',
    enabled: true,
    enabledByDefault: true,
    category: FEATURE_CATEGORIES.UI,
    requiresRestart: false,
  },

  [FEATURE_KEYS.MULTI_LANGUAGE]: {
    key: FEATURE_KEYS.MULTI_LANGUAGE,
    name: 'Multi-Language',
    description: 'Support for multiple languages',
    enabled: false,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.UI,
    requiresRestart: false,
  },

  [FEATURE_KEYS.CUSTOM_THEMES]: {
    key: FEATURE_KEYS.CUSTOM_THEMES,
    name: 'Custom Themes',
    description: 'Allow users to customize theme colors',
    enabled: false,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.UI,
    requiresRestart: false,
  },

  // Experimental Features
  [FEATURE_KEYS.AI_ASSISTANT]: {
    key: FEATURE_KEYS.AI_ASSISTANT,
    name: 'AI Assistant',
    description: 'AI-powered assistant for business insights',
    enabled: false,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.EXPERIMENTAL,
    requiresRestart: false,
  },

  [FEATURE_KEYS.VOICE_COMMANDS]: {
    key: FEATURE_KEYS.VOICE_COMMANDS,
    name: 'Voice Commands',
    description: 'Control the app using voice commands',
    enabled: false,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.EXPERIMENTAL,
    requiresRestart: false,
  },

  [FEATURE_KEYS.MOBILE_APP]: {
    key: FEATURE_KEYS.MOBILE_APP,
    name: 'Mobile App',
    description: 'Native mobile app support',
    enabled: false,
    enabledByDefault: false,
    category: FEATURE_CATEGORIES.EXPERIMENTAL,
    requiresRestart: false,
  },
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(key: string): boolean {
  const flag = FEATURE_FLAGS[key];
  if (!flag) {
    return false;
  }

  // Check dependencies
  if (flag.dependencies) {
    for (const dep of flag.dependencies) {
      if (!isFeatureEnabled(dep)) {
        return false;
      }
    }
  }

  return flag.enabled;
}

/**
 * Get feature flag by key
 */
export function getFeatureFlag(key: string): FeatureFlag | undefined {
  return FEATURE_FLAGS[key];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter((flag) => isFeatureEnabled(flag.key));
}

/**
 * Get all disabled features
 */
export function getDisabledFeatures(): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter((flag) => !isFeatureEnabled(flag.key));
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(category: string): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter((flag) => flag.category === category);
}

/**
 * Get core features
 */
export function getCoreFeatures(): FeatureFlag[] {
  return getFeaturesByCategory(FEATURE_CATEGORIES.CORE);
}

/**
 * Get premium features
 */
export function getPremiumFeatures(): FeatureFlag[] {
  return getFeaturesByCategory(FEATURE_CATEGORIES.PREMIUM);
}

/**
 * Get experimental features
 */
export function getExperimentalFeatures(): FeatureFlag[] {
  return getFeaturesByCategory(FEATURE_CATEGORIES.EXPERIMENTAL);
}

/**
 * Check if all dependencies are met for a feature
 */
export function areDependenciesMet(key: string): boolean {
  const flag = FEATURE_FLAGS[key];
  if (!flag?.dependencies) {
    return true;
  }

  return flag.dependencies.every((dep) => isFeatureEnabled(dep));
}

/**
 * Get feature flag status summary
 */
export function getFeatureFlagSummary(): {
  total: number;
  enabled: number;
  disabled: number;
  byCategory: Record<string, number>;
} {
  const flags = Object.values(FEATURE_FLAGS);
  const enabled = flags.filter((flag) => isFeatureEnabled(flag.key)).length;
  const byCategory: Record<string, number> = {};

  for (const flag of flags) {
    byCategory[flag.category] = (byCategory[flag.category] || 0) + 1;
  }

  return {
    total: flags.length,
    enabled,
    disabled: flags.length - enabled,
    byCategory,
  };
}

/**
 * Type-safe feature flags
 */
export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
export type FeatureFlagsType = typeof FEATURE_FLAGS;

