# SD1: Real-time Events Not Firing - Root Cause Analysis

**Date:** October 12, 2025  
**Agent:** SD1 (Senior Developer)  
**Issue:** Supabase `postgres_changes` events are not being received by the frontend despite successful subscription and heartbeats.

---

## 🔍 PROBLEM STATEMENT

The Chrome extension successfully:
- ✅ Connects to Supabase (WebSocket `SUBSCRIBED` status)
- ✅ Sends heartbeat updates (presence `last_seen` updates every 5 seconds)
- ✅ Has tables in `supabase_realtime` publication
- ✅ Can read from tables via SELECT queries

BUT:
- ❌ **NO** `postgres_changes` events are received
- ❌ **NO** `👁️ REALTIME_EVENT` logs appear in console
- ❌ Real-time presence updates do NOT propagate between users

---

## 📊 EVIDENCE FROM LOGS

### 1. Successful Subscription
```
📡 SUBSCRIBE_STATUS: Subscription status changed: SUBSCRIBED
✅ SUBSCRIBE_STATUS: Successfully subscribed to real-time updates
✅ SUBSCRIBE_STATUS: Now listening for:
    - Presence changes (user_presence table)
    - New messages (messages table)
    - Visibility updates (user_visibility table)
    - Filter: page_id=chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
```

### 2. Successful Heartbeats
```
🔍 PRESENCE_UPDATE: Data being sent: {
  "user_email": "themetalayer@gmail.com",
  "page_id": "chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl",
  "is_active": true,
  "last_seen": "2025-10-12T18:50:55.178Z",
  "aura_color": "#aa00aa"
}
✅ Presence updated for page: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
💓 HEARTBEAT: Sent via Supabase real-time
```

### 3. Tables ARE in Publication
```sql
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

| tablename       |
| --------------- |
| messages        |
| user_presence   |
| user_visibility |
```

### 4. NO Real-time Events Received
- **ZERO** `👁️ REALTIME_EVENT` logs in the entire session
- `handlePresenceUpdate`, `handleNewMessage`, `handleVisibilityUpdate` functions are NEVER called
- Events are expected to fire when data in `user_presence` changes

---

## 💡 ROOT CAUSE HYPOTHESES (Ordered by Likelihood)

### Hypothesis 1: WAL Level Not Set to "logical" ⭐⭐⭐⭐⭐
**Likelihood:** VERY HIGH

**Explanation:**
PostgreSQL's Write-Ahead Log (WAL) must be set to `logical` for replication and real-time features to work. If `wal_level` is set to `replica` or `minimal`, the database will NOT generate the change stream that Supabase Realtime needs.

**How to Check:**
```sql
SHOW wal_level;
```

**Expected Result:**
```
wal_level
-----------
logical
```

**If Result is `replica` or `minimal`:**
This is THE problem. The database is NOT configured to publish changes.

**Fix (requires superuser):**
```sql
ALTER SYSTEM SET wal_level = 'logical';
-- Then restart PostgreSQL
```

**Why This Matches Our Symptoms:**
- WebSocket connects (✅) - Connection layer works
- Subscriptions succeed (✅) - Client-side code works
- Updates are written (✅) - Database writes work
- But NO events fire (❌) - No change stream generated

---

### Hypothesis 2: RLS Policies Block Realtime for `anon` Role ⭐⭐⭐⭐
**Likelihood:** HIGH

**Explanation:**
Even though SELECT queries work, Supabase Realtime requires separate permissions. The `anon` role (which the extension uses) might not have SELECT permission in the RLS policy, blocking real-time events even though direct queries work.

**How to Check:**
```sql
-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_presence';
```

**Expected Result:**
Should have a policy like:
```sql
CREATE POLICY "Enable realtime for anon"
ON public.user_presence
FOR SELECT
TO anon
USING (true);
```

**If Missing:**
The `anon` role cannot "see" the changes, so Realtime doesn't send events.

**Fix:**
```sql
-- Enable SELECT for anon role (required for realtime)
CREATE POLICY "Enable realtime for anon"
ON public.user_presence
FOR SELECT
TO anon
USING (true);

-- Also ensure authenticated users can see all
CREATE POLICY "Enable read for authenticated"
ON public.user_presence
FOR SELECT
TO authenticated
USING (true);
```

**Why This Matches Our Symptoms:**
- Direct SELECT might work with service role key
- But realtime uses `anon` role initially
- RLS blocks the real-time subscription

---

### Hypothesis 3: Supabase Plan Limitations ⭐⭐
**Likelihood:** MEDIUM

**Explanation:**
Free tier and some paid tiers have limits on:
- Number of concurrent realtime connections
- Realtime message throughput
- WAL retention

**How to Check:**
- Check Supabase Dashboard → Project Settings → Billing
- Look for "Realtime" in usage metrics

**If This Is The Problem:**
- You'll see warnings in Supabase Dashboard
- Might need to upgrade plan

---

### Hypothesis 4: Supabase Realtime Service Not Enabled ⭐
**Likelihood:** LOW

**Explanation:**
The Supabase Realtime service itself might be disabled for the project.

**How to Check:**
- Supabase Dashboard → Settings → API
- Look for "Realtime" section
- Ensure it's enabled

