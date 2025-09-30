-- Fix super_admins table permissions for authenticated role
-- This is CRITICAL for requireSuperAdmin() to work in API routes

-- Grant SELECT permission to authenticated role (used by server-side API routes)
GRANT SELECT ON TABLE super_admins TO authenticated;

-- Grant SELECT permission to service_role (already works, but ensure it's explicit)
GRANT SELECT ON TABLE super_admins TO service_role;

-- Disable RLS on super_admins table
-- This table only contains super admin user IDs, no sensitive data
-- And we need all authenticated users to be able to CHECK if THEY are super admin
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;

-- Verify permissions
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'super_admins'
AND grantee IN ('authenticated', 'service_role', 'anon')
ORDER BY grantee, privilege_type;