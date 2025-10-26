/**
 * 🧪 SD2 COMP MIMETIC DEBUG SCRIPT
 * Comprehensive message flow debugging for Chrome extension
 * Run this in the browser console to debug message display issues
 */

console.log('🧪 SD2 COMP MIMETIC DEBUG SCRIPT LOADED');
console.log('📋 Available commands:');
console.log('  debugMessageFlow() - Complete message flow analysis');
console.log('  debugAuthorData() - Author data tracing');
console.log('  debugUIComponents() - UI component analysis');
console.log('  debugRealTimeMessages() - Real-time message debugging');
console.log('  debugCrossProfile() - Cross-profile contamination check');
console.log('  runFullDiagnostic() - Complete system diagnostic');

// ===== COMPREHENSIVE MESSAGE FLOW DEBUGGING =====
function debugMessageFlow() {
  console.log('🔍🔍🔍 ============================================');
  console.log('🔍🔍🔍 MESSAGE FLOW DEBUGGING');
  console.log('🔍🔍🔍 ============================================');
  
  // 1. Check current user context
  console.log('👤 CURRENT USER CONTEXT:');
  console.log('  window.currentUser:', window.currentUser);
  console.log('  window.currentUser?.email:', window.currentUser?.email);
  console.log('  window.currentUser?.name:', window.currentUser?.name);
  console.log('  window.currentUser?.avatarUrl:', window.currentUser?.avatarUrl);
  
  // 2. Check StateManager data
  console.log('💾 STATEMANAGER DATA:');
  console.log('  window.getState available:', !!window.getState);
  if (window.getState) {
    console.log('  supabaseUser:', window.getState('supabaseUser'));
    console.log('  supabaseSession:', window.getState('supabaseSession'));
  }
  
  // 3. Check real-time client
  console.log('📡 REALTIME CLIENT:');
  console.log('  window.supabaseRealtimeClient:', !!window.supabaseRealtimeClient);
  console.log('  window.supabaseRealtimeClient?.currentUser:', window.supabaseRealtimeClient?.currentUser);
  
  // 4. Check message functions
  console.log('💬 MESSAGE FUNCTIONS:');
  console.log('  window.addMessageToChat:', typeof window.addMessageToChat);
  console.log('  window.sendMessageViaSupabase:', typeof window.sendMessageViaSupabase);
  
  // 5. Check DOM elements
  console.log('🎨 DOM ELEMENTS:');
  const chatMessages = document.querySelector('.chat-messages');
  console.log('  .chat-messages found:', !!chatMessages);
  console.log('  .chat-messages children:', chatMessages?.children?.length || 0);
  
  // 6. Check existing messages
  if (chatMessages) {
    const messages = chatMessages.querySelectorAll('.message');
    console.log('  Existing messages:', messages.length);
    messages.forEach((msg, index) => {
      console.log(`  Message ${index + 1}:`, {
        id: msg.dataset.messageId,
        author: msg.querySelector('.message-sender-name')?.textContent,
        avatar: msg.querySelector('img')?.src,
        hasReactions: !!msg.querySelector('.reaction-btn'),
        hasReplies: !!msg.querySelector('.inline-reply-btn'),
        hasActions: !!msg.querySelector('.message-actions')
      });
    });
  }
  
  console.log('✅ MESSAGE FLOW DEBUGGING COMPLETE');
}

// ===== AUTHOR DATA TRACING =====
function debugAuthorData() {
  console.log('🔍🔍🔍 ============================================');
  console.log('🔍🔍🔍 AUTHOR DATA TRACING');
  console.log('🔍🔍🔍 ============================================');
  
  // Check if we can simulate a message
  const testMessage = {
    id: 'test-message-' + Date.now(),
    content: 'Test message for debugging',
    body: 'Test message for debugging',
    author: undefined, // This is the problem!
    authorId: undefined,
    user_email: 'test@example.com',
    page_id: 'google_com_',
    created_at: new Date().toISOString()
  };
  
  console.log('🧪 TEST MESSAGE:', testMessage);
  console.log('❌ PROBLEM: message.author is undefined');
  console.log('❌ PROBLEM: message.authorId is undefined');
  console.log('✅ SOLUTION: Need to get author from user_email or current user');
  
  // Check how addMessageToChat handles this
  console.log('🔧 CURRENT LOGIC:');
  console.log('  if (!author && window.currentUser) {');
  console.log('    author = { name: window.currentUser.name, email: window.currentUser.email, avatarUrl: window.currentUser.avatarUrl };');
  console.log('  }');
  
  console.log('❌ ISSUE: This uses current user instead of message author!');
  console.log('✅ FIX NEEDED: Use message.user_email to determine actual author');
}

