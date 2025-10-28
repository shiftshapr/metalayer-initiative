/**
 * CONSOLE DEBUGGING CODE BLOCK FOR AVATAR SYNCHRONIZATION ISSUES
 * Run this in the browser console to diagnose avatar synchronization problems
 */

console.log('🔧 AVATAR SYNCHRONIZATION DEBUGGING CODE BLOCK');
console.log('===============================================');

// Debug function 1: Check synchronization status
window.debugAvatarSynchronization = async function() {
  console.log('🔍 DEBUG: Checking avatar synchronization status...');
  
  if (!window.currentUser) {
    console.log('❌ window.currentUser not available');
    return;
  }
  
  console.log('Frontend state:');
  console.log('  Email:', window.currentUser.email);
  console.log('  Avatar URL:', window.currentUser.avatarUrl);
  console.log('  Is Google URL:', window.currentUser.avatarUrl?.includes('googleusercontent.com'));
  
  if (!window.api) {
    console.log('❌ API module not available');
    return;
  }
  
  try {
    const appUserResponse = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`);
    console.log('AppUser table state:');
    console.log('  Email:', appUserResponse.email);
    console.log('  Avatar URL:', appUserResponse.avatarUrl);
    console.log('  Is Google URL:', appUserResponse.avatarUrl?.includes('googleusercontent.com'));
    
    // Check synchronization
    if (window.currentUser.avatarUrl === appUserResponse.avatarUrl) {
      console.log('✅ Frontend and AppUser table are synchronized');
    } else {
      console.log('❌ Frontend and AppUser table are NOT synchronized');
      console.log('  Frontend:', window.currentUser.avatarUrl);
      console.log('  AppUser:', appUserResponse.avatarUrl);
    }
  } catch (error) {
    console.log('❌ Failed to check AppUser table:', error);
  }
};

// Debug function 2: Test AppUser table update
window.debugAppUserUpdate = async function() {
  console.log('🔍 DEBUG: Testing AppUser table update...');
  
  if (!window.api || !window.currentUser) {
    console.log('❌ API or current user not available');
    return;
  }
  
  if (!window.currentUser.avatarUrl || !window.currentUser.avatarUrl.includes('googleusercontent.com')) {
    console.log('❌ Current user does not have real Google profile picture');
    return;
  }
  
  console.log('Attempting to update AppUser table with:', window.currentUser.avatarUrl);
  
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
    
    console.log('✅ Update response:', updateResponse);
    
    // Verify the update
    const verifyResponse = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`);
    console.log('✅ Verification - AppUser avatar URL:', verifyResponse.avatarUrl);
    
    if (verifyResponse.avatarUrl === window.currentUser.avatarUrl) {
      console.log('✅ AppUser table update successful');
    } else {
      console.log('❌ AppUser table update failed - URLs do not match');
    }
  } catch (error) {
    console.log('❌ AppUser table update failed:', error);
  }
};

// Debug function 3: Test fallback update method
window.debugFallbackUpdate = async function() {
  console.log('🔍 DEBUG: Testing fallback update method...');
  
  if (!window.api || !window.currentUser) {
    console.log('❌ API or current user not available');
    return;
  }
  
  if (!window.currentUser.avatarUrl || !window.currentUser.avatarUrl.includes('googleusercontent.com')) {
    console.log('❌ Current user does not have real Google profile picture');
    return;
  }
  
  console.log('Attempting fallback update with getOrCreateUser...');
  
  try {
    const fallbackResponse = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: window.currentUser.email,
        name: window.currentUser.name,
        avatarUrl: window.currentUser.avatarUrl,
        auraColor: window.currentUser.auraColor
      })
    });
    
    console.log('✅ Fallback response:', fallbackResponse);
    
    // Verify the update
    const verifyResponse = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`);
    console.log('✅ Verification - AppUser avatar URL:', verifyResponse.avatarUrl);
    
    if (verifyResponse.avatarUrl === window.currentUser.avatarUrl) {
      console.log('✅ Fallback update successful');
    } else {
      console.log('❌ Fallback update failed - URLs do not match');
    }
  } catch (error) {
    console.log('❌ Fallback update failed:', error);
  }
};

// Debug function 4: Check Avatar Utils priority
window.debugAvatarUtilsPriority = async function() {
  console.log('🔍 DEBUG: Checking Avatar Utils priority...');
  
  if (!window.AvatarUtils || !window.currentUser) {
    console.log('❌ AvatarUtils or current user not available');
    return;
  }
  
  console.log('Testing Avatar Utils resolution for current user...');
  
  try {
    const avatarResult = await window.AvatarUtils.getAvatarUrl(window.currentUser, 'profile');
    console.log('Avatar Utils result:');
    console.log('  Avatar URL:', avatarResult.avatarUrl);
    console.log('  Source:', avatarResult.source);
    console.log('  User Name:', avatarResult.userName);
    
    if (avatarResult.source === 'appuser_table') {
      console.log('✅ Avatar Utils is using AppUser table (correct priority)');
    } else if (avatarResult.source === 'window_currentUser') {
      console.log('⚠️ Avatar Utils is using window.currentUser (fallback)');
    } else {
      console.log('⚠️ Avatar Utils is using unexpected source:', avatarResult.source);
    }
  } catch (error) {
    console.log('❌ Avatar Utils test failed:', error);
  }
};

// Debug function 5: Force refresh all avatars
window.debugForceRefreshAvatars = function() {
  console.log('🔍 DEBUG: Force refreshing all avatars...');
  
  try {
    // Refresh message avatars
    if (window.refreshAllMessageAvatars) {
      console.log('🔄 Refreshing message avatars...');
      window.refreshAllMessageAvatars();
    } else {
      console.log('❌ refreshAllMessageAvatars not available');
    }
    
    // Refresh visibility avatars
    if (window.refreshVisibilityAvatars) {
      console.log('🔄 Refreshing visibility avatars...');
      window.refreshVisibilityAvatars();
    } else {
      console.log('❌ refreshVisibilityAvatars not available');
    }
    
    // Update UI
    if (window.updateUI && window.currentUser) {
      console.log('🔄 Updating UI...');
      window.updateUI(window.currentUser);
    } else {
      console.log('❌ updateUI not available');
    }
    
    console.log('✅ Force refresh completed');
  } catch (error) {
    console.log('❌ Force refresh failed:', error);
  }
};

// Debug function 6: Check Google API directly
window.debugGoogleAPIDirect = async function() {
  console.log('🔍 DEBUG: Checking Google API directly...');
  
  if (typeof chrome === 'undefined' || !chrome.identity) {
    console.log('❌ Chrome identity API not available');
    return;
  }
  
  try {
    const authToken = await new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        resolve(token);
      });
    });
    
    if (!authToken) {
      console.log('❌ No auth token available');
      return;
    }
    
    console.log('✅ Auth token received, calling Google API...');
    
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authToken}`);
    const userInfo = await response.json();
    
    console.log('✅ Google API response:');
    console.log('  Email:', userInfo.email);
    console.log('  Name:', userInfo.name);
    console.log('  Picture:', userInfo.picture);
    
    if (userInfo.picture && userInfo.picture.includes('googleusercontent.com')) {
      console.log('✅ Google API is returning real profile picture');
      
      // Check if this matches frontend
      if (window.currentUser && window.currentUser.avatarUrl === userInfo.picture) {
        console.log('✅ Frontend matches Google API response');
      } else {
        console.log('❌ Frontend does not match Google API response');
        console.log('  Google API:', userInfo.picture);
        console.log('  Frontend:', window.currentUser?.avatarUrl);
      }
    } else {
      console.log('❌ Google API is not returning profile picture');
    }
  } catch (error) {
    console.log('❌ Google API test failed:', error);
  }
};

