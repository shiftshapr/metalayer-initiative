# Backend Community ID Default Fix

## Problem
The backend API required `communityId` to be provided in the request, but the database schema has a default value of `"comm-001"`. This created an inconsistency:
- Database defaults to `comm-001` if not provided
- API returned 400 error if `communityId` was missing

## Solution
Made `communityId` optional in the backend API, defaulting to `"comm-001"` (Public Square) when not provided. This:
1. Matches the database schema default
2. Ensures messages are always assigned to a community
3. Provides graceful fallback when frontend doesn't send `communityId`

## Changes Made

### File: `controllers/chatController.js`

**Lines 5-12:**
- Removed `communityId` from required fields check
- Added `resolvedCommunityId` that defaults to `'comm-001'` if not provided
- Added logging when default is used

**Before:**
```javascript
if (!user_id || !communityId || !content) {
  return res.status(400).json({ error: 'user_id, communityId & content are required' });
}
```

**After:**
```javascript
if (!user_id || !content) {
  return res.status(400).json({ error: 'user_id & content are required' });
}

// CRITICAL FIX: Default to comm-001 (Public Square) if communityId not provided
const resolvedCommunityId = communityId || 'comm-001';
```

**Lines 30, 61:**
- Changed all references from `communityId` to `resolvedCommunityId` in conversation creation and logging

## Impact

### Positive
- ✅ Messages always have a community assigned (no orphaned messages)
- ✅ Consistent with database schema default
- ✅ Graceful degradation when frontend doesn't send `communityId`
- ✅ No breaking changes (frontend still works if it sends `communityId`)

### Testing
1. Send message without `communityId` → Should default to `comm-001`
2. Send message with `communityId` → Should use provided value
3. Verify messages are stored in database with correct `community_id`

## Database Schema
The `messages` table already has:
```prisma
community_id String @default("comm-001")
```

This ensures database-level default as well, providing double protection.






