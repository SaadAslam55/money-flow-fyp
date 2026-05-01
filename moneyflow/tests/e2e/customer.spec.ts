/**
 * Customer Management E2E Tests
 *
 * End-to-end tests for customer management flows
 *
 * Note: Install Playwright to use these tests:
 * npm install -D @playwright/test
 * npx playwright install
 */

// @ts-ignore - Playwright types will be available after installation
import { test, expect } from '@playwright/test';

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('should navigate to customers page', async ({ page }) => {
    await page.goto('/customers');
    await expect(page.getByText(/customers/i)).toBeVisible();
  });

  test('should display customers list', async ({ page }) => {
    await page.goto('/customers');
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should open create customer form', async ({ page }) => {
    await page.goto('/customers');
    await page.getByRole('button', { name: /create|new customer/i }).click();
    await expect(page).toHaveURL(/\/customers\/new/);
    await expect(page.getByLabel(/name/i)).toBeVisible();
  });

  test('should create new customer', async ({ page }) => {
    await page.goto('/customers/new');

    await page.getByLabel(/name/i).fill('Test Customer');
    await page.getByLabel(/email/i).fill('testcustomer@example.com');
    await page.getByLabel(/phone/i).fill('+923001234567');

    await page.getByRole('button', { name: /create|save/i }).click();

    // Should redirect to customer detail or list
    await expect(page).toHaveURL(/\/customers/);
  });

  test('should validate customer form', async ({ page }) => {
    await page.goto('/customers/new');

    await page.getByRole('button', { name: /create|save/i }).click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
  });

  test('should edit customer', async ({ page }) => {
    await page.goto('/customers');
    
    // Click on first customer
    await page.getByRole('row').nth(1).click();
    
    // Click edit button
    await page.getByRole('button', { name: /edit/i }).click();
    
    await expect(page).toHaveURL(/\/customers\/.*\/edit/);
    
    // Update name
    await page.getByLabel(/name/i).clear();
    await page.getByLabel(/name/i).fill('Updated Customer');
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should see updated name
    await expect(page.getByText(/updated customer/i)).toBeVisible();
  });
});

