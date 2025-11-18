# Comprehensive Timeline Landing Page & Constructed Timelines Specification

## Executive Summary

We are building a **Timeline Landing Page** that serves as a discovery and management interface for **Constructed Timelines** - curated, multi-author timelines that can be public, private, community-scoped, or room-scoped. Users can browse timelines, create new ones, and add entries from any message via an actions menu.

**Architectural Note**: Timelines are a specific type of **collectively generated map**. The system is designed to support multiple map types (timelines being the first), each with unique visualization capabilities (horizontal/vertical views). Messages can be added to any map type via an "Add to Map" menu that displays available map types in a dropdown.

---

## 1. Core Concepts

### 1.1 Maps Architecture

**Overview**: The system supports **collectively generated maps** - curated collections of messages that can be visualized in various ways. Timelines are the first map type, with the architecture designed to support additional map types in the future.

**Map Types**:
- **Timelines** - Chronological or display-date ordered collections (first implementation)
- **Future Map Types** - Other visualization types (e.g., spatial maps, topic maps, relationship graphs, etc.)

**Shared Infrastructure**:
- All map types share the base message infrastructure
- Each map type has its own table for map-specific fields (e.g., `constructed_timelines` for timeline-specific data)
- Messages are linked to maps via a generic `map_id` and `map_type` relationship
- Each map type can have unique horizontal/vertical visualization views

**Message-to-Map Relationship**:
- Messages can be added to any map type via "Add to Map" action
- Menu displays available map types in dropdown (timelines first)
- Map-specific fields stored in generic extension tables (key-value pairs)
- Entries can belong to multiple maps of any type

**SDK & Extension Architecture**:
- Map types are registered via a plugin/extension system
- Each map type provides:
  - Field definitions (for map-level and entry-level fields)
  - Visualization components (horizontal/vertical views)
  - Validation rules
  - Sorting/filtering capabilities
  - API endpoint handlers (optional, can use generic endpoints)
- **Generic Extension System**: Instead of separate tables per map type, all extension data is stored in generic tables:
  - `map_extension_fields`: Stores key-value pairs for map-level extensions
  - `map_entry_extension_fields`: Stores key-value pairs for entry-level extensions
  - `map_entry_assignment_extension_fields`: Stores key-value pairs for assignment-level (map-specific) extensions
  - `map_type_field_definitions`: Maps map types to their field definitions
- **Field Sharing**: Common fields like `displayDate` and `location` can be used by multiple map types
  - Same `field_key` and `field_type` registered for different map types
  - Allows consistent data structure and querying across map types
  - Example: Timeline, Spatial Map, and Topic Map can all use `displayDate` and `location` fields
  - Fields marked with `is_shared = true` in field definitions indicate they're available for reuse
- System dynamically loads registered map types
- Third-party developers can create custom map types via SDK
- Map type registration is done at application startup or via plugin system

**Multi-Map Entry Support**:
- Entries can belong to multiple maps of any type (timelines, spatial maps, topic maps, etc.)
- Each entry-map relationship is stored in `map_entry_assignments`
- Map-specific metadata (like `displayDate` for timelines, `coordinates` for spatial maps) is stored per assignment
- This allows the same entry to appear in different maps with different metadata per map
- Example: An entry can be in a timeline with a `displayDate`, and also in a spatial map with `coordinates`

### 1.2 Constructed Timelines vs Profile Timelines

**Profile Timelines** (existing):
- Auto-generated from user activities (messages, reactions, bookmarks, etc.)
- One timeline per user
- Route: `/timelines/:userId`
- Read-only aggregation

**Constructed Timelines** (new):
- Manually curated by one or more creators
- Multiple timelines can exist
- Route: `/timelines/:timelineId` (UUID-based)
- Entries added manually via "Add to Timeline" action
- Support `displayDate` for non-chronological ordering
- Can have rich content (text, images, audio, video)
- **Timeline entries are first-class messages**: All message capabilities apply (threaded replies, reactions, shares, reposts, bookmarks, etc.)

### 1.2 Visibility & Scoping

**Timeline-Level Visibility**:
- `public` - Discoverable by everyone, visible to all
- `private` - Only visible to creators/contributors
- `community` - Visible to members of specified communities
- `room` - Visible to members of specified rooms

**Entry-Level Visibility**:
- Can override timeline default
- Same options: `public`, `private`, `community`, `room`
- Entry can specify multiple communities/rooms

### 1.3 Roles & Permissions

**Timeline Creator**:
- Full control (edit/delete timeline, manage all roles)
- Can add/edit/delete any entry (unlimited)
- Can change timeline visibility
- Can assign/revoke admin, moderator, and contributor roles
- Can approve/deny contributor and moderator requests
- Cannot be removed (original creator always retains creator role)

**Timeline Admin**:
- Can add/edit/delete any entry (unlimited)
- Can change timeline visibility
- Can assign/revoke moderator and contributor roles
- Can approve/deny contributor and moderator requests
- Cannot manage creator role
- Cannot delete timeline
- **Cannot be requested** - only creators can assign admin role

**Timeline Moderator**:
- Can add/edit/delete any entry (unlimited)
- Can moderate entries (delete, flag handling)
- Can approve/deny contributor requests
- Cannot change timeline visibility
- Cannot manage roles (admin/creator)
- Cannot delete timeline
- Can request moderator status (if timeline requires approval)

**Timeline Contributor**:
- Can add entries (if timeline is "open" OR if approved as contributor)
- Can edit/delete own entries (1-hour window)
- Cannot manage timeline settings
- Cannot manage roles
- Can request contributor status (if timeline requires approval)

**Timeline Viewer**:
- Can view timeline (if visibility allows)
- Can flag entries
- Cannot add/edit/delete entries
- Can react, reply, share, repost, bookmark like all messages (if authenticated)
- Can request contributor or moderator status (if timeline requires approval)
- Can add entries directly (if timeline is "open" and user has view access)

---

## 2. User Flows

### 2.1 Landing Page Flow

```
User visits /timelines
├── If authenticated:
│   ├── See "Featured" section (manually curated by admins)
│   ├── See "Leaderboard" section (timelines and individuals)
│   ├── See "My Timelines" section
│   ├── See "Shared with Me" section
│   ├── See "Communities" section (timelines in user's communities)
│   └── See "Rooms" section (timelines in user's rooms)
├── If not authenticated:
│   └── See "Featured", "Leaderboard", and "Public" sections only
└── All users:
    ├── Can search timelines that are visible to them
    ├── Can filter by visibility
    └── Can click timeline card to view detail
```

**Featured Timelines**:
- Manually curated by admins via admin interface
- Displayed prominently in "Featured" section on landing page

**Leaderboards**:
- **Timeline Leaderboard**: See Section 2.1.1 - Timeline Leaderboard
- **Individual Leaderboard**: See Section 2.1.2 - Individual Leaderboard

### 2.1.1 Timeline Leaderboard

**Overview**: Leaderboard showing top timelines across all timelines based on engagement and quality metrics.

**Metrics** (configurable):
- Entry count
- Contributor count
- Subscriber count
- Engagement score (reactions, replies, shares) - See scoring approaches below
- Quality score (based on flags, moderation actions) - See scoring approaches below
- Recent activity (weighted by recency)

**Display**:
- Ranked list of timelines with metrics
- Sortable by any metric
- Filterable by visibility (public timelines only, or include private/community/room)
- Time period selector (all time, last week, last month, last year)
- Pagination for large lists

**Access**:
- Available on landing page as "Leaderboard" tab/section
- Accessible to all users (respects visibility - only shows timelines user can view)

**API**:
```
GET /api/timelines/leaderboard?metric={metric}&period={period}&limit={number}&offset={number}

Response:
{
  timelines: TimelineLeaderboardEntry[],
  total: number
}

interface TimelineLeaderboardEntry {
  timeline: Timeline,
  rank: number,
  metrics: {
    entryCount: number,
    contributorCount: number,
    subscriberCount: number,
    engagementScore: number,
    qualityScore: number,
    recentActivity: number
  }
}
```

#### Engagement & Quality Score Calculation Approaches

Three approaches for calculating engagement and quality scores, each with different trade-offs:

**Approach 1: Simple Count-Based (MVP/Transparent)**
```
Engagement Score = reactions + (replies × 2) + (shares × 3, capped at 3 per day per user)
Quality Score = 100 - (flags × 10) - (moderation_actions × 20)
  (minimum 0)

Recent Activity = entries_created_last_7_days × 1.5 + entries_created_last_30_days × 1.0

Share Scoring:
- Share button clicks: Count up to 3 per day per user (prevents gaming)
- Incoming share links: Track unique visitors from share links
- Referral credit: +5 points if visitor from share link registers (one-time per referral)
```

**Why Choose This:**
- ✅ **Transparency**: Users can easily understand how scores are calculated
- ✅ **Fast to implement**: No complex calculations or data processing
- ✅ **Predictable**: Users can see exactly what actions increase their score
- ✅ **Good for MVP**: Gets leaderboards working quickly
- ❌ **Limited nuance**: Doesn't account for engagement quality or time decay
- ❌ **Can be gamed**: Simple counting can be manipulated
- ❌ **No normalization**: Doesn't account for timeline size or age

**Best For**: MVP launch, when you want users to understand the system, or when simplicity is a priority.

---

**Approach 2: Weighted Time-Decay (Balanced)**
```
Engagement Score = 
  (reactions × 1.0 × time_decay) + 
  (replies × 3.0 × time_decay) + 
  (shares × 5.0 × time_decay, capped at 3 per day per user) +
  (bookmarks × 2.0 × time_decay) +
  (referrals × 10.0 × time_decay)  // Visitors from share links who register

Time Decay = e^(-days_ago / 30)  // Exponential decay, 30-day half-life

Share Scoring:
- Share button clicks: Count up to 3 per day per user (prevents gaming)
- Incoming share links: Track unique visitors from share links
- Referral credit: +10 points if visitor from share link registers (one-time per referral, weighted by time decay)

Quality Score = 
  base_score = 100
  - (flags × 15 × severity_weight)
  - (moderation_actions × 25 × action_severity)
  + (positive_moderation × 10)  // Entries approved after review
  (minimum 0, maximum 100)

Severity Weights:
  - Minor flag: 0.5
  - Moderate flag: 1.0
  - Severe flag: 2.0
```

**Why Choose This:**
- ✅ **Recency matters**: Recent engagement weighted more heavily
- ✅ **Action differentiation**: Replies and shares worth more than reactions
- ✅ **Quality awareness**: Flags reduce score based on severity
- ✅ **Balanced**: Good middle ground between simple and complex
- ❌ **More complex**: Requires time-based calculations
- ❌ **Requires tuning**: Decay rates and weights need calibration
- ❌ **Storage overhead**: May need to cache scores or calculate on-demand

**Best For**: Production system where you want to reward active, quality content while penalizing problematic entries. Good balance of sophistication and maintainability.

---

**Approach 3: Composite Percentile-Based (Sophisticated)**
```
Engagement Score = 
  percentile_rank(reaction_rate, all_timelines) × 0.2 +
  percentile_rank(reply_rate, all_timelines) × 0.3 +
  percentile_rank(share_rate, all_timelines) × 0.2 +
  percentile_rank(referral_rate, all_timelines) × 0.1 +
  percentile_rank(unique_engagers, all_timelines) × 0.2

Where:
  reaction_rate = reactions / entries
  reply_rate = replies / entries
  share_rate = (shares_capped_at_3_per_day_per_user) / entries
  referral_rate = (visitors_from_shares_who_registered) / entries
  unique_engagers = distinct users who engaged / entries

Share Scoring:
- Share button clicks: Count up to 3 per day per user (prevents gaming)
- Incoming share links: Track unique visitors from share links
- Referral credit: Count visitors from share links who register (one-time per referral)

Quality Score = 
  percentile_rank(flag_rate, all_timelines, inverse=true) × 0.4 +
  percentile_rank(moderation_approval_rate, all_timelines) × 0.4 +
  percentile_rank(creator_reputation, all_users) × 0.2

Where:
  flag_rate = flags / entries (lower is better, so inverse)
  moderation_approval_rate = approved_after_review / total_reviewed
  creator_reputation = average quality score of creator's other timelines
```

