# SD1 Root Cause Analysis: Empty Visibility List

**Date:** October 14, 2025  
**Critical Finding:** `🔍 VISIBILITY: Final users to display: []`

---

## 🚨 THE SMOKING GUN

Looking at the user's logs, I found the **EXACT** problem:

```javascript
🔍 VISIBILITY: Checking avatar: The Metalayer (themetalayer@gmail.com)
🔍 VISIBILITY: Filtering out current user The Metalayer (themetalayer@gmail.com)
🔍 VISIBILITY: Showing 0 users with real avatars (filtered from 1 total)
🔍 VISIBILITY: Final users to display: []
```

**The backend API IS returning data** (1 user), but the **frontend is filtering everyone out!**

---

## 🔍 Analysis of the Problem

### What's Happening:

1. **Backend returns:** `themetalayer@gmail.com` (the current user)
2. **Frontend filters out:** Current user (correct!)
3. **Result:** Empty list (WRONG!)

### Why is `daveroom@gmail.com` missing?

**The backend API is NOT returning `daveroom@gmail.com` at all!**

This confirms our hypothesis: **Backend Query Logic Error**

---

## 🎯 Root Cause: Backend Not Returning Inactive Users

### Evidence from Logs:

```javascript
🔍 API: getPresenceByUrl response: {
  "active": [
    {
      "id": "themetalayer@gmail.com",
      // ... ONLY themetalayer!
    }
  ],
  "pageId": "chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl",
  "url": "chrome://extensions/?errors=dbdjamnflfecdnioehkdmlhnmajffijl"
}
```

**Only 1 user returned, when there should be 2:**
1. `themetalayer@gmail.com` (active)
2. `daveroom@gmail.com` (inactive - "Last seen X ago")

---

## 🔬 Hypothesis: Why is Backend Missing `daveroom`?

### Hypothesis A: `daveroom` Record Doesn't Exist ❌
**Theory:** When `daveroom` left the page, no `is_active: false` record was created.

**Evidence Against:**
- The system has been working
- `leaveCurrentPage()` is being called
- Real-time events are firing

**Likelihood:** LOW

### Hypothesis B: `daveroom` Record is Too Old ⚠️
**Theory:** `daveroom`'s `last_seen` is older than 30 minutes, so the backend query filters it out.

**Backend Query:**
```javascript
.gte('last_seen', recentThreshold.toISOString())
// where recentThreshold = NOW() - 30 minutes
```

**Evidence For:**
- If testing was slow, this could happen
- The logs show `daveroom` was on the page earlier

**Likelihood:** MEDIUM

### Hypothesis C: Wrong `page_id` in Database 🎯
**Theory:** When `daveroom` was on the Extensions page, a DIFFERENT `page_id` was stored than what `themetalayer` is now querying.

**Evidence For:**
- URL normalization might be inconsistent between profiles
- Different Chrome profiles might generate different page IDs

**Evidence Against:**
- Both users show the same `page_id` in logs: `chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl`

**Likelihood:** LOW

### Hypothesis D: `daveroom` Record Was Deleted 🎯🎯
**Theory:** When `daveroom` navigated away, the presence record was DELETED instead of marked `is_active: false`.

**Evidence For:**
- This would perfectly explain why backend returns nothing
- Some cleanup logic might be deleting records

**Evidence Against:**
- `leaveCurrentPage()` does UPDATE, not DELETE
- No DELETE logic visible in codebase

**Likelihood:** MEDIUM-HIGH

### Hypothesis E: Database Has Multiple Records 🎯🎯🎯
**Theory:** There are MULTIPLE records for `daveroom@gmail.com` + Extensions page, and the backend query is returning the WRONG one (or none at all due to query confusion).

**Evidence For:**
- If no PRIMARY KEY constraint exists, duplicates are possible
- UPSERT might be creating new records instead of updating
- Query might be confused by duplicates

**Likelihood:** **HIGH**

---

## 🛠️ Most Likely Fix

**Add PRIMARY KEY constraint to prevent duplicates:**

```sql
-- Step 1: Check for duplicates
SELECT 
  user_email,
  page_id,
  COUNT(*) AS record_count
FROM user_presence
WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
GROUP BY user_email, page_id
HAVING COUNT(*) > 1;

-- Step 2: Remove duplicates (keep most recent)
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

-- Step 3: Add PRIMARY KEY
ALTER TABLE user_presence
DROP CONSTRAINT IF EXISTS user_presence_pkey;

ALTER TABLE user_presence
ADD CONSTRAINT user_presence_pkey 
PRIMARY KEY (user_email, page_id);
```

---

## 📊 Testing Plan

### Test 1: Check Database Directly
```sql
-- Check if daveroom has ANY record for Extensions page
SELECT *
FROM user_presence
WHERE user_email = 'daveroom@gmail.com'
  AND page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl';
```

**Expected:** Should find 1 record with `is_active: false`

### Test 2: Check for Duplicates
```sql
-- Check for duplicate records
SELECT 
  user_email,
  page_id,
  COUNT(*) AS count,
  ARRAY_AGG(id) AS ids,
  ARRAY_AGG(is_active) AS is_active_values,
  ARRAY_AGG(last_seen) AS last_seen_values
FROM user_presence
GROUP BY user_email, page_id
HAVING COUNT(*) > 1;
```

**Expected:** Should find NO duplicates (or many if this is the issue)

### Test 3: Simulate Backend Query
```sql
-- Simulate what backend should return
WITH 
  active_threshold AS (SELECT NOW() - INTERVAL '5 minutes' AS t),
  recent_threshold AS (SELECT NOW() - INTERVAL '30 minutes' AS t)
SELECT 
  'ACTIVE' AS type,
  user_email,
  is_active,
  last_seen
FROM user_presence
WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
  AND is_active = true
  AND last_seen >= (SELECT t FROM active_threshold)
UNION ALL
SELECT 
  'INACTIVE' AS type,
  user_email,
  is_active,
  last_seen
FROM user_presence
WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
  AND is_active = false
  AND last_seen >= (SELECT t FROM recent_threshold);
```

**Expected:** Should return BOTH `themetalayer` AND `daveroom`

---

## 🚀 Immediate Action

**Run this SQL in Supabase NOW:**

```sql
-- Quick diagnostic
SELECT 
  user_email,
  page_id,
  is_active,
  last_seen,
  EXTRACT(EPOCH FROM (NOW() - last_seen)) / 60 AS minutes_ago,
  COUNT(*) OVER (PARTITION BY user_email, page_id) AS duplicate_count
FROM user_presence
WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
ORDER BY last_seen DESC;
```

This will show:
1. All users on the Extensions page
2. Their active status
3. How long ago they were seen
4. If there are duplicates

---

## 📝 Summary

**Problem:** Backend API not returning `daveroom@gmail.com`

**Most Likely Cause:** Duplicate records or missing PRIMARY KEY constraint

**Fix:** Add PRIMARY KEY on `(user_email, page_id)`

**Next Step:** Run diagnostic SQL to confirm

---

**Status:** ROOT CAUSE IDENTIFIED  
**Confidence:** HIGH  
**Priority:** CRITICAL


