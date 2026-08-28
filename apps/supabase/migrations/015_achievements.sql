-- Gamification: Achievements
-- Awards users can unlock for platform activity

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'social',
  rarity TEXT NOT NULL DEFAULT 'common',
  icon_url TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  unlock_condition TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_achievements_sort_order ON achievements(sort_order);

-- User achievements (unlock records)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Everyone can view achievements
CREATE POLICY achievements_public_select ON achievements
  FOR SELECT USING (true);

-- Users can view their own achievements
CREATE POLICY user_achievements_own_select ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert achievements (via triggers or edge functions)
CREATE POLICY user_achievements_system_insert ON user_achievements
  FOR INSERT WITH CHECK (true);

-- Seed sample achievements
INSERT INTO achievements (slug, name, description, category, rarity, xp_reward, coin_reward, unlock_condition, sort_order)
VALUES
  ('first_steps', 'First Steps', 'Create your DreamRealm profile and enter the world.', 'social', 'common', 50, 10, 'profile_created', 1),
  ('social_butterfly', 'Social Butterfly', 'Send 100 messages across realms.', 'social', 'common', 100, 25, 'messages_sent >= 100', 2),
  ('realm_explorer', 'Realm Explorer', 'Join 5 different realms.', 'explorer', 'common', 150, 50, 'realms_joined >= 5', 3),
  ('matchmaker', 'Matchmaker', 'Make 10 mutual connections.', 'romance', 'uncommon', 200, 75, 'matches_made >= 10', 4),
  ('content_creator', 'Content Creator', 'Host your first live stream.', 'creator', 'uncommon', 300, 100, 'streams_hosted >= 1', 5),
  ('guild_founder', 'Guild Founder', 'Create or lead a guild with 10+ members.', 'social', 'rare', 500, 200, 'guild_members >= 10', 6),
  ('market_mogul', 'Market Mogul', 'Complete 50 marketplace transactions.', 'trader', 'rare', 750, 300, 'marketplace_transactions >= 50', 7),
  ('legendary_dreamer', 'Legendary Dreamer', 'Reach level 50 and unlock all common achievements.', 'social', 'legendary', 2000, 1000, 'level >= 50 AND all_common_achievements', 8),
  ('mystery_seeker', 'Mystery Seeker', 'Complete a hidden quest without hints.', 'mystery', 'epic', 1000, 500, 'hidden_quest_completed', 9),
  ('night_owl', 'Night Owl', 'Be active on the platform between 2 AM and 5 AM.', 'social', 'common', 75, 15, 'activity_02_05', 10)
ON CONFLICT (slug) DO NOTHING;
