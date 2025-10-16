-- ═══════════════════════════════════════════════════════════════════
-- Supabase Real-Time Fix: REPLICA IDENTITY (CRITICAL)
-- ═══════════════════════════════════════════════════════════════════
-- 
-- PURPOSE:
-- This script fixes the most common reason for Supabase real-time events
-- not being broadcast: missing REPLICA IDENTITY FULL setting.
-- 
-- PROBLEM DIAGNOSIS:
-- - Subscription shows "SUBSCRIBED" ✅
-- - Database updates work (heartbeat logs) ✅
-- - Callbacks are registered ✅
-- - BUT: No real-time events received ❌
-- 
-- ROOT CAUSE:
-- PostgreSQL uses "REPLICA IDENTITY" to determine which columns to include
-- when broadcasting changes via logical replication (which Supabase Realtime uses).
-- 
-- By default, tables have REPLICA IDENTITY DEFAULT, which only includes
-- the primary key in change notifications. This is often not enough for
-- Supabase Realtime to properly broadcast events to clients.
-- 
-- SOLUTION:
-- Set REPLICA IDENTITY FULL to include ALL columns in change notifications.
-- 
-- ═══════════════════════════════════════════════════════════════════

-- STEP 1: Check current REPLICA IDENTITY setting
-- ───────────────────────────────────────────────────────────────────
-- This query shows the current setting for your tables
-- 
-- Possible values:
--   'd' = DEFAULT (only primary key)
--   'f' = FULL (all columns) ← This is what we need!
--   'n' = NOTHING (no columns)
--   'i' = INDEX (specific index columns)

SELECT
  c.relname AS table_name,
  CASE c.relreplident
    WHEN 'd' THEN 'DEFAULT (primary key only) ❌'
    WHEN 'f' THEN 'FULL (all columns) ✅'
    WHEN 'n' THEN 'NOTHING ❌'
    WHEN 'i' THEN 'INDEX ⚠️'
    ELSE 'UNKNOWN'
  END AS replica_identity_setting,
  c.relreplident AS raw_value
FROM
  pg_class c
JOIN
  pg_namespace n ON n.oid = c.relnamespace
WHERE
  n.nspname = 'public'
  AND c.relname IN ('user_presence', 'messages', 'user_visibility')
ORDER BY
  c.relname;

-- ═══════════════════════════════════════════════════════════════════

-- STEP 2: Fix REPLICA IDENTITY for all realtime tables
-- ───────────────────────────────────────────────────────────────────
-- Run these commands to enable full replication for real-time tables

-- Fix user_presence table (CRITICAL - presence tracking)
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;

-- Fix messages table (for real-time chat)
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Fix user_visibility table (if you're using it)
-- Uncomment if this table exists in your schema:
-- ALTER TABLE public.user_visibility REPLICA IDENTITY FULL;

-- ═══════════════════════════════════════════════════════════════════

-- STEP 3: Verify the fix worked
-- ───────────────────────────────────────────────────────────────────
-- Run this query again to confirm all tables now show 'FULL'

SELECT
  c.relname AS table_name,
  CASE c.relreplident
    WHEN 'd' THEN 'DEFAULT (primary key only) ❌'
    WHEN 'f' THEN 'FULL (all columns) ✅'
    WHEN 'n' THEN 'NOTHING ❌'
    WHEN 'i' THEN 'INDEX ⚠️'
    ELSE 'UNKNOWN'
  END AS replica_identity_setting
FROM
  pg_class c
JOIN
  pg_namespace n ON n.oid = c.relnamespace
WHERE
  n.nspname = 'public'
  AND c.relname IN ('user_presence', 'messages', 'user_visibility')
ORDER BY
  c.relname;

-- Expected output:
-- ┌───────────────┬──────────────────────────┐
-- │ table_name    │ replica_identity_setting │
-- ├───────────────┼──────────────────────────┤
-- │ messages      │ FULL (all columns) ✅    │
-- │ user_presence │ FULL (all columns) ✅    │
-- └───────────────┴──────────────────────────┘

-- ═══════════════════════════════════════════════════════════════════

-- STEP 4: Verify tables are in supabase_realtime publication
-- ───────────────────────────────────────────────────────────────────

SELECT
  schemaname,
  tablename,
  pubname
FROM
  pg_publication_tables
WHERE
  tablename IN ('user_presence', 'messages', 'user_visibility')
  AND pubname = 'supabase_realtime'
ORDER BY
  tablename;

-- Expected output:
-- ┌────────────┬───────────────┬───────────────────┐
-- │ schemaname │ tablename     │ pubname           │
-- ├────────────┼───────────────┼───────────────────┤
-- │ public     │ messages      │ supabase_realtime │
-- │ public     │ user_presence │ supabase_realtime │
-- └────────────┴───────────────┴───────────────────┘

-- If tables are missing, add them:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.user_visibility;

-- ═══════════════════════════════════════════════════════════════════

-- STEP 5: Verify RLS policies allow SELECT for anon/public
-- ───────────────────────────────────────────────────────────────────

SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual::text AS using_expression
FROM
  pg_policies
WHERE
  tablename IN ('user_presence', 'messages', 'user_visibility')
ORDER BY
  tablename, policyname;

-- ═══════════════════════════════════════════════════════════════════

-- IMPORTANT NOTES:
-- 
-- 1. After running these commands, you MUST reload your Chrome extension
--    to establish a new real-time connection.
-- 
-- 2. REPLICA IDENTITY FULL increases the size of WAL (Write-Ahead Log)
--    because it includes all columns in replication. This is acceptable
--    for most applications but could impact performance on very high-write
--    tables.
-- 
-- 3. This setting is REQUIRED for Supabase Realtime to work properly.
--    Without it, Supabase doesn't know what data changed and can't
--    broadcast events to clients.
-- 
-- 4. If you still don't receive events after this fix:
--    a. Check Supabase Dashboard > Settings > API > Realtime is enabled
--    b. Run checkRealtimeBroadcast() in the browser console
--    c. Check browser console for WebSocket connection errors
-- 
-- ═══════════════════════════════════════════════════════════════════

-- TESTING:
-- 
-- After running this script:
-- 
-- 1. Reload Chrome extension on BOTH profiles
-- 2. Open sidepanel on both
-- 3. Navigate to the same page
-- 4. In ONE console, run: checkRealtimeBroadcast()
-- 5. You should see 🔔🔔🔔 REALTIME_EVENT_ARRIVED logs
-- 
-- ═══════════════════════════════════════════════════════════════════

