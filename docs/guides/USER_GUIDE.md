# Money Flow - Complete User Guide

> Comprehensive guide for accessing and using Money Flow as Super Admin, Admin, and Regular Users

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [User Roles & Access](#user-roles--access)
3. [Creating Your First Account](#creating-your-first-account)
4. [Super Admin Access](#super-admin-access)
5. [Admin Access](#admin-access)
6. [Regular User Access](#regular-user-access)
7. [Feature Usage Guide](#feature-usage-guide)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Email address for account creation
- (Optional) Supabase account for self-hosting

### Initial Setup

1. **Access the Application**
   - Open your browser and navigate to: `http://localhost:5173` (development) or your production URL
   - You'll see the login page

2. **First Time Setup**
   - If this is a fresh installation, you'll need to create the first admin account
   - See [Creating Your First Account](#creating-your-first-account) below

---

## 👥 User Roles & Access

Money Flow supports multiple user roles with different permission levels:

| Role | Level | Description | Use Case |
|------|-------|-------------|----------|
| **Super Admin** | 100 | Platform owner with full system access | Platform administrators |
| **Admin** | 90 | Business owner with full business access | Business owners, founders |
| **Manager** | 70 | Operations manager with supervisory access | Store managers, operations leads |
| **Accountant** | 60 | Financial management and bookkeeping | Bookkeepers, accountants |
| **Cashier** | 40 | Point of sale and basic transactions | Sales staff, cashiers |
| **Customer** | 10 | Customer portal access only | Business clients |

### Permission Matrix

| Feature | Super Admin | Admin | Manager | Accountant | Cashier | Customer |
|---------|------------|-------|---------|------------|---------|----------|
| **System Administration** |
| View all businesses | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage subscriptions | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Business Management** |
| Business settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage team members | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add/remove users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Financial Operations** |
| Create invoices | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit invoices | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete invoices | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View reports | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage accounts | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Inventory Management** |
| View products | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Add/edit products | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Adjust stock | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Customer Management** |
| View all customers | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add customers | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit customers | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete customers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🆕 Creating Your First Account

### Method 1: Sign Up (Recommended for New Businesses)

1. **Navigate to Sign Up Page**
   - Go to `/auth/signup` or click "Sign Up" on the login page

2. **Fill in Business Information**
   ```
   Email: your-email@example.com
   Password: (strong password, min 8 characters)
   Business Name: Your Business Name
   ```

3. **Complete Registration**
   - Click "Create Account"
   - Verify your email (check your inbox)
   - You'll be automatically assigned the **Admin** role for your organization

4. **First Login**
   - Log in with your credentials
   - You'll be redirected to the dashboard
   - Complete your profile setup

### Method 2: Database Seed (For Development)

If you're setting up a development environment, you can use the seed script:

```bash
# Run database migrations and seed data
supabase db reset

# Or manually run seed
supabase db seed
```

This will create:
- A test super admin user
- Sample organizations
- Test users with different roles

**Default Test Credentials** (if using seed):
```
Super Admin:
Email: superadmin@moneyflow.app
Password: (check seed.sql file)

Admin:
Email: admin@example.com
Password: (check seed.sql file)
```

---

## 👑 Super Admin Access

### What is Super Admin?

Super Admin is the highest privilege level in Money Flow. Super Admins can:
- Access **all businesses** on the platform
- Manage platform-wide settings
- View platform analytics
- Suspend or activate businesses
- Manage all subscriptions
- Access the Admin Panel (`/admin`)

### How to Get Super Admin Access

#### Option 1: Database Direct Assignment (Recommended for Setup)

1. **Access Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor"

2. **Run SQL Query**
   ```sql
   -- First, create or find the auth user
   -- If user doesn't exist, create them via Supabase Auth dashboard first
   
   -- Then update the user role to super_admin
   UPDATE users
   SET role = 'super_admin'
   WHERE email = 'your-email@example.com';
   
   -- Verify the change
   SELECT id, email, role, organization_id
   FROM users
   WHERE email = 'your-email@example.com';
   ```

3. **Alternative: Create Super Admin via SQL**
   ```sql
   -- Insert super admin user (assuming auth user exists)
   INSERT INTO users (
     auth_user_id,
     email,
     full_name,
     role,
     is_active,
     organization_id
   )
   VALUES (
     'auth-user-uuid-here',  -- Get from auth.users table
     'superadmin@moneyflow.app',
     'Super Administrator',
     'super_admin',
     true,
     NULL  -- Super admins don't belong to a specific organization
   );
   ```

#### Option 2: Using Supabase Auth Admin API

```typescript
// In a Supabase Edge Function or admin script
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
);

// Create auth user
const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email: 'superadmin@moneyflow.app',
  password: 'secure-password-here',
  email_confirm: true,
});

// Create user profile with super_admin role
const { data: user, error: userError } = await supabaseAdmin
  .from('users')
  .insert({
    auth_user_id: authUser.user.id,
    email: 'superadmin@moneyflow.app',
    full_name: 'Super Administrator',
    role: 'super_admin',
    is_active: true,
    organization_id: null, // Super admins don't belong to organizations
  })
  .select()
  .single();
```

#### Option 3: Using Seed Script

Edit `supabase/seed/seed.sql`:

```sql
-- Create super admin user
INSERT INTO users (
  auth_user_id,
  email,
  full_name,
  role,
  is_active
)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual auth user ID
  'superadmin@moneyflow.app',
  'Super Administrator',
  'super_admin',
  true
);
```

Then run:
```bash
supabase db reset
```

### Accessing Admin Panel

Once you have Super Admin access:

1. **Log in** with your super admin credentials
2. **Navigate to Admin Panel**
   - Click on your profile menu (top right)
   - Select "Admin Panel" or go directly to `/admin`
3. **Available Features**
   - View all organizations
   - Manage subscriptions
   - System settings
   - Platform analytics
   - User management across all businesses

### Super Admin Capabilities

- ✅ View all businesses on the platform
- ✅ Manage subscription plans for any business
- ✅ Configure system-wide settings
- ✅ View platform analytics and metrics
- ✅ Suspend or activate businesses
- ✅ Access all audit logs
- ✅ Manage feature flags
- ✅ View system health metrics
- ✅ Impersonate users (for support)

---

## 🛡️ Admin Access

### What is Admin?

Admin is the business owner role with full access to their organization. Admins can:
- Manage all aspects of their business
- Add and remove team members
- Configure business settings
- Manage subscription and billing
- Access all reports and data

### How to Get Admin Access

#### Method 1: Sign Up (Automatic)

When you sign up for a new business account:
1. Go to `/auth/signup`
2. Fill in your business information
3. Complete registration
4. **You'll automatically be assigned the Admin role** for your organization

#### Method 2: Promoted by Existing Admin

If you're invited to an existing organization:

1. **Receive Invitation**
   - Admin sends you an invitation email
   - Click the invitation link

2. **Create Account**
   - Set your password
   - Complete profile

3. **Role Assignment**
   - Admin assigns you a role
   - If assigned "Admin", you'll have admin access

#### Method 3: Database Update (For Existing Users)

```sql
-- Update existing user to admin role
UPDATE users
SET role = 'admin'
WHERE email = 'user@example.com'
AND organization_id = 'organization-uuid-here';
```

### Admin Capabilities

- ✅ Full business management
- ✅ Add and remove team members
- ✅ Configure business settings
- ✅ Manage subscription and billing
- ✅ Access all reports
- ✅ Customize invoice templates
- ✅ Manage chart of accounts
- ✅ View audit logs
- ✅ Export data

### Admin Features

1. **Team Management** (`/settings/team`)
   - Add new team members
   - Assign roles
   - Remove users
   - View team activity

2. **Business Settings** (`/settings`)
   - Update business profile
   - Configure tax settings
   - Set up payment methods
   - Manage integrations

3. **Subscription Management** (`/subscription`)
   - View current plan
   - Upgrade/downgrade plans
   - View billing history
   - Manage payment methods

---

## 👤 Regular User Access

### Available Roles

Regular users can have one of these roles:
- **Manager** - Operations management
- **Accountant** - Financial management
- **Cashier** - Sales and transactions
- **Customer** - Portal access only

### How to Get Regular User Access

#### Method 1: Invited by Admin

1. **Receive Invitation**
   - Admin sends invitation to your email
   - Click the invitation link

2. **Set Password**
   - Create a secure password
   - Complete your profile

3. **Access Granted**
   - You'll be assigned a role by the admin
   - Log in and start using the system

#### Method 2: Created by Admin

Admin can create users directly:

1. **Admin goes to** `/settings/team`
2. **Clicks "Add Team Member"**
3. **Fills in user details:**
   - Email
   - Full name
   - Role (Manager, Accountant, Cashier)
   - Permissions
4. **User receives invitation email**
5. **User sets password and logs in**

#### Method 3: Self-Registration (Customer Portal)

For customer portal access:

1. **Go to** `/auth/signup`
2. **Select "Customer Portal"** option
3. **Fill in information**
4. **Admin approves** (if required)
5. **Access granted**

### Role-Specific Access

#### Manager Role

**Access Level:** Operations management

**Can Do:**
- Process invoices and transactions
- Manage inventory and stock
- View operational reports
- Approve large transactions
- Handle customer inquiries
- View audit logs

**Cannot Do:**
- Change business settings
- Add or remove users
- Delete historical data
- Modify chart of accounts

**Access Routes:**
- Dashboard: `/dashboard`
- Invoices: `/invoices`
- Products: `/products`
- Customers: `/customers`
- Transactions: `/transactions`
- Reports: `/reports` (limited)

#### Accountant Role

**Access Level:** Financial management

**Can Do:**
- Create and manage invoices
- Record all transactions
- Reconcile bank accounts
- Generate financial reports
- Prepare tax documents
- Manage expense categories
- View all customers

**Cannot Do:**
- Manage inventory
- Delete transactions (only void)
- Access team management
- Change business settings

**Access Routes:**
- Dashboard: `/dashboard`
- Invoices: `/invoices` (full access)
- Transactions: `/transactions` (full access)
- Reports: `/reports` (financial reports)
- Customers: `/customers` (view all)

#### Cashier Role

**Access Level:** Point of sale

**Can Do:**
- Process sales quickly
- Create invoices
- Record payments
- Print receipts
- View assigned customer data
- Add new customers

**Cannot Do:**
- Access reports
- See profit margins
- Modify prices (unless permitted)
- View other cashiers' sales
- Delete invoices
- Manage inventory

**Access Routes:**
- Dashboard: `/dashboard` (limited)
- Invoices: `/invoices` (create only)
- Customers: `/customers` (view assigned, add new)

#### Customer Role

**Access Level:** Portal access only

**Can Do:**
- View own invoices
- Download receipts
- Make online payments
- Update contact information
- View payment history

**Cannot Do:**
- Access business data
- View other customers
- Create invoices
- Access admin features

**Access Routes:**
- Customer Portal: `/portal`
- Own Invoices: `/portal/invoices`
- Payments: `/portal/payments`

---

## 📚 Feature Usage Guide

### Dashboard

**Access:** `/dashboard`

**Available to:** All internal roles

**Features:**
- Revenue overview
- Recent invoices
- Pending payments
- Low stock alerts
- Quick actions
- Activity feed

**Usage:**
1. Log in to your account
2. Dashboard loads automatically
3. View key metrics at a glance
4. Click on widgets for detailed views

### Invoice Management

**Access:** `/invoices`

**Available to:** Admin, Manager, Accountant, Cashier

**Creating an Invoice:**
1. Click "New Invoice" button
2. Select customer
3. Add line items (products/services)
4. Set payment terms
5. Add notes (optional)
6. Click "Create Invoice"
7. Send to customer (optional)

**Editing an Invoice:**
- Only Admin, Manager, and Accountant can edit
- Click on invoice → "Edit"
- Make changes
- Save updates

**Deleting an Invoice:**
- Only Admin and Manager can delete
- Click on invoice → "Delete"
- Confirm deletion

### Customer Management

**Access:** `/customers`

**Available to:** Admin, Manager, Accountant, Cashier (limited)

**Adding a Customer:**
1. Click "Add Customer"
2. Fill in customer details:
   - Name
   - Email
   - Phone
   - Address
   - Tax ID (optional)
3. Save customer

**Viewing Customers:**
- Admin, Manager, Accountant: View all customers
- Cashier: View assigned customers only

### Product/Inventory Management

**Access:** `/products`

**Available to:** Admin, Manager, Accountant (view), Cashier (view)

**Adding a Product:**
1. Click "Add Product"
2. Fill in details:
   - Name
   - SKU
   - Price
   - Description
   - Stock quantity (if tracking)
3. Save product

**Managing Stock:**
- Admin and Manager can adjust stock
- View stock movements
- Set low stock alerts

### Reports

**Access:** `/reports`

**Available to:** Admin, Manager, Accountant

**Available Reports:**
- Profit & Loss Statement
- Balance Sheet
- Cash Flow Statement
- Sales Report
- Expense Report
- Customer Report
- Product Report

**Generating a Report:**
1. Select report type
2. Choose date range
3. Apply filters (optional)
4. Click "Generate Report"
5. Export as PDF/Excel (if permitted)

### Settings

**Access:** `/settings`

**Available to:** Admin only (most settings)

**Settings Sections:**
- Business Profile
- Team Management
- Tax Settings
- Payment Methods
- Email Settings
- Notifications
- Invoice Settings
- Bank Accounts
- Integrations
- Security

### Admin Panel (Super Admin Only)

**Access:** `/admin`

**Available to:** Super Admin only

**Features:**
- View all organizations
- Manage subscriptions
- System settings
- Platform analytics
- User management
- Audit logs

---

## 🔧 Troubleshooting

### Can't Log In

**Problem:** Unable to log in with credentials

**Solutions:**
1. Check email and password are correct
2. Verify email is confirmed (check inbox)
3. Check if account is active (contact admin)
4. Try password reset: `/auth/forgot-password`

### No Access to Features

**Problem:** Can't see certain features or pages

**Solutions:**
1. Check your role permissions
2. Contact admin to verify role assignment
3. Ensure you're in the correct organization
4. Clear browser cache and cookies
5. Log out and log back in

### Permission Denied Errors

**Problem:** Getting "Access Denied" or 403 errors

**Solutions:**
1. Verify your role has the required permission
2. Contact admin to upgrade your role
3. Check if feature requires subscription upgrade
4. Ensure you're accessing the correct organization

### Super Admin Not Working

**Problem:** Can't access admin panel or super admin features

**Solutions:**
1. Verify role in database:
   ```sql
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```
2. Ensure role is exactly `'super_admin'` (case-sensitive)
3. Check RLS policies allow super admin access
4. Clear browser cache and cookies
5. Log out and log back in

### User Not Appearing

**Problem:** Created user but can't see them in team list

**Solutions:**
1. Verify user was created in correct organization
2. Check user's `is_active` status
3. Ensure you have permission to view users
4. Refresh the page
5. Check browser console for errors

---

## 📞 Support

### Getting Help

- **Email:** support@moneyflow.app
- **Documentation:** [docs.moneyflow.app](https://docs.moneyflow.app)
- **Community:** [community.moneyflow.app](https://community.moneyflow.app)

### Reporting Issues

If you encounter bugs or issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing issues
3. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Your role and permissions
   - Browser and OS information

---

## 🔐 Security Best Practices

1. **Use Strong Passwords**
   - Minimum 8 characters
   - Mix of letters, numbers, and symbols
   - Don't reuse passwords

2. **Enable Two-Factor Authentication** (if available)
   - Go to Settings → Security
   - Enable 2FA
   - Use authenticator app

3. **Regular Access Reviews**
   - Admins should review team access regularly
   - Remove inactive users
   - Update roles as needed

4. **Log Out When Done**
   - Especially on shared computers
   - Clear browser cache if needed

---

## 📖 Additional Resources

- [API Documentation](docs/api-reference.md)
- [Database Schema](docs/database-schema.md)
- [Deployment Guide](docs/deployment.md)
- [Developer Guide](docs/developer-guide.md)

---

**Last Updated:** December 2024  
**Version:** 1.0.0

