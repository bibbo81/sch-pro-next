-- Migration: Analytics & Reporting System
-- Description: Complete analytics infrastructure with metrics tracking, scheduled reports, and custom dashboards
-- Date: 2025-09-30

-- =====================================================
-- 1. ANALYTICS METRICS TABLE
-- =====================================================
-- Stores daily aggregated metrics per organization
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'shipments', 'products', 'users', 'costs', 'tracking', 'revenue'

  -- Metrics data (JSONB for flexibility)
  metrics JSONB NOT NULL DEFAULT '{}',

  -- Aggregated counts
  total_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one record per org/date/type
  UNIQUE(organization_id, metric_date, metric_type)
);

-- Indexes for analytics_metrics
CREATE INDEX idx_analytics_metrics_org_date ON analytics_metrics(organization_id, metric_date DESC);
CREATE INDEX idx_analytics_metrics_type ON analytics_metrics(metric_type);
CREATE INDEX idx_analytics_metrics_date ON analytics_metrics(metric_date DESC);

-- =====================================================
-- 2. SCHEDULED REPORTS TABLE
-- =====================================================
-- Configuration for automated report generation
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Report configuration
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL, -- 'monthly_summary', 'weekly_digest', 'custom'

  -- Scheduling
  frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
  schedule_day INTEGER, -- Day of week (1-7) or month (1-31)
  schedule_time TIME DEFAULT '09:00:00',
  timezone VARCHAR(50) DEFAULT 'Europe/Rome',

  -- Recipients
  recipients JSONB NOT NULL DEFAULT '[]', -- Array of email addresses

  -- Report content configuration
  metrics JSONB NOT NULL DEFAULT '[]', -- Array of metric types to include
  date_range VARCHAR(20) DEFAULT 'last_month', -- 'last_week', 'last_month', 'last_quarter'

  -- Format
  format VARCHAR(20) DEFAULT 'pdf', -- 'pdf', 'excel', 'csv'

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_scheduled_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for scheduled_reports
CREATE INDEX idx_scheduled_reports_org ON scheduled_reports(organization_id);
CREATE INDEX idx_scheduled_reports_active ON scheduled_reports(is_active) WHERE is_active = true;
CREATE INDEX idx_scheduled_reports_next_run ON scheduled_reports(next_scheduled_at) WHERE is_active = true;

-- =====================================================
-- 3. REPORT HISTORY TABLE
-- =====================================================
-- Track all generated reports
CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  scheduled_report_id UUID REFERENCES scheduled_reports(id) ON DELETE SET NULL,

  -- Report details
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- File details
  file_url TEXT, -- URL to stored report file (Supabase Storage)
  file_size INTEGER, -- Size in bytes
  format VARCHAR(20), -- 'pdf', 'excel', 'csv'

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
  error_message TEXT,

  -- Metadata
  metrics_included JSONB DEFAULT '[]',
  generated_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for report_history
CREATE INDEX idx_report_history_org ON report_history(organization_id, created_at DESC);
CREATE INDEX idx_report_history_status ON report_history(status);
CREATE INDEX idx_report_history_scheduled ON report_history(scheduled_report_id);

-- =====================================================
-- 4. CUSTOM DASHBOARDS TABLE
-- =====================================================
-- User-configurable dashboards
CREATE TABLE IF NOT EXISTS custom_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Dashboard details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(100) NOT NULL,

  -- Configuration
  layout JSONB NOT NULL DEFAULT '{"type": "grid", "columns": 12}',
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false, -- Share within organization

  -- Ownership
  created_by UUID NOT NULL REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique slug per organization
  UNIQUE(organization_id, slug)
);

-- Indexes for custom_dashboards
CREATE INDEX idx_custom_dashboards_org ON custom_dashboards(organization_id);
CREATE INDEX idx_custom_dashboards_creator ON custom_dashboards(created_by);
CREATE INDEX idx_custom_dashboards_default ON custom_dashboards(is_default) WHERE is_default = true;

-- =====================================================
-- 5. DASHBOARD WIDGETS TABLE
-- =====================================================
-- Individual widgets within custom dashboards
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES custom_dashboards(id) ON DELETE CASCADE,

  -- Widget configuration
  widget_type VARCHAR(50) NOT NULL, -- 'chart', 'kpi', 'table', 'metric', 'trend'
  title VARCHAR(255) NOT NULL,

  -- Data source
  metric_type VARCHAR(50) NOT NULL, -- 'shipments', 'products', 'revenue', etc.
  data_config JSONB NOT NULL DEFAULT '{}', -- Query filters, aggregations, etc.

  -- Visualization
  chart_type VARCHAR(50), -- 'line', 'bar', 'pie', 'doughnut', 'area'
  display_config JSONB DEFAULT '{}', -- Colors, legends, axes, etc.

  -- Layout
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "w": 6, "h": 4}', -- Grid position

  -- Refresh settings
  refresh_interval INTEGER DEFAULT 300, -- Seconds, null = no auto-refresh

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for dashboard_widgets
CREATE INDEX idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);
CREATE INDEX idx_dashboard_widgets_type ON dashboard_widgets(widget_type);

