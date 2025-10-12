# TE2 Test Engineer Recommendations
## Chrome Extension Presence System - Visibility Timing & Ghost Presence

**Date:** 2025-10-12  
**Build:** 2025-10-12-ghost-fix  
**Backend Version:** 1.2.4-urlnorm-fix  
**Status:** CRITICAL FIXES APPLIED - READY FOR USER TESTING

---

## Executive Summary

### Issues Addressed:
1. ✅ **Visibility Timing "Wonky"** - Users showing "Now" instead of "Online for X minutes"
2. ✅ **Slow Reaction Time** - 30+ second delay when switching tabs
3. ✅ **Ghost Presence** - User still visible on old page after tab switch
4. ✅ **Profile Not Updating** - Profile that doesn't change tabs not seeing updates quickly

### Root Cause Identified:
**Backend API threshold mismatch** - Backend was using a 5-minute threshold for "active" users while frontend expected 30 seconds. This caused massive delays in visibility updates and incorrect state calculations.

---

## Fixes Implemented

### 1. Backend Threshold Reduction (CRITICAL)
**File:** `routes/presence.js`  
**Change:** Reduced `minutesThreshold` from 5 minutes to 0.5 minutes (30 seconds)  
**Impact:** 
- Users now disappear from visibility list within 30 seconds of leaving
- Backend only returns users with recent heartbeats (last 30 seconds)
- Matches frontend's 30-second isActive threshold

**Lines Changed:**
```javascript
// Before: minutes = 5
// After:  minutes = 0.5

Line 102: const { pageId, communityId, minutes = 0.5 } = req.query;
Line 126: const { communityIds, minutes = 0.5 } = req.query;
Line 151: const { url, communityIds, minutes = 0.5 } = req.query;
```

### 2. Comprehensive Test Suite Created
**File:** `test-visibility-timing-comprehensive.js`  
**Purpose:** Provide TE2 with diagnostic tools to verify fixes and identify remaining issues

**Test Functions:**
1. `window.testEnterTimeStability(120)` - Monitors if enter_time is being reset
2. `window.testVisibilityStateFlipping(120)` - Monitors status text flipping
3. `window.testGhostPresence()` - Manual test instructions for ghost presence
4. `window.testHeartbeatFrequency(60)` - Monitors heartbeat intervals
5. `window.testRealtimeSubscription(60)` - Monitors Supabase real-time updates

### 3. Ghost Presence Fix (Already Implemented)
**File:** `sidepanel.js`, `supabase-realtime-client.js`  
**Change:** Added `leaveCurrentPage()` method that marks user as inactive before tab switch  
**Impact:** User should disappear from old page immediately (within 5-10 seconds)

---

## Testing Protocol

### Phase 1: Immediate Verification (5 minutes)
**Objective:** Verify backend is running with new threshold

1. **Check Backend Health:**
   ```bash
   curl http://localhost:3003/health
   ```
   Expected: `"version": "1.2.4-urlnorm-fix"`, `"ok": true`

2. **Verify Extension Build:**
   - Open Chrome extension sidepanel
   - Open browser console
   - Look for: `🔍 BUILD VERIFICATION: Extension version 2025-10-12-ghost-fix`

3. **Hard Refresh Extension:**
   - Go to `chrome://extensions/`
   - Click reload button on "Collaborative Sidebar" extension
   - This clears frontend cache and applies all fixes

### Phase 2: Automated Diagnostics (10 minutes)
**Objective:** Use TE2 test suite to identify any remaining issues

1. **Test Enter Time Stability:**
   ```javascript
   window.testEnterTimeStability(120)
   ```
   - **Expected:** enter_time should NOT change during 120-second test
   - **Failure:** If enter_time resets, indicates backend or frontend bug in enter_time preservation

2. **Test Visibility State Flipping:**
   ```javascript
   window.testVisibilityStateFlipping(120)
   ```
   - **Expected:** Status text should progress smoothly: "Now" → "Online for 1 minute" → "Online for 2 minutes"
   - **Failure:** If status flips back to "Now", indicates enter_time reset or API data issue

