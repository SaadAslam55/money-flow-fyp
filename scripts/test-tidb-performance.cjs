/**
 * TiDB Performance Test Script
 * Tests query performance and latency
 *
 * Usage: node scripts/test-tidb-performance.cjs
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config({ path: '.env.tidb' });

// Generate UUID
function uuid() {
  return crypto.randomUUID();
}

async function runPerformanceTests() {
  console.log('⚡ Running TiDB Performance Tests...\n');

  const config = {
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT || '4000'),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'moneyflow',
  };

  const certPath = path.join(__dirname, '..', 'certs', 'isrgrootx1.pem');
  if (fs.existsSync(certPath)) {
    config.ssl = {
      ca: fs.readFileSync(certPath),
      rejectUnauthorized: true,
    };
  }

  let connection;
  const testOrgId = `perf-test-${Date.now()}`;
  const results = [];

  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to TiDB\n');

    // Test 1: Simple SELECT
    console.log('Test 1: Simple SELECT (10 iterations)');
    let totalTime = 0;
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await connection.execute('SELECT 1');
      totalTime += Date.now() - start;
    }
    const avgSimple = Math.round(totalTime / 10);
    results.push({ test: 'Simple SELECT', latency: avgSimple, status: '✅' });
    console.log(`   Average: ${avgSimple}ms\n`);

    // Test 2: Insert Performance
    console.log('Test 2: INSERT customers (100 records)');
    const insertStart = Date.now();
    const insertPromises = [];

    for (let i = 0; i < 100; i++) {
      insertPromises.push(
        connection.execute(
          `INSERT INTO customers (id, organization_id, name, email, created_at) 
           VALUES (?, ?, ?, ?, NOW())`,
          [uuid(), testOrgId, `Test Customer ${i}`, `test${i}@perf.test`]
        )
      );
    }

    await Promise.all(insertPromises);
    const insertTime = Date.now() - insertStart;
    const insertPerRecord = Math.round(insertTime / 100);
    results.push({
      test: 'INSERT (100 records)',
      latency: insertTime,
      status: '✅',
      perRecord: insertPerRecord,
    });
    console.log(`   Total: ${insertTime}ms (${insertPerRecord}ms per record)\n`);

    // Test 3: SELECT with WHERE
    console.log('Test 3: SELECT with organization filter');
    totalTime = 0;
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await connection.execute('SELECT * FROM customers WHERE organization_id = ? LIMIT 50', [
        testOrgId,
      ]);
      totalTime += Date.now() - start;
    }
    const avgSelect = Math.round(totalTime / 10);
    results.push({ test: 'SELECT with WHERE', latency: avgSelect, status: '✅' });
    console.log(`   Average: ${avgSelect}ms\n`);

    // Test 4: COUNT aggregation
    console.log('Test 4: COUNT aggregation');
    totalTime = 0;
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await connection.execute(
        'SELECT COUNT(*) as count FROM customers WHERE organization_id = ?',
        [testOrgId]
      );
      totalTime += Date.now() - start;
    }
    const avgCount = Math.round(totalTime / 10);
    results.push({ test: 'COUNT aggregation', latency: avgCount, status: '✅' });
    console.log(`   Average: ${avgCount}ms\n`);

    // Test 5: UPDATE performance
    console.log('Test 5: UPDATE records');
    const updateStart = Date.now();
    await connection.execute(`UPDATE customers SET status = 'INACTIVE' WHERE organization_id = ?`, [
      testOrgId,
    ]);
    const updateTime = Date.now() - updateStart;
    results.push({ test: 'UPDATE (100 records)', latency: updateTime, status: '✅' });
    console.log(`   Total: ${updateTime}ms\n`);

    // Test 6: Complex JOIN (if products table exists)
    console.log('Test 6: Complex query simulation');
    totalTime = 0;
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await connection.execute(
        `
        SELECT 
          c.name,
          c.email,
          c.status,
          c.created_at
        FROM customers c
        WHERE c.organization_id = ?
        ORDER BY c.created_at DESC
        LIMIT 20
      `,
        [testOrgId]
      );
      totalTime += Date.now() - start;
    }
    const avgComplex = Math.round(totalTime / 5);
    results.push({ test: 'Complex query', latency: avgComplex, status: '✅' });
    console.log(`   Average: ${avgComplex}ms\n`);

    // Test 7: DELETE performance
    console.log('Test 7: DELETE cleanup');
    const deleteStart = Date.now();
    await connection.execute('DELETE FROM customers WHERE organization_id = ?', [testOrgId]);
    const deleteTime = Date.now() - deleteStart;
    results.push({ test: 'DELETE (100 records)', latency: deleteTime, status: '✅' });
    console.log(`   Total: ${deleteTime}ms\n`);

    // Summary
    console.log('='.repeat(60));
    console.log('📊 PERFORMANCE SUMMARY');
    console.log('='.repeat(60));
    console.table(
      results.map((r) => ({
        Test: r.test,
        'Latency (ms)': r.latency,
        Status: r.status,
      }))
    );

    // Performance grades
    console.log('\n📈 Performance Analysis:');

    const simpleLatency = results.find((r) => r.test === 'Simple SELECT')?.latency || 0;
    if (simpleLatency < 10) {
      console.log('   🚀 Excellent: Connection latency < 10ms');
    } else if (simpleLatency < 50) {
      console.log('   ✅ Good: Connection latency < 50ms');
    } else if (simpleLatency < 100) {
      console.log('   ⚠️  Fair: Connection latency < 100ms');
    } else {
      console.log('   🔴 Slow: Connection latency > 100ms - consider closer region');
    }

    const avgLatency = Math.round(results.reduce((sum, r) => sum + r.latency, 0) / results.length);
    console.log(`   📊 Average latency across all tests: ${avgLatency}ms`);

    console.log('\n✅ Performance tests completed successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Performance test error:', error.message);

    // Cleanup on error
    if (connection) {
      try {
        await connection.execute('DELETE FROM customers WHERE organization_id = ?', [testOrgId]);
      } catch {}
    }

    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed');
    }
  }
}

// Run tests
runPerformanceTests()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
