// src/config/index.ts
/**
 * Centralized configuration exports
 * Import all configuration from here for better organization
 * 
 * Usage:
 * import { APP_CONFIG, ROUTE_PATHS, THEME_CONFIG } from '@/config';
 */

// App Configuration
export {
  APP_CONFIG,
  validateConfig,
  isFeatureEnabled as isAppFeatureEnabled,
  getCurrencySymbol,
  isDevelopment,
  isProduction,
  getApiBaseUrl as getAppApiBaseUrl,
  getStorageUrl,
  type AppConfig,
} from './app.config';

// Environment Configuration
export {
  ENV_CONFIG,
  initEnvConfig,
  isFeatureEnabled as isEnvFeatureEnabled,
  getSupabaseUrl,
  getSupabaseAnonKey,
  getStripePublicKey,
  isAnalyticsEnabled,
  getApiBaseUrl as getEnvApiBaseUrl,
  type EnvConfigType,
} from './env.config';

// Routes Configuration
export {
  ROUTE_PATHS,
  ROUTE_METADATA,
  ROUTE_CATEGORIES,
  getRouteMetadata,
  getBreadcrumbs,
  isRouteProtected,
  isRoutePublic,
  getAllowedRoles,
  getNavRoutes,
  getSidebarRoutes,
  getRoutesByCategory,
  canAccessRoute,
  type RouteMetadata,
} from './routes.config';

// Theme Configuration
export {
  THEME_CONFIG,
  getThemeMode,
  setThemeMode,
  initTheme,
  getColorScheme,
  type ThemeMode,
  type ThemeConfigType,
  type ColorScheme,
  type TypographyConfig,
  type SpacingConfig,
  type BorderRadiusConfig,
  type ShadowConfig,
  type AnimationConfig,
} from './theme.config';

// Feature Flags Configuration
export {
  FEATURE_FLAGS,
  FEATURE_KEYS,
  FEATURE_CATEGORIES,
  isFeatureEnabled,
  getFeatureFlag,
  getEnabledFeatures,
  getDisabledFeatures,
  getFeaturesByCategory,
  getCoreFeatures,
  getPremiumFeatures,
  getExperimentalFeatures,
  areDependenciesMet,
  getFeatureFlagSummary,
  type FeatureFlag,
  type FeatureFlagKey,
  type FeatureFlagsType,
} from './feature-flags.config';

