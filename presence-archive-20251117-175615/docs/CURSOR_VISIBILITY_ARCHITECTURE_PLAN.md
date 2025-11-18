# Cursor Visibility Feature - Architecture Plan

## Overview
Real-time cursor visibility system where cursors are visible from when a person goes live until they stop. Uses unified real-time update/store/retrieve pattern with Chrome local storage and database fallback.

---

## Data Structure

### 1. Cursor Presence Data (Real-time, Ephemeral)
```typescript
interface CursorPresence {
  userId: string;
  userEmail: string;
  pageId: string;
  isLive: boolean;
  position: {
    x: number;
    y: number;
    timestamp: number;
  } | null;
  isParked: boolean;
  parkedAt: {
    x: number;
    y: number;
    timestamp: number;
    elementId?: string; // What element they're parked on
  } | null;
  visualAppearance: CursorAppearance; // See visual options below
  lastUpdated: number;
  // ✅ NEW: Unread indicator
  unreadCount: number; // Number of unread messages
  hasUnread: boolean; // Quick check for pulse indicator
  // ✅ NEW: Active features
  hasLiveMessage: boolean; // Currently showing a live message
  hasAudioStream: boolean; // Currently streaming audio
}
```

### 2. Cursor Preferences (Persistent)
```typescript
interface CursorPreferences {
  userId: string;
  isLiveEnabled: boolean; // Default live status preference
  visualAppearance: CursorAppearance;
  subscriptions: {
    [targetUserId: string]: {
      subscribedAt: number;
      notifications: boolean; // Notify when they go live
    };
  };
  privacy: {
    subscriptionType: 'open' | 'public' | 'communities' | 'rooms'; // ✅ CONFIGURABLE
    allowPublicSubscriptions: boolean; // Anyone can subscribe
    requireApproval: boolean; // Approve subscriptions manually
    blockList: string[]; // Blocked user IDs
  };
  // ✅ COST MODEL
  costModel: {
    freeCursors: number; // First 3 are free
    maxCursors: number; // Max 100
    tokenCostPerCursor: number; // Tokens per additional cursor
    tokenType: 'CANOPI' | 'COMMUNITY';
  };
}
```

### 3. Cursor Subscriptions (Persistent)
```typescript
interface CursorSubscription {
  subscriberId: string; // Who is subscribing
  targetUserId: string; // Whose cursor they want to see (null for global)
  pageId?: string; // Optional: only on specific pages
  createdAt: number;
  status: 'active' | 'pending' | 'blocked';
  // ✅ INTEGRATION: Uses SubscriptionManager
  subscriptionId?: string; // Links to SubscriptionManager subscription
  subscriptionType: 'open' | 'public' | 'communities' | 'rooms'; // ✅ CONFIGURABLE
  isGlobal: boolean; // ✅ NEW: Global page subscription (see all public cursors)
}
```

### 3c. Global Subscription (Persistent)
```typescript
interface GlobalSubscription {
  id: string;
  subscriberId: string; // Who is subscribing
  pageId?: string; // NULL = global (all pages), or specific page
  subscriptionType: 'global-all-public' | 'global-page-public'; // Global or page-specific
  active: boolean;
  createdAt: number;
  updatedAt: number;
  // ✅ INTEGRATION: Uses SubscriptionManager
  subscriptionId?: string; // Links to SubscriptionManager subscription
  // Automatically receives all public/open cursors on current page(s)
}
```

**Two Types**:
1. **Global (all pages)**: `pageId = null`, `subscriptionType = 'global-all-public'`
   - Follows subscriber across all pages
   - See all public cursors on whatever page you're on
   
2. **Page-specific**: `pageId = 'specific-page'`, `subscriptionType = 'global-page-public'`
   - Only for a specific page
   - See all public cursors on that one page

