# 📚 MoneyFlow Finance & Business Glossary

> A comprehensive guide to all finance, business, and project-related terms, concepts, and frequently asked questions.

---

## 📑 Table of Contents

1. [Invoice & Billing Terms](#1-invoice--billing-terms)
2. [Financial Reports & Statements](#2-financial-reports--statements)
3. [Accounting Terms](#3-accounting-terms)
4. [Payment & Transaction Terms](#4-payment--transaction-terms)
5. [Customer & Sales Terms](#5-customer--sales-terms)
6. [Inventory & Product Terms](#6-inventory--product-terms)
7. [Subscription & SaaS Terms](#7-subscription--saas-terms)
8. [Banking & Account Terms](#8-banking--account-terms)
9. [Tax & Compliance Terms](#9-tax--compliance-terms)
10. [User Roles & Permissions](#10-user-roles--permissions)
11. [Technical & System Terms](#11-technical--system-terms)
12. [Pakistani Payment Systems](#12-pakistani-payment-systems)
13. [Frequently Asked Questions (FAQ)](#13-frequently-asked-questions-faq)

---

## 1. Invoice & Billing Terms

### Invoice
**Definition:** A commercial document issued by a seller to a buyer, indicating the products, quantities, and agreed prices for products or services.

**In MoneyFlow:** Invoices are core documents that track what customers owe your business. They include line items, taxes, discounts, and payment terms.

**Q: What's the difference between an invoice and a bill?**
> **A:** They're the same document viewed from different perspectives. The seller sends an **invoice**; the buyer receives a **bill**.

---

### Invoice Number
**Definition:** A unique identifier assigned to each invoice for tracking and reference purposes.

**Format in MoneyFlow:** Customizable (e.g., `INV-2024-0001`, `MF/2024/001`)

**Q: Why is invoice numbering important?**
> **A:** Sequential invoice numbers help with:
> - Legal compliance and audit trails
> - Easy reference in communications
> - Financial record organization
> - Tax reporting requirements

---

### Invoice Status

| Status | Description | Action Required |
|--------|-------------|-----------------|
| **Draft** | Invoice is being prepared, not yet sent | Complete and send |
| **Sent** | Invoice delivered to customer | Await payment |
| **Paid** | Full payment received | None - Complete |
| **Partially Paid** | Some payment received | Collect remaining balance |
| **Overdue** | Past due date, unpaid | Follow up with customer |
| **Cancelled** | Invoice voided/cancelled | None - Closed |

---

### Subtotal
**Definition:** The total amount before taxes, discounts, or additional charges are applied.

**Formula:** `Subtotal = Σ(Quantity × Unit Price)` for all line items

---

### Line Item
**Definition:** An individual entry on an invoice representing a specific product or service sold.

**Components:**
- Description
- Quantity
- Unit Price
- Tax Rate
- Line Total

---

### Due Date
**Definition:** The date by which payment must be received to avoid being considered overdue.

**Q: How are due dates calculated?**
> **A:** Due Date = Invoice Date + Payment Terms (e.g., Net 30 = 30 days from invoice date)

---

### Payment Terms
**Definition:** The conditions under which a seller will complete a sale, specifically when payment is due.

| Term | Meaning |
|------|---------|
| **Due on Receipt** | Payment due immediately |
| **Net 7** | Payment due within 7 days |
| **Net 15** | Payment due within 15 days |
| **Net 30** | Payment due within 30 days |
| **Net 60** | Payment due within 60 days |
| **2/10 Net 30** | 2% discount if paid within 10 days, otherwise due in 30 |

---

### Discount Types

#### Percentage Discount
Reduces the total by a percentage (e.g., 10% off)

**Formula:** `Discount Amount = Subtotal × (Discount Percentage / 100)`

#### Fixed Discount
Reduces the total by a fixed amount (e.g., Rs. 500 off)

**Formula:** `Discount Amount = Fixed Value`

---

### Late Fee
**Definition:** A charge applied when payment is not received by the due date.

**Q: How is late fee calculated in MoneyFlow?**
> **A:** `Late Fee = Total Amount × (Late Fee Percentage / 100)`
> 
> Example: 2% late fee on Rs. 10,000 = Rs. 200

---

### Recurring Invoice
**Definition:** An invoice automatically generated at regular intervals for subscription-based or retainer services.

**Use Cases:**
- Monthly retainers
- Subscription services
- Rental agreements
- Maintenance contracts

---

## 2. Financial Reports & Statements

### Profit & Loss Statement (P&L)
**Also Known As:** Income Statement

**Definition:** A financial report showing revenues, costs, and expenses during a specific period.

**Components:**
```
Revenue (Sales)
- Cost of Goods Sold (COGS)
= Gross Profit
- Operating Expenses
= Operating Income
- Other Expenses/Income
= Net Profit (or Loss)
```

**Q: What does a P&L tell me about my business?**
> **A:** It shows whether your business is profitable, where your money comes from (revenue), and where it goes (expenses).

---

### Balance Sheet
**Definition:** A financial statement reporting a company's assets, liabilities, and equity at a specific point in time.

**The Accounting Equation:**
```
Assets = Liabilities + Owner's Equity
```

**Components:**

| Assets | Liabilities | Equity |
|--------|-------------|--------|
| Cash | Accounts Payable | Owner's Capital |
| Accounts Receivable | Loans | Retained Earnings |
| Inventory | Accrued Expenses | |
| Equipment | | |

---

### Cash Flow Statement
**Definition:** A financial report showing how changes in balance sheet accounts and income affect cash.

**Three Sections:**
1. **Operating Activities** - Cash from day-to-day operations
2. **Investing Activities** - Cash from buying/selling assets
3. **Financing Activities** - Cash from loans, investments

**Q: Why is cash flow different from profit?**
> **A:** Profit is based on accrual accounting (when earned/owed), while cash flow shows actual money movement. You can be profitable but cash-poor if customers haven't paid yet.

---

### Gross Profit
**Definition:** Revenue minus the direct costs of producing goods/services sold.

**Formula:** `Gross Profit = Revenue - Cost of Goods Sold (COGS)`

---

### Gross Profit Margin
**Definition:** Gross profit expressed as a percentage of revenue.

**Formula:** `Gross Profit Margin = (Gross Profit / Revenue) × 100`

**Example:**
- Revenue: Rs. 100,000
- COGS: Rs. 60,000
- Gross Profit: Rs. 40,000
- Gross Profit Margin: 40%

---

### Net Profit
**Definition:** The actual profit after all expenses, taxes, and costs are deducted from revenue.

**Also Known As:** Bottom Line, Net Income

**Formula:** `Net Profit = Revenue - All Expenses - Taxes`

---

### Net Profit Margin
**Definition:** Net profit as a percentage of revenue.

**Formula:** `Net Profit Margin = (Net Profit / Revenue) × 100`

---

### EBITDA
**Definition:** Earnings Before Interest, Taxes, Depreciation, and Amortization.

**Use:** Measures operational profitability without accounting for capital structure and non-cash expenses.

---

## 3. Accounting Terms

### Revenue
**Definition:** The total income generated from normal business operations.

**Also Known As:** Sales, Turnover, Top Line

**Types in MoneyFlow:**
- Sales Revenue (products sold)
- Service Revenue (services rendered)
- Other Income (miscellaneous)

---

### Expense
**Definition:** The cost incurred in generating revenue.

**Categories in MoneyFlow:**
| Category | Examples |
|----------|----------|
| Office Supplies | Stationery, paper, pens |
| Utilities | Electricity, water, internet |
| Rent | Office/shop rent |
| Salaries | Employee wages |
| Marketing | Advertising, promotions |
| Travel | Business travel, fuel |
| Equipment | Computers, machinery |
| Maintenance | Repairs, upkeep |
| Insurance | Business insurance |
| Professional Services | Legal, accounting fees |

---

### Accounts Receivable (AR)
**Definition:** Money owed to your business by customers for goods/services delivered but not yet paid for.

**Q: What is AR aging?**
> **A:** AR aging categorizes receivables by how long they've been outstanding:
> - 0-30 days (Current)
> - 31-60 days
> - 61-90 days
> - 90+ days (At risk)

---

### Accounts Payable (AP)
**Definition:** Money your business owes to suppliers/vendors for goods/services received but not yet paid for.

---

### Accrual Accounting
**Definition:** Recording revenues when earned and expenses when incurred, regardless of when cash changes hands.

**Example:** You invoice a customer in December, they pay in January. Revenue is recorded in December.

---

### Cash Accounting
**Definition:** Recording transactions only when cash is received or paid.

**Example:** Same scenario - revenue recorded in January when payment is received.

---

### Cost of Goods Sold (COGS)
**Definition:** The direct costs attributable to the production of goods sold.

**Includes:**
- Raw materials
- Direct labor
- Manufacturing overhead

**Does NOT Include:**
- Administrative expenses
- Marketing costs
- Office rent

---

### Depreciation
**Definition:** The gradual decrease in value of an asset over time due to wear and tear.

**Q: Why track depreciation?**
> **A:** It spreads the cost of assets over their useful life, providing tax benefits and accurate financial reporting.

---

### Fiscal Year
**Definition:** A 12-month period used for accounting and financial reporting purposes.

**In MoneyFlow:** Configurable per organization (e.g., January-December, July-June)

---

### Outstanding Balance
**Definition:** The total amount still owed on an account or invoice.

**Formula:** `Outstanding Balance = Total Amount - Amount Paid`

---

## 4. Payment & Transaction Terms

### Transaction Types

| Type | Description | Effect on Balance |
|------|-------------|-------------------|
| **Income** | Money received | Increases balance |
| **Expense** | Money paid out | Decreases balance |
| **Transfer** | Money moved between accounts | No net change |

---

### Payment Methods

#### Cash
Physical currency payment - immediate, no fees, but harder to track.

#### Bank Transfer
Electronic transfer between bank accounts.
- **RTGS** - Real Time Gross Settlement (large amounts)
- **NEFT** - National Electronic Funds Transfer (batch processing)

#### Card Payment
Credit or debit card payment - convenient but incurs processing fees (typically 2-3%).

#### Cheque/Check
Written order directing a bank to pay a specific amount.

**Q: Why are cheques risky?**
> **A:** They can bounce if the issuer has insufficient funds, and they take time to clear.

#### UPI (Unified Payments Interface)
Digital payment system enabling instant bank transfers via mobile.

---

### Payment Status

| Status | Meaning |
|--------|---------|
| **Pending** | Payment initiated, awaiting confirmation |
| **Processing** | Payment being processed |
| **Completed** | Payment successfully received |
| **Failed** | Payment unsuccessful |
| **Cancelled** | Payment cancelled by user/system |
| **Refunded** | Payment returned to payer |
| **Expired** | Payment request expired |

---

### Transaction Fee
**Definition:** Charges applied by payment processors for handling transactions.

**Types:**
- **Percentage Fee:** e.g., 2% of transaction amount
- **Fixed Fee:** e.g., Rs. 5 per transaction
- **Combined:** e.g., 1.5% + Rs. 3 per transaction

---

### Net Amount
**Definition:** The amount received after deducting all fees.

**Formula:** `Net Amount = Gross Amount - Transaction Fees`

---

### Payment Reference
**Definition:** A unique identifier for tracking a specific payment.

**Use Cases:**
- Bank transfer references
- Transaction IDs
- Payment confirmation numbers

---

### Reconciliation
**Definition:** The process of ensuring that financial records match bank statements and other external records.

**Q: Why is reconciliation important?**
> **A:** It helps identify:
> - Missing transactions
> - Duplicate entries
> - Fraudulent activity
> - Data entry errors

---

## 5. Customer & Sales Terms

### Customer
**Definition:** A person or organization that purchases goods or services from your business.

**In MoneyFlow, customers have:**
- Contact information
- Credit limits
- Outstanding balances
- Purchase history
- Payment terms

---

### Credit Limit
**Definition:** The maximum amount of credit extended to a customer.

**Q: How do credit limits work?**
> **A:** If a customer's outstanding balance reaches their credit limit, they may not be able to make additional purchases on credit until they pay down their balance.

---

### Outstanding Balance
**Definition:** The total unpaid amount a customer owes across all invoices.

**Risk Assessment:**
- Low: Balance < 30% of credit limit
- Medium: Balance 30-70% of credit limit
- High: Balance > 70% of credit limit

---

### Customer Portal
**Definition:** A self-service interface where customers can view their invoices, make payments, and manage their account.

**Features in MoneyFlow:**
- View invoice history
- Download invoices/receipts
- Make online payments
- Update contact information

---

### Average Order Value (AOV)
**Definition:** The average amount spent per transaction.

**Formula:** `AOV = Total Revenue / Number of Orders`

---

### Customer Lifetime Value (CLV)
**Definition:** The total revenue expected from a customer throughout their relationship with your business.

**Formula:** `CLV = AOV × Purchase Frequency × Customer Lifespan`

---

### Sales Pipeline
**Definition:** A visual representation of where prospects are in the sales process.

**Stages:**
1. Lead
2. Qualified
3. Proposal
4. Negotiation
5. Closed (Won/Lost)

---

## 6. Inventory & Product Terms

### SKU (Stock Keeping Unit)
**Definition:** A unique alphanumeric code assigned to each product for inventory tracking.

**Example:** `PROD-SHIRT-BLU-L-001`

---

### Barcode
**Definition:** A machine-readable code representing product information.

**Types:**
- **UPC** - Universal Product Code (12 digits)
- **EAN** - European Article Number (13 digits)
- **QR Code** - 2D code storing more data

---

### Current Stock
**Definition:** The quantity of a product currently available in inventory.

---

### Minimum Stock Level
**Definition:** The lowest quantity at which reordering should occur to prevent stockouts.

**Also Known As:** Reorder Point

---

### Low Stock Alert
**Definition:** Notification triggered when inventory falls below the minimum stock level.

**In MoneyFlow:** Configurable per product, shown on dashboard.

---

### Stock Status

| Status | Meaning | Action |
|--------|---------|--------|
| **In Stock** | Quantity > Minimum | Normal operations |
| **Low Stock** | Quantity ≤ Minimum | Reorder soon |
| **Out of Stock** | Quantity = 0 | Urgent reorder |

---

### Unit Price
**Definition:** The selling price for one unit of a product.

---

### Cost Price
**Definition:** The amount paid to acquire or produce one unit of a product.

**Also Known As:** Purchase Price, Acquisition Cost

---

### Profit Margin
**Definition:** The difference between selling price and cost price, expressed as a percentage.

**Formula:** `Profit Margin = ((Unit Price - Cost Price) / Unit Price) × 100`

**Example:**
- Unit Price: Rs. 1,000
- Cost Price: Rs. 600
- Profit Margin: 40%

---

### Stock Valuation
**Definition:** The monetary value of inventory on hand.

**Methods:**
- **FIFO (First In, First Out):** Oldest inventory sold first
- **LIFO (Last In, First Out):** Newest inventory sold first
- **Weighted Average:** Average cost of all inventory

---

### Inventory Turnover
**Definition:** How many times inventory is sold and replaced over a period.

**Formula:** `Inventory Turnover = COGS / Average Inventory`

**Higher is generally better** - indicates strong sales.

---

### Service vs Product
| Products | Services |
|----------|----------|
| Physical goods | Intangible offerings |
| Track inventory | No inventory |
| Has COGS | Direct costs (labor) |
| Examples: Clothing, Electronics | Examples: Consulting, Repairs |

---

## 7. Subscription & SaaS Terms

### Subscription Plan
**Definition:** A pricing tier that determines features, limits, and cost for software access.

**MoneyFlow Plans:**

| Plan | Price (PKR) | Users | Invoices | Key Features |
|------|-------------|-------|----------|--------------|
| **Free** | 0 | 1 | 50/month | Basic features |
| **Pro** | 1,500 | 5 | Unlimited | Inventory, Reports |
| **Enterprise** | 4,900 | Unlimited | Unlimited | API, Multi-branch |

---

### Subscription Status

| Status | Description |
|--------|-------------|
| **Active** | Subscription is current and functional |
| **Trialing** | Using free trial period |
| **Past Due** | Payment failed, grace period |
| **Cancelled** | Subscription ended |
| **Suspended** | Account temporarily disabled |

---

### MRR (Monthly Recurring Revenue)
**Definition:** Predictable monthly revenue from subscriptions.

**Formula:** `MRR = Number of Subscribers × Average Revenue per User`

---

### ARR (Annual Recurring Revenue)
**Definition:** Yearly recurring revenue from subscriptions.

**Formula:** `ARR = MRR × 12`

---

### Churn Rate
**Definition:** The percentage of subscribers who cancel within a period.

**Formula:** `Churn Rate = (Lost Subscribers / Total Subscribers) × 100`

---

### Trial Period
**Definition:** A free period for users to test software before committing.

---

### Proration
**Definition:** Adjusting charges based on partial usage when upgrading/downgrading mid-cycle.

**Example:** Upgrading on day 15 of a 30-day billing cycle = charged 50% of the difference.

---

### Plan Limits
**Definition:** Restrictions on usage based on subscription tier.

| Limit Type | Free | Pro | Enterprise |
|------------|------|-----|------------|
| Users | 1 | 5 | Unlimited |
| Customers | 100 | Unlimited | Unlimited |
| Invoices/month | 50 | Unlimited | Unlimited |
| Storage | 100MB | 1GB | Unlimited |
| API Access | ❌ | ❌ | ✅ |

---

## 8. Banking & Account Terms

### Bank Account Types

| Type | Description | Typical Use |
|------|-------------|-------------|
| **Checking** | Regular transactional account | Daily operations |
| **Savings** | Interest-bearing account | Reserves, emergency fund |
| **Credit Card** | Revolving credit line | Expenses, payments |
| **Cash** | Physical cash on hand | Petty cash, retail |

---

### Opening Balance
**Definition:** The starting balance when setting up an account in the system.

---

### Current Balance
**Definition:** The present balance after all transactions.

**Formula:** `Current Balance = Opening Balance + Income - Expenses`

---

### IBAN (International Bank Account Number)
**Definition:** An international system for identifying bank accounts across borders.

**Format (Pakistan):** `PK` + 2 check digits + 4-letter bank code + 16-digit account number

---

### Bank Reconciliation
**Definition:** The process of matching internal records with bank statements.

**Steps:**
1. Compare transactions
2. Identify discrepancies
3. Adjust for timing differences
4. Investigate errors

---

## 9. Tax & Compliance Terms

### Tax Rate
**Definition:** The percentage of tax applied to taxable goods/services.

**Common Rates:**
- Sales Tax: Varies by region
- GST (Pakistan): 17% (standard rate)
- Service Tax: Varies

---

### Tax-Inclusive Pricing
**Definition:** When the displayed price already includes tax.

**Formula:** `Tax Amount = Price - (Price / (1 + Tax Rate))`

---

### Tax-Exclusive Pricing
**Definition:** When tax is added on top of the displayed price.

**Formula:** `Tax Amount = Price × Tax Rate`

---

### Tax Liability
**Definition:** The total amount of tax owed to government authorities.

**Formula:** `Net Tax Liability = Tax Collected - Tax Paid (Input Tax)`

---

### Tax Registration Number
**Definition:** A unique identifier issued by tax authorities.

**Pakistan:** NTN (National Tax Number)

---

### Audit Trail
**Definition:** A chronological record of all changes made to financial data.

**In MoneyFlow:** Every create, update, and delete action is logged with:
- User who made the change
- Timestamp
- Previous values
- New values
- IP address

---

### GDPR Compliance
**Definition:** Adherence to the General Data Protection Regulation for handling personal data.

**Requirements:**
- Data encryption
- Right to access data
- Right to be forgotten
- Data portability
- Breach notification
]\
---

### Row Level Security (RLS)
**Definition:** Database-level access control ensuring users only see data they're authorized to access.

**In MoneyFlow:** Ensures complete data isolation between organizations.

---

## 10. User Roles & Permissions

### Role Hierarchy

| Role | Level | Access |
|------|-------|--------|
| **Super Admin** | 100 | Full system access, all organizations |
| **Admin** | 90 | Full access to own organization |
| **Manager** | 70 | Operational management |
| **Accountant** | 60 | Financial data and reports |
| **Cashier** | 40 | Sales and basic transactions |
| **Viewer** | 20 | Read-only access |

---

### Super Admin
**Capabilities:**
- Manage all organizations
- Access all data
- System configuration
- User management across tenants

---

### Admin
**Capabilities:**
- Full organization management
- Create/manage users
- View all reports
- Configure settings
- Manage billing

---

### Manager
**Capabilities:**
- Manage customers and products
- Create and edit invoices
- View reports
- Manage inventory

---

### Accountant
**Capabilities:**
- View and create transactions
- Generate financial reports
- Bank reconciliation
- View invoices and customers

---

### Cashier
**Capabilities:**
- Create invoices and quotes
- Record payments
- View own transactions
- Basic customer interactions

---

### Viewer
**Capabilities:**
- View dashboards
- View reports (limited)
- No create/edit access

---

### Multi-Tenant Architecture
**Definition:** A system where multiple organizations (tenants) share the same application but have completely isolated data.

**Benefits:**
- Cost efficiency
- Easy maintenance
- Scalability
- Complete data isolation

---

## 11. Technical & System Terms

### API (Application Programming Interface)
**Definition:** A set of protocols allowing different software applications to communicate.

**Use in MoneyFlow:** Enterprise plans can integrate MoneyFlow with other systems via API.

---

### Webhook
**Definition:** Automated messages sent from one application to another when specific events occur.

**Example Events:**
- Invoice created
- Payment received
- Customer updated
- Subscription changed

---

### Edge Functions
**Definition:** Serverless functions that run close to users for faster response times.

**In MoneyFlow:** Used for payment processing, email sending, and PDF generation.

---

### Real-time Updates
**Definition:** Instant data synchronization across all connected clients.

**Technology:** WebSockets via Supabase

---

### PWA (Progressive Web App)
**Definition:** A web application that can be installed on devices and works offline.

**MoneyFlow PWA Features:**
- Install on mobile/desktop
- Works offline
- Push notifications
- Home screen icon

---

### Optimistic UI
**Definition:** UI pattern that immediately reflects user actions before server confirmation, rolling back if the action fails.

**Benefits:**
- Feels instant
- Better user experience
- Reduced perceived latency

---

## 12. Pakistani Payment Systems

### JazzCash
**Definition:** Pakistan's leading mobile financial service by Jazz (Mobilink).

**Features:**
- Mobile wallet
- Money transfer
- Bill payments
- Online payments

**Integration in MoneyFlow:** Customers can pay invoices via JazzCash.

---

### Easypaisa
**Definition:** Mobile financial services platform by Telenor Pakistan.

**Features:**
- Mobile wallet
- Bank account linking
- Online payments
- Money transfer

---

### Raast
**Definition:** Pakistan's first instant payment system launched by State Bank of Pakistan.

**Features:**
- Instant bank transfers
- 24/7 availability
- Free transfers
- Raast ID (linked to phone/CNIC)

**Raast ID:** A unique identifier (phone number or CNIC) that enables instant payments without bank account details.

---

### PKR (Pakistani Rupee)
**Symbol:** Rs. or ₨

**Currency Code:** PKR

---

## 13. Frequently Asked Questions (FAQ)

### General Questions

**Q: What is MoneyFlow?**
> **A:** MoneyFlow is a comprehensive Business Management Platform for small to medium businesses to manage finances, inventory, customers, and operations from a single dashboard.

**Q: Who is MoneyFlow for?**
> **A:** Small to medium businesses in Pakistan and globally, including:
> - Retail shops
> - Service providers
> - Freelancers
> - Wholesalers
> - Restaurants

---

### Invoice Questions

**Q: How do I create an invoice?**
> **A:** Navigate to Invoices → New Invoice, select a customer, add line items, set due date, and save.

**Q: Can I customize my invoice template?**
> **A:** Yes (Pro and Enterprise plans). Go to Settings → Invoice Settings to customize logo, colors, and layout.

**Q: How do I record a partial payment?**
> **A:** Open the invoice → Record Payment → Enter the partial amount. The status will change to "Partially Paid."

**Q: What happens when an invoice becomes overdue?**
> **A:** The status automatically changes to "Overdue" and appears in your dashboard alerts. You can set up automated reminders.

---

### Payment Questions

**Q: What payment methods does MoneyFlow support?**
> **A:** Cash, Bank Transfer, Card, Cheque, UPI, JazzCash, Easypaisa, and Raast.

**Q: How do transaction fees work?**
> **A:** Different payment providers charge different fees. MoneyFlow displays the net amount (after fees) for each transaction.

**Q: Can customers pay online?**
> **A:** Yes, through the customer portal or payment links sent via email/SMS.

---

### Financial Report Questions

**Q: What reports can I generate?**
> **A:** 
> - Profit & Loss Statement
> - Balance Sheet
> - Cash Flow Statement
> - Sales Report
> - Expense Report
> - Tax Report
> - Customer Report
> - Product Report

**Q: How often should I review financial reports?**
> **A:**
> - **Daily:** Dashboard metrics
> - **Weekly:** Sales and expense trends
> - **Monthly:** P&L and cash flow
> - **Quarterly:** Full financial review
> - **Annually:** Complete audit

**Q: Can I export reports?**
> **A:** Yes, in CSV, Excel, and PDF formats.

---

### Inventory Questions

**Q: How do I track inventory?**
> **A:** Enable "Track Inventory" for each product. Stock is automatically updated when invoices are created.

**Q: What is a low stock alert?**
> **A:** A notification when product quantity falls below the minimum stock level you set.

**Q: How do I do a stock take/count?**
> **A:** Go to Products → Stock Adjustment to update quantities manually.

---

### Subscription Questions

**Q: Can I change my plan?**
> **A:** Yes, upgrade or downgrade anytime from Settings → Subscription. Changes are prorated.

**Q: What happens if my subscription expires?**
> **A:** Your account enters a grace period, then becomes read-only. Data is never deleted.

**Q: Is there a free trial?**
> **A:** Yes, all features are available during the trial period.

---

### Security Questions

**Q: How is my data protected?**
> **A:**
> - End-to-end encryption (TLS 1.3)
> - Row-level security in database
> - Regular security audits
> - GDPR compliance
> - Automatic backups

**Q: Can I enable two-factor authentication?**
> **A:** Yes, for admin accounts. Go to Settings → Security → Enable 2FA.

**Q: Who can see my data?**
> **A:** Only users within your organization based on their role permissions. MoneyFlow staff cannot access your data.

---

### Technical Questions

**Q: Can I access MoneyFlow on mobile?**
> **A:** Yes, MoneyFlow is fully responsive and can be installed as a PWA on any device.

**Q: Does MoneyFlow work offline?**
> **A:** Basic viewing and draft creation work offline. Data syncs when you're back online.

**Q: Can I integrate MoneyFlow with other software?**
> **A:** Enterprise plan includes API access for integrations with accounting software, CRMs, and custom systems.

---

## 📖 Quick Reference Card

### Key Formulas

```
Gross Profit = Revenue - COGS
Net Profit = Revenue - All Expenses - Taxes
Profit Margin = ((Price - Cost) / Price) × 100
Outstanding = Total - Paid
Tax Amount = Subtotal × Tax Rate
```

### Common Abbreviations

| Abbreviation | Full Form |
|--------------|-----------|
| AR | Accounts Receivable |
| AP | Accounts Payable |
| COGS | Cost of Goods Sold |
| P&L | Profit & Loss |
| SKU | Stock Keeping Unit |
| MRR | Monthly Recurring Revenue |
| AOV | Average Order Value |
| CLV | Customer Lifetime Value |
| IBAN | International Bank Account Number |
| PKR | Pakistani Rupee |
| GST | General Sales Tax |
| NTN | National Tax Number |

---

## 📚 Additional Resources

- **User Guide:** [docs/USER_GUIDE.md](./guides/USER_GUIDE.md)
- **Setup Guide:** [docs/SETUP_GUIDE.md](./guides/SETUP_GUIDE.md)
- **API Reference:** [docs/api/](./api/)
- **Database Schema:** [docs/architecture/database-schema.md](./architecture/database-schema.md)

---

*Last Updated: December 2025*
*Version: 2.0*

**© 2024 MoneyFlow - All Rights Reserved**

