# ROOT CAUSE ANALYSIS - Reactions Not Working

## Issues Identified

### 1. USER ID MISMATCH (PRIMARY ROOT CAUSE)
**Problem**: Frontend uses `window.currentUser.id` to match reactions, but backend may use a different UUID:
- Backend `authenticateUser` middleware: If `X-User-Id` header is invalid UUID or not in DB, it falls back to email lookup and returns THAT user's UUID
- Frontend checks reactions using `window.currentUser.id` 
- **Result**: Reaction created with DB user UUID, but frontend searches using `window.currentUser.id` → not found

**Evidence**: Logs show reactions exist but `userReaction` is `undefined` because IDs don't match.

### 2. REACTION MATCHING LOGIC FLAWED
**Problem**: `updateReactionDisplay` checks `r.AppUser?.id || r.user_id` vs `window.currentUser?.id`, but:
- Backend returns `reaction.user_id` (the actual DB user_id used)
- Frontend should use the API response's `reaction.user_id` to verify match, not assume `window.currentUser.id`

### 3. UPDATE EVENT HANDLING INCORRECT
**Problem**: Backend does `UPDATE` when replacing reaction (line 139-152 in reactions.js), not DELETE+INSERT:
- Supabase emits `UPDATE` event for replacements
- Current code tries to ignore DELETE events, but UPDATE events are not properly handled
- Real-time handler reloads all reactions, losing optimistic UI state

### 4. OPTIMISTIC UI OVERWRITTEN BY REAL-TIME
**Problem**: 
- UI updates optimistically with user's selection
- Real-time event arrives and calls `loadMessageReactions` → reloads from API
- API returns reactions, but user reaction not found due to ID mismatch
- UI reverts to showing thumbs up (most popular)

## Required Fixes

1. **Use API Response User ID**: After successful API call, extract `result.reaction.user_id` and use THAT for matching, not `window.currentUser.id`

2. **Verify ID Consistency**: Log mismatch between `window.currentUser.id` and backend `req.user.id` 

3. **Handle UPDATE Events**: Real-time UPDATE events should trigger smart reload that preserves user selection if IDs match

4. **Store Reaction ID from API**: Track the actual `reaction.id` returned from API for DELETE event filtering


