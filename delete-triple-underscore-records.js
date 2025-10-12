// TE2: Delete ALL user_presence records with triple underscores in page_id
// This will force the extension to create NEW records with correct single-underscore page_ids

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zwxomzkmncwzwryvudwu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM'
);

(async () => {
  console.log('🗑️  Deleting user_presence records with TRIPLE underscores in page_id...');
  console.log('');
  
  // First, find all records with triple underscores
  const { data: recordsToDelete, error: selectError } = await supabase
    .from('user_presence')
    .select('*')
    .like('page_id', '%___%');
  
  if (selectError) {
    console.error('❌ Error finding records:', selectError);
    process.exit(1);
  }
  
  console.log(`📊 Found ${recordsToDelete.length} records to delete:`);
  recordsToDelete.forEach((record, i) => {
    console.log(`  ${i + 1}. ${record.user_email} - ${record.page_id}`);
  });
  console.log('');
  
  if (recordsToDelete.length === 0) {
    console.log('✅ No records with triple underscores found. Nothing to delete.');
    process.exit(0);
  }
  
  // Delete records
  const { error: deleteError } = await supabase
    .from('user_presence')
    .delete()
    .like('page_id', '%___%');
  
  if (deleteError) {
    console.error('❌ Error deleting records:', deleteError);
    process.exit(1);
  }
  
  console.log(`✅ Successfully deleted ${recordsToDelete.length} records with triple underscores`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. User should HARD REFRESH the Chrome extension (reload)');
  console.log('   2. Extension will create NEW records with correct single-underscore page_ids');
  console.log('   3. Backend API will find these records and return real Google avatars');
  console.log('   4. Visibility timing will work correctly with preserved enter_time');
  console.log('');
  
  process.exit(0);
})();

