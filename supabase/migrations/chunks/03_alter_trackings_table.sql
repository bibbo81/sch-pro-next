-- =====================================================
-- CHUNK 3/6: Update trackings table
-- =====================================================

ALTER TABLE trackings
ADD COLUMN IF NOT EXISTS provider_used TEXT,
ADD COLUMN IF NOT EXISTS tracking_type TEXT CHECK (tracking_type IN ('ocean', 'air', 'parcel')),
ADD COLUMN IF NOT EXISTS raw_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_provider_sync TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_trackings_provider ON trackings(provider_used);
CREATE INDEX IF NOT EXISTS idx_trackings_type ON trackings(tracking_type);
