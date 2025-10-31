/**
 * MESSAGE SYSTEM DIAGNOSTIC CODE
 * Run this in the browser console to diagnose message loading issues
 */

console.log('🔍 MESSAGE DIAGNOSTIC: Starting comprehensive message system diagnostic...');

// Diagnostic function to check message system components
async function diagnoseMessageSystem() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔍 MESSAGE DIAGNOSTIC: MESSAGE SYSTEM ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════');
  
  // 1. Check CanopiModule availability
  console.log('\n📊 STEP 1: CanopiModule Analysis');
  console.log('───────────────────────────────────────────────────────────');
  console.log('window.CanopiModule:', typeof window.CanopiModule);
  console.log('window.loadChatHistory:', typeof window.loadChatHistory);
  console.log('window.addMessageToChat:', typeof window.addMessageToChat);
  console.log('window.sendMessageViaSupabase:', typeof window.sendMessageViaSupabase);
  
  if (typeof window.loadChatHistory === 'function') {
    console.log('✅ loadChatHistory is available');
  } else {
    console.log('❌ loadChatHistory is NOT available - this is the root cause!');
  }
  
  // 2. Check Supabase client availability
  console.log('\n📊 STEP 2: Supabase Client Analysis');
  console.log('───────────────────────────────────────────────────────────');
  console.log('window.supabaseRealtimeClient:', typeof window.supabaseRealtimeClient);
  console.log('window.supabase:', typeof window.supabase);
  
  if (window.supabaseRealtimeClient) {
    console.log('✅ Supabase realtime client is available');
    console.log('Client methods:', Object.getOwnPropertyNames(window.supabaseRealtimeClient));
  } else {
    console.log('❌ Supabase realtime client is NOT available');
  }
  
  // 3. Check current page data
  console.log('\n📊 STEP 3: Current Page Data Analysis');
  console.log('───────────────────────────────────────────────────────────');
  console.log('window.currentUrlData:', window.currentUrlData);
  console.log('Current URL:', window.location.href);
  
  if (window.currentUrlData) {
    console.log('✅ Current URL data is available');
    console.log('Page ID:', window.currentUrlData.pageId);
    console.log('Normalized URL:', window.currentUrlData.normalizedUrl);
  } else {
    console.log('❌ Current URL data is NOT available');
  }
  
  // 4. Check authentication
  console.log('\n📊 STEP 4: Authentication Analysis');
  console.log('───────────────────────────────────────────────────────────');
  console.log('window.currentUser:', window.currentUser);
  console.log('window.authManager:', typeof window.authManager);
  
  if (window.currentUser) {
    console.log('✅ User is authenticated');
    console.log('User email:', window.currentUser.email);
    console.log('User name:', window.currentUser.name);
  } else {
    console.log('❌ User is NOT authenticated');
  }
  
  // 5. Check communities
  console.log('\n📊 STEP 5: Communities Analysis');
  console.log('───────────────────────────────────────────────────────────');
  console.log('window.StateManager:', typeof window.StateManager);
  
  if (window.StateManager) {
    try {
      const activeCommunities = await window.StateManager.get('activeCommunities');
      const communities = await window.StateManager.get('communities');
      console.log('✅ StateManager is available');
      console.log('Active communities:', activeCommunities);
      console.log('Communities:', communities);
    } catch (error) {
      console.log('❌ Error accessing StateManager:', error);
    }
  } else {
    console.log('❌ StateManager is NOT available');
  }
  
  // 6. Test loadChatHistory if available
  console.log('\n📊 STEP 6: LoadChatHistory Test');
  console.log('───────────────────────────────────────────────────────────');
  
  if (typeof window.loadChatHistory === 'function') {
    console.log('Testing loadChatHistory...');
    try {
      await window.loadChatHistory();
      console.log('✅ loadChatHistory executed successfully');
      
      // Check if messages were loaded
      const messages = document.querySelectorAll('.message');
      console.log('Messages found in DOM:', messages.length);
      
      if (messages.length > 0) {
        console.log('✅ Messages are displaying correctly');
      } else {
        console.log('⚠️ No messages found in DOM - may be empty or loading issue');
      }
    } catch (error) {
      console.error('❌ Error executing loadChatHistory:', error);
    }
  } else {
    console.log('❌ Cannot test loadChatHistory - function not available');
  }
  
  // 7. Check for JavaScript errors
  console.log('\n📊 STEP 7: JavaScript Error Analysis');
  console.log('───────────────────────────────────────────────────────────');
  
  // Override console.error to catch errors
  const originalError = console.error;
  const errors = [];
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Restore after a short delay
  setTimeout(() => {
    console.error = originalError;
    if (errors.length > 0) {
      console.log('❌ JavaScript errors detected:', errors);
    } else {
      console.log('✅ No JavaScript errors detected');
    }
  }, 1000);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔍 MESSAGE DIAGNOSTIC: Analysis complete');
  console.log('═══════════════════════════════════════════════════════════');
}

// Function to test message sending
async function testMessageSending() {
  console.log('\n🧪 MESSAGE TEST: Testing message sending...');
  
  if (typeof window.sendMessageViaSupabase === 'function') {
    console.log('✅ sendMessageViaSupabase is available');
    
    try {
      const testMessage = `Test message at ${new Date().toISOString()}`;
      console.log('Sending test message:', testMessage);
      
      const result = await window.sendMessageViaSupabase(testMessage);
      if (result) {
        console.log('✅ Test message sent successfully');
        console.log('Result:', result);
      } else {
        console.log('❌ Test message failed to send');
      }
    } catch (error) {
      console.error('❌ Error sending test message:', error);
    }
  } else {
    console.log('❌ sendMessageViaSupabase is NOT available');
  }
}

// Function to check script loading order
function checkScriptLoading() {
  console.log('\n📜 SCRIPT LOADING: Checking script loading order...');
  
  const scripts = Array.from(document.scripts);
  console.log('Total scripts loaded:', scripts.length);
  
  const canopiScript = scripts.find(script => script.src.includes('CanopiModule.js'));
  const communitiesScript = scripts.find(script => script.src.includes('CommunitiesModule.js'));
  const sidepanelScript = scripts.find(script => script.src.includes('sidepanel.js'));
  
  console.log('CanopiModule.js loaded:', !!canopiScript);
  console.log('CommunitiesModule.js loaded:', !!communitiesScript);
  console.log('sidepanel.js loaded:', !!sidepanelScript);
  
  if (canopiScript && communitiesScript) {
    const canopiIndex = scripts.indexOf(canopiScript);
    const communitiesIndex = scripts.indexOf(communitiesScript);
    
    if (canopiIndex < communitiesIndex) {
      console.log('✅ Script loading order is correct (CanopiModule before CommunitiesModule)');
    } else {
      console.log('❌ Script loading order is incorrect (CommunitiesModule before CanopiModule)');
    }
  }
}

// Main diagnostic function
async function runMessageDiagnostic() {
  await diagnoseMessageSystem();
  checkScriptLoading();
  await testMessageSending();
  
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('1. If loadChatHistory is not available, check for JavaScript errors in CanopiModule.js');
  console.log('2. Ensure SupabaseRealtimeClient is loaded before CanopiModule.js');
  console.log('3. Check that all dependencies are properly loaded');
  console.log('4. Verify that the user is authenticated');
  console.log('5. Check that communities are loaded');
  console.log('6. Test message sending functionality');
}

// Run the diagnostic
runMessageDiagnostic().catch(console.error);

console.log('🔍 MESSAGE DIAGNOSTIC: Diagnostic code loaded. Check console output above.');