-- =====================================================
-- 6. POSTGRESQL FUNCTIONS
-- =====================================================

-- Function: Calculate metrics for organization
CREATE OR REPLACE FUNCTION calculate_organization_metrics(
  org_id UUID,
  start_date DATE,
  end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
  shipments_data JSONB;
  products_data JSONB;
  costs_data JSONB;
BEGIN
  -- Shipments metrics
  SELECT jsonb_build_object(
    'total_shipments', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'in_transit', COUNT(*) FILTER (WHERE status = 'in_transit'),
    'delivered', COUNT(*) FILTER (WHERE status = 'delivered'),
    'avg_delivery_days', AVG(EXTRACT(DAY FROM (delivered_at - created_at))) FILTER (WHERE delivered_at IS NOT NULL)
  ) INTO shipments_data
  FROM shipments
  WHERE organization_id = org_id
    AND created_at::DATE BETWEEN start_date AND end_date;

  -- Products metrics
  SELECT jsonb_build_object(
    'total_products', COUNT(*),
    'active_products', COUNT(*) FILTER (WHERE is_active = true),
    'total_quantity', COALESCE(SUM(quantity), 0)
  ) INTO products_data
  FROM products
  WHERE organization_id = org_id
    AND created_at::DATE <= end_date;

  -- Costs metrics
  SELECT jsonb_build_object(
    'total_cost', COALESCE(SUM(amount), 0),
    'avg_cost_per_shipment', COALESCE(AVG(amount), 0),
    'cost_by_type', jsonb_object_agg(cost_type, cost_sum)
  ) INTO costs_data
  FROM (
    SELECT
      cost_type,
      SUM(amount) as cost_sum
    FROM additional_costs ac
    JOIN shipments s ON ac.shipment_id = s.id
    WHERE s.organization_id = org_id
      AND ac.created_at::DATE BETWEEN start_date AND end_date
    GROUP BY cost_type
  ) costs_grouped;

  -- Combine all metrics
  result := jsonb_build_object(
    'shipments', shipments_data,
    'products', products_data,
    'costs', costs_data,
    'period', jsonb_build_object(
      'start', start_date,
      'end', end_date
    )
  );

  RETURN result;
END;
$$;

-- Function: Get trending metrics (compare periods)
CREATE OR REPLACE FUNCTION get_trending_metrics(
  org_id UUID,
  current_start DATE,
  current_end DATE,
  previous_start DATE,
  previous_end DATE
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  current_metrics JSONB;
  previous_metrics JSONB;
  result JSONB;
BEGIN
  current_metrics := calculate_organization_metrics(org_id, current_start, current_end);
  previous_metrics := calculate_organization_metrics(org_id, previous_start, previous_end);

  result := jsonb_build_object(
    'current', current_metrics,
    'previous', previous_metrics,
    'trends', jsonb_build_object(
      'shipments_change',
        CASE
          WHEN (previous_metrics->'shipments'->>'total_shipments')::INTEGER > 0
          THEN ((current_metrics->'shipments'->>'total_shipments')::DECIMAL /
                (previous_metrics->'shipments'->>'total_shipments')::DECIMAL - 1) * 100
          ELSE 0
        END,
      'costs_change',
        CASE
          WHEN (previous_metrics->'costs'->>'total_cost')::NUMERIC > 0
          THEN ((current_metrics->'costs'->>'total_cost')::NUMERIC /
                (previous_metrics->'costs'->>'total_cost')::NUMERIC - 1) * 100
          ELSE 0
        END
    )
  );

  RETURN result;
END;
$$;

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Policies for analytics_metrics
CREATE POLICY "Users can view their organization's metrics"
  ON analytics_metrics FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- Policies for scheduled_reports
CREATE POLICY "Users can manage their organization's scheduled reports"
  ON scheduled_reports FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- Policies for report_history
CREATE POLICY "Users can view their organization's report history"
  ON report_history FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users
      WHERE user_id = auth.uid()
    )
  );

-- Policies for custom_dashboards
CREATE POLICY "Users can view their organization's dashboards"
  ON custom_dashboards FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_users
      WHERE user_id = auth.uid()
    )
    OR is_public = true
  );

CREATE POLICY "Users can manage their own dashboards"
  ON custom_dashboards FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Policies for dashboard_widgets
CREATE POLICY "Users can manage widgets in their dashboards"
  ON dashboard_widgets FOR ALL
  TO authenticated
  USING (
    dashboard_id IN (
      SELECT id FROM custom_dashboards WHERE created_by = auth.uid()
    )
  );

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON TABLE analytics_metrics TO service_role;
GRANT ALL ON TABLE analytics_metrics TO authenticated;

GRANT ALL ON TABLE scheduled_reports TO service_role;
GRANT ALL ON TABLE scheduled_reports TO authenticated;

GRANT ALL ON TABLE report_history TO service_role;
GRANT ALL ON TABLE report_history TO authenticated;

GRANT ALL ON TABLE custom_dashboards TO service_role;
GRANT ALL ON TABLE custom_dashboards TO authenticated;

GRANT ALL ON TABLE dashboard_widgets TO service_role;
GRANT ALL ON TABLE dashboard_widgets TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
