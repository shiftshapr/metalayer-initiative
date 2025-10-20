# Diagnostic Logging Implementation Summary
**Date:** October 13, 2025  
**Build:** 2025-10-13-realtime-diagnostic-logging  
**Status:** ✅ READY TO TEST

## Problem

User reported that when one profile moves to a different page, the profile that stays behind **does not see that the other profile has left**. The inactive user should be removed from visibility or shown as "Last seen", but instead continues to show as "Online".

## SD1 Analysis

### Root Cause Hypotheses

1. **Real-Time Event Not Being Sent** (10% likely) - Database update fails
2. **Real-Time Event Not Being Received** (40% likely) - Supabase subscription not working
3. **Event Handler Not Processing Correctly** (50% likely) - Callback chain broken

### Most Likely Issue

The callbacks (`onUserUpdated`, etc.) may not be properly registered when the subscription is created, causing events to arrive but not be processed.

## Solution: Comprehensive Diagnostic Logging

Added extensive logging at every step of the real-time event flow to identify exactly where the chain breaks.

### Logging Chain

```
1. 🔔 REALTIME_EVENT_ARRIVED
   ↓ Event received from Supabase
   ↓ Location: supabase-realtime-client.js (line 370)
   
2. 🔔 Callback registered check
   ↓ Verifies onUserUpdated exists
   ↓ Location: supabase-realtime-client.js (line 377)
   
3. 🔔 HANDLE_PRESENCE_UPDATE
   ↓ Processing event type (INSERT/UPDATE/DELETE)
   ↓ Location: supabase-realtime-client.js (line 440)
   
4. 🔵 CALLBACK_INVOKED: onUserUpdated
   ↓ Callback function called
   ↓ Location: realtime-presence-handler.js (line 108)
   
5. 🟦 HANDLER_ENTRY: handleUserUpdated
   ↓ Handler function entered
   ↓ Location: realtime-presence-handler.js (line 305)
   
6. 🚪 HANDLE_UPDATE: USER BECAME INACTIVE
   ↓ User removal logic executed
   ↓ Location: realtime-presence-handler.js (line 390)
   
7. ✅ UI Updated
   ↓ Visibility list refreshed
   ↓ User removed from display
```

## Files Modified

### 1. supabase-realtime-client.js (lines 360-385)
**Added:** Comprehensive logging when real-time events arrive

```javascript
.on('postgres_changes', { ... }, (payload) => {
  console.log('🔔🔔🔔 REALTIME_EVENT_ARRIVED: Presence event received!');
  console.log('🔔 Event type:', payload.eventType);
  console.log('🔔 is_active changed:', payload.old?.is_active, '→', payload.new?.is_active);
  console.log('🔔 Callback registered:', typeof this.onUserUpdated);
  // ... more logging
});
```

### 2. realtime-presence-handler.js (lines 83-134)
**Added:** Detailed callback registration logging

```javascript
setupEventHandlers() {
  console.log('🔌🔌🔌 SETUP_HANDLERS: Registering event callbacks');
  
  window.supabaseRealtimeClient.onUserUpdated = (presenceRecord) => {
    console.log('🔵🔵🔵 CALLBACK_INVOKED: onUserUpdated called!');
    console.log('🔵 User:', presenceRecord.user_email);
    console.log('🔵 is_active:', presenceRecord.is_active);
    this.handleUserUpdated(presenceRecord);
  };
  
  console.log('✅ SETUP_HANDLERS: onUserUpdated registered');
  console.log('🔍 Callback type:', typeof window.supabaseRealtimeClient.onUserUpdated);
}
```

### 3. realtime-presence-handler.js (lines 302-325)
**Added:** Handler entry point logging

```javascript
async handleUserUpdated(presenceRecord) {
  console.log('🟦🟦🟦 HANDLER_ENTRY: handleUserUpdated ENTERED');
  console.log('🟦 User:', presenceRecord.user_email);
  console.log('🟦 is_active:', presenceRecord.is_active);
  console.log('🟦 Current page:', this.currentPageId);
  // ... rest of function
}
```

### 4. diagnose-realtime-events.js (NEW FILE)
**Created:** Console diagnostic functions

```javascript
// Check callback registration
window.checkCallbacks()

// Check handler status
window.checkHandler()

// Check visibility data
window.checkVisibility()

// Simulate inactive event
window.testInactiveEvent()

// Monitor events for 30 seconds
window.monitorEvents(30)

// Run all diagnostics
window.runDiagnostics()
```

## Testing Instructions (TE2)

### Step 1: Reload Extension
```
1. Reload the extension in Chrome
2. Open sidepanel on both profiles
3. Check console for: "✅ Real-Time Event Diagnostics loaded"
```

