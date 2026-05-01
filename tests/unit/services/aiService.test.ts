// tests/unit/services/aiService.test.ts
/**
 * AI Service Tests - Phase 8: Testing & Quality Assurance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categorizeExpense } from '@/services/ai/aiService';

// Mock Supabase
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('AI Service', () => {
  describe('categorizeExpense', () => {
    it('should categorize office supplies correctly', () => {
      expect(categorizeExpense('Printer paper and ink')).toBe('Office Supplies');
      expect(categorizeExpense('Pens and stationery')).toBe('Office Supplies');
      expect(categorizeExpense('Office desk supplies')).toBe('Office Supplies');
    });

    it('should categorize utilities correctly', () => {
      expect(categorizeExpense('Monthly electricity bill')).toBe('Utilities');
      expect(categorizeExpense('Internet service')).toBe('Utilities');
      expect(categorizeExpense('Water utility payment')).toBe('Utilities');
    });

    it('should categorize rent correctly', () => {
      expect(categorizeExpense('Office rent payment')).toBe('Rent');
      expect(categorizeExpense('Property lease')).toBe('Rent');
    });

    it('should categorize travel correctly', () => {
      expect(categorizeExpense('Flight to conference')).toBe('Travel');
      expect(categorizeExpense('Hotel accommodation')).toBe('Travel');
      expect(categorizeExpense('Uber ride to meeting')).toBe('Travel');
    });

    it('should categorize marketing correctly', () => {
      expect(categorizeExpense('Facebook ads campaign')).toBe('Marketing');
      expect(categorizeExpense('Marketing materials')).toBe('Marketing');
      expect(categorizeExpense('Advertising promotion')).toBe('Marketing');
    });

    it('should categorize software correctly', () => {
      expect(categorizeExpense('Software subscription')).toBe('Software');
      expect(categorizeExpense('SaaS license renewal')).toBe('Software');
      expect(categorizeExpense('App subscription')).toBe('Software');
    });

    it('should categorize equipment correctly', () => {
      expect(categorizeExpense('New laptop purchase')).toBe('Equipment');
      expect(categorizeExpense('Computer hardware')).toBe('Equipment');
      expect(categorizeExpense('Office equipment')).toBe('Equipment');
    });

    it('should categorize professional services correctly', () => {
      expect(categorizeExpense('Legal consulting fees')).toBe('Professional Services');
      expect(categorizeExpense('Accounting services')).toBe('Professional Services');
      expect(categorizeExpense('Lawyer consultation')).toBe('Professional Services');
    });

    it('should categorize insurance correctly', () => {
      expect(categorizeExpense('Business insurance premium')).toBe('Insurance');
      expect(categorizeExpense('Insurance policy renewal')).toBe('Insurance');
    });

    it('should categorize meals correctly', () => {
      expect(categorizeExpense('Team lunch meeting')).toBe('Meals');
      expect(categorizeExpense('Client dinner')).toBe('Meals');
      expect(categorizeExpense('Restaurant catering')).toBe('Meals');
    });

    it('should return Other for unrecognized expenses', () => {
      expect(categorizeExpense('Random purchase')).toBe('Other');
      expect(categorizeExpense('Miscellaneous item')).toBe('Other');
    });

    it('should be case insensitive', () => {
      expect(categorizeExpense('PRINTER PAPER')).toBe('Office Supplies');
      expect(categorizeExpense('ELECTRICITY BILL')).toBe('Utilities');
    });
  });
});
