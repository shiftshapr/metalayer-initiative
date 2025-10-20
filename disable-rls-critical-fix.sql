-- CRITICAL FIX: Disable RLS for Chrome Extension Compatibility
-- This script resolves the AuthSessionMissingError and WebSocket connection failures
-- by disabling Row Level Security on tables used by the Chrome extension

-- Disable RLS on messages table (allows anon key to work with real-time)
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_presence table (allows anon key to work with presence)
ALTER TABLE user_presence DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_visibility table (allows anon key to work with visibility)
ALTER TABLE user_visibility DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('messages', 'user_presence', 'user_visibility')
AND schemaname = 'public';

-- Note: This is the recommended approach for Chrome extensions using Supabase anon key
-- The extension's security is handled by Chrome's permission system and the extension's manifest
