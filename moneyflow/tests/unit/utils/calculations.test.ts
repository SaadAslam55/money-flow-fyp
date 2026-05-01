/**
 * Calculations Utility Tests
 *
 * Unit tests for business calculation utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  calculateDiscount,
} from '@/lib/calculations';

describe('calculateSubtotal', () => {
  it('calculates subtotal correctly', () => {
    const items = [
      { quantity: 2, unit_price: 100 },
      { quantity: 3, unit_price: 50 },
    ];
    expect(calculateSubtotal(items)).toBe(350);
  });

  it('handles empty array', () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it('handles zero prices', () => {
    const items = [{ quantity: 1, unit_price: 0 }];
    expect(calculateSubtotal(items)).toBe(0);
  });
});

describe('calculateTax', () => {
  it('calculates tax correctly', () => {
    expect(calculateTax(1000, 17)).toBe(170);
    expect(calculateTax(1000, 0)).toBe(0);
  });

  it('handles decimal tax rates', () => {
    expect(calculateTax(1000, 17.5)).toBe(175);
  });
});

describe('calculateDiscount', () => {
  it('calculates percentage discount correctly', () => {
    expect(calculateDiscount(1000, 10, 'percentage')).toBe(100);
    expect(calculateDiscount(1000, 0, 'percentage')).toBe(0);
  });

  it('calculates fixed discount correctly', () => {
    expect(calculateDiscount(1000, 50, 'fixed')).toBe(50);
  });
});

describe('calculateTotal', () => {
  it('calculates total with tax and discount', () => {
    const subtotal = 1000;
    const taxRate = 17; // 17% tax rate
    const discountRate = 10; // 10% discount
    // subtotal: 1000
    // discount (10%): -100
    // after discount: 900
    // tax (17% of 900): 153
    // total: 900 + 153 = 1053
    expect(calculateTotal(subtotal, taxRate, discountRate, 'percentage')).toBe(1053);
  });

  it('handles zero values', () => {
    expect(calculateTotal(0, 0, 0)).toBe(0);
  });
});
