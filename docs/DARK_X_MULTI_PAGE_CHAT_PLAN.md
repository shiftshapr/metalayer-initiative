# Dark X Style Multi-Canopi Chat View - Planning Document

**Note**: Throughout this document, "Canopis" (plural) and "Canopi" (singular) refer to the chat-enabled pages/URLs that users can view side-by-side. The technical term `pageId` is retained for database compatibility with existing systems.

## Feature Overview

A web-based interface inspired by X/Twitter's dark mode design that enables users to view multiple Canopi chats side-by-side with horizontal scrolling. Users can organize Canopis by meta-domains, create custom views, and manage their Canopi selections with a free tier limit of 3 Canopis.

**Deployment Domain**: `view.canopi.live`

## Deployment

### Domain Configuration
- **Primary Domain**: `view.canopi.live`
- **Frontend**: Served from `/public/multi-canopi-chat/` directory
- **API Backend**: Proxied to Express app (port 3002)
- **WebSocket**: Real-time updates via `/ws` endpoint

### Nginx Configuration
The application will be served from `view.canopi.live` subdomain. See `view.canopi.live.conf` for nginx configuration.

**Setup Steps:**
1. Copy nginx config: `sudo cp view.canopi.live.conf /etc/nginx/sites-available/view.canopi.live`
2. Create symlink: `sudo ln -s /etc/nginx/sites-available/view.canopi.live /etc/nginx/sites-enabled/`
3. Test config: `sudo nginx -t`
4. Reload nginx: `sudo systemctl reload nginx`
5. Set up SSL: `sudo certbot --nginx -d view.canopi.live`

### Frontend Deployment
- **Directory**: `/home/ubuntu/metalayer-initiative/public/multi-canopi-chat/`
- **Entry Point**: `index.html` (accessible at `https://view.canopi.live/`)
- **Build Output**: Files compiled to `dist/` directory
- **Static Assets**: Served directly by nginx with 30-day cache

### Backend Integration
- **API Server**: Express app running on port 3002
- **WebSocket**: Real-time updates via `/ws` endpoint
- **Database**: PostgreSQL (shared with main Canopi application)

## Core Requirements

### 1. Multi-Canopi Chat Display
- **Side-by-side layout**: Multiple Canopi chats displayed horizontally
- **Horizontal scrolling**: Scroll through selected Canopis
- **Real-time updates**: Live chat updates for all visible Canopis
- **Dark mode design**: X/Twitter-inspired dark theme

### 2. Canopi Management
- **FREE tier limit**: 3 Canopis maximum (can be extended individually)
- **Canopi selection**: Add/remove Canopis from view
- **Meta-domain grouping**: Organize Canopis by meta-domains
- **Canopi metadata**: Display Canopi title, URL, and activity status

### 3. Search & Filtering
- **URL-based search**: Search by Canopi URL (normalized or raw)
- **Meta-domain filtering**: Filter by meta-domain
- **View filtering**: Filter by saved views
- **Category matching**: Match search criteria to Canopi categories

### 4. View Management
- **Save views**: Create named views with selected Canopis
- **Privacy levels**: 
  - `public` - Visible to everyone
  - `community` - Visible to community members
  - `room` - Visible to room members
  - `private` - Visible only to creator
  - `selected canopis` - Custom selection
- **View persistence**: Save and load views

## UI Structure

### Main Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: "Multi-Canopi Chat View"                  [User Menu]    │
├─────────────────────────────────────────────────────────────────┤
│ Search Bar: [Search by URL/Meta-domain/View...]  [Filter]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │ Meta-domains │ │   Canopis    │ │Selected      │            │
│ │              │ │              │ │Canopis       │            │
│ │ example.com  │ │ Canopi 1     │ │ Canopi 1     │            │
│ │    [Add]     │ │    [Add]     │ │      [x]     │            │
│ │              │ │              │ │              │            │
│ │              │ │ Canopi 2     │ │              │            │
│ │              │ │    [Add]     │ │              │            │
│ │              │ │              │ │              │            │
│ │              │ │ Canopi 3     │ │              │            │
│ │              │ │    [Add]     │ │              │            │
│ └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Save View                                                   │ │
│ │ Name: [________________]                                   │ │
│ │ Privacy: [public ▼] [community] [room] [private] [selected] │ │
│ │ [Save View]                                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Displays                                                    │ │
│ │ ┌──────────────┐ ┌──────────────┐                         │ │
│ │ │ Views        │ │ Selected     │                         │ │
│ │ │              │ │ Canopis      │                         │ │
│ │ │ Title 1      │ │ Canopi 1     │                         │ │
│ │ │ Title 2      │ │ Canopi 2     │                         │ │
│ │ │              │ │              │                         │ │
│ │ └──────────────┘ └──────────────┘                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Chat View (Horizontal Scroll)                                │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │ │
│ │ │Canopi│ │Canopi│ │Canopi│ │Canopi│ │Canopi│ →            │ │
│ │ │  1   │ │  2   │ │  3   │ │  4   │ │  5   │              │ │
│ │ │Chat  │ │Chat  │ │Chat  │ │Chat  │ │Chat  │              │ │
│ │ │      │ │      │ │      │ │      │ │      │              │ │
│ │ │[msg] │ │[msg] │ │[msg] │ │[msg] │ │[msg] │              │ │
│ │ │[msg] │ │[msg] │ │[msg] │ │[msg] │ │[msg] │              │ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model Design

