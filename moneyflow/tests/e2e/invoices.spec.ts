/**
 * Invoice E2E Tests (Playwright)
 * End-to-end tests for invoice management
 */

import { test, expect } from '@playwright/test';

// ============================================
// Configuration
// ============================================

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';

// ============================================
// Auth Helper
// ============================================

async function login(page: any) {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.fill('[data-testid="email-input"]', TEST_EMAIL);
  await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

// ============================================
// Invoice List Tests
// ============================================

test.describe('Invoice List', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display invoice list page', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);

    await expect(page.locator('h1')).toContainText('Invoices');
    await expect(page.locator('[data-testid="invoice-table"]')).toBeVisible();
  });

  test('should show create invoice button', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);

    const createButton = page.locator('[data-testid="create-invoice-btn"]');
    await expect(createButton).toBeVisible();
    await expect(createButton).toContainText('New Invoice');
  });

  test('should filter invoices by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);

    // Open status filter
    await page.click('[data-testid="status-filter"]');
    await page.click('[data-testid="filter-paid"]');

    // Wait for filter to apply
    await page.waitForLoadState('networkidle');

    // Verify all visible invoices are Paid
    const statuses = await page.locator('[data-testid="invoice-status"]').allTextContents();
    statuses.forEach((status) => {
      expect(status.toLowerCase()).toContain('paid');
    });
  });

  test('should search invoices', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);

    // Enter search term
    await page.fill('[data-testid="search-input"]', 'INV-2024');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Wait for results
    await page.waitForLoadState('networkidle');

    // Verify results contain search term
    const rows = await page.locator('[data-testid="invoice-row"]').count();
    if (rows > 0) {
      const invoiceNumbers = await page.locator('[data-testid="invoice-number"]').allTextContents();
      invoiceNumbers.forEach((num) => {
        expect(num).toContain('INV-2024');
      });
    }
  });

  test('should navigate to invoice details', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);

    // Click first invoice row
    const firstRow = page.locator('[data-testid="invoice-row"]').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await expect(page).toHaveURL(/\/invoices\/[a-z0-9-]+/);
    }
  });

  test('should show pagination', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);

    const pagination = page.locator('[data-testid="pagination"]');
    await expect(pagination).toBeVisible();
  });
});

// ============================================
// Create Invoice Tests
// ============================================

test.describe('Create Invoice', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to create invoice form', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);
    await page.click('[data-testid="create-invoice-btn"]');

    await expect(page).toHaveURL(`${BASE_URL}/invoices/new`);
    await expect(page.locator('h1')).toContainText('New Invoice');
  });

  test('should create invoice with valid data', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices/new`);

    // Select customer
    await page.click('[data-testid="customer-select"]');
    await page.click('[data-testid="customer-option"]:first-child');

    // Add item
    await page.fill('[data-testid="item-description-0"]', 'Test Service');
    await page.fill('[data-testid="item-quantity-0"]', '2');
    await page.fill('[data-testid="item-price-0"]', '100');

    // Set due date
    await page.fill('[data-testid="due-date"]', '2024-12-31');

    // Save
    await page.click('[data-testid="save-invoice"]');

    // Verify redirect to invoice details
    await expect(page).toHaveURL(/\/invoices\/[a-z0-9-]+/);
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText('Draft');
  });

  test('should add multiple items', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices/new`);

    // Add first item
    await page.fill('[data-testid="item-description-0"]', 'Item 1');
    await page.fill('[data-testid="item-quantity-0"]', '1');
    await page.fill('[data-testid="item-price-0"]', '100');

    // Click add item button
    await page.click('[data-testid="add-item-btn"]');

    // Add second item
    await page.fill('[data-testid="item-description-1"]', 'Item 2');
    await page.fill('[data-testid="item-quantity-1"]', '2');
    await page.fill('[data-testid="item-price-1"]', '50');

    // Verify total updates
    await expect(page.locator('[data-testid="invoice-total"]')).toContainText('200');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices/new`);

    // Try to save without filling required fields
    await page.click('[data-testid="save-invoice"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="error-customer"]')).toBeVisible();
  });

  test('should remove item', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices/new`);

    // Add items
    await page.fill('[data-testid="item-description-0"]', 'Item 1');
    await page.fill('[data-testid="item-quantity-0"]', '1');
    await page.fill('[data-testid="item-price-0"]', '100');

    await page.click('[data-testid="add-item-btn"]');
    await page.fill('[data-testid="item-description-1"]', 'Item 2');

    // Remove second item
    await page.click('[data-testid="remove-item-1"]');

    // Verify only one item remains
    await expect(page.locator('[data-testid^="item-description-"]')).toHaveCount(1);
  });
});

