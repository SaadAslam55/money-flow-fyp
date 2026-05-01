-- =============================================
-- SETTINGS TABLES MIGRATION
-- Migration: 00004_settings_tables.sql
-- =============================================

-- Tax Settings Table
CREATE TABLE IF NOT EXISTS tax_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tax_enabled BOOLEAN DEFAULT true,
  default_tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_number VARCHAR(100),
  tax_name VARCHAR(100) DEFAULT 'Sales Tax',
  compound_tax BOOLEAN DEFAULT false,
  tax_inclusive BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Integration Settings Table
CREATE TABLE IF NOT EXISTS integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  credentials JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, provider)
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read'],
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks Table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['invoice.created'],
  secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_settings_org ON tax_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_settings_org ON integration_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_org ON webhooks(organization_id);

-- Enable RLS
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Tax Settings Policies
CREATE POLICY "tax_settings_select" ON tax_settings FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "tax_settings_insert" ON tax_settings FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "tax_settings_update" ON tax_settings FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "tax_settings_delete" ON tax_settings FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

-- Integration Settings Policies
CREATE POLICY "integration_settings_select" ON integration_settings FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "integration_settings_insert" ON integration_settings FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "integration_settings_update" ON integration_settings FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "integration_settings_delete" ON integration_settings FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

-- API Keys Policies
CREATE POLICY "api_keys_select" ON api_keys FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "api_keys_insert" ON api_keys FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "api_keys_update" ON api_keys FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "api_keys_delete" ON api_keys FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

-- Webhooks Policies
CREATE POLICY "webhooks_select" ON webhooks FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "webhooks_insert" ON webhooks FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "webhooks_update" ON webhooks FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "webhooks_delete" ON webhooks FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON tax_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON webhooks TO authenticated;
