-- Performance Monitoring Tables

-- API Performance Logs
CREATE TABLE IF NOT EXISTS api_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Resource Metrics
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'cpu', 'memory', 'storage', 'database'
  metric_value JSONB NOT NULL, -- Flexible JSON structure for different metrics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Summary (aggregated data)
CREATE TABLE IF NOT EXISTS performance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  endpoint TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  max_response_time_ms INTEGER DEFAULT 0,
  min_response_time_ms INTEGER DEFAULT 0,
  p95_response_time_ms INTEGER,
  p99_response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, endpoint)
);

-- Create indexes separately
CREATE INDEX IF NOT EXISTS idx_api_perf_endpoint ON api_performance_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_perf_created_at ON api_performance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_perf_org ON api_performance_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_perf_status ON api_performance_logs(status_code);

CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON system_metrics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_perf_summary_date ON performance_summary(date DESC);
CREATE INDEX IF NOT EXISTS idx_perf_summary_endpoint ON performance_summary(endpoint);

-- Enable Row Level Security
ALTER TABLE api_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only super admins can access)
CREATE POLICY "Super admins can view all performance logs"
  ON api_performance_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_super_admin')::boolean = true
    )
  );

CREATE POLICY "Super admins can view all system metrics"
  ON system_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_super_admin')::boolean = true
    )
  );

CREATE POLICY "Super admins can view all performance summaries"
  ON performance_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_super_admin')::boolean = true
    )
  );

-- Function to clean old logs (keep only last 30 days)
CREATE OR REPLACE FUNCTION clean_old_performance_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM api_performance_logs
  WHERE created_at < NOW() - INTERVAL '30 days';

  DELETE FROM system_metrics
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean old logs (requires pg_cron extension)
-- This can be set up manually in Supabase dashboard if pg_cron is available

-- ⚠️ CRITICAL: Grant permissions to service role
GRANT ALL ON TABLE api_performance_logs TO service_role;
GRANT ALL ON TABLE api_performance_logs TO authenticated;

GRANT ALL ON TABLE system_metrics TO service_role;
GRANT ALL ON TABLE system_metrics TO authenticated;

GRANT ALL ON TABLE performance_summary TO service_role;
GRANT ALL ON TABLE performance_summary TO authenticated;