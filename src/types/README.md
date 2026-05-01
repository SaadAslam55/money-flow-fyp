# Type Definitions - Production Ready ✅

Comprehensive TypeScript type definitions for the Money Flow application.

## Overview

All type definitions are organized by domain and follow TypeScript best practices:
- ✅ Strict type safety
- ✅ No `any` types (except where absolutely necessary)
- ✅ Comprehensive JSDoc comments
- ✅ Consistent naming conventions
- ✅ Reusable type utilities

## Type Structure

```
src/types/
├── database.types.ts    # Database table types and enums
├── api.types.ts         # API request/response types
├── auth.types.ts        # Authentication types
├── subscription.types.ts # Subscription and billing types
├── invoice.types.ts     # Invoice-specific types
├── dashboard.types.ts   # Dashboard data types
├── report.types.ts      # Report data types
├── ui.types.ts          # UI component types
├── models.types.ts      # Domain model types
├── index.ts             # Centralized exports
└── README.md            # This file
```

## Usage

### Import from Central Index

```typescript
// Import from centralized index
import type { 
  User, 
  Invoice, 
  InvoiceStatus,
  SignInRequest,
  Subscription
} from '@/types';
```

### Import from Specific Files

```typescript
// Import from specific files for better tree-shaking
import type { InvoiceStatus, PaymentMethod } from '@/types/database.types';
import type { SignInRequest, AuthSession } from '@/types/auth.types';
```

## Type Categories

### 1. Database Types (`database.types.ts`)

Database table types and enums matching your Supabase schema:

```typescript
import type { 
  User, 
  Organization, 
  Invoice, 
  InvoiceStatus,
  PaymentMethod,
  TransactionType
} from '@/types/database.types';
```

**Key Types:**
- `InvoiceStatus` - 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
- `PaymentMethod` - 'cash' | 'bank_transfer' | 'card' | 'check' | 'upi' | 'other'
- `TransactionType` - 'income' | 'expense' | 'transfer'
- `UserRole` - 'super_admin' | 'admin' | 'manager' | 'accountant' | 'cashier' | 'viewer'

**Utilities:**
- `Insert<T>` - Type for database inserts (omits auto-generated fields)
- `Update<T>` - Type for database updates
- `WithRelations<T, R>` - Type for queries with relations

### 2. API Types (`api.types.ts`)

Request and response types for API endpoints:

```typescript
import type {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoiceResponse,
  PaginationParams
} from '@/types/api.types';
```

**Key Types:**
- Request DTOs (Data Transfer Objects)
- Response types with relations
- Pagination and sorting types
- File upload types

### 3. Auth Types (`auth.types.ts`)

Authentication and authorization types:

```typescript
import type {
  SignInRequest,
  SignInResponse,
  AuthSession,
  PermissionCheck,
  OAuthProvider
} from '@/types/auth.types';
```

**Key Types:**
- Sign in/up requests and responses
- Session management
- Permission checking
- OAuth integration
- 2FA types

### 4. Subscription Types (`subscription.types.ts`)

Subscription and billing types:

```typescript
import type {
  Subscription,
  PlanDetails,
  SubscriptionUsage,
  BillingInvoice,
  CheckoutSessionRequest
} from '@/types/subscription.types';
```

**Key Types:**
- Subscription details
- Plan features and limits
- Usage tracking
- Billing invoices
- Checkout flow

### 5. Invoice Types (`invoice.types.ts`)

Invoice-specific types:

```typescript
import type {
  InvoiceFormData,
  InvoiceWithDetails,
  PaymentRecord,
  InvoiceCalculation
} from '@/types/invoice.types';
```

### 6. Dashboard Types (`dashboard.types.ts`)

Dashboard statistics and chart data:

```typescript
import type {
  DashboardStats,
  ChartData,
  RecentInvoice
} from '@/types/dashboard.types';
```

### 7. Report Types (`report.types.ts`)

Financial report types:

```typescript
import type {
  ProfitLossData,
  BalanceSheetData,
  CashFlowData,
  SalesReportData
} from '@/types/report.types';
```

### 8. UI Types (`ui.types.ts`)

UI component and form types:

```typescript
import type {
  FormState,
  TableState,
  DialogState,
  ToastOptions,
  FileUploadState
} from '@/types/ui.types';
```

