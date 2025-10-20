# Root Cause Analysis: user_visibility Realtime Subscription Failure

**Date**: October 13, 2025  
**Agents**: SD1 (Senior Developer), TE2 (Test Engineer)  
**Issue**: Supabase rejecting real-time subscriptions to `user_visibility` table  
**Severity**: CRITICAL - Blocks all visibility tracking functionality

---

## Executive Summary

The WebSocket tracer tool successfully revealed the root cause of the visibility tracking failure: **Supabase is rejecting subscriptions to the `user_visibility` table** because it was never properly configured for Realtime.

---

## Problem Discovery Timeline

### Initial Symptom
User reported: "Not seeing the websocket logs" after running `traceWebSocketMessages()`

### Diagnostic Process
1. ✅ WebSocket tracer successfully initialized
2. ✅ Connection established to Supabase
3. ✅ Heartbeat messages being sent/received
4. ❌ **Repeated error messages from Supabase backend**

### Critical Error Message
```
{:error, "Unable to subscribe to changes with given parameters. 
 Please check Realtime is enabled for the given connect parameters: 
 [event: *, filter: page_id=eq.chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl, 
  schema: public, table: user_visibility]"}
```

---

## Root Cause Analysis

### What Went Wrong

The `user_visibility` table was **never properly configured for Supabase Realtime**, despite the extension attempting to subscribe to it.

### Why It Happened

In the previous fix (`FIX-SUPABASE-REALTIME-REPLICA-IDENTITY.sql`), the line to fix `user_visibility` was **commented out**:

```sql
-- Fix user_visibility table (if you're using it)
-- Uncomment if this table exists in your schema:
-- ALTER TABLE public.user_visibility REPLICA IDENTITY FULL;
```

This line was never uncommented and executed, so the table remained unconfigured.

### What's Required for Supabase Realtime

For a table to work with Supabase Realtime, THREE things are required:

1. **REPLICA IDENTITY FULL**
   - Tells PostgreSQL to include all columns in change notifications
   - Without this, Supabase doesn't know what changed
   - Status: ❌ NOT SET for `user_visibility`

2. **Added to `supabase_realtime` Publication**
   - Makes the table available for real-time subscriptions
   - Without this, Supabase rejects subscription attempts
   - Status: ❌ NOT ADDED for `user_visibility`

3. **RLS Policies Allow SELECT**
   - Row Level Security must permit authenticated users to read
   - Without this, Supabase filters out all events
   - Status: ⚠️ UNKNOWN (needs verification)

---

## Why user_presence Worked But user_visibility Didn't

The extension subscribes to **TWO** tables for different purposes:

| Table | Purpose | Status | Reason |
|-------|---------|--------|--------|
| `user_presence` | Track who is online and where | ✅ WORKING | Fixed in previous iteration |
| `user_visibility` | Track who can see whom (communities) | ❌ BROKEN | Never configured |

The previous fix only addressed `user_presence`, leaving `user_visibility` unconfigured.

---

## Impact Analysis

### What Breaks Without user_visibility Realtime

1. **Visibility List Empty/Stale**
   - Sidepanel doesn't show who else is on the page
   - "Last seen" information never updates
   - User appears isolated even when others are present

2. **Community-Based Filtering Broken**
   - Can't determine which users should be visible based on shared communities
   - Privacy/permission system non-functional

3. **Cross-Page Tracking Fails**
   - Can't track when users move between pages
   - "Last seen on [page]" information never updates

### What Still Works

1. ✅ WebSocket connection established
2. ✅ Heartbeat mechanism functioning
3. ✅ `user_presence` updates (if that table was fixed)
4. ✅ Authentication and page tracking

---

## Technical Deep Dive

### How Supabase Realtime Works

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client subscribes to table changes                       │
│    client.channel('page-X')                                 │
│           .on('postgres_changes', ...)                      │
│           .subscribe()                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Supabase checks THREE requirements:                      │
│    ✓ Is table in supabase_realtime publication?            │
│    ✓ Does table have REPLICA IDENTITY FULL?                │
│    ✓ Do RLS policies allow SELECT?                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3a. If ALL checks pass:                                     │
│     → Subscription succeeds                                 │
│     → Client receives postgres_changes events               │
│                                                             │
│ 3b. If ANY check fails:                                     │
│     → Subscription rejected with error message              │
│     → Client receives system error event                    │
└─────────────────────────────────────────────────────────────┘
```

### What the WebSocket Tracer Revealed

The tracer showed that Supabase was sending **system error events** instead of **postgres_changes events**:

```javascript
// What we're receiving (ERROR):
{
  topic: "realtime:page-chrome_extensions_...",
  event: "system",
  payload: {
    status: "error",
    message: "Unable to subscribe to changes... table: user_visibility"
  }
}

// What we should be receiving (SUCCESS):
{
  topic: "realtime:page-chrome_extensions_...",
  event: "postgres_changes",
  payload: {
    data: {
      user_email: "...",
      page_id: "...",
      is_active: false,
      ...
    }
  }
}
```

---

## The Fix

### SQL Commands to Run

```sql
-- 1. Set REPLICA IDENTITY FULL
ALTER TABLE public.user_visibility REPLICA IDENTITY FULL;

-- 2. Add to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_visibility;

