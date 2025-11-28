# Bike Panel Item 14 - canopi.live Timelines Feature

## Overview
Implement a timeline/profile feature that displays and allows searching through user activity history including messages, status changes, aura changes, visibility times, settings tab visibility, reactions, bookmarks, profile updates, community joins/leaves, message edits/deletions, thread creation, login events, and activity streaks. Each activity type has configurable visibility settings (public, community, group, or private) that users can customize. The timeline will have **real-time updates** using Supabase real-time subscriptions and will **match the extension's design and UI/UX** for a consistent, polished experience. The feature includes a **multi-profile view** that allows users to add additional profiles to view alongside the main profile for comparison and side-by-side timeline viewing.

## Feature Description

### Core Functionality
- **Timeline Display**: Show chronological activity for users including:
  - Messages (Public Square and community messages)
  - Status changes
  - Aura changes
  - Visibility times
  - Settings tab visibility (when user opened settings tab)
  - Reactions given/received
  - Bookmarks created
  - Profile updates (headline, displayName, avatar changes)
  - Community joins/leaves
  - Message edits/deletions
  - Thread creation
  - Login/authentication events
  - Activity streaks (summary statistics)
- **Multi-Profile View**: Tab/button to add additional profiles to view alongside main profile
  - Side-by-side or stacked timeline comparison
  - Each profile has its own timeline column/section
  - Can add/remove profiles dynamically
  - Compare activity across multiple users
  - Shared timeline view showing activities from all selected profiles
- **Search Capability**: Allow searching/filtering through timeline content
- **Community Filtering**: Filter timeline by community
- **Input Field**: Search/filter input for timeline content

### Routes
- `canopi.live/timelines/[uuid]` - Access timeline by user UUID
- `canopi.live/timelines/[username]` - Access timeline by username

### Visibility Rules (Configurable Per Activity Type)

**Each activity type can be configured as:**
- **Public** - Visible to everyone (including non-logged-in users)
- **Community** - Visible only to users in same communities
- **Group** - Visible to specific groups (TBD - future feature)
- **Private** - Visible only to the user themselves (own timeline only)

**Default Visibility Settings (can be customized per user):**
- **Messages** - Public (Public Square), Community (other communities)
- **Status changes** - Community
- **Aura changes** - Public
- **Visibility times** - Community
- **Settings tab visibility** - Private (authenticated users only)
- **Reactions** - Public (reactions given), Community (reactions received on community messages)
- **Bookmarks** - Private (own timeline only)
- **Profile updates** - Public (headline, displayName), Private (avatar changes)
- **Community joins/leaves** - Community
- **Message edits/deletions** - Community (for community messages), Public (for Public Square)
- **Thread creation** - Public (Public Square), Community (other communities)
- **Login/authentication events** - Private
- **Activity streaks** - Public (summary stats)

### Integration Points

#### Profile Tab Integration
- When viewing own profile tab for notifications
- Timeline should be accessible from profile view
- Consider showing timeline preview or link

#### Hover Modal Integration
- Timeline links should be accessible from user hover modals
- Link to both UUID and username routes
- Consider showing timeline preview or recent activity

## Implementation Considerations

### Database Requirements
- **Use existing database tables only - no new tables needed**
- Query messages from Public Square (community_id = `abe5ec85-4ba6-456f-adaf-03d7d51cecf4`)
- Query user status change history from existing `user_presence` table
- Query aura change history from existing tables (check `user_presence` or user preferences tables)
- Query visibility/activity times from `user_presence` table with timestamps
- Query settings tab visibility from existing tracking (check if this is logged in `user_presence` or activity logs)
- Query reactions from `reactions` table (reactions given and received)
- Query bookmarks from `bookmarks` table (bookmarks created)
- Query community joins/leaves from `MetaCommunityMembership` table (`joinedAt` timestamp, `isActive` status changes)
- Query message edits from `messages` table (`updated_at` timestamp, compare with `created_at`)
- Query message deletions from `message_deletions` table (`deleted_at` timestamp)
- Query thread creation from `messages` table (messages where `parent_id` is null - root messages)
- Query login/authentication events (check if tracked in `user_presence` or need separate tracking)
- Query profile updates from `user_audit_logs` table (field-level changes with before/after values, timestamps, change type, actor)
- Filter by community membership for private data (use existing `user_communities` relationship)
- Support efficient chronological queries with pagination
- **Timeline Persistence**: Configurable from 1 day to all time (default: all time)

