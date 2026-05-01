/**
 * Metrics Controller
 * Admin endpoints for performance monitoring
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RedisService } from '../../database/redis/redis.service';
import { CacheManagerService } from '../../common/cache/cache-manager.service';
import { QueryAnalyzerService } from '../../database/tidb/query-analyzer.service';

// ============================================
// Types
// ============================================

interface MetricEntry {
  route: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

interface RouteMetrics {
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  errors: number;
  errorRate: string;
}

// ============================================
// Controller
// ============================================

@ApiTags('Admin - Metrics')
@ApiBearerAuth()
@Controller('admin/metrics')
export class MetricsController {
  constructor(
    private redis: RedisService,
    private cache: CacheManagerService,
    private queryAnalyzer: QueryAnalyzerService
  ) {}

  // ============================================
  // Request Metrics
  // ============================================

  @Get('summary')
  @ApiOperation({ summary: 'Get request metrics summary' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to look back',
  })
  async getSummary(@Query('days') days: number = 7) {
    const metrics: MetricEntry[] = [];

    // Collect metrics from Redis (simplified - in production use SCAN)
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Note: This is a simplified approach
      // In production, use a more efficient pattern
      const dayMetrics = await this.redis.get<MetricEntry[]>(`metrics:${dateStr}:summary`);
      if (dayMetrics) {
        metrics.push(...dayMetrics);
      }
    }

    // Aggregate by route
    const byRoute = this.aggregateByRoute(metrics);

    // Calculate totals
    const totalRequests = metrics.length;
    const totalErrors = metrics.filter((m) => m.status >= 500).length;
    const avgDuration =
      metrics.length > 0
        ? Math.round(metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length)
        : 0;

    return {
      summary: {
        totalRequests,
        totalErrors,
        errorRate:
          totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) + '%' : '0%',
        avgDuration: `${avgDuration}ms`,
      },
      byRoute,
      period: `${days} days`,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Aggregate metrics by route
   */
  private aggregateByRoute(metrics: MetricEntry[]): Record<string, RouteMetrics> {
    const byRoute: Record<string, RouteMetrics> = {};

    for (const m of metrics) {
      if (!byRoute[m.route]) {
        byRoute[m.route] = {
          count: 0,
          totalDuration: 0,
          avgDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
          errors: 0,
          errorRate: '0%',
        };
      }

      const route = byRoute[m.route];
      route.count++;
      route.totalDuration += m.duration;
      route.minDuration = Math.min(route.minDuration, m.duration);
      route.maxDuration = Math.max(route.maxDuration, m.duration);

      if (m.status >= 500) {
        route.errors++;
      }
    }

    // Calculate averages and rates
    for (const routeKey of Object.keys(byRoute)) {
      const route = byRoute[routeKey];
      route.avgDuration = Math.round(route.totalDuration / route.count);
      route.errorRate = ((route.errors / route.count) * 100).toFixed(2) + '%';

      if (route.minDuration === Infinity) {
        route.minDuration = 0;
      }
    }

    return byRoute;
  }

  // ============================================
  // Cache Stats
  // ============================================

  @Get('cache')
  @ApiOperation({ summary: 'Get cache statistics' })
  async getCacheStats() {
    const stats = this.cache.getStats();
    const healthy = await this.cache.healthCheck();

    return {
      ...stats,
      healthy,
      generatedAt: new Date().toISOString(),
    };
  }

  // ============================================
  // Database Stats
  // ============================================

  @Get('database')
  @ApiOperation({ summary: 'Get database statistics' })
  async getDatabaseStats() {
    const [tableStats, runningQueries] = await Promise.all([
      this.queryAnalyzer.getAllTableStats(),
      this.queryAnalyzer.getRunningQueries(),
    ]);

    return {
      tables: tableStats,
      activeQueries: runningQueries.length,
      runningQueries: runningQueries.slice(0, 10), // Limit to 10
      generatedAt: new Date().toISOString(),
    };
  }

  // ============================================
  // Slow Queries
  // ============================================

  @Get('slow-queries')
  @ApiOperation({ summary: 'Get slow queries' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSlowQueries(@Query('limit') limit: number = 10) {
    const slowQueries = await this.queryAnalyzer.getSlowQueries(limit);

    return {
      queries: slowQueries,
      count: slowQueries.length,
      generatedAt: new Date().toISOString(),
    };
  }

  // ============================================
  // Optimization Hints
  // ============================================

  @Get('optimization-hints')
  @ApiOperation({ summary: 'Get database optimization recommendations' })
  async getOptimizationHints() {
    const hints = await this.queryAnalyzer.getOptimizationHints();

    return {
      hints,
      count: hints.length,
      generatedAt: new Date().toISOString(),
    };
  }

  // ============================================
  // Health Overview
  // ============================================

  @Get('health')
  @ApiOperation({ summary: 'Get overall system health' })
  async getHealthOverview() {
    const [redisHealthy, cacheStats] = await Promise.all([
      this.redis.healthCheck(),
      Promise.resolve(this.cache.getStats()),
    ]);

    return {
      redis: {
        healthy: redisHealthy,
      },
      cache: {
        ...cacheStats,
        healthy: redisHealthy,
      },
      overall: redisHealthy ? 'healthy' : 'degraded',
      generatedAt: new Date().toISOString(),
    };
  }
}