### 3a. Cursor Live Messages (Real-time, Ephemeral)
```typescript
interface CursorLiveMessage {
  id: string;
  userId: string; // Who sent it
  cursorPosition: {
    x: number;
    y: number;
  };
  message: {
    content: string;
    preview?: string; // Preview text
    fullContent?: string; // Full message object
    type?: 'text' | 'audio' | 'preview';
  };
  displayDuration: number; // 7 seconds default
  createdAt: number;
  expiresAt: number; // createdAt + displayDuration
  isHovered: boolean; // If hovered, persist for session
  saved: boolean; // Saved for tokens
  read: boolean; // Has been read
  audioStreamUrl?: string; // For live audio streaming
}
```

### 3b. Cursor Audio Stream (Real-time)
```typescript
interface CursorAudioStream {
  id: string;
  userId: string;
  cursorPosition: {
    x: number;
    y: number;
  };
  streamUrl: string;
  isActive: boolean;
  startedAt: number;
  tokenCost: number; // Tokens required to participate
  isFree: boolean; // First system-wide users get it free
  participants: string[]; // User IDs listening
}
```

### 4. Cursor Session History (Optional, for analytics)
```typescript
interface CursorSession {
  userId: string;
  sessionId: string;
  startedAt: number;
  endedAt?: number;
  pageId: string;
  totalDuration: number; // milliseconds
  parkedCount: number; // How many times they parked
  subscribersCount: number; // Peak subscribers during session
}
```

---

## Storage Strategy: Unified Real-time Pattern

### Storage Layers (Priority Order)

1. **In-Memory State (StateManager)**
   - Fastest access
   - Current cursor positions (ephemeral)
   - Active subscriptions
   - Live status

2. **Chrome Local Storage**
   - Preferences (persist across sessions)
   - Subscriptions list
   - Last known positions (for reconnection)
   - Offline queue

3. **Supabase Database**
   - Persistent preferences
   - Subscription relationships
   - Session history (optional)
   - Cross-device sync

4. **Real-time Broadcast (WebSocket/Supabase Realtime)**
   - Live cursor positions (ephemeral)
   - Live status changes
   - Parking events

### Storage Flow

```
User Action
    ↓
StateManager (in-memory) ← Immediate UI update
    ↓
Chrome Storage (local) ← Persist for offline/performance
    ↓
Supabase Database ← Cross-device sync
    ↓
Real-time Broadcast ← Notify other users
```

### Retrieval Flow

```
1. Check StateManager (in-memory) → Fastest
2. If not found → Check Chrome Storage → Fast
3. If not found → Query Supabase Database → Slower but reliable
4. Subscribe to Real-time updates → Keep in sync
```

---

## Visual Appearance Options

### Option 1: Simple Cursor
- **Description**: Colored circle/dot at cursor position
- **Visual**: `●` or `○` with user's aura color
- **Size**: 20px diameter
- **Pros**: Minimal, lightweight, clear
- **Cons**: Less distinctive

### Option 2: Mini-Avatar
- **Description**: User's avatar (small) at cursor position
- **Visual**: 32x32px or 40x40px avatar image
- **Size**: Small avatar with aura glow
- **Pros**: Highly recognizable, personal
- **Cons**: More bandwidth, larger visual footprint

### Option 3: Cursor + Label
- **Description**: Cursor dot with username label above
- **Visual**: `●` + "username" label
- **Size**: Cursor 20px + label 12px height
- **Pros**: Identifies user clearly
- **Cons**: Can clutter UI

### Option 4: Aura Glow Cursor
- **Description**: Cursor with animated aura glow effect
- **Visual**: Pulsing glow in user's aura color
- **Size**: 20px cursor + 40px glow radius
- **Pros**: Matches aura system, visually appealing
- **Cons**: More animation overhead

### Option 5: Custom Cursor Shape
- **Description**: Custom SVG cursor shape (star, heart, etc.)
- **Visual**: User-selectable shape
- **Size**: 24x24px
- **Pros**: Fun, customizable
- **Cons**: More complex, potential clutter

### Option 6: Trail Effect
- **Description**: Cursor leaves a fading trail
- **Visual**: Trail of dots that fade out
- **Size**: Cursor + trail (up to 100px)
- **Pros**: Shows movement path
- **Cons**: Can be distracting, performance impact

### Option 7: Combination (Recommended)
- **Description**: Mini-avatar + aura glow + optional label
- **Visual**: 
  - Small avatar (32x32px)
  - Aura glow ring around it
  - Username label on hover or when parked
