# Canopi 2.0 — Conversation Architecture & UX Spec (Draft)

*Last updated: Sept 13, 2025*

## Purpose

Make page‑level conversation meaningful, anchored, and navigable so people can coordinate around specific pieces of content without losing the big picture.

## Key Principles

1. **Context first** — Every post should know what it is about: page, region, selection, or media.
2. **Threadable by default** — Conversation should cohere without forcing people into a separate forum unless they want it.
3. **Lightweight to start, rich when expanded** — Start a convo in one click. Details, attachments, and governance appear when needed.
4. **Visibility as a first‑class filter** — People should always know who can see and join.
5. **Composable moderation** — Soft tools for civility, hard tools for abuse. Presence and consent drive defaults.

---

## Core Objects

- **Conversation** — A container with scope, anchor(s), visibility, and governance.
- **Post** — A message in a conversation. Can be a parent or a reply.
- **Anchor** — A reference to page content: whole page, DOM region, text selection, image, video timestamp, or multi‑anchor set.
- **Reaction** — Emoji or lightweight vote attached to a post or conversation.
- **Attachment** — Images or files uploaded into a post.

---

## Anchoring Model

**Goal:** Make it obvious what a discussion refers to, and durable across page updates.

### Anchor Types

1. **Page** — no selector, scope = entire URL or canonical URL set.
2. **Region** — CSS selector + bounding box snapshot for resilience.
3. **Text selection** — Range with start/end XPath + text hash for fuzzy re‑attachment if DOM shifts.
4. **Media** — Image ID or video URL + timestamp range.
5. **Composite** — Multiple anchors grouped, e.g., “Compare paragraph A with image B.”

### Anchor UI

- Hovering an anchor badge in the overlay highlights the referenced content.
- Each conversation chip shows: anchor icon, snippet preview, participant count, unread badge.
- Clicking a chip focuses the page region and opens the thread drawer.

### Resilience

- Store multiple selectors per anchor: CSS path, XPath, TextQuote (exact text plus **prefix** and **suffix** stubs), TextPosition offsets, and a content **text hash**.
- Use a **normalized content hash** that excludes known ad/boilerplate regions and hidden nodes. Keep both a strong hash and a fuzzy SimHash for drift.
- Capture a **cropped screenshot** of the anchored region plus an optional low‑res full‑page snapshot for last‑resort visual reattachment.
- Reattach in this order: TextQuote exact → prefix/suffix fuzzy window → TextPosition with drift tolerance → CSS/XPath heuristics → SimHash similarity windows → user confirm with stored crop if confidence is low.
- Track `anchor.confidence` and `last_reattach_strategy` for analytics and fallbacks.

---

## Navigation & Layout

### Tabs

1. **Threads** — Replaces “Live Chat.” Default view groups by conversation. Each row is an expandable thread card.
2. **Visibility** — Shows who is on this page now and who has recently been here.

### Thread Cards

- **Collapsed state:** title or first line, anchor chip, participants, last activity, visibility pill *(a pill‑shaped label showing who can see the thread — Public, Community, Group, Private, or Custom; clickable to view details or change if you have permission)*, reaction summary.
- **Expanded state:** linear posts with reply nesting of depth 1 by default, with “view more levels” option.
- **Inline tools:** React, Reply, Quote‑reply, Share link, Edit window, Attach image, Change visibility (owner/mod). See **Inline tools — definitions** below.

### Inline tools — definitions