// ============================================
// Invoice Actions Tests
// ============================================

test.describe('Invoice Actions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should send invoice', async ({ page }) => {
    // Create a draft invoice first
    await page.goto(`${BASE_URL}/invoices/new`);
    await page.click('[data-testid="customer-select"]');
    await page.click('[data-testid="customer-option"]:first-child');
    await page.fill('[data-testid="item-description-0"]', 'Test');
    await page.fill('[data-testid="item-quantity-0"]', '1');
    await page.fill('[data-testid="item-price-0"]', '100');
    await page.fill('[data-testid="due-date"]', '2024-12-31');
    await page.click('[data-testid="save-invoice"]');

    // Send invoice
    await page.click('[data-testid="send-invoice"]');

    // Confirm send
    await page.click('[data-testid="confirm-send"]');

    // Verify status changed
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText('Sent');
    await expect(page.locator('[data-testid="toast"]')).toContainText('sent');
  });

  test('should record payment', async ({ page }) => {
    // Navigate to a sent invoice
    await page.goto(`${BASE_URL}/invoices`);
    await page.click('[data-testid="invoice-row"]:has-text("Sent")');

    // Record payment
    await page.click('[data-testid="record-payment"]');
    await page.fill('[data-testid="payment-amount"]', '50');
    await page.selectOption('[data-testid="payment-method"]', 'CASH');
    await page.click('[data-testid="confirm-payment"]');

    // Verify payment recorded
    await expect(page.locator('[data-testid="toast"]')).toContainText('Payment recorded');
    await expect(page.locator('[data-testid="amount-paid"]')).toContainText('50');
  });

  test('should download PDF', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);
    await page.click('[data-testid="invoice-row"]:first-child');

    // Click download PDF
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="download-pdf"]'),
    ]);

    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should duplicate invoice', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);
    await page.click('[data-testid="invoice-row"]:first-child');

    // Click duplicate
    await page.click('[data-testid="duplicate-invoice"]');

    // Should redirect to new invoice form with pre-filled data
    await expect(page).toHaveURL(`${BASE_URL}/invoices/new`);
    await expect(page.locator('[data-testid="item-description-0"]')).not.toBeEmpty();
  });
});

// ============================================
// Invoice Edit Tests
// ============================================

test.describe('Edit Invoice', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should edit draft invoice', async ({ page }) => {
    // Navigate to a draft invoice
    await page.goto(`${BASE_URL}/invoices`);
    await page.click('[data-testid="invoice-row"]:has-text("Draft")');

    // Click edit
    await page.click('[data-testid="edit-invoice"]');

    // Update notes
    await page.fill('[data-testid="invoice-notes"]', 'Updated notes');
    await page.click('[data-testid="save-invoice"]');

    // Verify update
    await expect(page.locator('[data-testid="toast"]')).toContainText('updated');
  });

  test('should not allow editing sent invoice items', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);
    await page.click('[data-testid="invoice-row"]:has-text("Sent")');

    // Edit button should be disabled or hidden for items
    const editItemBtn = page.locator('[data-testid="edit-items"]');
    if (await editItemBtn.isVisible()) {
      await expect(editItemBtn).toBeDisabled();
    }
  });
});

// ============================================
// Invoice Delete Tests
// ============================================

test.describe('Delete Invoice', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should delete draft invoice', async ({ page }) => {
    // Create invoice to delete
    await page.goto(`${BASE_URL}/invoices/new`);
    await page.click('[data-testid="customer-select"]');
    await page.click('[data-testid="customer-option"]:first-child');
    await page.fill('[data-testid="item-description-0"]', 'To Delete');
    await page.fill('[data-testid="item-quantity-0"]', '1');
    await page.fill('[data-testid="item-price-0"]', '100');
    await page.fill('[data-testid="due-date"]', '2024-12-31');
    await page.click('[data-testid="save-invoice"]');

    // Delete invoice
    await page.click('[data-testid="delete-invoice"]');
    await page.click('[data-testid="confirm-delete"]');

    // Verify redirect to list
    await expect(page).toHaveURL(`${BASE_URL}/invoices`);
    await expect(page.locator('[data-testid="toast"]')).toContainText('deleted');
  });

  test('should show confirmation dialog', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);
    await page.click('[data-testid="invoice-row"]:has-text("Draft")');

    await page.click('[data-testid="delete-invoice"]');

    // Confirm dialog should be visible
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-dialog"]')).toContainText('Are you sure');
  });
});
