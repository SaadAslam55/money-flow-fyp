// src/services/supabase/database.ts
/**
 * Supabase Database Service
 * Provides database query utilities, error handling, and batch operations.
 * Includes retry logic and connection management.
 *
 * Features:
 * - Query execution with error handling
 * - Retry logic with exponential backoff
 * - Table access validation
 * - Batch operations
 * - RPC function execution
 *
 * @example
 * ```typescript
 *
import { executeQuery, batchInsert, executeRPC } from '@/services/supabase/database';
 *
 * // Execute query with error handling
 * const { data, error } = await executeQuery(() =>
 *   supabase.from('invoices').select('*').eq('organization_id', orgId)
 * );
 *
 * // Batch insert
 * const { data, error } = await batchInsert('customers', customerRecords);
 *
 * // Execute RPC
 * const { data, error } = await executeRPC('calculate_invoice_total', { invoiceId });
 * ```
 */

import { logger } from '@/lib/logger';
import { supabase } from './client';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Type helpers for type-safe operations
type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type Row<T extends TableName> = Tables[T]['Row'];
type Insert<T extends TableName> = Tables[T]['Insert'];
type Update<T extends TableName> = Tables[T]['Update'];

/**
 * Execute a database query with error handling
 *
 * Wraps a Supabase query function with consistent error handling.
 *
 * @param queryFn - Function that returns a Supabase query promise
 * @returns Query result with data and error
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    if (typeof queryFn !== 'function') {
      return {
        data: null,
        error: new Error('Query function must be a function'),
      };
    }

    const { data, error } = await queryFn();

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('Database query error:', error instanceof Error ? error.message : String(error));
      }
      return {
        data: null,
        error: new Error(error.message ?? 'Database query failed'),
      };
    }

    return { data, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Database query exception:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Database query failed'),
    };
  }
}

/**
 * Execute a database query with retry logic
 *
 * Executes a query with automatic retry on transient failures.
 * Uses exponential backoff for retry delays.
 * Does not retry on client errors (4xx) like permission denied or not found.
 *
 * @param queryFn - Function that returns a Supabase query promise
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param retryDelay - Initial retry delay in milliseconds (default: 1000)
 * @returns Query result with data and error
 */
export async function executeQueryWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<{ data: T | null; error: Error | null }> {
  // Validate inputs
  if (typeof queryFn !== 'function') {
    return {
      data: null,
      error: new Error('Query function must be a function'),
    };
  }

  if (maxRetries < 0 || maxRetries > 10) {
    return {
      data: null,
      error: new Error('maxRetries must be between 0 and 10'),
    };
  }

  if (retryDelay < 0 || retryDelay > 10000) {
    return {
      data: null,
      error: new Error('retryDelay must be between 0 and 10000 milliseconds'),
    };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await executeQuery(queryFn);

    if (!result.error) {
      return result;
    }

    lastError = result.error;

    // Don't retry on client errors (4xx) or validation errors
    const errorMessage = result.error.message.toLowerCase();
    if (
      errorMessage.includes('permission') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('duplicate') ||
      errorMessage.includes('violates') ||
      errorMessage.includes('constraint')
    ) {
      if (import.meta.env.DEV) {

        logger.warn('Non-retryable error detected, stopping retries:', result.error.message);
      }
      break;
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (import.meta.env.DEV) {
        logger.debug(`Retrying query (attempt ${attempt + 1}/${maxRetries})...`);
      }
    }
  }

  if (import.meta.env.DEV && lastError) {
    logger.error('Query failed after retries:', lastError instanceof Error ? lastError.message : String(lastError));
  }

  return { data: null, error: lastError };
}

/**
 * Check if table exists and is accessible
 *
 * Validates that a table exists and the current user has access to it.
 *
 * @param tableName - Name of the table to check
 * @returns true if table is accessible, false otherwise
 */
export async function checkTableAccess(tableName: string): Promise<boolean> {
  try {
    // Validate table name
    if (!tableName || typeof tableName !== 'string' || tableName.trim().length === 0) {
      return false;
    }

    // Sanitize table name (prevent SQL injection)
    const sanitizedTableName = tableName.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (sanitizedTableName !== tableName.trim()) {
      if (import.meta.env.DEV) {

        logger.warn('Invalid table name:', tableName);
      }
      return false;
    }

    const { error } = await supabase.from(sanitizedTableName).select('id').limit(1);

    return !error;
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error checking table access:', error instanceof Error ? error.message : String(error));
    }
    return false;
  }
}

