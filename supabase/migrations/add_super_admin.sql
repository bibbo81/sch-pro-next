-- Add super_admin support to the system
-- This migration adds support for super admins who can manage all organizations

-- 1. Create super_admins table to track super admin users
CREATE TABLE IF NOT EXISTS public.super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT,
    UNIQUE(user_id)
);

-- 2. Add RLS policies for super_admins table
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can view the super_admins table
CREATE POLICY "Super admins can view super_admins" ON public.super_admins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.user_id = auth.uid()
        )
    );

-- 3. Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.super_admins
        WHERE super_admins.user_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS policies for organizations table
-- Super admins can view all organizations
CREATE POLICY "Super admins can view all organizations" ON public.organizations
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can create organizations
CREATE POLICY "Super admins can create organizations" ON public.organizations
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can update all organizations
CREATE POLICY "Super admins can update all organizations" ON public.organizations
    FOR UPDATE
    USING (public.is_super_admin());

-- Super admins can delete organizations (careful!)
CREATE POLICY "Super admins can delete organizations" ON public.organizations
    FOR DELETE
    USING (public.is_super_admin());

-- 5. Update RLS policies for organization_members
-- Super admins can view all members
CREATE POLICY "Super admins can view all organization members" ON public.organization_members
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can manage all members
CREATE POLICY "Super admins can manage all organization members" ON public.organization_members
    FOR ALL
    USING (public.is_super_admin());

-- 6. Create a view for super admin statistics
CREATE OR REPLACE VIEW public.super_admin_stats AS
SELECT
    (SELECT COUNT(*) FROM public.organizations) as total_organizations,
    (SELECT COUNT(*) FROM public.organization_members) as total_users,
    (SELECT COUNT(*) FROM public.shipments) as total_shipments,
    (SELECT COUNT(*) FROM public.products) as total_products,
    (SELECT COUNT(DISTINCT organization_id) FROM public.shipments WHERE created_at > NOW() - INTERVAL '30 days') as active_organizations_30d;

-- Grant access to the view only for super admins
CREATE POLICY "Only super admins can view stats" ON public.super_admin_stats
    FOR SELECT
    USING (public.is_super_admin());

-- 7. Add your user as the first super admin (replace with your actual user ID)
-- You'll need to run this manually with your user ID:
-- INSERT INTO public.super_admins (user_id, notes)
-- VALUES ('YOUR-USER-ID-HERE', 'Initial super admin');

-- 8. Create audit log for super admin actions
CREATE TABLE IF NOT EXISTS public.super_admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    super_admin_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT, -- 'organization', 'user', etc.
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.super_admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs" ON public.super_admin_audit_log
    FOR SELECT
    USING (public.is_super_admin());

-- 9. Function to log super admin actions
CREATE OR REPLACE FUNCTION public.log_super_admin_action(
    p_action TEXT,
    p_target_type TEXT DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.super_admin_audit_log (super_admin_id, action, target_type, target_id, details)
    VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;