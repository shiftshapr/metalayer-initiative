-- ============================================
-- DIAGNOSTIC: Check WAL and RLS for Realtime
-- Run this in Supabase SQL Editor
-- ============================================

-- 1️⃣ CHECK WAL LEVEL (Write-Ahead Logging)
SELECT '=' as divider, '1. WAL LEVEL CHECK' as test, '=' as divider2;
SHOW wal_level;

-- Expected: wal_level = 'logical'
-- If NOT 'logical', realtime will NOT work!

-- ============================================

-- 2️⃣ CHECK RLS STATUS
SELECT '=' as divider, '2. RLS STATUS' as test, '=' as divider2;
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_presence', 'messages');

-- ============================================

-- 3️⃣ CHECK RLS POLICIES
SELECT '=' as divider, '3. RLS POLICIES' as test, '=' as divider2;
SELECT tablename, policyname, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('user_presence', 'messages')
ORDER BY tablename, policyname;

-- Required: Must have SELECT policies for 'anon' or 'authenticated'

-- ============================================

-- 4️⃣ TEST IF ANON CAN SELECT
SELECT '=' as divider, '4. ANON SELECT TEST' as test, '=' as divider2;
SET ROLE anon;
SELECT user_email, page_id, is_active, last_seen 
FROM public.user_presence 
LIMIT 3;
RESET ROLE;

-- If this fails, add SELECT policy:
-- CREATE POLICY "Enable realtime for anon"
-- ON public.user_presence FOR SELECT TO anon USING (true);

-- ============================================

-- 5️⃣ CHECK PUBLICATION
SELECT '=' as divider, '5. PUBLICATION CHECK' as test, '=' as divider2;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Should show: messages, user_presence

-- ============================================

SELECT '=' as divider, '✅ DIAGNOSTICS COMPLETE' as result, '=' as divider2;
SELECT 'If WAL is not logical, that is your problem!' as conclusion;

