# `leaveCurrentPage()` Diagnostic Analysis - SD1

**Date**: October 12, 2025  
**Build**: `2025-10-12-leavepage-verification`  
**Agent**: SD1 (Senior Diagnostic Engineer)

## Problem Statement

Users on different pages are still showing up in each other's visibility lists as "Online", despite the implementation of `leaveCurrentPage()` logic. The backend API is returning both users as `isActive: true` on the same `pageId`, even when they are visually on different pages in their browser tabs.

## Evidence from Logs

From the `themetalayer@gmail.com` logs at `2025-10-12T20:14:24`:

```json
{
  "active": [
    {
      "email": "daveroom@gmail.com",
      "pageId": "chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl",
      "enterTime": "2025-10-12T19:51:20.19+00:00",
      "lastSeen": "2025-10-12T20:14:20.534+00:00",
      "isActive": true
    },
    {
      "email": "themetalayer@gmail.com",
      "pageId": "chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl",
      "enterTime": "2025-10-12T20:14:24.011+00:00",
      "lastSeen": "2025-10-12T20:14:24.011+00:00",
      "isActive": true
    }
  ]
}
```

**Critical Observation**: Both users are marked as `isActive: true` on the SAME `pageId`, yet the user reported they are on different pages.

## Hypotheses

### Hypothesis 1: `leaveCurrentPage()` Is Not Being Called
**Likelihood**: Low  
**Reasoning**: Code inspection shows `leaveCurrentPage()` is called in both `handleTabChange()` and `handleTabUpdate()` before processing new tabs/URLs.

**Code Evidence**:
```javascript
// sidepanel.js line 7056
async function handleTabChange(activeInfo) {
  await window.supabaseRealtimeClient.leaveCurrentPage();
  // ... rest of logic
}

// sidepanel.js line 7099
async function handleTabUpdate(tabId, changeInfo, tab) {
  await window.supabaseRealtimeClient.leaveCurrentPage();
  // ... rest of logic
}
```

### Hypothesis 2: Race Condition - Realtime Events Overwriting `is_active: false`
**Likelihood**: **HIGH**  
**Reasoning**: 
- The `leaveCurrentPage()` update sets `is_active: false` in the database.
- A few milliseconds later, a **heartbeat** from `realtime-presence-handler.js` (which runs every 5 seconds) may fire, calling `updatePresence()` which resets `is_active: true`.
- This would explain why users appear "stuck" on the old page.

**Code Evidence**:
```javascript
// realtime-presence-handler.js - startHeartbeat()
this.heartbeatInterval = setInterval(async () => {
  await window.supabaseRealtimeClient.updatePresence(
    this.currentPageId,
    this.currentPageUrl,
    window.getCurrentAuraColor ? await window.getCurrentAuraColor() : null
  );
}, 5000); // Heartbeat every 5 seconds
```

**The Problem**: When `leaveCurrentPage()` is called, the heartbeat interval is still running for the OLD page, and may send an `updatePresence()` AFTER the `is_active: false` update, effectively re-activating the user on the old page.

### Hypothesis 3: `leaveCurrentPage()` Database Update Fails Silently
**Likelihood**: Medium  
**Reasoning**: 
- RLS policies on the `user_presence` table may block the update.
- Network errors may cause the update to fail.
- The verification query added in the latest build will help confirm this.

**Code Evidence**:
```javascript
// supabase-realtime-client.js - leaveCurrentPage()
const { error } = await this.supabase
  .from('user_presence')
  .update({
    is_active: false,
    last_seen: new Date().toISOString()
  })
  .eq('user_email', this.currentUser.userEmail)
  .eq('page_id', pageId);

if (error) {
  console.error('❌ LEAVE_PAGE: Failed to mark as inactive:', error);
}
```

**What We Need**: The verification logs from the `LEAVE_PAGE` console output to confirm if `is_active` was successfully set to `false`.

### Hypothesis 4: `pageId` Mismatch Between Frontend and Backend
**Likelihood**: Low (but worth checking)  
**Reasoning**: 
- The frontend may be generating a different `pageId` than what's stored in the database.
- This would cause the `.eq('page_id', pageId)` filter in `leaveCurrentPage()` to not match any rows, resulting in no update.

**Code Evidence**: The `normalizeUrl()` function in `sidepanel.js` generates the `pageId` from the current URL. If URL normalization is inconsistent, different `pageId`s could be generated for the same logical page.

### Hypothesis 5: Tab Navigation Events Not Firing
**Likelihood**: Very Low  
**Reasoning**: Chrome's `chrome.tabs.onActivated` and `chrome.tabs.onUpdated` listeners are standard and reliable. However, if the user is navigating within the same tab (e.g., clicking a link), only `onUpdated` would fire, and if the URL doesn't change significantly (e.g., hash change only), `changeInfo.url` might be undefined, causing the logic to skip.

**Code Evidence**:
```javascript
// sidepanel.js - handleTabUpdate()
if (!changeInfo.url) {
  console.log('🔍 TAB_UPDATE: URL not changed, skipping presence update');
  return;
}
```

## Recommended Fixes

### Fix 1: Stop Heartbeat BEFORE Calling `leaveCurrentPage()`
**Priority**: **CRITICAL**  
**Implementation**:

In `realtime-presence-handler.js`, the `stop()` method should **clear the heartbeat interval FIRST**, then call `leaveCurrentPage()`. Currently, they may be out of order or racing.

