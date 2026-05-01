Invoice Management Module
📖 Overview
The Invoice Management Module handles the complete lifecycle of invoices from creation to payment, including PDF generation, email delivery, and payment tracking.
🎯 Module Objectives

Create professional invoices with line items
Dynamic price calculations (subtotal, tax, discounts)
Generate PDF invoices
Send invoices via email
Record payments and track outstanding balances
Support multiple payment methods
Duplicate and modify existing invoices
Track invoice status changes

👥 User Roles Involved
RoleAccess LevelPermissionsAdminFull AccessAll invoice operationsManagerFull AccessAll invoice operationsAccountantCreate/EditCreate, edit, send, record paymentsCashierLimitedCreate draft invoices, record paymentsCustomerView OnlyView own invoices via portal
🏗️ Architecture
Invoice Creation Flow:
┌─────────────┐ ┌──────────────┐ ┌────────────┐
│ Invoice Form│────▶│ Calculations │────▶│ Database │
│ (Client) │ │ (Client) │ │ (Supabase) │
└─────────────┘ └──────────────┘ └────────────┘
│ │ │
▼ ▼ ▼
Line Items Totals/Tax Invoice Record
Validation Discount + Line Items
Amount Due + Customer Update
📁 File Structure
src/
├── components/invoices/
│ ├── InvoiceForm.tsx ✅ Dynamic invoice form
│ ├── InvoiceList.tsx ✅ Filterable invoice table
│ ├── InvoicePreview.tsx ⬜ PDF preview component
│ ├── InvoiceDetail.tsx ⬜ Detail view component
│ ├── PaymentDialog.tsx ✅ Payment recording modal
│ ├── SendInvoiceDialog.tsx ✅ Email sending modal
│ └── InvoiceStatusBadge.tsx ⬜ Status display component
│
├── pages/invoices/
│ ├── InvoicesPage.tsx ✅ Main invoice list page
│ ├── CreateInvoicePage.tsx ✅ New invoice page
│ ├── EditInvoicePage.tsx ⬜ Edit invoice page
│ └── InvoiceDetailPage.tsx ✅ Invoice detail page
│
├── services/api/
│ └── invoiceApi.ts ✅ Invoice CRUD operations
│
├── hooks/
│ └── useInvoices.ts ✅ Invoice state management
│
├── schemas/
│ └── invoiceSchemas.ts ✅ Zod validation schemas
│
└── types/
└── invoice.types.ts ✅ TypeScript types
✅ Implementation Checklist
Phase 1: Core Setup ✅

Invoice types and interfaces
Validation schemas (Zod)
API service functions
React Query hooks
Calculation utilities

Phase 2: Invoice Form ✅

Dynamic line items with useFieldArray
Real-time price calculations
Customer selection
Product selection with auto-fill
Tax rate configuration
Discount options
Notes and terms fields
Mobile-responsive design

Phase 3: Invoice List ✅

Filterable table view
Status badges
Search functionality
Pagination
Bulk actions
Mobile card view

Phase 4: Payment Tracking ✅

Payment recording dialog
Multiple payment methods
Partial payments support
Payment history
Automatic status updates
Customer balance updates

Phase 5: Email & PDF ⬜

PDF generation (server-side)
Email templates
Send invoice via email
Attach PDF to emails
Track email delivery
Resend functionality

Phase 6: Advanced Features ⬜

Recurring invoices
Invoice templates
Multi-currency support
Credit notes/refunds
Invoice reminders
Online payment links

🔑 Key Features

1. Dynamic Invoice Form
   typescript// Line items with automatic totals
   const { fields, append, remove } = useFieldArray({
   control,
   name: 'items'
   });

// Real-time calculations
const totals = calculateInvoiceTotals(items, discountType, discountValue); 2. Invoice Number Generation
sql-- Database function for sequential numbers
CREATE FUNCTION generate_invoice_number(org_id UUID) RETURNS TEXT AS $$
DECLARE
current_year INTEGER;
last_sequence INTEGER;
new_sequence INTEGER;
BEGIN
current_year := EXTRACT(YEAR FROM CURRENT_DATE);

SELECT MAX(CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER))
INTO last_sequence
FROM invoices
WHERE organization_id = org_id
AND invoice_number LIKE 'INV-' || current_year || '-%';

