/**
 * useInvoices Hook Tests
 *
 * Unit tests for the useInvoices custom hook
 * These tests verify the hook exists and has the expected interface.
 */

import { describe, it, expect } from 'vitest';
import { useInvoices } from '@/hooks/useInvoices';

describe('useInvoices', () => {
  it('hook exists and is a function', () => {
    expect(typeof useInvoices).toBe('function');
  });

  it('hook is exported correctly', () => {
    // We can't call the hook outside of a React component,
    // but we can verify it's exported correctly
    expect(useInvoices).toBeDefined();
  });
});