- **React** — one‑tap add or swap among the five defaults (👍 ❓ 🔗 ⚠️ 🙅). Tap again to remove. Counts roll up to the thread card.
- **Reply** — opens the composer under the message. Depth 1 shown by default, with “view more levels” or **Branch here** to split.
- **Quote‑reply** — inserts a short quoted snippet from the selected message or from a text selection on the page, with author, timestamp, and anchor backlink. Useful because we keep shallow nesting — it preserves context without deep threads. Can be hidden in minimalist mode.
- **Share link** — copies a deep link to the post or topic including URL + anchor + post id; opening the link focuses the anchor and expands the thread.
- **Edit window** — a time‑boxed period to fix or augment your post. Default: silent edits allowed for 90 seconds; up to 5 minutes shows an “edited” badge; after 5 minutes, edits are still allowed but display “edited” with hoverable history for mods and the author. Anchor‑text edits prompt to keep the original quote as a footnote.
- **Attach image** — paste or drag‑drop images; shows inline thumbnail and opens lightbox. Alt text encouraged. Adding attachments after the edit window marks the post as edited.
- **Change visibility (owner/mod)** — open a scope picker (Public, Community, Group, Private, Custom). Changes are logged; widening scope prompts for redaction of previously private content if present.

---

## Threading Strategy

**Decision: Everything is a thread.** Every non‑reply post creates an expandable topic. Replies nest one level by default. Use **Branch here** to start a subthread when a reply line splits, and keep **Promote to Topic** as a future enhancement for long‑form spaces. This keeps context near the content and avoids mode confusion.

---

## Starting a Conversation

- **Primary CTA:** “Start conversation” appears on selection, image hover, or toolbar.
- **Flow:**
  1. User selects text or hovers media → clicks **Start conversation**.
  2. Composer opens with anchor preview chip prefilled.
  3. User types title or first line. Optional: add tags, visibility, attachments.
  4. Submit creates a thread card in **Threads** and places an anchor badge on the page.

### Quick‑Post Composer

- Single line input with auto‑expand.
- Attachment button for image upload.
- Emoji picker for inclusion in post
- Keyboard: Enter to post, Shift+Enter for newline.

---

## Filtering System

### Facets

- **Anchor scope:** Page | Region | Selection | Media | Composite
- **Visibility:** Public | Community | Group | Private | Custom list
- **Activity:** Unread | Active now | Last 24h | Last 7d
- **Participants:** @me involved | people I follow | experts
- **Tags:** user‑defined smart tags, page‑inferred topics
- **Status:** Open | Resolved | Archived | Flagged

### Smart Filters

- Saveable filter presets, e.g., “My anchors today,” “Public, last 48h.”
- Quick chips at top of Threads panel reflect active filters.

### Sort Options

- Recent activity, Most participants, Most reactions, Anchor order on page.

---

## Reactions & Voting

- **Emoji reactions** on posts and on thread cards.
- **Lightweight votes:** Five clickable emoji reactions: agree (👍), question (❓), cite (🔗), flag (⚠️), disagree (🙅).
- Reaction summary rolls up to the thread card.

---

## Image & File Uploads

- Drag‑and‑drop into composer.
- Inline thumbnails with lightbox.
- For images used as anchors, automatically create an anchor reference to the uploaded media when relevant.
- Virus scanning and size caps. Alt text encouraged.

---

## Visibility & Governance

- **Visibility Tab = Presence list**, not a filter preset. Shows people **on this page now** and those **recently here**, with privacy‑respecting presence states.
- Presence states: Ambient (count only), Visible (name shown), Active (interacting now). Users opt into Visible/Active.
- Availability states: Available; Busy; Away; Custom. Busy suppresses non‑mention notifications and Live invites; Away auto‑sets after configurable idle time; Custom allows emoji or short text with optional expiry.
- Status display: combine presence × availability. Visible + any availability shows the dot for that availability; Ambient never reveals identity. 
- Quick actions: DM, invite to Live, follow, mute, block. Moderators can soft‑ban or require “unique human” for posting.
- Thread and post visibility still exists as a permission control, but filters are moved to the Filters panel.
- Transparency: when a post is hidden, show the reason and appeal path.

---

## Presence & Live State

- Typing indicators per thread.
- “Active now” badge based on presence in the same page and thread.
- Soft‑real‑time optimistic updates with conflict resolution.

### Live availability gating (presence threshold)

