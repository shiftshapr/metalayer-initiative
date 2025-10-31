// DIAGNOSTIC CONSOLE CODE
// Run this in browser console to diagnose UUID and avatar issues

console.log('🔍 DIAGNOSTIC CONSOLE CODE');
console.log('==========================');

async function diagnoseIssues() {
  try {
    // Check current user data
    console.log('\n📋 Current User Data:');
    console.log('window.currentUser:', window.currentUser);
    console.log('window.currentUser?.id:', window.currentUser?.id);
    console.log('window.currentUser?.email:', window.currentUser?.email);

    // Check visibility data
    console.log('\n📋 Visibility Data:');
    if (window.currentVisibilityDataUnfiltered) {
      console.log('Active users:', window.currentVisibilityDataUnfiltered.active?.length || 0);
      window.currentVisibilityDataUnfiltered.active?.forEach((user, index) => {
        console.log(`User ${index}:`, {
          id: user.id,
          userId: user.userId,
          email: user.email,
          name: user.name,
          handle: user.handle
        });
      });
    } else {
      console.log('No visibility data available');
    }

    // Check for invalid UUIDs in visibility data
    console.log('\n📋 Invalid UUID Detection:');
    if (window.currentVisibilityDataUnfiltered?.active) {
      const invalidUsers = window.currentVisibilityDataUnfiltered.active.filter(user => {
        const id = user.id || user.userId;
        return id && !isValidUUID(id);
      });
      if (invalidUsers.length > 0) {
        console.log('❌ Invalid UUIDs found:', invalidUsers.map(u => u.id || u.userId));
      } else {
        console.log('✅ All UUIDs appear valid');
      }
    }

    // Test UUID endpoint for each user
    console.log('\n📋 UUID Endpoint Tests:');
    if (window.currentVisibilityDataUnfiltered?.active) {
      for (const user of window.currentVisibilityDataUnfiltered.active) {
        const id = user.id || user.userId;
        if (id) {
          try {
            const response = await fetch(`http://localhost:3002/v1/users/${id}`);
            const data = await response.json();
            if (response.ok) {
              console.log(`✅ ${id}: ${data.name} (${data.email})`);
            } else {
              console.log(`❌ ${id}: ${data.error}`);
            }
          } catch (error) {
            console.log(`❌ ${id}: Network error - ${error.message}`);
          }
        }
      }
    }

    // Check AvatarUtils availability
    console.log('\n📋 AvatarUtils Status:');
    if (typeof window.AvatarUtils !== 'undefined') {
      console.log('✅ AvatarUtils available');
      console.log('getAvatarUrl function:', typeof window.AvatarUtils.getAvatarUrl);
      console.log('createUnifiedAvatar function:', typeof window.AvatarUtils.createUnifiedAvatar);
    } else {
      console.log('❌ AvatarUtils not available');
    }

    // Check real-time functions
    console.log('\n📋 Real-time Functions:');
    const realtimeFunctions = ['handlePresenceChange', 'handleMessageChange', 'handleReactionChange', 'handleAuraChange'];
    realtimeFunctions.forEach(func => {
      if (typeof window[func] === 'function') {
        console.log(`✅ ${func}: Available`);
      } else {
        console.log(`❌ ${func}: Missing`);
      }
    });

    // Check for email references in DOM
    console.log('\n📋 DOM Email References:');
    const emailElements = document.querySelectorAll('[data-user-email]');
    console.log(`Found ${emailElements.length} elements with data-user-email`);
    
    const userIdElements = document.querySelectorAll('[data-user-id]');
    console.log(`Found ${userIdElements.length} elements with data-user-id`);

    // Check console errors
    console.log('\n📋 Recent Console Errors:');
    console.log('Check the console for any red error messages above this diagnostic output');

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
  }
}

// Helper function to validate UUID
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Run diagnostics
diagnoseIssues();