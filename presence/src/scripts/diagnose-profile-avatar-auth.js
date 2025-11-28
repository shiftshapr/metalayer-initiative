/**
 * Diagnostic Script: Profile Avatar and Auth Issues
 * 
 * PURPOSE: Diagnose why profile avatar is not displaying and auth is not working
 * 
 * USAGE: Copy this entire script and paste into browser console on a page with Canopi extension loaded
 * 
 * OUTPUT: Console logs with diagnostic results, issues found, and recommendations
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(async function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: Profile Avatar and Auth Issues');
  console.log('=============================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: [],
    recommendations: []
  };
  
  // Check 1: Window objects availability
  console.log('\n📋 Check 1: Window Objects Availability');
  results.checks.windowObjects = {
    realGoogleAuth: typeof window.realGoogleAuth !== 'undefined',
    RealGoogleAuth: typeof window.RealGoogleAuth !== 'undefined',
    authManager: typeof window.authManager !== 'undefined',
    getCurrentUserEmail: typeof window.getCurrentUserEmail !== 'undefined',
    getCurrentUserId: typeof window.getCurrentUserId !== 'undefined',
    stateManager: typeof window.stateManager !== 'undefined',
    supabase: typeof window.supabase !== 'undefined',
    api: typeof window.api !== 'undefined'
  };
  
  console.log('  realGoogleAuth:', results.checks.windowObjects.realGoogleAuth);
  console.log('  RealGoogleAuth:', results.checks.windowObjects.RealGoogleAuth);
  console.log('  authManager:', results.checks.windowObjects.authManager);
  console.log('  getCurrentUserEmail:', results.checks.windowObjects.getCurrentUserEmail);
  console.log('  getCurrentUserId:', results.checks.windowObjects.getCurrentUserId);
  console.log('  stateManager:', results.checks.windowObjects.stateManager);
  console.log('  supabase:', results.checks.windowObjects.supabase);
  console.log('  api:', results.checks.windowObjects.api);
  
  if (!results.checks.windowObjects.realGoogleAuth && !results.checks.windowObjects.RealGoogleAuth) {
    results.issues.push('realGoogleAuth/RealGoogleAuth not available on window');
    results.recommendations.push('Check if real-google-auth.js is loaded in sidepanel.html');
  }
  
  if (!results.checks.windowObjects.supabase) {
    results.issues.push('window.supabase not available');
    results.recommendations.push('Check if Supabase client is initialized');
  }
  
  // Check 2: Chrome Identity API
  console.log('\n📋 Check 2: Chrome Identity API');
  results.checks.chromeIdentity = {
    available: typeof chrome !== 'undefined' && typeof chrome.identity !== 'undefined',
    getProfileUserInfo: typeof chrome !== 'undefined' && chrome.identity && typeof chrome.identity.getProfileUserInfo === 'function',
    getAuthToken: typeof chrome !== 'undefined' && chrome.identity && typeof chrome.identity.getAuthToken === 'function',
    getRedirectURL: typeof chrome !== 'undefined' && chrome.identity && typeof chrome.identity.getRedirectURL === 'function'
  };
  
  console.log('  chrome.identity available:', results.checks.chromeIdentity.available);
  console.log('  getProfileUserInfo:', results.checks.chromeIdentity.getProfileUserInfo);
  console.log('  getAuthToken:', results.checks.chromeIdentity.getAuthToken);
  console.log('  getRedirectURL:', results.checks.chromeIdentity.getRedirectURL);
  
  if (!results.checks.chromeIdentity.available) {
    results.issues.push('Chrome Identity API not available');
    results.recommendations.push('Check manifest.json has "identity" and "identity.email" permissions');
  }
  
  // Check 3: Current User State
  console.log('\n📋 Check 3: Current User State');
  let currentUser = null;
  
  try {
    // Try stateManager first (TypeScript migration - preferred method)
    if (window.stateManager && typeof window.stateManager.getState === 'function') {
      try {
        currentUser = window.stateManager.getState('currentUser');
        console.log('  stateManager.currentUser:', currentUser);
      } catch (error) {
        console.warn('  stateManager.getState() error:', error);
      }
    } else {
      console.warn('  window.stateManager not available or getState is not a function');
      results.issues.push('window.stateManager not available - check if StateManager is initialized');
    }
    
    // Try authManager as fallback
    if (!currentUser && window.authManager && typeof window.authManager.getCurrentUser === 'function') {
      try {
        const authUser = window.authManager.getCurrentUser();
        console.log('  authManager.getCurrentUser():', authUser);
        if (authUser) {
          currentUser = authUser;
        }
      } catch (error) {
        console.warn('  authManager.getCurrentUser() error:', error);
      }
    } else if (!window.authManager) {
      console.warn('  window.authManager not available');
      results.issues.push('window.authManager not available - check if AuthManager is initialized');
    }
    
    // Try getCurrentUserEmail as another fallback
    if (!currentUser && window.getCurrentUserEmail && typeof window.getCurrentUserEmail === 'function') {
      try {
        const email = await window.getCurrentUserEmail();
        console.log('  getCurrentUserEmail() returned:', email);
        if (email && !currentUser) {
          // Create minimal user object from email
          currentUser = { email: email };
        }
      } catch (error) {
        console.warn('  getCurrentUserEmail() error:', error);
      }
    }
    
    // Try realGoogleAuth as last resort
    if (!currentUser && window.realGoogleAuth && typeof window.realGoogleAuth.getCurrentUser === 'function') {
      try {
        const realUser = await window.realGoogleAuth.getCurrentUser();
        console.log('  realGoogleAuth.getCurrentUser():', realUser);
        if (realUser) {
          currentUser = realUser;
        }
      } catch (error) {
        console.error('  realGoogleAuth.getCurrentUser() error:', error);
        results.issues.push('realGoogleAuth.getCurrentUser() failed: ' + (error.message || String(error)));
      }
    }
  } catch (error) {
    console.error('  Error checking current user:', error);
    results.issues.push('Error checking current user: ' + (error.message || String(error)));
  }
  
  results.checks.currentUser = {
    exists: currentUser !== null && currentUser !== undefined,
    hasEmail: currentUser && currentUser.email,
    hasAvatarUrl: currentUser && (currentUser.avatarUrl || currentUser.user_metadata?.avatar_url),
    hasId: currentUser && currentUser.id,
    user: currentUser
  };
  
  console.log('  User exists:', results.checks.currentUser.exists);
  console.log('  Has email:', results.checks.currentUser.hasEmail);
  console.log('  Has avatarUrl:', results.checks.currentUser.hasAvatarUrl);
  console.log('  Has id:', results.checks.currentUser.hasId);
  
  if (!results.checks.currentUser.exists) {
    results.issues.push('No current user found');
    results.recommendations.push('Auth initialization may have failed - check initialization flow');
  }
  
  if (!results.checks.currentUser.hasAvatarUrl) {
    results.issues.push('Current user has no avatarUrl');
    results.recommendations.push('Check if OAuth flow is returning avatar_url from Google');
    results.recommendations.push('Check if avatarUrl is being set from user_metadata.avatar_url');
  }
  
  // Check 4: Supabase Auth Session
  console.log('\n📋 Check 4: Supabase Auth Session');
  let supabaseSession = null;
  let supabaseUser = null;
  
  try {
    if (window.supabase && window.supabase.auth) {
      const sessionResult = await window.supabase.auth.getSession();
      supabaseSession = sessionResult.data?.session;
      console.log('  Supabase session exists:', !!supabaseSession);
      
      if (supabaseSession) {
        const userResult = await window.supabase.auth.getUser();
        supabaseUser = userResult.data?.user;
        console.log('  Supabase user:', supabaseUser);
        console.log('  Supabase user metadata:', supabaseUser?.user_metadata);
        console.log('  Supabase user avatar_url:', supabaseUser?.user_metadata?.avatar_url);
      } else {
        results.issues.push('No Supabase session found');
        results.recommendations.push('User may need to sign in via OAuth flow');
      }
    } else {
      results.issues.push('Supabase auth not available');
    }
  } catch (error) {
    console.error('  Error checking Supabase session:', error);
    results.issues.push('Error checking Supabase session: ' + error.message);
  }
  
  results.checks.supabase = {
    sessionExists: !!supabaseSession,
    userExists: !!supabaseUser,
    hasAvatarUrl: supabaseUser && supabaseUser.user_metadata?.avatar_url,
    user: supabaseUser
  };
  
  // Check 5: Extension ID and OAuth Configuration
  console.log('\n📋 Check 5: Extension ID and OAuth Configuration');
  try {
    const extensionId = chrome.runtime.id;
    console.log('  Extension ID:', extensionId);
    results.checks.extensionId = extensionId;
    
    const redirectUrl = chrome.identity.getRedirectURL();
    console.log('  OAuth redirect URL:', redirectUrl);
    results.checks.redirectUrl = redirectUrl;
    
    if (!extensionId || extensionId === '') {
      results.issues.push('Extension ID not found - check manifest.json has "id" field');
    }
  } catch (error) {
    console.error('  Error checking extension ID:', error);
    results.issues.push('Error checking extension ID: ' + error.message);
  }
  
  // Check 6: Profile Avatar Display Components
  console.log('\n📋 Check 6: Profile Avatar Display');
  try {
    const profileAvatarElements = document.querySelectorAll('.profile-avatar, [class*="avatar"], [data-avatar]');
    console.log('  Profile avatar elements found:', profileAvatarElements.length);
    
    if (profileAvatarElements.length === 0) {
      results.issues.push('No profile avatar elements found in DOM');
      results.recommendations.push('Check if avatar rendering components are being called');
    } else {
      profileAvatarElements.forEach((el, idx) => {
        console.log(`  Element ${idx + 1}:`, el.className, el.src || el.style.backgroundImage || 'no image');
        if (!el.src && !el.style.backgroundImage) {
          results.issues.push(`Profile avatar element ${idx + 1} has no image source`);
        }
      });
    }
  } catch (error) {
    console.error('  Error checking profile avatar display:', error);
  }
  
  // Check 7: User Retrieval API Usage (CRITICAL - must not use email/google id for GET requests)
  console.log('\n📋 Check 7: User Retrieval API Usage');
  results.checks.apiUsage = {
    invalidGetRequests: [],
    validGetRequests: [],
    postWithEmail: []
  };
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const googleIdPattern = /^\d{15,21}$/;
  
  // Intercept API requests to check for invalid usage
  if (window.api && window.api.request) {
    const originalRequest = window.api.request.bind(window.api);
    let requestCount = 0;
    
    window.api.request = function(endpoint, options) {
      requestCount++;
      const method = (options && options.method) || 'GET';
      
      // Check if this is a /v1/users/ endpoint
      const userEndpointMatch = endpoint.match(/^\/v1\/users\/([^\/\?]+)/);
      if (userEndpointMatch) {
        const userId = userEndpointMatch[1];
        const isEmail = userId.includes('@');
        const isGoogleId = googleIdPattern.test(userId);
        const isUuid = uuidRegex.test(userId);
        
        if (method === 'GET' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
          // GET/PATCH/PUT/DELETE must use UUID, not email or Google ID
          if (isEmail || isGoogleId || !isUuid) {
            results.checks.apiUsage.invalidGetRequests.push({
              endpoint: endpoint,
              method: method,
              userId: userId,
              type: isEmail ? 'EMAIL' : (isGoogleId ? 'GOOGLE_ID' : 'INVALID_FORMAT'),
              timestamp: new Date().toISOString()
            });
            console.error('❌ INVALID API REQUEST:', {
              method: method,
              endpoint: endpoint,
              userId: userId,
              type: isEmail ? 'EMAIL' : (isGoogleId ? 'GOOGLE_ID' : 'INVALID_FORMAT'),
              message: 'GET/PATCH/PUT/DELETE requests to /v1/users/:id must use UUID, not email or Google ID'
            });
            results.issues.push(`Invalid ${method} request to /v1/users/${userId} - must use UUID, not ${isEmail ? 'email' : (isGoogleId ? 'Google ID' : 'invalid format')}`);
            results.recommendations.push(`Fix ${method} request to use UUID instead of ${isEmail ? 'email' : (isGoogleId ? 'Google ID' : 'invalid format')}`);
          } else {
            results.checks.apiUsage.validGetRequests.push({
              endpoint: endpoint,
              method: method,
              userId: userId,
              timestamp: new Date().toISOString()
            });
          }
        } else if (method === 'POST') {
          // POST with email is acceptable for user creation
          if (isEmail) {
            results.checks.apiUsage.postWithEmail.push({
              endpoint: endpoint,
              method: method,
              userId: userId,
              timestamp: new Date().toISOString()
            });
            console.log('ℹ️ POST with email (acceptable for user creation):', endpoint);
          }
        }
      }
      
      return originalRequest(endpoint, options);
    };
    
    console.log('  API request interceptor installed');
    console.log('  Monitoring API requests for invalid email/Google ID usage...');
  } else {
    console.warn('  window.api.request not available - cannot intercept API requests');
    results.issues.push('Cannot intercept API requests - window.api.request not available');
  }
  
  console.log('  Invalid GET/PATCH/PUT/DELETE requests found:', results.checks.apiUsage.invalidGetRequests.length);
  console.log('  Valid GET/PATCH/PUT/DELETE requests found:', results.checks.apiUsage.validGetRequests.length);
  console.log('  POST requests with email (acceptable):', results.checks.apiUsage.postWithEmail.length);
  
  // Check current user ID format
  if (currentUser && currentUser.id) {
    const userId = currentUser.id;
    const isUuid = uuidRegex.test(userId);
    const isGoogleId = googleIdPattern.test(userId);
    const isEmail = userId.includes('@');
    
    console.log('  Current user ID format check:');
    console.log('    ID:', userId);
    console.log('    Is UUID:', isUuid);
    console.log('    Is Google ID:', isGoogleId);
    console.log('    Is Email:', isEmail);
    
    if (!isUuid && (isGoogleId || isEmail)) {
      results.issues.push(`Current user ID is ${isGoogleId ? 'Google ID' : 'email'} instead of UUID - this will cause API failures`);
      results.recommendations.push('Ensure currentUser.id is set to AppUser UUID after authentication');
    }
  }
  
  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('====================');
  console.log('Issues found:', results.issues.length);
  results.issues.forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue}`);
  });
  
  console.log('\n💡 Recommendations:');
  results.recommendations.forEach((rec, idx) => {
    console.log(`  ${idx + 1}. ${rec}`);
  });
  
  console.log('\n📋 Full Results Object:');
  console.log(JSON.stringify(results, null, 2));
  
  // Return results for programmatic access
  window.__DIAGNOSTIC_RESULTS__ = results;
  return results;
})();


