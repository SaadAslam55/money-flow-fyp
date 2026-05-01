-- ============================================
-- MONEY FLOW - DATABASE RESET SCRIPT
-- Run this FIRST to clean the database before applying fresh schema
-- ============================================

-- WARNING: This will DELETE ALL DATA!
-- Only run this if you want to start fresh

-- ============================================
-- DROP ALL FUNCTIONS FIRST (CASCADE will drop dependent triggers/policies)
-- ============================================

DROP FUNCTION IF EXISTS public.get_my_org_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_organization_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_with_org() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.generate_invoice_number(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_permissions(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_user_permission(UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.grant_user_permission(UUID, VARCHAR, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.revoke_user_permission(UUID, VARCHAR, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.create_organization(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.list_organizations(INTEGER, INTEGER, TEXT, TEXT, TEXT) CASCADE;

-- ============================================
-- DROP ALL TABLES (in correct order due to foreign keys)
-- ============================================

DROP TABLE IF EXISTS payment_webhooks CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payment_integrations CASCADE;
DROP TABLE IF EXISTS super_admin_payment_accounts CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS invoice_settings CASCADE;
DROP TABLE IF EXISTS tax_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ============================================
-- DROP ALL CUSTOM TYPES
-- ============================================

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS bank_account_type CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_provider CASCADE;
DROP TYPE IF EXISTS payment_transaction_status CASCADE;

-- ============================================
-- CLEAN AUTH USERS (Optional - uncomment if needed)
-- ============================================

-- WARNING: This deletes all auth users!
-- DELETE FROM auth.users;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database Reset Complete!';
  RAISE NOTICE '🗑️ All tables, functions, triggers, and types have been dropped';
  RAISE NOTICE '➡️ Now run 00001_complete_schema.sql to create fresh schema';
END $$;