**Why Choose This:**
- ✅ **Fair comparison**: Percentile ranking normalizes for timeline size/age
- ✅ **Hard to game**: Relative ranking prevents simple manipulation
- ✅ **Sophisticated**: Accounts for multiple quality signals
- ✅ **Scalable**: Works well as platform grows
- ❌ **Complex**: Requires percentile calculations across all timelines
- ❌ **Performance**: May need pre-computed scores or background jobs
- ❌ **Less transparent**: Users may not understand percentile-based scoring
- ❌ **Requires data**: Needs sufficient data for meaningful percentiles

**Best For**: Mature platform with large dataset, when fairness and preventing gaming are priorities, or when you want sophisticated quality signals.

---

**Recommendation by Stage:**
- **MVP/Launch**: Use Approach 1 (Simple Count-Based)
- **Growth Phase**: Migrate to Approach 2 (Weighted Time-Decay)
- **Mature Platform**: Consider Approach 3 (Composite Percentile-Based) if gaming becomes an issue

**Hybrid Option**: Start with Approach 1, add time-decay (from Approach 2) as a multiplier, then add percentile normalization (from Approach 3) if needed.

**Share Tracking Implementation Notes**:
- **Share Button Clicks**: Track `share_clicks` table with `user_id`, `entry_id`, `timeline_id`, `clicked_at`
  - Daily limit: Query counts shares per user per day, cap at 3 for scoring
  - Prevents gaming: Users can't spam share button for points
- **Incoming Share Links**: Track `share_link_visits` table with `share_token`, `visitor_id` (if authenticated), `ip_address`, `visited_at`, `registered` (boolean)
  - Share tokens: Unique token per share link (e.g., `timeline/{id}/share/{token}`)
  - Visitor tracking: Track anonymous visitors, link to user if they register
  - Referral attribution: When visitor registers, link back to original sharer
- **Referral Credit**: One-time credit when visitor from share link completes registration
  - Prevents double-counting: Each referral counted once
  - Attribution window: Consider 30-day window for attribution (visitor registers within 30 days of clicking share link)

### 2.1.2 Individual Leaderboard

**Overview**: Leaderboard showing top individuals based on message contributions across different scopes.

**Default Scope**: All messages (regular messages only, excludes map entries)

**Scope Options**:
- **All messages**: Default - includes all regular messages across the platform
- **All map types**: Includes messages from all map types (timelines, spatial maps, topic maps, etc.)
- **Specific map type**: Filter to specific map type (e.g., timelines only)
- **Selected timelines** (in horizontal view): Only count messages from timelines currently selected in horizontal view

**Metrics**:
- Message count (total messages created)
- Entry count (map entries created, if scope includes map types)
- Engagement score (reactions received, replies received) - See Section 2.1.1 for scoring approaches
- Quality score (based on flags, moderation actions) - See Section 2.1.1 for scoring approaches
- Recent activity (weighted by recency)

**Display**:
- Ranked list of users with metrics
- Sortable by any metric
- Time period selector (all time, last week, last month, last year)
- Scope selector (dropdown for selecting scope)
- Pagination for large lists
- User avatars and names

**Access**:
- Available on landing page as "Leaderboard" tab/section
- Accessible to all authenticated users
- Respects visibility - only counts messages user can view

**API**:
```
GET /api/users/leaderboard?scope={scope}&mapType={mapType}&timelineIds={timelineIds}&metric={metric}&period={period}&limit={number}&offset={number}

Query Params:
- scope: 'messages' | 'all_maps' | 'map_type' | 'selected_timelines'
- mapType: string (required if scope = 'map_type')
- timelineIds: UUID[] (required if scope = 'selected_timelines', comma-separated)
- metric: 'count' | 'engagement' | 'quality' | 'recent_activity'
- period: 'all_time' | 'week' | 'month' | 'year'

Response:
{
  users: UserLeaderboardEntry[],
  total: number
}

interface UserLeaderboardEntry {
  user: User,
  rank: number,
  metrics: {
    messageCount: number,
    entryCount: number, // If scope includes map types
    engagementScore: number,
    qualityScore: number,
    recentActivity: number
  }
}
```

### 2.2 Create Timeline Flow

```
User clicks "Create Timeline"
├── Modal opens with:
│   ├── Title (required)
│   ├── Description (optional)
│   ├── Default visibility (public/private/community/room)
│   ├── Community/Room selectors (if applicable)
│   ├── Contributor access mode:
│   │   ├── "Open" - Anyone can add entries (if they can view timeline)
│   │   └── "Require Approval" - Users must request and be approved to contribute
│   └── Initial contributors (optional, if approval required)
├── User submits
├── API creates timeline
├── User redirected to new timeline detail page
└── Toast: "Timeline created successfully"
```

**Contributor Access Modes**:
- **Open**: Any user who can view the timeline can add entries (no approval needed)
- **Require Approval**: Users must request contributor or moderator status; creators/admins approve requests

**Note**: Admin role cannot be requested - only creators can assign admin role directly via role management.

### 2.3 Add Entry Flow

```
User viewing a message
├── Clicks "..." actions menu
├── Sees "Add to Map" option
├── Clicks it
├── Modal opens:
│   ├── Map type dropdown:
│   │   ├── "Timeline" (first option, default)
│   │   └── [Future map types will appear here]
│   ├── Map multi-select (filtered to maps of selected type that user can contribute to):
│   │   ├── If "Timeline" selected: Shows available timelines (can select multiple)
│   │   └── If other map type: Shows available maps of that type (can select multiple)
│   ├── Note textarea (pre-filled with message content, editable)
│   ├── Visibility selector (public/private/community/room)
│   ├── Community multi-select (if visibility = community)
│   ├── Room multi-select (if visibility = room)
│   ├── Map-specific fields (dynamic based on map type, per selected map):
│   │   ├── If Timeline selected: 
│   │   │   ├── Per-timeline fields:
│   │   │   │   ├── Display date picker (optional, per timeline)
│   │   │   │   └── Location selector (optional, per timeline):
│   │   │   │       ├── Location type dropdown (coordinates/address/city/state_province/country/continent/global)
│   │   │   │       ├── Location value input (or coordinate picker for coordinates)
│   │   │   │       └── Address fields (if type = address)
│   │   └── If other map type: [Map-specific fields from map type definition, per selected map]
│   └── Attachment upload (images/audio/video, optional)
├── User selects map type, one or more maps, fills note, sets visibility, sets map-specific fields per map
├── User submits
├── API creates map entry (or uses existing if entry already exists for this message)
├── API creates map_entry_assignments for each selected map with map-specific metadata
├── Toast: "Added to [N] map(s)."
└── Entry appears in all selected maps (via real-time update)
```

**Map Type Selection**:
- First option is always "Timeline" (default)
- Future map types will appear in the dropdown as they are implemented
- Selecting a map type filters the map dropdown to show only maps of that type
- **Multiple maps can be selected** - entry will be added to all selected maps
- Map-specific fields appear dynamically based on selected map type
- If multiple maps of same type are selected, user can set different map-specific fields per map
- If entry already exists (e.g., from same message), system creates new assignments rather than duplicate entries

### 2.4 Edit Entry Flow

```
Author viewing own entry (< 1 hour old) OR Moderator/Admin/Creator viewing any entry
├── Sees "Edit" button on entry
├── Clicks it
├── Modal opens with current content
├── User edits note, visibility, attachments
├── User submits
├── API updates entry
├── If entry has pending flags: Set edited_after_flag = TRUE on all flags (flags remain for audit)
├── Toast: "Entry updated"
└── Entry updates in timeline (via real-time)
```

**Edit Permissions**:
- **Authors**: Can edit own entries within 1-hour window (enforced via `editableUntil` timestamp)
- **Creators**: Can edit any entry anytime (bypasses 1-hour restriction)
  - Rationale: Creators have ultimate responsibility for timeline content and should maintain full editorial control
  - All edits are tracked (same as message edits) for audit trail
- **Moderators/Admins**: Can edit any entry anytime (same as creators)

**Flag Handling on Edit**:
- If the entry has pending flags, all flags are marked with `edited_after_flag = TRUE`
- Flags are NOT cleared or reset - they remain for audit trail and moderation review
- Moderators can see both the original flagged content and the current edited version
- Flags marked with `edited_after_flag = TRUE` are highlighted in moderation UI as "needs re-review"

### 2.5 Delete Entry Flow

```
Author viewing own entry (< 1 hour old) OR Moderator/Admin/Creator viewing any entry
├── Sees "Delete" button on entry
├── Clicks it
├── Confirmation dialog: "Delete this entry?"
├── User confirms
├── API adds entry UUID to deleted_messages table (original entry remains in timeline_entries)
├── Toast: "Entry deleted"
└── Entry display updates (via real-time):
    ├── If entry has replies: Shows [deleted] in place of body, entry container remains visible
    └── If entry has no replies: Entry is not displayed in timeline view
```

**Delete Permissions**:
- **Own entries**: Can delete within 1-hour window (all roles)
- **Any entry**: Moderator, Admin, and Creator can delete anytime (unlimited)
- **Other users' entries**: Contributors and Viewers cannot delete after 1-hour window

**Deletion Behavior**:
- Like all message, timeline entries are soft-deleted by adding their UUID to the `deleted_messages` table
- The original entry remains in the `timeline_entries` table (not moved or removed)
- When processing/displaying entries:
  - If entry UUID is in `deleted_messages` AND entry has no replies → Do not display the entry
  - If entry UUID is in `deleted_messages` AND entry has replies → Display entry with `[deleted]` text replacing the body content
- Deleted entries with replies maintain their `displayDate` and position in timeline to preserve thread structure

### 2.7 Request Contributor/Moderator Status Flow

```
User viewing timeline (with "Require Approval" mode)
├── Sees "Request to Contribute" or "Request Moderator Status" button
├── Clicks it
├── Modal opens with:
│   ├── Role selector (Contributor or Moderator)
│   ├── Optional message to creators/admins
│   └── Submit button
├── User selects role, adds message (optional)
├── User submits request
├── API creates role request (contributor or moderator)
├── Toast: "Request sent. You'll be notified when approved."
└── Creators/admins receive notification
```

**Note**: Admin role cannot be requested - only creators can assign admin role directly.

### 2.8 Approve/Deny Contributor/Moderator Request Flow

```
Creator/Admin viewing timeline
├── Sees notification badge for pending requests
├── Clicks "Manage Roles" or "Manage Contributors"
├── Modal opens showing:
│   ├── List of pending requests (contributor and moderator)
│   ├── User info (avatar, name, handle)
│   ├── Requested role (Contributor or Moderator)
│   ├── Request message (if provided)
│   └── Approve/Reject buttons per request
├── Creator/Admin clicks "Approve"
├── API adds user with requested role
├── User receives notification: "You are now a [role] for [Timeline Name]"
└── Toast: "[Role] approved"
```

### 2.9 Assign/Revoke Roles Flow

