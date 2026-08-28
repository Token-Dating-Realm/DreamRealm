-- Gamification: Inventory Items & User Inventory
-- Collectible items, badges, cosmetics, titles, and avatar frames

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'collectible',
  rarity TEXT NOT NULL DEFAULT 'common',
  icon_url TEXT,
  is_tradable BOOLEAN NOT NULL DEFAULT FALSE,
  is_consumable BOOLEAN NOT NULL DEFAULT FALSE,
  max_stack INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_type ON inventory_items(type);
CREATE INDEX idx_inventory_items_rarity ON inventory_items(rarity);

-- User inventory (what each user owns)
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  UNIQUE (user_id, item_id)
);

CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_equipped ON user_inventory(user_id, is_equipped) WHERE is_equipped = true;

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- Everyone can view item definitions
CREATE POLICY inventory_items_public_select ON inventory_items
  FOR SELECT USING (true);

-- Users can view their own inventory
CREATE POLICY user_inventory_own_select ON user_inventory
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert into user inventory (rewards, purchases, achievements)
CREATE POLICY user_inventory_system_insert ON user_inventory
  FOR INSERT WITH CHECK (true);

-- Users can update equipped status
CREATE POLICY user_inventory_own_update ON user_inventory
  FOR UPDATE USING (auth.uid() = user_id);

-- Seed starter items
INSERT INTO inventory_items (slug, name, description, type, rarity, icon_url, is_tradable, is_consumable, max_stack)
VALUES
  ('founder_badge', 'Founder Badge', 'Awarded to early DreamRealm pioneers who helped shape the world.', 'badge', 'legendary', null, false, false, 1),
  ('socialite_title', 'Socialite Title', 'Equip this title to display your social prowess.', 'title', 'rare', null, false, false, 1),
  ('dream_coin_pouch', 'Dream Coin Pouch', 'A small pouch containing 100 DreamCoins. Consumable.', 'consumable', 'common', null, false, true, 99),
  ('neon_avatar_frame', 'Neon Avatar Frame', 'A glowing cyber-fantasy frame for your profile picture.', 'avatar_frame', 'epic', null, false, false, 1),
  ('realm_builder_hammer', 'Realm Builder Hammer', 'A symbolic tool for realm creators.', 'tool', 'rare', null, false, false, 1),
  ('mystery_box', 'Mystery Box', 'What secrets does it hold? Open to find out.', 'collectible', 'uncommon', null, false, true, 50)
ON CONFLICT (slug) DO NOTHING;
