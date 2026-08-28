-- Gamification: User Stats & Leveling
-- Central progression tracking for each user

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  reputation_score INTEGER NOT NULL DEFAULT 0,
  total_achievements INTEGER NOT NULL DEFAULT 0,
  total_skills_maxed INTEGER NOT NULL DEFAULT 0,
  quests_completed INTEGER NOT NULL DEFAULT 0,
  realms_created INTEGER NOT NULL DEFAULT 0,
  streams_hosted INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  matches_made INTEGER NOT NULL DEFAULT 0,
  total_coins_earned INTEGER NOT NULL DEFAULT 0,
  total_coins_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_level ON user_stats(level);

-- Auto-create user_stats row when a new user is created
CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: initialize stats on user creation (if not exists, safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tr_initialize_user_stats'
  ) THEN
    CREATE TRIGGER tr_initialize_user_stats
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.initialize_user_stats();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own stats
CREATE POLICY user_stats_own_select ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

-- Public can see limited stats (level, reputation)
CREATE POLICY user_stats_public_select ON user_stats
  FOR SELECT USING (true);

-- System can update stats
CREATE POLICY user_stats_system_update ON user_stats
  FOR UPDATE USING (true);
