-- 010_trust_and_moderation.sql
-- Phase 6 ready — Reports and trust scores

CREATE TYPE report_reason AS ENUM (
    'spam', 'harassment', 'fake_profile', 'underage',
    'violence', 'hate_speech', 'nudity', 'scam', 'other'
);
CREATE TYPE report_status AS ENUM ('open', 'under_review', 'resolved', 'dismissed');

CREATE TABLE public.reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason report_reason NOT NULL,
    details text CHECK (char_length(details) <= 5000),
    status report_status NOT NULL DEFAULT 'open',
    assigned_moderator_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    resolved_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.trust_scores (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    overall integer NOT NULL DEFAULT 0 CHECK (overall BETWEEN 0 AND 100),
    identity integer NOT NULL DEFAULT 0 CHECK (identity BETWEEN 0 AND 100),
    behavior integer NOT NULL DEFAULT 0 CHECK (behavior BETWEEN 0 AND 100),
    community integer NOT NULL DEFAULT 0 CHECK (community BETWEEN 0 AND 100),
    transaction integer NOT NULL DEFAULT 0 CHECK (transaction BETWEEN 0 AND 100),
    ai_insights jsonb,
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT one_trust_score_per_user UNIQUE (user_id)
);

CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX idx_reports_reported ON public.reports(reported_profile_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_assigned ON public.reports(assigned_moderator_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_scores ENABLE ROW LEVEL SECURITY;

-- Reporter can read their own reports
CREATE POLICY reports_reporter_read ON public.reports
    FOR SELECT USING (
        reporter_id = (
            SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
        )
    );

-- Moderators / Admins can read and update all reports
CREATE POLICY reports_moderator_all ON public.reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('moderator', 'admin')
        )
    );

-- Users can read their own trust score
CREATE POLICY trust_scores_self_read ON public.trust_scores
    FOR SELECT USING (auth.uid() = user_id);

-- Admin full access to trust scores
CREATE POLICY trust_scores_admin_all ON public.trust_scores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'system')
        )
    );

-- Trigger: create default trust score on user creation
CREATE OR REPLACE FUNCTION public.handle_new_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.trust_scores (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions, auth;

REVOKE ALL ON FUNCTION public.handle_new_trust_score() FROM PUBLIC;

CREATE TRIGGER on_user_created_trust_score
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_trust_score();