**Key Types:**
- Form state management
- Table configuration
- Modal/dialog state
- Toast notifications
- File upload
- Chart configuration
- Theme types

### 9. Model Types (`models.types.ts`)

Domain models with computed properties:

```typescript
import type {
  User as UserModel,
  Organization as OrganizationModel
} from '@/types/models.types';
```

**Key Types:**
- Extended domain models
- Computed properties
- Business logic types

## Type Utilities

### Database Type Helpers

```typescript
// Insert type (omits auto-generated fields)
type NewInvoice = Insert<Invoice>;

// Update type (all fields optional except id)
type InvoiceUpdate = Update<Invoice>;

// With relations
type InvoiceWithCustomer = WithRelations<Invoice, { customer: Customer }>;
```

### Filter Types

```typescript
import type { InvoiceFilters, TransactionFilters } from '@/types/database.types';

const filters: InvoiceFilters = {
  status: ['sent', 'overdue'],
  customer_id: 'customer-123',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
};
```

## Best Practices

### 1. Use Type Imports

```typescript
// ✅ Good - Type-only import
import type { User, Invoice } from '@/types';

// ❌ Bad - Value import for types
import { User, Invoice } from '@/types';
```

### 2. Use Specific Imports

```typescript
// ✅ Good - Import from specific file
import type { InvoiceStatus } from '@/types/database.types';

// ❌ Bad - Import everything from index
import type { InvoiceStatus } from '@/types';
```

### 3. Use Type Utilities

```typescript
// ✅ Good - Use Insert utility
const newInvoice: Insert<Invoice> = {
  organization_id: 'org-123',
  customer_id: 'customer-123',
  // ... other fields (id, created_at, updated_at omitted)
};

// ❌ Bad - Manually omit fields
const newInvoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> = {
  // ...
};
```

### 4. Extend Types Properly

```typescript
// ✅ Good - Extend with intersection
interface InvoiceWithDetails extends Invoice {
  customer: Customer;
  items: InvoiceItem[];
}

// ❌ Bad - Modify original type
interface Invoice {
  customer?: Customer; // Don't modify base types
}
```

## Type Generation

### Auto-generate Database Types

For production, you can auto-generate database types from Supabase:

```bash
# Generate types from Supabase project
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

Or using the Supabase CLI:

```bash
supabase gen types typescript --local > src/types/database.types.ts
```

## Type Safety Checklist

- ✅ All types are explicitly defined
- ✅ No `any` types (except in error handling)
- ✅ Enums use union types
- ✅ Optional fields use `?` or `| null`
- ✅ Relations are properly typed
- ✅ Request/response types match API contracts
- ✅ Form types match validation schemas

## Common Patterns

### API Response Pattern

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}
```

### Paginated Response Pattern

```typescript
interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  perPage: number;
  totalPages: number;
  error: Error | null;
}
```

### Form State Pattern

```typescript
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}
```

## Migration Guide

If you're updating from old types:

1. **Update imports:**
   ```typescript
   // Old
   import { User } from '@/types';
   
   // New
   import type { User } from '@/types';
   ```

2. **Use new enum types:**
   ```typescript
   // Old
   type Status = 'draft' | 'sent' | 'paid';
   
   // New
   import type { InvoiceStatus } from '@/types/database.types';
   ```

3. **Use type utilities:**
   ```typescript
   // Old
   type NewInvoice = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;
   
   // New
   import type { Insert } from '@/types/database.types';
   type NewInvoice = Insert<Invoice>;
   ```

## Troubleshooting

### Type Errors

If you encounter type errors:

1. **Check imports:**
   ```typescript
   // Make sure you're importing from the correct file
   import type { InvoiceStatus } from '@/types/database.types';
   ```

2. **Check type definitions:**
   ```typescript
   // Verify the type exists in the file
   // Check src/types/database.types.ts for InvoiceStatus
   ```

3. **Use type assertions carefully:**
   ```typescript
   // Only when absolutely necessary
   const value = data as InvoiceStatus;
   ```

### Missing Types

If a type is missing:

1. Check if it exists in another file
2. Add it to the appropriate file
3. Export it from `index.ts`
4. Update this README

---

**Status**: ✅ All type definitions are production-ready and error-free

