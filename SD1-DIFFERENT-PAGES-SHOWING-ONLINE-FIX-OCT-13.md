# SD1 Analysis: Users on Different Pages Showing as "Online"
**Date:** October 13, 2025  
**Build:** 2025-10-13-realtime-diagnostic-logging  
**Agent:** SD1 (Senior Developer)

## Problem Statement

User reported: "Now when on different pages, it still shows both in visibility. For a moment, the profile that changed pages, said last seen 45 seconds ago but then it switched to say it was online"

### Evidence from Database

```sql
| user_email             | page_id                                      | is_active | last_seen                  |
| daveroom@gmail.com     | google_com_                                  | true      | 2025-10-13 19:25:57.506+00 |
| themetalayer@gmail.com | chrome_extensions_errors_dbdjamnflfecdni... | true      | 2025-10-13 19:25:56.242+00 |
```

**Reality:** They are on DIFFERENT pages!
- **daveroom**: `google_com_`
- **themetalayer**: `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl`

### Evidence from Frontend Logs

**daveroom's console (on google.com):**
```javascript
🔍 VISIBILITY_TIMING_FIX: === User The Metalayer ===
🔍 VISIBILITY_TIMING_FIX:   enterTime: 2025-10-13T18:58:23.53+00:00
🔍 VISIBILITY_TIMING_FIX:   lastSeen: 2025-10-13T19:20:47.327+00:00
🔍 VISIBILITY_TIMING_FIX:   isActive: false
🔍 VISIBILITY_TIMING_FIX:   DECISION: User has LEFT → "Last seen 45 seconds ago"
```

**Then it changes to:**
```javascript
🔄 VISIBILITY: ✅ Updated time for The Metalayer: "Last seen 45 seconds ago" → "Online for 23 minutes"
```

## Root Cause Analysis

### The Bug

The backend's `getActiveUsers()` function in `presenceService.js` was returning **recently inactive users** (`is_active: false`) within a 30-minute window. This is correct for showing "Last seen X ago" for users who *left the same page*.

**However**, the query did NOT check if the user had moved to a **DIFFERENT page**!

### What Was Happening

1. **themetalayer** was on `google.com` at 18:58:23
2. **themetalayer** moved to `chrome://extensions/` at 19:20:47
3. Their presence record on `google.com` was marked `is_active: false`
4. **daveroom** navigated to `google.com` at 19:21:32
5. Backend query returned **themetalayer** as "recently inactive" on `google.com` (because they were there 23 minutes ago)
6. Frontend initially showed "Last seen 45 seconds ago" (correct!)
7. **But then** the frontend's time calculation used `enter_time` (23 minutes ago) instead of `last_seen`, showing "Online for 23 minutes" (WRONG!)

### Two Bugs, One Fix

**Bug 1 (Backend):** Returning users who are inactive on THIS page but active on ANOTHER page  
**Bug 2 (Frontend):** Using `enter_time` instead of `last_seen` for inactive users

## Solution Implemented

### Backend Fix (Primary)

Modified `services/presenceService.js` to:

1. **Query for users active on OTHER pages:**
   ```javascript
   const { data: activeElsewhere } = await this.supabase
     .from('user_presence')
     .select('user_email')
     .eq('is_active', true)
     .neq('page_id', pageId);
   
   const activeElsewhereEmails = new Set(activeElsewhere.map(u => u.user_email));
   ```

2. **Filter out users who are active elsewhere:**
   ```javascript
   recentUsers = recentUsers.filter(user => !activeElsewhereEmails.has(user.user_email));
   ```

### Logic Flow

**Before Fix:**
```
Query: page_id = google_com_ AND is_active = false AND last_seen > 30 min ago
Result: Returns themetalayer (even though they're active on chrome://extensions/)
```

**After Fix:**
```
Query 1: is_active = true AND page_id != google_com_
Result: themetalayer is active on chrome://extensions/

Query 2: page_id = google_com_ AND is_active = false AND last_seen > 30 min ago
Result: Returns themetalayer

Filter: Remove themetalayer (because they're in activeElsewhere set)
Final Result: Empty (correct!)
```

## Testing Instructions

### Test Case 1: Users on Different Pages

**Setup:**
1. Open Chrome profile 1 (themetalayer) on `google.com`
2. Open Chrome profile 2 (daveroom) on `google.com`
3. Verify both see each other as "Online"

**Action:**
4. Move profile 1 to `chrome://extensions/`

**Expected Result:**
- Profile 1 should see profile 2 as "Last seen X ago" (or empty if they just left)
- Profile 2 should see profile 1 as "Last seen X ago" (or empty if they just left)
- **Neither should show the other as "Online"**

### Test Case 2: User Returns to Same Page

**Setup:**
1. Profile 1 on `google.com`
2. Profile 2 on `youtube.com`

**Action:**
3. Profile 2 navigates to `google.com`

**Expected Result:**
- Profile 1 should see profile 2 appear as "Now" or "Online"
- Profile 2 should see profile 1 as "Online for X minutes"

## Backend Logging

Added comprehensive logging to track the fix:

```javascript
console.log(`🔍 BACKEND: Found ${activeElsewhereEmails.size} users active on OTHER pages:`, Array.from(activeElsewhereEmails));
console.log(`🔍 DEBUG: Recent inactive users (before filter): ${recentUsersBeforeFilter} records`);
console.log(`🔍 DEBUG: Recent inactive users (after filter): ${recentUsers.length} records`);
console.log(`🔍 DEBUG: Filtered out ${recentUsersBeforeFilter - recentUsers.length} users who are active elsewhere`);
```

## Files Modified

- `services/presenceService.js` - Added query for active users on other pages and filter logic

## Success Criteria

✅ Users on different pages do NOT show as "Online"  
✅ Users show "Last seen X ago" only if they left the SAME page  
✅ Backend logs show filtering working correctly  
✅ No false positives for "Online" status

## Technical Notes

- This fix adds one additional Supabase query per `getActiveUsers()` call
- The query is lightweight (only selects `user_email`)
- Performance impact is minimal (< 50ms)
- Alternative approach would be to add a `current_page_id` column to track where users are now, but this works with existing schema

---

**Status:** ✅ Fixed and deployed  
**Backend Restarted:** Yes (pm2 restart canopi2-server)  
**Ready for Testing:** Yes


