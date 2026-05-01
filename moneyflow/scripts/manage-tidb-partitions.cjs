/**
 * TiDB Partition Management Script
 * Manages partitions for time-series tables (invoices, transactions, audit_logs)
 *
 * Usage:
 *   node scripts/manage-tidb-partitions.cjs add     # Add future partitions
 *   node scripts/manage-tidb-partitions.cjs status  # Check partition status
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.tidb' });

const PARTITIONED_TABLES = {
  invoices: {
    column: 'issue_date',
    type: 'MONTH', // YEAR*100+MONTH
  },
  transactions: {
    column: 'transaction_date',
    type: 'MONTH',
  },
  audit_logs: {
    column: 'created_at',
    type: 'QUARTER', // TO_DAYS
  },
};

async function getConnection() {
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

  return mysql.createConnection(config);
}

async function getExistingPartitions(connection, tableName) {
  const [partitions] = await connection.execute(
    `
    SELECT partition_name, partition_description, table_rows
    FROM information_schema.partitions
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND partition_name IS NOT NULL
    ORDER BY partition_ordinal_position
  `,
    [tableName]
  );

  return partitions;
}

async function addMonthlyPartitions(connection, tableName, monthsAhead = 12) {
  console.log(`\n📅 Adding partitions to ${tableName}...`);

  const currentDate = new Date();
  let added = 0;

  for (let i = 0; i <= monthsAhead; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + i);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const partitionName = `p${year}${month.toString().padStart(2, '0')}`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const lessThan = nextYear * 100 + nextMonth;

    try {
      await connection.execute(`
        ALTER TABLE ${tableName} ADD PARTITION (
          PARTITION ${partitionName} VALUES LESS THAN (${lessThan})
        )
      `);
      console.log(`   ✅ Added partition ${partitionName}`);
      added++;
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log(`   ⏭️  Partition ${partitionName} already exists`);
      } else {
        console.log(`   ❌ Failed to add ${partitionName}: ${error.message}`);
      }
    }
  }

  return added;
}

async function addQuarterlyPartitions(connection, tableName, quartersAhead = 8) {
  console.log(`\n📅 Adding quarterly partitions to ${tableName}...`);

  const currentDate = new Date();
  let added = 0;

  for (let i = 0; i <= quartersAhead; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + i * 3);

    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;

    const partitionName = `p_${year}_q${quarter}`;

    // Calculate next quarter start date
    const nextQuarterMonth = quarter * 3;
    let nextDate = new Date(year, nextQuarterMonth, 1);
    if (nextQuarterMonth >= 12) {
      nextDate = new Date(year + 1, 0, 1);
    }

    const toDays = Math.floor(nextDate.getTime() / (24 * 60 * 60 * 1000)) + 719528; // MySQL TO_DAYS offset

    try {
      await connection.execute(`
        ALTER TABLE ${tableName} ADD PARTITION (
          PARTITION ${partitionName} VALUES LESS THAN (${toDays})
        )
      `);
      console.log(`   ✅ Added partition ${partitionName}`);
      added++;
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
        console.log(`   ⏭️  Partition ${partitionName} already exists`);
      } else {
        console.log(`   ❌ Failed to add ${partitionName}: ${error.message}`);
      }
    }
  }

  return added;
}

async function showPartitionStatus(connection) {
  console.log('\n📊 PARTITION STATUS');
  console.log('='.repeat(60));

  for (const [tableName, config] of Object.entries(PARTITIONED_TABLES)) {
    console.log(`\n📋 ${tableName.toUpperCase()}`);

    const partitions = await getExistingPartitions(connection, tableName);

    if (partitions.length === 0) {
      console.log('   ⚠️  No partitions found (table may not be partitioned)');
      continue;
    }

    console.log(`   Total partitions: ${partitions.length}`);
    console.log('   Recent partitions:');

    // Show last 6 partitions
    const recent = partitions.slice(-6);
    for (const p of recent) {
      const name = p.PARTITION_NAME || p.partition_name;
      const rows = p.TABLE_ROWS || p.table_rows || 0;
      console.log(`      - ${name}: ${rows} rows`);
    }
  }
}

async function main() {
  const command = process.argv[2] || 'status';

  console.log('🗄️  TiDB Partition Manager');
  console.log('='.repeat(60));

  let connection;

  try {
    connection = await getConnection();
    console.log('✅ Connected to TiDB\n');

    switch (command) {
      case 'add':
        console.log('📅 Adding future partitions...');

        // Add monthly partitions for invoices and transactions
        await addMonthlyPartitions(connection, 'invoices', 12);
        await addMonthlyPartitions(connection, 'transactions', 12);

        // Add quarterly partitions for audit_logs
        await addQuarterlyPartitions(connection, 'audit_logs', 8);

        console.log('\n✅ Partition management complete!');
        break;

      case 'status':
        await showPartitionStatus(connection);
        break;

      case 'drop-old':
        console.log('⚠️  Drop old partitions not implemented');
        console.log('   This should be done manually to avoid data loss');
        console.log('   Example: ALTER TABLE invoices DROP PARTITION p202301;');
        break;

      default:
        console.log('Usage:');
        console.log('  node scripts/manage-tidb-partitions.cjs add     # Add future partitions');
        console.log('  node scripts/manage-tidb-partitions.cjs status  # Check partition status');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
