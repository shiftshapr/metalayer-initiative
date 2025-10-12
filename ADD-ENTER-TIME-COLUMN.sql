-- =====================================================
-- CRITICAL FIX: Add enter_time column to user_presence
-- =====================================================
-- This column tracks when a user FIRST entered a page
-- separate from last_seen (which updates on every heartbeat)
--
-- RUN THIS IN SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/zwxomzkmncwzwryvudwu/sql
-- =====================================================

-- Add enter_time column
ALTER TABLE user_presence 
ADD COLUMN IF NOT EXISTS enter_time TIMESTAMP WITH TIME ZONE;

-- Backfill existing records with last_seen as enter_time
UPDATE user_presence 
SET enter_time = last_seen 
WHERE enter_time IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN user_presence.enter_time IS 'Timestamp when user first entered the page (does NOT update on heartbeats)';
COMMENT ON COLUMN user_presence.last_seen IS 'Timestamp of last activity (UPDATES on every heartbeat)';

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_presence' 
ORDER BY ordinal_position;


