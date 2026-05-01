import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Write Strategy for dual-write migration
 *
 * - supabase-only: All writes go to Supabase (initial state)
 * - dual-write: Write to both, Supabase is source of truth
 * - tidb-primary: TiDB is primary, sync auth-related to Supabase
 * - tidb-only: All writes go to TiDB (final state)
 */
export type WriteStrategy = 'supabase-only' | 'dual-write' | 'tidb-primary' | 'tidb-only';

export interface DualWriteResult<T = any> {
  supabase?: T;
  tidb?: T;
  primary: T;
  strategy: WriteStrategy;
}

export interface FailedWriteEntry {
  timestamp: string;
  table: string;
  operation: string;
  data: any;
  error: string;
  retryCount: number;
}

@Injectable()
export class DualWriteService implements OnModuleInit {
  private readonly logger = new Logger(DualWriteService.name);
  private strategy: WriteStrategy;
  private failedWritesPath: string;

  constructor(private config: ConfigService) {
    this.strategy = this.config.get<WriteStrategy>('WRITE_STRATEGY', 'supabase-only');
    this.failedWritesPath = path.join(process.cwd(), 'logs', 'failed-writes.json');
  }

  onModuleInit() {
    this.logger.log(`🔄 Dual-write strategy: ${this.strategy}`);

    // Ensure logs directory exists
    const logsDir = path.dirname(this.failedWritesPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  /**
   * Get current write strategy
   */
  getStrategy(): WriteStrategy {
    return this.strategy;
  }

  /**
   * Change write strategy (useful for gradual migration)
   */
  setStrategy(strategy: WriteStrategy): void {
    this.logger.log(`🔄 Strategy change: ${this.strategy} → ${strategy}`);
    this.strategy = strategy;
  }

  /**
   * Check if should read from Supabase
   */
  shouldReadFromSupabase(): boolean {
    return this.strategy === 'supabase-only' || this.strategy === 'dual-write';
  }

  /**
   * Check if should read from TiDB
   */
  shouldReadFromTiDB(): boolean {
    return this.strategy === 'tidb-primary' || this.strategy === 'tidb-only';
  }

  /**
   * Generic dual-write operation
   */
  async write<T>(
    table: string,
    operation: 'create' | 'update' | 'delete',
    data: any,
    handlers: {
      supabaseQuery: () => Promise<T>;
      tidbQuery: () => Promise<T>;
    }
  ): Promise<DualWriteResult<T>> {
    const result: DualWriteResult<T> = {
      strategy: this.strategy,
      primary: null as any,
    };

    switch (this.strategy) {
      case 'supabase-only':
        result.supabase = await handlers.supabaseQuery();
        result.primary = result.supabase;
        break;

      case 'tidb-only':
        result.tidb = await handlers.tidbQuery();
        result.primary = result.tidb;
        break;

      case 'dual-write':
        // Supabase is source of truth
        try {
          result.supabase = await handlers.supabaseQuery();
          result.primary = result.supabase;
        } catch (error) {
          this.logger.error(`Supabase ${operation} failed for ${table}:`, error);
          throw error; // Fail if Supabase fails
        }

        // TiDB is secondary - don't fail if it errors
        try {
          result.tidb = await handlers.tidbQuery();
        } catch (error) {
          this.logger.error(`TiDB ${operation} failed for ${table}:`, error);
          await this.queueFailedWrite(table, operation, data, error as Error);
        }
        break;

      case 'tidb-primary':
        // TiDB is source of truth
        try {
          result.tidb = await handlers.tidbQuery();
          result.primary = result.tidb;
        } catch (error) {
          this.logger.error(`TiDB ${operation} failed for ${table}:`, error);
          throw error;
        }

        // Sync to Supabase for tables that need it
        if (this.shouldSyncToSupabase(table)) {
          try {
            result.supabase = await handlers.supabaseQuery();
          } catch (error) {
            this.logger.warn(`Supabase sync failed for ${table}:`, (error as Error).message);
            // Don't fail, just log
          }
        }
        break;
    }

    return result;
  }

  /**
   * Tables that should stay synced to Supabase (for auth/RLS)
   */
  private shouldSyncToSupabase(table: string): boolean {
    const syncTables = ['users', 'organizations', 'roles'];
    return syncTables.includes(table);
  }

  /**
   * Queue a failed write for retry
   */
  private async queueFailedWrite(
    table: string,
    operation: string,
    data: any,
    error: Error
  ): Promise<void> {
    const entry: FailedWriteEntry = {
      timestamp: new Date().toISOString(),
      table,
      operation,
      data,
      error: error.message,
      retryCount: 0,
    };

    try {
      let existing: FailedWriteEntry[] = [];

      if (fs.existsSync(this.failedWritesPath)) {
        const content = fs.readFileSync(this.failedWritesPath, 'utf-8');
        existing = JSON.parse(content);
      }

      existing.push(entry);
      fs.writeFileSync(this.failedWritesPath, JSON.stringify(existing, null, 2));

      this.logger.warn(`Queued failed write for ${table}.${operation}`);
    } catch (e) {
      this.logger.error('Failed to queue failed write:', e);
    }
  }

  /**
   * Get failed writes for retry
   */
  getFailedWrites(): FailedWriteEntry[] {
    if (!fs.existsSync(this.failedWritesPath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(this.failedWritesPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  /**
   * Clear failed writes after successful retry
   */
  clearFailedWrites(): void {
    if (fs.existsSync(this.failedWritesPath)) {
      fs.unlinkSync(this.failedWritesPath);
    }
  }

  /**
   * Get migration status
   */
  getStatus(): {
    strategy: WriteStrategy;
    failedWriteCount: number;
    readSource: 'supabase' | 'tidb';
    writeTargets: string[];
  } {
    const failedWrites = this.getFailedWrites();

    return {
      strategy: this.strategy,
      failedWriteCount: failedWrites.length,
      readSource: this.shouldReadFromSupabase() ? 'supabase' : 'tidb',
      writeTargets: this.getWriteTargets(),
    };
  }

  private getWriteTargets(): string[] {
    switch (this.strategy) {
      case 'supabase-only':
        return ['supabase'];
      case 'tidb-only':
        return ['tidb'];
      case 'dual-write':
        return ['supabase', 'tidb'];
      case 'tidb-primary':
        return ['tidb', 'supabase (sync)'];
    }
  }
}
