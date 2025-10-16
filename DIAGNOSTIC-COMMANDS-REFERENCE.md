# Diagnostic Commands Reference Card

Quick reference for all available console diagnostic commands in the MetaLayer Chrome extension.

---

## 🔬 Real-Time Event Diagnostics

### WebSocket & Connection

```javascript
// Quick WebSocket health check (FAST)
quickWebSocketCheck()

// Trace ALL WebSocket messages for 60 seconds (KEY DIAGNOSTIC)
traceWebSocketMessages()

// Show all registered event handlers
inspectChannelBindings()
```

### Real-Time Broadcast Testing

```javascript
// Full diagnostic test with database update monitoring
checkRealtimeBroadcast()

// Send 5 rapid updates and count events received
stressTestRealtime()

// Check REPLICA IDENTITY setting (if RPC available)
checkReplicaIdentity()
```

### Real-Time Event Monitoring

```javascript
// Run full diagnostics suite
runDiagnostics()

// Check if callbacks are registered
checkCallbacks()

// Check presence handler status
checkHandler()

// Check visibility data
checkVisibility()

// Test inactive user event handling
testInactiveEvent()

// Monitor events for specified seconds
monitorEvents(60)

// Check both user profiles are active
checkBothProfiles()
```

---

## 🧪 Presence System Testing

### Page Tracking

```javascript
// Diagnose page tracking issues
diagnosePageTracking()

// Test for duplicate presence records
testDuplicatePresence()

// Check page transition cleanup
testPageTransitionCleanup()
```

### Presence Data

```javascript
// Check current presence data
checkPresenceData()

// Verify user visibility status
checkUserVisibility('user@example.com')
```

---

## 🔍 General Diagnostics

### System Status

```javascript
// Check authentication status
checkAuthStatus()

// Check Supabase client connection
checkSupabaseConnection()

// Check current page information
getCurrentPageInfo()
```

---

## 📊 Most Useful Commands (Quick Start)

### If real-time events aren't working:

1. **First:** Quick health check
   ```javascript
   quickWebSocketCheck()
   ```

2. **Then:** Trace messages (60 seconds)
   ```javascript
   traceWebSocketMessages()
   // While running, navigate to different page in other profile
   ```

3. **Check:** Event bindings
   ```javascript
   inspectChannelBindings()
   ```

4. **Test:** Full diagnostic
   ```javascript
   checkRealtimeBroadcast()
   ```

### If users aren't seeing each other:

1. **Check:** Both profiles active
   ```javascript
   checkBothProfiles()
   ```

2. **Check:** Page tracking
   ```javascript
   diagnosePageTracking()
   ```

3. **Check:** Presence data
   ```javascript
   checkPresenceData()
   ```

---

## 🎯 Diagnostic Flow Chart

```
Are real-time events being received?
│
├─ NO
│  │
│  ├─ Run: quickWebSocketCheck()
│  │  │
│  │  ├─ Socket NOT open
│  │  │  → Network/connection issue
│  │  │  → Reload extension, check Supabase Realtime enabled
│  │  │
│  │  └─ Socket IS open
│  │     │
│  │     ├─ Run: traceWebSocketMessages()
│  │     │  │
│  │     │  ├─ NO postgres_changes events
│  │     │  │  → REPLICA IDENTITY issue
│  │     │  │  → Run SQL fix
│  │     │  │
│  │     │  └─ YES postgres_changes events
│  │     │     → Callback issue
│  │     │     → Run: inspectChannelBindings()
│  │     │
│  │     └─ Run: checkRealtimeBroadcast()
│  │        → Full diagnostic with test update
│  │
│  └─ Run: checkBothProfiles()
│     → Verify both profiles are active
│
└─ YES
   │
   └─ Events working!
      → If still issues, check specific features
```

---

## 💡 Pro Tips

1. **Always reload extension** after making Supabase configuration changes
2. **Run diagnostics on BOTH profiles** to compare state
3. **Use `traceWebSocketMessages()` first** to see raw WebSocket traffic
4. **Check console for 🔔🔔🔔 REALTIME_EVENT_ARRIVED** to confirm events
5. **Use `checkBothProfiles()` often** to verify both profiles are truly active

---

## 📋 Files

Diagnostic tools are loaded from:
- `diagnose-realtime-events.js`
- `diagnose-realtime-subscription.js`
- `diagnose-realtime-broadcast.js`
- `trace-websocket-events.js`
- `diagnose-page-tracking.js`
- `comprehensive-realtime-diagnostics.js`

All automatically loaded when sidepanel opens.

---

---

## 🎯 Recent Success Story: user_visibility Fix

**Problem**: Users reported "Not seeing the websocket logs" and visibility list was empty/stale.

**Diagnostic Process**:
1. Ran `traceWebSocketMessages()` ✅
2. Tracer successfully intercepted WebSocket messages ✅
3. Revealed specific error from Supabase: `"Unable to subscribe to changes with given parameters... table: user_visibility"` ✅

**Root Cause**: The `user_visibility` table was never configured for Supabase Realtime:
- ❌ Missing `REPLICA IDENTITY FULL`
- ❌ Not added to `supabase_realtime` publication
- ❌ No RLS policy for SELECT

**Solution**: Created `FIX-USER-VISIBILITY-REALTIME.sql` with three fixes:
```sql
ALTER TABLE public.user_visibility REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_visibility;
CREATE POLICY "Allow authenticated users to read visibility"
  ON public.user_visibility FOR SELECT TO authenticated USING (true);
```

**Key Takeaway**: The WebSocket tracer revealed an error message that was **completely invisible** at the application level. This demonstrates the critical importance of protocol-level diagnostics.

**Files Created**:
- `FIX-USER-VISIBILITY-REALTIME.sql` - SQL fix script
- `SD1-TE2-USER-VISIBILITY-ROOT-CAUSE-OCT-13.md` - Technical analysis
- `USER-VISIBILITY-FIX-SUMMARY-OCT-13.md` - User-facing summary

---

**Last Updated:** October 13, 2025  
**Build:** 2025-10-13-websocket-tracer-fixed