```
Creator/Admin viewing timeline
├── Clicks "Manage Roles" or "Manage Contributors"
├── Modal opens showing:
│   ├── Current members with roles (Creator, Admin, Moderator, Contributor)
│   ├── Role badges for each member
│   ├── Actions per member:
│   │   ├── Creator: No actions (cannot be removed)
│   │   ├── Admin: "Revoke Admin" (creators only)
│   │   ├── Moderator: "Promote to Admin" (creators only), "Revoke Moderator"
│   │   └── Contributor: "Promote to Moderator", "Promote to Admin" (creators only), "Revoke Contributor"
│   └── "Invite" button to add new members
├── Creator/Admin clicks action (e.g., "Promote to Admin")
├── Confirmation dialog (for role changes)
├── User confirms
├── API updates user role
├── User receives notification: "You are now an admin for [Timeline Name]"
└── Toast: "Role updated"
```

**Role Assignment Rules**:
- **Creator**: Can assign/revoke any role (admin, moderator, contributor)
- **Admin**: Can assign/revoke moderator and contributor roles only
- **Moderator**: Cannot assign/revoke roles
- **Admin role**: Cannot be requested, only assigned by creators
- **Creator role**: Cannot be revoked or transferred

### 2.10 Flag Entry Flow

```
Any user viewing entry
├── Sees "Flag" button/link
├── Clicks it
├── Modal opens with:
│   ├── Reason dropdown (spam, inappropriate, misinformation, other)
│   ├── Additional notes (optional)
│   └── Submit button
├── User selects reason, adds notes
├── User submits
├── API creates flag record
├── Toast: "Entry flagged. Thank you for your report."
└── Flag count increments (visible to moderators)
```

---

## 3. Data Models

### 3.1 Map Architecture

**Base Map Structure**:
```typescript
interface BaseMap {
  id: UUID;
  mapType: 'timeline' | 'spatial' | 'topic' | 'relationship' | ...; // Extensible
  title: string;
  description?: string;
  creatorId: UUID;
  visibility: 'public' | 'private' | 'community' | 'room';
  contributorAccess: 'open' | 'approval_required';
  createdAt: ISO8601;
  updatedAt: ISO8601;
  
  // Relationships
  creator: User;
  contributors: MapContributor[];
  contributorRequests?: ContributorRequest[];
  entries: MapEntry[]; // Generic map entries
  scopes?: MapScope[];
}
```

**Map-Specific Extensions** (via generic extension tables):
```typescript
// Timeline-specific map-level fields are stored in map_extension_fields table
// Example: defaultLocationType would be stored as:
// { mapId: UUID, fieldKey: 'defaultLocationType', fieldValue: 'city' }
// Field definition registered in map_type_field_definitions with map_type='timeline', field_key='defaultLocationType', field_scope='map'

// Future map types use the same generic extension tables
// No separate interfaces needed - all extensions use the generic MapExtensionField structure
```

### 3.2 Constructed Timeline (Timeline Map Type)

```typescript
interface ConstructedTimeline extends BaseMap {
  mapType: 'timeline'; // Specific map type
  // Timeline-specific map-level fields from map_extension_fields table
  // Example: defaultLocationType (if set)
  // All base map fields inherited
}
```

### 3.3 Map Entry (Generic)

```typescript
interface MapEntry {
  id: UUID;
  // Note: Entry does NOT have a single mapId - entries can belong to multiple maps
  messageId?: UUID; // Optional: link to source message
  authorId: UUID;
  content: string;
  createdAt: ISO8601;
  visibility: 'public' | 'private' | 'community' | 'room';
  editableUntil: ISO8601; // createdAt + 1 hour
  
  // Relationships
  author: User;
  maps: MapEntryAssignment[]; // Entry can belong to multiple maps
  replyTo?: UUID; // For threaded replies (inherited from message system)
  attachments: MapEntryAttachment[];
  scopes: MapEntryScope[];
  flags: MapEntryFlag[];
  flagCount: number;
  extensionFields: MapEntryExtensionField[]; // Generic extension fields
}

**Note**: Map entries are first-class messages stored in the `messages` table. All message capabilities apply automatically:
- Threaded replies (via `replyTo` field)
- Reactions, shares, reposts, bookmarks (via message system)
- Reply notifications and depth limits follow message system rules
- No additional implementation needed - handled by existing message infrastructure

interface MapEntryAssignment {
  id: UUID;
  entryId: UUID; // References MapEntry
  mapId: UUID; // References BaseMap
  mapType: 'timeline' | 'spatial' | 'topic' | ...; // Matches map type
  assignedAt: ISO8601;
  assignedBy: UUID; // User who added entry to this map
  extensionFields: MapEntryExtensionField[]; // Map-specific extension fields for this assignment
  // Example: For timeline, this might include displayDate, location, etc.
}

interface MapEntryExtensionField {
  id: UUID;
  entryId?: UUID; // If entry-level field
  assignmentId?: UUID; // If assignment-level field (map-specific)
  fieldKey: string; // e.g., 'displayDate', 'location', 'latitude', 'longitude'
  fieldType: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'coordinates' | 'location';
  fieldValue: string | number | boolean | JSON; // Stored as JSONB in DB
  // Field definitions come from map_type_field_definitions
}
```

### 3.4 Timeline Entry (Timeline-Specific View)

```typescript
// TimelineEntry is a view of MapEntry with timeline-specific assignment data
interface TimelineEntry extends MapEntry {
  // Entry can belong to multiple timelines, so this represents one timeline assignment
  timelineId: UUID; // The specific timeline this entry is assigned to
  assignmentId: UUID; // The assignment ID
  displayDate?: ISO8601; // From assignment extension fields (field_key = 'displayDate')
  location?: TimelineLocation; // From assignment extension fields (field_key = 'location')
  // All other fields from MapEntry
}

interface TimelineLocation {
  type: 'coordinates' | 'address' | 'city' | 'state_province' | 'country' | 'continent' | 'global';
  value: string; // Location value (e.g., "37.7749,-122.4194" for coordinates, "San Francisco" for city)
  coordinates?: {
    latitude: number;
    longitude: number;
  }; // Optional: parsed coordinates if type is 'coordinates' or 'address'
  address?: {
    street?: string;
    city?: string;
    stateProvince?: string;
    country?: string;
    postalCode?: string;
  }; // Optional: parsed address components if type is 'address'
  hierarchy?: {
    city?: string;
    stateProvince?: string;
    country?: string;
    continent?: string;
  }; // Optional: hierarchical context for sorting/filtering
}
```

**Location Hierarchy** (for sorting/filtering):
- `coordinates`: Most specific (latitude/longitude)
- `address`: Street-level location
- `city`: City-level location
- `state_province`: State or province level
- `country`: Country level
- `continent`: Continent level
- `global`: No specific location (default)

**Map-Specific Entry Fields**:
- **Common Fields** (shared across map types):
  - `displayDate`: Used by timelines, spatial maps, topic maps, etc. (stored in `map_entry_assignment_extension_fields` with `field_key = 'displayDate'`)
  - `location`: Used by timelines, spatial maps, topic maps, etc. (stored in `map_entry_assignment_extension_fields` with `field_key = 'location'`)
- **Timeline-specific fields**: `displayDate`, `location` (both are common/shared fields)
- **Spatial map fields**: `coordinates`, `location` (location is shared, coordinates may be shared)
- **Future map types**: Use same generic extension tables, can reuse common fields or define new ones
- Field definitions registered in `map_type_field_definitions` table with `is_shared` flag
- Base entry fields stored in `map_entries` table
- Entry-level fields (shared across all maps) stored in `map_entry_extension_fields`
- Assignment-level fields (map-specific) stored in `map_entry_assignment_extension_fields`
- **Field Reuse**: When multiple map types use the same field key, data can be queried/filtered consistently

### 3.9 Map Contributor (Generic)

```typescript
interface MapContributor {
  mapId: UUID;
  userId: UUID;
  role: 'creator' | 'admin' | 'moderator' | 'contributor' | 'viewer';
  addedAt: ISO8601;
  addedBy: UUID;
}
```

**Role Hierarchy**:
- `creator`: Original creator, cannot be removed, full permissions
- `admin`: Assigned by creator only, cannot be requested, full permissions except creator management
- `moderator`: Can be requested or assigned, moderation permissions
- `contributor`: Can be requested or assigned, basic contribution permissions
- `viewer`: Default role, read-only access

### 3.10 Timeline Contributor (Timeline-Specific)

```typescript
interface TimelineContributor extends MapContributor {
  // Timeline-specific contributor fields (if any)
  // All base fields from MapContributor
}
```

### 3.11 Role Request (Contributor/Moderator)

```typescript
interface RoleRequest {
  id: UUID;
  mapId: UUID; // References BaseMap (or timelineId for timeline-specific)
  userId: UUID;
  requestedRole: 'contributor' | 'moderator'; // Admin cannot be requested
  message?: string; // Optional message from requester
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: ISO8601;
  reviewedAt?: ISO8601;
  reviewedBy?: UUID;
}
```

**Note**: Admin role cannot be requested - only creators can assign admin role directly via role management.

### 3.5 Map Entry Deletion Behavior

**Deletion Behavior** (applies to all map types):
- Map entries are stored in the `messages` table (as first-class messages)
- When deleted, the entry UUID is added to the `deleted_messages` table (original entry remains in `map_entries`)
- When processing entries for display:
  - If entry UUID exists in `deleted_messages` AND entry has no replies → Do not display
  - If entry UUID exists in `deleted_messages` AND entry has replies → Display with `[deleted]` text replacing body content
- Deleted entries with replies maintain their metadata (author, timestamps, map-specific fields like `displayDate`) for thread preservation

### 3.6 Map Entry Scope

```typescript
interface MapEntryScope {
  id: UUID;
  entryId: UUID;
  scopeType: 'community' | 'room';
  scopeId: UUID;
}
```

### 3.7 Map Entry Attachment

```typescript
interface MapEntryAttachment {
  id: UUID;
  entryId: UUID;
  attachmentType: 'image' | 'audio' | 'video';
  url: string;
  metadata?: {
    filename?: string;
    size?: number;
    mimeType?: string;
    duration?: number; // For audio/video
    width?: number; // For images/video
    height?: number; // For images/video
  };
}
```

**Attachment Storage**:
- **Short Term (MVP)**: Supabase Storage
  - Already integrated with Supabase stack
  - Simple setup, no additional service configuration
  - Built-in CDN and access control
  - Cost-effective for initial scale
  - Direct integration with RLS policies
- **Medium Term (Growth)**: Consider migration to S3 if storage exceeds Supabase limits, need advanced features (lifecycle policies, versioning), cost optimization becomes critical, or need multi-region distribution

**File Size Limits**:
- 10MB per file (images)
- 50MB per file (video/audio)
- Implementation: Client-side validation + server-side enforcement

**Allowed MIME Types**:
- **Images**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
- **Video**: `video/mp4`, `video/webm`, `video/ogg`
- **Audio**: `audio/mpeg`, `audio/ogg`, `audio/wav`, `audio/webm`
- **Documents**: `application/pdf`

**Virus Scanning**:
- **Short Term**: Defer to post-MVP (rely on file type validation)
- **Medium Term**: Integrate ClamAV or cloud service (AWS S3 + ClamAV, or dedicated service)
- Start without, add when scale/risk warrants it

### 3.8 Map Entry Flag

```typescript
interface MapEntryFlag {
  id: UUID;
  entryId: UUID;
  reporterId: UUID;
  reason: 'spam' | 'inappropriate' | 'misinformation' | 'other';
  notes?: string;
  createdAt: ISO8601;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewedBy?: UUID;
  reviewedAt?: ISO8601;
  editedAfterFlag: boolean; // True if entry was edited after this flag was created
}
```

---

## 4. API Design

### 4.1 Map Architecture Endpoints

