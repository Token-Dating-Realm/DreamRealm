-- 012_ai_agent_logs.sql
-- Phase 6 ready — Audit trail for AI agent executions

CREATE TYPE ai_agent_type AS ENUM (
    'matchmaking', 'moderation', 'spam_detection',
    'trust_scoring', 'growth', 'recommendation', 'creator_assistant'
);

CREATE TABLE public.ai_agent_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_type ai_agent_type NOT NULL,
    input_hash text NOT NULL CHECK (char_length(input_hash) <= 128),
    output_summary text NOT NULL CHECK (char_length(output_summary) <= 2000),
    model_used text CHECK (char_length(model_used) <= 100),
    latency_ms integer CHECK (latency_ms >= 0),
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_agent_logs_type ON public.ai_agent_logs(agent_type);
CREATE INDEX idx_ai_agent_logs_created ON public.ai_agent_logs(created_at);

ALTER TABLE public.ai_agent_logs ENABLE ROW LEVEL SECURITY;

-- Admin / system only
CREATE POLICY ai_agent_logs_admin_all ON public.ai_agent_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'system', 'moderator')
        )
    );
