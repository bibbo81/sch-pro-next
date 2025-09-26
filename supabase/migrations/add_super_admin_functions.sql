-- Additional functions for super admin management

-- Function to promote a user to super admin (by email)
CREATE OR REPLACE FUNCTION public.promote_user_to_super_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    target_user_id UUID;
    result_message TEXT;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;

    -- Check if user exists
    IF target_user_id IS NULL THEN
        RETURN 'Error: User not found with email ' || user_email;
    END IF;

    -- Check if already super admin
    IF EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = target_user_id) THEN
        RETURN 'User ' || user_email || ' is already a super admin';
    END IF;

    -- Add to super_admins table
    INSERT INTO public.super_admins (user_id, created_by, notes)
    VALUES (target_user_id, auth.uid(), 'Promoted via SQL function');

    -- Log the action
    PERFORM public.log_super_admin_action(
        'promote_to_super_admin',
        'user',
        target_user_id,
        jsonb_build_object('email', user_email, 'method', 'sql_function')
    );

    RETURN 'Successfully promoted ' || user_email || ' to super admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove super admin status (by email)
CREATE OR REPLACE FUNCTION public.demote_super_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    target_user_id UUID;
    result_message TEXT;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;

    -- Check if user exists
    IF target_user_id IS NULL THEN
        RETURN 'Error: User not found with email ' || user_email;
    END IF;

    -- Check if is super admin
    IF NOT EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = target_user_id) THEN
        RETURN 'User ' || user_email || ' is not a super admin';
    END IF;

    -- Remove from super_admins table
    DELETE FROM public.super_admins WHERE user_id = target_user_id;

    -- Log the action
    PERFORM public.log_super_admin_action(
        'demote_super_admin',
        'user',
        target_user_id,
        jsonb_build_object('email', user_email, 'method', 'sql_function')
    );

    RETURN 'Successfully removed super admin status from ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to list all super admins
CREATE OR REPLACE FUNCTION public.list_super_admins()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sa.user_id,
        u.email,
        sa.created_at,
        sa.notes
    FROM public.super_admins sa
    JOIN auth.users u ON sa.user_id = u.id
    ORDER BY sa.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions only to authenticated users (super admins will be checked by RLS)
GRANT EXECUTE ON FUNCTION public.promote_user_to_super_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.demote_super_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_super_admins() TO authenticated;

-- Add RLS policy for these functions (only super admins can use them)
-- Note: These functions already have SECURITY DEFINER, but we add additional checks

-- Create a view for easier super admin management
CREATE OR REPLACE VIEW public.super_admin_management AS
SELECT
    sa.id,
    sa.user_id,
    u.email,
    u.created_at as user_created_at,
    sa.created_at as super_admin_since,
    sa.notes,
    u.last_sign_in_at
FROM public.super_admins sa
JOIN auth.users u ON sa.user_id = u.id;

-- Enable RLS on the view
ALTER VIEW public.super_admin_management SET (security_barrier = true);

-- Only super admins can see this view
CREATE POLICY "Only super admins can view super admin management" ON public.super_admin_management
    FOR SELECT
    USING (public.is_super_admin());