### Step 2: Run Diagnostics
```
In console, run:
runDiagnostics()

Expected output:
- ✅ Callbacks registered (all should be "function")
- ✅ Handler active
- ✅ Visibility data present
```

### Step 3: Test Real-Time Events
```
1. Both profiles on same page (e.g., google.com)
2. Profile B: Run monitorEvents(30) in console
3. Profile A: Navigate to different page
4. Profile B: Watch console for event chain
```

### Expected Console Output (Profile B)

When Profile A leaves:

```
🔔🔔🔔 REALTIME_EVENT_ARRIVED: Presence event received!
🔔 Event type: UPDATE
🔔 User: daveroom@gmail.com
🔔 is_active changed: true → false
🔔 Callback registered: function
🔔 Now calling handlePresenceUpdate()...

🔵🔵🔵 CALLBACK_INVOKED: onUserUpdated called!
🔵 User: daveroom@gmail.com
🔵 is_active: false

🟦🟦🟦 HANDLER_ENTRY: handleUserUpdated ENTERED
🟦 User: daveroom@gmail.com
🟦 is_active: false

🚪🚪🚪 HANDLE_UPDATE: USER BECAME INACTIVE ON THIS PAGE
🚪 HANDLE_UPDATE: User left the page - REMOVING from visibility list
✅ HANDLE_UPDATE: Removed inactive user from visibility (2 → 1)
```

### Step 4: Identify Issue

**If you see:**
- ✅ `REALTIME_EVENT_ARRIVED` → Event is arriving from Supabase
- ❌ No `CALLBACK_INVOKED` → Callbacks not registered properly
- ❌ No `HANDLER_ENTRY` → Callback chain broken
- ❌ No `USER BECAME INACTIVE` → Handler not processing correctly

## Diagnostic Scenarios

### Scenario 1: No Events Arriving
**Symptoms:** No `🔔 REALTIME_EVENT_ARRIVED` logs

**Possible Causes:**
- Supabase subscription not created
- Wrong page_id filter
- Database update failed

**Debug:**
```javascript
checkCallbacks()
// Check: activeChannels should show current page
```

### Scenario 2: Events Arrive But No Callback
**Symptoms:** `🔔 REALTIME_EVENT_ARRIVED` but no `🔵 CALLBACK_INVOKED`

**Possible Causes:**
- Callbacks registered after subscription created
- Callbacks overwritten

**Debug:**
```javascript
checkCallbacks()
// Check: onUserUpdated should be "function", not "undefined"
```

### Scenario 3: Callback Fires But Handler Doesn't Run
**Symptoms:** `🔵 CALLBACK_INVOKED` but no `🟦 HANDLER_ENTRY`

**Possible Causes:**
- Error in callback function
- Handler not properly bound

**Debug:**
Check console for JavaScript errors

### Scenario 4: Handler Runs But User Not Removed
**Symptoms:** `🟦 HANDLER_ENTRY` but no `🚪 USER BECAME INACTIVE`

**Possible Causes:**
- Page ID mismatch
- is_active not false
- Visibility data missing

**Debug:**
```javascript
checkVisibility()
// Check: User should be in active list before removal
```

## Console Functions Reference

| Function | Purpose |
|----------|---------|
| `runDiagnostics()` | Run full diagnostic check |
| `checkCallbacks()` | Verify callbacks are registered |
| `checkHandler()` | Check handler status and page |
| `checkVisibility()` | View current visibility data |
| `testInactiveEvent()` | Simulate user becoming inactive |
| `monitorEvents(30)` | Watch for events for 30 seconds |

## Success Criteria

✅ Real-time events arrive within 500ms  
✅ Callbacks are registered before subscription  
✅ Handler processes events correctly  
✅ Users are removed from visibility when inactive  
✅ Full event chain visible in console logs

## Next Steps

1. **Reload extension** to get new build
2. **Run `runDiagnostics()`** to verify setup
3. **Test with two profiles** moving between pages
4. **Watch console logs** to identify where chain breaks
5. **Report findings** with specific log output

---

**Build:** 2025-10-13-realtime-diagnostic-logging  
**Files Modified:**
- `presence/supabase-realtime-client.js` (lines 360-385)
- `presence/realtime-presence-handler.js` (lines 83-134, 302-325)
- `presence/sidepanel.js` (line 753)
- `presence/diagnose-realtime-events.js` (NEW)
- `presence/sidepanel.html` (added script tag)

**Related Documents:**
- SD1-REALTIME-EVENT-NOT-FIRING-OCT-13.md
- COMPLETE-PRESENCE-FIX-OCT-13.md

**JAUmemory:** Solution stored (ID: be17a4c8-5969-4a0a-b4d8-14a98071e8a9)  
**Linked to:** SD1, TE2


