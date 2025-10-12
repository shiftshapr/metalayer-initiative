const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://zwxomzkmncwzwryvudwu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAllDaveroomActivity() {
  console.log('🔍 Checking ALL daveroom activity across ALL pages...\n');

  const now = new Date();
  console.log(`📅 Current time: ${now.toISOString()}`);

  try {
    // Get ALL presence records for daveroom@gmail.com from ALL pages
    const { data: allRecords, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('user_email', 'daveroom@gmail.com')
      .order('last_seen', { ascending: false });

    if (error) {
      console.error('❌ Error fetching all daveroom records:', error);
      return;
    }

    console.log(`📊 Total daveroom records across all pages: ${allRecords.length}`);
    
    if (allRecords.length === 0) {
      console.log('❌ No daveroom records found at all!');
      return;
    }

    console.log('📋 All daveroom presence records (all pages):');
    allRecords.forEach((record, index) => {
      const lastSeen = new Date(record.last_seen);
      const timeDiff = Math.round((now - lastSeen) / 1000 / 60); // minutes ago
      const isRecent = timeDiff <= 10;
      console.log(`  ${index + 1}. Page: ${record.page_id}`);
      console.log(`     - Last seen: ${record.last_seen}`);
      console.log(`     - Time ago: ${timeDiff} minutes ${isRecent ? '(RECENT!)' : '(OLD)'}`);
      console.log(`     - Active: ${record.is_active}`);
      console.log(`     - Aura: ${record.aura_color}`);
      console.log(`     - Page URL: ${record.page_url}`);
      console.log('');
    });

    // Check for any records from the last 10 minutes
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const recentRecords = allRecords.filter(record => 
      new Date(record.last_seen) > tenMinutesAgo
    );

    console.log(`🔍 Records from last 10 minutes: ${recentRecords.length}`);
    if (recentRecords.length > 0) {
      console.log('✅ Found recent daveroom activity!');
      recentRecords.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.page_id} - ${record.last_seen}`);
      });
    } else {
      console.log('❌ No recent daveroom activity found in the last 10 minutes');
      console.log('💡 This suggests daveroom\'s extension is not sending updates to Supabase');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAllDaveroomActivity();




