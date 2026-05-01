# Services - Production Ready ✅

Production-ready service layer for API calls, database operations, and third-party integrations.

## Overview

All services follow consistent patterns with:
- ✅ Standardized error handling
- ✅ Retry logic with exponential backoff
- ✅ Request timeouts
- ✅ TypeScript types
- ✅ Consistent response formats
- ✅ Security best practices

## Service Structure

```
src/services/
├── api/                  # API service layer
├── supabase/             # Supabase-specific services
├── payments/             # Payment services (checkout, subscriptions, invoices, webhooks)
├── payment-providers/    # Payment provider integrations (JazzCash, EasyPaisa, Raast)
├── notifications/        # Notification services
├── analytics/            # Analytics services
└── index.ts              # Centralized exports
```

## API Services

### Base API (`baseApi.ts`)

Provides common utilities for all API services:

```typescript
import { 
  successResponse, 
  errorResponse, 
  paginatedSuccessResponse,
  withRetry,
  withTimeout,
  executeWithRetryAndTimeout,
  sanitizeSearch,
  validatePagination
} from '@/services/api/baseApi';
```

**Key Features:**
- Standard response formats
- Retry logic with exponential backoff
- Request timeouts
- Pagination utilities
- Input sanitization
- Error handling

### Available API Services

1. **baseApi.ts** - Base utilities and common functions
2. **authApi.ts** - Authentication operations
3. **organizationApi.ts** - Organization management
4. **userApi.ts** - User management
5. **customerApi.ts** - Customer CRUD operations
6. **productApi.ts** - Product and inventory management
7. **invoiceApi.ts** - Invoice operations
8. **invoicePaymentLinks.ts** - Invoice payment link generation
9. **invoiceReminders.ts** - Invoice reminder scheduling
10. **transactionApi.ts** - Transaction management
11. **reportApi.ts** - Report generation
12. **subscriptionApi.ts** - Subscription management
13. **paymentApi.ts** - Payment integration and transaction management
14. **adminApi.ts** - Admin operations
15. **dashboardApi.ts** - Dashboard data
16. **bankAccountApi.ts** - Bank account management
17. **expenseCategoryApi.ts** - Expense categories
18. **settingsApi.ts** - Application settings management

## Supabase Services

### Client (`supabase/client.ts`)

Production-ready Supabase client with proper configuration:

```typescript
import { supabase, getAuthenticatedClient, isSupabaseConfigured } from '@/services/supabase/client';
```

**Features:**
- PKCE flow for auth
- Auto token refresh
- Session persistence
- Type-safe with Database types

### Auth Service (`supabase/auth.ts`)

Authentication operations:

```typescript
import { 
  signInWithPassword,
  signUpWithPassword,
  signOut,
  resetPassword,
  updatePassword,
  verifyOtp,
  refreshSession,
  onAuthStateChange
} from '@/services/supabase/auth';
```

### Database Service (`supabase/database.ts`)

Database utilities:

```typescript
import {
  executeQuery,
  executeQueryWithRetry,
  checkTableAccess,
  getTableCount,
  batchInsert,
  executeRPC
} from '@/services/supabase/database';
```

### Storage Service (`supabase/storage.ts`)

File storage operations:

```typescript
import {
  uploadFile,
  getPublicUrl,
  getSignedUrl,
  deleteFile,
  listFiles,
  downloadFile,
  copyFile,
  moveFile
} from '@/services/supabase/storage';
```

### Realtime Service (`supabase/realtime.ts`)

Real-time subscriptions:

```typescript
import {
  subscribeToTable,
  subscribeToInserts,
  subscribeToUpdates,
  subscribeToDeletes,
  subscribeToOrganizationChanges,
  unsubscribe,
  unsubscribeAll
} from '@/services/supabase/realtime';
```

## Payment Services

### Checkout (`payments/checkout.ts`)

Payment checkout flow for local payment methods:

```typescript
import {
  createCheckoutSession,
  redirectToCheckout,
  verifyCheckoutSession,
  getAvailablePaymentProviders
} from '@/services/payments/checkout';
```

**Supported Providers:**
- JazzCash
- EasyPaisa
- Raast

### Subscriptions (`payments/subscriptions.ts`)

Subscription management:

```typescript
import {
  getSubscriptionDetails,
  updateSubscriptionPlan,
  cancelSubscription,
  getBillingHistory
} from '@/services/payments/subscriptions';
```

### Payment Providers (`payment-providers/`)

Direct integration with Pakistani payment providers:

```typescript
// JazzCash
import {
  initiateJazzCashPayment,
  verifyJazzCashWebhook,
  parseJazzCashWebhook,
  submitJazzCashPayment
} from '@/services/payment-providers/jazzcash';

// EasyPaisa
import {
  initiateEasyPaisaPayment,
  verifyEasyPaisaWebhook,
  parseEasyPaisaWebhook,
  submitEasyPaisaPayment
} from '@/services/payment-providers/easypaisa';

// Raast
import {
  initiateRaastPayment,
  generateRaastQRData,
  verifyRaastWebhook,
  parseRaastWebhook,
  formatRaastQRString
} from '@/services/payment-providers/raast';
```

### Webhooks (`payments/webhooks.ts`)

