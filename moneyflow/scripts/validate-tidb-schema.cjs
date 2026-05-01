/**
 * TiDB Schema Validation Script
 * Validates that TiDB schema is correctly set up
 *
 * Usage: node scripts/validate-tidb-schema.cjs
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.tidb' });

const EXPECTED_TABLES = [
  'organizations',
  'users',
  'customers',
  'products',
  'invoices',
  'invoice_items',
  'transactions',
  'inventory_logs',
  'audit_logs',
  'daily_sales_aggregates',
  'product_sales_aggregates',
  'schema_migrations',
];

const PARTITIONED_TABLES = ['invoices', 'transactions', 'audit_logs'];

const EXPECTED_VIEWS = ['v_overdue_invoices', 'v_low_stock_products', 'v_monthly_revenue'];

async function validateSchema() {
  console.log('🔍 Validating TiDB Schema...\n');

  const config = {
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT || '4000'),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'moneyflow',
  };

  // Add SSL if certificate exists
  const certPath = path.join(__dirname, '..', 'certs', 'isrgrootx1.pem');
  if (fs.existsSync(certPath)) {
    config.ssl = {
      ca: fs.readFileSync(certPath),
      rejectUnauthorized: true,
    };
  }

  let connection;
  const results = { passed: 0, failed: 0, warnings: 0 };
  const issues = [];

  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to TiDB\n');

    // Check 1: Verify all tables exist
    console.log('📋 Checking tables...');
    const [tables] = await connection.execute(
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_type = 'BASE TABLE'
    `,
      [config.database]
    );

    const existingTables = tables.map((t) => t.TABLE_NAME || t.table_name);

    for (const table of EXPECTED_TABLES) {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table}`);
        results.passed++;
      } else {
        console.log(`   ❌ ${table} - MISSING`);
        results.failed++;
        issues.push(`Table '${table}' does not exist`);
      }
    }

    // Check 2: Verify views exist
    console.log('\n📋 Checking views...');
    const [views] = await connection.execute(
      `
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = ?
    `,
      [config.database]
    );

    const existingViews = views.map((v) => v.TABLE_NAME || v.table_name);

    for (const view of EXPECTED_VIEWS) {
      if (existingViews.includes(view)) {
        console.log(`   ✅ ${view}`);
        results.passed++;
      } else {
        console.log(`   ⚠️  ${view} - MISSING (optional)`);
        results.warnings++;
      }
    }

    // Check 3: Verify partitioning
    console.log('\n📋 Checking partitions...');
    for (const table of PARTITIONED_TABLES) {
      if (!existingTables.includes(table)) continue;

      const [partitions] = await connection.execute(
        `
        SELECT COUNT(*) as count 
        FROM information_schema.partitions 
        WHERE table_schema = ? AND table_name = ?
      `,
        [config.database, table]
      );

      const partitionCount = partitions[0].count || partitions[0].COUNT;

      if (partitionCount > 1) {
        console.log(`   ✅ ${table} has ${partitionCount} partitions`);
        results.passed++;
      } else {
        console.log(`   ❌ ${table} is NOT partitioned`);
        results.failed++;
        issues.push(`Table '${table}' should be partitioned`);
      }
    }

    // Check 4: Verify indexes
    console.log('\n📋 Checking critical indexes...');
    const criticalIndexes = [
      { table: 'customers', index: 'idx_org' },
      { table: 'products', index: 'idx_org' },
      { table: 'invoices', index: 'idx_org_status' },
      { table: 'transactions', index: 'idx_org_date' },
    ];

    for (const { table, index } of criticalIndexes) {
      if (!existingTables.includes(table)) continue;

      const [indexes] = await connection.execute(
        `
        SELECT index_name 
        FROM information_schema.statistics 
        WHERE table_schema = ? AND table_name = ? AND index_name = ?
        LIMIT 1
      `,
        [config.database, table, index]
      );

      if (indexes.length > 0) {
        console.log(`   ✅ ${table}.${index}`);
        results.passed++;
      } else {
        console.log(`   ❌ ${table}.${index} - MISSING`);
        results.failed++;
        issues.push(`Index '${index}' on table '${table}' is missing`);
      }
    }

    // Check 5: Verify TiDB settings
    console.log('\n📋 Checking TiDB settings...');
    try {
      const [clustered] = await connection.execute(`SELECT @@tidb_enable_clustered_index as value`);
      const clusteredValue = clustered[0].value;
      if (clusteredValue === 'ON' || clusteredValue === 1) {
        console.log('   ✅ Clustered indexes enabled');
        results.passed++;
      } else {
        console.log('   ⚠️  Clustered indexes not enabled (recommended: ON)');
        results.warnings++;
      }
    } catch {
      console.log('   ℹ️  Could not check clustered index setting');
    }

    // Check 6: Test a sample query
    console.log('\n📋 Testing sample queries...');
    try {
      const start = Date.now();
      await connection.execute('SELECT COUNT(*) FROM customers WHERE organization_id = ?', [
        'test-org',
      ]);
      const duration = Date.now() - start;
      console.log(`   ✅ Customer count query: ${duration}ms`);
      results.passed++;
    } catch (err) {
      console.log(`   ❌ Customer count query failed: ${err.message}`);
      results.failed++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`   ✅ Passed:   ${results.passed}`);
    console.log(`   ❌ Failed:   ${results.failed}`);
    console.log(`   ⚠️  Warnings: ${results.warnings}`);

    if (issues.length > 0) {
      console.log('\n📝 Issues to fix:');
      issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
    }

    const success = results.failed === 0;
    console.log('\n' + (success ? '✅ Schema validation PASSED!' : '❌ Schema validation FAILED!'));

    return success;
  } catch (error) {
    console.error('\n❌ Validation error:', error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run validation
validateSchema()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
