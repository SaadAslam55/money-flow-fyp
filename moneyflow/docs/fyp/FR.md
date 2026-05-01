# 📋 Money Flow - Functional Requirements (FR)

> **Document Version:** 1.0  
> **Last Updated:** November 2025  
> **Project:** Money Flow - Business Management Platform  
> **Live URL:** https://mtkcodex.site

---

## 📌 Table of Contents

1. [Overview](#1-overview)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Dashboard & Analytics](#3-dashboard--analytics)
4. [Invoice Management](#4-invoice-management)
5. [Customer Management](#5-customer-management)
6. [Product & Inventory Management](#6-product--inventory-management)
7. [Transaction & Expense Management](#7-transaction--expense-management)
8. [Financial Reports](#8-financial-reports)
9. [Payment Integration](#9-payment-integration)
10. [Organization & Multi-Tenancy](#10-organization--multi-tenancy)
11. [User & Role Management](#11-user--role-management)
12. [Settings & Configuration](#12-settings--configuration)
13. [Notifications & Alerts](#13-notifications--alerts)
14. [Subscription Management](#14-subscription-management)
15. [Non-Functional Requirements](#15-non-functional-requirements)

---

## 1. Overview

**Money Flow** is a comprehensive Business Management Platform designed for small to medium businesses to manage finances, inventory, customers, and operations from a single dashboard. The system supports multi-tenancy with complete data isolation and role-based access control.

### 1.1 System Scope

| Aspect               | Description                                         |
| -------------------- | --------------------------------------------------- |
| **Target Users**     | SMBs, Retail Stores, Service Providers, Freelancers |
| **Deployment**       | Cloud-based (Vercel + Supabase)                     |
| **Architecture**     | Multi-tenant SaaS                                   |
| **Primary Currency** | PKR (Pakistani Rupee) with multi-currency support   |

---

## 2. Authentication & Authorization

### FR-2.1: User Registration

| ID                 | FR-2.1                                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**    | System shall allow new users to register with email and password                                                                                                    |
| **Inputs**         | Full name, Email, Password, Organization name                                                                                                                       |
| **Outputs**        | User account created, Verification email sent                                                                                                                       |
| **Business Rules** | - Password must be minimum 8 characters with uppercase, lowercase, and number<br>- Email must be unique across system<br>- First user of organization becomes Admin |

### FR-2.2: User Login

| ID                 | FR-2.2                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Description**    | System shall authenticate users via email and password                                                             |
| **Inputs**         | Email, Password                                                                                                    |
| **Outputs**        | JWT access token, User session                                                                                     |
| **Business Rules** | - Invalid credentials show generic error<br>- Session expires after 24 hours<br>- Auto token refresh before expiry |

### FR-2.3: Password Reset

| ID                 | FR-2.3                                                                              |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Description**    | System shall allow users to reset forgotten password                                |
| **Inputs**         | Email address                                                                       |
| **Outputs**        | Password reset email with secure link                                               |
| **Business Rules** | - Reset link valid for 1 hour<br>- Previous sessions invalidated on password change |

### FR-2.4: Email Verification

| ID                 | FR-2.4                                            |
| ------------------ | ------------------------------------------------- |
| **Description**    | System shall verify user email addresses          |
| **Inputs**         | Verification link from email                      |
| **Outputs**        | Account activated                                 |
| **Business Rules** | - User cannot access full features until verified |

### FR-2.5: Role-Based Access Control (RBAC)

| ID                 | FR-2.5                                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Description**    | System shall enforce permissions based on user roles                                                                                |
| **Roles**          | Super Admin (100), Admin (90), Manager (70), Accountant (60), Cashier (40), Customer (10)                                           |
| **Business Rules** | - Higher role level inherits lower role permissions<br>- Super Admin has system-wide access<br>- Admin has organization-wide access |

---

## 3. Dashboard & Analytics

### FR-3.1: Dashboard Overview

| ID                 | FR-3.1                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Description**    | System shall display real-time business metrics on dashboard                                                                                                 |
| **Data Displayed** | - Total Revenue (Today/Week/Month/Year)<br>- Outstanding Invoices<br>- Pending Payments<br>- Active Customers<br>- Low Stock Alerts<br>- Recent Transactions |
| **Access**         | All authenticated users                                                                                                                                      |

### FR-3.2: Revenue Charts

| ID                 | FR-3.2                                                               |
| ------------------ | -------------------------------------------------------------------- |
| **Description**    | System shall display revenue trends via interactive charts           |
| **Chart Types**    | Line chart, Bar chart, Area chart                                    |
| **Time Periods**   | Daily, Weekly, Monthly, Yearly                                       |
| **Business Rules** | - Data filtered by organization<br>- Comparison with previous period |

### FR-3.3: Quick Actions

| ID              | FR-3.3                                                        |
| --------------- | ------------------------------------------------------------- |
| **Description** | Dashboard shall provide quick action buttons                  |
| **Actions**     | Create Invoice, Add Customer, Add Product, Record Transaction |
| **Access**      | Based on user role permissions                                |

### FR-3.4: Activity Feed

| ID                 | FR-3.4                                                          |
| ------------------ | --------------------------------------------------------------- |
| **Description**    | System shall show recent activity logs on dashboard             |
| **Data**           | Invoice created, Payment received, Stock updated, User actions  |
| **Business Rules** | - Shows last 10 activities<br>- Real-time updates via WebSocket |

---

## 4. Invoice Management

### FR-4.1: Create Invoice

| ID                 | FR-4.1                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**    | System shall allow creation of professional invoices                                                                                              |
| **Inputs**         | Customer, Invoice date, Due date, Line items (product, quantity, price, tax), Notes, Terms                                                        |
| **Outputs**        | Invoice with auto-generated number, Calculated totals                                                                                             |
| **Calculations**   | - Subtotal = Σ(quantity × unit_price)<br>- Tax = Subtotal × tax_rate<br>- Total = Subtotal + Tax - Discount<br>- Amount Due = Total - Amount Paid |
| **Business Rules** | - Invoice number auto-generated (INV-YYYYMM-XXXX)<br>- Due date must be >= invoice date<br>- Stock automatically deducted if product tracked      |

### FR-4.2: Edit Invoice

| ID                  | FR-4.2                                                                        |
| ------------------- | ----------------------------------------------------------------------------- |
| **Description**     | System shall allow editing of draft invoices                                  |
| **Editable Fields** | All fields except invoice number                                              |
| **Business Rules**  | - Only draft/unpaid invoices can be edited<br>- Audit log created for changes |

### FR-4.3: View Invoice

| ID              | FR-4.3                                                            |
| --------------- | ----------------------------------------------------------------- |
| **Description** | System shall display invoice details in readable format           |
| **Display**     | Header, Customer info, Line items, Totals, Payment history, Notes |
| **Access**      | Based on role permissions                                         |

### FR-4.4: Send Invoice via Email

| ID                 | FR-4.4                                                      |
| ------------------ | ----------------------------------------------------------- |
| **Description**    | System shall email invoices to customers                    |
| **Inputs**         | Invoice ID, Customer email                                  |
| **Outputs**        | Email sent with PDF attachment                              |
| **Business Rules** | - Invoice status updated to "sent"<br>- Send log maintained |

### FR-4.5: Generate Invoice PDF

| ID                 | FR-4.5                                                       |
| ------------------ | ------------------------------------------------------------ |
| **Description**    | System shall generate downloadable PDF invoices              |
| **PDF Contains**   | Company logo, Invoice details, Line items, Totals, Terms     |
| **Business Rules** | - Professional formatting<br>- Organization branding applied |

### FR-4.6: Record Payment

| ID                 | FR-4.6                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| **Description**    | System shall record payments against invoices                                                             |
| **Inputs**         | Invoice ID, Amount, Payment method, Date, Reference                                                       |
| **Outputs**        | Payment recorded, Invoice status updated                                                                  |
| **Business Rules** | - Partial payments allowed<br>- Status: paid/partially_paid based on amount<br>- Customer balance updated |

### FR-4.7: Invoice Status Management

| ID                 | FR-4.7                                                                       |
| ------------------ | ---------------------------------------------------------------------------- |
| **Description**    | System shall track and update invoice statuses                               |
| **Statuses**       | Draft, Sent, Paid, Partially Paid, Overdue, Cancelled                        |
| **Business Rules** | - Auto-mark overdue when past due date<br>- Cancelled invoices restore stock |

### FR-4.8: Recurring Invoices

| ID                 | FR-4.8                                                                |
| ------------------ | --------------------------------------------------------------------- |
| **Description**    | System shall support automated recurring invoices                     |
| **Inputs**         | Base invoice, Frequency (weekly/monthly/yearly), Start date, End date |
| **Business Rules** | - Auto-generate on schedule<br>- Notification sent before generation  |

---

## 5. Customer Management

### FR-5.1: Create Customer

| ID                 | FR-5.1                                                                             |
| ------------------ | ---------------------------------------------------------------------------------- |
| **Description**    | System shall allow adding new customers                                            |
| **Inputs**         | Name (required), Email, Phone, Address, City, Country, Tax ID, Credit limit, Notes |
| **Outputs**        | Customer record created                                                            |
| **Business Rules** | - Email format validated<br>- Customer linked to organization                      |

### FR-5.2: Edit Customer

| ID                 | FR-5.2                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| **Description**    | System shall allow editing customer details                              |
| **Editable**       | All customer fields                                                      |
| **Business Rules** | - Audit log for changes<br>- Cannot delete customer with active invoices |

### FR-5.3: View Customer Profile

| ID              | FR-5.3                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **Description** | System shall display comprehensive customer profile                                              |
| **Display**     | Contact info, Invoice history, Payment history, Outstanding balance, Total revenue from customer |

### FR-5.4: Customer Search & Filter

| ID              | FR-5.4                                        |
| --------------- | --------------------------------------------- |
| **Description** | System shall provide advanced customer search |
| **Search By**   | Name, Email, Phone                            |
| **Filter By**   | Outstanding balance, City, Created date       |

### FR-5.5: Customer Balance Tracking

| ID                 | FR-5.5                                                         |
| ------------------ | -------------------------------------------------------------- |
| **Description**    | System shall track customer outstanding balances               |
| **Calculated**     | Total unpaid invoices amount                                   |
| **Business Rules** | - Auto-updated on payment<br>- Alert when exceeds credit limit |

### FR-5.6: Customer Portal Access

| ID              | FR-5.6                                            |
| --------------- | ------------------------------------------------- |
| **Description** | System shall provide customer self-service portal |
| **Features**    | View invoices, Make payments, Download receipts   |
| **Access**      | Via portal password set by admin                  |

---

## 6. Product & Inventory Management

### FR-6.1: Create Product

| ID                 | FR-6.1                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description**    | System shall allow adding products/services to catalog                                                                                                               |
| **Inputs**         | Name (required), Description, SKU, Category, Unit price (required), Cost price, Tax rate, Is service flag, Track inventory flag, Current stock, Minimum stock, Image |
| **Business Rules** | - SKU must be unique within organization<br>- Prices must be non-negative                                                                                            |

### FR-6.2: Edit Product

| ID                 | FR-6.2                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| **Description**    | System shall allow editing product details                               |
| **Editable**       | All fields except ID                                                     |
| **Business Rules** | - Price changes don't affect existing invoices<br>- Audit log maintained |

### FR-6.3: Product Catalog View

| ID              | FR-6.3                                                   |
| --------------- | -------------------------------------------------------- |
| **Description** | System shall display product catalog with grid/list view |
| **Display**     | Image, Name, SKU, Price, Stock status, Category          |
| **Filter By**   | Category, Stock status, Active/Inactive                  |

### FR-6.4: Stock Adjustment

| ID                 | FR-6.4                                                |
| ------------------ | ----------------------------------------------------- |
| **Description**    | System shall allow manual stock adjustments           |
| **Operations**     | Add stock, Remove stock, Set stock level              |
| **Inputs**         | Product, Adjustment type, Quantity, Reason, Notes     |
| **Outputs**        | Stock updated, Movement logged                        |
| **Business Rules** | - Stock cannot go negative<br>- All movements audited |

### FR-6.5: Low Stock Alerts

| ID               | FR-6.5                                            |
| ---------------- | ------------------------------------------------- |
| **Description**  | System shall alert when stock falls below minimum |
| **Trigger**      | current_stock <= minimum_stock                    |
| **Notification** | Dashboard alert, Email notification (optional)    |

### FR-6.6: Stock Movement History

| ID              | FR-6.6                                                                  |
| --------------- | ----------------------------------------------------------------------- |
| **Description** | System shall maintain complete stock movement log                       |
| **Logged Data** | Product, Previous stock, Adjustment, New stock, Reason, User, Timestamp |

### FR-6.7: Automatic Stock Deduction

| ID                 | FR-6.7                                                     |
| ------------------ | ---------------------------------------------------------- |
| **Description**    | System shall auto-deduct stock when invoice created        |
| **Trigger**        | Invoice created with products where track_inventory = true |
| **Business Rules** | - Stock restored if invoice cancelled                      |

---

## 7. Transaction & Expense Management

### FR-7.1: Record Transaction

| ID                    | FR-7.1                                                                           |
| --------------------- | -------------------------------------------------------------------------------- |
| **Description**       | System shall allow recording all financial transactions                          |
| **Transaction Types** | Income, Expense, Transfer                                                        |
| **Inputs**            | Type, Amount, Date, Description, Category, Payment method, Bank account, Receipt |
| **Business Rules**    | - Amount must be positive<br>- Bank account balance updated                      |

### FR-7.2: Expense Categories

| ID                     | FR-7.2                                                        |
| ---------------------- | ------------------------------------------------------------- |
| **Description**        | System shall support hierarchical expense categorization      |
| **Features**           | Create categories, Sub-categories, Enable/Disable categories  |
| **Default Categories** | Office Supplies, Utilities, Rent, Salaries, Marketing, Travel |

### FR-7.3: Transaction List & Filter

| ID              | FR-7.3                                                   |
| --------------- | -------------------------------------------------------- |
| **Description** | System shall display transactions with filters           |
| **Filter By**   | Date range, Type, Category, Payment method, Bank account |
| **Sort By**     | Date, Amount                                             |

### FR-7.4: Bank Account Management

| ID                | FR-7.4                                                             |
| ----------------- | ------------------------------------------------------------------ |
| **Description**   | System shall manage business bank accounts                         |
| **Account Types** | Checking, Savings, Credit Card, Cash                               |
| **Tracked Data**  | Account name, Bank name, Account number, Current balance, Currency |

### FR-7.5: Receipt Upload

| ID              | FR-7.5                                                      |
| --------------- | ----------------------------------------------------------- |
| **Description** | System shall support receipt image uploads for transactions |
| **Formats**     | JPEG, PNG, PDF                                              |
| **Storage**     | Supabase Storage with secure URLs                           |

---

## 8. Financial Reports

### FR-8.1: Profit & Loss Statement

| ID              | FR-8.1                                                                          |
| --------------- | ------------------------------------------------------------------------------- |
| **Description** | System shall generate P&L reports                                               |
| **Data**        | Total Revenue, Cost of Goods Sold, Gross Profit, Operating Expenses, Net Profit |
| **Period**      | Custom date range, Monthly, Quarterly, Yearly                                   |
| **Output**      | On-screen display, PDF export, CSV export                                       |

### FR-8.2: Balance Sheet

| ID              | FR-8.2                                                             |
| --------------- | ------------------------------------------------------------------ |
| **Description** | System shall generate balance sheet reports                        |
| **Data**        | Assets (Cash, Accounts Receivable, Inventory), Liabilities, Equity |
| **Period**      | As of specific date                                                |

### FR-8.3: Cash Flow Statement

| ID              | FR-8.3                                                           |
| --------------- | ---------------------------------------------------------------- |
| **Description** | System shall generate cash flow reports                          |
| **Sections**    | Operating Activities, Investing Activities, Financing Activities |
| **Period**      | Custom date range                                                |

### FR-8.4: Sales Report

| ID                 | FR-8.4                                                                              |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Description**    | System shall generate sales analytics reports                                       |
| **Data**           | Total sales, Top products, Top customers, Sales by period, Payment method breakdown |
| **Visualizations** | Charts, Tables                                                                      |

### FR-8.5: Expense Report

| ID              | FR-8.5                                                       |
| --------------- | ------------------------------------------------------------ |
| **Description** | System shall generate expense analytics                      |
| **Data**        | Expenses by category, Expense trends, Top expense categories |
| **Period**      | Custom date range                                            |

### FR-8.6: Customer Report

| ID              | FR-8.6                                                         |
| --------------- | -------------------------------------------------------------- |
| **Description** | System shall generate customer analytics                       |
| **Data**        | Revenue by customer, Customer lifetime value, Payment patterns |

### FR-8.7: Product Report

| ID              | FR-8.7                                                        |
| --------------- | ------------------------------------------------------------- |
| **Description** | System shall generate product performance reports             |
| **Data**        | Top selling products, Product profit margins, Stock valuation |

### FR-8.8: Tax Report

| ID              | FR-8.8                                     |
| --------------- | ------------------------------------------ |
| **Description** | System shall generate tax summary reports  |
| **Data**        | Tax collected, Tax paid, Net tax liability |
| **Period**      | Monthly, Quarterly (for FBR compliance)    |

### FR-8.9: Custom Reports

| ID              | FR-8.9                                        |
| --------------- | --------------------------------------------- |
| **Description** | System shall allow building custom reports    |
| **Features**    | Select metrics, Date range, Filters, Grouping |
| **Output**      | PDF, CSV, Excel                               |

---

## 9. Payment Integration

### FR-9.1: JazzCash Integration

| ID              | FR-9.1                                                                     |
| --------------- | -------------------------------------------------------------------------- |
| **Description** | System shall integrate with JazzCash payment gateway                       |
| **Features**    | Mobile Account, MWALLET, Card payments                                     |
| **Flow**        | Initiate payment → Redirect to JazzCash → Process webhook → Update invoice |

### FR-9.2: EasyPaisa Integration

| ID              | FR-9.2                                                                      |
| --------------- | --------------------------------------------------------------------------- |
| **Description** | System shall integrate with EasyPaisa payment gateway                       |
| **Features**    | Mobile wallet payments, OTC payments                                        |
| **Flow**        | Initiate payment → Redirect to EasyPaisa → Process webhook → Update invoice |

### FR-9.3: Raast Integration

| ID                 | FR-9.3                                                   |
| ------------------ | -------------------------------------------------------- |
| **Description**    | System shall integrate with Raast instant payment system |
| **Features**       | Raast ID payments, Bank transfers                        |
| **Business Rules** | - Real-time payment confirmation<br>- SBP compliance     |

### FR-9.4: Stripe Integration

| ID                 | FR-9.4                                                                |
| ------------------ | --------------------------------------------------------------------- |
| **Description**    | System shall integrate with Stripe for international payments         |
| **Features**       | Card payments, Subscription billing                                   |
| **Webhook Events** | payment_intent.succeeded, invoice.paid, customer.subscription.updated |

### FR-9.5: Payment Webhooks

| ID              | FR-9.5                                                                           |
| --------------- | -------------------------------------------------------------------------------- |
| **Description** | System shall process payment provider webhooks                                   |
| **Validation**  | Signature verification, Idempotency                                              |
| **Actions**     | Update invoice status, Create transaction, Update customer balance, Send receipt |

---

## 10. Organization & Multi-Tenancy

### FR-10.1: Organization Creation

| ID                 | FR-10.1                                                  |
| ------------------ | -------------------------------------------------------- |
| **Description**    | System shall create organization during signup           |
| **Inputs**         | Name, Email, Phone, Address, Tax ID, Logo                |
| **Business Rules** | - First user becomes Admin<br>- Default settings applied |

### FR-10.2: Organization Settings

| ID              | FR-10.2                                                                    |
| --------------- | -------------------------------------------------------------------------- |
| **Description** | System shall allow organization configuration                              |
| **Settings**    | Business info, Logo, Currency, Timezone, Fiscal year start, Invoice prefix |

### FR-10.3: Data Isolation

| ID                 | FR-10.3                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| **Description**    | System shall ensure complete data isolation between organizations                 |
| **Implementation** | Row-Level Security (RLS) policies on all tables                                   |
| **Business Rules** | - Users can only access their organization's data<br>- Super Admin can access all |

### FR-10.4: Subdomain Support

| ID              | FR-10.4                                                  |
| --------------- | -------------------------------------------------------- |
| **Description** | System shall support custom subdomains for organizations |
| **Format**      | {subdomain}.mtkcodex.site                                |

---

## 11. User & Role Management

### FR-11.1: Invite Team Member

| ID              | FR-11.1                                                           |
| --------------- | ----------------------------------------------------------------- |
| **Description** | System shall allow inviting new team members                      |
| **Inputs**      | Email, Role, Name                                                 |
| **Process**     | Send invitation email → User creates password → Account activated |
| **Access**      | Admin, Manager                                                    |

### FR-11.2: Manage User Roles

| ID                 | FR-11.2                                                                             |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Description**    | System shall allow changing user roles                                              |
| **Business Rules** | - Cannot demote self<br>- Super Admin only by database admin<br>- Audit log created |

### FR-11.3: Deactivate User

| ID                 | FR-11.3                                       |
| ------------------ | --------------------------------------------- |
| **Description**    | System shall allow deactivating user accounts |
| **Effect**         | User cannot login, data preserved             |
| **Business Rules** | - Cannot deactivate last admin                |

### FR-11.4: User Activity Log

| ID              | FR-11.4                                          |
| --------------- | ------------------------------------------------ |
| **Description** | System shall track user activities               |
| **Logged**      | Login, Logout, CRUD operations, Settings changes |
| **Display**     | Admin settings → Activity Logs                   |

### FR-11.5: Permission Management

| ID                   | FR-11.5                                                        |
| -------------------- | -------------------------------------------------------------- |
| **Description**      | System shall enforce granular permissions                      |
| **Permission Types** | View, Create, Edit, Delete, Export, Admin                      |
| **Per Module**       | Invoices, Customers, Products, Transactions, Reports, Settings |

---

## 12. Settings & Configuration

### FR-12.1: Business Settings

| ID              | FR-12.1                                            |
| --------------- | -------------------------------------------------- |
| **Description** | System shall allow configuring business settings   |
| **Settings**    | Business name, Address, Logo, Contact info, Tax ID |

### FR-12.2: Invoice Settings

| ID              | FR-12.2                                                               |
| --------------- | --------------------------------------------------------------------- |
| **Description** | System shall allow configuring invoice defaults                       |
| **Settings**    | Invoice prefix, Next number, Default due days, Terms, Notes, Tax rate |

### FR-12.3: Notification Settings

| ID              | FR-12.3                                                        |
| --------------- | -------------------------------------------------------------- |
| **Description** | System shall allow configuring notifications                   |
| **Settings**    | Email notifications (new payment, low stock), Dashboard alerts |

### FR-12.4: Theme Settings

| ID              | FR-12.4                              |
| --------------- | ------------------------------------ |
| **Description** | System shall support dark/light mode |
| **Options**     | Light, Dark, System (auto-detect)    |
| **Persistence** | Saved to user preferences            |

### FR-12.5: Keyboard Shortcuts

| ID              | FR-12.5                                                        |
| --------------- | -------------------------------------------------------------- |
| **Description** | System shall support keyboard shortcuts                        |
| **Shortcuts**   | Ctrl+N (New Invoice), Ctrl+K (Search), Ctrl+/ (Shortcuts help) |

---

## 13. Notifications & Alerts

### FR-13.1: In-App Notifications

| ID              | FR-13.1                                   |
| --------------- | ----------------------------------------- |
| **Description** | System shall display in-app notifications |
| **Types**       | Success, Warning, Error, Info             |
| **Features**    | Toast notifications, Notification center  |

### FR-13.2: Email Notifications

| ID              | FR-13.2                                                    |
| --------------- | ---------------------------------------------------------- |
| **Description** | System shall send email notifications                      |
| **Triggers**    | Invoice sent, Payment received, Low stock, Overdue invoice |
| **Provider**    | Resend API                                                 |

### FR-13.3: Dashboard Alerts

| ID              | FR-13.3                                            |
| --------------- | -------------------------------------------------- |
| **Description** | System shall display important alerts on dashboard |
| **Alerts**      | Overdue invoices, Low stock items, Pending actions |

### FR-13.4: Real-Time Updates

| ID                 | FR-13.4                                         |
| ------------------ | ----------------------------------------------- |
| **Description**    | System shall provide real-time data updates     |
| **Implementation** | Supabase Realtime (WebSocket)                   |
| **Updates**        | Invoice status, Payment received, Stock changes |

---

## 14. Subscription Management

### FR-14.1: Subscription Plans

| ID              | FR-14.1                                             |
| --------------- | --------------------------------------------------- |
| **Description** | System shall offer tiered subscription plans        |
| **Plans**       | Free, Pro (PKR 2,500/mo), Enterprise (PKR 8,000/mo) |
| **Limits**      | Users, Invoices/month, Features access              |

### FR-14.2: Plan Selection

| ID              | FR-14.2                                          |
| --------------- | ------------------------------------------------ |
| **Description** | System shall allow users to select/upgrade plans |
| **Flow**        | Select plan → Payment → Activate features        |

### FR-14.3: Usage Tracking

| ID              | FR-14.3                                         |
| --------------- | ----------------------------------------------- |
| **Description** | System shall track usage against plan limits    |
| **Tracked**     | Number of users, Invoices created, Storage used |
| **Alerts**      | Approaching limit, Limit reached                |

### FR-14.4: Billing History

| ID              | FR-14.4                                      |
| --------------- | -------------------------------------------- |
| **Description** | System shall maintain billing history        |
| **Data**        | Invoice date, Amount, Status, Payment method |

---

## 15. Non-Functional Requirements

### NFR-1: Performance

| ID                   | NFR-1                            |
| -------------------- | -------------------------------- |
| **Requirement**      | Page load time < 3 seconds       |
| **API Response**     | < 500ms for standard queries     |
| **Concurrent Users** | Support 1000+ simultaneous users |

### NFR-2: Security

| ID                  | NFR-2                                          |
| ------------------- | ---------------------------------------------- |
| **Authentication**  | JWT with secure token refresh                  |
| **Data Protection** | TLS 1.3 encryption in transit, AES-256 at rest |
| **Access Control**  | Row-Level Security (RLS) on all tables         |
| **Audit**           | Comprehensive audit logging                    |
| **Compliance**      | GDPR-ready, PCI-DSS for payments               |

### NFR-3: Availability

| ID           | NFR-3                                |
| ------------ | ------------------------------------ |
| **Uptime**   | 99.9% availability                   |
| **Backup**   | Daily automated backups              |
| **Recovery** | Point-in-time recovery within 7 days |

### NFR-4: Scalability

| ID                 | NFR-4                              |
| ------------------ | ---------------------------------- |
| **Architecture**   | Horizontally scalable              |
| **Database**       | PostgreSQL with connection pooling |
| **Edge Functions** | Auto-scaling serverless functions  |

### NFR-5: Usability

| ID                       | NFR-5                                 |
| ------------------------ | ------------------------------------- |
| **Responsive**           | Mobile-first design, all screen sizes |
| **Accessibility**        | WCAG 2.1 AA compliant                 |
| **Internationalization** | Multi-language ready                  |
| **PWA**                  | Installable on all devices            |

### NFR-6: Maintainability

| ID                | NFR-6                                    |
| ----------------- | ---------------------------------------- |
| **Code Quality**  | TypeScript strict mode, ESLint, Prettier |
| **Testing**       | Unit tests, Integration tests, E2E tests |
| **Documentation** | API docs, User guide, Developer guide    |
| **CI/CD**         | Automated deployment via Vercel          |

### NFR-7: Offline Support

| ID             | NFR-7                                         |
| -------------- | --------------------------------------------- |
| **Capability** | View recent data, Create draft invoices       |
| **Sync**       | Auto-sync when connection restored            |
| **Detection**  | Automatic offline detection with UI indicator |

---

## 📊 Requirements Summary Matrix

| Category            | Total FRs | Priority (High/Medium/Low) |
| ------------------- | --------- | -------------------------- |
| Authentication      | 5         | 5/0/0                      |
| Dashboard           | 4         | 3/1/0                      |
| Invoice Management  | 8         | 8/0/0                      |
| Customer Management | 6         | 4/2/0                      |
| Product & Inventory | 7         | 5/2/0                      |
| Transactions        | 5         | 4/1/0                      |
| Reports             | 9         | 5/4/0                      |
| Payment Integration | 5         | 5/0/0                      |
| Multi-Tenancy       | 4         | 4/0/0                      |
| User Management     | 5         | 4/1/0                      |
| Settings            | 5         | 2/3/0                      |
| Notifications       | 4         | 2/2/0                      |
| Subscriptions       | 4         | 3/1/0                      |
| **Total**           | **71**    | **54/17/0**                |

---

## 📝 Traceability Matrix

| Requirement ID | Use Case | Database Table          | API Endpoint  | UI Component      |
| -------------- | -------- | ----------------------- | ------------- | ----------------- |
| FR-2.1         | UC-1     | users, organizations    | /auth/signup  | SignupPage        |
| FR-2.2         | UC-2     | users                   | /auth/login   | LoginPage         |
| FR-4.1         | UC-10    | invoices, invoice_items | /invoices     | CreateInvoiceForm |
| FR-5.1         | UC-15    | customers               | /customers    | CustomerForm      |
| FR-6.1         | UC-20    | products                | /products     | ProductForm       |
| FR-7.1         | UC-25    | transactions            | /transactions | TransactionForm   |
| FR-8.1         | UC-30    | transactions, invoices  | /reports/pnl  | ProfitLossPage    |

---

## 🔗 References

- [Main README](../../README.md)
- [Use Cases Document](usecases.md)
- [FYP Report](report.md)
- [Database Schema](../../supabase/migrations/)
- [API Documentation](../API_REFERENCE.md)

---

**Document Status:** ✅ Complete  
**Prepared For:** Final Year Project (FYP) Report
