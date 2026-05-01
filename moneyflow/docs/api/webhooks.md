# Webhooks Documentation

## Money Flow - Event Webhooks

---

## 1. Overview

Webhooks allow your application to receive real-time notifications when events occur in Money Flow.

### 1.1 How It Works

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Money Flow    │         │    Webhook      │         │  Your Server    │
│                 │─────────│    Event        │─────────│                 │
│  Event Occurs   │         │                 │         │  Receive POST   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## 2. Setting Up Webhooks

### 2.1 Register Webhook Endpoint

```http
POST /api/v1/webhooks
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request:**

```json
{
  "url": "https://your-server.com/webhooks/moneyflow",
  "events": ["invoice.created", "invoice.paid", "payment.received"],
  "secret": "your-webhook-secret"
}
```

**Response:**

```json
{
  "id": "wh-uuid",
  "url": "https://your-server.com/webhooks/moneyflow",
  "events": ["invoice.created", "invoice.paid", "payment.received"],
  "active": true,
  "created_at": "2024-11-26T10:00:00Z"
}
```

### 2.2 List Webhooks

```http
GET /api/v1/webhooks
Authorization: Bearer <admin-token>
```

### 2.3 Delete Webhook

```http
DELETE /api/v1/webhooks/:id
Authorization: Bearer <admin-token>
```

---

## 3. Webhook Events

### 3.1 Available Events

| Event               | Description              |
| ------------------- | ------------------------ |
| **Invoice Events**  |
| `invoice.created`   | New invoice created      |
| `invoice.updated`   | Invoice modified         |
| `invoice.deleted`   | Invoice deleted          |
| `invoice.sent`      | Invoice sent to customer |
| `invoice.viewed`    | Customer viewed invoice  |
| `invoice.paid`      | Invoice fully paid       |
| `invoice.overdue`   | Invoice became overdue   |
| **Payment Events**  |
| `payment.received`  | Payment recorded         |
| `payment.refunded`  | Payment refunded         |
| **Customer Events** |
| `customer.created`  | New customer added       |
| `customer.updated`  | Customer modified        |
| `customer.deleted`  | Customer removed         |
| **Product Events**  |
| `product.created`   | New product added        |
| `product.updated`   | Product modified         |
| `product.low_stock` | Stock below threshold    |

---

## 4. Webhook Payload

### 4.1 Payload Structure

```json
{
  "id": "evt-uuid",
  "type": "invoice.paid",
  "created_at": "2024-11-26T10:30:00Z",
  "organization_id": "org-uuid",
  "data": {
    "object": {
      "id": "inv-uuid",
      "invoice_number": "INV-202411-0001",
      "customer_id": "cust-uuid",
      "total": 1100.0,
      "status": "paid"
    },
    "previous_attributes": {
      "status": "sent"
    }
  }
}
```

### 4.2 Event-Specific Payloads

#### invoice.created

```json
{
  "type": "invoice.created",
  "data": {
    "object": {
      "id": "inv-uuid",
      "invoice_number": "INV-202411-0001",
      "customer_id": "cust-uuid",
      "status": "draft",
      "total": 1100.00,
      "items": [...]
    }
  }
}
```

#### payment.received

```json
{
  "type": "payment.received",
  "data": {
    "object": {
      "id": "txn-uuid",
      "invoice_id": "inv-uuid",
      "amount": 500.0,
      "payment_method": "bank_transfer"
    }
  }
}
```

#### product.low_stock

```json
{
  "type": "product.low_stock",
  "data": {
    "object": {
      "id": "prod-uuid",
      "name": "Widget Pro",
      "sku": "WGT-001",
      "stock_quantity": 5,
      "low_stock_alert": 10
    }
  }
}
```

---

## 5. Security

### 5.1 Signature Verification

All webhooks include a signature header for verification:

```
X-Webhook-Signature: sha256=abc123...
```

### 5.2 Verify Signature (Node.js)

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expectedSignature}`));
}

// Express middleware
app.post('/webhooks/moneyflow', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
  const event = req.body;
  console.log('Received:', event.type);

  res.status(200).send('OK');
});
```

### 5.3 IP Allowlist

Webhook requests come from these IP ranges:

- `104.21.0.0/16` (Cloudflare)
- Verify via `X-Forwarded-For` header

---

## 6. Handling Webhooks

### 6.1 Best Practices

1. **Return 200 quickly** - Process asynchronously
2. **Handle duplicates** - Events may be sent multiple times
3. **Verify signatures** - Always validate the signature
4. **Log everything** - Keep records for debugging
5. **Handle failures** - Implement retry logic

### 6.2 Express Handler Example

```typescript
import express from 'express';
import { Queue } from 'bull';

const app = express();
const webhookQueue = new Queue('webhooks');

app.post('/webhooks/moneyflow', express.json(), async (req, res) => {
  // Verify signature
  if (!verifySignature(req)) {
    return res.status(401).send('Invalid signature');
  }

  // Quick response
  res.status(200).send('OK');

  // Process asynchronously
  await webhookQueue.add('process', {
    event: req.body,
  });
});

// Worker
webhookQueue.process('process', async (job) => {
  const { event } = job.data;

  switch (event.type) {
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
    case 'payment.received':
      await handlePaymentReceived(event.data.object);
      break;
    // ... handle other events
  }
});
```

---

## 7. Retry Policy

### 7.1 Automatic Retries

| Attempt | Delay      |
| ------- | ---------- |
| 1       | Immediate  |
| 2       | 5 minutes  |
| 3       | 30 minutes |
| 4       | 2 hours    |
| 5       | 24 hours   |

### 7.2 Failure Handling

After 5 failed attempts:

- Webhook is marked as failing
- Admin notification sent
- Manual retry available via API

---

## 8. Testing Webhooks

### 8.1 Test Endpoint

```http
POST /api/v1/webhooks/:id/test
Authorization: Bearer <admin-token>
```

**Request:**

```json
{
  "event_type": "invoice.paid"
}
```

### 8.2 Using ngrok for Local Development

```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL for webhook registration
# https://abc123.ngrok.io/webhooks/moneyflow
```

---

## 9. Webhook Logs

### 9.1 View Webhook Deliveries

```http
GET /api/v1/webhooks/:id/deliveries
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "data": [
    {
      "id": "del-uuid",
      "event_type": "invoice.paid",
      "status": "success",
      "response_code": 200,
      "duration_ms": 234,
      "created_at": "2024-11-26T10:30:00Z"
    }
  ]
}
```

### 9.2 Retry Failed Delivery

```http
POST /api/v1/webhooks/deliveries/:id/retry
Authorization: Bearer <admin-token>
```

---

## 10. Unsubscribing

### 10.1 Update Events

```http
PATCH /api/v1/webhooks/:id
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request:**

```json
{
  "events": ["invoice.paid"]
}
```

### 10.2 Disable Webhook

```http
PATCH /api/v1/webhooks/:id
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request:**

```json
{
  "active": false
}
```

---

**Document Version:** 1.0  
**Last Updated:** November 2024
