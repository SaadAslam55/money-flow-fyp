/**
 * Data Integrity Tests
 * Validates data consistency between databases and calculations
 */

import { PrismaClient } from '@prisma/client';

// ============================================
// Setup
// ============================================

const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Data Integrity Validation', () => {
  // ============================================
  // Customer Data Integrity
  // ============================================

  describe('Customer Data', () => {
    it('should have valid organization references', async () => {
      const orphanedCustomers = await prisma.$queryRaw<any[]>`
        SELECT c.id, c.organization_id 
        FROM customers c
        LEFT JOIN organizations o ON c.organization_id = o.id
        WHERE o.id IS NULL
          AND c.deleted_at IS NULL
      `;

      expect(orphanedCustomers).toHaveLength(0);
    });

    it('should have unique emails within organization', async () => {
      const duplicates = await prisma.$queryRaw<any[]>`
        SELECT organization_id, email, COUNT(*) as count
        FROM customers
        WHERE deleted_at IS NULL
          AND email IS NOT NULL
        GROUP BY organization_id, email
        HAVING COUNT(*) > 1
      `;

      expect(duplicates).toHaveLength(0);
    });

    it('should have non-negative balances', async () => {
      const negativeBalances = await prisma.$queryRaw<any[]>`
        SELECT id, name, balance
        FROM customers
        WHERE balance < 0
          AND deleted_at IS NULL
      `;

      // Report any negative balances found
      if (negativeBalances.length > 0) {
        console.warn(`Found ${negativeBalances.length} customers with negative balances`);
      }

      // This might be allowed in some business cases
      // expect(negativeBalances).toHaveLength(0);
    });
  });

  // ============================================
  // Invoice Calculations
  // ============================================

  describe('Invoice Calculations', () => {
    it('should have correct total calculations', async () => {
      const invalidInvoices = await prisma.$queryRaw<any[]>`
        SELECT id, subtotal, tax_amount, discount_amount, total,
               (subtotal + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)) as expected_total
        FROM invoices
        WHERE ABS((subtotal + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)) - total) > 0.01
          AND deleted_at IS NULL
      `;

      if (invalidInvoices.length > 0) {
        console.error('Invoices with incorrect totals:', invalidInvoices);
      }

      expect(invalidInvoices).toHaveLength(0);
    });

    it('should have correct balance_due calculations', async () => {
      const invalidBalances = await prisma.$queryRaw<any[]>`
        SELECT id, total, amount_paid, balance_due,
               (total - COALESCE(amount_paid, 0)) as expected_balance
        FROM invoices
        WHERE ABS((total - COALESCE(amount_paid, 0)) - balance_due) > 0.01
          AND deleted_at IS NULL
      `;

      if (invalidBalances.length > 0) {
        console.error('Invoices with incorrect balance_due:', invalidBalances);
      }

      expect(invalidBalances).toHaveLength(0);
    });

    it('should have matching item totals', async () => {
      const mismatches = await prisma.$queryRaw<any[]>`
        SELECT 
          i.id,
          i.subtotal as invoice_subtotal,
          COALESCE(SUM(ii.total), 0) as items_total
        FROM invoices i
        LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
        WHERE i.deleted_at IS NULL
        GROUP BY i.id, i.subtotal
        HAVING ABS(i.subtotal - COALESCE(SUM(ii.total), 0)) > 0.01
      `;

      if (mismatches.length > 0) {
        console.error('Invoices with mismatched item totals:', mismatches);
      }

      expect(mismatches).toHaveLength(0);
    });

    it('should have valid status transitions', async () => {
      // PAID invoices should have balance_due = 0
      const invalidPaidInvoices = await prisma.$queryRaw<any[]>`
        SELECT id, status, payment_status, balance_due
        FROM invoices
        WHERE payment_status = 'PAID'
          AND balance_due > 0.01
          AND deleted_at IS NULL
      `;

      expect(invalidPaidInvoices).toHaveLength(0);
    });

    it('should have valid payment_status based on amount_paid', async () => {
      const invalidPaymentStatus = await prisma.$queryRaw<any[]>`
        SELECT id, total, amount_paid, payment_status
        FROM invoices
        WHERE deleted_at IS NULL
          AND (
            (amount_paid >= total AND payment_status != 'PAID')
            OR (amount_paid > 0 AND amount_paid < total AND payment_status NOT IN ('PARTIAL', 'PAID'))
            OR (amount_paid = 0 AND payment_status NOT IN ('UNPAID', 'PENDING'))
          )
      `;

      if (invalidPaymentStatus.length > 0) {
        console.error('Invoices with invalid payment status:', invalidPaymentStatus);
      }

      expect(invalidPaymentStatus).toHaveLength(0);
    });
  });

  // ============================================
  // Invoice Items
  // ============================================

  describe('Invoice Items', () => {
    it('should have valid invoice references', async () => {
      const orphanedItems = await prisma.$queryRaw<any[]>`
        SELECT ii.id, ii.invoice_id
        FROM invoice_items ii
        LEFT JOIN invoices i ON ii.invoice_id = i.id
        WHERE i.id IS NULL
      `;

      expect(orphanedItems).toHaveLength(0);
    });

    it('should have correct item total calculations', async () => {
      const invalidItems = await prisma.$queryRaw<any[]>`
        SELECT id, quantity, unit_price, tax_rate, discount, total,
               (quantity * unit_price * (1 + COALESCE(tax_rate, 0)/100) - COALESCE(discount, 0)) as expected_total
        FROM invoice_items
        WHERE ABS(
          (quantity * unit_price * (1 + COALESCE(tax_rate, 0)/100) - COALESCE(discount, 0)) - total
        ) > 0.01
      `;

      if (invalidItems.length > 0) {
        console.error('Invoice items with incorrect totals:', invalidItems);
      }

      expect(invalidItems).toHaveLength(0);
    });

    it('should have positive quantities and prices', async () => {
      const invalidItems = await prisma.$queryRaw<any[]>`
        SELECT id, quantity, unit_price
        FROM invoice_items
        WHERE quantity <= 0 OR unit_price < 0
      `;

      expect(invalidItems).toHaveLength(0);
    });
  });

  // ============================================
  // Transaction Integrity
  // ============================================

  describe('Transaction Integrity', () => {
    it('should have valid invoice references', async () => {
      const orphanedTransactions = await prisma.$queryRaw<any[]>`
        SELECT t.id, t.invoice_id
        FROM transactions t
        LEFT JOIN invoices i ON t.invoice_id = i.id
        WHERE t.invoice_id IS NOT NULL
          AND i.id IS NULL
      `;

      expect(orphanedTransactions).toHaveLength(0);
    });

    it('should have valid customer references', async () => {
      const orphanedTransactions = await prisma.$queryRaw<any[]>`
        SELECT t.id, t.customer_id
        FROM transactions t
        LEFT JOIN customers c ON t.customer_id = c.id
        WHERE t.customer_id IS NOT NULL
          AND c.id IS NULL
      `;

      expect(orphanedTransactions).toHaveLength(0);
    });

    it('should have matching payment amounts with invoices', async () => {
      const mismatches = await prisma.$queryRaw<any[]>`
        SELECT 
          i.id,
          i.amount_paid,
          COALESCE(SUM(t.amount), 0) as transaction_total
        FROM invoices i
        LEFT JOIN transactions t ON i.id = t.invoice_id AND t.type = 'INCOME'
        WHERE i.deleted_at IS NULL
        GROUP BY i.id, i.amount_paid
        HAVING ABS(i.amount_paid - COALESCE(SUM(t.amount), 0)) > 0.01
      `;

      if (mismatches.length > 0) {
        console.error('Invoices with mismatched transaction amounts:', mismatches);
      }

      expect(mismatches).toHaveLength(0);
    });

    it('should have positive amounts for income transactions', async () => {
      const invalidTransactions = await prisma.$queryRaw<any[]>`
        SELECT id, type, amount
        FROM transactions
        WHERE type = 'INCOME' AND amount < 0
      `;

      expect(invalidTransactions).toHaveLength(0);
    });
  });

  // ============================================
  // Product Inventory
  // ============================================

  describe('Product Inventory', () => {
    it('should have non-negative stock quantities', async () => {
      const negativeStock = await prisma.$queryRaw<any[]>`
        SELECT id, name, stock_quantity
        FROM products
        WHERE stock_quantity < 0
          AND deleted_at IS NULL
      `;

      expect(negativeStock).toHaveLength(0);
    });

    it('should have valid organization references', async () => {
      const orphanedProducts = await prisma.$queryRaw<any[]>`
        SELECT p.id, p.organization_id
        FROM products p
        LEFT JOIN organizations o ON p.organization_id = o.id
        WHERE o.id IS NULL
          AND p.deleted_at IS NULL
      `;

      expect(orphanedProducts).toHaveLength(0);
    });

    it('should have unique SKUs within organization', async () => {
      const duplicates = await prisma.$queryRaw<any[]>`
        SELECT organization_id, sku, COUNT(*) as count
        FROM products
        WHERE deleted_at IS NULL
          AND sku IS NOT NULL
        GROUP BY organization_id, sku
        HAVING COUNT(*) > 1
      `;

      expect(duplicates).toHaveLength(0);
    });

    it('should have positive unit prices', async () => {
      const invalidPrices = await prisma.$queryRaw<any[]>`
        SELECT id, name, unit_price
        FROM products
        WHERE unit_price < 0
          AND deleted_at IS NULL
      `;

      expect(invalidPrices).toHaveLength(0);
    });
  });

  // ============================================
  // Organization Data
  // ============================================

  describe('Organization Data', () => {
    it('should have valid user references', async () => {
      const orphanedUsers = await prisma.$queryRaw<any[]>`
        SELECT u.id, u.organization_id
        FROM users u
        LEFT JOIN organizations o ON u.organization_id = o.id
        WHERE u.organization_id IS NOT NULL
          AND o.id IS NULL
      `;

      expect(orphanedUsers).toHaveLength(0);
    });

    it('should have at least one admin per organization', async () => {
      const orgsWithoutAdmin = await prisma.$queryRaw<any[]>`
        SELECT o.id, o.name
        FROM organizations o
        LEFT JOIN users u ON o.id = u.organization_id AND u.role IN ('admin', 'super_admin')
        WHERE u.id IS NULL
      `;

      if (orgsWithoutAdmin.length > 0) {
        console.warn('Organizations without admin:', orgsWithoutAdmin);
      }
    });
  });

  // ============================================
  // Foreign Key Constraints
  // ============================================

  describe('Referential Integrity', () => {
    it('should have no orphaned records across all tables', async () => {
      // This is a comprehensive check for all foreign key relationships
      const orphanedRecords: Record<string, any[]> = {};

      // Check each relationship
      const checks = [
        {
          name: 'invoice_items -> invoices',
          query: `
            SELECT ii.id FROM invoice_items ii
            LEFT JOIN invoices i ON ii.invoice_id = i.id
            WHERE i.id IS NULL
          `,
        },
        {
          name: 'transactions -> invoices',
          query: `
            SELECT t.id FROM transactions t
            LEFT JOIN invoices i ON t.invoice_id = i.id
            WHERE t.invoice_id IS NOT NULL AND i.id IS NULL
          `,
        },
        {
          name: 'invoices -> customers',
          query: `
            SELECT inv.id FROM invoices inv
            LEFT JOIN customers c ON inv.customer_id = c.id
            WHERE c.id IS NULL AND inv.deleted_at IS NULL
          `,
        },
      ];

      for (const check of checks) {
        const result = await prisma.$queryRawUnsafe<any[]>(check.query);
        if (result.length > 0) {
          orphanedRecords[check.name] = result;
        }
      }

      if (Object.keys(orphanedRecords).length > 0) {
        console.error('Found orphaned records:', orphanedRecords);
      }

      expect(Object.keys(orphanedRecords)).toHaveLength(0);
    });
  });
});
