// ENTER TIME RESET DIAGNOSTIC
// Run this to diagnose why enter_time is showing 12 days instead of resetting
// Copy-paste entire block into console

(async function() {
  console.log('🔍 === ENTER TIME RESET DIAGNOSTIC ===');
  
  const currentUrlData = window.currentUrlData || {};
  const pageId = currentUrlData.pageId || 'google_com_';
  const pageUrl = currentUrlData.normalizedUrl || 'google.com/';
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentUserEmail = window.currentUser?.email;
  
  console.log('\n--- 1. CURRENT CONTEXT ---');
  console.log('Current User ID:', currentUserId);
  console.log('Current User Email:', currentUserEmail);
  console.log('Page ID:', pageId);
  console.log('Page URL:', pageUrl);
  
  console.log('\n--- 2. CHECK CURRENT PRESENCE STATE (API) ---');
  let apiUsers = [];
  try {
    const apiResponse = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`, { method: 'GET' });
    apiUsers = apiResponse?.active || [];
    console.log('✅ API returned:', apiUsers.length, 'users');
    
    const currentUserApi = apiUsers.find(u => u.id === currentUserId || u.userId === currentUserId);
    if (currentUserApi) {
      const enterTime = currentUserApi.enterTime ? new Date(currentUserApi.enterTime) : null;
      const lastSeen = currentUserApi.lastSeen ? new Date(currentUserApi.lastSeen) : null;
      const now = Date.now();
      
      const enterTimeDiffMs = enterTime ? (now - enterTime.getTime()) : null;
      const enterTimeDays = enterTimeDiffMs ? Math.floor(enterTimeDiffMs / (24 * 60 * 60 * 1000)) : null;
      const enterTimeHours = enterTimeDiffMs ? Math.floor(enterTimeDiffMs / (60 * 60 * 1000)) : null;
      const enterTimeMinutes = enterTimeDiffMs ? Math.floor(enterTimeDiffMs / 60000) : null;
      
      console.log(`\n📊 Current User (from API):`);
      console.log(`   enterTime: ${currentUserApi.enterTime}`);
      console.log(`   → Time since enter: ${enterTimeDays} days (${enterTimeHours} hours, ${enterTimeMinutes} mins)`);
      console.log(`   lastSeen: ${currentUserApi.lastSeen}`);
      console.log(`   isActive: ${currentUserApi.isActive}`);
      console.log(`   status: ${currentUserApi.status}`);
      
      if (enterTimeDays > 0) {
        console.error(`\n🚨 ISSUE: enterTime is ${enterTimeDays} days old!`);
        console.error(`   This suggests ENTER events are NOT resetting enter_time`);
      }
    } else {
      console.warn('⚠️ Current user not found in API response');
    }
    
    // Check all users
    apiUsers.forEach((u, idx) => {
      const enterTime = u.enterTime ? new Date(u.enterTime) : null;
      const enterTimeDiffMs = enterTime ? (Date.now() - enterTime.getTime()) : null;
      const enterTimeDays = enterTimeDiffMs ? Math.floor(enterTimeDiffMs / (24 * 60 * 60 * 1000)) : null;
      console.log(`\n📊 User ${idx + 1}: ${u.name} (${u.id})`);
      console.log(`   enterTime: ${u.enterTime}`);
      console.log(`   → ${enterTimeDays} days old`);
      if (enterTimeDays > 1) {
        console.error(`   ⚠️ ISSUE: enterTime is ${enterTimeDays} days old - should be reset on ENTER`);
      }
    });
  } catch (error) {
    console.error('❌ API call failed:', error);
  }
  
  console.log('\n--- 3. SEND TEST ENTER EVENT ---');
  console.log('Sending ENTER event to backend to test enter_time reset...');
  try {
    const enterResult = await window.sendPresenceEvent('ENTER');
    console.log('✅ ENTER event sent:', enterResult);
    
    // Wait 2 seconds for database update
    console.log('⏳ Waiting 2 seconds for database update...');
    await new Promise(r => setTimeout(r, 2000));
    
    // Check API again
    console.log('\n--- 4. CHECK PRESENCE AFTER ENTER EVENT ---');
    const apiResponseAfter = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`, { method: 'GET' });
    const apiUsersAfter = apiResponseAfter?.active || [];
    
    const currentUserAfter = apiUsersAfter.find(u => u.id === currentUserId || u.userId === currentUserId);
    if (currentUserAfter) {
      const enterTimeAfter = currentUserAfter.enterTime ? new Date(currentUserAfter.enterTime) : null;
      const enterTimeDiffMsAfter = enterTimeAfter ? (Date.now() - enterTimeAfter.getTime()) : null;
      const enterTimeSecondsAfter = enterTimeDiffMsAfter ? Math.floor(enterTimeDiffMsAfter / 1000) : null;
      
      console.log(`📊 Current User (after ENTER event):`);
      console.log(`   enterTime: ${currentUserAfter.enterTime}`);
      console.log(`   → ${enterTimeSecondsAfter} seconds ago`);
      
      if (enterTimeSecondsAfter < 10) {
        console.log(`✅ SUCCESS: enterTime was reset! (${enterTimeSecondsAfter}s ago)`);
      } else {
        console.error(`❌ FAILURE: enterTime is still old (${enterTimeSecondsAfter}s ago, expected < 10s)`);
        console.error(`   This means the ENTER event did NOT reset enter_time in the database`);
      }
    }
  } catch (error) {
    console.error('❌ ENTER event failed:', error);
  }
  
  console.log('\n--- 5. DIRECT DATABASE CHECK (if Supabase client available) ---');
  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('user_presence')
        .select('*, AppUser(*)')
        .eq('page_id', pageId);
      
      if (error) throw error;
      
      console.log('✅ Database query returned:', data.length, 'records');
      data.forEach((p, idx) => {
        const enterTime = p.enter_time ? new Date(p.enter_time) : null;
        const enterTimeDiffMs = enterTime ? (Date.now() - enterTime.getTime()) : null;
        const enterTimeDays = enterTimeDiffMs ? Math.floor(enterTimeDiffMs / (24 * 60 * 60 * 1000)) : null;
        
        console.log(`\n📊 DB Record ${idx + 1}: ${p.AppUser?.name || p.user_name} (${p.user_id})`);
        console.log(`   enter_time: ${p.enter_time}`);
        console.log(`   → ${enterTimeDays} days old`);
        console.log(`   is_active: ${p.is_active}`);
        console.log(`   last_seen: ${p.last_seen}`);
        
        if (enterTimeDays > 1 && p.is_active) {
          console.error(`   ⚠️ ISSUE: User is active but enter_time is ${enterTimeDays} days old`);
          console.error(`      → ENTER events are NOT resetting enter_time in database`);
        }
      });
    } catch (error) {
      console.error('❌ Database query failed:', error);
    }
  } else {
    console.warn('⚠️ Supabase client not available');
  }
  
  console.log('\n🔍 === DIAGNOSTIC END ===');
  
  return {
    currentUserId,
    pageId,
    apiUsersCount: apiUsers.length,
    timestamp: new Date().toISOString()
  };
})();

