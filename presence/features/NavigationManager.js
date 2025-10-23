// Update profile avatar with real-time aura color
function updateProfileAvatarWithRealTimeAura() {
    try {
      if (!window.currentUser || !window.currentUser.email) {
        console.log('🔍 PROFILE_AVATAR_UPDATE: No current user found');
        return;
      }
  
      const userEmail = window.currentUser.email;
      const realTimeAuraColor = getLatestAuraColorFromPresence(userEmail);
      
      if (realTimeAuraColor) {
        Logger.debug(`PROFILE_AVATAR_UPDATE: Found real-time aura color for profile: ${realTimeAuraColor}`, null, 'general');
        
        // Update the profile avatar with the real-time aura color
        const profileAvatar = document.querySelector('#user-avatar-container');
        if (profileAvatar) {
          Logger.debug(`PROFILE_AVATAR_UPDATE: Found profile avatar element:`, profileAvatar, 'general');
          Logger.debug(`PROFILE_AVATAR_UPDATE: Container innerHTML:`, profileAvatar.innerHTML, 'general');
          Logger.debug(`PROFILE_AVATAR_UPDATE: Container has children:`, profileAvatar.children.length, 'general');
          
          // Check if the container has any avatar element
          let avatarElement = profileAvatar.querySelector('img') || profileAvatar.querySelector('[style*="border-radius"]');
          
          // If no avatar element exists, check if there's a unified avatar structure
          const hasUnifiedStructure = profileAvatar.querySelector('div[style*="position: relative"]');
          
          if (hasUnifiedStructure) {
            console.log('🔍 PROFILE_AVATAR_UPDATE: Found unified avatar structure');
            // Update the aura on the unified avatar structure
            const auraRing = hasUnifiedStructure.querySelector('div[style*="border-radius: 50%"]');
            if (auraRing) {
              // Update the aura ring color
              auraRing.style.border = `2px solid ${realTimeAuraColor}`;
              Logger.debug(`PROFILE_AVATAR_UPDATE: Updated unified avatar aura to: ${realTimeAuraColor}`, null, 'general');
            }
          } else if (avatarElement) {
            console.log('🔍 PROFILE_AVATAR_UPDATE: Found simple avatar element');
            // Update the border on the simple avatar
            avatarElement.style.border = `2px solid ${realTimeAuraColor}`;
            Logger.debug(`PROFILE_AVATAR_UPDATE: Updated avatar border color to: ${realTimeAuraColor}`, null, 'general');
          } else {
            console.log('🔍 PROFILE_AVATAR_UPDATE: No avatar element found in container, applying border to container');
            // Apply border directly to container as fallback
            profileAvatar.style.borderColor = realTimeAuraColor;
            profileAvatar.style.borderWidth = '2px';
            profileAvatar.style.borderStyle = 'solid';
            profileAvatar.style.borderRadius = '50%';
            Logger.debug(`PROFILE_AVATAR_UPDATE: Updated container border color to: ${realTimeAuraColor}`, null, 'general');
          }
        } else {
          console.log('🔍 PROFILE_AVATAR_UPDATE: Profile avatar element not found');
        }
      } else {
        console.log('🔍 PROFILE_AVATAR_UPDATE: No real-time aura color found for profile');
      }
    } catch (error) {
      console.error('❌ PROFILE_AVATAR_UPDATE: Error updating profile avatar:', error);
    }
  }
  
  
  
  
  
  function clearContext() {
    console.log('🧹 Clearing context...');
    const chatInput = document.getElementById('chat-textarea');
    const contextBar = document.getElementById('context-bar');
    const sendButton = document.querySelector('.chat-input-area button, #chat-send-btn');
    
    console.log('🔍 Elements found:', { chatInput: !!chatInput, contextBar: !!contextBar, sendButton: !!sendButton });
    
    if (contextBar) {
      contextBar.style.display = 'none';
      contextBar.style.visibility = 'hidden';
      contextBar.style.opacity = '0';
      
      // Reset styling to default
      contextBar.style.background = '';
      contextBar.style.borderBottom = '';
      contextBar.style.color = '';
      const contextText = contextBar.querySelector('#context-text');
      if (contextText) contextText.style.color = '';
      const cancelBtn = contextBar.querySelector('#cancel-context');
      if (cancelBtn) cancelBtn.style.color = '';
      
    }
    
    if (chatInput) {
      // Clear all context data
      delete chatInput.dataset.replyTo;
      delete chatInput.dataset.replyToConversation;
      delete chatInput.dataset.editingMessageId;
      delete chatInput.dataset.contextMode;
      
      // Reset input to regular size
      chatInput.value = '';
      chatInput.placeholder = 'Start thread in Public Square';
      chatInput.style.borderColor = '';
      chatInput.style.backgroundColor = '';
      chatInput.style.color = '';
      
      // Reset height properly
      chatInput.style.height = 'auto';
      chatInput.style.overflowY = 'hidden';
      
      // Force a reflow to ensure the height resets
      chatInput.offsetHeight; // Force reflow
      
      // Ensure it's at natural height for empty content
      setTimeout(() => {
        if (chatInput.value === '') {
          chatInput.style.height = 'auto';
          // Let it naturally size to its content (empty = minimum height)
        }
      }, 10);
      
    }
    
    if (sendButton) {
      sendButton.textContent = 'Send';
      delete sendButton.dataset.editing;
    }
    
    console.log('🧹 Context cleared successfully');
  }
  
  
  
  async function handlePendingContent() {
    try {
      const result = await chrome.storage.local.get([
        'pendingMessageContent', 
        'pendingMessageUri',
        'pendingVisibilityContent',
        'pendingVisibilityUri'
      ]);
  
      // Handle pending message content
      if (result.pendingMessageContent) {
        const chatInput = document.getElementById('chat-textarea');
        if (chatInput) {
          // Pre-populate the message input with the selected content
          chatInput.value = `Commenting on: "${result.pendingMessageContent}"`;
          chatInput.focus();
          
          // Auto-resize the textarea
          autoResize(chatInput);
          
          // Clear the pending content
          await chrome.storage.local.remove(['pendingMessageContent', 'pendingMessageUri']);
          
          console.log('Pre-populated message input with selected content');
        }
      }
  
      // Handle pending visibility content
      if (result.pendingVisibilityContent) {
        // For now, we'll show a notification that visibility anchoring is not yet implemented
        // In the future, this could update the user's visibility status
        console.log('Pending visibility content:', result.pendingVisibilityContent);
        
        // Clear the pending content
        await chrome.storage.local.remove(['pendingVisibilityContent', 'pendingVisibilityUri']);
        
        // Show a temporary notification
        showNotification('Visibility anchoring feature coming soon!');
      }
    } catch (error) {
      console.error('Failed to handle pending content:', error);
    }
  }
  
  
  
  
  
  
  
  
  
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
    console.log('⚡ Current user:', window.currentUser?.email || 'null');
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
        user_email: 'test@example.com',
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
  
  console.log('🧪 SD1: Console diagnostic functions loaded. Available commands:');
  console.log('🧪 quickStatus() - Quick status check');
  console.log('🧪 testMessage() - Test message sending');
  console.log('🧪 testAura(color) - Test aura color change');
  console.log('🧪 testVisibility() - Test visibility system');
  console.log('🧪 testMessagePropagation() - Test message UI propagation');
  console.log('🧪 testVisibilityUI() - Test visibility UI updates');
  console.log('🧪 checkSubscriptions() - Check real-time subscriptions');
  console.log('🧪 testDatabase() - Test database connection');
  console.log('🧪 testEventHandlers() - Test event handlers');
  console.log('🧪 runFullTest() - Run comprehensive test');
  
  
  
  
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
  window.notificationHistory = new NotificationHistoryManager();
  window.navigationManager = new NavigationManager();
  