# Cypress E2E Testing Guide

Complete End-to-End testing setup for Money Flow application using Cypress.

## 📋 Contents

### Configuration Files

- **`cypress.config.ts`** - Main Cypress configuration
- **`config/cypress.config.ts`** - Base configuration with plugins
- **`config/env.json`** - Environment variables for tests
- **`config/tsconfig.json`** - TypeScript configuration for tests

### Support Files

- **`support/e2e.ts`** - E2E support and setup file
- **`support/commands.ts`** - Custom Cypress commands
- **`support/index.ts`** - Utility functions

### Test Fixtures

- **`fixtures/user.json`** - Test user data
- **`fixtures/invoice.json`** - Test invoice data
- **`fixtures/product.json`** - Test product data
- **`fixtures/example.json`** - Example fixture

### E2E Test Suites

- **`e2e/auth.cy.ts`** - Authentication tests (login, signup, password reset)
- **`e2e/dashboard.cy.ts`** - Dashboard and navigation tests
- **`e2e/invoices.cy.ts`** - Invoice creation and management
- **`e2e/customers.cy.ts`** - Customer management
- **`e2e/products.cy.ts`** - Product and inventory management
- **`e2e/transactions.cy.ts`** - Transaction logging and reporting
- **`e2e/reports.cy.ts`** - Reporting and analytics
- **`e2e/settings.cy.ts`** - User and organization settings
- **`e2e/admin.cy.ts`** - Administrative functions
- **`e2e/subscription.cy.ts`** - Subscription and billing tests

## 🚀 Quick Start

### 1. Installation

```bash
# Dependencies are already in package.json
npm install

# Or install Cypress specifically
npm install --save-dev cypress
```

### 2. Configuration

Edit `config/env.json` with your test environment:

```json
{
  "baseUrl": "http://localhost:5173",
  "testUser": {
    "email": "test@example.com",
    "password": "TestPassword123!"
  }
}
```

### 3. Run Tests

```bash
# Open Cypress Test Runner (interactive mode)
npm run test:e2e

# Run tests in headless mode
npm run test:e2e:ci

# Run specific test file
npm run test:e2e -- --spec cypress/e2e/auth.cy.ts

# Run with specific browser
npm run test:e2e -- --browser chrome
npm run test:e2e -- --browser firefox
npm run test:e2e -- --browser edge
```

## 📝 Test Suites

### Authentication (`auth.cy.ts`)

- ✅ Login with valid credentials
- ✅ Login validation and error handling
- ✅ Signup with email verification
- ✅ Password reset flow
- ✅ Two-factor authentication
- ✅ Session management

**Run:** `npm run test:e2e -- --spec cypress/e2e/auth.cy.ts`

### Dashboard (`dashboard.cy.ts`)

- ✅ Dashboard layout and widgets
- ✅ Navigation menu
- ✅ Key metrics display
- ✅ Recent invoices and transactions
- ✅ Quick actions
- ✅ Responsive design

**Run:** `npm run test:e2e -- --spec cypress/e2e/dashboard.cy.ts`

### Invoices (`invoices.cy.ts`)

- ✅ Create invoice
- ✅ Edit and delete invoices
- ✅ Send invoice
- ✅ Mark as paid
- ✅ Download PDF
- ✅ Invoice calculations (totals, tax)
- ✅ Status filtering

**Run:** `npm run test:e2e -- --spec cypress/e2e/invoices.cy.ts`

### Customers (`customers.cy.ts`)

- ✅ Create customer
- ✅ Edit customer details
- ✅ Delete/archive customer
- ✅ Search and filter
- ✅ View customer history
- ✅ Export to CSV

**Run:** `npm run test:e2e -- --spec cypress/e2e/customers.cy.ts`

### Products (`products.cy.ts`)

- ✅ Create product
- ✅ Edit product
- ✅ Manage inventory/stock
- ✅ Low stock alerts
- ✅ Search and filter
- ✅ Archive/delete products
- ✅ Product categories

**Run:** `npm run test:e2e -- --spec cypress/e2e/products.cy.ts`

### Reports (`reports.cy.ts`)

- ✅ Generate sales reports
- ✅ P&L statements
- ✅ Cash flow analysis
- ✅ Custom reports
- ✅ Export to PDF/CSV/Excel
- ✅ Report scheduling

**Run:** `npm run test:e2e -- --spec cypress/e2e/reports.cy.ts`

### Transactions (`transactions.cy.ts`)

- ✅ View transactions
- ✅ Filter by type and date
- ✅ Transaction details
- ✅ Export transactions
- ✅ Link to invoices

**Run:** `npm run test:e2e -- --spec cypress/e2e/transactions.cy.ts`

### Settings (`settings.cy.ts`)

- ✅ Profile management
- ✅ Security settings
- ✅ Organization settings
- ✅ Billing preferences
- ✅ Notification settings
- ✅ Team management

**Run:** `npm run test:e2e -- --spec cypress/e2e/settings.cy.ts`

### Admin (`admin.cy.ts`)

- ✅ Admin dashboard
- ✅ User management
- ✅ Organization management
- ✅ System settings
- ✅ Audit logs
- ✅ Database maintenance
- ✅ Feature flags

