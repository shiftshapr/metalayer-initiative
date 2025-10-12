// Setup Supabase Database Tables
const SUPABASE_URL = 'https://bvshfzikwwjasluumfkr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c2hmemlrd3dqYXNsdXVtZmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDU3NjUsImV4cCI6MjA1OTcyMTc2NX0.YuBpfklO3IxI-yFwFBP_2GIlSO-IGYia6CwpRyRd7VA';

async function setupSupabaseTables() {
  console.log('🔧 Setting up Supabase database tables...');
  
  const sql = `
    -- User presence table
    CREATE TABLE IF NOT EXISTS user_presence (
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
    CREATE TABLE IF NOT EXISTS messages (
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
    DROP POLICY IF EXISTS "Allow all operations" ON user_presence;
    DROP POLICY IF EXISTS "Allow all operations" ON messages;
    
    CREATE POLICY "Allow all operations" ON user_presence FOR ALL USING (true);
    CREATE POLICY "Allow all operations" ON messages FOR ALL USING (true);
  `;
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });
    
    console.log('Response status:', response.status);
    console.log('Response text:', await response.text());
    
    if (response.ok) {
      console.log('✅ Supabase tables created successfully!');
      return true;
    } else {
      console.log('❌ Failed to create tables:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Error setting up tables:', error.message);
    return false;
  }
}

// Run the setup
setupSupabaseTables().then(success => {
  if (success) {
    console.log('🎉 Supabase database is ready!');
  } else {
    console.log('💥 Supabase database setup failed!');
  }
});








