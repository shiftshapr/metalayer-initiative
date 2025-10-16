# SD1 Analysis: Real-Time Event Not Firing for Inactive User
**Date:** October 13, 2025  
**Agent:** SD1 (Senior Diagnostics)  
**Issue:** Profile that doesn't move doesn't see that other profile has left

## Problem Statement

When User A (daveroom) moves to a different page, User B (themetalayer) who stays on the original page **does not receive a real-time update** showing that User A has left. User B continues to see User A as "Online for X minutes" instead of seeing the user removed or shown as "Last seen".

## Hypotheses

### Hypothesis 1: Real-Time Event Not Being Sent ❌
**Theory:** The `leaveCurrentPage()` function isn't successfully updating the database with `is_active: false`.

**Evidence Against:**
- Code shows verification query after UPDATE
- Logs show `✅ LEAVE_PAGE: CONFIRMED - User is marked as inactive in database`
- This was working in previous tests

**Likelihood:** Low (10%)

### Hypothesis 2: Real-Time Event Not Being Received ⚠️
**Theory:** The Supabase real-time subscription isn't receiving the UPDATE event when `is_active` changes from `true` to `false`.

**Evidence For:**
- Subscription is set up with `event: '*'` which should catch all events
- Filter is `page_id=eq.${pageId}` which should match
- But we need to verify events are actually arriving

**Likelihood:** Medium (40%)

### Hypothesis 3: Event Handler Not Processing Correctly ✅ MOST LIKELY
**Theory:** The `handlePresenceUpdate()` receives the event, but the callback chain isn't working properly to update the UI.

**Evidence For:**
- The code path is: `handlePresenceUpdate()` → `onUserUpdated()` → `handleUserUpdated()` in realtime-presence-handler.js
- The `handleUserUpdated()` function was just modified to remove inactive users
- BUT: The callbacks might not be properly wired up

**Likelihood:** High (50%)

## Root Cause Analysis

Looking at the code flow:

1. **User A leaves page** → `leaveCurrentPage()` called
2. **Database updated** → `user_presence` SET `is_active = false`
3. **Supabase sends event** → `postgres_changes` UPDATE event
4. **Subscription receives** → `handlePresenceUpdate(payload)` in `supabase-realtime-client.js`
5. **Callback invoked** → `this.onUserUpdated?.(newRecord)`
6. **Handler processes** → `handleUserUpdated(presenceRecord)` in `realtime-presence-handler.js`
7. **User removed** → Filter and update visibility list

**CRITICAL ISSUE:** The callbacks are set up in `realtime-presence-handler.js` `setupEventHandlers()`, but this is only called when `start()` is called. If the subscription is created BEFORE the handlers are set up, the callbacks will be `undefined`.

## Diagnostic Logging Needed

### 1. Verify Real-Time Event Arrival
Add logging to confirm events are being received:

```javascript
// In supabase-realtime-client.js - subscribeToPageUpdates()
.on('postgres_changes', 
  { event: '*', schema: 'public', table: 'user_presence', filter: `page_id=eq.${pageId}` },
  (payload) => {
    console.log('🔔🔔🔔 REALTIME_EVENT_ARRIVED: Presence event received!');
    console.log('🔔 Event type:', payload.eventType);
    console.log('🔔 User:', payload.new?.user_email || payload.old?.user_email);
    console.log('🔔 is_active changed:', payload.old?.is_active, '→', payload.new?.is_active);
    console.log('🔔 Timestamp:', new Date().toISOString());
    this.handlePresenceUpdate(payload);
  }
)
```

### 2. Verify Callback Registration
Add logging to confirm callbacks are set:

```javascript
// In realtime-presence-handler.js - setupEventHandlers()
setupEventHandlers() {
  console.log('🔌 REALTIME_PRESENCE: Setting up event handlers');
  console.log('🔌 supabaseRealtimeClient exists:', !!window.supabaseRealtimeClient);
  
  window.supabaseRealtimeClient.onUserUpdated = (presenceRecord) => {
    console.log('🔵🔵🔵 CALLBACK_INVOKED: onUserUpdated called!');
    console.log('🔵 User:', presenceRecord.user_email);
    console.log('🔵 is_active:', presenceRecord.is_active);
    this.handleUserUpdated(presenceRecord);
  };
  
  console.log('✅ REALTIME_PRESENCE: onUserUpdated callback registered');
  console.log('✅ Callback function:', typeof window.supabaseRealtimeClient.onUserUpdated);
}
```

### 3. Verify Handler Execution
Add logging at the start of `handleUserUpdated()`:

