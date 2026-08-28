-- 002_profiles.sql
-- Phase 1 — Profile system with all 14 modes and geo-location

CREATE TYPE profile_mode AS ENUM (
    'single_male',
    'single_female',
    'nonbinary',
    'couple_mf',
    'couple_mm',
    'couple_ff',
    'poly_open',
    'friends_only',
    'casual_dating',
    'serious_dating',
    'local_meetups',
    'swing_lifestyle',
    'creator_influencer',
    'verified_professional'
);

CREATE TYPE visibility_level AS ENUM ('public', 'friends', 'matches', 'private');

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mode profile_mode NOT NULL,
    display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
    bio text CHECK (char_length(bio) <= 2000),
    birth_date date,
    city text CHECK (char_length(city) <= 100),
    country text CHECK (char_length(country) <= 100),
    latitude double precision CHECK (latitude BETWEEN -90 AND 90),
    longitude double precision CHECK (longitude BETWEEN -180 AND 180),
    looking_for profile_mode[] DEFAULT ARRAY[]::profile_mode[],
    visibility visibility_level NOT NULL DEFAULT 'public',
    is_verified boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    trust_score integer NOT NULL DEFAULT 0 CHECK (trust_score BETWEEN 0 AND 100),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT one_profile_per_user UNIQUE (user_id)
);

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Geo index for nearby queries (PostGIS)
CREATE INDEX idx_profiles_location ON public.profiles USING gist (
    st_setsrid(st_makepoint(longitude, latitude), 4326)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX idx_profiles_mode ON public.profiles(mode);
CREATE INDEX idx_profiles_visibility ON public.profiles(visibility);
CREATE INDEX idx_profiles_active ON public.profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_city ON public.profiles(city);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage their own profile
CREATE POLICY profiles_self_all ON public.profiles
    FOR ALL USING (auth.uid() = user_id);

-- Public can read public profiles (active only)
CREATE POLICY profiles_public_read ON public.profiles
    FOR SELECT USING (visibility = 'public' AND is_active = true);

-- Admins can read all
CREATE POLICY profiles_admin_read ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'moderator')
        )
    );

-- Function: create default profile after user record is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, mode, display_name)
    VALUES (
        NEW.id,
        'single_male', -- default; user updates during onboarding
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, auth;

REVOKE ALL ON FUNCTION public.handle_new_profile() FROM PUBLIC;

CREATE TRIGGER on_user_created_profile
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();
