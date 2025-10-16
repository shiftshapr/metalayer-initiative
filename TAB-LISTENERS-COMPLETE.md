# Complete Tab Listeners Implementation

**Date**: October 12, 2025  
**Build**: `2025-10-12-tab-listeners-fix`

## Summary

Added **THREE critical tab listeners** to `presence/background.js` that were completely missing:

1. ✅ **`chrome.tabs.onActivated`** - Fires when user switches to a different tab
2. ✅ **`chrome.tabs.onUpdated`** - Fires when user navigates to a new URL in the same tab
3. ✅ **`chrome.tabs.onRemoved`** - Fires when user closes a tab

All three now trigger `leaveCurrentPage()` to mark the user as inactive on the old page.

---

## The Three Listeners

### 1. Tab Switch Detection (`chrome.tabs.onActivated`)

**When it fires**: User clicks on a different tab or uses keyboard shortcuts (Cmd+Tab, Ctrl+Tab)

**What it does**:
```javascript
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Send TAB_CHANGED message to sidepanel
  // → handleTabChange() is called
  // → leaveCurrentPage() is called
  // → User is marked inactive on old tab
});
```

**Example scenario**:
- User is on `chrome://extensions` (Tab A)
- User clicks on `https://google.com` tab (Tab B)
- `onActivated` fires → User marked as inactive on Tab A
- User starts presence tracking on Tab B

---

### 2. URL Change Detection (`chrome.tabs.onUpdated`)

**When it fires**: User navigates to a new URL within the same tab (clicking links, address bar, etc.)

**What it does**:
```javascript
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {  // Only fire on URL changes
    // Send TAB_UPDATED message to sidepanel
    // → handleTabUpdate() is called
    // → leaveCurrentPage() is called
    // → User is marked inactive on old URL
  }
});
```

**Example scenario**:
- User is on `https://github.com/repo1`
- User clicks link to `https://github.com/repo2`
- `onUpdated` fires with `changeInfo.url = "https://github.com/repo2"`
- User marked as inactive on repo1
- User starts presence tracking on repo2

**Important**: Only fires when `changeInfo.url` is present (ignores loading state, favicon changes, etc.)

---

### 3. Tab Close Detection (`chrome.tabs.onRemoved`)

**When it fires**: User closes a tab (clicks X, uses Cmd+W, etc.)

**What it does**:
```javascript
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  // Send TAB_CLOSED message to sidepanel
  // → handleTabClosed() is called
  // → leaveCurrentPage() is called
  // → User is marked inactive on closed tab
});
```

**Example scenario**:
- User is on `https://example.com` in Tab A
- User closes Tab A
- `onRemoved` fires → User marked as inactive on example.com
- Presence tracking stops for that tab

**Note**: `removeInfo.isWindowClosing` is `true` if the entire window is closing (not just one tab)

---

## Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                              │
└──┬───────────────────┬───────────────────┬──────────────────┘
   │                   │                   │
   │ Switch Tab        │ Navigate URL      │ Close Tab
   │                   │                   │
   ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│                 CHROME EVENTS                                 │
│  onActivated         onUpdated           onRemoved            │
└──┬───────────────────┬───────────────────┬──────────────────┘
   │                   │                   │
   │ activeInfo        │ changeInfo.url    │ tabId, removeInfo
   │                   │                   │
   ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│         BACKGROUND.JS (presence/background.js)                │
│  Listener 1          Listener 2          Listener 3           │
└──┬───────────────────┬───────────────────┬──────────────────┘
   │                   │                   │
   │ TAB_CHANGED       │ TAB_UPDATED       │ TAB_CLOSED
   │ message           │ message           │ message
   │                   │                   │
   ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│          SIDEPANEL.JS (presence/sidepanel.js)                 │
│  onMessage listener receives all three message types          │
└──┬───────────────────┬───────────────────┬──────────────────┘
   │                   │                   │
   │ handleTabChange() │ handleTabUpdate() │ handleTabClosed()
   │                   │                   │
   └───────────────────┴───────────────────┴──────────────────┐
                                                                │
                         All three call:                        │
                                                                ▼
                    ┌────────────────────────────────────────────┐
                    │  leaveCurrentPage()                        │
                    │  (supabase-realtime-client.js)             │
                    └──────────────────┬─────────────────────────┘
                                       │
                                       ▼
                    ┌────────────────────────────────────────────┐
                    │  UPDATE user_presence                      │
                    │  SET is_active = false                     │
                    │  WHERE user_email = ... AND page_id = ...  │
                    └────────────────────────────────────────────┘
```

---

## Code Implementation

### Background Script (presence/background.js)

```javascript
// 1. Tab switch detection
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

// 2. URL change detection
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

