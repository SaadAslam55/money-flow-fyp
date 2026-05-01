# Money Flow - Data Input Guide

## 📋 Overview

This guide provides step-by-step instructions for entering real data into your Money Flow system. Follow this flow to set up your business completely.

---

## 🔐 Your Account Details

| Field | Value |
|-------|-------|
| **Email** | kaash0542@gmail.com |
| **Name** | Malik Kashif |
| **Role** | Super Admin |
| **Organization** | Default Organization |
| **Organization ID** | 22d7790b-380a-4732-a4f2-4a06979ae4aa |

---

## 📊 Data Entry Flow (Recommended Order)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA INPUT WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Organization Setup                                     │
│     └── Update business name, logo, address, tax info          │
│                    ↓                                            │
│  Step 2: Bank Accounts                                          │
│     └── Add your business bank accounts                         │
│                    ↓                                            │
│  Step 3: Expense Categories                                     │
│     └── Create categories for tracking expenses                 │
│                    ↓                                            │
│  Step 4: Products/Services                                      │
│     └── Add your products or services with prices               │
│                    ↓                                            │
│  Step 5: Customers                                              │
│     └── Add your customer database                              │
│                    ↓                                            │
│  Step 6: Invoices                                               │
│     └── Create invoices for customers                           │
│                    ↓                                            │
│  Step 7: Transactions                                           │
│     └── Record income and expenses                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Organization Setup

### Navigate to: Settings → Business Profile

Update your organization with real business information:

```json
{
  "name": "Your Business Name",
  "email": "business@example.com",
  "phone": "+92 300 1234567",
  "address": "123 Main Street, Block A",
  "city": "Lahore",
  "country": "Pakistan",
  "tax_id": "NTN-1234567-8",
  "currency": "PKR",
  "timezone": "Asia/Karachi",
  "fiscal_year_start": "07-01"
}
```

### Sample Data for Pakistan Business:

| Field | Example Value |
|-------|---------------|
| Business Name | Kashif Electronics |
| Email | info@kashifelectronics.pk |
| Phone | +92 321 4567890 |
| Address | Shop #15, Hall Road |
| City | Lahore |
| Country | Pakistan |
| Tax ID (NTN) | 1234567-8 |
| Currency | PKR |

---

## Step 2: Bank Accounts

### Navigate to: Settings → Bank Accounts → Add Account

Add your business bank accounts:

### Sample Bank Accounts:

```sql
-- Example bank accounts to add via UI or SQL
INSERT INTO bank_accounts (organization_id, account_name, bank_name, account_number, account_type, opening_balance, current_balance, currency) VALUES
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Main Business Account', 'HBL', 'PK36HABB0012345678901234', 'checking', 500000, 500000, 'PKR'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Savings Account', 'MCB', 'PK50MUCB1234567890123456', 'savings', 1000000, 1000000, 'PKR'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Cash Register', 'Cash', 'CASH-001', 'cash', 50000, 50000, 'PKR'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'JazzCash Business', 'JazzCash', '03001234567', 'checking', 25000, 25000, 'PKR'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'EasyPaisa Business', 'EasyPaisa', '03451234567', 'checking', 15000, 15000, 'PKR');
```

| Account Name | Bank | Account Number | Type | Opening Balance |
|--------------|------|----------------|------|-----------------|
| Main Business Account | HBL | PK36HABB0012345678901234 | Checking | Rs. 500,000 |
| Savings Account | MCB | PK50MUCB1234567890123456 | Savings | Rs. 1,000,000 |
| Cash Register | Cash | CASH-001 | Cash | Rs. 50,000 |
| JazzCash Business | JazzCash | 03001234567 | Checking | Rs. 25,000 |
| EasyPaisa Business | EasyPaisa | 03451234567 | Checking | Rs. 15,000 |

---

## Step 3: Expense Categories

### Navigate to: Settings → Categories → Add Category

Create categories to organize your expenses:

```sql
-- Example expense categories
INSERT INTO expense_categories (organization_id, name, description, color, icon) VALUES
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Rent', 'Shop/Office rent payments', '#ef4444', 'home'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Utilities', 'Electricity, Gas, Water bills', '#f97316', 'zap'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Salaries', 'Employee salaries and wages', '#eab308', 'users'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Inventory Purchase', 'Stock and inventory purchases', '#22c55e', 'package'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Transportation', 'Delivery and travel expenses', '#3b82f6', 'truck'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Marketing', 'Advertising and promotions', '#8b5cf6', 'megaphone'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Office Supplies', 'Stationery and office items', '#ec4899', 'briefcase'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Maintenance', 'Repairs and maintenance', '#6b7280', 'wrench'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Internet & Phone', 'Communication expenses', '#14b8a6', 'wifi'),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Taxes', 'Government taxes and duties', '#dc2626', 'file-text');
```

