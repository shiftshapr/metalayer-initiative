/**
 * CONSOLE DEBUGGING CODE BLOCK FOR AVATAR FIXES
 * Run this in the browser console if avatar fixes don't work
 */

console.log('🔧 AVATAR FIXES DEBUGGING CODE BLOCK');
console.log('=====================================');

// Debug function 1: Check Chrome Identity API
window.debugChromeIdentity = async function() {
  console.log('🔍 DEBUG: Checking Chrome Identity API...');
  
  if (typeof chrome === 'undefined') {
    console.log('❌ Chrome API not available');
    return;
  }
  
  if (!chrome.identity) {
    console.log('❌ Chrome identity API not available');
    return;
  }
  
  console.log('✅ Chrome identity API available');
  
  // Check getProfileUserInfo
  if (chrome.identity.getProfileUserInfo) {
    console.log('🔍 Testing getProfileUserInfo...');
    chrome.identity.getProfileUserInfo((profileInfo) => {
      console.log('Profile info result:', profileInfo);
      if (profileInfo && profileInfo.email) {
        console.log('✅ Email:', profileInfo.email);
        console.log('⚠️ Picture:', profileInfo.picture || 'null (expected - getProfileUserInfo doesn\'t include picture)');
      } else {
        console.log('❌ No profile info');
      }
    });
  }
  
  // Check getAuthToken
  if (chrome.identity.getAuthToken) {
    console.log('🔍 Testing getAuthToken...');
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      console.log('Auth token result:', token ? 'received' : 'null');
      if (token) {
        console.log('✅ Auth token received, testing Google API...');
        fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`)
          .then(response => response.json())
          .then(userInfo => {
            console.log('✅ Google API response:', userInfo);
            console.log('✅ Google profile picture:', userInfo.picture || 'null');
          })
          .catch(error => {
            console.log('❌ Google API error:', error);
          });
      } else {
        console.log('❌ No auth token');
      }
    });
  }
};

// Debug function 2: Check Real Google Auth
window.debugRealGoogleAuth = async function() {
  console.log('🔍 DEBUG: Checking Real Google Auth...');
  
  if (!window.RealGoogleAuth) {
    console.log('❌ RealGoogleAuth not available');
    return;
  }
  
  console.log('✅ RealGoogleAuth available');
  
  try {
    const realGoogleAuth = new window.RealGoogleAuth();
    const user = await realGoogleAuth.getCurrentUser();
    
    if (user) {
      console.log('✅ User from Real Google Auth:', user);
      console.log('✅ User email:', user.email);
      console.log('✅ User picture:', user.picture || 'null');
      console.log('✅ User metadata avatar_url:', user.user_metadata?.avatar_url || 'null');
    } else {
      console.log('❌ No user from Real Google Auth');
    }
  } catch (error) {
    console.log('❌ Real Google Auth error:', error);
  }
};

// Debug function 3: Check Current User State
window.debugCurrentUser = function() {
  console.log('🔍 DEBUG: Checking current user state...');
  
  if (!window.currentUser) {
    console.log('❌ window.currentUser not available');
    return;
  }
  
  console.log('✅ window.currentUser available:');
  console.log('  Email:', window.currentUser.email);
  console.log('  Name:', window.currentUser.name);
  console.log('  Avatar URL:', window.currentUser.avatarUrl || 'null');
  console.log('  Aura Color:', window.currentUser.auraColor || 'null');
  console.log('  User Metadata:', window.currentUser.user_metadata || 'null');
  
  // Check if avatar URL is real Google profile picture
  if (window.currentUser.avatarUrl) {
    if (window.currentUser.avatarUrl.includes('googleusercontent.com')) {
      console.log('✅ Avatar URL appears to be real Google profile picture');
    } else if (window.currentUser.avatarUrl.includes('gravatar.com')) {
      console.log('⚠️ Avatar URL is Gravatar fallback');
    } else {
      console.log('⚠️ Avatar URL is neither Google nor Gravatar:', window.currentUser.avatarUrl);
    }
  }
};

// Debug function 4: Check Avatar Utils
window.debugAvatarUtils = async function() {
  console.log('🔍 DEBUG: Checking Avatar Utils...');
  
  if (!window.AvatarUtils) {
    console.log('❌ AvatarUtils not available');
    return;
  }
  
  console.log('✅ AvatarUtils available');
  
  if (!window.currentUser) {
    console.log('❌ No current user for Avatar Utils test');
    return;
  }
  
  try {
    const avatarResult = await window.AvatarUtils.getAvatarUrl(window.currentUser, 'profile');
    console.log('✅ Avatar Utils result:', avatarResult);
  } catch (error) {
    console.log('❌ Avatar Utils error:', error);
  }
};

// Debug function 5: Check AppUser Table
window.debugAppUserTable = async function() {
  console.log('🔍 DEBUG: Checking AppUser table...');
  
  if (!window.api) {
    console.log('❌ API module not available');
    return;
  }
  
  if (!window.currentUser || !window.currentUser.email) {
    console.log('❌ No current user email for AppUser test');
    return;
  }
  
  try {
    const response = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`);
    console.log('✅ AppUser table response:', response);
    console.log('✅ AppUser avatarUrl:', response.avatarUrl || 'null');
    console.log('✅ AppUser auraColor:', response.auraColor || 'null');
  } catch (error) {
    console.log('❌ AppUser table error:', error);
  }
};

