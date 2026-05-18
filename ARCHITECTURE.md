# DreamRealm Architecture

## Overview

DreamRealm is a monorepo-powered dating ecosystem built for massive scale.

## Repository Structure

- `packages/config` — Environment validation, feature flags, constants.
- `packages/types` — Zod schemas + TypeScript types for all DB entities.
- `packages/api-client` — Supabase client factory (browser / server / middleware) + typed Database interface.
- `packages/ui` — Shared theme tokens (colors, spacing, typography).
- `apps/web` — Next.js 15 App Router web client.
- `apps/mobile` — Expo 52 React Native client (file-based routing via expo-router).
- `apps/supabase` — PostgreSQL migrations and Edge Functions.

## Data Flow

```
[ Mobile / Web ]  <-- Supabase SDK (RLS-safe) -->  [ Supabase Auth + PostgreSQL ]
                           |
                    Edge Functions (service role)
                           |
              [ AI Agents | Streaming | Payments ]
```

## Auth

Supabase Auth owns identity. Public tables (`users`, `profiles`, etc.) mirror auth metadata via triggers and enforce RLS.

## Security Model

- JWT from Supabase Auth drives RLS policies.
- `users.role` elevates access for moderators and admins.
- Service role bypasses RLS only in Edge Functions / server code.

## Scalability

- PostGIS for geo queries.
- Indexed status/visibility columns for feed and match queries.
- TODO: Add read replicas and caching layers (Redis) as scale demands.

## Phases

| Phase | Focus |
|---|---|
| 1 | Monorepo, schema, auth, app shells |
| 2 | Profiles, media, matching, swiping |
| 3 | Messaging, E2E encryption, push |
| 4 | Streaming, creator channels |
| 5 | DreamCoin, subscriptions, payments |
| 6 | AI agents, moderation, fraud detection |
| 7 | Deployment, stores, CI/CD, monitoring |