### URL Storage Strategy

**Decision: Store both normalized and raw URLs**

**Rationale:**
- **Normalized URL** (`normalizedUrl`): Used for matching, deduplication, and consistent page identification
- **Raw URL** (`rawUrl`): Preserved for display, user input, and exact reference
- **Page ID** (`pageId`): Generated from normalized URL (e.g., "google_com_") for efficient indexing

**Implementation:**
```typescript
interface CanopiData {
  id: string;                    // UUID
  rawUrl: string;                 // Original URL from user
  normalizedUrl: string;          // Normalized version
  pageId: string;                 // Generated ID (e.g., "google_com_") - kept for compatibility
  canopiTitle: string;            // Extracted or user-provided title
  metaDomain: string | null;      // Meta-domain (e.g., "example.com.meta")
  category?: string;              // Optional category
  createdAt: Date;
  updatedAt: Date;
}
```

**Search Behavior:**
- User enters raw URL → normalize it for matching
- User enters normalized URL → use directly
- Search matches against both `normalizedUrl` and `rawUrl` fields
- Meta-domain search matches against `metaDomain` field

### Database Schema

```sql
-- Multi-Canopi chat views
CREATE TABLE multi_canopi_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  privacy_level TEXT NOT NULL DEFAULT 'private' 
    CHECK (privacy_level IN ('public', 'community', 'room', 'private', 'selected')),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE, -- For 'community' privacy
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,            -- For 'room' privacy
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES app_users(id)
);

-- Canopis in a view
CREATE TABLE multi_canopi_view_canopis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  view_id UUID NOT NULL REFERENCES multi_canopi_views(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,              -- References canopis.pageId (kept for compatibility)
  canopi_title TEXT,                  -- Cached title for display
  display_order INTEGER NOT NULL,     -- Order in horizontal scroll
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_view FOREIGN KEY (view_id) REFERENCES multi_canopi_views(id),
  CONSTRAINT unique_view_canopi UNIQUE (view_id, page_id)
);

-- User Canopi selections (for quick access)
CREATE TABLE user_canopi_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,             -- References canopis.pageId (kept for compatibility)
  canopi_title TEXT,
  meta_domain TEXT,                  -- Cached meta-domain
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES app_users(id),
  CONSTRAINT unique_user_canopi UNIQUE (user_id, page_id)
);

-- Meta-domains (if not already exists)
-- Note: Check if meta_domain field exists in existing canopis/messages table
CREATE TABLE meta_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,       -- e.g., "example.com.meta"
  display_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canopis table (if not exists, or extend existing)
-- Note: May already exist in schema as "pages" - verify and potentially rename
CREATE TABLE IF NOT EXISTS canopis (
  page_id TEXT PRIMARY KEY,          -- Normalized page ID (e.g., "google_com_") - kept for compatibility
  raw_url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  canopi_title TEXT,                 -- Display title for the Canopi
  meta_domain TEXT REFERENCES meta_domains(domain),
  category TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_normalized_url UNIQUE (normalized_url)
);

-- Indexes
CREATE INDEX idx_multi_canopi_views_user ON multi_canopi_views(user_id);
CREATE INDEX idx_multi_canopi_views_privacy ON multi_canopi_views(privacy_level);
CREATE INDEX idx_multi_canopi_view_canopis_view ON multi_canopi_view_canopis(view_id);
CREATE INDEX idx_multi_canopi_view_canopis_page ON multi_canopi_view_canopis(page_id);
CREATE INDEX idx_user_canopi_selections_user ON user_canopi_selections(user_id);
CREATE INDEX idx_canopis_meta_domain ON canopis(meta_domain);
CREATE INDEX idx_canopis_normalized_url ON canopis(normalized_url);
```

### Free Tier Limit Enforcement

```typescript
interface UserCanopiLimit {
  userId: string;
  freeLimit: number;        // Default: 3
  currentCount: number;      // Current Canopis in selection
  canAddMore: boolean;      // Based on subscription tier
}

// Check before adding Canopi
async function canAddCanopi(userId: string): Promise<boolean> {
  const limit = await getUserCanopiLimit(userId);
  if (limit.currentCount >= limit.freeLimit && !limit.canAddMore) {
    return false;
  }
  return true;
}
```

