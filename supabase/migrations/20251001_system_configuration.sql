-- =====================================================
-- Phase 4.2: System Configuration
-- =====================================================
-- This migration creates:
-- 1. feature_flags table - Feature toggles per organization
-- 2. api_keys table - Encrypted API keys management
-- 3. rate_limits table - Configurable rate limiting
-- 4. configuration_backups table - Backup/restore system
-- =====================================================

-- ========================================
-- 1. FEATURE FLAGS
-- ========================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Feature identification
  feature_key VARCHAR(100) NOT NULL, -- e.g., 'advanced_analytics', 'custom_dashboards'
  feature_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- e.g., 'analytics', 'billing', 'communication'

  -- Scope
  scope VARCHAR(20) NOT NULL DEFAULT 'global', -- 'global' or 'organization'
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Status
  is_enabled BOOLEAN DEFAULT false,

  -- Metadata
  config JSONB DEFAULT '{}', -- Additional configuration for the feature

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enabled_at TIMESTAMP WITH TIME ZONE,
  enabled_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT valid_scope CHECK (scope IN ('global', 'organization')),
  CONSTRAINT org_scope_requires_org_id CHECK (
    (scope = 'global' AND organization_id IS NULL) OR
    (scope = 'organization' AND organization_id IS NOT NULL)
  )
);

-- Partial unique indexes (must be created separately, not as constraints)
CREATE UNIQUE INDEX idx_unique_feature_global ON feature_flags(feature_key) WHERE scope = 'global';
CREATE UNIQUE INDEX idx_unique_feature_org ON feature_flags(feature_key, organization_id) WHERE scope = 'organization';

CREATE INDEX idx_feature_flags_key ON feature_flags(feature_key);
CREATE INDEX idx_feature_flags_org ON feature_flags(organization_id);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);
CREATE INDEX idx_feature_flags_scope ON feature_flags(scope);

-- ========================================
-- 2. API KEYS MANAGEMENT
-- ========================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Key identification
  key_name VARCHAR(100) NOT NULL, -- e.g., 'shipsgo_api_key', 'smtp_password'
  service_name VARCHAR(100) NOT NULL, -- e.g., 'ShipsGo', 'SMTP', 'Stripe'
  description TEXT,

  -- Scope
  scope VARCHAR(20) NOT NULL DEFAULT 'global', -- 'global' or 'organization'
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Encrypted value (use Supabase Vault or encrypt before storing)
  encrypted_value TEXT NOT NULL,

  -- Key metadata
  key_type VARCHAR(50), -- 'api_key', 'oauth_token', 'password', 'secret'
  environment VARCHAR(20) DEFAULT 'production', -- 'production', 'staging', 'development'

  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_rotated_at TIMESTAMP WITH TIME ZONE,

  -- Usage tracking
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT valid_scope_apikey CHECK (scope IN ('global', 'organization')),
  CONSTRAINT valid_environment CHECK (environment IN ('production', 'staging', 'development')),
  CONSTRAINT org_scope_requires_org_id_apikey CHECK (
    (scope = 'global' AND organization_id IS NULL) OR
    (scope = 'organization' AND organization_id IS NOT NULL)
  )
);

CREATE INDEX idx_api_keys_name ON api_keys(key_name);
CREATE INDEX idx_api_keys_service ON api_keys(service_name);
CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_scope ON api_keys(scope);

-- ========================================
-- 3. RATE LIMITS
-- ========================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Limit identification
  limit_name VARCHAR(100) NOT NULL,
  endpoint_pattern VARCHAR(255) NOT NULL, -- e.g., '/api/shipments', '/api/products/*'
  description TEXT,

  -- Scope
  scope VARCHAR(20) NOT NULL DEFAULT 'global', -- 'global', 'organization', 'user'
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Limit configuration
  max_requests INTEGER NOT NULL, -- Max requests allowed
  window_seconds INTEGER NOT NULL, -- Time window in seconds (e.g., 60 for 1 minute, 3600 for 1 hour)

  -- Actions on limit exceeded
  block_duration_seconds INTEGER DEFAULT 60, -- How long to block after exceeding
  response_code INTEGER DEFAULT 429, -- HTTP status code to return
  response_message TEXT DEFAULT 'Rate limit exceeded',

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_scope_ratelimit CHECK (scope IN ('global', 'organization', 'user')),
  CONSTRAINT positive_max_requests CHECK (max_requests > 0),
  CONSTRAINT positive_window CHECK (window_seconds > 0)
);

