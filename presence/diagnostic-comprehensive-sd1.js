// ==========================================
// SD1: COMPREHENSIVE DIAGNOSTIC SCRIPT
// For Chrome Extension Presence System Issues
// ==========================================

console.log('🔧 SD1: Loading comprehensive diagnostic script...');

// ==========================================
// ISSUE 1: AVATAR DISPLAY DIAGNOSTICS
// ==========================================

window.sd1_diagnoseAvatars = async function() {
  console.log('\n=== SD1: AVATAR DISPLAY DIAGNOSTIC ===\n');
  
  // 1. Check current user avatar
  console.log('1️⃣ PROFILE AVATAR CHECK:');
  const userAvatarContainer = document.getElementById('user-avatar-container');
  const currentUser = window.currentUser;
  
  console.log('   Current user:', currentUser);
  console.log('   Profile avatar container exists:', !!userAvatarContainer);
  console.log('   Profile avatar HTML:', userAvatarContainer?.innerHTML);
  
  if (currentUser) {
    console.log('   User email:', currentUser.email);
    console.log('   User avatarUrl:', currentUser.avatarUrl);
    console.log('   User auraColor:', currentUser.auraColor);
    
    // Check if avatar URL is real Google or fake
    if (currentUser.avatarUrl) {
      const isRealGoogle = currentUser.avatarUrl.includes('googleusercontent.com');
      const isFake = currentUser.avatarUrl.includes('ui-avatars.com');
      console.log('   ✅ Avatar URL type:', isRealGoogle ? 'REAL GOOGLE' : isFake ? 'FAKE (ui-avatars)' : 'UNKNOWN');
      
      if (isFake) {
        console.error('   ❌ PROBLEM: Using fake avatar instead of real Google avatar!');
      }
    } else {
      console.error('   ❌ PROBLEM: No avatarUrl found!');
    }
  } else {
    console.error('   ❌ PROBLEM: No current user found!');
  }
  
  // 2. Check visibility avatars
  console.log('\n2️⃣ VISIBILITY AVATARS CHECK:');
  const visibilityData = window.currentVisibilityData;
  const visibilityDataUnfiltered = window.currentVisibilityDataUnfiltered;
  
  console.log('   Visibility data exists:', !!visibilityData);
  console.log('   Unfiltered visibility data exists:', !!visibilityDataUnfiltered);
  
  if (visibilityData && visibilityData.active) {
    console.log('   Active users count:', visibilityData.active.length);
    
    visibilityData.active.forEach((user, index) => {
      const isRealGoogle = user.avatarUrl && user.avatarUrl.includes('googleusercontent.com');
      const isFake = user.avatarUrl && user.avatarUrl.includes('ui-avatars.com');
      
      console.log(`   User ${index + 1}: ${user.name} (${user.email})`);
      console.log(`      avatarUrl: ${user.avatarUrl}`);
      console.log(`      Type: ${isRealGoogle ? 'REAL GOOGLE ✅' : isFake ? 'FAKE ❌' : 'UNKNOWN ⚠️'}`);
      console.log(`      auraColor: ${user.auraColor}`);
    });
  } else {
    console.error('   ❌ PROBLEM: No visibility data found!');
  }
  
  // 3. Check backend API response
  console.log('\n3️⃣ BACKEND API CHECK:');
  try {
    const urlData = await window.normalizeCurrentUrl();
    const pageId = urlData.pageId;
    console.log('   Current pageId:', pageId);
    
    const response = await window.api.getPresenceByUrl(pageId);
    console.log('   Backend response:', response);
    
    if (response && response.active) {
      console.log('   Backend returned', response.active.length, 'active users');
      
      response.active.forEach((user, index) => {
        const isRealGoogle = user.avatarUrl && user.avatarUrl.includes('googleusercontent.com');
        const isFake = user.avatarUrl && user.avatarUrl.includes('ui-avatars.com');
        
        console.log(`   Backend User ${index + 1}: ${user.name} (${user.email})`);
        console.log(`      avatarUrl: ${user.avatarUrl}`);
        console.log(`      Type: ${isRealGoogle ? 'REAL GOOGLE ✅' : isFake ? 'FAKE ❌' : 'UNKNOWN ⚠️'}`);
      });
    }
  } catch (error) {
    console.error('   ❌ PROBLEM: Backend API error:', error);
  }
  
  // 4. Check appUser table (via backend logs)
  console.log('\n4️⃣ DATABASE CHECK:');
  console.log('   ⚠️ Check backend logs for "AVATAR_FIX" messages');
  console.log('   ⚠️ Look for "NO USERS FOUND IN appUser TABLE" error');
  console.log('   ⚠️ If users are missing, they need to be added to appUser table');
  
  console.log('\n=== SD1: AVATAR DIAGNOSTIC COMPLETE ===\n');
};

// ==========================================
// ISSUE 2: VISIBILITY TIMING DIAGNOSTICS
// ==========================================