| Category | Description | Color |
|----------|-------------|-------|
| Rent | Shop/Office rent | Red |
| Utilities | Electricity, Gas, Water | Orange |
| Salaries | Employee wages | Yellow |
| Inventory Purchase | Stock purchases | Green |
| Transportation | Delivery costs | Blue |
| Marketing | Advertising | Purple |
| Office Supplies | Stationery | Pink |
| Maintenance | Repairs | Gray |
| Internet & Phone | Communication | Teal |
| Taxes | Government taxes | Dark Red |

---

## Step 4: Products/Services

### Navigate to: Products → Add Product

Add your products or services:

### Sample Products (Electronics Store):

```sql
-- Example products
INSERT INTO products (organization_id, name, description, sku, category, unit_price, cost_price, tax_rate, current_stock, minimum_stock, track_inventory) VALUES
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Samsung Galaxy A54', '5G Smartphone 128GB', 'SAM-A54-128', 'Smartphones', 89999, 75000, 17, 25, 5, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'iPhone 15 Pro', 'Apple iPhone 15 Pro 256GB', 'APL-IP15P-256', 'Smartphones', 449999, 380000, 17, 10, 2, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Samsung 55" Smart TV', '4K UHD Smart LED TV', 'SAM-TV55-4K', 'TVs', 159999, 130000, 17, 8, 2, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'HP Laptop 15', 'Intel i5, 8GB RAM, 512GB SSD', 'HP-LAP15-I5', 'Laptops', 125000, 100000, 17, 15, 3, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Sony Headphones WH-1000XM5', 'Wireless Noise Cancelling', 'SNY-WH1000XM5', 'Audio', 79999, 65000, 17, 20, 5, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Anker Power Bank 20000mAh', 'Fast Charging Power Bank', 'ANK-PB20K', 'Accessories', 7999, 5500, 17, 50, 10, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'USB-C Cable 1m', 'Fast Charging Cable', 'ACC-USBC-1M', 'Accessories', 599, 300, 17, 100, 20, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Screen Protector', 'Tempered Glass Universal', 'ACC-SCRN-UNI', 'Accessories', 299, 100, 17, 200, 50, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Phone Repair Service', 'Screen replacement service', 'SVC-REPAIR', 'Services', 3500, 1500, 17, 0, 0, false),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Data Recovery Service', 'Phone/Laptop data recovery', 'SVC-DATA', 'Services', 5000, 500, 17, 0, 0, false);
```

| Product | SKU | Price (PKR) | Cost | Stock |
|---------|-----|-------------|------|-------|
| Samsung Galaxy A54 | SAM-A54-128 | 89,999 | 75,000 | 25 |
| iPhone 15 Pro | APL-IP15P-256 | 449,999 | 380,000 | 10 |
| Samsung 55" Smart TV | SAM-TV55-4K | 159,999 | 130,000 | 8 |
| HP Laptop 15 | HP-LAP15-I5 | 125,000 | 100,000 | 15 |
| Sony Headphones | SNY-WH1000XM5 | 79,999 | 65,000 | 20 |
| Anker Power Bank | ANK-PB20K | 7,999 | 5,500 | 50 |
| USB-C Cable | ACC-USBC-1M | 599 | 300 | 100 |
| Screen Protector | ACC-SCRN-UNI | 299 | 100 | 200 |
| Phone Repair (Service) | SVC-REPAIR | 3,500 | 1,500 | - |
| Data Recovery (Service) | SVC-DATA | 5,000 | 500 | - |

---

## Step 5: Customers

### Navigate to: Customers → Add Customer

Add your customer database:

