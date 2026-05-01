import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TiDB Direct Service
 * Alternative to Prisma for raw SQL queries and complex operations
 * Uses mysql2 connection pool for better control
 */
@Injectable()
export class TiDBDirectService implements OnModuleDestroy {
  private readonly logger = new Logger(TiDBDirectService.name);
  private pool: mysql.Pool | null = null;

  constructor(private config: ConfigService) {
    this.initializePool();
  }

  private initializePool() {
    const host = this.config.get<string>('TIDB_HOST');
    const port = this.config.get<number>('TIDB_PORT', 4000);
    const user = this.config.get<string>('TIDB_USER');
    const password = this.config.get<string>('TIDB_PASSWORD');
    const database = this.config.get<string>('TIDB_DATABASE', 'moneyflow');

    if (!host || !user || !password) {
      this.logger.warn('TiDB credentials not configured - direct service disabled');
      return;
    }

    const poolConfig: mysql.PoolOptions = {
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 10,
      queueLimit: 0,
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    };

    // Add SSL if certificate exists
    const certPath = this.config.get<string>('TIDB_CA_CERT_PATH');
    if (certPath && fs.existsSync(certPath)) {
      poolConfig.ssl = {
        ca: fs.readFileSync(certPath),
        rejectUnauthorized: true,
      };
      this.logger.log('TiDB SSL certificate loaded');
    }

    this.pool = mysql.createPool(poolConfig);
    this.logger.log('TiDB connection pool initialized');
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('TiDB connection pool closed');
    }
  }

  /**
   * Execute a SELECT query
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.pool) throw new Error('TiDB pool not initialized');

    const [rows] = await this.pool.execute(sql, params);
    return rows as T[];
  }

  /**
   * Execute INSERT/UPDATE/DELETE
   */
  async execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
    if (!this.pool) throw new Error('TiDB pool not initialized');

    const [result] = await this.pool.execute(sql, params);
    return result as mysql.ResultSetHeader;
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    if (!this.pool) throw new Error('TiDB pool not initialized');

    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      this.logger.error('Transaction rolled back:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Batch insert with optimized performance
   */
  async batchInsert(
    table: string,
    columns: string[],
    rows: any[][],
    chunkSize: number = 100
  ): Promise<number> {
    if (!this.pool) throw new Error('TiDB pool not initialized');
    if (rows.length === 0) return 0;

    let totalInserted = 0;

    // Process in chunks
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);

      const placeholders = chunk.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');

      const flatValues = chunk.flat();

      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;

      const result = await this.execute(sql, flatValues);
      totalInserted += result.affectedRows;
    }

    return totalInserted;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; latency: number }> {
    if (!this.pool) {
      return { status: 'disabled', latency: -1 };
    }

    const start = Date.now();
    try {
      await this.query('SELECT 1');
      return {
        status: 'healthy',
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
      };
    }
  }

  /**
   * Get TiDB version info
   */
  async getVersion(): Promise<{ mysql: string; tidb: string }> {
    const [result] = await this.query<{ version: string; tidb_version: string }>(
      'SELECT VERSION() as version, TIDB_VERSION() as tidb_version'
    );
    return {
      mysql: result.version,
      tidb: result.tidb_version,
    };
  }

  /**
   * Analyze table for query optimization
   */
  async analyzeTable(tableName: string): Promise<void> {
    await this.execute(`ANALYZE TABLE ${tableName}`);
    this.logger.log(`Analyzed table: ${tableName}`);
  }

  /**
   * Get table statistics
   */
  async getTableStats(tableName: string): Promise<{
    rows: number;
    dataSize: number;
    indexSize: number;
  }> {
    const [stats] = await this.query<{
      TABLE_ROWS: number;
      DATA_LENGTH: number;
      INDEX_LENGTH: number;
    }>(
      `SELECT TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH 
       FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    );

    return {
      rows: stats?.TABLE_ROWS || 0,
      dataSize: stats?.DATA_LENGTH || 0,
      indexSize: stats?.INDEX_LENGTH || 0,
    };
  }
}
