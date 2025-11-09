// ROOT CAUSE FIX DIAGNOSTIC: Visibility Status and Enter Time Issues
(async function diagnoseVisibilityStatus() {
  console.log('🔍 === VISIBILITY STATUS & ENTER TIME DIAGNOSTIC ===');
  
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
  
  console.log('\n--- Step 1: Check API Response ---');
  try {
    const response = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(window.currentUrlData?.normalizedUrl || window.currentUrlData?.rawUrl || '')}`, { method: 'GET' });
    console.log('API returned', response?.active?.length || 0, 'users');
    
    if (response?.active) {
      response.active.forEach((user, idx) => {
        console.log(`\n   ${idx + 1}. ${user.name || user.email} (${user.id || user.userId})`);
        console.log(`      isActive: ${user.isActive} (Type: ${typeof user.isActive})`);
        console.log(`      status: ${user.status} (Type: ${typeof user.status})`);
        console.log(`      lastSeen: ${user.lastSeen}`);
        console.log(`      enterTime: ${user.enterTime}`);
        
        if (user.isActive === undefined || user.isActive === null) {
          console.error(`      ❌ ISSUE: isActive is ${user.isActive} - should be boolean`);
        }
        if (!user.status || user.status === undefined) {
          console.error(`      ❌ ISSUE: status is undefined - should be 'online' or 'recently_seen'`);
        }
        if (user.isActive === true && user.status !== 'online') {
          console.error(`      ❌ ISSUE: isActive=true but status=${user.status} - should be 'online'`);
        }
        if (user.isActive === false && user.status === 'online') {
          console.error(`      ❌ ISSUE: isActive=false but status='online' - inconsistent state`);
        }
        if (user.enterTime) {
          const enterTime = new Date(user.enterTime);
          const now = new Date();
          const daysDiff = Math.floor((now - enterTime) / (1000 * 60 * 60 * 24));
          if (daysDiff > 0) {
            console.warn(`      ⚠️ enterTime is ${daysDiff} days old - may need reset`);
          } else {
            const minsDiff = Math.floor((now - enterTime) / (1000 * 60));
            console.log(`      ✅ enterTime is ${minsDiff} minutes old (OK)`);
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ Error fetching API response:', error);
  }
  
  console.log('\n--- Step 2: Check Window Visibility Data ---');
  if (window.currentVisibilityData?.active) {
    console.log('window.currentVisibilityData.active:', window.currentVisibilityData.active.length, 'users');
    window.currentVisibilityData.active.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.name || user.handle || user.email}`);
      console.log(`      isActive: ${user.isActive}, status: ${user.status}`);
    });
  } else {
    console.warn('⚠️ window.currentVisibilityData.active is not set');
  }
  
  console.log('\n--- Step 3: Send ENTER Event and Verify ---');
  try {
    console.log('Sending ENTER event...');
    const enterResult = await window.sendPresenceEvent('ENTER');
    console.log('ENTER event result:', enterResult);
    
    console.log('\n--- Step 4: Wait 2 seconds for DB update ---');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n--- Step 5: Check API Response After ENTER ---');
    const afterResponse = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(window.currentUrlData?.normalizedUrl || window.currentUrlData?.rawUrl || '')}`, { method: 'GET' });
    const currentUserData = afterResponse?.active?.find(u => (u.id || u.userId) === currentUserId);
    
    if (currentUserData) {
      console.log('Current user data after ENTER:');
      console.log(`   isActive: ${currentUserData.isActive}`);
      console.log(`   status: ${currentUserData.status}`);
      console.log(`   enterTime: ${currentUserData.enterTime}`);
      
      if (currentUserData.enterTime) {
        const enterTime = new Date(currentUserData.enterTime);
        const now = new Date();
        const timeDiff = Math.abs(now - enterTime);
        const secsDiff = Math.floor(timeDiff / 1000);
        const minsDiff = Math.floor(timeDiff / (1000 * 60));
        
        if (secsDiff > 60) {
          console.error(`   ❌ ISSUE: enter_time was NOT reset! Still ${minsDiff} minutes old.`);
          console.error(`      Expected: Within 5 seconds of now`);
          console.error(`      Actual: ${enterTime.toISOString()}`);
        } else {
          console.log(`   ✅ SUCCESS: enter_time was reset correctly (within ${secsDiff} seconds)`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error sending ENTER event or checking result:', error);
  }
  
  console.log('\n--- Summary ---');
  console.log('Issues to check:');
  console.log('  1. isActive should be boolean (true/false), not undefined');
  console.log('  2. status should be "online" or "recently_seen", never undefined');
  console.log('  3. If isActive=true, status should be "online"');
  console.log('  4. enterTime should reset to current time on ENTER events');
  console.log('  5. Users on same page should show as "online", not "last seen"');
  
  console.log('\n🔍 === DIAGNOSTIC END ===');
})();

