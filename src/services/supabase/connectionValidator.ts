// src/services/supabase/connectionValidator.ts
/**
 * Database Connection Validator
 * Provides utilities to validate Supabase database connection and schema
 */

import { supabase, isSupabaseConfigured } from './client';
import { logger } from '@/lib/logger';

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  details?: {
    configured: boolean;
    reachable: boolean;
    authenticated: boolean;
    tablesExist: boolean;
  };
}

export interface TableCheckResult {
  exists: boolean;
  error?: string;
}

/**
 * Test basic database connectivity
 */
export async function testDatabaseConnection(): Promise<ConnectionTestResult> {
  const result: ConnectionTestResult = {
    success: false,
    details: {
      configured: false,
      reachable: false,
      authenticated: false,
      tablesExist: false,
    },
  };

  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      result.error = 'Supabase is not configured. Check environment variables.';
      return result;
    }
    result.details!.configured = true;

    // Test basic connectivity using auth session check (doesn't require any table)
    const { data: authData, error: authError } = await supabase.auth.getSession();

    // If we can reach the auth endpoint, the connection is working
    // "No session" is not an error - it just means user is not logged in
    if (authError && !authError.message.includes('session')) {
      result.error = `Authentication service error: ${authError.message}`;
      return result;
    }

    result.details!.reachable = true;
    result.details!.authenticated = !!authData?.session;

    // Check if essential tables exist
    const essentialTables = ['organizations', 'users', 'customers', 'invoices', 'transactions'];
    const tableResults = await Promise.all(essentialTables.map((table) => checkTableExists(table)));

    const allTablesExist = tableResults.every((r) => r.exists);
    result.details!.tablesExist = allTablesExist;

    if (!allTablesExist) {
      const missingTables = essentialTables.filter((_, i) => !(tableResults[i]?.exists));
      logger.warn('Missing database tables:', missingTables);
      // Don't fail the connection test for missing tables, just log it
    }

    result.success = true;
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown connection error';
    logger.error('Database connection test failed:', result.error);
    return result;
  }
}

/**
 * Check if a specific table exists in the database
 */
export async function checkTableExists(tableName: string): Promise<TableCheckResult> {
  try {
    const { error } = await supabase.from(tableName).select('1').limit(1);

    if (error) {
      // PGRST116: table not found in schema cache
      // 42P01: relation does not exist (PostgreSQL error)
      // Also check error message for common patterns
      const isTableNotFound = 
        error.code === 'PGRST116' || 
        error.code === '42P01' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('not found') ||
        error.message?.includes('schema cache');
      
      if (isTableNotFound) {
        return { exists: false };
      }
      
      // For RLS/permission errors, the table exists but user can't access it
      // This is fine - table exists
      if (error.code === '42501' || error.message?.includes('permission')) {
        return { exists: true };
      }
      
      return { exists: false, error: error.message };
    }

    return { exists: true };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validate that the user has access to their organization data
 */
export async function validateOrganizationAccess(organizationId: string): Promise<boolean> {
  try {
    if (!organizationId) return false;

    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organizationId)
      .single();

    return !error && !!data;
  } catch (error) {
    logger.error('Organization access validation failed:', error);
    return false;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth(): Promise<{
  healthy: boolean;
  message: string;
  details: ConnectionTestResult['details'];
}> {
  const connectionResult = await testDatabaseConnection();

  if (!connectionResult.success) {
    return {
      healthy: false,
      message: connectionResult.error || 'Database connection failed',
      details: connectionResult.details,
    };
  }

  if (!connectionResult.details?.tablesExist) {
    return {
      healthy: false,
      message: 'Database schema is incomplete. Some tables may be missing.',
      details: connectionResult.details,
    };
  }

  return {
    healthy: true,
    message: 'Database connection is healthy',
    details: connectionResult.details,
  };
}

/**
 * Initialize database connection test on app startup
 */
export async function initializeDatabaseCheck(): Promise<void> {
  try {
    const health = await getDatabaseHealth();

    if (!health.healthy) {
      logger.warn('Database health check failed:', health.message);
    } else {
      logger.info('Database health check passed');
    }
  } catch (error) {
    logger.error('Database health check failed:', error);
  }
}
