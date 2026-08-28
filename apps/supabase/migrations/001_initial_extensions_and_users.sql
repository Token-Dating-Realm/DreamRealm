-- 001_initial_extensions_and_users.sql
-- Phase 1 — Auth extensions, custom user fields, and device fingerprinting

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom enum types
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin', 'system');
CREATE TYPE trust_bucket AS ENUM ('new', 'verified', 'trusted', 'vip', 'flagged');

-- Enriched users table extending Supabase Auth users
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    email_confirmed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    last_sign_in_at timestamptz,
    raw_user_meta_data jsonb,
    device_fingerprint text,
    geo_region text,
    trust_bucket trust_bucket NOT NULL DEFAULT 'new'
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Row Level Security: users can only read/write their own record
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_self ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_self ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY users_insert_self ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role and admins full access
CREATE POLICY users_admin_all ON public.users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'moderator')
        )
    );

-- Function: create public user record on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, email_confirmed_at, raw_user_meta_data)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.email_confirmed_at,
        NEW.raw_user_meta_data
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, auth;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
