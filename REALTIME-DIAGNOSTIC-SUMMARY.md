# Supabase Realtime Diagnostic & Fix Summary

**Date:** October 12, 2025  
**Agents:** SD1 (Senior Diagnostician) + TE2 (Test Engineer 2)  
**Status:** ✅ Diagnostics Complete - Awaiting User Testing

---

## 🎯 WHAT WAS DONE

### 1. Fixed `testRealtimeEvents()` Not Loading ✅
**Problem:** Function showed "Uncaught ReferenceError: testRealtimeEvents is not defined"

**Fix Applied:**
- Changed function definition to immediately assign to `window` object
- File: `metalayer-initiative/presence/test-realtime-events.js`

**Test:**
```javascript
// Now available in console:
testRealtimeEvents()
```

---

### 2. Created Comprehensive Diagnostic Tools (TE2) ✅

Created `comprehensive-realtime-diagnostics.js` with three console-callable functions:

#### `runFullDiagnostics()`
Complete 5-test diagnostic suite:
- ✅ Environment Check (Supabase client, currentUser)
- ✅ RLS Read Access Test (can anon SELECT?)
- ✅ WebSocket Connection Test (subscription status)
- ✅ Real-time Event Reception Test (do events fire?)
- ✅ Current Subscription Analysis

**Usage:**
```javascript
await runFullDiagnostics();
```

**Returns:** Structured results object with pass/fail for each test

#### `quickRealtimeTest()`
Fast 5-second test:
- Subscribes to postgres_changes
- Triggers an UPDATE
- Reports if event was received

**Usage:**
```javascript
await quickRealtimeTest();
```

#### `checkCurrentPagePresence()`
Shows who is currently on the same page with full presence data

**Usage:**
```javascript
await checkCurrentPagePresence();
```

---

### 3. SD1 Root Cause Analysis ✅

Created `SD1-REALTIME-ROOT-CAUSE-ANALYSIS.md` with detailed analysis.

**Key Findings:**

#### Root Cause #1: WAL Level (85% confidence) ⭐⭐⭐⭐⭐
PostgreSQL `wal_level` must be set to `logical` for realtime to work.

**Check:**
```sql
SHOW wal_level;
-- Expected: "logical"
```

**If NOT "logical":** This is THE problem. Realtime CANNOT work without it.

#### Root Cause #2: RLS Policies (70% confidence) ⭐⭐⭐⭐
Even though SELECT works, realtime requires separate SELECT permission for `anon` role.

**Check:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'user_presence';
```

**Fix:**
```sql
CREATE POLICY IF NOT EXISTS "Enable realtime for anon on user_presence"
ON public.user_presence
FOR SELECT
TO anon
USING (true);
```

#### Root Cause #3: Replica Identity (30% confidence) ⭐⭐
Tables need proper replica identity for realtime.

**Fix:**
```sql
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
```

---

### 4. SQL Diagnostic & Fix Script ✅

Created `CHECK-AND-FIX-REALTIME.sql` with:
- Step-by-step checks for WAL, RLS, Publication, Replica Identity
- All fixes ready to copy-paste
- Verification queries
- Detailed comments explaining each step

**To Run:**
1. Open Supabase SQL Editor
2. Run each section sequentially
3. Apply fixes as needed

---

## 🚀 NEXT STEPS FOR USER

### Step 1: Reload Extension and Test Diagnostics
```bash
# Reload the Chrome extension
```

Then in console:
```javascript
// Run full diagnostics
await runFullDiagnostics();

// OR quick test
await quickRealtimeTest();
```

### Step 2: Check Supabase Configuration

In Supabase SQL Editor, run:
```sql
-- 1. Check WAL level (MOST IMPORTANT)
SHOW wal_level;

-- 2. Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_presence';

-- 3. Check publication
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### Step 3: Apply Fixes if Needed

If diagnostics show issues, run the appropriate fixes from `CHECK-AND-FIX-REALTIME.sql`.

