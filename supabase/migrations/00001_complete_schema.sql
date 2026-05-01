-- ============================================
-- MONEY FLOW - COMPLETE DATABASE SCHEMA
-- Migration: 00001_complete_schema.sql
-- Description: Complete database schema with all tables, RLS, functions
-- Author: MoneyFlow Development Team
-- Version: 1.0.0
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CUSTOM TYPES (ENUMS)
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin', 
  'manager',
  'accountant',
  'cashier',
  'viewer'
);

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM (
  'free',
  'pro', 
  'enterprise'
);

-- Subscription status
CREATE TYPE subscription_status AS ENUM (
  'active',
  'past_due',
  'cancelled',
  'suspended',
  'trialing'
);

-- Invoice status
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'partially_paid',
  'overdue',
  'cancelled'
);

-- Transaction type
CREATE TYPE transaction_type AS ENUM (
  'income',
  'expense',
  'transfer'
);

-- Bank account type
CREATE TYPE bank_account_type AS ENUM (
  'checking',
  'savings',
  'credit_card',
  'cash'
);

-- Payment method
CREATE TYPE payment_method AS ENUM (
  'cash',
  'bank_transfer',
  'card',
  'check',
  'upi',
  'jazzcash',
  'easypaisa',
  'raast',
  'other'
);

-- Payment provider
CREATE TYPE payment_provider AS ENUM (
  'jazzcash',
  'easypaisa',
  'raast'
);

-- Payment transaction status
CREATE TYPE payment_transaction_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
  'expired'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Pakistan',
  logo_url TEXT,
  tax_id VARCHAR(100),
  fiscal_year_start VARCHAR(5) DEFAULT '01-01',
  currency VARCHAR(3) DEFAULT 'PKR',
  timezone VARCHAR(50) DEFAULT 'Asia/Karachi',
  subscription_plan subscription_plan DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  payment_provider payment_provider,
  payment_customer_id VARCHAR(255),
  payment_subscription_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role user_role DEFAULT 'viewer',
  avatar_url TEXT,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  tax_id VARCHAR(100),
  credit_limit DECIMAL(15,2) DEFAULT 0,
  outstanding_balance DECIMAL(15,2) DEFAULT 0,
  portal_access BOOLEAN DEFAULT false,
  portal_password_hash TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_organization_id ON customers(organization_id);
