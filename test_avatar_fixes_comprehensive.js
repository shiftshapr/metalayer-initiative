/**
 * COMPREHENSIVE AVATAR FIXES TEST
 * Tests all avatar display fixes including real Google profile pictures
 */

console.log('🧪 AVATAR FIXES COMPREHENSIVE TEST');
console.log('=====================================');

// Test 1: Check Chrome Identity API
console.log('\n📋 Test 1: Chrome Identity API');
console.log('-------------------------------');

async function testChromeIdentityAPI() {
  try {
    console.log('🔍 Testing Chrome identity API...');
    
    if (typeof chrome !== 'undefined' && chrome.identity) {
      console.log('✅ Chrome identity API available');
      
      // Test getProfileUserInfo
      if (chrome.identity.getProfileUserInfo) {
        console.log('✅ getProfileUserInfo method available');
        
        const profileInfo = await new Promise((resolve) => {
          chrome.identity.getProfileUserInfo((profileInfo) => {
            console.log('🔍 Profile info:', profileInfo);
            resolve(profileInfo);
          });
        });
        
        if (profileInfo && profileInfo.email) {
          console.log('✅ Profile info retrieved:', profileInfo.email);
          console.log('⚠️ Profile picture from getProfileUserInfo:', profileInfo.picture || 'null');
        } else {
          console.log('❌ No profile info retrieved');
        }
      } else {
        console.log('❌ getProfileUserInfo method not available');
      }
      
      // Test getAuthToken
      if (chrome.identity.getAuthToken) {
        console.log('✅ getAuthToken method available');
        
        const authToken = await new Promise((resolve) => {
          chrome.identity.getAuthToken({ interactive: false }, (token) => {
            console.log('🔍 Auth token:', token ? 'received' : 'null');
            resolve(token);
          });
        });
        
        if (authToken) {
          console.log('✅ Auth token retrieved');
          
          // Test Google API call
          try {
            const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authToken}`);
            const userInfo = await response.json();
            console.log('✅ Google API response:', userInfo.email);
            console.log('✅ Google profile picture:', userInfo.picture || 'null');
          } catch (error) {
            console.log('❌ Google API call failed:', error.message);
          }
        } else {
          console.log('❌ No auth token retrieved');
        }
      } else {
        console.log('❌ getAuthToken method not available');
      }
    } else {
      console.log('❌ Chrome identity API not available');
    }
  } catch (error) {
    console.log('❌ Chrome identity API test failed:', error.message);
  }
}

// Test 2: Check Real Google Auth Module
console.log('\n📋 Test 2: Real Google Auth Module');
console.log('----------------------------------');

async function testRealGoogleAuth() {
  try {
    console.log('🔍 Testing Real Google Auth module...');
    
    if (window.RealGoogleAuth) {
      console.log('✅ RealGoogleAuth class available');
      
      const realGoogleAuth = new window.RealGoogleAuth();
      console.log('✅ RealGoogleAuth instance created');
      
      const user = await realGoogleAuth.getCurrentUser();
      if (user) {
        console.log('✅ User retrieved from Real Google Auth:', user.email);
        console.log('✅ User picture:', user.picture || 'null');
        console.log('✅ User metadata avatar_url:', user.user_metadata?.avatar_url || 'null');
      } else {
        console.log('❌ No user retrieved from Real Google Auth');
      }
    } else {
      console.log('❌ RealGoogleAuth class not available');
    }
  } catch (error) {
    console.log('❌ Real Google Auth test failed:', error.message);
  }
}

// Test 3: Check Avatar Utils
console.log('\n📋 Test 3: Avatar Utils');
console.log('------------------------');

async function testAvatarUtils() {
  try {
    console.log('🔍 Testing Avatar Utils...');
    
    if (window.AvatarUtils) {
      console.log('✅ AvatarUtils class available');
      
      // Test with current user
      if (window.currentUser) {
        console.log('✅ Current user available:', window.currentUser.email);
        
        const avatarResult = await window.AvatarUtils.getAvatarUrl(window.currentUser, 'profile');
        console.log('✅ Avatar result for current user:', avatarResult);
      } else {
        console.log('❌ No current user available');
      }
      
      // Test with mock user
      const mockUser = {
        email: 'test@example.com',
        user_email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg'
      };
      
      const mockAvatarResult = await window.AvatarUtils.getAvatarUrl(mockUser, 'message');
      console.log('✅ Avatar result for mock user:', mockAvatarResult);
    } else {
      console.log('❌ AvatarUtils class not available');
    }
  } catch (error) {
    console.log('❌ Avatar Utils test failed:', error.message);
  }
}

// Test 4: Check AppUser Table Integration
console.log('\n📋 Test 4: AppUser Table Integration');
console.log('------------------------------------');

async function testAppUserIntegration() {
  try {
    console.log('🔍 Testing AppUser table integration...');
    
    if (window.api) {
      console.log('✅ API module available');
      
      // Test getting user from AppUser table
      if (window.currentUser && window.currentUser.email) {
        try {
          const response = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`);
          console.log('✅ User retrieved from AppUser table:', response.email);
          console.log('✅ User avatarUrl from AppUser:', response.avatarUrl || 'null');
          console.log('✅ User auraColor from AppUser:', response.auraColor || 'null');
        } catch (error) {
          console.log('❌ Failed to get user from AppUser table:', error.message);
        }
      } else {
        console.log('❌ No current user email available');
      }
      
      // Test updating avatar URL
      if (window.currentUser && window.currentUser.email && window.currentUser.avatarUrl) {
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
          console.log('✅ Avatar URL update successful:', updateResponse.success);
        } catch (error) {
          console.log('❌ Failed to update avatar URL:', error.message);
        }
      } else {
        console.log('❌ No current user or avatar URL available for update test');
      }
    } else {
      console.log('❌ API module not available');
    }
  } catch (error) {
    console.log('❌ AppUser integration test failed:', error.message);
  }
}

