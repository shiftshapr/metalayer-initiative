# SD1 Analysis: Missing "Last Seen" Status

**Date:** October 14, 2025  
**Build:** 2025-10-14-enhanced-logging  
**Issue:** When a user navigates to a page where another user was previously active, the "Last seen X ago" status is not showing.

---

## 🔍 Problem Statement

**User Report:**
> "same problem, the profile that moves does not have last seen even though the other profile has previously been on that page... See images"

**Observed Behavior:**
1. `daveroom@gmail.com` is on Extensions page (visible to `themetalayer@gmail.com`)
2. `daveroom@gmail.com` navigates away from Extensions page
3. `themetalayer@gmail.com` navigates TO Extensions page
4. **Expected:** `themetalayer@gmail.com` should see "daveroom - Last seen X ago"
5. **Actual:** `daveroom@gmail.com` is NOT visible at all

---

## 📊 Log Analysis

### Key Evidence from Logs

```javascript
🔍 API: getPresenceByUrl response: {
  "active": [
    {
      "id": "themetalayer@gmail.com",
      "userId": "themetalayer@gmail.com",
      "email": "themetalayer@gmail.com",
      "name": "The Metalayer",
      // ... only ONE user!
    }
  ],
  "pageId": "chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl",
  "url": "chrome://extensions/?errors=dbdjamnflfecdnioehkdmlhnmajffijl"
}
```

**Critical Finding:** The backend API is returning ONLY `themetalayer@gmail.com`, even though `daveroom@gmail.com` was previously on this page.

---

## 🧪 Hypotheses

### Hypothesis 1: Database Record Not Being Created ❌
**Theory:** When `daveroom@gmail.com` leaves the page, the `is_active: false` update is not happening.

**Evidence Against:**
- Previous logs showed successful `leaveCurrentPage()` calls
- The system has been working for page transitions
- Real-time events are being received

**Likelihood:** LOW

### Hypothesis 2: Database Record Being Deleted 🤔
**Theory:** When `daveroom@gmail.com` leaves the Extensions page, the record is being DELETED instead of marked `is_active: false`.

**Evidence For:**
- This would explain why the backend query returns no results
- Some cleanup logic might be deleting old records

**Evidence Against:**
- The `leaveCurrentPage()` code clearly does UPDATE, not DELETE
- No DELETE logic visible in the codebase

**Likelihood:** MEDIUM

### Hypothesis 3: Multiple Records for Same User/Page ⚠️
**Theory:** There are MULTIPLE records for `daveroom@gmail.com` + Extensions page, and the wrong one is being queried.

**Evidence For:**
- If there's no PRIMARY KEY constraint on (user_email, page_id), duplicates are possible
- UPSERT logic might be creating new records instead of updating

**Evidence Against:**
- The schema should have proper constraints

**Likelihood:** MEDIUM-HIGH

### Hypothesis 4: Timing Issue - Record Too Old 🎯
**Theory:** When `themetalayer@gmail.com` navigates to the Extensions page, `daveroom@gmail.com`'s `last_seen` timestamp is older than 30 minutes, so it's filtered out by the backend query.

**Evidence For:**
- Backend queries use `gte('last_seen', recentThreshold)` where `recentThreshold = NOW() - 30 minutes`
- If the test took longer than 30 minutes, this would explain it

**Evidence Against:**
- The screenshots show this happening quickly

**Likelihood:** LOW (but possible if testing was slow)

### Hypothesis 5: Wrong page_id Being Queried 🔍
**Theory:** The `page_id` being sent to the backend doesn't match the `page_id` stored in the database for `daveroom@gmail.com`.

**Evidence For:**
- URL normalization might be inconsistent
- Different profiles might generate different page_ids

**Evidence Against:**
- The logs show the same `page_id` being used consistently
- `themetalayer@gmail.com`'s record is found correctly

**Likelihood:** LOW

### Hypothesis 6: Backend Query Logic Error 🎯🎯🎯
**Theory:** The backend query has a subtle bug that's filtering out `daveroom@gmail.com` even though the record exists.

**Evidence For:**
- The backend code was recently modified (Oct 14 fix)
- Complex query logic with multiple conditions
- Might be an edge case we didn't test

**Evidence Against:**
- The code looks correct in the file

**Likelihood:** **HIGH** - Most likely culprit

---

## 🔬 Diagnostic Steps

### Step 1: Check Database Directly ✅
**Run:** `diagnose-missing-last-seen.sql` in Supabase SQL Editor

**What to look for:**
1. Does `daveroom@gmail.com` have a record for the Extensions page?
2. What is the `is_active` status?
3. What is the `last_seen` timestamp?
4. Are there MULTIPLE records for the same user/page?
5. Is there a PRIMARY KEY constraint?

### Step 2: Check Backend Logs 📋
**Action:** Check the backend server logs for the `getPresenceByUrl` API call

**What to look for:**
```
🔍 BACKEND: Querying for recently inactive users on THIS page
🔍 DEBUG: Active users on THIS page: X records
🔍 DEBUG: Recently inactive users on THIS page: Y records
```

**Expected:** Should show `daveroom@gmail.com` in the "Recently inactive" list

### Step 3: Add More Logging to Backend 🔍
**Action:** Add detailed logging to `presenceService.js` to see exactly what the database queries return

```javascript
// After the inactive users query
console.log('🔍 BACKEND_DETAILED: Recently inactive query results:', JSON.stringify(recentData, null, 2));
```

### Step 4: Test with Fresh Data 🧪
**Action:** Clear all presence data and test from scratch

