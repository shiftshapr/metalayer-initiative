-- Migration: Remove user_email columns from reactions, messages, and user_presence
-- These columns are legacy and should have been removed in the UUID migration

BEGIN;

-- Drop user_email column from reactions table
ALTER TABLE reactions DROP COLUMN IF EXISTS user_email;

-- Drop user_email column from messages table  
ALTER TABLE messages DROP COLUMN IF EXISTS user_email;

-- Drop user_email column from user_presence table
ALTER TABLE user_presence DROP COLUMN IF EXISTS user_email;

COMMIT;



