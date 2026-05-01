// src/lib/security/inputSanitization.ts
/**
 * Input Sanitization Utilities
 * Provides comprehensive input validation and sanitization to prevent XSS and injection attacks
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(input: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = input;
  return temp.textContent || temp.innerText || '';
}

/**
 * Sanitize string for SQL-like queries (additional layer on top of parameterized queries)
 */
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove dangerous SQL characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/gi, '');
}

/**
 * Sanitize phone number (keep only digits and +)
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize filename (remove path traversal attempts)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\.+/, '') // Remove leading dots
    .slice(0, 255); // Limit length
}

/**
 * Validate and sanitize JSON input
 */
export function sanitizeJson<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: string | number): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(num) ? null : num;
}

/**
 * Sanitize integer input
 */
export function sanitizeInteger(input: string | number): number | null {
  const num = typeof input === 'string' ? parseInt(input, 10) : Math.floor(input);
  return isNaN(num) ? null : num;
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(input: unknown): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    return ['true', '1', 'yes', 'on'].includes(input.toLowerCase());
  }
  return Boolean(input);
}

/**
 * Sanitize object by removing undefined and null values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      result[key as keyof T] = value as T[keyof T];
    }
  }

  return result;
}

/**
 * Deep sanitize object (recursive)
 */
export function deepSanitizeObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitizeObject(item)) as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        result[key] = sanitizeHtml(value);
      } else if (typeof value === 'object') {
        result[key] = deepSanitizeObject(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
}

/**
 * Rate limit key sanitization
 */
export function sanitizeRateLimitKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9:_-]/g, '_').slice(0, 100);
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, '') // Remove quotes
    .slice(0, 200); // Limit length
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate phone number format (international)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
}

/**
 * Check for potential XSS patterns
 */
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check for SQL injection patterns
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)|(\bSELECT\b.*\bFROM\b)/i,
    /(\bINSERT\b.*\bINTO\b)|(\bUPDATE\b.*\bSET\b)/i,
    /(\bDELETE\b.*\bFROM\b)|(\bDROP\b.*\bTABLE\b)/i,
    /(\bEXEC\b)|(\bEXECUTE\b)/i,
    /(;|--|\/\*|\*\/)/,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Comprehensive input validation
 */
export function validateInput(
  input: string,
  options: {
    maxLength?: number;
    minLength?: number;
    allowHtml?: boolean;
    pattern?: RegExp;
  } = {}
): { valid: boolean; error?: string } {
  const { maxLength = 10000, minLength = 0, allowHtml = false, pattern } = options;

  // Length check
  if (input.length < minLength) {
    return { valid: false, error: `Input must be at least ${minLength} characters` };
  }

  if (input.length > maxLength) {
    return { valid: false, error: `Input must not exceed ${maxLength} characters` };
  }

  // XSS check
  if (!allowHtml && containsXss(input)) {
    return { valid: false, error: 'Input contains potentially dangerous content' };
  }

  // SQL injection check
  if (containsSqlInjection(input)) {
    return { valid: false, error: 'Input contains potentially dangerous SQL patterns' };
  }

  // Pattern check
  if (pattern && !pattern.test(input)) {
    return { valid: false, error: 'Input format is invalid' };
  }

  return { valid: true };
}
