# Tests

Comprehensive test suite for the Money Flow application. This directory contains unit tests, integration tests, and end-to-end (E2E) tests.

## 📁 Directory Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/         # Component tests
│   ├── hooks/             # Hook tests
│   ├── services/          # Service/API tests
│   └── utils/             # Utility function tests
├── integration/            # Integration tests
│   ├── auth-flow.test.ts  # Authentication flow
│   ├── invoice-creation.test.ts
│   ├── payment-flow.test.ts
│   └── reporting.test.ts
├── e2e/                    # End-to-end tests (Playwright)
│   ├── auth.spec.ts
│   ├── customer.spec.ts
│   ├── dashboard.spec.ts
│   └── invoice.spec.ts
├── mocks/                  # Mock data and handlers
│   ├── handlers.ts        # MSW request handlers
│   ├── mockData.ts        # Mock data
│   └── server.ts          # MSW server setup
├── setup/                  # Test setup and utilities
│   ├── setupTests.ts      # Test environment setup
│   └── testUtils.tsx      # Test utilities and helpers
└── results/                # Test results (gitignored)
```

## 🚀 Quick Start

### Run All Tests

```bash
# Run unit and integration tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run E2E tests
npx playwright test
```

### Run Specific Test Types

```bash
# Unit tests only
npm test -- tests/unit

# Integration tests only
npm test -- tests/integration

# Specific test file
npm test -- tests/unit/components/Button.test.tsx

# E2E tests for specific browser
npx playwright test --project=chromium
```

## 📝 Writing Tests

### Unit Tests

Unit tests test individual components, hooks, and utilities in isolation.

**Example: Component Test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Example: Hook Test**

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { renderWithProviders } from '../setup/testUtils';

describe('useAuth', () => {
  it('returns user when authenticated', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => renderWithProviders(children),
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeDefined();
    });
  });
});
```

### Integration Tests

Integration tests test multiple components/services working together.

**Example: Integration Test**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../setup/testUtils';
import InvoiceForm from '@/components/invoices/InvoiceForm';

describe('Invoice Creation Flow', () => {
  it('creates invoice successfully', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(<InvoiceForm />);

    // Fill form
    await userEvent.type(getByLabelText('Customer'), 'John Doe');
    await userEvent.type(getByLabelText('Amount'), '1000');
    
    // Submit
    getByRole('button', { name: 'Create Invoice' }).click();

    // Verify
    await waitFor(() => {
      expect(screen.getByText('Invoice created successfully')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

E2E tests test the full user flow in a real browser.

**Example: E2E Test**

```typescript
import { test, expect } from '@playwright/test';

test('user can create invoice', async ({ page }) => {
  // Navigate to invoices page
  await page.goto('/invoices');
  
  // Click create button
  await page.click('text=Create Invoice');
  
  // Fill form
  await page.fill('[name="customer_id"]', 'customer-123');
  await page.fill('[name="amount"]', '1000');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verify success
  await expect(page.locator('text=Invoice created')).toBeVisible();
});
```

## 🛠️ Test Utilities

### `renderWithProviders`

Renders components with all necessary providers (React Query, Router, etc.).

```typescript
import { renderWithProviders } from '../setup/testUtils';

const { getByText } = renderWithProviders(<Component />, {
  user: mockUser,
  organization: mockOrganization,
});
```

### Mock Data Factories

Create consistent mock data for tests.

```typescript
import { createMockUser, createMockInvoice } from '../setup/testUtils';

const user = createMockUser({ email: 'test@example.com' });
const invoice = createMockInvoice({ total_amount: 2000 });
```

### MSW Handlers

Mock API requests using MSW handlers.

```typescript
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Override handler for specific test
server.use(
  http.get('/api/invoices', () => {
    return HttpResponse.json([mockInvoice]);
  })
);
```

## 📊 Coverage

### View Coverage Report

```bash
npm run test:coverage
```

Coverage reports are generated in `tests/results/coverage/`.

### Coverage Thresholds

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

## 🔧 Configuration

### Vitest Configuration

See `vitest.config.ts` for:
- Test environment setup
- Coverage configuration
- Test file patterns
- Mock configuration

### Playwright Configuration

See `playwright.config.ts` for:
- Browser configurations
- Test timeouts
- Screenshot/video settings
- Base URL configuration

## 🎯 Best Practices

### 1. Test Structure

- Use `describe` blocks to group related tests
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking

- Mock external dependencies
- Use MSW for API mocking
- Reset mocks between tests

### 3. Assertions

- Use specific assertions
- Test behavior, not implementation
- Test edge cases and error scenarios

### 4. Test Data

- Use factories for consistent data
- Keep test data minimal and focused
- Use realistic data

### 5. Async Testing

- Use `waitFor` for async operations
- Avoid `setTimeout` in tests
- Use proper async/await patterns

## 🐛 Debugging Tests

### Debug Unit/Integration Tests

```bash
# Run in watch mode
npm test -- --watch

# Run specific test
npm test -- Button.test.tsx

# Debug with Node inspector
node --inspect-brk node_modules/.bin/vitest
```

### Debug E2E Tests

```bash
# Run in headed mode
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run specific test
npx playwright test auth.spec.ts
```

## 📈 CI/CD Integration

Tests run automatically in CI/CD pipelines:

- **Unit/Integration**: Run on every commit
- **E2E**: Run on pull requests and main branch
- **Coverage**: Tracked and reported

## 🔍 Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run in watch mode
npm test -- --watch

# Run E2E tests
npx playwright test

# Run E2E in UI mode
npx playwright test --ui

# Update E2E snapshots
npx playwright test --update-snapshots
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)

## 🎓 Test Examples

See existing test files for examples:
- `tests/unit/components/Button.test.tsx` - Component testing
- `tests/unit/hooks/useAuth.test.ts` - Hook testing
- `tests/integration/auth-flow.test.ts` - Integration testing
- `tests/e2e/auth.spec.ts` - E2E testing

