/**
 * Final Data Sync Script
 * Synchronizes data from Supabase to TiDB before cutover
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TIDB_API_URL = process.env.TIDB_API_URL || 'http://localhost:3001';
const AUTH_TOKEN = process.env.AUTH_TOKEN!;

// ============================================
// Types
// ============================================

interface SyncResult {
  table: string;
  fetched: number;
  synced: number;
  errors: number;
  duration: number;
}

interface SyncConfig {
  table: string;
  primaryKey: string;
  orderBy: string;
  batchSize: number;
}

// ============================================
// Tables to Sync
// ============================================

const SYNC_TABLES: SyncConfig[] = [
  { table: 'organizations', primaryKey: 'id', orderBy: 'created_at', batchSize: 100 },
  { table: 'users', primaryKey: 'id', orderBy: 'created_at', batchSize: 100 },
  { table: 'customers', primaryKey: 'id', orderBy: 'updated_at', batchSize: 500 },
  { table: 'products', primaryKey: 'id', orderBy: 'updated_at', batchSize: 500 },
  { table: 'invoices', primaryKey: 'id', orderBy: 'updated_at', batchSize: 500 },
  { table: 'invoice_items', primaryKey: 'id', orderBy: 'created_at', batchSize: 1000 },
  { table: 'transactions', primaryKey: 'id', orderBy: 'created_at', batchSize: 500 },
  { table: 'inventory_logs', primaryKey: 'id', orderBy: 'created_at', batchSize: 1000 },
];

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
// Sync Functions
// ============================================

async function fetchFromSupabase(
  table: string,
  lastSyncTime: Date,
  offset: number,
  limit: number
): Promise<any[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(table)
    .select('*')
    .gte('updated_at', lastSyncTime.toISOString())
    .order('updated_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch ${table}: ${error.message}`);
  }

  return data || [];
}

async function upsertToTiDB(table: string, records: any[]): Promise<number> {
  if (records.length === 0) return 0;

  try {
    const response = await fetch(`${TIDB_API_URL}/api/v1/sync/${table}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ records }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TiDB upsert failed: ${error}`);
    }

    const result = await response.json();
    return result.upserted || records.length;
  } catch (error) {
    console.error(`Error upserting to TiDB:`, error);
    throw error;
  }
}

async function syncTable(config: SyncConfig, lastSyncTime: Date): Promise<SyncResult> {
  const startTime = Date.now();
  let fetched = 0;
  let synced = 0;
  let errors = 0;
  let offset = 0;

  console.log(`\n📦 Syncing ${config.table}...`);
  console.log(`   Since: ${lastSyncTime.toISOString()}`);

  try {
    while (true) {
      // Fetch batch from Supabase
      const records = await fetchFromSupabase(config.table, lastSyncTime, offset, config.batchSize);

      if (records.length === 0) break;

      fetched += records.length;
      console.log(`   Fetched ${fetched} records...`);

      // Upsert to TiDB
      try {
        const upserted = await upsertToTiDB(config.table, records);
        synced += upserted;
      } catch (err) {
        console.error(`   Error syncing batch:`, err);
        errors += records.length;
      }

      // Check if we got less than batch size (end of data)
      if (records.length < config.batchSize) break;

      offset += config.batchSize;
    }
  } catch (err) {
    console.error(`   Fatal error syncing ${config.table}:`, err);
    errors++;
  }

  const duration = Date.now() - startTime;
  console.log(`   ✅ Complete: ${synced} synced, ${errors} errors (${duration}ms)`);

  return {
    table: config.table,
    fetched,
    synced,
    errors,
    duration,
  };
}

// ============================================
// Validation
// ============================================

async function validateCounts(): Promise<boolean> {
  console.log('\n🔍 Validating record counts...');

  const client = getSupabaseClient();
  let allValid = true;

  for (const config of SYNC_TABLES) {
    // Get Supabase count
    const { count: supabaseCount, error } = await client
      .from(config.table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`   ❌ ${config.table}: Failed to get Supabase count`);
      allValid = false;
      continue;
    }

    // Get TiDB count
    try {
      const response = await fetch(`${TIDB_API_URL}/api/v1/sync/${config.table}/count`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });

      if (!response.ok) {
        console.error(`   ❌ ${config.table}: Failed to get TiDB count`);
        allValid = false;
        continue;
      }

      const { count: tidbCount } = await response.json();
      const diff = Math.abs((supabaseCount || 0) - tidbCount);
      const diffPercent = supabaseCount ? (diff / supabaseCount) * 100 : 0;

      if (diffPercent > 0.1) {
        console.error(
          `   ❌ ${config.table}: Count mismatch (Supabase: ${supabaseCount}, TiDB: ${tidbCount}, diff: ${diffPercent.toFixed(2)}%)`
        );
        allValid = false;
      } else {
        console.log(
          `   ✅ ${config.table}: ${supabaseCount} records (diff: ${diffPercent.toFixed(2)}%)`
        );
      }
    } catch (err) {
      console.error(`   ❌ ${config.table}: Validation error`);
      allValid = false;
    }
  }

  return allValid;
}

// ============================================
// Main Sync Function
// ============================================

async function runFinalSync() {
  console.log('═'.repeat(60));
  console.log('           FINAL DATA SYNC - PRODUCTION CUTOVER');
  console.log('═'.repeat(60));
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`TiDB API: ${TIDB_API_URL}`);

  // Determine last sync time (default: 1 hour ago for incremental)
  const lastSyncArg = process.argv.find((arg) => arg.startsWith('--since='));
  let lastSyncTime: Date;

  if (lastSyncArg) {
    lastSyncTime = new Date(lastSyncArg.split('=')[1]);
  } else if (process.argv.includes('--full')) {
    lastSyncTime = new Date(0); // Full sync
    console.log('\n⚠️ Running FULL SYNC (all records)');
  } else {
    lastSyncTime = new Date(Date.now() - 60 * 60 * 1000); // Last hour
    console.log('\n📝 Running incremental sync (last hour)');
  }

  const results: SyncResult[] = [];

  // Sync each table
  for (const config of SYNC_TABLES) {
    const result = await syncTable(config, lastSyncTime);
    results.push(result);
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('                      SYNC SUMMARY');
  console.log('═'.repeat(60));

  let totalFetched = 0;
  let totalSynced = 0;
  let totalErrors = 0;
  let totalDuration = 0;

  console.log('\n┌─────────────────────┬──────────┬──────────┬──────────┬──────────┐');
  console.log('│ Table               │ Fetched  │ Synced   │ Errors   │ Duration │');
  console.log('├─────────────────────┼──────────┼──────────┼──────────┼──────────┤');

  for (const result of results) {
    const table = result.table.padEnd(19);
    const fetched = result.fetched.toString().padStart(8);
    const synced = result.synced.toString().padStart(8);
    const errors = result.errors.toString().padStart(8);
    const duration = `${result.duration}ms`.padStart(8);

    console.log(`│ ${table} │ ${fetched} │ ${synced} │ ${errors} │ ${duration} │`);

    totalFetched += result.fetched;
    totalSynced += result.synced;
    totalErrors += result.errors;
    totalDuration += result.duration;
  }

  console.log('├─────────────────────┼──────────┼──────────┼──────────┼──────────┤');
  console.log(
    `│ TOTAL               │ ${totalFetched.toString().padStart(8)} │ ${totalSynced.toString().padStart(8)} │ ${totalErrors.toString().padStart(8)} │ ${`${totalDuration}ms`.padStart(8)} │`
  );
  console.log('└─────────────────────┴──────────┴──────────┴──────────┴──────────┘');

  // Validate counts
  if (!process.argv.includes('--skip-validation')) {
    const isValid = await validateCounts();

    if (!isValid) {
      console.error('\n❌ VALIDATION FAILED - Review discrepancies before cutover');
      process.exit(1);
    }
  }

  console.log('\n═'.repeat(60));
  console.log(`Completed: ${new Date().toISOString()}`);

  if (totalErrors > 0) {
    console.error('\n⚠️ SYNC COMPLETED WITH ERRORS');
    console.error('Review errors before proceeding with cutover');
    process.exit(1);
  }

  console.log('\n✅ SYNC COMPLETED SUCCESSFULLY');
  console.log('\nNext steps:');
  console.log('1. Verify data integrity');
  console.log('2. Run smoke tests');
  console.log('3. Proceed with traffic switch');
}

// ============================================
// Entry Point
// ============================================

runFinalSync().catch((err) => {
  console.error('Fatal error during sync:', err);
  process.exit(1);
});
