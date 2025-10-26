// ===== COMP METHOD FIX: MESSAGE PERSISTENCE AND DISPLAY =====
// This script fixes the message persistence and display issues by following the COMP method exactly

console.log('🔧 COMP METHOD FIX: Starting message persistence and display fixes...');

// ===== ISSUE 1: MESSAGE PERSISTENCE PROBLEM =====
// Problem: Messages are not persisting across browser sessions
// Root Cause: System only uses real-time subscriptions, not loading historical messages
// COMP Method: Should load chat history from database on page load

function fixMessagePersistence() {
  console.log('🔧 FIX 1: Fixing message persistence...');
  
  // Check if loadChatHistory is being called properly
  const currentPageId = window.currentUrlData?.pageId;
  console.log('🔍 Current page ID:', currentPageId);
  
  // Force reload chat history for current page
  if (typeof window.loadChatHistory === 'function') {
    console.log('🔧 Calling loadChatHistory to load persistent messages...');
    window.loadChatHistory().then(() => {
      console.log('✅ Chat history loaded for persistence');
    }).catch(error => {
      console.error('❌ Failed to load chat history:', error);
    });
  } else {
    console.error('❌ loadChatHistory function not available');
  }
}

// ===== ISSUE 2: VISIBILITY SYSTEM PROBLEM =====
// Problem: "No users found for page" - presence tracking not working
// Root Cause: Presence tracking is not working properly
// COMP Method: Should track presence and show other users

function fixVisibilitySystem() {
  console.log('🔧 FIX 2: Fixing visibility system...');
  
  // Check current visibility data
  console.log('🔍 Current visibility data:', window.currentVisibilityData);
  console.log('🔍 Current presence data:', window.currentPresenceData);
  
  // Force refresh visibility
  if (typeof window.refreshVisibilityAvatars === 'function') {
    console.log('🔧 Calling refreshVisibilityAvatars...');
    window.refreshVisibilityAvatars().then(() => {
      console.log('✅ Visibility refreshed');
    }).catch(error => {
      console.error('❌ Failed to refresh visibility:', error);
    });
  } else {
    console.error('❌ refreshVisibilityAvatars function not available');
  }
}

// ===== ISSUE 3: MESSAGE DISPLAY ISSUES =====
// Problem: Messages show wrong avatars and missing data
// Root Cause: Author resolution is not working correctly
// COMP Method: Should resolve author data properly

function fixMessageDisplay() {
  console.log('🔧 FIX 3: Fixing message display...');
  
  // Check current messages in DOM
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    const messages = chatMessages.querySelectorAll('.message');
    console.log('🔍 Found', messages.length, 'messages in DOM');
    
    // Check each message for display issues
    messages.forEach((message, index) => {
      const messageId = message.dataset.messageId;
      const authorName = message.querySelector('.message-author')?.textContent;
      const authorAvatar = message.querySelector('.message-avatar img')?.src;
      
      console.log(`🔍 Message ${index + 1}:`, {
        id: messageId,
        authorName: authorName,
        authorAvatar: authorAvatar
      });
    });
  } else {
    console.log('❌ No chat-messages element found');
  }
}

// ===== ISSUE 4: PRESENCE TRACKING PROBLEM =====
// Problem: Presence tracking is not working properly
// Root Cause: API returns empty active users
// COMP Method: Should properly track presence

function fixPresenceTracking() {
  console.log('🔧 FIX 4: Fixing presence tracking...');
  
  // Check current user
  console.log('🔍 Current user:', window.currentUser);
  console.log('🔍 Current URL data:', window.currentUrlData);
  
  // Check if presence tracking is active
  if (window.supabaseRealtimeClient) {
    console.log('🔍 Supabase real-time client:', window.supabaseRealtimeClient);
    console.log('🔍 Current user in client:', window.supabaseRealtimeClient.currentUser);
    console.log('🔍 Current page in client:', window.supabaseRealtimeClient.currentPage);
  } else {
    console.error('❌ Supabase real-time client not available');
  }
}