## API Endpoints

**Base URL**: `https://view.canopi.live`

### Canopi Management
```
GET    /api/multi-canopi/canopis                # List available Canopis
GET    /api/multi-canopi/canopis/search         # Search Canopis by URL/meta-domain
POST   /api/multi-canopi/canopis                # Add new Canopi (if not exists)
GET    /api/multi-canopi/canopis/:pageId        # Get Canopi details
```

### Meta-Domain Management
```
GET    /api/multi-canopi/meta-domains           # List meta-domains
POST   /api/multi-canopi/meta-domains           # Create meta-domain
GET    /api/multi-canopi/meta-domains/:domain/canopis # Get Canopis for meta-domain
```

### View Management
```
GET    /api/multi-canopi/views                  # List views (filtered by privacy)
POST   /api/multi-canopi/views                  # Create new view
GET    /api/multi-canopi/views/:viewId         # Get view details
PUT    /api/multi-canopi/views/:viewId          # Update view
DELETE /api/multi-canopi/views/:viewId          # Delete view
POST   /api/multi-canopi/views/:viewId/canopis # Add Canopi to view
DELETE /api/multi-canopi/views/:viewId/canopis/:pageId # Remove Canopi from view
```

### User Selections
```
GET    /api/multi-canopi/user/selections        # Get user's current Canopi selection
POST   /api/multi-canopi/user/selections        # Add Canopi to selection
DELETE /api/multi-canopi/user/selections/:pageId # Remove Canopi from selection
PUT    /api/multi-canopi/user/selections/order  # Reorder Canopis
GET    /api/multi-canopi/user/limit             # Get user's Canopi limit status
```

### Chat Data
```
GET    /api/multi-canopi/chats/:pageId          # Get messages for a Canopi
GET    /api/multi-canopi/chats/batch            # Get messages for multiple Canopis
WS     /ws/multi-canopi/chats                   # WebSocket for real-time updates
```

## Frontend Architecture

### Component Structure

**Deployment Path**: `/public/multi-canopi-chat/`  
**Accessible at**: `https://view.canopi.live/`

```
public/multi-canopi-chat/
├── index.html                    # Main entry point (served at view.canopi.live/)
├── styles/
│   ├── dark-x-theme.css         # Dark X/Twitter-inspired theme
│   └── multi-canopi-chat.css     # Component styles
├── src/
│   ├── app.ts                    # Main application
│   ├── components/
│   │   ├── MetaDomainPanel.ts   # Meta-domain selection panel
│   │   ├── CanopiPanel.ts       # Available Canopis panel
│   │   ├── SelectedCanopisPanel.ts # Selected Canopis panel
│   │   ├── ViewManager.ts       # View save/load component
│   │   ├── ChatView.ts          # Horizontal scrolling chat view
│   │   ├── CanopiChat.ts        # Individual Canopi chat component
│   │   └── SearchBar.ts         # Search and filter component
│   ├── services/
│   │   ├── CanopiService.ts     # Canopi CRUD operations
│   │   ├── ViewService.ts       # View management
│   │   ├── ChatService.ts       # Chat data fetching
│   │   └── RealtimeService.ts  # WebSocket real-time updates
│   ├── utils/
│   │   ├── urlNormalization.ts  # URL normalization (reuse existing)
│   │   ├── canopiLimit.ts       # Free tier limit checking
│   │   └── viewHelpers.ts       # View management helpers
│   └── types/
│       └── index.ts             # TypeScript types
└── dist/                         # Compiled output
```

### Key Components

#### 1. ChatView Component
- Horizontal scrolling container
- Renders multiple `CanopiChat` components
- Handles scroll synchronization
- Manages real-time updates

#### 2. CanopiChat Component
- Individual Canopi chat display
- Message list with real-time updates
- Input area for new messages
- Canopi title and meta-domain badge

#### 3. SearchBar Component
- URL search input
- Meta-domain filter dropdown
- View filter dropdown
- Category filter (if applicable)

#### 4. ViewManager Component
- Save view form (name, privacy)
- Load view dropdown
- View list display
- Delete view action

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create database schema
- [ ] Set up API endpoints structure
- [ ] Create frontend scaffolding
- [ ] Implement URL normalization integration
- [ ] Basic Canopi CRUD operations

### Phase 2: Core UI (Week 2)
- [ ] Build Dark X theme CSS
- [ ] Implement meta-domain panel
- [ ] Implement Canopi selection panel
- [ ] Implement selected Canopis panel
- [ ] Basic horizontal scroll chat view

### Phase 3: View Management (Week 3)
- [ ] Implement view save/load functionality
- [ ] Privacy level enforcement
- [ ] View sharing (public/community/room)
- [ ] View deletion