```javascript
// realtime-presence-handler.js
async stop() {
  console.log('🛑 REALTIME_PRESENCE: Stopping');
  
  // CRITICAL FIX: Clear heartbeat FIRST to prevent race condition
  if (this.heartbeatInterval) {
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
    console.log('💓 REALTIME_PRESENCE: Heartbeat stopped');
  }
  
  // THEN mark user as inactive
  if (window.supabaseRealtimeClient && this.currentPageId) {
    console.log('🚪 REALTIME_PRESENCE: Marking user as inactive on old page...');
    await window.supabaseRealtimeClient.leaveCurrentPage();
  }
  
  this.currentPageId = null;
  this.currentPageUrl = null;
  
  console.log('✅ REALTIME_PRESENCE: Stopped');
}
```

### Fix 2: Add Mutex/Lock to Prevent Concurrent `updatePresence()` Calls
**Priority**: High  
**Implementation**:

Add a flag to prevent `updatePresence()` from running while `leaveCurrentPage()` is in progress.

```javascript
// supabase-realtime-client.js
class SupabaseRealtimeClient {
  constructor() {
    this.isLeavingPage = false; // NEW: Mutex flag
  }
  
  async updatePresence(pageId, pageUrl, auraColor = null) {
    // NEW: Skip if we're in the process of leaving
    if (this.isLeavingPage) {
      console.log('🔍 PRESENCE_UPDATE: Skipping - user is leaving page');
      return;
    }
    // ... rest of logic
  }
  
  async leaveCurrentPage() {
    this.isLeavingPage = true; // NEW: Set mutex
    // ... existing leave logic
    this.isLeavingPage = false; // NEW: Clear mutex
  }
}
```

### Fix 3: Enhanced Verification Logging (Already Implemented)
**Priority**: Medium  
**Status**: ✅ Already implemented in `2025-10-12-leavepage-verification` build

The verification query in `leaveCurrentPage()` will log if the database update succeeded:

```javascript
// CRITICAL: Verify the update worked by querying back
const { data: verifyData, error: verifyError } = await this.supabase
  .from('user_presence')
  .select('is_active, last_seen')
  .eq('user_email', this.currentUser.userEmail)
  .eq('page_id', pageId)
  .limit(1);

if (verifyData && verifyData.length > 0) {
  if (verifyData[0].is_active === false) {
    console.log('✅ LEAVE_PAGE: CONFIRMED - User is marked as inactive in database');
  } else {
    console.error('❌ LEAVE_PAGE: VERIFICATION FAILED - User is STILL marked as active!');
  }
}
```

**Action Required**: User must reload the extension and provide the `LEAVE_PAGE` logs when navigating between pages.

### Fix 4: Add Page Navigation Diagnostic Tool (TE2)
**Priority**: High  
**Status**: ✅ Implemented as `check-page-navigation.js`

This console-callable function (`checkPageNavigation()`) will:
1. Show the current user's `page_id` in Supabase vs. the extension's perceived `page_id`.
2. Show ALL active users in Supabase and their `page_id`s.
3. Compare Supabase data with backend API data.

**Usage**: User opens console in sidepanel and runs `checkPageNavigation()`.

## Next Steps for User

1. **Reload the extension** (to get the `2025-10-12-leavepage-verification` build with enhanced logging).
2. **Open the sidepanel** on one page (e.g., `chrome://extensions/?errors=...`).
3. **Navigate to a different page** (e.g., `https://www.google.com`).
4. **Open the console** and look for `🚪 LEAVE_PAGE:` logs to see if:
   - `leaveCurrentPage()` was called.
   - The database update succeeded.
   - The verification confirms `is_active: false`.
5. **Run `checkPageNavigation()`** in the console on BOTH profiles to see:
   - What `page_id` each profile thinks it's on (in the extension).
   - What `page_id` each profile is marked as active on in Supabase.
   - If there's a mismatch.
6. **Provide the logs** to the senior engineer for analysis.

## Test Infrastructure Recommendations (TE2)

1. **Console Function: `simulatePageLeave()`**
   - Manually calls `leaveCurrentPage()` and verifies the database update.
   - Checks if the heartbeat is still running after leave.

2. **Console Function: `checkHeartbeatStatus()`**
   - Shows if the heartbeat interval is currently active.
   - Shows the current `pageId` and `pageUrl` that the heartbeat is sending.

3. **Console Function: `forceStopPresence()`**
   - Manually stops the realtime presence handler.
   - Useful for testing the stop logic.

4. **Console Function: `compareSupabaseVsBackend()`**
   - Queries Supabase directly for active users.
   - Queries the backend API for active users.
   - Compares the results and highlights discrepancies.

## Conclusion

The most likely root cause is **Hypothesis 2**: a race condition where the heartbeat interval sends an `updatePresence()` call AFTER `leaveCurrentPage()` has set `is_active: false`, effectively re-activating the user on the old page.

**Recommended Immediate Fix**: Update `realtime-presence-handler.js` to clear the heartbeat interval BEFORE calling `leaveCurrentPage()`.

**Verification**: Use the enhanced logging in the `2025-10-12-leavepage-verification` build and the new `checkPageNavigation()` diagnostic tool to confirm the fix works.

---

**SD1 Sign-off**: Root cause analysis complete. Hypothesis and fix prioritized. Diagnostic tools provided for TE2 to verify and test.
