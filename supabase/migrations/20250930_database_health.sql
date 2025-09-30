-- Migration: Database Health Monitoring
-- Created: 2025-09-30
-- Description: Create functions to monitor database health and performance

-- ============================================================================
-- 1. CONNECTION STATISTICS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE state = 'active'),
    'idle', COUNT(*) FILTER (WHERE state = 'idle'),
    'idle_in_transaction', COUNT(*) FILTER (WHERE state = 'idle in transaction'),
    'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections'),
    'usage_percentage', ROUND((COUNT(*)::numeric / (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')::numeric) * 100, 2)
  )
  INTO result
  FROM pg_stat_activity
  WHERE datname = current_database();

  RETURN result;
END;
$$;

-- ============================================================================
-- 2. CACHE HIT RATIO (Target: > 99%)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_cache_hit_ratio()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  heap_read BIGINT;
  heap_hit BIGINT;
  ratio NUMERIC;
BEGIN
  SELECT
    SUM(heap_blks_read),
    SUM(heap_blks_hit)
  INTO heap_read, heap_hit
  FROM pg_statio_user_tables;

  IF (heap_read + heap_hit) > 0 THEN
    ratio := ROUND((heap_hit::numeric / (heap_read + heap_hit)::numeric) * 100, 2);
  ELSE
    ratio := 100;
  END IF;

  SELECT json_build_object(
    'cache_hit_ratio', ratio,
    'heap_blocks_read', heap_read,
    'heap_blocks_hit', heap_hit,
    'status', CASE
      WHEN ratio >= 99 THEN 'excellent'
      WHEN ratio >= 95 THEN 'good'
      WHEN ratio >= 90 THEN 'fair'
      ELSE 'poor'
    END
  )
  INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- 3. TABLE STATISTICS (Most accessed, sequential scans)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_table_statistics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(stats)
  INTO result
  FROM (
    SELECT json_build_object(
      'table_name', schemaname || '.' || relname,
      'sequential_scans', seq_scan,
      'sequential_rows_read', seq_tup_read,
      'index_scans', idx_scan,
      'index_rows_fetched', idx_tup_fetch,
      'rows_inserted', n_tup_ins,
      'rows_updated', n_tup_upd,
      'rows_deleted', n_tup_del,
      'live_tuples', n_live_tup,
      'dead_tuples', n_dead_tup,
      'last_vacuum', last_vacuum,
      'last_autovacuum', last_autovacuum,
      'last_analyze', last_analyze,
      'efficiency_score', CASE
        WHEN (seq_scan + idx_scan) = 0 THEN 0
        ELSE ROUND((idx_scan::numeric / (seq_scan + idx_scan)::numeric) * 100, 2)
      END
    ) AS stats
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY (seq_scan + idx_scan) DESC
    LIMIT 20
  ) subquery;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ============================================================================
-- 4. INDEX USAGE EFFICIENCY
-- ============================================================================

CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(indexes)
  INTO result
  FROM (
    SELECT json_build_object(
      'table_name', schemaname || '.' || tablename,
      'index_name', indexname,
      'index_scans', idx_scan,
      'rows_read', idx_tup_read,
      'rows_fetched', idx_tup_fetch,
      'index_size_bytes', pg_relation_size(indexrelid),
      'index_size_mb', ROUND(pg_relation_size(indexrelid) / 1024.0 / 1024.0, 2),
      'usage_status', CASE
        WHEN idx_scan = 0 THEN 'unused'
        WHEN idx_scan < 100 THEN 'rarely_used'
        ELSE 'active'
      END
    ) AS indexes
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY idx_scan ASC
    LIMIT 20
  ) subquery;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ============================================================================
-- 5. LONG RUNNING QUERIES (> 30 seconds)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_long_running_queries()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'count', COUNT(*),
    'queries', json_agg(
      json_build_object(
        'pid', pid,
        'duration_seconds', EXTRACT(EPOCH FROM (now() - query_start))::int,
        'state', state,
        'query', LEFT(query, 200),
        'started_at', query_start,
        'username', usename,
        'application', application_name
      )
      ORDER BY query_start
    )
  )
  INTO result
  FROM pg_stat_activity
  WHERE state = 'active'
    AND query NOT LIKE '%pg_stat_activity%'
    AND query_start < now() - interval '30 seconds'
    AND datname = current_database();

  RETURN COALESCE(result, '{"count": 0, "queries": []}'::json);
END;
$$;

-- ============================================================================
-- 6. DEADLOCK INFORMATION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_deadlock_info()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  deadlock_count BIGINT;
BEGIN
  -- Get deadlock count from pg_stat_database
  SELECT deadlocks
  INTO deadlock_count
  FROM pg_stat_database
  WHERE datname = current_database();

  SELECT json_build_object(
    'total_deadlocks', COALESCE(deadlock_count, 0),
    'status', CASE
      WHEN COALESCE(deadlock_count, 0) = 0 THEN 'healthy'
      WHEN COALESCE(deadlock_count, 0) < 10 THEN 'warning'
      ELSE 'critical'
    END,
    'message', CASE
      WHEN COALESCE(deadlock_count, 0) = 0 THEN 'No deadlocks detected'
      ELSE 'Deadlocks detected since database start'
    END
  )
  INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- 7. VACUUM AND ANALYZE STATISTICS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_vacuum_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(vacuum_data)
  INTO result
  FROM (
    SELECT json_build_object(
      'table_name', schemaname || '.' || relname,
      'last_vacuum', last_vacuum,
      'last_autovacuum', last_autovacuum,
      'last_analyze', last_analyze,
      'last_autoanalyze', last_autoanalyze,
      'vacuum_count', vacuum_count,
      'autovacuum_count', autovacuum_count,
      'analyze_count', analyze_count,
      'autoanalyze_count', autoanalyze_count,
      'dead_tuples', n_dead_tup,
      'live_tuples', n_live_tup,
      'dead_tuple_ratio', CASE
        WHEN n_live_tup > 0 THEN ROUND((n_dead_tup::numeric / n_live_tup::numeric) * 100, 2)
        ELSE 0
      END,
      'needs_vacuum', CASE
        WHEN n_dead_tup > 1000 AND (n_dead_tup::numeric / NULLIF(n_live_tup, 0)::numeric) > 0.1 THEN true
        ELSE false
      END
    ) AS vacuum_data
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY n_dead_tup DESC
    LIMIT 20
  ) subquery;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ============================================================================
-- 8. DATA INTEGRITY CHECKS
-- ============================================================================

CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  fk_violations INT := 0;
  orphaned_records INT := 0;
BEGIN
  -- This is a simplified check - expand based on your specific schema

  -- Check for orphaned shipment_items (shipments that don't exist)
  SELECT COUNT(*)
  INTO orphaned_records
  FROM shipment_items si
  LEFT JOIN shipments s ON si.shipment_id = s.id
  WHERE s.id IS NULL;

  SELECT json_build_object(
    'foreign_key_violations', fk_violations,
    'orphaned_records', orphaned_records,
    'status', CASE
      WHEN orphaned_records = 0 THEN 'healthy'
      WHEN orphaned_records < 10 THEN 'warning'
      ELSE 'critical'
    END,
    'message', CASE
      WHEN orphaned_records = 0 THEN 'No data integrity issues detected'
      ELSE orphaned_records || ' orphaned records found'
    END,
    'checked_at', now()
  )
  INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS TO SERVICE_ROLE
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_connection_stats() TO service_role;
GRANT EXECUTE ON FUNCTION get_connection_stats() TO authenticated;

GRANT EXECUTE ON FUNCTION get_cache_hit_ratio() TO service_role;
GRANT EXECUTE ON FUNCTION get_cache_hit_ratio() TO authenticated;

GRANT EXECUTE ON FUNCTION get_table_statistics() TO service_role;
GRANT EXECUTE ON FUNCTION get_table_statistics() TO authenticated;

GRANT EXECUTE ON FUNCTION get_index_usage() TO service_role;
GRANT EXECUTE ON FUNCTION get_index_usage() TO authenticated;

GRANT EXECUTE ON FUNCTION get_long_running_queries() TO service_role;
GRANT EXECUTE ON FUNCTION get_long_running_queries() TO authenticated;

GRANT EXECUTE ON FUNCTION get_deadlock_info() TO service_role;
GRANT EXECUTE ON FUNCTION get_deadlock_info() TO authenticated;

GRANT EXECUTE ON FUNCTION get_vacuum_stats() TO service_role;
GRANT EXECUTE ON FUNCTION get_vacuum_stats() TO authenticated;

GRANT EXECUTE ON FUNCTION check_data_integrity() TO service_role;
GRANT EXECUTE ON FUNCTION check_data_integrity() TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_connection_stats() IS 'Returns current database connection statistics';
COMMENT ON FUNCTION get_cache_hit_ratio() IS 'Returns cache hit ratio (target > 99%)';
COMMENT ON FUNCTION get_table_statistics() IS 'Returns statistics for most accessed tables';
COMMENT ON FUNCTION get_index_usage() IS 'Returns index usage efficiency metrics';
COMMENT ON FUNCTION get_long_running_queries() IS 'Returns queries running longer than 30 seconds';
COMMENT ON FUNCTION get_deadlock_info() IS 'Returns deadlock information';
COMMENT ON FUNCTION get_vacuum_stats() IS 'Returns vacuum and analyze statistics';
COMMENT ON FUNCTION check_data_integrity() IS 'Checks for data integrity issues like orphaned records';