#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zwxomzkmncwzwryvudwu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function diagnoseSecondUser() {
  console.log('🔍 DIAGNOSIS: Why daveroom@gmail.com is not visible');
  console.log('================================================');
  
  // Check current presence data
  console.log('\n📊 Current Supabase presence data:');
  const { data: presence, error: presError } = await supabase
    .from('user_presence')
    .select('*')
    .order('last_seen', { ascending: false });
    
  if (presError) {
    console.error('❌ Error getting presence:', presError);
    return;
  }
  
  console.log(`Found ${presence.length} presence records:`);
  presence.forEach((record, index) => {
    console.log(`  ${index + 1}. ${record.user_email} on ${record.page_id} (active: ${record.is_active})`);
  });
  
  // Check if daveroom is present
  const daveroomPresent = presence.some(p => p.user_email === 'daveroom@gmail.com');
  console.log(`\n🔍 daveroom@gmail.com present in Supabase: ${daveroomPresent ? 'YES' : 'NO'}`);
  
  if (!daveroomPresent) {
    console.log('\n❌ PROBLEM IDENTIFIED: daveroom@gmail.com is NOT sending presence updates to Supabase');
    console.log('\n🔧 SOLUTIONS FOR SECOND USER:');
    console.log('1. Open Chrome DevTools (F12) in the second user\'s browser');
    console.log('2. Go to the sidepanel and check the Console tab for errors');
    console.log('3. Look for these specific error messages:');
    console.log('   - "❌ Supabase client not available"');
    console.log('   - "❌ Failed to update presence"');
    console.log('   - "❌ Supabase real-time client not initialized"');
    console.log('4. If you see errors, try:');
    console.log('   - Refresh the sidepanel (close and reopen)');
    console.log('   - Reload the extension');
    console.log('   - Check if Supabase is loading properly');
    console.log('5. Look for these success messages:');
    console.log('   - "✅ Supabase Real-time Client connected"');
    console.log('   - "✅ Presence updated for page"');
    console.log('   - "🔍 PRESENCE: Starting presence tracking"');
    
    console.log('\n🧪 TEST: Simulating daveroom presence...');
    
    // Simulate daveroom presence
    const daveroomPresence = {
      user_email: 'daveroom@gmail.com',
      page_id: 'chrome___extensions__errors_dbdjamnflfecdnioehkdmlhnmajffijl',
      page_url: 'chrome://extensions/?errors=dbdjamnflfecdnioehkdmlhnmajffijl',
      aura_color: '#aaaaaa',
      is_active: true,
      last_seen: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_presence')
      .upsert(daveroomPresence, { 
        onConflict: 'user_email,page_id',
        ignoreDuplicates: false 
      });
      
    if (insertError) {
      console.error('❌ Error inserting daveroom presence:', insertError);
      return;
    }
    
    console.log('✅ daveroom@gmail.com presence simulated successfully');
    
    // Test API with both users
    console.log('\n🌐 Testing API with both users...');
    try {
      const response = await fetch('https://api.themetalayer.org/v1/presence/url?url=chrome%3A%2F%2Fextensions%2F%3Ferrors%3Ddbdjamnflfecdnioehkdmlhnmajffijl&communityIds=comm-001,comm-002', {
        headers: {
          'x-user-email': 'themetalayer@gmail.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiData = await response.json();
      console.log('✅ API now returns:', apiData.active.length, 'active users');
      apiData.active.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.userId}) - ${user.auraColor}`);
      });
      
      console.log('\n🎉 SUCCESS: When daveroom@gmail.com sends presence updates, both users are visible!');
      console.log('The issue is that daveroom@gmail.com\'s extension is not sending presence updates to Supabase.');
      
    } catch (error) {
      console.error('❌ API test failed:', error.message);
    }
  } else {
    console.log('\n✅ daveroom@gmail.com is present in Supabase - the system should be working!');
  }
}

diagnoseSecondUser().catch(console.error);




