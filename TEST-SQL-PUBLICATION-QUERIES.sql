-- ═══════════════════════════════════════════════════════════════════
-- TE2 Test Suite: Publication Query Validation
-- ═══════════════════════════════════════════════════════════════════
-- 
-- PURPOSE: Validate that all SQL queries for checking Supabase Realtime
--          publication configuration work correctly.
-- 
-- RUN THIS: After fixing SQL scripts, before deploying to users
-- 
-- EXPECTED: All queries should execute without errors
-- 
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- Test 1: Verify pg_publication_tables view structure
-- ═══════════════════════════════════════════════════════════════════

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pg_publication_tables'
  AND table_schema = 'pg_catalog'
ORDER BY ordinal_position;

-- Expected output:
-- ┌──────────────┬───────────┐
-- │ column_name  │ data_type │
-- ├──────────────┼───────────┤
-- │ pubname      │ name      │
-- │ schemaname   │ name      │
-- │ tablename    │ name      │
-- └──────────────┴───────────┘
--
-- PASS: If these 3 columns are shown
-- FAIL: If different columns or error

-- ═══════════════════════════════════════════════════════════════════
-- Test 2: Query all publications (baseline check)
-- ═══════════════════════════════════════════════════════════════════

SELECT DISTINCT pubname
FROM pg_publication_tables
ORDER BY pubname;

-- Expected: Should include 'supabase_realtime'
-- PASS: If supabase_realtime is in the list
-- FAIL: If supabase_realtime is missing (Realtime not enabled)

-- ═══════════════════════════════════════════════════════════════════
-- Test 3: Query single table in publication (FIXED QUERY)
-- ═══════════════════════════════════════════════════════════════════

SELECT schemaname, tablename, pubname
FROM pg_publication_tables
WHERE tablename = 'user_visibility'
  AND pubname = 'supabase_realtime';

-- Expected: 
-- - BEFORE fix: NO ROWS (table not configured)
-- - AFTER fix: ONE ROW
-- 
-- PASS: If query executes without error
-- FAIL: If "column s.pubid does not exist" error

-- ═══════════════════════════════════════════════════════════════════
-- Test 4: Query multiple tables (FIXED QUERY)
-- ═══════════════════════════════════════════════════════════════════

SELECT schemaname, tablename, pubname
FROM pg_publication_tables
WHERE tablename IN ('user_presence', 'messages', 'user_visibility')
  AND pubname = 'supabase_realtime'
ORDER BY tablename;

-- Expected:
-- - BEFORE fix: 0-2 rows (depending on which tables are configured)
-- - AFTER fix: 3 rows (all tables configured)
--
-- PASS: If query executes without error
-- FAIL: If "column s.pubid does not exist" error

-- ═══════════════════════════════════════════════════════════════════
-- Test 5: Query all tables in supabase_realtime
-- ═══════════════════════════════════════════════════════════════════

SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;

-- Expected: List of all tables in the publication
-- PASS: If query executes and shows tables
-- FAIL: If error

-- ═══════════════════════════════════════════════════════════════════
-- Test 6: Negative test - non-existent table
-- ═══════════════════════════════════════════════════════════════════

SELECT schemaname, tablename, pubname
FROM pg_publication_tables
WHERE tablename = 'this_table_does_not_exist'
  AND pubname = 'supabase_realtime';

-- Expected: NO ROWS (empty result set)
-- PASS: If query executes and returns 0 rows
-- FAIL: If error (should gracefully return empty set)

-- ═══════════════════════════════════════════════════════════════════
-- Test 7: Negative test - non-existent publication
-- ═══════════════════════════════════════════════════════════════════

SELECT schemaname, tablename, pubname
FROM pg_publication_tables
WHERE pubname = 'this_publication_does_not_exist';

-- Expected: NO ROWS (empty result set)
-- PASS: If query executes and returns 0 rows
-- FAIL: If error

-- ═══════════════════════════════════════════════════════════════════
-- Test 8: Performance check - EXPLAIN the query
-- ═══════════════════════════════════════════════════════════════════

