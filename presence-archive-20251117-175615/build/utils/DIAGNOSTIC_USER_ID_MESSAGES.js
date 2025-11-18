/**
 * DIAGNOSTIC: User ID and Messages Loading
 * 
 * Diagnoses why window.currentUser.id is null and messages aren't loading
 */

async function diagnoseUserIdAndMessages() {
  console.log('🔍 DIAGNOSTIC: === USER ID AND MESSAGES DIAGNOSTIC ===');
  
  const results = {
    timestamp: new Date().toISOString(),
    currentUser: {},
    authentication: {},
    api: {},
    messages: {},
    preferences: {},
    errors: []
  };

  // Check 1: window.currentUser state
  results.currentUser = {
    exists: !!window.currentUser,
    id: window.currentUser?.id || null,
    user_id: window.currentUser?.user_id || null,
    email: window.currentUser?.email || null,
    name: window.currentUser?.name || null,
    hasId: !!(window.currentUser?.id || window.currentUser?.user_id),
    fullObject: window.currentUser ? JSON.parse(JSON.stringify(window.currentUser)) : null
  };

  console.log('🔍 DIAGNOSTIC: window.currentUser:', results.currentUser);

  // Check 2: Authentication state
  if (window.authManager) {
    try {
      const authUser = await window.authManager.getCurrentUser();
      results.authentication = {
        authManagerExists: true,
        getCurrentUserResult: authUser ? 'user_returned' : 'null',
        authUserEmail: authUser?.email || null,
        authUserId: authUser?.id || null
      };
    } catch (error) {
      results.authentication = {
        authManagerExists: true,
        error: error.message
      };
      results.errors.push({ type: 'auth', error: error.message });
    }
  } else {
    results.authentication = { authManagerExists: false };
  }

  // Check 3: API availability and test call
  if (window.api && window.currentUser?.email) {
    try {
      // Try to get user by email
      const testResponse = await window.api.request(`/v1/users/${encodeURIComponent(window.currentUser.email)}`, {
        method: 'GET'
      });
      results.api = {
        apiExists: true,
        testCallSuccess: !!testResponse,
        testResponseId: testResponse?.id || null,
        testResponseError: testResponse?.error || null
      };
      
      if (testResponse?.id && !window.currentUser.id) {
        console.warn('⚠️ DIAGNOSTIC: API returned user ID but window.currentUser.id is null!');
        results.errors.push({
          type: 'id_mismatch',
          message: 'API has user ID but window.currentUser.id is null',
          apiId: testResponse.id
        });
      }
    } catch (error) {
      results.api = {
        apiExists: true,
        testCallSuccess: false,
        error: error.message,
        errorDetails: error
      };
      results.errors.push({ type: 'api', error: error.message });
    }
  } else {
    results.api = {
      apiExists: !!window.api,
      emailAvailable: !!window.currentUser?.email
    };
  }

  // Check 4: UserPreferencesManager state
  if (window.userPreferencesManager) {
    results.preferences = {
      managerExists: true,
      isInitialized: window.userPreferencesManager.isInitialized,
      userId: window.userPreferencesManager.userId,
      waitingForUserId: !window.userPreferencesManager.userId && !window.userPreferencesManager.isInitialized
    };
  } else {
    results.preferences = { managerExists: false };
  }

  // Check 5: Messages loading state
  const chatMessages = document.querySelectorAll('.chat-message, .message');
  const chatContainer = document.querySelector('.chat-messages, #chat-messages');
  
  results.messages = {
    chatContainerExists: !!chatContainer,
    messageCount: chatMessages.length,
    chatContainerVisible: chatContainer ? window.getComputedStyle(chatContainer).display !== 'none' : false,
    loadChatHistoryAvailable: typeof window.loadChatHistory === 'function'
  };

  // Check 6: Check for API errors in console
  if (window.performance && window.performance.getEntriesByType) {
    const networkEntries = window.performance.getEntriesByType('resource');
    const apiErrors = networkEntries.filter(entry => 
      entry.name.includes('/v1/users/') && 
      (entry.name.includes('500') || entry.responseStatus === 500)
    );
    
    results.api.recentErrors = apiErrors.slice(-5).map(entry => ({
      url: entry.name,
      status: entry.responseStatus
    }));
  }

  // Check 7: Backend error check (if we can detect it)
  if (results.api.error) {
    const errorMsg = results.api.error.toLowerCase();
    if (errorMsg.includes('preferences') || (errorMsg.includes('p2022') && errorMsg.includes('preferences'))) {
      results.errors.push({
        type: 'backend_preferences_error',
        message: 'Backend still references preferences column',
        recommendation: 'Update backend routes/users.js to remove preferences references'
      });
    }
    if (errorMsg.includes('aura_color') || (errorMsg.includes('p2022') && errorMsg.includes('aura'))) {
      results.errors.push({
        type: 'backend_aura_color_error',
        message: 'Backend Prisma schema mismatch - aura_color column mapping issue',
        recommendation: 'Check Prisma schema @map directive for auraColor field. Database column is auraColor (camelCase), not aura_color (snake_case). Remove @map("aura_color") or fix column mapping.'
      });
    }
  }

  console.log('🔍 DIAGNOSTIC: Results:', results);
  console.log('🔍 DIAGNOSTIC: === END USER ID AND MESSAGES DIAGNOSTIC ===');
  
  return results;
}

// Export to window
if (typeof window !== 'undefined') {
  window.diagnoseUserIdAndMessages = diagnoseUserIdAndMessages;
  console.log('✅ DIAGNOSTIC: diagnoseUserIdAndMessages() available');
}

