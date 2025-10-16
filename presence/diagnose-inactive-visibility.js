/**
 * DIAGNOSTIC TOOL: Test Inactive User Visibility
 * 
 * Run in browser console: testInactiveVisibility()
 * 
 * This tests whether inactive users (those who left or moved to different pages)
 * are properly displayed with "Last seen X ago" status.
 */

window.testInactiveVisibility = function() {
  console.log('');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('🧪🧪🧪 INACTIVE USER VISIBILITY DIAGNOSTIC');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('');
  
  // Step 1: Check extension build version
  console.log('📋 Step 1: Checking extension build version...');
  console.log('');
  
  const buildVersion = window.EXTENSION_BUILD || 'UNKNOWN';
  console.log(`✅ Extension build: ${buildVersion}`);
  console.log(`   Expected: 2025-10-14-avatar-filter-fix or later`);
  
  if (buildVersion !== '2025-10-14-avatar-filter-fix') {
    console.log('');
    console.log('⚠️⚠️⚠️ WARNING: You may be running an old version!');
    console.log('⚠️ Please reload the extension:');
    console.log('⚠️   1. Go to chrome://extensions/');
    console.log('⚠️   2. Find "Metalayer Initiative"');
    console.log('⚠️   3. Click the reload button (circular arrow)');
    console.log('⚠️   4. Close and reopen the sidepanel');
    console.log('⚠️⚠️⚠️');
    console.log('');
  }
  
  // Step 2: Check current visibility data
  console.log('');
  console.log('📋 Step 2: Checking current visibility data...');
  console.log('');
  
  if (!window.currentVisibilityData || !window.currentVisibilityData.active) {
    console.log('❌ No visibility data found!');
    console.log('   This means no users are currently visible.');
    console.log('   Try navigating to a page where other users are present.');
    return;
  }
  
  const allUsers = window.currentVisibilityData.active;
  console.log(`✅ Found ${allUsers.length} users in visibility data`);
  console.log('');
  
  // Step 3: Analyze each user
  console.log('📋 Step 3: Analyzing user status...');
  console.log('');
  
  allUsers.forEach((user, index) => {
    console.log(`👤 User ${index + 1}: ${user.name} (${user.userId})`);
    console.log(`   Email: ${user.email || user.userId}`);
    console.log(`   Avatar URL: ${user.avatarUrl || 'null (will use placeholder)'}`);
    console.log(`   Is Active: ${user.isActive}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Enter Time: ${user.enterTime}`);
    console.log(`   Last Seen: ${user.lastSeen}`);
    console.log(`   Aura Color: ${user.auraColor}`);
    
    // Calculate expected display
    const isActive = user.isActive === true;
    const hasLeft = user.status === 'offline' || !isActive;
    
    if (hasLeft) {
      const lastSeenDisplay = formatLastSeenDisplay(user.lastSeen);
      console.log(`   ✅ EXPECTED: Should show "${lastSeenDisplay}" (user has left)`);
    } else if (isActive) {
      const timeDisplay = formatTimeDisplay(user.enterTime);
      console.log(`   ✅ EXPECTED: Should show "${timeDisplay}" (user is active)`);
    } else {
      console.log(`   ⚠️ UNEXPECTED: User status is unclear`);
    }
    console.log('');
  });
  
  // Step 4: Check DOM rendering
  console.log('📋 Step 4: Checking DOM rendering...');
  console.log('');
  
  const userElements = document.querySelectorAll('.user-item');
  console.log(`✅ Found ${userElements.length} user elements in DOM`);
  
  if (userElements.length === 0) {
    console.log('');
    console.log('❌❌❌ NO USERS RENDERED IN DOM!');
    console.log('❌ This is the problem - users are being filtered out!');
    console.log('');
    console.log('🔍 Checking filter logic...');
    
    // Check if old filtering code is running
    const currentUserEmail = window.currentUser?.email;
    console.log(`   Current user: ${currentUserEmail}`);
    
    allUsers.forEach(user => {
      const isCurrentUser = user.userId === currentUserEmail || 
                           user.handle === currentUserEmail?.split('@')[0] ||
                           user.name === currentUserEmail?.split('@')[0] ||
                           user.email === currentUserEmail;
      
      if (isCurrentUser) {
        console.log(`   ✅ ${user.name} - Correctly filtered (current user)`);
      } else if (!user.avatarUrl) {
        console.log(`   ❌ ${user.name} - INCORRECTLY FILTERED (null avatarUrl)`);
        console.log(`      This should NOT be filtered! Old code is running!`);
      } else {
        console.log(`   ✅ ${user.name} - Should be visible`);
      }
    });
    
    console.log('');
    console.log('💡 SOLUTION: Reload the extension to get the latest code!');
    console.log('');
  } else {
    console.log('');
    userElements.forEach((element, index) => {
      const userId = element.getAttribute('data-user-id');
      const userName = element.getAttribute('data-user-name');
      const statusElement = element.querySelector('.item-status');
      const statusText = statusElement?.textContent || 'NO STATUS';
      
      console.log(`🖥️ DOM Element ${index + 1}:`);
      console.log(`   User: ${userName} (${userId})`);
      console.log(`   Status Text: "${statusText}"`);
      console.log('');
    });
  }
  
  // Step 5: Test formatLastSeenDisplay function
  console.log('📋 Step 5: Testing formatLastSeenDisplay function...');
  console.log('');
  
  if (typeof window.formatLastSeenDisplay === 'function') {
    console.log('❌ formatLastSeenDisplay is NOT exposed globally!');
    console.log('   This is expected - it\'s a local function in sidepanel.js');
  } else {
    // Test with various timestamps
    const now = new Date();
    const testCases = [
      { label: '30 seconds ago', time: new Date(now - 30000) },
      { label: '2 minutes ago', time: new Date(now - 120000) },
      { label: '1 hour ago', time: new Date(now - 3600000) },
      { label: '1 day ago', time: new Date(now - 86400000) }
    ];
    
    testCases.forEach(test => {
      const result = formatLastSeenDisplay(test.time.toISOString());
      console.log(`   ${test.label}: "${result}"`);
    });
  }
  
  console.log('');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('🧪🧪🧪 DIAGNOSTIC COMPLETE');
  console.log('🧪🧪🧪═══════════════════════════════════════════════════════');
  console.log('');
  
  // Summary
  console.log('📊 SUMMARY:');
  console.log(`   Extension Build: ${buildVersion}`);
  console.log(`   Users in Data: ${allUsers.length}`);
  console.log(`   Users in DOM: ${userElements.length}`);
  
  if (userElements.length < allUsers.length - 1) { // -1 for current user
    console.log('');
    console.log('❌ PROBLEM DETECTED: Some users are being filtered out!');
    console.log('💡 SOLUTION: Reload the extension to get the latest code.');
  } else {
    console.log('');
    console.log('✅ All users are being rendered correctly!');
  }
  
  console.log('');
};

// Helper function to format last seen display (for testing)
function formatLastSeenDisplay(lastSeen) {
  if (!lastSeen) return 'Last seen unknown';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMs = now - lastSeenDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMs < 0) {
    return 'Last seen just now';
  }
  
  if (diffSeconds < 60) {
    return `Last seen ${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
  } else if (diffMinutes < 60) {
    return `Last seen ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 30) {
    return `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return 'Last seen over a month ago';
  }
}

// Helper function to format time display (for testing)
function formatTimeDisplay(enterTime) {
  const now = new Date();
  
  if (!enterTime) {
    return 'Now';
  }
  
  const enterTimeDate = new Date(enterTime);
  const diffMs = now - enterTimeDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMs < 0) {
    return 'Now';
  }
  
  if (diffSeconds < 60) {
    return 'Now';
  } else if (diffMinutes < 60) {
    return `Online for ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
  } else if (diffHours < 24) {
    return `Online for ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  } else if (diffDays < 30) {
    return `Online for ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  } else {
    return 'Last seen over a month ago';
  }
}

console.log('✅ Inactive visibility diagnostic loaded!');
console.log('📝 Run: testInactiveVisibility()');


