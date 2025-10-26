// SD2 COMPREHENSIVE AVATAR DIAGNOSTIC SCRIPT
// Run this in the Chrome extension console to diagnose the avatar issue

console.log('🔍 SD2 AVATAR DIAGNOSTIC: Starting comprehensive avatar analysis...');

async function diagnoseAvatarIssue() {
  console.log('🔍 SD2 DIAGNOSTIC: === COMPREHENSIVE AVATAR ANALYSIS ===');
  
  // 1. Check window.currentUser
  console.log('🔍 SD2 DIAGNOSTIC: 1. window.currentUser:', window.currentUser);
  console.log('🔍 SD2 DIAGNOSTIC: 1. window.currentUser?.avatarUrl:', window.currentUser?.avatarUrl);
  
  // 2. Check StateManager data
  console.log('🔍 SD2 DIAGNOSTIC: 2. Checking StateManager data...');
  try {
    const supabaseUser = await window.getState('supabaseUser');
    console.log('🔍 SD2 DIAGNOSTIC: 2. supabaseUser from StateManager:', supabaseUser);
    console.log('🔍 SD2 DIAGNOSTIC: 2. supabaseUser?.picture:', supabaseUser?.picture);
    
    const supabaseSession = await window.getState('supabaseSession');
    console.log('🔍 SD2 DIAGNOSTIC: 2. supabaseSession from StateManager:', supabaseSession);
    console.log('🔍 SD2 DIAGNOSTIC: 2. supabaseSession?.user?.picture:', supabaseSession?.user?.picture);
  } catch (error) {
    console.log('🔍 SD2 DIAGNOSTIC: 2. Error getting StateManager data:', error);
  }
  
  // 3. Check realGoogleAuth availability
  console.log('🔍 SD2 DIAGNOSTIC: 3. window.realGoogleAuth available:', typeof window.realGoogleAuth);
  if (window.realGoogleAuth) {
    try {
      const realUser = await window.realGoogleAuth.getCurrentUser();
      console.log('🔍 SD2 DIAGNOSTIC: 3. realGoogleAuth.getCurrentUser():', realUser);
      console.log('🔍 SD2 DIAGNOSTIC: 3. realUser?.picture:', realUser?.picture);
    } catch (error) {
      console.log('🔍 SD2 DIAGNOSTIC: 3. Error calling realGoogleAuth.getCurrentUser():', error);
    }
  }
  
  // 4. Check DOM elements
  console.log('🔍 SD2 DIAGNOSTIC: 4. Checking DOM elements...');
  const userAvatarContainer = document.querySelector('#user-avatar-container');
  const userMenuName = document.querySelector('#user-menu-name');
  console.log('🔍 SD2 DIAGNOSTIC: 4. userAvatarContainer:', userAvatarContainer);
  console.log('🔍 SD2 DIAGNOSTIC: 4. userMenuName:', userMenuName);
  
  if (userAvatarContainer) {
    console.log('🔍 SD2 DIAGNOSTIC: 4. userAvatarContainer.innerHTML:', userAvatarContainer.innerHTML);
    const img = userAvatarContainer.querySelector('img');
    if (img) {
      console.log('🔍 SD2 DIAGNOSTIC: 4. Avatar img src:', img.src);
      console.log('🔍 SD2 DIAGNOSTIC: 4. Avatar img alt:', img.alt);
    }
  }
  
  // 5. Check createUnifiedAvatar function
  console.log('🔍 SD2 DIAGNOSTIC: 5. Checking createUnifiedAvatar function...');
  console.log('🔍 SD2 DIAGNOSTIC: 5. window.createUnifiedAvatar available:', typeof window.createUnifiedAvatar);
  
  // 6. Test avatar creation manually
  console.log('🔍 SD2 DIAGNOSTIC: 6. Testing manual avatar creation...');
  if (window.createUnifiedAvatar) {
    try {
      const testUser = {
        email: 'daveroom@gmail.com',
        name: 'daveroom',
        avatarUrl: 'https://www.gravatar.com/avatar/ZGF2ZXJvb21AZ21haWwuY29t?d=identicon&s=200'
      };
      const testAvatar = window.createUnifiedAvatar(testUser.email, testUser);
      console.log('🔍 SD2 DIAGNOSTIC: 6. Manual avatar creation result:', testAvatar);
    } catch (error) {
      console.log('🔍 SD2 DIAGNOSTIC: 6. Error in manual avatar creation:', error);
    }
  }
  
  // 7. Check for timing issues
  console.log('🔍 SD2 DIAGNOSTIC: 7. Checking for timing issues...');
  console.log('🔍 SD2 DIAGNOSTIC: 7. Current timestamp:', new Date().toISOString());
  
  // 8. Force avatar update
  console.log('🔍 SD2 DIAGNOSTIC: 8. Attempting to force avatar update...');
  if (window.currentUser) {
    window.currentUser.avatarUrl = 'https://www.gravatar.com/avatar/ZGF2ZXJvb21AZ21haWwuY29t?d=identicon&s=200';
    console.log('🔍 SD2 DIAGNOSTIC: 8. Updated window.currentUser.avatarUrl:', window.currentUser.avatarUrl);
    
    // Try to trigger UI update
    if (typeof window.updateUI === 'function') {
      console.log('🔍 SD2 DIAGNOSTIC: 8. Calling window.updateUI...');
      window.updateUI(window.currentUser);
    }
  }
  
  console.log('🔍 SD2 DIAGNOSTIC: === END COMPREHENSIVE AVATAR ANALYSIS ===');
}

// Run the diagnostic
diagnoseAvatarIssue();

// Also provide a manual fix function
window.fixAvatarIssue = async function() {
  console.log('🔧 SD2 MANUAL FIX: Attempting to fix avatar issue...');
  
  try {
    // Get the stored user data
    const storedUser = await window.getState('supabaseUser');
    console.log('🔧 SD2 MANUAL FIX: Retrieved stored user:', storedUser);
    
    if (storedUser && storedUser.picture) {
      // Update window.currentUser
      if (window.currentUser) {
        window.currentUser.avatarUrl = storedUser.picture;
        console.log('🔧 SD2 MANUAL FIX: Updated window.currentUser.avatarUrl to:', window.currentUser.avatarUrl);
        
        // Force UI update
        if (typeof window.updateUI === 'function') {
          window.updateUI(window.currentUser);
          console.log('🔧 SD2 MANUAL FIX: Called updateUI with updated user');
        }
      }
    } else {
      console.log('🔧 SD2 MANUAL FIX: No stored user data found');
    }
  } catch (error) {
    console.log('🔧 SD2 MANUAL FIX: Error:', error);
  }
};

console.log('🔍 SD2 AVATAR DIAGNOSTIC: Diagnostic complete. Run fixAvatarIssue() to attempt manual fix.');