- **Goal:** Avoid ghost‑town Live chats and light up Live when the page is actually buzzing.
- **States:** Off → Standby → Live → Cooling down.
- **Open threshold ****\`\`****:** default 4 unique active people on the same canonical URL within the last 120 seconds.
- **Keep‑open threshold ****\`\`****:** 70% of `T_open` (ceil). Prevents flapping when people come and go.
- **Min live window:** once Live opens, keep it available for at least 15 minutes before applying close logic.
- **Close logic:** if concurrency < `T_keep` for 3 minutes and no messages for 5 minutes, move to Cooling down and then Off.
- **Rally flow:** if below `T_open`, show “Start a rally.” People can tap “I’m in” to notify recent visitors/followers. If `T_open` is reached within 2 minutes, Live starts.
- **Manual override:** owner/mods can force‑open Live for events. Forced sessions still honor rate limits and safety rules.
- **Privacy:** show rounded counts (e.g., 3+) unless users opt into Visible state.
- **Abuse‑resistance:** dedupe multi‑tabs per user, mark idle after 60 seconds of no scroll/typing, optional unique‑human gate for posting in Live.
- **Promotion:** any Live message can be pinned to create a Thread. Pinned items inherit a link back to the Live moment.

---

## Linking & Shareability

- Deep links encode page URL + anchor + post id.
- Copy link on any post. Opening link focuses anchor and expands thread.
- Optional shortlinks for public threads.

---

## Notifications

- In‑app: mentions, replies, thread you follow changes.
- Email or push: digest and important mentions.
- Per‑thread notification settings.

---

## Data Model Sketch

```
Conversation {
  id, url_canonical, anchors[], visibility, title, tags[], status,
  created_by, created_at, updated_at, participants[], metrics{reactions, replies},
  governance{roles, ruleset_id}
}

Anchor {
  id, type, selectors{css[], xpath[], text_hash}, bbox, media{url, ts_start, ts_end},
  snippet, confidence
}

Post {
  id, conversation_id, parent_id, author_id, body, attachments[], reactions[],
  created_at, edited_at, visibility_override?, deleted_at
}

