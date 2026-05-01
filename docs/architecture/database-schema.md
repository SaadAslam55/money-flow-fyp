# Database Schema Documentation

## Money Flow - Database Design

---

## 1. Overview

### 1.1 Database Technology

| Aspect        | Details                 |
| ------------- | ----------------------- |
| Database      | TiDB Cloud (Serverless) |
| Compatibility | MySQL 8.0               |
| ORM           | Prisma                  |
| Migrations    | Prisma Migrate          |

### 1.2 Design Principles

- **Multi-tenancy:** Organization-based data isolation
- **Soft Deletes:** Preserve data history with `deleted_at`
- **Audit Trail:** Track all changes with timestamps
- **UUID Primary Keys:** Globally unique identifiers
- **Referential Integrity:** Foreign key constraints

---

## 2. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │  organizations  │                                                        │
│  ├─────────────────┤                                                        │
│  │ id (PK)         │◄─────────────────────────────────────┐                │
│  │ name            │                                       │                │
│  │ slug            │                                       │                │
│  │ settings (JSON) │                                       │                │
│  │ created_at      │                                       │                │
│  │ updated_at      │                                       │                │
│  └────────┬────────┘                                       │                │
│           │                                                │                │
│           │ 1:N                                            │                │
│           │                                                │                │
│  ┌────────▼────────┐                                       │                │
│  │      users      │                                       │                │
│  ├─────────────────┤                                       │                │
│  │ id (PK)         │                                       │                │
│  │ auth_user_id    │──────────► Supabase Auth              │                │
│  │ organization_id │                                       │                │
│  │ email           │                                       │                │
│  │ name            │                                       │                │
│  │ role            │                                       │                │
│  │ is_active       │                                       │                │
│  │ created_at      │                                       │                │
│  └─────────────────┘                                       │                │
│                                                            │                │
│  ┌─────────────────┐      ┌─────────────────┐             │                │
│  │    customers    │      │    products     │             │                │
│  ├─────────────────┤      ├─────────────────┤             │                │
│  │ id (PK)         │      │ id (PK)         │             │                │
│  │ organization_id │──────│ organization_id │─────────────┘                │
│  │ name            │      │ name            │                              │
│  │ email           │      │ sku             │                              │
│  │ phone           │      │ description     │                              │
│  │ address         │      │ unit_price      │                              │
│  │ city            │      │ category        │                              │
│  │ country         │      │ stock_quantity  │                              │
│  │ tax_id          │      │ low_stock_alert │                              │
│  │ balance         │      │ is_active       │                              │
│  │ notes           │      │ created_at      │                              │
│  │ created_at      │      │ updated_at      │                              │
│  └────────┬────────┘      └────────┬────────┘                              │
│           │                        │                                        │
│           │                        │                                        │
│           │      ┌─────────────────┴─────────────────┐                     │
│           │      │                                   │                     │
│           │      ▼                                   ▼                     │
│  ┌────────▼──────────────┐              ┌────────────────────┐            │
│  │       invoices        │              │   inventory_logs   │            │
│  ├───────────────────────┤              ├────────────────────┤            │
│  │ id (PK)               │              │ id (PK)            │            │
│  │ organization_id       │              │ product_id (FK)    │            │
│  │ customer_id (FK)      │              │ change_quantity    │            │
│  │ invoice_number        │              │ reason             │            │
│  │ status                │              │ notes              │            │
│  │ issue_date            │              │ created_by         │            │
│  │ due_date              │              │ created_at         │            │
│  │ subtotal              │              └────────────────────┘            │
│  │ tax_rate              │                                                │
│  │ tax_amount            │                                                │
│  │ discount              │                                                │
│  │ total                 │                                                │
│  │ amount_paid           │                                                │
│  │ notes                 │                                                │
│  │ created_at            │                                                │
│  │ updated_at            │                                                │
│  └───────────┬───────────┘                                                │
│              │                                                             │
│              │ 1:N                                                         │
│              ▼                                                             │
│  ┌───────────────────────┐              ┌────────────────────┐            │
│  │    invoice_items      │              │    transactions    │            │
│  ├───────────────────────┤              ├────────────────────┤            │
│  │ id (PK)               │              │ id (PK)            │            │
│  │ invoice_id (FK)       │              │ organization_id    │            │
│  │ product_id (FK)       │              │ invoice_id (FK)    │            │
│  │ description           │              │ customer_id (FK)   │            │
│  │ quantity              │              │ type               │            │
│  │ unit_price            │              │ amount             │            │
│  │ total                 │              │ payment_method     │            │
│  │ created_at            │              │ reference          │            │
│  └───────────────────────┘              │ notes              │            │
│                                         │ created_at         │            │
│                                         └────────────────────┘            │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Table Definitions

