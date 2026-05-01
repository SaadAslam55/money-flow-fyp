// src/types/auth.types.ts
/**
 * Authentication Type Definitions
 * 
 * Types related to authentication, authorization, and user sessions
 */

import type { User, Organization, UserRole } from './database.types';
import type { Session } from '@supabase/supabase-js';

// ============================================
// AUTHENTICATION TYPES
// ============================================

/**
 * Sign in request
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Sign in response
 */
export interface SignInResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

/**
 * Sign up request
 */
export interface SignUpRequest {
  email: string;
  password: string;
  businessName: string;
  fullName?: string;
}

/**
 * Sign up response
 */
export interface SignUpResponse {
  user: User | null;
  organization: Organization | null;
  session: Session | null;
  error: Error | null;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset response
 */
export interface PasswordResetResponse {
  success: boolean;
  error: Error | null;
}

/**
 * Update password request
 */
export interface UpdatePasswordRequest {
  newPassword: string;
  currentPassword?: string;
}

/**
 * Update password response
 */
export interface UpdatePasswordResponse {
  success: boolean;
  error: Error | null;
}

/**
 * Verify email request
 */
export interface VerifyEmailRequest {
  token: string;
  type?: 'signup' | 'email_change';
}

/**
 * Verify email response
 */
export interface VerifyEmailResponse {
  success: boolean;
  error: Error | null;
}

/**
 * Resend verification email request
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * Resend verification response
 */
export interface ResendVerificationResponse {
  success: boolean;
  error: Error | null;
}

// ============================================
// SESSION TYPES
// ============================================

/**
 * Auth session with user and organization
 */
export interface AuthSession {
  user: User;
  organization: Organization;
  session: Session;
  expiresAt: number;
}

/**
 * Session state
 */
export interface SessionState {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

// ============================================
// PERMISSION TYPES
// ============================================

/**
 * Permission check result
 */
export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
}

/**
 * Role-based access control
 */
export interface RBAC {
  role: UserRole;
  permissions: string[];
  canAccess: (resource: string, action: string) => boolean;
}

/**
 * Permission definition
 */
export interface Permission {
  resource: string;
  action: string;
  roles: UserRole[];
  description?: string;
}

// ============================================
// AUTH STATE TYPES
// ============================================

/**
 * Auth store state
 */
export interface AuthState {
  user: User | null;
  organization: Organization | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  setUser: (user: User | null) => void;
  setOrganization: (organization: Organization | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// ============================================
// OAUTH TYPES
// ============================================

/**
 * OAuth provider
 */
export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'apple';

/**
 * OAuth sign in request
 */
export interface OAuthSignInRequest {
  provider: OAuthProvider;
  redirectTo?: string;
}

/**
 * OAuth sign in response
 */
export interface OAuthSignInResponse {
  url: string | null;
  error: Error | null;
}

// ============================================
// TWO-FACTOR AUTHENTICATION TYPES
// ============================================

/**
 * 2FA setup request
 */
export interface TwoFactorSetupRequest {
  method: 'totp' | 'sms';
  phoneNumber?: string;
}

/**
 * 2FA setup response
 */
export interface TwoFactorSetupResponse {
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  error: Error | null;
}

/**
 * 2FA verify request
 */
export interface TwoFactorVerifyRequest {
  code: string;
  method: 'totp' | 'sms';
}

/**
 * 2FA verify response
 */
export interface TwoFactorVerifyResponse {
  success: boolean;
  error: Error | null;
}

// ============================================
// AUTH ERROR TYPES
// ============================================

/**
 * Auth error codes
 */
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_not_verified'
  | 'user_not_found'
  | 'email_already_exists'
  | 'weak_password'
  | 'session_expired'
  | 'permission_denied'
  | 'rate_limit_exceeded'
  | 'unknown_error';

/**
 * Auth error
 */
export interface AuthError extends Error {
  code: AuthErrorCode;
  message: string;
  statusCode?: number;
}