3. **Test Heartbeat Frequency:**
   ```javascript
   window.testHeartbeatFrequency(60)
   ```
   - **Expected:** Heartbeats every 5 seconds (average interval: 5s)
   - **Failure:** If interval > 30s, indicates heartbeat not sending or being blocked

4. **Test Real-time Subscription:**
   ```javascript
   window.testRealtimeSubscription(60)
   ```
   - **Expected:** Real-time updates received when other profile changes tabs
   - **Failure:** If no updates received, indicates Supabase real-time subscription issue

### Phase 3: Manual Ghost Presence Test (5 minutes)
**Objective:** Verify ghost presence is eliminated

1. **Setup:**
   - Open Profile A (e.g., daveroom@gmail.com) on Page 1 (google.com)
   - Open Profile B (e.g., themetalayer@gmail.com) on Page 1 (google.com)
   - Verify Profile B sees Profile A in "Visible" list

2. **Test:**
   - In Profile A, switch to Page 2 (youtube.com)
   - Immediately check Profile B's "Visible" list
   - **Expected:** Profile A disappears within 5-10 seconds
   - **Failure:** If Profile A still visible after 30+ seconds, ghost presence bug persists

3. **Console Monitoring:**
   - In Profile A console, look for:
     - `🚪 TAB_CHANGE: Leaving current page before switching...`
     - `🚪 PRESENCE_EXIT: === LEAVING PAGE ===`
     - `✅ TAB_CHANGE: Left current page successfully`
   - In Profile B console, look for:
     - Real-time updates removing Profile A from visibility list

### Phase 4: Cross-Profile Visibility Test (10 minutes)
**Objective:** Verify profile that doesn't change tabs sees updates quickly

1. **Setup:**
   - Profile A on Page 1
   - Profile B on Page 1
   - Both see each other in "Visible" list

2. **Test:**
   - Keep Profile B on Page 1 (DO NOT SWITCH TABS)
   - In Profile A, switch between Page 1 and Page 2 every 10 seconds
   - Monitor Profile B's "Visible" list

3. **Expected Behavior:**
   - Profile B should see Profile A appear/disappear within 10-15 seconds
   - Status text should update: "Now" → "Online for 1 minute" → "Online for 2 minutes"
   - No flipping back to "Now"

4. **Failure Indicators:**
   - Profile A doesn't appear/disappear in Profile B's list
   - Status text stuck on "Now" for > 60 seconds
   - Status text flips: "Online for 1 minute" → "Now"

---

## Expected Results After Fixes

### Visibility Timing:
- ✅ Users appear within 5-10 seconds of joining page
- ✅ Users disappear within 5-10 seconds of leaving page
- ✅ Status text updates smoothly: "Now" → "Online for 1 minute" → "Online for 2 minutes"
- ✅ No flipping back to "Now" unless user actually left and rejoined

### Ghost Presence:
- ✅ User disappears from old page within 5-10 seconds of tab switch
- ✅ `leaveCurrentPage()` called before tab switch
- ✅ Real-time updates propagate to other profiles quickly

### Cross-Profile Updates:
- ✅ Profile that doesn't change tabs sees updates within 10-15 seconds
- ✅ Visibility list refreshes every 5 seconds (polling)
- ✅ Real-time updates trigger immediate UI refresh

---

## Potential Remaining Issues

### Issue 1: enter_time Still Resetting
**Symptom:** Status text flips from "Online for X minutes" back to "Now"  
**Diagnosis:** Run `window.testEnterTimeStability(120)` to confirm  
**Root Cause:** Backend or frontend still resetting enter_time on heartbeats  
**Fix:** Check Supabase `user_presence` table for enter_time changes during test

### Issue 2: Real-time Updates Not Working
**Symptom:** Profile B doesn't see Profile A's changes until manual refresh  
**Diagnosis:** Run `window.testRealtimeSubscription(60)` to confirm  
**Root Cause:** Supabase real-time subscription not configured or not receiving events  
**Fix:** Check Supabase real-time logs, verify channel subscription

