-- ═══════════════════════════════════════════════════════════════════
-- CRITICAL FIX: Enable Realtime for user_visibility table
-- ═══════════════════════════════════════════════════════════════════
-- 
-- PROBLEM DISCOVERED:
-- The WebSocket tracer revealed this error from Supabase:
-- 
-- {:error, "Unable to subscribe to changes with given parameters. 
--  Please check Realtime is enabled for the given connect parameters: 
--  [event: *, filter: page_id=eq.chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl, 
--   schema: public, table: user_visibility]"}
-- 
-- ROOT CAUSE:
-- The user_visibility table was NOT properly configured for Supabase Realtime.
-- Three things are required:
--   1. REPLICA IDENTITY FULL (to broadcast all column changes)
--   2. Added to supabase_realtime publication
--   3. RLS policies that allow SELECT for authenticated users
-- 
-- ═══════════════════════════════════════════════════════════════════

-- STEP 1: Check current status
-- ───────────────────────────────────────────────────────────────────

-- Check REPLICA IDENTITY
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
  AND c.relname = 'user_visibility';

-- Check if in publication
SELECT
  schemaname,
  tablename,
  pubname
FROM
  pg_publication_tables
WHERE
  tablename = 'user_visibility'
  AND pubname = 'supabase_realtime';

-- Check RLS policies
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
  tablename = 'user_visibility'
ORDER BY
  policyname;

-- ═══════════════════════════════════════════════════════════════════

-- STEP 2: Apply the fixes
-- ───────────────────────────────────────────────────────────────────

-- Fix 1: Set REPLICA IDENTITY FULL
ALTER TABLE public.user_visibility REPLICA IDENTITY FULL;

-- Fix 2: Add to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_visibility;

-- Fix 3: Ensure RLS allows SELECT for authenticated users
-- (Only run if the policy doesn't already exist)

-- First, enable RLS if not already enabled
ALTER TABLE public.user_visibility ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read visibility" ON public.user_visibility;
DROP POLICY IF EXISTS "Allow users to read visibility" ON public.user_visibility;

-- Create a comprehensive SELECT policy for authenticated users
CREATE POLICY "Allow authenticated users to read visibility"
ON public.user_visibility
FOR SELECT
TO authenticated
USING (true);

-- ═══════════════════════════════════════════════════════════════════

-- STEP 3: Verify the fixes
-- ───────────────────────────────────────────────────────────────────

-- Should show FULL ✅
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
  AND c.relname = 'user_visibility';

-- Should show user_visibility in supabase_realtime
SELECT
  schemaname,
  tablename,
  pubname
FROM
  pg_publication_tables
WHERE
  tablename = 'user_visibility'
  AND pubname = 'supabase_realtime';

-- Should show the SELECT policy
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM
  pg_policies
WHERE
  tablename = 'user_visibility';

-- ═══════════════════════════════════════════════════════════════════

-- STEP 4: Test the fix
-- ───────────────────────────────────────────────────────────────────
-- 
-- 1. Run this SQL script in Supabase SQL Editor
-- 2. Reload the Chrome extension on BOTH profiles
-- 3. Open sidepanel on both profiles
-- 4. Navigate to the same page on both
-- 5. Run traceWebSocketMessages() in one console
-- 6. Navigate to a different page in the other profile
-- 7. You should now see postgres_changes events in the WebSocket trace!
-- 
-- Expected WebSocket message:
-- {
--   "topic": "realtime:page-chrome_extensions_...",
--   "event": "postgres_changes",
--   "payload": {
--     "data": {
--       "user_email": "...",
--       "page_id": "...",
--       "is_active": false,
--       ...
--     },
--     "errors": null
--   }
-- }
-- 
-- ═══════════════════════════════════════════════════════════════════

-- IMPORTANT NOTES:
-- 
-- 1. The error message explicitly stated that user_visibility was not
--    properly configured for Realtime. This script fixes that.
-- 
-- 2. After running this, the WebSocket tracer should start showing
--    postgres_changes events instead of error messages.
-- 
-- 3. This is separate from user_presence (which was already fixed).
--    The extension subscribes to BOTH tables for different purposes:
--    - user_presence: Who is online and where
--    - user_visibility: Who can see whom (based on communities/permissions)
-- 
-- 4. If you still see errors after this fix, check:
--    - Supabase Dashboard > Database > Replication > supabase_realtime
--    - Ensure both user_presence AND user_visibility are checked
-- 
-- ═══════════════════════════════════════════════════════════════════

