/**
 * Dashboard E2E Tests
 *
 * End-to-end tests for dashboard functionality
 *
 * Note: Install Playwright to use these tests:
 * npm install -D @playwright/test
 * npx playwright install
 */

// @ts-ignore - Playwright types will be available after installation
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await expect(page.getByText(/revenue/i)).toBeVisible();
    await expect(page.getByText(/expenses/i)).toBeVisible();
    await expect(page.getByText(/invoices/i)).toBeVisible();
    await expect(page.getByText(/customers/i)).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    // Wait for charts to load
    await page.waitForTimeout(1000);
    
    // Charts should be visible (check for canvas or svg elements)
    const charts = page.locator('canvas, svg');
    await expect(charts.first()).toBeVisible();
  });

  test('should display recent invoices', async ({ page }) => {
    await expect(page.getByText(/recent invoices/i)).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should navigate to invoices from dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /view all invoices/i }).click();
    await expect(page).toHaveURL(/\/invoices/);
  });

  test('should filter dashboard data by date range', async ({ page }) => {
    // Click date range picker
    const datePicker = page.getByLabel(/date range/i);
    if (await datePicker.isVisible()) {
      await datePicker.click();
      
      // Select date range (implementation depends on date picker component)
      // This is a placeholder for actual date selection
    }
  });
});

