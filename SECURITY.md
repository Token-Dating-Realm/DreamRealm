# Security Policy — DreamRealm

## Reporting

If you discover a vulnerability, email security@dreamrealm.example privately.

## Secure Defaults

- All database tables enforce Row Level Security (RLS).
- No raw SQL in client code; all DB access via Supabase SDK or Edge Functions.
- Secrets (service role keys, API keys) never ship to the client bundle.
- `SUPABASE_SERVICE_ROLE_KEY` is used only in server contexts and Edge Functions.

## Authentication

- Supabase Auth with secure email + OAuth providers.
- Password minimum length enforced in Zod schema (8) and Supabase Auth config.
- Device fingerprinting and geo-anomaly detection planned (Phase 6).

## Encryption

- End-to-end encryption for private chats (Phase 3).
- Encrypted media keys stored in `media.encryption_key_id`.
- TODO: Integrate WebCrypto / libsodium for message and media encryption.

## Compliance

- GDPR deletion hooks (account deletion cascades via ON DELETE CASCADE).
- Audit logs in `ai_agent_logs` and `transactions` tables.

## Secrets

| Variable | Scope | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client / Server | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client / Server | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server / Edge | Yes |
| `OPENAI_API_KEY` | Edge Functions (AI agents) | Phase 6 |
| `LIVEKIT_API_KEY` | Edge Functions (Streaming) | Phase 4 |
| `LIVEKIT_API_SECRET` | Edge Functions (Streaming) | Phase 4 |
| `STRIPE_SECRET_KEY` | Edge Functions (Payments) | Phase 5 |
| `APPLE_CLIENT_SECRET` | OAuth | Phase 1 |
| `GOOGLE_CLIENT_SECRET` | OAuth | Phase 1 |