window.sd1_diagnoseVisibilityTiming = async function() {
  console.log('\n=== SD1: VISIBILITY TIMING DIAGNOSTIC ===\n');
  
  // 1. Check visibility timer
  console.log('1️⃣ VISIBILITY TIMER CHECK:');
  console.log('   Timer exists:', !!window.visibilityUpdateTimer);
  console.log('   Timer ID:', window.visibilityUpdateTimer);
  
  // 2. Check visibility data timestamps
  console.log('\n2️⃣ TIMESTAMP CHECK:');
  const visibilityData = window.currentVisibilityData;
  
  if (visibilityData && visibilityData.active) {
    const now = new Date();
    
    visibilityData.active.forEach((user, index) => {
      console.log(`   User ${index + 1}: ${user.name}`);
      console.log(`      enterTime: ${user.enterTime}`);
      console.log(`      lastSeen: ${user.lastSeen}`);
      
      if (user.enterTime) {
        const enterDate = new Date(user.enterTime);
        const diffMs = now - enterDate;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        
        console.log(`      Time since enter: ${diffMinutes} minutes (${diffSeconds} seconds)`);
        console.log(`      Expected display: ${diffSeconds < 60 ? 'Now' : `Online for ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`}`);
      } else {
        console.error(`      ❌ PROBLEM: No enterTime! Will show "Now" always!`);
      }
      
      if (user.lastSeen) {
        const lastSeenDate = new Date(user.lastSeen);
        const diffMs = now - lastSeenDate;
        const diffSeconds = Math.floor(diffMs / 1000);
        
        console.log(`      Time since last seen: ${diffSeconds} seconds`);
        console.log(`      Is active (< 30s): ${diffSeconds < 30 ? 'YES ✅' : 'NO ❌'}`);
      }
    });
  } else {
    console.error('   ❌ PROBLEM: No visibility data found!');
  }
  
  // 3. Check DOM elements
  console.log('\n3️⃣ DOM ELEMENTS CHECK:');
  const userItems = document.querySelectorAll('.user-item');
  console.log('   User items in DOM:', userItems.length);
  
  userItems.forEach((item, index) => {
    const userId = item.dataset.userId;
    const statusElement = item.querySelector('.item-status');
    const statusText = statusElement?.textContent;
    
    console.log(`   DOM User ${index + 1}:`);
    console.log(`      userId: ${userId}`);
    console.log(`      Status text: "${statusText}"`);
  });
  
  // 4. Test time update function
  console.log('\n4️⃣ TIME UPDATE FUNCTION TEST:');
  console.log('   Calling updateVisibilityTimes()...');
  if (typeof updateVisibilityTimes === 'function') {
    updateVisibilityTimes();
    console.log('   ✅ Function executed');
  } else {
    console.error('   ❌ PROBLEM: updateVisibilityTimes function not found!');
  }
  
  // 5. Check backend enter_time
  console.log('\n5️⃣ BACKEND ENTER_TIME CHECK:');
  console.log('   ⚠️ Check backend logs for "ENTER_TIME_BUG" messages');
  console.log('   ⚠️ Look for "enter_time is null" or "enter_time is undefined"');
  console.log('   ⚠️ If enter_time is missing, check Supabase user_presence table');
  
  console.log('\n=== SD1: VISIBILITY TIMING DIAGNOSTIC COMPLETE ===\n');
};

// ==========================================
// ISSUE 3: GHOST PRESENCE DIAGNOSTICS
// ==========================================

window.sd1_diagnoseGhostPresence = async function() {
  console.log('\n=== SD1: GHOST PRESENCE DIAGNOSTIC ===\n');
  
  // 1. Check if leaveCurrentPage exists
  console.log('1️⃣ LEAVE FUNCTION CHECK:');
  const hasLeaveFunction = window.supabaseRealtimeClient && 
                          typeof window.supabaseRealtimeClient.leaveCurrentPage === 'function';
  
  console.log('   supabaseRealtimeClient exists:', !!window.supabaseRealtimeClient);
  console.log('   leaveCurrentPage function exists:', hasLeaveFunction);
  
  if (!hasLeaveFunction) {
    console.error('   ❌ PROBLEM: leaveCurrentPage function not found!');
    console.error('   ❌ This means users won\'t be marked inactive when they leave!');
  }
  
  // 2. Check tab change handlers
  console.log('\n2️⃣ TAB CHANGE HANDLERS CHECK:');
  console.log('   ⚠️ Check if handleTabChange and handleTabUpdate call leaveCurrentPage()');
  console.log('   ⚠️ Look for "🚪 TAB_CHANGE: Leaving current page" in logs when switching tabs');
  
  // 3. Test leave function manually
  console.log('\n3️⃣ MANUAL LEAVE TEST:');
  if (hasLeaveFunction) {
    console.log('   You can test manually by running:');
    console.log('   window.supabaseRealtimeClient.leaveCurrentPage()');
    console.log('   Then check if your presence disappears from other profiles');
  }
  
  // 4. Check current presence state
  console.log('\n4️⃣ CURRENT PRESENCE STATE:');
  try {
    const currentUser = window.currentUser;
    if (currentUser) {
      console.log('   Current user:', currentUser.email);
      console.log('   ⚠️ Check Supabase user_presence table for this user');
      console.log('   ⚠️ Look for is_active flag and last_seen timestamp');
    }
  } catch (error) {
    console.error('   ❌ PROBLEM:', error);
  }
  
  // 5. Check 30-second threshold
  console.log('\n5️⃣ ACTIVITY THRESHOLD CHECK:');
  console.log('   Current threshold: 30 seconds');
  console.log('   ⚠️ Users will appear "active" if last_seen is within 30 seconds');
  console.log('   ⚠️ If threshold is too long, ghost presence will persist longer');
  
  console.log('\n=== SD1: GHOST PRESENCE DIAGNOSTIC COMPLETE ===\n');
};

