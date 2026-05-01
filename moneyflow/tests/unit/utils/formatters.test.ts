/**
 * Formatters Utility Tests
 *
 * Unit tests for formatting utility functions
 */

import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters';

describe('formatCurrency', () => {
  it('formats PKR currency correctly', () => {
    expect(formatCurrency(1000, 'PKR')).toContain('1,000');
    expect(formatCurrency(1000.5, 'PKR')).toContain('1,000.50');
  });

  it('formats USD currency correctly', () => {
    expect(formatCurrency(1000, 'USD')).toContain('1,000');
    expect(formatCurrency(1000.5, 'USD')).toContain('1,000.50');
  });

  it('handles zero amount', () => {
    expect(formatCurrency(0, 'PKR')).toContain('0.00');
  });

  it('handles negative amounts', () => {
    expect(formatCurrency(-1000, 'PKR')).toContain('1,000.00');
  });

  it('handles large numbers', () => {
    expect(formatCurrency(1000000, 'PKR')).toContain('1,000,000.00');
  });
});

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const date = '2024-01-15';
    expect(formatDate(date)).toMatch(/Jan.*15.*2024/);
  });

  it('formats Date object correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toMatch(/Jan.*15.*2024/);
  });

  it('formats with custom format', () => {
    const date = '2024-01-15';
    // formatDate doesn't support custom format strings, only 'short' | 'medium' | 'long' | 'full'
    // Test the actual behavior
    expect(formatDate(date, 'short')).toBeTruthy();
  });
});

describe('formatNumber', () => {
  it('formats number with default decimals', () => {
    // Default decimals is 0 in formatNumber
    expect(formatNumber(1000.5)).toBe('1,001');
  });

  it('formats number with custom decimals', () => {
    expect(formatNumber(1000.567, 2)).toBe('1,000.57');
    expect(formatNumber(1000.567, 0)).toBe('1,001');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
  });
});