### 3.1 organizations

Primary table for multi-tenant organizations.

```sql
CREATE TABLE organizations (
  id            VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  logo_url      VARCHAR(500),
  address       TEXT,
  phone         VARCHAR(50),
  email         VARCHAR(255),
  website       VARCHAR(255),
  tax_id        VARCHAR(100),
  settings      JSON DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL,

  INDEX idx_slug (slug),
  INDEX idx_deleted (deleted_at)
);
```

**Settings JSON Structure:**

```json
{
  "currency": "USD",
  "timezone": "America/New_York",
  "dateFormat": "MM/DD/YYYY",
  "taxRate": 10,
  "invoicePrefix": "INV",
  "invoiceFooter": "Thank you for your business!",
  "paymentTerms": 30,
  "lowStockThreshold": 10
}
```

### 3.2 users

System users linked to Supabase Auth.

```sql
CREATE TABLE users (
  id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  auth_user_id    VARCHAR(36) UNIQUE NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  avatar_url      VARCHAR(500),
  role            ENUM('staff', 'manager', 'admin', 'super_admin') DEFAULT 'staff',
  is_active       BOOLEAN DEFAULT TRUE,
  last_login_at   TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  INDEX idx_auth_user (auth_user_id),
  INDEX idx_org (organization_id),
  INDEX idx_email (email)
);
```

### 3.3 customers

Business customers for invoicing.

```sql
CREATE TABLE customers (
  id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organization_id VARCHAR(36) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(50),
  address         TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  postal_code     VARCHAR(20),
  country         VARCHAR(100),
  tax_id          VARCHAR(100),
  balance         DECIMAL(15,2) DEFAULT 0.00,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  INDEX idx_org (organization_id),
  INDEX idx_email (email),
  INDEX idx_name (name),
  INDEX idx_deleted (deleted_at)
);
```

### 3.4 products

Product catalog with inventory tracking.

```sql
CREATE TABLE products (
  id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organization_id VARCHAR(36) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  sku             VARCHAR(100),
  description     TEXT,
  unit_price      DECIMAL(15,2) NOT NULL,
  cost_price      DECIMAL(15,2),
  category        VARCHAR(100),
  unit            VARCHAR(50) DEFAULT 'pcs',
  tax_rate        DECIMAL(5,2) DEFAULT 0.00,
  stock_quantity  INT DEFAULT 0,
  low_stock_alert INT DEFAULT 10,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  UNIQUE KEY uk_org_sku (organization_id, sku),
  INDEX idx_org (organization_id),
  INDEX idx_category (category),
  INDEX idx_low_stock (stock_quantity, low_stock_alert),
  INDEX idx_deleted (deleted_at)
);
```

### 3.5 invoices

Invoice header records.

```sql
CREATE TABLE invoices (
  id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organization_id VARCHAR(36) NOT NULL,
  customer_id     VARCHAR(36) NOT NULL,
  invoice_number  VARCHAR(50) NOT NULL,
  status          ENUM('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
  issue_date      DATE NOT NULL,
  due_date        DATE NOT NULL,
  subtotal        DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  tax_rate        DECIMAL(5,2) DEFAULT 0.00,
  tax_amount      DECIMAL(15,2) DEFAULT 0.00,
  discount        DECIMAL(15,2) DEFAULT 0.00,
  total           DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  amount_paid     DECIMAL(15,2) DEFAULT 0.00,
  currency        VARCHAR(3) DEFAULT 'USD',
  notes           TEXT,
  terms           TEXT,
  sent_at         TIMESTAMP NULL,
  viewed_at       TIMESTAMP NULL,
  paid_at         TIMESTAMP NULL,
  created_by      VARCHAR(36),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  UNIQUE KEY uk_org_number (organization_id, invoice_number),
  INDEX idx_org (organization_id),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date),
  INDEX idx_deleted (deleted_at)
);
```

