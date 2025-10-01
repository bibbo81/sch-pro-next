-- =====================================================
-- Phase 4.1: Advanced User Management - User Activity System
-- =====================================================
-- This migration creates:
-- 1. user_activity_logs table for tracking all user actions
-- 2. Helper functions for logging activities
-- 3. Views for activity analytics
-- 4. Indexes for performance
-- =====================================================

-- 1. Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Activity details
  action VARCHAR(100) NOT NULL, -- e.g., 'login', 'create_shipment', 'update_product', 'delete_document'
  resource_type VARCHAR(50), -- e.g., 'shipment', 'product', 'document', 'user', 'ticket'
  resource_id UUID, -- ID of affected resource

  -- Request metadata
  ip_address VARCHAR(45), -- IPv4 or IPv6
  user_agent TEXT, -- Browser/client info
  request_method VARCHAR(10), -- GET, POST, PUT, DELETE
  request_path VARCHAR(500), -- API endpoint or page URL

  -- Additional context
  details JSONB DEFAULT '{}', -- Flexible field for extra data (old_value, new_value, etc.)
  status VARCHAR(20) DEFAULT 'success', -- success, failed, error
  error_message TEXT, -- If status = failed/error

  -- Timing
  duration_ms INTEGER, -- Request/action duration in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes will be created below
  CONSTRAINT valid_status CHECK (status IN ('success', 'failed', 'error'))
);

-- 2. Create indexes for performance
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_organization_id ON user_activity_logs(organization_id);
CREATE INDEX idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX idx_user_activity_logs_resource ON user_activity_logs(resource_type, resource_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_status ON user_activity_logs(status);

-- Composite index for common queries
CREATE INDEX idx_user_activity_logs_org_user_date ON user_activity_logs(organization_id, user_id, created_at DESC);

-- GIN index for JSONB details field (for advanced filtering)
CREATE INDEX idx_user_activity_logs_details ON user_activity_logs USING GIN(details);

-- 3. Enable RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs"
  ON user_activity_logs
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Only system can insert activity logs (no direct user insert)
CREATE POLICY "System can insert activity logs"
  ON user_activity_logs
  FOR INSERT
  WITH CHECK (true); -- Will be controlled by service_role key

-- Super admins can view all logs
CREATE POLICY "Super admins can view all activity logs"
  ON user_activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- 5. Create helper function to log activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_organization_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_request_method VARCHAR DEFAULT NULL,
  p_request_path VARCHAR DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_status VARCHAR DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO user_activity_logs (
    user_id,
    organization_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    user_agent,
    request_method,
    request_path,
    details,
    status,
    error_message,
    duration_ms
  ) VALUES (
    p_user_id,
    p_organization_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_ip_address,
    p_user_agent,
    p_request_method,
    p_request_path,
    p_details,
    p_status,
    p_error_message,
    p_duration_ms
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create view for user activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
  u.id as user_id,
  u.email,
  om.organization_id,
  o.name as organization_name,
  om.role,
  COUNT(ual.id) as total_activities,
  COUNT(CASE WHEN ual.status = 'success' THEN 1 END) as successful_activities,
  COUNT(CASE WHEN ual.status IN ('failed', 'error') THEN 1 END) as failed_activities,
  MAX(ual.created_at) as last_activity_at,
  MIN(ual.created_at) as first_activity_at
FROM auth.users u
LEFT JOIN organization_members om ON u.id = om.user_id
LEFT JOIN organizations o ON om.organization_id = o.id
LEFT JOIN user_activity_logs ual ON u.id = ual.user_id
GROUP BY u.id, u.email, om.organization_id, o.name, om.role;

-- 7. Create view for activity analytics by action type
CREATE OR REPLACE VIEW activity_analytics_by_action AS
SELECT
  organization_id,
  action,
  resource_type,
  COUNT(*) as action_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(duration_ms) as avg_duration_ms,
  MAX(duration_ms) as max_duration_ms,
  COUNT(CASE WHEN status = 'failed' OR status = 'error' THEN 1 END) as error_count,
  DATE(created_at) as activity_date
FROM user_activity_logs
GROUP BY organization_id, action, resource_type, DATE(created_at)
ORDER BY activity_date DESC, action_count DESC;

-- 8. Create function to get user activity timeline
CREATE OR REPLACE FUNCTION get_user_activity_timeline(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  action VARCHAR,
  resource_type VARCHAR,
  resource_id UUID,
  details JSONB,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ual.id,
    ual.action,
    ual.resource_type,
    ual.resource_id,
    ual.details,
    ual.status,
    ual.created_at,
    ual.duration_ms
  FROM user_activity_logs ual
  WHERE ual.user_id = p_user_id
  ORDER BY ual.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions
GRANT ALL ON TABLE user_activity_logs TO service_role;
GRANT SELECT ON TABLE user_activity_logs TO authenticated;
GRANT INSERT ON TABLE user_activity_logs TO service_role;

GRANT SELECT ON user_activity_summary TO authenticated;
GRANT SELECT ON user_activity_summary TO service_role;

GRANT SELECT ON activity_analytics_by_action TO authenticated;
GRANT SELECT ON activity_analytics_by_action TO service_role;

-- 10. Add comments for documentation
COMMENT ON TABLE user_activity_logs IS 'Tracks all user activities across the platform for audit and analytics';
COMMENT ON FUNCTION log_user_activity IS 'Helper function to insert activity log entries';
COMMENT ON FUNCTION get_user_activity_timeline IS 'Returns paginated activity timeline for a specific user';
COMMENT ON VIEW user_activity_summary IS 'Aggregated user activity statistics';
COMMENT ON VIEW activity_analytics_by_action IS 'Analytics of activities grouped by action type and date';
