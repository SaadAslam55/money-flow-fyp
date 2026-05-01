# API Endpoints Reference

## Money Flow - REST API Documentation

---

**Base URL:** `https://api.mtkcodex.site/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Invoices](#invoices)
3. [Customers](#customers)
4. [Products](#products)
5. [Transactions](#transactions)
6. [Reports](#reports)
7. [Users](#users)
8. [Organizations](#organizations)

---

## Response Format

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [{ "field": "email", "message": "Invalid email format" }]
}
```

---

## Authentication

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "organization_id": "org-uuid",
  "organization": {
    "id": "org-uuid",
    "name": "Acme Corp"
  }
}
```

---

## Invoices

### List Invoices

```http
GET /invoices
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter     | Type   | Default    | Description              |
| ------------- | ------ | ---------- | ------------------------ |
| `page`        | number | 1          | Page number              |
| `limit`       | number | 20         | Items per page (max 100) |
| `status`      | string | -          | Filter by status         |
| `customer_id` | string | -          | Filter by customer       |
| `from_date`   | date   | -          | Filter from date         |
| `to_date`     | date   | -          | Filter to date           |
| `search`      | string | -          | Search invoice number    |
| `sort`        | string | created_at | Sort field               |
| `order`       | string | desc       | Sort order (asc/desc)    |

**Response:**

```json
{
  "data": [
    {
      "id": "inv-uuid",
      "invoice_number": "INV-202411-0001",
      "customer_id": "cust-uuid",
      "status": "sent",
      "issue_date": "2024-11-01",
      "due_date": "2024-12-01",
      "subtotal": 1000.0,
      "tax_amount": 100.0,
      "total": 1100.0,
      "amount_paid": 0.0,
      "customer": {
        "id": "cust-uuid",
        "name": "Jane Smith"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

### Get Invoice

```http
GET /invoices/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "inv-uuid",
  "invoice_number": "INV-202411-0001",
  "customer": { ... },
  "items": [
    {
      "id": "item-uuid",
      "description": "Web Development",
      "quantity": 10,
      "unit_price": 100.00,
      "total": 1000.00
    }
  ],
  "subtotal": 1000.00,
  "tax_rate": 10,
  "tax_amount": 100.00,
  "total": 1100.00,
  "status": "sent"
}
```

### Create Invoice

```http
POST /invoices
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "customer_id": "cust-uuid",
  "due_date": "2024-12-01",
  "notes": "Thank you for your business",
  "items": [
    {
      "product_id": "prod-uuid",
      "description": "Web Development",
      "quantity": 10,
      "unit_price": 100.0
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "id": "inv-uuid",
  "invoice_number": "INV-202411-0001",
  "status": "draft",
  ...
}
```

### Update Invoice

```http
PATCH /invoices/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "due_date": "2024-12-15",
  "notes": "Updated notes"
}
```

### Delete Invoice

```http
DELETE /invoices/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Send Invoice

```http
POST /invoices/:id/send
Authorization: Bearer <token>
```

**Request Body (optional):**

```json
{
  "email": "custom@email.com",
  "message": "Custom email message"
}
```

### Record Payment

```http
POST /invoices/:id/payment
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 500.0,
  "payment_method": "bank_transfer",
  "reference": "TXN-123456",
  "notes": "Partial payment"
}
```

### Get Invoice Stats

```http
GET /invoices/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "total": 150,
  "draft": 10,
  "sent": 45,
  "paid": 80,
  "overdue": 15,
  "total_amount": 250000.0,
  "paid_amount": 180000.0,
  "outstanding_amount": 70000.0
}
```

---

## Customers

### List Customers

```http
GET /customers
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description       |
| --------- | ------ | ------- | ----------------- |
| `page`    | number | 1       | Page number       |
| `limit`   | number | 20      | Items per page    |
| `search`  | string | -       | Search name/email |
| `sort`    | string | name    | Sort field        |

**Response:**

```json
{
  "data": [
    {
      "id": "cust-uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "balance": 1500.00,
      "invoice_count": 5
    }
  ],
  "meta": { ... }
}
```

### Get Customer

```http
GET /customers/:id
Authorization: Bearer <token>
```

### Create Customer

```http
POST /customers
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "tax_id": "TAX-123456"
}
```

### Update Customer

```http
PATCH /customers/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Delete Customer

```http
DELETE /customers/:id
Authorization: Bearer <token>
```

### Get Customer Stats

```http
GET /customers/:id/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "total_invoices": 15,
  "total_revenue": 25000.0,
  "outstanding_balance": 3500.0,
  "last_invoice_date": "2024-11-15"
}
```

---

## Products

### List Products