- **Size**: 32px avatar + 48px glow
- **Pros**: Best of all worlds, highly recognizable
- **Cons**: Most complex

### Option 8: Parked Indicator
- **Description**: Special visual when cursor is parked
- **Visual**: 
  - Normal: Mini-avatar or cursor
  - Parked: Pulsing glow + "✓" or "📍" icon
- **Size**: Same as base + indicator
- **Pros**: Clear support indication
- **Cons**: Additional state to manage

---

## Recommended Visual Appearance System

### User Preference Structure
```typescript
interface CursorAppearance {
  type: 'cursor' | 'mini-avatar' | 'cursor-label' | 'aura-glow' | 'custom' | 'combination';
  size: 'small' | 'medium' | 'large'; // 20px, 32px, 48px
  showLabel: boolean; // Show username label
  showAuraGlow: boolean; // Show aura glow effect
  customShape?: string; // SVG path for custom shapes
  parkedIndicator: 'pulse' | 'icon' | 'glow' | 'none'; // How to show parked state
  trail: boolean; // Enable trail effect
  trailLength: number; // Number of trail dots
}
```

### Default Appearance
```typescript
{
  type: 'mini-avatar', // ✅ CONFIRMED: Mini-avatar with aura glow
  size: 'medium', // 32px
  showLabel: false, // Show on hover/park
  showAuraGlow: true, // ✅ CONFIRMED: Aura glow enabled
  parkedIndicator: 'pulse',
  trail: false
}
```

---

## ✅ NEW FEATURES

### 1. Live Messages at Cursor
**Description**: Users can send live messages/previews that appear at their cursor position

**Behavior**:
- Message appears at cursor position
- Displays for **7 seconds** by default
- If user **hovers** over message → persists for the **entire session**
- Messages can be **saved for tokens** (persistent storage)
- Messages can be **read** (mark as read)
- **Unread indicator** on cursor (pulse effect) if messages are unread

**Data Flow**:
```
User sends live message
  ↓
Broadcast to subscribers (real-time)
  ↓
Display at cursor position (7 seconds)
  ↓
If hovered → persist for session
  ↓
If saved (tokens) → store in database
  ↓
Update unread count → pulse cursor indicator
```

### 2. Live Audio Streaming
**Description**: Users can stream live audio from their cursor position

**Behavior**:
- **First system-wide users** get it **FREE**
- After that, requires **tokens to participate**
- Audio stream URL broadcast to subscribers
- Participants can join/listen to stream
- Stream position follows cursor

**Cost Model**:
- First N users system-wide: **FREE**
- After that: **Tokens required** per stream
- Creator can set token cost
- Platform takes percentage

### 3. Unread Indicator
**Description**: Visual indicator when cursor has unread messages

**Visual**:
- **Pulse effect** on cursor (mini-avatar)
- Pulsing aura glow
- Badge with unread count (optional)
- Color change (optional)

**Behavior**:
- Updates in real-time as messages arrive
- Clears when messages are read
- Persists until all messages read

### 4. Cost Model & Token System
**Description**: Easy to start, pay to scale

**Model**:
- **First 3 cursors**: **FREE** (anytime)
- **4-100 cursors**: **Tokens required** per cursor
- **Max 100 cursors** per user
- Cost increases with number of cursors

**Token Flow**:
```
User subscribes to cursor
  ↓
Check: Is this in first 3 free slots?
  ↓
If yes → FREE
If no → Check token balance
  ↓
If sufficient → Deduct tokens → Subscribe
If insufficient → Show payment UI
```

**Integration**:
- Uses existing token system (CANOPI/COMMUNITY tokens)
- Integrates with SubscriptionManager
- Tracks usage for billing

### 5. Subscription Model Integration
**Description**: Configurable subscription types using SubscriptionManager

**Types**:
- **open**: Anyone can subscribe (no restrictions)
- **public**: Public but with privacy controls
- **communities**: Only community members can subscribe
- **rooms**: Only room members can subscribe