// 3. Tab close detection
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  console.log('🔄 BACKGROUND: Tab closed:', tabId, 'Window closing:', removeInfo.isWindowClosing);
  
  try {
    await chrome.runtime.sendMessage({
      type: 'TAB_CLOSED',
      tabId: tabId,
      isWindowClosing: removeInfo.isWindowClosing
    });
    console.log('✅ BACKGROUND: Sent TAB_CLOSED message to sidepanel');
  } catch (error) {
    console.log('🔍 BACKGROUND: Sidepanel not open:', error.message);
  }
});
```

### Sidepanel Script (presence/sidepanel.js)

```javascript
// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TAB_CHANGED') {
    handleTabChange(message.tabId);
    return true;
  }
  
  if (message.type === 'TAB_UPDATED') {
    handleTabUpdate(message.tabId, message.url);
    return true;
  }
  
  if (message.type === 'TAB_CLOSED') {
    handleTabClosed(message.tabId);
    return true;
  }
  
  return false;
});

// Handler functions
async function handleTabChange(tabId) {
  console.log('🔄 TAB_CHANGE: === HANDLING TAB CHANGE ===');
  if (window.supabaseRealtimeClient) {
    await window.supabaseRealtimeClient.leaveCurrentPage();
  }
  // ... start tracking new tab
}

async function handleTabUpdate(tabId, url) {
  console.log('🔄 TAB_UPDATE: === HANDLING TAB UPDATE ===');
  if (window.supabaseRealtimeClient) {
    await window.supabaseRealtimeClient.leaveCurrentPage();
  }
  // ... start tracking new URL
}

async function handleTabClosed(tabId) {
  console.log('🔄 TAB_CLOSED: === HANDLING TAB CLOSURE ===');
  if (window.supabaseRealtimeClient) {
    await window.supabaseRealtimeClient.leaveCurrentPage();
  }
}
```

---

## Testing Each Listener

### Test 1: Tab Switch (`onActivated`)

**Steps**:
1. Open extension sidepanel
2. Navigate to `chrome://extensions`
3. Open another tab (e.g., `https://google.com`)
4. Switch back to first tab (click on `chrome://extensions` tab)
5. Check console logs

**Expected logs**:
```
Background console:
  🔄 BACKGROUND: Tab activated: 123456
  ✅ BACKGROUND: Sent TAB_CHANGED message to sidepanel

Sidepanel console:
  Tab changed to: 123456
  🔄 TAB_CHANGE: === HANDLING TAB CHANGE ===
  🚪 TAB_CHANGE: Leaving current page before switching...
  🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ===
  ✅ LEAVE_PAGE: CONFIRMED - User is marked as inactive in database
  ✅ TAB_CHANGE: Left current page successfully
```

---

### Test 2: URL Navigation (`onUpdated`)

**Steps**:
1. Open extension sidepanel
2. Navigate to `https://github.com`
3. In the same tab, navigate to `https://google.com` (using address bar)
4. Check console logs

**Expected logs**:
```
Background console:
  🔄 BACKGROUND: Tab URL updated: 123456 https://google.com
  ✅ BACKGROUND: Sent TAB_UPDATED message to sidepanel

Sidepanel console:
  Tab updated: 123456 https://google.com
  🔄 TAB_UPDATE: === HANDLING TAB UPDATE ===
  🚪 TAB_UPDATE: Leaving current page before URL change...
  🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ===
  ✅ LEAVE_PAGE: CONFIRMED - User is marked as inactive in database
  ✅ TAB_UPDATE: Left current page successfully
```

---

### Test 3: Tab Close (`onRemoved`)

**Steps**:
1. Open extension sidepanel
2. Navigate to `https://example.com`
3. Close the tab (Cmd+W or click X)
4. Check console logs

**Expected logs**:
```
Background console:
  🔄 BACKGROUND: Tab closed: 123456 Window closing: false
  ✅ BACKGROUND: Sent TAB_CLOSED message to sidepanel

Sidepanel console:
  Tab closed: 123456
  🔄 TAB_CLOSED: === HANDLING TAB CLOSURE ===
  🚪 TAB_CLOSED: Leaving page from closed tab...
  🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ===
  ✅ LEAVE_PAGE: CONFIRMED - User is marked as inactive in database
  ✅ TAB_CLOSED: Tab closure handled successfully
```

---

## Why Each Listener is Important

| Listener | Why It's Critical | What Happens Without It |
|----------|------------------|------------------------|
| `onActivated` | Detects tab switches | User stays active on old tab when they switch tabs |
| `onUpdated` | Detects URL changes | User stays active on old URL when navigating in same tab |
| `onRemoved` | Detects tab closes | User stays active on closed tab until 30-second timeout |

**All three were missing before**, which is why users were appearing "stuck" on old pages!

---

## Edge Cases Handled

1. **Sidepanel not open**: All listeners use `try-catch` and log gracefully if sidepanel isn't open
2. **Window closing**: `onRemoved` includes `isWindowClosing` flag to detect full window closure
3. **Multiple rapid changes**: Mutex in `leaveCurrentPage()` prevents race conditions
4. **Non-URL updates**: `onUpdated` only fires when `changeInfo.url` exists (ignores loading, favicon, etc.)

---

## Summary

**Before**: 0 tab listeners, `leaveCurrentPage()` never called, users stuck on old pages  
**After**: 3 tab listeners, `leaveCurrentPage()` called on every tab event, users correctly marked inactive

**You must reload the extension** to get these fixes!

---

**Files Modified**:
- `presence/background.js` - Added all 3 listeners
- `presence/sidepanel.js` - Added `handleTabClosed()` function



