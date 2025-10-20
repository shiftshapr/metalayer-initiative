# Quick Action Plan: Fix "Last Seen" Status

**Issue:** Users not showing "Last seen X ago" when they navigate away from a page.

---

## 🚀 Immediate Actions (Run These Now!)

### 1. Run Diagnostic in Console ⭐⭐⭐
```javascript
// In the sidepanel console of the profile that's NOT seeing the other user:
await diagnoseLastSeenIssue()
```

**What it does:** Compares database state with backend API response to find the discrepancy.

**Expected output:** Will show if backend is missing users that exist in the database.

---

### 2. Run SQL Diagnostic in Supabase ⭐⭐⭐
Open `diagnose-missing-last-seen.sql` in Supabase SQL Editor and run all queries.

**What to look for:**
- Does `daveroom@gmail.com` have a record for the Extensions page?
- Is `is_active` set to `false`?
- Is `last_seen` within the last 30 minutes?
- Are there duplicate records?

---

### 3. Check Primary Key ⭐⭐
Run `check-primary-key.sql` in Supabase SQL Editor.

**Expected:** Should have PRIMARY KEY on `(user_email, page_id)`

**If missing:** Run this fix:
```sql
-- Remove duplicates first
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

-- Add primary key
ALTER TABLE user_presence
DROP CONSTRAINT IF EXISTS user_presence_pkey;

ALTER TABLE user_presence
ADD CONSTRAINT user_presence_pkey 
PRIMARY KEY (user_email, page_id);
```

---

## 📊 What We Know So Far

### ✅ Working Correctly:
1. Real-time events are being received
2. UPSERT has correct `onConflict: 'user_email,page_id'`
3. Frontend is ready to display "Last seen" status
4. `leaveCurrentPage()` is being called

### ❌ Not Working:
1. Backend API not returning inactive users
2. "Last seen X ago" not displaying

### 🤔 Unknown:
1. Is the database record being created with `is_active: false`?
2. Are there duplicate records?
3. Is the backend query filtering incorrectly?

---

## 🔍 Diagnostic Files Created

1. **`diagnose-last-seen-issue.js`** - Console diagnostic tool
2. **`diagnose-missing-last-seen.sql`** - SQL queries for database inspection
3. **`check-primary-key.sql`** - Check table constraints
4. **`SD1-ANALYSIS-MISSING-LAST-SEEN-OCT-14.md`** - Comprehensive analysis

---

## 📝 Next Steps After Diagnostics

Based on diagnostic results, apply one of these fixes:

### Fix A: Add Primary Key (if missing)
See step 3 above.

### Fix B: Backend Query Logic
If backend is filtering incorrectly, check `services/presenceService.js` lines 235-241.

### Fix C: Clean Up Duplicates
If duplicates exist, run the duplicate removal SQL from step 3.

---

## 🎯 Success Criteria

After fixes:
1. Run `diagnoseLastSeenIssue()` - should show no discrepancy
2. Test: User A on Page X, User B joins, User A leaves
3. User B should see "User A - Last seen X seconds ago"

---

**Status:** READY TO DIAGNOSE  
**Priority:** HIGH  
**Estimated Time:** 15-30 minutes


