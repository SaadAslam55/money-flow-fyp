# Supabase Edge Functions

This directory contains all Supabase Edge Functions for the Money Flow application. All functions are production-ready with proper error handling, authentication, validation, and logging.

## Available Functions

### 1. `create-invoice`
Creates a new invoice with line items and calculates totals.

**Endpoint:** `POST /functions/v1/create-invoice`

**Authentication:** Required (admin, manager, accountant)

**Request Body:**
```json
{
  "customer_id": "uuid",
  "invoice_date": "2024-01-01",
  "due_date": "2024-01-31",
  "items": [
    {
      "product_id": "uuid",
      "description": "Product name",
      "quantity": 2,
      "unit_price": 100.00,
      "tax_rate": 10
    }
  ],
  "notes": "Optional notes",
  "terms": "Payment terms",
  "discount_amount": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* invoice object */ },
  "message": "Invoice created successfully"
}
```

### 2. `send-invoice-email`
Sends an invoice via email using Resend API.

**Endpoint:** `POST /functions/v1/send-invoice-email`

**Authentication:** Required (admin, manager, accountant)

**Request Body:**
```json
{
  "invoice_id": "uuid",
  "recipient_email": "customer@example.com",
  "message": "Optional custom message"
}
```

**Response:**
```json
{
  "success": true,
  "email_id": "resend_email_id",
  "message": "Invoice sent successfully"
}
```

### 3. `stripe-webhook`
Handles Stripe webhook events for subscription management.

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Authentication:** Webhook signature verification

**Handles Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 4. `payment-webhook`
Processes payment webhooks from various payment providers.

**Endpoint:** `POST /functions/v1/payment-webhook`

**Request Body:**
```json
{
  "invoice_id": "uuid",
  "amount": 1000.00,
  "payment_method": "stripe",
  "transaction_id": "txn_123",
  "payment_date": "2024-01-01T00:00:00Z",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "invoice_id": "uuid",
    "amount_paid": 1000.00,
    "amount_due": 0,
    "status": "paid"
  }
}
```

### 5. `generate-report`
Generates financial reports (P&L, Balance Sheet, Cash Flow, etc.).

**Endpoint:** `POST /functions/v1/generate-report`

**Authentication:** Required (admin, manager, accountant)

**Request Body:**
```json
{
  "report_type": "profit_loss",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "organization_id": "uuid"
}
```

**Report Types:**
- `profit_loss` - Profit & Loss Statement
- `balance_sheet` - Balance Sheet
- `cash_flow` - Cash Flow Statement
- `sales` - Sales Report
- `expenses` - Expenses Report

### 6. `adjust-stock`
Adjusts product stock levels and logs movements.

**Endpoint:** `POST /functions/v1/adjust-stock`

**Authentication:** Required (admin, manager)

**Request Body:**
```json
{
  "product_id": "uuid",
  "adjustment_type": "add",
  "quantity": 10,
  "reason": "Stock adjustment",
  "reference_type": "purchase",
  "reference_id": "uuid"
}
```

**Adjustment Types:**
- `add` - Add to stock
- `subtract` - Subtract from stock
- `set` - Set stock to specific value

## Shared Utilities

### `_shared/cors.ts`
CORS handling utilities for all functions.

### `_shared/auth.ts`
Authentication and authorization utilities.

### `_shared/validators.ts`
Input validation utilities.

## Environment Variables

Required environment variables for Edge Functions:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_DOMAIN=yourdomain.com

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Application
APP_URL=https://your-app.com
```

## Deployment

### Deploy All Functions
```bash
supabase functions deploy
```

### Deploy Specific Function
```bash
supabase functions deploy create-invoice
```

### Deploy with Environment Variables
```bash
supabase secrets set RESEND_API_KEY=your-key
supabase secrets set STRIPE_SECRET_KEY=your-key
```

## Best Practices

1. **Authentication**: All functions (except webhooks) require authentication
2. **Validation**: All inputs are validated before processing
3. **Error Handling**: Comprehensive error handling with proper HTTP status codes
4. **Logging**: All actions are logged in audit_logs table
5. **CORS**: Proper CORS handling for cross-origin requests
6. **Type Safety**: Full TypeScript support
7. **Security**: Input sanitization, SQL injection prevention, XSS protection

## Testing

### Local Testing
```bash
# Start Supabase locally
supabase start

# Test function locally
supabase functions serve create-invoice
```

### Test with curl
```bash
curl -X POST http://localhost:54321/functions/v1/create-invoice \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invoice_date": "2024-01-01", "due_date": "2024-01-31", "items": [...]}'
```

## Error Handling

All functions return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Security

- JWT token verification
- Role-based access control
- Input validation and sanitization
- SQL injection prevention (using Supabase client)
- XSS protection
- Webhook signature verification

## Monitoring

All functions log to:
- Console (for debugging)
- Audit logs table (for audit trail)
- Error tracking (for production monitoring)

## Performance

- Efficient database queries
- Proper indexing usage
- Minimal data fetching
- Optimized calculations

