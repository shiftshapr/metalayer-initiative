// SD1 DATABASE SCHEMA DIAGNOSTIC
// Check if avatar_url column exists in user_presence table

window.checkDatabaseSchema = async function() {
  console.log('🔍 SD1 SCHEMA CHECK: Starting database schema diagnostic...');
  
  if (!window.supabase) {
    console.error('❌ SD1 SCHEMA CHECK: Supabase client not available');
    return;
  }
  
  try {
    // Check if we can query the user_presence table
    console.log('🔍 SD1 SCHEMA CHECK: Testing basic user_presence query...');
    const { data, error } = await window.supabase
      .from('user_presence')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ SD1 SCHEMA CHECK: Failed to query user_presence:', error);
      return;
    }
    
    console.log('✅ SD1 SCHEMA CHECK: user_presence table accessible');
    console.log('🔍 SD1 SCHEMA CHECK: Sample record:', data[0]);
    
    // Check if avatar_url column exists by trying to select it
    console.log('🔍 SD1 SCHEMA CHECK: Testing avatar_url column...');
    const { data: avatarData, error: avatarError } = await window.supabase
      .from('user_presence')
      .select('avatar_url')
      .limit(1);
    
    if (avatarError) {
      console.error('❌ SD1 SCHEMA CHECK: avatar_url column does NOT exist:', avatarError);
      console.log('🔧 SD1 SCHEMA CHECK: Need to run migration: add-avatar-url-column.sql');
      return false;
    }
    
    console.log('✅ SD1 SCHEMA CHECK: avatar_url column exists');
    console.log('🔍 SD1 SCHEMA CHECK: avatar_url sample:', avatarData[0]?.avatar_url);
    return true;
    
  } catch (error) {
    console.error('❌ SD1 SCHEMA CHECK: Exception during schema check:', error);
    return false;
  }
};

// Auto-run the check
console.log('🔍 SD1 SCHEMA CHECK: Auto-running database schema check...');
window.checkDatabaseSchema();
