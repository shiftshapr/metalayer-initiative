# Cross-Page Visibility Bug - Fix Summary

**Date:** October 12, 2025  
**Build Version:** `2025-10-12-page-tracking-fix`  
**Agents:** SD1 (Senior Diagnostics), TE2 (Test Engineer)

---

## 🐛 Problem

Users on **different pages** were showing as "Online" in each other's visibility lists, instead of "Last Seen":
- User A on `chrome://extensions/`
- User B on `google.com`
- **Both** appearing in each other's visibility as "Online" on `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl`

---

## 🔍 Root Cause (SD1 Analysis)

The `handleTabChange()` and `handleTabUpdate()` functions in `presence/sidepanel.js` were calling `normalizeCurrentUrl()` which uses `chrome.tabs.query({ active: true, currentWindow: true })` to get the "active tab" URL.

**The Problem:**
1. Sidepanel extensions don't inherently belong to a specific tab
2. When a user switches tabs, the extension would query for the **current active tab** and update its state to match that tab
3. But the extension should track the **specific tab** from the event, not whatever is currently active
4. Result: Users would "leave" the wrong page and "join" the wrong page

**Example Failure Scenario:**
1. User opens sidepanel on Tab A (`chrome://extensions/`)
2. User switches to Tab B (`google.com`)
3. Background script sends `TAB_UPDATED` message with Tab B's URL
4. Sidepanel calls `leaveCurrentPage()` (correctly leaves old page ✅)
5. Sidepanel calls `normalizeCurrentUrl()` (queries active tab = Tab B ❌)
6. But what if there are multiple windows? Or the sidepanel is still "bound" to Tab A conceptually?
7. The extension's internal state (`currentPage`, `currentPageId`) becomes inconsistent

---

## 🔧 Solution

### Files Modified:

1. **`presence/sidepanel.js`**
   - Modified `handleTabUpdate()` to use the specific `url` parameter from the event
   - Modified `handleTabChange()` to use `chrome.tabs.get(tabId)` to get the specific tab's URL
   - Updated build version to `2025-10-12-page-tracking-fix`

2. **`presence/diagnose-page-tracking.js`** (NEW)
   - Comprehensive diagnostic tool for console debugging
   - Compares extension internal state vs. actual active tab vs. Supabase database

3. **`presence/sidepanel.html`**
   - Added script tag for `diagnose-page-tracking.js`

### Key Changes:

#### Before (WRONG):
```javascript
async function handleTabUpdate(tabId, url) {
  await window.supabaseRealtimeClient.leaveCurrentPage();
  await normalizeCurrentUrl(); // ❌ Queries active tab, not the tab from the event!
  await startPresenceTracking();
}
```

#### After (CORRECT):
```javascript
async function handleTabUpdate(tabId, url) {
  await window.supabaseRealtimeClient.leaveCurrentPage();
  const newUrlData = await window.normalizeUrl(url); // ✅ Use the SPECIFIC URL from the event
  window.currentUrlData = newUrlData; // Update global state
  await startPresenceTracking();
}
```

---

## 🧪 Testing & Diagnostics

### Console-Callable Functions (TE2):

Run these in the Chrome DevTools console when the sidepanel is open:

1. **`diagnosePageTracking()`**
   - Shows what the extension THINKS it's tracking
   - Shows what the user is ACTUALLY viewing (active tab)
   - Shows what's in Supabase for this user
   - Detects mismatches and explains why they exist

2. **`testPageTransition(newUrl)`**
   - Manually triggers a page transition
   - Example: `testPageTransition('https://example.com')`
   - Useful for testing the fix without actually switching tabs

3. **`checkAllTabs()`**
   - Lists all open tabs with their IDs and URLs
   - Highlights the active tab with 🟢

### Expected Behavior After Fix:

1. User A on `chrome://extensions/` opens sidepanel
2. User A switches to `google.com`
3. **BEFORE FIX:**
   - `handleTabUpdate()` would query active tab = `google.com` ✅
   - But extension might still update based on wrong context ❌
   - User A's presence in Supabase might not update correctly ❌
4. **AFTER FIX:**
   - `handleTabUpdate()` receives `url = "https://www.google.com/"` from event ✅
   - Calls `normalizeUrl(url)` with the SPECIFIC URL ✅
   - Updates `window.currentUrlData` to `google_com_` ✅
   - Starts tracking `google_com_` page ✅
   - User A's Supabase presence updates to `google_com_` ✅

---

## 📊 Verification Steps

1. **Reload the extension** in `chrome://extensions/`
2. Open the sidepanel on a test page (e.g., `chrome://extensions/`)
3. Open the Chrome DevTools console
4. Run `diagnosePageTracking()` - should show extension tracking the correct page
5. Switch to a different tab (e.g., `google.com`)
6. Wait 2 seconds for the `TAB_UPDATED` event to process
7. Run `diagnosePageTracking()` again - should show:
   - Extension now tracking `google_com_`
   - Old page (`chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl`) marked as inactive in Supabase
   - No mismatches detected
8. With two users on different pages, verify:
   - User A sees User B as "Last Seen" (not "Online")
   - User B sees User A as "Last Seen" (not "Online")
   - Backend API returns correct `page_id` for each user

---

## 📝 Related Documentation

- **SD1 Root Cause Analysis:** `SD1-PAGE-TRACKING-BUG-ANALYSIS.md`
- **Agent Memories:** Stored in JAUmemory with tags `["cross-page-visibility", "presence", "solution"]`
- **Agent Reflections:**
  - SD1: Learning reflection on tracking specific entities vs. global state
  - TE2: Collaboration reflection on diagnostic tools

---

## 🚀 Next Steps

1. User should reload the extension and test with two different profiles
2. If the issue persists, run `diagnosePageTracking()` and provide the console output
3. The diagnostic will show exactly where the mismatch is occurring

---

**Agents:**
- **SD1** (Senior Diagnostics): `bee3a327-33e6-4da4-8eca-a602faa00c46`
- **TE2** (Test Engineer): `95fc9aa7-b995-4aa4-91fc-575cad6328a0`



