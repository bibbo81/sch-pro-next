-- =====================================================
-- Migration: Phase 6.1 - Tracking Providers System
-- Description: Multi-provider tracking architecture
-- Date: 2025-10-02
-- =====================================================

-- =====================================================
-- 1. TRACKING PROVIDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tracking_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ocean', 'air', 'parcel', 'all')),
    provider TEXT NOT NULL CHECK (provider IN ('vizion', 'karrio', 'web_scraping', 'shipsgo')),
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- Lower number = higher priority
    free_tier_limit INTEGER,
    cost_per_request NUMERIC(10,4) DEFAULT 0,
    success_rate NUMERIC(5,2) DEFAULT 100.00,
    avg_response_time_ms INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tracking_providers_type ON tracking_providers(type);
CREATE INDEX idx_tracking_providers_active ON tracking_providers(is_active);
CREATE INDEX idx_tracking_providers_priority ON tracking_providers(priority);

-- =====================================================
-- 2. TRACKING REQUESTS LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tracking_requests_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES tracking_providers(id) ON DELETE SET NULL,
    tracking_number TEXT NOT NULL,
    tracking_type TEXT NOT NULL CHECK (tracking_type IN ('container', 'bl', 'booking', 'awb', 'parcel')),
    carrier_name TEXT,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'fallback_used', 'cached')),
    response_time_ms INTEGER,
    error_message TEXT,
    fallback_provider_id UUID REFERENCES tracking_providers(id) ON DELETE SET NULL,
    raw_request JSONB,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tracking_requests_org ON tracking_requests_log(organization_id);
CREATE INDEX idx_tracking_requests_provider ON tracking_requests_log(provider_id);
CREATE INDEX idx_tracking_requests_tracking_number ON tracking_requests_log(tracking_number);
CREATE INDEX idx_tracking_requests_status ON tracking_requests_log(status);
CREATE INDEX idx_tracking_requests_created_at ON tracking_requests_log(created_at DESC);

-- =====================================================
-- 3. UPDATE TRACKINGS TABLE (add provider metadata)
-- =====================================================
ALTER TABLE trackings
ADD COLUMN IF NOT EXISTS provider_used TEXT,
ADD COLUMN IF NOT EXISTS tracking_type TEXT CHECK (tracking_type IN ('ocean', 'air', 'parcel')),
ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_provider_sync TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_trackings_provider ON trackings(provider_used);
CREATE INDEX IF NOT EXISTS idx_trackings_type ON trackings(tracking_type);

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

-- tracking_providers: Super-admin only
ALTER TABLE tracking_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super-admin full access to tracking providers"
ON tracking_providers
FOR ALL
USING (
    auth.jwt() ->> 'user_role' = 'super_admin'
);

-- tracking_requests_log: Organization-scoped
ALTER TABLE tracking_requests_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organization tracking logs"
ON tracking_requests_log
FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Super-admin can view all tracking logs"
ON tracking_requests_log
FOR ALL
USING (
    auth.jwt() ->> 'user_role' = 'super_admin'
);

-- =====================================================
-- 5. SEED DEFAULT PROVIDERS
-- =====================================================
INSERT INTO tracking_providers (name, type, provider, priority, free_tier_limit, cost_per_request, metadata) VALUES
('VIZION API', 'ocean', 'vizion', 1, 15, 0.00, '{"base_url": "https://api.vizionapi.com", "free_tier": true, "features": ["container", "bl", "booking", "webhooks"]}'::jsonb),
('ShipsGo Ocean', 'ocean', 'shipsgo', 3, NULL, 0.10, '{"base_url": "https://api.shipsgo.com", "fallback": true}'::jsonb),
('Web Scraping Ocean', 'ocean', 'web_scraping', 2, NULL, 0.00, '{"carriers": ["grimaldi", "gnv", "moby"], "cache_ttl": 10800}'::jsonb),
('Karrio Parcel', 'parcel', 'karrio', 1, NULL, 0.00, '{"self_hosted": true, "carriers": ["dhl", "ups", "fedex"]}'::jsonb),
('ShipsGo Air', 'air', 'shipsgo', 2, NULL, 0.10, '{"base_url": "https://api.shipsgo.com"}'::jsonb),
('Web Scraping Air', 'air', 'web_scraping', 1, NULL, 0.00, '{"airlines": ["lufthansa", "emirates", "klm"], "cache_ttl": 14400}'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function: Get best provider for tracking type
CREATE OR REPLACE FUNCTION get_best_tracking_provider(
    p_tracking_type TEXT,
    p_organization_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_provider_id UUID;
    v_provider_type TEXT;
BEGIN
    -- Map tracking type to provider type
    CASE p_tracking_type
        WHEN 'container', 'bl', 'booking' THEN v_provider_type := 'ocean';
        WHEN 'awb' THEN v_provider_type := 'air';
        WHEN 'parcel' THEN v_provider_type := 'parcel';
        ELSE v_provider_type := 'ocean'; -- default
    END CASE;

    -- Get highest priority active provider
    SELECT id INTO v_provider_id
    FROM tracking_providers
    WHERE type = v_provider_type
      AND is_active = true
    ORDER BY priority ASC, success_rate DESC
    LIMIT 1;

    RETURN v_provider_id;
END;
$$;

-- Function: Log tracking request
CREATE OR REPLACE FUNCTION log_tracking_request(
    p_organization_id UUID,
    p_provider_id UUID,
    p_tracking_number TEXT,
    p_tracking_type TEXT,
    p_carrier_name TEXT,
    p_status TEXT,
    p_response_time_ms INTEGER,
    p_error_message TEXT DEFAULT NULL,
    p_fallback_provider_id UUID DEFAULT NULL,
    p_raw_response JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO tracking_requests_log (
        organization_id,
        provider_id,
        tracking_number,
        tracking_type,
        carrier_name,
        status,
        response_time_ms,
        error_message,
        fallback_provider_id,
        raw_response
    ) VALUES (
        p_organization_id,
        p_provider_id,
        p_tracking_number,
        p_tracking_type,
        p_carrier_name,
        p_status,
        p_response_time_ms,
        p_error_message,
        p_fallback_provider_id,
        p_raw_response
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

-- Function: Update provider statistics
CREATE OR REPLACE FUNCTION update_provider_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update success rate and avg response time
    UPDATE tracking_providers
    SET
        success_rate = (
            SELECT ROUND(
                (COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)::NUMERIC) * 100,
                2
            )
            FROM tracking_requests_log
            WHERE provider_id = NEW.provider_id
              AND created_at > NOW() - INTERVAL '7 days'
        ),
        avg_response_time_ms = (
            SELECT ROUND(AVG(response_time_ms))
            FROM tracking_requests_log
            WHERE provider_id = NEW.provider_id
              AND status = 'success'
              AND created_at > NOW() - INTERVAL '7 days'
        ),
        updated_at = NOW()
    WHERE id = NEW.provider_id;

    RETURN NEW;
END;
$$;

-- Trigger: Auto-update provider stats on new tracking request
CREATE TRIGGER trigger_update_provider_stats
AFTER INSERT ON tracking_requests_log
FOR EACH ROW
EXECUTE FUNCTION update_provider_stats();

-- =====================================================
-- 7. GRANTS
-- =====================================================
GRANT ALL ON TABLE tracking_providers TO service_role;
GRANT ALL ON TABLE tracking_providers TO authenticated;

GRANT ALL ON TABLE tracking_requests_log TO service_role;
GRANT ALL ON TABLE tracking_requests_log TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================
