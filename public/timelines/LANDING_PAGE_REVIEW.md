# Timeline Landing Page - Project Review

## Current State Analysis

### Existing Architecture

#### Frontend Structure (`/public/timelines/`)
- **Main App**: `timeline-app.js` - Single profile timeline viewer
- **Modules**:
  - `TimelineManager.js` - State management for timelines
  - `TimelineQuery.js` - API client for timeline data
  - `TimelineRealtime.js` - Supabase real-time subscriptions
  - `TimelineCache.js` - Client-side caching
  - `VisibilityManager.js` - Permission/visibility logic
- **Components**:
  - `TimelineView.js` - Renders timeline activities (placeholder)
  - `ProfileSelector.js` - Profile search/selection (incomplete)
  - `TimelineFilters.js` - Filter controls (incomplete)
- **Styles**: `styles/timeline.css` - Basic styling
- **Entry Point**: `index.html` - Single profile view (`/timelines/:identifier`)

#### Backend Structure
- **Service**: `services/timelineService.js` - Aggregates activities from:
  - Messages
  - Reactions
  - Bookmarks
  - Profile updates (audit logs)
  - Community joins
  - Status changes (presence)
  - Aura changes
- **API Route**: `/api/timelines/:identifier` - Returns user timeline
- **Data Model**: Activities are normalized with:
  - `id`, `type`, `userId`, `timestamp`, `visibility`, `data`

### Current Limitations

1. **Profile-Only**: Only supports viewing individual user timelines
2. **No Constructed Timelines**: No support for curated/multi-author timelines
3. **No Landing Page**: No discovery/browsing interface
4. **No Entry Creation**: Cannot add entries to timelines from messages
5. **No Timeline Management**: Cannot create/edit/delete constructed timelines
6. **Incomplete Components**: ProfileSelector and TimelineFilters have TODOs

### Requirements from digital_provenance.md

#### Core Timeline Entry Model
- **Rich Items**: Text + optional image/audio/video attachments
- **Threaded Replies**: `replyTo` pointers for nested discussion
- **Constructed Timelines**: `displayDate` field for non-chronological ordering
- **Anchors**: Optional links to content fragments or pages

#### Timeline Interactions
- **Horizontal Views**: Time-based buckets (hour, day, week, month, etc.)
- **Hover & Sidebar**: Detail view on hover with filtering
- **Ordering Logic**: Primary `displayDate`, fallback to `createdAt`

#### Relationships & Subscriptions
- **Profile Tabs**: Friends, Followers, Subscribers
- **Subscription Modal**: All/Personalized/None/Unsubscribe options
- **Timeline Subscriptions**: Extend to constructed timelines

#### Provenance Hooks
- Emit provenance records for timeline mutations
- Treat timeline items as first-class messages in `messages` model

## Landing Page Requirements

### User Stories

1. **As a user**, I want to browse available timelines (Featured, My Timelines, Shared, Communities, Rooms)
2. **As a user**, I want to create a new constructed timeline with title, description, visibility settings
3. **As a user**, I want to add any message to a timeline I can contribute to via actions menu
4. **As a user**, I want to see timeline entries with visibility badges (public, private, community, room)
5. **As an author**, I want to edit/delete my timeline entries for 1 hour after creation
6. **As any user**, I want to flag inappropriate timeline entries

### Landing Page Structure

```
/timelines (landing page)
├── Hero Section
│   ├── "Constructed Timelines" title
│   ├── "Create Timeline" CTA button
│   └── Search bar
├── Explore Sections (tabs or sections)
│   ├── Featured Timelines
│   ├── My Timelines
│   ├── Shared with Me
│   ├── Communities
│   └── Rooms (TBD)
└── Timeline Cards
    ├── Title
    ├── Creator(s) avatars
    ├── Latest activity snippet
    ├── Visibility badge
    ├── Member/entry count
    └── "View Timeline" action
```

### Add Entry Modal Flow

1. User clicks "Add to Timeline" from message actions menu
2. Modal opens with:
   - Timeline dropdown (filtered to timelines user can contribute to)
   - Note textarea
   - Visibility selector (public, private, rooms, communities)
   - Community/Room multi-select (if applicable)
