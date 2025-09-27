-- STEP 1: Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('organizations', 'organization_members', 'shipments', 'products');

-- STEP 2: Drop existing policies if they exist (to start fresh)
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Service role can do everything with organizations" ON organizations;
    DROP POLICY IF EXISTS "Service role can do everything with members" ON organization_members;
    DROP POLICY IF EXISTS "Service role can do everything with shipments" ON shipments;
    DROP POLICY IF EXISTS "Service role can do everything with products" ON products;
    
    -- Also drop any other service role policies
    DROP POLICY IF EXISTS "service_role_all" ON organizations;
    DROP POLICY IF EXISTS "service_role_all" ON organization_members;
    DROP POLICY IF EXISTS "service_role_all" ON shipments;
    DROP POLICY IF EXISTS "service_role_all" ON products;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- STEP 3: Disable and re-enable RLS (clean slate)
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create simple bypass policies for service role
-- These allow the service role to bypass RLS entirely
CREATE POLICY "service_role_bypass" ON organizations
  FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass" ON organization_members
  FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass" ON shipments
  FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass" ON products
  FOR ALL 
  USING (auth.role() = 'service_role');

-- STEP 5: Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'organization_members', 'shipments', 'products')
ORDER BY tablename, policyname;
