/**
 * Auth Routes
 * Edge authentication handling
 */

import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// ============================================
// Token Validation
// ============================================

app.post('/validate', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ valid: false, error: 'Missing token' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ valid: false, error: 'Invalid token' }, 401);
    }

    return c.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    return c.json({ valid: false, error: 'Validation failed' }, 500);
  }
});

// ============================================
// Session Refresh
// ============================================

app.post('/refresh', async (c) => {
  const { refresh_token } = await c.req.json<{ refresh_token: string }>();

  if (!refresh_token) {
    return c.json({ error: 'Refresh token required' }, 400);
  }

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
      return c.json({ error: error.message }, 401);
    }

    return c.json({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_in: data.session?.expires_in,
    });
  } catch (error) {
    return c.json({ error: 'Refresh failed' }, 500);
  }
});

// ============================================
// Logout (Invalidate Session)
// ============================================

app.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    // Remove from session cache
    const cacheKey = `session:${hashToken(token)}`;
    await c.env.SESSIONS.delete(cacheKey);
  }

  return c.json({ success: true });
});

// ============================================
// Session Info
// ============================================

app.get('/session', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ authenticated: false }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ authenticated: false }, 401);
    }

    // Get profile
    const { data: profile } = await supabase
      .from('users')
      .select('role, organization_id, full_name')
      .eq('id', user.id)
      .single();

    return c.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'user',
        organizationId: profile?.organization_id,
        fullName: profile?.full_name,
      },
    });
  } catch (error) {
    return c.json({ authenticated: false, error: 'Session check failed' }, 500);
  }
});

// ============================================
// Helpers
// ============================================

function hashToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export default app;
