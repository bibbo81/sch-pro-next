-- Create user_profiles table for extended user information

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    company TEXT,
    bio TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_company_idx ON public.user_profiles(company);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON public.user_profiles
    FOR SELECT
    USING (public.is_super_admin());

-- Organization admins can view profiles of their members
CREATE POLICY "Organization admins can view member profiles" ON public.user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om1
            JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
            WHERE om1.user_id = auth.uid()
            AND om1.role IN ('admin', 'owner')
            AND om2.user_id = public.user_profiles.user_id
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- Create user_settings table for app preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can manage own settings" ON public.user_settings
    FOR ALL
    USING (auth.uid() = user_id);

-- Create trigger for user_settings
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_settings TO authenticated;
GRANT USAGE ON SEQUENCE public.user_profiles_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.user_settings_id_seq TO authenticated;