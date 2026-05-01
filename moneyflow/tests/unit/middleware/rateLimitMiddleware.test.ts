// tests/unit/middleware/rateLimitMiddleware.test.ts
/**
 * Rate Limit Middleware Tests - Phase 8: Testing & Quality Assurance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  clearRateLimit,
  clearAllRateLimits,
  getRateLimitStatus,
  RateLimitError,
} from '@/middleware/rateLimitMiddleware';

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const key = `test-key-${Date.now()}-1`;
      const result = checkRateLimit(key, 'default');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99); // 100 - 1
    });

    it('should track request count', () => {
      const key = `test-key-${Date.now()}-2`;
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 'default');
      }
      const status = getRateLimitStatus(key, 'default');
      expect(status.count).toBe(5);
      expect(status.remaining).toBe(95);
    });

    it('should block after limit exceeded', () => {
      const key = `auth-key-${Date.now()}-3`;
      // Use auth config which has lower limit (5 requests)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 'auth');
      }

      const result = checkRateLimit(key, 'auth');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should use different limits for different configs', () => {
      // Use unique keys to avoid any state issues
      const uniqueId = Date.now().toString();
      
      // Default: 100 requests
      const defaultResult = checkRateLimit(`default-key-${uniqueId}`, 'default');
      expect(defaultResult.remaining).toBe(99);

      // Auth: 5 requests
      const authResult = checkRateLimit(`auth-key-${uniqueId}`, 'auth');
      expect(authResult.remaining).toBe(4);

      // API: 60 requests
      const apiResult = checkRateLimit(`api-key-${uniqueId}`, 'api');
      expect(apiResult.remaining).toBe(59);
    });

    it('should track different keys separately', () => {
      const id = Date.now();
      const key1 = `key-1-${id}`;
      const key2 = `key-2-${id}`;
      
      checkRateLimit(key1, 'default');
      checkRateLimit(key1, 'default');
      checkRateLimit(key2, 'default');

      const status1 = getRateLimitStatus(key1, 'default');
      const status2 = getRateLimitStatus(key2, 'default');

      expect(status1.count).toBe(2);
      expect(status2.count).toBe(1);
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit for specific key', () => {
      const key = `test-key-clear-${Date.now()}`;
      checkRateLimit(key, 'default');
      checkRateLimit(key, 'default');

      clearRateLimit(key);

      const status = getRateLimitStatus(key, 'default');
      expect(status.count).toBe(0);
    });

    it('should not affect other keys', () => {
      const id = Date.now();
      const key1 = `key-clear-1-${id}`;
      const key2 = `key-clear-2-${id}`;
      
      checkRateLimit(key1, 'default');
      checkRateLimit(key2, 'default');

      clearRateLimit(key1);

      const status1 = getRateLimitStatus(key1, 'default');
      const status2 = getRateLimitStatus(key2, 'default');

      expect(status1.count).toBe(0);
      expect(status2.count).toBe(1);
    });
  });

  describe('clearAllRateLimits', () => {
    it('should clear all rate limits', () => {
      const id = Date.now();
      const key1 = `key-all-1-${id}`;
      const key2 = `key-all-2-${id}`;
      const key3 = `key-all-3-${id}`;
      
      checkRateLimit(key1, 'default');
      checkRateLimit(key2, 'default');
      checkRateLimit(key3, 'auth');

      clearAllRateLimits();

      expect(getRateLimitStatus(key1, 'default').count).toBe(0);
      expect(getRateLimitStatus(key2, 'default').count).toBe(0);
      expect(getRateLimitStatus(key3, 'auth').count).toBe(0);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return zero count for new keys', () => {
      const key = `new-key-${Date.now()}`;
      const status = getRateLimitStatus(key, 'default');
      expect(status.count).toBe(0);
      expect(status.remaining).toBe(100);
      expect(status.blocked).toBe(false);
    });

    it('should return correct remaining count', () => {
      const key = `test-key-remaining-${Date.now()}`;
      for (let i = 0; i < 10; i++) {
        checkRateLimit(key, 'default');
      }

      const status = getRateLimitStatus(key, 'default');
      expect(status.remaining).toBe(90);
    });
  });

  describe('RateLimitError', () => {
    it('should have correct properties', () => {
      const error = new RateLimitError('Test error', 5000);

      expect(error.name).toBe('RateLimitError');
      expect(error.message).toBe('Test error');
      expect(error.resetIn).toBe(5000);
    });

    it('should be instanceof Error', () => {
      const error = new RateLimitError('Test', 1000);
      expect(error instanceof Error).toBe(true);
      expect(error instanceof RateLimitError).toBe(true);
    });
  });
});