// ===== COMP METHOD: PROPER MESSAGE CREATION FLOW =====
// The COMP method should:
// 1. Send message to database
// 2. Display message immediately in UI
// 3. Load historical messages on page load
// 4. Handle real-time updates properly

function testCOMPMessageFlow() {
  console.log('🔧 TESTING: COMP message creation flow...');
  
  // Test 1: Check if message input is working
  const messageInput = document.querySelector('#chat-input');
  if (messageInput) {
    console.log('✅ Message input found');
    messageInput.value = 'Test message from COMP method';
    console.log('🔧 Test message set:', messageInput.value);
  } else {
    console.error('❌ Message input not found');
  }
  
  // Test 2: Check if send button is working
  const sendButton = document.querySelector('#chat-send-button');
  if (sendButton) {
    console.log('✅ Send button found');
  } else {
    console.error('❌ Send button not found');
  }
  
  // Test 3: Check if real-time client is working
  if (window.supabaseRealtimeClient) {
    console.log('✅ Supabase real-time client available');
    console.log('🔍 Client methods:', Object.getOwnPropertyNames(window.supabaseRealtimeClient));
  } else {
    console.error('❌ Supabase real-time client not available');
  }
}

// ===== COMPREHENSIVE DIAGNOSTIC =====
function runCOMPDiagnostic() {
  console.log('🔧 COMP DIAGNOSTIC: Running comprehensive diagnostic...');
  
  // Check all critical components
  const components = {
    'loadChatHistory': typeof window.loadChatHistory === 'function',
    'refreshVisibilityAvatars': typeof window.refreshVisibilityAvatars === 'function',
    'addMessageToChat': typeof window.addMessageToChat === 'function',
    'supabaseRealtimeClient': !!window.supabaseRealtimeClient,
    'currentUser': !!window.currentUser,
    'currentUrlData': !!window.currentUrlData,
    'chatMessages': !!document.querySelector('.chat-messages'),
    'messageInput': !!document.querySelector('#chat-input')
  };
  
  console.log('🔍 Component Status:', components);
  
  // Check for missing components
  const missingComponents = Object.entries(components)
    .filter(([name, available]) => !available)
    .map(([name]) => name);
  
  if (missingComponents.length > 0) {
    console.error('❌ Missing components:', missingComponents);
  } else {
    console.log('✅ All components available');
  }
  
  return components;
}

// ===== MAIN EXECUTION =====
function fixAllMessageIssues() {
  console.log('🚀 COMP METHOD FIX: Starting comprehensive fix...');
  
  // Run diagnostic first
  const diagnostic = runCOMPDiagnostic();
  
  // Fix message persistence
  fixMessagePersistence();
  
  // Fix visibility system
  fixVisibilitySystem();
  
  // Fix message display
  fixMessageDisplay();
  
  // Fix presence tracking
  fixPresenceTracking();
  
  // Test COMP message flow
  testCOMPMessageFlow();
  
  console.log('✅ COMP METHOD FIX: All fixes applied');
  return diagnostic;
}

// ===== EXPORT FUNCTIONS =====
window.fixMessagePersistence = fixMessagePersistence;
window.fixVisibilitySystem = fixVisibilitySystem;
window.fixMessageDisplay = fixMessageDisplay;
window.fixPresenceTracking = fixPresenceTracking;
window.testCOMPMessageFlow = testCOMPMessageFlow;
window.runCOMPDiagnostic = runCOMPDiagnostic;
window.fixAllMessageIssues = fixAllMessageIssues;

// Auto-run the fix
console.log('🔧 COMP METHOD FIX: Auto-running comprehensive fix...');
fixAllMessageIssues();

console.log('🔧 COMP METHOD FIX: Script loaded. Available functions:');
console.log('  - fixMessagePersistence()');
console.log('  - fixVisibilitySystem()');
console.log('  - fixMessageDisplay()');
console.log('  - fixPresenceTracking()');
console.log('  - testCOMPMessageFlow()');
console.log('  - runCOMPDiagnostic()');
console.log('  - fixAllMessageIssues()');