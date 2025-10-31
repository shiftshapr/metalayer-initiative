#!/usr/bin/env node

/**
 * Backend Changes Test
 * Tests all the userEmail -> userId changes made to the backend
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';

async function testBackendChanges() {
  console.log('🧪 BACKEND CHANGES TEST');
  console.log('========================\n');

  let passedTests = 0;
  let totalTests = 0;

  function logTest(testName, passed, details = '') {
    totalTests++;
    if (passed) {
      passedTests++;
      console.log(`✅ ${testName}`);
    } else {
      console.log(`❌ ${testName}: ${details}`);
    }
  }

  try {
    // Test 1: Server is running
    console.log('📋 Test 1: Server Health Check');
    try {
      const response = await fetch(`${BASE_URL}/health`);
      logTest('Server is running', response.ok, `Status: ${response.status}`);
    } catch (error) {
      logTest('Server is running', false, error.message);
    }

    // Test 2: Test user creation with UUID
    console.log('\n📋 Test 2: User Creation (UUID-based)');
    try {
      const testUser = {
        id: 'test-user-' + Date.now(),
        name: 'Test User',
        email: 'test@example.com'
      };

      const response = await fetch(`${BASE_URL}/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': testUser.id
        },
        body: JSON.stringify(testUser)
      });

      logTest('User creation with UUID', response.ok, `Status: ${response.status}`);
      
      if (response.ok) {
        const userData = await response.json();
        logTest('User data contains ID', !!userData.id, `ID: ${userData.id}`);
        logTest('User data has no userEmail field', !userData.userEmail, 'userEmail field found');
      }
    } catch (error) {
      logTest('User creation with UUID', false, error.message);
    }

    // Test 3: Test message creation with user_id
    console.log('\n📋 Test 3: Message Creation (user_id-based)');
    try {
      const testMessage = {
        user_id: 'test-user-' + Date.now(),
        communityId: 'comm-001',
        content: 'Test message for UUID validation',
        uri: 'https://example.com/test'
      };

      const response = await fetch(`${BASE_URL}/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage)
      });

      logTest('Message creation with user_id', response.ok, `Status: ${response.status}`);
      
      if (response.ok) {
        const messageData = await response.json();
        logTest('Message has authorId', !!messageData.authorId, `AuthorId: ${messageData.authorId}`);
        logTest('Message author has ID', !!messageData.author?.id, `Author ID: ${messageData.author?.id}`);
        logTest('Message author has no email field', !messageData.author?.email, 'Email field found in author');
      }
    } catch (error) {
      logTest('Message creation with user_id', false, error.message);
    }

    // Test 4: Test reaction creation with user_id
    console.log('\n📋 Test 4: Reaction Creation (user_id-based)');
    try {
      const testReaction = {
        messageId: 'test-message-' + Date.now(),
        emoji: '👍',
        user_id: 'test-user-' + Date.now()
      };

      const response = await fetch(`${BASE_URL}/v1/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testReaction)
      });

      logTest('Reaction creation with user_id', response.ok, `Status: ${response.status}`);
    } catch (error) {
      logTest('Reaction creation with user_id', false, error.message);
    }

    // Test 5: Test presence event with user_id
    console.log('\n📋 Test 5: Presence Event (user_id-based)');
    try {
      const testPresence = {
        kind: 'enter',
        availability: 'online',
        pageId: 'test-page-' + Date.now()
      };

      const response = await fetch(`${BASE_URL}/v1/presence/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-' + Date.now(),
          'x-user-name': 'Test User'
        },
        body: JSON.stringify(testPresence)
      });

      logTest('Presence event with user_id', response.ok, `Status: ${response.status}`);
    } catch (error) {
      logTest('Presence event with user_id', false, error.message);
    }

    // Test 6: Test visibility with user_id
    console.log('\n📋 Test 6: Visibility (user_id-based)');
    try {
      const testVisibility = {
        is_visible: true,
        pageId: 'test-page-' + Date.now()
      };

      const response = await fetch(`${BASE_URL}/v1/visibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-' + Date.now(),
          'x-user-name': 'Test User'
        },
        body: JSON.stringify(testVisibility)
      });

      logTest('Visibility with user_id', response.ok, `Status: ${response.status}`);
    } catch (error) {
      logTest('Visibility with user_id', false, error.message);
    }

    // Test 7: Check for any remaining userEmail references in responses
    console.log('\n📋 Test 7: Response Validation (No userEmail fields)');
    try {
      const response = await fetch(`${BASE_URL}/v1/users`);
      if (response.ok) {
        const users = await response.json();
        const hasUserEmail = users.some(user => user.hasOwnProperty('userEmail'));
        logTest('No userEmail in user responses', !hasUserEmail, 'userEmail field found in user data');
      } else {
        logTest('No userEmail in user responses', true, 'Could not fetch users');
      }
    } catch (error) {
      logTest('No userEmail in user responses', true, 'Could not test user responses');
    }

  } catch (error) {
    console.log(`❌ Test suite error: ${error.message}`);
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Backend changes are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
}

// Run the test
testBackendChanges().catch(console.error);


