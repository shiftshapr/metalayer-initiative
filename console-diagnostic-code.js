/**
 * CONSOLE DIAGNOSTIC CODE BLOCK
 * Run this in the browser console to diagnose avatar and user ID issues
 * 
 * Usage: Copy and paste this entire code block into the browser console
 */

console.log('🔍 DIAGNOSTIC: Starting comprehensive user/avatar diagnostic...');

// Diagnostic function to check for UUID vs Email issues
async function diagnoseUserAvatarIssues() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔍 DIAGNOSTIC: USER/AVATAR ISSUE DIAGNOSIS');
  console.log('═══════════════════════════════════════════════════════════');
  
  // 1. Check current user
  console.log('\n📊 STEP 1: Current User Analysis');
  console.log('───────────────────────────────────────────────────────────');
  console.log('window.currentUser:', window.currentUser);
  if (window.currentUser) {
    console.log('Current user email:', window.currentUser.email);
    console.log('Current user ID:', window.currentUser.id);
    console.log('Current user name:', window.currentUser.name);
    console.log('Current user avatarUrl:', window.currentUser.avatarUrl);
    
    // Check if ID is UUID or email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(window.currentUser.email);
    const isIdEmail = emailRegex.test(window.currentUser.id);
    console.log('Current user email is valid:', isEmail);
    console.log('Current user ID is email format:', isIdEmail);
  }
  
  // 2. Check visibility data
  console.log('\n📊 STEP 2: Visibility Data Analysis');
  console.log('───────────────────────────────────────────────────────────');
  if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
    console.log('Visibility data active users:', window.currentVisibilityDataUnfiltered.active.length);
    window.currentVisibilityDataUnfiltered.active.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        email: user.email,
        userId: user.userId,
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl
      });
      
      // Check for UUID vs email issues
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmailValid = emailRegex.test(user.email);
      const isUserIdEmail = emailRegex.test(user.userId);
      const isIdEmail = emailRegex.test(user.id);
      
      console.log(`  - Email valid: ${isEmailValid}`);
      console.log(`  - UserId is email: ${isUserIdEmail}`);
      console.log(`  - ID is email: ${isIdEmail}`);
      
      if (!isEmailValid || !isUserIdEmail || !isIdEmail) {
        console.warn(`⚠️ PROBLEM: User ${index + 1} has non-email identifiers!`);
      }
    });
  } else {
    console.log('No visibility data available');
  }
  
  // 3. Test AvatarUtils with problematic data
  console.log('\n📊 STEP 3: AvatarUtils Testing');
  console.log('───────────────────────────────────────────────────────────');
  
  if (window.AvatarUtils) {
    // Test with current user
    if (window.currentUser) {
      console.log('Testing AvatarUtils with current user...');
      try {
        const avatarResult = await window.AvatarUtils.getAvatarUrl(window.currentUser, 'visibility');
        console.log('Current user avatar result:', avatarResult);
      } catch (error) {
        console.error('Error getting current user avatar:', error);
      }
    }
    
    // Test with visibility data users
    if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
      console.log('Testing AvatarUtils with visibility data users...');
      for (let i = 0; i < Math.min(3, window.currentVisibilityDataUnfiltered.active.length); i++) {
        const user = window.currentVisibilityDataUnfiltered.active[i];
        console.log(`Testing user ${i + 1}: ${user.email || user.userId || user.id}`);
        try {
          const avatarResult = await window.AvatarUtils.getAvatarUrl(user, 'visibility');
          console.log(`User ${i + 1} avatar result:`, avatarResult);
        } catch (error) {
          console.error(`Error getting user ${i + 1} avatar:`, error);
        }
      }
    }
  } else {
    console.log('AvatarUtils not available');
  }
  
  // 4. Check API calls
  console.log('\n📊 STEP 4: API Call Analysis');
  console.log('───────────────────────────────────────────────────────────');
  
  if (window.api) {
    console.log('API client available:', !!window.api);
    
    // Test API call with current user email
    if (window.currentUser && window.currentUser.email) {
      console.log('Testing API call with current user email...');
      try {
        const userResponse = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`);
        console.log('API response for current user:', userResponse);
      } catch (error) {
        console.error('API call failed for current user:', error);
      }
    }
  } else {
    console.log('API client not available');
  }
  
  // 5. Check for UUID patterns in the system
  console.log('\n📊 STEP 5: UUID Pattern Detection');
  console.log('───────────────────────────────────────────────────────────');
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // Check all global variables for UUIDs
  const globalVars = Object.keys(window).filter(key => 
    typeof window[key] === 'object' && window[key] !== null
  );
  
  console.log('Checking global variables for UUID patterns...');
  globalVars.forEach(varName => {
    try {
      const obj = window[varName];
      if (obj && typeof obj === 'object') {
        // Check if object has properties that look like UUIDs
        Object.keys(obj).forEach(prop => {
          if (typeof obj[prop] === 'string' && uuidRegex.test(obj[prop])) {
            console.log(`Found UUID in ${varName}.${prop}: ${obj[prop]}`);
          }
        });
      }
    } catch (e) {
      // Ignore errors accessing properties
    }
  });
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔍 DIAGNOSTIC: Analysis complete');
  console.log('═══════════════════════════════════════════════════════════');
}

// Additional diagnostic function to test specific scenarios
async function testSpecificScenarios() {
  console.log('\n🧪 TESTING: Specific Scenarios');
  console.log('───────────────────────────────────────────────────────────');
  
  // Test 1: Create a mock user with UUID
  const mockUserWithUuid = {
    id: 'efce30c3-6788-4bf7-a52c-5e6652923964',
    userId: 'efce30c3-6788-4bf7-a52c-5e6652923964',
    email: 'efce30c3-6788-4bf7-a52c-5e6652923964', // This is the problem!
    name: 'Test User'
  };
  
  console.log('Testing with mock user that has UUID as email...');
  if (window.AvatarUtils) {
    try {
      const result = await window.AvatarUtils.getAvatarUrl(mockUserWithUuid, 'visibility');
      console.log('Mock user result:', result);
    } catch (error) {
      console.error('Mock user test failed:', error);
    }
  }
  
  // Test 2: Create a mock user with proper email
  const mockUserWithEmail = {
    id: 'test@example.com',
    userId: 'test@example.com',
    email: 'test@example.com',
    name: 'Test User'
  };
  
  console.log('Testing with mock user that has proper email...');
  if (window.AvatarUtils) {
    try {
      const result = await window.AvatarUtils.getAvatarUrl(mockUserWithEmail, 'visibility');
      console.log('Proper email user result:', result);
    } catch (error) {
      console.error('Proper email user test failed:', error);
    }
  }
}

// Function to check network requests
function monitorNetworkRequests() {
  console.log('\n🌐 NETWORK: Monitoring API requests');
  console.log('───────────────────────────────────────────────────────────');
  
  // Override fetch to monitor requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    console.log('🌐 FETCH REQUEST:', url);
    
    if (typeof url === 'string' && url.includes('/v1/users/')) {
      console.log('🔍 USER API REQUEST DETECTED:', url);
      
      // Extract the user identifier from the URL
      const match = url.match(/\/v1\/users\/([^?]+)/);
      if (match) {
        const userIdentifier = decodeURIComponent(match[1]);
        console.log('🔍 USER IDENTIFIER:', userIdentifier);
        
        // Check if it's a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(userIdentifier)) {
          console.error('❌ PROBLEM: UUID being used as user identifier!');
          console.error('❌ UUID:', userIdentifier);
          console.error('❌ This will cause 400 Bad Request errors');
        } else {
          console.log('✅ User identifier appears to be valid');
        }
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('Network monitoring enabled. Check console for API request details.');
}

// Main diagnostic function
async function runFullDiagnostic() {
  await diagnoseUserAvatarIssues();
  await testSpecificScenarios();
  monitorNetworkRequests();
  
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('1. Ensure all user objects use email addresses, not UUIDs');
  console.log('2. Check database queries to ensure they return email addresses');
  console.log('3. Verify that user_presence table uses email addresses');
  console.log('4. Check if any seed data or test data is using UUIDs incorrectly');
  console.log('5. Monitor network requests to catch UUID usage in real-time');
}

// Run the diagnostic
runFullDiagnostic().catch(console.error);

console.log('🔍 DIAGNOSTIC: Diagnostic code loaded. Check console output above.');





