// ROOT CAUSE DIAGNOSTIC: Enter Time Reset Issue
// Run this in the browser console to diagnose why enter_time is not resetting on ENTER events

(async function diagnoseEnterTimeReset() {
  console.log('🔍 === ENTER TIME RESET DIAGNOSTIC ===');
  
  const currentPageId = window.currentUrlData?.pageId;
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentUserEmail = window.currentUser?.email;
  
  console.log('\n--- Current Context ---');
  console.log('Page ID:', currentPageId);
  console.log('User ID:', currentUserId);
  console.log('User Email:', currentUserEmail);
  
  if (!currentPageId || !currentUserId) {
    console.error('❌ Missing page ID or user ID');
    return;
  }
  
  console.log('\n--- Step 1: Check Current enter_time in Database ---');
  try {
    const beforeResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(window.currentUrlData?.normalizedUrl || window.currentUrlData?.rawUrl || '')}`, { method: 'GET' });
    const currentUserData = beforeResp?.active?.find(u => (u.id || u.userId) === currentUserId);
    if (currentUserData) {
      console.log('Current enterTime from API:', currentUserData.enterTime || currentUserData.enter_time);
      console.log('Current lastSeen from API:', currentUserData.lastSeen || currentUserData.last_seen);
      console.log('Current isActive from API:', currentUserData.isActive || currentUserData.is_active);
      console.log('Current status from API:', currentUserData.status);
      
      if (currentUserData.enterTime || currentUserData.enter_time) {
        const enterTime = new Date(currentUserData.enterTime || currentUserData.enter_time);
        const now = new Date();
        const daysDiff = Math.floor((now - enterTime) / (1000 * 60 * 60 * 24));
        const hoursDiff = Math.floor((now - enterTime) / (1000 * 60 * 60));
        const minsDiff = Math.floor((now - enterTime) / (1000 * 60));
        console.log(`\nTime since enter_time:`);
        console.log(`  Days: ${daysDiff}`);
        console.log(`  Hours: ${hoursDiff}`);
        console.log(`  Minutes: ${minsDiff}`);
        if (daysDiff > 1) {
          console.error(`❌ ISSUE: enter_time is ${daysDiff} days old! Should be reset on ENTER events.`);
        }
      }
    } else {
      console.warn('⚠️ Current user not found in API response');
    }
  } catch (error) {
    console.error('❌ Error fetching current state:', error);
  }
  
  console.log('\n--- Step 2: Send ENTER Event ---');
  console.log('Sending ENTER event...');
  try {
    const enterResult = await window.sendPresenceEvent('ENTER');
    console.log('ENTER event result:', enterResult);
    
    // Wait 2 seconds for database to update
    console.log('\n--- Step 3: Wait 2 seconds for DB update ---');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n--- Step 4: Check enter_time After ENTER Event ---');
    const afterResp = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(window.currentUrlData?.normalizedUrl || window.currentUrlData?.rawUrl || '')}`, { method: 'GET' });
    const afterUserData = afterResp?.active?.find(u => (u.id || u.userId) === currentUserId);
    if (afterUserData) {
      console.log('After enterTime from API:', afterUserData.enterTime || afterUserData.enter_time);
      console.log('After lastSeen from API:', afterUserData.lastSeen || afterUserData.last_seen);
      
      if (afterUserData.enterTime || afterUserData.enter_time) {
        const enterTime = new Date(afterUserData.enterTime || afterUserData.enter_time);
        const now = new Date();
        const timeDiff = Math.abs(now - enterTime);
        const minsDiff = Math.floor(timeDiff / (1000 * 60));
        const secsDiff = Math.floor(timeDiff / 1000);
        
        console.log(`\nTime difference from now:`);
        console.log(`  Seconds: ${secsDiff}`);
        console.log(`  Minutes: ${minsDiff}`);
        
        if (secsDiff > 60) {
          console.error(`❌ ISSUE: enter_time was NOT reset! Still ${minsDiff} minutes old.`);
          console.error(`   Expected: Within 5 seconds of now`);
          console.error(`   Actual: ${enterTime.toISOString()}`);
        } else {
          console.log(`✅ SUCCESS: enter_time was reset correctly (within ${secsDiff} seconds)`);
        }
      }
    } else {
      console.warn('⚠️ Current user not found in API response after ENTER');
    }
    
    console.log('\n--- Summary ---');
    console.log('If enter_time was not reset, check backend logs for:');
    console.log('  1. "PRESENCE_EVENT: CRITICAL - enter_time update FAILED!"');
    console.log('  2. Prisma error codes in presenceService.js');
    console.log('  3. Database schema constraints on enter_time field');
    
  } catch (error) {
    console.error('❌ Error sending ENTER event or checking result:', error);
  }
  
  console.log('\n🔍 === DIAGNOSTIC END ===');
})();

