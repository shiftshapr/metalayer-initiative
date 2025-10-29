-- Migration: Remove Email Foreign Keys, Use UUID Only
-- Date: 2025-10-29
-- Description: Clean migration to UUID foreign keys only, no backward compatibility

BEGIN;

-- ============================================================================
-- Step 1: Add user_id columns to all tables
-- ============================================================================

-- Add user_id to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT gen_random_uuid();

-- Add user_id to reactions table
ALTER TABLE reactions 
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT gen_random_uuid();

-- Add user_id to user_presence table
ALTER TABLE user_presence 
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT gen_random_uuid();

-- Add user_id to message_deletions table
ALTER TABLE message_deletions 
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT gen_random_uuid();

-- ============================================================================
-- Step 2: Populate user_id from user_email by joining to AppUser
-- ============================================================================

-- Populate messages.user_id from AppUser.email
UPDATE messages m
SET user_id = au.id
FROM "AppUser" au
WHERE m.user_email = au.email;

-- Populate reactions.user_id from AppUser.email
UPDATE reactions r
SET user_id = au.id
FROM "AppUser" au
WHERE r.user_email = au.email;

-- Populate user_presence.user_id from AppUser.email
UPDATE user_presence up
SET user_id = au.id
FROM "AppUser" au
WHERE up.user_email = au.email;

-- Populate message_deletions.user_id from deleted_by (if it's an email)
UPDATE message_deletions md
SET user_id = au.id
FROM "AppUser" au
WHERE md.deleted_by = au.email
  AND md.deleted_by LIKE '%@%';

-- ============================================================================
-- Step 3: Add foreign key constraints
-- ============================================================================

-- Add FK constraint for messages
ALTER TABLE messages
ADD CONSTRAINT fk_messages_user_id 
FOREIGN KEY (user_id) REFERENCES "AppUser"(id) ON DELETE CASCADE;

-- Add FK constraint for reactions
ALTER TABLE reactions
ADD CONSTRAINT fk_reactions_user_id 
FOREIGN KEY (user_id) REFERENCES "AppUser"(id) ON DELETE CASCADE;

-- Add FK constraint for user_presence
ALTER TABLE user_presence
ADD CONSTRAINT fk_user_presence_user_id 
FOREIGN KEY (user_id) REFERENCES "AppUser"(id) ON DELETE CASCADE;

-- Add FK constraint for message_deletions
ALTER TABLE message_deletions
ADD CONSTRAINT fk_message_deletions_user_id 
FOREIGN KEY (user_id) REFERENCES "AppUser"(id) ON DELETE CASCADE;

-- ============================================================================
-- Step 4: Update user_presence primary key structure
-- ============================================================================

-- Drop the composite primary key
ALTER TABLE user_presence DROP CONSTRAINT IF EXISTS user_presence_pkey;

-- Make id the primary key (it already exists)
ALTER TABLE user_presence ADD PRIMARY KEY (id);

-- Add unique constraint for [user_id, page_id] (replaces old [user_email, page_id])
ALTER TABLE user_presence 
ADD CONSTRAINT unique_user_presence_user_page 
UNIQUE (user_id, page_id);

-- ============================================================================
-- Step 5: Add indexes for user_id columns
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_message_deletions_user_id ON message_deletions(user_id);

-- ============================================================================
-- Step 6: Remove old email-based indexes and constraints
-- ============================================================================

-- Drop old unique constraint on user_presence
DROP INDEX IF EXISTS user_presence_user_page_unique;

-- Drop old email-based indexes (keep user_email for queries if needed)
-- DROP INDEX IF EXISTS idx_messages_user_email;
-- DROP INDEX IF EXISTS idx_user_presence_user_email;

-- ============================================================================
-- Step 7: Remove user_email columns (optional - can be done later)
-- ============================================================================

-- Uncomment these if you want to remove user_email columns entirely
-- ALTER TABLE messages DROP COLUMN IF EXISTS user_email;
-- ALTER TABLE reactions DROP COLUMN IF EXISTS user_email;
-- ALTER TABLE user_presence DROP COLUMN IF EXISTS user_email;
-- ALTER TABLE message_deletions DROP COLUMN IF EXISTS deleted_by;

-- ============================================================================
-- Step 8: Validation queries
-- ============================================================================

-- Count records with user_id populated
SELECT 
  'messages' as table_name,
  COUNT(*) as total_records,
  COUNT(user_id) as records_with_user_id,
  COUNT(*) - COUNT(user_id) as missing_user_id
FROM messages
UNION ALL
SELECT 
  'reactions' as table_name,
  COUNT(*) as total_records,
  COUNT(user_id) as records_with_user_id,
  COUNT(*) - COUNT(user_id) as missing_user_id
FROM reactions
UNION ALL
SELECT 
  'user_presence' as table_name,
  COUNT(*) as total_records,
  COUNT(user_id) as records_with_user_id,
  COUNT(*) - COUNT(user_id) as missing_user_id
FROM user_presence;

COMMIT;

-- ============================================================================
-- Post-migration validation
-- ============================================================================

-- Verify all foreign key constraints
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table
FROM pg_constraint
WHERE contype = 'f'
  AND confrelid = '"AppUser"'::regclass
ORDER BY conname;

-- Test a join to ensure foreign keys work
SELECT 
  m.id as message_id,
  m.user_id,
  au.email as user_email,
  au.name as user_name
FROM messages m
JOIN "AppUser" au ON m.user_id = au.id
LIMIT 5;