CREATE INDEX idx_customers_email ON customers(email);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  category VARCHAR(100),
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(15,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  is_service BOOLEAN DEFAULT false,
  track_inventory BOOLEAN DEFAULT true,
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_organization_id ON products(organization_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE UNIQUE INDEX idx_products_org_sku ON products(organization_id, sku) WHERE sku IS NOT NULL;

-- Bank accounts table
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255),
  account_number VARCHAR(100),
  account_type bank_account_type DEFAULT 'checking',
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PKR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bank_accounts_organization_id ON bank_accounts(organization_id);

-- Expense categories table
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  icon VARCHAR(50) DEFAULT 'folder',
  parent_category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expense_categories_organization_id ON expense_categories(organization_id);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status invoice_status DEFAULT 'draft',
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  amount_due DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  terms TEXT,
  footer TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE UNIQUE INDEX idx_invoices_org_number ON invoices(organization_id, invoice_number);

-- Invoice items table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(15,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  reference_type VARCHAR(50),
  reference_id UUID,
  payment_method payment_method,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  receipt_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_organization_id ON transactions(organization_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Stock movements table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  movement_type VARCHAR(50) NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Invoice settings table
CREATE TABLE invoice_settings (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_prefix VARCHAR(20) DEFAULT 'INV-',
  invoice_starting_number INTEGER DEFAULT 1,
  default_terms TEXT,
  default_notes TEXT,
  default_tax_rate DECIMAL(5,2) DEFAULT 0,
  payment_terms_days INTEGER DEFAULT 30,
  late_fee_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT INTEGRATION TABLES
-- ============================================

-- Payment integrations (per organization)
CREATE TABLE payment_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  merchant_id VARCHAR(255),
  integrity_salt_encrypted TEXT,
  store_id VARCHAR(255),
  hash_key_encrypted TEXT,
  raast_id VARCHAR(255),
  iban VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  currency VARCHAR(3) DEFAULT 'PKR',
  test_mode BOOLEAN DEFAULT true,
  transaction_fee_percentage DECIMAL(5,2) DEFAULT 0,
  transaction_fee_fixed DECIMAL(10,2) DEFAULT 0,
  webhook_url TEXT,
  webhook_secret_encrypted TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_integrations_organization_id ON payment_integrations(organization_id);

-- Payment transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payment_integration_id UUID REFERENCES payment_integrations(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  transaction_reference VARCHAR(255) NOT NULL UNIQUE,
  provider_transaction_id VARCHAR(255),
  provider_order_id VARCHAR(255),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PKR',
  status payment_transaction_status DEFAULT 'pending',
  payment_method payment_provider NOT NULL,
  fee_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(15,2) DEFAULT 0,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_name VARCHAR(255),
  payment_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  failure_reason TEXT,
  failure_code VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  return_url TEXT,
  cancel_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_organization_id ON payment_transactions(organization_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- ============================================
-- RBAC TABLES
-- ============================================

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions mapping
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- User custom permissions
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN DEFAULT true,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(user_id, permission_id)
);

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER - bypass RLS)
-- ============================================

-- Get current user's organization ID
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID AS $$
  SELECT organization_id 
  FROM public.users 
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role::text 
  FROM public.users 
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's ID
CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS UUID AS $$
  SELECT id 
  FROM public.users 
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_user_id() TO authenticated;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- USERS POLICIES
CREATE POLICY "users_select_own" ON users FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "users_select_org" ON users FOR SELECT
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "users_super_admin" ON users FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "users_insert" ON users FOR INSERT
  WITH CHECK (
    organization_id = public.get_my_org_id() 
    AND public.get_my_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "users_update" ON users FOR UPDATE
  USING (
    (auth_user_id = auth.uid()) OR
    (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'))
  );

CREATE POLICY "users_delete" ON users FOR DELETE
  USING (
    organization_id = public.get_my_org_id() 
    AND public.get_my_role() IN ('admin', 'super_admin')
    AND auth_user_id != auth.uid()
  );

-- ORGANIZATIONS POLICIES
CREATE POLICY "orgs_select" ON organizations FOR SELECT
  USING (id = public.get_my_org_id() OR public.is_super_admin());

CREATE POLICY "orgs_update" ON organizations FOR UPDATE
  USING (id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "orgs_insert" ON organizations FOR INSERT
  WITH CHECK (public.is_super_admin());

CREATE POLICY "orgs_delete" ON organizations FOR DELETE
  USING (public.is_super_admin());

-- CUSTOMERS POLICIES
CREATE POLICY "customers_select" ON customers FOR SELECT
  USING (organization_id = public.get_my_org_id() OR public.is_super_admin());

CREATE POLICY "customers_insert" ON customers FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "customers_update" ON customers FOR UPDATE
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "customers_delete" ON customers FOR DELETE
  USING (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'manager', 'super_admin'));

-- PRODUCTS POLICIES
CREATE POLICY "products_select" ON products FOR SELECT
  USING (organization_id = public.get_my_org_id() OR public.is_super_admin());

CREATE POLICY "products_insert" ON products FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "products_update" ON products FOR UPDATE
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "products_delete" ON products FOR DELETE
  USING (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

-- BANK ACCOUNTS POLICIES
CREATE POLICY "bank_accounts_select" ON bank_accounts FOR SELECT
  USING (organization_id = public.get_my_org_id() OR public.is_super_admin());

CREATE POLICY "bank_accounts_insert" ON bank_accounts FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "bank_accounts_update" ON bank_accounts FOR UPDATE
  USING (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "bank_accounts_delete" ON bank_accounts FOR DELETE
  USING (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

-- EXPENSE CATEGORIES POLICIES
CREATE POLICY "expense_categories_select" ON expense_categories FOR SELECT
  USING (organization_id = public.get_my_org_id() OR public.is_super_admin());

CREATE POLICY "expense_categories_insert" ON expense_categories FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "expense_categories_update" ON expense_categories FOR UPDATE
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "expense_categories_delete" ON expense_categories FOR DELETE
  USING (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

-- INVOICES POLICIES
CREATE POLICY "invoices_select" ON invoices FOR SELECT
  USING (organization_id = public.get_my_org_id() OR public.is_super_admin());

CREATE POLICY "invoices_insert" ON invoices FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "invoices_update" ON invoices FOR UPDATE
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "invoices_delete" ON invoices FOR DELETE
  USING (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

-- INVOICE ITEMS POLICIES
CREATE POLICY "invoice_items_select" ON invoice_items FOR SELECT
  USING (
    invoice_id IN (SELECT id FROM invoices WHERE organization_id = public.get_my_org_id())
    OR public.is_super_admin()
  );

CREATE POLICY "invoice_items_insert" ON invoice_items FOR INSERT
  WITH CHECK (
    invoice_id IN (SELECT id FROM invoices WHERE organization_id = public.get_my_org_id())
  );

CREATE POLICY "invoice_items_update" ON invoice_items FOR UPDATE
  USING (
    invoice_id IN (SELECT id FROM invoices WHERE organization_id = public.get_my_org_id())
  );

CREATE POLICY "invoice_items_delete" ON invoice_items FOR DELETE
  USING (
    invoice_id IN (SELECT id FROM invoices WHERE organization_id = public.get_my_org_id())
  );

-- TRANSACTIONS POLICIES
CREATE POLICY "transactions_select" ON transactions FOR SELECT
  USING (organization_id = public.get_my_org_id() OR public.is_super_admin());

CREATE POLICY "transactions_insert" ON transactions FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "transactions_update" ON transactions FOR UPDATE
  USING (organization_id = public.get_my_org_id());

CREATE POLICY "transactions_delete" ON transactions FOR DELETE
  USING (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

-- STOCK MOVEMENTS POLICIES
CREATE POLICY "stock_movements_select" ON stock_movements FOR SELECT
  USING (
    product_id IN (SELECT id FROM products WHERE organization_id = public.get_my_org_id())
    OR public.is_super_admin()
  );

CREATE POLICY "stock_movements_insert" ON stock_movements FOR INSERT
  WITH CHECK (
    product_id IN (SELECT id FROM products WHERE organization_id = public.get_my_org_id())
  );

-- AUDIT LOGS POLICIES
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT
  USING (
    organization_id = public.get_my_org_id() 
    AND public.get_my_role() IN ('admin', 'manager', 'super_admin')
  );

CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT
  WITH CHECK (true);

-- INVOICE SETTINGS POLICIES
CREATE POLICY "invoice_settings_select" ON invoice_settings FOR SELECT
  USING (organization_id = public.get_my_org_id() OR public.is_super_admin());

CREATE POLICY "invoice_settings_insert" ON invoice_settings FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "invoice_settings_update" ON invoice_settings FOR UPDATE
  USING (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

-- PAYMENT INTEGRATIONS POLICIES
CREATE POLICY "payment_integrations_select" ON payment_integrations FOR SELECT
  USING (organization_id = public.get_my_org_id() OR public.is_super_admin());

CREATE POLICY "payment_integrations_insert" ON payment_integrations FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "payment_integrations_update" ON payment_integrations FOR UPDATE
  USING (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "payment_integrations_delete" ON payment_integrations FOR DELETE
  USING (organization_id = public.get_my_org_id() AND public.get_my_role() IN ('admin', 'super_admin'));

-- PAYMENT TRANSACTIONS POLICIES
CREATE POLICY "payment_transactions_select" ON payment_transactions FOR SELECT
  USING (organization_id = public.get_my_org_id() OR public.is_super_admin());

CREATE POLICY "payment_transactions_insert" ON payment_transactions FOR INSERT
  WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "payment_transactions_update" ON payment_transactions FOR UPDATE
  USING (organization_id = public.get_my_org_id());

-- PERMISSIONS POLICIES (public read)
CREATE POLICY "permissions_select" ON permissions FOR SELECT
  USING (true);

CREATE POLICY "permissions_manage" ON permissions FOR ALL
  USING (public.is_super_admin());

-- ROLE PERMISSIONS POLICIES
CREATE POLICY "role_permissions_select" ON role_permissions FOR SELECT
  USING (true);

CREATE POLICY "role_permissions_manage" ON role_permissions FOR ALL
  USING (public.is_super_admin());

-- USER PERMISSIONS POLICIES
CREATE POLICY "user_permissions_select" ON user_permissions FOR SELECT
  USING (
    user_id = public.get_my_user_id() 
    OR public.get_my_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "user_permissions_manage" ON user_permissions FOR ALL
  USING (public.get_my_role() IN ('admin', 'super_admin'));

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_settings_updated_at BEFORE UPDATE ON invoice_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_integrations_updated_at BEFORE UPDATE ON payment_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INVOICE NUMBER GENERATION
-- ============================================

CREATE OR REPLACE FUNCTION generate_invoice_number(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_next_num INTEGER;
  v_invoice_number TEXT;
BEGIN
  -- Get or create invoice settings
  INSERT INTO invoice_settings (organization_id)
  VALUES (p_org_id)
  ON CONFLICT (organization_id) DO NOTHING;
  
  -- Get prefix and next number
  SELECT invoice_prefix, invoice_starting_number
  INTO v_prefix, v_next_num
  FROM invoice_settings
  WHERE organization_id = p_org_id
  FOR UPDATE;
  
  -- Generate invoice number
  v_invoice_number := v_prefix || LPAD(v_next_num::TEXT, 6, '0');
  
  -- Increment the counter
  UPDATE invoice_settings
  SET invoice_starting_number = invoice_starting_number + 1
  WHERE organization_id = p_org_id;
  
  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USER CREATION HELPER (for auth trigger)
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_user_role user_role;
  v_org_name TEXT;
BEGIN
  -- Check if this is the first user (super_admin)
  IF NOT EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
    -- Create default organization for super admin
    INSERT INTO public.organizations (name, email)
    VALUES ('Default Organization', NEW.email)
    RETURNING id INTO v_org_id;
    
    v_user_role := 'super_admin';
  ELSE
    -- Check if user was invited to an organization
    v_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
    v_user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'viewer');
    
    -- If no org specified, create new org and make them admin
    IF v_org_id IS NULL THEN
      v_org_name := COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Business');
      INSERT INTO public.organizations (name, email)
      VALUES (v_org_name, NEW.email)
      RETURNING id INTO v_org_id;
      v_user_role := 'admin';
    END IF;
  END IF;
  
  -- Create user record
  INSERT INTO public.users (
    auth_user_id,
    organization_id,
    email,
    full_name,
    first_name,
    last_name,
    role,
    avatar_url
  ) VALUES (
    NEW.id,
    v_org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    v_user_role,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create default invoice settings for new org
  INSERT INTO invoice_settings (organization_id)
  VALUES (v_org_id)
  ON CONFLICT (organization_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- GET CURRENT USER WITH ORG (for frontend)
-- ============================================

CREATE OR REPLACE FUNCTION get_current_user_with_org()
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_org RECORD;
BEGIN
  SELECT * INTO v_user
  FROM users
  WHERE auth_user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  SELECT * INTO v_org
  FROM organizations
  WHERE id = v_user.organization_id;
  
  RETURN json_build_object(
    'user', json_build_object(
      'id', v_user.id,
      'auth_user_id', v_user.auth_user_id,
      'organization_id', v_user.organization_id,
      'email', v_user.email,
      'full_name', v_user.full_name,
      'first_name', v_user.first_name,
      'last_name', v_user.last_name,
      'role', v_user.role,
      'avatar_url', v_user.avatar_url,
      'is_active', v_user.is_active,
      'created_at', v_user.created_at
    ),
    'organization', CASE WHEN v_org.id IS NOT NULL THEN json_build_object(
      'id', v_org.id,
      'name', v_org.name,
      'subdomain', v_org.subdomain,
      'email', v_org.email,
      'logo_url', v_org.logo_url,
      'currency', v_org.currency,
      'subscription_plan', v_org.subscription_plan,
      'subscription_status', v_org.subscription_status
    ) ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_current_user_with_org() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number(UUID) TO authenticated;

-- ============================================
-- TABLE PERMISSIONS (RLS controls row access)
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Organizations
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO authenticated;
GRANT SELECT ON organizations TO anon;

-- Users
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT ON users TO anon;

-- Customers
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;

-- Products
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;

-- Bank Accounts
GRANT SELECT, INSERT, UPDATE, DELETE ON bank_accounts TO authenticated;

-- Expense Categories
GRANT SELECT, INSERT, UPDATE, DELETE ON expense_categories TO authenticated;

-- Invoices
GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO authenticated;

-- Invoice Items
GRANT SELECT, INSERT, UPDATE, DELETE ON invoice_items TO authenticated;

-- Transactions
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;

-- Stock Movements
GRANT SELECT, INSERT ON stock_movements TO authenticated;

-- Audit Logs
GRANT SELECT, INSERT ON audit_logs TO authenticated;

-- Invoice Settings
GRANT SELECT, INSERT, UPDATE ON invoice_settings TO authenticated;

-- Payment Integrations
GRANT SELECT, INSERT, UPDATE, DELETE ON payment_integrations TO authenticated;

-- Payment Transactions
GRANT SELECT, INSERT, UPDATE ON payment_transactions TO authenticated;

-- Permissions
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON permissions TO anon;

-- Role Permissions
GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT ON role_permissions TO anon;

-- User Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_permissions TO authenticated;

-- Sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- STORAGE BUCKETS FOR LOGOS AND FILES
-- ============================================

-- Create storage buckets (run separately in Supabase dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Money Flow Complete Schema Created Successfully!';
  RAISE NOTICE '📊 Tables: organizations, users, customers, products, invoices, transactions, etc.';
  RAISE NOTICE '🔒 RLS Policies: Applied to all tables';
  RAISE NOTICE '⚡ Helper Functions: get_my_org_id(), is_super_admin(), get_my_role()';
  RAISE NOTICE '🔄 Triggers: Auto-update timestamps, user creation';
  RAISE NOTICE '🎯 First user will be super_admin automatically';
END $$;
