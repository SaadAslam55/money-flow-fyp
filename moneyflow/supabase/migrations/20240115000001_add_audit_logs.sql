-- Migration: Add Audit Logging and Security Tables
-- Created: 2024-01-15
-- Purpose: Add comprehensive audit logging for security and compliance

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see audit logs for their organization
CREATE POLICY audit_logs_organization_isolation ON audit_logs
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Only system can insert audit logs
CREATE POLICY audit_logs_system_insert ON audit_logs
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- RATE LIMITING TABLE (for distributed rate limiting)
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL, -- IP or email
    action TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT now(),
    window_duration_ms INTEGER DEFAULT 60000, -- 1 minute
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON rate_limit_logs(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limit_logs(window_start);

-- ============================================
-- EMAIL VERIFICATION LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS email_verification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT,
    action TEXT NOT NULL CHECK (action IN ('sent', 'verified', 'expired', 'resent')),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_email ON email_verification_logs(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_created ON email_verification_logs(created_at DESC);

-- ============================================
-- SESSION MANAGEMENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL,
    device_info TEXT,
    ip_address INET,
    last_active_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to clean up old audit logs (run via cron or edge function)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < now() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_details JSONB DEFAULT '{}',
    p_severity TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_user_id UUID;
    v_org_id UUID;
BEGIN
    -- Get current user info
    SELECT auth.uid() INTO v_user_id;
    
    SELECT organization_id INTO v_org_id
    FROM users
    WHERE auth_user_id = v_user_id;
    
    INSERT INTO audit_logs (
        action,
        entity_type,
        entity_id,
        performed_by,
        organization_id,
        details,
        severity
    ) VALUES (
        p_action,
        p_entity_type,
        p_entity_id,
        v_user_id,
        v_org_id,
        p_details,
        p_severity
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-log authentication events
CREATE OR REPLACE FUNCTION log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details, severity)
        VALUES (
            'user_created',
            'user',
            NEW.id,
            NEW.id,
            jsonb_build_object('email', NEW.email),
            'info'
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
            INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details, severity)
            VALUES (
                'email_verified',
                'user',
                NEW.id,
                NEW.id,
                jsonb_build_object('email', NEW.email),
                'info'
            );
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, details, severity)
        VALUES (
            'user_deleted',
            'user',
            OLD.id,
            auth.uid(),
            jsonb_build_object('email', OLD.email),
            'warning'
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to auth.users (if we have permissions, otherwise handle in edge functions)
-- Note: This requires admin privileges on auth schema
-- CREATE TRIGGER auth_user_audit_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION log_auth_event();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all security-relevant events';
COMMENT ON TABLE rate_limit_logs IS 'Rate limiting records for brute force protection';
COMMENT ON TABLE email_verification_logs IS 'Email verification attempt tracking';
COMMENT ON TABLE user_sessions IS 'Active user session management';
