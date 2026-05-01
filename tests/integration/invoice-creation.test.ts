/**
 * Invoice Creation Integration Tests
 *
 * Tests the complete invoice creation flow including form submission,
 * API calls, and state updates
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../setup/testUtils';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import { mockCustomers, mockProducts } from '../mocks/mockData';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    organization: { id: 'org-1' },
    isAuthenticated: true,
  }),
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({
    customers: mockCustomers,
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    products: mockProducts,
    isLoading: false,
  }),
}));

describe('Invoice Creation Flow', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes full invoice creation flow', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Select customer
    const customerSelect = screen.getByLabelText(/customer/i);
    await user.click(customerSelect);
    await user.click(screen.getByText('John Doe'));

    // Fill dates
    const invoiceDate = screen.getByLabelText(/invoice date/i);
    const dueDate = screen.getByLabelText(/due date/i);
    await user.type(invoiceDate, '2024-01-01');
    await user.type(dueDate, '2024-01-31');

    // Add line item
    const addItemButton = screen.getByRole('button', { name: /add item/i });
    await user.click(addItemButton);

    // Fill line item
    const productSelect = screen.getByLabelText(/product/i);
    await user.click(productSelect);
    await user.click(screen.getByText('Test Product 1'));

    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.type(quantityInput, '2');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create|save/i });
    await user.click(submitButton);

    // Verify submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const submittedData = mockOnSubmit.mock.calls[0][0];
    expect(submittedData.customer_id).toBe('cust-1');
    expect(submittedData.items).toHaveLength(1);
  });

  it('validates form before submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const submitButton = screen.getByRole('button', { name: /create|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/customer is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calculates totals correctly as items are added', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <InvoiceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Add item
    const addItemButton = screen.getByRole('button', { name: /add item/i });
    await user.click(addItemButton);

    // Fill item details
    const quantityInput = screen.getByLabelText(/quantity/i);
    const priceInput = screen.getByLabelText(/unit price/i);

    await user.type(quantityInput, '3');
    await user.type(priceInput, '100');

    // Check if subtotal is calculated (3 * 100 = 300)
    await waitFor(() => {
      expect(screen.getByText(/300/i)).toBeInTheDocument();
    });
  });
});

