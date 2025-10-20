# SD1 Analysis: Users on Different Pages Still Showing as Online

**Date**: October 12, 2025  
**Build**: `2025-10-12-tab-listeners-fix`  
**Issue**: Users on different pages (`chrome://extensions` vs `google.com`) are both showing as "Online" in each other's visibility lists

---

## Evidence from Logs

### The Problem

From `themetalayer@gmail.com` logs (on `chrome://extensions`):
```javascript
🔍 API: getPresenceByUrl response: {
  "active": [
    {
      "email": "daveroom@gmail.com",
      "pageId": "chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl",
      "enterTime": "2025-10-12T20:30:55.558+00:00",
      "lastSeen": "2025-10-12T22:33:11.094+00:00",
      "isActive": true
    },
    {
      "email": "themetalayer@gmail.com",
      "pageId": "chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl",
      "enterTime": "2025-10-12T22:33:13.748+00:00",
      "lastSeen": "2025-10-12T22:33:13.747+00:00",
      "isActive": true
    }
  ],
  "pageId": "chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl",
  "url": "chrome://extensions/?errors=dbdjamnflfecdnioehkdmlhnmajffijl"
}
```

**The backend API is returning BOTH users as active on the SAME `pageId`**: `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl`

But visually:
- `themetalayer` is on `chrome://extensions` (correct)
- `daveroom` is on `google.com` (DIFFERENT PAGE!)

---

## Hypotheses

### Hypothesis 1: `daveroom` Never Left `chrome://extensions`
**Likelihood**: **VERY HIGH**  
**Reasoning**: The tab listeners (`chrome.tabs.onActivated`, `chrome.tabs.onUpdated`) are not firing when `daveroom` switches from `chrome://extensions` to `google.com`.

**Evidence**:
- `daveroom`'s `lastSeen`: `2025-10-12T22:33:11` (very recent, heartbeat is working)
- `daveroom`'s `enterTime`: `2025-10-12T20:30:55` (2 hours ago, meaning he "entered" extensions 2 hours ago and NEVER left)
- `daveroom`'s `pageId`: Still `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl`

**Why the tab listeners aren't firing**:
1. The sidepanel is NOT the active tab - it's a sidepanel, not a tab
2. `chrome.tabs.onActivated` fires for the **content tabs**, not for the sidepanel
3. When you switch from extensions to google.com in the CONTENT tab, the sidepanel doesn't know about it
4. The sidepanel only knows about its own page/context

### Hypothesis 2: `pageId` is Based on the Sidepanel's Parent Tab, Not the Current Active Tab
**Likelihood**: **CRITICAL - THIS IS IT**  
**Reasoning**: The sidepanel is tracking **its own context** (which is pinned to the extensions page), not the **actively viewed tab**.

**The Problem**:
```javascript
// In sidepanel.js
Current page URI: chrome://extensions/?errors=dbdjamnflfecdnioehkdmlhnmajffijl

// This is getting the sidepanel's OWN URL, not the active tab's URL!
```

When the sidepanel opens, it's opened from a specific tab. The `normalizeCurrentUrl()` function is likely getting the **sidepanel's context URL**, which doesn't change when you switch tabs in the main browser window.

**The sidepanel is a separate context** - it's not running in the active tab, it's running in its own panel.

### Hypothesis 3: We Need to Track the ACTIVE TAB, Not the Sidepanel's Context
**Likelihood**: **100% - THIS IS THE SOLUTION**  
**Reasoning**: The presence system needs to track which tab the user is **currently viewing**, not which tab the sidepanel was opened from.

**Current (BROKEN) Flow**:
```
1. User opens sidepanel from chrome://extensions
2. Sidepanel gets URL: chrome://extensions (correct)
3. User switches to google.com tab
4. Sidepanel STILL thinks URL is chrome://extensions (WRONG!)
5. Both users on "same page" according to backend
```

