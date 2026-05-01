import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  // Upstash REST API
  restUrl: process.env.UPSTASH_REDIS_REST_URL,
  restToken: process.env.UPSTASH_REDIS_REST_TOKEN,

  // Standard Redis URL (for ioredis)
  url: process.env.REDIS_URL,

  // Cache settings
  defaultTtl: parseInt(process.env.REDIS_DEFAULT_TTL || '3600', 10),
  maxMemory: process.env.REDIS_MAX_MEMORY || '100mb',
}));
