// COMP METHOD: Debug AppUser Table Avatar Issue
// Copy and paste this into browser console to debug the AppUser table

console.log('🔍 COMP_METHOD: Debugging AppUser table avatar issue...');

window.debugAppUserAvatar = async function() {
  console.log('🔍 COMP_METHOD: Checking AppUser table for daveroom...');
  
  try {
    // Check what's actually in the AppUser table
    const appUserResponse = await window.api.request(`/v1/users/${encodeURIComponent('daveroom@gmail.com')}`);
    console.log('📊 AppUser API Response:', appUserResponse);
    console.log('📊 AppUser AvatarUrl:', appUserResponse?.avatarUrl);
    console.log('📊 AppUser Email:', appUserResponse?.email);
    console.log('📊 AppUser Name:', appUserResponse?.name);
    
    if (appUserResponse?.avatarUrl?.includes('default-user')) {
      console.log('❌ ISSUE: AppUser table still has generic avatar');
      console.log('💡 SOLUTION: The database update may not have been applied correctly');
    } else if (appUserResponse?.avatarUrl?.includes('ACg8ocJaETKZY9tmcL04MuaaekGgWP5h0GDHvKCne1vUebil10BsK-Ol')) {
      console.log('✅ SUCCESS: AppUser table has the correct real avatar URL');
    } else {
      console.log('⚠️ UNKNOWN: AppUser table has a different avatar URL');
    }
    
    // Check if there's a caching issue
    console.log('\n🔍 COMP_METHOD: Checking for caching issues...');
    
    // Try a fresh API call with cache busting
    const freshResponse = await window.api.request(`/v1/users/${encodeURIComponent('daveroom@gmail.com')}?t=${Date.now()}`);
    console.log('📊 Fresh API Response:', freshResponse);
    
    if (freshResponse?.avatarUrl !== appUserResponse?.avatarUrl) {
      console.log('⚠️ CACHING ISSUE: Fresh response differs from cached response');
    } else {
      console.log('✅ NO CACHING ISSUE: Responses are consistent');
    }
    
    // Check window.currentUser
    console.log('\n📊 Window.currentUser:');
    console.log('   Email:', window.currentUser?.email);
    console.log('   AvatarUrl:', window.currentUser?.avatarUrl);
    console.log('   Picture:', window.currentUser?.picture);
    
    // Force refresh AvatarUtils
    console.log('\n🔍 COMP_METHOD: Testing AvatarUtils with fresh data...');
    if (typeof window.createUnifiedAvatar === 'function') {
      const testUser = {
        user_email: 'daveroom@gmail.com',
        email: 'daveroom@gmail.com'
      };
      
      console.log('🔍 COMP_METHOD: Testing AvatarUtils with test user...');
      const avatarResult = await window.createUnifiedAvatar(testUser);
      console.log('📊 AvatarUtils Result:', avatarResult);
      
      if (avatarResult.avatarUrl?.includes('default-user')) {
        console.log('❌ ISSUE: AvatarUtils still returning generic avatar');
      } else if (avatarResult.avatarUrl?.includes('ACg8ocJaETKZY9tmcL04MuaaekGgWP5h0GDHvKCne1vUebil10BsK-Ol')) {
        console.log('✅ SUCCESS: AvatarUtils returning correct real avatar');
      } else {
        console.log('⚠️ UNKNOWN: AvatarUtils returning different avatar');
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging AppUser avatar:', error);
  }
};

// COMP METHOD: Force update AppUser table with correct avatar
window.forceUpdateDaveroomAvatar = async function() {
  console.log('🔍 COMP_METHOD: Force updating daveroom avatar in AppUser table...');
  
  const correctAvatarUrl = 'https://lh3.googleusercontent.com/a/ACg8ocJaETKZY9tmcL04MuaaekGgWP5h0GDHvKCne1vUebil10BsK-Ol=s96-c';
  
  try {
    // Method 1: Use update-avatar endpoint
    console.log('🔍 COMP_METHOD: Method 1 - Using update-avatar endpoint...');
    const updateResponse = await window.api.request('/v1/users/update-avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'daveroom@gmail.com',
        avatarUrl: correctAvatarUrl
      })
    });
    console.log('✅ Method 1 Response:', updateResponse);
    
    // Method 2: Use POST /v1/users/:email endpoint as fallback
    console.log('🔍 COMP_METHOD: Method 2 - Using POST /v1/users/:email endpoint...');
    const fallbackResponse = await window.api.request('/v1/users/daveroom%40gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'daveroom@gmail.com',
        name: 'daveroom',
        avatarUrl: correctAvatarUrl,
        auraColor: window.AVATAR_FALLBACK_COLOR || '#ffffff'
      })
    });
    console.log('✅ Method 2 Response:', fallbackResponse);
    
    // Verify the update
    console.log('🔍 COMP_METHOD: Verifying the update...');
    const verifyResponse = await window.api.request(`/v1/users/${encodeURIComponent('daveroom@gmail.com')}`);
    console.log('📊 Verification Response:', verifyResponse);
    
    if (verifyResponse?.avatarUrl === correctAvatarUrl) {
      console.log('✅ SUCCESS: AppUser table updated correctly');
      console.log('🔄 Please refresh the page to see the changes');
    } else {
      console.log('❌ FAILED: AppUser table not updated correctly');
      console.log('   Expected:', correctAvatarUrl);
      console.log('   Actual:', verifyResponse?.avatarUrl);
    }
    
  } catch (error) {
    console.error('❌ Error force updating daveroom avatar:', error);
  }
};

console.log('✅ COMP_METHOD: AppUser debugging tools loaded');
console.log('Available functions:');
console.log('  - debugAppUserAvatar() - Debug AppUser table avatar issue');
console.log('  - forceUpdateDaveroomAvatar() - Force update daveroom avatar');
console.log('\n🚀 Run: debugAppUserAvatar() to check the AppUser table!');




