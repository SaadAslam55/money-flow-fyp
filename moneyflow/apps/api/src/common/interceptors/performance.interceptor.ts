/**
 * Performance Interceptor
 * Tracks request timing and logs slow requests
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response, Request } from 'express';
import { RedisService } from '../../database/redis/redis.service';

// ============================================
// Types
// ============================================

interface RequestMetrics {
  route: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  userAgent?: string;
  ip?: string;
}

// ============================================
// Configuration
// ============================================

const SLOW_REQUEST_THRESHOLD = 1000; // 1 second
const METRICS_TTL = 86400 * 7; // 7 days

// ============================================
// Interceptor
// ============================================

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  constructor(private redis: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // Generate request ID if not present
    const requestId = (request.headers['x-request-id'] as string) || this.generateRequestId();

    // Set request ID header
    response.setHeader('X-Request-ID', requestId);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.handleResponse(request, response, duration, requestId);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.handleResponse(request, response, duration, requestId, error);
        },
      })
    );
  }

  /**
   * Handle response timing and logging
   */
  private handleResponse(
    request: Request,
    response: Response,
    duration: number,
    requestId: string,
    error?: Error
  ): void {
    const statusCode = error ? 500 : response.statusCode;
    const route = request.route?.path || request.path;
    const method = request.method;

    // Set timing header
    response.setHeader('X-Response-Time', `${duration}ms`);

    // Log slow requests
    if (duration > SLOW_REQUEST_THRESHOLD) {
      this.logger.warn(`Slow request: ${method} ${route} - ${duration}ms [${requestId}]`);
    }

    // Record metrics
    this.recordMetrics({
      route: `${method}:${route}`,
      method,
      duration,
      status: statusCode,
      timestamp: Date.now(),
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    });

    // Log errors
    if (error) {
      this.logger.error(`Request error: ${method} ${route} - ${error.message} [${requestId}]`);
    }
  }

  /**
   * Record metrics to Redis
   */
  private async recordMetrics(metrics: RequestMetrics): Promise<void> {
    try {
      const dateKey = new Date().toISOString().split('T')[0];
      const key = `metrics:${dateKey}`;

      // Store as JSON in a list
      const metricsJson = JSON.stringify(metrics);

      // Note: Since we're using Upstash REST API, lpush needs to be implemented
      // For now, we'll use a simple set with a unique key
      const metricsKey = `${key}:${metrics.timestamp}:${Math.random().toString(36).slice(2, 8)}`;
      await this.redis.set(metricsKey, metrics, METRICS_TTL);
    } catch (error) {
      // Don't let metrics recording fail the request
      this.logger.debug(`Failed to record metrics: ${error}`);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 11);
    return `${timestamp}-${random}`;
  }
}