### 3.6 invoice_items

Line items for invoices.

```sql
CREATE TABLE invoice_items (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  invoice_id  VARCHAR(36) NOT NULL,
  product_id  VARCHAR(36),
  description VARCHAR(500) NOT NULL,
  quantity    DECIMAL(15,4) NOT NULL DEFAULT 1,
  unit_price  DECIMAL(15,2) NOT NULL,
  tax_rate    DECIMAL(5,2) DEFAULT 0.00,
  tax_amount  DECIMAL(15,2) DEFAULT 0.00,
  discount    DECIMAL(15,2) DEFAULT 0.00,
  total       DECIMAL(15,2) NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_invoice (invoice_id)
);
```

### 3.7 transactions

Payment and financial transactions.

```sql
CREATE TABLE transactions (
  id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organization_id VARCHAR(36) NOT NULL,
  invoice_id      VARCHAR(36),
  customer_id     VARCHAR(36),
  type            ENUM('payment', 'refund', 'credit', 'debit') NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  payment_method  VARCHAR(50),
  reference       VARCHAR(255),
  notes           TEXT,
  transaction_date DATE NOT NULL,
  created_by      VARCHAR(36),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_org (organization_id),
  INDEX idx_invoice (invoice_id),
  INDEX idx_customer (customer_id),
  INDEX idx_date (transaction_date),
  INDEX idx_type (type)
);
```

### 3.8 inventory_logs

Stock movement history.

```sql
CREATE TABLE inventory_logs (
  id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organization_id VARCHAR(36) NOT NULL,
  product_id      VARCHAR(36) NOT NULL,
  change_quantity INT NOT NULL,
  before_quantity INT NOT NULL,
  after_quantity  INT NOT NULL,
  reason          ENUM('purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer', 'other') NOT NULL,
  reference_type  VARCHAR(50),
  reference_id    VARCHAR(36),
  notes           TEXT,
  created_by      VARCHAR(36),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_org (organization_id),
  INDEX idx_product (product_id),
  INDEX idx_date (created_at)
);
```

---

## 4. Indexes Strategy

### 4.1 Primary Indexes

| Table         | Index         | Columns         | Purpose              |
| ------------- | ------------- | --------------- | -------------------- |
| organizations | PRIMARY       | id              | Unique identifier    |
| organizations | idx_slug      | slug            | URL-friendly lookup  |
| users         | idx_auth_user | auth_user_id    | Supabase auth lookup |
| customers     | idx_org       | organization_id | Tenant isolation     |
| invoices      | idx_status    | status          | Status filtering     |
| invoices      | idx_due_date  | due_date        | Overdue queries      |

### 4.2 Composite Indexes

```sql
-- For invoice listing with status filter
CREATE INDEX idx_invoices_org_status ON invoices(organization_id, status, created_at DESC);

-- For customer search
CREATE INDEX idx_customers_org_name ON customers(organization_id, name);

-- For product low stock alerts
CREATE INDEX idx_products_low_stock ON products(organization_id, stock_quantity, low_stock_alert);

-- For transaction reports
CREATE INDEX idx_transactions_org_date ON transactions(organization_id, transaction_date, type);
```

---

## 5. Data Integrity

### 5.1 Foreign Key Constraints

| Child Table   | Parent Table  | On Delete | On Update |
| ------------- | ------------- | --------- | --------- |
| users         | organizations | RESTRICT  | CASCADE   |
| customers     | organizations | RESTRICT  | CASCADE   |
| products      | organizations | RESTRICT  | CASCADE   |
| invoices      | organizations | RESTRICT  | CASCADE   |
| invoices      | customers     | RESTRICT  | CASCADE   |
| invoice_items | invoices      | CASCADE   | CASCADE   |
| invoice_items | products      | SET NULL  | CASCADE   |
| transactions  | invoices      | SET NULL  | CASCADE   |

### 5.2 Check Constraints

```sql
-- Invoice totals
ALTER TABLE invoices ADD CONSTRAINT chk_invoice_total
  CHECK (total >= 0 AND amount_paid >= 0 AND amount_paid <= total);

-- Product prices
ALTER TABLE products ADD CONSTRAINT chk_product_price
  CHECK (unit_price >= 0 AND (cost_price IS NULL OR cost_price >= 0));

-- Invoice item quantity
ALTER TABLE invoice_items ADD CONSTRAINT chk_item_quantity
  CHECK (quantity > 0 AND unit_price >= 0);
```

