 // SD1 Working Console Diagnostic Functions
  window.quickStatus = function() {
    console.log('⚡ QUICK STATUS CHECK:');
    console.log('⚡ window.supabase:', !!window.supabase);
    console.log('⚡ window.supabaseRealtimeClient:', !!window.supabaseRealtimeClient);
    console.log('⚡ window.currentUser:', !!window.currentUser);
    console.log('⚡ window.currentUrlData:', !!window.currentUrlData);
    console.log('⚡ Channels active:', window.supabaseRealtimeClient?.channels?.size || 0);
    console.log('⚡ Is connected:', window.supabaseRealtimeClient?.isConnected || false);
    console.log('⚡ Current page:', window.currentUrlData?.pageId || 'NOT SET - CRITICAL ERROR');
    console.log('⚡ Current URL (raw):', window.currentUrlData?.rawUrl || 'NOT SET');
    console.log('⚡ Current URL (normalized):', window.currentUrlData?.normalizedUrl || 'NOT SET');
    console.log('⚡ Current user:', window.currentUser?.id || 'null');
    console.log('⚡ Current user avatar:', window.currentUser?.avatarUrl || 'null');
    console.log('⚡ Current user aura:', window.currentUser?.auraColor || 'null');
    
    // CRITICAL: Check if currentUrlData is null and warn
    if (!window.currentUrlData) {
      console.error('❌ CRITICAL ERROR: window.currentUrlData is null!');
      console.error('❌ This should NEVER happen in a browser extension!');
      console.error('❌ The extension should always know what page it\'s on.');
    }
  };
  
  window.testMessage = async function() {
    console.log('📝 Testing message sending...');
    if (window.supabaseRealtimeClient) {
      try {
        await window.supabaseRealtimeClient.sendMessage('TEST MESSAGE ' + Date.now());
        console.log('✅ Message sent successfully');
      } catch (error) {
        console.error('❌ Message sending failed:', error);
      }
    } else {
      console.log('❌ No real-time client available');
    }
  };
  
  window.testAura = function(color = '#ff0000') {
    console.log('🎨 Testing aura color change...');
    if (window.currentUser) {
      updateUserAuraInUI(window.currentUser.email, color);
      console.log('✅ Aura color change triggered');
    } else {
      console.log('❌ No current user available');
    }
  };
  
  window.testMessageSystem = async function() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 MESSAGE SYSTEM TEST');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Test 1: Prerequisites
    console.log('📋 TEST 1: Prerequisites');
    console.log('  ✓ Supabase client:', !!window.supabase);
    console.log('  ✓ Realtime client:', !!window.supabaseRealtimeClient);
    console.log('  ✓ Current user:', !!window.currentUser);
    console.log('  ✓ Current page:', !!window.currentUrlData);
    console.log('  ✓ User email:', window.currentUser?.email || 'MISSING');
    console.log('  ✓ Page ID:', window.currentUrlData?.pageId || 'MISSING');
    console.log('');
    
    if (!window.supabaseRealtimeClient || !window.currentUser || !window.currentUrlData) {
      console.error('❌ Prerequisites not met. Cannot test message system.');
      return;
    }
    
    // Test 2: Send message
    console.log('📋 TEST 2: Sending test message');
    const testContent = `TEST MESSAGE ${Date.now()}`;
    console.log('  Content:', testContent);
    
    try {
      const message = await window.supabaseRealtimeClient.sendMessage(testContent);
      console.log('  ✅ Message sent successfully');
      console.log('  ✅ Message ID:', message?.id);
      console.log('  ✅ Is UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message?.id));
      console.log('');
      
      // Test 3: Check UI
      console.log('📋 TEST 3: Checking UI');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
      console.log('  ✓ Message in DOM:', !!messageDiv);
      if (messageDiv) {
        const authorElement = messageDiv.querySelector('[data-avatar-source]');
        const avatarSource = authorElement?.dataset.avatarSource;
        console.log('  ✓ Avatar source:', avatarSource);
        console.log('  ✓ Has delete button:', !!messageDiv.querySelector('[data-action="delete"]'));
      }
      console.log('');
      
      // Test 4: Delete message
      if (message?.id) {
        console.log('📋 TEST 4: Deleting test message');
        await window.supabaseRealtimeClient.deleteMessage(message.id);
        console.log('  ✅ Delete command sent');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        const stillExists = document.querySelector(`[data-message-id="${message.id}"]`);
        console.log('  ✓ Message removed from UI:', !stillExists);
      }
      console.log('');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🏁 MESSAGE SYSTEM TEST COMPLETED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  };
  
  window.testVisibility = async function() {
    console.log('👁️ Testing visibility system...');
    try {
      await refreshVisibilityAvatars();
      console.log('✅ Visibility refresh completed');
    } catch (error) {
      console.error('❌ Visibility test failed:', error);
    }
  };
  
  window.checkSubscriptions = function() {
    console.log('📡 Checking real-time subscriptions...');
    if (window.supabaseRealtimeClient) {
      const channels = Array.from(window.supabaseRealtimeClient.channels.keys());
      console.log('📡 Active channels:', channels);
      console.log('📡 Channel count:', window.supabaseRealtimeClient.channels.size);
      
      if (channels.length > 0) {
        console.log('✅ Real-time subscriptions are active');
      } else {
        console.log('❌ No active real-time subscriptions');
      }
    } else {
      console.log('❌ No real-time client available');
    }
  };
  
  window.testDatabase = async function() {
    console.log('🗄️ Testing database connection...');
    if (window.supabase) {
      try {
        const { data, error } = await window.supabase
          .from('user_presence')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error('❌ Database error:', error);
        } else {
          console.log('✅ Database connection successful');
        }
      } catch (error) {
        console.error('❌ Database test failed:', error);
      }
    } else {
      console.log('❌ No Supabase client available');
    }
  };
  
  window.testEventHandlers = function() {
    console.log('🔧 Testing event handlers...');
    if (window.supabaseRealtimeClient) {
      const handlers = {
        onUserJoined: typeof window.supabaseRealtimeClient.onUserJoined,
        onUserLeft: typeof window.supabaseRealtimeClient.onUserLeft,
        onUserUpdated: typeof window.supabaseRealtimeClient.onUserUpdated,
        onNewMessage: typeof window.supabaseRealtimeClient.onNewMessage,
        onMessageDeleted: typeof window.supabaseRealtimeClient.onMessageDeleted,
        onVisibilityChanged: typeof window.supabaseRealtimeClient.onVisibilityChanged
      };
      
      console.log('📊 Event handlers status:', handlers);
      
      const allHandlers = Object.values(handlers).every(h => h === 'function');
      if (allHandlers) {
        console.log('✅ All event handlers are properly set up');
      } else {
        console.log('❌ Some event handlers are missing');
      }
    } else {
      console.log('❌ No real-time client available');
    }
  };
  
  window.testMessagePropagation = async function() {
    console.log('💬 Testing message propagation UI...');
    try {
      // Test the conversion function
      const testSupabaseMessage = {
        id: 'test-uuid-123',
        user_email: window.currentUser?.email || 'user@example.com',
        content: 'Test message for propagation',
        created_at: new Date().toISOString(),
        page_id: 'test-page'
      };
      
      console.log('💬 Test Supabase message:', testSupabaseMessage);
      const converted = convertSupabaseMessageToAPIFormat(testSupabaseMessage);
      console.log('💬 Converted message:', converted);
      
      // Test addMessageToChat with converted message
      console.log('💬 Testing addMessageToChat with converted message...');
      await addMessageToChat(converted);
      console.log('✅ Message propagation test completed');
    } catch (error) {
      console.error('❌ Message propagation test failed:', error);
    }
  };
  
  window.testVisibilityUI = async function() {
    console.log('👁️ Testing visibility UI updates...');
    try {
      // Check current DOM state
      const beforeAvatars = document.querySelectorAll('.avatar-container, .user-avatar, .presence-avatar');
      console.log('👁️ Avatars before refresh:', beforeAvatars.length);
      
      // Force visibility refresh
      await refreshVisibilityAvatars();
      
      // Check DOM state after refresh
      setTimeout(() => {
        const afterAvatars = document.querySelectorAll('.avatar-container, .user-avatar, .presence-avatar');
        console.log('👁️ Avatars after refresh:', afterAvatars.length);
        console.log('👁️ DOM update successful:', afterAvatars.length > 0);
      }, 200);
      
      console.log('✅ Visibility UI test completed');
    } catch (error) {
      console.error('❌ Visibility UI test failed:', error);
    }
  };
  
  window.runFullTest = async function() {
    console.log('🚀 SD1: Running Full Diagnostic Test');
    
    quickStatus();
    await testDatabase();
    checkSubscriptions();
    testEventHandlers();
    await testMessage();
    testAura('#00ff00');
    await testVisibility();
    await testMessagePropagation();
    await testVisibilityUI();
    
    console.log('🏁 SD1: Full diagnostic completed');
  };
  
  // Test functions removed after successful testing
  
  
  
  
  // Abstracted Navigation System
  class NavigationManager {
    constructor() {
      this.initialize();
    }
    
    async initialize() {
      console.log('🧭 NAVIGATION: Navigation manager initialized');
    }
    
    async navigateToUrl(url, target) {
      try {
        console.log('🧭 NAVIGATION: Navigating to URL:', url, 'with target:', target);
        
        // Get current active tab
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (activeTab && activeTab.url === url) {
          // Already on the target page, just focus and highlight
          await this.focusAndHighlight(target);
        } else {
          // Navigate to the URL
          await chrome.tabs.update(activeTab.id, { url: url });
          
          // Wait for page to load, then highlight
          setTimeout(() => {
            this.focusAndHighlight(target);
          }, 2000);
        }
      } catch (error) {
        console.error('🧭 NAVIGATION: Error navigating:', error);
      }
    }
    
    async focusAndHighlight(target) {
      try {
        if (!target) return;
        
        console.log('🧭 NAVIGATION: Focusing and highlighting target:', target);
        
        // Send message to content script to highlight the target
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (activeTab) {
          await chrome.tabs.sendMessage(activeTab.id, {
            type: 'HIGHLIGHT_TARGET',
            target: target
          });
        }
      } catch (error) {
        console.error('🧭 NAVIGATION: Error focusing target:', error);
      }
    }
  }
  
  // Initialize notification history system
  // window.notificationHistory = new NotificationHistoryManager(); // DISABLED - not available
  window.navigationManager = new NavigationManager();
  