Reaction { id, target_type, target_id, emoji, user_id, created_at }
Attachment { id, url, type, size, alt }
```

---

## API & Events

- `POST /conversations` with optional `anchors[]`
- `POST /posts` with `parent_id` for replies
- `POST /reactions`
- `PATCH /conversations/:id` for status, visibility
- **Events:** `conversation.created`, `post.created`, `reaction.added`, `conversation.status.changed`, `anchor.relocated`

---

## Accessibility

- Anchors must be keyboard focusable and screen‑reader labeled with snippet and type.
- Colors meet contrast ratios. Emoji reactions have text equivalents.

---

## Analytics & Quality Signals

- Thread dwell time, scroll‑to‑anchor success rate, reaction conversion.
- Anchor stability metric: re‑attachment success after page updates.
- Duplicate detection via title + anchor similarity to prompt merges.

---

## MVP Scope (6–8 weeks estimate internally, non‑public)

1. Threads tab with thread cards and single‑level nesting
2. Start conversation from selection or image
3. Faceted filtering: Anchor scope, Visibility, Activity
4. Emoji reactions and image uploads
5. Deep links to anchors and posts
6. Basic moderation: lock, resolve, archive

---

## Future Enhancements

- Multi‑anchor comparisons
- Summarization and semantic threading suggestions
- Reputation‑weighted sorting
- Cross‑page collections by tag
- Per‑thread custom fields for structured deliberation

---

## Open Questions

1. Should replies ever be allowed to change the anchor or add sub‑anchors?
2. Do we want split‑view: thread list left, active thread right, and page in background, or stick with drawer?
3. What is the default visibility on new conversations in mixed‑trust spaces?
4. Image moderation pipeline needs definition for public spaces.

---

## Decision Aid: Threading

**Choose Option A** if you want coherence and simple mental model. Add “Promote to Topic” for heavier use cases. **Choose Option B** only if your users often write multi‑section posts that read like articles.

---

## Sample Flows

**Start a content‑anchored convo**

1. Select text → Start conversation
2. Type: “Is this claim sourced?” → Set visibility: Community → Post
3. Others reply with sources and reactions

**Find relevant discussions**

- Filters: Selection anchors + Last 24h + @me involved
- Sort: Recent activity

**Moderate a heated thread**

- Lock for 1 hour, mark as “Needs sources,” post a mod note

---

## Lightweight UI Wireframe Notes

- Right sidebar: Threads list with filter chips at top
- Each card: [Anchor chip] [Title/first line] [Reacts] [Last activity] [Visibility]
- Expanded: messages with reply indent level 1, inline tools row
- Page overlay: small anchor badges numbered in reading order

---

## Risks & Mitigations

- **Over‑fragmentation:** Similar threads on same anchor → detect and suggest merge.
- **Anchor drift:** DOM changes → multi‑selector re‑attachment with screenshot fallback.
- **Cognitive load:** Too many filters → progressive disclosure with presets.

---

## Success Criteria

- 80% of new conversations started from anchors
-
  > 60% scroll‑to‑anchor accuracy after page edits
- Time to first reply under 2 minutes in active spaces
- User‑reported clarity: “I always know what a post refers to.”

---

# Cursor Briefing — Backend‑first Implementation Plan

This briefing sets up all core backend structures and real‑time plumbing so the front end can land in stages without schema churn. It assumes TypeScript, Node, Postgres, Redis, and an S3‑compatible object store. Swap equivalents as you like.

## Architecture overview

- **API**: REST for resources, WebSocket for real time. Optional GraphQL read layer later.
- **Data**: Postgres for durable entities. Redis for presence, live chat, rate limits, ephemeral counts.
- **Storage**: S3 bucket for attachments and screenshot crops.
- **Workers**: queue for hashing, screenshot capture, reattachment jobs, and notifications.
- **Observability**: OpenTelemetry traces, structured logs, metrics via Prometheus.
- **Feature flags**: to gate staged front‑end features.

## Service boundaries

- `anchor-svc` – selection ingest, normalization, hashing, reattachment.
- `thread-svc` – conversations, posts, reactions, attachments.
- `presence-svc` – page presence, availability states, Live gating, rally.
- `notify-svc` – in‑app and email push.
- `admin-svc` – roles, moderation, audits.

Keep in one repo as modules. Split later if needed.

## Data model — Prisma schema (PostgreSQL)

Use Prisma as the primary ORM against Postgres. This schema mirrors the earlier SQL, adds enums, and encodes indexes and relations. Reaction targets are polymorphic via optional FKs and enforced in application logic.

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role { OWNER MODERATOR MEMBER VISITOR }

enum Visibility { PUBLIC COMMUNITY GROUP PRIVATE CUSTOM }

enum Status { OPEN RESOLVED ARCHIVED FLAGGED }

enum ReactionKind { AGREE QUESTION CITE FLAG DISAGREE }

enum PresenceEventKind { ENTER HEARTBEAT EXIT AVAILABILITY }

enum Availability { AVAILABLE BUSY AWAY CUSTOM }

enum AnchorType { PAGE REGION TEXT MEDIA COMPOSITE }

model AppUser {
  id             String            @id @default(uuid()) @db.Uuid
  handle         String            @unique
  email          String?           @unique
  createdAt      DateTime          @default(now())
  spaces         SpaceMember[]
  conversations  Conversation[]    @relation("ConversationCreatedBy")
  posts          Post[]
  reactions      Reaction[]
  presenceEvents PresenceEvent[]
}

model Space {
  id        String         @id @default(uuid()) @db.Uuid
  name      String
  createdAt DateTime       @default(now())
  members   SpaceMember[]
  pages     Page[]
}

model SpaceMember {
  space     Space   @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  spaceId   String  @db.Uuid
  user      AppUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String  @db.Uuid
  role      Role
  @@id([spaceId, userId])
}

model Page {
  id               String         @id @default(uuid()) @db.Uuid
  space            Space          @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  spaceId          String         @db.Uuid
  url              String
  canonicalUrl     String
  latestSnapshot   PageSnapshot?  @relation("LatestSnapshot", fields: [latestSnapshotId], references: [id])
  latestSnapshotId String?        @db.Uuid
  snapshots        PageSnapshot[]
  conversations    Conversation[]
  @@unique([spaceId, canonicalUrl])
}

model PageSnapshot {
  id            String    @id @default(uuid()) @db.Uuid
  page          Page      @relation(fields: [pageId], references: [id], onDelete: Cascade)
  pageId        String    @db.Uuid
  contentHash   Bytes
  simhash       BigInt
  etag          String?
  lastModified  DateTime?
  screenshotKey String?
  createdAt     DateTime  @default(now())
  anchors       Anchor[]
  // backref for latestSnapshot is implicit via Page.latestSnapshot
}

model Anchor {
  id              String        @id @default(uuid()) @db.Uuid
  pageSnapshot    PageSnapshot  @relation(fields: [pageSnapshotId], references: [id], onDelete: Cascade)
  pageSnapshotId  String        @db.Uuid
  type            AnchorType
  selectors       Json
  bbox            Json?
  media           Json?
  snippet         String?
  confidence      Float         @default(1.0)
  createdAt       DateTime      @default(now())
  conversations   Conversation[]
  @@index([pageSnapshotId])
}

model Conversation {
  id          String       @id @default(uuid()) @db.Uuid
  page        Page         @relation(fields: [pageId], references: [id], onDelete: Cascade)
  pageId      String       @db.Uuid
  anchor      Anchor?      @relation(fields: [anchorId], references: [id])
  anchorId    String?
  visibility  Visibility
  title       String?
  tags        String[]
  status      Status       @default(OPEN)
  createdBy   AppUser      @relation("ConversationCreatedBy", fields: [createdById], references: [id])
  createdById String       @db.Uuid
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @default(now())
  posts       Post[]
  reactions   Reaction[]
  @@index([pageId, updatedAt(sort: Desc)], map: "conversation_list_ix")
}

model Post {
  id              String        @id @default(uuid()) @db.Uuid
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  conversationId  String        @db.Uuid
  parent          Post?         @relation("PostToPost", fields: [parentId], references: [id], onDelete: SetNull)
  parentId        String?
  children        Post[]        @relation("PostToPost")
  author          AppUser       @relation(fields: [authorId], references: [id])
  authorId        String        @db.Uuid
  body            String
  attachments     Json?
  createdAt       DateTime      @default(now())
  editedAt        DateTime?
  visibilityOverride Visibility?
  deletedAt       DateTime?
  reactions       Reaction[]
  @@index([conversationId, createdAt], map: "post_list_ix")
}

model Reaction {
  id              String          @id @default(uuid()) @db.Uuid
  user            AppUser         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId          String          @db.Uuid
  conversation    Conversation?   @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  conversationId  String?
  post            Post?           @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId          String?
  kind            ReactionKind
  createdAt       DateTime        @default(now())
  @@unique([userId, conversationId, postId], map: "unique_user_target")
}

model PresenceEvent {
  id          BigInt            @id @default(autoincrement())
  page        Page              @relation(fields: [pageId], references: [id], onDelete: Cascade)
  pageId      String            @db.Uuid
  user        AppUser           @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String            @db.Uuid
  kind        PresenceEventKind
  availability Availability?
  customLabel String?
  createdAt   DateTime          @default(now())
}

model ModerationAction {
  id         String   @id @default(uuid()) @db.Uuid
  actor      AppUser  @relation(fields: [actorId], references: [id])
  actorId    String   @db.Uuid
  targetType String
  targetId   String
  action     String
  reason     String?
  createdAt  DateTime @default(now())
}
```

