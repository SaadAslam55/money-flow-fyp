/**
 * Cache Control Interceptor
 * Sets HTTP cache headers for responses
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

// ============================================
// Types
// ============================================

interface CacheControlOptions {
  public?: boolean;
  private?: boolean;
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  staleIfError?: number;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
}

// ============================================
// Route-specific Cache Configurations
// ============================================

const routeCacheConfig: Record<string, CacheControlOptions> = {
  // Static/reference data - cache longer
  'GET /api/v1/settings': { public: true, maxAge: 3600, sMaxAge: 7200 },
  'GET /api/v1/expense-categories': { public: true, maxAge: 3600, sMaxAge: 7200 },
  'GET /api/v1/products/categories': { public: true, maxAge: 1800, sMaxAge: 3600 },

  // Dynamic but relatively stable - moderate caching
  'GET /api/v1/products': { private: true, maxAge: 300, staleWhileRevalidate: 60 },
  'GET /api/v1/customers': { private: true, maxAge: 180, staleWhileRevalidate: 30 },
  'GET /api/v1/products/:id': { private: true, maxAge: 600, staleWhileRevalidate: 120 },
  'GET /api/v1/customers/:id': { private: true, maxAge: 300, staleWhileRevalidate: 60 },

  // Frequently changing - short cache
  'GET /api/v1/invoices': { private: true, maxAge: 60, staleWhileRevalidate: 30 },
  'GET /api/v1/transactions': { private: true, maxAge: 60, staleWhileRevalidate: 30 },
  'GET /api/v1/invoices/:id': { private: true, maxAge: 120, staleWhileRevalidate: 60 },

  // Dashboard/reports - very short or no cache
  'GET /api/v1/dashboard': { private: true, maxAge: 30, staleWhileRevalidate: 15 },
  'GET /api/v1/dashboard/stats': { private: true, maxAge: 60 },
  'GET /api/v1/reports': { private: true, noCache: true },
  'GET /api/v1/reports/:type': { private: true, noCache: true },

  // Health/status endpoints
  'GET /health': { noStore: true },
  'GET /api/v1/health': { noStore: true },
};

// ============================================
// Interceptor
// ============================================

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        // Only set cache headers for GET requests
        if (request.method !== 'GET') {
          response.setHeader('Cache-Control', 'no-store');
          return;
        }

        // Get route path
        const routePath = request.route?.path || request.path;
        const routeKey = `${request.method} ${routePath}`;

        // Get config for this route or use default
        const options = this.getConfigForRoute(routeKey) || {
          private: true,
          maxAge: 60,
        };

        // Set Cache-Control header
        response.setHeader('Cache-Control', this.buildHeader(options));

        // Set Vary header for proper caching
        response.setHeader('Vary', 'Authorization, Accept-Encoding');

        // Add ETag if not already set
        if (!response.getHeader('ETag')) {
          const etag = this.generateETag(routePath);
          response.setHeader('ETag', `W/"${etag}"`);
        }
      })
    );
  }

  /**
   * Get cache config for a route, checking patterns
   */
  private getConfigForRoute(routeKey: string): CacheControlOptions | null {
    // Exact match first
    if (routeCacheConfig[routeKey]) {
      return routeCacheConfig[routeKey];
    }

    // Check pattern matches (replace :param with wildcard)
    for (const [pattern, config] of Object.entries(routeCacheConfig)) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      if (regex.test(routeKey)) {
        return config;
      }
    }

    return null;
  }

  /**
   * Build Cache-Control header value
   */
  private buildHeader(options: CacheControlOptions): string {
    const parts: string[] = [];

    if (options.noStore) {
      return 'no-store';
    }

    if (options.noCache) {
      parts.push('no-cache');
    }

    if (options.public) {
      parts.push('public');
    } else if (options.private) {
      parts.push('private');
    }

    if (options.maxAge !== undefined) {
      parts.push(`max-age=${options.maxAge}`);
    }

    if (options.sMaxAge !== undefined) {
      parts.push(`s-maxage=${options.sMaxAge}`);
    }

    if (options.staleWhileRevalidate !== undefined) {
      parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }

    if (options.staleIfError !== undefined) {
      parts.push(`stale-if-error=${options.staleIfError}`);
    }

    if (options.mustRevalidate) {
      parts.push('must-revalidate');
    }

    return parts.join(', ') || 'no-cache';
  }

  /**
   * Generate simple ETag
   */
  private generateETag(path: string): string {
    const timestamp = Math.floor(Date.now() / 60000); // Minute granularity
    const hash = Buffer.from(`${path}-${timestamp}`).toString('base64').slice(0, 16);
    return hash;
  }
}
