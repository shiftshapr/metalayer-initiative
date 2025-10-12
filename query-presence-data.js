const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zwxomzkmncwzwryvudwu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM'
);

(async () => {
  console.log('🔍 Querying Supabase for user_presence records...');
  console.log('');
  
  // Query for BOTH page_id formats
  const { data, error } = await supabase
    .from('user_presence')
    .select('*')
    .or('page_id.eq.chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl,page_id.eq.chrome___extensions__errors_dbdjamnflfecdnioehkdmlhnmajffijl')
    .order('last_seen', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log(`✅ Found ${data.length} records:`);
    console.log('');
    
    data.forEach((record, i) => {
      console.log(`📊 Record ${i + 1}:`);
      console.log(`  user_email: ${record.user_email}`);
      console.log(`  page_id: ${record.page_id}`);
      console.log(`  enter_time: ${record.enter_time}`);
      console.log(`  last_seen: ${record.last_seen}`);
      console.log(`  is_active: ${record.is_active}`);
      console.log('');
    });
  }
  
  process.exit(0);
})();

