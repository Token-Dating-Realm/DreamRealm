-- 023_e2e_key_exchange.sql
-- Phase 3 — Public-key material for client-side E2E message encryption
--
-- Each profile publishes an ECDH (P-256) public key. Conversation creators
-- generate a random AES-GCM key per conversation and wrap a copy of it for
-- every member using ECDH(creator_private, member_public) — the same shared
-- secret each member can independently re-derive as ECDH(member_private,
-- creator_public) to unwrap their copy. Private keys never leave the client.

ALTER TABLE public.profiles ADD COLUMN public_key text;

ALTER TABLE public.conversation_members ADD COLUMN wrapped_key text;

COMMENT ON COLUMN public.profiles.public_key IS
    'Base64-encoded SPKI ECDH (P-256) public key used to wrap per-conversation AES keys for this profile. Client-generated; the matching private key is never sent to the server.';

COMMENT ON COLUMN public.conversation_members.wrapped_key IS
    'Base64-encoded AES-KW wrapped copy of the conversation''s AES-GCM key, wrapped for this member via ECDH with the conversation creator''s key pair. Null until both the creator and this member have published a public_key.';
