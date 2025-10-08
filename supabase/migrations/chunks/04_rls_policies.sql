-- =====================================================
-- CHUNK 4/6: RLS Policies
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
