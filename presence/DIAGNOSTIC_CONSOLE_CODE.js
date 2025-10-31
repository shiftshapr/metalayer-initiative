/**
 * COMPREHENSIVE DIAGNOSTIC CODE BLOCKS
 * Run these in the browser console to diagnose presence/url, reactions, and avatar issues
 * 
 * Copy and paste entire blocks into console
 */

// ==========================================
// 1. DIAGNOSTIC: Presence/URL API Call
// ==========================================
(async () => {
  console.log('🔍 DIAG: === PRESENCE/URL DIAGNOSTIC ===');
  
  // Check user identity
  console.log('📋 Current User:', {
    id: window.currentUser?.id || window.currentUser?.user_id || 'NONE',
    email: window.currentUser?.email || 'NONE',
    name: window.currentUser?.name || 'NONE',
    hasAuthManager: !!window.authManager,
    hasAPI: !!window.api
  });
  
  // Check URL data
  const pageUrl = (window.currentUrlData && window.currentUrlData.rawUrl) || location.href;
  const pageId = window.currentUrlData?.pageId || 'NONE';
  console.log('📋 URL Data:', { pageUrl, pageId });
  
  // Test API call with detailed logging
  try {
    console.log('🔍 Making API call to /v1/presence/url...');
    const api = window.METALAYER_API_URL || 'http://216.238.91.120:3002';
    const url = `${api}/v1/presence/url?url=${encodeURIComponent(pageUrl)}`;
    
    // Build headers manually to see what's sent
    const userId = window.currentUser?.id || window.currentUser?.user_id || null;
    const email = window.currentUser?.email || null;
    const headers = {
      'Content-Type': 'application/json',
      ...(userId ? { 'X-User-Id': userId } : {}),
      ...(email ? { 'X-User-Email': email } : {})
    };
    
    console.log('📤 Request:', { url, headers });
    
    const response = await fetch(url, { method: 'GET', headers });
    const status = response.status;
    const text = await response.text();
    
    console.log('📥 Response Status:', status);
    console.log('📥 Response Body:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('📥 Response JSON:', json);
    } catch (e) {
      console.log('⚠️ Response is not JSON');
    }
    
    if (status === 401) {
      console.error('❌ 401 UNAUTHORIZED - Check:');
      console.error('  1. window.currentUser.id or email exists:', !!userId || !!email);
      console.error('  2. User exists in database (check backend logs)');
      console.error('  3. Headers are being sent correctly (see Request above)');
    } else if (status === 400) {
      console.error('❌ 400 BAD REQUEST - Check:');
      console.error('  1. URL parameter is valid:', pageUrl);
      console.error('  2. URL is not chrome:// or file://');
      console.error('  3. Server expects "url" not "pageId" or "pageUrl"');
      console.error('  4. Response body for specific error:', text);
    } else if (status === 200) {
      console.log('✅ SUCCESS - API call worked!');
    }
  } catch (error) {
    console.error('❌ EXCEPTION:', error);
    console.error('Stack:', error.stack);
  }
  
  console.log('🔍 DIAG: === END PRESENCE/URL DIAGNOSTIC ===');
})();

// ==========================================
// 2. DIAGNOSTIC: Reactions API Call
// ==========================================
(async () => {
  console.log('🔍 DIAG: === REACTIONS DIAGNOSTIC ===');
  
  // Find a message to test with
  const messageEl = document.querySelector('.message, [data-message-id]');
  const messageId = messageEl?.dataset?.messageId || 'TEST-MESSAGE-ID';
  
  console.log('📋 Test Message ID:', messageId);
  console.log('📋 Current User:', {
    id: window.currentUser?.id || window.currentUser?.user_id || 'NONE',
    email: window.currentUser?.email || 'NONE'
  });
  
  try {
    console.log('🔍 Testing POST /v1/reactions...');
    const api = window.METALAYER_API_URL || 'http://216.238.91.120:3002';
    const url = `${api}/v1/reactions`;
    
    const userId = window.currentUser?.id || window.currentUser?.user_id || null;
    const email = window.currentUser?.email || null;
    const headers = {
      'Content-Type': 'application/json',
      ...(userId ? { 'X-User-Id': userId } : {}),
      ...(email ? { 'X-User-Email': email } : {})
    };
    
    // Backend uses authenticated user from headers - don't send user_id in body
    const body = { messageId: messageId, emoji: '👍' };
    
    console.log('📤 Request:', { url, headers, body });
    console.log('📋 Note: Backend uses X-User-Id header, not user_id in body');
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    const status = response.status;
    const text = await response.text();
    
    console.log('📥 Response Status:', status);
    console.log('📥 Response Body:', text);
    
    if (status === 401) {
      console.error('❌ 401 UNAUTHORIZED - Check identity headers');
    } else if (status === 400) {
      console.error('❌ 400 BAD REQUEST - Check payload format (should be {messageId, emoji})');
      console.error('Response:', text);
    } else if (status === 500) {
      console.error('❌ 500 SERVER ERROR - Check backend logs');
      console.error('Response:', text);
    } else if (status === 200 || status === 201) {
      console.log('✅ SUCCESS - Reaction posted!');
    }
  } catch (error) {
    console.error('❌ EXCEPTION:', error);
  }
  
  console.log('🔍 DIAG: === END REACTIONS DIAGNOSTIC ===');
})();

