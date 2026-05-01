# Customer Management Module

## 📖 Overview

The Customer Management Module provides comprehensive tools for managing customer relationships, tracking purchase history, and monitoring account balances.

## 🎯 Module Objectives

- Store detailed customer information
- Track customer purchase history
- Monitor outstanding balances
- Manage customer portal access
- Import/export customer data
- Generate customer reports
- Send customer communications

## 👥 User Roles Involved

| Role           | Access Level | Permissions                       |
| -------------- | ------------ | --------------------------------- |
| **Admin**      | Full Access  | All customer operations           |
| **Manager**    | Full Access  | View, create, edit customers      |
| **Accountant** | View/Edit    | View customers, edit contact info |
| **Cashier**    | Create Only  | Create customers during sales     |
| **Customer**   | Own Data     | View and update own profile       |

## 🏗️ Architecture

```
Customer Data Flow:
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Customer  │────▶│   Invoices   │────▶│  Balance   │
│    Form     │     │  (Purchases) │     │   Update   │
└─────────────┘     └──────────────┘     └────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
  Customer DB        Invoice Total        Outstanding
  RLS Policies       Aggregation          Amount
```

## 📁 File Structure

```
src/
├── components/customers/
│   ├── CustomerForm.tsx             ✅ Create/edit customer form
│   ├── CustomerList.tsx             ✅ Customer table/cards
│   ├── CustomerDetail.tsx           ⬜ Detail view with history
│   ├── CustomerStats.tsx            ⬜ Customer statistics
│   ├── CustomerImport.tsx           ⬜ CSV import dialog
│   └── PortalAccessDialog.tsx       ⬜ Enable portal access
│
├── pages/customers/
│   ├── CustomersPage.tsx            ✅ Main customer list
│   ├── CreateCustomerPage.tsx       ⬜ New customer page
│   ├── EditCustomerPage.tsx         ⬜ Edit customer page
│   └── CustomerDetailPage.tsx       ⬜ Customer detail page
│
├── services/api/
│   └── customerApi.ts               ✅ Customer CRUD + import/export
│
├── hooks/
│   └── useCustomers.ts              ✅ Customer state management
│
└── schemas/
    └── customerSchemas.ts           ✅ Zod validation schemas
✅ Implementation Checklist
Phase 1: Core CRUD ✅

 Customer API service
 Customer hooks
 Validation schemas
 Customer form component
 Customer list component
 Search and filters

Phase 2: Advanced Features ⬜

 Customer detail page with purchase history
 Customer statistics dashboard
 CSV import/export
 Customer portal access management
 Customer communications (email/SMS)
 Customer segmentation

Phase 3: Analytics ⬜

 Top customers by revenue
 Customer lifetime value
 Purchase frequency analysis
 Customer retention metrics

🔑 Key Features
1. Customer Balance Tracking
sql-- Automatic balance updates via trigger
CREATE FUNCTION update_customer_balance() RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET outstanding_balance = (
    SELECT COALESCE(SUM(amount_due), 0)
    FROM invoices
    WHERE customer_id = NEW.customer_id
    AND status NOT IN ('paid', 'cancelled')
  )
  WHERE id = NEW.customer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_balance_on_invoice
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_customer_balance();
2. CSV Import/Export
typescript// Import customers from CSV
export async function importCustomersFromCSV(file: File, organizationId: string) {
  const customers = await parseCSV<any>(file);

  const validCustomers = customers
    .filter(c => c.name && c.name.trim())
    .map(c => ({
      organization_id: organizationId,
      name: c.name.trim(),
      email: c.email?.trim() || null,
      phone: c.phone?.trim() || null,
      // ... other fields
    }));

  const { data, error } = await supabase
    .from('customers')
    .insert(validCustomers)
    .select();

  return { data, count: data?.length || 0, error };
}

// Export to CSV
export async function exportCustomersToCSV(organizationId: string) {
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('organization_id', organizationId);

  const csv = convertToCSV(customers);
  return csv;
}
3. Customer Portal Access
typescript// Enable customer login to view invoices
export async function enableCustomerPortal(
  customerId: string,
  password: string
) {
  const hashedPassword = await hashPassword(password);

  await supabase
    .from('customers')
    .update({
      portal_access: true,
      portal_password_hash: hashedPassword
    })
    .eq('id', customerId);

  // Send email with login credentials
  await sendPortalAccessEmail(customer.email, password);
}
📊 Database Schema
sql-- Customers table
customers {
  id: uuid PRIMARY KEY,
  organization_id: uuid REFERENCES organizations,
  name: varchar(255) NOT NULL,
  email: varchar(255),
  phone: varchar(20),
  address: text,
  city: varchar(100),
  country: varchar(100),
  tax_id: varchar(100),
  credit_limit: decimal(15,2) DEFAULT 0,
  outstanding_balance: decimal(15,2) DEFAULT 0,
  portal_access: boolean DEFAULT false,
  portal_password_hash: text,
  notes: text,
  created_at: timestamptz DEFAULT NOW(),
  updated_at: timestamptz DEFAULT NOW()
}

-- Indexes for performance
CREATE INDEX idx_customers_organization ON customers(organization_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_outstanding ON customers(outstanding_balance) WHERE outstanding_balance > 0;
🧪 Testing
typescript// Test customer creation
test('should create customer successfully', async () => {
  const customerData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+92-300-1234567'
  };

  const { data } = await createCustomer(customerData, organizationId);

  expect(data).toBeDefined();
  expect(data.name).toBe('John Doe');
  expect(data.outstanding_balance).toBe(0);
});

// Test balance calculations
test('should update customer balance when invoice changes', async () => {
  const customer = await createTestCustomer();
  const invoice = await createTestInvoice({
    customer_id: customer.id,
    total_amount: 1000,
    amount_due: 1000
  });

  const updated = await getCustomer(customer.id);
  expect(updated.outstanding_balance).toBe(1000);
});
```
