-- Add status field to messages table for draft support
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'deleted'));

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status) WHERE status = 'draft';

-- Add index for user drafts
CREATE INDEX IF NOT EXISTS idx_messages_user_drafts ON messages(user_id, status) WHERE status = 'draft';


