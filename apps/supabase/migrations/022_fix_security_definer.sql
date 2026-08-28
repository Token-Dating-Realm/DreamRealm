-- 022_fix_security_definer.sql
-- Security hardening fix-up for all functions originally created with
-- SECURITY DEFINER but without an explicit search_path.
--
-- SECURITY DEFINER is required for auth triggers and edge-function RPC
-- helpers, but without a fixed search_path a malicious user can shadow
-- public tables (e.g. create their own "users" table) and trick the
-- function into reading or writing attacker-controlled data with
-- superuser privileges (CVE-class search_path injection).
--
-- Fix: Recreate each function with an explicit SET search_path so all
-- schema-qualified references are unambiguous, and REVOKE direct execute
-- from PUBLIC so they can only run via their intended trigger / RPC path.
--
-- NOTE: Phase 4.1 helpers (initialize_user_stats, upsert_user_presence) are
-- deliberately excluded — they were never created with SECURITY DEFINER and
-- must remain SECURITY INVOKER (the plpgsql default) to respect RLS.
-- Also: handle_mutual_match (014) is not SECURITY DEFINER and is not touched.

-- ---------------------------------------------------------------------------
-- 1. Auth / user triggers
-- ---------------------------------------------------------------------------

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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth;

-- ---------------------------------------------------------------------------
-- 2. Profile trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, mode, display_name)
    VALUES (
        NEW.id,
        'single_male',
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth;

-- ---------------------------------------------------------------------------
-- 3. Wallet trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth;

-- ---------------------------------------------------------------------------
-- 4. Subscription trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, tier)
    VALUES (NEW.id, 'free');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth;

-- ---------------------------------------------------------------------------
-- 5. Trust score trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.trust_scores (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth;

-- ---------------------------------------------------------------------------
-- 6. Conversation last-message trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth;

-- ---------------------------------------------------------------------------
-- 7. Nearby profiles RPC (bypasses RLS intentionally — self-filtered)
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER is kept because the function must run a spatial query
-- over all active public profiles.  The WHERE clause replicates the
-- profiles_public_read RLS policy so the effect is identical.
-- Marked as stable for query planning.

CREATE OR REPLACE FUNCTION public.nearby_profiles(
    p_latitude double precision,
    p_longitude double precision,
    p_radius_meters double precision DEFAULT 50000,
    p_exclude_profile_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 20
)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    mode public.profile_mode,
    display_name text,
    bio text,
    birth_date date,
    city text,
    country text,
    latitude double precision,
    longitude double precision,
    looking_for public.profile_mode[],
    visibility public.visibility_level,
    is_verified boolean,
    is_active boolean,
    trust_score integer,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.user_id,
        p.mode,
        p.display_name,
        p.bio,
        p.birth_date,
        p.city,
        p.country,
        p.latitude,
        p.longitude,
        p.looking_for,
        p.visibility,
        p.is_verified,
        p.is_active,
        p.trust_score,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.is_active = true
      AND p.visibility = 'public'
      AND (p_exclude_profile_id IS NULL OR p.id <> p_exclude_profile_id)
      AND p.latitude IS NOT NULL
      AND p.longitude IS NOT NULL
      AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
          p_radius_meters
      )
    ORDER BY ST_Distance(
        ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography
    )
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, auth;

REVOKE ALL ON FUNCTION public.nearby_profiles FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.nearby_profiles TO authenticated;

COMMENT ON FUNCTION public.nearby_profiles IS
    'RPC: returns nearby active public profiles. SECURITY DEFINER is intentional — the WHERE clause replicates the profiles_public_read RLS policy. Spatial index idx_profiles_location is required for performance.';