Webhook event handlers (server-side):

```typescript
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  handlePaymentCompleted,
  handlePaymentFailed,
  handleSubscriptionUpdated
} from '@/services/payments/webhooks';
```

## Notification Services

### Email (`notifications/email.ts`)

Email sending:

```typescript
import {
  sendEmail,
  sendInvoiceEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPaymentReminderEmail
} from '@/services/notifications/email';
```

### Push (`notifications/push.ts`)

Browser push notifications:

```typescript
import {
  requestNotificationPermission,
  showNotification,
  showSuccessNotification,
  showErrorNotification,
  subscribeToPushNotifications
} from '@/services/notifications/push';
```

### WhatsApp (`notifications/whatsapp.ts`)

WhatsApp messaging:

```typescript
import {
  sendWhatsAppMessage,
  sendInvoiceViaWhatsApp,
  sendPaymentReminderViaWhatsApp,
  formatPhoneToE164,
  isValidPhoneNumber
} from '@/services/notifications/whatsapp';
```

## Analytics Services

### Google Analytics (`analytics/googleAnalytics.ts`)

GA4 integration:

```typescript
import {
  initializeGoogleAnalytics,
  trackPageView,
  trackEvent,
  trackLogin,
  trackSignup,
  trackInvoiceCreated,
  setUserId,
  setUserProperties
} from '@/services/analytics/googleAnalytics';
```

### Mixpanel (`analytics/mixpanel.ts`)

Mixpanel integration:

```typescript
import {
  initializeMixpanel,
  trackEvent,
  identifyUser,
  setUserProperties,
  trackPageView,
  resetUser
} from '@/services/analytics/mixpanel';
```

## Usage Patterns

### Standard API Call

```typescript
import { getCustomers } from '@/services/api/customerApi';
import { handleError } from '@/lib/errorHandler';

async function loadCustomers() {
  const { data, error } = await getCustomers(organizationId, filters, page, perPage);
  
  if (error) {
    handleError(error, 'loadCustomers');
    return;
  }
  
  // Use data
  setCustomers(data);
}
```

### With Retry and Timeout

```typescript
import { executeWithRetryAndTimeout } from '@/services/api/baseApi';

const result = await executeWithRetryAndTimeout(
  () => getCustomers(organizationId),
  {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
  }
);
```

### Real-time Subscription

```typescript
import { subscribeToOrganizationChanges } from '@/services/supabase/realtime';

useEffect(() => {
  const channel = subscribeToOrganizationChanges<Invoice>(
    'invoices',
    organizationId,
    (payload) => {
      if (payload.eventType === 'INSERT') {
        // Handle new invoice
      }
    }
  );

  return () => {
    unsubscribe(channel);
  };
}, [organizationId]);
```

### File Upload

```typescript
import { uploadFile, getPublicUrl } from '@/services/supabase/storage';

const { data, error } = await uploadFile(
  'invoices',
  `invoice-${invoiceId}.pdf`,
  file,
  {
    contentType: 'application/pdf',
    cacheControl: '3600',
  }
);

if (data) {
  const url = getPublicUrl('invoices', data.path);
}
```

## Error Handling

All services return consistent error formats:

```typescript
// Single item response
{ data: T | null; error: Error | null }

// Paginated response
{
  data: T[];
  count: number;
  page: number;
  perPage: number;
  totalPages: number;
  error: Error | null;
}
```

## Best Practices

1. **Always check for errors**:
   ```typescript
   const { data, error } = await getCustomers(orgId);
   if (error) {
     handleError(error);
     return;
   }
   ```

2. **Use retry for network operations**:
   ```typescript
   await executeWithRetryAndTimeout(() => apiCall());
   ```

3. **Sanitize user input**:
   ```typescript
   const safeSearch = sanitizeSearch(userInput);
   ```

4. **Validate pagination**:
   ```typescript
   const { page, perPage } = validatePagination(pageInput, perPageInput);
   ```

5. **Use organization ID filtering**:
   ```typescript
   // Always filter by organization_id for multi-tenant security
   .eq('organization_id', organizationId)
   ```

6. **Handle timeouts gracefully**:
   ```typescript
   try {
     await withTimeout(apiCall(), 30000);
   } catch (error) {
     if (error.message.includes('timed out')) {
       // Handle timeout
     }
   }
   ```

## Security

- ✅ All queries filtered by organization_id
- ✅ Input sanitization for SQL injection prevention
- ✅ Request timeouts to prevent hanging requests
- ✅ Retry logic excludes client errors (4xx)
- ✅ Proper error messages (no sensitive data exposure)

## Performance

- ✅ Retry with exponential backoff
- ✅ Request timeouts
- ✅ Batch operations for bulk inserts
- ✅ Efficient pagination
- ✅ Connection pooling (handled by Supabase)

## Testing

Services can be tested by:
1. Mocking Supabase client
2. Using MSW (Mock Service Worker) for API mocks
3. Testing error scenarios
4. Testing retry logic
5. Testing timeout behavior

## Dependencies

- `@supabase/supabase-js` - Supabase client
- `crypto-js` - Cryptographic functions for payment provider integrations
- TypeScript types from `@/types`

---

**Status**: ✅ All services are production-ready and error-free

