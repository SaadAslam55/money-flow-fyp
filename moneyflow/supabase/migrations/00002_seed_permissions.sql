-- ============================================
-- MONEY FLOW - SEED PERMISSIONS DATA
-- Migration: 00002_seed_permissions.sql
-- Description: Default permissions for RBAC system
-- ============================================

-- ============================================
-- INSERT DEFAULT PERMISSIONS
-- ============================================

INSERT INTO permissions (code, name, description, category) VALUES
  -- System permissions
  ('system:view_all_orgs', 'View All Organizations', 'View all organizations on the platform', 'system'),
  ('system:manage_orgs', 'Manage Organizations', 'Create, update, delete organizations', 'system'),
  ('system:manage_subscriptions', 'Manage Subscriptions', 'Manage subscription plans and billing', 'system'),
  ('system:system_settings', 'System Settings', 'Access system-wide settings', 'system'),
  ('system:view_analytics', 'Platform Analytics', 'View platform-wide analytics', 'system'),
  
  -- Business permissions
  ('business:settings', 'Business Settings', 'Access business settings', 'business'),
  ('business:update_profile', 'Update Profile', 'Update business profile and logo', 'business'),
  ('business:manage_team', 'Manage Team', 'Add, edit, and remove team members', 'business'),
  ('business:manage_roles', 'Manage Roles', 'Change user roles and permissions', 'business'),
  ('business:view_audit', 'View Audit Logs', 'View audit logs and activity history', 'business'),
  
  -- Financial permissions
  ('financial:view_invoices', 'View Invoices', 'View invoices', 'financial'),
  ('financial:create_invoices', 'Create Invoices', 'Create new invoices', 'financial'),
  ('financial:edit_invoices', 'Edit Invoices', 'Edit existing invoices', 'financial'),
  ('financial:delete_invoices', 'Delete Invoices', 'Delete invoices', 'financial'),
  ('financial:send_invoices', 'Send Invoices', 'Send invoices to customers', 'financial'),
  ('financial:record_payments', 'Record Payments', 'Record customer payments', 'financial'),
  ('financial:view_transactions', 'View Transactions', 'View financial transactions', 'financial'),
  ('financial:create_transactions', 'Create Transactions', 'Create financial transactions', 'financial'),
  ('financial:edit_transactions', 'Edit Transactions', 'Edit transactions', 'financial'),
  ('financial:delete_transactions', 'Delete Transactions', 'Delete transactions', 'financial'),
  ('financial:view_reports', 'View Reports', 'View financial reports', 'financial'),
  ('financial:export_reports', 'Export Reports', 'Export financial reports', 'financial'),
  ('financial:manage_accounts', 'Manage Accounts', 'Manage bank accounts', 'financial'),
  ('financial:manage_categories', 'Manage Categories', 'Manage expense categories', 'financial'),
  
  -- Inventory permissions
  ('inventory:view', 'View Products', 'View product inventory', 'inventory'),
  ('inventory:create', 'Add Products', 'Add new products', 'inventory'),
  ('inventory:edit', 'Edit Products', 'Edit product details', 'inventory'),
  ('inventory:delete', 'Delete Products', 'Delete products', 'inventory'),
  ('inventory:adjust_stock', 'Adjust Stock', 'Manually adjust stock levels', 'inventory'),
  ('inventory:view_movements', 'View Stock Movements', 'View stock movement history', 'inventory'),
  
  -- Customer permissions
  ('customers:view', 'View Customers', 'View customer information', 'customers'),
  ('customers:create', 'Add Customers', 'Add new customers', 'customers'),
  ('customers:edit', 'Edit Customers', 'Edit customer information', 'customers'),
  ('customers:delete', 'Delete Customers', 'Delete customers', 'customers'),
  ('customers:import', 'Import Customers', 'Import customers from files', 'customers'),
  ('customers:export', 'Export Customers', 'Export customer data', 'customers')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- ASSIGN PERMISSIONS TO ROLES
-- ============================================

-- Super Admin gets ALL permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'super_admin', id FROM permissions
ON CONFLICT DO NOTHING;

-- Admin gets most permissions (except system-level)
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions 
WHERE category != 'system'
ON CONFLICT DO NOTHING;

-- Manager permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'manager', id FROM permissions 
WHERE code IN (
  'business:settings',
  'business:update_profile',
  'business:view_audit',
  'financial:view_invoices',
  'financial:create_invoices',
  'financial:edit_invoices',
  'financial:send_invoices',
  'financial:record_payments',
  'financial:view_transactions',
  'financial:create_transactions',
  'financial:edit_transactions',
  'financial:view_reports',
  'financial:export_reports',
  'inventory:view',
  'inventory:create',
  'inventory:edit',
  'inventory:adjust_stock',
  'inventory:view_movements',
  'customers:view',
  'customers:create',
  'customers:edit'
)
ON CONFLICT DO NOTHING;

-- Accountant permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'accountant', id FROM permissions 
WHERE code IN (
  'financial:view_invoices',
  'financial:create_invoices',
  'financial:edit_invoices',
  'financial:send_invoices',
  'financial:record_payments',
  'financial:view_transactions',
  'financial:create_transactions',
  'financial:edit_transactions',
  'financial:view_reports',
  'financial:export_reports',
  'financial:manage_categories',
  'inventory:view',
  'inventory:edit',
  'customers:view',
  'customers:create',
  'customers:edit'
)
ON CONFLICT DO NOTHING;

-- Cashier permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'cashier', id FROM permissions 
WHERE code IN (
  'financial:view_invoices',
  'financial:create_invoices',
  'financial:record_payments',
  'financial:view_transactions',
  'financial:create_transactions',
  'inventory:view',
  'customers:view',
  'customers:create'
)
ON CONFLICT DO NOTHING;

-- Viewer permissions (read-only)
INSERT INTO role_permissions (role, permission_id)
SELECT 'viewer', id FROM permissions 
WHERE code IN (
  'financial:view_invoices',
  'financial:view_transactions',
  'financial:view_reports',
  'inventory:view',
  'customers:view'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Permissions Seeded Successfully!';
  RAISE NOTICE '📋 Created permissions for: system, business, financial, inventory, customers';
  RAISE NOTICE '👥 Assigned permissions to: super_admin, admin, manager, accountant, cashier, viewer';
END $$;