```javascript
async handleUserUpdated(presenceRecord) {
  console.log('🟦🟦🟦 HANDLER_ENTRY: handleUserUpdated ENTERED');
  console.log('🟦 User:', presenceRecord.user_email);
  console.log('🟦 is_active:', presenceRecord.is_active);
  console.log('🟦 Current page:', this.currentPageId);
  console.log('🟦 Event page:', presenceRecord.page_id);
  // ... rest of function
}
```

## Most Likely Fix

**Issue:** Callback registration timing

The problem is likely that `subscribeToPageUpdates()` is called in `joinPage()`, but the event handlers are set up in `realtime-presence-handler.js` `start()`. If these happen in the wrong order, the callbacks won't be registered when the subscription is created.

**Solution:** Ensure callbacks are registered BEFORE subscription is created:

```javascript
// In realtime-presence-handler.js - start()
async start(pageId, pageUrl) {
  console.log('🟢 REALTIME_PRESENCE: Starting for page:', pageId);
  
  await this.stop();
  
  this.currentPageId = pageId;
  this.currentPageUrl = pageUrl;
  this.isActive = true;
  
  // Set current user
  const userEmail = await window.getCurrentUserEmail();
  const userId = await window.getCurrentUserId();
  await window.supabaseRealtimeClient.setCurrentUser(userEmail, userId);
  
  // CRITICAL: Wire up event handlers BEFORE joining page
  this.setupEventHandlers();
  
  // Join page (this subscribes to real-time updates)
  await window.supabaseRealtimeClient.joinPage(pageId, pageUrl);
  
  // Start heartbeat
  this.startHeartbeat();
  
  // Load initial visibility
  await this.loadInitialVisibility();
}
```

## Testing Plan (TE2)

### Test 1: Verify Event Arrival
1. Open DevTools console for User B (stays on page)
2. User A leaves page
3. **Look for:** `🔔🔔🔔 REALTIME_EVENT_ARRIVED` log
4. **Expected:** Event should arrive within 100-500ms
5. **If missing:** Real-time subscription issue

### Test 2: Verify Callback Registration
1. Open DevTools console
2. Reload extension
3. **Look for:** `✅ REALTIME_PRESENCE: onUserUpdated callback registered`
4. **Run in console:** `typeof window.supabaseRealtimeClient.onUserUpdated`
5. **Expected:** Should return `"function"`
6. **If "undefined":** Callbacks not registered

### Test 3: Verify Handler Execution
1. User B stays on page
2. User A leaves page
3. **Look for:** `🟦🟦🟦 HANDLER_ENTRY: handleUserUpdated ENTERED`
4. **Expected:** Handler should be called
5. **If missing:** Callback chain broken

### Test 4: End-to-End
1. Both users on same page
2. Verify both see each other as "Online"
3. User A navigates away
4. **Expected:** User B sees User A removed within 1 second
5. **Console:** Should see full log chain from event arrival to UI update

## Console Diagnostic Functions

```javascript
// Check if callbacks are registered
console.log('Callbacks registered:', {
  onUserJoined: typeof window.supabaseRealtimeClient?.onUserJoined,
  onUserUpdated: typeof window.supabaseRealtimeClient?.onUserUpdated,
  onUserLeft: typeof window.supabaseRealtimeClient?.onUserLeft
});

// Check subscription status
console.log('Realtime status:', {
  isConnected: window.supabaseRealtimeClient?.isConnected,
  currentPage: window.supabaseRealtimeClient?.currentPage,
  activeChannels: Array.from(window.supabaseRealtimeClient?.channels?.keys() || [])
});

// Check handler status
console.log('Handler status:', {
  currentPageId: window.realtimePresenceHandler?.currentPageId,
  isActive: window.realtimePresenceHandler?.isActive
});

// Manually trigger a test update
window.supabaseRealtimeClient?.handlePresenceUpdate({
  eventType: 'UPDATE',
  new: {
    user_email: 'test@example.com',
    page_id: window.realtimePresenceHandler?.currentPageId,
    is_active: false,
    last_seen: new Date().toISOString()
  },
  old: {
    user_email: 'test@example.com',
    page_id: window.realtimePresenceHandler?.currentPageId,
    is_active: true,
    last_seen: new Date().toISOString()
  }
});
```

## Success Criteria

✅ Real-time events arrive within 500ms of database update  
✅ Callbacks are registered before subscription is created  
✅ Handler is invoked when event arrives  
✅ User is removed from visibility list  
✅ UI updates to reflect removal

---

**Next Steps:**
1. Add comprehensive diagnostic logging
2. Test event arrival and callback chain
3. Fix callback registration timing if needed
4. Verify end-to-end functionality


