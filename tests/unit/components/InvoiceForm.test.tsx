/**
 * Invoice Form Component Tests
 *
 * Unit tests for the InvoiceForm component
 * These tests verify the component exists and can be imported.
 */

import { describe, it, expect } from 'vitest';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';

describe('InvoiceForm', () => {
  it('component exists and is a function', () => {
    expect(typeof InvoiceForm).toBe('function');
  });

  it('component is exported correctly', () => {
    expect(InvoiceForm).toBeDefined();
  });
});

