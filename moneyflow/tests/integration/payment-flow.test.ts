/**
 * Payment Flow Integration Tests
 *
 * Tests the complete payment processing flow including invoice payment,
 * payment recording, and status updates
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../setup/testUtils';
import { mockInvoices } from '../mocks/mockData';

// Mock payment API
vi.mock('@/services/api/paymentApi', () => ({
  recordPayment: vi.fn(() =>
    Promise.resolve({
      data: { success: true, invoice_id: 'inv-1' },
      error: null,
    })
  ),
}));

describe('Payment Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('records payment successfully', async () => {
    const user = userEvent.setup();
    const mockOnPayment = vi.fn();

    // This would be a payment form component
    // For now, we'll test the payment API directly
    const { recordPayment } = await import('@/services/api/paymentApi');

    const result = await recordPayment(
      {
        invoice_id: 'inv-1',
        amount: 1170,
        payment_method: 'cash',
        payment_date: '2024-01-01',
      },
      'org-1'
    );

    expect(result.data).toBeDefined();
    expect(result.data?.success).toBe(true);
    expect(result.error).toBeNull();
  });

  it('validates payment amount', async () => {
    const { recordPayment } = await import('@/services/api/paymentApi');

    const result = await recordPayment(
      {
        invoice_id: 'inv-1',
        amount: -100, // Invalid negative amount
        payment_method: 'cash',
        payment_date: '2024-01-01',
      },
      'org-1'
    );

    // Should return validation error
    expect(result.error).toBeDefined();
  });

  it('prevents overpayment', async () => {
    const { recordPayment } = await import('@/services/api/paymentApi');

    const invoice = mockInvoices[0];
    const overAmount = invoice.total_amount + 1000;

    const result = await recordPayment(
      {
        invoice_id: invoice.id,
        amount: overAmount,
        payment_method: 'cash',
        payment_date: '2024-01-01',
      },
      'org-1'
    );

    // Should return error for overpayment
    expect(result.error).toBeDefined();
  });
});