**Generic Map Endpoints** (support all map types):
- `GET /api/maps` - List all maps (filterable by map_type)
- `GET /api/maps/:mapId` - Get map details
- `POST /api/maps` - Create new map (specify map_type)
- `PUT /api/maps/:mapId` - Update map
- `DELETE /api/maps/:mapId` - Delete map
- `POST /api/maps/entries` - Add entry to one or more maps (supports multiple map assignments)
- `POST /api/maps/:mapId/entries` - Add entry to single map
- `POST /api/maps/:mapId/entries/:entryId/assign` - Assign existing entry to additional map
- `DELETE /api/maps/:mapId/entries/:entryId/assign` - Remove entry assignment from map (doesn't delete entry)
- `PUT /api/maps/:mapId/entries/:entryId` - Update entry content or assignment-specific fields
- `DELETE /api/maps/:mapId/entries/:entryId` - Delete entry assignment (or entire entry if last assignment)

### 4.2 Timeline-Specific Endpoints

#### List Timelines
```
GET /api/timelines
Query Params:
  - section: 'featured' | 'my' | 'shared' | 'communities' | 'rooms' | 'all'
  - visibility: 'public' | 'private' | 'community' | 'room'
  - search: string
  - page: number
  - limit: number
  - sortBy: 'date' | 'location' | 'location_type' | 'created' // Location sorting options
  - locationType?: 'coordinates' | 'address' | 'city' | 'state_province' | 'country' | 'continent' | 'global' // Filter by location type
  - locationValue?: string // Filter by location value (e.g., "San Francisco", "USA")
  - locationHierarchy?: string // Filter by hierarchy (e.g., "country:USA" or "continent:North America")

Response:
{
  success: true,
  timelines: ConstructedTimeline[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**Location Sorting**:
- `sortBy=location`: Sort entries by location hierarchy (coordinates → address → city → state → country → continent → global)
- `sortBy=location_type`: Sort by location type specificity (most specific first)
- Within same location level, secondary sort by `displayDate` or `createdAt`

#### Get Timeline
```
GET /api/timelines/:timelineId
Query Params:
  - sortBy: 'date' | 'location' | 'location_type' | 'created' // Default: 'date'
  - locationType?: 'coordinates' | 'address' | 'city' | 'state_province' | 'country' | 'continent' | 'global'
  - locationValue?: string
  - locationHierarchy?: string

Response:
{
  success: true,
  timeline: ConstructedTimeline,
  entries: TimelineEntry[],
  canEdit: boolean,
  canContribute: boolean,
  canManageRoles: boolean,
  userRole: 'creator' | 'admin' | 'moderator' | 'contributor' | 'viewer' | null,
  sortOptions: ['date', 'location', 'location_type', 'created'], // Available sort options
  locationStats: {
    byType: { [type: string]: number }, // Count of entries by location type
    byHierarchy: { [level: string]: { [value: string]: number } } // Count by hierarchy level
  }
}
```

#### Create Timeline
```
POST /api/timelines
Body:
{
  title: string,
  description?: string,
  visibility: 'public' | 'private' | 'community' | 'room',
  communityIds?: UUID[],
  roomIds?: UUID[],
  contributorIds?: UUID[]
}

Response:
{
  success: true,
  timeline: ConstructedTimeline,
  timelineId: UUID
}
```

#### Update Timeline
```
PUT /api/timelines/:timelineId
Body: (same as create, all optional)

Response:
{
  success: true,
  timeline: ConstructedTimeline
}
```

#### Delete Timeline
```
DELETE /api/timelines/:timelineId
Response:
{
  success: true,
  message: "Timeline deleted"
}
```

### 4.2 Timeline Entry Endpoints

#### Add Entry
```
POST /api/timelines/:timelineId/entries
Body:
{
  content: string,
  messageId?: UUID,
  displayDate?: ISO8601,
  location?: {
    type: 'coordinates' | 'address' | 'city' | 'state_province' | 'country' | 'continent' | 'global',
    value: string,
    coordinates?: { latitude: number, longitude: number },
    address?: {
      street?: string,
      city?: string,
      stateProvince?: string,
      country?: string,
      postalCode?: string
    }
  },
  visibility: 'public' | 'private' | 'community' | 'room',
  communityIds?: UUID[],
  roomIds?: UUID[],
  replyTo?: UUID,
  attachments?: {
    type: 'image' | 'audio' | 'video',
    url: string,
    metadata?: object
  }[]
}

Response:
{
  success: true,
  entry: TimelineEntry,
  entryId: UUID
}
```

**Location Processing**:
- If `location.type` is `'coordinates'` or `'address'`, system parses and stores `location_coordinates`
- If `location.type` is `'address'`, system parses and stores `location_address`
- System automatically extracts and stores `location_hierarchy` based on location type:
  - `coordinates`/`address`: Extract city, state/province, country, continent from geocoding
  - `city`: Extract state/province, country, continent from geocoding
  - `state_province`: Extract country, continent from geocoding
  - `country`: Extract continent from geocoding
  - `continent`: Store continent only
  - `global`: No hierarchy stored

#### Update Entry (Generic)
```
PUT /api/maps/:mapId/entries/:entryId

Body: (same as create, all optional)
Validation: Must be within 1-hour window (for own entries) OR user must be moderator/admin/creator (for any entry)

Flag Handling:
- If entry has pending flags, set edited_after_flag = TRUE on all flags for this entry
- Flags are NOT cleared or reset - they remain for audit trail
- Moderators can see both original flagged content and current version
- Flag status remains 'pending' but marked as needing re-review

Response:
{
  success: true,
  entry: MapEntry
}
```

#### Update Entry (Timeline-Specific)
```
PUT /api/timelines/:timelineId/entries/:entryId

Body: (same as timeline create, all optional)
Validation: Must be within 1-hour window (for own entries) OR user must be moderator/admin/creator (for any entry)

Flag Handling:
- If entry has pending flags, set edited_after_flag = TRUE on all flags for this entry
- Flags are NOT cleared or reset - they remain for audit trail
- Moderators can see both original flagged content and current version
- Flag status remains 'pending' but marked as needing re-review

Response:
{
  success: true,
  entry: TimelineEntry
}
```

#### Delete Entry (Generic)
```
DELETE /api/maps/:mapId/entries/:entryId

Validation: Must be within 1-hour window (for own entries) OR user must be moderator/admin/creator (for any entry)

Response:
{
  success: true,
  message: "Entry deleted"
}
```

#### Delete Entry (Timeline-Specific)
```
DELETE /api/timelines/:timelineId/entries/:entryId

Validation: Must be within 1-hour window (for own entries) OR user must be moderator/admin/creator (for any entry)

Response:
{
  success: true,
  message: "Entry deleted"
}
```

**Deletion Behavior** (all map types):
- Entry UUID is added to `deleted_messages` table (original entry remains in `map_entries`)
- When displaying:
  - If deleted AND has no replies → Do not display
  - If deleted AND has replies → Display with `[deleted]` text replacing body

#### Flag Entry (Generic)
```
POST /api/maps/:mapId/entries/:entryId/flag

Body:
{
  reason: 'spam' | 'inappropriate' | 'misinformation' | 'other',
  notes?: string
}

Response:
{
  success: true,
  flagId: UUID,
  message: "Entry flagged"
}
```

#### Flag Entry (Timeline-Specific)
```
POST /api/timelines/:timelineId/entries/:entryId/flag

Body:
{
  reason: 'spam' | 'inappropriate' | 'misinformation' | 'other',
  notes?: string
}

Response:
{
  success: true,
  flagId: UUID,
  message: "Entry flagged"
}
```

#### Request Role (Contributor/Moderator) (Generic)
```
POST /api/maps/:mapId/role-request

Body:
{
  requestedRole: 'contributor' | 'moderator', // Admin cannot be requested
  message?: string
}

Response:
{
  success: true,
  requestId: UUID,
  message: "Request submitted"
}
```

#### Request Role (Timeline-Specific)
```
POST /api/timelines/:timelineId/role-request

Body:
{
  requestedRole: 'contributor' | 'moderator',
  message?: string
}

Response:
{
  success: true,
  requestId: UUID,
  message: "Request submitted"
}
```

#### Approve/Reject Role Request (Generic)
```
PUT /api/maps/:mapId/role-requests/:requestId

Body:
{
  action: 'approve' | 'reject'
}

Response:
{
  success: true,
  message: "Request approved" | "Request rejected",
  role?: 'contributor' | 'moderator' // If approved
}
```

#### Approve/Reject Role Request (Timeline-Specific)
```
PUT /api/timelines/:timelineId/role-requests/:requestId

Body:
{
  action: 'approve' | 'reject'
}

Response:
{
  success: true,
  message: "Request approved" | "Request rejected",
  role?: 'contributor' | 'moderator'
}
```

#### Get Role Requests (Generic)
```
GET /api/maps/:mapId/role-requests

Query Params:
  - status: 'pending' | 'approved' | 'rejected' | 'all'
  - requestedRole: 'contributor' | 'moderator' | 'all'

Response:
{
  success: true,
  requests: RoleRequest[]
}
```

#### Get Role Requests (Timeline-Specific)
```
GET /api/timelines/:timelineId/role-requests

Query Params:
  - status: 'pending' | 'approved' | 'rejected' | 'all'
  - requestedRole: 'contributor' | 'moderator' | 'all'

Response:
{
  success: true,
  requests: RoleRequest[]
}
```

#### Assign Role (Generic)
```
POST /api/maps/:mapId/assign-role

Body:
{
  userId: UUID,
  role: 'admin' | 'moderator' | 'contributor',
  message?: string // Optional notification message
}

Validation:
- Must be creator or admin
- Admin can only assign moderator/contributor
- Creator can assign any role
- Admin role can only be assigned by creator

Response:
{
  success: true,
  message: "Role assigned",
  contributor: MapContributor
}
```

#### Assign Role (Timeline-Specific)
```
POST /api/timelines/:timelineId/assign-role

Body:
{
  userId: UUID,
  role: 'admin' | 'moderator' | 'contributor',
  message?: string
}

Response:
{
  success: true,
  message: "Role assigned",
  contributor: TimelineContributor
}
```

#### Revoke Role (Generic)
```
DELETE /api/maps/:mapId/roles/:userId

Validation:
- Must be creator or admin
- Admin can only revoke moderator/contributor
- Creator can revoke any role except creator
- Creator role cannot be revoked

Response:
{
  success: true,
  message: "Role revoked"
}
```

#### Revoke Role (Timeline-Specific)
```
DELETE /api/timelines/:timelineId/roles/:userId

Response:
{
  success: true,
  message: "Role revoked"
}
```

#### Get User Color Preferences (Generic)
```
GET /api/maps/:mapId/color-preference

Response:
{
  colorHex: string | null // User's custom color, or null if using default
}
```

#### Set User Color Preference (Generic)
```
PUT /api/maps/:mapId/color-preference

Body:
{
  colorHex: string // Hex color code (e.g., '#FF5733')
}

Response:
{
  success: true,
  colorHex: string
}
```

#### Clear User Color Preference (Generic)
```
DELETE /api/maps/:mapId/color-preference

Response:
{
  success: true,
  message: "Color preference cleared, using default dynamic color"
}
```

#### List Map Members (Generic)
```
GET /api/maps/:mapId/members

Query Params:
  - role: 'creator' | 'admin' | 'moderator' | 'contributor' | 'viewer' | 'all'

Response:
{
  success: true,
  members: MapContributor[],
  counts: {
    creator: number,
    admin: number,
    moderator: number,
    contributor: number,
    viewer: number
  }
}
```

#### List Map Members (Timeline-Specific)
```
GET /api/timelines/:timelineId/members

Query Params:
  - role: 'creator' | 'admin' | 'moderator' | 'contributor' | 'viewer' | 'all'

Response:
{
  success: true,
  members: TimelineContributor[],
  counts: { ... }
}
```

---

## 5. UI Components

### 5.1 Landing Page Components

#### TimelineList
- Displays grid/list of timeline cards
- Supports filtering by section
- Handles pagination
- Shows loading/empty states

#### TimelineCard
- Title
- Creator avatars (multiple if collaborative)
- Description preview
- Latest activity snippet
- Visibility badge
- Entry count
- Member/contributor count
- "View Timeline" button
- "Edit" button (if user is creator)

#### SectionTabs
- Featured
- Leaderboard (timelines and individuals)
- My Timelines
- Shared with Me
- Communities
- Rooms
- All

#### SearchBar
- Full-text search across timeline titles/descriptions, entry content, author names, location fields, displayDate
- Debounced input
- Clear button
- Search results show matching timelines and entries

#### TimelineLeaderboard
- Ranked list of timelines with metrics
- Sortable columns (entry count, contributors, subscribers, engagement, quality, activity)
- Time period selector (all time, week, month, year)
- Visibility filter (public only, or include private/community/room)
- Pagination
- Timeline cards with rank badges

#### IndividualLeaderboard
- Ranked list of users with metrics
- Sortable columns (message count, entry count, engagement, quality, activity)
- Scope selector dropdown:
  - All messages (default)
  - All map types
  - Specific map type (e.g., timelines)
  - Selected timelines (from horizontal view)
- Time period selector (all time, week, month, year)
- Pagination
- User avatars and names with rank badges

### 5.2 Timeline Detail Components

#### TimelineHeader
- Title
- Description
- Creator info
- Visibility badge
- Contributor list
- Actions: Edit (if creator), Subscribe, Share

#### TimelineEntryCard
- Author avatar & name
- Content (text, with markdown support?)
- Attachments (images, audio, video)
- Timestamp (createdAt, displayDate if different)
- Location badge/indicator (if location is set):
  - Shows location type icon (coordinates/address/city/state/country/continent/global)
  - Shows location value (e.g., "San Francisco, CA" or "37.7749°N, 122.4194°W")
  - Clickable to filter by location
- Visibility badge
- **Multi-map indicator** (if entry is in multiple maps):
  - Shows badge: "In [N] maps" or "In [N] timelines"
  - Clickable to see list of maps/timelines entry belongs to
  - Option to remove from current map (if user has permission)
- Actions:
  - Edit (if author & < 1 hour OR moderator/admin/creator)
  - Delete (if author & < 1 hour OR moderator/admin/creator)
  - Remove from timeline (if user has permission, removes assignment only)
  - Flag (always visible)
  - Reply (if replies enabled)

#### TimelineEntryList
- Entry list container
- Sort controls:
  - Sort by: Date (default), Location, Location Type, Created
  - Sort direction: Ascending/Descending
- Filter controls:
  - Filter by location type dropdown
  - Filter by location value (with autocomplete)
  - Filter by location hierarchy (e.g., "Show all entries in USA")
- Entry cards (TimelineEntryCard components)
- Pagination or infinite scroll
- Empty state (no entries matching filters)

#### AddEntryButton
- Floating action button or header button
- Opens AddTimelineEntryModal

### 5.3 Modals

#### CreateTimelineModal
- Title input
- Description textarea
- Visibility selector
- Community/Room multi-select
- Contributor search/select
- Cancel/Submit buttons

#### AddTimelineEntryModal
- Timeline dropdown (filtered)
- Note textarea
- Visibility selector
- Community/Room multi-select
- Display date picker (optional)
- Location selector (optional):
  - Location type dropdown (coordinates/address/city/state_province/country/continent/global)
  - Location value input:
    - For coordinates: Map picker or lat/lng input fields
    - For address: Address form with street/city/state/country/postal code
    - For city/state/country/continent: Text input with autocomplete suggestions
  - Auto-complete suggestions for city/state/country (using geocoding API)
  - Preview of parsed location hierarchy
- Attachment upload
- Cancel/Submit buttons

#### EditTimelineEntryModal
- Same as AddTimelineEntryModal
- Pre-filled with current values
- Shows time remaining for editing

#### FlagEntryModal
- Reason dropdown
- Notes textarea
- Cancel/Submit buttons

#### EntryPreviewModal
- Appears on hover over entry buttons in horizontal timeline view
- Displays full timeline entry content:
  - Author avatar and name
  - Entry content (text, markdown support)
  - Attachments (images, audio, video)
  - Timestamp (createdAt, displayDate if different)
  - Location badge/indicator (if location is set)
  - Reactions count and list
  - Reply count and preview
  - Entry actions (Edit, Delete, Flag - if user has permissions)
- Positioned near cursor or in fixed position (configurable)
- Auto-dismisses when mouse leaves entry button
- Non-interactive (read-only preview, clicking closes and navigates to full entry)

### 5.4 Toast Notifications

- "Added to timeline."
- "Entry updated"
- "Entry deleted"
- "Entry flagged. Thank you for your report."
- "Timeline created successfully"
- Error messages

---

## 6. Integration Points

### 6.1 Message Actions Menu

**Location**: `presence/features/CanopiModule.js` or message component

**Integration**:
```javascript
// In message actions menu
{
  label: "Add to Map",
  icon: "map-icon",
  action: () => {
    // Open AddToMapModal
    // Pre-fill with message content
    // Set messageId reference
    // Show map type dropdown (Timeline first)
  }
}
```

**Requirements**:
- Must check if user has any maps (of any type) they can contribute to
- Hide option if no eligible maps
- Pre-fill note with message content
- Set messageId when entry is created
- Map type dropdown shows available map types (Timeline first)
- Map dropdown filters based on selected map type
- Map-specific fields appear dynamically based on map type

### 6.2 Auth Integration

**Requirements**:
- Use `AuthManager` for current user
- Check permissions before showing actions
- Handle unauthenticated users (show public timelines only)

### 6.3 Real-time Updates

**Supabase Subscriptions**:
- Subscribe to `map_entries` table changes
- Subscribe to `map_entry_assignments` table changes (when entries added/removed from maps)
- Subscribe to `maps` table changes (for map metadata updates)
- Subscribe to `map_entry_assignment_extension_fields` table changes (for assignment-level field changes like displayDate, location)
- Subscribe to `map_entry_extension_fields` table changes (for entry-level field changes)
- Update UI when entries added/updated/deleted or assigned/unassigned from maps

**Channels**:
- `map:${mapId}:entries` - Entry changes (generic, works for all map types)
- `map:${mapId}:updates` - Map metadata changes
- `timeline:${timelineId}:entries` - Timeline-specific entry changes
- `timeline:${timelineId}:updates` - Timeline metadata changes

### 6.4 Communities Integration

**Requirements**:
- Fetch user's communities from `/api/communities/me`
- Filter timelines by community membership
- Show community badges on timeline cards
- Allow multi-select in visibility controls

### 6.5 Rooms Integration

**Room Data Model**:
- `id`: UUID (primary key)
- `creator_id`: UUID (references app_users)
- `participants`: Array of UUIDs (references app_users)
- `created_at`: Timestamp
- `created_by`: UUID (references app_users)
- `updated_at`: Timestamp
- `updated_by`: UUID (references app_users)
- `type`: Enum ('open' | 'request' | 'creator_only')

**Room Types**:
- **open**: Anyone can add participants
- **request**: Anyone can request to add participants (requires approval)
- **creator_only**: Only creator can add participants

**Membership Rules**:
- Creator selects initial participants
- Participants can add others or request to add others (depending on room type)
- Creator always has full control

**Integration Requirements**:
- Room membership check (similar to communities)
- Room-scoped visibility for timelines and entries
- Multi-select in visibility controls
- Room-scoped timeline discovery

---

## 7. Search Functionality

### 7.1 Search Scope

**Searchable Fields**:
- Entry body text (full-text search)
- Timeline titles and descriptions
- Author names
- Location fields (city, state/province, country, etc.)
- displayDate (as text representation)

**Search Implementation**:
- **MVP/Short Term**: Postgres Full-Text Search
  - Use when: Dataset < 1M entries, simple search requirements, want to avoid additional infrastructure
  - Implementation: Use `tsvector` and `tsquery` for full-text search
  - Pros: No additional service, integrated with database, good enough for most use cases
  - Cons: Less sophisticated ranking, performance degrades with very large datasets
- **Medium/Long Term**: Elasticsearch
  - Use when: Dataset > 1M entries, need advanced features (fuzzy matching, autocomplete, faceted search), need real-time index updates
  - Pros: Superior search quality, advanced features, excellent performance at scale
  - Cons: Additional infrastructure, higher operational complexity, additional cost
  - Migration path: Start with Postgres, migrate to Elasticsearch when search becomes core feature or dataset grows

**Search API**:
```
GET /api/timelines/search?q={query}&type={timeline|entry|all}&limit={number}&offset={number}

Response:
{
  timelines: Timeline[],
  entries: TimelineEntry[],
  total: number
}
```

---

## 8. Timeline Subscriptions & Horizontal Views

### 8.1 Timeline Subscriptions

**Overview**: Extend the subscription model from profiles to constructed timelines, allowing users to subscribe to timeline updates with configurable delivery levels.

#### Subscription Model

**Delivery Levels** (mirroring profile subscriptions):
- **All** - Receive every timeline entry update in real-time
- **Personalized** - Algorithmic selection of relevant entries (future: ML-based)
- **None** - Muted but still subscribed (no notifications, but timeline remains in subscriptions list)
- **Unsubscribe** - Remove subscription entirely

#### Subscription Modal

**Location**: Timeline header (next to timeline title/description)

**UI Components**:
- SVG icon buttons for each delivery level
- Current subscription status indicator
- Subscriber count display
- "Manage Subscription" button triggers modal

**Modal Content**:
```
┌─────────────────────────────────────┐
│  Subscribe to Timeline              │
│                                     │
│  [All] [Personalized] [None]       │
│   ✓      ○          ○               │
│                                     │
│  Subscribers: 42                    │
│                                     │
│  [Cancel]  [Save]                  │
└─────────────────────────────────────┘
```

#### Subscription Data Model

```typescript
interface TimelineSubscription {
  id: UUID;
  timelineId: UUID;
  userId: UUID;
  deliveryLevel: 'all' | 'personalized' | 'none';
  subscribedAt: ISO8601;
  updatedAt: ISO8601;
}

interface TimelineSubscriberCount {
  timelineId: UUID;
  totalSubscribers: number;
  allLevel: number;
  personalizedLevel: number;
  noneLevel: number;
}
```

#### API Endpoints

**Subscribe to Timeline**:
```
POST /api/timelines/:timelineId/subscribe
Body:
{
  deliveryLevel: 'all' | 'personalized' | 'none'
}

Response:
{
  success: true,
  subscription: TimelineSubscription
}
```

**Update Subscription**:
```
PUT /api/timelines/:timelineId/subscribe
Body:
{
  deliveryLevel: 'all' | 'personalized' | 'none'
}

Response:
{
  success: true,
  subscription: TimelineSubscription
}
```

**Unsubscribe**:
```
DELETE /api/timelines/:timelineId/subscribe
Response:
{
  success: true,
  message: "Unsubscribed"
}
```

**Get Subscriber Count**:
```
GET /api/timelines/:timelineId/subscribers/count
Response:
{
  success: true,
  count: TimelineSubscriberCount
}
```

#### Notification Routing

**Delivery Level Behavior**:
- **All**: Real-time notifications for every entry added/updated
- **Personalized**: Digest notifications (daily/weekly) with algorithmically selected highlights
- **None**: No notifications, but subscription remains active

**Provenance Logging**: All subscription changes logged for audit/consent trails

#### Database Schema

```sql
CREATE TABLE timeline_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_id UUID NOT NULL REFERENCES constructed_timelines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  delivery_level TEXT NOT NULL DEFAULT 'all' CHECK (delivery_level IN ('all', 'personalized', 'none')),
  subscribed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(timeline_id, user_id)
);

