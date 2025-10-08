-- =====================================================
-- CHUNK 1/6: Create tracking_providers table
-- =====================================================

CREATE TABLE IF NOT EXISTS tracking_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ocean', 'air', 'parcel', 'all')),
    provider TEXT NOT NULL CHECK (provider IN ('jsoncargo', 'web_scraping', 'shipsgo')),
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
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

-- Grants
GRANT ALL ON TABLE tracking_providers TO service_role;
GRANT ALL ON TABLE tracking_providers TO authenticated;