/**
 * Get table row count
 *
 * Gets the total number of rows in a table, optionally filtered by organization.
 *
 * @param tableName - Name of the table
 * @param organizationId - Optional organization ID to filter by
 * @returns Row count and error status
 */
export async function getTableCount(
  tableName: string,
  organizationId?: string
): Promise<{ count: number; error: Error | null }> {
  try {
    // Validate table name
    if (!tableName || typeof tableName !== 'string' || tableName.trim().length === 0) {
      return {
        count: 0,
        error: new Error('Table name is required'),
      };
    }

    // Sanitize table name
    const sanitizedTableName = tableName.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (sanitizedTableName !== tableName.trim()) {
      return {
        count: 0,
        error: new Error('Invalid table name'),
      };
    }

    let query = supabase.from(sanitizedTableName).select('*', { count: 'exact', head: true });

    if (organizationId) {
      if (typeof organizationId !== 'string' || organizationId.trim().length === 0) {
        return {
          count: 0,
          error: new Error('Invalid organization ID'),
        };
      }
      query = query.eq('organization_id', organizationId.trim());
    }

    const { count, error } = await query;

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('Error getting table count:', error instanceof Error ? error.message : String(error));
      }
      return { count: 0, error: new Error(error.message) };
    }

    return { count: count ?? 0, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error getting table count:', error instanceof Error ? error.message : String(error));
    }
    return {
      count: 0,
      error: error instanceof Error ? error : new Error('Failed to get count'),
    };
  }
}

/**
 * Batch insert with transaction-like behavior
 *
 * Inserts multiple records in batches to avoid payload size limits.
 * Processes records in chunks and returns all inserted records.
 *
 * @param tableName - Name of the table
 * @param records - Array of records to insert
 * @param batchSize - Number of records per batch (default: 100, max: 1000)
 * @returns Inserted records and error status
 */
export async function batchInsert<T>(
  tableName: string,
  records: T[],
  batchSize: number = 100
): Promise<{ data: T[] | null; error: Error | null }> {
  try {
    // Validate inputs
    if (!tableName || typeof tableName !== 'string' || tableName.trim().length === 0) {
      return {
        data: null,
        error: new Error('Table name is required'),
      };
    }

    if (!Array.isArray(records)) {
      return {
        data: null,
        error: new Error('Records must be an array'),
      };
    }

    if (records.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    // Validate and clamp batch size
    const validBatchSize = Math.min(Math.max(1, Math.floor(batchSize)), 1000);

    // Sanitize table name
    const sanitizedTableName = tableName.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (sanitizedTableName !== tableName.trim()) {
      return {
        data: null,
        error: new Error('Invalid table name'),
      };
    }

    const results: T[] = [];

    for (let i = 0; i < records.length; i += validBatchSize) {
      const batch = records.slice(i, i + validBatchSize);

      if (batch.length === 0) continue;

      const { data, error } = await supabase
        .from(sanitizedTableName)
        .insert(batch as any)
        .select();

      if (error) {
        if (import.meta.env.DEV) {
  
          logger.error(`Batch insert error (batch ${Math.floor(i / validBatchSize) + 1}):`, error instanceof Error ? error.message : String(error));
        }
        return {
          data: results.length > 0 ? results : null,
          error: new Error(`Batch insert failed: ${error.message}`),
        };
      }

      if (data) {
        results.push(...data);
      }
    }

    return { data: results, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Batch insert exception:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Batch insert failed'),
    };
  }
}

/**
 * Execute RPC function
 *
 * Executes a PostgreSQL function (stored procedure) via Supabase RPC.
 *
 * @param functionName - Name of the RPC function
 * @param params - Parameters to pass to the function
 * @returns Function result and error status
 */
export async function executeRPC<T>(
  functionName: string,
  params?: Record<string, unknown>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    // Validate function name
    if (!functionName || typeof functionName !== 'string' || functionName.trim().length === 0) {
      return {
        data: null,
        error: new Error('Function name is required'),
      };
    }

    // Sanitize function name
    const sanitizedFunctionName = functionName.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (sanitizedFunctionName !== functionName.trim()) {
      return {
        data: null,
        error: new Error('Invalid function name'),
      };
    }

    // Validate params
    if (params !== undefined && (typeof params !== 'object' || Array.isArray(params))) {
      return {
        data: null,
        error: new Error('Params must be an object'),
      };
    }

    const { data, error } = await supabase.rpc(sanitizedFunctionName, (params ?? {}) as any);

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('RPC execution error:', error instanceof Error ? error.message : String(error));
      }
      return {
        data: null,
        error: new Error(error.message ?? 'RPC execution failed'),
      };
    }

    return { data: data as T, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('RPC execution exception:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('RPC execution failed'),
    };
  }
}

