-- SD1 + TE2: Comprehensive Realtime Check and Fix
-- Run these queries in Supabase SQL Editor to diagnose and fix realtime issues

-- ============================================================================
-- STEP 1: CHECK WAL LEVEL (CRITICAL)
-- ============================================================================
-- This is THE most important check
-- Expected result: "logical"
-- If result is "replica" or "minimal", realtime WILL NOT WORK

SHOW wal_level;

-- ============================================================================
-- STEP 2: CHECK RLS POLICIES
-- ============================================================================
-- This shows all RLS policies for realtime-critical tables
-- Look for policies that allow SELECT for 'anon' role

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('user_presence', 'messages', 'user_visibility')
ORDER BY tablename, policyname;

-- ============================================================================
-- STEP 3: CHECK PUBLICATION STATUS
-- ============================================================================
-- Verify tables are in supabase_realtime publication
-- AND that all columns are included

SELECT 
  schemaname,
  tablename,
  attnames,
  rowfilter
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('user_presence', 'messages', 'user_visibility');

-- ============================================================================
-- STEP 4: CHECK TABLE REPLICA IDENTITY
-- ============================================================================
-- For realtime to work, tables need proper replica identity
-- Expected: 'f' (full) or 'd' (default)

SELECT 
  schemaname,
  tablename,
  relreplident
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('user_presence', 'messages', 'user_visibility')
  AND n.nspname = 'public';

-- Legend:
-- 'd' = default (primary key)
-- 'f' = full (all columns)
-- 'i' = index
-- 'n' = nothing (BAD - realtime won't work)

-- ============================================================================
-- FIXES (Run these if issues are found)
-- ============================================================================

-- FIX 1: Add RLS Policies for anon Role (Required for Realtime)
-- Run these if Step 2 shows no SELECT policies for 'anon' role

-- Enable RLS if not already enabled
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_visibility ENABLE ROW LEVEL SECURITY;

-- Create SELECT policies for anon role (REQUIRED for realtime)
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

-- Also ensure authenticated users can see all (for completeness)
CREATE POLICY IF NOT EXISTS "Enable read for authenticated on user_presence"
ON public.user_presence
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY IF NOT EXISTS "Enable read for authenticated on messages"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY IF NOT EXISTS "Enable read for authenticated on user_visibility"
ON public.user_visibility
FOR SELECT
TO authenticated
USING (true);

-- FIX 2: Set Replica Identity to FULL (if needed)
-- Run these if Step 4 shows 'n' (nothing) for any table

ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.user_visibility REPLICA IDENTITY FULL;

-- FIX 3: Ensure Tables are in Publication (should already be done)
-- Run this if Step 3 doesn't show all three tables

ALTER PUBLICATION supabase_realtime SET TABLE
  public.user_presence,
  public.messages,
  public.user_visibility;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after applying fixes to verify everything is correct

-- Check 1: Verify anon can SELECT from user_presence
SET ROLE anon;
SELECT COUNT(*) FROM public.user_presence;
RESET ROLE;
-- If this fails, RLS policies are still blocking

-- Check 2: Verify publication includes tables
SELECT COUNT(*) as table_count
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('user_presence', 'messages', 'user_visibility');
-- Should return: 3

-- Check 3: Get current presence data for testing
SELECT 
  user_email,
  page_id,
  is_active,
  last_seen,
  enter_time
FROM public.user_presence
WHERE is_active = true
ORDER BY last_seen DESC
LIMIT 10;

-- ============================================================================
-- NOTES
-- ============================================================================

-- If WAL level is NOT "logical":
--   → This requires PostgreSQL restart and usually superuser access
--   → On Supabase Cloud, this should already be set to "logical"
--   → If it's not, contact Supabase support
--   → On self-hosted: ALTER SYSTEM SET wal_level = 'logical'; then restart

-- If RLS policies are blocking:
--   → This is the most common issue
--   → Run FIX 1 above to add SELECT policies for anon
--   → Realtime REQUIRES SELECT permission for anon role

-- If tables are not in publication:
--   → Run FIX 3 above
--   → You already did this, so this should be fine

-- If replica identity is 'n' (nothing):
--   → Run FIX 2 above
--   → This tells PostgreSQL to include full row data in WAL

-- ============================================================================
-- Expected Results After All Fixes:
-- ============================================================================

-- SHOW wal_level;
-- → Result: "logical"

-- SELECT FROM pg_policies...
-- → Should show SELECT policies for anon on all three tables

-- SELECT FROM pg_publication_tables...
-- → Should show all three tables

-- SELECT relreplident...
-- → Should show 'f' (full) or 'd' (default) for all tables

-- Frontend test: await quickRealtimeTest()
-- → Should show "✅ Events ARE working!"

-- ============================================================================

