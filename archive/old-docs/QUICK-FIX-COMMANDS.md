# ⚡ Quick Fix Commands

**Problem**: `user_visibility` table not configured for Supabase Realtime  
**Solution**: Run these commands in order  
**Status**: ✅ SQL scripts fixed and ready to run (Oct 13, 2025)

---

## 1. Run SQL Fix (Supabase Dashboard)

Open Supabase Dashboard → SQL Editor → Paste and Run:

```sql
-- ═══════════════════════════════════════════════════════════════════
-- QUICK FIX: Enable Realtime for user_visibility table
-- ═══════════════════════════════════════════════════════════════════

-- Fix 1: Set REPLICA IDENTITY FULL
ALTER TABLE public.user_visibility REPLICA IDENTITY FULL;

-- Fix 2: Add to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_visibility;

-- Fix 3: Ensure RLS allows SELECT for authenticated users
ALTER TABLE public.user_visibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read visibility" ON public.user_visibility;

CREATE POLICY "Allow authenticated users to read visibility"
ON public.user_visibility
FOR SELECT
TO authenticated
USING (true);

-- ═══════════════════════════════════════════════════════════════════
-- VERIFICATION: Run these to confirm the fix worked
-- ═══════════════════════════════════════════════════════════════════

-- Should show 'FULL' ✅
SELECT
  c.relname AS table_name,
  CASE c.relreplident
    WHEN 'd' THEN 'DEFAULT (primary key only) ❌'
    WHEN 'f' THEN 'FULL (all columns) ✅'
  END AS replica_identity_setting
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'user_visibility';

-- Should return ONE ROW ✅
SELECT tablename, pubname
FROM pg_publication_tables
WHERE tablename = 'user_visibility'
  AND pubname = 'supabase_realtime';

-- Should show the SELECT policy ✅
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'user_visibility';
```

---

## 2. Reload Extension (Chrome)

**CRITICAL**: Must reload on **BOTH** profiles

1. Chrome → `chrome://extensions/`
2. Find "MetaLayer" extension
3. Click "Reload" 🔄
4. Repeat on the other profile

---

## 3. Test with WebSocket Tracer (Browser Console)

Open sidepanel → Right-click → Inspect → Console → Run:

```javascript
traceWebSocketMessages()
```

**What to do while it runs**:
1. Wait 10 seconds
2. Navigate to a different page in the other profile
3. Wait for the 60-second summary

**Expected output**:

```
📊 SUMMARY (60 seconds):
├─ Total messages: 8
├─ Heartbeats: 2
├─ postgres_changes events: 4 ✅
│  ├─ user_presence: 2
│  └─ user_visibility: 2
└─ Error messages: 0 ✅
```

---

## 4. Verify Visibility List (Sidepanel)

1. Open sidepanel on **BOTH** profiles
2. Navigate to the **SAME** page on both
3. Check visibility list:
   - ✅ Should show the other user
   - ✅ Should show their avatar
   - ✅ Should show "Online" status

4. Navigate to a **DIFFERENT** page on one profile
5. Check visibility list on the other profile:
   - ✅ Should show "Last seen X ago"
   - ✅ Should update in real-time

---

## Success Checklist

- [ ] SQL script ran without errors
- [ ] Verification queries show ✅ (FULL, publication exists, policy exists)
- [ ] Extension reloaded on both profiles
- [ ] WebSocket tracer shows `postgres_changes` events
- [ ] WebSocket tracer shows 0 error messages
- [ ] Visibility list shows other users
- [ ] "Last seen" updates when users move

---

## If It Still Doesn't Work

### Check 1: Verify SQL Fix Applied

Run in Supabase SQL Editor:

```sql
SELECT
  c.relname,
  CASE c.relreplident
    WHEN 'd' THEN 'DEFAULT ❌'
    WHEN 'f' THEN 'FULL ✅'
  END AS setting
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'user_visibility';
```

**Expected**: `FULL ✅`  
**If you see**: `DEFAULT ❌` → SQL fix didn't apply, run it again

### Check 2: Verify Publication

Run in Supabase SQL Editor:

```sql
SELECT * FROM pg_publication_tables
WHERE tablename = 'user_visibility' AND pubname = 'supabase_realtime';
```

**Expected**: ONE ROW  
**If you see**: NO ROWS → Run the `ALTER PUBLICATION` command again

### Check 3: Check Supabase Dashboard

1. Supabase Dashboard → Database → Replication
2. Find `supabase_realtime` publication
3. Verify `user_visibility` is checked ✅

### Check 4: Run Tracer Again

```javascript
traceWebSocketMessages()
```

Look for:
- ✅ `postgres_changes` events (should be > 0)
- ❌ Error messages (should be 0)

If you still see "Unable to subscribe" errors, the SQL fix didn't apply correctly.

---

## Need More Help?

### Full Documentation

- **`USER-VISIBILITY-FIX-SUMMARY-OCT-13.md`** - Detailed explanation
- **`WEBSOCKET-TRACER-SUCCESS-SUMMARY.md`** - Comprehensive overview
- **`SD1-TE2-USER-VISIBILITY-ROOT-CAUSE-OCT-13.md`** - Technical deep dive

### Diagnostic Commands

- **`DIAGNOSTIC-COMMANDS-REFERENCE.md`** - All available commands
- **`checkRealtimeBroadcast()`** - Alternative diagnostic
- **`diagnosePageTracking()`** - Check page tracking

---

**Last Updated**: October 13, 2025  
**Build**: 2025-10-13-websocket-tracer-fixed

