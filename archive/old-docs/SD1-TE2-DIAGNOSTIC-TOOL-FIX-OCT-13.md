# SD1 + TE2: Diagnostic Tool Fix and Enhanced WebSocket Tracing

**Date:** October 13, 2025  
**Build:** `2025-10-13-replica-identity-fix` (updated)  
**Agents:** SD1 (System Diagnostics), TE2 (Test Engineering)

---

## Issue: Diagnostic Tool Error

### Problem
User ran `checkRealtimeBroadcast()` and got:
```
TypeError: client.getChannel is not a function
```

### Root Cause (SD1 Analysis)
The diagnostic function was calling `client.getChannel()`, but this method doesn't exist in the `SupabaseRealtimeClient` class.

**Actual API:**
- Channels are stored in a `Map`: `client.channels`
- To get a channel: `client.channels.get(pageId)`

### Fix Applied
```javascript
// BEFORE (broken)
const channel = client.getChannel();

// AFTER (fixed)
const pageId = currentPage.pageId;
const channel = client.channels.get(pageId);
```

---

## Enhanced Diagnostic Tools (TE2)

### New Tool: WebSocket Event Tracer

Created `trace-websocket-events.js` with three powerful diagnostic functions:

#### 1. `quickWebSocketCheck()`
**Purpose:** Instant health check of WebSocket connection

**What it checks:**
- ✅ Channel exists
- ✅ Channel state
- ✅ Socket connection state
- ✅ Socket is OPEN

**Usage:**
```javascript
quickWebSocketCheck()
```

**Output (if working):**
```
✅ Channel state: joined
✅ Socket state: open
✅ WebSocket is OPEN and connected
```

**Output (if broken):**
```
❌ WebSocket is NOT open!
   Current state: closed
```

---

#### 2. `traceWebSocketMessages()`
**Purpose:** Intercept and log ALL WebSocket messages for 60 seconds

**What it does:**
- Intercepts the underlying Phoenix WebSocket `onmessage` handler
- Logs EVERY message received from Supabase
- Highlights messages relevant to current page
- Specifically flags `postgres_changes` events
- Provides summary after 60 seconds

**Usage:**
```javascript
traceWebSocketMessages()
// Wait 60 seconds while monitoring
// Perform database update to trigger event
```

**What to look for:**
```
📨 WEBSOCKET MESSAGE #X
───────────────────────────────────────────────────────────
📨 Topic: realtime:page-chrome_extensions_errors_...
📨 Event: postgres_changes
🎯 RELEVANT MESSAGE FOR CURRENT PAGE!
🔔🔔🔔 THIS IS A POSTGRES_CHANGES EVENT! 🔔🔔🔔
```

**If NO messages:**
```
❌❌❌ NO WebSocket messages received at all!
🔧 DIAGNOSIS: WebSocket connection issue
```

**If NO relevant messages:**
```
❌❌❌ NO relevant messages for your page!
🔧 DIAGNOSIS: Supabase is NOT broadcasting events
   - This confirms REPLICA IDENTITY issue
```

---

#### 3. `inspectChannelBindings()`
**Purpose:** Show all registered event handlers on the channel

**What it shows:**
- Total number of event bindings
- Type of each binding (e.g., `postgres_changes`)
- Filter for each binding
- Whether callback exists

**Usage:**
```javascript
inspectChannelBindings()
```

**Output:**
```
📊 Channel topic: page-chrome_extensions_errors_...
📊 Channel state: joined

📋 Event bindings registered:
───────────────────────────────────────────────────────────
📊 Total bindings: 3

📌 Binding #1:
   Type: postgres_changes
   Event: *
   Filter: page_id=eq.chrome_extensions_errors_...
   Callback exists: true

📌 Binding #2:
   Type: postgres_changes
   Event: INSERT
   Filter: page_id=eq.chrome_extensions_errors_...
   Callback exists: true

🔍 postgres_changes bindings: 3
✅ postgres_changes bindings exist
```

---

## Diagnostic Strategy (SD1 + TE2)

### Three Scenarios for "No Events Received"

#### Scenario 1: WebSocket Connection Issue
**Symptoms:**
- `quickWebSocketCheck()` shows socket NOT open
- `traceWebSocketMessages()` shows ZERO messages

**Diagnosis:** Network/connection problem

**Fix:**
1. Check network connectivity
2. Check Supabase Dashboard → Settings → API → Realtime enabled
3. Reload extension

---

#### Scenario 2: Supabase Not Broadcasting (REPLICA IDENTITY)
**Symptoms:**
- ✅ `quickWebSocketCheck()` shows socket OPEN
- ✅ `traceWebSocketMessages()` shows messages (heartbeats, etc.)
- ❌ `traceWebSocketMessages()` shows NO `postgres_changes` events

