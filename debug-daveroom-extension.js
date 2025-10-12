const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://zwxomzkmncwzwryvudwu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDaveroomExtension() {
  console.log('🔍 Debugging daveroom extension activity...\n');

  const now = new Date();
  console.log(`📅 Current time: ${now.toISOString()}`);
  console.log(`📅 5 minutes ago: ${new Date(now.getTime() - 5 * 60 * 1000).toISOString()}\n`);

  try {
    // Check for ANY daveroom activity in the last 5 minutes
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const { data: recentDaveroomRecords, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('user_email', 'daveroom@gmail.com')
      .gte('last_seen', fiveMinutesAgo.toISOString())
      .order('last_seen', { ascending: false });

    if (error) {
      console.error('❌ Error fetching recent daveroom records:', error);
      return;
    }

    console.log(`📊 Recent daveroom records (last 5 minutes): ${recentDaveroomRecords.length}`);
    
    if (recentDaveroomRecords.length > 0) {
      console.log('✅ Found recent daveroom activity!');
      recentDaveroomRecords.forEach((record, index) => {
        const lastSeen = new Date(record.last_seen);
        const timeDiff = Math.round((now - lastSeen) / 1000); // seconds ago
        console.log(`  ${index + 1}. Page: ${record.page_id}`);
        console.log(`     - Last seen: ${record.last_seen}`);
        console.log(`     - Time ago: ${timeDiff} seconds`);
        console.log(`     - Active: ${record.is_active}`);
        console.log(`     - Aura: ${record.aura_color}`);
        console.log('');
      });
    } else {
      console.log('❌ No recent daveroom activity found');
      console.log('💡 This means daveroom\'s extension is NOT sending presence updates');
    }

    // Also check for any daveroom activity at all
    const { data: allDaveroomRecords, error: allError } = await supabase
      .from('user_presence')
      .select('*')
      .eq('user_email', 'daveroom@gmail.com')
      .order('last_seen', { ascending: false });

    if (!allError && allDaveroomRecords.length > 0) {
      const latest = allDaveroomRecords[0];
      const lastSeen = new Date(latest.last_seen);
      const timeDiff = Math.round((now - lastSeen) / 1000 / 60); // minutes ago
      console.log(`📊 Latest daveroom activity: ${timeDiff} minutes ago`);
      console.log(`   - Page: ${latest.page_id}`);
      console.log(`   - Last seen: ${latest.last_seen}`);
      console.log(`   - Active: ${latest.is_active}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugDaveroomExtension();




