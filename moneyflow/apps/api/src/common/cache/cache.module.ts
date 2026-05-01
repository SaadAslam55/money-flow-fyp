/**
 * Cache Module
 * Exports caching services
 */

import { Module, Global } from '@nestjs/common';
import { CacheManagerService } from './cache-manager.service';
import { RedisModule } from '../../database/redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [CacheManagerService],
  exports: [CacheManagerService],
})
export class CacheModule {}
