-- Add avatar_url column to user_presence table
-- This migration adds the missing avatar_url column that the application expects

ALTER TABLE user_presence 
ADD COLUMN avatar_url TEXT;

-- Add a comment to document the column purpose
COMMENT ON COLUMN user_presence.avatar_url IS 'User avatar URL from Google profile or fallback';

-- Optional: Add an index for performance if needed
-- CREATE INDEX idx_user_presence_avatar_url ON user_presence(avatar_url) WHERE avatar_url IS NOT NULL;