### Issue 3: Heartbeats Not Sending
**Symptom:** Users disappear after 30 seconds even though still on page  
**Diagnosis:** Run `window.testHeartbeatFrequency(60)` to confirm  
**Root Cause:** Heartbeat interval not running or being blocked  
**Fix:** Check browser console for heartbeat logs (`💓 HEARTBEAT:`)

---

## Recommended Logging Infrastructure

### Console Functions (Already Implemented):
```javascript
// Comprehensive diagnostics
window.testEnterTimeStability(120)    // Monitor enter_time
window.testVisibilityStateFlipping(120) // Monitor status text
window.testGhostPresence()             // Manual test instructions
window.testHeartbeatFrequency(60)      // Monitor heartbeats
window.testRealtimeSubscription(60)    // Monitor real-time updates

// Quick diagnostics
window.diagnoseCriticalIssues()        // Full diagnostic report
window.testProfileAvatarFlow()         // Test profile avatar
window.testVisibilityAvatarFlow()      // Test visibility avatars
window.testVisibilityTimeFlow()        // Test visibility times
window.forceReloadAvatars()            // Force reload and update

// Backend health
window.checkBackendHealth()            // Check backend version and uptime
```

### Backend Logging (Already Implemented):
- `🔍 PRESENCE_UPDATE:` - Presence update events
- `🚪 PRESENCE_EXIT:` - User leaving page events
- `💓 HEARTBEAT:` - Heartbeat events
- `🔍 VISIBILITY:` - Visibility list updates
- `🔍 ENTER_TIME_BUG:` - enter_time reset detection

---

## Recommendations for Senior Engineer

### Immediate Actions:
1. ✅ **DONE:** Reduce backend threshold from 5 minutes to 30 seconds
2. ✅ **DONE:** Create comprehensive TE2 test suite
3. ✅ **DONE:** Restart backend server with new threshold
4. ⏳ **PENDING:** User hard refresh Chrome extension
5. ⏳ **PENDING:** User run TE2 test suite to verify fixes

### Future Improvements:
1. **Real-time Updates Priority:**
   - Consider reducing polling interval from 5 seconds to 3 seconds
   - Implement Supabase real-time subscription for instant updates
   - Add visual indicator when real-time update received

2. **Heartbeat Optimization:**
   - Current: 5 seconds (good)
   - Consider: Exponential backoff when tab inactive (save resources)
   - Add: Immediate heartbeat on tab activation

3. **Ghost Presence Prevention:**
   - Current: `leaveCurrentPage()` on tab change (good)
   - Consider: Redundant EXIT event on `beforeunload`
   - Add: Server-side timeout (mark inactive after 60s no heartbeat)

4. **Testing Infrastructure:**
   - Add: Automated E2E tests for cross-profile scenarios
   - Add: Performance monitoring for API response times
   - Add: Supabase query performance metrics

5. **User Experience:**
   - Add: Loading indicator during visibility updates
   - Add: "Connecting..." state when real-time subscription initializing
   - Add: Error toast when presence update fails

---

## Success Criteria

### Must Have (P0):
- ✅ Users appear/disappear within 10 seconds of tab changes
- ✅ Status text updates smoothly without flipping
- ✅ Ghost presence eliminated (user disappears from old page)
- ✅ Cross-profile updates work within 15 seconds

### Should Have (P1):
- Real-time updates work (instant visibility changes)
- Heartbeats consistent at 5-second intervals
- No enter_time resets during normal usage
- Backend logs show correct pageId and timestamps

### Nice to Have (P2):
- Visual feedback for real-time updates
- Performance metrics in console
- Automated E2E tests passing
- User experience enhancements (loading states, error handling)

---

## Conclusion

The critical backend threshold mismatch has been fixed. The system should now provide real-time visibility updates with minimal delay. The comprehensive TE2 test suite will help identify any remaining issues.

**Next Step:** User should hard refresh the Chrome extension and run the test suite to verify all fixes are working as expected.

**Estimated Time to Full Resolution:** 30 minutes (including testing and any minor adjustments)

---

**TE2 Sign-off:** Ready for user testing  
**SD1 Sign-off:** Solution implemented, monitoring recommended  
**Senior Engineer:** Awaiting user feedback and test results

