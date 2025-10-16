-- ═══════════════════════════════════════════════════════════════════
-- COMPLETE THE FIX: user_visibility Realtime Configuration
-- ═══════════════════════════════════════════════════════════════════
-- 
-- You got this error: "already member of publication" 
-- That's GOOD NEWS! It means Command 2 already succeeded.
-- 
-- This script completes the remaining steps (Commands 1 and 3)
-- 
-- ═══════════════════════════════════════════════════════════════════

-- Command 1: Set REPLICA IDENTITY FULL
-- This is idempotent - safe to run even if already set
ALTER TABLE public.user_visibility REPLICA IDENTITY FULL;

-- Command 2: SKIP - Already done! (that's what the error told us)
-- ✅ user_visibility is already in supabase_realtime publication

-- Command 3: Ensure RLS allows SELECT for authenticated users
-- DROP IF EXISTS makes this idempotent - safe to run multiple times
DROP POLICY IF EXISTS "Allow authenticated users to read visibility" ON public.user_visibility;
CREATE POLICY "Allow authenticated users to read visibility"
ON public.user_visibility
FOR SELECT
TO authenticated
USING (true);

-- ═══════════════════════════════════════════════════════════════════
-- VERIFICATION: Run these to confirm everything is set up
-- ═══════════════════════════════════════════════════════════════════

-- Should show 'f' (FULL)
SELECT c.relname, c.relreplident
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'user_visibility';

-- Should show 1 (in publication)
SELECT COUNT(*) as is_in_publication
FROM pg_publication_tables
WHERE tablename = 'user_visibility' AND pubname = 'supabase_realtime';

-- Should show the policy
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'user_visibility' AND policyname = 'Allow authenticated users to read visibility';

-- ═══════════════════════════════════════════════════════════════════
-- ALL DONE!
-- 
-- Next steps:
-- 1. Reload Chrome extension on BOTH profiles
-- 2. Run in console: checkRealtimeConfig()
-- 3. Run in console: traceWebSocketMessages()
-- 
-- You should see postgres_changes events and no errors! ✅
-- ═══════════════════════════════════════════════════════════════════


