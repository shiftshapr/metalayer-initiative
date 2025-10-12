# Presence Flow & Logging Guide
**Complete explanation of how presence works and how to debug it**

---

## 🔄 **Flow 1: Extension Reload & Sidebar Open**

### What Happens Step-by-Step:

```
1. User reloads extension & opens sidebar
   ↓
2. DOMContentLoaded event fires (sidepanel.js:6243)
   ↓
3. Initialize Supabase real-time client
   LOG: "🚀 INIT: Initializing Supabase real-time client..."
   ↓
4. Initialize authentication
   LOG: "Starting auth manager initialization..."
   ↓
5. Wait for user to authenticate (if not already)
   LOG: "Auth state changed: SIGNED_IN {user}"
   ↓
6. Load communities (sidepanel.js:6333)
   LOG: "🔍 INIT: Loading communities..."
   ↓
7. Start presence tracking (2 second delay - sidepanel.js:6364)
   LOG: "🔍 INIT: Timeout executed - about to call startPresenceTracking()"
   ↓
8. startPresenceTracking() → realtimePresenceHandler.start()
   LOG: "🟢 REALTIME_PRESENCE: Starting for page: {pageId}"
   ↓
9. Set current user
   LOG: "👤 Current user set: {email}"
   ↓
10. Join page (supabase-realtime-client.js:63)
    LOG: "🌐 JOIN_PAGE: === STARTING JOIN PAGE ==="
    ↓
11. Update presence in database
    LOG: "🌐 JOIN_PAGE: Step 1 - Updating presence in database..."
    LOG: "🔍 PRESENCE_UPDATE: === STARTING PRESENCE UPDATE ==="
    ↓
12. INSERT/UPDATE in user_presence table
    LOG: "🔍 PRESENCE_UPDATE: Is new session: true"
    LOG: "🔍 PRESENCE_UPDATE: Setting enter_time (NEW SESSION)"
    LOG: "✅ Presence updated for page: {pageId}"
    ↓
13. Subscribe to real-time updates
    LOG: "🌐 JOIN_PAGE: Step 2 - Subscribing to real-time updates..."
    LOG: "📡 SUBSCRIBE: === STARTING SUBSCRIPTION SETUP ==="
    ↓
14. Create WebSocket channel
    LOG: "📡 SUBSCRIBE: Creating channel: page-{pageId}"
    ↓
15. Set up 3 subscriptions:
    - user_presence (presence changes)
    - messages (new messages)
    - user_visibility (visibility changes)
    ↓
16. Wait for subscription confirmation
    LOG: "📡 SUBSCRIBE_STATUS: Subscription status changed: SUBSCRIBED"
    LOG: "✅ SUBSCRIBE_STATUS: Successfully subscribed to real-time updates"
    ↓
17. Start heartbeat (every 5 seconds)
    LOG: "💓 REALTIME_PRESENCE: Starting heartbeat (every 5s)"
    ↓
18. ✅ READY - Now listening for changes!
    LOG: "✅ JOIN_PAGE: === COMPLETED JOIN PAGE ==="
    LOG: "✅ JOIN_PAGE: Now listening for presence/message changes on page: {pageId}"
```

### 📊 Key Logs to Watch:

**✅ Success indicators:**
```
✅ SUBSCRIBE_STATUS: Successfully subscribed to real-time updates
✅ JOIN_PAGE: === COMPLETED JOIN PAGE ===
✅ Presence updated for page: {pageId}
💓 HEARTBEAT: Sent via Supabase real-time
```

**❌ Error indicators:**
```
❌ JOIN_PAGE: No current user set - cannot join page
❌ SUBSCRIBE_STATUS: Channel error - subscription failed
❌ PRESENCE_UPDATE: Supabase client not initialized
```

---

## 🔄 **Flow 2: Page/Tab Change**

### What Happens Step-by-Step:

```
1. User navigates to new page/tab
   ↓
2. Chrome fires TAB_CHANGED or TAB_UPDATED message
   LOG: "Tab changed to: {tabId}" or "Tab updated: {tabId}"
   ↓
3. handleTabChange() or handleTabUpdate() called
   LOG: "🔄 TAB_CHANGE: === HANDLING TAB CHANGE ==="
   ↓
4. CRITICAL: Leave current page FIRST
   LOG: "🚪 TAB_CHANGE: Leaving current page before switching..."
   ↓
5. leaveCurrentPage() → Mark as inactive
   LOG: "🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ==="
   LOG: "🚪 LEAVE_PAGE: Leaving page: {oldPageId}"
   ↓
6. UPDATE user_presence SET is_active=false
   LOG: "🚪 LEAVE_PAGE: Step 1 - Marking user as inactive in database..."
   LOG: "✅ LEAVE_PAGE: Marked {email} as inactive on {oldPageId}"
   ↓
7. Unsubscribe from old page's channel
   LOG: "🚪 LEAVE_PAGE: Step 2 - Unsubscribing from page channel..."
   LOG: "✅ LEAVE_PAGE: Unsubscribed from channel: page-{oldPageId}"
   ↓
8. ✅ Left old page
   LOG: "✅ LEAVE_PAGE: === COMPLETED LEAVE PAGE ==="
   ↓
9. Normalize new URL
   LOG: "🔄 TAB_CHANGE: URL normalized for new tab"
   ↓
10. Join new page (same flow as extension reload)
    LOG: "🌐 JOIN_PAGE: === STARTING JOIN PAGE ==="
    ↓
11. Update presence for new page
    LOG: "🔍 PRESENCE_UPDATE: Is new session: true" (or false if returning)
    ↓
12. Subscribe to new page's updates
    LOG: "📡 SUBSCRIBE: === STARTING SUBSCRIPTION SETUP ==="
    ↓
13. ✅ READY on new page
    LOG: "✅ TAB_CHANGE: Tab change complete"
```

### 📊 Key Logs to Watch:

**✅ Success indicators:**
```
✅ LEAVE_PAGE: === COMPLETED LEAVE PAGE ===
✅ JOIN_PAGE: === COMPLETED JOIN PAGE ===
✅ TAB_CHANGE: Tab change complete
```

**❌ Error indicators:**
```
❌ TAB_CHANGE: Error handling tab change: {error}
⚠️ LEAVE_PAGE: No active channel found for page: {pageId}
```

---

## 🎯 **Answering Your Questions**

### Q1: "When I reload the extension and open the sidebar, does it immediately send a presence event on the page and subscribe to that page?"

**A: YES, but with a 2-second delay!**

**Timeline:**
- `T+0ms`: Extension loaded, sidebar opened
- `T+0ms - T+2000ms`: Authentication + communities load
- `T+2000ms`: `startPresenceTracking()` called
- `T+2000ms - T+2500ms`: Presence INSERT + channel subscription
- `T+2500ms`: ✅ Subscribed and listening

**Logs you'll see:**
```
🚀 INIT: Initializing Supabase real-time client...
🔍 INIT: Loading communities...
🔍 INIT: Timeout executed - about to call startPresenceTracking()
🟢 REALTIME_PRESENCE: Starting for page: {pageId}
🌐 JOIN_PAGE: === STARTING JOIN PAGE ===
🌐 JOIN_PAGE: Step 1 - Updating presence in database...
✅ Presence updated for page: {pageId}
🌐 JOIN_PAGE: Step 2 - Subscribing to real-time updates...
📡 SUBSCRIBE: === STARTING SUBSCRIPTION SETUP ===
📡 SUBSCRIBE_STATUS: Successfully subscribed to real-time updates
✅ JOIN_PAGE: === COMPLETED JOIN PAGE ===
```

---

### Q2: "When I change pages, does it remove or update the subscription to the previous page and reset to the new page?"

**A: YES - It does BOTH:**

1. **Removes old subscription**
   ```
   🚪 LEAVE_PAGE: Step 2 - Unsubscribing from page channel...
   ✅ LEAVE_PAGE: Unsubscribed from channel: page-{oldPageId}
   ```