**Integration**:
```typescript
// Create cursor subscription via SubscriptionManager
const subscription = await subscriptionManager.subscribe({
  targetType: 'user', // or 'community', 'room'
  targetId: targetUserId,
  targetName: targetUserName,
  preferences: {
    enabled: true,
    types: {
      'cursor:live': true,
      'cursor:message': true,
      'cursor:audio': true
    }
  },
  metadata: {
    cursorSubscription: true,
    subscriptionType: 'open' | 'public' | 'communities' | 'rooms'
  }
});
```

### 6. Global Subscription (All Public Cursors)
**Description**: Subscribe to see ALL public cursors on ANY page that you're on

**Behavior**:
- User subscribes to "all public cursors globally"
- Automatically receives updates for all users with `subscriptionType: 'public'` or `'open'`
- Works on **ANY page** the subscriber is currently viewing
- Follows the subscriber as they navigate between pages
- No need to subscribe to individual cursors or per-page
- Efficient bulk subscription

**Use Cases**:
- See everyone who's live across all pages you visit
- Collaborative browsing sessions across multiple pages
- Group presentations that span multiple pages
- Public events/webinars
- Always-on awareness of public activity

**Implementation**:
```typescript
// Global subscription (follows user across pages)
interface GlobalSubscription {
  subscriberId: string;
  subscriptionType: 'global-all-public'; // Special type
  active: boolean;
  createdAt: number;
  // No pageId - applies to all pages
}

// When user goes live with public/open subscription
// Automatically included in global subscription broadcasts
// Works on whatever page the subscriber is currently on
```

**Data Flow**:
```
User A goes live (public/open) on Page X
  ↓
Check: Are there global subscribers currently on Page X?
  ↓
If yes → Include in global broadcast to those subscribers
  ↓
Global subscribers on Page X see User A's cursor
  ↓
If subscriber navigates to Page Y
  ↓
Now receives all public cursors on Page Y automatically
```

**Page-Specific vs Global**:
- **Page-specific**: Subscribe to all public cursors on a specific page
- **Global**: Subscribe to all public cursors on ANY page you're on (follows you)

**Cost Model**:
- Global subscription counts as **1 subscription** (not per cursor, not per page)
- Still subject to first 3 free rule
- More efficient than subscribing to individual cursors or per-page subscriptions
- One subscription covers all pages you visit

---

## Cross-Device Sync

### How It Works

**Live Status Sync**:
- User goes live on Device A
- Status stored in Supabase `cursor_preferences.is_live_enabled`
- Device B checks database → sees user is live
- Device B shows "Live" indicator
- **BUT**: Cursor positions are **device-specific** (not synced)

**Why Cursor Positions Don't Sync**:
- Each device has its own mouse/cursor
- Cursor position is relative to that device's screen
- Syncing would be confusing (different screen sizes, positions)

