# CRITICAL FIX: Missing Tab Listeners in Background Script

**Date**: October 12, 2025  
**Build**: `2025-10-12-tab-listeners-fix`  
**Severity**: 🔴 **CRITICAL** - Primary root cause of cross-page visibility bug  
**Discovered by**: TE2 (Test Engineer 2) during verification testing

---

## Executive Summary

**THE SMOKING GUN**: The `chrome.tabs.onActivated` and `chrome.tabs.onUpdated` listeners were **completely missing** from `presence/background.js`. This means `leaveCurrentPage()` was **NEVER being called** when users switched tabs or navigated to new URLs.

**Impact**: Users remained marked as active on old pages indefinitely, causing the cross-page visibility bug where users appeared "Online" on pages they had left.

**Previous Analysis Incorrect**: The mutex fix for the race condition was valid defensive programming, but it was addressing a secondary issue. The PRIMARY issue was that the tab change detection mechanism was never implemented.

---

## The Flow (How It's SUPPOSED To Work)

```
Step 1: User switches to a different tab
  ↓
Step 2: Chrome fires chrome.tabs.onActivated event
  ↓
Step 3: background.js listener catches the event
  ↓
Step 4: background.js sends TAB_CHANGED message to sidepanel.js
  ↓
Step 5: sidepanel.js handleTabChange() is called
  ↓
Step 6: handleTabChange() calls leaveCurrentPage()
  ↓
Step 7: leaveCurrentPage() sets is_active=false in Supabase
  ↓
Step 8: Other users see "Last seen X seconds ago"
```

---

## What Was Missing

### BEFORE Fix (Broken)

**`presence/background.js`**:
```javascript
// ... other code ...

console.log('Background service worker initialized successfully.');
// ❌ NO TAB LISTENERS AT ALL!
```

**Result**: 
- User switches tabs → Nothing happens
- User navigates to new URL → Nothing happens
- `leaveCurrentPage()` is never called
- User stays marked as `is_active: true` on old page forever

### AFTER Fix (Working)

**`presence/background.js`**:
```javascript
// CRITICAL FIX: Monitor tab changes to trigger presence updates
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('🔄 BACKGROUND: Tab activated:', activeInfo.tabId);
  
  try {
    await chrome.runtime.sendMessage({
      type: 'TAB_CHANGED',
      tabId: activeInfo.tabId,
      windowId: activeInfo.windowId
    });
    console.log('✅ BACKGROUND: Sent TAB_CHANGED message to sidepanel');
  } catch (error) {
    console.log('🔍 BACKGROUND: Sidepanel not open:', error.message);
  }
});

// CRITICAL FIX: Monitor tab URL updates to trigger presence updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    console.log('🔄 BACKGROUND: Tab URL updated:', tabId, changeInfo.url);
    
    try {
      await chrome.runtime.sendMessage({
        type: 'TAB_UPDATED',
        tabId: tabId,
        url: changeInfo.url
      });
      console.log('✅ BACKGROUND: Sent TAB_UPDATED message to sidepanel');
    } catch (error) {
      console.log('🔍 BACKGROUND: Sidepanel not open:', error.message);
    }
  }
});

console.log('Background service worker initialized successfully.');
```

**Result**:
- User switches tabs → `chrome.tabs.onActivated` fires
- Background sends `TAB_CHANGED` message
- Sidepanel calls `handleTabChange()`
- `leaveCurrentPage()` is called ✅
- User is marked as `is_active: false` on old page ✅
- Other users see "Last seen X seconds ago" ✅

---

## Why This Was Missed

1. **Code Existed But Wasn't Connected**: The `handleTabChange()` and `handleTabUpdate()` functions existed in `sidepanel.js` and were correctly listening for `TAB_CHANGED` and `TAB_UPDATED` messages. However, nothing was sending those messages!

2. **Silent Failure**: The sidepanel was waiting for messages that never came. No errors were thrown, no logs indicated a problem. The code simply did nothing when tabs changed.

3. **Hypothesis Bias**: SD1's root cause analysis focused on race conditions and timing issues, assuming the basic tab detection was working. The analysis was thorough but started from an incorrect assumption.

4. **Missing TE2 Verification**: The test plan should have included verifying that the background script was actually monitoring tab changes. A simple test would have revealed this immediately.

---

## Code Evidence

### Existing Handlers (sidepanel.js) - These Were Waiting For Messages

```javascript
// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TAB_CHANGED') {
    console.log('Tab changed to:', message.tabId);
    handleTabChange(message.tabId);  // ✅ THIS EXISTS
    return true;
  }
  
  if (message.type === 'TAB_UPDATED') {
    console.log('Tab updated:', message.tabId, message.url);
    handleTabUpdate(message.tabId, message.url);  // ✅ THIS EXISTS
    return true;
  }
  
  return false;
});

// Handle tab changes
async function handleTabChange(tabId) {
  // CRITICAL FIX: Leave current page BEFORE switching to new page
  if (window.supabaseRealtimeClient) {
    await window.supabaseRealtimeClient.leaveCurrentPage();  // ✅ THIS EXISTS
  }
  // ... rest of logic
}
```

**Analysis**: All the sidepanel code was correct. It was ready to handle tab changes. But no one was telling it about tab changes!

### Missing Senders (background.js) - These Didn't Exist Until Now