// Master debug function
window.debugAllAvatarSyncIssues = async function() {
  console.log('🚀 RUNNING COMPREHENSIVE AVATAR SYNCHRONIZATION DEBUG...');
  console.log('========================================================');
  
  await window.debugAvatarSynchronization();
  console.log('\n---\n');
  
  await window.debugGoogleAPIDirect();
  console.log('\n---\n');
  
  await window.debugAppUserUpdate();
  console.log('\n---\n');
  
  await window.debugFallbackUpdate();
  console.log('\n---\n');
  
  await window.debugAvatarUtilsPriority();
  console.log('\n---\n');
  
  window.debugForceRefreshAvatars();
  
  console.log('\n✅ COMPREHENSIVE AVATAR SYNCHRONIZATION DEBUG COMPLETE');
  console.log('=======================================================');
  console.log('Review the output above to identify synchronization issues.');
};

// Quick fix function
window.quickFixAvatarSync = async function() {
  console.log('🔧 ATTEMPTING QUICK AVATAR SYNCHRONIZATION FIX...');
  
  try {
    // First, try to update AppUser table
    if (window.currentUser && window.currentUser.avatarUrl && window.currentUser.avatarUrl.includes('googleusercontent.com')) {
      console.log('🔄 Updating AppUser table with frontend avatar URL...');
      
      try {
        await window.api.request('/v1/users/update-avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: window.currentUser.email,
            avatarUrl: window.currentUser.avatarUrl
          })
        });
        console.log('✅ AppUser table update successful');
      } catch (error) {
        console.log('⚠️ AppUser table update failed, trying fallback...');
        
        // Try fallback method
        await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: window.currentUser.email,
            name: window.currentUser.name,
            avatarUrl: window.currentUser.avatarUrl,
            auraColor: window.currentUser.auraColor
          })
        });
        console.log('✅ Fallback update successful');
      }
    }
    
    // Refresh all avatars
    if (window.refreshAllMessageAvatars) {
      window.refreshAllMessageAvatars();
    }
    if (window.refreshVisibilityAvatars) {
      window.refreshVisibilityAvatars();
    }
    if (window.updateUI && window.currentUser) {
      window.updateUI(window.currentUser);
    }
    
    console.log('✅ Quick fix attempt completed');
  } catch (error) {
    console.log('❌ Quick fix failed:', error);
  }
};

console.log('✅ Avatar synchronization debugging functions loaded. Available functions:');
console.log('  - debugAvatarSynchronization()');
console.log('  - debugAppUserUpdate()');
console.log('  - debugFallbackUpdate()');
console.log('  - debugAvatarUtilsPriority()');
console.log('  - debugForceRefreshAvatars()');
console.log('  - debugGoogleAPIDirect()');
console.log('  - debugAllAvatarSyncIssues() - Runs all debug functions');
console.log('  - quickFixAvatarSync() - Attempts quick fixes');
console.log('\nRun debugAllAvatarSyncIssues() for comprehensive debugging.');
