-- Migration to remove aura_color and avatar_url from user_presence table
-- These should be in AppUser table instead

-- Step 1: Remove the columns from user_presence table
ALTER TABLE user_presence DROP COLUMN IF EXISTS aura_color;
ALTER TABLE user_presence DROP COLUMN IF EXISTS avatar_url;

-- Step 2: Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_presence' 
ORDER BY ordinal_position;

-- Step 3: Check that AppUser table has the correct columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'AppUser' 
AND column_name IN ('auraColor', 'avatarUrl')
ORDER BY ordinal_position;
