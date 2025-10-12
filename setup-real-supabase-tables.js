// Setup Real Supabase Database Tables
const SUPABASE_URL = 'https://zwxomzkmncwzwryvudwu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';

async function setupSupabaseTables() {
  console.log('🔧 Setting up real Supabase database tables...');
  console.log('URL:', SUPABASE_URL);
  
  try {
    // Test connection first
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!testResponse.ok) {
      console.log('❌ Connection test failed:', testResponse.status, testResponse.statusText);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    
    // Create user_presence table
    console.log('📋 Creating user_presence table...');
    const presenceResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_presence`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: 'test-user',
        user_email: 'test@example.com',
        page_id: 'test-page',
        page_url: 'https://example.com',
        aura_color: '#45B7D1',
        is_active: true
      })
    });
    
    console.log('Presence table test:', presenceResponse.status);
    
    // Create messages table
    console.log('📋 Creating messages table...');
    const messagesResponse = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        page_id: 'test-page',
        user_id: 'test-user',
        user_email: 'test@example.com',
        content: 'Test message'
      })
    });
    
    console.log('Messages table test:', messagesResponse.status);
    
    if (presenceResponse.ok && messagesResponse.ok) {
      console.log('✅ Supabase tables are working!');
      return true;
    } else {
      console.log('❌ Table creation failed');
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
    console.log('🎉 Supabase database is ready for real-time features!');
  } else {
    console.log('💥 Supabase database setup failed!');
  }
});