// ============================================
// TYPE-SAFE DATABASE OPERATIONS
// ============================================

/**
 * Type-safe insert operation
 *
 * @example
 * ```typescript
 * const result = await dbInsert('invoices', {
 *   organization_id: 'uuid',
 *   customer_id: 'uuid',
 *   total_amount: 100
 * });
 * ```
 */
export async function dbInsert<T extends TableName>(table: T, data: Insert<T>) {
  return await supabase.from(table).insert(data);
}

/**
 * Type-safe update operation
 *
 * @example
 * ```typescript
 * const result = await dbUpdate('invoices', 'invoice-id', {
 *   status: 'paid',
 *   amount_paid: 100
 * });
 * ```
 */
export async function dbUpdate<T extends TableName>(table: T, id: string, data: Update<T>) {
  return await supabase.from(table).update(data).eq('id', id);
}

/**
 * Type-safe update with custom conditions
 *
 * @example
 * ```typescript
 * const result = await dbUpdateWhere('users',
 *   { last_login: new Date().toISOString() },
 *   { column: 'auth_user_id', value: userId }
 * );
 * ```
 */
export async function dbUpdateWhere<T extends TableName>(
  table: T,
  data: Update<T>,
  where: { column: string; value: unknown }
) {
  return await supabase.from(table).update(data).eq(where.column, where.value);
}

/**
 * Type-safe select operation
 *
 * @example
 * ```typescript
 * const result = await dbSelect('invoices', '*');
 * ```
 */
export async function dbSelect<T extends TableName, C extends string = '*'>(
  table: T,
  columns: C = '*' as C
) {
  return await supabase.from(table).select(columns);
}

/**
 * Type-safe select single record
 *
 * @example
 * ```typescript
 * const result = await dbSelectSingle('invoices', '*', 'invoice-id');
 * ```
 */
export async function dbSelectSingle<T extends TableName, C extends string = '*'>(
  table: T,
  columns: C = '*' as C,
  id?: string
) {
  const query = supabase.from(table).select(columns);
  if (id) {
    query.eq('id', id);
  }
  return await query.single();
}

/**
 * Type-safe delete operation
 *
 * @example
 * ```typescript
 * const result = await dbDelete('invoices', 'invoice-id');
 * ```
 */
export async function dbDelete<T extends TableName>(table: T, id: string) {
  return await supabase.from(table).delete().eq('id', id);
}

/**
 * Type-safe upsert operation
 *
 * @example
 * ```typescript
 * const result = await dbUpsert('invoice_settings', {
 *   organization_id: 'uuid',
 *   invoice_prefix: 'INV',
 *   invoice_starting_number: 1
 * });
 * ```
 */
export async function dbUpsert<T extends TableName>(
  table: T,
  data: Insert<T>,
  onConflict?: string
) {
  // Use options argument for onConflict (Supabase JS v2)
  if (onConflict) {
    return await supabase.from(table).upsert(data, { onConflict });
  }
  return await supabase.from(table).upsert(data);
}

/**
 * Type-safe count operation
 *
 * @example
 * ```typescript
 * const result = await dbCount('invoices');
 * ```
 */
export async function dbCount<T extends TableName>(
  table: T,
  where?: { column: string; value: unknown }
) {
  const query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (where) {
    query.eq(where.column, where.value);
  }
  return await query;
}

// Export types for use in other files
export type { Tables, TableName, Row, Insert, Update };