```sql
-- Example customers
INSERT INTO customers (organization_id, name, email, phone, address, city, country, credit_limit, is_active) VALUES
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Ahmed Ali', 'ahmed.ali@email.com', '+92 321 1111111', 'House 45, DHA Phase 5', 'Lahore', 'Pakistan', 100000, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Sara Khan', 'sara.khan@email.com', '+92 333 2222222', 'Flat 12, Gulberg III', 'Lahore', 'Pakistan', 50000, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Muhammad Usman', 'usman@company.pk', '+92 300 3333333', 'Office 5, Mall Road', 'Lahore', 'Pakistan', 200000, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Fatima Zahra', 'fatima.z@gmail.com', '+92 345 4444444', 'Street 7, Model Town', 'Lahore', 'Pakistan', 75000, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Ali Hassan', 'ali.hassan@business.com', '+92 312 5555555', 'Plaza 23, Johar Town', 'Lahore', 'Pakistan', 150000, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Ayesha Malik', 'ayesha.m@outlook.com', '+92 301 6666666', 'Block C, Bahria Town', 'Lahore', 'Pakistan', 80000, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Bilal Ahmed', 'bilal@techcorp.pk', '+92 322 7777777', 'IT Tower, Gulberg', 'Lahore', 'Pakistan', 300000, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Zainab Iqbal', 'zainab.i@email.com', '+92 334 8888888', 'House 78, Garden Town', 'Lahore', 'Pakistan', 60000, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Hamza Sheikh', 'hamza.s@gmail.com', '+92 303 9999999', 'Street 15, Cavalry Ground', 'Lahore', 'Pakistan', 120000, true),
('22d7790b-380a-4732-a4f2-4a06979ae4aa', 'Maryam Nawaz', 'maryam.n@company.com', '+92 311 0000000', 'Office 8, Faisal Town', 'Lahore', 'Pakistan', 90000, true);
```

| Customer | Email | Phone | City | Credit Limit |
|----------|-------|-------|------|--------------|
| Ahmed Ali | ahmed.ali@email.com | +92 321 1111111 | Lahore | Rs. 100,000 |
| Sara Khan | sara.khan@email.com | +92 333 2222222 | Lahore | Rs. 50,000 |
| Muhammad Usman | usman@company.pk | +92 300 3333333 | Lahore | Rs. 200,000 |
| Fatima Zahra | fatima.z@gmail.com | +92 345 4444444 | Lahore | Rs. 75,000 |
| Ali Hassan | ali.hassan@business.com | +92 312 5555555 | Lahore | Rs. 150,000 |
| Ayesha Malik | ayesha.m@outlook.com | +92 301 6666666 | Lahore | Rs. 80,000 |
| Bilal Ahmed | bilal@techcorp.pk | +92 322 7777777 | Lahore | Rs. 300,000 |
| Zainab Iqbal | zainab.i@email.com | +92 334 8888888 | Lahore | Rs. 60,000 |
| Hamza Sheikh | hamza.s@gmail.com | +92 303 9999999 | Lahore | Rs. 120,000 |
| Maryam Nawaz | maryam.n@company.com | +92 311 0000000 | Lahore | Rs. 90,000 |

---

## Step 6: Create Invoices

### Navigate to: Invoices → Create Invoice

### Sample Invoice Flow:

1. **Select Customer**: Ahmed Ali
2. **Add Items**:
   - Samsung Galaxy A54 × 1 = Rs. 89,999
   - USB-C Cable × 2 = Rs. 1,198
   - Screen Protector × 1 = Rs. 299
3. **Subtotal**: Rs. 91,496
4. **Tax (17%)**: Rs. 15,554
5. **Total**: Rs. 107,050
6. **Status**: Sent

---

## Step 7: Record Transactions

### Navigate to: Transactions → Add Transaction

### Sample Income Transactions:

| Date | Type | Description | Amount | Category |
|------|------|-------------|--------|----------|
| 2024-12-01 | Income | Invoice #INV-000001 Payment | 107,050 | Sales |
| 2024-12-02 | Income | Cash Sale - Accessories | 5,500 | Sales |
| 2024-12-03 | Income | Phone Repair Service | 3,500 | Services |

### Sample Expense Transactions:

| Date | Type | Description | Amount | Category |
|------|------|-------------|--------|----------|
| 2024-12-01 | Expense | Shop Rent - December | 50,000 | Rent |
| 2024-12-01 | Expense | Electricity Bill | 15,000 | Utilities |
| 2024-12-02 | Expense | Employee Salary - Ali | 35,000 | Salaries |
| 2024-12-03 | Expense | Stock Purchase - Samsung | 225,000 | Inventory Purchase |
| 2024-12-03 | Expense | Delivery Charges | 2,500 | Transportation |

