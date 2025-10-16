-- ═══════════════════════════════════════════════════════════════════
-- SIMPLE FIX: Enable Realtime for user_visibility table
-- ═══════════════════════════════════════════════════════════════════
-- 
-- This is a simplified, foolproof version with NO diagnostic queries
-- Just the three commands needed to fix the issue
-- 
-- ═══════════════════════════════════════════════════════════════════

-- Command 1: Set REPLICA IDENTITY FULL
ALTER TABLE public.user_visibility REPLICA IDENTITY FULL;

-- Command 2: Add to supabase_realtime publication (if not already added)
-- Note: If you see "already member of publication" error, that's GOOD!
-- It means this step was already completed successfully.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_visibility;
  RAISE NOTICE 'Added user_visibility to publication';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'user_visibility is already in publication (this is good!)';
END $$;

-- Command 3: Ensure RLS allows SELECT for authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to read visibility" ON public.user_visibility;
CREATE POLICY "Allow authenticated users to read visibility"
ON public.user_visibility
FOR SELECT
TO authenticated
USING (true);

-- ═══════════════════════════════════════════════════════════════════
-- DONE! Now verify with these simple queries:
-- ═══════════════════════════════════════════════════════════════════

-- Query 1: Check REPLICA IDENTITY (should show 'f')
SELECT c.relname, c.relreplident
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'user_visibility';

-- Query 2: Check publication (should show 1 row)
SELECT COUNT(*) as is_in_publication
FROM pg_publication_tables
WHERE tablename = 'user_visibility' AND pubname = 'supabase_realtime';

-- Query 3: Check RLS policy (should show the policy)
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'user_visibility' AND policyname = 'Allow authenticated users to read visibility';

-- ═══════════════════════════════════════════════════════════════════
-- If all three queries return results, the fix is complete!
-- Reload your Chrome extension and test with traceWebSocketMessages()
-- ═══════════════════════════════════════════════════════════════════

