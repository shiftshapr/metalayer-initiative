-- Add community_id column to messages table
-- Run this in your Supabase SQL Editor

-- Step 1: Add the community_id column with a default value
ALTER TABLE messages ADD COLUMN community_id TEXT DEFAULT 'comm-001';

-- Step 2: Update all existing messages to have the default community_id
UPDATE messages SET community_id = 'comm-001' WHERE community_id IS NULL;

-- Step 3: Make the column NOT NULL to ensure all future messages have a community_id
ALTER TABLE messages ALTER COLUMN community_id SET NOT NULL;

-- Step 4: Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_community_id ON messages(community_id);

-- Step 5: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 6: Check that all messages now have community_id
SELECT 
  COUNT(*) as total_messages,
  COUNT(community_id) as messages_with_community_id,
  COUNT(*) - COUNT(community_id) as messages_without_community_id
FROM messages;
