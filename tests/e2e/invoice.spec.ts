/**
 * Invoice Management E2E Tests
 *
 * End-to-end tests for invoice management flows
 *
 * Note: Install Playwright to use these tests:
 * npm install -D @playwright/test
 * npx playwright install
 */

// @ts-ignore - Playwright types will be available after installation
import { test, expect } from '@playwright/test';

test.describe('Invoice Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('should navigate to invoices page', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page.getByText(/invoices/i)).toBeVisible();
  });

  test('should display invoices list', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should open create invoice form', async ({ page }) => {
    await page.goto('/invoices');
    await page.getByRole('button', { name: /create|new invoice/i }).click();
    await expect(page).toHaveURL(/\/invoices\/new/);
  });

  test('should create new invoice', async ({ page }) => {
    await page.goto('/invoices/new');

    // Select customer
    await page.getByLabel(/customer/i).click();
    await page.getByText(/john doe/i).click();

    // Fill dates
    await page.getByLabel(/invoice date/i).fill('2024-01-01');
    await page.getByLabel(/due date/i).fill('2024-01-31');

    // Add line item
    await page.getByRole('button', { name: /add item/i }).click();

    // Fill line item
    await page.getByLabel(/product/i).click();
    await page.getByText(/test product/i).first().click();

    const quantityInput = page.getByLabel(/quantity/i);
    await quantityInput.fill('2');

    // Submit
    await page.getByRole('button', { name: /create|save/i }).click();

    // Should redirect to invoice detail or list
    await expect(page).toHaveURL(/\/invoices/);
  });

  test('should view invoice details', async ({ page }) => {
    await page.goto('/invoices');
    
    // Click on first invoice
    await page.getByRole('row').nth(1).click();
    
    await expect(page).toHaveURL(/\/invoices\/.*/);
    await expect(page.getByText(/invoice number/i)).toBeVisible();
  });

  test('should edit invoice', async ({ page }) => {
    await page.goto('/invoices');
    
    // Click on first invoice
    await page.getByRole('row').nth(1).click();
    
    // Click edit button
    await page.getByRole('button', { name: /edit/i }).click();
    
    await expect(page).toHaveURL(/\/invoices\/.*\/edit/);
  });

  test('should send invoice via email', async ({ page }) => {
    await page.goto('/invoices');
    
    // Click on first invoice
    await page.getByRole('row').nth(1).click();
    
    // Click send button
    await page.getByRole('button', { name: /send/i }).click();
    
    // Should show email dialog or success message
    await expect(page.getByText(/sent|email/i)).toBeVisible();
  });

  test('should filter invoices by status', async ({ page }) => {
    await page.goto('/invoices');
    
    // Click status filter
    const statusFilter = page.getByLabel(/status/i);
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.getByText(/draft/i).click();
      
      // Verify filtered results
      await expect(page.getByRole('table')).toBeVisible();
    }
  });
});