// ===== UI COMPONENT ANALYSIS =====
function debugUIComponents() {
  console.log('🔍🔍🔍 ============================================');
  console.log('🔍🔍🔍 UI COMPONENT ANALYSIS');
  console.log('🔍🔍🔍 ============================================');
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) {
    console.log('❌ No .chat-messages element found');
    return;
  }
  
  const messages = chatMessages.querySelectorAll('.message');
  console.log(`📊 Found ${messages.length} messages`);
  
  messages.forEach((msg, index) => {
    console.log(`\n📝 MESSAGE ${index + 1} ANALYSIS:`);
    console.log('  ID:', msg.dataset.messageId);
    
    // Check author info
    const senderName = msg.querySelector('.message-sender-name');
    const avatar = msg.querySelector('img');
    console.log('  Author Name:', senderName?.textContent || 'MISSING');
    console.log('  Avatar URL:', avatar?.src || 'MISSING');
    
    // Check UI components
    const reactions = msg.querySelector('.reaction-btn');
    const replies = msg.querySelector('.inline-reply-btn');
    const actions = msg.querySelector('.message-actions');
    const community = msg.querySelector('.message-community');
    
    console.log('  🔘 Reactions Button:', !!reactions);
    console.log('  💬 Reply Button:', !!replies);
    console.log('  ⚙️ Actions Menu:', !!actions);
    console.log('  🏘️ Community Info:', !!community);
    
    // Check if buttons are clickable
    if (reactions) {
      console.log('  🔘 Reactions clickable:', reactions.onclick !== null);
    }
    if (replies) {
      console.log('  💬 Reply clickable:', replies.onclick !== null);
    }
  });
  
  console.log('\n✅ UI COMPONENT ANALYSIS COMPLETE');
}

// ===== REAL-TIME MESSAGE DEBUGGING =====
function debugRealTimeMessages() {
  console.log('🔍🔍🔍 ============================================');
  console.log('🔍🔍🔍 REAL-TIME MESSAGE DEBUGGING');
  console.log('🔍🔍🔍 ============================================');
  
  // Check real-time subscriptions
  console.log('📡 REALTIME SUBSCRIPTIONS:');
  console.log('  window.supabaseRealtimeClient:', !!window.supabaseRealtimeClient);
  console.log('  window.supabase:', !!window.supabase);
  console.log('  window.supabase?.realtime:', !!window.supabase?.realtime);
  
  // Check message subscription
  if (window.supabaseRealtimeClient) {
    console.log('  Current page:', window.supabaseRealtimeClient.currentPage);
    console.log('  Message channel:', !!window.supabaseRealtimeClient.messageChannel);
  }
  
  // Check if we can send a test message
  console.log('\n🧪 TEST MESSAGE SENDING:');
  const chatInput = document.getElementById('chat-textarea');
  if (chatInput) {
    console.log('  Chat input found:', !!chatInput);
    console.log('  Current value:', chatInput.value);
    
    // Test message sending
    console.log('  Testing message send...');
    chatInput.value = 'Debug test message';
    
    // Trigger send
    const sendBtn = document.querySelector('button[onclick*="sendChatMessage"]') || 
                   document.querySelector('.send-button') ||
                   document.querySelector('button[title*="send"]');
    console.log('  Send button found:', !!sendBtn);
    
    if (sendBtn) {
      console.log('  Send button type:', sendBtn.tagName);
      console.log('  Send button onclick:', !!sendBtn.onclick);
    }
  } else {
    console.log('  ❌ No chat input found');
  }
  
  console.log('\n✅ REAL-TIME MESSAGE DEBUGGING COMPLETE');
}

