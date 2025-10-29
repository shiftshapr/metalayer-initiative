-- Migration: Email Foreign Keys → UUID Foreign Keys
-- Date: 2025-10-29
-- Description: Add UUID foreign keys while keeping email columns for backward compatibility

BEGIN;

-- ============================================================================
-- Step 1: Add user_id columns to all tables (nullable initially)
-- ============================================================================

-- Add user_id to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add user_id to reactions table
ALTER TABLE reactions 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add user_id to user_presence table
ALTER TABLE user_presence 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add user_id to message_deletions table (if deleted_by is email-based)
ALTER TABLE message_deletions 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- ============================================================================
-- Step 2: Populate user_id from user_email by joining to AppUser
-- ============================================================================

-- Populate messages.user_id from AppUser.email
UPDATE messages m
SET user_id = au.id
FROM "AppUser" au
WHERE m.user_email = au.email
  AND m.user_id IS NULL;

-- Populate reactions.user_id from AppUser.email
UPDATE reactions r
SET user_id = au.id
FROM "AppUser" au
WHERE r.user_email = au.email
  AND r.user_id IS NULL;

-- Populate user_presence.user_id from AppUser.email
UPDATE user_presence up
SET user_id = au.id
FROM "AppUser" au
WHERE up.user_email = au.email
  AND up.user_id IS NULL;

-- Populate message_deletions.user_id (if deleted_by is email-based)
UPDATE message_deletions md
SET user_id = au.id
FROM "AppUser" au
WHERE md.deleted_by = au.email
  AND md.user_id IS NULL
  AND md.deleted_by LIKE '%@%'; -- Only if it looks like an email

-- ============================================================================
-- Step 3: Add indexes for user_id columns
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_message_deletions_user_id ON message_deletions(user_id);

-- ============================================================================
-- Step 4: Add foreign key constraints
-- ============================================================================

-- Add FK constraint for messages
ALTER TABLE messages
ADD CONSTRAINT fk_messages_user_id 
FOREIGN KEY (user_id) REFERENCES "AppUser"(id) ON DELETE SET NULL;

-- Add FK constraint for reactions
ALTER TABLE reactions
ADD CONSTRAINT fk_reactions_user_id 
FOREIGN KEY (user_id) REFERENCES "AppUser"(id) ON DELETE SET NULL;

-- Add FK constraint for user_presence
ALTER TABLE user_presence
ADD CONSTRAINT fk_user_presence_user_id 
FOREIGN KEY (user_id) REFERENCES "AppUser"(id) ON DELETE SET NULL;

-- Add FK constraint for message_deletions
ALTER TABLE message_deletions
ADD CONSTRAINT fk_message_deletions_user_id 
FOREIGN KEY (user_id) REFERENCES "AppUser"(id) ON DELETE SET NULL;

-- ============================================================================
-- Step 5: Update user_presence primary key (if it's composite)
-- ============================================================================

-- Note: user_presence currently has composite PK [user_email, page_id]
-- We need to change this to use id as PK and make [user_email, page_id] unique

-- First, ensure all records have UUIDs
UPDATE user_presence
SET user_id = gen_random_uuid()
WHERE user_id IS NULL;

-- Check if we need to change the primary key structure
-- This might require dropping and recreating constraints

-- ============================================================================
-- Step 6: Create trigger to automatically populate user_id on INSERT/UPDATE
-- ============================================================================

-- Function to sync user_id from user_email
CREATE OR REPLACE FUNCTION sync_user_id_from_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_email IS NOT NULL AND NEW.user_id IS NULL THEN
    SELECT id INTO NEW.user_id
    FROM "AppUser"
    WHERE email = NEW.user_email
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for messages
DROP TRIGGER IF EXISTS trigger_sync_messages_user_id ON messages;
CREATE TRIGGER trigger_sync_messages_user_id
BEFORE INSERT OR UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION sync_user_id_from_email();

-- Triggers for reactions
DROP TRIGGER IF EXISTS trigger_sync_reactions_user_id ON reactions;
CREATE TRIGGER trigger_sync_reactions_user_id
BEFORE INSERT OR UPDATE ON reactions
FOR EACH ROW
EXECUTE FUNCTION sync_user_id_from_email();

-- Triggers for user_presence
DROP TRIGGER IF EXISTS trigger_sync_user_presence_user_id ON user_presence;
CREATE TRIGGER trigger_sync_user_presence_user_id
BEFORE INSERT OR UPDATE ON user_presence
FOR EACH ROW
EXECUTE FUNCTION sync_user_id_from_email();

-- ============================================================================
-- Step 7: Validation queries
-- ============================================================================

-- Count records with missing user_id
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

