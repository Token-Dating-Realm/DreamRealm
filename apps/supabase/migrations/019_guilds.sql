-- Social: Guilds (Clans)
-- User-created groups with roles, levels, and XP

CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  emblem_url TEXT,
  banner_url TEXT,
  is_recruiting BOOLEAN NOT NULL DEFAULT TRUE,
  min_level_required INTEGER NOT NULL DEFAULT 1,
  member_count INTEGER NOT NULL DEFAULT 0,
  total_guild_xp INTEGER NOT NULL DEFAULT 0,
  guild_level INTEGER NOT NULL DEFAULT 1,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guilds_slug ON guilds(slug);
CREATE INDEX idx_guilds_recruiting ON guilds(is_recruiting, min_level_required);
CREATE INDEX idx_guilds_created_by ON guilds(created_by);

-- Guild memberships
CREATE TABLE IF NOT EXISTS guild_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'recruit',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  guild_xp_contributed INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (guild_id, user_id)
);

CREATE INDEX idx_guild_memberships_guild ON guild_memberships(guild_id);
CREATE INDEX idx_guild_memberships_user ON guild_memberships(user_id);

-- Enable RLS
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_memberships ENABLE ROW LEVEL SECURITY;

-- Everyone can view guilds
CREATE POLICY guilds_public_select ON guilds FOR SELECT USING (true);

-- Founders can update their guild
CREATE POLICY guilds_founder_update ON guilds
  FOR UPDATE USING (auth.uid() = created_by);

-- Authenticated users can create guilds
CREATE POLICY guilds_insert ON guilds
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Members can view their own memberships
CREATE POLICY guild_memberships_own_select ON guild_memberships
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view active memberships (for guild member lists)
CREATE POLICY guild_memberships_public_select ON guild_memberships
  FOR SELECT USING (is_active = true);

-- Members can insert their own membership
CREATE POLICY guild_memberships_own_insert ON guild_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Officers/founders can update member roles (edge function or trigger typically)
CREATE POLICY guild_memberships_role_update ON guild_memberships
  FOR UPDATE USING (true);

-- Seed a sample guild
INSERT INTO guilds (slug, name, description, emblem_url, is_recruiting, min_level_required, created_by)
VALUES
  ('dream_council', 'Dream Council', 'The founding guild of DreamRealm. Architects, visionaries, and world-builders unite.', null, true, 5, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (slug) DO NOTHING;