### Indexing and search

- The schema defines the core relational indexes. For full‑text search on `Post.body` add a Prisma migration with a `tsvector` column and a GIN index using `prisma migrate dev` with a raw SQL step.
- Keep `Conversation.updatedAt` fresh by updating it inside the post‑create transaction.

### Prisma client snippets

Create anchor → conversation → post and keep `updatedAt` in sync.

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 1) Create an anchor from selection payload
export async function createAnchor(pageSnapshotId: string, payload: any) {
  return prisma.anchor.create({
    data: {
      pageSnapshotId,
      type: "TEXT",
      selectors: payload, // JSON
      snippet: payload.quote,
    },
  });
}

// 2) Start a thread (conversation) anchored to that selection
export async function startConversation(pageId: string, anchorId: string, userId: string, title?: string, body?: string) {
  return prisma.conversation.create({
    data: {
      pageId,
      anchorId,
      visibility: "COMMUNITY",
      title,
      createdById: userId,
      posts: body ? { create: [{ authorId: userId, body }] } : undefined,
    },
    include: { posts: true },
  });
}

// 3) Reply and bump updatedAt atomically
export async function reply(conversationId: string, authorId: string, body: string, parentId?: string) {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: { conversationId, authorId, body, parentId },
    });
    await tx.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    return post;
  });
}

