// VISIBILITY FIX DIAGNOSTIC
// Run this after the fix to verify visibility is working
// Copy-paste entire block into console

(async function() {
  console.log('🔍 === VISIBILITY FIX VERIFICATION ===');
  
  const currentUrlData = window.currentUrlData || {};
  const pageId = currentUrlData.pageId || 'google_com_';
  const pageUrl = currentUrlData.normalizedUrl || 'google.com/';
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  
  console.log('\n--- 1. TEST API ENDPOINT DIRECTLY ---');
  let apiUsers = [];
  try {
    const apiResponse = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`, { method: 'GET' });
    apiUsers = apiResponse?.active || [];
    console.log('✅ API returned:', apiUsers.length, 'users');
    apiUsers.forEach((u, idx) => {
      console.log(`   User ${idx + 1}: ${u.name} (${u.id})`);
      console.log(`     isActive: ${u.isActive}, status: "${u.status}"`);
      console.log(`     enterTime: ${u.enterTime}, lastSeen: ${u.lastSeen}`);
    });
  } catch (error) {
    console.error('❌ API call failed:', error);
  }
  
  console.log('\n--- 2. TEST refreshVisibilityAvatars() ---');
  if (typeof window.refreshVisibilityAvatars === 'function') {
    try {
      await window.refreshVisibilityAvatars();
      console.log('✅ refreshVisibilityAvatars() completed');
    } catch (error) {
      console.error('❌ refreshVisibilityAvatars() failed:', error);
    }
  } else {
    console.error('❌ refreshVisibilityAvatars() function not available');
  }
  
  console.log('\n--- 3. CHECK UI STATE ---');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for UI update
  const visibleTab = document.getElementById('canopi-visible');
  if (visibleTab) {
    const userElements = visibleTab.querySelectorAll('.user-avatar-container, .item');
    console.log('✅ UI shows', userElements.length, 'users');
    userElements.forEach((el, idx) => {
      const name = el.querySelector('.user-name')?.textContent.trim() || 'Unknown';
      const status = el.querySelector('.user-status')?.textContent.trim() || 'Unknown';
      console.log(`   UI User ${idx + 1}: ${name} - Status: "${status}"`);
    });
    
    if (userElements.length === 0 && apiUsers.length > 0) {
      console.error('🚨 ISSUE: API has', apiUsers.length, 'users but UI shows 0');
      console.error('   Check console logs for refreshVisibilityAvatars processing');
    } else if (userElements.length === apiUsers.length - 1) {
      console.log('✅ UI count matches (excluding current user)');
    } else if (userElements.length === apiUsers.length) {
      console.warn('⚠️ UI shows same number as API - current user might not be filtered');
    }
  } else {
    console.error('❌ Canopi visible tab not found');
  }
  
  console.log('\n--- 4. VERIFY STATUS DISPLAY ---');
  if (visibleTab) {
    const statusElements = visibleTab.querySelectorAll('.user-status');
    statusElements.forEach((el, idx) => {
      const statusText = el.textContent.trim();
      const name = el.closest('.item')?.querySelector('.user-name')?.textContent.trim();
      console.log(`   ${name || `User ${idx + 1}`}: "${statusText}"`);
      
      // Check if status is correct
      if (statusText === 'offline' || statusText === 'Now' || statusText.includes('ago')) {
        console.log(`     ✅ Status format looks correct`);
      } else {
        console.warn(`     ⚠️ Unexpected status format`);
      }
    });
  }
  
  console.log('\n🔍 === VERIFICATION END ===');
  
  return {
    apiUsersCount: apiUsers.length,
    uiUsersCount: visibleTab ? visibleTab.querySelectorAll('.user-avatar-container, .item').length : 0,
    matches: apiUsers.length - 1 === (visibleTab ? visibleTab.querySelectorAll('.user-avatar-container, .item').length : 0)
  };
})();

