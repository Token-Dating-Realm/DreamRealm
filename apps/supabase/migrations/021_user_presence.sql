-- Presence: User Mood & Status
-- Real-time presence tracking with mood, activity, and location

CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'online',
  mood TEXT,
  status_message TEXT,
  current_realm_id UUID REFERENCES public.realms(id) ON DELETE SET NULL,
  current_activity TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_presence_status ON user_presence(status);
CREATE INDEX idx_user_presence_realm ON user_presence(current_realm_id);
CREATE INDEX idx_user_presence_last_seen ON user_presence(last_seen_at);

-- Enable RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Everyone can see presence (for social features, friend lists)
CREATE POLICY user_presence_public_select ON user_presence
  FOR SELECT USING (true);

-- Users can update their own presence
CREATE POLICY user_presence_own_update ON user_presence
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own presence
CREATE POLICY user_presence_own_insert ON user_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Upsert helper for presence updates
CREATE OR REPLACE FUNCTION public.upsert_user_presence(
  p_user_id UUID,
  p_status TEXT DEFAULT 'online',
  p_mood TEXT DEFAULT NULL,
  p_status_message TEXT DEFAULT NULL,
  p_current_realm_id UUID DEFAULT NULL,
  p_current_activity TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, status, mood, status_message, current_realm_id, current_activity, last_seen_at, updated_at)
  VALUES (p_user_id, p_status, p_mood, p_status_message, p_current_realm_id, p_current_activity, NOW(), NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    mood = EXCLUDED.mood,
    status_message = EXCLUDED.status_message,
    current_realm_id = EXCLUDED.current_realm_id,
    current_activity = EXCLUDED.current_activity,
    last_seen_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
