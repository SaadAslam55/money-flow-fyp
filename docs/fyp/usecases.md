# Money Flow - Use Cases Document

## Comprehensive Use Case Specifications

---

**Project:** Money Flow - Financial Management System  
**Version:** 1.0  
**Last Updated:** November 2025

---

## Table of Contents

1. [Use Case Overview](#1-use-case-overview)
2. [Actor Definitions](#2-actor-definitions)
3. [Authentication Use Cases](#3-authentication-use-cases)
4. [Invoice Management Use Cases](#4-invoice-management-use-cases)
5. [Customer Management Use Cases](#5-customer-management-use-cases)
6. [Product Management Use Cases](#6-product-management-use-cases)
7. [Inventory Management Use Cases](#7-inventory-management-use-cases)
8. [Reporting Use Cases](#8-reporting-use-cases)
9. [Administration Use Cases](#9-administration-use-cases)
10. [Use Case Diagrams](#10-use-case-diagrams)

---

## 1. Use Case Overview

### 1.1 Use Case Summary

| ID                       | Use Case Name           | Actor                 | Priority |
| ------------------------ | ----------------------- | --------------------- | -------- |
| **Authentication**       |
| UC-01                    | User Registration       | Guest                 | High     |
| UC-02                    | User Login              | Guest                 | High     |
| UC-03                    | Password Reset          | User                  | High     |
| UC-04                    | Logout                  | User                  | Medium   |
| **Invoice Management**   |
| UC-10                    | Create Invoice          | Staff, Manager        | High     |
| UC-11                    | Edit Invoice            | Staff, Manager        | High     |
| UC-12                    | Delete Invoice          | Manager, Admin        | Medium   |
| UC-13                    | View Invoice            | Staff, Manager, Admin | High     |
| UC-14                    | Send Invoice            | Staff, Manager        | High     |
| UC-15                    | Record Payment          | Staff, Manager        | High     |
| UC-16                    | Download Invoice PDF    | Staff, Manager        | Medium   |
| UC-17                    | Duplicate Invoice       | Staff, Manager        | Low      |
| UC-18                    | Filter/Search Invoices  | All Users             | Medium   |
| **Customer Management**  |
| UC-20                    | Add Customer            | Staff, Manager        | High     |
| UC-21                    | Edit Customer           | Staff, Manager        | High     |
| UC-22                    | Delete Customer         | Manager, Admin        | Medium   |
| UC-23                    | View Customer Details   | All Users             | High     |
| UC-24                    | Search Customers        | All Users             | Medium   |
| UC-25                    | View Customer History   | Staff, Manager        | Medium   |
| **Product Management**   |
| UC-30                    | Add Product             | Staff, Manager        | High     |
| UC-31                    | Edit Product            | Staff, Manager        | High     |
| UC-32                    | Delete Product          | Manager, Admin        | Medium   |
| UC-33                    | View Product Catalog    | All Users             | High     |
| UC-34                    | Manage Categories       | Manager, Admin        | Medium   |
| **Inventory Management** |
| UC-40                    | View Stock Levels       | All Users             | High     |
| UC-41                    | Adjust Stock            | Staff, Manager        | High     |
| UC-42                    | View Low Stock Alerts   | All Users             | High     |
| UC-43                    | View Stock History      | Manager, Admin        | Medium   |
| **Reporting**            |
| UC-50                    | View Dashboard          | All Users             | High     |
| UC-51                    | Generate Sales Report   | Manager, Admin        | High     |
| UC-52                    | Generate Revenue Report | Manager, Admin        | High     |
| UC-53                    | Export Reports          | Manager, Admin        | Medium   |
| **Administration**       |
| UC-60                    | Manage Users            | Admin                 | High     |
| UC-61                    | Manage Organization     | Admin                 | High     |
| UC-62                    | View Audit Logs         | Admin                 | Medium   |
| UC-63                    | Configure Settings      | Admin                 | Medium   |

---

## 2. Actor Definitions

### 2.1 Primary Actors

| Actor           | Description             | Permissions                             |
| --------------- | ----------------------- | --------------------------------------- |
| **Guest**       | Unauthenticated visitor | Register, Login                         |
| **Staff**       | Basic employee          | View, Create, Edit own data             |
| **Manager**     | Department manager      | Full CRUD, View reports                 |
| **Admin**       | System administrator    | Full access, User management            |
| **Super Admin** | Organization owner      | All permissions + Organization settings |

### 2.2 Secondary Actors

| Actor               | Description            | Interaction                   |
| ------------------- | ---------------------- | ----------------------------- |
| **Email System**    | Email service provider | Sends invoices, notifications |
| **Payment Gateway** | Payment processor      | Processes payments            |
| **Database**        | Data storage           | Stores all data               |
| **Cache System**    | Redis cache            | Performance optimization      |

### 2.3 Actor Hierarchy

```
                    ┌─────────────┐
                    │ Super Admin │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Admin    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Manager   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Staff    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Guest    │
                    └─────────────┘
```

---

## 3. Authentication Use Cases

### UC-01: User Registration

| Field              | Description                                   |
| ------------------ | --------------------------------------------- |
| **Use Case ID**    | UC-01                                         |
| **Use Case Name**  | User Registration                             |
| **Primary Actor**  | Guest                                         |
| **Goal**           | Create a new user account and organization    |
| **Preconditions**  | User has valid email address                  |
| **Postconditions** | User account created, verification email sent |
| **Priority**       | High                                          |

**Main Flow:**

| Step | Actor                          | System                        |
| ---- | ------------------------------ | ----------------------------- |
| 1    | Navigates to registration page | Displays registration form    |
| 2    | Enters email, password, name   | Validates input format        |
| 3    | Enters organization name       | Validates uniqueness          |
| 4    | Clicks "Register"              | Creates user and organization |
| 5    |                                | Sends verification email      |
| 6    | Clicks verification link       | Activates account             |
| 7    |                                | Redirects to dashboard        |

**Alternative Flows:**

| ID  | Condition                 | Steps                         |
| --- | ------------------------- | ----------------------------- |
| 1a  | Email already exists      | Display error, suggest login  |
| 2a  | Invalid password format   | Display password requirements |
| 3a  | Organization name taken   | Suggest alternatives          |
| 6a  | Verification link expired | Resend verification email     |

**Business Rules:**

- BR-01: Password must be 8+ characters with uppercase, lowercase, and number
- BR-02: Email must be valid format
- BR-03: Verification link valid for 24 hours

---

### UC-02: User Login

| Field              | Description                        |
| ------------------ | ---------------------------------- |
| **Use Case ID**    | UC-02                              |
| **Use Case Name**  | User Login                         |
| **Primary Actor**  | Guest                              |
| **Goal**           | Authenticate and access the system |
| **Preconditions**  | User has registered account        |
| **Postconditions** | User logged in, session created    |
| **Priority**       | High                               |

**Main Flow:**

| Step | Actor                     | System                      |
| ---- | ------------------------- | --------------------------- |
| 1    | Navigates to login page   | Displays login form         |
| 2    | Enters email and password | Validates credentials       |
| 3    | Clicks "Login"            | Authenticates with Supabase |
| 4    |                           | Creates session, issues JWT |
| 5    |                           | Redirects to dashboard      |

**Alternative Flows:**

| ID  | Condition            | Steps                                  |
| --- | -------------------- | -------------------------------------- |
| 2a  | Invalid credentials  | Display error message                  |
| 2b  | Account locked       | Display lockout message, suggest reset |
| 2c  | Account not verified | Prompt to verify email                 |

**Security Measures:**

- Rate limiting: 5 attempts per 15 minutes
- Account lockout after 10 failed attempts
- JWT token expires in 7 days
- Refresh token expires in 30 days

---

### UC-03: Password Reset

| Field              | Description                 |
| ------------------ | --------------------------- |
| **Use Case ID**    | UC-03                       |
| **Use Case Name**  | Password Reset              |
| **Primary Actor**  | User                        |
| **Goal**           | Reset forgotten password    |
| **Preconditions**  | User has registered account |
| **Postconditions** | Password updated            |
| **Priority**       | High                        |

**Main Flow:**

| Step | Actor                    | System                      |
| ---- | ------------------------ | --------------------------- |
| 1    | Clicks "Forgot Password" | Displays reset form         |
| 2    | Enters email address     | Validates email exists      |
| 3    | Clicks "Send Reset Link" | Sends reset email           |
| 4    | Clicks link in email     | Displays new password form  |
| 5    | Enters new password      | Validates password strength |
| 6    | Clicks "Reset Password"  | Updates password            |
| 7    |                          | Invalidates all sessions    |
| 8    |                          | Redirects to login          |

---

## 4. Invoice Management Use Cases

### UC-10: Create Invoice

| Field              | Description                                  |
| ------------------ | -------------------------------------------- |
| **Use Case ID**    | UC-10                                        |
| **Use Case Name**  | Create Invoice                               |
| **Primary Actor**  | Staff, Manager                               |
| **Goal**           | Create a new invoice for a customer          |
| **Preconditions**  | User logged in, at least one customer exists |
| **Postconditions** | Invoice created with draft status            |
| **Priority**       | High                                         |

**Main Flow:**

| Step | Actor                      | System                          |
| ---- | -------------------------- | ------------------------------- |
| 1    | Clicks "New Invoice"       | Displays invoice form           |
| 2    | Selects customer           | Auto-fills customer details     |
| 3    | Sets due date              | Validates date is in future     |
| 4    | Adds line item             | Displays product selector       |
| 5    | Selects product            | Auto-fills price                |
| 6    | Enters quantity            | Calculates line total           |
| 7    | Repeats 4-6 for more items | Updates subtotal                |
| 8    | Adds notes (optional)      | Stores notes                    |
| 9    | Clicks "Save Draft"        | Generates invoice number        |
| 10   |                            | Saves invoice with DRAFT status |
| 11   |                            | Displays success message        |

**Alternative Flows:**

| ID  | Condition            | Steps                           |
| --- | -------------------- | ------------------------------- |
| 4a  | No products exist    | Prompt to add product first     |
| 5a  | Product out of stock | Display warning, allow override |
| 9a  | Clicks "Save & Send" | Execute UC-14 after saving      |

**Invoice Number Format:**

- Pattern: `INV-{YEAR}{MONTH}-{SEQUENCE}`
- Example: `INV-202411-0001`

**Calculations:**

```
Line Total = Quantity × Unit Price
Subtotal = Sum of Line Totals
Tax = Subtotal × Tax Rate
Total = Subtotal + Tax - Discount
```

---

### UC-11: Edit Invoice

| Field              | Description                             |
| ------------------ | --------------------------------------- |
| **Use Case ID**    | UC-11                                   |
| **Use Case Name**  | Edit Invoice                            |
| **Primary Actor**  | Staff, Manager                          |
| **Goal**           | Modify an existing invoice              |
| **Preconditions**  | Invoice exists, status is DRAFT or SENT |
| **Postconditions** | Invoice updated                         |
| **Priority**       | High                                    |

**Main Flow:**

| Step | Actor           | System                   |
| ---- | --------------- | ------------------------ |
| 1    | Selects invoice | Displays invoice details |
| 2    | Clicks "Edit"   | Displays edit form       |
| 3    | Modifies fields | Validates changes        |
| 4    | Clicks "Save"   | Updates invoice          |
| 5    |                 | Logs audit trail         |
| 6    |                 | Displays success message |

**Business Rules:**

- BR-04: Cannot edit PAID invoices
- BR-05: Cannot edit CANCELLED invoices
- BR-06: Editing SENT invoice reverts to DRAFT

---

### UC-14: Send Invoice

| Field              | Description                          |
| ------------------ | ------------------------------------ |
| **Use Case ID**    | UC-14                                |
| **Use Case Name**  | Send Invoice                         |
| **Primary Actor**  | Staff, Manager                       |
| **Goal**           | Send invoice to customer via email   |
| **Preconditions**  | Invoice exists with DRAFT status     |
| **Postconditions** | Invoice sent, status changed to SENT |
| **Priority**       | High                                 |

**Main Flow:**

| Step | Actor                       | System                        |
| ---- | --------------------------- | ----------------------------- |
| 1    | Selects invoice             | Displays invoice details      |
| 2    | Clicks "Send"               | Displays send confirmation    |
| 3    | Reviews email preview       | Shows email template          |
| 4    | Modifies message (optional) | Updates email body            |
| 5    | Clicks "Confirm Send"       | Generates PDF attachment      |
| 6    |                             | Sends email via email service |
| 7    |                             | Updates status to SENT        |
| 8    |                             | Records sent timestamp        |
| 9    |                             | Displays success message      |

**Email Template Variables:**

- `{{customer_name}}` - Customer full name
- `{{invoice_number}}` - Invoice reference
- `{{amount_due}}` - Total amount
- `{{due_date}}` - Payment due date
- `{{company_name}}` - Organization name

---

### UC-15: Record Payment

| Field              | Description                                |
| ------------------ | ------------------------------------------ |
| **Use Case ID**    | UC-15                                      |
| **Use Case Name**  | Record Payment                             |
| **Primary Actor**  | Staff, Manager                             |
| **Goal**           | Record a payment against an invoice        |
| **Preconditions**  | Invoice exists with SENT or PARTIAL status |
| **Postconditions** | Payment recorded, status updated           |
| **Priority**       | High                                       |

**Main Flow:**

| Step | Actor                       | System                      |
| ---- | --------------------------- | --------------------------- |
| 1    | Selects invoice             | Displays invoice details    |
| 2    | Clicks "Record Payment"     | Displays payment form       |
| 3    | Enters payment amount       | Validates against balance   |
| 4    | Selects payment method      | Records method              |
| 5    | Enters reference (optional) | Stores reference            |
| 6    | Clicks "Save Payment"       | Creates transaction record  |
| 7    |                             | Updates invoice amount_paid |
| 8    |                             | Updates customer balance    |
| 9    |                             | Determines new status       |
| 10   |                             | Displays success message    |

**Status Logic:**

```
IF amount_paid >= total THEN
    status = PAID
ELSE IF amount_paid > 0 THEN
    status = PARTIAL
ELSE
    status = SENT
END IF
```

**Payment Methods:**

- Cash
- Bank Transfer
- Credit Card
- Check
- Online Payment

---

### UC-18: Filter/Search Invoices

| Field              | Description             |
| ------------------ | ----------------------- |
| **Use Case ID**    | UC-18                   |
| **Use Case Name**  | Filter/Search Invoices  |
| **Primary Actor**  | All Users               |
| **Goal**           | Find specific invoices  |
| **Preconditions**  | User logged in          |
| **Postconditions** | Filtered list displayed |
| **Priority**       | Medium                  |

**Filter Options:**

| Filter         | Type        | Values                                     |
| -------------- | ----------- | ------------------------------------------ |
| Status         | Dropdown    | All, Draft, Sent, Paid, Overdue, Cancelled |
| Customer       | Search      | Customer name/email                        |
| Date Range     | Date Picker | From date, To date                         |
| Amount         | Range       | Min amount, Max amount                     |
| Invoice Number | Text        | Partial match                              |

**Main Flow:**

| Step | Actor                          | System                   |
| ---- | ------------------------------ | ------------------------ |
| 1    | Opens invoices page            | Displays all invoices    |
| 2    | Selects filter criteria        | Validates input          |
| 3    | Clicks "Apply" or types search | Queries database         |
| 4    |                                | Returns filtered results |
| 5    |                                | Updates list view        |
| 6    |                                | Shows result count       |

---

## 5. Customer Management Use Cases

### UC-20: Add Customer

| Field              | Description                      |
| ------------------ | -------------------------------- |
| **Use Case ID**    | UC-20                            |
| **Use Case Name**  | Add Customer                     |
| **Primary Actor**  | Staff, Manager                   |
| **Goal**           | Add a new customer to the system |
| **Preconditions**  | User logged in                   |
| **Postconditions** | Customer created                 |
| **Priority**       | High                             |

**Main Flow:**

| Step | Actor                     | System                   |
| ---- | ------------------------- | ------------------------ |
| 1    | Clicks "Add Customer"     | Displays customer form   |
| 2    | Enters customer name      | Validates required field |
| 3    | Enters email              | Validates email format   |
| 4    | Enters phone (optional)   | Validates phone format   |
| 5    | Enters address (optional) | Stores address           |
| 6    | Clicks "Save"             | Creates customer record  |
| 7    |                           | Displays success message |

**Customer Fields:**

| Field   | Required | Validation               |
| ------- | -------- | ------------------------ |
| Name    | Yes      | 2-100 characters         |
| Email   | Yes      | Valid email format       |
| Phone   | No       | Valid phone format       |
| Address | No       | Max 500 characters       |
| City    | No       | Max 100 characters       |
| Country | No       | From country list        |
| Tax ID  | No       | Format varies by country |
| Notes   | No       | Max 1000 characters      |

---

### UC-25: View Customer History

| Field              | Description                          |
| ------------------ | ------------------------------------ |
| **Use Case ID**    | UC-25                                |
| **Use Case Name**  | View Customer History                |
| **Primary Actor**  | Staff, Manager                       |
| **Goal**           | View all transactions for a customer |
| **Preconditions**  | Customer exists                      |
| **Postconditions** | History displayed                    |
| **Priority**       | Medium                               |

**Main Flow:**

| Step | Actor                 | System                    |
| ---- | --------------------- | ------------------------- |
| 1    | Selects customer      | Displays customer details |
| 2    | Clicks "View History" | Queries all invoices      |
| 3    |                       | Queries all payments      |
| 4    |                       | Displays timeline view    |

**History Includes:**

- All invoices (with status)
- All payments received
- Balance changes
- Communication log
- Notes added

---

## 6. Product Management Use Cases

### UC-30: Add Product

| Field              | Description                      |
| ------------------ | -------------------------------- |
| **Use Case ID**    | UC-30                            |
| **Use Case Name**  | Add Product                      |
| **Primary Actor**  | Staff, Manager                   |
| **Goal**           | Add a new product to the catalog |
| **Preconditions**  | User logged in                   |
| **Postconditions** | Product created                  |
| **Priority**       | High                             |

**Main Flow:**

| Step | Actor                 | System                     |
| ---- | --------------------- | -------------------------- |
| 1    | Clicks "Add Product"  | Displays product form      |
| 2    | Enters product name   | Validates uniqueness       |
| 3    | Enters SKU (optional) | Validates uniqueness       |
| 4    | Enters description    | Stores description         |
| 5    | Enters unit price     | Validates positive number  |
| 6    | Selects category      | Lists available categories |
| 7    | Enters initial stock  | Sets stock_quantity        |
| 8    | Clicks "Save"         | Creates product record     |

**Product Fields:**

| Field               | Required | Validation               |
| ------------------- | -------- | ------------------------ |
| Name                | Yes      | 2-200 characters, unique |
| SKU                 | No       | Alphanumeric, unique     |
| Description         | No       | Max 2000 characters      |
| Unit Price          | Yes      | Positive decimal         |
| Category            | No       | From category list       |
| Stock Quantity      | No       | Non-negative integer     |
| Low Stock Threshold | No       | Non-negative integer     |
| Unit                | No       | pcs, kg, hrs, etc.       |
| Tax Rate            | No       | Percentage 0-100         |

---

## 7. Inventory Management Use Cases

### UC-41: Adjust Stock

| Field              | Description                          |
| ------------------ | ------------------------------------ |
| **Use Case ID**    | UC-41                                |
| **Use Case Name**  | Adjust Stock                         |
| **Primary Actor**  | Staff, Manager                       |
| **Goal**           | Manually adjust product stock levels |
| **Preconditions**  | Product exists                       |
| **Postconditions** | Stock adjusted, log created          |
| **Priority**       | High                                 |

**Main Flow:**

| Step | Actor                   | System                      |
| ---- | ----------------------- | --------------------------- |
| 1    | Selects product         | Displays current stock      |
| 2    | Clicks "Adjust Stock"   | Displays adjustment form    |
| 3    | Selects adjustment type | Addition or Subtraction     |
| 4    | Enters quantity         | Validates positive number   |
| 5    | Selects reason          | From predefined list        |
| 6    | Enters notes (optional) | Stores notes                |
| 7    | Clicks "Save"           | Updates stock_quantity      |
| 8    |                         | Creates inventory_log entry |
| 9    |                         | Checks low stock threshold  |
| 10   |                         | Displays success message    |

**Adjustment Reasons:**

- Purchase/Restock
- Return from Customer
- Damaged/Expired
- Theft/Loss
- Inventory Count Correction
- Transfer (multi-location)
- Other

**Stock Movement Log:**

```
{
  product_id: "uuid",
  change_quantity: +/-100,
  reason: "restock",
  notes: "Received shipment #12345",
  before_quantity: 50,
  after_quantity: 150,
  created_by: "user_id",
  created_at: "timestamp"
}
```

---

### UC-42: View Low Stock Alerts

| Field              | Description                         |
| ------------------ | ----------------------------------- |
| **Use Case ID**    | UC-42                               |
| **Use Case Name**  | View Low Stock Alerts               |
| **Primary Actor**  | All Users                           |
| **Goal**           | View products below stock threshold |
| **Preconditions**  | Products exist with thresholds set  |
| **Postconditions** | Alert list displayed                |
| **Priority**       | High                                |

**Main Flow:**

| Step | Actor             | System                                  |
| ---- | ----------------- | --------------------------------------- |
| 1    | Views dashboard   | Displays low stock widget               |
| 2    | Clicks "View All" | Displays full low stock list            |
| 3    |                   | Shows products where stock <= threshold |
| 4    |                   | Sorted by urgency                       |

**Alert Levels:**

- 🔴 **Critical:** Stock = 0
- 🟠 **Warning:** Stock < 50% of threshold
- 🟡 **Low:** Stock <= threshold

---

## 8. Reporting Use Cases

### UC-50: View Dashboard

| Field              | Description                      |
| ------------------ | -------------------------------- |
| **Use Case ID**    | UC-50                            |
| **Use Case Name**  | View Dashboard                   |
| **Primary Actor**  | All Users                        |
| **Goal**           | View summary of business metrics |
| **Preconditions**  | User logged in                   |
| **Postconditions** | Dashboard displayed              |
| **Priority**       | High                             |

**Dashboard Widgets:**

| Widget             | Data Displayed                           |
| ------------------ | ---------------------------------------- |
| Revenue Overview   | Total revenue, This month vs Last month  |
| Invoice Summary    | Total, Draft, Sent, Paid, Overdue counts |
| Outstanding Amount | Total unpaid invoice value               |
| Recent Invoices    | Last 5 invoices created                  |
| Recent Payments    | Last 5 payments received                 |
| Low Stock Alert    | Products below threshold                 |
| Top Customers      | By revenue, last 30 days                 |
| Revenue Chart      | Monthly trend, last 12 months            |

**Main Flow:**

| Step | Actor              | System                   |
| ---- | ------------------ | ------------------------ |
| 1    | Logs in            | Redirects to dashboard   |
| 2    |                    | Fetches all widget data  |
| 3    |                    | Renders dashboard        |
| 4    | Selects date range | Updates all widgets      |
| 5    | Clicks widget      | Navigates to detail view |

---

### UC-51: Generate Sales Report

| Field              | Description                      |
| ------------------ | -------------------------------- |
| **Use Case ID**    | UC-51                            |
| **Use Case Name**  | Generate Sales Report            |
| **Primary Actor**  | Manager, Admin                   |
| **Goal**           | Generate detailed sales analysis |
| **Preconditions**  | Invoice data exists              |
| **Postconditions** | Report generated                 |
| **Priority**       | High                             |

**Report Parameters:**

| Parameter  | Options                                                |
| ---------- | ------------------------------------------------------ |
| Date Range | Custom, This Week, This Month, This Quarter, This Year |
| Group By   | Day, Week, Month, Quarter                              |
| Filter By  | Customer, Product, Category, Status                    |
| Metrics    | Revenue, Count, Average                                |

**Report Sections:**

1. **Summary**
   - Total Sales
   - Total Invoices
   - Average Invoice Value
   - Paid vs Outstanding

2. **Trend Analysis**
   - Sales by period
   - Comparison to previous period
   - Growth percentage

3. **Breakdown**
   - By Customer
   - By Product
   - By Category
   - By Status

4. **Top Performers**
   - Top 10 Customers
   - Top 10 Products

---

## 9. Administration Use Cases

### UC-60: Manage Users

| Field              | Description                             |
| ------------------ | --------------------------------------- |
| **Use Case ID**    | UC-60                                   |
| **Use Case Name**  | Manage Users                            |
| **Primary Actor**  | Admin                                   |
| **Goal**           | Add, edit, or remove organization users |
| **Preconditions**  | Admin logged in                         |
| **Postconditions** | User changes applied                    |
| **Priority**       | High                                    |

**Main Flow (Add User):**

| Step | Actor                         | System                     |
| ---- | ----------------------------- | -------------------------- |
| 1    | Navigates to Settings > Users | Displays user list         |
| 2    | Clicks "Invite User"          | Displays invite form       |
| 3    | Enters email                  | Validates format           |
| 4    | Selects role                  | Staff, Manager, Admin      |
| 5    | Clicks "Send Invite"          | Creates pending user       |
| 6    |                               | Sends invitation email     |
| 7    | User clicks invite link       | Displays registration form |
| 8    | User completes registration   | Activates account          |

**User Roles & Permissions:**

| Permission            | Staff | Manager | Admin |
| --------------------- | ----- | ------- | ----- |
| View Invoices         | ✅    | ✅      | ✅    |
| Create Invoices       | ✅    | ✅      | ✅    |
| Delete Invoices       | ❌    | ✅      | ✅    |
| View Reports          | ❌    | ✅      | ✅    |
| Manage Users          | ❌    | ❌      | ✅    |
| Organization Settings | ❌    | ❌      | ✅    |

---

### UC-61: Manage Organization

| Field              | Description                     |
| ------------------ | ------------------------------- |
| **Use Case ID**    | UC-61                           |
| **Use Case Name**  | Manage Organization             |
| **Primary Actor**  | Admin                           |
| **Goal**           | Configure organization settings |
| **Preconditions**  | Admin logged in                 |
| **Postconditions** | Settings updated                |
| **Priority**       | High                            |

**Configurable Settings:**

| Setting           | Description                  |
| ----------------- | ---------------------------- |
| Organization Name | Business name                |
| Logo              | Company logo for invoices    |
| Address           | Business address             |
| Contact Info      | Phone, Email, Website        |
| Tax ID            | Business tax identification  |
| Currency          | Default currency             |
| Tax Rate          | Default tax percentage       |
| Invoice Prefix    | Custom invoice number prefix |
| Payment Terms     | Default due date days        |
| Invoice Footer    | Custom footer text           |
| Email Templates   | Customize email content      |

---

## 10. Use Case Diagrams

### 10.1 System Overview Diagram

```
                              ┌───────────────────────────────────────┐
                              │           MONEY FLOW SYSTEM            │
                              └───────────────────────────────────────┘
                                              │
         ┌──────────────────────────────────────────────────────────────────┐
         │                                                                   │
         ▼                                                                   ▼
┌─────────────────┐                                              ┌─────────────────┐
│                 │                                              │                 │
│      Guest      │                                              │      User       │
│                 │                                              │                 │
└────────┬────────┘                                              └────────┬────────┘
         │                                                                │
         │  ┌─────────────┐                                              │
         ├──│  Register   │                                              │
         │  └─────────────┘                                              │
         │                                                                │
         │  ┌─────────────┐                                              │
         └──│    Login    │                                              │
            └─────────────┘                                              │
                                                                         │
    ┌────────────────────────────────────────────────────────────────────┤
    │                    │                    │                          │
    ▼                    ▼                    ▼                          ▼
┌───────────┐    ┌───────────┐    ┌───────────┐              ┌───────────────┐
│ Invoices  │    │ Customers │    │ Products  │              │   Reports     │
├───────────┤    ├───────────┤    ├───────────┤              ├───────────────┤
│ • Create  │    │ • Add     │    │ • Add     │              │ • Dashboard   │
│ • Edit    │    │ • Edit    │    │ • Edit    │              │ • Sales       │
│ • Delete  │    │ • Delete  │    │ • Delete  │              │ • Revenue     │
│ • Send    │    │ • Search  │    │ • Search  │              │ • Export      │
│ • Payment │    │ • History │    │ • Stock   │              │               │
└───────────┘    └───────────┘    └───────────┘              └───────────────┘
```

### 10.2 Invoice Management Diagram

```
                                    ┌─────────────┐
                                    │    User     │
                                    │ (Staff/Mgr) │
                                    └──────┬──────┘
                                           │
           ┌───────────────────────────────┼───────────────────────────────┐
           │               │               │               │               │
           ▼               ▼               ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Create    │ │    Edit     │ │    Send     │ │   Record    │ │  Download   │
    │   Invoice   │ │   Invoice   │ │   Invoice   │ │   Payment   │ │     PDF     │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────────────┘
           │               │               │               │
           │               │               │               │
           ▼               ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Select    │ │   Validate  │ │   Generate  │ │   Update    │
    │  Customer   │ │   Changes   │ │     PDF     │ │   Balance   │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │               │
           ▼               ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Add Line   │ │   Update    │ │    Send     │ │   Create    │
    │    Items    │ │   Database  │ │    Email    │ │ Transaction │
    └──────┬──────┘ └─────────────┘ └──────┬──────┘ └─────────────┘
           │                               │
           ▼                               ▼
    ┌─────────────┐                 ┌─────────────┐
    │  Calculate  │                 │   Update    │
    │   Totals    │                 │   Status    │
    └─────────────┘                 └─────────────┘
```

---

## Appendix A: Use Case Traceability Matrix

| Use Case | Requirements Covered | Test Cases       |
| -------- | -------------------- | ---------------- |
| UC-01    | FR1.1, NFR-Security  | TC-001 to TC-008 |
| UC-02    | FR1.1, NFR-Security  | TC-009 to TC-015 |
| UC-10    | FR2.1, FR2.2, FR2.3  | TC-020 to TC-035 |
| UC-14    | FR2.4                | TC-040 to TC-048 |
| UC-15    | FR2.6                | TC-050 to TC-060 |
| UC-20    | FR3.1                | TC-070 to TC-078 |
| UC-30    | FR4.1, FR4.2         | TC-090 to TC-100 |
| UC-41    | FR5.3                | TC-110 to TC-118 |
| UC-50    | FR6.5                | TC-130 to TC-140 |

---

## Appendix B: Business Rules Summary

| ID    | Rule                                  | Applies To   |
| ----- | ------------------------------------- | ------------ |
| BR-01 | Password 8+ chars with complexity     | UC-01        |
| BR-02 | Valid email format required           | UC-01, UC-20 |
| BR-03 | Verification link valid 24 hours      | UC-01        |
| BR-04 | Cannot edit PAID invoices             | UC-11        |
| BR-05 | Cannot edit CANCELLED invoices        | UC-11        |
| BR-06 | Editing SENT invoice reverts to DRAFT | UC-11        |
| BR-07 | Stock cannot go negative              | UC-41        |
| BR-08 | Invoice number must be unique         | UC-10        |
| BR-09 | Customer email must be unique         | UC-20        |
| BR-10 | Product SKU must be unique            | UC-30        |

---

**Document Version:** 1.0  
**Last Updated:** November 2025
