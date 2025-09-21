# Cursor README — Canopi Backend Kickoff

## Context
Implement the backend for Canopi 2 in stages. The frontend will attach later. Use this doc plus the Canopi 2 spec as the source of truth.

## Tech
- Node + TypeScript
- Express (REST) + ws (WebSocket)
- Prisma (PostgreSQL)
- Redis client for presence, rate limits, and Live gating
- S3‑compatible storage for images/screenshot crops

## Rules
- Keep `Conversation.updatedAt` fresh when posts are added.
- Visibility checks on every read/write.
- Reactions are one‑per‑user‑per‑target.
- Live gating uses Redis counters; no heavy DB polling.
- Include OpenAPI for REST endpoints and a typed SDK.

## Deliverables (Stage 0–1)
- **Stage 0:** project scaffold, Prisma schema + migrations, health endpoints, WebSocket hub.
- **Stage 1:** conversations, posts, reactions, attachments routes; deep link IDs; auth stubs.
- Unit tests for reaction toggle and visibility guards.

## Outputs
- `openapi.yaml`
- Typed SDK generated from OpenAPI
- Postman/Bruno collection
- Seed script
- `docker-compose.yml` for Postgres, Redis, MinIO

## Runbook (dev)
1. `docker compose up -d`
2. `cp .env.example .env`
3. `npm i`
4. `npx prisma generate`
5. `npx prisma migrate dev --name init`
6. `npm run dev`

## Notes
- Reaction target is polymorphic: either `conversationId` or `postId` must be set, never both.
- Presence uses Redis TTL keys; audits go to `PresenceEvent` in Postgres.
- Anchors store multiple selectors and a snippet; hashing and screenshot worker can land in Stage 2.

