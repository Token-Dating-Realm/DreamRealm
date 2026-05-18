-- 003_media.sql
-- Phase 1 — Media uploads metadata with encryption key support

CREATE TYPE media_type AS ENUM ('image', 'video', 'voice', 'document');

CREATE TABLE public.media (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type media_type NOT NULL,
    url text NOT NULL,
    thumbnail_url text,
    blurhash text,
    is_private boolean NOT NULL DEFAULT false,
    encryption_key_id text,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_profile ON public.media(profile_id);
CREATE INDEX idx_media_private ON public.media(is_private);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Owner can manage their media
CREATE POLICY media_owner_all ON public.media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = media.profile_id AND p.user_id = auth.uid()
        )
    );

-- Public can read non-private media of active public profiles
CREATE POLICY media_public_read ON public.media
    FOR SELECT USING (
        is_private = false AND
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = media.profile_id
              AND p.is_active = true
              AND p.visibility = 'public'
        )
    );

-- Matches can read media of matched profiles (Phase 2)
-- TODO: Add match-based policy after match engine is built.
