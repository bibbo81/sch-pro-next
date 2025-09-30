-- Migration: Database Storage Monitoring
-- Created: 2025-09-30
-- Description: Create function to monitor database table sizes

-- Create function to get table sizes
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  table_name TEXT,
  row_count BIGINT,
  total_size_bytes BIGINT,
  table_size_bytes BIGINT,
  indexes_size_bytes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname || '.' || tablename AS table_name,
    n_live_tup AS row_count,
    pg_total_relation_size(schemaname || '.' || tablename)::BIGINT AS total_size_bytes,
    pg_relation_size(schemaname || '.' || tablename)::BIGINT AS table_size_bytes,
    pg_indexes_size(schemaname || '.' || tablename)::BIGINT AS indexes_size_bytes
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION get_table_sizes() TO service_role;
GRANT EXECUTE ON FUNCTION get_table_sizes() TO authenticated;

-- Comment
COMMENT ON FUNCTION get_table_sizes() IS 'Returns size information for all tables in the public schema';