CREATE INDEX idx_timeline_subscriptions_timeline ON timeline_subscriptions(timeline_id);
CREATE INDEX idx_timeline_subscriptions_user ON timeline_subscriptions(user_id);
CREATE INDEX idx_timeline_subscriptions_delivery ON timeline_subscriptions(delivery_level);
```

### 8.2 Horizontal Timeline View

**Overview**: Provide a horizontal, time-bucketed visualization of timeline entries with interactive hover states and sidebar detail views. Applies to both single and multi-timeline views.

#### Time Increments

**Selectable Increments**:
- `hour` - 1 hour buckets
- `day` - 1 day buckets
- `week` - 1 week buckets
- `month` - 1 month buckets
- `3 month` - 3 month buckets
- `6 month` - 6 month buckets
- `year` - 1 year buckets
- `5 year` - 5 year buckets
- `all time` - Single bucket for all entries

**Custom Start Date**: Users can set a custom start date for the timeline view

#### Filtering & Sorting

**Default Sort**: Index-based (e.g., `displayDate` for timelines)
- Primary sort uses the map type's default index field
- For timelines: `displayDate` (if present) or `createdAt` (fallback)
- Can be changed via sort controls

**Available Filters**:
- Filter by location type, location value, location hierarchy
- Filter by entry type (all/replies/media)
- Filter by timeline (in multi-timeline view)
- Filter by date range

**Available Sorts**:
- By date (displayDate or createdAt)
- By location
- By location type
- By created date
- Custom sort options per map type

#### Bucket Visualization

**Single Timeline View**:
- Each time bucket shows as a horizontal bar/segment
- Individual entries displayed as blank buttons with timeline color
- Entry count displayed on/in each bucket
- Color intensity or height indicates entry density
- Buckets are clickable and highlight on hover

**Multi-Timeline View (Stacked)**:
- Each bucket contains stacked bars representing different timelines
- Individual entries: Blank buttons with their timeline color
- Timeline summary buttons: Show count (e.g., "x" for Timeline A, "y" for Timeline B)
- Bucket total button: Shows combined count (x+y)
- Each timeline button displays timeline name on mouseover
- Timeline buttons use their assigned timeline color

**Timeline Color Management**:
- Colors are applied dynamically to timelines for legibility (ensures sufficient contrast and distinction between timelines)
- Default colors are algorithmically assigned to maximize visual differentiation
- Viewers can customize timeline colors to their preference
- Color customization is per-viewer (stored in user preferences, not timeline metadata)
- Custom colors override default colors for that viewer only
- Color picker available in timeline settings/viewer preferences

**Visualization Structure** (all stacked vertically in a single column per bucket):
```
Bucket: January 2024
┌─────────────────┐
│ [Entry 1]       │ ← Individual entries (small, short buttons, timeline colors)
│ [Entry 2]       │
│ [Entry 3]       │
│ [Entry 4]       │
│                 │
│ [Timeline A: x] │ ← Timeline summary buttons (small, short buttons, count, timeline colors)
│ [Timeline B: y] │
│                 │
│ [Bucket: x+y]   │ ← Bucket total button (small, short button, combined count)
└─────────────────┘
```

**Column Resizing**:
- Each time bucket column can be resized by dragging the right edge
- Width can be expanded to show more content
- Minimum width: narrow mode (fits 3-digit numbers)
- Maximum width: wide mode (shows first characters of first line)
- Resize handle visible on hover at column edge
- All columns can be resized independently or together (configurable)

**Two Visualization Modes**:

1. **Narrow Mode (Default)**:
   - Width: Narrow but enough for 3-digit numbers to fit
   - **Entry buttons**: 
     - Default: Chronological order within timeline (e.g., "1", "2", "3")
     - Alternative: Order entry was made within timeline (e.g., "1", "2", "3")
     - Display is configurable
   - **Timeline buttons**: Number of entries for the timeline (e.g., "5", "12")
   - **Bucket button**: Number of entries (e.g., "17")
   
2. **Wide Mode**:
   - Width: Expanded to show first characters of first line
   - **Entry buttons**:
     - Default: Order number followed by first chars of first line (e.g., "1: First few char...")
     - Alternative: Just first chars of first line (e.g., "First few char...")
     - Display is configurable
   - **Timeline buttons**: Timeline name and count (e.g., "Timeline B: 12")
   - **Bucket button**: Combined format (e.g., "17 entries - 3 timelines")

**Vertical Stacking** (single column, no horizontal arrangement):
- **Top section**: Individual entry buttons - small, short buttons with timeline colors, stacked vertically
- **Middle section**: Timeline summary buttons - small, short buttons, stacked vertically
- **Bottom section**: Bucket total button - small, short button
- All elements stack vertically in a single column within each time bucket
- If too many entries, the bucket column scrolls vertically (not horizontally)
- Buttons are compact (small width and short height) to fit many in a bucket
- Each time bucket is a vertical column that can scroll independently
- Stacked buttons are aligned with the time interval on the x-axis

**Button States** (configurable display):

**Entry Buttons**:
- **Narrow mode**:
  - Default: Chronological order within timeline (e.g., "1", "2", "3")
  - Alternative: Order entry was made within timeline (e.g., "1", "2", "3")
  - Configurable via settings
- **Wide mode**:
  - Default: Order number + first chars of first line (e.g., "1: First few char...")
  - Alternative: Just first chars of first line (e.g., "First few char...")
  - Configurable via settings
- Timeline color background (dynamically assigned for legibility, customizable by viewer)
- Small, short buttons

**Timeline Buttons**:
- **Narrow mode**: Number of entries (e.g., "5", "12")
- **Wide mode**: Timeline name and count (e.g., "Timeline B: 12")
- Timeline color background (dynamically assigned for legibility, customizable by viewer)
- Small, short buttons

**Bucket Button**:
- **Narrow mode**: Number of entries (e.g., "17")
- **Wide mode**: Combined format (e.g., "17 entries - 3 timelines")
- Small, short button

**Interaction**:
- **Hover**: Shows timeline name for timeline buttons, entry details for entry buttons (tooltip or sidebar)
- **Click**: Highlights bucket/timeline/entry and adds to Timelines tab display
- **Unclick**: Removes from Timelines tab display
- **Size**: All buttons are compact (small width and short height) to maximize information density
- **Alignment**: Stacked buttons are aligned with the time interval on the x-axis

#### Hover & Sidebar Detail

**Interaction Flow**:
1. User hovers over a time bucket, timeline button, or entry button
2. Element highlights (border, background color change)
3. **For Entry Buttons**: 
   - Preview modal appears showing full timeline entry modal content (while hovering)
   - Modal displays: author, content, attachments, timestamp, displayDate, location, reactions, replies, entry actions
   - Modal positioned near cursor or in fixed position (configurable)
   - Modal disappears when mouse leaves entry button
4. **For Timeline/Bucket Buttons**:
   - Sidebar opens on right side (or left on RTL) showing:
     - Time period (e.g., "January 2024")
     - Timeline name (if hovering timeline button)
     - List of entries in that period/timeline
     - Entry previews in discuss message format (author, content snippet, timestamp, reactions, replies)
     - Filter tabs (All/Replies/Media)
   - User can scroll through entries in sidebar
   - Clicking an entry in sidebar navigates to full entry view

**Click to Select**:
- Clicking a bucket/timeline/entry button highlights it and adds to Timelines tab display
- Selected elements remain highlighted
- Clicking again (unclicking) removes from Timelines tab display
- Different entries can display across time buckets (selection persists across buckets)
- Sidebar updates to show selected entries across all buckets

**Sidebar Content** (Discuss Message Format):
```
┌─────────────────────────────┐
│ January 2024                │
│ Timeline A                   │
│ [All] [Replies] [Media]    │
├─────────────────────────────┤
│ • Entry 1 - Author A        │
│   "Content preview..."      │
│   2024-01-15 10:30          │
│   👍 5  💬 2  🔖 1          │ ← Reactions, replies, bookmarks
│                             │
│ • Entry 2 - Author B        │
│   "Another entry..."         │
│   2024-01-20 14:22          │
│   👍 3  💬 0                │
│                             │
│ • Entry 3 - Author A        │
│   [Image attachment]         │
│   2024-01-25 09:15          │
│   👍 8  💬 1                │
└─────────────────────────────┘
```

#### Personal Timelines

**Adding Personal Timelines**:
- Personal timelines (profile timelines) can be added to the view
- Uses chronological date (`createdAt`) as `displayDate` for personal timeline entries
- Personal timeline entries appear in buckets based on their `createdAt` timestamp
- Personal timeline entries display with personal timeline color
- Can be filtered and sorted like constructed timelines

#### Ordering Logic

**Primary Sort**: Index-based (default for map type)
- For timelines: `displayDate` (if present) or `createdAt` (fallback)
- For personal timelines: `createdAt` (chronological)
- Allows non-chronological ordering for constructed timelines

**Fallback Sort**: `createdAt` (if index field absent)
- Entries without index field sorted by `createdAt`
- Maintains chronological order for auto-generated entries

**Mixed Sorting**:
- Entries with index field grouped separately from those without
- Within each group, apply appropriate sort
- UI indicates when index field differs from `createdAt`

**Location-Based Sorting**:
- Sort by location hierarchy: coordinates → address → city → state/province → country → continent → global
- Within same location level, sort by location value (alphabetical)
- Secondary sort by index field or `createdAt` if location is same
- Entries without location are sorted last (or first, configurable)

**Location-Based Filtering**:
- Filter by location type (show only entries with specific location granularity)
- Filter by location value (e.g., show only entries in "San Francisco")
- Filter by hierarchy (e.g., show all entries in "USA" regardless of city)
- Multiple filters can be combined (e.g., type=city AND value=San Francisco)

#### UI Components

**HorizontalTimelineView**:
- Horizontal scrollable container (buckets scroll horizontally, but each bucket is a vertical column)
- Time increment selector (dropdown or tabs)
- Custom start date picker
- Sort/filter controls (default: index-based sort)
- Bucket visualization (single or multi-timeline) - each bucket is a vertical column
- Column width mode selector (Narrow/Wide) - can be set per column or globally
- Column resize handles (drag to expand/contract width)
- Display configuration for entry buttons (chronological order vs creation order, with/without text)
- Timeline color customization (per-viewer preferences, overrides default dynamic colors)
- Sidebar container
- Timelines tab (displays selected entries)

**TimelineBucket**:
- Time period label
- Resizable column container (drag right edge to expand/contract)
- Width mode: Narrow (default, fits 3-digit numbers) or Wide (shows first chars of first line)
- Vertical scrollable column container
- Entry buttons (small, short buttons with timeline colors) - stacked vertically
  - Narrow mode: Chronological order (default) or creation order (configurable)
  - Wide mode: Order + first chars (default) or just first chars (configurable)
- Timeline summary buttons (small, short buttons with timeline colors) - stacked vertically
  - Narrow mode: Number of entries (e.g., "5")
  - Wide mode: Timeline name and count (e.g., "Timeline B: 12")
- Bucket total button (small, short button) - at bottom
  - Narrow mode: Number of entries (e.g., "17")
  - Wide mode: Combined format (e.g., "17 entries - 3 timelines")
- Hover/click handlers
- Resize handle (visible on hover at right edge)
- All elements stack vertically in a single column (no horizontal arrangement)
- Vertical scrolling if too many entries (overflow handled with scroll)
- Buttons aligned with time interval on x-axis
- Visual density indicator

**TimelineSidebar**:
- Period header
- Timeline name (if viewing specific timeline)
- Filter tabs (All/Replies/Media)
- Entry list in discuss message format (with reactions, replies, bookmarks)
- Scrollable content area
- Entry selection indicators

**TimelinesTab**:
- Displays selected entries across all buckets
- Shows entries in discuss message format
- Updates when entries are selected/unselected
- Can filter and sort selected entries

**Map Visualization Architecture**:
- Each map type can define its own visualization components
- Timeline: Horizontal time-bucketed view (this section)
  - Supports single and multi-timeline views
  - Bucket and stacked visualization
  - Filter and sort capabilities (default: index-based, e.g., displayDate)
  - Personal timelines can be added (uses chronological date as displayDate)
- Future map types: Their own horizontal/vertical views
- Views are registered per map type and loaded dynamically

#### Implementation Considerations

**Performance**:
- Lazy-load entries for visible buckets only
- Virtualize sidebar list for large entry counts
- Debounce hover events to prevent excessive API calls
- Cache selected entries across bucket navigation
- Optimize rendering of stacked timeline buttons
- Cache column width preferences per user
- Efficient text truncation for wide mode (first chars of first line)
- Debounce column resize events to prevent excessive re-renders

**Responsive Design**:
- Horizontal scroll for time buckets on mobile (buckets scroll horizontally)
- Each bucket column scrolls vertically if needed (overflow handled with vertical scroll)
- Sidebar becomes bottom sheet on small screens
- Touch-friendly bucket sizes
- Small, short buttons remain compact but touch-accessible (minimum touch target size)
- All buttons stack vertically in a single column per bucket (no horizontal wrapping)
- Bucket column width adapts to screen width, but internal stacking remains vertical
- Column resizing works on touch devices (drag handle or pinch-to-resize)
- Narrow mode preferred on small screens, wide mode available on larger screens
- Column width mode can be set globally or per-column

**Accessibility**:
- Keyboard navigation (arrow keys to move between buckets, timeline buttons, entry buttons)
- Screen reader announcements for bucket content, timeline names, entry details
- Focus indicators on interactive elements
- ARIA labels for timeline buttons and entry buttons

**Selection State Management**:
- Track selected buckets, timelines, and entries across all buckets
- Persist selection state when navigating between buckets
- Update Timelines tab display in real-time as selections change
- Support multi-select (multiple entries from different buckets)

---

## 9. Edge Cases & Considerations

### 9.1 Permission Edge Cases

**Scenario**: User loses contributor access
- **Solution**: Disable add/edit actions, show message

**Scenario**: Timeline visibility changes
- **Solution**: Re-check permissions, hide if no longer accessible

**Scenario**: Entry visibility doesn't match timeline visibility
- **Solution**: Entry visibility takes precedence, but validate on create

### 9.2 Edit Window Edge Cases

**Scenario**: User starts editing at 59 minutes, submits at 61 minutes
- **Solution**: Validate on server, reject if > 1 hour

**Scenario**: Multiple users editing same entry
- **Solution**: Optimistic locking or last-write-wins (document behavior)

**Scenario**: Entry deleted while user is editing
- **Solution**: Show error on submit, refresh timeline

### 9.3 Flagging Edge Cases

**Scenario**: User flags same entry multiple times
- **Solution**: Prevent duplicate flags from same user

**Scenario**: Entry deleted after being flagged
- **Solution**: Keep flag records for audit, mark as "resolved - deleted"

**Scenario**: Flagged entry edited within 1-hour window
- **Solution: Hybrid Approach - Keep Flags but Mark as "Needs Re-review" (Implemented)**
  - **Rationale**: 
    - Preserves audit trail - moderators can see what was flagged even if content changed
    - Prevents abuse - users can't just edit to clear flags without addressing the issue
    - Recognizes that content changed - flags marked as needing re-review
    - Maintains accountability - the entry was flagged for a reason (content, author behavior, context)
    - Flags can reference patterns of behavior, not just specific content
  - **Implementation**: 
    - Flags remain, flag count unchanged
    - Set `edited_after_flag = TRUE` on all flags for the entry when it's edited
    - Moderators can see both original flagged content and current version
    - Moderation UI highlights flags where `edited_after_flag = TRUE` as "needs re-review"
    - Flag status remains 'pending' but visually distinguished in moderation interface
  - **Database**: `map_entry_flags` table includes `edited_after_flag` boolean column
  - **API**: Update entry endpoint automatically sets `edited_after_flag = TRUE` on all pending flags

### 9.4 Flag Moderation Workflow

**Overview**: Flags are reviewed by moderators and admins to maintain timeline quality and safety.

**Who Reviews Flags**:
- **Moderators**: Can review and resolve flags for entries in timelines they moderate
- **Admins**: Can review and resolve flags for any entry in timelines they admin
- **Creators**: Can review and resolve flags for any entry in their timelines

**Moderation Interface**:
- **Flag Queue**: List of pending flags sorted by:
  - Priority (flags with `edited_after_flag = TRUE` shown first)
  - Flag count (entries with multiple flags shown first)
  - Recency (newest flags first)
- **Flag Details View**:
  - Entry content (current version)
  - Original flagged content (if entry was edited after flagging)
  - Flag reason and reporter notes
  - Flag history (all flags for this entry)
  - Entry author information
  - Actions available: Dismiss, Hide Entry, Delete Entry, Warn Author, Ban Author

**Flag Resolution Actions**:
- **Dismiss Flag**: Mark flag as "dismissed" - no action taken, flag resolved
- **Hide Entry**: Temporarily hide entry from public view (author can still see)
- **Delete Entry**: Permanently delete entry (soft delete via `deleted_messages`)
- **Warn Author**: Send warning notification to entry author
- **Ban Author**: Remove author's contributor status (if applicable)

**Auto-Hide Threshold** (Optional):
- **Recommendation**: Consider auto-hiding entries when flag count reaches threshold (e.g., 3-5 flags)
- **Implementation**: 
  - Entry remains visible to moderators/admins/creators
  - Entry hidden from public timeline view
  - Requires manual review to restore or confirm deletion
- **Rationale**: Prevents problematic content from spreading while awaiting moderation

**Notifications**:
- **Entry Author**: Notified when entry is flagged (optional, can be disabled)
- **Moderators/Admins**: Notified when new flags are created (real-time via Supabase subscriptions)
- **Reporter**: Notified when flag is resolved (optional)

**Flag Status Flow**:
```
pending → reviewed → dismissed/resolved
         ↓
    (auto-hide if threshold reached)
