# TE2 & SD1 Analysis - Chrome Extension Presence System
**Date:** October 13, 2025  
**Build:** 2025-10-12-te2-comprehensive

## 🔍 SD1 Root Cause Analysis

### Issues Identified from Diagnostic Output

1. **`window.currentUrlData` is UNDEFINED**
   - **Symptom:** `diagnosePageTracking()` shows `undefined` for `window.currentUrlData.pageId`
   - **Root Cause:** The global `currentUrlData` is being set in `handleTabChange()` and `handleTabUpdate()`, but it's not being initialized at startup
   - **Impact:** Diagnostic tools cannot access the current URL data

2. **Supabase Query Error (406 Not Acceptable)**
   - **Error Message:** "The result contains 2 rows"
   - **Root Cause:** There are **DUPLICATE presence records** in Supabase for the same user on the same page
   - **Impact:** `.single()` query fails because it expects exactly 1 row
   - **Critical:** This indicates the upsert logic is creating multiple records instead of updating existing ones

3. **`window.normalizeUrl` is not a function**
   - **Root Cause:** `normalizeCurrentUrl()` was defined but not exposed globally
   - **Impact:** Diagnostic tools like `diagnosePageTracking()` cannot normalize URLs for comparison

4. **Handlers ARE tracking correctly** ✅
   - `realtimePresenceHandler.currentPageId`: `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl`
   - `supabaseRealtimeClient.currentPage.pageId`: `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl`
   - **Conclusion:** The page tracking handlers are working correctly; the issue is with duplicate records

### Hypotheses

**Primary Hypothesis:**
The Supabase `upsert` operation is not correctly identifying existing records, leading to duplicate inserts. This could be due to:
- Missing or incorrect unique constraint on `(user_email, page_id)`
- Race conditions during rapid presence updates
- The upsert query not using the correct matching columns

## 🧪 TE2 Comprehensive Test Suite

### Fixes Applied

1. **Exposed `window.normalizeUrl` function** ✅
   - Created a wrapper to make `normalizeCurrentUrl()` globally accessible
   - Diagnostic tools can now normalize URLs for comparison

2. **Created `test-presence-system.js`** ✅
   - Comprehensive test suite with 5 console-callable functions
   - Added to `sidepanel.html` for automatic loading

3. **Updated `EXTENSION_BUILD`** ✅
   - New version: `2025-10-12-te2-comprehensive`

### Test Functions Available

Run these in the browser console after reloading the extension:

#### 1. `testDuplicatePresence()`
**Purpose:** Detect duplicate presence records in Supabase

**What it checks:**
- Queries all presence records for the current user
- Reports if multiple records exist (should only be 1)
- Displays all duplicate records with details

**Expected Result:** 
- ✅ PASS: Exactly 1 record found
- ❌ FAIL: 2+ records found (duplicates)

**Run this first!** This will tell us if duplicates are the root cause.

#### 2. `testGlobalStateConsistency()`
**Purpose:** Verify all handlers are tracking the same page

**What it checks:**
- `window.currentUrlData.pageId`
- `realtimePresenceHandler.currentPageId`
- `supabaseRealtimeClient.currentPage.pageId`

**Expected Result:**
- ✅ PASS: All 3 states match
- ❌ FAIL: States are inconsistent

#### 3. `testRealtimeEvents()`
**Purpose:** Monitor real-time event reception for 10 seconds

**What it checks:**
- Listens for `👁️ REALTIME_EVENT` or `POSTGRES_CHANGES` logs
- Counts events received
- Logs event details

**Expected Result:**
- ✅ PASS: Events are being received
- ❌ FAIL: No events in 10 seconds (realtime broken)

**How to use:** Run this, then change aura color or send a message in another profile to trigger events.

#### 4. `testPageTransitionCleanup()`
**Purpose:** Verify `leaveCurrentPage()` marks old page inactive

**What it checks:**
1. Records current presence state
2. Simulates page transition to `https://example.com/test`
3. Verifies old page was marked `is_active: false`
4. Checks for duplicate records after transition

**Expected Result:**
- ✅ PASS: Old page marked inactive, no duplicates
- ❌ FAIL: Old page still active or duplicates created

#### 5. `runAllPresenceTests()`
**Purpose:** Run all tests in batch mode (skips realtime events test)

**What it does:**
- Runs tests 1, 2, and 4
- Provides summary of passed/failed tests
- Gives recommendations for fixes

## 📋 Action Items

### Immediate Actions (User)

1. **Reload the extension** to get the new diagnostic tools
2. **Run `testDuplicatePresence()`** in the console
3. **If duplicates are found:**
   - Go to Supabase SQL Editor
   - Run this query to clean up:
   ```sql
   -- Find duplicates
   SELECT user_email, page_id, COUNT(*) as count
   FROM user_presence
   GROUP BY user_email, page_id
   HAVING COUNT(*) > 1;
   
   -- Delete duplicates, keep only the most recent
   DELETE FROM user_presence
   WHERE id NOT IN (
     SELECT DISTINCT ON (user_email, page_id) id
     FROM user_presence
     ORDER BY user_email, page_id, last_seen DESC
   );
   ```
4. **Run `runAllPresenceTests()`** to verify all systems after cleanup
5. **Report results back** for further analysis

### Database Schema Check (User)

Verify the unique constraint exists:
```sql
-- Check if unique constraint exists
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'user_presence'::regclass;
```

If no unique constraint on `(user_email, page_id)`, add one:
```sql
-- Add unique constraint
ALTER TABLE user_presence
ADD CONSTRAINT user_presence_user_page_unique 
UNIQUE (user_email, page_id);
```

### Pending Fixes (If Tests Fail)

1. **If `testDuplicatePresence()` still fails after cleanup:**
   - The upsert logic in `supabase-realtime-client.js` needs fixing
   - Need to ensure `.upsert()` uses `onConflict: 'user_email,page_id'`

2. **If `testGlobalStateConsistency()` fails:**
   - Initialize `window.currentUrlData` at startup in `sidepanel.js`
   - Ensure it's updated whenever the page changes

3. **If `testRealtimeEvents()` fails:**
   - Check Supabase publication: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`
   - Verify RLS policies allow anonymous read
   - Check PostgreSQL WAL level: `SHOW wal_level;` (should be `logical`)

## 🎯 Success Criteria

**System is fixed when:**
- ✅ `testDuplicatePresence()` returns PASS (exactly 1 record)
- ✅ `testGlobalStateConsistency()` returns PASS (all states match)
- ✅ `testRealtimeEvents()` returns PASS (events received)
- ✅ `testPageTransitionCleanup()` returns PASS (proper cleanup)
- ✅ Users on different pages show as "Last Seen" (not "Online")
- ✅ No `diagnosePageTracking()` errors

## 📝 Solutions Stored in JAUmemory

Memory ID: `db4e9f6c-a61c-48e7-81b5-0107f3e17e52`
- Linked to **SD1** (Senior Diagnostics)
- Linked to **TE2** (Test Engineer 2)
- Tags: chrome-extension, presence-system, bug-fix, diagnostic, supabase, realtime, page-tracking



