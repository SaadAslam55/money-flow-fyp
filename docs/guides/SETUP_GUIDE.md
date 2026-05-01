# Money Flow - Setup & Initial Configuration Guide

> Step-by-step guide for setting up Money Flow and creating your first users

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Creating Super Admin](#creating-super-admin)
3. [Creating Admin Users](#creating-admin-users)
4. [Creating Regular Users](#creating-regular-users)
5. [Database Seeding](#database-seeding)
6. [Verification](#verification)

---

## 🚀 Initial Setup

### Prerequisites

- Node.js 18+ installed
- Supabase account (or local Supabase instance)
- Git installed
- Terminal/Command Prompt access

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/moneyflow.git
cd moneyflow

# Install dependencies
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_MIXPANEL_TOKEN=your-mixpanel-token

# Optional: Payments
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Step 3: Database Setup

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or reset database (includes seed data)
supabase db reset
```

---

## 👑 Creating Super Admin

### Method 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Select your project
   - Navigate to "SQL Editor"

2. **Create Auth User First**
   ```sql
   -- Note: You need to create the auth user via Supabase Auth dashboard first
   -- Go to Authentication → Users → Add User
   -- Or use the Admin API (see Method 2)
   ```

3. **Create Super Admin User**
   ```sql
   -- Get the auth user ID from auth.users table
   -- Then insert into users table
   INSERT INTO users (
     auth_user_id,
     email,
     full_name,
     role,
     is_active,
     organization_id
   )
   VALUES (
     'YOUR_AUTH_USER_ID_HERE',  -- Replace with actual UUID from auth.users
     'superadmin@moneyflow.app',
     'Super Administrator',
     'super_admin',
     true,
     NULL  -- Super admins don't belong to organizations
   );
   ```

4. **Verify Creation**
   ```sql
   SELECT 
     id,
     email,
     full_name,
     role,
     is_active,
     created_at
   FROM users
   WHERE role = 'super_admin';
   ```

### Method 2: Using Supabase Admin API

Create a script `scripts/create-super-admin.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Get from Supabase dashboard

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createSuperAdmin() {
  const email = 'superadmin@moneyflow.app';
  const password = 'ChangeThisPassword123!';
  const fullName = 'Super Administrator';

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // 2. Create user profile with super_admin role
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email,
        full_name: fullName,
        role: 'super_admin',
        is_active: true,
        organization_id: null,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user profile:', userError);
      return;
    }

    console.log('✅ Super admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', userData.id);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createSuperAdmin();
```

Run the script:

```bash
# Set environment variables
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run script
npx tsx scripts/create-super-admin.ts
```

### Method 3: Using Seed File

Edit `supabase/seed/seed.sql`:

```sql
-- Create super admin
-- First, ensure auth user exists (create via Supabase Auth dashboard)
-- Then update this with the actual auth_user_id

INSERT INTO users (
  auth_user_id,
  email,
  full_name,
  role,
  is_active,
  organization_id
)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual auth user ID
  'superadmin@moneyflow.app',
  'Super Administrator',
  'super_admin',
  true,
  NULL
)
ON CONFLICT (email) DO UPDATE
SET role = 'super_admin',
    is_active = true;
```

Then run:

```bash
supabase db reset
```

---

## 🛡️ Creating Admin Users

### Method 1: Sign Up (Automatic Admin)

When a new business signs up:

1. **User goes to** `/auth/signup`
2. **Fills in:**
   - Email
   - Password
   - Business Name
3. **System automatically:**
   - Creates organization
   - Creates user with `admin` role
   - Links user to organization

### Method 2: Database Update

```sql
-- Update existing user to admin
UPDATE users
SET role = 'admin'
WHERE email = 'user@example.com'
AND organization_id = 'organization-uuid-here';
```

### Method 3: Via Super Admin Panel

1. **Super Admin logs in**
2. **Goes to** `/admin`
3. **Selects organization**
4. **Creates admin user:**
   - Email
   - Full name
   - Role: Admin
   - Sends invitation

---

## 👤 Creating Regular Users

### Method 1: Admin Creates User

1. **Admin logs in**
2. **Goes to** `/settings/team`
3. **Clicks "Add Team Member"**
4. **Fills in:**
   - Email
   - Full name
   - Role (Manager, Accountant, Cashier)
5. **Sends invitation**
6. **User receives email**
7. **User sets password and logs in**

### Method 2: Database Insert

```sql
-- Create regular user
-- First create auth user via Supabase Auth dashboard
-- Then insert user profile

INSERT INTO users (
  auth_user_id,
  organization_id,
  email,
  full_name,
  role,
  is_active
)
VALUES (
  'auth-user-uuid-here',
  'organization-uuid-here',
  'user@example.com',
  'User Full Name',
  'manager',  -- or 'accountant', 'cashier'
  true
);
```

### Method 3: Bulk Import (SQL)

```sql
-- Create multiple users at once
INSERT INTO users (
  auth_user_id,
  organization_id,
  email,
  full_name,
  role,
  is_active
)
VALUES
  ('auth-uuid-1', 'org-uuid', 'manager@example.com', 'Manager Name', 'manager', true),
  ('auth-uuid-2', 'org-uuid', 'accountant@example.com', 'Accountant Name', 'accountant', true),
  ('auth-uuid-3', 'org-uuid', 'cashier@example.com', 'Cashier Name', 'cashier', true);
```

---

## 🌱 Database Seeding

### Complete Seed Script

Create `supabase/seed/seed.sql`:

```sql
-- ============================================
-- MONEY FLOW SEED DATA
-- ============================================

-- Note: Auth users must be created via Supabase Auth dashboard first
-- Then update the auth_user_id values below

-- ============================================
-- SUPER ADMIN
-- ============================================
INSERT INTO users (
  auth_user_id,
  email,
  full_name,
  role,
  is_active,
  organization_id
)
VALUES (
  'REPLACE_WITH_AUTH_USER_ID',
  'superadmin@moneyflow.app',
  'Super Administrator',
  'super_admin',
  true,
  NULL
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SAMPLE ORGANIZATION
-- ============================================
INSERT INTO organizations (
  id,
  name,
  email,
  phone,
  subscription_plan,
  subscription_status
)
VALUES (
  gen_random_uuid(),
  'Acme Corporation',
  'contact@acme.com',
  '+1234567890',
  'pro',
  'active'
)
ON CONFLICT DO NOTHING
RETURNING id;

-- ============================================
-- SAMPLE ADMIN USER
-- ============================================
-- Get organization ID first, then:
INSERT INTO users (
  auth_user_id,
  organization_id,
  email,
  full_name,
  role,
  is_active
)
SELECT 
  'REPLACE_WITH_AUTH_USER_ID',
  o.id,
  'admin@acme.com',
  'Admin User',
  'admin',
  true
FROM organizations o
WHERE o.name = 'Acme Corporation'
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SAMPLE MANAGER USER
-- ============================================
INSERT INTO users (
  auth_user_id,
  organization_id,
  email,
  full_name,
  role,
  is_active
)
SELECT 
  'REPLACE_WITH_AUTH_USER_ID',
  o.id,
  'manager@acme.com',
  'Manager User',
  'manager',
  true
FROM organizations o
WHERE o.name = 'Acme Corporation'
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SAMPLE ACCOUNTANT USER
-- ============================================
INSERT INTO users (
  auth_user_id,
  organization_id,
  email,
  full_name,
  role,
  is_active
)
SELECT 
  'REPLACE_WITH_AUTH_USER_ID',
  o.id,
  'accountant@acme.com',
  'Accountant User',
  'accountant',
  true
FROM organizations o
WHERE o.name = 'Acme Corporation'
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SAMPLE CASHIER USER
-- ============================================
INSERT INTO users (
  auth_user_id,
  organization_id,
  email,
  full_name,
  role,
  is_active
)
SELECT 
  'REPLACE_WITH_AUTH_USER_ID',
  o.id,
  'cashier@acme.com',
  'Cashier User',
  'cashier',
  true
FROM organizations o
WHERE o.name = 'Acme Corporation'
ON CONFLICT (email) DO NOTHING;
```

### Running Seed Script

```bash
# Reset database and run seed
supabase db reset

# Or run seed only
supabase db seed
```

---

## ✅ Verification

### Verify Super Admin

1. **Check Database:**
   ```sql
   SELECT 
     u.id,
     u.email,
     u.full_name,
     u.role,
     u.is_active,
     u.organization_id
   FROM users u
   WHERE u.role = 'super_admin';
   ```

2. **Test Login:**
   - Go to `/auth/login`
   - Enter super admin email and password
   - Should redirect to dashboard
   - Check for "Admin Panel" link in navigation

3. **Test Admin Panel Access:**
   - Navigate to `/admin`
   - Should see all organizations
   - Should have access to system settings

### Verify Admin User

1. **Check Database:**
   ```sql
   SELECT 
     u.id,
     u.email,
     u.role,
     u.organization_id,
     o.name as organization_name
   FROM users u
   JOIN organizations o ON u.organization_id = o.id
   WHERE u.role = 'admin';
   ```

2. **Test Login:**
   - Log in with admin credentials
   - Should see dashboard
   - Should have access to Settings
   - Should be able to manage team

### Verify Regular Users

1. **Check Database:**
   ```sql
   SELECT 
     u.email,
     u.role,
     u.is_active,
     o.name as organization_name
   FROM users u
   JOIN organizations o ON u.organization_id = o.id
   WHERE u.role IN ('manager', 'accountant', 'cashier')
   ORDER BY u.role, u.email;
   ```

2. **Test Permissions:**
   - Log in with each role
   - Verify access matches role permissions
   - Check that restricted features are hidden

---

## 🔐 Security Checklist

After setup, ensure:

- [ ] All default passwords are changed
- [ ] Super admin account is secured
- [ ] RLS policies are enabled
- [ ] Service role key is kept secret
- [ ] Environment variables are secure
- [ ] Email verification is enabled
- [ ] Audit logging is active

---

## 📝 Quick Reference

### Default Test Credentials (After Seed)

```
Super Admin:
Email: superadmin@moneyflow.app
Password: (set via Supabase Auth or seed script)

Admin:
Email: admin@acme.com
Password: (set via Supabase Auth or seed script)

Manager:
Email: manager@acme.com
Password: (set via Supabase Auth or seed script)

Accountant:
Email: accountant@acme.com
Password: (set via Supabase Auth or seed script)

Cashier:
Email: cashier@acme.com
Password: (set via Supabase Auth or seed script)
```

### Important SQL Queries

```sql
-- List all users with roles
SELECT email, role, is_active, organization_id
FROM users
ORDER BY role, email;

-- Find user by email
SELECT * FROM users WHERE email = 'user@example.com';

-- Update user role
UPDATE users
SET role = 'admin'
WHERE email = 'user@example.com';

-- Deactivate user
UPDATE users
SET is_active = false
WHERE email = 'user@example.com';

-- List all organizations
SELECT id, name, email, subscription_plan, subscription_status
FROM organizations;
```

---

## 🆘 Troubleshooting

### User Can't Log In

1. Check auth user exists:
   ```sql
   SELECT * FROM auth.users WHERE email = 'user@example.com';
   ```

2. Check user profile exists:
   ```sql
   SELECT * FROM users WHERE email = 'user@example.com';
   ```

3. Verify email is confirmed:
   ```sql
   SELECT email, email_confirmed_at 
   FROM auth.users 
   WHERE email = 'user@example.com';
   ```

### Role Not Working

1. Verify role in database:
   ```sql
   SELECT email, role FROM users WHERE email = 'user@example.com';
   ```

2. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

3. Clear browser cache and cookies
4. Log out and log back in

### Super Admin Can't Access Admin Panel

1. Verify role is exactly `'super_admin'`:
   ```sql
   SELECT role FROM users WHERE email = 'superadmin@moneyflow.app';
   ```

2. Check organization_id is NULL:
   ```sql
   SELECT organization_id FROM users WHERE role = 'super_admin';
   ```

3. Verify RLS policies allow super admin access

---

**Last Updated:** December 2024  
**Version:** 1.0.0

