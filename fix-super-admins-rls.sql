-- Fix super_admins table permissions and RLS policies

-- 1. Grant permissions to authenticated role (for server-side queries)
GRANT SELECT ON TABLE super_admins TO authenticated;
GRANT SELECT ON TABLE super_admins TO service_role;

-- 2. Check current RLS status
SELECT
    schemaname,
    tablename,
    rowsecurity AS "RLS Enabled"
FROM pg_tables
WHERE tablename = 'super_admins';

-- 3. Disable RLS or create permissive policy
-- Option A: Disable RLS entirely (simplest for super_admins table)
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;

-- Option B: If you prefer to keep RLS enabled, create a permissive policy
-- ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS "Allow authenticated users to check super admin status" ON super_admins;
--
-- CREATE POLICY "Allow authenticated users to check super admin status"
--   ON super_admins
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- 4. Verify the changes
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'super_admins'
ORDER BY grantee, privilege_type;

-- 5. Test query (this should return your super admin record)
SELECT id, user_id, created_at
FROM super_admins
WHERE user_id = '21766c53-a16b-4019-9a11-845ecea8cf10';