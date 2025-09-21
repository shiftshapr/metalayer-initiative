# Cursor Tasks — Canopi Backend

**Task 1 — Prisma**
- Implement Prisma migrations from `prisma/schema.prisma`. Output SQL and run `migrate dev`.

**Task 2 — Threads core**
- Implement `/v1/pages/resolve`, `/v1/conversations` (GET/POST), `/v1/posts` (POST) with visibility checks and `updatedAt` bump.

**Task 3 — Reactions**
- Implement reaction toggle with unique‑per‑user‑per‑target constraint.

**Task 4 — Anchors**
- Implement `/v1/anchors` create, storing selectors and snippet exactly as the spec; leave hashing worker as TODO with an interface.

**Task 5 — WebSockets**
- Wire WS hubs: `/ws` page channel and conversation channel; broadcast `post.created` and `reaction.added`.

**Task 6 — Live gating**
- Add Redis client and implement counters + `/v1/live/state` per spec thresholds.

**Task 7 — Presence**
- Implement now/recent lists backed by Redis TTL keys; expose `/v1/presence`.

**Task 8 — API surface**
- Update `openapi.yaml`, generate a typed SDK, and export a Postman/Bruno collection.

**Tests**
- Unit: reaction toggle, visibility guards.
- Integration: conversation list ordering by `updatedAt`.

