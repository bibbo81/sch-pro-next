-- IMPORTANTE: Esegui questo SQL nel tuo Supabase dashboard
-- Vai su: SQL Editor → New Query → incolla questo codice

-- 1. Abilita RLS su tutte le tabelle principali
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Crea policy per service role (super admin) su organizations
CREATE POLICY "Service role can do everything with organizations" 
ON organizations 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 3. Crea policy per service role su organization_members
CREATE POLICY "Service role can do everything with members" 
ON organization_members 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 4. Crea policy per service role su shipments
CREATE POLICY "Service role can do everything with shipments" 
ON shipments 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 5. Crea policy per service role su products
CREATE POLICY "Service role can do everything with products" 
ON products 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Verifica che le policy siano state create
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'organization_members', 'shipments', 'products')
ORDER BY tablename, policyname;
