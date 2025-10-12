-- CORRECT Supabase Database Tables - No UUIDs, Match Project Data Types
-- Senior Developer + Test Engineer - Fixed Version

-- USER_PRESENCE TABLE - Real-time user presence tracking
CREATE TABLE IF NOT EXISTS user_presence (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  page_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  aura_color TEXT DEFAULT '#45B7D1',
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UNIQUE CONSTRAINT for upsert operations
ALTER TABLE user_presence 
ADD CONSTRAINT user_presence_user_page_unique 
UNIQUE (user_email, page_id);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_user_presence_user_email ON user_presence(user_email);
CREATE INDEX IF NOT EXISTS idx_user_presence_page_id ON user_presence(page_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_active ON user_presence(is_active);

-- MESSAGES TABLE - Real-time message broadcasting
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  page_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_messages_page_id ON messages(page_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_email ON messages(user_email);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- USER_VISIBILITY TABLE - Real-time visibility status tracking
CREATE TABLE IF NOT EXISTS user_visibility (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  page_id TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UNIQUE CONSTRAINT for upsert operations
ALTER TABLE user_visibility 
ADD CONSTRAINT user_visibility_user_page_unique 
UNIQUE (user_email, page_id);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_user_visibility_user_email ON user_visibility(user_email);
CREATE INDEX IF NOT EXISTS idx_user_visibility_page_id ON user_visibility(page_id);
CREATE INDEX IF NOT EXISTS idx_user_visibility_visible ON user_visibility(is_visible);

-- Enable Row Level Security for all tables
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_visibility ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for now)
CREATE POLICY "Allow all operations" ON user_presence FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON user_visibility FOR ALL USING (true);
