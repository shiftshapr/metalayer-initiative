-- ═══════════════════════════════════════════════════════════════
-- CRITICAL FIX: Add Composite Primary Key to user_presence
-- ═══════════════════════════════════════════════════════════════
-- 
-- PROBLEM FOUND:
-- Current PRIMARY KEY: (id) - allows duplicates!
-- Needed PRIMARY KEY: (user_email, page_id) - prevents duplicates!
--
-- This is why "Last seen" is not working - duplicate records confuse
-- the backend query logic.
-- ═══════════════════════════════════════════════════════════════

-- STEP 1: Check for duplicate records BEFORE we fix
-- This will show if duplicates exist
SELECT 
  user_email,
  page_id,
  COUNT(*) AS duplicate_count,
  ARRAY_AGG(id) AS record_ids,
  ARRAY_AGG(is_active) AS is_active_values,
  ARRAY_AGG(last_seen ORDER BY last_seen DESC) AS last_seen_values
FROM user_presence
GROUP BY user_email, page_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- If you see results here, you have duplicates!
-- ═══════════════════════════════════════════════════════════════

-- STEP 2: Remove duplicate records (keep the most recent one)
-- This uses a CTE to identify duplicates and delete all but the newest
WITH ranked_records AS (
  SELECT 
    id,
    user_email,
    page_id,
    last_seen,
    ROW_NUMBER() OVER (
      PARTITION BY user_email, page_id 
      ORDER BY last_seen DESC NULLS LAST, created_at DESC NULLS LAST
    ) AS rn
  FROM user_presence
)
DELETE FROM user_presence
WHERE id IN (
  SELECT id 
  FROM ranked_records 
  WHERE rn > 1
);

-- This will delete duplicate records, keeping only the most recent one
-- ═══════════════════════════════════════════════════════════════

-- STEP 3: Drop the old PRIMARY KEY constraint
ALTER TABLE user_presence
DROP CONSTRAINT IF EXISTS user_presence_pkey;

-- ═══════════════════════════════════════════════════════════════

-- STEP 4: Add the new COMPOSITE PRIMARY KEY
-- This prevents future duplicates!
ALTER TABLE user_presence
ADD CONSTRAINT user_presence_pkey 
PRIMARY KEY (user_email, page_id);

-- ═══════════════════════════════════════════════════════════════

-- STEP 5: Verify the fix
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_presence'::regclass
  AND contype = 'p';

-- Should now show: PRIMARY KEY (user_email, page_id)
-- ═══════════════════════════════════════════════════════════════

-- STEP 6: Check that no duplicates remain
SELECT 
  user_email,
  page_id,
  COUNT(*) AS count
FROM user_presence
GROUP BY user_email, page_id
HAVING COUNT(*) > 1;

-- Should return NO rows (empty result)
-- ═══════════════════════════════════════════════════════════════

-- STEP 7: Verify current data looks correct
SELECT 
  user_email,
  page_id,
  is_active,
  last_seen,
  enter_time,
  EXTRACT(EPOCH FROM (NOW() - last_seen)) / 60 AS minutes_ago
FROM user_presence
WHERE page_id = 'google_com_'
ORDER BY last_seen DESC;

-- Should show both themetalayer and daveroom with correct status
-- ═══════════════════════════════════════════════════════════════

-- ✅ DONE! 
-- After running this:
-- 1. Reload your extension
-- 2. Run: await te2RunAllTests()
-- 3. "Last seen" should now work!
-- ═══════════════════════════════════════════════════════════════


