/**
 * AUTHENTICATION DIAGNOSTIC SCRIPT
 * Run in browser console: window.runAuthDiagnostic()
 * 
 * Checks:
 * 1. realGoogleAuth availability and initialization
 * 2. SupabaseService auth state
 * 3. Chrome Identity API availability
 * 4. Session state and user data
 * 5. Event listeners and triggers
 * 6. File loading (Logger.js, global.js)
 */

window.runAuthDiagnostic = async function() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
    recommendations: []
  };

  console.log('🔍 AUTH DIAGNOSTIC: Starting comprehensive authentication check...\n');

  // CHECK 1: realGoogleAuth availability
  console.log('1️⃣ Checking realGoogleAuth...');
  results.checks.realGoogleAuth = {
    available: typeof window.realGoogleAuth !== 'undefined',
    initialized: false,
    methods: []
  };
  
  if (results.checks.realGoogleAuth.available) {
    const rga = window.realGoogleAuth;
    results.checks.realGoogleAuth.initialized = rga.initialized === true;
    results.checks.realGoogleAuth.methods = Object.keys(rga).filter(k => typeof rga[k] === 'function');
    console.log('   ✅ realGoogleAuth available');
    console.log('   📋 Methods:', results.checks.realGoogleAuth.methods);
    console.log('   🔧 Initialized:', results.checks.realGoogleAuth.initialized);
  } else {
    results.errors.push('realGoogleAuth not available on window');
    console.log('   ❌ realGoogleAuth NOT available');
  }

  // CHECK 2: Chrome Identity API
  console.log('\n2️⃣ Checking Chrome Identity API...');
  results.checks.chromeIdentity = {
    available: typeof chrome !== 'undefined' && chrome.identity !== undefined,
    getProfileUserInfo: false,
    getAuthToken: false
  };
  
  if (results.checks.chromeIdentity.available) {
    results.checks.chromeIdentity.getProfileUserInfo = typeof chrome.identity.getProfileUserInfo === 'function';
    results.checks.chromeIdentity.getAuthToken = typeof chrome.identity.getAuthToken === 'function';
    console.log('   ✅ Chrome Identity API available');
    console.log('   📋 getProfileUserInfo:', results.checks.chromeIdentity.getProfileUserInfo);
    console.log('   📋 getAuthToken:', results.checks.chromeIdentity.getAuthToken);
  } else {
    results.errors.push('Chrome Identity API not available');
    console.log('   ❌ Chrome Identity API NOT available');
  }

  // CHECK 3: SupabaseService
  console.log('\n3️⃣ Checking SupabaseService...');
  results.checks.supabaseService = {
    available: typeof window.supabase !== 'undefined',
    client: null,
    authState: null
  };
  
  if (results.checks.supabaseService.available) {
    const supabase = window.supabase;
    results.checks.supabaseService.client = typeof supabase === 'object';
    results.checks.supabaseService.auth = typeof supabase.auth === 'object';
    
    // Try to get current session
    try {
      if (supabase.auth && typeof supabase.auth.getSession === 'function') {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        results.checks.supabaseService.authState = {
          hasSession: !!sessionData?.session,
          hasUser: !!sessionData?.session?.user,
          userEmail: sessionData?.session?.user?.email || null,
          error: sessionError?.message || null
        };
        console.log('   ✅ Supabase client available');
        console.log('   📋 Session:', results.checks.supabaseService.authState.hasSession ? 'EXISTS' : 'NONE');
        console.log('   📋 User:', results.checks.supabaseService.authState.hasUser ? results.checks.supabaseService.authState.userEmail : 'NONE');
      }
    } catch (error) {
      results.errors.push(`Supabase session check failed: ${error.message}`);
      console.log('   ⚠️ Error checking session:', error.message);
    }
  } else {
    results.errors.push('Supabase client not available');
    console.log('   ❌ Supabase client NOT available');
  }

  // CHECK 4: window.currentUser
  console.log('\n4️⃣ Checking window.currentUser...');
  results.checks.currentUser = {
    available: typeof window.currentUser !== 'undefined',
    hasEmail: false,
    email: null
  };
  
  if (results.checks.currentUser.available && window.currentUser) {
    results.checks.currentUser.hasEmail = !!window.currentUser.email;
    results.checks.currentUser.email = window.currentUser.email || null;
    console.log('   ✅ currentUser available');
    console.log('   📋 Email:', results.checks.currentUser.email || 'NONE');
  } else {
    results.warnings.push('window.currentUser not set');
    console.log('   ⚠️ currentUser NOT set');
  }

  // CHECK 5: Test realGoogleAuth.getCurrentUser()
  console.log('\n5️⃣ Testing realGoogleAuth.getCurrentUser()...');
  if (results.checks.realGoogleAuth.available && typeof window.realGoogleAuth.getCurrentUser === 'function') {
    try {
      // Check window.currentUser BEFORE call
      const beforeCurrentUser = window.currentUser;
      console.log('   🔍 window.currentUser BEFORE getCurrentUser():', beforeCurrentUser);
      
      const user = await window.realGoogleAuth.getCurrentUser();
      
      // Check window.currentUser AFTER call
      const afterCurrentUser = window.currentUser;
      console.log('   🔍 window.currentUser AFTER getCurrentUser():', afterCurrentUser);
      
      results.checks.getCurrentUserTest = {
        success: true,
        returnedUser: !!user,
        userEmail: user?.email || null,
        userObject: user,
        windowCurrentUserBefore: beforeCurrentUser,
        windowCurrentUserAfter: afterCurrentUser,
        windowCurrentUserSet: !!afterCurrentUser && !!afterCurrentUser.email
      };
      console.log('   ✅ getCurrentUser() executed successfully');
      console.log('   📋 Returned user:', results.checks.getCurrentUserTest.returnedUser ? results.checks.getCurrentUserTest.userEmail : 'NONE');
      console.log('   📋 window.currentUser set:', results.checks.getCurrentUserTest.windowCurrentUserSet);
      
      if (!results.checks.getCurrentUserTest.windowCurrentUserSet && results.checks.getCurrentUserTest.returnedUser) {
        results.errors.push('⚠️ getCurrentUser() returned user but window.currentUser not set');
        console.log('   ⚠️ ISSUE: getCurrentUser() returned user but window.currentUser not set!');
      }
    } catch (error) {
      results.checks.getCurrentUserTest = {
        success: false,
        error: error.message
      };
      results.errors.push(`getCurrentUser() failed: ${error.message}`);
      console.log('   ❌ getCurrentUser() failed:', error.message);
    }
  } else {
    results.errors.push('Cannot test getCurrentUser() - realGoogleAuth not available');
    console.log('   ❌ Cannot test - realGoogleAuth.getCurrentUser not available');
  }

  // CHECK 6: File loading (Logger.js, global.js)
  console.log('\n6️⃣ Checking file loading...');
  results.checks.fileLoading = {
    loggerJs: false,
    globalJs: false
  };
  
  // Check if Logger is available
  if (typeof window.Logger !== 'undefined' || typeof Logger !== 'undefined') {
    results.checks.fileLoading.loggerJs = true;
    console.log('   ✅ Logger.js loaded');
  } else {
    results.warnings.push('Logger.js not found in window');
    console.log('   ⚠️ Logger.js not found in window');
  }
  
  // Check for global.js (might not exist, that's okay)
  results.checks.fileLoading.globalJs = typeof window.global !== 'undefined';
  if (!results.checks.fileLoading.globalJs) {
    console.log('   ℹ️ global.js not found (may not be needed)');
  }

  // CHECK 7: Auth event listeners
  console.log('\n7️⃣ Checking auth event listeners...');
  results.checks.eventListeners = {
    authUIUpdate: false,
    customEvents: []
  };
  
  // Check if authUIUpdate events are being dispatched
  const testEvent = new CustomEvent('authUIUpdate', { detail: { test: true } });
  let eventReceived = false;
  const handler = () => { eventReceived = true; };
  document.addEventListener('authUIUpdate', handler);
  document.dispatchEvent(testEvent);
  document.removeEventListener('authUIUpdate', handler);
  results.checks.eventListeners.authUIUpdate = eventReceived;
  
  console.log('   📋 authUIUpdate events:', results.checks.eventListeners.authUIUpdate ? 'WORKING' : 'NOT WORKING');

  // Generate recommendations
  console.log('\n📋 RECOMMENDATIONS:');
  
  if (!results.checks.realGoogleAuth.available) {
    results.recommendations.push('Ensure real-google-auth.js is loaded before SupabaseService');
  }
  
  if (!results.checks.realGoogleAuth.initialized) {
    results.recommendations.push('Initialize realGoogleAuth: await window.realGoogleAuth.initialize()');
  }
  
  if (!results.checks.supabaseService.authState?.hasUser && results.checks.realGoogleAuth.available) {
    results.recommendations.push('Trigger auth: await window.realGoogleAuth.getCurrentUser()');
  }
  
  if (!results.checks.currentUser.available && results.checks.realGoogleAuth.available) {
    results.recommendations.push('Call getCurrentUser() to set window.currentUser');
  }
  
  if (results.checks.fileLoading.loggerJs === false) {
    results.recommendations.push('Check sidepanel.html - Logger.js should load from utils/Logger.js');
  }

  results.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });

  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`   ✅ Passed: ${Object.values(results.checks).filter(c => c && (c.available || c.success || c.hasUser)).length}`);
  console.log(`   ⚠️ Warnings: ${results.warnings.length}`);
  console.log(`   ❌ Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    results.warnings.forEach((warn, i) => console.log(`   ${i + 1}. ${warn}`));
  }

  // Store results
  window.authDiagnosticResults = results;
  console.log('\n✅ Diagnostic complete! Results stored in window.authDiagnosticResults');
  
  return results;
};

console.log('✅ Auth diagnostic script loaded! Run: window.runAuthDiagnostic()');

