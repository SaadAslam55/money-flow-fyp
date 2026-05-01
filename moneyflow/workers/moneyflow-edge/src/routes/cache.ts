/**
 * Cache Management Routes
 * Admin endpoints for cache operations
 */

import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../middleware/auth';
import { invalidateCache, invalidateOrgCache, invalidateEntityCache } from '../middleware/cache';
import type { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// Require authentication for all cache routes
app.use('*', authMiddleware);

// ============================================
// Invalidate by Pattern
// ============================================

app.post('/invalidate', requireRole('admin', 'super_admin'), async (c) => {
  const user = c.get('user');
  const { pattern, entity } = await c.req.json<{ pattern?: string; entity?: string }>();

  if (!pattern && !entity) {
    return c.json({ error: 'Pattern or entity required' }, 400);
  }

  let deleted = 0;

  if (entity) {
    // Invalidate specific entity cache
    deleted = await invalidateEntityCache(c.env.CACHE, user.organizationId, entity);
  } else if (pattern) {
    // Invalidate by pattern (scoped to organization)
    const scopedPattern = `${user.organizationId}:${pattern}`;
    deleted = await invalidateCache(c.env.CACHE, scopedPattern);
  }

  return c.json({
    success: true,
    deleted,
    message: `Invalidated ${deleted} cache entries`,
  });
});

// ============================================
// Clear Organization Cache
// ============================================

app.post('/clear', requireRole('admin', 'super_admin'), async (c) => {
  const user = c.get('user');

  const deleted = await invalidateOrgCache(c.env.CACHE, user.organizationId);

  return c.json({
    success: true,
    deleted,
    message: `Cleared ${deleted} cache entries for organization`,
  });
});

// ============================================
// Cache Stats
// ============================================

app.get('/stats', async (c) => {
  const user = c.get('user');

  try {
    const prefix = `cache:${user.organizationId}:`;
    const list = await c.env.CACHE.list({ prefix, limit: 1000 });

    // Group by entity
    const byEntity: Record<string, number> = {};
    for (const key of list.keys) {
      const parts = key.name.replace(prefix, '').split(':');
      const entity = parts[0] || 'other';
      byEntity[entity] = (byEntity[entity] || 0) + 1;
    }

    return c.json({
      success: true,
      stats: {
        totalKeys: list.keys.length,
        byEntity,
        hasMore: !list.list_complete,
      },
    });
  } catch (error) {
    return c.json({ error: 'Failed to get cache stats' }, 500);
  }
});

// ============================================
// Get Cache Key
// ============================================

app.get('/key/:key', requireRole('admin', 'super_admin'), async (c) => {
  const user = c.get('user');
  const key = c.req.param('key');

  // Ensure key is scoped to organization
  const fullKey = key.startsWith('cache:') ? key : `cache:${user.organizationId}:${key}`;

  // Security: Ensure user can only access their org's cache
  if (!fullKey.includes(user.organizationId)) {
    return c.json({ error: 'Access denied' }, 403);
  }

  try {
    const value = await c.env.CACHE.get(fullKey, { type: 'json' });

    if (!value) {
      return c.json({ error: 'Key not found' }, 404);
    }

    return c.json({
      key: fullKey,
      value,
    });
  } catch (error) {
    return c.json({ error: 'Failed to get cache key' }, 500);
  }
});

// ============================================
// Delete Cache Key
// ============================================

app.delete('/key/:key', requireRole('admin', 'super_admin'), async (c) => {
  const user = c.get('user');
  const key = c.req.param('key');

  const fullKey = key.startsWith('cache:') ? key : `cache:${user.organizationId}:${key}`;

  if (!fullKey.includes(user.organizationId)) {
    return c.json({ error: 'Access denied' }, 403);
  }

  await c.env.CACHE.delete(fullKey);

  return c.json({
    success: true,
    deleted: fullKey,
  });
});

// ============================================
// Warm Cache
// ============================================

app.post('/warm', requireRole('admin', 'super_admin'), async (c) => {
  const { endpoints } = await c.req.json<{ endpoints: string[] }>();

  if (!endpoints?.length) {
    return c.json({ error: 'Endpoints array required' }, 400);
  }

  const results: Record<string, boolean> = {};

  // Warm each endpoint
  for (const endpoint of endpoints.slice(0, 10)) {
    // Limit to 10
    try {
      const response = await fetch(`${c.env.API_ORIGIN}${endpoint}`, {
        headers: {
          Authorization: c.req.header('Authorization') || '',
          'X-Cache-Warm': 'true',
        },
      });
      results[endpoint] = response.ok;
    } catch {
      results[endpoint] = false;
    }
  }

  return c.json({
    success: true,
    results,
  });
});

export default app;