**Most likely fix needed:**
```sql
-- Add RLS policies for anon role (required for realtime)
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

### Step 4: Test Again

After applying fixes:
```javascript
await quickRealtimeTest();
```

Expected result:
```
✅ Events ARE working!
```

---

## 📁 FILES CREATED

1. **`presence/test-realtime-events.js`** (FIXED)
   - Fixed function loading issue
   - Now properly exposed to console

2. **`presence/comprehensive-realtime-diagnostics.js`** (NEW)
   - Three console-callable diagnostic functions
   - Comprehensive testing suite
   - Added to `sidepanel.html`

3. **`SD1-REALTIME-ROOT-CAUSE-ANALYSIS.md`** (NEW)
   - Detailed SD1 analysis
   - Root cause hypotheses with confidence levels
   - Diagnostic plan
   - Fix recommendations

4. **`CHECK-AND-FIX-REALTIME.sql`** (NEW)
   - Complete SQL diagnostic script
   - All necessary fixes
   - Verification queries
   - Extensive comments

---

## 📊 EVIDENCE OF THE PROBLEM

From your logs:
- ✅ WebSocket connects (`SUBSCRIBED` status)
- ✅ Heartbeats send every 5s
- ✅ Tables in `supabase_realtime` publication
- ❌ **ZERO `👁️ REALTIME_EVENT` logs**
- ❌ **NO `handlePresenceUpdate` calls**
- ❌ **Visibility shows stale data**

**Database Reality:**
```
daveroom@gmail.com is on:
  - chrome_newtab_
  - google_com_

NOT on chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
```

But frontend still shows daveroom as visible because real-time updates never fired to remove them.

---

## 💾 STORED IN JAUMEMORY

All findings, solutions, and diagnostic tools have been stored in JAUmemory with tags:
- `supabase`
- `realtime`
- `postgres_changes`
- `wal`
- `rls`
- `debugging`
- `sd1-analysis`
- `te2`
- `diagnostics`

And linked to the appropriate agents (SD1, TE2).

---

## 🎯 EXPECTED OUTCOME AFTER FIXES

Once the correct fix is applied:

1. **Console test:**
   ```javascript
   await quickRealtimeTest();
   // → ✅ Events ARE working!
   ```

2. **Logs will show:**
   ```
   👁️ REALTIME_EVENT: PRESENCE_UPDATE
   👁️ REALTIME_EVENT: NEW_MESSAGE
   📊 handlePresenceUpdate called with payload: {...}
   ```

3. **Visibility will update in real-time:**
   - When user leaves → Immediately shows "Last seen..."
   - When user changes aura → Avatar updates instantly
   - When user enters → Appears in list within 1-2 seconds

---

## ⚠️ IMPORTANT NOTES

### If WAL Level is NOT "logical":
- This is a PostgreSQL server setting
- Requires restart
- Usually requires superuser access
- **On Supabase Cloud:** Should already be set to "logical"
  - If not, contact Supabase support
- **On self-hosted:** 
  ```sql
  ALTER SYSTEM SET wal_level = 'logical';
  -- Then restart PostgreSQL
  ```

### If RLS Policies are Missing:
- This is the MOST COMMON issue
- Easy to fix with the SQL script
- Required for `anon` role to receive realtime events
- Even though direct SELECT works, realtime has separate permissions

---

## 🔬 HOW TO INTERPRET DIAGNOSTIC RESULTS

### `runFullDiagnostics()` Output:

**If All Tests Pass:**
→ Realtime IS working! Issue is in app subscription logic.

**If "Real-time Event Reception" Fails:**
→ Check WAL level and RLS policies (most likely culprits)

**If "RLS Read Access" Fails:**
→ RLS is blocking ALL access, not just realtime

**If "WebSocket Connection" Fails:**
→ Network or Supabase service issue

---

## 📞 READY FOR TESTING

Everything is ready for you to test:

1. **Reload extension** (chrome://extensions/)
2. **Run diagnostics** in console: `await runFullDiagnostics();`
3. **Check Supabase** with the SQL script
4. **Apply fixes** as needed
5. **Test again** with: `await quickRealtimeTest();`
6. **Report results** so we can proceed

---

**All tools are now loaded and ready. Please reload the extension and run the diagnostics!**