CREATE INDEX idx_rate_limits_endpoint ON rate_limits(endpoint_pattern);
CREATE INDEX idx_rate_limits_org ON rate_limits(organization_id);
CREATE INDEX idx_rate_limits_user ON rate_limits(user_id);
CREATE INDEX idx_rate_limits_active ON rate_limits(is_active);
CREATE INDEX idx_rate_limits_scope ON rate_limits(scope);

-- Rate limit tracking table
CREATE TABLE IF NOT EXISTS rate_limit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_limit_id UUID NOT NULL REFERENCES rate_limits(id) ON DELETE CASCADE,

  -- Request identification
  identifier VARCHAR(255) NOT NULL, -- IP address, user_id, or organization_id
  endpoint VARCHAR(255) NOT NULL,

  -- Tracking
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Status
  is_blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_usage_identifier ON rate_limit_usage(identifier, window_end);
CREATE INDEX idx_rate_limit_usage_rate_limit ON rate_limit_usage(rate_limit_id);
CREATE INDEX idx_rate_limit_usage_blocked ON rate_limit_usage(is_blocked);

-- ========================================
-- 4. CONFIGURATION BACKUPS
-- ========================================

CREATE TABLE IF NOT EXISTS configuration_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Backup metadata
  backup_name VARCHAR(255) NOT NULL,
  description TEXT,
  backup_type VARCHAR(50) NOT NULL, -- 'manual', 'automatic', 'scheduled'

  -- Scope
  scope VARCHAR(20) NOT NULL DEFAULT 'global', -- 'global' or 'organization'
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Backup content (JSONB for flexibility)
  backup_data JSONB NOT NULL, -- Contains feature_flags, api_keys, rate_limits snapshots

  -- Metadata
  tables_included TEXT[] DEFAULT ARRAY['feature_flags', 'api_keys', 'rate_limits'],
  record_count INTEGER,
  backup_size_bytes BIGINT,

  -- Status
  status VARCHAR(20) DEFAULT 'completed', -- 'in_progress', 'completed', 'failed'

  -- Restore tracking
  is_restored BOOLEAN DEFAULT false,
  restored_at TIMESTAMP WITH TIME ZONE,
  restored_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT valid_backup_type CHECK (backup_type IN ('manual', 'automatic', 'scheduled')),
  CONSTRAINT valid_backup_status CHECK (status IN ('in_progress', 'completed', 'failed'))
);

CREATE INDEX idx_config_backups_org ON configuration_backups(organization_id);
CREATE INDEX idx_config_backups_created_at ON configuration_backups(created_at DESC);
CREATE INDEX idx_config_backups_type ON configuration_backups(backup_type);
CREATE INDEX idx_config_backups_status ON configuration_backups(status);

-- ========================================
-- 5. RLS POLICIES
-- ========================================

-- Feature Flags RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all feature flags"
  ON feature_flags FOR ALL
  USING (EXISTS (SELECT 1 FROM super_admins WHERE super_admins.user_id = auth.uid()));

CREATE POLICY "Organizations can view their feature flags"
  ON feature_flags FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    OR scope = 'global'
  );

-- API Keys RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all api keys"
  ON api_keys FOR ALL
  USING (EXISTS (SELECT 1 FROM super_admins WHERE super_admins.user_id = auth.uid()));

CREATE POLICY "Organizations can view their api keys"
  ON api_keys FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Rate Limits RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all rate limits"
  ON rate_limits FOR ALL
  USING (EXISTS (SELECT 1 FROM super_admins WHERE super_admins.user_id = auth.uid()));

-- Rate Limit Usage RLS
ALTER TABLE rate_limit_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all rate limit usage"
  ON rate_limit_usage FOR SELECT
  USING (EXISTS (SELECT 1 FROM super_admins WHERE super_admins.user_id = auth.uid()));

-- Configuration Backups RLS
ALTER TABLE configuration_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all backups"
  ON configuration_backups FOR ALL
  USING (EXISTS (SELECT 1 FROM super_admins WHERE super_admins.user_id = auth.uid()));

-- ========================================
-- 6. HELPER FUNCTIONS
-- ========================================