-- 3. Ensure RLS allows SELECT for authenticated users
ALTER TABLE public.user_visibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read visibility"
ON public.user_visibility
FOR SELECT
TO authenticated
USING (true);
```

### Why This Fix Works

1. **REPLICA IDENTITY FULL**: PostgreSQL will now include all columns when broadcasting changes via logical replication (which Supabase Realtime uses)

2. **Publication**: Supabase will now accept subscription requests for this table

3. **RLS Policy**: Authenticated users (which includes the extension) can now read visibility data, so Supabase won't filter out events

---

## Testing Strategy (TE2 Recommendations)

### Pre-Fix Verification

Run these queries in Supabase SQL Editor to confirm the problem:

```sql
-- Should show 'DEFAULT' (the problem)
SELECT
  c.relname AS table_name,
  CASE c.relreplident
    WHEN 'd' THEN 'DEFAULT (primary key only) ❌'
    WHEN 'f' THEN 'FULL (all columns) ✅'
  END AS replica_identity_setting
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'user_visibility';

-- Should return NO ROWS (the problem)
SELECT * FROM pg_publication_tables
WHERE tablename = 'user_visibility'
  AND pubname = 'supabase_realtime';
```

### Apply the Fix

Run the SQL script: `FIX-USER-VISIBILITY-REALTIME.sql`

### Post-Fix Verification

```sql
-- Should now show 'FULL' ✅
SELECT
  c.relname AS table_name,
  CASE c.relreplident
    WHEN 'd' THEN 'DEFAULT (primary key only) ❌'
    WHEN 'f' THEN 'FULL (all columns) ✅'
  END AS replica_identity_setting
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'user_visibility';

-- Should now return ONE ROW ✅
SELECT * FROM pg_publication_tables
WHERE tablename = 'user_visibility'
  AND pubname = 'supabase_realtime';
```

### Extension Testing

1. **Reload Extension** (CRITICAL - must establish new connection)
   - Chrome → Extensions → Reload on BOTH profiles

2. **Run WebSocket Tracer**
   ```javascript
   traceWebSocketMessages()
   ```

3. **Trigger a Change**
   - Navigate to a different page in the other profile
   - Or wait for a heartbeat update

4. **Expected Result**
   - ✅ Should see `postgres_changes` events in the trace
   - ✅ Should see `user_visibility` table updates
   - ❌ Should NO LONGER see error messages about "Unable to subscribe"

5. **Verify Visibility List**
   - Open sidepanel on both profiles
   - Navigate to the same page
   - Both should see each other in the visibility list
   - Navigate one profile to a different page
   - The other should see "Last seen X ago"

---

## Lessons Learned

### For SD1 (Senior Developer)

1. **Commented-out code is dangerous**: The fix was written but never executed because it was commented out with "if you're using it". We ARE using it.

2. **Verify ALL tables**: When fixing Realtime issues, check EVERY table the extension subscribes to, not just the most obvious one.

3. **Error messages are gold**: The Supabase error message was extremely specific and told us exactly what was wrong. The WebSocket tracer was essential to see it.

4. **Two-table architecture**: The extension uses both `user_presence` and `user_visibility` for different purposes. Both need the same Realtime configuration.

### For TE2 (Test Engineer)

1. **WebSocket tracer is essential**: Without it, we would never have seen the specific error message from Supabase. This tool should be part of the standard diagnostic toolkit.

2. **Test at the protocol level**: High-level testing (checking the UI) didn't reveal the root cause. Low-level testing (WebSocket messages) did.

3. **Verify backend configuration**: Don't assume database tables are configured correctly. Always verify publication, REPLICA IDENTITY, and RLS settings.

4. **Test both tables**: Any test suite must verify that BOTH `user_presence` and `user_visibility` are receiving real-time events.

---

## Recommended Diagnostic Commands

### Quick Health Check

```javascript
// In browser console:
traceWebSocketMessages()
// Wait 10 seconds, look for postgres_changes events
// Should see events for BOTH user_presence and user_visibility
```

### Comprehensive Check

```javascript
// 1. Check current page and user
console.log('User:', await window.authManager.getCurrentUserEmail());
console.log('Page:', window.supabaseRealtimeClient.currentPage);

// 2. Trace WebSocket for 60 seconds
traceWebSocketMessages()

// 3. In another profile, navigate to trigger changes

// 4. Check summary at end of trace
// Should show:
// - postgres_changes events: > 0
// - Error messages: 0
```

---

## Success Criteria

### Before Fix
- ❌ WebSocket tracer shows error: "Unable to subscribe... table: user_visibility"
- ❌ No postgres_changes events for user_visibility
- ❌ Visibility list empty or stale
- ❌ "Last seen" never updates

### After Fix
- ✅ WebSocket tracer shows postgres_changes events
- ✅ Events received for both user_presence and user_visibility
- ✅ Visibility list updates in real-time
- ✅ "Last seen" updates when users move pages
- ✅ No error messages in WebSocket trace

---

## Next Steps

1. **Immediate**: Run `FIX-USER-VISIBILITY-REALTIME.sql` in Supabase SQL Editor
2. **Reload**: Reload Chrome extension on both test profiles
3. **Test**: Run `traceWebSocketMessages()` and verify postgres_changes events
4. **Verify**: Check visibility list updates in real-time
5. **Document**: Store this analysis in JAUmemory with tags: `realtime`, `user_visibility`, `root-cause`, `supabase`, `websocket-tracer`

---

## Tags for JAUmemory

`realtime`, `user_visibility`, `supabase`, `replica-identity`, `publication`, `rls`, `websocket-tracer`, `root-cause-analysis`, `sd1`, `te2`, `critical-fix`, `october-2025`