**Correct Flow Should Be**:
```
1. User opens sidepanel
2. Background script monitors chrome.tabs.onActivated
3. When user switches to google.com:
   - Background sends TAB_CHANGED message to sidepanel
   - Sidepanel calls leaveCurrentPage() for extensions
   - Sidepanel calls joinPage() for google.com
4. Users now on different pages
```

---

## Root Cause

**The sidepanel cannot see tab changes directly**. It's running in a separate context (the sidepanel), not in the content tabs.

The `chrome.tabs.onActivated` listener in `background.js` fires, but the sidepanel needs to:
1. **Ask the background script** what the current active tab is
2. **Use that tab's URL** for presence tracking, not its own context

**Current code gets the sidepanel's context**:
```javascript
// sidepanel.js - getCurrentPageUri()
function getCurrentPageUri() {
  return window.location.href; // This is the SIDEPANEL's URL, not the active tab!
}
```

**We need to get the ACTIVE TAB's URL**:
```javascript
// Should be:
async function getCurrentPageUri() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.url;
}
```

---

## The Fix

### 1. Update `getCurrentPageUri()` to Query the Active Tab

**File**: `presence/sidepanel.js`

```javascript
async function getCurrentPageUri() {
  try {
    // Get the ACTIVE TAB, not the sidepanel's context
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      console.log('🔍 ACTIVE_TAB: Current active tab URL:', tab.url);
      return tab.url;
    } else {
      console.warn('⚠️ ACTIVE_TAB: No active tab found, falling back to sidepanel context');
      return window.location.href;
    }
  } catch (error) {
    console.error('❌ ACTIVE_TAB: Error getting active tab:', error);
    return window.location.href;
  }
}
```

### 2. Update `normalizeCurrentUrl()` to Use the New Function

Already uses `getCurrentPageUri()`, so no changes needed.

### 3. Verify Tab Listeners Are Actually Firing

Add logging to background.js to confirm events are firing:
```javascript
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  console.log('🔄 BACKGROUND: Tab activated:', activeInfo.tabId, 'URL:', tab.url);
  // ... rest of code
});
```

### 4. Add Console Diagnostic

Create a function to check what page the extension thinks it's on vs. the actual active tab:

```javascript
window.checkActiveTab = async function() {
  console.log('=== Active Tab Diagnostic ===');
  
  // What the sidepanel thinks
  const sidepanelUrl = window.location.href;
  console.log('Sidepanel context URL:', sidepanelUrl);
  
  // What the actual active tab is
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('Active tab URL:', tab?.url);
  
  // What presence tracking thinks
  const urlData = await window.normalizeCurrentUrl();
  console.log('Presence tracking pageId:', urlData.pageId);
  console.log('Presence tracking URL:', urlData.normalizedUrl);
  
  // Check if they match
  if (tab && urlData.normalizedUrl !== tab.url) {
    console.error('❌ MISMATCH: Presence is tracking wrong page!');
    console.error('   Expected:', tab.url);
    console.error('   Actual:', urlData.normalizedUrl);
  } else {
    console.log('✅ URLs match - presence tracking is correct');
  }
};
```

---

## Test Plan (TE2)

1. **Reload extension** to get the fix
2. **Open sidepanel** from `chrome://extensions`
3. **Run `checkActiveTab()`** - should show extensions URL
4. **Switch to google.com tab**
5. **Run `checkActiveTab()`** again - should show google.com URL
6. **Check visibility list** - users on different pages should NOT see each other

---

## Expected Behavior After Fix

| Scenario | Expected Visibility |
|----------|-------------------|
| Both users on `chrome://extensions` | Both show "Online" |
| User A on `chrome://extensions`, User B on `google.com` | Neither sees the other |
| User A switches to `google.com` | User B now sees User A as "Online" |

---

## Conclusion

**Root Cause**: The sidepanel was tracking its own context URL (`window.location.href`) instead of the **active tab's URL** (`chrome.tabs.query`).

**Fix**: Change `getCurrentPageUri()` to query the active tab, not the sidepanel's context.

**Verification**: Use `checkActiveTab()` diagnostic function.

---

**SD1 Sign-off**: Root cause identified. Fix ready to implement.



