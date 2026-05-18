-- 006_streams.sql
-- Phase 4 ready — Live streaming / creator channel metadata

CREATE TYPE stream_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled');

CREATE TABLE public.streams (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL CHECK (char_length(title) <= 300),
    description text CHECK (char_length(description) <= 2000),
    status stream_status NOT NULL DEFAULT 'scheduled',
    room_token text,
    is_private boolean NOT NULL DEFAULT false,
    token_gate_min integer NOT NULL DEFAULT 0 CHECK (token_gate_min >= 0),
    scheduled_at timestamptz,
    started_at timestamptz,
    ended_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_streams_profile ON public.streams(profile_id);
CREATE INDEX idx_streams_status ON public.streams(status);
CREATE INDEX idx_streams_scheduled ON public.streams(scheduled_at);

ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

-- Creator can manage their streams
CREATE POLICY streams_creator_all ON public.streams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = streams.profile_id AND p.user_id = auth.uid()
        )
    );

-- Public can read non-private upcoming/live streams of active public profiles
CREATE POLICY streams_public_read ON public.streams
    FOR SELECT USING (
        is_private = false
        AND status IN ('scheduled', 'live')
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = streams.profile_id AND p.is_active = true AND p.visibility = 'public'
        )
    );

-- TODO: Phase 4 — Token-gated access policy (DreamCoin balance check)