// 4) React (toggle)
export async function reactToPost(postId: string, userId: string, kind: "AGREE"|"QUESTION"|"CITE"|"FLAG"|"DISAGREE") {
  const existing = await prisma.reaction.findFirst({ where: { postId, userId } });
  if (existing) {
    if (existing.kind === kind) return prisma.reaction.delete({ where: { id: existing.id } });
    return prisma.reaction.update({ where: { id: existing.id }, data: { kind } });
  }
  return prisma.reaction.create({ data: { postId, userId, kind } });
}
```

> Note: polymorphic `Reaction` target uses either `conversationId` or `postId`. Validate server‑side that exactly one is set.

## Redis data structures

- `presence:{pageCanonical}` – hash of `userId -> {state, availability, lastSeen}` with TTL.
- `live:concurrency:{pageCanonical}` – rolling window counters.
- `live:messages:{pageCanonical}` – capped stream for ephemeral chat.
- Rate limit buckets per user for Live and posting.

## REST API (v1)

```
POST   /v1/pages/resolve         { url } -> { pageId, canonicalUrl }
POST   /v1/anchors               { pageId, selectionPayload } -> { anchor }
POST   /v1/conversations         { pageId, anchorId?, visibility, title, body? }
GET    /v1/conversations         ?pageId&filters -> [threadCard]
POST   /v1/posts                 { conversationId, parentId?, body, attachments? }
GET    /v1/conversations/:id     -> { conversation, posts }
POST   /v1/reactions             { targetType, targetId, kind }
DELETE /v1/reactions/:id
POST   /v1/attachments/sign      { mime, size } -> { uploadUrl, key }

-- Presence and Live
GET    /v1/presence              ?pageId -> { now[], recent[] }
POST   /v1/presence/availability { availability, customLabel?, expiresAt? }
GET    /v1/live/state            ?pageId -> { state, counts, thresholds }
POST   /v1/live/rally            { pageId } -> { accepted }
POST   /v1/live/override         { pageId, mode } (mods only)
```

## WebSocket channels

- `ws:/page/{canonical}` – presence, Live messages, thread list diffs.
- `ws:/conversation/{id}` – posts, reactions, typing, edit flags.

### Events

```
server -> client
  presence.update { now, recent, counts }
  live.state      { state, counts }
  live.message    { id, user, body, ts }
  conversation.created { conversation }
  post.created    { post }
  reaction.added  { reaction }
  conversation.status.changed { id, status }
  anchor.relocated { anchorId, confidence }

client -> server
  presence.heartbeat { pageId, availability? }
  live.publish       { pageId, body }
  typing             { conversationId }