**Diagnosis:** Backend configuration issue - REPLICA IDENTITY

**Fix:**
```sql
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
```

**This is the MOST LIKELY scenario based on user's symptoms.**

---

#### Scenario 3: Events Received But Not Processed
**Symptoms:**
- ✅ `quickWebSocketCheck()` shows socket OPEN
- ✅ `traceWebSocketMessages()` shows `postgres_changes` events
- ❌ Still no callback execution (no 🔔 REALTIME_EVENT_ARRIVED logs)

**Diagnosis:** Client-side callback issue

**Fix:**
1. Run `inspectChannelBindings()` to verify callbacks registered
2. Check for JavaScript errors in callback functions
3. Check if `onUserUpdated` callback is properly assigned

---

## Testing Plan (TE2)

### Phase 1: Run Fixed Diagnostic
```javascript
// Reload extension first
checkRealtimeBroadcast()
```

**Expected:** Should now run without `getChannel` error

---

### Phase 2: Quick WebSocket Check
```javascript
quickWebSocketCheck()
```

**Expected:** Should show socket is OPEN

---

### Phase 3: Trace WebSocket Messages
```javascript
traceWebSocketMessages()
// Wait 60 seconds
// In ANOTHER profile, navigate to a different page
// This should trigger a presence UPDATE in database
```

**Expected (if REPLICA IDENTITY NOT fixed):**
- WebSocket messages received (heartbeats, etc.)
- NO `postgres_changes` events
- Summary: "NO relevant messages for your page!"

**Expected (if REPLICA IDENTITY IS fixed):**
- WebSocket messages received
- `postgres_changes` events appear
- Summary: "WebSocket messages ARE being received!"

---

### Phase 4: Inspect Bindings
```javascript
inspectChannelBindings()
```

**Expected:** Should show multiple `postgres_changes` bindings with callbacks

---

## Files Created/Modified

### New Files
1. `/home/ubuntu/metalayer-initiative/presence/trace-websocket-events.js`
   - `quickWebSocketCheck()` - WebSocket health check
   - `traceWebSocketMessages()` - Message interceptor (60s monitor)
   - `inspectChannelBindings()` - Event handler inspector

2. `/home/ubuntu/metalayer-initiative/SD1-TE2-DIAGNOSTIC-TOOL-FIX-OCT-13.md`
   - This document

### Modified Files
1. `/home/ubuntu/metalayer-initiative/presence/diagnose-realtime-broadcast.js`
   - Fixed `getChannel()` error
   - Changed to use `client.channels.get(pageId)`

2. `/home/ubuntu/metalayer-initiative/presence/sidepanel.html`
   - Added `<script src="trace-websocket-events.js"></script>`

---

## User Instructions

### Step 1: Reload Extension
1. Open `chrome://extensions/`
2. Click reload on MetaLayer extension
3. Open sidepanel on both profiles

### Step 2: Run Diagnostics (in one profile's console)
```javascript
// 1. Quick health check
quickWebSocketCheck()

// 2. Trace WebSocket messages (60 seconds)
traceWebSocketMessages()

// 3. While tracing is running, in the OTHER profile:
//    - Navigate to a different page
//    - This should trigger a database UPDATE

// 4. After 60 seconds, check the summary
//    - If NO postgres_changes events: REPLICA IDENTITY issue
//    - If YES postgres_changes events: Check callbacks
```

### Step 3: Based on Results

**If NO postgres_changes events in trace:**
→ Confirms REPLICA IDENTITY issue
→ Run SQL fix:
```sql
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
```

**If YES postgres_changes events in trace:**
→ Client-side callback issue
→ Run:
```javascript
inspectChannelBindings()
```
→ Check if callbacks are registered

---

## Expected Outcome

After running `traceWebSocketMessages()` without the REPLICA IDENTITY fix, we expect to see:

```
📊📊📊 WEBSOCKET TRACE SUMMARY
📊📊📊═══════════════════════════════════════════════════════

📊 Total messages received: 15
📊 Relevant messages (for your page): 0

❌❌❌ NO relevant messages for your page!

🔧 DIAGNOSIS: Supabase is NOT broadcasting events
   - This confirms REPLICA IDENTITY issue
   - Run: ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
```

This will **definitively confirm** that the problem is at the Supabase backend level, not the client.

---

## Tags

- `diagnostic-tools`
- `websocket-tracing`
- `supabase-realtime`
- `sd1-fix`
- `te2-testing`
- `replica-identity`

---

**SD1 Sign-off:** Diagnostic tool fixed, enhanced tracing added, testing strategy documented.  
**TE2 Sign-off:** Three new diagnostic functions created, comprehensive testing plan provided.


