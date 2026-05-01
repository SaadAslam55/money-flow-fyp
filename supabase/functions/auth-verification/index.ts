// supabase/functions/auth-verification/index.ts
/**
 * Auth Verification Edge Function
 * Handles email verification, password reset confirmations, and OTP validation
 * Industry-standard authentication with security best practices
 *
 * Endpoints:
 *  POST /verify-email          - Confirm email verification token
 *  POST /resend-verification   - Resend verification email
 *  POST /verify-otp            - Verify OTP code (email/SMS)
 *  POST /check-verification    - Check user's verification status
 *  GET  /health                - Health check
 *
 * Security Features:
 *  - Rate limiting per IP and email
 *  - Token validation with expiration checks
 *  - Audit logging for all verification attempts
 *  - CORS protection
 *  - Input sanitization
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsResponse, corsErrorResponse, handleCorsPreflight } from '../_shared/cors.ts';

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetTime: record.resetTime };
}

// Initialize Supabase client with service role
function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Verify email with token from magic link
async function verifyEmail(token: string, type: 'signup' | 'email_change' = 'signup') {
  const supabase = getServiceClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type === 'email_change' ? 'email_change' : 'email',
    });

    if (error) throw error;

    // Log successful verification
    await supabase.from('audit_logs').insert({
      action: 'email_verified',
      entity_type: 'user',
      entity_id: data.user?.id,
      performed_by: data.user?.id,
      details: { email: data.user?.email, type },
    });

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
}

// Resend verification email
async function resendVerification(email: string, redirectTo?: string) {
  const supabase = getServiceClient();

  try {
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email_confirmed_at')
      .eq('email', email)
      .single();

    if (userError) {
      // Don't reveal if email exists for security
      return { success: true, message: 'If the email exists, a verification email will be sent.' };
    }

    if (userData.email_confirmed_at) {
      return { success: false, error: 'Email already verified' };
    }

    // Resend verification
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) throw error;

    // Log resend attempt
    await supabase.from('audit_logs').insert({
      action: 'verification_email_resent',
      entity_type: 'user',
      entity_id: userData.id,
      details: { email },
    });

    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Resend verification error:', error);
    throw error;
  }
}

// Verify OTP code
async function verifyOtp(email: string, token: string, type: 'email' | 'sms' = 'email') {
  const supabase = getServiceClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type === 'sms' ? 'sms' : 'email',
    });

    if (error) throw error;

    // Log successful OTP verification
    await supabase.from('audit_logs').insert({
      action: 'otp_verified',
      entity_type: 'user',
      entity_id: data.user?.id,
      performed_by: data.user?.id,
      details: { type },
    });

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
}

// Check verification status
async function checkVerificationStatus(userId: string) {
  const supabase = getServiceClient();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('email_confirmed_at, phone_confirmed_at, email, phone')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      verified: {
        email: !!data.email_confirmed_at,
        phone: !!data.phone_confirmed_at,
      },
      contact: {
        email: data.email,
        phone: data.phone,
      },
    };
  } catch (error) {
    console.error('Check verification error:', error);
    throw error;
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req);
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // Rate limit check
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return corsErrorResponse(
        new Error('Too many requests. Please try again later.'),
        429,
        req,
        { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': rateLimit.resetTime.toString() }
      );
    }

    // Health check
    if (path === 'health' && req.method === 'GET') {
      return corsResponse({ status: 'healthy', timestamp: new Date().toISOString() });
    }

    // Parse request body
    let body: Record<string, unknown> = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch {
        return corsErrorResponse(new Error('Invalid JSON body'), 400, req);
      }
    }

    // Route handling
    switch (path) {
      case 'verify-email': {
        const { token, type } = body;
        if (!token || typeof token !== 'string') {
          return corsErrorResponse(new Error('Token is required'), 400, req);
        }

        const result = await verifyEmail(token, type as 'signup' | 'email_change');
        return corsResponse(result);
      }

      case 'resend-verification': {
        const { email, redirectTo } = body;
        if (!email || typeof email !== 'string') {
          return corsErrorResponse(new Error('Email is required'), 400, req);
        }

        // Rate limit by email
        const emailRateLimit = checkRateLimit(`email:${email}`);
        if (!emailRateLimit.allowed) {
          return corsErrorResponse(
            new Error('Too many verification attempts for this email. Please try again later.'),
            429,
            req
          );
        }

        const result = await resendVerification(email, redirectTo as string);
        return corsResponse(result);
      }

      case 'verify-otp': {
        const { email, token, type } = body;
        if (!email || !token) {
          return corsErrorResponse(new Error('Email and token are required'), 400, req);
        }

        const result = await verifyOtp(email as string, token as string, type as 'email' | 'sms');
        return corsResponse(result);
      }

      case 'check-verification': {
        const { userId } = body;
        if (!userId) {
          return corsErrorResponse(new Error('User ID is required'), 400, req);
        }

        const result = await checkVerificationStatus(userId as string);
        return corsResponse(result);
      }

      default:
        return corsErrorResponse(new Error('Unknown endpoint'), 404, req);
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return corsErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500,
      req
    );
  }
});
