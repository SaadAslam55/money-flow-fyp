/// <reference path="../deno.d.ts" />
/// <reference path="../http-server.d.ts" />
// supabase/functions/_shared/cors.ts
/**
 * CORS utility for Edge Functions
 * Handles CORS preflight and response headers
 *
 * @module EdgeFunctions/CORS
 *
 * Production-ready CORS handling with:
 * - Environment-based origin configuration
 * - Security best practices
 * - Proper preflight handling
 *
 * @example
 * ```typescript
 * import { handleCorsPreflight, corsResponse } from '../_shared/cors.ts';
 *
 * // Handle preflight
 * const preflight = handleCorsPreflight(request);
 * if (preflight) return preflight;
 *
 * // Add CORS headers to response
 * return corsResponse(data, 200, request);
 * ```
 */

export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Get allowed origins from environment
 * In production, restrict to specific domains
 */
function getAllowedOrigins(): string | string[] | boolean {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (allowedOrigins) {
    return allowedOrigins.split(',').map((origin) => origin.trim());
  }

  // In development, allow all origins
  // In production, this should be restricted
  const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
  return isProduction ? false : true; // In production, set specific origins
}

const DEFAULT_OPTIONS: CorsOptions = {
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Client-Info',
    'X-Organization-Id',
  ],
  exposedHeaders: ['X-Request-Id', 'X-Response-Time'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Get allowed origin based on request
 */
function getAllowedOrigin(
  requestOrigin: string | null,
  options: CorsOptions
): string | null {
  if (!options.origin || options.origin === true) {
    return requestOrigin || '*';
  }

  if (typeof options.origin === 'string') {
    return options.origin;
  }

  if (Array.isArray(options.origin)) {
    return options.origin.includes(requestOrigin || '') ? requestOrigin : null;
  }

  return null;
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflight(
  request: Request,
  options: CorsOptions = {}
): Response | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const origin = request.headers.get('origin');

  if (request.method !== 'OPTIONS') {
    return null;
  }

  const allowedOrigin = getAllowedOrigin(origin, opts);

  if (!allowedOrigin) {
    return new Response(null, { status: 403 });
  }

  const headers = new Headers({
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': opts.methods?.join(',') || 'GET, POST',
    'Access-Control-Allow-Headers': opts.allowedHeaders?.join(',') || '',
    'Access-Control-Max-Age': String(opts.maxAge || 86400),
  });

  if (opts.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (opts.exposedHeaders && opts.exposedHeaders.length > 0) {
    headers.set('Access-Control-Expose-Headers', opts.exposedHeaders.join(','));
  }

  return new Response(null, { status: 204, headers });
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: Response,
  request: Request,
  options: CorsOptions = {}
): Response {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const origin = request.headers.get('origin');
  const allowedOrigin = getAllowedOrigin(origin, opts);

  if (!allowedOrigin) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', allowedOrigin);

  if (opts.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (opts.exposedHeaders && opts.exposedHeaders.length > 0) {
    headers.set('Access-Control-Expose-Headers', opts.exposedHeaders.join(','));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Create CORS-enabled response
 */
export function corsResponse(
  data: unknown,
  status: number = 200,
  request: Request,
  options: CorsOptions = {}
): Response {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

  return addCorsHeaders(response, request, options);
}

/**
 * Create CORS-enabled error response
 */
export function corsErrorResponse(
  error: string | Error,
  status: number = 400,
  request: Request,
  options: CorsOptions = {}
): Response {
  const message = error instanceof Error ? error.message : error;
  const response = new Response(
    JSON.stringify({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return addCorsHeaders(response, request, options);
}
