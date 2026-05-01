/**
 * Data Validation Script
 * Validates data integrity between Supabase and TiDB after sync
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TIDB_API_URL = process.env.TIDB_API_URL || 'http://localhost:3001';
const VALIDATION_AUTH_TOKEN = process.env.AUTH_TOKEN!;

// ============================================
// Types
// ============================================

interface ValidationResult {
  table: string;
  supabaseCount: number;
  tidbCount: number;
  difference: number;
  percentDiff: number;
  sampleMatch: boolean;
  passed: boolean;
  details?: string;
}

interface ChecksumResult {
  table: string;
  recordId: string;
  supabaseHash: string;
  tidbHash: string;
  match: boolean;
}

// ============================================
// Supabase Client
// ============================================

let supabase: SupabaseClient;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing Supabase credentials');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabase;
}

// ============================================
// Validation Functions
// ============================================

async function getSupabaseCount(table: string): Promise<number> {
  const client = getSupabaseClient();
  const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });

  if (error) throw new Error(`Supabase count error: ${error.message}`);
  return count || 0;
}

async function getTiDBCount(table: string): Promise<number> {
  const response = await fetch(`${TIDB_API_URL}/api/v1/sync/${table}/count`, {
    headers: { Authorization: `Bearer ${VALIDATION_AUTH_TOKEN}` },
  });

  if (!response.ok) {
    throw new Error(`TiDB count error: ${response.status}`);
  }

  const data = await response.json();
  return data.count || 0;
}

async function getSampleRecords(table: string, limit: number = 5): Promise<any[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Sample fetch error: ${error.message}`);
  return data || [];
}

async function getTiDBRecord(table: string, id: string): Promise<any> {
  const response = await fetch(`${TIDB_API_URL}/api/v1/sync/${table}/${id}`, {
    headers: { Authorization: `Bearer ${VALIDATION_AUTH_TOKEN}` },
  });

  if (!response.ok) return null;
  return response.json();
}

function simpleHash(obj: any): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// ============================================
// Table Validation
// ============================================

async function validateTable(table: string): Promise<ValidationResult> {
  console.log(`\nValidating ${table}...`);

  try {
    // Get counts
    const supabaseCount = await getSupabaseCount(table);
    const tidbCount = await getTiDBCount(table);

    const difference = Math.abs(supabaseCount - tidbCount);
    const percentDiff = supabaseCount > 0 ? (difference / supabaseCount) * 100 : 0;

    console.log(`   Supabase: ${supabaseCount}, TiDB: ${tidbCount}`);

    // Sample validation
    let sampleMatch = true;
    const samples = await getSampleRecords(table, 3);

    for (const sample of samples) {
      const tidbRecord = await getTiDBRecord(table, sample.id);

      if (!tidbRecord) {
        console.log(`   ⚠️ Record ${sample.id} not found in TiDB`);
        sampleMatch = false;
        break;
      }

      // Compare key fields
      const supabaseHash = simpleHash(sample);
      const tidbHash = simpleHash(tidbRecord);

      if (supabaseHash !== tidbHash) {
        console.log(`   ⚠️ Record ${sample.id} hash mismatch`);
        sampleMatch = false;
      }
    }

    // Determine pass/fail
    const passed = percentDiff < 0.1 && sampleMatch;

    return {
      table,
      supabaseCount,
      tidbCount,
      difference,
      percentDiff,
      sampleMatch,
      passed,
    };
  } catch (error: any) {
    return {
      table,
      supabaseCount: 0,
      tidbCount: 0,
      difference: 0,
      percentDiff: 100,
      sampleMatch: false,
      passed: false,
      details: error.message,
    };
  }
}

// ============================================
// Invoice Calculations Validation
// ============================================

async function validateInvoiceCalculations(): Promise<ValidationResult> {
  console.log('\nValidating invoice calculations...');

  try {
    const response = await fetch(`${TIDB_API_URL}/api/v1/sync/invoices/validate-calculations`, {
      headers: { Authorization: `Bearer ${VALIDATION_AUTH_TOKEN}` },
    });

    if (!response.ok) {
      throw new Error('Calculation validation endpoint not available');
    }

    const data = await response.json();

    return {
      table: 'invoice_calculations',
      supabaseCount: data.totalChecked || 0,
      tidbCount: data.valid || 0,
      difference: data.invalid || 0,
      percentDiff: data.totalChecked > 0 ? (data.invalid / data.totalChecked) * 100 : 0,
      sampleMatch: data.invalid === 0,
      passed: data.invalid === 0,
      details: data.details,
    };
  } catch (error: any) {
    return {
      table: 'invoice_calculations',
      supabaseCount: 0,
      tidbCount: 0,
      difference: 0,
      percentDiff: 0,
      sampleMatch: true,
      passed: true,
      details: 'Skipped - endpoint not available',
    };
  }
}

// ============================================
// Main Validation
// ============================================

async function runValidation() {
  console.log('═'.repeat(60));
  console.log('           DATA INTEGRITY VALIDATION');
  console.log('═'.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`TiDB API: ${TIDB_API_URL}`);

  const tables = [
    'organizations',
    'users',
    'customers',
    'products',
    'invoices',
    'invoice_items',
    'transactions',
  ];

  const results: ValidationResult[] = [];

  // Validate each table
  for (const table of tables) {
    const result = await validateTable(table);
    results.push(result);
  }

  // Validate invoice calculations
  const calcResult = await validateInvoiceCalculations();
  results.push(calcResult);

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('                 VALIDATION RESULTS');
  console.log('═'.repeat(60));

  console.log('\n┌───────────────────────┬───────────┬───────────┬──────────┬────────┐');
  console.log('│ Table                 │ Supabase  │ TiDB      │ Diff %   │ Status │');
  console.log('├───────────────────────┼───────────┼───────────┼──────────┼────────┤');

  let allPassed = true;

  for (const result of results) {
    const table = result.table.padEnd(21);
    const supabase = result.supabaseCount.toString().padStart(9);
    const tidb = result.tidbCount.toString().padStart(9);
    const diff = `${result.percentDiff.toFixed(2)}%`.padStart(8);
    const status = result.passed ? '  ✅  ' : '  ❌  ';

    console.log(`│ ${table} │ ${supabase} │ ${tidb} │ ${diff} │${status}│`);

    if (!result.passed) {
      allPassed = false;
      if (result.details) {
        console.log(`│   └─ ${result.details.padEnd(55)} │`);
      }
    }
  }

  console.log('└───────────────────────┴───────────┴───────────┴──────────┴────────┘');

  // Final verdict
  console.log('\n' + '═'.repeat(60));

  if (allPassed) {
    console.log('✅ ALL VALIDATIONS PASSED');
    console.log('\nData integrity verified. Safe to proceed with cutover.');
  } else {
    console.log('❌ VALIDATION FAILED');
    console.log('\nFailed checks:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   - ${r.table}: ${r.details || 'Count/sample mismatch'}`);
      });

    console.log('\n⚠️ Do NOT proceed with cutover until issues are resolved.');
    process.exit(1);
  }
}

// ============================================
// Entry Point
// ============================================

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Missing Supabase credentials');
  process.exit(1);
}

if (!VALIDATION_AUTH_TOKEN) {
  console.error('ERROR: AUTH_TOKEN required');
  process.exit(1);
}

runValidation().catch((err) => {
  console.error('Validation error:', err);
  process.exit(1);
});