// ==========================================
// 3. DIAGNOSTIC: Avatar Resolution
// ==========================================
(async () => {
  console.log('🔍 DIAG: === AVATAR RESOLUTION DIAGNOSTIC ===');
  
  // Check AvatarUtils
  console.log('📋 AvatarUtils available:', !!window.AvatarUtils);
  console.log('📋 API Module available:', !!window.api);
  
  // Test avatar for a user from visibility data
  const visibilityUsers = window.visibilityData?.users || [];
  const testUserId = visibilityUsers[0]?.userId || visibilityUsers[0]?.id || window.currentUser?.id;
  
  if (!testUserId) {
    console.warn('⚠️ No test user ID available');
    return;
  }
  
  console.log('📋 Test User ID:', testUserId);
  
  // Test via AvatarUtils
  if (window.AvatarUtils) {
    try {
      const testUser = visibilityUsers.find(u => (u.userId || u.id) === testUserId) || { id: testUserId };
      console.log('🔍 Testing AvatarUtils.getAvatarUrl...');
      const avatarData = await window.AvatarUtils.getAvatarUrl(testUser, 'visibility');
      console.log('✅ AvatarUtils Result:', avatarData);
    } catch (error) {
      console.error('❌ AvatarUtils Error:', error);
    }
  }
  
  // Test via API
  if (window.api) {
    try {
      console.log('🔍 Testing /v1/users/:id API...');
      const userData = await window.api.request(`/v1/users/${testUserId}`, { method: 'GET', allow404: true });
      console.log('✅ API Result:', userData);
      if (!userData) {
        console.warn('⚠️ User not found via API (404 or null)');
      } else if (!userData.avatarUrl) {
        console.warn('⚠️ User found but no avatarUrl property');
      }
    } catch (error) {
      console.error('❌ API Error:', error);
    }
  }
  
  // Check message avatars
  const messages = document.querySelectorAll('.message, [data-message-id]');
  console.log('📋 Messages found:', messages.length);
  
  messages.forEach((msg, idx) => {
    if (idx >= 3) return; // Limit to first 3
    const avatar = msg.querySelector('.avatar-container img, .avatar img, img[src*="avatar"]');
    const messageId = msg.dataset?.messageId || 'unknown';
    console.log(`📋 Message ${idx + 1} (${messageId}):`, {
      hasAvatar: !!avatar,
      avatarSrc: avatar?.src || 'NONE',
      avatarSrcEmpty: avatar?.src === '' || avatar?.src === 'undefined'
    });
  });
  
  console.log('🔍 DIAG: === END AVATAR RESOLUTION DIAGNOSTIC ===');
})();

// ==========================================
// 4. COMPREHENSIVE SYSTEM CHECK
// ==========================================
(async () => {
  console.log('🔍 DIAG: === COMPREHENSIVE SYSTEM CHECK ===');
  
  const checks = {
    'window.currentUser exists': !!window.currentUser,
    'window.currentUser.id': window.currentUser?.id || window.currentUser?.user_id || 'NONE',
    'window.currentUser.email': window.currentUser?.email || 'NONE',
    'window.api exists': !!window.api,
    'window.api.request is function': typeof window.api?.request === 'function',
    'window.AvatarUtils exists': !!window.AvatarUtils,
    'window.METALAYER_API_URL': window.METALAYER_API_URL || 'NOT SET',
    'window.currentUrlData exists': !!window.currentUrlData,
    'window.currentUrlData.rawUrl': window.currentUrlData?.rawUrl || 'NONE',
    'window.currentUrlData.pageId': window.currentUrlData?.pageId || 'NONE',
    'window.authManager exists': !!window.authManager,
    'window.supabase exists': !!window.supabase,
    'visibilityData.users count': window.visibilityData?.users?.length || 0
  };
  
  console.table(checks);
  
  // Check for errors in console
  console.log('📋 Recent errors (last 50 console entries):');
  // Note: This won't capture past errors, but helps with ongoing debugging
  
  console.log('🔍 DIAG: === END COMPREHENSIVE SYSTEM CHECK ===');
})();

