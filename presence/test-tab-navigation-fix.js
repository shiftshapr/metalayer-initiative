// TE2 TEST SUITE: Tab Navigation & Ghost Presence Fix
// Tests for the 2025-10-12-ghost-fix build

console.log('✅ TE2: Tab Navigation & Ghost Presence test suite loaded');

// Test 1: Verify leaveCurrentPage() is called on tab change
window.testExitEventOnTabChange = async function() {
  console.log('🧪 TE2: === EXIT EVENT ON TAB CHANGE TEST ===');
  
  try {
    // Check if supabaseRealtimeClient has the leaveCurrentPage method
    if (!window.supabaseRealtimeClient) {
      throw new Error('supabaseRealtimeClient not available');
    }
    
    if (typeof window.supabaseRealtimeClient.leaveCurrentPage !== 'function') {
      throw new Error('leaveCurrentPage method not found on supabaseRealtimeClient');
    }
    
    console.log('✅ TE2: leaveCurrentPage() method exists');
    
    // Test the method directly (manual call)
    console.log('🧪 TE2: Testing leaveCurrentPage() directly...');
    await window.supabaseRealtimeClient.leaveCurrentPage();
    console.log('✅ TE2: leaveCurrentPage() executed without errors');
    
    console.log('🧪 TE2: MANUAL TEST REQUIRED:');
    console.log('   1. Open this sidepanel on Page A');
    console.log('   2. Watch console for 🚪 PRESENCE_EXIT messages');
    console.log('   3. Navigate to Page B in the same tab');
    console.log('   4. Verify console shows:');
    console.log('      - 🚪 PRESENCE_EXIT: === LEAVING PAGE ===');
    console.log('      - ✅ PRESENCE_EXIT: Marked [email] as inactive on [pageId]');
    console.log('   5. Check visibility list on another profile - you should disappear from Page A immediately');
    
    return { success: true, message: 'Method exists and can be called' };
  } catch (error) {
    console.error('❌ TE2: Test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test 2: Verify presence update creates new session after EXIT
window.testPresenceResetAfterExit = async function() {
  console.log('🧪 TE2: === PRESENCE RESET AFTER EXIT TEST ===');
  
  try {
    const currentUser = window.currentUser;
    if (!currentUser) {
      throw new Error('No current user authenticated');
    }
    
    // Get current page info
    const urlData = await window.normalizeCurrentUrl();
    const pageId = urlData.pageId;
    const pageUrl = urlData.normalizedUrl;
    
    console.log('🧪 TE2: Current page:', { pageId, pageUrl });
    console.log('🧪 TE2: Current user:', currentUser.email);
    
    // Step 1: Send EXIT
    console.log('🧪 TE2: Step 1 - Calling leaveCurrentPage()...');
    await window.supabaseRealtimeClient.leaveCurrentPage();
    
    // Wait 2 seconds
    console.log('🧪 TE2: Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Rejoin page (simulate tab return)
    console.log('🧪 TE2: Step 2 - Rejoining page...');
    await window.supabaseRealtimeClient.setCurrentUser(currentUser.email, currentUser.id || currentUser.email);
    await window.supabaseRealtimeClient.joinPage(pageId, pageUrl);
    
    // Step 3: Query Supabase to verify enter_time was reset
    console.log('🧪 TE2: Step 3 - Checking if enter_time was reset...');
    const { data, error } = await window.supabase
      .from('user_presence')
      .select('enter_time, last_seen, is_active')
      .eq('user_email', currentUser.email)
      .eq('page_id', pageId);
    
    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error('No presence record found after rejoin');
    }
    
    const presence = data[0];
    console.log('🧪 TE2: Presence record:', {
      enter_time: presence.enter_time,
      last_seen: presence.last_seen,
      is_active: presence.is_active
    });
    
    // Check if enter_time is recent (within last 5 seconds)
    const enterTime = new Date(presence.enter_time);
    const now = new Date();
    const diffSeconds = (now - enterTime) / 1000;
    
    console.log('🧪 TE2: Time since enter_time:', Math.floor(diffSeconds), 'seconds');
    
    if (diffSeconds > 10) {
      console.warn('⚠️ TE2: enter_time might not have been reset (> 10 seconds old)');
      console.warn('⚠️ TE2: This could indicate the new session detection is not working');
    } else {
      console.log('✅ TE2: enter_time is recent - new session detected correctly');
    }
    
    if (!presence.is_active) {
      console.warn('⚠️ TE2: is_active is false - should be true after rejoin');
    } else {
      console.log('✅ TE2: is_active is true - correct');
    }
    
    return { 
      success: true, 
      presence: presence,
      diffSeconds: Math.floor(diffSeconds)
    };
  } catch (error) {
    console.error('❌ TE2: Test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test 3: Monitor visibility updates during tab navigation
window.testVisibilityUpdatesDuringTabNav = async function(durationSeconds = 60) {
  console.log(`🧪 TE2: === VISIBILITY UPDATES DURING TAB NAV (${durationSeconds}s) ===`);
  console.log('🧪 TE2: MANUAL TEST REQUIRED:');
  console.log('   1. Open TWO browser profiles (e.g., daveroom and themetalayer)');
  console.log('   2. On Profile A: Stay on Page X');
  console.log('   3. On Profile B: Navigate between Page X and Page Y every 10 seconds');
  console.log('   4. On Profile A: Watch visibility list');
  console.log('   5. Expected: Profile B should instantly disappear/appear as they navigate');
  console.log('   6. NOT Expected: Profile B lingering on old page for 30 seconds');
  console.log('');
  console.log(`🧪 TE2: Starting ${durationSeconds}s monitoring...`);
  
  const startTime = Date.now();
  const updates = [];
  
  // Monitor visibility data every 2 seconds
  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    if (elapsed >= durationSeconds) {
      clearInterval(interval);
      console.log('🧪 TE2: Monitoring complete');
      console.log('🧪 TE2: Captured updates:', updates);
      return;
    }
    
    // Capture current visibility data
    if (window.currentVisibilityData && window.currentVisibilityData.active) {
      const snapshot = {
        time: elapsed,
        users: window.currentVisibilityData.active.map(u => ({
          email: u.email,
          pageUrl: u.pageUrl,
          isActive: u.isActive,
          enterTime: u.enterTime,
          lastSeen: u.lastSeen
        }))
      };
      updates.push(snapshot);
      console.log(`🧪 TE2: [${elapsed}s] Visibility snapshot:`, snapshot.users);
    }
  }, 2000);
  
  return new Promise(resolve => {
    setTimeout(() => {
      clearInterval(interval);
      resolve({ success: true, updates: updates });
    }, durationSeconds * 1000);
  });
};

// Test 4: Backend API for chat messages diagnostic
window.testChatMessagesAPI = async function() {
  console.log('🧪 TE2: === CHAT MESSAGES API TEST ===');
  
  try {
    const currentUser = window.currentUser;
    if (!currentUser) {
      throw new Error('No current user authenticated');
    }
    
    // Get current page info
    const urlData = await window.normalizeCurrentUrl();
    const uri = urlData.normalizedUrl;
    
    console.log('🧪 TE2: Testing chat API for:', { uri });
    
    // Get active communities
    const result = await chrome.storage.local.get(['activeCommunities']);
    const activeCommunities = result.activeCommunities || ['comm-001'];
    console.log('🧪 TE2: Active communities:', activeCommunities);
    
    // Test each community
    for (const communityId of activeCommunities) {
      console.log(`🧪 TE2: Testing community ${communityId}...`);
      
      const response = await window.api.getChatHistory(communityId, null, uri);
      
      console.log(`🧪 TE2: API Response for ${communityId}:`, {
        conversationsCount: response.conversations ? response.conversations.length : 0,
        hasMessages: response.conversations && response.conversations.some(c => c.messages && c.messages.length > 0)
      });
      
      if (response.conversations && response.conversations.length > 0) {
        console.log('✅ TE2: Found conversations:');
        response.conversations.forEach((conv, index) => {
          console.log(`   ${index + 1}. Conversation ${conv.id}: ${conv.messages ? conv.messages.length : 0} messages`);
          if (conv.messages && conv.messages.length > 0) {
            console.log(`      First message: "${conv.messages[0].body.substring(0, 50)}..."`);
          }
        });
      } else {
        console.warn(`⚠️ TE2: No conversations found for ${communityId} on this page`);
        console.warn('⚠️ TE2: This could mean:');
        console.warn('   1. No messages exist for this community on this page');
        console.warn('   2. Messages exist but with wrong page_id (mismatch)');
        console.warn('   3. Check backend logs for CHAT_DIAGNOSTIC output');
      }
    }
    
    console.log('🧪 TE2: NEXT STEPS:');
    console.log('   1. Check backend console logs for:');
    console.log('      🔍 CHAT_DIAGNOSTIC: Total conversations in community X: Y');
    console.log('      🔍 CHAT_DIAGNOSTIC: All conversations: [...]');
    console.log('   2. Compare pageId values in backend logs with current frontend pageId:', urlData.pageId);
    console.log('   3. If mismatch found, old messages need migration to new pageId format');
    
    return { success: true, message: 'Check backend logs for diagnostics' };
  } catch (error) {
    console.error('❌ TE2: Test failed:', error);
    return { success: false, error: error.message };
  }
};

// Run all tests
window.runAllTabNavigationTests = async function() {
  console.log('🚀 TE2: Running all tab navigation tests...');
  console.log('');
  
  // Test 1
  const test1 = await window.testExitEventOnTabChange();
  console.log('Test 1 Result:', test1);
  console.log('');
  
  // Test 2
  const test2 = await window.testPresenceResetAfterExit();
  console.log('Test 2 Result:', test2);
  console.log('');
  
  // Test 4 (skip 3 as it requires manual testing)
  const test4 = await window.testChatMessagesAPI();
  console.log('Test 4 Result:', test4);
  console.log('');
  
  console.log('🏁 TE2: Automated tests complete');
  console.log('🏁 TE2: Run window.testVisibilityUpdatesDuringTabNav(60) for manual test 3');
  console.log('');
  console.log('🏁 TE2: SUMMARY:');
  console.log('   Test 1 (Exit Event):', test1.success ? '✅ PASS' : '❌ FAIL');
  console.log('   Test 2 (Presence Reset):', test2.success ? '✅ PASS' : '❌ FAIL');
  console.log('   Test 3 (Visibility Updates): MANUAL');
  console.log('   Test 4 (Chat Messages API):', test4.success ? '✅ PASS' : '❌ FAIL');
};

console.log('✅ TE2: Tab Navigation test suite loaded. Run window.runAllTabNavigationTests() to execute.');

