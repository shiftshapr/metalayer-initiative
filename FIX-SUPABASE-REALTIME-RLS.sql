-- ============================================================================
-- FIX: Supabase Real-time Not Sending Events
-- ============================================================================
-- Issue: Real-time subscription established but zero events received
-- Root Cause: RLS policy may not grant SELECT to public role for real-time
-- Solution: Ensure public role has SELECT permission for real-time broadcasts
-- ============================================================================

-- Step 1: Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE 
    tablename = 'user_presence';

-- Step 2: Drop existing policy (if needed)
-- DROP POLICY IF EXISTS "Allow all operations" ON public.user_presence;

-- Step 3: Create explicit SELECT policy for public role (REQUIRED for real-time)
CREATE POLICY "Enable SELECT for real-time" 
ON public.user_presence
FOR SELECT
TO public
USING (true);

-- Step 4: Create explicit INSERT policy for authenticated users
CREATE POLICY "Enable INSERT for authenticated users" 
ON public.user_presence
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 5: Create explicit UPDATE policy for authenticated users
CREATE POLICY "Enable UPDATE for authenticated users" 
ON public.user_presence
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 6: Create explicit DELETE policy for authenticated users
CREATE POLICY "Enable DELETE for authenticated users" 
ON public.user_presence
FOR DELETE
TO authenticated
USING (true);

-- Step 7: Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM 
    pg_policies
WHERE 
    tablename = 'user_presence'
ORDER BY
    cmd, policyname;

-- Step 8: Verify table is in publication
SELECT 
    schemaname,
    tablename,
    pubname
FROM 
    pg_publication_tables
WHERE 
    tablename = 'user_presence';

-- ============================================================================
-- IMPORTANT: After running this SQL:
-- 1. Reload both Chrome profiles (click extension reload button)
-- 2. Open sidepanels on both profiles
-- 3. Navigate to the same page (e.g., google.com)
-- 4. Watch for 🔔🔔🔔 REALTIME_EVENT_ARRIVED logs in BOTH consoles
-- 5. Change tabs on ONE profile and watch the OTHER profile's console
-- ============================================================================