### UI/UX Requirements
- Timeline display (chronological, newest first recommended - aligns with message UI restructure in Bike Panel Item 13)
- Search/filter input field
- Community filter dropdown/selector (reuse existing CommunitiesModule.js patterns)
- Clear indication of public vs. private content (visual distinction, badges, or separate sections)
- Responsive design for different screen sizes
- Loading states for timeline data
- Pagination or infinite scroll for long timelines
- Activity type icons/badges (message, status, aura, visibility, settings, reaction, bookmark, profile)
- Timestamp formatting (relative time like "2 hours ago" with absolute on hover)
- Visual distinction for different activity types (icons, colors, badges)
- **Multi-Profile View**:
  - Tab/button to add additional profiles
  - Profile selector with search/autocomplete
  - Side-by-side or stacked timeline layout
  - Each profile column clearly labeled with avatar/name
  - Toggle between single and multi-profile views
  - Remove profile option for each added profile
  - Shared timeline view option (merged chronological)
  - Profile comparison highlights
  - Responsive layout (stack vertically on mobile)

### Security & Privacy
- Enforce visibility rules server-side (never trust client)
- Verify community membership before showing community-private data
- Respect user-configured visibility settings per activity type
- Handle non-existent users gracefully
- Rate limiting for timeline queries
- Ensure proper authentication/authorization checks
- Allow users to configure visibility of their own timeline activities (public, community, group, private)

### Performance
- Efficient database queries with proper indexing
- Caching strategy for frequently accessed timelines
- Lazy loading for timeline items
- Optimize for large timelines (users with lots of activity)
- **Real-time Performance**: Efficient Supabase subscriptions (avoid duplicate subscriptions, cleanup on unmount)
- **UI Performance**: Virtual scrolling for long timelines, debounced search/filter inputs
- **Animation Performance**: Use CSS transforms for smooth animations, avoid layout thrashing
- **Multi-Profile Performance**: 
  - Limit number of profiles (e.g., max 3-4)
  - Parallel API calls for multiple profiles
  - Efficient real-time subscriptions (one subscription per profile)
  - Lazy load additional profiles
  - Cache profile data

## Technical Tasks

1. **Database Schema Analysis**
   - Audit existing tables to identify where timeline data is stored:
     - Messages: `messages` table (has timestamps, `community_id`, `user_id`)
     - Status changes: `user_presence` table (check for status change tracking)
     - Aura changes: Check `user_presence` or user preferences tables for aura color history
     - Visibility times: `user_presence` table with `last_seen`, `is_visible` timestamps
     - Settings tab visibility: Check if tracked in `user_presence` or activity logs
     - Reactions: `reactions` table (has `created_at`, `user_id`, `message_id`)
     - Bookmarks: `bookmarks` table (has `created_at`, `user_id`, `message_id`)
     - Community joins/leaves: `MetaCommunityMembership` table (has `joinedAt`, `updatedAt`, `isActive`)
     - Message edits: `messages` table (compare `updated_at` with `created_at` to detect edits)
     - Message deletions: `message_deletions` table (has `deleted_at`, `user_id`, `message_id`)
     - Thread creation: `messages` table (messages where `parent_id` is null - root messages)
     - Login/authentication events: Check if tracked in `user_presence` (`enter_time`, `last_seen`) or need separate tracking
     - Profile updates: `user_audit_logs` table (field-level history with before/after values, timestamps, change type)
   - **Audit table exists**: `user_audit_logs` table tracks all profile and settings changes in sequence
   - Verify indexes exist for efficient chronological queries (`created_at`, `user_id`, `community_id`, `joinedAt`, `deleted_at`)