-- Function to check if feature is enabled
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_feature_key VARCHAR,
  p_organization_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  -- Check organization-specific flag first
  IF p_organization_id IS NOT NULL THEN
    SELECT is_enabled INTO v_enabled
    FROM feature_flags
    WHERE feature_key = p_feature_key
      AND scope = 'organization'
      AND organization_id = p_organization_id;

    IF FOUND THEN
      RETURN v_enabled;
    END IF;
  END IF;

  -- Fall back to global flag
  SELECT is_enabled INTO v_enabled
  FROM feature_flags
  WHERE feature_key = p_feature_key
    AND scope = 'global';

  RETURN COALESCE(v_enabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create configuration backup
CREATE OR REPLACE FUNCTION create_configuration_backup(
  p_backup_name VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_backup_id UUID;
  v_backup_data JSONB;
BEGIN
  -- Collect data to backup
  SELECT jsonb_build_object(
    'feature_flags', (SELECT jsonb_agg(row_to_json(ff.*)) FROM feature_flags ff
      WHERE (p_organization_id IS NULL OR ff.organization_id = p_organization_id)),
    'api_keys', (SELECT jsonb_agg(row_to_json(ak.*)) FROM api_keys ak
      WHERE (p_organization_id IS NULL OR ak.organization_id = p_organization_id)),
    'rate_limits', (SELECT jsonb_agg(row_to_json(rl.*)) FROM rate_limits rl
      WHERE (p_organization_id IS NULL OR rl.organization_id = p_organization_id))
  ) INTO v_backup_data;

  -- Create backup record
  INSERT INTO configuration_backups (
    backup_name,
    description,
    backup_type,
    scope,
    organization_id,
    backup_data,
    created_by,
    status
  ) VALUES (
    p_backup_name,
    p_description,
    'manual',
    CASE WHEN p_organization_id IS NULL THEN 'global' ELSE 'organization' END,
    p_organization_id,
    v_backup_data,
    auth.uid(),
    'completed'
  ) RETURNING id INTO v_backup_id;

  RETURN v_backup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. GRANT PERMISSIONS
-- ========================================

GRANT ALL ON TABLE feature_flags TO service_role;
GRANT SELECT ON TABLE feature_flags TO authenticated;

GRANT ALL ON TABLE api_keys TO service_role;
GRANT SELECT ON TABLE api_keys TO authenticated;

GRANT ALL ON TABLE rate_limits TO service_role;
GRANT SELECT ON TABLE rate_limits TO authenticated;

GRANT ALL ON TABLE rate_limit_usage TO service_role;
GRANT SELECT ON TABLE rate_limit_usage TO authenticated;

GRANT ALL ON TABLE configuration_backups TO service_role;
GRANT SELECT ON TABLE configuration_backups TO authenticated;

-- ========================================
-- 8. SEED DEFAULT DATA
-- ========================================

-- Insert common global feature flags
INSERT INTO feature_flags (feature_key, feature_name, description, category, scope, is_enabled)
VALUES
  ('advanced_analytics', 'Advanced Analytics', 'Access to advanced analytics and custom reports', 'analytics', 'global', true),
  ('custom_dashboards', 'Custom Dashboards', 'Create and manage custom dashboards with widgets', 'analytics', 'global', true),
  ('bulk_operations', 'Bulk Operations', 'Bulk import/export and batch operations', 'productivity', 'global', true),
  ('api_access', 'API Access', 'Access to REST API endpoints', 'integration', 'global', true),
  ('priority_support', 'Priority Support', 'Access to priority customer support', 'support', 'global', false),
  ('white_label', 'White Label', 'Remove branding and customize appearance', 'branding', 'global', false)
ON CONFLICT DO NOTHING;

-- Insert default rate limits
INSERT INTO rate_limits (limit_name, endpoint_pattern, scope, max_requests, window_seconds, description)
VALUES
  ('Global API Rate Limit', '/api/*', 'global', 1000, 3600, 'Default rate limit for all API endpoints: 1000 requests per hour'),
  ('Shipments API Rate Limit', '/api/shipments*', 'global', 500, 3600, 'Rate limit for shipments API: 500 requests per hour'),
  ('Products API Rate Limit', '/api/products*', 'global', 500, 3600, 'Rate limit for products API: 500 requests per hour'),
  ('Auth API Rate Limit', '/api/auth/*', 'global', 10, 60, 'Rate limit for authentication endpoints: 10 requests per minute')
ON CONFLICT DO NOTHING;

-- ========================================
-- 9. COMMENTS
-- ========================================

COMMENT ON TABLE feature_flags IS 'Feature toggle system for controlling feature availability per organization';
COMMENT ON TABLE api_keys IS 'Encrypted storage for external API keys and secrets';
COMMENT ON TABLE rate_limits IS 'Configurable rate limiting rules for API endpoints';
COMMENT ON TABLE rate_limit_usage IS 'Tracks rate limit usage and violations';
COMMENT ON TABLE configuration_backups IS 'Backup and restore system for configuration data';
COMMENT ON FUNCTION is_feature_enabled IS 'Check if a feature is enabled for an organization';
COMMENT ON FUNCTION create_configuration_backup IS 'Create a backup of configuration data';
