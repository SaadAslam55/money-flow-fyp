// src/middleware/securityMiddleware.ts
/**
 * Security Middleware - Phase 6: Security & Performance
 * CSRF protection, XSS prevention, and security headers
 */

import { v4 as uuidv4 } from 'uuid';

// CSRF Token Management
const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  const token = uuidv4();
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  return token;
}

/**
 * Get the current CSRF token
 */
export function getCSRFToken(): string | null {
  return sessionStorage.getItem(CSRF_TOKEN_KEY);
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken !== null && storedToken === token;
}

/**
 * Add CSRF token to request headers
 */
export function addCSRFHeader(headers: Headers | Record<string, string>): void {
  const token = getCSRFToken();
  if (token) {
    if (headers instanceof Headers) {
      headers.set(CSRF_TOKEN_HEADER, token);
    } else {
      headers[CSRF_TOKEN_HEADER] = token;
    }
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize HTML content (allows safe tags)
 */
export function sanitizeHTML(html: string): string {
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'a'];
  const allowedAttributes = ['href', 'title'];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function sanitizeNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      if (!allowedTags.includes(tagName)) {
        // Replace with text content
        const text = document.createTextNode(element.textContent ?? '');
        element.parentNode?.replaceChild(text, element);
        return;
      }

      // Remove disallowed attributes
      Array.from(element.attributes).forEach((attr) => {
        if (!allowedAttributes.includes(attr.name.toLowerCase())) {
          element.removeAttribute(attr.name);
        }
        // Sanitize href to prevent javascript: URLs
        if (attr.name === 'href' && attr.value.toLowerCase().startsWith('javascript:')) {
          element.removeAttribute('href');
        }
      });
    }

    // Recursively sanitize children
    Array.from(node.childNodes).forEach(sanitizeNode);
  }

  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}

/**
 * Validate URL to prevent open redirects
 */
export function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    // Only allow same-origin redirects
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Check if running in secure context
 */
export function isSecureContext(): boolean {
  return window.isSecureContext;
}

/**
 * Security headers to add to API requests
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;

/**
 * Content Security Policy directives
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Needed for React
  'style-src': ["'self'", "'unsafe-inline'"], // Needed for Tailwind
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
} as const;

/**
 * Build CSP header string
 */
export function buildCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * Session timeout management
 */
const SESSION_TIMEOUT_KEY = 'session_last_activity';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function updateSessionActivity(): void {
  sessionStorage.setItem(SESSION_TIMEOUT_KEY, Date.now().toString());
}

export function isSessionExpired(): boolean {
  const lastActivity = sessionStorage.getItem(SESSION_TIMEOUT_KEY);
  if (!lastActivity) return true;

  const elapsed = Date.now() - parseInt(lastActivity, 10);
  return elapsed > SESSION_TIMEOUT_MS;
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_TIMEOUT_KEY);
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
}

/**
 * Password strength validation
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters');

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push('Include both uppercase and lowercase letters');

  if (/\d/.test(password)) score++;
  else feedback.push('Include at least one number');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else feedback.push('Include at least one special character');

  // Check for common patterns
  const commonPatterns = ['password', '123456', 'qwerty', 'abc123'];
  if (commonPatterns.some((p) => password.toLowerCase().includes(p))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common password patterns');
  }

  return {
    score: Math.min(4, score),
    feedback,
    isStrong: score >= 3,
  };
}
