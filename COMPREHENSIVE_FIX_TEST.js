// COMPREHENSIVE FIX TEST
// Run this in browser console to test all fixes

console.log('🧪 COMPREHENSIVE FIX TEST');
console.log('==========================');

async function comprehensiveFixTest() {
  try {
    // Test 1: Check real-time functions
    console.log('\n📋 Test 1: Real-time Functions');
    const functions = ['handlePresenceChange', 'handleMessageChange', 'handleReactionChange', 'handleAuraChange'];
    let functionsWorking = 0;
    functions.forEach(func => {
      if (typeof window[func] === 'function') {
        console.log(`✅ ${func}: Available`);
        functionsWorking++;
      } else {
        console.log(`❌ ${func}: Missing`);
      }
    });
    console.log(`📊 Real-time functions working: ${functionsWorking}/${functions.length}`);

    // Test 2: Check current user structure
    console.log('\n📋 Test 2: Current User Structure');
    if (window.currentUser) {
      console.log('✅ currentUser exists');
      console.log('  - id:', window.currentUser.id);
      console.log('  - user_id:', window.currentUser.user_id);
      console.log('  - email:', window.currentUser.email);
      
      // Check if current user has valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const currentUserId = window.currentUser.id || window.currentUser.user_id;
      if (currentUserId && uuidRegex.test(currentUserId)) {
        console.log('✅ Current user has valid UUID format');
      } else {
        console.log('⚠️ Current user does not have valid UUID format');
      }
    } else {
      console.log('❌ currentUser not found');
    }

    // Test 3: Test AvatarUtils with valid UUID
    console.log('\n📋 Test 3: AvatarUtils Valid UUID Test');
    if (typeof window.AvatarUtils !== 'undefined') {
      try {
        const testUser = { id: '550e8400-e29b-41d4-a716-446655440000' };
        const result = await window.AvatarUtils.getAvatarUrl(testUser, 'test');
        console.log('✅ AvatarUtils working with valid UUID:', result.name, result.avatarUrl);
      } catch (error) {
        console.log('❌ AvatarUtils error with valid UUID:', error.message);
      }
    } else {
      console.log('❌ AvatarUtils not available');
    }

    // Test 4: Test AvatarUtils with invalid UUID
    console.log('\n📋 Test 4: AvatarUtils Invalid UUID Test');
    if (typeof window.AvatarUtils !== 'undefined') {
      try {
        const invalidUser = { id: '18ad77cb-222e-4485-a720-db39981a4099' };
        const result = await window.AvatarUtils.getAvatarUrl(invalidUser, 'test');
        console.log('✅ AvatarUtils handled invalid UUID gracefully:', result.name, result.avatarUrl);
      } catch (error) {
        console.log('❌ AvatarUtils error with invalid UUID:', error.message);
      }
    } else {
      console.log('❌ AvatarUtils not available');
    }

    // Test 5: Test presence tracking
    console.log('\n📋 Test 5: Presence Tracking');
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

    // Test 6: Check for invalid UUIDs in visibility data
    console.log('\n📋 Test 6: Invalid UUID Detection');
    const invalidUUIDs = ['18ad77cb-222e-4485-a720-db39981a4099', '41266409-84e9-439e-b1b3-df44d0797581', '60524d7d-da7d-4216-ba3b-475becaa2527', '6c89ce15-c4a4-45b7-82f8-9dae06418f00'];
    
    if (window.currentVisibilityDataUnfiltered?.active) {
      const foundInvalid = window.currentVisibilityDataUnfiltered.active.filter(user => {
        const id = user.id || user.userId || user.user_id;
        return id && invalidUUIDs.includes(id);
      });
      
      if (foundInvalid.length > 0) {
        console.log('❌ Found invalid UUIDs in visibility data:', foundInvalid.map(u => u.id || u.userId || u.user_id));
        console.log('  This indicates the source of the problem');
      } else {
        console.log('✅ No invalid UUIDs found in visibility data');
      }
    } else {
      console.log('ℹ️ No visibility data available');
    }

    // Test 7: Test API endpoints
    console.log('\n📋 Test 7: API Endpoint Tests');
    const validUUIDs = ['550e8400-e29b-41d4-a716-446655440000', 'efce30c3-6788-4bf7-a52c-5e6652923964'];
    
    for (const uuid of validUUIDs) {
      try {
        const response = await fetch(`http://216.238.91.120:3002/v1/users/${uuid}`);
        const data = await response.json();
        if (response.ok) {
          console.log(`✅ Valid UUID ${uuid}: ${data.name} (${data.email})`);
        } else {
          console.log(`❌ Valid UUID ${uuid}: ${data.error}`);
        }
      } catch (error) {
        console.log(`❌ Valid UUID ${uuid}: Network error - ${error.message}`);
      }
    }

    // Test 8: Test invalid UUID endpoints (should return 404)
    console.log('\n📋 Test 8: Invalid UUID Endpoint Tests');
    for (const uuid of invalidUUIDs) {
      try {
        const response = await fetch(`http://216.238.91.120:3002/v1/users/${uuid}`);
        const data = await response.json();
        if (response.ok) {
          console.log(`⚠️ Invalid UUID ${uuid} unexpectedly returned data: ${data.name}`);
        } else {
          console.log(`✅ Invalid UUID ${uuid} correctly returned 404: ${data.error}`);
        }
      } catch (error) {
        console.log(`❌ Invalid UUID ${uuid}: Network error - ${error.message}`);
      }
    }

    // Test 9: Check DOM elements
    console.log('\n📋 Test 9: DOM Analysis');
    const emailElements = document.querySelectorAll('[data-user-email]');
    const userIdElements = document.querySelectorAll('[data-user-id]');
    console.log(`Elements with data-user-email: ${emailElements.length}`);
    console.log(`Elements with data-user-id: ${userIdElements.length}`);
    
    // Check for invalid UUIDs in DOM
    let invalidInDOM = 0;
    userIdElements.forEach(element => {
      const userId = element.getAttribute('data-user-id');
      if (userId && invalidUUIDs.includes(userId)) {
        invalidInDOM++;
      }
    });
    
    if (invalidInDOM > 0) {
      console.log(`❌ Found ${invalidInDOM} DOM elements with invalid UUIDs`);
    } else {
      console.log('✅ No invalid UUIDs found in DOM elements');
    }

    // Test 10: Performance test
    console.log('\n📋 Test 10: Performance Test');
    const startTime = Date.now();
    
    // Simulate multiple avatar requests
    const testUsers = [
      { id: '550e8400-e29b-41d4-a716-446655440000' },
      { id: 'efce30c3-6788-4bf7-a52c-5e6652923964' },
      { id: '18ad77cb-222e-4485-a720-db39981a4099' }, // Invalid
      { id: '41266409-84e9-439e-b1b3-df44d0797581' }  // Invalid
    ];
    
    if (typeof window.AvatarUtils !== 'undefined') {
      try {
        const results = await Promise.all(testUsers.map(user => 
          window.AvatarUtils.getAvatarUrl(user, 'test')
        ));
        const endTime = Date.now();
        console.log(`✅ Performance test completed in ${endTime - startTime}ms`);
        console.log(`  Processed ${results.length} users (including invalid ones)`);
      } catch (error) {
        console.log('❌ Performance test failed:', error.message);
      }
    } else {
      console.log('❌ AvatarUtils not available for performance test');
    }

    console.log('\n✅ COMPREHENSIVE FIX TEST COMPLETED');
    console.log('==========================');
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`- Real-time functions: ${functionsWorking}/${functions.length} working`);
    console.log('- Current user structure: ' + (window.currentUser ? 'OK' : 'MISSING'));
    console.log('- AvatarUtils: ' + (typeof window.AvatarUtils !== 'undefined' ? 'Available' : 'Missing'));
    console.log('- Presence tracking: ' + (typeof window.startPresenceTracking === 'function' ? 'Available' : 'Missing'));

  } catch (error) {
    console.error('❌ Comprehensive test error:', error);
  }
}

// Run the comprehensive test
comprehensiveFixTest();


