/**
 * Invoices Repository
 * Optimized database queries for invoices
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/tidb/prisma.service';
import { Prisma } from '@prisma/client';

// ============================================
// Types
// ============================================

interface FindManyParams {
  organizationId: string;
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

interface InvoiceStats {
  totalInvoices: number;
  paidCount: number;
  unpaidCount: number;
  overdueCount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

// ============================================
// Repository
// ============================================

@Injectable()
export class InvoicesRepository {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // Optimized List Query
  // ============================================

  /**
   * Find invoices with optimized query
   * Uses raw SQL for better performance on large datasets
   */
  async findManyOptimized(params: FindManyParams) {
    const {
      organizationId,
      page = 1,
      limit = 20,
      status,
      customerId,
      startDate,
      endDate,
      search,
    } = params;

    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: string[] = [
      `i.organization_id = '${organizationId}'`,
      `i.deleted_at IS NULL`,
    ];

    if (status) {
      conditions.push(`i.status = '${status}'`);
    }

    if (customerId) {
      conditions.push(`i.customer_id = '${customerId}'`);
    }

    if (startDate) {
      conditions.push(`i.issue_date >= '${startDate.toISOString().split('T')[0]}'`);
    }

    if (endDate) {
      conditions.push(`i.issue_date <= '${endDate.toISOString().split('T')[0]}'`);
    }

    if (search) {
      conditions.push(`(
        i.invoice_number LIKE '%${search}%' OR
        c.name LIKE '%${search}%' OR
        c.email LIKE '%${search}%'
      )`);
    }

    const whereClause = conditions.join(' AND ');

    // Optimized query with minimal joins
    const invoices = await this.prisma.$queryRawUnsafe(`
      SELECT 
        i.id,
        i.invoice_number,
        i.status,
        i.payment_status,
        i.total,
        i.balance_due,
        i.issue_date,
        i.due_date,
        i.created_at,
        c.id as customer_id,
        c.name as customer_name,
        c.email as customer_email
      FROM invoices i
      INNER JOIN customers c ON i.customer_id = c.id
      WHERE ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Count query (optimized)
    const countResult = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(`
      SELECT COUNT(*) as count
      FROM invoices i
      ${customerId || search ? 'INNER JOIN customers c ON i.customer_id = c.id' : ''}
      WHERE ${whereClause}
    `);

    const total = Number(countResult[0]?.count || 0);

    return {
      data: invoices as any[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // Aggregation Queries
  // ============================================

  /**
   * Get invoice statistics for dashboard
   */
  async getStats(organizationId: string, startDate: Date, endDate: Date): Promise<InvoiceStats> {
    const result = await this.prisma.$queryRawUnsafe<InvoiceStats[]>(`
      SELECT 
        COUNT(*) as totalInvoices,
        SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paidCount,
        SUM(CASE WHEN payment_status = 'UNPAID' THEN 1 ELSE 0 END) as unpaidCount,
        SUM(CASE WHEN due_date < CURRENT_DATE AND payment_status != 'PAID' THEN 1 ELSE 0 END) as overdueCount,
        COALESCE(SUM(total), 0) as totalAmount,
        COALESCE(SUM(amount_paid), 0) as paidAmount,
        COALESCE(SUM(balance_due), 0) as outstandingAmount
      FROM invoices
      WHERE organization_id = '${organizationId}'
        AND issue_date BETWEEN '${startDate.toISOString().split('T')[0]}' AND '${endDate.toISOString().split('T')[0]}'
        AND deleted_at IS NULL
    `);

    return (
      result[0] || {
        totalInvoices: 0,
        paidCount: 0,
        unpaidCount: 0,
        overdueCount: 0,
        totalAmount: 0,
        paidAmount: 0,
        outstandingAmount: 0,
      }
    );
  }

  /**
   * Get revenue by period
   */
  async getRevenueByPeriod(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'month'
  ) {
    const dateFormat = {
      day: '%Y-%m-%d',
      week: '%Y-%u',
      month: '%Y-%m',
    }[groupBy];

    const result = await this.prisma.$queryRawUnsafe(`
      SELECT 
        DATE_FORMAT(issue_date, '${dateFormat}') as period,
        COUNT(*) as invoiceCount,
        SUM(total) as totalRevenue,
        SUM(amount_paid) as collectedRevenue
      FROM invoices
      WHERE organization_id = '${organizationId}'
        AND issue_date BETWEEN '${startDate.toISOString().split('T')[0]}' AND '${endDate.toISOString().split('T')[0]}'
        AND deleted_at IS NULL
      GROUP BY period
      ORDER BY period ASC
    `);

    return result as any[];
  }

  /**
   * Get overdue invoices
   */
  async getOverdue(organizationId: string, limit: number = 50) {
    return this.prisma.$queryRawUnsafe(`
      SELECT 
        i.id,
        i.invoice_number,
        i.total,
        i.balance_due,
        i.due_date,
        DATEDIFF(CURRENT_DATE, i.due_date) as days_overdue,
        c.name as customer_name,
        c.email as customer_email
      FROM invoices i
      INNER JOIN customers c ON i.customer_id = c.id
      WHERE i.organization_id = '${organizationId}'
        AND i.due_date < CURRENT_DATE
        AND i.payment_status != 'PAID'
        AND i.deleted_at IS NULL
      ORDER BY i.due_date ASC
      LIMIT ${limit}
    `);
  }

  // ============================================
  // Batch Operations
  // ============================================

  /**
   * Update status for multiple invoices
   */
  async updateManyStatus(ids: string[], status: string): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await this.prisma.$executeRawUnsafe(`
      UPDATE invoices
      SET status = '${status}', updated_at = NOW()
      WHERE id IN (${ids.map((id) => `'${id}'`).join(',')})
    `);

    return result;
  }

  /**
   * Mark overdue invoices
   */
  async markOverdueInvoices(organizationId: string): Promise<number> {
    const result = await this.prisma.$executeRawUnsafe(`
      UPDATE invoices
      SET status = 'OVERDUE', updated_at = NOW()
      WHERE organization_id = '${organizationId}'
        AND due_date < CURRENT_DATE
        AND payment_status != 'PAID'
        AND status != 'OVERDUE'
        AND deleted_at IS NULL
    `);

    return result;
  }

  // ============================================
  // Full-text Search (if supported)
  // ============================================

  /**
   * Search invoices with full-text matching
   */
  async searchInvoices(organizationId: string, query: string, limit: number = 20) {
    // Basic LIKE search (replace with full-text if TiDB version supports it)
    const searchTerm = `%${query}%`;

    return this.prisma.$queryRawUnsafe(`
      SELECT 
        i.id,
        i.invoice_number,
        i.status,
        i.total,
        c.name as customer_name
      FROM invoices i
      INNER JOIN customers c ON i.customer_id = c.id
      WHERE i.organization_id = '${organizationId}'
        AND i.deleted_at IS NULL
        AND (
          i.invoice_number LIKE '${searchTerm}' OR
          c.name LIKE '${searchTerm}' OR
          c.email LIKE '${searchTerm}' OR
          CAST(i.total AS CHAR) LIKE '${searchTerm}'
        )
      ORDER BY i.created_at DESC
      LIMIT ${limit}
    `);
  }
}