2. **Backend API Development**
   - Create timeline controller: `/controllers/timelineController.js`
   - Create timeline route: `/routes/timelines.js`
   - Endpoint: `GET /api/timelines/:identifier` (UUID or username)
   - Implement visibility filtering logic (public vs. community-private)
   - Query messages from Public Square (`abe5ec85-4ba6-456f-adaf-03d7d51cecf4`)
   - Query status change history from existing `user_presence` table
   - Query aura change history from existing tables
   - Query visibility/activity times from `user_presence` table
   - Query settings tab visibility
   - Query reactions from `reactions` table (filter by `user_id` for reactions given, `message_id` for reactions received)
   - Query bookmarks from `bookmarks` table (filter by `user_id`)
   - Query community joins/leaves from `MetaCommunityMembership` table (filter by `user_id`, track `joinedAt` and `isActive` changes)
   - Query message edits from `messages` table (where `updated_at` != `created_at`)
   - Query message deletions from `message_deletions` table (filter by `user_id` or `deleted_by`)
   - Query thread creation from `messages` table (where `parent_id` is null - root messages)
   - Query login/authentication events (from `user_presence` `enter_time` or separate tracking)
   - Query profile updates from `user_audit_logs` table (field-level changes with before/after values, timestamps, change type)
   - Implement configurable visibility filtering per activity type (public, community, group, private)
   - Support timeline persistence parameter (`?persistence=1d|7d|30d|1y|all`) - default: `all`
   - Support community filtering parameter (`?community=uuid`)
   - Support search/filter parameter (`?search=query`)
   - Support activity type filter (`?type=messages,status,aura,visibility,settings,reactions,bookmarks,profile,communities,edits,deletions,threads,login,streaks`)
   - Support multi-profile query (`?profiles=uuid1,uuid2,uuid3`) - return timelines for multiple users
   - Pagination support (`?page=1&limit=50`)
   - Follow existing route patterns (see `/routes/chat.js`, `/routes/presence.js`)

3. **Frontend Route Setup (Standalone Web Page)**
   - This is a **standalone web page** (not extension route)
   - Set up `canopi.live/timelines/[uuid]` route in frontend router
   - Set up `canopi.live/timelines/[username]` route
   - Route handler to fetch and display timeline data
   - Handle both UUID and username resolution
   - Timeline persistence configuration UI (dropdown: 1 day, 7 days, 30 days, 1 year, all time - default: all time)
   - **Reuse Extension Infrastructure**:
     - Load same Supabase client and configuration
     - Use same authentication system
     - Share CSS/styling from extension (`sidepanel.css` or shared stylesheet)
     - Use same component patterns and utilities

4. **Timeline UI Component (Standalone Web Page)**
   - Create timeline display component for standalone web page
   - **Design Consistency**: Match extension UI/UX (use same CSS classes, color scheme, typography, spacing from `sidepanel.css`)
   - **Real-time Updates**: Implement Supabase real-time subscriptions (use `SupabaseRealtimeClient.js` pattern from extension)
   - Implement chronological ordering (newest first)
   - Add timeline persistence selector (1 day, 7 days, 30 days, 1 year, all time - default: all time)
   - Add search/filter input
   - Add community filter selector
   - **Multi-Profile View Tab**:
     - Add "Add Profile" button/tab in main profile view
     - Profile selector/search (UUID or username input)
     - Display multiple profiles side-by-side or in stacked view
     - Each profile has its own timeline column with distinct styling/color
     - Toggle between single profile and multi-profile view
     - Remove profile button for each added profile
     - Shared timeline option: merge all profiles into single chronological timeline
     - Profile comparison mode: highlight differences/similarities
     - Limit number of profiles (e.g., max 3-4 for performance)
   - Display different activity types with distinct UI (matching extension design patterns):
     - Messages: Show message content, community, timestamp (use same message rendering as extension)
     - Status changes: Show old status → new status (use extension status indicators)
     - Aura changes: Show old color → new color (visual color swatches matching extension aura UI)
     - Visibility times: Show visibility periods (time ranges)
     - Settings tab visibility: Show "Opened settings" with timestamp
     - Reactions: Show emoji reaction on message (link to message, indicate if given or received)
     - Bookmarks: Show "Bookmarked message" with message preview (link to message)
     - Profile updates: Show what changed (headline, displayName, or avatar) with before/after values (if audit table available)
     - Community joins/leaves: Show community name, join/leave action, timestamp
     - Message edits: Show "Edited message" with original and edited content (if available), link to message
     - Message deletions: Show "Deleted message" with deletion timestamp, who deleted it
     - Thread creation: Show "Started thread" with thread title/content, link to thread
     - Login/authentication events: Show "Logged in" with timestamp, location/IP if available
     - Activity streaks: Show summary statistics (consecutive days active, longest streak, etc.)
   - Show visibility badge/indicator for each activity (public, community, private) - match extension badge styles
   - Allow users to configure visibility settings per activity type (if viewing own timeline)
   - Handle loading and error states (use extension loading/error UI patterns)
   - **Real-time Updates Implementation**:
     - Subscribe to Supabase real-time channels for timeline events
     - Listen for: new messages, reactions, bookmarks, profile updates, status changes, aura changes
     - Update timeline in real-time as events occur (smooth animations, no page refresh)
     - Show "new activity" indicators for real-time updates
     - Maintain scroll position when new items are added
     - **Multi-Profile Real-time**: Subscribe to real-time updates for all profiles in multi-profile view
   - **UI Polish**:
     - Smooth transitions and animations (match extension feel)
     - Responsive design (mobile-friendly like extension)
     - Dark/light theme support (match extension theme system)
     - Consistent typography and spacing
     - Loading skeletons (match extension loading states)
     - Empty states with helpful messaging

