/**
 * COMPREHENSIVE AVATAR SYNCHRONIZATION TEST
 * Tests the complete avatar synchronization flow from Google API to AppUser table to UI
 */

console.log('🧪 AVATAR SYNCHRONIZATION COMPREHENSIVE TEST');
console.log('=============================================');

// Test 1: Check Google API Response
console.log('\n📋 Test 1: Google API Response');
console.log('-------------------------------');

async function testGoogleAPIResponse() {
  try {
    console.log('🔍 Testing Google API response...');
    
    if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getAuthToken) {
      const authToken = await new Promise((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
          resolve(token);
        });
      });
      
      if (authToken) {
        console.log('✅ Auth token received');
        
        const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authToken}`);
        const userInfo = await response.json();
        
        console.log('✅ Google API response:', userInfo.email);
        console.log('✅ Google profile picture:', userInfo.picture || 'null');
        
        return {
          email: userInfo.email,
          picture: userInfo.picture,
          name: userInfo.name
        };
      } else {
        console.log('❌ No auth token received');
        return null;
      }
    } else {
      console.log('❌ Chrome identity API not available');
      return null;
    }
  } catch (error) {
    console.log('❌ Google API test failed:', error.message);
    return null;
  }
}

// Test 2: Check Frontend User State
console.log('\n📋 Test 2: Frontend User State');
console.log('-------------------------------');

function testFrontendUserState() {
  try {
    console.log('🔍 Testing frontend user state...');
    
    if (!window.currentUser) {
      console.log('❌ window.currentUser not available');
      return null;
    }
    
    console.log('✅ window.currentUser available:');
    console.log('  Email:', window.currentUser.email);
    console.log('  Name:', window.currentUser.name);
    console.log('  Avatar URL:', window.currentUser.avatarUrl || 'null');
    console.log('  Aura Color:', window.currentUser.auraColor || 'null');
    
    // Check if avatar URL is real Google profile picture
    if (window.currentUser.avatarUrl) {
      if (window.currentUser.avatarUrl.includes('googleusercontent.com')) {
        console.log('✅ Frontend has real Google profile picture');
        return {
          email: window.currentUser.email,
          avatarUrl: window.currentUser.avatarUrl,
          isRealGoogle: true
        };
      } else if (window.currentUser.avatarUrl.includes('gravatar.com')) {
        console.log('⚠️ Frontend has Gravatar fallback');
        return {
          email: window.currentUser.email,
          avatarUrl: window.currentUser.avatarUrl,
          isRealGoogle: false
        };
      } else {
        console.log('⚠️ Frontend has unknown avatar URL:', window.currentUser.avatarUrl);
        return {
          email: window.currentUser.email,
          avatarUrl: window.currentUser.avatarUrl,
          isRealGoogle: false
        };
      }
    } else {
      console.log('❌ Frontend has no avatar URL');
      return null;
    }
  } catch (error) {
    console.log('❌ Frontend user state test failed:', error.message);
    return null;
  }
}

// Test 3: Check AppUser Table State
console.log('\n📋 Test 3: AppUser Table State');
console.log('-------------------------------');

async function testAppUserTableState() {
  try {
    console.log('🔍 Testing AppUser table state...');
    
    if (!window.api || !window.currentUser || !window.currentUser.email) {
      console.log('❌ API or current user email not available');
      return null;
    }
    
    const response = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`);
    
    console.log('✅ AppUser table response:');
    console.log('  Email:', response.email);
    console.log('  Name:', response.name);
    console.log('  Avatar URL:', response.avatarUrl || 'null');
    console.log('  Aura Color:', response.auraColor || 'null');
    
    // Check if avatar URL is real Google profile picture
    if (response.avatarUrl) {
      if (response.avatarUrl.includes('googleusercontent.com')) {
        console.log('✅ AppUser table has real Google profile picture');
        return {
          email: response.email,
          avatarUrl: response.avatarUrl,
          isRealGoogle: true
        };
      } else if (response.avatarUrl.includes('default-user')) {
        console.log('⚠️ AppUser table has generic fallback');
        return {
          email: response.email,
          avatarUrl: response.avatarUrl,
          isRealGoogle: false
        };
      } else {
        console.log('⚠️ AppUser table has unknown avatar URL:', response.avatarUrl);
        return {
          email: response.email,
          avatarUrl: response.avatarUrl,
          isRealGoogle: false
        };
      }
    } else {
      console.log('❌ AppUser table has no avatar URL');
      return null;
    }
  } catch (error) {
    console.log('❌ AppUser table test failed:', error.message);
    return null;
  }
}

