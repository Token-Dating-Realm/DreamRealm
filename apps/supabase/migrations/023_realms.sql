-- Social: Realms
-- User-browsable communities within DreamRealm, with membership tracking.
-- packages/api-client/src/database.ts already declares the `realms` and
-- `realm_members` Row types; this migration creates the tables that back them.

CREATE TABLE IF NOT EXISTS realms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Social',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  member_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_realms_category ON realms(category);
CREATE INDEX idx_realms_featured ON realms(is_featured);

CREATE TRIGGER realms_updated_at
  BEFORE UPDATE ON realms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Realm memberships
CREATE TABLE IF NOT EXISTS realm_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id UUID NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (realm_id, user_id)
);

CREATE INDEX idx_realm_members_realm ON realm_members(realm_id);
CREATE INDEX idx_realm_members_user ON realm_members(user_id);

-- Keep realms.member_count in sync with realm_members rows
CREATE OR REPLACE FUNCTION public.sync_realm_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.realms SET member_count = member_count + 1 WHERE id = NEW.realm_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.realms SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.realm_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth;

REVOKE ALL ON FUNCTION public.sync_realm_member_count() FROM PUBLIC;

CREATE TRIGGER tr_sync_realm_member_count
  AFTER INSERT OR DELETE ON realm_members
  FOR EACH ROW EXECUTE FUNCTION public.sync_realm_member_count();

-- Enable RLS
ALTER TABLE realms ENABLE ROW LEVEL SECURITY;
ALTER TABLE realm_members ENABLE ROW LEVEL SECURITY;

-- Everyone can view realms
CREATE POLICY realms_public_select ON realms
  FOR SELECT USING (true);

-- Authenticated users can create realms
CREATE POLICY realms_insert ON realms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Creators can update their own realms
CREATE POLICY realms_creator_update ON realms
  FOR UPDATE USING (auth.uid() = created_by);

-- Anyone can view realm membership rosters
CREATE POLICY realm_members_public_select ON realm_members
  FOR SELECT USING (true);

-- Users can join a realm on their own behalf
CREATE POLICY realm_members_own_insert ON realm_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave a realm they belong to
CREATE POLICY realm_members_own_delete ON realm_members
  FOR DELETE USING (auth.uid() = user_id);

-- Seed the realms shown in apps/web/src/app/lib/realms.ts (SAMPLE_REALMS)
INSERT INTO realms (slug, name, description, category, status, member_count, is_featured, created_at, updated_at)
VALUES
  ('temple-of-thoughts', 'The Temple of Thoughts',
   'A quiet sanctuary for deep conversations, philosophical debates, and meaningful connection through ideas. Leave small talk at the door.',
   'Intellectual', 'active', 12480, true, '2024-01-15T00:00:00Z', '2025-05-10T00:00:00Z'),
  ('cupids-corner', 'Cupid''s Corner',
   'The heart of DreamRealm dating. Browse, match, and spark romance in a space designed for genuine connections.',
   'Dating', 'active', 89340, true, '2024-02-01T00:00:00Z', '2025-05-12T00:00:00Z'),
  ('creators-market', 'The Creator''s Market',
   'A bustling bazaar of creative minds. Share your art, discover collaborators, and monetize your passion with DreamCoin.',
   'Creative', 'active', 34200, true, '2024-03-10T00:00:00Z', '2025-05-11T00:00:00Z'),
  ('dating-dreamer-lounge', 'Dating Dreamer Lounge',
   'A relaxed lounge for dreamers and romantics. Share stories, plan dates, and find your kindred spirit in a laid-back atmosphere.',
   'Dating', 'active', 56700, false, '2024-04-05T00:00:00Z', '2025-05-09T00:00:00Z'),
  ('afterdark-realm', 'The AfterDark Realm',
   'For the night owls and the bold. A space for mature conversations, late-night streams, and electrifying encounters after sunset.',
   'Social', 'active', 21500, false, '2024-05-20T00:00:00Z', '2025-05-13T00:00:00Z'),
  ('business-builder-realm', 'Business Builder Realm',
   'Connect with founders, investors, and professionals. Pitch ideas, find co-founders, and grow your empire within the Dreamcadian ecosystem.',
   'Business', 'beta', 8700, false, '2024-06-15T00:00:00Z', '2025-05-08T00:00:00Z')
ON CONFLICT (slug) DO NOTHING;
