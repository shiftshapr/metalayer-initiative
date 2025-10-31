-- Create message_deletions table for real-time message deletion synchronization
-- Created: October 16, 2025
-- Purpose: Enable cross-profile message deletion synchronization via Supabase real-time

CREATE TABLE IF NOT EXISTS message_deletions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT NOT NULL,
    deleted_by TEXT NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    page_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_message_deletions_message_id ON message_deletions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_deletions_page_id ON message_deletions(page_id);
CREATE INDEX IF NOT EXISTS idx_message_deletions_deleted_at ON message_deletions(deleted_at);

-- Enable Row Level Security (RLS)
ALTER TABLE message_deletions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON message_deletions
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON message_deletions TO authenticated;
GRANT ALL ON message_deletions TO anon;

-- Add comment for documentation
COMMENT ON TABLE message_deletions IS 'Tracks message deletions for real-time synchronization across profiles';
COMMENT ON COLUMN message_deletions.message_id IS 'ID of the deleted message';
COMMENT ON COLUMN message_deletions.deleted_by IS 'Email or ID of the user who deleted the message';
COMMENT ON COLUMN message_deletions.deleted_at IS 'Timestamp when the message was deleted';
COMMENT ON COLUMN message_deletions.page_id IS 'Page ID where the message was deleted';
