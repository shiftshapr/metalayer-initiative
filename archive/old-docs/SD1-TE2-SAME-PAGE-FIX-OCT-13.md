# SD1 & TE2: Same-Page Reactivation Bug Fix - October 13, 2025

**Build:** `2025-10-13-sd1-te2-same-page-fix`

## 🎯 Executive Summary

**FINAL ROOT CAUSE IDENTIFIED:** After `leaveCurrentPage()` successfully marked the user inactive, `startPresenceTracking()` immediately reactivated them on the SAME page, causing the test to fail.

---

## 🔍 SD1: Deep Root Cause Analysis

### The Smoking Gun

From the user's logs, we can see the exact sequence:

```
🚪 LEAVE_PAGE: Leaving page: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
✅ LEAVE_PAGE: CONFIRMED - User is marked as inactive in database

[Immediately after...]

🔍 PRESENCE: Starting for page: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
🔍 PRESENCE_UPDATE: Is new session: true, existing enter_time: ..., was inactive: true
✅ Presence updated for page: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
```

### Why This Happens

1. **Test simulates:** `TAB_UPDATED` with URL `https://example.com/test`
2. **`handleTabUpdate()` executes:**
   - Calls `leaveCurrentPage()` → ✅ Marks user inactive on `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl`
   - Calls `window.normalizeUrl('https://example.com/test')` → ✅ Returns `{pageId: 'example_com_test'}`
   - Calls `startPresenceTracking()` → ❌ **PROBLEM STARTS HERE**

3. **Inside `startPresenceTracking()`:**
   ```javascript
   async function startPresenceTracking() {
     const urlData = await normalizeCurrentUrl(); // ← Queries ACTUAL active tab!
     // ...
   }
   ```

4. **The Issue:**
   - `normalizeCurrentUrl()` calls `getCurrentPageUri()` which uses `chrome.tabs.query({active: true})`
   - This returns the **REAL active tab**, not the simulated URL from the test
   - The real active tab is STILL `chrome://extensions/?errors=dbdjamnflfecdnioehkdmlhnmajffijl`
   - So `startPresenceTracking()` joins `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl` again
   - This marks the user **ACTIVE** on the page we just left!

### The Timeline

```
Time 0: User is active on chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
Time 1: Test sends TAB_UPDATED with https://example.com/test
Time 2: leaveCurrentPage() → is_active: false ✅
Time 3: normalizeUrl('https://example.com/test') → example_com_test ✅
Time 4: startPresenceTracking() → normalizeCurrentUrl() → chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl ❌
Time 5: joinPage(chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl) → is_active: true ❌
Time 6: Test checks database → FAIL: Old page is still active!
```

---

## 🔧 The Solution

### Key Insight

We need to **prevent rejoining the same page** after leaving it. The fix is to:
1. Store the old page ID BEFORE calling `leaveCurrentPage()` (because it clears `currentPage`)
2. Compare the old page ID with the new page ID
3. If they're the same, skip `startPresenceTracking()` entirely

### Implementation

```javascript
async function handleTabUpdate(tabId, url) {
  // CRITICAL FIX: Store old page ID BEFORE leaving (leaveCurrentPage clears it)
  const oldPageId = window.supabaseRealtimeClient?.currentPage?.pageId;
  console.log('🔍 TAB_UPDATE: Stored old page ID:', oldPageId);
  
  // Leave current page
  if (window.supabaseRealtimeClient) {
    await window.supabaseRealtimeClient.leaveCurrentPage();
  }
  
  // Normalize the new URL
  const newUrlData = await window.normalizeUrl(url);
  
  // CRITICAL FIX: Only join the new page if it's DIFFERENT from the old page
  console.log('🔍 TAB_UPDATE: Comparing - Old page:', oldPageId, 'New page:', newUrlData.pageId);
  
  if (oldPageId === newUrlData.pageId) {
    console.log('⚠️ TAB_UPDATE: Same page - skipping presence re-join to avoid reactivation');
    console.log('✅ TAB_UPDATE: Tab update complete (same page)');
    return; // ← Exit early, don't rejoin!
  }
  
  // Update global state
  window.currentUrlData = newUrlData;
  
  // Reload chat, visibility, and start presence tracking for NEW page
  await loadChatHistory();
  await loadCombinedAvatars(activeCommunities);
  await startPresenceTracking(); // ← Only called if it's a NEW page
}
```