// ==========================================
// ISSUE 4: EMPTY VISIBILITY DIAGNOSTICS
// ==========================================

window.sd1_diagnoseEmptyVisibility = async function() {
  console.log('\n=== SD1: EMPTY VISIBILITY DIAGNOSTIC ===\n');
  
  // 1. Check if users are on the same page
  console.log('1️⃣ PAGE ID CHECK:');
  try {
    const urlData = await window.normalizeCurrentUrl();
    const pageId = urlData.pageId;
    console.log('   Current pageId:', pageId);
    console.log('   Current URL:', urlData.normalizedUrl);
    
    // Check for triple underscores (bug indicator)
    if (pageId.includes('___')) {
      console.error('   ❌ PROBLEM: pageId contains TRIPLE underscores!');
      console.error('   ❌ This indicates a cache bug - hard refresh extension!');
    }
  } catch (error) {
    console.error('   ❌ PROBLEM:', error);
  }
  
  // 2. Check backend response
  console.log('\n2️⃣ BACKEND RESPONSE CHECK:');
  try {
    const urlData = await window.normalizeCurrentUrl();
    const pageId = urlData.pageId;
    const response = await window.api.getPresenceByUrl(pageId);
    
    console.log('   Backend response:', response);
    console.log('   Active users count:', response?.active?.length || 0);
    
    if (!response || !response.active || response.active.length === 0) {
      console.error('   ❌ PROBLEM: Backend returned no active users!');
      console.error('   ❌ Check backend logs for query results');
    }
  } catch (error) {
    console.error('   ❌ PROBLEM:', error);
  }
  
  // 3. Check filtering logic
  console.log('\n3️⃣ FILTERING LOGIC CHECK:');
  const visibilityData = window.currentVisibilityData;
  const visibilityDataUnfiltered = window.currentVisibilityDataUnfiltered;
  
  console.log('   Unfiltered users:', visibilityDataUnfiltered?.active?.length || 0);
  console.log('   Filtered users:', visibilityData?.active?.length || 0);
  
  if (visibilityDataUnfiltered && visibilityDataUnfiltered.active) {
    const currentUserEmail = window.currentUser?.email;
    console.log('   Current user email:', currentUserEmail);
    
    visibilityDataUnfiltered.active.forEach((user, index) => {
      const isCurrentUser = user.email === currentUserEmail || user.userId === currentUserEmail;
      const hasValidAvatar = user.avatarUrl && user.avatarUrl !== 'null' && user.avatarUrl.startsWith('http');
      
      console.log(`   User ${index + 1}: ${user.name}`);
      console.log(`      email: ${user.email}`);
      console.log(`      Is current user: ${isCurrentUser ? 'YES' : 'NO'}`);
      console.log(`      Has valid avatar: ${hasValidAvatar ? 'YES' : 'NO'}`);
      console.log(`      Should be visible: ${!isCurrentUser && hasValidAvatar ? 'YES ✅' : 'NO ❌'}`);
    });
  }
  
  console.log('\n=== SD1: EMPTY VISIBILITY DIAGNOSTIC COMPLETE ===\n');
};

// ==========================================
// COMPREHENSIVE DIAGNOSTIC (ALL ISSUES)
// ==========================================

window.sd1_diagnoseAll = async function() {
  console.log('\n🔧 SD1: RUNNING COMPREHENSIVE DIAGNOSTIC...\n');
  
  await window.sd1_diagnoseAvatars();
  await window.sd1_diagnoseVisibilityTiming();
  await window.sd1_diagnoseGhostPresence();
  await window.sd1_diagnoseEmptyVisibility();
  
  console.log('\n✅ SD1: COMPREHENSIVE DIAGNOSTIC COMPLETE\n');
  console.log('📋 NEXT STEPS:');
  console.log('   1. Review the diagnostic output above');
  console.log('   2. Check backend logs for corresponding errors');
  console.log('   3. Run specific diagnostics for individual issues');
  console.log('   4. Apply fixes based on identified problems\n');
};

console.log('✅ SD1: Diagnostic script loaded successfully!');
console.log('📋 Available functions:');
console.log('   - window.sd1_diagnoseAll() - Run all diagnostics');
console.log('   - window.sd1_diagnoseAvatars() - Avatar display issues');
console.log('   - window.sd1_diagnoseVisibilityTiming() - Timing issues');
console.log('   - window.sd1_diagnoseGhostPresence() - Ghost presence issues');
console.log('   - window.sd1_diagnoseEmptyVisibility() - Empty visibility issues');