5. **Profile Tab Integration**
   - Locate profile tab implementation (likely in `sidepanel.js` or `ProfileManager.js`)
   - Add timeline link/access from profile notifications tab
   - Consider timeline preview or summary (show last 3-5 activities)
   - Add "View Full Timeline" button/link

6. **Hover Modal Integration**
   - Locate hover modal implementation (likely in `CanopiModule.js` or avatar-related files)
   - Add timeline link to user hover modals
   - Support both UUID and username routes
   - Consider showing recent activity preview (last 2-3 activities)
   - Add "View Timeline" link/button in hover modal

7. **Testing**
   - Test public vs. private visibility rules
   - Test community filtering
   - Test search functionality
   - Test with non-existent users (UUID and username)
   - Test pagination
   - Test performance with large timelines
   - Test real-time updates (Supabase subscriptions working correctly)
   - Test UI consistency with extension (design, colors, spacing)
   - Test smooth animations and transitions
   - Test theme switching (dark/light mode)
   - Test with users in multiple communities
   - Test with users in no communities (should still see Public Square)
   - Test edge cases: deleted messages, changed usernames, etc.
   - Test multi-profile view (add/remove profiles, side-by-side display)
   - Test multi-profile real-time updates
   - Test shared timeline view (merged chronological)
   - Test profile comparison features
   - Test performance with multiple profiles loaded

## Open Questions / Future Enhancements

### Critical Questions to Resolve
1. **Real-time Updates**: ✅ **Yes** - Timeline will support real-time updates using Supabase real-time subscriptions (same infrastructure as extension)
2. **Timeline Persistence Configuration**: Where should the persistence setting be stored? (User preferences, URL parameter, localStorage?)
3. **Data Derivation**: How to derive status/aura change history from existing tables? (May need to query `user_presence` updates or check for timestamp changes)
4. **Settings Tab Visibility Tracking**: How is settings tab visibility currently tracked? (May need to check if this is logged in `user_presence` or if we need to add tracking)
5. **Profile Update Audit Table**: ✅ **Audit table exists** - `user_audit_logs` table tracks all profile changes in sequence with:
   - Field-level change tracking (headline, displayName, avatarUrl, theme, auraColor, auraIntensity, etc.)
   - Before/after values for each change (`old_value`, `new_value`)
   - Timestamp of each change (`created_at`)
   - Change type (`change_type`: profile, settings, status, etc.)
   - Actor tracking (`changed_by` - who made the change)
   - Metadata field for additional context
   - **Implementation**: Use `user_audit_logs` table for granular timeline tracking
6. **Visibility Configuration**: Where should per-activity-type visibility settings be stored? (User preferences table, separate timeline_settings table?)
7. **Group Visibility**: How will "Group" visibility work? (TBD - future feature, but need to plan for it)
8. **Activity Streaks Calculation**: How to calculate activity streaks? (Daily activity threshold, what counts as "active"?)