EXPLAIN
SELECT schemaname, tablename, pubname
FROM pg_publication_tables
WHERE tablename = 'user_visibility'
  AND pubname = 'supabase_realtime';

-- Expected: Simple query plan without JOIN operations
-- PASS: If execution plan is clean and simple
-- FAIL: If complex JOIN operations appear

-- ═══════════════════════════════════════════════════════════════════
-- Test 9: Verify no use of non-existent columns
-- ═══════════════════════════════════════════════════════════════════

-- This test SHOULD FAIL if the old broken query is used:
-- 
-- SELECT s.schemaname, s.tablename, p.pubname
-- FROM pg_publication_tables s
-- JOIN pg_publication p ON s.pubid = p.oid
-- WHERE s.tablename = 'user_visibility';
--
-- Expected error: "column s.pubid does not exist"
--
-- If this query SUCCEEDS, the test FAILS (old broken query still in use)
-- If this query FAILS with the expected error, test environment is correct

-- ═══════════════════════════════════════════════════════════════════
-- Test 10: Check PostgreSQL version
-- ═══════════════════════════════════════════════════════════════════

SELECT version();

-- Expected: PostgreSQL 10+ (Supabase typically uses 15.x)
-- PASS: If version is 10.0 or higher
-- FAIL: If version is less than 10 (pg_publication_tables doesn't exist)

-- ═══════════════════════════════════════════════════════════════════
-- Test 11: Verify pg_publication catalog exists
-- ═══════════════════════════════════════════════════════════════════

SELECT COUNT(*) as publication_count
FROM pg_publication;

-- Expected: At least 1 publication (supabase_realtime)
-- PASS: If count > 0
-- FAIL: If count = 0 (no publications exist)

-- ═══════════════════════════════════════════════════════════════════
-- Test 12: Direct query of pg_publication (for reference)
-- ═══════════════════════════════════════════════════════════════════

SELECT pubname, puballtables, pubinsert, pubupdate, pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- Expected: ONE ROW showing supabase_realtime configuration
-- PASS: If supabase_realtime is found
-- FAIL: If no rows (publication doesn't exist)

-- ═══════════════════════════════════════════════════════════════════
-- SUMMARY OF TESTS
-- ═══════════════════════════════════════════════════════════════════
-- 
-- Total tests: 12
-- 
-- Expected results:
-- - All queries should execute without errors
-- - Tests 1-8: Should return data (or empty sets for negative tests)
-- - Test 9: Conceptual test (don't actually run the broken query)
-- - Tests 10-12: Environment verification
-- 
-- If ANY test fails with "column s.pubid does not exist", the old
-- broken query pattern is still in use somewhere.
-- 
-- If ALL tests pass, the SQL scripts are fixed and ready for deployment.
-- 
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- BONUS: Combined health check query
-- ═══════════════════════════════════════════════════════════════════

SELECT 
  'user_presence' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE tablename = 'user_presence' 
        AND pubname = 'supabase_realtime'
    ) THEN '✅ IN PUBLICATION'
    ELSE '❌ NOT IN PUBLICATION'
  END as status
UNION ALL
SELECT 
  'messages' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE tablename = 'messages' 
        AND pubname = 'supabase_realtime'
    ) THEN '✅ IN PUBLICATION'
    ELSE '❌ NOT IN PUBLICATION'
  END as status
UNION ALL
SELECT 
  'user_visibility' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE tablename = 'user_visibility' 
        AND pubname = 'supabase_realtime'
    ) THEN '✅ IN PUBLICATION'
    ELSE '❌ NOT IN PUBLICATION'
  END as status;

-- Expected (AFTER applying fix):
-- ┌─────────────────┬─────────────────────┐
-- │ table_name      │ status              │
-- ├─────────────────┼─────────────────────┤
-- │ user_presence   │ ✅ IN PUBLICATION   │
-- │ messages        │ ✅ IN PUBLICATION   │
-- │ user_visibility │ ✅ IN PUBLICATION   │
-- └─────────────────┴─────────────────────┘
--
-- This single query shows the status of all three critical tables.
-- Run this as a final verification after applying the fix!
--
-- ═══════════════════════════════════════════════════════════════════


