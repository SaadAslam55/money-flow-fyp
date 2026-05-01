import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:5173',

  // Rate limiting
  throttleTtl: parseInt(process.env.THROTTLE_TTL || '60', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),

  // Feature flags
  useTidb: process.env.FEATURE_USE_TIDB === 'true',
  useRedisCache: process.env.FEATURE_USE_REDIS_CACHE === 'true',
  enableDualWrite: process.env.FEATURE_DUAL_WRITE === 'true',
}));
