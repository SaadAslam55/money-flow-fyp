/**
 * Admin Module
 * Admin-only endpoints for monitoring and management
 */

import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { RedisModule } from '../../database/redis/redis.module';
import { CacheModule } from '../../common/cache/cache.module';

@Module({
  imports: [RedisModule, CacheModule],
  controllers: [MetricsController],
  providers: [],
  exports: [],
})
export class AdminModule {}