```sql
-- Clear all presence data
DELETE FROM user_presence;

-- Then test the flow again
```

---

## 💡 Most Likely Root Cause

Based on the evidence, **Hypothesis 6** is most likely:

**The backend query is not returning inactive users correctly.**

### Possible Sub-Issues:

#### A. UPSERT Logic Creating New Records
When a user becomes active on a page, the UPSERT might be creating a NEW record instead of updating the existing one. This would leave the old `is_active: false` record orphaned.

**Fix:** Ensure UPSERT uses the correct composite key:
```javascript
.upsert({
  user_email: email,
  page_id: pageId,
  // ...
}, {
  onConflict: 'user_email,page_id'  // ← CRITICAL!
})
```

#### B. No Composite Primary Key
If the `user_presence` table doesn't have a PRIMARY KEY on `(user_email, page_id)`, multiple records can exist, causing query confusion.

**Fix:** Add composite primary key:
```sql
ALTER TABLE user_presence
ADD CONSTRAINT user_presence_pkey 
PRIMARY KEY (user_email, page_id);
```

#### C. Backend Query Missing Records
The backend query might have a subtle bug in the WHERE clause or JOIN logic.

**Fix:** Simplify the query and add extensive logging.

---

## 🛠️ Recommended Fixes

### Fix 1: Add Composite Primary Key (CRITICAL) ⭐⭐⭐
```sql
-- Check if primary key exists
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'user_presence'::regclass;

-- If no primary key on (user_email, page_id), add it:
-- First, remove duplicates
WITH ranked_records AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_email, page_id 
      ORDER BY last_seen DESC
    ) AS rn
  FROM user_presence
)
DELETE FROM user_presence
WHERE id IN (
  SELECT id FROM ranked_records WHERE rn > 1
);

-- Then add the constraint
ALTER TABLE user_presence
DROP CONSTRAINT IF EXISTS user_presence_pkey;

ALTER TABLE user_presence
ADD CONSTRAINT user_presence_pkey 
PRIMARY KEY (user_email, page_id);
```

### Fix 2: Ensure UPSERT Uses Correct Conflict Resolution ⭐⭐
```javascript
// In supabase-realtime-client.js updatePresence()
const { error } = await this.supabase
  .from('user_presence')
  .upsert({
    user_email: this.currentUser.userEmail,
    page_id: pageId,
    page_url: pageUrl,
    is_active: true,
    last_seen: new Date().toISOString(),
    enter_time: enterTime,
    aura_color: auraColor
  }, {
    onConflict: 'user_email,page_id',  // ← ADD THIS!
    ignoreDuplicates: false
  });
```

### Fix 3: Add Comprehensive Backend Logging ⭐
```javascript
// In presenceService.js getActiveUsers()
console.log('🔍 BACKEND_QUERY: Active users query:', {
  pageId,
  activeThreshold: activeThreshold.toISOString(),
  recentThreshold: recentThreshold.toISOString()
});

console.log('🔍 BACKEND_RESULT: Active users:', JSON.stringify(activeData, null, 2));
console.log('🔍 BACKEND_RESULT: Recent users:', JSON.stringify(recentData, null, 2));
```

### Fix 4: Add Client-Side Diagnostic Function ⭐
```javascript
// Add to sidepanel.js for console debugging
window.diagnoseLastSeen = async function() {
  console.log('🔬 DIAGNOSTIC: Checking last seen status...');
  
  const pageId = window.supabaseRealtimeClient?.currentPage?.pageId;
  console.log('🔬 Current page ID:', pageId);
  
  // Query Supabase directly
  const { data, error } = await window.supabase
    .from('user_presence')
    .select('*')
    .eq('page_id', pageId)
    .order('last_seen', { ascending: false });
  
  console.log('🔬 All presence records for this page:', data);
  console.log('🔬 Active users:', data?.filter(r => r.is_active));
  console.log('🔬 Inactive users:', data?.filter(r => !r.is_active));
  
  return data;
};
```

---

## 🧪 Testing Plan (TE2)

### Test 1: Basic Last Seen
1. Profile A joins Page X
2. Profile B joins Page X (should see Profile A)
3. Profile A leaves Page X
4. Profile B should see "Profile A - Last seen X seconds ago"

### Test 2: Cross Navigation
1. Profile A joins Page X
2. Profile B joins Page Y
3. Profile A navigates to Page Y
4. Profile A should see "Profile B - Now"
5. Profile B should see "Profile A - Now"

### Test 3: Return to Previous Page
1. Profile A joins Page X
2. Profile B joins Page X
3. Profile A navigates to Page Y
4. Profile B should see "Profile A - Last seen X ago"
5. Profile A navigates back to Page X
6. Both should see each other as "Now"

### Test 4: Multiple Users
1. Profiles A, B, C all join Page X
2. A leaves, B stays, C leaves
3. B should see both A and C with "Last seen" status

---

## 📋 Next Steps

1. **Run `diagnose-missing-last-seen.sql`** to check database state
2. **Check backend logs** for the API call
3. **Add composite primary key** if missing
4. **Add `onConflict` to UPSERT** calls
5. **Add backend logging** to see query results
6. **Test with fresh data** after fixes
7. **Store solution in JAUmemory** with tags

---

## 🔗 Related Files

- `services/presenceService.js` - Backend API
- `presence/supabase-realtime-client.js` - UPSERT logic
- `presence/sidepanel.js` - Frontend display
- `diagnose-missing-last-seen.sql` - Diagnostic queries

---

**Status:** INVESTIGATING  
**Priority:** HIGH  
**Assigned:** SD1, TE2


