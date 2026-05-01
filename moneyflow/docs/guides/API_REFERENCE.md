# API Reference

Money Flow v2.0 API Documentation

## Base URL

```
Production: https://your-project.supabase.co
Development: http://localhost:54321
```

## Authentication

All API requests require authentication via JWT token.

### Headers

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-CSRF-Token: <csrf-token>
```

### Getting Auth Token

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

const token = data.session?.access_token;
```

## API Client

### Standard Response Format

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}
```

### Error Codes

| Code                  | Description              | HTTP Status |
| --------------------- | ------------------------ | ----------- |
| `AUTH_REQUIRED`       | Authentication required  | 401         |
| `FORBIDDEN`           | Insufficient permissions | 403         |
| `NOT_FOUND`           | Resource not found       | 404         |
| `VALIDATION_ERROR`    | Invalid input data       | 400         |
| `RATE_LIMIT_EXCEEDED` | Too many requests        | 429         |
| `INTERNAL_ERROR`      | Server error             | 500         |

## Endpoints

### Authentication

#### Sign Up

```http
POST /auth/v1/signup
```

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "data": {
    "business_name": "My Business"
  }
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  }
}
```

#### Sign In

```http
POST /auth/v1/token?grant_type=password
```

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

#### Sign Out

```http
POST /auth/v1/logout
```

### Organizations

#### List Organizations

```http
GET /rest/v1/rpc/get_user_organizations
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "My Business",
      "slug": "my-business",
      "role": "admin"
    }
  ]
}
```

#### Create Organization

```http
POST /rest/v1/rpc/create_organization
```

**Request:**

```json
{
  "name": "New Business",
  "slug": "new-business"
}
```

#### Switch Organization

```http
POST /rest/v1/rpc/switch_organization
```

**Request:**

```json
{
  "organization_id": "uuid"
}
```

### Permissions

#### Check Permission

```http
POST /rest/v1/rpc/check_user_permission
```

**Request:**

```json
{
  "permission_name": "invoices.create"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "has_permission": true
  }
}
```

#### Grant Permission

```http
POST /rest/v1/rpc/grant_user_permission
```

**Request:**

```json
{
  "user_id": "uuid",
  "permission_id": "uuid"
}
```

#### Revoke Permission

```http
POST /rest/v1/rpc/revoke_user_permission
```

**Request:**

```json
{
  "user_id": "uuid",
  "permission_id": "uuid"
}
```

### Invoices

#### List Invoices

```http
GET /rest/v1/invoices?select=*,customer:customers(*)
```

**Query Parameters:**

- `status` - Filter by status (draft, sent, paid, overdue)
- `customer_id` - Filter by customer
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-001",
      "status": "sent",
      "amount": 1000.0,
      "customer": {
        "id": "uuid",
        "name": "Customer Name"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "perPage": 20
  }
}
```

#### Get Invoice

```http
GET /rest/v1/invoices?id=eq.{id}&select=*,items:invoice_items(*),customer:customers(*)
```

#### Create Invoice

```http
POST /rest/v1/invoices
```

**Request:**

```json
{
  "customer_id": "uuid",
  "due_date": "2024-12-31",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "price": 500.0
    }
  ]
}
```

#### Update Invoice

```http
PATCH /rest/v1/invoices?id=eq.{id}
```

**Request:**

```json
{
  "status": "paid",
  "paid_date": "2024-11-24"
}
```

#### Delete Invoice

```http
DELETE /rest/v1/invoices?id=eq.{id}
```

### Customers

#### List Customers

```http
GET /rest/v1/customers?select=*
```

**Query Parameters:**

- `search` - Search by name or email
- `limit` - Number of results
- `offset` - Pagination offset

#### Create Customer

```http
POST /rest/v1/customers
```

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

### Products

#### List Products

```http
GET /rest/v1/products?select=*
```

#### Create Product

```http
POST /rest/v1/products
```

**Request:**

```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "sku": "PROD-001",
  "stock": 100
}
```

### Transactions

#### List Transactions

```http
GET /rest/v1/transactions?select=*
```

**Query Parameters:**

- `type` - Filter by type (income, expense)
- `date_from` - Start date (ISO 8601)
- `date_to` - End date (ISO 8601)
- `category` - Filter by category

#### Create Transaction

```http
POST /rest/v1/transactions
```

**Request:**

```json
{
  "type": "income",
  "amount": 1000.0,
  "date": "2024-11-24",
  "category": "Sales",
  "description": "Payment received"
}
```

## React Query Hooks

### useApiQuery

```typescript
import { useApiQuery } from '@/hooks/useApiQuery';

function InvoiceList() {
  const { data, isLoading, error } = useApiQuery({
    queryKey: ['invoices'],
    queryFn: () => fetchInvoices(),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <PageError error={error} />;

  return <div>{/* Render invoices */}</div>;
}
```

### useApiMutation

```typescript
import { useApiMutation } from '@/hooks/useApiQuery';

function CreateInvoice() {
  const { mutate, isLoading } = useApiMutation({
    mutationFn: createInvoice,
    invalidateQueries: ['invoices'],
    successMessage: 'Invoice created successfully',
  });

  const handleSubmit = (data) => {
    mutate(data);
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

## Rate Limits

| Endpoint Type  | Limit       | Window     |
| -------------- | ----------- | ---------- |
| Authentication | 5 requests  | 15 minutes |
| API Calls      | 60 requests | 1 minute   |
| Search         | 30 requests | 1 minute   |
| File Upload    | 10 requests | 1 hour     |
| Email          | 3 requests  | 1 hour     |

## Webhooks

### Invoice Paid

```http
POST https://your-domain.com/webhooks/invoice-paid
```

**Payload:**

```json
{
  "event": "invoice.paid",
  "data": {
    "invoice_id": "uuid",
    "amount": 1000.0,
    "paid_at": "2024-11-24T10:00:00Z"
  }
}
```

### Subscription Created

```http
POST https://your-domain.com/webhooks/subscription-created
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://your-project.supabase.co', 'your-anon-key');

// Create invoice
const { data, error } = await supabase
  .from('invoices')
  .insert({
    customer_id: 'uuid',
    amount: 1000.0,
  })
  .select()
  .single();
```

### Python

```python
from supabase import create_client, Client

supabase: Client = create_client(
    "https://your-project.supabase.co",
    "your-anon-key"
)

# Create invoice
data = supabase.table('invoices').insert({
    "customer_id": "uuid",
    "amount": 1000.00
}).execute()
```

## Best Practices

1. **Always use pagination** for list endpoints
2. **Implement retry logic** for failed requests
3. **Cache responses** when appropriate
4. **Handle rate limits** gracefully
5. **Validate input** before sending
6. **Use optimistic updates** for better UX
7. **Log API errors** for debugging

## Support

- **Documentation**: docs.moneyflow.app
- **API Status**: status.moneyflow.app
- **Support Email**: api@moneyflow.app
- **Discord**: discord.gg/moneyflow

---

Last Updated: November 24, 2024  
Version: 2.0.0
