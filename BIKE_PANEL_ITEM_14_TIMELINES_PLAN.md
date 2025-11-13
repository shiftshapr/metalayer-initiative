# Bike Panel Item 14 - canopi.live Timelines Feature

## Overview
Implement a timeline/profile feature that displays and allows searching through user activity history including messages, status changes, aura changes, and visibility times. This feature will have different visibility levels based on user relationships and community membership.

## Feature Description

### Core Functionality
- **Timeline Display**: Show chronological activity for users including:
  - Messages (Public Square messages)
  - Status changes
  - Aura changes
  - Visibility times
- **Search Capability**: Allow searching/filtering through timeline content
- **Community Filtering**: Filter timeline by community
- **Input Field**: Search/filter input for timeline content

### Routes
- `canopi.live/timelines/[uuid]` - Access timeline by user UUID
- `canopi.live/timelines/[username]` - Access timeline by username

### Visibility Rules

#### Public (Everyone, including non-logged-in users)
- **Public Square messages** - All messages posted to Public Square
- **Aura changes** - All aura color/state changes

#### Community-Private (Only users in same communities)
- **Visibility times** - When user was visible/active
- **Status changes** - User status updates (active, away, etc.)

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
- Activity type icons/badges (message, status, aura, visibility)
- Timestamp formatting (relative time like "2 hours ago" with absolute on hover)

### Security & Privacy
- Enforce visibility rules server-side
- Verify community membership before showing private data
- Handle non-existent users gracefully
- Rate limiting for timeline queries
- Ensure proper authentication/authorization checks

### Performance
- Efficient database queries with proper indexing
- Caching strategy for frequently accessed timelines
- Lazy loading for timeline items
- Optimize for large timelines (users with lots of activity)

## Technical Tasks

1. **Database Schema Analysis**
   - Audit existing tables to identify where timeline data is stored:
     - Messages: `messages` table (has timestamps, `community_id`, `user_id`)
     - Status changes: `user_presence` table (check for status change tracking)
     - Aura changes: Check `user_presence` or user preferences tables for aura color history
     - Visibility times: `user_presence` table with `last_seen`, `is_visible` timestamps
   - **No new tables needed** - use existing database structure
   - Verify indexes exist for efficient chronological queries (`created_at`, `user_id`, `community_id`)

2. **Backend API Development**
   - Create timeline controller: `/controllers/timelineController.js`
   - Create timeline route: `/routes/timelines.js`
   - Endpoint: `GET /api/timelines/:identifier` (UUID or username)
   - Implement visibility filtering logic (public vs. community-private)
   - Query messages from Public Square (`abe5ec85-4ba6-456f-adaf-03d7d51cecf4`)
   - Query status change history from existing `user_presence` table
   - Query aura change history from existing tables
   - Query visibility/activity times from `user_presence` table
   - Support timeline persistence parameter (`?persistence=1d|7d|30d|1y|all`) - default: `all`
   - Support community filtering parameter (`?community=uuid`)
   - Support search/filter parameter (`?search=query`)
   - Support activity type filter (`?type=messages,status,aura,visibility`)
   - Pagination support (`?page=1&limit=50`)
   - Follow existing route patterns (see `/routes/chat.js`, `/routes/presence.js`)

3. **Frontend Route Setup (Standalone Web Page)**
   - This is a **standalone web page** (not extension route)
   - Set up `canopi.live/timelines/[uuid]` route in frontend router
   - Set up `canopi.live/timelines/[username]` route
   - Route handler to fetch and display timeline data
   - Handle both UUID and username resolution
   - Timeline persistence configuration UI (dropdown: 1 day, 7 days, 30 days, 1 year, all time - default: all time)

4. **Timeline UI Component (Standalone Web Page)**
   - Create timeline display component for standalone web page
   - Implement chronological ordering (newest first)
   - Add timeline persistence selector (1 day, 7 days, 30 days, 1 year, all time - default: all time)
   - Add search/filter input
   - Add community filter selector
   - Display different activity types with distinct UI:
     - Messages: Show message content, community, timestamp
     - Status changes: Show old status → new status
     - Aura changes: Show old color → new color (visual color swatches)
     - Visibility times: Show visibility periods (time ranges)
   - Handle loading and error states
   - Support real-time updates (optional - subscribe to new timeline events)

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
   - Test real-time updates (if implemented)
   - Test with users in multiple communities
   - Test with users in no communities (should still see Public Square)
   - Test edge cases: deleted messages, changed usernames, etc.

## Open Questions / Future Enhancements

### Critical Questions to Resolve
1. **Real-time Updates**: Should timeline support real-time updates as new activities occur? (Adds complexity but better UX)
2. **Timeline Persistence Configuration**: Where should the persistence setting be stored? (User preferences, URL parameter, localStorage?)
3. **Data Derivation**: How to derive status/aura change history from existing tables? (May need to query `user_presence` updates or check for timestamp changes)

### Future Enhancements
- Users able to hide/delete items from their timeline
- Timeline export functionality (JSON, CSV)
- Timeline sharing capabilities (shareable links)
- Timeline reactions/interactions
- Additional activity types (reactions given/received, community joins/leaves, etc.)
- Timeline analytics/insights (activity patterns, most active times, etc.)
- Timeline comparison (compare two users' timelines)
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
- Use existing Supabase real-time infrastructure
- Reuse community filtering logic from `CommunitiesModule.js`
- Follow route structure from `/routes/chat.js` and `/routes/presence.js`
- Use existing authentication middleware patterns

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