```

**Audit Trail**:
- All flag actions are logged with:
  - Reviewer ID
  - Review timestamp
  - Action taken
  - Notes/reasoning
- Flag records are never deleted (for audit purposes)
- Deleted entries retain their flag history

### 9.5 Display Date Edge Cases

**Scenario**: displayDate in the future
- **Solution**: Allow (for planned events), but validate reasonable range

**Scenario**: displayDate before timeline creation
- **Solution**: Allow (for historical timelines)

**Scenario**: Multiple entries with same displayDate
- **Solution**: Secondary sort by createdAt

### 9.6 Attachment Edge Cases

**Scenario**: Large file uploads
- **Solution**: Client-side validation, progress indicator, size limits

**Scenario**: Invalid file types
- **Solution**: Validate MIME types, show error

**Scenario**: Upload fails
- **Solution**: Retry mechanism, show error, allow manual retry

### 9.7 Real-time Edge Cases

**Scenario**: User offline when entry added
- **Solution**: Show on reconnect, handle conflicts

**Scenario**: Multiple tabs open
- **Solution**: BroadcastChannel or localStorage events to sync state

**Scenario**: Subscription fails
- **Solution**: Fallback to polling, show connection status

---

## 10. Database Schema

### 10.1 Map Architecture Overview

**Design Philosophy**: The database schema supports a generic map architecture where timelines are one map type. This allows for future map types without schema changes.

**Approach**:
- **Generic Tables**: `maps`, `map_entries`, `map_entry_assignments`, `map_contributors`, `map_entry_scopes`, `map_entry_attachments`, `map_entry_flags` - support all map types
- **Generic Extension Tables**: 
  - `map_extension_fields` - map-level extension data
  - `map_entry_extension_fields` - entry-level extension data
  - `map_entry_assignment_extension_fields` - assignment-level (map-specific) extension data
- **Field Definition Table**: `map_type_field_definitions` - defines what fields each map type supports
- **No map-specific tables** - all extension data uses generic key-value tables
- **Field sharing**: Different map types can use the same field keys (e.g., `displayDate` and `location` are common to timelines, spatial maps, topic maps, etc.)
- **Multi-map entries**: Entries can belong to multiple maps via `map_entry_assignments`
- **No separate extension tables needed** - all map types use the same generic extension tables


### 9.2 Core Map Tables

```sql
-- Base maps table (supports all map types)
CREATE TABLE maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_type TEXT NOT NULL CHECK (map_type IN ('timeline', 'spatial', 'topic', 'relationship', ...)), -- Extensible
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'community', 'room')),
  contributor_access TEXT NOT NULL DEFAULT 'open' CHECK (contributor_access IN ('open', 'approval_required')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maps_type ON maps(map_type);
CREATE INDEX idx_maps_creator ON maps(creator_id);
CREATE INDEX idx_maps_visibility ON maps(visibility);
CREATE INDEX idx_maps_created ON maps(created_at DESC);

-- Note: Timeline-specific map-level fields are stored in map_extension_fields table
-- Example: default_location_type would be stored as:
-- INSERT INTO map_extension_fields (map_id, field_key, field_value) 
-- VALUES (map_id, 'defaultLocationType', '"city"');
-- Field definition registered in map_type_field_definitions with map_type='timeline', field_key='defaultLocationType', field_scope='map'


-- Map contributors (generic, supports all map types)
CREATE TABLE map_contributors (
  map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('creator', 'admin', 'moderator', 'contributor', 'viewer')),
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES app_users(id),
  PRIMARY KEY (map_id, user_id)
);