// Debug function 6: Check Presence Data
window.debugPresenceData = function() {
  console.log('🔍 DEBUG: Checking presence data...');
  
  if (window.currentVisibilityDataUnfiltered) {
    console.log('✅ currentVisibilityDataUnfiltered available:', window.currentVisibilityDataUnfiltered.length, 'users');
    window.currentVisibilityDataUnfiltered.forEach((user, index) => {
      console.log(`  User ${index + 1}:`, {
        email: user.email,
        avatarUrl: user.avatarUrl || 'null',
        auraColor: user.auraColor || 'null'
      });
    });
  } else {
    console.log('❌ currentVisibilityDataUnfiltered not available');
  }
  
  if (window.currentVisibilityData) {
    console.log('✅ currentVisibilityData available:', window.currentVisibilityData.length, 'users');
  } else {
    console.log('❌ currentVisibilityData not available');
  }
};

// Debug function 7: Check UI Elements
window.debugUIElements = function() {
  console.log('🔍 DEBUG: Checking UI elements...');
  
  // Profile avatar
  const profileAvatar = document.querySelector('#user-avatar-container');
  if (profileAvatar) {
    console.log('✅ Profile avatar container found');
    console.log('  HTML:', profileAvatar.innerHTML.substring(0, 200) + '...');
  } else {
    console.log('❌ Profile avatar container not found');
  }
  
  // Message avatars
  const messageAvatars = document.querySelectorAll('.message-avatar');
  console.log('✅ Message avatars found:', messageAvatars.length);
  
  // Visibility avatars
  const visibilityAvatars = document.querySelectorAll('.avatar-item');
  console.log('✅ Visibility avatars found:', visibilityAvatars.length);
  
  // Check for generic avatars
  const genericAvatars = document.querySelectorAll('img[src*="default-user"]');
  console.log('⚠️ Generic avatars found:', genericAvatars.length);
  
  const gravatarAvatars = document.querySelectorAll('img[src*="gravatar.com"]');
  console.log('⚠️ Gravatar avatars found:', gravatarAvatars.length);
  
  const googleAvatars = document.querySelectorAll('img[src*="googleusercontent.com"]');
  console.log('✅ Google avatars found:', googleAvatars.length);
};

// Debug function 8: Check Global Constants
window.debugGlobalConstants = function() {
  console.log('🔍 DEBUG: Checking global constants...');
  
  console.log('AVATAR_FALLBACK_COLOR:', window.AVATAR_FALLBACK_COLOR || 'not set');
  console.log('SUPABASE_URL:', window.SUPABASE_URL || 'not set');
  console.log('METALAYER_API_URL:', window.METALAYER_API_URL || 'not set');
  
  // Check if functions are available
  const functions = [
    'window.refreshAllMessageAvatars',
    'window.refreshAllReactionDisplays',
    'window.loadMessageReactions',
    'window.showReactionModal',
    'window.addReactionToMessage',
    'window.updateReactionInMessage',
    'window.removeReactionFromMessage',
    'window.handleReactionChange'
  ];
  
  functions.forEach(funcName => {
    const func = eval(funcName);
    console.log(`${funcName}:`, typeof func === 'function' ? 'available' : 'missing');
  });
};

// Master debug function
window.debugAllAvatarIssues = async function() {
  console.log('🚀 RUNNING COMPREHENSIVE AVATAR DEBUG...');
  console.log('========================================');
  
  await window.debugChromeIdentity();
  console.log('\n---\n');
  
  await window.debugRealGoogleAuth();
  console.log('\n---\n');
  
  window.debugCurrentUser();
  console.log('\n---\n');
  
  await window.debugAvatarUtils();
  console.log('\n---\n');
  
  await window.debugAppUserTable();
  console.log('\n---\n');
  
  window.debugPresenceData();
  console.log('\n---\n');
  
  window.debugUIElements();
  console.log('\n---\n');
  
  window.debugGlobalConstants();
  
  console.log('\n✅ COMPREHENSIVE AVATAR DEBUG COMPLETE');
  console.log('=====================================');
  console.log('Review the output above to identify issues.');
};

// Quick fix function
window.quickFixAvatars = async function() {
  console.log('🔧 ATTEMPTING QUICK AVATAR FIX...');
  
  try {
    // Refresh all message avatars
    if (window.refreshAllMessageAvatars) {
      console.log('🔄 Refreshing all message avatars...');
      window.refreshAllMessageAvatars();
    }
    
    // Refresh visibility data
    if (window.refreshVisibilityAvatars) {
      console.log('🔄 Refreshing visibility avatars...');
      window.refreshVisibilityAvatars();
    }
    
    // Update UI
    if (window.updateUI && window.currentUser) {
      console.log('🔄 Updating UI...');
      window.updateUI(window.currentUser);
    }
    
    console.log('✅ Quick fix attempt completed');
  } catch (error) {
    console.log('❌ Quick fix failed:', error);
  }
};

console.log('✅ Debugging functions loaded. Available functions:');
console.log('  - debugChromeIdentity()');
console.log('  - debugRealGoogleAuth()');
console.log('  - debugCurrentUser()');
console.log('  - debugAvatarUtils()');
console.log('  - debugAppUserTable()');
console.log('  - debugPresenceData()');
console.log('  - debugUIElements()');
console.log('  - debugGlobalConstants()');
console.log('  - debugAllAvatarIssues() - Runs all debug functions');
console.log('  - quickFixAvatars() - Attempts quick fixes');
console.log('\nRun debugAllAvatarIssues() for comprehensive debugging.');
