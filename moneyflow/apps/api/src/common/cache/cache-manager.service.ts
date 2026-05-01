/**
 * Cache Manager Service
 * High-level caching operations with tag-based invalidation
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../database/redis/redis.service';

// ============================================
// Types
// ============================================

interface CacheOptions {
  ttl?: number; // TTL in seconds
  tags?: string[]; // Tags for invalidation
  orgId?: string; // Organization ID for multi-tenant isolation
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
}

// ============================================
// Cache Manager Service
// ============================================

@Injectable()
export class CacheManagerService {
  private readonly logger = new Logger(CacheManagerService.name);
  private readonly defaultTtl = 300; // 5 minutes

  // Track cache hits/misses for monitoring
  private hits = 0;
  private misses = 0;

  constructor(private redis: RedisService) {}

  // ============================================
  // Key Building
  // ============================================

  private buildKey(namespace: string, key: string, orgId?: string): string {
    if (orgId) {
      return `cache:${orgId}:${namespace}:${key}`;
    }
    return `cache:${namespace}:${key}`;
  }

  // ============================================
  // Core Operations
  // ============================================

  /**
   * Get cached value
   */
  async get<T>(namespace: string, key: string, orgId?: string): Promise<T | null> {
    const cacheKey = this.buildKey(namespace, key, orgId);
    const cached = await this.redis.get<CachedData<T>>(cacheKey);

    if (!cached) {
      this.misses++;
      return null;
    }

    const age = Math.floor((Date.now() - cached.timestamp) / 1000);

    // Check if expired
    if (age > cached.ttl) {
      this.misses++;
      return null;
    }

    this.hits++;
    return cached.data;
  }

  /**
   * Set cached value
   */
  async set<T>(namespace: string, key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = this.defaultTtl, tags = [], orgId } = options;
    const cacheKey = this.buildKey(namespace, key, orgId);

    const cachedData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    };

    await this.redis.set(cacheKey, cachedData, ttl + 60); // Extra buffer

    // Store tag associations for invalidation
    for (const tag of tags) {
      const tagKey = orgId ? `tags:${orgId}:${tag}` : `tags:${tag}`;
      await this.addToTagSet(tagKey, cacheKey);
    }
  }

  /**
   * Delete cached value
   */
  async invalidate(namespace: string, key: string, orgId?: string): Promise<void> {
    const cacheKey = this.buildKey(namespace, key, orgId);
    await this.redis.del(cacheKey);
    this.logger.debug(`Invalidated cache: ${cacheKey}`);
  }

  // ============================================
  // Tag-based Invalidation
  // ============================================

  /**
   * Add key to tag set
   */
  private async addToTagSet(tagKey: string, cacheKey: string): Promise<void> {
    const existing = await this.redis.get<string[]>(tagKey);
    const keys = existing || [];

    if (!keys.includes(cacheKey)) {
      keys.push(cacheKey);
      await this.redis.set(tagKey, keys, 86400); // 24 hour TTL for tag sets
    }
  }

  /**
   * Invalidate all keys with a specific tag
   */
  async invalidateByTag(tag: string, orgId?: string): Promise<number> {
    const tagKey = orgId ? `tags:${orgId}:${tag}` : `tags:${tag}`;
    const keys = await this.redis.get<string[]>(tagKey);

    if (!keys || keys.length === 0) {
      return 0;
    }

    let deleted = 0;
    for (const key of keys) {
      const success = await this.redis.del(key);
      if (success) deleted++;
    }

    await this.redis.del(tagKey);
    this.logger.debug(`Invalidated ${deleted} keys for tag: ${tag}`);

    return deleted;
  }

  /**
   * Invalidate all keys in a namespace
   */
  async invalidateNamespace(namespace: string, orgId?: string): Promise<void> {
    // Since Upstash doesn't support SCAN, we track this at the application level
    this.logger.debug(`Namespace invalidation requested: ${namespace} (org: ${orgId || 'all'})`);
    // In production, consider maintaining a namespace registry
  }

  /**
   * Invalidate all cache for an organization
   */
  async invalidateOrganization(orgId: string): Promise<void> {
    this.logger.debug(`Organization cache invalidation requested: ${orgId}`);
    // In production, maintain an org key registry
  }

  // ============================================
  // Cache-Aside Pattern
  // ============================================

  /**
   * Get from cache or fetch and cache
   */
  async getOrSet<T>(
    namespace: string,
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { orgId } = options;

    // Try cache first
    const cached = await this.get<T>(namespace, key, orgId);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Cache the result
    await this.set(namespace, key, data, options);

    return data;
  }

  /**
   * Get from cache or fetch, with stale-while-revalidate
   */
  async getOrSetWithSWR<T>(
    namespace: string,
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions & { staleTime?: number } = {}
  ): Promise<T> {
    const { orgId, staleTime = 60 } = options;
    const cacheKey = this.buildKey(namespace, key, orgId);

    const cached = await this.redis.get<CachedData<T>>(cacheKey);

    if (cached) {
      const age = Math.floor((Date.now() - cached.timestamp) / 1000);
      const isStale = age > cached.ttl;
      const withinStaleWindow = age <= cached.ttl + staleTime;

      if (!isStale) {
        // Fresh data
        this.hits++;
        return cached.data;
      }

      if (withinStaleWindow) {
        // Return stale data, revalidate in background
        this.hits++;
        this.revalidateInBackground(namespace, key, fetcher, options);
        return cached.data;
      }
    }

    // Cache miss or too stale
    this.misses++;
    const data = await fetcher();
    await this.set(namespace, key, data, options);
    return data;
  }

  /**
   * Revalidate cache in background
   */
  private async revalidateInBackground<T>(
    namespace: string,
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<void> {
    // Don't await - run in background
    fetcher()
      .then((data) => this.set(namespace, key, data, options))
      .catch((err) => this.logger.warn(`Background revalidation failed: ${err.message}`));
  }

  // ============================================
  // Monitoring
  // ============================================

  /**
   * Get cache statistics
   */
  getStats(): { hits: number; misses: number; hitRate: string } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(2) + '%' : '0%';

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return this.redis.healthCheck();
  }
}