---

## 6. Row-Level Security (RLS)

### 6.1 Policy Design

All tables are protected with organization-based RLS:

```sql
-- Example: Customers table policy
CREATE POLICY customers_org_isolation ON customers
  USING (organization_id = current_user_organization_id())
  WITH CHECK (organization_id = current_user_organization_id());
```

### 6.2 Implementation

RLS is enforced at the application layer through:

1. JWT claims containing `organization_id`
2. Prisma middleware adding `WHERE` clauses
3. NestJS guards validating access

---

## 7. Migration History

| Version | Date    | Description             |
| ------- | ------- | ----------------------- |
| 001     | 2024-01 | Initial schema          |
| 002     | 2024-02 | Add inventory tracking  |
| 003     | 2024-03 | Add transaction logging |
| 004     | 2024-06 | Add soft deletes        |
| 005     | 2024-09 | TiDB optimization       |
| 006     | 2024-11 | Add audit fields        |

---

## 8. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Organization {
  id         String   @id @default(uuid())
  name       String
  slug       String   @unique
  settings   Json     @default("{}")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  deletedAt  DateTime? @map("deleted_at")

  users      User[]
  customers  Customer[]
  products   Product[]
  invoices   Invoice[]

  @@map("organizations")
}

model User {
  id             String   @id @default(uuid())
  authUserId     String   @unique @map("auth_user_id")
  organizationId String   @map("organization_id")
  email          String
  name           String
  role           UserRole @default(staff)
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at")

  organization   Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@map("users")
}

enum UserRole {
  staff
  manager
  admin
  super_admin
}

model Customer {
  id             String   @id @default(uuid())
  organizationId String   @map("organization_id")
  name           String
  email          String?
  phone          String?
  balance        Decimal  @default(0) @db.Decimal(15, 2)
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization   Organization @relation(fields: [organizationId], references: [id])
  invoices       Invoice[]

  @@index([organizationId])
  @@map("customers")
}

model Product {
  id             String   @id @default(uuid())
  organizationId String   @map("organization_id")
  name           String
  sku            String?
  unitPrice      Decimal  @map("unit_price") @db.Decimal(15, 2)
  stockQuantity  Int      @default(0) @map("stock_quantity")
  lowStockAlert  Int      @default(10) @map("low_stock_alert")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization   Organization  @relation(fields: [organizationId], references: [id])
  invoiceItems   InvoiceItem[]

  @@unique([organizationId, sku])
  @@index([organizationId])
  @@map("products")
}

model Invoice {
  id             String        @id @default(uuid())
  organizationId String        @map("organization_id")
  customerId     String        @map("customer_id")
  invoiceNumber  String        @map("invoice_number")
  status         InvoiceStatus @default(draft)
  issueDate      DateTime      @map("issue_date")
  dueDate        DateTime      @map("due_date")
  subtotal       Decimal       @db.Decimal(15, 2)
  taxAmount      Decimal       @default(0) @map("tax_amount") @db.Decimal(15, 2)
  total          Decimal       @db.Decimal(15, 2)
  amountPaid     Decimal       @default(0) @map("amount_paid") @db.Decimal(15, 2)
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")

  organization   Organization  @relation(fields: [organizationId], references: [id])
  customer       Customer      @relation(fields: [customerId], references: [id])
  items          InvoiceItem[]

  @@unique([organizationId, invoiceNumber])
  @@index([organizationId])
  @@index([customerId])
  @@index([status])
  @@map("invoices")
}

enum InvoiceStatus {
  draft
  sent
  viewed
  partial
  paid
  overdue
  cancelled
}

model InvoiceItem {
  id          String  @id @default(uuid())
  invoiceId   String  @map("invoice_id")
  productId   String? @map("product_id")
  description String
  quantity    Decimal @db.Decimal(15, 4)
  unitPrice   Decimal @map("unit_price") @db.Decimal(15, 2)
  total       Decimal @db.Decimal(15, 2)

  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  product     Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([invoiceId])
  @@map("invoice_items")
}
```

---

**Document Version:** 1.0  
**Last Updated:** November 2024
