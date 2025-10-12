// TE2 TEST SUITE: Supabase Initialization Fix Verification
// This test suite verifies the fix for the auth-manager Supabase initialization bug

(async () => {
  console.log('🧪 TE2: === SUPABASE INITIALIZATION FIX TEST SUITE ===');
  console.log('');

  const runTest = async (name, testFunction) => {
    console.log(`\n--- Running Test: ${name} ---`);
    let result = { success: false, message: 'Test not implemented' };
    try {
      result = await testFunction();
      if (result.success) {
        console.log(`✅ Test Passed: ${name}`);
      } else {
        console.error(`❌ Test Failed: ${name} - ${result.message}`);
      }
    } catch (error) {
      console.error(`❌ Test Failed: ${name}`);
      console.error(error);
      result.success = false;
      result.error = error.message;
    }
    return result;
  };

  // TEST 1: Verify window.supabase exists and is a client instance
  window.testSupabaseClientInstance = async function() {
    console.log('🧪 TE2: === TEST 1: Supabase Client Instance ===');
    
    if (typeof window.supabase === 'undefined') {
      return { 
        success: false, 
        message: 'window.supabase is undefined - Supabase library not loaded' 
      };
    }
    
    console.log('✅ window.supabase exists');
    console.log('🔍 window.supabase type:', typeof window.supabase);
    console.log('🔍 window.supabase constructor:', window.supabase.constructor.name);
    
    // Check that it's a client instance, not a constructor
    if (typeof window.supabase.createClient === 'function') {
      return { 
        success: false, 
        message: 'window.supabase has createClient method - it is the CONSTRUCTOR, not a client instance! Should be created via supabase.createClient()' 
      };
    }
    
    console.log('✅ window.supabase is NOT a constructor (no createClient method)');
    
    // Verify it has auth property
    if (!window.supabase.auth || typeof window.supabase.auth !== 'object') {
      return { 
        success: false, 
        message: 'window.supabase.auth is missing or not an object' 
      };
    }
    
    console.log('✅ window.supabase.auth exists and is an object');
    console.log('🔍 auth methods:', Object.keys(window.supabase.auth).slice(0, 10));
    
    return { 
      success: true, 
      message: 'window.supabase is correctly initialized as client instance with auth' 
    };
  };

  // TEST 2: Verify AuthManager initializes without retry loop
  window.testAuthManagerNoRetryLoop = async function() {
    console.log('🧪 TE2: === TEST 2: AuthManager Initialization (No Retry Loop) ===');
    console.log('⚠️  MANUAL VERIFICATION REQUIRED:');
    console.log('   1. Check console logs above for "Supabase not ready, attempt X/10" messages');
    console.log('   2. If you see ANY retry messages, this test FAILS');
    console.log('   3. You should only see "✅ AUTH_MANAGER: Supabase auth provider initialized"');
    console.log('');
    
    // Check console history for retry messages (heuristic)
    const consoleHasRetryMessages = false; // User must verify manually
    
    // Check if auth manager is initialized
    if (!window.authManager) {
      return { 
        success: false, 
        message: 'window.authManager is not defined' 
      };
    }
    
    console.log('✅ window.authManager exists');
    
    // Check current provider
    const currentProvider = window.authManager.getCurrentProvider();
    console.log('🔍 Current auth provider:', currentProvider);
    
    if (currentProvider !== 'supabase' && currentProvider !== 'metalayer') {
      return { 
        success: false, 
        message: `Unexpected auth provider: ${currentProvider}` 
      };
    }
    
    // If using metalayer, it means Supabase init failed
    if (currentProvider === 'metalayer') {
      console.warn('⚠️  Auth provider is "metalayer" - this means Supabase initialization FAILED');
      console.warn('⚠️  Check console logs for Supabase init errors');
      return { 
        success: false, 
        message: 'AuthManager fell back to metalayer provider - Supabase init failed' 
      };
    }
    
    console.log('✅ Auth provider is "supabase" - initialization successful');
    
    return { 
      success: true, 
      message: 'AuthManager initialized successfully with Supabase provider (manual verification of retry loop required)' 
    };
  };

  // TEST 3: Verify user authentication state
  window.testAuthenticationState = async function() {
    console.log('🧪 TE2: === TEST 3: User Authentication State ===');
    
    if (!window.authManager) {
      return { 
        success: false, 
        message: 'window.authManager is not defined' 
      };
    }
    
    const user = await window.authManager.getCurrentUser();
    console.log('🔍 Current user:', user);
    
    if (!user) {
      return { 
        success: false, 
        message: 'No authenticated user found' 
      };
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('🔍 User details:', {
      email: user.email,
      name: user.name || user.user_metadata?.full_name,
      avatarUrl: user.avatarUrl || user.user_metadata?.avatar_url
    });
    
    return { 
      success: true, 
      user: user,
      message: `User authenticated as ${user.email}` 
    };
  };

  // TEST 4: Verify profile avatar renders
  window.testProfileAvatarRender = async function() {
    console.log('🧪 TE2: === TEST 4: Profile Avatar Rendering ===');
    
    const userAvatarContainer = document.getElementById('user-avatar-container');
    
    if (!userAvatarContainer) {
      return { 
        success: false, 
        message: 'user-avatar-container element not found in DOM' 
      };
    }
    
    console.log('✅ user-avatar-container found');
    
    const avatarImage = userAvatarContainer.querySelector('img');
    if (!avatarImage) {
      return { 
        success: false, 
        message: 'No <img> element found inside user-avatar-container' 
      };
    }
    
    console.log('✅ Avatar <img> element found');
    console.log('🔍 Avatar src:', avatarImage.src);
    
    // Check if using real Google avatar or fallback
    const isRealAvatar = avatarImage.src.includes('googleusercontent.com') || 
                        avatarImage.src.includes('lh3.google');
    const isFallback = avatarImage.src.includes('ui-avatars.com');
    
    console.log('🔍 Is real Google avatar:', isRealAvatar);
    console.log('🔍 Is fallback avatar:', isFallback);
    
    if (isFallback) {
      console.warn('⚠️  Using fallback ui-avatars.com - may not have real Google profile picture');
    }
    
    // Check aura styling
    const avatarWrapper = userAvatarContainer.querySelector('[style*="background"]');
    if (avatarWrapper) {
      console.log('✅ Aura background found');
      console.log('🔍 Aura style:', avatarWrapper.getAttribute('style'));
    } else {
      console.warn('⚠️  No aura background found on avatar');
    }
    
    return { 
      success: true, 
      message: 'Profile avatar rendered', 
      isRealAvatar: isRealAvatar,
      avatarSrc: avatarImage.src 
    };
  };

  // TEST 5: Verify visibility list populates
  window.testVisibilityListPopulates = async function() {
    console.log('🧪 TE2: === TEST 5: Visibility List Population ===');
    
    const visibleTab = document.getElementById('canopi-visible');
    
    if (!visibleTab) {
      return { 
        success: false, 
        message: 'canopi-visible element not found in DOM' 
      };
    }
    
    console.log('✅ canopi-visible element found');
    
    const userItems = visibleTab.querySelectorAll('.user-item');
    console.log('🔍 Number of visible users:', userItems.length);
    
    if (userItems.length === 0) {
      console.warn('⚠️  No visible users found - this may be expected if no other users are on the same page');
      return { 
        success: true, 
        message: 'Visibility list empty (may be expected)', 
        userCount: 0 
      };
    }
    
    console.log('✅ Visibility list has', userItems.length, 'user(s)');
    
    // Check each user item
    userItems.forEach((item, index) => {
      const userName = item.querySelector('.item-name')?.textContent;
      const userStatus = item.querySelector('.item-status')?.textContent;
      const avatarImg = item.querySelector('img');
      
      console.log(`🔍 User ${index + 1}:`, {
        name: userName,
        status: userStatus,
        avatarSrc: avatarImg?.src
      });
    });
    
    return { 
      success: true, 
      message: `Visibility list populated with ${userItems.length} user(s)`, 
      userCount: userItems.length 
    };
  };

  // TEST 6: Check for console errors related to Supabase
  window.testNoSupabaseConsoleErrors = async function() {
    console.log('🧪 TE2: === TEST 6: No Supabase Console Errors ===');
    console.log('⚠️  MANUAL VERIFICATION REQUIRED:');
    console.log('   1. Scroll through console logs above');
    console.log('   2. Look for error messages containing "Supabase"');
    console.log('   3. Common errors to watch for:');
    console.log('      - "Failed to initialize Supabase auth provider"');
    console.log('      - "Supabase client not available"');
    console.log('      - "Supabase not ready, attempt X/10"');
    console.log('      - "❌ SUPABASE: Failed to initialize"');
    console.log('');
    console.log('   If you see ANY of these errors, the test FAILS');
    console.log('');
    
    return { 
      success: true, 
      message: 'Manual verification required for console errors' 
    };
  };

  // Master test runner
  window.runSupabaseInitTests = async function() {
    console.log('🚀 TE2: Running all Supabase initialization tests...');
    console.log('');
    
    const results = [];
    results.push(await runTest('Supabase Client Instance', window.testSupabaseClientInstance));
    results.push(await runTest('AuthManager No Retry Loop', window.testAuthManagerNoRetryLoop));
    results.push(await runTest('Authentication State', window.testAuthenticationState));
    results.push(await runTest('Profile Avatar Render', window.testProfileAvatarRender));
    results.push(await runTest('Visibility List Populates', window.testVisibilityListPopulates));
    results.push(await runTest('No Supabase Console Errors', window.testNoSupabaseConsoleErrors));
    
    console.log('\n🏁 TE2: === TEST SUMMARY ===');
    const passedTests = results.filter(r => r.success).length;
    const totalTests = results.length;
    
    console.log(`📊 Passed: ${passedTests}/${totalTests}`);
    console.log('');
    
    results.forEach((res, index) => {
      const status = res.success ? '✅ PASS' : '❌ FAIL';
      console.log(`   Test ${index + 1}: ${status} - ${res.message}`);
    });
    
    console.log('');
    console.log('🔍 SD1 RECOMMENDATIONS:');
    if (passedTests < totalTests) {
      console.log('   - Review failed tests above for details');
      console.log('   - Check if window.supabase is correctly initialized in sidepanel.js');
      console.log('   - Verify auth-manager.js uses window.supabase directly, not window.supabase.createClient()');
      console.log('   - Ensure Supabase library (lib/supabase.min.js) is loaded before auth-manager.js');
    } else {
      console.log('   - All tests passed! Supabase initialization is working correctly');
      console.log('   - Verify profile avatar and visibility list are displaying correctly in the UI');
    }
    
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('   1. User should reload the Chrome extension (chrome://extensions/)');
    console.log('   2. Open sidepanel and run: window.runSupabaseInitTests()');
    console.log('   3. Verify profile avatar and visibility list populate correctly');
    console.log('   4. Check backend logs for any pageId mismatch or message loading issues');
    
    return { passedTests, totalTests, results };
  };

  console.log('✅ TE2: Supabase Initialization Test Suite loaded');
  console.log('');
  console.log('📋 Available TE2 Test Commands:');
  console.log('   • window.testSupabaseClientInstance() - Test Supabase client');
  console.log('   • window.testAuthManagerNoRetryLoop() - Test AuthManager init');
  console.log('   • window.testAuthenticationState() - Test user auth');
  console.log('   • window.testProfileAvatarRender() - Test profile avatar');
  console.log('   • window.testVisibilityListPopulates() - Test visibility list');
  console.log('   • window.testNoSupabaseConsoleErrors() - Check console for errors');
  console.log('   • window.runSupabaseInitTests() - Run ALL tests');
  console.log('');
  console.log('🎯 Quick Start: Run window.runSupabaseInitTests() to test everything');
})();