// Test 4: Test Avatar Synchronization
console.log('\n📋 Test 4: Avatar Synchronization');
console.log('----------------------------------');

async function testAvatarSynchronization() {
  try {
    console.log('🔍 Testing avatar synchronization...');
    
    const frontendState = testFrontendUserState();
    const appUserState = await testAppUserTableState();
    
    if (!frontendState || !appUserState) {
      console.log('❌ Cannot test synchronization - missing state data');
      return false;
    }
    
    console.log('🔍 Comparing frontend vs AppUser table:');
    console.log('  Frontend avatar URL:', frontendState.avatarUrl);
    console.log('  AppUser avatar URL:', appUserState.avatarUrl);
    
    if (frontendState.avatarUrl === appUserState.avatarUrl) {
      console.log('✅ Frontend and AppUser table are synchronized');
      return true;
    } else {
      console.log('❌ Frontend and AppUser table are NOT synchronized');
      console.log('  This indicates the AppUser table update is not working');
      return false;
    }
  } catch (error) {
    console.log('❌ Avatar synchronization test failed:', error.message);
    return false;
  }
}

// Test 5: Test Avatar Utils Resolution
console.log('\n📋 Test 5: Avatar Utils Resolution');
console.log('-----------------------------------');

async function testAvatarUtilsResolution() {
  try {
    console.log('🔍 Testing Avatar Utils resolution...');
    
    if (!window.AvatarUtils || !window.currentUser) {
      console.log('❌ AvatarUtils or current user not available');
      return null;
    }
    
    const avatarResult = await window.AvatarUtils.getAvatarUrl(window.currentUser, 'profile');
    
    console.log('✅ Avatar Utils result:');
    console.log('  Avatar URL:', avatarResult.avatarUrl || 'null');
    console.log('  Source:', avatarResult.source || 'null');
    console.log('  User Name:', avatarResult.userName || 'null');
    
    return avatarResult;
  } catch (error) {
    console.log('❌ Avatar Utils resolution test failed:', error.message);
    return null;
  }
}

// Test 6: Test UI Avatar Display
console.log('\n📋 Test 6: UI Avatar Display');
console.log('-----------------------------');

function testUIAvatarDisplay() {
  try {
    console.log('🔍 Testing UI avatar display...');
    
    // Check profile avatar
    const profileAvatar = document.querySelector('#user-avatar-container');
    if (profileAvatar) {
      console.log('✅ Profile avatar container found');
      const avatarImg = profileAvatar.querySelector('img');
      if (avatarImg) {
        console.log('✅ Profile avatar image found');
        console.log('  Source:', avatarImg.src);
        console.log('  Alt:', avatarImg.alt);
        
        if (avatarImg.src.includes('googleusercontent.com')) {
          console.log('✅ Profile avatar shows real Google profile picture');
        } else if (avatarImg.src.includes('default-user')) {
          console.log('⚠️ Profile avatar shows generic fallback');
        } else {
          console.log('⚠️ Profile avatar shows unknown source:', avatarImg.src);
        }
      } else {
        console.log('❌ Profile avatar image not found');
      }
    } else {
      console.log('❌ Profile avatar container not found');
    }
    
    // Check message avatars
    const messageAvatars = document.querySelectorAll('.message-avatar img');
    console.log('✅ Message avatars found:', messageAvatars.length);
    
    messageAvatars.forEach((avatar, index) => {
      console.log(`  Message avatar ${index + 1}:`, avatar.src);
    });
    
    // Check visibility avatars
    const visibilityAvatars = document.querySelectorAll('.avatar-item img');
    console.log('✅ Visibility avatars found:', visibilityAvatars.length);
    
    visibilityAvatars.forEach((avatar, index) => {
      console.log(`  Visibility avatar ${index + 1}:`, avatar.src);
    });
    
    return {
      profileAvatar: profileAvatar ? profileAvatar.querySelector('img')?.src : null,
      messageAvatars: Array.from(messageAvatars).map(img => img.src),
      visibilityAvatars: Array.from(visibilityAvatars).map(img => img.src)
    };
  } catch (error) {
    console.log('❌ UI avatar display test failed:', error.message);
    return null;
  }
}