**Run:** `npm run test:e2e -- --spec cypress/e2e/admin.cy.ts`

### Subscription (`subscription.cy.ts`)

- ✅ View pricing plans
- ✅ Upgrade subscription
- ✅ Payment processing
- ✅ Payment history
- ✅ Cancel/reactivate
- ✅ Invoice download
- ✅ Usage limits

**Run:** `npm run test:e2e -- --spec cypress/e2e/subscription.cy.ts`

## 🎯 Custom Commands

Custom commands are available in all tests:

```typescript
// Authentication
cy.login(email, password);
cy.logout();
cy.register(firstName, lastName, email, password);

// Create operations
cy.createInvoice(customerId, items, notes);
cy.createCustomer(customerData);
cy.createProduct(productData);

// Assertions
cy.containsText(selector, text);
cy.checkNotification(type, message);

// UI interactions
cy.fillField(name, value);
cy.selectDropdown(selector, option);
cy.toggleSwitch(selector);

// API
cy.waitForApi(method, url);
```

## 📊 Test Data

### Test User

```json
{
  "email": "test@example.com",
  "password": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User"
}
```

### Test Admin

```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123!",
  "firstName": "Admin",
  "lastName": "User"
}
```

### Test Customer

```json
{
  "name": "Test Customer",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "address": "123 Test St"
}
```

### Test Product

```json
{
  "name": "Test Product",
  "sku": "TEST-001",
  "price": 99.99,
  "taxRate": 10
}
```

## 🔧 Configuration

### Base URL

Update in `cypress.config.ts`:

```typescript
baseUrl: 'http://localhost:5173';
```

### Timeouts

- Default: 10,000ms
- API: 10,000ms
- Page load: 60,000ms

### Viewport

- Default: 1280x720
- Mobile: 375x667
- Tablet: 768x1024

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)

## 📸 Recordings & Screenshots

### Screenshots

- Automatically captured on test failure
- Stored in `cypress/screenshots/`
- Organized by test file and date

### Video Recording

- Enabled in development mode
- Stored in `cypress/videos/`
- Disabled on CI by default
- Compression: 32 (high quality)

### View Results

```bash
# Open videos/screenshots folder
open cypress/screenshots
open cypress/videos
```

## 🐛 Debugging

### Open Debugger

```bash
npm run test:e2e:debug
```

### Headed Mode (Watch Browser)

```bash
npm run test:e2e:headed
```

### Single Test

```bash
npm run test:e2e -- --spec cypress/e2e/auth.cy.ts --headed
```

### Disable Video on Specific Test

```typescript
describe('Test Suite', { video: false }, () => {
  // tests
});
```

## 📋 Best Practices

### 1. Use Test IDs

Always use `data-testid` attributes for selecting elements:

```html
<button data-testid="save-button">Save</button>
```

```typescript
cy.get('[data-testid="save-button"]').click();
```

### 2. Wait for Elements

```typescript
// Good
cy.get('[data-testid="element"]', { timeout: 10000 }).should('exist');

// Avoid - implicit wait
cy.get('[data-testid="element"]').click();
```

### 3. Use Commands

Create custom commands for repeated actions:

```typescript
cy.login(email, password);
cy.createInvoice(customerId, items);
```

### 4. Clean State

Use `beforeEach` to reset state:

```typescript
beforeEach(() => {
  cy.clearCookies();
  cy.login(testUser.email, testUser.password);
});
```

### 5. Avoid Hard Waits

```typescript
// Bad
cy.wait(2000);

// Good
cy.get('[data-testid="element"]').should('be.visible');
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: npm run test:e2e:ci
```

### Environment Variables

Set in CI:

```bash
CYPRESS_BASE_URL=https://staging.moneyflow.app
CYPRESS_TEST_USER_EMAIL=ci-test@example.com
CYPRESS_TEST_USER_PASSWORD=***
```

### Reports

- Screenshots saved on failure
- Videos uploaded to Cypress Cloud (optional)
- Test results in JUnit XML format

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Reference](https://docs.cypress.io/api/table-of-contents)
- [Troubleshooting](https://docs.cypress.io/guides/references/troubleshooting)

## 🤝 Contributing

### Adding New Tests

1. Create test file in `cypress/e2e/`
2. Use existing custom commands
3. Follow naming convention: `feature.cy.ts`
4. Add to test suite documentation

### Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.login(testUser.email, testUser.password);
  });

  describe('Sub-feature', () => {
    it('should perform action', () => {
      // Test implementation
    });
  });
});
```

## 📄 License

See LICENSE file in project root.

## ❓ FAQ

**Q: Tests are running slowly**
A: Check network speed, increase timeouts, or run in headless mode for speed.

**Q: Screenshot not captured on failure**
A: Enable in config: `screenshotOnRunFailure: true`

**Q: How to skip a test?**
A: Use `it.skip()` or `describe.skip()`

**Q: How to run tests in parallel?**
A: Use `npm run test:e2e:ci` (parallel by default in headless)

**Q: Where are test artifacts stored?**
A: `cypress/screenshots/`, `cypress/videos/`, `cypress/downloads/`