**What DOES Sync**:
- ✅ Live status (on/off)
- ✅ Preferences (visual appearance, privacy settings)
- ✅ Subscriptions (who you're subscribed to)
- ✅ Saved messages (if saved for tokens)
- ✅ Session history

**What DOESN'T Sync**:
- ❌ Cursor positions (device-specific)
- ❌ Active cursor position (ephemeral, real-time only)
- ❌ Temporary parked positions (session-only)

**Implementation**:
```typescript
// On Device A: Go live
await supabase.from('cursor_preferences')
  .update({ is_live_enabled: true })
  .eq('user_id', userId);

// On Device B: Check status
const { data } = await supabase.from('cursor_preferences')
  .select('is_live_enabled')
  .eq('user_id', userId)
  .single();

// Device B shows live indicator if is_live_enabled = true
// But cursor position is only visible on Device A's screen
```

---

## Database Schema

### Table: `cursor_preferences`
```sql
CREATE TABLE cursor_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  is_live_enabled BOOLEAN DEFAULT false,
  visual_appearance JSONB DEFAULT '{"type":"combination","size":"medium","showLabel":false,"showAuraGlow":true}',
  privacy_settings JSONB DEFAULT '{"allowPublicSubscriptions":true,"requireApproval":false,"blockList":[]}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `cursor_subscriptions`
```sql
CREATE TABLE cursor_subscriptions (
  id SERIAL PRIMARY KEY,
  subscriber_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  page_id TEXT, -- NULL = all pages
  status TEXT DEFAULT 'active', -- 'active', 'pending', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(subscriber_id, target_user_id, page_id)
);
```

### Table: `cursor_sessions` (Optional, for analytics)
```sql
CREATE TABLE cursor_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  page_id TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  total_duration INTEGER, -- milliseconds
  parked_count INTEGER DEFAULT 0,
  peak_subscribers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `cursor_live_messages`
```sql
CREATE TABLE cursor_live_messages (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  cursor_position_x INTEGER NOT NULL,
  cursor_position_y INTEGER NOT NULL,
  page_id TEXT NOT NULL,
  message_content TEXT NOT NULL,
  message_preview TEXT,
  message_type TEXT DEFAULT 'text', -- 'text', 'audio', 'preview'
  display_duration INTEGER DEFAULT 7000, -- 7 seconds in ms
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_hovered BOOLEAN DEFAULT false,
  saved BOOLEAN DEFAULT false, -- Saved for tokens
  read BOOLEAN DEFAULT false,
  audio_stream_url TEXT,
  session_id TEXT, -- Links to cursor session
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `cursor_audio_streams`
```sql
CREATE TABLE cursor_audio_streams (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  cursor_position_x INTEGER NOT NULL,
  cursor_position_y INTEGER NOT NULL,
  page_id TEXT NOT NULL,
  stream_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP NOT NULL,
  token_cost INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false, -- First system-wide users
  participants TEXT[], -- Array of user IDs
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `cursor_subscriptions` (Updated)
```sql
CREATE TABLE cursor_subscriptions (
  id SERIAL PRIMARY KEY,
  subscriber_id TEXT NOT NULL,
  target_user_id TEXT, -- NULL for global page subscriptions
  page_id TEXT, -- NULL = all pages
  status TEXT DEFAULT 'active', -- 'active', 'pending', 'blocked'
  subscription_type TEXT DEFAULT 'open', -- 'open', 'public', 'communities', 'rooms'
  is_global BOOLEAN DEFAULT false, -- TRUE = global page subscription
  subscription_manager_id TEXT, -- Links to SubscriptionManager subscription
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(subscriber_id, target_user_id, page_id)
);
```

### Table: `global_subscriptions`
```sql
CREATE TABLE global_subscriptions (
  id SERIAL PRIMARY KEY,
  subscriber_id TEXT NOT NULL,
  page_id TEXT, -- NULL = global (all pages), or specific page ID
  subscription_type TEXT DEFAULT 'global-all-public', -- 'global-all-public' or 'global-page-public'
  active BOOLEAN DEFAULT true,
  subscription_manager_id TEXT, -- Links to SubscriptionManager subscription
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(subscriber_id, page_id) -- NULL page_id = one global subscription per user
);
```

**Note**: 
- `page_id = NULL` means global subscription (all pages)
- `page_id = 'specific-page'` means page-specific subscription
- One user can have both: 1 global + multiple page-specific subscriptions

### Table: `cursor_preferences` (Updated)
```sql
CREATE TABLE cursor_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  is_live_enabled BOOLEAN DEFAULT false,
  visual_appearance JSONB DEFAULT '{"type":"mini-avatar","size":"medium","showLabel":false,"showAuraGlow":true}',
  privacy_settings JSONB DEFAULT '{"subscriptionType":"open","allowPublicSubscriptions":true,"requireApproval":false,"blockList":[]}',
  cost_model JSONB DEFAULT '{"freeCursors":3,"maxCursors":100,"tokenCostPerCursor":10,"tokenType":"CANOPI"}',
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Real-time Update Pattern

### StateManager Integration
```typescript
// Store in StateManager
StateManager.setState('cursor.presence', cursorPresence);
StateManager.setState('cursor.preferences', preferences);
StateManager.setState('cursor.subscriptions', subscriptions);

// Persist to Chrome Storage
await chrome.storage.local.set({
  'cursor_preferences': preferences,
  'cursor_subscriptions': subscriptions
});

// Sync to Supabase
await supabase.from('cursor_preferences').upsert(preferences);
await supabase.from('cursor_subscriptions').upsert(subscriptions);

// Broadcast real-time
await supabaseRealtimeClient.broadcastCursorEvent({
  type: 'CURSOR_POSITION',
  ...cursorPresence
});
```

### Retrieval Pattern
```typescript
// 1. Check StateManager (fastest)
let presence = StateManager.getState('cursor.presence');

// 2. If not found, check Chrome Storage
if (!presence) {
  const stored = await chrome.storage.local.get('cursor_preferences');
  presence = stored.cursor_preferences;
}

// 3. If still not found, query Supabase
if (!presence) {
  const { data } = await supabase
    .from('cursor_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  presence = data;
}

// 4. Subscribe to real-time updates
supabaseRealtimeClient.subscribe('cursor_presence', (event) => {
  StateManager.setState('cursor.presence', event.new);
});
```

---

## Implementation Phases

### Phase 1: Data Structure & Storage
- [ ] Define TypeScript interfaces
- [ ] Create StateManager integration
- [ ] Implement Chrome Storage persistence
- [ ] Create Supabase tables
- [ ] Implement unified store/retrieve pattern

### Phase 2: Visual Appearance System
- [ ] Create appearance preference UI
- [ ] Implement rendering for each appearance type
- [ ] Add aura glow integration
- [ ] Implement parked indicator
- [ ] Performance optimization

### Phase 3: Real-time Updates
- [ ] WebSocket cursor position broadcasting
- [ ] Supabase Realtime subscriptions
- [ ] StateManager sync
- [ ] Offline queue handling

### Phase 4: Subscription System
- [ ] Integrate with SubscriptionManager
- [ ] Subscription UI (open/public/communities/rooms)
- [ ] **Global subscription** (see all public cursors on ANY page you're on)
- [ ] **Page-specific global subscription** (see all public cursors on specific page)
- [ ] Page navigation tracking (for global subscriptions)
- [ ] Privacy controls
- [ ] Approval workflow (if requireApproval)
- [ ] Block list management
- [ ] Cost model implementation (first 3 free, then tokens)

### Phase 5: Live Messages System
- [ ] Send live message at cursor position
- [ ] 7-second display timer
- [ ] Hover to persist for session
- [ ] Save messages for tokens
- [ ] Read/unread tracking
- [ ] Unread indicator (pulse effect)

### Phase 6: Audio Streaming System
- [ ] Live audio stream from cursor
- [ ] First system-wide users free
- [ ] Token-based participation
- [ ] Stream URL management
- [ ] Participant tracking

### Phase 7: Cross-Device Sync
- [ ] Live status sync via Supabase
- [ ] Preferences sync
- [ ] Subscriptions sync
- [ ] Saved messages sync

### Phase 8: Polish & Optimization
- [ ] Performance tuning (100 cursor limit)
- [ ] Visual polish
- [ ] Analytics (optional)
- [ ] Documentation

---

## ✅ RESOLVED QUESTIONS

1. **Visual Default**: ✅ **Mini-avatar with aura glow** (CONFIRMED)

2. **Storage Frequency**: ✅ Only persist preferences/subscriptions, not positions (ephemeral)

3. **Subscription Model**: ✅ **Configurable** - open, public, communities, rooms (via SubscriptionManager)

4. **Cross-Device**: ✅ **Yes** - Live status syncs, cursor positions are device-specific (explained above)

5. **Performance**: ✅ **Max 100 cursors**, first 3 free, then tokens required

6. **Parking Duration**: ✅ No, clear on stop live

7. **Live Messages**: ✅ 7 seconds display, hover to persist, save for tokens

8. **Audio Streaming**: ✅ First system-wide users free, then tokens

9. **Unread Indicator**: ✅ Pulse effect on cursor when unread messages

---

## Next Steps

1. **Review & Approve**: Review this architecture plan
2. **Choose Visual Default**: Select default appearance type
3. **Database Setup**: Create Supabase tables
4. **StateManager Integration**: Add cursor state to StateManager
5. **Begin Implementation**: Start with Phase 1