new_sequence := COALESCE(last_sequence, 0) + 1;

RETURN 'INV-' || current_year || '-' || LPAD(new_sequence::TEXT, 4, '0');
END;

$$
LANGUAGE plpgsql;
3. Status Management
typescript// Automatic status transitions
export enum InvoiceStatus {
  DRAFT = 'draft',           // Not sent
  SENT = 'sent',             // Sent but unpaid
  PAID = 'paid',             // Fully paid
  PARTIALLY_PAID = 'partially_paid',  // Partial payment
  OVERDUE = 'overdue',       // Past due date
  CANCELLED = 'cancelled'    // Cancelled
}

// Trigger updates status based on payments
CREATE TRIGGER invoice_status_update
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_invoice_status();
4. Payment Recording
typescript// Record payment and update balances
export async function recordPayment(payment: PaymentRecord) {
  // 1. Update invoice amounts
  // 2. Change invoice status
  // 3. Create transaction record
  // 4. Update customer balance
}
📊 Database Schema
sql-- Invoices table
invoices {
  id: uuid PRIMARY KEY,
  organization_id: uuid REFERENCES organizations,
  customer_id: uuid REFERENCES customers,
  invoice_number: string UNIQUE,
  invoice_date: date,
  due_date: date,
  status: enum('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'),
  subtotal: decimal(15,2),
  tax_amount: decimal(15,2),
  discount_amount: decimal(15,2),
  total_amount: decimal(15,2),
  amount_paid: decimal(15,2),
  amount_due: decimal(15,2),
  notes: text,
  terms: text,
  created_by: uuid REFERENCES users
}

-- Invoice items table
invoice_items {
  id: uuid PRIMARY KEY,
  invoice_id: uuid REFERENCES invoices,
  product_id: uuid REFERENCES products,
  description: text,
  quantity: decimal(10,2),
  unit_price: decimal(15,2),
  tax_rate: decimal(5,2),
  line_total: decimal(15,2)
}
🔄 State Management
typescript// React Query hooks
export function useInvoices(filters?: InvoiceFilters) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => getInvoices(organizationId, filters),
    staleTime: 30000
  });
}

// Mutations
const createMutation = useMutation({
  mutationFn: createInvoice,
  onSuccess: () => {
    queryClient.invalidateQueries(['invoices']);
    queryClient.invalidateQueries(['dashboard-stats']);
    queryClient.invalidateQueries(['customers']);
  }
});
🧪 Testing
typescript// Test invoice calculations
test('should calculate invoice totals correctly', () => {
  const items = [
    { quantity: 2, unit_price: 100, tax_rate: 17 },
    { quantity: 1, unit_price: 50, tax_rate: 17 }
  ];

  const totals = calculateInvoiceTotals(items);

  expect(totals.subtotal).toBe(250);
  expect(totals.tax_amount).toBe(42.5);
  expect(totals.total_amount).toBe(292.5);
});

// Test payment recording
test('should update invoice status after payment', async () => {
  const invoice = createTestInvoice({ total_amount: 1000, amount_paid: 0 });

  await recordPayment({
    invoice_id: invoice.id,
    amount: 1000,
    payment_date: '2024-01-15',
    payment_method: 'bank_transfer'
  });

  const updated = await getInvoice(invoice.id);
  expect(updated.status).toBe('paid');
  expect(updated.amount_due).toBe(0);
});
🐛 Common Issues & Solutions
Issue: Invoice numbers skip or duplicate
Solution: Use database-level sequence generation:
sql-- Ensure transaction isolation
BEGIN;
  SELECT generate_invoice_number(org_id) FOR UPDATE;
  INSERT INTO invoices (invoice_number, ...) VALUES (...);
COMMIT;
Issue: Calculation rounding errors
Solution: Use proper decimal types and rounding:
typescriptexport function roundTo(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
Issue: Stock not updating on invoice creation
Solution: Use database triggers or manual updates:
typescript// After creating invoice
for (const item of invoice.items) {
  if (item.product_id && product.track_inventory) {
    await decrementStock(item.product_id, item.quantity);
  }
}
```

## 📚 Related Documentation

- [Calculation Logic](../guides/invoice-calculations.md)
- [Email Templates](../guides/email-templates.md)
- [PDF Generation](../guides/pdf-generation.md)
$$
