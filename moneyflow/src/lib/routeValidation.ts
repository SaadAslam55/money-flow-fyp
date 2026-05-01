// src/lib/routeValidation.ts
/**
 * Route Parameter Validation
 * Provides utilities for validating route parameters and query strings
 */

import { z } from 'zod';

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(1000).default(50),
});

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

/**
 * Search schema
 */
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  query: z.string().min(1).max(100).optional(),
});

/**
 * Sort schema
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Filter schema for invoices
 */
export const invoiceFilterSchema = z.object({
  status: z
    .enum(['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'void'])
    .optional(),
  customerId: uuidSchema.optional(),
  ...paginationSchema.shape,
  ...dateRangeSchema.shape,
  ...sortSchema.shape,
});

/**
 * Filter schema for products
 */
export const productFilterSchema = z.object({
  category: z.string().optional(),
  inStock: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  ...paginationSchema.shape,
  ...searchSchema.shape,
  ...sortSchema.shape,
});

/**
 * Filter schema for customers
 */
export const customerFilterSchema = z.object({
  hasOutstanding: z.coerce.boolean().optional(),
  ...paginationSchema.shape,
  ...searchSchema.shape,
  ...sortSchema.shape,
});

/**
 * Filter schema for transactions
 */
export const transactionFilterSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  categoryId: uuidSchema.optional(),
  accountId: uuidSchema.optional(),
  ...paginationSchema.shape,
  ...dateRangeSchema.shape,
  ...sortSchema.shape,
});

/**
 * Validate route parameter
 */
export function validateRouteParam<T>(
  param: string | undefined,
  schema: z.ZodSchema<T>,
  paramName: string = 'parameter'
): T {
  if (!param) {
    throw new Error(`Missing required ${paramName}`);
  }

  const result = schema.safeParse(param);

  if (!result.success) {
    const error = result.error.errors[0];
    throw new Error(`Invalid ${paramName}: ${error?.message || 'Validation failed'}`);
  }

  return result.data;
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(params: Record<string, unknown>, schema: z.ZodSchema<T>): T {
  const result = schema.safeParse(params);

  if (!result.success) {
    const error = result.error.errors[0];
    throw new Error(`Invalid query parameters: ${error?.message || 'Validation failed'}`);
  }

  return result.data;
}

/**
 * Parse and validate UUID from route
 */
export function parseUUID(id: string | undefined, entityName: string = 'entity'): string {
  return validateRouteParam(id, uuidSchema, `${entityName} ID`);
}

/**
 * Parse pagination from query params
 */
export function parsePagination(searchParams: URLSearchParams) {
  return validateQueryParams(
    {
      page: searchParams.get('page'),
      perPage: searchParams.get('perPage') || searchParams.get('limit'),
    },
    paginationSchema
  );
}

/**
 * Parse date range from query params
 */
export function parseDateRange(searchParams: URLSearchParams) {
  return validateQueryParams(
    {
      startDate: searchParams.get('startDate') || searchParams.get('from'),
      endDate: searchParams.get('endDate') || searchParams.get('to'),
    },
    dateRangeSchema
  );
}

/**
 * Parse search query from params
 */
export function parseSearch(searchParams: URLSearchParams): string | undefined {
  const result = validateQueryParams(
    {
      q: searchParams.get('q'),
      query: searchParams.get('query'),
    },
    searchSchema
  );

  return result.q || result.query;
}

/**
 * Parse sort parameters from query
 */
export function parseSort(searchParams: URLSearchParams) {
  return validateQueryParams(
    {
      sortBy: searchParams.get('sortBy') || searchParams.get('sort'),
      sortOrder: searchParams.get('sortOrder') || searchParams.get('order'),
    },
    sortSchema
  );
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Validate and sanitize URL slug
 */
export function validateSlug(slug: string): string {
  const slugSchema = z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

  return validateRouteParam(slug, slugSchema, 'slug');
}

/**
 * Validate email parameter
 */
export function validateEmail(email: string | undefined): string {
  const emailSchema = z.string().email('Invalid email format');
  return validateRouteParam(email, emailSchema, 'email');
}

/**
 * Validate phone parameter
 */
export function validatePhone(phone: string | undefined): string {
  const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format');
  return validateRouteParam(phone, phoneSchema, 'phone');
}

/**
 * Safe parse with fallback
 */
export function safeParseWithFallback<T>(value: unknown, schema: z.ZodSchema<T>, fallback: T): T {
  const result = schema.safeParse(value);
  return result.success ? result.data : fallback;
}