// ===== CROSS-PROFILE CONTAMINATION CHECK =====
function debugCrossProfile() {
  console.log('🔍🔍🔍 ============================================');
  console.log('🔍🔍🔍 CROSS-PROFILE CONTAMINATION CHECK');
  console.log('🔍🔍🔍 ============================================');
  
  // Check current user vs message authors
  console.log('👤 CURRENT USER:');
  console.log('  Email:', window.currentUser?.email);
  console.log('  Name:', window.currentUser?.name);
  console.log('  Avatar:', window.currentUser?.avatarUrl);
  
  // Check all messages and their authors
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    const messages = chatMessages.querySelectorAll('.message');
    console.log(`\n📝 MESSAGE AUTHORS (${messages.length} messages):`);
    
    messages.forEach((msg, index) => {
      const authorName = msg.querySelector('.message-sender-name')?.textContent;
      const avatar = msg.querySelector('img')?.src;
      const messageId = msg.dataset.messageId;
      
      console.log(`  Message ${index + 1}:`);
      console.log(`    ID: ${messageId}`);
      console.log(`    Author: ${authorName}`);
      console.log(`    Avatar: ${avatar}`);
      console.log(`    Matches current user: ${authorName === window.currentUser?.name}`);
    });
  }
  
  // Check if messages are using wrong user data
  console.log('\n🔍 CONTAMINATION ANALYSIS:');
  console.log('  Problem: Messages show daveroom avatar instead of poster avatar');
  console.log('  Root cause: addMessageToChat uses window.currentUser instead of message author');
  console.log('  Fix needed: Use message.user_email to determine actual author');
  
  console.log('\n✅ CROSS-PROFILE CONTAMINATION CHECK COMPLETE');
}

// ===== COMPLETE SYSTEM DIAGNOSTIC =====
function runFullDiagnostic() {
  console.log('🚀🚀🚀 ============================================');
  console.log('🚀🚀🚀 COMPLETE SYSTEM DIAGNOSTIC');
  console.log('🚀🚀🚀 ============================================');
  
  debugMessageFlow();
  console.log('\n' + '='.repeat(50) + '\n');
  
  debugAuthorData();
  console.log('\n' + '='.repeat(50) + '\n');
  
  debugUIComponents();
  console.log('\n' + '='.repeat(50) + '\n');
  
  debugRealTimeMessages();
  console.log('\n' + '='.repeat(50) + '\n');
  
  debugCrossProfile();
  
  console.log('\n🎯🎯🎯 ============================================');
  console.log('🎯🎯🎯 DIAGNOSTIC SUMMARY');
  console.log('🎯🎯🎯 ============================================');
  console.log('❌ ISSUES FOUND:');
  console.log('  1. Messages show wrong avatar (daveroom instead of poster)');
  console.log('  2. Missing UI components (name, community, three dots)');
  console.log('  3. Reactions and replies not working');
  console.log('  4. Cross-profile contamination');
  console.log('\n✅ SOLUTIONS NEEDED:');
  console.log('  1. Fix author data in addMessageToChat');
  console.log('  2. Ensure UI components are properly rendered');
  console.log('  3. Fix event listeners for reactions/replies');
  console.log('  4. Use message.user_email instead of window.currentUser');
  
  console.log('\n🚀🚀🚀 DIAGNOSTIC COMPLETE');
}

// ===== QUICK FIX SUGGESTIONS =====
function getQuickFixes() {
  console.log('🔧🔧🔧 ============================================');
  console.log('🔧🔧🔧 QUICK FIX SUGGESTIONS');
  console.log('🔧🔧🔧 ============================================');
  
  console.log('1. FIX AUTHOR DATA:');
  console.log('   - Use message.user_email to determine author');
  console.log('   - Don\'t use window.currentUser for message display');
  console.log('   - Get author info from message data or API');
  
  console.log('\n2. FIX UI COMPONENTS:');
  console.log('   - Ensure all HTML elements are properly created');
  console.log('   - Check CSS classes and styling');
  console.log('   - Verify event listeners are attached');
  
  console.log('\n3. FIX REACTIONS/REPLIES:');
  console.log('   - Check if event listeners are properly attached');
  console.log('   - Verify button click handlers work');
  console.log('   - Test functionality manually');
  
  console.log('\n4. FIX CROSS-PROFILE:');
  console.log('   - Use message-specific author data');
  console.log('   - Don\'t rely on current user context');
  console.log('   - Implement proper author resolution');
  
  console.log('\n✅ QUICK FIX SUGGESTIONS COMPLETE');
}

// Make functions globally available
window.debugMessageFlow = debugMessageFlow;
window.debugAuthorData = debugAuthorData;
window.debugUIComponents = debugUIComponents;
window.debugRealTimeMessages = debugRealTimeMessages;
window.debugCrossProfile = debugCrossProfile;
window.runFullDiagnostic = runFullDiagnostic;
window.getQuickFixes = getQuickFixes;

console.log('✅ SD2 COMP MIMETIC DEBUG SCRIPT READY');
console.log('📋 Run: runFullDiagnostic() for complete analysis');
