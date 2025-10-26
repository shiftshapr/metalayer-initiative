// SD1 PROFILE AVATAR DEBUG - Run this in the browser console
// This will show exactly what user data is being used for the profile avatar

console.log('🔍 SD1 PROFILE AVATAR DEBUG: Starting profile avatar investigation...');

// Function 1: Check ProfileManager data
function checkProfileManager() {
  console.log('🔍 SD1 PROFILE DEBUG: === CHECKING PROFILE MANAGER ===');
  
  if (window.profileManager) {
    console.log('🔍 SD1 PROFILE DEBUG: ProfileManager exists');
    console.log('🔍 SD1 PROFILE DEBUG: ProfileManager profileData:', window.profileManager.profileData);
    
    if (window.profileManager.profileData) {
      const profileData = window.profileManager.profileData;
      console.log('🔍 SD1 PROFILE DEBUG: Profile data email:', profileData.email);
      console.log('🔍 SD1 PROFILE DEBUG: Profile data name:', profileData.name);
      console.log('🔍 SD1 PROFILE DEBUG: Profile data avatarUrl:', profileData.avatarUrl);
      
      if (profileData.email === 'themetalayer@gmail.com') {
        console.error('❌ SD1 PROFILE DEBUG: FOUND THEMETALAYER IN PROFILE DATA!');
        console.error('❌ SD1 PROFILE DEBUG: This is why the profile avatar shows themetalayer!');
      }
    } else {
      console.log('⚠️ SD1 PROFILE DEBUG: No profile data in ProfileManager');
    }
  } else {
    console.log('⚠️ SD1 PROFILE DEBUG: ProfileManager not available');
  }
}

// Function 2: Check window.currentUser
function checkCurrentUser() {
  console.log('🔍 SD1 PROFILE DEBUG: === CHECKING WINDOW.CURRENTUSER ===');
  
  if (window.currentUser) {
    console.log('🔍 SD1 PROFILE DEBUG: window.currentUser exists');
    console.log('🔍 SD1 PROFILE DEBUG: window.currentUser email:', window.currentUser.email);
    console.log('🔍 SD1 PROFILE DEBUG: window.currentUser name:', window.currentUser.name);
    console.log('🔍 SD1 PROFILE DEBUG: window.currentUser avatarUrl:', window.currentUser.avatarUrl);
    
    if (window.currentUser.email === 'themetalayer@gmail.com') {
      console.error('❌ SD1 PROFILE DEBUG: FOUND THEMETALAYER IN WINDOW.CURRENTUSER!');
      console.error('❌ SD1 PROFILE DEBUG: This is the root cause!');
    }
  } else {
    console.log('⚠️ SD1 PROFILE DEBUG: window.currentUser not available');
  }
}

// Function 3: Check profile avatar HTML
function checkProfileAvatarHTML() {
  console.log('🔍 SD1 PROFILE DEBUG: === CHECKING PROFILE AVATAR HTML ===');
  
  const userAvatarContainer = document.getElementById('user-avatar-container');
  if (userAvatarContainer) {
    console.log('🔍 SD1 PROFILE DEBUG: Profile avatar container found');
    console.log('🔍 SD1 PROFILE DEBUG: Profile avatar HTML:', userAvatarContainer.innerHTML);
    
    if (userAvatarContainer.innerHTML.includes('themetalayer')) {
      console.error('❌ SD1 PROFILE DEBUG: FOUND THEMETALAYER IN PROFILE AVATAR HTML!');
      console.error('❌ SD1 PROFILE DEBUG: This is what the user sees!');
    }
  } else {
    console.log('⚠️ SD1 PROFILE DEBUG: Profile avatar container not found');
  }
}

// Function 4: Check all user-related events
function checkUserEvents() {
  console.log('🔍 SD1 PROFILE DEBUG: === CHECKING USER EVENTS ===');
  
  // Check if any events are being dispatched with themetalayer data
  const originalDispatchEvent = document.dispatchEvent;
  document.dispatchEvent = function(event) {
    if (event.type === 'userUpdated' && event.detail) {
      console.log('🔍 SD1 PROFILE DEBUG: userUpdated event dispatched with:', event.detail);
      if (event.detail.email === 'themetalayer@gmail.com') {
        console.error('❌ SD1 PROFILE DEBUG: userUpdated event contains themetalayer!');
      }
    }
    if (event.type === 'authUIUpdate' && event.detail && event.detail.user) {
      console.log('🔍 SD1 PROFILE DEBUG: authUIUpdate event dispatched with:', event.detail.user);
      if (event.detail.user.email === 'themetalayer@gmail.com') {
        console.error('❌ SD1 PROFILE DEBUG: authUIUpdate event contains themetalayer!');
      }
    }
    return originalDispatchEvent.call(this, event);
  };
  
  console.log('🔍 SD1 PROFILE DEBUG: Event monitoring enabled');
}

// Run all checks
function runProfileDebug() {
  console.log('🚀 SD1 PROFILE DEBUG: Starting profile avatar investigation...');
  
  checkProfileManager();
  checkCurrentUser();
  checkProfileAvatarHTML();
  checkUserEvents();
  
  console.log('✅ SD1 PROFILE DEBUG: Investigation complete!');
}

// Make functions available globally
window.sd1CheckProfileManager = checkProfileManager;
window.sd1CheckCurrentUser = checkCurrentUser;
window.sd1CheckProfileAvatarHTML = checkProfileAvatarHTML;
window.sd1CheckUserEvents = checkUserEvents;
window.sd1RunProfileDebug = runProfileDebug;

console.log('🔍 SD1 PROFILE DEBUG: Functions loaded! Available commands:');
console.log('🔍 SD1 PROFILE DEBUG: - sd1RunProfileDebug() - Run all checks');
console.log('🔍 SD1 PROFILE DEBUG: - sd1CheckProfileManager() - Check ProfileManager data');
console.log('🔍 SD1 PROFILE DEBUG: - sd1CheckCurrentUser() - Check window.currentUser');
console.log('🔍 SD1 PROFILE DEBUG: - sd1CheckProfileAvatarHTML() - Check profile avatar HTML');

// Auto-run the debug
runProfileDebug();