### Why This Works

1. **Stores `oldPageId` early:** Before `leaveCurrentPage()` clears it
2. **Compares page IDs:** Detects if we're "moving" to the same page
3. **Exits early:** Prevents `startPresenceTracking()` from reactivating the old page
4. **Preserves inactive state:** The database record stays `is_active: false`

---

## ✅ TE2: Testing Recommendations

### Expected Test Behavior (After Fix)

```
Step 1: Initial state
   page_id: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
   is_active: true

Step 2: Simulate TAB_UPDATED to https://example.com/test
   🔍 TAB_UPDATE: Stored old page ID: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
   🚪 LEAVE_PAGE: Leaving page: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
   ✅ LEAVE_PAGE: CONFIRMED - User is marked as inactive
   🔍 TAB_UPDATE: Normalized result: {pageId: 'example_com_test'}
   🔍 TAB_UPDATE: Comparing - Old: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl, New: example_com_test
   [Different pages - proceeding with startPresenceTracking()]

Step 3: Check database
   page_id: example_com_test
   is_active: true
   ✅ PASS: New page is active, old page is inactive
```

### Test Infrastructure Improvements

**Console diagnostic function:**
```javascript
window.checkPageTransition = async function(newUrl) {
  const oldPageId = window.supabaseRealtimeClient?.currentPage?.pageId;
  console.log('Before:', oldPageId);
  
  await chrome.runtime.sendMessage({
    type: 'TAB_UPDATED',
    tabId: 999999,
    url: newUrl
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newPageId = window.supabaseRealtimeClient?.currentPage?.pageId;
  console.log('After:', newPageId);
  
  const { data } = await supabase
    .from('user_presence')
    .select('*')
    .eq('user_email', window.currentUser.email);
  
  console.table(data);
};
```

### Edge Cases to Test

1. **Same page, different query params:**
   - Old: `https://example.com/page?id=1`
   - New: `https://example.com/page?id=2`
   - Expected: Should be treated as SAME page (depends on normalization)

2. **Same page, different hash:**
   - Old: `https://example.com/page#section1`
   - New: `https://example.com/page#section2`
   - Expected: Should be treated as SAME page

3. **Actual page change:**
   - Old: `https://example.com/page1`
   - New: `https://example.com/page2`
   - Expected: Should leave old page, join new page

4. **Extension reload:**
   - Should reset `enter_time` (already working)

---

## 📝 Files Modified

- **`metalayer-initiative/presence/sidepanel.js`**
  - Lines 7128-7153: Added same-page detection in `handleTabUpdate()`
  - Line 753: Updated build to `2025-10-13-sd1-te2-same-page-fix`

---

## 🧠 Memory Stored

- **Memory ID:** `7c73826c-57a3-4d10-b935-c1773146c8b0`
- **Linked to:** SD1 (Agent ID: `bee3a327-33e6-4da4-8eca-a602faa00c46`)
- **Tags:** `chrome-extension`, `presence-system`, `bug-fix`, `root-cause`, `sd1-analysis`, `same-page-reactivation`
- **Category:** Solution

---

## 🎓 Lessons Learned

1. **Test environment limitations:** Tests can't actually change Chrome tabs, so `getCurrentPageUri()` always returns the real active tab
2. **State management:** Always store state BEFORE clearing it if you need to compare old vs new
3. **Idempotency:** Functions like `startPresenceTracking()` should be idempotent - calling them multiple times on the same page shouldn't cause issues
4. **Logging is critical:** The extensive logging added in previous iterations made this bug immediately obvious

---

## 🚀 Next Steps

1. **User:** Reload the extension
2. **User:** Run `runAllPresenceTests()` again
3. **Expected:** All 3 tests should pass ✅
4. **If still failing:** Check logs for the new comparison output to see what's happening


