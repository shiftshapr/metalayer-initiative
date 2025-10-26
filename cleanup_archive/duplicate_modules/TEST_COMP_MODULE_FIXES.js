// ===== TEST COMP MODULE FIXES =====
// SD1 + SD2 + TA1: Test all COMP method fixes integrated into modules
// Date: 2025-01-24

console.log('🧪 TEST COMP MODULE FIXES: Starting comprehensive test of COMP method fixes...');

// ===== TEST FUNCTION =====

async function testCompModuleFixes() {
  console.log('🚀 TEST COMP MODULE FIXES: Running comprehensive test...');
  
  try {
    // Test 1: Profile Menu
    console.log('\n📋 TEST 1: Testing Profile Menu...');
    await testProfileMenu();
    
    // Test 2: Aura Change Modal
    console.log('\n📋 TEST 2: Testing Aura Change Modal...');
    await testAuraChangeModal();
    
    // Test 3: Reactions
    console.log('\n📋 TEST 3: Testing Reactions...');
    await testReactions();
    
    // Test 4: Replies
    console.log('\n📋 TEST 4: Testing Replies...');
    await testReplies();
    
    // Test 5: Theme Toggle
    console.log('\n📋 TEST 5: Testing Theme Toggle...');
    await testThemeToggle();
    
    // Test 6: Logout
    console.log('\n📋 TEST 6: Testing Logout...');
    await testLogout();
    
    // Test 7: Visibility System
    console.log('\n📋 TEST 7: Testing Visibility System...');
    await testVisibilitySystem();
    
    console.log('\n✅ ALL COMP MODULE TESTS COMPLETED');
    
  } catch (error) {
    console.error('❌ TEST COMP MODULE FIXES: Error running tests:', error);
  }
}

// ===== INDIVIDUAL TEST FUNCTIONS =====

