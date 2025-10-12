// Real-time Presence Diagnostics - Console Functions
// Run these in the browser console to diagnose real-time issues

window.realtimeDiagnostics = {
  
  // Check if Supabase client is initialized
  checkSupabaseClient() {
    console.log('🔍 === SUPABASE CLIENT DIAGNOSTIC ===');
    console.log('window.supabase exists:', typeof window.supabase !== 'undefined');
    console.log('window.supabaseRealtimeClient exists:', typeof window.supabaseRealtimeClient !== 'undefined');
    
    if (window.supabase) {
      console.log('✅ Supabase client initialized');
      console.log('Supabase methods:', Object.keys(window.supabase).slice(0, 15));
    } else {
      console.error('❌ Supabase client NOT initialized');
    }
    
    if (window.supabaseRealtimeClient) {
      console.log('✅ Real-time client initialized');
      console.log('Is connected:', window.supabaseRealtimeClient.isConnected);
      console.log('Current user:', window.supabaseRealtimeClient.currentUser);
      console.log('Current page:', window.supabaseRealtimeClient.currentPage);
      console.log('Active channels:', window.supabaseRealtimeClient.channels.size);
    } else {
      console.error('❌ Real-time client NOT initialized');
    }
  },
  
  // Check active subscriptions
  async checkSubscriptions() {
    console.log('🔍 === SUBSCRIPTION DIAGNOSTIC ===');
    
    if (!window.supabaseRealtimeClient) {
      console.error('❌ Real-time client not initialized');
      return;
    }
    
    const channels = window.supabaseRealtimeClient.channels;
    console.log(`Active channels: ${channels.size}`);
    
    for (const [pageId, channel] of channels) {
      console.log(`📡 Channel: page-${pageId}`);
      console.log('  State:', channel.state);
      console.log('  Topic:', channel.topic);
    }
    
    if (channels.size === 0) {
      console.warn('⚠️ NO ACTIVE SUBSCRIPTIONS - Real-time updates will NOT work!');
      console.log('💡 Call: window.realtimeDiagnostics.forceSubscribe()');
    }
  },
  
  // Force subscribe to current page
  async forceSubscribe() {
    console.log('🔍 === FORCING SUBSCRIPTION ===');
    
    if (!window.supabaseRealtimeClient) {
      console.error('❌ Real-time client not initialized');
      return;
    }
    
    const pageId = window.supabaseRealtimeClient.currentPage?.pageId;
    if (!pageId) {
      console.error('❌ No current page set');
      return;
    }
    
    console.log(`📡 Subscribing to page: ${pageId}`);
    await window.supabaseRealtimeClient.subscribeToPageUpdates(pageId);
    
    console.log('✅ Subscription attempt complete');
    await this.checkSubscriptions();
  },
  
  // Test presence update
  async testPresenceUpdate() {
    console.log('🔍 === TESTING PRESENCE UPDATE ===');
    
    if (!window.supabaseRealtimeClient) {
      console.error('❌ Real-time client not initialized');
      return;
    }
    
    const { currentUser, currentPage } = window.supabaseRealtimeClient;
    
    if (!currentUser || !currentPage) {
      console.error('❌ No current user or page');
      return;
    }
    
    console.log(`📤 Sending presence update for ${currentUser.userEmail} on ${currentPage.pageId}`);
    
    await window.supabaseRealtimeClient.updatePresence(
      currentPage.pageId,
      currentPage.pageUrl,
      '#FF0000' // Test aura color
    );
    
    console.log('✅ Presence update sent');
  },
  
  // Query current presence from database
  async queryPresence(pageId) {
    console.log('🔍 === QUERYING PRESENCE FROM DATABASE ===');
    
    if (!window.supabase) {
      console.error('❌ Supabase client not initialized');
      return;
    }
    
    const targetPageId = pageId || window.supabaseRealtimeClient?.currentPage?.pageId;
    
    if (!targetPageId) {
      console.error('❌ No page ID provided');
      return;
    }
    
    console.log(`📊 Querying presence for page: ${targetPageId}`);
    
    const { data, error } = await window.supabase
      .from('user_presence')
      .select('*')
      .eq('page_id', targetPageId)
      .order('last_seen', { ascending: false });
    
    if (error) {
      console.error('❌ Query error:', error);
      return;
    }
    
    console.log(`✅ Found ${data.length} presence records:`);
    data.forEach((record, i) => {
      console.log(`\n${i + 1}. ${record.user_email}`);
      console.log(`   is_active: ${record.is_active}`);
      console.log(`   enter_time: ${record.enter_time}`);
      console.log(`   last_seen: ${record.last_seen}`);
      console.log(`   aura_color: ${record.aura_color || 'none'}`);
    });
    
    return data;
  },
  
  // Check polling intervals
  checkPolling() {
    console.log('🔍 === CHECKING POLLING INTERVALS ===');
    
    // Check if loadCombinedAvatars is being called repeatedly
    const originalLoad = window.loadCombinedAvatars;
    let callCount = 0;
    let lastCall = Date.now();
    
    window.loadCombinedAvatars = function(...args) {
      callCount++;
      const now = Date.now();
      const timeSinceLastCall = now - lastCall;
      console.log(`📊 loadCombinedAvatars called (${callCount} times, ${timeSinceLastCall}ms since last call)`);
      lastCall = now;
      return originalLoad.apply(this, args);
    };
    
    console.log('✅ Monitoring loadCombinedAvatars calls');
    console.log('💡 Watch console for polling frequency');
  },
  
  // Performance test
  async performanceTest() {
    console.log('🔍 === PERFORMANCE TEST ===');
    console.log('Testing round-trip time for presence update...\n');
    
    if (!window.supabaseRealtimeClient) {
      console.error('❌ Real-time client not initialized');
      return;
    }
    
    const { currentUser, currentPage } = window.supabaseRealtimeClient;
    
    if (!currentUser || !currentPage) {
      console.error('❌ No current user or page');
      return;
    }
    
    // Test 1: Direct database write
    console.log('📊 Test 1: Direct database write');
    const start1 = performance.now();
    await window.supabase
      .from('user_presence')
      .upsert({
        user_email: currentUser.userEmail,
        page_id: currentPage.pageId,
        page_url: currentPage.pageUrl,
        is_active: true,
        last_seen: new Date().toISOString()
      });
    const end1 = performance.now();
    console.log(`✅ Database write: ${(end1 - start1).toFixed(2)}ms\n`);
    
    // Test 2: Via real-time client
    console.log('📊 Test 2: Via real-time client');
    const start2 = performance.now();
    await window.supabaseRealtimeClient.updatePresence(
      currentPage.pageId,
      currentPage.pageUrl
    );
    const end2 = performance.now();
    console.log(`✅ Real-time client update: ${(end2 - start2).toFixed(2)}ms\n`);
    
    // Test 3: REST API call (current polling method)
    console.log('📊 Test 3: REST API call (current method)');
    const start3 = performance.now();
    try {
      const user = await window.authManager.getCurrentUser();
      const response = await fetch(`https://api.themetalayer.org/v1/presence/url?url=${encodeURIComponent(currentPage.pageUrl)}&minutes=0.5`, {
        headers: {
          'x-user-email': user.email,
          'x-user-name': user.user_metadata?.full_name || user.email
        }
      });
      await response.json();
      const end3 = performance.now();
      console.log(`✅ REST API call: ${(end3 - start3).toFixed(2)}ms\n`);
    } catch (error) {
      console.error('❌ REST API call failed:', error);
    }
    
    console.log('📊 SUMMARY:');
    console.log('Direct DB write is fastest for updates');
    console.log('REST API is slowest (plus 30s polling delay)');
    console.log('Real-time subscriptions would give instant updates with NO polling');
  },
  
  // Full diagnostic report
  async fullReport() {
    console.log('🔍 ========================================');
    console.log('🔍 FULL REAL-TIME DIAGNOSTIC REPORT');
    console.log('🔍 ========================================\n');
    
    await this.checkSupabaseClient();
    console.log('\n');
    await this.checkSubscriptions();
    console.log('\n');
    await this.queryPresence();
    console.log('\n');
    await this.performanceTest();
    
    console.log('\n🔍 ========================================');
    console.log('🔍 END OF REPORT');
    console.log('🔍 ========================================');
  }
};

// Auto-run basic check on load
console.log('✅ Real-time diagnostics loaded!');
console.log('💡 Run: window.realtimeDiagnostics.fullReport()');
console.log('💡 Or: window.realtimeDiagnostics.checkSubscriptions()');

