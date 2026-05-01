/**
 * Invoice API Service Tests
 *
 * Unit tests for invoice API service functions
 * Tests the calculateInvoiceTotals utility function which doesn't require Supabase
 */

import { describe, it, expect } from 'vitest';
import { calculateInvoiceTotals } from '@/services/api/invoiceApi';

describe('invoiceApi', () => {
  describe('calculateInvoiceTotals', () => {
    it('calculates totals correctly for single item', () => {
      const items = [
        {
          product_id: 'prod-1',
          description: 'Test Product',
          quantity: 2,
          unit_price: 100,
          tax_rate: 17,
        },
      ];

      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(200);
      expect(result.tax_amount).toBe(34);
      expect(result.discount_amount).toBe(0);
      expect(result.total_amount).toBe(234);
    });

    it('calculates totals correctly for multiple items', () => {
      const items = [
        { product_id: 'prod-1', description: 'Product 1', quantity: 2, unit_price: 100, tax_rate: 17 },
        { product_id: 'prod-2', description: 'Product 2', quantity: 1, unit_price: 50, tax_rate: 17 },
      ];

      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(250);
      expect(result.tax_amount).toBe(42.5);
      expect(result.total_amount).toBe(292.5);
    });

    it('applies percentage discount correctly', () => {
      const items = [
        { product_id: 'prod-1', description: 'Product', quantity: 1, unit_price: 100, tax_rate: 0 },
      ];

      const result = calculateInvoiceTotals(items, 'percentage', 10);

      expect(result.subtotal).toBe(100);
      expect(result.discount_amount).toBe(10);
      expect(result.total_amount).toBe(90);
    });

    it('applies fixed discount correctly', () => {
      const items = [
        { product_id: 'prod-1', description: 'Product', quantity: 1, unit_price: 100, tax_rate: 0 },
      ];

      const result = calculateInvoiceTotals(items, 'fixed', 15);

      expect(result.subtotal).toBe(100);
      expect(result.discount_amount).toBe(15);
      expect(result.total_amount).toBe(85);
    });

    it('handles items with zero quantity', () => {
      const items = [
        { product_id: 'prod-1', description: 'Product', quantity: 0, unit_price: 100, tax_rate: 17 },
      ];

      const result = calculateInvoiceTotals(items);

      expect(result.subtotal).toBe(0);
      expect(result.total_amount).toBe(0);
    });
  });
});

