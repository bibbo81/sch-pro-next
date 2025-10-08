-- =====================================================
-- CHUNK 2/6: Create tracking_requests_log table
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

-- Grants
GRANT ALL ON TABLE tracking_requests_log TO service_role;
GRANT ALL ON TABLE tracking_requests_log TO authenticated;
