// presence/diagnose-page-tracking.js
// CRITICAL: Page Tracking Diagnostic Tool

console.log('🧪 DIAGNOSE_PAGE_TRACKING: Script file is loading...');

// Define functions directly on window object IMMEDIATELY
window.diagnosePageTracking = async function() {
  console.log('\n='.repeat(80));
  console.log('🧪 PAGE TRACKING DIAGNOSTIC');
  console.log('='.repeat(80) + '\n');

  const currentUser = window.supabaseRealtimeClient?.currentUser;
  if (!currentUser) {
    console.error('❌ No current user found in supabaseRealtimeClient');
    return;
  }

  console.log(`👤 Current User: ${currentUser.userEmail}`);
  console.log('\n' + '-'.repeat(80));

  // 1. Extension's internal state
  const extensionPageId = window.currentUrlData?.pageId;
  const extensionPageUrl = window.currentUrlData?.normalizedUrl;
  console.log('\n📍 1. EXTENSION INTERNAL STATE:');
  console.log(`   window.currentUrlData.pageId: ${extensionPageId}`);
  console.log(`   window.currentUrlData.normalizedUrl: ${extensionPageUrl}`);

  // 2. Realtime presence handler state
  const handlerPageId = window.realtimePresenceHandler?.currentPageId;
  const handlerPageUrl = window.realtimePresenceHandler?.currentPageUrl;
  console.log('\n📍 2. REALTIME PRESENCE HANDLER STATE:');
  console.log(`   realtimePresenceHandler.currentPageId: ${handlerPageId}`);
  console.log(`   realtimePresenceHandler.currentPageUrl: ${handlerPageUrl}`);

  // 3. Supabase realtime client state
  const clientPageId = window.supabaseRealtimeClient?.currentPage?.pageId;
  const clientPageUrl = window.supabaseRealtimeClient?.currentPage?.pageUrl;
  console.log('\n📍 3. SUPABASE REALTIME CLIENT STATE:');
  console.log(`   supabaseRealtimeClient.currentPage.pageId: ${clientPageId}`);
  console.log(`   supabaseRealtimeClient.currentPage.pageUrl: ${clientPageUrl}`);

  // 4. Query Supabase for current user's presence
  console.log('\n📍 4. SUPABASE DATABASE (user_presence table):');
  try {
    const { data: presenceData, error } = await window.supabaseRealtimeClient.supabase
      .from('user_presence')
      .select('*')
      .eq('user_email', currentUser.userEmail)
      .single();

    if (error) {
      console.error('   ❌ Error querying Supabase:', error);
    } else {
      console.log(`   page_id: ${presenceData.page_id}`);
      console.log(`   page_url: ${presenceData.page_url}`);
      console.log(`   is_active: ${presenceData.is_active}`);
      console.log(`   last_seen: ${presenceData.last_seen}`);
      console.log(`   enter_time: ${presenceData.enter_time}`);
    }
  } catch (error) {
    console.error('   ❌ Exception:', error);
  }

  // 5. Get actual active tab from Chrome API
  console.log('\n📍 5. CHROME ACTIVE TAB:');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      console.log(`   Active Tab URL: ${tab.url}`);
      console.log(`   Active Tab ID: ${tab.id}`);
      
      // Normalize it
      const normalized = await window.normalizeUrl(tab.url);
      console.log(`   Normalized PageId: ${normalized.pageId}`);
    } else {
      console.log('   ❌ No active tab found');
    }
  } catch (error) {
    console.error('   ❌ Error getting active tab:', error);
  }

  // 6. Comparison
  console.log('\n📍 6. CONSISTENCY CHECK:');
  const allPageIds = [extensionPageId, handlerPageId, clientPageId];
  const uniquePageIds = [...new Set(allPageIds.filter(Boolean))];
  
  if (uniquePageIds.length === 1) {
    console.log('   ✅ ALL STATES CONSISTENT - All tracking same page:', uniquePageIds[0]);
  } else {
    console.error('   ❌ MISMATCH DETECTED!');
    console.error('      Extension internal:', extensionPageId);
    console.error('      Realtime handler:', handlerPageId);
    console.error('      Supabase client:', clientPageId);
  }

  console.log('\n' + '='.repeat(80) + '\n');
};

window.checkAllTabs = async function() {
  console.log('\n📋 ALL OPEN TABS:');
  try {
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab, idx) => {
      const status = tab.active ? '🟢 ACTIVE' : '⚪';
      console.log(`   ${idx + 1}. ${status} [ID: ${tab.id}] ${tab.url}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

window.testPageTransition = async function(newUrl = 'https://example.com') {
  console.log(`\n🔄 SIMULATING PAGE TRANSITION TO: ${newUrl}`);
  console.log('   This will trigger handleTabUpdate...');
  // Simulate a tab update event
  await chrome.runtime.sendMessage({
    type: 'TAB_UPDATED',
    tabId: 999999,
    url: newUrl
  });
  console.log('   ✅ Message sent. Run diagnosePageTracking() to verify.');
};

console.log('✅ DIAGNOSE_PAGE_TRACKING: Functions loaded!');
console.log('✅ window.diagnosePageTracking =', typeof window.diagnosePageTracking);
console.log('✅ window.checkAllTabs =', typeof window.checkAllTabs);
console.log('✅ window.testPageTransition =', typeof window.testPageTransition);
console.log('\n📋 Available console functions:');
console.log('   diagnosePageTracking()        - Run full diagnostic');
console.log('   checkAllTabs()                - See all open tabs');
console.log('   testPageTransition(newUrl)    - Simulate page transition');
console.log('');
