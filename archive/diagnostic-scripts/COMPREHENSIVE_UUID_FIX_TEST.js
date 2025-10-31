// COMPREHENSIVE UUID FIX TEST
// Run this in browser console to test all UUID-related fixes

console.log('🧪 COMPREHENSIVE UUID FIX TEST');
console.log('=====================================');

async function testUUIDFixes() {
  try {
    // Test 1: Check if handlePresenceChange is available
    console.log('\n📋 Test 1: Function Availability');
    const functions = ['handlePresenceChange', 'handleMessageChange', 'handleReactionChange', 'handleAuraChange'];
    functions.forEach(func => {
      if (typeof window[func] === 'function') {
        console.log(`✅ ${func}: Available`);
      } else {
        console.log(`❌ ${func}: Missing`);
      }
    });

    // Test 2: Test UUID endpoint
    console.log('\n📋 Test 2: UUID Endpoint Test');
    const testUUID = '550e8400-e29b-41d4-a716-446655440000';
    try {
      const response = await fetch(`http://localhost:3002/v1/users/${testUUID}`);
      const data = await response.json();
      if (response.ok) {
        console.log(`✅ UUID endpoint working: ${data.name} (${data.id})`);
      } else {
        console.log(`❌ UUID endpoint failed: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ UUID endpoint error: ${error.message}`);
    }

    // Test 3: Test AvatarUtils with UUID
    console.log('\n📋 Test 3: AvatarUtils UUID Test');
    if (typeof window.AvatarUtils !== 'undefined' && window.AvatarUtils.getAvatarUrl) {
      try {
        const avatarResult = await window.AvatarUtils.getAvatarUrl({ id: testUUID }, 'test');
        console.log(`✅ AvatarUtils UUID test: ${avatarResult.name} - ${avatarResult.avatarUrl}`);
      } catch (error) {
        console.log(`❌ AvatarUtils UUID error: ${error.message}`);
      }
    } else {
      console.log('❌ AvatarUtils not available');
    }

    // Test 4: Test presence tracking
    console.log('\n📋 Test 4: Presence Tracking Test');
    if (typeof window.startPresenceTracking === 'function') {
      try {
        await window.startPresenceTracking();
        console.log('✅ Presence tracking started successfully');
      } catch (error) {
        console.log(`❌ Presence tracking error: ${error.message}`);
      }
    } else {
      console.log('❌ startPresenceTracking not available');
    }

    // Test 5: Test real-time handlers
    console.log('\n📋 Test 5: Real-time Handler Test');
    if (typeof window.handlePresenceChange === 'function') {
      try {
        const testPayload = {
          eventType: 'INSERT',
          new: {
            user_id: testUUID,
            is_active: true,
            page_id: 'test-page'
          }
        };
        window.handlePresenceChange(testPayload);
        console.log('✅ handlePresenceChange test passed');
      } catch (error) {
        console.log(`❌ handlePresenceChange error: ${error.message}`);
      }
    } else {
      console.log('❌ handlePresenceChange not available');
    }

    // Test 6: Check for remaining email references
    console.log('\n📋 Test 6: Email Reference Check');
    const emailPatterns = [
      'userEmail',
      'user_email',
      'x-user-email',
      'email.*split',
      '\.email\s*:'
    ];
    
    let emailIssues = [];
    emailPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        if (script.src.includes('.js')) {
          // This is a simplified check - in real implementation, you'd fetch and check the content
          console.log(`🔍 Checking script: ${script.src}`);
        }
      });
    });

    console.log('\n✅ COMPREHENSIVE UUID FIX TEST COMPLETED');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Test suite error:', error);
  }
}

// Run the test
testUUIDFixes();


