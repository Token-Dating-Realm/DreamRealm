-- Social: Friendships
-- Bidirectional relationship tracking between users

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id, status);

-- Ensure requester_id < addressee_id for canonical ordering in mutual queries (optional)
-- But we keep the directed edge for richer semantics.

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can see their own friendships
CREATE POLICY friendships_own_select ON friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can create friend requests
CREATE POLICY friendships_request_insert ON friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Either party can update status (accept/block/mute)
CREATE POLICY friendships_update ON friendships
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Only involved parties can delete
CREATE POLICY friendships_delete ON friendships
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
