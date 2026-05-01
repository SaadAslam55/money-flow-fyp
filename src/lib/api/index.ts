/**
 * API Library Index
 * Central export point for all API-related modules
 */

// API Client
export { default as api, edgeApi } from './client';
export type { ApiConfig, ApiResponse, ApiError, RequestOptions } from './client';

// API Router
export { apiRouter } from './router';

// Feature Flags
export {
  useFeatureFlags,
  syncFeatureFlags,
  initFeatureFlags,
  getFlag,
  isFeatureEnabled,
} from './feature-flags';
export type { FeatureFlags } from './feature-flags';

// Query Client
export {
  queryClient,
  invalidateEntity,
  prefetchQuery,
  setQueryData,
  getQueryData,
  cancelQueries,
  resetQueries,
} from './query-client';

// Query Keys
export { queryKeys } from './query-keys';
