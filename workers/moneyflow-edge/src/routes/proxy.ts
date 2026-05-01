/**
 * API Proxy Routes
 * Proxies requests to origin NestJS API with auth and caching
 */

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';
import type { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// ============================================
// Middleware
// ============================================

// Apply auth to all API routes
app.use('*', authMiddleware);

// Apply caching for GET requests
app.use('*', cacheMiddleware);

// ============================================
// Main Proxy Handler
// ============================================

app.all('/*', async (c) => {
  const user = c.get('user');
  const url = new URL(c.req.url);
  const method = c.req.method;

  // Build origin URL
  const originUrl = new URL(c.env.API_ORIGIN || 'http://localhost:3001');

  // Map /api/* to origin /api/v1/*
  const path = url.pathname.replace(/^\/api/, '/api/v1');
  originUrl.pathname = path;
  originUrl.search = url.search;

  // Build headers
  const headers = new Headers();

  // Forward essential headers
  const forwardHeaders = ['Content-Type', 'Accept', 'Accept-Language', 'X-Request-ID'];

  for (const header of forwardHeaders) {
    const value = c.req.header(header);
    if (value) {
      headers.set(header, value);
    }
  }

  // Add auth context headers (for origin to use)
  headers.set('X-User-ID', user.id);
  headers.set('X-User-Email', user.email);
  headers.set('X-User-Role', user.role);
  headers.set('X-Organization-ID', user.organizationId);

  // Add forwarding headers
  headers.set('X-Forwarded-For', c.req.header('CF-Connecting-IP') || '');
  headers.set('X-Forwarded-Proto', 'https');
  headers.set('X-Forwarded-Host', url.hostname);

  // Add worker identification
  headers.set('X-Proxied-By', 'cloudflare-worker');
  headers.set('X-Worker-Region', c.req.header('CF-Ray')?.split('-')[1] || 'unknown');

  try {
    // Prepare request body for non-GET requests
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      body = await c.req.raw.clone().text();
      if (body) {
        headers.set('Content-Length', String(new TextEncoder().encode(body).length));
      }
    }

    // Make request to origin
    const startTime = Date.now();
    const response = await fetch(originUrl.toString(), {
      method,
      headers,
      body,
    });
    const latency = Date.now() - startTime;

    // Build response headers
    const responseHeaders = new Headers();

    // Forward response headers
    const copyHeaders = [
      'Content-Type',
      'X-Request-ID',
      'X-Total-Count',
      'X-Page',
      'X-Limit',
      'Link',
    ];

    for (const header of copyHeaders) {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    }

    // Add edge headers
    responseHeaders.set('X-Proxied-By', 'cloudflare-worker');
    responseHeaders.set('X-Origin-Latency', `${latency}ms`);
    responseHeaders.set('X-Origin-Status', String(response.status));

    // Handle different response types
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return c.json(data, response.status as any, Object.fromEntries(responseHeaders));
    }

    // Forward non-JSON responses as-is
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Proxy Error]', {
      error: (error as Error).message,
      origin: originUrl.toString(),
      method,
    });

    return c.json(
      {
        success: false,
        error: {
          code: 'BAD_GATEWAY',
          message: 'Unable to reach origin server',
        },
      },
      502
    );
  }
});

export default app;
