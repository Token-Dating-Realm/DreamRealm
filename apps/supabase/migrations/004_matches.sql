-- 004_matches.sql
-- Phase 1 / 2 — Swipe history and match status

CREATE TYPE match_direction AS ENUM ('left', 'right', 'super');
CREATE TYPE match_status AS ENUM ('pending', 'matched', 'blocked', 'expired');

CREATE TABLE public.matches (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    direction match_direction NOT NULL,
    status match_status NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT no_self_swipe CHECK (actor_id <> target_id)
);

CREATE INDEX idx_matches_actor ON public.matches(actor_id);
CREATE INDEX idx_matches_target ON public.matches(target_id);
CREATE INDEX idx_matches_status ON public.matches(status);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Users can see matches where they are actor or target and status is 'matched'
CREATE POLICY matches_self_read ON public.matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE (p.id = matches.actor_id OR p.id = matches.target_id)
              AND p.user_id = auth.uid()
        )
    );

-- Users can insert their own swipes
CREATE POLICY matches_self_insert ON public.matches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = matches.actor_id AND p.user_id = auth.uid()
        )
    );

-- TODO: Phase 2 — Add edge function / trigger for mutual-match promotion to 'matched'
