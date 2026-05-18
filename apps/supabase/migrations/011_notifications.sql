-- 011_notifications.sql
-- Phase 1 — Push notification queue

CREATE TYPE notification_type AS ENUM (
    'match', 'message', 'like', 'tip',
    'stream_start', 'event_reminder', 'system'
);

CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title text NOT NULL CHECK (char_length(title) <= 200),
    body text NOT NULL CHECK (char_length(body) <= 1000),
    data jsonb,
    is_read boolean NOT NULL DEFAULT false,
    sent_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(created_at);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own notifications
CREATE POLICY notifications_self_all ON public.notifications
    FOR ALL USING (auth.uid() = user_id);