---

## 🚀 Quick Start SQL Script

Run this in Supabase SQL Editor to populate sample data instantly:

```sql
-- =============================================
-- MONEY FLOW - SAMPLE DATA SCRIPT
-- Run this after schema is set up
-- =============================================

-- Get the organization ID
DO $$
DECLARE
  v_org_id UUID := '22d7790b-380a-4732-a4f2-4a06979ae4aa';
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM users WHERE organization_id = v_org_id LIMIT 1;

  -- Update organization details
  UPDATE organizations SET
    name = 'Kashif Electronics',
    phone = '+92 321 4567890',
    address = 'Shop #15, Hall Road',
    city = 'Lahore',
    country = 'Pakistan',
    tax_id = '1234567-8'
  WHERE id = v_org_id;

  -- Insert Bank Accounts
  INSERT INTO bank_accounts (organization_id, account_name, bank_name, account_number, account_type, opening_balance, current_balance) VALUES
  (v_org_id, 'Main Business Account', 'HBL', 'PK36HABB0012345678901234', 'checking', 500000, 500000),
  (v_org_id, 'Cash Register', 'Cash', 'CASH-001', 'cash', 50000, 50000),
  (v_org_id, 'JazzCash', 'JazzCash', '03001234567', 'checking', 25000, 25000);

  -- Insert Expense Categories
  INSERT INTO expense_categories (organization_id, name, description, color) VALUES
  (v_org_id, 'Rent', 'Shop rent', '#ef4444'),
  (v_org_id, 'Utilities', 'Bills', '#f97316'),
  (v_org_id, 'Salaries', 'Wages', '#eab308'),
  (v_org_id, 'Inventory', 'Stock', '#22c55e'),
  (v_org_id, 'Transportation', 'Delivery', '#3b82f6');

  -- Insert Products
  INSERT INTO products (organization_id, name, sku, unit_price, cost_price, tax_rate, current_stock, minimum_stock) VALUES
  (v_org_id, 'Samsung Galaxy A54', 'SAM-A54', 89999, 75000, 17, 25, 5),
  (v_org_id, 'iPhone 15 Pro', 'APL-IP15P', 449999, 380000, 17, 10, 2),
  (v_org_id, 'HP Laptop 15', 'HP-LAP15', 125000, 100000, 17, 15, 3),
  (v_org_id, 'Power Bank 20000mAh', 'ANK-PB20K', 7999, 5500, 17, 50, 10),
  (v_org_id, 'USB-C Cable', 'ACC-USBC', 599, 300, 17, 100, 20);

  -- Insert Customers
  INSERT INTO customers (organization_id, name, email, phone, city, credit_limit) VALUES
  (v_org_id, 'Ahmed Ali', 'ahmed@email.com', '+92 321 1111111', 'Lahore', 100000),
  (v_org_id, 'Sara Khan', 'sara@email.com', '+92 333 2222222', 'Lahore', 50000),
  (v_org_id, 'Muhammad Usman', 'usman@email.com', '+92 300 3333333', 'Lahore', 200000),
  (v_org_id, 'Fatima Zahra', 'fatima@email.com', '+92 345 4444444', 'Lahore', 75000),
  (v_org_id, 'Ali Hassan', 'ali@email.com', '+92 312 5555555', 'Lahore', 150000);

  RAISE NOTICE '✅ Sample data inserted successfully!';
END $$;
```

---

## 📱 Using the App

### Dashboard
- View total revenue, expenses, profit
- See recent transactions
- Monitor low stock alerts

### Invoices
- Create new invoices
- Send to customers via email
- Track payment status
- Generate PDF

### Products
- Manage inventory
- Track stock levels
- Set reorder points

### Transactions
- Record income/expenses
- Categorize spending
- Attach receipts

### Reports
- Profit & Loss statement
- Cash flow report
- Sales by product
- Customer analysis

---

## 🔧 Troubleshooting

### Common Issues:

1. **"Failed to load dashboard data"**
   - Refresh the page
   - Clear browser cache
   - Check if logged in

2. **"Permission denied"**
   - Verify your role is super_admin
   - Check RLS policies

3. **Invoice not generating**
   - Ensure customer is selected
   - Add at least one item

---

## 📞 Support

- **Email**: support@moneyflow.pk
- **Documentation**: /docs
- **GitHub Issues**: Report bugs

---

*Last Updated: December 3, 2024*
