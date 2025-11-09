// COMPREHENSIVE DIAGNOSTIC CONSOLE CODE
// Run this in browser console to diagnose UUID and avatar issues

console.log('🔍 COMPREHENSIVE DIAGNOSTIC CONSOLE CODE');
console.log('==========================================');

async function comprehensiveDiagnose() {
  try {
    // Check current user data
    console.log('\n📋 Current User Data:');
    console.log('window.currentUser:', window.currentUser);
    console.log('window.currentUser?.id:', window.currentUser?.id);
    console.log('window.currentUser?.user_id:', window.currentUser?.user_id);
    console.log('window.currentUser?.email:', window.currentUser?.email);

    // Check visibility data
    console.log('\n📋 Visibility Data Analysis:');
    if (window.currentVisibilityDataUnfiltered) {
      console.log('Active users count:', window.currentVisibilityDataUnfiltered.active?.length || 0);
      console.log('Active users:');
      window.currentVisibilityDataUnfiltered.active?.forEach((user, index) => {
        console.log(`  User ${index}:`, {
          id: user.id,
          userId: user.userId,
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          handle: user.handle
        });
      });
    } else {
      console.log('No unfiltered visibility data available');
    }

    if (window.currentVisibilityData) {
      console.log('Filtered visibility data count:', window.currentVisibilityData.active?.length || 0);
    }

    // Check for invalid UUIDs in visibility data
    console.log('\n📋 Invalid UUID Detection:');
    const invalidUUIDs = ['18ad77cb-222e-4485-a720-db39981a4099', '41266409-84e9-439e-b1b3-df44d0797581', '60524d7d-da7d-4216-ba3b-475becaa2527', '6c89ce15-c4a4-45b7-82f8-9dae06418f00'];
    
    if (window.currentVisibilityDataUnfiltered?.active) {
      const foundInvalidUsers = window.currentVisibilityDataUnfiltered.active.filter(user => {
        const id = user.id || user.userId || user.user_id;
        return id && invalidUUIDs.includes(id);
      });
      
      if (foundInvalidUsers.length > 0) {
        console.log('❌ Found invalid UUIDs in visibility data:', foundInvalidUsers.map(u => u.id || u.userId || u.user_id));
      } else {
        console.log('✅ No invalid UUIDs found in visibility data');
      }
    }

    // Check browser storage for stale data
    console.log('\n📋 Browser Storage Check:');
    try {
      const storageData = await new Promise((resolve) => {
        chrome.storage.local.get(null, resolve);
      });
      
      const storageKeys = Object.keys(storageData);
      console.log('Storage keys count:', storageKeys.length);
      
      // Look for keys that might contain user data
      const userKeys = storageKeys.filter(key => 
        key.includes('user') || key.includes('visibility') || key.includes('presence')
      );
      console.log('User-related storage keys:', userKeys);
      
      // Check for invalid UUIDs in storage
      const storageValues = Object.values(storageData);
      const foundInvalidInStorage = storageValues.filter(value => {
        if (typeof value === 'string') {
          return invalidUUIDs.some(uuid => value.includes(uuid));
        }
        if (typeof value === 'object' && value !== null) {
          const valueStr = JSON.stringify(value);
          return invalidUUIDs.some(uuid => valueStr.includes(uuid));
        }
        return false;
      });
      
      if (foundInvalidInStorage.length > 0) {
        console.log('❌ Found invalid UUIDs in storage:', foundInvalidInStorage.length, 'items');
      } else {
        console.log('✅ No invalid UUIDs found in storage');
      }
      
    } catch (error) {
      console.log('❌ Storage check failed:', error.message);
    }

    // Test UUID endpoint for valid users
    console.log('\n📋 Valid UUID Endpoint Tests:');
    const validUUIDs = ['550e8400-e29b-41d4-a716-446655440000', 'efce30c3-6788-4bf7-a52c-5e6652923964', '550e8400-e29b-41d4-a716-446655440001'];
    
    for (const uuid of validUUIDs) {
      try {
        const response = await fetch(`http://216.238.91.120:3002/v1/users/${uuid}`);
        const data = await response.json();
        if (response.ok) {
          console.log(`✅ ${uuid}: ${data.name} (${data.email})`);
        } else {
          console.log(`❌ ${uuid}: ${data.error}`);
        }
      } catch (error) {
        console.log(`❌ ${uuid}: Network error - ${error.message}`);
      }
    }

    // Test invalid UUIDs
    console.log('\n📋 Invalid UUID Endpoint Tests:');
    for (const uuid of invalidUUIDs) {
      try {
        const response = await fetch(`http://216.238.91.120:3002/v1/users/${uuid}`);
        const data = await response.json();
        if (response.ok) {
          console.log(`✅ ${uuid}: ${data.name} (${data.email})`);
        } else {
          console.log(`❌ ${uuid}: ${data.error}`);
        }
      } catch (error) {
        console.log(`❌ ${uuid}: Network error - ${error.message}`);
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
    console.log('\n📋 DOM Analysis:');
    const emailElements = document.querySelectorAll('[data-user-email]');
    console.log(`Elements with data-user-email: ${emailElements.length}`);
    
    const userIdElements = document.querySelectorAll('[data-user-id]');
    console.log(`Elements with data-user-id: ${userIdElements.length}`);

    // Check for any remaining email-based API calls
    console.log('\n📋 API Call Analysis:');
    console.log('Check the Network tab for any API calls to /v1/users/ with email addresses instead of UUIDs');

    console.log('\n✅ COMPREHENSIVE DIAGNOSTIC COMPLETED');
    console.log('==========================================');

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
  }
}

// Helper function to validate UUID
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Run comprehensive diagnostics
comprehensiveDiagnose();