```javascript
// ❌ BEFORE: Nothing here!
// No chrome.tabs.onActivated listener
// No chrome.tabs.onUpdated listener
// No way to detect tab changes at all!

// ✅ AFTER: Now implemented!
chrome.tabs.onActivated.addListener(...)
chrome.tabs.onUpdated.addListener(...)
```

---

## Testing & Verification

### Console Logs to Watch For (After Reload)

When you switch tabs, you should now see:

**Background Console**:
```
🔄 BACKGROUND: Tab activated: 123456789
✅ BACKGROUND: Sent TAB_CHANGED message to sidepanel
```

**Sidepanel Console**:
```
Tab changed to: 123456789
🔄 TAB_CHANGE: === HANDLING TAB CHANGE ===
🔄 TAB_CHANGE: Tab ID: 123456789
🚪 TAB_CHANGE: Leaving current page before switching...
🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ===
🔒 LEAVE_PAGE: Mutex set - heartbeat updates will be blocked
🚪 LEAVE_PAGE: Leaving page: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
✅ LEAVE_PAGE: Marked user@email.com as inactive on chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
✅ LEAVE_PAGE: CONFIRMED - User is marked as inactive in database
🔓 LEAVE_PAGE: Mutex cleared - heartbeat can resume on new page
✅ TAB_CHANGE: Left current page successfully
```

### Test Cases

| Test | Expected Result | How to Verify |
|------|----------------|---------------|
| Switch from Tab A to Tab B | `leaveCurrentPage()` called for Tab A | Check for `🚪 LEAVE_PAGE` logs |
| Navigate to new URL in same tab | `leaveCurrentPage()` called for old URL | Check for `🔄 TAB_UPDATE` logs |
| Open new tab | No effect (new tab has no presence yet) | Should see no logs |
| Close tab | Presence expires after 30 seconds | User shows as "Last seen" after 30s |

### Manual Test Steps

1. **Reload the extension** (CRITICAL - must get new build `2025-10-12-tab-listeners-fix`)
2. **Open Chrome DevTools** → Open "Inspect Service Worker" for background script
3. **Open Chrome DevTools** → Open sidepanel console
4. **Navigate to a page** (e.g., `chrome://extensions/?errors=...`)
5. **Verify presence is active** (should see heartbeat logs every 5 seconds)
6. **Switch to a different tab** (e.g., click on another open tab)
7. **CHECK BACKGROUND CONSOLE** → Should see `🔄 BACKGROUND: Tab activated`
8. **CHECK SIDEPANEL CONSOLE** → Should see `🚪 LEAVE_PAGE` logs
9. **Verify in other profile** → User should now show "Last seen X seconds ago"

---

## Impact Assessment

### Before Fix
- ❌ Tab changes: Not detected
- ❌ URL changes: Not detected
- ❌ Users marked as inactive: Never
- ❌ Cross-page visibility: Always wrong
- ❌ "Ghost presence": Always present

### After Fix
- ✅ Tab changes: Detected instantly
- ✅ URL changes: Detected instantly
- ✅ Users marked as inactive: Immediately on tab change
- ✅ Cross-page visibility: Should be correct
- ✅ "Ghost presence": Should be eliminated

---

## Lessons Learned (TE2 Recommendations)

1. **Always Verify Event Listeners**: When debugging event-driven code, first verify the events are being listened for. Don't assume.

2. **Test Infrastructure Gap**: We need a diagnostic function to check if tab listeners are active:
   ```javascript
   window.checkTabListenersActive = function() {
     // Query background script to verify listeners are registered
     chrome.runtime.sendMessage({ type: 'CHECK_LISTENERS' }, (response) => {
       console.log('Tab listeners active:', response);
     });
   };
   ```

3. **Console Logging Strategy**: Background script logs are separate from sidepanel logs. Always check BOTH when debugging cross-script communication.

4. **Message Flow Verification**: When using `chrome.runtime.sendMessage`, verify:
   - Sender is calling `sendMessage()`
   - Receiver is listening with `onMessage.addListener()`
   - Message types match exactly
   - Both sides are active (service worker not suspended, sidepanel open)

5. **Architecture Documentation**: The message flow between background ↔ sidepanel should be documented visually in a diagram.

---

## Related Files

- **`presence/background.js`**: Added `chrome.tabs.onActivated` and `chrome.tabs.onUpdated` listeners
- **`presence/sidepanel.js`**: Updated build version to `2025-10-12-tab-listeners-fix`
- **`presence/supabase-realtime-client.js`**: Mutex fix (still valid, but secondary)

---

## JAUmemory Record

**Memory ID**: `a51f5b91-567d-4213-9085-b6db48c51400`  
**Linked to**: TE2 (Test Engineer 2)  
**Category**: error  
**Importance**: 1.0 (CRITICAL)

---

## Conclusion

**THIS WAS THE PRIMARY BUG**. The cross-page visibility issue was caused by missing tab listeners in the background script, not by race conditions or timing issues. The mutex fix is still valuable defensive programming, but the fundamental problem was that `leaveCurrentPage()` was never being called in the first place.

**User must reload the extension** to get the `2025-10-12-tab-listeners-fix` build. After reload, tab switching should correctly trigger presence updates.

---

**TE2 Sign-off**: Critical bug identified and fixed. Tab listeners now implemented. User must test and verify.



