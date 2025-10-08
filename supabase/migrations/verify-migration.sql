-- =====================================================
-- VERIFICATION QUERY: Check Phase 6 Migration Status
-- =====================================================

-- 1. Check tables exist
SELECT
    'tracking_providers' as table_name,
    COUNT(*) as record_count
FROM tracking_providers
UNION ALL
SELECT
    'tracking_requests_log' as table_name,
    COUNT(*) as record_count
FROM tracking_requests_log;

-- 2. List all providers (should show 13 entries)
SELECT
    name,
    provider,
    type,
    priority,
    is_active,
    cost_per_request,
    metadata->>'carrier' as carrier_code,
    metadata->>'market_share' as market_share
FROM tracking_providers
ORDER BY priority, name;

-- 3. Check trackings table columns were added
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'trackings'
  AND column_name IN ('provider_used', 'tracking_type', 'raw_data', 'last_provider_sync');

-- 4. Check functions exist
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_best_tracking_provider', 'log_tracking_request', 'update_provider_stats');

-- 5. Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE tablename IN ('tracking_providers', 'tracking_requests_log');
