-- Migration: Remove user_email columns and drop empty tables
-- Part 1: Remove legacy user_email columns from reactions, messages, user_presence
-- Part 2: Drop empty Reaction and Post tables (they have no data and aren't in use)

BEGIN;

-- ==============================================================================
-- PART 1: Remove user_email columns (legacy columns from before UUID migration)
-- ==============================================================================

-- Drop user_email column from reactions table
ALTER TABLE reactions DROP COLUMN IF EXISTS user_email;

-- Drop user_email column from messages table  
ALTER TABLE messages DROP COLUMN IF EXISTS user_email;

-- Drop user_email column from user_presence table
ALTER TABLE user_presence DROP COLUMN IF EXISTS user_email;

-- ==============================================================================
-- PART 2: Drop empty tables (Reaction and Post have 0 rows)
-- ==============================================================================

-- Drop Reaction table first (it references Post)
DROP TABLE IF EXISTS "Reaction" CASCADE;

-- Drop Post table (empty, no dependencies)
DROP TABLE IF EXISTS "Post" CASCADE;

COMMIT;



