# Root Cause Fixes - Final Round

## Issues Identified

1. ✅ **Message Order** - FIXED (working correctly)
2. ❌ **Unknown Authors** - Messages showing "Unknown" instead of real names
3. ❌ **Active Communities Timing** - `loadChatHistory` called before communities stored
4. ❌ **Visibility Tab Showing Messages** - Need to investigate
5. ❌ **Replies Not Displaying** - Need clarification (should be hidden in default view)

---

## Root Cause #1: Unknown Authors

**Problem:** Messages show "Unknown" as author name

**Root Cause:** 
- Fallback Supabase query doesn't join with `AppUser` table
- API method tries to use `msg.AppUser?.name` but query doesn't select AppUser
- No user lookup after getting messages

**Fix Applied:**
1. **APIModule.js:** Changed query to join with AppUser: `.select('*, AppUser:user_id(*)')`
2. **CanopiModule.js:** 
   - Changed fallback query to join: `.select('*, AppUser:user_id(*)')`
   - Added user lookup if AppUser join fails
   - Populate author data from AppUser or lookup

**Files Modified:**
- `presence/features/APIModule.js` line 405
- `presence/features/CanopiModule.js` lines 716-749

---

## Root Cause #2: Active Communities Timing

**Problem:** `⚠️ loadChatHistory: No active communities available after retries`

**Root Cause:** 
- `CommunitiesModule` calls `loadChatHistory` with 100ms delay
- StateManager may not have stored `ui.activeCommunities` yet
- `loadChatHistory` retries but communities still not available

**Fix Applied:**
- Added verification loop in `CommunitiesModule` to confirm communities are stored
- Wait up to 1 second (10 x 100ms) checking `window.getState('ui.activeCommunities')`
- Only call `loadChatHistory` after confirming communities are stored

**Files Modified:**
- `presence/features/CommunitiesModule.js` lines 288-297

---

## Root Cause #3: Visibility Tab Showing Messages

**Status:** Need to investigate - user reports visibility tab has messages instead of users

**Possible Causes:**
- Wrong content being rendered in visibility tab
- Messages being added to wrong container
- CSS/display issue showing wrong content

**Action:** Check VisibilityManager and visibility tab rendering

---

## Root Cause #4: Replies Not Displaying

**Status:** Need clarification

**Current Behavior:**
- Diagnostic shows "Visible replies (should be 0): 0" ✅
- Replies are correctly hidden in default view
- Replies should show when thread is expanded

**Question:** Do replies show when threads are expanded? Or are they never showing?

---

## Summary

**Fixed:**
- ✅ Unknown authors - Added AppUser join and lookup
- ✅ Active communities timing - Added verification before calling loadChatHistory

**Needs Investigation:**
- ⏳ Visibility tab showing messages
- ⏳ Replies display (need clarification)

---

## Testing

After fixes:
1. Reload extension
2. Navigate to google.com
3. Check:
   - ✅ Messages show real author names (not "Unknown")
   - ✅ No "No active communities" warning
   - ✅ Visibility tab shows users (not messages)
   - ✅ Replies show when threads expanded