### Phase 4: Search & Filtering (Week 4)
- [ ] URL search implementation
- [ ] Meta-domain filtering
- [ ] View filtering
- [ ] Category matching (if applicable)

### Phase 5: Real-time & Polish (Week 5)
- [ ] WebSocket integration for real-time updates
- [ ] Free tier limit enforcement UI
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] Testing and bug fixes

## Technical Considerations

### URL Normalization Strategy

**Reuse Existing System:**
- Leverage existing `normalizeUrl()` function from `presence/utils/UrlNormalization.js`
- Store both `rawUrl` and `normalizedUrl` for flexibility
- Use `pageId` (generated from normalized URL) as primary key

**Search Implementation:**
```typescript
async function searchCanopis(query: string, filters: {
  metaDomain?: string;
  viewId?: string;
  category?: string;
}): Promise<CanopiData[]> {
  // Normalize search query
  const normalized = await normalizeUrl(query);
  
  // Search in database
  const results = await db.query(`
    SELECT * FROM canopis
    WHERE 
      (normalized_url ILIKE $1 OR raw_url ILIKE $1 OR canopi_title ILIKE $1)
      ${filters.metaDomain ? 'AND meta_domain = $2' : ''}
      ${filters.category ? 'AND category = $3' : ''}
    ORDER BY last_seen DESC
    LIMIT 50
  `, [normalized.normalizedUrl, filters.metaDomain, filters.category]);
  
  return results;
}
```

### Real-time Updates

**WebSocket Strategy:**
- Subscribe to message changes for all visible pages
- Use Supabase real-time subscriptions (existing infrastructure)
- Batch updates to avoid overwhelming UI
- Debounce rapid updates

```typescript
// Subscribe to multiple Canopis
const subscriptions = selectedCanopis.map(pageId => {
  return supabase
    .channel(`canopi-${pageId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: `page_id=eq.${pageId}`
    }, (payload) => {
      handleMessageUpdate(pageId, payload);
    })
    .subscribe();
});
```

### Performance Optimization

1. **Lazy Loading**: Load chat messages only when Canopi is visible
2. **Virtual Scrolling**: Use virtual scrolling for long message lists
3. **Pagination**: Load messages in chunks (e.g., 50 at a time)
4. **Caching**: Cache Canopi metadata and recent messages
5. **Debouncing**: Debounce search queries and real-time updates

### Free Tier Limit

**Enforcement Points:**
1. **UI Level**: Disable "Add" button when limit reached
2. **API Level**: Check limit before adding Canopi
3. **Database Level**: Constraint to prevent exceeding limit (optional)

**Upgrade Path:**
- Show upgrade prompt when limit reached
- Link to subscription/upgrade page
- Allow individual Canopi purchases (if applicable)

## Design Decisions

### 1. URL Storage: Both Normalized and Raw
**Decision**: Store both `normalizedUrl` and `rawUrl`
**Reason**: 
- Normalized for matching and deduplication
- Raw for display and user reference
- Flexibility for future features

### 2. Meta-Domain as Separate Entity
**Decision**: Store meta-domains in separate table
**Reason**: 
- Allows meta-domain metadata (name, description)
- Easier to query Canopis by meta-domain
- Supports future meta-domain features

### 3. View Privacy Levels
**Decision**: Support public, community, room, private, selected
**Reason**: 
- Aligns with existing privacy model
- Flexible sharing options
- Supports collaboration features

### 4. Horizontal Scrolling
**Decision**: Horizontal scroll for chat views
**Reason**: 
- Matches X/Twitter multi-column layout
- Better use of wide screens
- Intuitive navigation

## Open Questions

1. **Individual Canopi Purchases**: Should users be able to purchase additional Canopis beyond free limit, or only upgrade entire tier?
2. **Canopi Categories**: What categories should be supported? (e.g., news, social, work, personal)
3. **View Sharing**: Can users share views with specific users, or only through privacy levels?
4. **Canopi Limits per View**: Should views have their own Canopi limits, or inherit from user limit?
5. **Real-time Sync**: Should all Canopis update in real-time, or only active/visible Canopis?

## Next Steps

1. **Review & Approval**: Review this plan with team
2. **Nginx Configuration**: Create `view.canopi.live.conf` configuration file
3. **Database Migration**: Create migration for new tables
4. **API Development**: Start with Canopi management endpoints
5. **UI Mockups**: Create detailed UI mockups for approval
6. **Prototype**: Build minimal viable prototype for testing
7. **DNS Configuration**: Ensure `view.canopi.live` DNS is configured
8. **SSL Certificate**: Set up SSL certificate for `view.canopi.live` (certbot)

---

**Status**: 📋 Planning Complete - Ready for Review

**Last Updated**: 2025-01-24

