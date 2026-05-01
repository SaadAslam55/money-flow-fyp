# Administrator Guide

## Money Flow - Admin Documentation

---

## 1. Overview

This guide covers administrative tasks for managing your Money Flow organization.

---

## 2. User Management

### 2.1 Inviting Users

1. Navigate to **Settings** → **Users**
2. Click **Invite User**
3. Enter user email
4. Select role:
   - **Staff** - Basic access
   - **Manager** - Department access
   - **Admin** - Full access
5. Click **Send Invitation**

### 2.2 User Roles

| Role            | Permissions                               |
| --------------- | ----------------------------------------- |
| **Staff**       | View/create invoices, customers, products |
| **Manager**     | All staff + delete, reports, inventory    |
| **Admin**       | All manager + user management, settings   |
| **Super Admin** | All admin + billing, organization delete  |

### 2.3 Managing Users

**Change Role:**

1. Go to **Settings** → **Users**
2. Click on user
3. Select new role from dropdown
4. Click **Save**

**Deactivate User:**

1. Go to **Settings** → **Users**
2. Click on user
3. Toggle **Active** to off
4. Confirm deactivation

**Remove User:**

1. Go to **Settings** → **Users**
2. Click delete icon
3. Confirm removal

---

## 3. Organization Settings

### 3.1 Business Information

**Settings** → **Organization** → **Profile**

| Field             | Description               |
| ----------------- | ------------------------- |
| Organization Name | Business name on invoices |
| Logo              | Company logo (PNG, JPG)   |
| Address           | Business address          |
| Phone             | Contact number            |
| Email             | Contact email             |
| Website           | Company website           |
| Tax ID            | Business tax number       |

### 3.2 Invoice Settings

**Settings** → **Organization** → **Invoices**

| Setting          | Description             | Default |
| ---------------- | ----------------------- | ------- |
| Invoice Prefix   | Invoice number prefix   | INV     |
| Next Number      | Starting invoice number | 1       |
| Default Due Days | Days until due          | 30      |
| Tax Rate         | Default tax percentage  | 0%      |
| Footer Text      | Invoice footer message  | -       |
| Terms            | Default payment terms   | -       |

### 3.3 Currency & Locale

**Settings** → **Organization** → **Regional**

| Setting       | Options                |
| ------------- | ---------------------- |
| Currency      | USD, EUR, GBP, etc.    |
| Date Format   | MM/DD/YYYY, DD/MM/YYYY |
| Timezone      | User's timezone        |
| Number Format | 1,000.00 or 1.000,00   |

---

## 4. Security Settings

### 4.1 Password Policy

Enforce password requirements:

- Minimum 8 characters
- Require uppercase letter
- Require number
- Require special character

### 4.2 Session Settings

| Setting             | Description           | Default |
| ------------------- | --------------------- | ------- |
| Session Timeout     | Auto-logout time      | 7 days  |
| Concurrent Sessions | Allow multiple logins | Yes     |

### 4.3 Two-Factor Authentication

1. Go to **Settings** → **Security**
2. Enable **Require 2FA for all users**
3. Users will be prompted on next login

### 4.4 API Keys

**Create API Key:**

1. Go to **Settings** → **API Keys**
2. Click **Create Key**
3. Enter name and permissions
4. Copy key (shown once)

**Revoke API Key:**

1. Go to **Settings** → **API Keys**
2. Click delete on the key
3. Confirm revocation

---

## 5. Data Management

### 5.1 Export Data

**Settings** → **Data** → **Export**

Export formats:

- **CSV** - Spreadsheet compatible
- **JSON** - Developer format
- **PDF** - Reports

Data available for export:

- Invoices
- Customers
- Products
- Transactions
- Reports

### 5.2 Import Data

**Settings** → **Data** → **Import**

1. Download template
2. Fill in data
3. Upload CSV file
4. Map columns
5. Review and import

### 5.3 Data Retention

| Data Type     | Retention  |
| ------------- | ---------- |
| Invoices      | Indefinite |
| Transactions  | 7 years    |
| Audit Logs    | 2 years    |
| Deleted Items | 30 days    |

### 5.4 Delete Organization

⚠️ **Warning:** This action cannot be undone.

1. Go to **Settings** → **Organization** → **Danger Zone**
2. Click **Delete Organization**
3. Type organization name to confirm
4. Enter password
5. Click **Permanently Delete**

---

## 6. Audit Logs

### 6.1 Viewing Logs

**Settings** → **Audit Log**

Filter by:

- User
- Action type
- Date range
- Resource

### 6.2 Logged Actions

| Action             | Description          |
| ------------------ | -------------------- |
| `user.login`       | User logged in       |
| `user.logout`      | User logged out      |
| `invoice.created`  | Invoice created      |
| `invoice.updated`  | Invoice modified     |
| `invoice.deleted`  | Invoice removed      |
| `customer.created` | Customer added       |
| `settings.updated` | Settings changed     |
| `user.invited`     | User invitation sent |

### 6.3 Export Audit Logs

1. Go to **Audit Log**
2. Apply filters
3. Click **Export**
4. Select format (CSV/JSON)

---

## 7. Notifications

### 7.1 Email Notifications

Configure in **Settings** → **Notifications** → **Email**

| Notification     | Description             | Default |
| ---------------- | ----------------------- | ------- |
| Invoice Sent     | When invoice is sent    | On      |
| Payment Received | When payment recorded   | On      |
| Invoice Overdue  | Overdue reminders       | On      |
| Low Stock        | Stock below threshold   | On      |
| New User         | User joins organization | On      |

### 7.2 In-App Notifications

Configure notification preferences for dashboard alerts.

---

## 8. Integrations

### 8.1 Available Integrations

| Integration  | Status    | Description     |
| ------------ | --------- | --------------- |
| Email (SMTP) | ✅ Active | Send invoices   |
| Stripe       | 🔜 Coming | Accept payments |
| QuickBooks   | 🔜 Coming | Accounting sync |
| Zapier       | 🔜 Coming | Automation      |

### 8.2 Webhook Configuration

1. Go to **Settings** → **Integrations** → **Webhooks**
2. Click **Add Webhook**
3. Enter endpoint URL
4. Select events
5. Save and test

---

## 9. Troubleshooting

### 9.1 Common Issues

**User can't log in:**

- Check if user is active
- Reset password
- Check email verification

**Invoices not sending:**

- Check email configuration
- Verify customer email
- Check spam folder

**Reports showing wrong data:**

- Check date range
- Verify filters
- Clear cache

### 9.2 Support

- **Documentation:** docs.moneyflow.app
- **Email:** support@moneyflow.app
- **Status:** status.moneyflow.app

---

## 10. Best Practices

### 10.1 Security

- ✅ Enable 2FA for admins
- ✅ Review audit logs weekly
- ✅ Rotate API keys regularly
- ✅ Use strong passwords
- ✅ Limit admin access

### 10.2 Data Management

- ✅ Regular backups
- ✅ Export data monthly
- ✅ Archive old invoices
- ✅ Clean up test data

### 10.3 User Management

- ✅ Use least privilege principle
- ✅ Remove inactive users
- ✅ Document role assignments
- ✅ Regular access reviews

---

**Document Version:** 1.0  
**Last Updated:** November 2024
