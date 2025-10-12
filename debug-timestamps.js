const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.supabase' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugTimestamps() {
  console.log('🔍 DEBUGGING: Timestamp analysis');
  console.log('================================');
  
  const pageId = 'chrome___extensions__errors_dbdjamnflfecdnioehkdmlhnmajffijl';
  const minutesThreshold = 5;
  const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
  const currentTime = new Date();
  
  console.log(`📊 Time analysis:`);
  console.log(`  Current time: ${currentTime.toISOString()}`);
  console.log(`  Threshold time (${minutesThreshold} min ago): ${thresholdTime.toISOString()}`);
  console.log(`  Time difference: ${(currentTime - thresholdTime) / 1000 / 60} minutes`);
  
  // Get all records for this page
  const { data: allRecords, error: allError } = await supabase
    .from('user_presence')
    .select('*')
    .eq('page_id', pageId);
  
  if (allError) {
    console.error('❌ Error getting all records:', allError);
    return;
  }
  
  console.log(`\n📊 All records for page ${pageId}: ${allRecords.length} found`);
  allRecords.forEach((record, index) => {
    const lastSeen = new Date(record.last_seen);
    const isRecent = lastSeen > thresholdTime;
    const timeDiff = (currentTime - lastSeen) / 1000 / 60; // minutes
    console.log(`  ${index + 1}. ${record.user_email}:`);
    console.log(`     last_seen: ${record.last_seen}`);
    console.log(`     parsed: ${lastSeen.toISOString()}`);
    console.log(`     active: ${record.is_active}`);
    console.log(`     recent: ${isRecent} (${timeDiff.toFixed(2)} min ago)`);
    console.log(`     meets threshold: ${isRecent && record.is_active}`);
  });
  
  // Test the exact query from the backend
  console.log(`\n🔍 Testing backend query...`);
  const { data: queryResult, error: queryError } = await supabase
    .from('user_presence')
    .select('*')
    .eq('page_id', pageId)
    .eq('is_active', true)
    .gte('last_seen', thresholdTime.toISOString())
    .order('last_seen', { ascending: false });
  
  if (queryError) {
    console.error('❌ Query error:', queryError);
    return;
  }
  
  console.log(`📊 Backend query result: ${queryResult.length} records found`);
  queryResult.forEach((record, index) => {
    console.log(`  ${index + 1}. ${record.user_email} - ${record.last_seen}`);
  });
}

debugTimestamps().catch(console.error);