// Test 5: Check Presence Service Integration
console.log('\n📋 Test 5: Presence Service Integration');
console.log('---------------------------------------');

async function testPresenceServiceIntegration() {
  try {
    console.log('🔍 Testing presence service integration...');
    
    if (window.supabaseRealtimeClient) {
      console.log('✅ Supabase realtime client available');
      
      // Test getting active users
      try {
        const activeUsers = await window.supabaseRealtimeClient.getPageUsers('google_com_');
        console.log('✅ Active users retrieved:', activeUsers.length);
        
        activeUsers.forEach((user, index) => {
          console.log(`✅ User ${index + 1}:`, {
            email: user.email,
            avatarUrl: user.avatarUrl || 'null',
            auraColor: user.auraColor || 'null'
          });
        });
      } catch (error) {
        console.log('❌ Failed to get active users:', error.message);
      }
    } else {
      console.log('❌ Supabase realtime client not available');
    }
  } catch (error) {
    console.log('❌ Presence service integration test failed:', error.message);
  }
}

// Test 6: Check Avatar Display in UI
console.log('\n📋 Test 6: Avatar Display in UI');
console.log('-------------------------------');

function testAvatarDisplayInUI() {
  try {
    console.log('🔍 Testing avatar display in UI...');
    
    // Check profile avatar
    const profileAvatar = document.querySelector('#user-avatar-container');
    if (profileAvatar) {
      console.log('✅ Profile avatar container found');
      console.log('✅ Profile avatar HTML:', profileAvatar.innerHTML.substring(0, 100) + '...');
    } else {
      console.log('❌ Profile avatar container not found');
    }
    
    // Check message avatars
    const messageAvatars = document.querySelectorAll('.message-avatar');
    console.log('✅ Message avatars found:', messageAvatars.length);
    
    messageAvatars.forEach((avatar, index) => {
      console.log(`✅ Message avatar ${index + 1}:`, avatar.innerHTML.substring(0, 50) + '...');
    });
    
    // Check visibility avatars
    const visibilityAvatars = document.querySelectorAll('.avatar-item');
    console.log('✅ Visibility avatars found:', visibilityAvatars.length);
    
    visibilityAvatars.forEach((avatar, index) => {
      console.log(`✅ Visibility avatar ${index + 1}:`, avatar.innerHTML.substring(0, 50) + '...');
    });
  } catch (error) {
    console.log('❌ Avatar display UI test failed:', error.message);
  }
}

// Test 7: Check Global Constants
console.log('\n📋 Test 7: Global Constants');
console.log('---------------------------');

function testGlobalConstants() {
  try {
    console.log('🔍 Testing global constants...');
    
    if (window.AVATAR_FALLBACK_COLOR) {
      console.log('✅ AVATAR_FALLBACK_COLOR available:', window.AVATAR_FALLBACK_COLOR);
    } else {
      console.log('❌ AVATAR_FALLBACK_COLOR not available');
    }
    
    if (window.currentUser) {
      console.log('✅ window.currentUser available:', window.currentUser.email);
      console.log('✅ window.currentUser.avatarUrl:', window.currentUser.avatarUrl || 'null');
      console.log('✅ window.currentUser.auraColor:', window.currentUser.auraColor || 'null');
    } else {
      console.log('❌ window.currentUser not available');
    }
    
    if (window.currentVisibilityDataUnfiltered) {
      console.log('✅ currentVisibilityDataUnfiltered available:', window.currentVisibilityDataUnfiltered.length, 'users');
    } else {
      console.log('❌ currentVisibilityDataUnfiltered not available');
    }
  } catch (error) {
    console.log('❌ Global constants test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive avatar fixes test...\n');
  
  await testChromeIdentityAPI();
  await testRealGoogleAuth();
  await testAvatarUtils();
  await testAppUserIntegration();
  await testPresenceServiceIntegration();
  testAvatarDisplayInUI();
  testGlobalConstants();
  
  console.log('\n✅ COMPREHENSIVE AVATAR FIXES TEST COMPLETE');
  console.log('===========================================');
  console.log('Check the results above to identify any remaining issues.');
}

// Export for manual testing
window.testAvatarFixesComprehensive = runAllTests;

// Auto-run if called directly
if (typeof window !== 'undefined') {
  runAllTests();
}
