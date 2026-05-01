/**
 * Query Analyzer Service
 * Analyze and optimize database queries
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// ============================================
// Types
// ============================================

interface QueryPlan {
  id: number;
  estRows: number;
  task: string;
  accessObject: string;
  operatorInfo: string;
}

interface TableStats {
  tableName: string;
  rowCount: number;
  dataSize: string;
  indexSize: string;
  autoIncrement: number | null;
}

interface SlowQuery {
  query: string;
  queryTime: number;
  rowsExamined: number;
  rowsSent: number;
  timestamp: Date;
}

// ============================================
// Query Analyzer Service
// ============================================

@Injectable()
export class QueryAnalyzerService {
  private readonly logger = new Logger(QueryAnalyzerService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // Query Analysis
  // ============================================

  /**
   * Explain a query and get execution plan
   */
  async explain(query: string): Promise<QueryPlan[]> {
    try {
      const result = await this.prisma.$queryRawUnsafe(`EXPLAIN ${query}`);
      return result as QueryPlan[];
    } catch (error) {
      this.logger.error(`EXPLAIN failed: ${error}`);
      throw error;
    }
  }

  /**
   * Explain analyze (actually executes the query)
   */
  async explainAnalyze(query: string): Promise<any[]> {
    try {
      const result = await this.prisma.$queryRawUnsafe(`EXPLAIN ANALYZE ${query}`);
      return result as any[];
    } catch (error) {
      this.logger.error(`EXPLAIN ANALYZE failed: ${error}`);
      throw error;
    }
  }

  // ============================================
  // Table Statistics
  // ============================================

  /**
   * Analyze a table to update statistics
   */
  async analyzeTable(tableName: string): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(`ANALYZE TABLE ${tableName}`);
      this.logger.log(`Analyzed table: ${tableName}`);
    } catch (error) {
      this.logger.error(`ANALYZE TABLE failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get table statistics
   */
  async getTableStats(tableName: string): Promise<TableStats | null> {
    try {
      const result = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          table_name as tableName,
          table_rows as rowCount,
          CONCAT(ROUND(data_length / 1024 / 1024, 2), ' MB') as dataSize,
          CONCAT(ROUND(index_length / 1024 / 1024, 2), ' MB') as indexSize,
          auto_increment as autoIncrement
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = '${tableName}'
      `);

      return result[0] || null;
    } catch (error) {
      this.logger.error(`Get table stats failed: ${error}`);
      return null;
    }
  }

  /**
   * Get all table statistics
   */
  async getAllTableStats(): Promise<TableStats[]> {
    try {
      const result = await this.prisma.$queryRawUnsafe<TableStats[]>(`
        SELECT 
          table_name as tableName,
          table_rows as rowCount,
          CONCAT(ROUND(data_length / 1024 / 1024, 2), ' MB') as dataSize,
          CONCAT(ROUND(index_length / 1024 / 1024, 2), ' MB') as indexSize,
          auto_increment as autoIncrement
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        ORDER BY data_length DESC
      `);

      return result;
    } catch (error) {
      this.logger.error(`Get all table stats failed: ${error}`);
      return [];
    }
  }

  // ============================================
  // Index Analysis
  // ============================================

  /**
   * Get index statistics for a table
   */
  async getIndexStats(tableName: string): Promise<any[]> {
    try {
      const result = await this.prisma.$queryRawUnsafe(`
        SELECT 
          index_name,
          column_name,
          cardinality,
          nullable,
          index_type
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = '${tableName}'
        ORDER BY seq_in_index
      `);

      return result as any[];
    } catch (error) {
      this.logger.error(`Get index stats failed: ${error}`);
      return [];
    }
  }

  /**
   * Get unused indexes
   */
  async getUnusedIndexes(): Promise<any[]> {
    try {
      // TiDB-specific query to find potentially unused indexes
      const result = await this.prisma.$queryRawUnsafe(`
        SELECT 
          table_name,
          index_name,
          cardinality
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND index_name != 'PRIMARY'
          AND cardinality = 0
        ORDER BY table_name, index_name
      `);

      return result as any[];
    } catch (error) {
      this.logger.error(`Get unused indexes failed: ${error}`);
      return [];
    }
  }

  // ============================================
  // Performance Monitoring
  // ============================================

  /**
   * Get slow queries (if slow query log is enabled)
   */
  async getSlowQueries(limit: number = 10): Promise<SlowQuery[]> {
    try {
      // Note: This requires slow query log to be enabled in TiDB
      const result = await this.prisma.$queryRawUnsafe<SlowQuery[]>(`
        SELECT 
          query,
          query_time as queryTime,
          rows_examined as rowsExamined,
          rows_sent as rowsSent,
          start_time as timestamp
        FROM information_schema.slow_query
        ORDER BY query_time DESC
        LIMIT ${limit}
      `);

      return result;
    } catch (error) {
      this.logger.warn(`Slow query log not available: ${error}`);
      return [];
    }
  }

  /**
   * Get current running queries
   */
  async getRunningQueries(): Promise<any[]> {
    try {
      const result = await this.prisma.$queryRawUnsafe(`
        SELECT 
          id,
          user,
          host,
          db,
          command,
          time,
          state,
          info
        FROM information_schema.processlist
        WHERE command != 'Sleep'
        ORDER BY time DESC
      `);

      return result as any[];
    } catch (error) {
      this.logger.error(`Get running queries failed: ${error}`);
      return [];
    }
  }

  // ============================================
  // Optimization Hints
  // ============================================

  /**
   * Get optimization recommendations
   */
  async getOptimizationHints(): Promise<string[]> {
    const hints: string[] = [];

    // Check for large tables without partitions
    const largeTable = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT table_name, table_rows
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_rows > 100000
    `);

    for (const table of largeTable) {
      hints.push(
        `Table '${table.table_name}' has ${table.table_rows} rows. Consider partitioning.`
      );
    }

    // Check for tables with no indexes
    const noIndexTables = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT t.table_name
      FROM information_schema.tables t
      LEFT JOIN information_schema.statistics s 
        ON t.table_name = s.table_name AND t.table_schema = s.table_schema
      WHERE t.table_schema = DATABASE()
        AND s.index_name IS NULL
    `);

    for (const table of noIndexTables) {
      hints.push(
        `Table '${table.table_name}' has no indexes. Consider adding appropriate indexes.`
      );
    }

    return hints;
  }
}
