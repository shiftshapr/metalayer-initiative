const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.supabase' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugBackendPresence() {
  console.log('🔍 DEBUGGING: Backend presence service logic');
  console.log('==========================================');
  
  const pageId = 'chrome___extensions__errors_dbdjamnflfecdnioehkdmlhnmajffijl';
  const minutesThreshold = 5;
  const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
  
  console.log(`📊 Query parameters:`);
  console.log(`  pageId: ${pageId}`);
  console.log(`  minutesThreshold: ${minutesThreshold}`);
  console.log(`  thresholdTime: ${thresholdTime.toISOString()}`);
  console.log(`  current time: ${new Date().toISOString()}`);
  
  // Test the exact query from the backend
  console.log('\n🔍 Testing backend query...');
  const { data: presenceData, error } = await supabase
    .from('user_presence')
    .select('*')
    .eq('page_id', pageId)
    .eq('is_active', true)
    .gte('last_seen', thresholdTime.toISOString())
    .order('last_seen', { ascending: false });

  if (error) {
    console.error('❌ Query error:', error);
    return;
  }

  console.log(`📊 Query results: ${presenceData.length} records found`);
  
  if (presenceData.length > 0) {
    console.log('📋 Found records:');
    presenceData.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.user_email} - last_seen: ${record.last_seen} (active: ${record.is_active})`);
    });
  } else {
    console.log('❌ No records found - checking all records for this page...');
    
    // Check all records for this page regardless of time/active status
    const { data: allRecords, error: allError } = await supabase
      .from('user_presence')
      .select('*')
      .eq('page_id', pageId);
    
    if (allError) {
      console.error('❌ All records query error:', allError);
      return;
    }
    
    console.log(`📊 All records for page ${pageId}: ${allRecords.length} found`);
    allRecords.forEach((record, index) => {
      const lastSeen = new Date(record.last_seen);
      const isRecent = lastSeen > thresholdTime;
      console.log(`  ${index + 1}. ${record.user_email} - last_seen: ${record.last_seen} (active: ${record.is_active}, recent: ${isRecent})`);
    });
  }
}

debugBackendPresence().catch(console.error);




