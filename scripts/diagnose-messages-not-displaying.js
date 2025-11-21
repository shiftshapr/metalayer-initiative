/**
 * DIAGNOSTIC: Messages Not Displaying on google.com
 * 
 * This script diagnoses why messages are not being displayed on google.com:
 * 1. Checks if google.com page is being detected/processed
 * 2. Checks community resolution (active communities)
 * 3. Checks if loadChatHistory is being called
 * 4. Checks if messages are being loaded but not displayed
 * 5. Checks DOM elements for message display
 * 6. Checks Supabase real-time connection
 * 
 * Run in browser console on extension sidepanel while on google.com
 */

async function diagnoseMessagesNotDisplaying() {
  console.log('🔍 ===== MESSAGES NOT DISPLAYING DIAGNOSTIC =====');
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    rootCauses: [],
    recommendations: []
  };

  // CHECK 1: Current Page Detection
  console.log('\n1️⃣ Checking Current Page Detection...');
  results.checks.pageDetection = {
    currentUrl: window.location.href,
    isGoogleCom: window.location.hostname.includes('google.com'),
    stateManagerAvailable: typeof window.stateManagerInstance !== 'undefined',
    currentUrlData: null,
    pageId: null
  };

  if (results.checks.pageDetection.stateManagerAvailable) {
    const urlData = window.stateManagerInstance.getState('currentUrlData');
    results.checks.pageDetection.currentUrlData = urlData;
    if (urlData) {
      results.checks.pageDetection.pageId = urlData.pageId;
      console.log(`   📋 Current URL from stateManager: ${urlData.rawUrl || urlData.normalizedUrl}`);
      console.log(`   📋 Page ID: ${urlData.pageId || 'MISSING'}`);
      console.log(`   📋 Is google.com: ${urlData.rawUrl?.includes('google.com') || urlData.normalizedUrl?.includes('google.com') || false}`);
    } else {
      console.log('   ❌ currentUrlData is null/undefined in stateManager');
      results.rootCauses.push('currentUrlData is not set in stateManager - page may not be detected');
    }
  } else {
    console.log('   ❌ window.stateManagerInstance is not available');
    results.rootCauses.push('StateManager is not available');
  }

  // CHECK 2: Community Resolution
  console.log('\n2️⃣ Checking Community Resolution...');
  results.checks.communities = {
    communitiesModuleAvailable: typeof window.communitiesModule !== 'undefined',
    activeCommunities: null,
    primaryCommunity: null,
    currentCommunity: null
  };

  if (results.checks.communities.communitiesModuleAvailable) {
    try {
      // Try to get active communities from stateManager
      const uiState = window.stateManagerInstance.getState('ui');
      if (uiState && typeof uiState === 'object') {
        results.checks.communities.activeCommunities = (uiState as { activeCommunities?: unknown[] }).activeCommunities;
        results.checks.communities.primaryCommunity = (uiState as { primaryCommunity?: unknown }).primaryCommunity;
        results.checks.communities.currentCommunity = (uiState as { currentCommunity?: unknown }).currentCommunity;
      }
      console.log(`   📋 Active communities: ${results.checks.communities.activeCommunities ? results.checks.communities.activeCommunities.length : 0}`);
      console.log(`   📋 Primary community: ${results.checks.communities.primaryCommunity ? 'Set' : 'Missing'}`);
      console.log(`   📋 Current community: ${results.checks.communities.currentCommunity ? 'Set' : 'Missing'}`);
      
      if (!results.checks.communities.activeCommunities || results.checks.communities.activeCommunities.length === 0) {
        console.log('   ❌ No active communities found');
        results.rootCauses.push('No active communities available - loadChatHistory requires active communities');
      }
    } catch (error) {
      console.log(`   ❌ Error checking communities: ${error.message}`);
      results.rootCauses.push(`Error checking communities: ${error.message}`);
    }
  } else {
    console.log('   ⚠️ window.communitiesModule is not available (may be normal)');
  }

  // CHECK 3: loadChatHistory Function
  console.log('\n3️⃣ Checking loadChatHistory Function...');
  results.checks.loadChatHistory = {
    available: typeof window.loadChatHistory === 'function' || typeof window.canopiModule !== 'undefined',
    called: false,
    error: null
  };

  // Check if CanopiModule is available
  const canopiModule = window.canopiModule || (window as unknown as { CanopiModule?: { loadChatHistory?: () => Promise<unknown> } }).CanopiModule;
  if (canopiModule && typeof canopiModule.loadChatHistory === 'function') {
    console.log('   ✅ loadChatHistory function is available');
    results.checks.loadChatHistory.available = true;
    
    // Try to call it and see what happens
    try {
      console.log('   🔧 Attempting to call loadChatHistory...');
      const result = await canopiModule.loadChatHistory();
      console.log('   ✅ loadChatHistory called successfully');
      console.log('   📋 Result:', result);
      results.checks.loadChatHistory.called = true;
    } catch (error) {
      console.log(`   ❌ Error calling loadChatHistory: ${error.message}`);
      results.checks.loadChatHistory.error = error.message;
      results.rootCauses.push(`loadChatHistory failed: ${error.message}`);
    }
  } else {
    console.log('   ❌ loadChatHistory function is not available');
    results.rootCauses.push('loadChatHistory function is not available');
  }

  // CHECK 4: Message Display DOM Elements
  console.log('\n4️⃣ Checking Message Display DOM Elements...');
  const chatContainer = document.getElementById('chat-container') || document.querySelector('.chat-container');
  const messagesContainer = document.getElementById('messages-container') || document.querySelector('.messages-container') || document.querySelector('#messages');
  const messageElements = document.querySelectorAll('.message, .chat-message, [data-message-id]');
  
  results.checks.dom = {
    chatContainer: !!chatContainer,
    messagesContainer: !!messagesContainer,
    messageElements: messageElements.length,
    chatContainerVisible: false,
    messagesContainerVisible: false
  };

  if (chatContainer) {
    const style = window.getComputedStyle(chatContainer);
    results.checks.dom.chatContainerVisible = style.display !== 'none' && style.visibility !== 'hidden';
  }
  if (messagesContainer) {
    const style = window.getComputedStyle(messagesContainer);
    results.checks.dom.messagesContainerVisible = style.display !== 'none' && style.visibility !== 'hidden';
  }

  console.log(`   ${results.checks.dom.chatContainer ? '✅' : '❌'} Chat container: ${results.checks.dom.chatContainer ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.messagesContainer ? '✅' : '❌'} Messages container: ${results.checks.dom.messagesContainer ? 'Found' : 'Missing'}`);
  console.log(`   📋 Message elements in DOM: ${results.checks.dom.messageElements}`);
  console.log(`   📋 Chat container visible: ${results.checks.dom.chatContainerVisible}`);
  console.log(`   📋 Messages container visible: ${results.checks.dom.messagesContainerVisible}`);

  if (!results.checks.dom.chatContainer && !results.checks.dom.messagesContainer) {
    results.rootCauses.push('Message display containers not found in DOM');
  }
  if (results.checks.dom.messageElements === 0) {
    results.rootCauses.push('No message elements found in DOM - messages may not be loaded or rendered');
  }

  // CHECK 5: StateManager Chat Data
  console.log('\n5️⃣ Checking StateManager Chat Data...');
  results.checks.chatData = {
    chatState: null,
    messages: null,
    messageCount: 0,
    lastLoadedUri: null
  };

  if (results.checks.pageDetection.stateManagerAvailable) {
    const chatState = window.stateManagerInstance.getState('chat');
    if (chatState && typeof chatState === 'object') {
      results.checks.chatData.chatState = chatState;
      results.checks.chatData.messages = (chatState as { data?: unknown[] }).data;
      results.checks.chatData.messageCount = results.checks.chatData.messages ? results.checks.chatData.messages.length : 0;
      results.checks.chatData.lastLoadedUri = (chatState as { lastLoadedUri?: string }).lastLoadedUri;
      
      console.log(`   📋 Messages in stateManager: ${results.checks.chatData.messageCount}`);
      console.log(`   📋 Last loaded URI: ${results.checks.chatData.lastLoadedUri || 'None'}`);
      
      if (results.checks.chatData.messageCount === 0) {
        console.log('   ⚠️ No messages in stateManager');
        results.rootCauses.push('No messages loaded in stateManager - loadChatHistory may not have loaded messages');
      } else {
        console.log('   ✅ Messages are loaded in stateManager');
      }
    } else {
      console.log('   ❌ Chat state is null/undefined');
      results.rootCauses.push('Chat state is not set in stateManager');
    }
  }

  // CHECK 6: Supabase Real-time Connection
  console.log('\n6️⃣ Checking Supabase Real-time Connection...');
  results.checks.supabase = {
    supabaseAvailable: typeof window.supabase !== 'undefined',
    realtimeClientAvailable: typeof window.supabaseRealtimeClient !== 'undefined',
    isConnected: false,
    currentPage: null
  };

  if (results.checks.supabase.realtimeClientAvailable) {
    const realtimeClient = (window as unknown as { supabaseRealtimeClient?: { currentPage?: string; isConnected?: boolean } }).supabaseRealtimeClient;
    if (realtimeClient) {
      results.checks.supabase.isConnected = realtimeClient.isConnected || false;
      results.checks.supabase.currentPage = realtimeClient.currentPage || null;
      console.log(`   📋 Real-time connected: ${results.checks.supabase.isConnected}`);
      console.log(`   📋 Current page: ${results.checks.supabase.currentPage || 'None'}`);
      
      if (!results.checks.supabase.isConnected) {
        results.rootCauses.push('Supabase real-time client is not connected');
      }
      if (results.checks.supabase.currentPage && !results.checks.supabase.currentPage.includes('google')) {
        console.log(`   ⚠️ Real-time client is connected to different page: ${results.checks.supabase.currentPage}`);
        results.rootCauses.push(`Real-time client connected to wrong page: ${results.checks.supabase.currentPage}`);
      }
    }
  } else {
    console.log('   ⚠️ Supabase real-time client is not available');
  }

  // CHECK 7: Console Errors
  console.log('\n7️⃣ Checking for Console Errors...');
  results.checks.errors = {
    note: 'Check browser console for errors related to loadChatHistory, community resolution, or message rendering'
  };
  console.log('   📋 Check browser console for any errors');

  // ROOT CAUSE ANALYSIS
  console.log('\n🔍 ===== ROOT CAUSE ANALYSIS =====');
  if (results.rootCauses.length === 0) {
    console.log('   ✅ No obvious root causes identified');
    console.log('   📋 Messages should be displaying. Check browser console for runtime errors.');
  } else {
    results.rootCauses.forEach((cause, i) => {
      console.log(`\n   ${i + 1}. ${cause}`);
    });
  }

  // RECOMMENDATIONS
  console.log('\n💡 ===== RECOMMENDATIONS =====');
  if (results.rootCauses.some(c => c.includes('active communities'))) {
    results.recommendations.push('Fix community resolution - ensure active communities are set before calling loadChatHistory');
  }
  if (results.rootCauses.some(c => c.includes('currentUrlData'))) {
    results.recommendations.push('Fix page detection - ensure google.com is properly detected and currentUrlData is set');
  }
  if (results.rootCauses.some(c => c.includes('loadChatHistory'))) {
    results.recommendations.push('Fix loadChatHistory - check why it\'s failing or not being called');
  }
  if (results.rootCauses.some(c => c.includes('messages loaded'))) {
    results.recommendations.push('Fix message loading - ensure loadChatHistory successfully loads messages from API/database');
  }
  if (results.rootCauses.some(c => c.includes('DOM'))) {
    results.recommendations.push('Fix DOM rendering - ensure message containers exist and messages are rendered');
  }
  if (results.rootCauses.some(c => c.includes('real-time'))) {
    results.recommendations.push('Fix Supabase real-time connection - ensure client is connected to correct page');
  }

  results.recommendations.forEach((rec, i) => {
    console.log(`\n   ${i + 1}. ${rec}`);
  });

  console.log('\n✅ ===== DIAGNOSTIC COMPLETE =====');
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.diagnoseMessagesNotDisplaying = diagnoseMessagesNotDisplaying;
  console.log('✅ Messages Not Displaying Diagnostic loaded! Run: window.diagnoseMessagesNotDisplaying()');
}


