-- ═══════════════════════════════════════════════════════════════
-- DIAGNOSTIC: Why is "Last Seen" not showing for daveroom?
-- ═══════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to diagnose the issue
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Check ALL presence records for the Extensions page
SELECT 
  user_email,
  page_id,
  is_active,
  last_seen,
  enter_time,
  page_url,
  EXTRACT(EPOCH FROM (NOW() - last_seen)) / 60 AS minutes_since_last_seen
FROM user_presence
WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
ORDER BY last_seen DESC;

-- Step 2: Check what the backend query SHOULD return
-- This mimics the backend logic
WITH 
  active_threshold AS (
    SELECT NOW() - INTERVAL '5 minutes' AS threshold
  ),
  recent_threshold AS (
    SELECT NOW() - INTERVAL '30 minutes' AS threshold
  ),
  active_users AS (
    SELECT *
    FROM user_presence
    WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
      AND is_active = true
      AND last_seen >= (SELECT threshold FROM active_threshold)
    ORDER BY last_seen DESC
  ),
  recent_users AS (
    SELECT *
    FROM user_presence
    WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
      AND is_active = false
      AND last_seen >= (SELECT threshold FROM recent_threshold)
    ORDER BY last_seen DESC
  )
SELECT 
  'ACTIVE' AS user_type,
  user_email,
  is_active,
  last_seen,
  enter_time,
  EXTRACT(EPOCH FROM (NOW() - last_seen)) / 60 AS minutes_ago
FROM active_users
UNION ALL
SELECT 
  'RECENT_INACTIVE' AS user_type,
  user_email,
  is_active,
  last_seen,
  enter_time,
  EXTRACT(EPOCH FROM (NOW() - last_seen)) / 60 AS minutes_ago
FROM recent_users
ORDER BY user_type, last_seen DESC;

-- Step 3: Check if daveroom has ANY presence records
SELECT 
  user_email,
  page_id,
  is_active,
  last_seen,
  enter_time,
  page_url,
  EXTRACT(EPOCH FROM (NOW() - last_seen)) / 60 AS minutes_since_last_seen
FROM user_presence
WHERE user_email = 'daveroom@gmail.com'
ORDER BY last_seen DESC
LIMIT 10;

-- Step 4: Check if there are MULTIPLE records for the same user/page
-- (This could cause issues)
SELECT 
  user_email,
  page_id,
  COUNT(*) AS record_count,
  MAX(last_seen) AS most_recent_last_seen,
  BOOL_OR(is_active) AS any_active
FROM user_presence
WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
GROUP BY user_email, page_id
HAVING COUNT(*) > 1;

-- Step 5: Check the PRIMARY KEY constraint
-- (Should be user_email + page_id to prevent duplicates)
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_presence'::regclass
  AND contype IN ('p', 'u'); -- Primary key or unique constraint


