# Visibility Fix Summary - Root Cause Resolution

## Issue
- Database has 2 users for the page (`user_presence` table)
- API returns 0 users (`/v1/presence/url`)
- Users can't see each other across browser profiles
- Status shows "offline" instead of "Last seen X ago"

## Root Cause
`getActiveUsers` in `presenceService.js` was using a single 30-second cutoff time for both:
1. Truly active users (should show "Online for X")
2. Recently seen users (should show "Last seen X ago")

This meant any user whose `last_seen` was older than 30 seconds got filtered out entirely, even though they should be displayed as "Last seen X ago".

## Fix Applied

### `services/presenceService.js` - `getActiveUsers`
- **Two separate cutoff times:**
  - `activeCutoffTime`: 30 seconds (or `minutes` parameter) - for truly active status
  - `recentlySeenCutoffTime`: 24 hours - for "Last seen X ago" status

- **Query change:**
  - Now queries users with `last_seen >= recentlySeenCutoffTime` (24 hours)
  - Previously queried ALL users, then filtered by 30-second cutoff

- **Status determination:**
  - `isActive`: `is_active=true` AND `last_seen >= activeCutoffTime` (30 seconds)
  - `status`: 
    - `'online'` if `isActive=true`
    - `'recently_seen'` if `last_seen` within 24 hours (but not active)
    - `'offline'` otherwise

### Files Modified
1. `services/presenceService.js` - Fixed `getActiveUsers` filtering logic
2. `VISIBILITY_DIAGNOSTIC_CONSOLE.js` - Enhanced diagnostic queries

## Testing

### Test Console Code
Run `VISIBILITY_TEST_CONSOLE.js` in browser console to verify:
- ✅ API returns users from backend
- ✅ Both users are visible (excluding current user)
- ✅ Status displays correctly ("Last seen X ago" not just "offline")
- ✅ Current user is filtered out

### Diagnostic Console Code  
Run `VISIBILITY_DIAGNOSTIC_CONSOLE.js` for detailed analysis:
- Current user identity
- Presence API response
- Direct database queries
- Filtering analysis

## Potential Blind Spots

### 1. `getActiveUsersByCommunities` (Line 369)
- **Status**: Uses single cutoff time - may have similar issue
- **Action**: Monitor if community-based queries show similar problems
- **Priority**: Low (less commonly used endpoint)

### 2. Other presence queries
- `getPagePresence` (Line 190) - May need similar fix if used for visibility
- Status: Unknown - needs testing if used for visibility display

## Permitted Deviations
- ✅ Using UUID-based user ID matching (as logged in previous fixes)
- ✅ 24-hour window for "recently seen" (COMP method uses similar logic)
