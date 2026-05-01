/**
 * TiDB Cloud Connection Test Script
 * Tests connectivity to TiDB Cloud Serverless cluster
 *
 * Usage: node scripts/test-tidb-connection.cjs
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.tidb' });

async function testConnection() {
  console.log('🔌 Testing TiDB Cloud Connection...\n');

  const config = {
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT || '4000'),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'moneyflow',
    connectTimeout: 15000,
  };

  // Add SSL if certificate exists
  const certPath = path.join(__dirname, '..', 'certs', 'isrgrootx1.pem');
  if (fs.existsSync(certPath)) {
    config.ssl = {
      ca: fs.readFileSync(certPath),
      rejectUnauthorized: true,
    };
    console.log('🔒 SSL certificate loaded');
  } else {
    console.log('⚠️  SSL certificate not found at:', certPath);
    console.log('   Using sslaccept=strict mode\n');
  }

  // Validate required config
  const missing = [];
  if (!config.host) missing.push('TIDB_HOST');
  if (!config.user) missing.push('TIDB_USER');
  if (!config.password) missing.push('TIDB_PASSWORD');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.log('\nCreate a .env.tidb file with:');
    console.log('  TIDB_HOST=gateway01.region.prod.aws.tidbcloud.com');
    console.log('  TIDB_PORT=4000');
    console.log('  TIDB_USER=your_username');
    console.log('  TIDB_PASSWORD=your_password');
    console.log('  TIDB_DATABASE=moneyflow');
    process.exit(1);
  }

  console.log('📡 Connection Details:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   SSL: ${config.ssl ? 'Enabled' : 'Using default'}\n`);

  let connection;
  try {
    // Test 1: Basic connection
    console.log('Test 1: Establishing connection...');
    const startConnect = Date.now();
    connection = await mysql.createConnection(config);
    console.log(`   ✅ Connected in ${Date.now() - startConnect}ms\n`);

    // Test 2: Get TiDB version
    console.log('Test 2: Getting TiDB version...');
    const [versionRows] = await connection.execute(
      'SELECT VERSION() as version, TIDB_VERSION() as tidb_version'
    );
    console.log(`   ✅ MySQL Version: ${versionRows[0].version}`);
    console.log(`   ✅ TiDB Version: ${versionRows[0].tidb_version}\n`);

    // Test 3: Check cluster status
    console.log('Test 3: Checking cluster status...');
    const [statusRows] = await connection.execute(
      'SELECT @@tidb_enable_clustered_index as clustered'
    );
    console.log(`   ✅ Clustered Index: ${statusRows[0].clustered}\n`);

    // Test 4: Simple query performance
    console.log('Test 4: Query performance...');
    const iterations = 10;
    let totalTime = 0;
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await connection.execute('SELECT 1');
      totalTime += Date.now() - start;
    }
    const avgLatency = Math.round(totalTime / iterations);
    console.log(`   ✅ Average latency: ${avgLatency}ms (${iterations} iterations)\n`);

    // Test 5: Check tables (if any exist)
    console.log('Test 5: Checking existing tables...');
    const [tables] = await connection.execute(
      `
      SELECT table_name, table_rows 
      FROM information_schema.tables 
      WHERE table_schema = ?
      ORDER BY table_name
    `,
      [config.database]
    );

    if (tables.length > 0) {
      console.log(`   ✅ Found ${tables.length} tables:`);
      tables.forEach((t) => console.log(`      - ${t.table_name} (${t.table_rows || 0} rows)`));
    } else {
      console.log('   ℹ️  No tables found (database is empty)');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All connection tests passed!');
    console.log('='.repeat(50) + '\n');

    console.log('📝 Next Steps:');
    console.log('   1. Run the schema migration: npm run tidb:schema');
    console.log('   2. Generate Prisma client: npx prisma generate');
    console.log('   3. Run validation: npm run tidb:validate');

    return true;
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);

    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Tip: Check your TIDB_HOST value');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Tip: Check your TIDB_USER and TIDB_PASSWORD');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Tip: Database does not exist. Create it in TiDB Cloud console');
    } else if (error.message.includes('SSL')) {
      console.log('\n💡 Tip: Download the CA certificate from TiDB Cloud dashboard');
      console.log('   Place it at: certs/isrgrootx1.pem');
    }

    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed');
    }
  }
}

// Run test
testConnection()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
