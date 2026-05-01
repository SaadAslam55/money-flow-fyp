/**
 * Authentication Middleware
 * Validates Supabase JWT and caches sessions
 */

import { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { Env } from '../index';

// ============================================
// Types
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

// ============================================
// Auth Middleware
// ============================================

export async function authMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');

  // Check for Bearer token
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      },
      401
    );
  }

  const token = authHeader.slice(7);

  // Validate token length
  if (token.length < 10) {
    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token format',
        },
      },
      401
    );
  }

  try {
    // Check session cache first (5 minute TTL)
    const cacheKey = `session:${hashToken(token)}`;
    const cachedSession = await c.env.SESSIONS.get(cacheKey);

    if (cachedSession) {
      const user = JSON.parse(cachedSession) as AuthUser;
      c.set('user', user);
      c.header('X-Auth-Cache', 'HIT');
      return next();
    }

    // Cache miss - verify with Supabase
    c.header('X-Auth-Cache', 'MISS');
    const user = await verifyToken(token, c.env);

    // Cache the session
    await c.env.SESSIONS.put(cacheKey, JSON.stringify(user), {
      expirationTtl: 300, // 5 minutes
    });

    c.set('user', user);
    return next();
  } catch (error) {
    console.error('[Auth Error]', error);

    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      },
      401
    );
  }
}

// ============================================
// Token Verification
// ============================================

async function verifyToken(token: string, env: Env): Promise<AuthUser> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Verify token with Supabase
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid token');
  }

  // Get user profile with organization
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, organization_id')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.warn('[Auth] Failed to fetch profile:', profileError.message);
  }

  return {
    id: user.id,
    email: user.email || '',
    role: profile?.role || 'user',
    organizationId: profile?.organization_id || '',
  };
}

// ============================================
// Helpers
// ============================================

/**
 * Hash token for cache key (don't store raw tokens)
 */
function hashToken(token: string): string {
  // Simple hash for cache key
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Optional auth - sets user if token present, continues regardless
 */
export async function optionalAuthMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const cacheKey = `session:${hashToken(token)}`;
      const cachedSession = await c.env.SESSIONS.get(cacheKey);

      if (cachedSession) {
        c.set('user', JSON.parse(cachedSession));
      } else {
        const user = await verifyToken(token, c.env);
        c.set('user', user);
        await c.env.SESSIONS.put(cacheKey, JSON.stringify(user), {
          expirationTtl: 300,
        });
      }
    } catch {
      // Ignore auth errors for optional auth
    }
  }

  return next();
}

/**
 * Require specific role
 */
export function requireRole(...roles: string[]) {
  return async (c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        401
      );
    }

    if (!roles.includes(user.role)) {
      return c.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
        },
        403
      );
    }

    return next();
  };
}