2. **Marks you inactive on old page**
   ```
   🚪 LEAVE_PAGE: Step 1 - Marking user as inactive in database...
   ✅ LEAVE_PAGE: Marked {email} as inactive on {oldPageId}
   ```

3. **Creates new subscription for new page**
   ```
   📡 SUBSCRIBE: Creating channel: page-{newPageId}
   ✅ SUBSCRIBE_STATUS: Successfully subscribed to real-time updates
   ```

4. **Marks you active on new page**
   ```
   🔍 PRESENCE_UPDATE: Is new session: true
   ✅ Presence updated for page: {newPageId}
   ```

**This prevents "ghost presence"** - you immediately disappear from the old page and appear on the new page!

---

### Q3: "Does it tell Supabase that I am no longer on the previous page?"

**A: YES! Two ways:**

1. **Explicit EXIT (immediate)**
   ```sql
   UPDATE user_presence 
   SET is_active = false, last_seen = NOW()
   WHERE user_email = 'you@example.com' AND page_id = 'old_page';
   ```
   - Happens in `leaveCurrentPage()`
   - Takes ~50-200ms
   - Other users immediately see you leave via `postgres_changes` event

2. **Unsubscribe from channel**
   ```javascript
   await supabase.removeChannel(oldChannel);
   ```
   - Closes WebSocket connection for that page
   - No longer receives updates from old page

**Logs:**
```
🚪 LEAVE_PAGE: Step 1 - Marking user as inactive in database...
✅ LEAVE_PAGE: Marked you@example.com as inactive on old_page_id
✅ LEAVE_PAGE: Database UPDATE sent - other users will receive postgres_changes event
🚪 LEAVE_PAGE: Step 2 - Unsubscribing from page channel...
✅ LEAVE_PAGE: Unsubscribed from channel: page-old_page_id
```

---

## 🐛 **How to Debug Issues**

### Issue: "User not appearing in visibility list"

**Check these logs in order:**

1. **Was presence UPDATE sent?**
   ```
   LOOK FOR: "✅ Presence updated for page: {pageId}"
   IF MISSING: Presence not sent to database
   ```

2. **Was subscription created?**
   ```
   LOOK FOR: "✅ SUBSCRIBE_STATUS: Successfully subscribed to real-time updates"
   IF MISSING: WebSocket subscription failed
   ```

3. **What page IDs are involved?**
   ```
   LOOK FOR: 
   "🌐 JOIN_PAGE: Page ID: {pageId}"
   "🔍 PRESENCE_UPDATE: Page: {pageId}"
   
   VERIFY: Both users have SAME pageId
   IF DIFFERENT: URL normalization issue
   ```

4. **Is the user marked as active?**
   ```
   LOOK FOR: "🔍 PRESENCE_UPDATE: Is new session: true"
   IF FALSE: User returning to page (enter_time preserved)
   ```

---

### Issue: "Ghost presence (user still visible on old page)"

**Check these logs:**

1. **Was leaveCurrentPage() called?**
   ```
   LOOK FOR: "🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ==="
   IF MISSING: Page exit not triggered
   ```

2. **Was database updated?**
   ```
   LOOK FOR: "✅ LEAVE_PAGE: Marked {email} as inactive on {pageId}"
   IF MISSING: Database UPDATE failed
   ```

3. **Did other users receive the UPDATE event?**
   ```
   ON OTHER USER'S CONSOLE:
   LOOK FOR: "👁️ REALTIME_EVENT: Presence update received"
             "👁️ REALTIME_EVENT: Event type: UPDATE"
   IF MISSING: Supabase not broadcasting
   ```

---

### Issue: "Real-time updates not working"

**Check these logs:**

1. **Is WebSocket connected?**
   ```
   LOOK FOR: "📡 SUBSCRIBE_STATUS: Successfully subscribed"
   IF MISSING: Check for network/firewall issues
   ```

2. **Are events being received?**
   ```
   LOOK FOR: "👁️ REALTIME_EVENT: Presence update received"
             "💬 REALTIME_EVENT: New message received"
   IF MISSING: No events from Supabase (check Supabase dashboard)
   ```

