// Copy and paste this into browser console to find daveroom's real avatar
window.findDaveroomRealAvatar = async function() {
  console.log('🔍 FINDING DAVEROOM\'S REAL AVATAR...\n');
  
  // 1. Check if daveroom is in current visibility data
  console.log('📊 1. CHECKING VISIBILITY DATA:');
  if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
    const daveroomInVisibility = window.currentVisibilityDataUnfiltered.active.find(
      u => u.email === 'daveroom@gmail.com' || u.userId === 'daveroom@gmail.com'
    );
    
    if (daveroomInVisibility) {
      console.log('✅ Found daveroom in visibility data:');
      console.log('   Email:', daveroomInVisibility.email);
      console.log('   AvatarUrl:', daveroomInVisibility.avatarUrl);
      console.log('   Name:', daveroomInVisibility.name);
      console.log('   AuraColor:', daveroomInVisibility.auraColor);
    } else {
      console.log('❌ daveroom not found in visibility data');
    }
  } else {
    console.log('❌ No visibility data available');
  }
  
  // 2. Check AppUser table via API
  console.log('\n📊 2. CHECKING APPUSER TABLE:');
  try {
    const appUserResponse = await window.api.request('/v1/users/daveroom%40gmail.com');
    console.log('✅ AppUser table response:');
    console.log('   Email:', appUserResponse.email);
    console.log('   AvatarUrl:', appUserResponse.avatarUrl);
    console.log('   Name:', appUserResponse.name);
    console.log('   AuraColor:', appUserResponse.auraColor);
  } catch (error) {
    console.log('❌ Failed to get AppUser data:', error);
  }
  
  // 3. Check if daveroom has a real avatar in Google OAuth
  console.log('\n📊 3. CHECKING GOOGLE OAUTH DATA:');
  console.log('Current user (themetalayer):', window.currentUser?.email);
  console.log('Current user avatar:', window.currentUser?.avatarUrl);
  console.log('Current user metadata avatar:', window.currentUser?.user_metadata?.avatar_url);
  
  // 4. Check all message avatars to see what daveroom's avatar looks like
  console.log('\n📊 4. CHECKING MESSAGE AVATARS:');
  const messageElements = document.querySelectorAll('.message-avatar');
  console.log(`Found ${messageElements.length} message avatars`);
  
  messageElements.forEach((avatar, i) => {
    const img = avatar.querySelector('img');
    if (img) {
      console.log(`   Avatar ${i+1}: ${img.src}`);
    }
  });
  
  // 5. Check if we can find daveroom's real avatar URL
  console.log('\n📊 5. SEARCHING FOR DAVEROOM\'S REAL AVATAR:');
  
  // Look for any Google profile URLs that might be daveroom's
  const allImages = document.querySelectorAll('img[src*="googleusercontent.com"]');
  console.log(`Found ${allImages.length} Google profile images:`);
  
  allImages.forEach((img, i) => {
    console.log(`   Image ${i+1}: ${img.src}`);
    // Check if this might be daveroom's avatar
    const parentElement = img.closest('.message, .avatar, .user');
    if (parentElement) {
      const textContent = parentElement.textContent || '';
      if (textContent.includes('daveroom')) {
        console.log(`   🎯 POTENTIAL DAVEROOM AVATAR: ${img.src}`);
      }
    }
  });
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. If you found daveroom\'s real avatar URL above, copy it');
  console.log('2. Run: window.updateDaveroomAvatar("REAL_AVATAR_URL_HERE")');
  console.log('3. Refresh the page to see the fix');
};

// Function to update daveroom's avatar in AppUser table
window.updateDaveroomAvatar = async function(realAvatarUrl) {
  console.log('🔧 UPDATING DAVEROOM\'S AVATAR...');
  console.log('New avatar URL:', realAvatarUrl);
  
  try {
    const response = await window.api.request('/v1/users/update-avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'daveroom@gmail.com',
        avatarUrl: realAvatarUrl
      })
    });
    
    console.log('✅ Avatar updated successfully:', response);
    console.log('🔄 Please refresh the page to see the changes');
    
  } catch (error) {
    console.log('❌ Failed to update avatar:', error);
    
    // Try fallback method
    console.log('🔄 Trying fallback method...');
    try {
      const fallbackResponse = await window.api.request('/v1/users/daveroom%40gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'daveroom@gmail.com',
          name: 'daveroom',
          avatarUrl: realAvatarUrl,
          auraColor: window.AVATAR_FALLBACK_COLOR
        })
      });
      
      console.log('✅ Fallback update successful:', fallbackResponse);
      console.log('🔄 Please refresh the page to see the changes');
      
    } catch (fallbackError) {
      console.log('❌ Fallback also failed:', fallbackError);
    }
  }
};

console.log('🔍 DAVEROOM AVATAR DEBUGGING FUNCTIONS LOADED');
console.log('Run: findDaveroomRealAvatar() to start debugging');
console.log('Run: updateDaveroomAvatar("REAL_URL") to update the avatar');
