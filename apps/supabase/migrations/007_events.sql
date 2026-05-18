-- 007_events.sql
-- Phase 1 — Local meetups and event hotspots

CREATE TABLE public.events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL CHECK (char_length(title) <= 300),
    description text CHECK (char_length(description) <= 5000),
    city text NOT NULL CHECK (char_length(city) <= 100),
    country text CHECK (char_length(country) <= 100),
    latitude double precision CHECK (latitude BETWEEN -90 AND 90),
    longitude double precision CHECK (longitude BETWEEN -180 AND 180),
    starts_at timestamptz NOT NULL,
    ends_at timestamptz,
    max_attendees integer CHECK (max_attendees >= 1),
    is_private boolean NOT NULL DEFAULT false,
    token_gate_min integer NOT NULL DEFAULT 0 CHECK (token_gate_min >= 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_city ON public.events(city);
CREATE INDEX idx_events_starts ON public.events(starts_at);
CREATE INDEX idx_events_location ON public.events USING gist (
    st_setsrid(st_makepoint(longitude, latitude), 4326)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Organizer can manage their events
CREATE POLICY events_organizer_all ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = events.profile_id AND p.user_id = auth.uid()
        )
    );

-- Public can read non-private events of active public profiles
CREATE POLICY events_public_read ON public.events
    FOR SELECT USING (
        is_private = false
        AND starts_at > now() - interval '1 day'
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = events.profile_id AND p.is_active = true AND p.visibility = 'public'
        )
    );
