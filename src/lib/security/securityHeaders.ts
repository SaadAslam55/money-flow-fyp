// src/lib/security/securityHeaders.ts
/**
 * Security Headers and CSRF Protection
 * Utilities for secure HTTP headers and CSRF token management
 */

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token
 */
export function storeCsrfToken(token: string): void {
  sessionStorage.setItem('csrf_token', token);
}

/**
 * Get CSRF token
 */
export function getCsrfToken(): string | null {
  return sessionStorage.getItem('csrf_token');
}

/**
 * Initialize CSRF token
 */
export function initializeCsrfToken(): string {
  let token = getCsrfToken();

  if (!token) {
    token = generateCsrfToken();
    storeCsrfToken(token);
  }

  return token;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  const storedToken = getCsrfToken();
  return storedToken !== null && storedToken === token;
}

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
} as const;

/**
 * Content Security Policy configuration
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust based on needs
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", import.meta.env.VITE_SUPABASE_URL || ''],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
} as const;

/**
 * Generate CSP header value
 */
export function generateCspHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Apply security headers to fetch requests
 */
export function applySecurityHeaders(headers: HeadersInit = {}): HeadersInit {
  const csrfToken = getCsrfToken();

  return {
    ...headers,
    ...SECURITY_HEADERS,
    ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
  };
}

/**
 * Secure cookie options
 */
export interface SecureCookieOptions {
  name: string;
  value: string;
  maxAge?: number; // seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Set secure cookie
 */
export function setSecureCookie(options: SecureCookieOptions): void {
  const {
    name,
    value,
    maxAge,
    path = '/',
    domain,
    secure = true,
    httpOnly = false, // Can't be set from client-side
    sameSite = 'Strict',
  } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (maxAge) {
    cookie += `; Max-Age=${maxAge}`;
  }

  cookie += `; Path=${path}`;

  if (domain) {
    cookie += `; Domain=${domain}`;
  }

  if (secure) {
    cookie += '; Secure';
  }

  if (httpOnly) {
    cookie += '; HttpOnly';
  }

  cookie += `; SameSite=${sameSite}`;

  document.cookie = cookie;
}

/**
 * Get cookie value
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=').map((c) => c.trim());
    if (cookieName && decodeURIComponent(cookieName) === name && cookieValue) {
      return decodeURIComponent(cookieValue);
    }
  }

  return null;
}

/**
 * Delete cookie
 */
export function deleteCookie(name: string, path = '/', domain?: string): void {
  setSecureCookie({
    name,
    value: '',
    maxAge: 0,
    path,
    ...(domain && { domain }),
  });
}

/**
 * Secure session storage
 */
export class SecureStorage {
  private prefix: string;

  constructor(prefix = 'secure_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set(key: string, value: unknown): void {
    try {
      const serialized = JSON.stringify(value);
      sessionStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  remove(key: string): void {
    sessionStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        sessionStorage.removeItem(key);
      }
    });
  }
}

export const secureStorage = new SecureStorage();

/**
 * Generate secure random string
 */
export function generateSecureRandom(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash string using Web Crypto API
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
