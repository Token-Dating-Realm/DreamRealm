-- Account Settings: preferences + soft-delete
-- Backs the Settings page toggles (dark mode, notifications, visibility,
-- location) and the Delete Account flow.

-- Per-profile display/notification/privacy preferences, free-form so the
-- client can add new toggles without another migration.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Soft-delete flag for the enriched users table. Deleting an account sets
-- this to false and signs the user out, rather than hard-deleting rows.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active) WHERE is_active = false;