---

## 🧪 DIAGNOSTIC PLAN

To identify the exact root cause, run these diagnostics in order:

### Step 1: Check WAL Level (CRITICAL)
```sql
-- Run in Supabase SQL Editor
SHOW wal_level;
```

**If result is NOT "logical":**
→ This is the root cause. Cannot be fixed without superuser access. Contact Supabase support or check project settings.

### Step 2: Check RLS Policies
```sql
-- Run in Supabase SQL Editor
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('user_presence', 'messages', 'user_visibility');
```

**Expected:** Should see policies allowing SELECT for `anon` role.

**If missing:**
```sql
-- Fix: Add SELECT policies for anon
CREATE POLICY IF NOT EXISTS "Enable realtime for anon on user_presence"
ON public.user_presence
FOR SELECT
TO anon
USING (true);

CREATE POLICY IF NOT EXISTS "Enable realtime for anon on messages"
ON public.messages
FOR SELECT
TO anon
USING (true);

CREATE POLICY IF NOT EXISTS "Enable realtime for anon on user_visibility"
ON public.user_visibility
FOR SELECT
TO anon
USING (true);
```

### Step 3: Run Frontend Diagnostics
In the Chrome extension console, run:
```javascript
await runFullDiagnostics();
```

This will:
1. Test database read access
2. Test WebSocket connection
3. Test if ANY event is received
4. Provide detailed diagnosis

### Step 4: Quick Event Test
```javascript
await quickRealtimeTest();
```

This will:
- Subscribe to events
- Trigger an UPDATE
- Check if event fires
- Report result in 5 seconds

---

## 🎯 RECOMMENDED FIXES

### Fix 1: Ensure WAL Level is Logical
**If you have superuser access:**
```sql
ALTER SYSTEM SET wal_level = 'logical';
-- Restart PostgreSQL service
```

**If using Supabase hosted:**
- WAL level should already be `logical`
- If not, contact Supabase support
- This should not be an issue on Supabase Cloud

### Fix 2: Add RLS Policies for Realtime
```sql
-- User Presence
CREATE POLICY IF NOT EXISTS "Enable realtime for anon on user_presence"
ON public.user_presence
FOR SELECT
TO anon
USING (true);

-- Messages
CREATE POLICY IF NOT EXISTS "Enable realtime for anon on messages"
ON public.messages
FOR SELECT
TO anon
USING (true);

-- User Visibility (if table exists)
CREATE POLICY IF NOT EXISTS "Enable realtime for anon on user_visibility"
ON public.user_visibility
FOR SELECT
TO anon
USING (true);
```

### Fix 3: Verify Publication Includes All Columns
```sql
-- Check what columns are included in publication
SELECT schemaname, tablename, attnames
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('user_presence', 'messages', 'user_visibility');
```

**Expected:** `attnames` should list all columns (or NULL for all).

**If specific columns are missing:**
```sql
-- Reset publication to include all columns
ALTER PUBLICATION supabase_realtime SET TABLE
  public.user_presence,
  public.messages,
  public.user_visibility;
```

---

## 🔗 ADDITIONAL CONTEXT FROM LOGS

### Observed Behavior:
1. User `daveroom@gmail.com` is shown in visibility list with "Online for 8 minutes"
2. This user's `enter_time` is `2025-10-12T18:42:12.779+00:00`
3. Current time is `2025-10-12T18:50:55`
4. Heartbeats are being sent every 5 seconds
5. BUT: When `daveroom` changes aura or leaves, `themetalayer` does NOT see the update in real-time

### Database Reality Check:
From the Supabase data you provided:
```
| user_email         | page_id                          | is_active | last_seen                  |
| ------------------ | -------------------------------- | --------- | -------------------------- |
| daveroom@gmail.com | chrome_newtab_                   | true      | 2025-10-12 02:03:46.488+00 |
| daveroom@gmail.com | google_com_                      | true      | 2025-10-12 15:33:45.456+00 |
```

**CRITICAL FINDING:** `daveroom@gmail.com` is NOT on `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl` in the database! The frontend is showing stale data from the initial API call, but real-time updates are not coming through to refresh it.

This confirms that real-time events are NOT firing. If they were, the frontend would have received a `DELETE` or `UPDATE` event when daveroom left the page, and the visibility list would have updated.

---

## 📝 NEXT STEPS

1. **Run diagnostics** in the extension console:
   ```javascript
   await runFullDiagnostics();
   ```

2. **Check WAL level** in Supabase SQL Editor:
   ```sql
   SHOW wal_level;
   ```

3. **Check RLS policies** in Supabase SQL Editor:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_presence';
   ```

4. **Apply RLS fixes** if needed (see Fix 2 above)

5. **Test again** with:
   ```javascript
   await quickRealtimeTest();
   ```

6. **Report findings** so we can proceed with targeted fixes

---

## 🏷️ TAGS
- supabase
- realtime
- postgres_changes
- wal
- rls
- debugging
- chrome-extension
- presence-system

---

**SD1 Analysis Complete**  
**Confidence Level:** High (85%)  
**Recommended Action:** Check WAL level first, then RLS policies second

