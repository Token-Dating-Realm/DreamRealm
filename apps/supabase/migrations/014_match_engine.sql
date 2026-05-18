-- 014_match_engine.sql
-- Phase 2 — Geo discovery RPC, mutual-match trigger, and swipe performance

-- Function: return nearby active public profiles within a radius (meters)
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant usage so authenticated users can call the RPC
GRANT EXECUTE ON FUNCTION public.nearby_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.nearby_profiles TO anon;

-- Trigger: promote mutual swipes to 'matched' on insert/update of matches
CREATE OR REPLACE FUNCTION public.handle_mutual_match()
RETURNS TRIGGER AS $$
DECLARE
    reverse_row public.matches%ROWTYPE;
BEGIN
    -- Only act on right or super directions
    IF NEW.direction NOT IN ('right', 'super') THEN
        RETURN NEW;
    END IF;

    -- Look for the reverse pending swipe
    SELECT * INTO reverse_row
    FROM public.matches
    WHERE actor_id = NEW.target_id
      AND target_id = NEW.actor_id
      AND direction IN ('right', 'super')
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
        -- Promote both rows to matched
        UPDATE public.matches SET status = 'matched', updated_at = now() WHERE id = reverse_row.id;
        NEW.status := 'matched';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger before insert so we can mutate NEW.status
DROP TRIGGER IF EXISTS on_match_insert_mutual ON public.matches;
CREATE TRIGGER on_match_insert_mutual
    BEFORE INSERT ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_mutual_match();

-- Ensure actor can update their own pending match (needed for client-side fallback)
CREATE POLICY matches_self_update ON public.matches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = matches.actor_id AND p.user_id = auth.uid()
        )
    );
