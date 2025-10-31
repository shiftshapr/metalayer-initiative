// FINAL COMPREHENSIVE TEST
// Run this in browser console to test all fixes

console.log('🧪 FINAL COMPREHENSIVE TEST');
console.log('============================');

async function finalComprehensiveTest() {
  try {
    // Test 1: Check current user structure (should have UUID now)
    console.log('\n📋 Test 1: Current User Structure');
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

    // Test 2: Check real-time functions availability
    console.log('\n📋 Test 2: Real-time Functions');
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

    // Test 3: Check message avatars
    console.log('\n📋 Test 3: Message Avatars');
    const messageElements = document.querySelectorAll('.chat-message');
    console.log(`Found ${messageElements.length} message elements`);
    
    let avatarIssues = 0;
    messageElements.forEach((message, index) => {
      const avatar = message.querySelector('.message-avatar img');
      const authorName = message.querySelector('.message-author');
      
      if (avatar) {
        const src = avatar.src;
        const isGeneric = src.includes('ui-avatars.com') || src.includes('default-user');
        if (isGeneric) {
          console.log(`⚠️ Message ${index + 1}: Generic avatar (${src})`);
          avatarIssues++;
        } else {
          console.log(`✅ Message ${index + 1}: Real avatar (${src})`);
        }
      } else {
        console.log(`❌ Message ${index + 1}: No avatar found`);
        avatarIssues++;
      }
      
      if (authorName) {
        const name = authorName.textContent;
        if (name === 'Unknown' || name === 'Unknown User') {
          console.log(`⚠️ Message ${index + 1}: Author name is "${name}"`);
          avatarIssues++;
        } else {
          console.log(`✅ Message ${index + 1}: Author name is "${name}"`);
        }
      }
    });
    
    if (avatarIssues === 0) {
      console.log('✅ All message avatars are working correctly');
    } else {
      console.log(`⚠️ Found ${avatarIssues} avatar issues`);
    }

    // Test 4: Check reaction displays
    console.log('\n📋 Test 4: Reaction Displays');
    const reactionButtons = document.querySelectorAll('.reaction-btn');
    console.log(`Found ${reactionButtons.length} reaction buttons`);
    
    let reactionIssues = 0;
    reactionButtons.forEach((btn, index) => {
      const emoji = btn.textContent.trim();
      const countSpan = btn.querySelector('.icon-count');
      const count = countSpan ? countSpan.textContent : '0';
      
      if (emoji === '🔘' && count !== '0') {
        console.log(`⚠️ Reaction ${index + 1}: Shows default emoji (🔘) but has count (${count})`);
        reactionIssues++;
      } else if (emoji !== '🔘') {
        console.log(`✅ Reaction ${index + 1}: Shows emoji "${emoji}" with count ${count}`);
      } else {
        console.log(`ℹ️ Reaction ${index + 1}: Default state (no reactions)`);
      }
    });
    
    if (reactionIssues === 0) {
      console.log('✅ All reaction displays are working correctly');
    } else {
      console.log(`⚠️ Found ${reactionIssues} reaction display issues`);
    }

    // Test 5: Test AvatarUtils with various user types
    console.log('\n📋 Test 5: AvatarUtils Functionality');
    if (typeof window.AvatarUtils !== 'undefined') {
      const testUsers = [
        { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Test User' },
        { id: 'efce30c3-6788-4bf7-a52c-5e6652923964', name: 'daveroom' },
        { id: '18ad77cb-222e-4485-a720-db39981a4099', name: 'Invalid User' }, // Invalid UUID
        { id: 'themetalayer@gmail.com', name: 'Current User' } // Email as ID
      ];
      
      for (const user of testUsers) {
        try {
          const result = await window.AvatarUtils.getAvatarUrl(user, 'test');
          console.log(`✅ AvatarUtils for ${user.name}: ${result.avatarUrl} (${result.source})`);
        } catch (error) {
          console.log(`❌ AvatarUtils for ${user.name}: Error - ${error.message}`);
        }
      }
    } else {
      console.log('❌ AvatarUtils not available');
    }

    // Test 6: Test API endpoints
    console.log('\n📋 Test 6: API Endpoint Tests');
    const testUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      'efce30c3-6788-4bf7-a52c-5e6652923964'
    ];
    
    for (const uuid of testUUIDs) {
      try {
        const response = await fetch(`http://216.238.91.120:3002/v1/users/${uuid}`);
        const data = await response.json();
        if (response.ok) {
          console.log(`✅ API ${uuid}: ${data.name} (${data.email})`);
        } else {
          console.log(`❌ API ${uuid}: ${data.error}`);
        }
      } catch (error) {
        console.log(`❌ API ${uuid}: Network error - ${error.message}`);
      }
    }

    // Test 7: Test reaction creation
    console.log('\n📋 Test 7: Reaction Creation Test');
    if (typeof window.addReactionToMessage === 'function') {
      try {
        const messageElements = document.querySelectorAll('.chat-message');
        if (messageElements.length > 0) {
          const firstMessage = messageElements[0];
          const messageId = firstMessage.dataset.messageId;
          console.log(`Testing reaction creation on message: ${messageId}`);
          
          // This would normally be called by clicking the reaction button
          console.log('ℹ️ Reaction creation test requires user interaction (clicking reaction button)');
        } else {
          console.log('ℹ️ No messages available for reaction testing');
        }
      } catch (error) {
        console.log(`❌ Reaction creation test error: ${error.message}`);
      }
    } else {
      console.log('❌ addReactionToMessage function not available');
    }

    // Test 8: Check for invalid UUIDs in system
    console.log('\n📋 Test 8: Invalid UUID Detection');
    const invalidUUIDs = ['18ad77cb-222e-4485-a720-db39981a4099', '41266409-84e9-439e-b1b3-df44d0797581', '60524d7d-da7d-4216-ba3b-475becaa2527', '6c89ce15-c4a4-45b7-82f8-9dae06418f00'];
    
    // Check visibility data
    if (window.currentVisibilityDataUnfiltered?.active) {
      const foundInvalid = window.currentVisibilityDataUnfiltered.active.filter(user => {
        const id = user.id || user.userId || user.user_id;
        return id && invalidUUIDs.includes(id);
      });
      
      if (foundInvalid.length > 0) {
        console.log('❌ Found invalid UUIDs in visibility data:', foundInvalid.map(u => u.id || u.userId || u.user_id));
      } else {
        console.log('✅ No invalid UUIDs found in visibility data');
      }
    } else {
      console.log('ℹ️ No visibility data available');
    }
    
    // Check DOM elements
    const userIdElements = document.querySelectorAll('[data-user-id]');
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

    // Test 9: Performance test
    console.log('\n📋 Test 9: Performance Test');
    const startTime = Date.now();
    
    if (typeof window.AvatarUtils !== 'undefined') {
      const testUsers = [
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        { id: 'efce30c3-6788-4bf7-a52c-5e6652923964' },
        { id: '18ad77cb-222e-4485-a720-db39981a4099' }, // Invalid
        { id: '41266409-84e9-439e-b1b3-df44d0797581' }  // Invalid
      ];
      
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

    console.log('\n✅ FINAL COMPREHENSIVE TEST COMPLETED');
    console.log('============================');
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`- Current user UUID: ${window.currentUser && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(window.currentUser.id) ? 'Valid' : 'Invalid'}`);
    console.log(`- Real-time functions: ${functionsWorking}/${functions.length} working`);
    console.log(`- Message avatars: ${avatarIssues === 0 ? 'Working' : `${avatarIssues} issues`}`);
    console.log(`- Reaction displays: ${reactionIssues === 0 ? 'Working' : `${reactionIssues} issues`}`);
    console.log('- AvatarUtils: ' + (typeof window.AvatarUtils !== 'undefined' ? 'Available' : 'Missing'));

  } catch (error) {
    console.error('❌ Final comprehensive test error:', error);
  }
}

// Run the final comprehensive test
finalComprehensiveTest();


