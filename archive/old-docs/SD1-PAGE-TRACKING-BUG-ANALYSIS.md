# SD1: Root Cause Analysis - Cross-Page Visibility Bug

**Date:** October 12, 2025  
**Agent:** Senior Diagnostics (SD1)  
**Issue:** Users on different pages showing as "Online" instead of "Last Seen"

## 🔍 Problem Statement

When two users are on **different pages**:
- User A on `chrome://extensions/`
- User B on `google.com`

Both users appear in each other's visibility list as "Online" on the **same page** (`chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl`).

## 🎯 Root Cause

### **CRITICAL BUG: The sidepanel extension's internal state is NOT synchronized with the user's actual active tab.**

When a user switches tabs or navigates to a new URL, the following occurs:

1. **Background Script** (`background.js`) correctly detects the tab change/update via `chrome.tabs.onActivated` or `chrome.tabs.onUpdated`
2. **Background Script** sends a `TAB_CHANGED` or `TAB_UPDATED` message to the sidepanel
3. **Sidepanel** (`sidepanel.js`) receives the message and calls `handleTabChange()` or `handleTabUpdate()`
4. **BUG**: These handlers call `window.supabaseRealtimeClient.leaveCurrentPage()` which is supposed to mark the user as inactive on the **OLD** page
5. **BUT**: The `supabaseRealtimeClient.currentPage` is already pointing to the **OLD** page, so `leaveCurrentPage()` works correctly
6. **THEN**: The handlers call `normalizeCurrentUrl()` which uses `chrome.tabs.query({ active: true, currentWindow: true })` to get the **NEW** active tab URL
7. **PROBLEM**: The sidepanel extension doesn't track which tab is "its" tab - it just assumes the active tab is the one it should track
8. **RESULT**: If User A has the sidepanel open but switches to a different Chrome window or tab, the extension still updates `currentUrlData` to match whatever tab is **currently active in the current window**, even if that's not the tab the user is actually interacting with

### Secondary Issue: `normalizeCurrentUrl()` race condition

The `normalizeCurrentUrl()` function is called AFTER `leaveCurrentPage()`, which means:
1. We leave the old page ✅
2. We query for the new active tab URL
3. We normalize it
4. We start tracking the new page

But if the **extension doesn't know which tab it's actually tracking**, this whole flow breaks down.

## 💡 Hypothesis

The core issue is that the **sidepanel extension tracks presence based on the "active tab" concept**, but:
- The sidepanel itself is a separate UI that doesn't belong to any specific tab
- When a user switches tabs, Chrome doesn't automatically notify the sidepanel which tab it "should" track
- The extension tries to use `chrome.tabs.query({ active: true })` to figure this out, but this returns the active tab in the **current window**, not necessarily the tab the user wants to track

### Evidence from Logs

From `themetalayer@gmail.com` logs:
```
🌐 JOIN_PAGE: Page ID: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
🌐 JOIN_PAGE: Page URL: chrome://extensions/?errors=dbdjamnflfecdnioehkdmlhnmajffijl
```

This shows the extension correctly joined the `chrome://extensions/` page.

From Backend API response:
```json
{
  "active": [
    {
      "email": "daveroom@gmail.com",
      "pageId": "chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl",
      "isActive": true
    },
    {
      "email": "themetalayer@gmail.com",
      "pageId": "chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl",
      "isActive": true
    }
  ]
}
```

This shows the backend API returning **both** users as active on the **same page**, even though the user stated they were on **different pages**.

**Conclusion:** `daveroom@gmail.com` never properly left the `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl` page when they navigated to `google.com`.

## 🔧 Proposed Fixes

### Fix #1: Track Sidepanel-Specific Tab Association

Instead of using `chrome.tabs.query({ active: true })`, the extension should:
1. When the sidepanel is opened, capture the **current active tab** and store it as `window.trackedTabId`
2. When tab events occur, check if they're for `window.trackedTabId`
3. Only update presence if the event is for the tracked tab
4. If the user switches to a different tab, **update** `window.trackedTabId` to the new active tab

### Fix #2: Improve `handleTabChange()` and `handleTabUpdate()`

Current logic:
```javascript
async function handleTabChange(tabId) {
  await window.supabaseRealtimeClient.leaveCurrentPage(); // Leave OLD page
  await normalizeCurrentUrl(); // Get NEW active tab URL (WRONG!)
  await startPresenceTracking(); // Start tracking NEW page
}
```

**Problem:** `normalizeCurrentUrl()` queries the active tab, which might not be the tab we want to track.

**Fix:** Pass the `url` directly from the background script event:
```javascript
async function handleTabUpdate(tabId, url) {
  await window.supabaseRealtimeClient.leaveCurrentPage(); // Leave OLD page
  const newUrlData = await window.normalizeUrl(url); // Normalize the SPECIFIC URL
  window.currentUrlData = newUrlData; // Update global state
  await startPresenceTracking(); // Start tracking NEW page
}
```

### Fix #3: Enhanced Logging

Add logging to show:
1. What the extension **thinks** it's tracking (`currentPageId`, `currentPageUrl`)
2. What the user is **actually** viewing (active tab URL from Chrome API)
3. What's in Supabase for this user
4. Any mismatches between these states

This is implemented in the new `diagnose-page-tracking.js` diagnostic tool.

## 📊 Testing Plan (TE2)

1. **Scenario 1: Same Window, Different Tabs**
   - Open sidepanel on Tab A (`chrome://extensions/`)
   - Switch to Tab B (`google.com`) in the same window
   - Verify `leaveCurrentPage()` is called for Tab A
   - Verify presence is updated to Tab B

2. **Scenario 2: Different Windows**
   - Open sidepanel on Tab A in Window 1
   - Switch to Window 2 with Tab B
   - Verify sidepanel in Window 1 still tracks Tab A (not Tab B)

3. **Scenario 3: Multiple Users**
   - User A on `chrome://extensions/`
   - User B on `google.com`
   - Verify they do NOT appear in each other's visibility lists
   - Verify backend API returns correct `page_id` for each user

## 🚀 Implementation Priority

1. **CRITICAL**: Fix `handleTabUpdate()` to use the specific URL from the event, not `normalizeCurrentUrl()`
2. **HIGH**: Add diagnostic tool (`diagnose-page-tracking.js`) for console debugging
3. **MEDIUM**: Implement tab tracking (`window.trackedTabId`)
4. **LOW**: Add comprehensive logging throughout the presence system

## 📝 Related Files

- `/home/ubuntu/metalayer-initiative/presence/sidepanel.js` (handleTabChange, handleTabUpdate)
- `/home/ubuntu/metalayer-initiative/presence/background.js` (tab listeners)
- `/home/ubuntu/metalayer-initiative/presence/supabase-realtime-client.js` (leaveCurrentPage, currentPage)
- `/home/ubuntu/metalayer-initiative/presence/realtime-presence-handler.js` (currentPageId, currentPageUrl)



