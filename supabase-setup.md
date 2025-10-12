# Supabase Setup for Cross-User Communication

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for free account
3. Create new project
4. Get your project URL and API key

## 2. Database Schema

```sql
-- User presence table
CREATE TABLE user_presence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  page_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  aura_color TEXT DEFAULT '#45B7D1',
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow all users to read/write (for now)
CREATE POLICY "Allow all operations" ON user_presence FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON messages FOR ALL USING (true);
```

## 3. Environment Variables

Add to your extension:
```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

## 4. Real-time Subscriptions

The extension will automatically:
- ✅ Update presence when users join/leave pages
- ✅ Broadcast aura color changes to all users on same page
- ✅ Send new messages to all users on same page
- ✅ Show real-time visibility of who's online
