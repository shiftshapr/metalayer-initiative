-- ═══════════════════════════════════════════════════════════════
-- URGENT: Run this SQL in Supabase SQL Editor NOW
-- This will diagnose why daveroom is not showing "Last seen"
-- ═══════════════════════════════════════════════════════════════

-- DIAGNOSTIC 1: Check ALL presence records for Extensions page
-- This shows EVERYTHING in the database for this page
SELECT 
  user_email,
  is_active,
  last_seen,
  enter_time,
  EXTRACT(EPOCH FROM (NOW() - last_seen)) / 60 AS minutes_ago,
  COUNT(*) OVER (PARTITION BY user_email, page_id) AS duplicate_count,
  id
FROM user_presence
WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
ORDER BY last_seen DESC;

-- EXPECTED RESULT:
-- Should show BOTH themetalayer AND daveroom
-- daveroom should have is_active = false
-- If you see duplicate_count > 1, that's the problem!

-- ═══════════════════════════════════════════════════════════════

-- DIAGNOSTIC 2: Check if daveroom has ANY records
SELECT 
  user_email,
  page_id,
  is_active,
  last_seen,
  enter_time,
  EXTRACT(EPOCH FROM (NOW() - last_seen)) / 60 AS minutes_ago
FROM user_presence
WHERE user_email = 'daveroom@gmail.com'
ORDER BY last_seen DESC
LIMIT 10;

-- EXPECTED RESULT:
-- Should show daveroom's presence records
-- Look for the Extensions page record

-- ═══════════════════════════════════════════════════════════════

-- DIAGNOSTIC 3: Simulate Backend Query (What SHOULD be returned)
WITH 
  active_threshold AS (SELECT NOW() - INTERVAL '5 minutes' AS t),
  recent_threshold AS (SELECT NOW() - INTERVAL '30 minutes' AS t)
SELECT 
  'ACTIVE' AS user_type,
  user_email,
  is_active,
  last_seen,
  EXTRACT(EPOCH FROM (NOW() - last_seen)) / 60 AS minutes_ago
FROM user_presence
WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
  AND is_active = true
  AND last_seen >= (SELECT t FROM active_threshold)
UNION ALL
SELECT 
  'INACTIVE' AS user_type,
  user_email,
  is_active,
  last_seen,
  EXTRACT(EPOCH FROM (NOW() - last_seen)) / 60 AS minutes_ago
FROM user_presence
WHERE page_id = 'chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl'
  AND is_active = false
  AND last_seen >= (SELECT t FROM recent_threshold)
ORDER BY user_type, last_seen DESC;

-- EXPECTED RESULT:
-- Should show:
-- - ACTIVE: themetalayer (is_active = true)
-- - INACTIVE: daveroom (is_active = false)
-- If daveroom is missing here, check if minutes_ago > 30

-- ═══════════════════════════════════════════════════════════════

-- DIAGNOSTIC 4: Check for PRIMARY KEY
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_presence'::regclass
  AND contype = 'p';

-- EXPECTED RESULT:
-- Should show: PRIMARY KEY (user_email, page_id)
-- If empty or different, that's a problem!

-- ═══════════════════════════════════════════════════════════════
-- ═══════════════════════════════════════════════════════════════
-- PASTE THE RESULTS HERE AND SHARE WITH THE ENGINEER
-- ═══════════════════════════════════════════════════════════════