```

## Selection payload and anchoring pipeline

Input from the front end when the user clicks Start conversation.

```json
{
  "type": "text",
  "quote": "exact selected text",
  "prefix": "text before...",
  "suffix": "...text after",
  "position": { "start": 12345, "end": 12412 },
  "cssPath": "#main > article > p:nth-child(6)",
  "xPath": "/html/body/main/article/p[6]",
  "viewportBBox": { "x": 0.12, "y": 0.37, "w": 0.6, "h": 0.1 },
  "media": null
}
```

### Normalization and hashing

- Build normalized text: strip ads and hidden nodes, collapse whitespace, lowercase.
- Compute SHA‑256 of normalized text. Compute SimHash for fuzzy windows.
- Persist selectors and hashes on the anchor.
- Capture a cropped screenshot of the selection plus a low‑res full page, save keys in S3.

### Reattachment algorithm (pseudo)

```ts
function reattach(anchor, newSnapshot): ReattachResult {
  if (textQuoteExact(anchor, newSnapshot)) return ok(1.0, 'quote-exact');
  if (quoteWindow(anchor, newSnapshot))    return ok(0.95, 'quote-window');
  if (positionDrift(anchor, newSnapshot))  return ok(0.9, 'position');
  if (selectorHeur(anchor, newSnapshot))   return ok(0.8, 'selector');
  if (simhashWindow(anchor, newSnapshot))  return ok(0.7, 'simhash');
  return suggestWithCrop(anchor, newSnapshot); // user confirm
}
```

## Live gating rules

- `T_open` default 4 unique active users in 120 seconds.
- `T_keep` equals ceil(0.7 × `T_open`).
- Minimum Live window 15 minutes once opened.
- Close when under `T_keep` for 3 minutes and silent for 5 minutes.
- Rally flow and manual override supported by presence‑svc.

## Availability states

- Available, Busy, Away, Custom. Visible plus any availability shows that dot. Ambient never reveals identity.
- Away auto‑sets after idle threshold from presence heartbeats.

## Visibility enforcement

- Conversation visibility guards all reads and writes.
- Visibility pill values: public, community, group, private, custom.
- Scope changes create an audit row and can trigger redaction prompts for quoted private text.

## Security and safety

- OAuth or passkeys for auth. Session cookies httpOnly and sameSite=strict.
- Row‑level checks on every write. Rate limits per user, per page, per endpoint.
- Attachment scanning and type allowlist. EXIF stripped by default.
- Abuse controls: flood control in Live, block lists, soft‑ban and slow mode at thread level.

## Staged delivery plan

**Stage 0 – Platform**

- Users, spaces, pages, snapshots. Presence Redis skeleton and WebSocket hub. CI, observability, flags.

**Stage 1 – Threads core**

- Conversations, posts, reactions, attachments. List and detail APIs. Deep links.

**Stage 2 – Anchors**

- Selection payload, anchor create, screenshot worker, reattachment pass 1.

**Stage 3 – Filters**

- Server‑side filtering and sorting, presets API.

**Stage 4 – Presence tab**

- Now and recent lists, availability states, DM stubs.

**Stage 5 – Live**

- Gated Live chat with rally and pin‑to‑thread. Ephemeral storage only.

**Stage 6 – Moderation**

- Lock, resolve, archive, flag pipeline, audits.

**Stage 7 – Notifications**

- Mentions and digest, per‑thread settings.

Each stage exposes stable APIs so the front end can hook up progressively.

## Developer ergonomics

- Monorepo with `apps/api`, `apps/ws`, `packages/types`, `packages/sdk`.
- Generate a typed client SDK from OpenAPI.
- Seed script for demo data and a page mirror for local testing.
- Postman or Bruno collection checked in.

## QA and load

- Unit tests for selectors and reattachment. Property‑based fuzzing for prefix/suffix windows.
- Contract tests for REST and WS payloads.
- Load test Live gating and presence with synthetic users.

## Metrics to watch

- Time to first post, posts per conversation, reaction usage mix.
- Anchor confidence after reattachment, failure prompts per 100 anchors.
- Live open rate when threshold reached, rally conversion.
- Presence accuracy vs server logs.

## Risks

- DOM churn breaking anchors – mitigate with multi‑selector plus crop confirm.
- Privacy leaks via presence – default to Ambient, round counts, opt‑in for Visible.
- Live spam – strict rate limits and unique‑human gate for posting.

