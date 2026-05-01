/**
 * Supabase Connection Test Script
 * 
 * Tests the Supabase backend connection and configuration
 * Run with: npx tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env files
// Vite loads .env.local with higher priority than .env
function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  
  // Load .env first (lower priority)
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
    envFile.split('\n').forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        env[key] = value;
      }
    });
  } catch (error) {
    // .env file doesn't exist, that's okay
  }
  
  // Load .env.local (higher priority - overrides .env)
  try {
    const envLocalFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    envLocalFile.split('\n').forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        env[key] = value; // Override .env values
      }
    });
  } catch (error) {
    // .env.local file doesn't exist, that's okay
  }
  
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

interface TestResult {
  test: string;
  status: '✅ PASS' | '❌ FAIL';
  message: string;
  details?: string;
}

const results: TestResult[] = [];

/**
 * Test environment variables
 */
function testEnvironmentVariables(): void {
  console.log('\n📋 Testing Environment Variables...\n');

  if (!supabaseUrl) {
    results.push({
      test: 'VITE_SUPABASE_URL',
      status: '❌ FAIL',
      message: 'Missing VITE_SUPABASE_URL environment variable',
      details: 'Add VITE_SUPABASE_URL to your .env file',
    });
  } else {
    try {
      new URL(supabaseUrl);
      results.push({
        test: 'VITE_SUPABASE_URL',
        status: '✅ PASS',
        message: `URL is valid: ${supabaseUrl}`,
      });
    } catch {
      results.push({
        test: 'VITE_SUPABASE_URL',
        status: '❌ FAIL',
        message: 'Invalid URL format',
        details: `Current value: ${supabaseUrl}`,
      });
    }
  }

  if (!supabaseAnonKey) {
    results.push({
      test: 'VITE_SUPABASE_ANON_KEY',
      status: '❌ FAIL',
      message: 'Missing VITE_SUPABASE_ANON_KEY environment variable',
      details: 'Add VITE_SUPABASE_ANON_KEY to your .env file',
    });
  } else {
    const keyLength = supabaseAnonKey.length;
    if (keyLength > 50) {
      results.push({
        test: 'VITE_SUPABASE_ANON_KEY',
        status: '✅ PASS',
        message: `Key is present (${keyLength} characters)`,
      });
    } else {
      results.push({
        test: 'VITE_SUPABASE_ANON_KEY',
        status: '❌ FAIL',
        message: 'Key appears to be too short',
        details: 'Anon keys are typically 200+ characters',
      });
    }
  }
}

/**
 * Test Supabase client creation
 */
