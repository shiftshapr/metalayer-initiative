// QUICK FIX TEST
// Run this in browser console to test the fixes

console.log('🧪 QUICK FIX TEST');
console.log('==================');

async function quickTest() {
  try {
    // Test 1: Check if real-time functions are available
    console.log('\n📋 Test 1: Real-time Functions');
    const functions = ['handlePresenceChange', 'handleMessageChange', 'handleReactionChange', 'handleAuraChange'];
    functions.forEach(func => {
      if (typeof window[func] === 'function') {
        console.log(`✅ ${func}: Available`);
      } else {
        console.log(`❌ ${func}: Missing`);
      }
    });

    // Test 2: Check current user structure
    console.log('\n📋 Test 2: Current User Structure');
    if (window.currentUser) {
      console.log('✅ currentUser exists');
      console.log('  - id:', window.currentUser.id);
      console.log('  - user_id:', window.currentUser.user_id);
      console.log('  - email:', window.currentUser.email);
    } else {
      console.log('❌ currentUser not found');
    }

    // Test 3: Test AvatarUtils with valid UUID
    console.log('\n📋 Test 3: AvatarUtils Test');
    if (typeof window.AvatarUtils !== 'undefined') {
      try {
        const testUser = { id: '550e8400-e29b-41d4-a716-446655440000' };
        const result = await window.AvatarUtils.getAvatarUrl(testUser, 'test');
        console.log('✅ AvatarUtils working:', result.name, result.avatarUrl);
      } catch (error) {
        console.log('❌ AvatarUtils error:', error.message);
      }
    } else {
      console.log('❌ AvatarUtils not available');
    }

    // Test 4: Test presence tracking
    console.log('\n📋 Test 4: Presence Tracking');
    if (typeof window.startPresenceTracking === 'function') {
      try {
        await window.startPresenceTracking();
        console.log('✅ Presence tracking started successfully');
      } catch (error) {
        console.log('❌ Presence tracking error:', error.message);
      }
    } else {
      console.log('❌ startPresenceTracking not available');
    }

    // Test 5: Check for invalid UUIDs in visibility data
    console.log('\n📋 Test 5: Invalid UUID Check');
    const invalidUUIDs = ['18ad77cb-222e-4485-a720-db39981a4099', '41266409-84e9-439e-b1b3-df44d0797581', '60524d7d-da7d-4216-ba3b-475becaa2527', '6c89ce15-c4a4-45b7-82f8-9dae06418f00'];
    
    if (window.currentVisibilityDataUnfiltered?.active) {
      const foundInvalid = window.currentVisibilityDataUnfiltered.active.filter(user => {
        const id = user.id || user.userId || user.user_id;
        return id && invalidUUIDs.includes(id);
      });
      
      if (foundInvalid.length > 0) {
        console.log('❌ Found invalid UUIDs:', foundInvalid.map(u => u.id || u.userId || u.user_id));
      } else {
        console.log('✅ No invalid UUIDs found');
      }
    } else {
      console.log('ℹ️ No visibility data available');
    }

    console.log('\n✅ QUICK FIX TEST COMPLETED');
    console.log('==================');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
quickTest();