CREATE INDEX idx_map_contributors_user ON map_contributors(user_id);
CREATE INDEX idx_map_contributors_map ON map_contributors(map_id);


-- Map role requests (generic, supports all map types)
-- Note: Admin role cannot be requested, only contributor and moderator
CREATE TABLE map_role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('contributor', 'moderator')), -- Admin cannot be requested
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES app_users(id),
  UNIQUE(map_id, user_id, requested_role) -- One request per user per role per map
);

CREATE INDEX idx_map_role_requests_map ON map_role_requests(map_id, status);
CREATE INDEX idx_map_role_requests_user ON map_role_requests(user_id);
CREATE INDEX idx_map_role_requests_role ON map_role_requests(requested_role);


-- Map scopes (for community/room visibility, generic for all map types)
CREATE TABLE map_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('community', 'room')),
  scope_id UUID NOT NULL,
  UNIQUE(map_id, scope_type, scope_id)
);

CREATE INDEX idx_map_scopes_map ON map_scopes(map_id);


-- Map entries (generic, supports all map types)
-- Note: Map entries are stored in the messages table with message_type = 'map_entry'
-- When deleted, the entry UUID is added to deleted_messages table (original entry remains here)
-- Display logic: 
--   1. Check if entry.id exists in deleted_messages table
--   2. If deleted, check if any other entries have reply_to = entry.id
--   3. If deleted AND has replies → display with [deleted] text
--   4. If deleted AND no replies → do not display
--   5. If not deleted → display normally