async function testProfileMenu() {
  console.log('🔧 TESTING PROFILE MENU: Checking COMP method profile menu...');
  
  try {
    // Check if profile avatar container exists
    const userAvatarContainer = document.getElementById('user-avatar-container');
    if (!userAvatarContainer) {
      console.log('❌ PROFILE MENU: User avatar container not found');
      return false;
    }
    
    // Check if profile menu exists
    const userMenu = document.getElementById('user-menu');
    if (!userMenu) {
      console.log('❌ PROFILE MENU: User menu not found');
      return false;
    }
    
    // Check if menu action buttons exist
    const auraColorBtn = document.getElementById('aura-color-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const visibilitySettingsBtn = document.getElementById('visibility-settings-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (!auraColorBtn || !themeToggleBtn || !visibilitySettingsBtn || !logoutBtn) {
      console.log('❌ PROFILE MENU: Menu action buttons not found');
      return false;
    }
    
    console.log('✅ PROFILE MENU: All components found');
    return true;
    
  } catch (error) {
    console.error('❌ PROFILE MENU: Error testing profile menu:', error);
    return false;
  }
}

async function testAuraChangeModal() {
  console.log('🔧 TESTING AURA CHANGE MODAL: Checking COMP method aura modal...');
  
  try {
    // Check if showColorPickerModal function exists
    if (typeof window.showColorPickerModal !== 'function') {
      console.log('❌ AURA MODAL: showColorPickerModal function not found');
      return false;
    }
    
    // Test modal creation
    window.showColorPickerModal();
    
    // Check if modal was created
    const modal = document.getElementById('color-picker-modal');
    if (!modal) {
      console.log('❌ AURA MODAL: Modal not created');
      return false;
    }
    
    // Check modal elements
    const colorInput = document.getElementById('color-input');
    const previewCircle = document.getElementById('color-preview-circle');
    const closeBtn = document.getElementById('color-picker-close');
    const resetBtn = document.getElementById('color-picker-reset');
    const saveBtn = document.getElementById('color-picker-save');
    
    if (!colorInput || !previewCircle || !closeBtn || !resetBtn || !saveBtn) {
      console.log('❌ AURA MODAL: Modal elements not found');
      return false;
    }
    
    // Hide modal
    modal.style.display = 'none';
    
    console.log('✅ AURA MODAL: All components working');
    return true;
    
  } catch (error) {
    console.error('❌ AURA MODAL: Error testing aura modal:', error);
    return false;
  }
}

async function testReactions() {
  console.log('🔧 TESTING REACTIONS: Checking COMP method reactions...');
  
  try {
    // Check if reaction functions exist
    if (typeof window.handleReaction !== 'function') {
      console.log('❌ REACTIONS: handleReaction function not found');
      return false;
    }
    
    if (typeof window.addReaction !== 'function') {
      console.log('❌ REACTIONS: addReaction function not found');
      return false;
    }
    
    if (typeof window.removeReaction !== 'function') {
      console.log('❌ REACTIONS: removeReaction function not found');
      return false;
    }
    
    if (typeof window.loadMessageReactions !== 'function') {
      console.log('❌ REACTIONS: loadMessageReactions function not found');
      return false;
    }
    
    if (typeof window.updateReactionDisplay !== 'function') {
      console.log('❌ REACTIONS: updateReactionDisplay function not found');
      return false;
    }
    
    console.log('✅ REACTIONS: All functions available');
    return true;
    
  } catch (error) {
    console.error('❌ REACTIONS: Error testing reactions:', error);
    return false;
  }
}

async function testReplies() {
  console.log('🔧 TESTING REPLIES: Checking COMP method replies...');
  
  try {
    // Check if reply functions exist
    if (typeof window.handleReply !== 'function') {
      console.log('❌ REPLIES: handleReply function not found');
      return false;
    }
    
    if (typeof window.toggleThreadReplies !== 'function') {
      console.log('❌ REPLIES: toggleThreadReplies function not found');
      return false;
    }
    
    console.log('✅ REPLIES: All functions available');
    return true;
    
  } catch (error) {
    console.error('❌ REPLIES: Error testing replies:', error);
    return false;
  }
}

async function testThemeToggle() {
  console.log('🔧 TESTING THEME TOGGLE: Checking COMP method theme toggle...');
  
  try {
    // Check if theme toggle function exists
    if (typeof window.toggleTheme !== 'function') {
      console.log('❌ THEME TOGGLE: toggleTheme function not found');
      return false;
    }
    
    // Test theme toggle
    const initialTheme = document.body.classList.contains('dark-theme');
    window.toggleTheme();
    const newTheme = document.body.classList.contains('dark-theme');
    
    if (initialTheme === newTheme) {
      console.log('❌ THEME TOGGLE: Theme toggle not working');
      return false;
    }
    
    // Restore original theme
    window.toggleTheme();
    
    console.log('✅ THEME TOGGLE: Theme toggle working');
    return true;
    
  } catch (error) {
    console.error('❌ THEME TOGGLE: Error testing theme toggle:', error);
    return false;
  }
}

async function testLogout() {
  console.log('🔧 TESTING LOGOUT: Checking COMP method logout...');
  
  try {
    // Check if logout function exists
    if (typeof window.performLogout !== 'function') {
      console.log('❌ LOGOUT: performLogout function not found');
      return false;
    }
    
    console.log('✅ LOGOUT: Function available');
    return true;
    
  } catch (error) {
    console.error('❌ LOGOUT: Error testing logout:', error);
    return false;
  }
}

async function testVisibilitySystem() {
  console.log('🔧 TESTING VISIBILITY SYSTEM: Checking COMP method visibility...');
  
  try {
    // Check if visibility functions exist
    if (typeof window.updateVisibleTab !== 'function') {
      console.log('❌ VISIBILITY: updateVisibleTab function not found');
      return false;
    }
    
    // Check if visibility manager exists
    if (typeof window.VisibilityManager !== 'function') {
      console.log('❌ VISIBILITY: VisibilityManager not found');
      return false;
    }
    
    console.log('✅ VISIBILITY: System available');
    return true;
    
  } catch (error) {
    console.error('❌ VISIBILITY: Error testing visibility system:', error);
    return false;
  }
}

// ===== QUICK FIX FUNCTION =====

async function applyQuickFixes() {
  console.log('🔧 APPLYING QUICK FIXES: Ensuring all COMP method fixes are active...');
  
  try {
    // Ensure profile menu handlers are added
    if (typeof window.addProfileAvatarClickHandler === 'function') {
      window.addProfileAvatarClickHandler();
      console.log('✅ PROFILE MENU: Handlers added');
    }
    
    // Ensure all profile menu handlers are added
    if (typeof window.addAllProfileMenuHandlers === 'function') {
      window.addAllProfileMenuHandlers();
      console.log('✅ PROFILE MENU: All handlers added');
    }
    
    // Ensure theme toggle is available
    if (typeof window.toggleTheme !== 'function') {
      window.toggleTheme = function() {
        console.log('🔧 THEME_TOGGLE: Toggling theme');
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
          body.classList.remove('dark-theme');
          localStorage.setItem('theme', 'light');
          console.log('✅ THEME_TOGGLE: Switched to light theme');
        } else {
          body.classList.add('dark-theme');
          localStorage.setItem('theme', 'dark');
          console.log('✅ THEME_TOGGLE: Switched to dark theme');
        }
      };
      console.log('✅ THEME TOGGLE: Function created');
    }
    
    // Ensure logout function is available
    if (typeof window.performLogout !== 'function') {
      window.performLogout = async function() {
        console.log('🔧 LOGOUT: Performing logout');
        try {
          // Clear user data
          window.currentUser = null;
          window.supabaseUser = null;
          
          // Clear storage
          await chrome.storage.local.clear();
          
          // Reload the extension
          window.location.reload();
          
          console.log('✅ LOGOUT: Logout completed');
        } catch (error) {
          console.error('❌ LOGOUT: Error during logout:', error);
        }
      };
      console.log('✅ LOGOUT: Function created');
    }
    
    console.log('✅ QUICK FIXES: All fixes applied');
    
  } catch (error) {
    console.error('❌ QUICK FIXES: Error applying fixes:', error);
  }
}

// ===== EXPORT FUNCTIONS =====

window.testCompModuleFixes = testCompModuleFixes;
window.testProfileMenu = testProfileMenu;
window.testAuraChangeModal = testAuraChangeModal;
window.testReactions = testReactions;
window.testReplies = testReplies;
window.testThemeToggle = testThemeToggle;
window.testLogout = testLogout;
window.testVisibilitySystem = testVisibilitySystem;
window.applyQuickFixes = applyQuickFixes;

console.log('✅ TEST COMP MODULE FIXES: Script loaded successfully');
console.log('📋 USAGE: Run window.testCompModuleFixes() to test all fixes');
console.log('📋 USAGE: Run window.applyQuickFixes() to apply quick fixes');