```http
GET /products
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter   | Type    | Default | Description          |
| ----------- | ------- | ------- | -------------------- |
| `page`      | number  | 1       | Page number          |
| `limit`     | number  | 20      | Items per page       |
| `category`  | string  | -       | Filter by category   |
| `search`    | string  | -       | Search name/SKU      |
| `low_stock` | boolean | -       | Only low stock items |

### Get Product

```http
GET /products/:id
Authorization: Bearer <token>
```

### Create Product

```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Widget Pro",
  "sku": "WGT-001",
  "description": "Premium widget",
  "unit_price": 49.99,
  "category": "Electronics",
  "stock_quantity": 100,
  "low_stock_alert": 10
}
```

### Update Product

```http
PATCH /products/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Delete Product

```http
DELETE /products/:id
Authorization: Bearer <token>
```

### Get Low Stock Products

```http
GET /products/low-stock
Authorization: Bearer <token>
```

### Adjust Stock

```http
POST /products/:id/stock
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "quantity": 50,
  "type": "add",
  "reason": "purchase",
  "notes": "Restocked from supplier"
}
```

---

## Transactions

### List Transactions

```http
GET /transactions
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter     | Type   | Description             |
| ------------- | ------ | ----------------------- |
| `type`        | string | payment, refund, credit |
| `customer_id` | string | Filter by customer      |
| `from_date`   | date   | Start date              |
| `to_date`     | date   | End date                |

### Get Transaction

```http
GET /transactions/:id
Authorization: Bearer <token>
```

### Create Transaction

```http
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "invoice_id": "inv-uuid",
  "customer_id": "cust-uuid",
  "type": "payment",
  "amount": 500.0,
  "payment_method": "credit_card",
  "reference": "TXN-123"
}
```

---

## Reports

### Dashboard Summary

```http
GET /reports/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description            |
| --------- | ------ | ------- | ---------------------- |
| `period`  | string | month   | day, week, month, year |

**Response:**

```json
{
  "revenue": {
    "total": 50000.0,
    "change": 12.5
  },
  "invoices": {
    "total": 45,
    "paid": 30,
    "pending": 15
  },
  "customers": {
    "total": 120,
    "new": 8
  },
  "outstanding": 15000.0,
  "chart_data": [
    { "date": "2024-11-01", "revenue": 5000 },
    { "date": "2024-11-02", "revenue": 3500 }
  ]
}
```

### Sales Report

```http
GET /reports/sales
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter   | Type   | Description           |
| ----------- | ------ | --------------------- |
| `from_date` | date   | Start date (required) |
| `to_date`   | date   | End date (required)   |
| `group_by`  | string | day, week, month      |

### Revenue Report

```http
GET /reports/revenue
Authorization: Bearer <token>
```

### Customer Report

```http
GET /reports/customers
Authorization: Bearer <token>
```

### Export Report

```http
GET /reports/export
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter   | Type   | Description               |
| ----------- | ------ | ------------------------- |
| `type`      | string | sales, revenue, customers |
| `format`    | string | csv, pdf, xlsx            |
| `from_date` | date   | Start date                |
| `to_date`   | date   | End date                  |

---

## Users

### List Users (Admin)

```http
GET /users
Authorization: Bearer <token>
```

### Get User

```http
GET /users/:id
Authorization: Bearer <token>
```

### Invite User (Admin)

```http
POST /users/invite
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "role": "staff",
  "name": "New User"
}
```

### Update User Role (Admin)

```http
PATCH /users/:id/role
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "role": "manager"
}
```

### Deactivate User (Admin)

```http
DELETE /users/:id
Authorization: Bearer <token>
```

---

## Organizations

### Get Organization

```http
GET /organization
Authorization: Bearer <token>
```

### Update Organization (Admin)

```http
PATCH /organization
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Acme Corp",
  "address": "123 Business Ave",
  "phone": "+1234567890",
  "settings": {
    "currency": "USD",
    "tax_rate": 10,
    "invoice_prefix": "INV"
  }
}
```

---

## HTTP Status Codes

| Code  | Description                          |
| ----- | ------------------------------------ |
| `200` | Success                              |
| `201` | Created                              |
| `204` | No Content (successful delete)       |
| `400` | Bad Request (validation error)       |
| `401` | Unauthorized (invalid/missing token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found                            |
| `409` | Conflict (duplicate resource)        |
| `422` | Unprocessable Entity                 |
| `429` | Too Many Requests (rate limited)     |
| `500` | Internal Server Error                |

---

## Rate Limits

| Endpoint       | Limit | Window   |
| -------------- | ----- | -------- |
| All endpoints  | 100   | 1 minute |
| Auth endpoints | 10    | 1 minute |
| Report exports | 10    | 1 hour   |

---

**Document Version:** 1.0  
**Last Updated:** November 2024