CREATE TABLE map_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'community', 'room')),
  reply_to UUID REFERENCES map_entries(id) ON DELETE CASCADE,
  flag_count INTEGER NOT NULL DEFAULT 0
  -- Note: deleted_at is NOT stored here. Deletion is tracked via deleted_messages table
  -- Note: map_id and map_type are NOT here - entries belong to maps via map_entry_assignments
);

CREATE INDEX idx_map_entries_author ON map_entries(author_id);
CREATE INDEX idx_map_entries_created ON map_entries(created_at DESC);
CREATE INDEX idx_map_entries_reply_to ON map_entries(reply_to);
CREATE INDEX idx_map_entries_message ON map_entries(message_id);

-- Map entry assignments (many-to-many: entries can belong to multiple maps)
-- Each assignment stores map-specific metadata for that entry in that map
CREATE TABLE map_entry_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES map_entries(id) ON DELETE CASCADE,
  map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  assigned_by UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  UNIQUE(entry_id, map_id) -- Prevent duplicate assignments
);

CREATE INDEX idx_map_entry_assignments_entry ON map_entry_assignments(entry_id);
CREATE INDEX idx_map_entry_assignments_map ON map_entry_assignments(map_id);
CREATE INDEX idx_map_entry_assignments_assigned_by ON map_entry_assignments(assigned_by);

-- Map type field definitions (defines what fields each map type supports)
-- Note: Fields can be shared across map types (e.g., 'displayDate' and 'location' are common)
CREATE TABLE map_type_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_type TEXT NOT NULL CHECK (map_type IN ('timeline', 'spatial', 'topic', ...)),
  field_key TEXT NOT NULL, -- e.g., 'displayDate', 'location', 'latitude', 'longitude'
  field_type TEXT NOT NULL CHECK (field_type IN ('string', 'number', 'boolean', 'date', 'json', 'coordinates', 'location')),
  field_scope TEXT NOT NULL CHECK (field_scope IN ('map', 'entry', 'assignment')), -- Where this field applies
  field_label TEXT NOT NULL, -- Display label
  field_description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  validation_rules JSONB, -- JSON schema or validation rules
  default_value JSONB, -- Default value if any
  is_shared BOOLEAN NOT NULL DEFAULT false, -- If true, field can be used by other map types
  UNIQUE(map_type, field_key, field_scope)
);

-- Example: Common fields registered for multiple map types
-- Timeline registers: displayDate (assignment scope), location (assignment scope)
-- Spatial map can reuse: location (assignment scope) - same field_key, same field_type
-- Topic map can reuse: displayDate (assignment scope) - same field_key, same field_type
-- This allows data sharing and consistency across map types

CREATE INDEX idx_map_type_field_definitions_type ON map_type_field_definitions(map_type, field_scope);

-- Map extension fields (generic key-value storage for map-level extensions)
CREATE TABLE map_extension_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  field_value JSONB NOT NULL, -- Stored as JSONB for flexibility
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(map_id, field_key)
);

CREATE INDEX idx_map_extension_fields_map ON map_extension_fields(map_id);
CREATE INDEX idx_map_extension_fields_key ON map_extension_fields(field_key);
CREATE INDEX idx_map_extension_fields_value ON map_extension_fields USING GIN (field_value); -- For JSONB queries

-- Map entry extension fields (generic key-value storage for entry-level extensions)
-- These are entry-level fields that apply to the entry regardless of which map it's in
CREATE TABLE map_entry_extension_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES map_entries(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  field_value JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(entry_id, field_key)
);

CREATE INDEX idx_map_entry_extension_fields_entry ON map_entry_extension_fields(entry_id);
CREATE INDEX idx_map_entry_extension_fields_key ON map_entry_extension_fields(field_key);
CREATE INDEX idx_map_entry_extension_fields_value ON map_entry_extension_fields USING GIN (field_value);

-- Map entry assignment extension fields (generic key-value storage for assignment-level extensions)
-- These are map-specific fields that apply to an entry only in the context of a specific map
-- Example: displayDate for timeline entries, coordinates for spatial map entries
CREATE TABLE map_entry_assignment_extension_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES map_entry_assignments(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  field_value JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, field_key)
);

CREATE INDEX idx_map_entry_assignment_extension_fields_assignment ON map_entry_assignment_extension_fields(assignment_id);
CREATE INDEX idx_map_entry_assignment_extension_fields_key ON map_entry_assignment_extension_fields(field_key);
CREATE INDEX idx_map_entry_assignment_extension_fields_value ON map_entry_assignment_extension_fields USING GIN (field_value);

-- Special indexes for common timeline fields (for performance)
CREATE INDEX idx_map_entry_assignment_extension_fields_display_date ON map_entry_assignment_extension_fields(assignment_id, field_key, (field_value->>'value'))
WHERE field_key = 'displayDate';
CREATE INDEX idx_map_entry_assignment_extension_fields_location_type ON map_entry_assignment_extension_fields(assignment_id, field_key, (field_value->>'type'))
WHERE field_key = 'location';

-- Note: No separate extension tables needed for new map types
-- All extension data uses the generic tables above:
-- - map_extension_fields (for map-level fields)
-- - map_entry_extension_fields (for entry-level fields)
-- - map_entry_assignment_extension_fields (for assignment-level/map-specific fields)
-- Field definitions are registered in map_type_field_definitions table


-- Map entry attachments (generic, supports all map types)
CREATE TABLE map_entry_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES map_entries(id) ON DELETE CASCADE,
  attachment_type TEXT NOT NULL CHECK (attachment_type IN ('image', 'audio', 'video')),
  url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_map_entry_attachments_entry ON map_entry_attachments(entry_id);


-- Map entry flags (generic, supports all map types)
CREATE TABLE map_entry_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES map_entries(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'misinformation', 'other')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  reviewed_by UUID REFERENCES app_users(id),
  reviewed_at TIMESTAMP,
  edited_after_flag BOOLEAN NOT NULL DEFAULT FALSE, -- True if entry was edited after this flag was created
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(entry_id, reporter_id) -- Prevent duplicate flags from same user
);

CREATE INDEX idx_map_entry_flags_entry ON map_entry_flags(entry_id);
CREATE INDEX idx_map_entry_flags_status ON map_entry_flags(status) WHERE status = 'pending';
CREATE INDEX idx_map_entry_flags_edited ON map_entry_flags(entry_id, edited_after_flag) WHERE edited_after_flag = TRUE;

-- User preferences for timeline color customization
CREATE TABLE user_map_color_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  color_hex TEXT NOT NULL, -- Hex color code (e.g., '#FF5733')
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, map_id) -- One color preference per user per map
);

CREATE INDEX idx_user_map_color_preferences_user ON user_map_color_preferences(user_id);
CREATE INDEX idx_user_map_color_preferences_map ON user_map_color_preferences(map_id);

```

### 10.2 Computed Fields

**editableUntil**: Calculated as `created_at + INTERVAL '1 hour'` (stored or computed?)

**flagCount**: Aggregated from `map_entry_flags` table (trigger or computed?)

**Common Field Examples**:
- **displayDate**: Used by timelines, spatial maps, topic maps, etc. - stored in `map_entry_assignment_extension_fields` with `field_key = 'displayDate'`
- **location**: Used by timelines, spatial maps, topic maps, etc. - stored in `map_entry_assignment_extension_fields` with `field_key = 'location'`
- These fields can be queried/filtered consistently across all map types that use them

**location_hierarchy**: Automatically computed from location data:

---

## 11. Security Considerations

### 11.1 Authorization Checks

**Timeline Access**:
- Public: Anyone can view
- Private: Only creators/contributors/viewers
- Community: Check community membership
- Room: Check room membership (see Section 6.5 for room membership rules)

**Entry Creation**:
- User must be contributor/moderator/admin/creator OR timeline must be "open"
- Validate on server

**Entry Editing**:
- Must be within 1-hour window (for own entries)
- OR user must be moderator/admin/creator (unlimited for any entry)
- Validate on server

**Entry Deletion**:
- Must be within 1-hour window (for own entries)
- OR user must be moderator/admin/creator (unlimited for any entry)
- Validate on server

**Role Management**:
- Creator: Can assign/revoke any role (admin, moderator, contributor)
- Admin: Can assign/revoke moderator and contributor roles only
- Moderator/Contributor: Cannot manage roles
- Admin role: Can only be assigned by creator, cannot be requested
- Creator role: Cannot be revoked or transferred

**Flagging**:
- Any authenticated user can flag
- Prevent duplicate flags from same user

### 11.2 Input Validation

- Sanitize HTML in content (prevent XSS)
- Validate UUIDs
- Validate visibility values
- Validate attachment URLs (prevent SSRF)
- Rate limit flag submissions

### 11.3 Data Privacy

- Private timelines not discoverable in search
- Entry visibility enforced at query level
- Soft-delete entries (keep for audit)
- Flag reporter IDs visible only to moderators

---

## 12. Performance Considerations

### 12.1 Query Optimization

- Index on `map_entry_assignments` (map_id, entry_id) for fast map-entry lookups
- Index on `map_entry_assignment_extension_fields` (assignment_id, field_key) with special indexes for common fields (displayDate, location)
- Index on `map_entries` (author_id, created_at) for author-based queries
- GIN indexes on JSONB fields in extension tables for efficient filtering
- Paginate entry lists
- Lazy-load attachments
- Cache map metadata
- Query optimization for entries in multiple maps (use map_entry_assignments join)

### 12.2 Real-time Efficiency

- Subscribe only to active timelines
- Batch updates if multiple entries added quickly
- Debounce UI updates

### 12.3 Asset Handling

- CDN for attachments
- Image optimization/thumbnails
- Lazy-load images in timeline view

---

## 13. Implementation Phases

### Phase 1: MVP Landing Page
- [ ] Landing page HTML/CSS
- [ ] Timeline list API
- [ ] Timeline card component
- [ ] Basic routing (landing vs detail)

### Phase 2: Timeline Management
- [ ] Create timeline API
- [ ] Create timeline modal
- [ ] Timeline detail page
- [ ] Edit/delete timeline (creators only)

### Phase 3: Entry Management
- [ ] Add entry API
- [ ] Add entry modal
- [ ] Entry display component
- [ ] Edit/delete entry (1-hour window)
- [ ] Toast notifications

### Phase 4: Visibility & Permissions
- [ ] Visibility controls
- [ ] Permission checks
- [ ] Community/room integration
- [ ] Contributor management

### Phase 5: Advanced Features
- [ ] Flagging system
- [ ] Real-time updates
- [ ] Attachments
- [ ] displayDate support
- [ ] Location fields and sorting
- [x] Threaded replies (handled by message system - timeline entries are first-class messages)

### Phase 6: Polish
- [ ] Search functionality
- [ ] Horizontal timeline view
- [ ] Performance optimization

---

## 14. Open Questions for Product Review

1. **Soft vs Hard Delete**: ✅ Resolved - Deleted entries are soft-deleted (via `deleted_messages` table) and are reviewable by admin, moderator, and creator. Entries are not physically removed, allowing for audit and potential review/restoration by authorized users.

---

## 15. Dependencies

### External
- Supabase (database, real-time)
- AuthManager (authentication)
- Communities API (community membership)
- Rooms API (See Section 6.5 for room specification)

### Internal
- Message actions menu integration
- Toast notification system
- Modal component library
- File upload service (for attachments)

---

## 16. Testing Considerations

### Unit Tests
- Permission checks
- Edit window validation
- Visibility filtering
- Flag deduplication

### Integration Tests
- API endpoints
- Real-time subscriptions
- File uploads
- Permission enforcement

### E2E Tests
- Create timeline flow
- Add entry flow
- Edit/delete entry flow
- Flag entry flow
- Permission edge cases

---

This specification should be reviewed to identify any gaps, unclear requirements, or missing considerations before implementation begins.