3. User submits → API call → UUID returned
4. Ephemeral toast: "Added to timeline."
5. Entry appears in timeline view

### Timeline Entry Model (Extended)

```javascript
{
  id: UUID,
  timelineId: UUID,
  messageId: UUID, // Optional: link to source message
  authorId: UUID,
  content: string,
  displayDate: ISO8601, // For constructed timelines
  createdAt: ISO8601,
  visibility: 'public' | 'private' | 'community' | 'room',
  scopes: {
    communities: UUID[],
    rooms: UUID[] // TBD
  },
  attachments: {
    images: URL[],
    audio: URL[],
    video: URL[]
  },
  replyTo: UUID, // For threaded replies
  editableUntil: ISO8601, // createdAt + 1 hour
  flagged: boolean,
  flagCount: number
}
```

### API Endpoints Needed

```
GET  /api/timelines                    # List timelines (landing page)
POST /api/timelines                    # Create new timeline
GET  /api/timelines/:id                # Get timeline details
PUT  /api/timelines/:id                # Update timeline
DELETE /api/timelines/:id              # Delete timeline

POST /api/timelines/:id/entries        # Add entry to timeline
PUT  /api/timelines/:id/entries/:entryId  # Edit entry (1-hour window)
DELETE /api/timelines/:id/entries/:entryId # Delete entry (1-hour window)

POST /api/timelines/:id/entries/:entryId/flag  # Flag entry
```

### Database Schema Considerations

#### New Tables Needed

```sql
-- Constructed timelines
CREATE TABLE constructed_timelines (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES app_users(id),
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Timeline entries
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY,
  timeline_id UUID REFERENCES constructed_timelines(id),
  message_id UUID REFERENCES messages(id), -- Optional
  author_id UUID REFERENCES app_users(id),
  content TEXT NOT NULL,
  display_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  visibility TEXT DEFAULT 'public',
  editable_until TIMESTAMP,
  reply_to UUID REFERENCES timeline_entries(id)
);

-- Timeline entry scopes (communities/rooms)
CREATE TABLE timeline_entry_scopes (
  id UUID PRIMARY KEY,
  entry_id UUID REFERENCES timeline_entries(id),
  scope_type TEXT, -- 'community' | 'room'
  scope_id UUID
);

-- Timeline entry attachments
CREATE TABLE timeline_entry_attachments (
  id UUID PRIMARY KEY,
  entry_id UUID REFERENCES timeline_entries(id),
  attachment_type TEXT, -- 'image' | 'audio' | 'video'
  url TEXT NOT NULL,
  metadata JSONB
);

-- Timeline contributors (who can add entries)
CREATE TABLE timeline_contributors (
  timeline_id UUID REFERENCES constructed_timelines(id),
  user_id UUID REFERENCES app_users(id),
  role TEXT DEFAULT 'contributor', -- 'creator' | 'contributor' | 'viewer'
  PRIMARY KEY (timeline_id, user_id)
);

-- Timeline flags
CREATE TABLE timeline_entry_flags (
  id UUID PRIMARY KEY,
  entry_id UUID REFERENCES timeline_entries(id),
  reporter_id UUID REFERENCES app_users(id),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Plan

### Phase 1: Landing Page Scaffolding
1. Create `landing.html` and `landing-app.js`
2. Build `TimelineList` component
3. Create timeline card UI
4. Add routing logic (landing vs detail view)

### Phase 2: Timeline Management
1. Create timeline API endpoints
2. Build `CreateTimelineModal` component
3. Add timeline CRUD operations

### Phase 3: Add Entry Flow
1. Build `AddTimelineEntryModal` component
2. Integrate with message actions menu
3. Implement entry creation API
4. Add toast notifications

### Phase 4: Entry Management
1. Implement 1-hour edit/delete window
2. Add edit/delete UI controls
3. Build flagging functionality

### Phase 5: Rich Features
1. Add `displayDate` support
2. Implement attachments (images/audio/video)
3. Add threaded replies
4. Build horizontal timeline view

## Next Steps

1. ✅ Review current architecture
2. ⏳ Build landing page scaffolding
3. ⏳ Create timeline listing API
4. ⏳ Build add-entry modal
5. ⏳ Integrate with message actions