### Future Enhancements
- Users able to hide/delete items from their timeline
- Timeline export functionality (JSON, CSV)
- Timeline sharing capabilities (shareable links)
- Timeline reactions/interactions
- Additional activity types (already included: community joins/leaves, thread creation, message edits/deletions, login events, activity streaks)
- Timeline analytics/insights (activity patterns, most active times, etc.)
- Timeline comparison (compare two users' timelines) - ✅ **Implemented as multi-profile view**
- Timeline embedding (embed timeline in other pages)

## Related Features
- Profile system (`ProfileManager.js`)
- Notification system (`NotificationManager.js`)
- Community system (`CommunitiesModule.js`, Public Square UUID: `abe5ec85-4ba6-456f-adaf-03d7d51cecf4`)
- Message system (`CanopiModule.js`, chat routes)
- Visibility system (`VisibilityManager.js`, `user_presence` table)
- Hover modal system (avatar hover modals in `CanopiModule.js`)
- Real-time system (Supabase real-time subscriptions)

## Important Notes

### Data Source Clarifications
- **No new database tables** - Use existing tables only
- **Public Square UUID**: `abe5ec85-4ba6-456f-adaf-03d7d51cecf4` (not `comm-001`)
- **Timeline Persistence**: Configurable from 1 day to all time (default: all time)
- **Own Timeline Visibility**: If user is not in communities, private data (status changes, visibility times) won't exist on their timeline anyway - only Public Square messages and aura changes will appear

### Architecture
- **Standalone Web Page**: This is a new standalone web page at `canopi.live/timelines/[uuid]` and `canopi.live/timelines/[username]`
- **Existing Data Only**: All timeline data comes from existing database tables - no new data creation or tracking needed
- **Real-time Infrastructure**: Uses same Supabase real-time system as extension (`SupabaseRealtimeClient.js`, `RealtimeManager.js`)
- **Design System**: Reuses extension CSS, components, and design patterns for consistency

### Real-time Implementation Details
- **Supabase Subscriptions**: Subscribe to real-time channels for:
  - `messages` table (INSERT, UPDATE, DELETE)
  - `reactions` table (INSERT, DELETE)
  - `bookmarks` table (INSERT, DELETE)
  - `user_audit_logs` table (INSERT for profile updates)
  - `user_presence` table (UPDATE for status/visibility changes)
  - `MetaCommunityMembership` table (INSERT, UPDATE for community joins/leaves)
- **Update Strategy**: 
  - New events appear at top of timeline with smooth animation
  - Maintain scroll position when user is scrolled down
  - Show "new activity" badge/indicator when updates occur while scrolled
  - Debounce rapid updates to avoid UI thrashing
- **Connection Management**: 
  - Subscribe on page load
  - Cleanup subscriptions on page unmount
  - Handle reconnection automatically (Supabase client handles this)
  - Show connection status indicator

## Implementation Order (Recommended)

1. **Database Schema Analysis** - Understand what data exists in existing tables (no new tables needed)
2. **Backend API Development** - Create timeline endpoint with proper filtering
3. **Timeline UI Component** - Build core timeline display
4. **Frontend Route Setup** - Set up routes for timeline access
5. **Profile Tab Integration** - Add timeline access from profile
6. **Hover Modal Integration** - Add timeline links to hover modals
7. **Testing & Refinement** - Comprehensive testing and UX improvements

## Technical Considerations

### Alignment with Existing Patterns
- Follow COMP method patterns where applicable
- **Use existing Supabase real-time infrastructure** (`SupabaseRealtimeClient.js`, `RealtimeManager.js`)
- **Reuse extension UI components and styling** (`sidepanel.css`, component patterns)
- Reuse community filtering logic from `CommunitiesModule.js`
- Follow route structure from `/routes/chat.js` and `/routes/presence.js`
- Use existing authentication middleware patterns
- **Design Consistency**: Match extension look and feel (colors, typography, spacing, animations)
- **Real-time Subscriptions**: Subscribe to Supabase channels for timeline events (messages, reactions, profile updates, etc.)

### Performance Optimizations
- Index database queries on `user_id`, `community_id`, `created_at`
- Consider materialized views for complex timeline aggregations
- Cache frequently accessed timelines (e.g., popular users)
- Lazy load timeline items as user scrolls
- Debounce search/filter inputs

### Security Considerations
- Server-side enforcement of visibility rules (never trust client)
- Verify community membership before showing private data
- Rate limit timeline queries to prevent abuse
- Sanitize search inputs to prevent injection
- Handle username/UUID resolution securely