function testClientCreation(): void {
  console.log('\n🔧 Testing Supabase Client Creation...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    results.push({
      test: 'Client Creation',
      status: '❌ FAIL',
      message: 'Cannot create client - missing environment variables',
    });
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    results.push({
      test: 'Client Creation',
      status: '✅ PASS',
      message: 'Supabase client created successfully',
    });
  } catch (error) {
    results.push({
      test: 'Client Creation',
      status: '❌ FAIL',
      message: 'Failed to create Supabase client',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Test database connection
 */
async function testDatabaseConnection(): Promise<void> {
  console.log('\n🗄️  Testing Database Connection...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    results.push({
      test: 'Database Connection',
      status: '❌ FAIL',
      message: 'Cannot test - missing environment variables',
    });
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test 1: Simple query to check connection
    const { data, error } = await supabase.from('organizations').select('count').limit(1);

    if (error) {
      // Check if it's a permissions error (which means connection works)
      if (error.code === 'PGRST116' || error.message.includes('permission denied')) {
        results.push({
          test: 'Database Connection',
          status: '✅ PASS',
          message: 'Database is accessible (RLS may restrict access)',
          details: 'Connection successful, but RLS policies may prevent data access',
        });
      } else if (error.code === '42P01') {
        // Table doesn't exist
        results.push({
          test: 'Database Connection',
          status: '❌ FAIL',
          message: 'Table "organizations" does not exist',
          details: 'Run migrations: npm run db:push',
        });
      } else {
        results.push({
          test: 'Database Connection',
          status: '❌ FAIL',
          message: 'Database query failed',
          details: `${error.code}: ${error.message}`,
        });
      }
    } else {
      results.push({
        test: 'Database Connection',
        status: '✅ PASS',
        message: 'Database connection successful',
        details: 'Can query database tables',
      });
    }

    // Test 2: Check if we can reach the API
    const { data: healthData, error: healthError } = await supabase.rpc('version');

    if (healthError) {
      // RPC might not exist, but if we get a different error, connection works
      if (healthError.code === '42883') {
        results.push({
          test: 'API Endpoint',
          status: '✅ PASS',
          message: 'API endpoint is reachable',
          details: 'Function does not exist (expected)',
        });
      } else {
        results.push({
          test: 'API Endpoint',
          status: '⚠️  WARNING',
          message: 'API endpoint responded with error',
          details: `${healthError.code}: ${healthError.message}`,
        });
      }
    } else {
      results.push({
        test: 'API Endpoint',
        status: '✅ PASS',
        message: 'API endpoint is fully functional',
      });
    }
  } catch (error) {
    results.push({
      test: 'Database Connection',
      status: '❌ FAIL',
      message: 'Failed to connect to database',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Test authentication endpoint
 */
async function testAuthEndpoint(): Promise<void> {
  console.log('\n🔐 Testing Authentication Endpoint...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    results.push({
      test: 'Auth Endpoint',
      status: '❌ FAIL',
      message: 'Cannot test - missing environment variables',
    });
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test auth endpoint by getting session (should work even without user)
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      // Some errors are expected (no session)
      if (error.message.includes('session') || error.message.includes('No session')) {
        results.push({
          test: 'Auth Endpoint',
          status: '✅ PASS',
          message: 'Authentication endpoint is accessible',
          details: 'No active session (expected)',
        });
      } else {
        results.push({
          test: 'Auth Endpoint',
          status: '❌ FAIL',
          message: 'Authentication endpoint error',
          details: error.message,
        });
      }
    } else {
      results.push({
        test: 'Auth Endpoint',
        status: '✅ PASS',
        message: 'Authentication endpoint is accessible',
        details: data.session ? 'Active session found' : 'No active session (expected)',
      });
    }
  } catch (error) {
    results.push({
      test: 'Auth Endpoint',
      status: '❌ FAIL',
      message: 'Failed to reach authentication endpoint',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Test storage endpoint
 */
async function testStorageEndpoint(): Promise<void> {
  console.log('\n📦 Testing Storage Endpoint...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    results.push({
      test: 'Storage Endpoint',
      status: '❌ FAIL',
      message: 'Cannot test - missing environment variables',
    });
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test storage by listing buckets (should work even if empty)
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      if (error.message.includes('permission') || error.message.includes('JWT')) {
        results.push({
          test: 'Storage Endpoint',
          status: '✅ PASS',
          message: 'Storage endpoint is accessible',
          details: 'Permission error (expected without auth)',
        });
      } else {
        results.push({
          test: 'Storage Endpoint',
          status: '⚠️  WARNING',
          message: 'Storage endpoint may have issues',
          details: error.message,
        });
      }
    } else {
      results.push({
        test: 'Storage Endpoint',
        status: '✅ PASS',
        message: 'Storage endpoint is accessible',
        details: `Found ${data.length} bucket(s)`,
      });
    }
  } catch (error) {
    results.push({
      test: 'Storage Endpoint',
      status: '❌ FAIL',
      message: 'Failed to reach storage endpoint',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Test network connectivity
 */
async function testNetworkConnectivity(): Promise<void> {
  console.log('\n🌐 Testing Network Connectivity...\n');

  if (!supabaseUrl) {
    results.push({
      test: 'Network Connectivity',
      status: '❌ FAIL',
      message: 'Cannot test - missing VITE_SUPABASE_URL',
    });
    return;
  }

  try {
    const url = new URL(supabaseUrl);
    const healthUrl = `${url.origin}/rest/v1/`;

    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey || '',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok || response.status === 401 || response.status === 404) {
      // 401/404 means server is reachable, just auth/route issue
      results.push({
        test: 'Network Connectivity',
        status: '✅ PASS',
        message: 'Network connection successful',
        details: `Server responded with status ${response.status}`,
      });
    } else {
      results.push({
        test: 'Network Connectivity',
        status: '⚠️  WARNING',
        message: 'Server responded with unexpected status',
        details: `Status: ${response.status} ${response.statusText}`,
      });
    }
  } catch (error) {
    results.push({
      test: 'Network Connectivity',
      status: '❌ FAIL',
      message: 'Failed to reach Supabase server',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Print test results
 */
function printResults(): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUPABASE CONNECTION TEST RESULTS');
  console.log('='.repeat(60) + '\n');

  results.forEach((result) => {
    console.log(`${result.status} ${result.test}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    console.log('');
  });

  const passed = results.filter((r) => r.status === '✅ PASS').length;
  const failed = results.filter((r) => r.status === '❌ FAIL').length;
  const warnings = results.filter((r) => r.status === '⚠️  WARNING').length;

  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log('='.repeat(60) + '\n');

  if (failed === 0 && warnings === 0) {
    console.log('🎉 All tests passed! Supabase is connected successfully.\n');
    process.exit(0);
  } else if (failed > 0) {
    console.log('❌ Some tests failed. Please check the errors above.\n');
    process.exit(1);
  } else {
    console.log('⚠️  Some warnings detected. Connection may work but check details.\n');
    process.exit(0);
  }
}

/**
 * Main test function
 */
async function runTests(): Promise<void> {
  console.log('\n🚀 Starting Supabase Connection Tests...\n');

  // Run all tests
  testEnvironmentVariables();
  testClientCreation();
  await testNetworkConnectivity();
  await testDatabaseConnection();
  await testAuthEndpoint();
  await testStorageEndpoint();

  // Print results
  printResults();
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});

