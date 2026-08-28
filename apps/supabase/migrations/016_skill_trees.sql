-- Gamification: Skill Trees & User Skills
-- RPG-style progression system for user abilities

CREATE TABLE IF NOT EXISTS skill_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'social',
  max_level INTEGER NOT NULL DEFAULT 10,
  icon_url TEXT,
  parent_skill_id UUID REFERENCES skill_trees(id) ON DELETE SET NULL,
  xp_per_level INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skill_trees_category ON skill_trees(category);
CREATE INDEX idx_skill_trees_parent_id ON skill_trees(parent_skill_id);

-- User skill progression
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skill_trees(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 0,
  current_xp INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_leveled_at TIMESTAMPTZ,
  UNIQUE (user_id, skill_id)
);

CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);

-- Enable RLS
ALTER TABLE skill_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- Everyone can view skill trees
CREATE POLICY skill_trees_public_select ON skill_trees
  FOR SELECT USING (true);

-- Users can view their own skills
CREATE POLICY user_skills_own_select ON user_skills
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert/update user skills
CREATE POLICY user_skills_system_insert ON user_skills
  FOR INSERT WITH CHECK (true);
CREATE POLICY user_skills_system_update ON user_skills
  FOR UPDATE USING (true);

-- Seed sample skill trees
INSERT INTO skill_trees (slug, name, description, category, max_level, xp_per_level)
VALUES
  ('social_charm', 'Social Charm', 'Improve your ability to connect with others and build relationships.', 'social', 20, 100),
  ('creative_vision', 'Creative Vision', 'Unlock advanced creator tools and increase content visibility.', 'creativity', 15, 120),
  ('market_wisdom', 'Market Wisdom', 'Reduce marketplace fees and access rare trading opportunities.', 'trader', 15, 150),
  ('leadership_presence', 'Leadership Presence', 'Guild management bonuses and increased member capacity.', 'leadership', 20, 200),
  ('stealth_profile', 'Stealth Profile', 'Advanced privacy controls and incognito browsing abilities.', 'stealth', 10, 80),
  ('magic_streamer', 'Magic Streamer', 'Enhanced streaming quality, overlays, and audience interaction tools.', 'magic', 15, 100),
  ('combat_banter', 'Combat Banter', 'Win debates, trivia, and competitive chat challenges.', 'combat', 12, 90),
  ('crafting_artisan', 'Crafting Artisan', 'Create and sell custom realm assets, items, and cosmetics.', 'crafting', 15, 110)
ON CONFLICT (slug) DO NOTHING;