3. **Are channels active?**
   ```
   LOOK FOR: "✅ SUBSCRIBE: Active channels: [...]"
   SHOULD SEE: Array with current pageId
   IF EMPTY: No active subscriptions
   ```

---

## 📝 **Complete Log Legend**

### Initialization Logs:
| Log | Meaning |
|-----|---------|
| `🚀 INIT:` | Initialization step |
| `🔍 INIT:` | Initialization detail |
| `✅ INIT:` | Initialization success |
| `❌ INIT:` | Initialization failure |

### Presence Logs:
| Log | Meaning |
|-----|---------|
| `🟢 REALTIME_PRESENCE:` | Presence handler action |
| `🔍 PRESENCE_UPDATE:` | Presence database operation |
| `🌐 JOIN_PAGE:` | Joining a page |
| `🚪 LEAVE_PAGE:` | Leaving a page |
| `💓 HEARTBEAT:` | Heartbeat pulse (every 5s) |

### Subscription Logs:
| Log | Meaning |
|-----|---------|
| `📡 SUBSCRIBE:` | Subscription setup |
| `📡 SUBSCRIBE_STATUS:` | Subscription status change |
| `👁️ REALTIME_EVENT:` | Real-time event received |
| `💬 REALTIME_EVENT:` | Message event received |

### Tab Navigation Logs:
| Log | Meaning |
|-----|---------|
| `🔄 TAB_CHANGE:` | Tab change handling |
| `🔄 TAB_UPDATE:` | Tab update handling |

### Status Indicators:
| Symbol | Meaning |
|--------|---------|
| `✅` | Success / Completed |
| `❌` | Error / Failed |
| `⚠️` | Warning / Potential issue |
| `🔍` | Debug detail |
| `📊` | Data/statistics |

---

## 🧪 **Testing Commands**

```javascript
// Check current state
window.realtimeDiagnostics.fullReport()

// Check if subscribed
window.realtimeDiagnostics.testSubscriptions()

// Verify no polling
window.testPollingRemoval.runTests()

// Check active channels
console.log('Active channels:', Array.from(window.supabaseRealtimeClient.channels.keys()))

// Check current page
console.log('Current page:', window.supabaseRealtimeClient.currentPage)

// Check current user
console.log('Current user:', window.supabaseRealtimeClient.currentUser)

// Manual leave page
await window.supabaseRealtimeClient.leaveCurrentPage()

// Manual join page
await window.realtimePresenceHandler.start('test_page_id', 'test_url')
```

---

## ✅ **What You Should See on Success**

### On Extension Load:
```
🚀 INIT: Initializing Supabase real-time client...
✅ INIT: Supabase real-time client initialized
🔍 INIT: Loading communities...
🔍 INIT: Timeout executed - about to call startPresenceTracking()
🟢 REALTIME_PRESENCE: Starting for page: chrome_extensions_errors_...
🌐 JOIN_PAGE: === STARTING JOIN PAGE ===
✅ Presence updated for page: chrome_extensions_errors_...
📡 SUBSCRIBE_STATUS: Successfully subscribed to real-time updates
✅ JOIN_PAGE: === COMPLETED JOIN PAGE ===
💓 HEARTBEAT: Sent via Supabase real-time (every 5s)
```

### On Page Change:
```
🔄 TAB_CHANGE: === HANDLING TAB CHANGE ===
🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ===
✅ LEAVE_PAGE: Marked you@example.com as inactive on old_page
✅ LEAVE_PAGE: Unsubscribed from channel: page-old_page
✅ LEAVE_PAGE: === COMPLETED LEAVE PAGE ===
🌐 JOIN_PAGE: === STARTING JOIN PAGE ===
✅ Presence updated for page: new_page
📡 SUBSCRIBE_STATUS: Successfully subscribed to real-time updates
✅ JOIN_PAGE: === COMPLETED JOIN PAGE ===
✅ TAB_CHANGE: Tab change complete
```

---

**With this logging, you can now track every step of the presence system and diagnose any issues!**