// Test 7: Manual Avatar Update Test
console.log('\n📋 Test 7: Manual Avatar Update Test');
console.log('------------------------------------');

async function testManualAvatarUpdate() {
  try {
    console.log('🔍 Testing manual avatar update...');
    
    if (!window.api || !window.currentUser || !window.currentUser.email) {
      console.log('❌ API or current user email not available');
      return false;
    }
    
    // Get current AppUser state
    const currentState = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`);
    console.log('Current AppUser avatar URL:', currentState.avatarUrl);
    
    // Try to update with current frontend avatar URL
    if (window.currentUser.avatarUrl && window.currentUser.avatarUrl.includes('googleusercontent.com')) {
      console.log('🔍 Attempting to update AppUser table with frontend avatar URL...');
      
      try {
        const updateResponse = await window.api.request('/v1/users/update-avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: window.currentUser.email,
            avatarUrl: window.currentUser.avatarUrl
          })
        });
        
        console.log('✅ Avatar update response:', updateResponse);
        
        // Verify the update
        const updatedState = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`);
        console.log('Updated AppUser avatar URL:', updatedState.avatarUrl);
        
        if (updatedState.avatarUrl === window.currentUser.avatarUrl) {
          console.log('✅ Manual avatar update successful');
          return true;
        } else {
          console.log('❌ Manual avatar update failed - URLs do not match');
          return false;
        }
      } catch (error) {
        console.log('❌ Manual avatar update failed:', error.message);
        return false;
      }
    } else {
      console.log('⚠️ Cannot test manual update - frontend does not have real Google profile picture');
      return false;
    }
  } catch (error) {
    console.log('❌ Manual avatar update test failed:', error.message);
    return false;
  }
}

// Master test function
async function runComprehensiveAvatarTest() {
  console.log('🚀 Starting comprehensive avatar synchronization test...\n');
  
  const results = {
    googleAPI: await testGoogleAPIResponse(),
    frontendState: testFrontendUserState(),
    appUserState: await testAppUserTableState(),
    synchronization: await testAvatarSynchronization(),
    avatarUtils: await testAvatarUtilsResolution(),
    uiDisplay: testUIAvatarDisplay(),
    manualUpdate: await testManualAvatarUpdate()
  };
  
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('=======================');
  console.log('Google API Response:', results.googleAPI ? '✅ Success' : '❌ Failed');
  console.log('Frontend State:', results.frontendState ? '✅ Success' : '❌ Failed');
  console.log('AppUser State:', results.appUserState ? '✅ Success' : '❌ Failed');
  console.log('Synchronization:', results.synchronization ? '✅ Success' : '❌ Failed');
  console.log('Avatar Utils:', results.avatarUtils ? '✅ Success' : '❌ Failed');
  console.log('UI Display:', results.uiDisplay ? '✅ Success' : '❌ Failed');
  console.log('Manual Update:', results.manualUpdate ? '✅ Success' : '❌ Failed');
  
  // Identify issues
  console.log('\n🔍 ISSUE ANALYSIS');
  console.log('=================');
  
  if (results.googleAPI && results.googleAPI.picture) {
    console.log('✅ Google API is returning real profile pictures');
  } else {
    console.log('❌ Google API is not returning profile pictures');
  }
  
  if (results.frontendState && results.frontendState.isRealGoogle) {
    console.log('✅ Frontend has real Google profile picture');
  } else {
    console.log('❌ Frontend does not have real Google profile picture');
  }
  
  if (results.appUserState && results.appUserState.isRealGoogle) {
    console.log('✅ AppUser table has real Google profile picture');
  } else {
    console.log('❌ AppUser table does not have real Google profile picture');
  }
  
  if (results.synchronization) {
    console.log('✅ Frontend and AppUser table are synchronized');
  } else {
    console.log('❌ Frontend and AppUser table are NOT synchronized');
    console.log('  This is the main issue - AppUser table update is not working');
  }
  
  console.log('\n✅ COMPREHENSIVE AVATAR SYNCHRONIZATION TEST COMPLETE');
  console.log('====================================================');
  
  return results;
}

// Export for manual testing
window.testAvatarSynchronizationComprehensive = runComprehensiveAvatarTest;

// Auto-run if called directly
if (typeof window !== 'undefined') {
  runComprehensiveAvatarTest();
}
