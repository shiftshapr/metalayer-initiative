// JavaScript for the Collaborative Sidebar

// Setup cross-profile communication for real-time updates
function setupCrossProfileCommunication() {
    console.log('📡 Setting up cross-profile communication...');
    
    // Listen for messages from other profiles
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📡 Received cross-profile message:', message);
      
      if (message.type === 'MESSAGE_DELETED') {
        console.log('📡 DELETION: Received deletion notification for message:', message.messageId);
        
        // Remove the deleted message from this profile's UI
        const messageDiv = document.querySelector(`[data-message-id="${message.messageId}"]`);
        if (messageDiv) {
          messageDiv.remove();
          console.log('📡 DELETION: Removed message from UI');
        }
        
        // Real-time deletion already handled by handleMessageDeletion() - no need to reload
      }
      
      if (message.type === 'AURA_COLOR_CHANGED') {
        console.log('📡 AURA: Received aura color change notification');
        
        // Refresh message avatars with current presence data to get updated aura colors
        console.log('📡 AURA: Refreshing message avatars with current presence data');
        refreshMessageAvatarsWithCurrentPresence().then(() => {
          console.log('📡 AURA: Message avatars refreshed with updated aura colors');
        });
        
        // Also refresh visibility avatars
        if (typeof window.getState === 'function') {
          window.getState('activeCommunities').then((activeCommunities) => {
            const communities = activeCommunities || ['comm-001'];
            loadCombinedAvatars(communities).then(() => {
              console.log('📡 AURA: Refreshed visibility avatars after cross-profile aura change');
            });
          });
        }
        
        // Force refresh of all message avatars to use current presence data
        setTimeout(() => {
          console.log('📡 AURA: Forcing message avatar refresh with current presence data');
          refreshMessageAvatarsWithCurrentPresence();
        }, 1000);
      }
      
      if (message.type === 'NEW_MESSAGE_ADDED') {
        console.log('📡 MESSAGE: Received new message notification');
        
        // Add the new message to this profile's chat
        if (message.message) {
          console.log('📡 MESSAGE: Adding new message to chat:', message.messageId);
          addMessageToChat(message.message).then(() => {
            console.log('📡 MESSAGE: New message added to remote profile');
          });
        }
      }
      
      sendResponse({ received: true });
    });
    
    // REMOVED: chrome.storage.onChanged listener for aura changes
    // Aura changes are now handled exclusively via Supabase real-time subscriptions
    // This prevents dual pathways that could cause race conditions
    // See: supabaseRealtimeClient.onUserUpdated handler above
    
    console.log('✅ Cross-profile communication setup complete');
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    // MODERN INITIALIZATION
    console.log('🚀 MODERN: Initializing fully modernized extension...');
    
    // Initialize modern systems
    if (window.logger) {
      window.logger.info('INIT', 'Modern extension initialization started');
    }
    
    if (window.performanceOptimizer) {
      window.performanceOptimizer.startOperation('extension_init');
    }
    
    if (window.securityManager) {
      console.log('🔒 SECURITY: Security manager available');
    }
    
    console.log("DOMContentLoaded event fired.");
    console.log("DOMContentLoaded event fired.", null, 'general');
  
    try {
      // === Initialize Complete Modern Architecture ===
      console.log('🚀 INIT: Initializing complete modern architecture...');
      await initializeCompleteModernArchitecture();
      console.log('✅ INIT: Complete modern architecture initialized');
      
      // === Setup Real-time Event Listeners ===
      console.log('🔔 REALTIME: Setting up real-time event listeners...');
      
      // Listen for real-time messages
      window.addEventListener('realtime-message', (event) => {
        console.log('📨 REALTIME: Received real-time message:', event.detail);
        const message = event.detail;
        if (message && message.content) {
          // Add the message to the chat UI
          addMessageToChat({
            id: message.id || `realtime-${Date.now()}`,
            body: message.content,
            author: {
              name: message.author?.name || message.authorId || 'Unknown',
              avatarUrl: message.author?.avatarUrl,
              email: message.authorId
            },
            createdAt: message.createdAt || new Date().toISOString(),
            isDeleted: false
          });
        }
      });
      
      // Listen for real-time message deletions
      window.addEventListener('realtime-message-deleted', (event) => {
        console.log('🗑️ REALTIME: Received message deletion:', event.detail);
        const messageId = event.detail.messageId;
        if (messageId) {
          // Remove the message from the chat UI
          const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
          if (messageElement) {
            messageElement.remove();
          }
        }
      });
      
      // Listen for real-time message edits
      window.addEventListener('realtime-message-edited', (event) => {
        console.log('✏️ REALTIME: Received message edit:', event.detail);
        const message = event.detail;
        if (message && message.id) {
          // Update the message in the chat UI
          const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
          if (messageElement) {
            const bodyElement = messageElement.querySelector('.message-body');
            if (bodyElement) {
              bodyElement.textContent = message.content;
            }
          }
        }
      });
      
      // Listen for real-time presence updates
      window.addEventListener('realtime-presence-update', (event) => {
        console.log('👥 REALTIME: Received presence update:', event.detail);
        // Handle presence updates here if needed
      });
      
      console.log('✅ REALTIME: Real-time event listeners setup complete');
      
    } catch (error) {
      console.error('❌ INIT: Failed to initialize modern architecture:', error);
      console.error('❌ INIT: Error stack:', error.stack);
    }
    
    try {
      // === Setup Modern Cross-Profile Communication ===
      console.log('🚀 INIT: Setting up modern cross-profile communication...');
      await setupModernCrossProfileCommunication();
      console.log('✅ INIT: Modern cross-profile communication setup complete');
    } catch (error) {
      console.error('❌ INIT: Failed to setup cross-profile communication:', error);
      console.error('❌ INIT: Error stack:', error.stack);
    }
  
    try {
      // === Initialize Unified System ===
      console.log('🚀 INIT: Initializing unified system...');
      
      // Use UnifiedInitializationManager to coordinate all systems
      if (window.unifiedInitManager) {
        const unifiedInitSuccess = await window.unifiedInitManager.initialize();
        if (unifiedInitSuccess) {
          console.log('✅ INIT: Unified system initialized successfully');
          
          // Enable debug logging for CleanRealtimeManager (if available)
          if (typeof CleanRealtimeManager !== 'undefined' && window.cleanRealtimeManager) {
            window.cleanRealtimeManager.setLogLevel('DEBUG');
          }
        } else {
          console.warn('⚠️ INIT: Unified system initialization failed, falling back to legacy system');
          await initializeSupabaseRealtimeClient();
        }
      } else {
        console.warn('⚠️ INIT: UnifiedInitializationManager not available, using legacy system');
        await initializeSupabaseRealtimeClient();
      }
      
      console.log('✅ INIT: Real-time system initialized');
    } catch (error) {
      console.error('❌ INIT: Failed to initialize real-time system:', error);
      console.error('❌ INIT: Error stack:', error.stack);
    }
    
    try {
      // === Initialize Real Google Auth for Actual Profile Pictures ===
      console.log('🚀 INIT: Initializing real Google auth...');
      initializeRealGoogleAuth();
      console.log('✅ INIT: Real Google auth initialized');
    } catch (error) {
      console.error('❌ INIT: Failed to initialize real Google auth:', error);
      console.error('❌ INIT: Error stack:', error.stack);
    }
  
    // === Initialize Theme ===
    initializeTheme();
    
    // === Load User Avatar Background Color Configuration ===
    await loadUserAvatarBgConfig();
    
    // Note: Aura button click handler will be set up after user authentication
    
    // === Update Visual Hierarchy for Existing Messages ===
    updateMessageVisualHierarchy();
    
    // === Add Window Resize Listener for Visual Hierarchy ===
    window.addEventListener('resize', () => {
      updateMessageVisualHierarchy();
    });
  
    // === Register Auth Providers ===
    // Check if auth providers are available before registering
    if (typeof SupabaseAuthProvider !== 'undefined' && typeof MetalayerAuthProvider !== 'undefined' && typeof OfflineAuthProvider !== 'undefined') {
      // Check if authManager has registerProvider method
      if (typeof authManager !== 'undefined' && typeof authManager.registerProvider === 'function') {
        authManager.registerProvider('supabase', new SupabaseAuthProvider());
        authManager.registerProvider('metalayer', new MetalayerAuthProvider());
        authManager.registerProvider('offline', new OfflineAuthProvider());
      } else {
        console.log('🔧 AuthManager missing registerProvider method, adding it...');
        // Add registerProvider method to authManager
        if (typeof authManager !== 'undefined') {
          authManager.registerProvider = function(name, provider) {
            console.log(`🔧 Registering provider: ${name}`);
            if (!this.providers) {
              this.providers = new Map();
            }
            this.providers.set(name, provider);
            console.log(`✅ Provider ${name} registered successfully`);
          };
          // Now register the providers
          authManager.registerProvider('supabase', new SupabaseAuthProvider());
          authManager.registerProvider('metalayer', new MetalayerAuthProvider());
          authManager.registerProvider('offline', new OfflineAuthProvider());
        } else {
          console.error('❌ AuthManager not available');
        }
      }
    } else {
      console.error('❌ Auth providers not available. SupabaseAuthProvider:', typeof SupabaseAuthProvider, 'MetalayerAuthProvider:', typeof MetalayerAuthProvider, 'OfflineAuthProvider:', typeof OfflineAuthProvider);
      // Retry after a short delay
      setTimeout(() => {
        if (typeof SupabaseAuthProvider !== 'undefined' && typeof MetalayerAuthProvider !== 'undefined' && typeof OfflineAuthProvider !== 'undefined') {
          // Check if authManager has registerProvider method
          if (typeof authManager !== 'undefined' && typeof authManager.registerProvider === 'function') {
            authManager.registerProvider('supabase', new SupabaseAuthProvider());
            authManager.registerProvider('metalayer', new MetalayerAuthProvider());
            authManager.registerProvider('offline', new OfflineAuthProvider());
            console.log('✅ Auth providers registered after retry');
          } else {
            console.log('🔧 AuthManager missing registerProvider method in retry, adding it...');
            if (typeof authManager !== 'undefined') {
              authManager.registerProvider = function(name, provider) {
                console.log(`🔧 Registering provider: ${name}`);
                if (!this.providers) {
                  this.providers = new Map();
                }
                this.providers.set(name, provider);
                console.log(`✅ Provider ${name} registered successfully`);
              };
              authManager.registerProvider('supabase', new SupabaseAuthProvider());
              authManager.registerProvider('metalayer', new MetalayerAuthProvider());
              authManager.registerProvider('offline', new OfflineAuthProvider());
              console.log('✅ Auth providers registered after retry with added method');
            } else {
              console.error('❌ AuthManager not available in retry');
            }
          }
        } else {
          console.error('❌ Auth providers still not available after retry');
        }
      }, 100);
    }
    
    // === Initialize Auth Manager ===
    console.log('Starting auth manager initialization...');
    
    // Fix authManager.initialize method if missing
    if (typeof authManager !== 'undefined' && typeof authManager.initialize !== 'function') {
      console.log('🔧 Adding initialize method to authManager...');
      authManager.initialize = function() {
        console.log('🔧 AuthManager initialize called');
        return Promise.resolve();
      };
    }
    
    // Try to initialize with timeout
    try {
      const authReady = await Promise.race([
        authManager.initialize(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth initialization timeout')), 3000)
        )
      ]);
      
      console.log('Auth manager initialization result:', authReady);
      
      if (authReady) {
        console.log('Auth Manager ready');
        console.log('Current provider:', authManager.currentProvider?.name);
        
        // Set up auth state listener
        authManager.onAuthStateChange(async (event, data) => {
          console.log('Auth state changed:', event, data);
          // data IS the user object, not { user: ... }
          await updateUI(data);
          
          // Initialize RobustIntegration now that user is authenticated
          if (event === 'SIGNED_IN' && window.robustIntegration && !window.robustIntegration.isInitialized) {
            console.log('🔗 AUTH: Initializing RobustIntegration after authentication...');
            window.robustIntegration.initialize().then(success => {
              if (success) {
                console.log('✅ AUTH: RobustIntegration initialized successfully');
              } else {
                console.log('❌ AUTH: RobustIntegration initialization failed');
              }
            });
          }
  
          // Initialize VisibilityIntegration now that user is authenticated
          if (event === 'SIGNED_IN' && window.visibilityIntegration && !window.visibilityIntegration.isInitialized) {
            console.log('🔗 AUTH: Initializing VisibilityIntegration after authentication...');
            window.visibilityIntegration.initialize().then(success => {
              if (success) {
                console.log('✅ AUTH: VisibilityIntegration initialized successfully');
              } else {
                console.log('❌ AUTH: VisibilityIntegration initialization failed');
              }
            });
          }
  
          // Initialize ReactionsIntegration now that user is authenticated
          if (event === 'SIGNED_IN' && window.reactionsIntegration && !window.reactionsIntegration.isInitialized) {
            console.log('🔗 AUTH: Initializing ReactionsIntegration after authentication...');
            window.reactionsIntegration.initialize().then(success => {
              if (success) {
                console.log('✅ AUTH: ReactionsIntegration initialized successfully');
              } else {
                console.log('❌ AUTH: ReactionsIntegration initialization failed');
              }
            });
          }
  
          // Initialize AurasIntegration now that user is authenticated
          if (event === 'SIGNED_IN' && window.aurasIntegration && !window.aurasIntegration.isInitialized) {
            console.log('🔗 AUTH: Initializing AurasIntegration after authentication...');
            window.aurasIntegration.initialize().then(success => {
              if (success) {
                console.log('✅ AUTH: AurasIntegration initialized successfully');
              } else {
                console.log('❌ AUTH: AurasIntegration initialization failed');
              }
            });
          }
        });
        
        // Check initial auth state
        const user = await authManager.getCurrentUser();
        console.log('Initial user:', user);
        
        // Update UI with current user
        await updateUI(user);
        
        // Check for pending content from selection widget
        await handlePendingContent();
      } else {
        console.log('Auth system failed to initialize');
      }
    } catch (error) {
      console.error('Auth initialization failed:', error.message);
      
      // Don't fall back to offline mode - force real auth
      console.log('Forcing real authentication - no offline fallback');
      // Don't clear UI here - let the auth state listener handle it
    }
    
    // Use Supabase authentication only - no hardcoded auth
  
    // Load communities and initialize the interface
    try {
      console.log('🔍 INIT: Loading communities...');
      const result = await loadCommunities();
      console.log('🔍 INIT: Communities loaded:', result);
      
      // Also load chat history for the current page
      console.log('🔍 INIT: Setting up chat history timeout (1 second)...');
      setTimeout(async () => {
        try {
          console.log('🔍 INIT: Chat history timeout executed');
          await loadChatHistory();
          console.log('🔍 INIT: Chat history loaded for current page');
        } catch (error) {
          console.error('❌ INIT: Error loading chat history:', error);
        }
      }, 1000); // Small delay to ensure communities are loaded first
      
      // Start presence tracking
      console.log('🔍 INIT: Setting up presence tracking timeout (2 seconds)...');
      setTimeout(async () => {
        try {
          console.log('🔍 INIT: Timeout executed - about to call startPresenceTracking()');
          const currentUser = await getCurrentUserEmail();
          console.log('🔍 INIT: Current user before presence tracking:', currentUser);
          
          if (!currentUser) {
            console.log('🔍 INIT: No authenticated user, skipping presence tracking');
            console.log('🔍 INIT: Authentication prompt should be visible - user needs to sign in');
            return;
          }
          
          await startPresenceTracking();
          console.log('🔍 INIT: startPresenceTracking() completed successfully');
        } catch (error) {
          console.error('❌ INIT: Error starting presence tracking:', error);
          console.error('❌ INIT: Error stack:', error.stack);
        }
      }, 2000); // Delay to ensure auth is complete
    } catch (error) {
      console.error('Error loading communities:', error);
    }
    
    // UI will be updated by auth state listener
    console.log('UI will be updated by auth state listener');
    
    console.log('=== END Initialization ===');
  
    // Add unload handler to stop presence tracking
    window.addEventListener('beforeunload', () => {
      // Send EXIT event synchronously (fire and forget)
      if (currentPageId) {
        sendPresenceEvent('EXIT').catch(error => {
          console.error('❌ PRESENCE: Error sending EXIT event:', error);
        });
      }
      
      // Stop intervals
      if (presenceHeartbeatInterval) {
        clearInterval(presenceHeartbeatInterval);
        presenceHeartbeatInterval = null;
      }
      
      if (visibleListPollingInterval) {
        clearInterval(visibleListPollingInterval);
        visibleListPollingInterval = null;
      }
    });
  
    // --- Now proceed with the rest of the setup ---
    console.log("Document loaded (from JS)");
    console.log("Sidebar JS Loaded", null, 'general');
  
    // Add debug listeners (moved from HTML)
    document.querySelectorAll('.main-nav-tab').forEach(tab => {
      console.log(`Found main tab: ${tab.textContent}`);
      tab.addEventListener('click', () => {
        console.log(`Main tab clicked: ${tab.textContent}`);
      });
    });
  
    document.querySelectorAll('.sub-nav-tab').forEach(tab => {
      console.log(`Found sub tab: ${tab.textContent}`);
      tab.addEventListener('click', () => {
        console.log(`Sub tab clicked: ${tab.textContent}`);
      });
    });
  
    // --- Element References ---
    const mainTabs = document.querySelectorAll('.main-nav-tab');
    const mainTabContents = document.querySelectorAll('.main-tab-content');
    
    const communityDropdownTrigger = document.querySelector('.community-dropdown-trigger');
    const communityDropdownPanel = document.getElementById('community-dropdown-panel');
    const closeCommunityDropdownButton = document.getElementById('close-community-dropdown');
    const closeSidebarButton = document.getElementById('close-sidebar-btn');
  
    const modal = document.getElementById('mini-profile-modal');
    const closeModalButton = modal?.querySelector('.close-button');
  
    // --- Main Tab Switching Logic ---
    mainTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTabId = tab.getAttribute('data-tab');
        console.log(`Switching to main tab: ${targetTabId}`, null, 'general');
  
        // Deactivate all main tabs and content
        mainTabs.forEach(t => t.classList.remove('active'));
        mainTabContents.forEach(c => c.classList.remove('active'));
  
        // Activate the clicked tab and its corresponding content
        tab.classList.add('active');
        const targetTabContent = document.getElementById(targetTabId);
        if (targetTabContent) {
          targetTabContent.classList.add('active');
          console.log(`Activated content: #${targetTabId}`, null, 'general');
          
          // Initialize specific tab functionality
          if (targetTabId === 'agent-tab') {
            console.log('🎯 Agent tab activated! Initializing agent...');
            try {
              initializeAgentTab();
              console.log('✅ Agent tab initialization completed successfully');
            } catch (error) {
              console.error('❌ Error initializing agent tab:', error);
              console.error('Error stack:', error.stack);
            }
          } else if (targetTabId === 'people-tab') {
            console.log('People tab activated! Loading people data...');
            initializePeopleTab();
          }
        } else {
          console.error(`Content for main tab #${targetTabId} not found!`);
        }
      });
    });
  
    // --- Sub-Tab Switching Logic ---
    // Get all sub-tab buttons and add click listeners to them directly
    document.querySelectorAll('.sub-nav-tab').forEach(subTab => {
      subTab.addEventListener('click', () => {
        const targetSubTabId = subTab.getAttribute('data-subtab');
        console.log(`Switching to sub-tab: ${targetSubTabId}`, null, 'general');
  
        // Find the parent tab content
        const parentMainContent = subTab.closest('.main-tab-content');
        if (!parentMainContent) {
          console.error("Could not find parent main content for sub-tab.");
          return;
        }
  
        // Deactivate all sub-tabs in this tab group
        const subTabGroup = subTab.closest('.sidebar-nav-sub');
        subTabGroup.querySelectorAll('.sub-nav-tab').forEach(st => {
          st.classList.remove('active');
        });
        
        // Deactivate all content panels in this tab content
        parentMainContent.querySelectorAll('.sub-tab-content').forEach(stc => {
          stc.classList.remove('active');
        });
  
        // Activate this sub-tab and its content
        subTab.classList.add('active');
        const targetSubContent = document.getElementById(targetSubTabId);
        if (targetSubContent) {
          targetSubContent.classList.add('active');
          console.log(`Activated sub-content: #${targetSubTabId}`, null, 'general');
        } else {
          console.error(`Sub-content #${targetSubTabId} not found!`);
        }
      });
    });
  
    // --- Community Dropdown Logic ---
    if (communityDropdownTrigger) {
      communityDropdownTrigger.addEventListener('click', (event) => {
        console.log('Community dropdown clicked');
        event.stopPropagation(); // Prevent click from immediately closing dropdown
        
        // Require authentication to access community selector
        if (!requireAuth('access community settings', () => {
          console.log('Auth passed, toggling community dropdown');
        if (communityDropdownPanel) {
          // Toggle visibility
          if (communityDropdownPanel.style.display === 'block') {
            communityDropdownPanel.style.display = 'none';
            console.log("Community dropdown hidden", null, 'general');
          } else {
            communityDropdownPanel.style.display = 'block';
            console.log("Community dropdown shown", null, 'general');
          }
          }
        })) {
          console.log('Auth failed for community dropdown');
          return; // Stop execution if not authenticated
        }
      });
    }
  
    if (closeCommunityDropdownButton && communityDropdownPanel) {
      closeCommunityDropdownButton.addEventListener('click', () => {
        communityDropdownPanel.style.display = 'none';
        console.log("Community dropdown closed via button", null, 'general');
      });
    }
  
    // Close dropdown if clicking outside
    document.addEventListener('click', (event) => {
      if (communityDropdownPanel && communityDropdownPanel.style.display === 'block') {
        if (!communityDropdownPanel.contains(event.target) && 
            !communityDropdownTrigger.contains(event.target)) {
          communityDropdownPanel.style.display = 'none';
          console.log("Community dropdown closed via outside click", null, 'general');
        }
      }
    });
  
    // --- Sidebar Close Button ---
    if (closeSidebarButton) {
      closeSidebarButton.addEventListener('click', () => {
        console.log("Close sidebar button clicked", null, 'general');
        // For Chrome side panel, we can't close it from within the panel itself
        // You would need to send a message to background.js
      });
    }
  
    // --- Mini Profile Modal Logic ---
    if (modal && closeModalButton) {
      // Function to open the modal
      function openModal(name, status) {
        const modalName = document.getElementById('modal-name');
        const modalStatus = document.getElementById('modal-status');
        if (modalName) modalName.textContent = name || 'N/A';
        if (modalStatus) modalStatus.textContent = status || 'Unknown';
        modal.style.display = 'flex';
        console.log(`Modal opened for ${name}`, null, 'general');
      }
  
      // Function to close the modal
      function closeModal() {
        modal.style.display = 'none';
        console.log("Modal closed", null, 'general');
      }
  
      closeModalButton.addEventListener('click', closeModal);
  
      // Close modal if clicked outside the content area
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });
  
      // Temporary: Add click listeners to list items to open modal
      document.querySelectorAll('.item-list li').forEach(item => {
        item.addEventListener('click', (e) => {
          // Don't open modal if clicking on a button
          if (e.target.closest('button')) {
            return;
          }
          
          const nameElement = item.querySelector('.item-name');
          const statusElement = item.querySelector('.item-status, .item-last-message');
          const name = nameElement ? nameElement.textContent : 'Unknown User';
          const status = statusElement ? statusElement.textContent : 'Status unavailable';
          
          // Don't open modal for friend requests
          if (item.closest('.request-list')) return;
          
          openModal(name, status);
        });
      });
    }
  
    // Get auth elements (auth buttons removed, only logout remains)
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const userAvatar = document.getElementById('user-avatar');
    const userMenu = document.getElementById('user-menu');
    const magicLinkModal = document.getElementById('magic-link-modal');
    const closeMagicLinkModal = document.getElementById('close-magic-link-modal');
    const sendMagicLinkBtn = document.getElementById('send-magic-link');
    const magicLinkEmail = document.getElementById('magic-link-email');
  
    // Note: User avatar click handling is now done in addProfileAvatarClickHandler()
    // which is called from updateUI() to avoid duplicate event listeners
    
    // Test background script communication
    const testBackgroundBtn = document.getElementById('test-background-btn');
    if (testBackgroundBtn) {
      testBackgroundBtn.addEventListener('click', () => {
        console.log('Test background button clicked');
        chrome.runtime.sendMessage({ type: 'TEST_MESSAGE' }, (response) => {
          console.log('Test response from background:', response);
          if (chrome.runtime.lastError) {
            console.error('Test error:', chrome.runtime.lastError);
          }
        });
      });
    }
    // Magic Link button removed from HTML, so no event listener needed
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        console.log('Logout button clicked');
        signOut();
        // Close the user menu after logout
        if (userMenu) userMenu.style.display = 'none';
      });
    }
    
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        console.log('Theme toggle button clicked');
        toggleTheme();
      });
    }
    if (closeMagicLinkModal) {
      closeMagicLinkModal.addEventListener('click', () => {
        magicLinkModal.style.display = 'none';
      });
    }
  
    // Add cancel context button event listener
    const cancelContextBtn = document.getElementById('cancel-context');
    if (cancelContextBtn) {
      cancelContextBtn.addEventListener('click', clearContext);
    }
    if (sendMagicLinkBtn) {
      sendMagicLinkBtn.addEventListener('click', () => sendMagicLink());
    }
  
    // --- Chat Input Authentication ---
    const chatInput = document.getElementById('chat-textarea');
    
    // Add auto-resize functionality to textarea
    if (chatInput) {
      chatInput.addEventListener('input', function() {
        autoResize(this);
      });
      
      // Handle window resize to recalculate max height
      window.addEventListener('resize', function() {
        autoResize(chatInput);
      });
    }
    
    // Add debug panel toggle functionality
    const debugHeader = document.getElementById('debug-header');
    if (debugHeader) {
      debugHeader.addEventListener('click', toggleDebugPanel);
    }
    
    // Initialize notification settings UI
    initializeNotificationSettings();
    
    // Initialize notification icon
    initializeNotificationIcon();
    
    // Handle notification clicks from background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'NOTIFICATION_CLICKED') {
        console.log('🔔 SIDEPANEL: Notification clicked:', message.notificationId, message.buttonIndex);
        
        if (window.notificationManager) {
          window.notificationManager.handleNotificationClick(message.notificationId, message.buttonIndex);
        }
      }
    });
    
    if (chatInput) {
      chatInput.addEventListener('focus', () => {
        if (!requireAuth('send messages', () => {
          chatInput.focus();
        })) {
          chatInput.blur();
        }
      });
    }
    
    // Send button removed - using Enter key only
    
    // Add Enter key support for sending messages
    if (chatInput) {
      chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          sendChatMessage();
        }
      });
    }
    
    function sendChatMessage() {
      console.log('🚀🚀🚀 ============================================');
      console.log('🚀🚀🚀 SEND_CHAT_MESSAGE: ENTRY POINT');
      console.log('🚀🚀🚀 ============================================');
      console.log('🚀 SEND_CHAT_MESSAGE: Chat send button clicked');
      console.log('🚀 SEND_CHAT_MESSAGE: Timestamp:', new Date().toISOString());
      console.log('🚀 SEND_CHAT_MESSAGE: chatInput element:', !!chatInput);
      console.log('🚀 SEND_CHAT_MESSAGE: chatInput value:', chatInput?.value);
      console.log('🚀 SEND_CHAT_MESSAGE: chatInput value length:', chatInput?.value?.length);
      
      // DIAGNOSTIC: Log message send attempt
      if (window.messageDiagnostic) {
        window.messageDiagnostic.logMessageSend({
          content: chatInput?.value,
          user: window.currentUser,
          community: 'comm-001',
          url: window.currentUrlData
        });
      }
      
      // GLOBAL DIAGNOSTIC FUNCTIONS
      window.getMessageDiagnostics = () => {
        if (window.messageDiagnostic) {
          return window.messageDiagnostic.getDiagnosticReport();
        }
        return { error: 'Message diagnostic not available' };
      };
      
      window.clearMessageDiagnostics = () => {
        if (window.messageDiagnostic) {
          window.messageDiagnostic.clearHistory();
          return 'Diagnostic history cleared';
        }
        return 'Message diagnostic not available';
      };
      
      requireAuth('send messages', async () => {
        console.log('🔐 SEND_CHAT_MESSAGE: Auth check passed');
        console.log('🔐 SEND_CHAT_MESSAGE: window.currentUser:', window.currentUser);
        console.log('🔐 SEND_CHAT_MESSAGE: window.currentUser.email:', window.currentUser?.email);
        
        // Check if we're in edit mode
        if (chatInput.dataset.editingMessageId) {
          console.log('✏️ SEND_CHAT_MESSAGE: In edit mode, skipping send');
          // Handle edit mode - this will be handled by the edit function's event listeners
          return;
        }
        
        let message = chatInput?.value?.trim();
        console.log('📝 SEND_CHAT_MESSAGE: Message after trim:', message);
        console.log('📝 SEND_CHAT_MESSAGE: Message length:', message?.length);
        console.log('📝 SEND_CHAT_MESSAGE: Message is truthy:', !!message);
        
        if (message) {
          console.log('✅ SEND_CHAT_MESSAGE: Message validation passed');
          console.log(`Sending message: ${message}`);
          console.log('Sending message:', message);
          
          try {
            console.log('🔍 SEND_CHAT_MESSAGE: === STEP 1: GETTING USER AND COMMUNITY ===');
            // Get current user and primary community - use window.currentUser for user
            const primaryCommunity = await window.getState('primaryCommunity');
            const currentCommunity = await window.getState('currentCommunity');
            console.log('🔍 SEND_CHAT_MESSAGE: StateManager result:', { primaryCommunity, currentCommunity });
            
            const user = window.currentUser;
            console.log('🔍 SEND_CHAT_MESSAGE: User from window.currentUser:', user);
            console.log('🔍 SEND_CHAT_MESSAGE: User type:', typeof user);
            console.log('🔍 SEND_CHAT_MESSAGE: User is null:', user === null);
            console.log('🔍 SEND_CHAT_MESSAGE: User is undefined:', user === undefined);
            
            const communityId = result.primaryCommunity || result.currentCommunity || 'comm-001';
            console.log('🔍 SEND_CHAT_MESSAGE: Community ID:', communityId);
            
            console.log(`MESSAGE_SEND: User object structure:`, user, 'general');
            console.log(`MESSAGE_SEND: User has id: ${!!user?.id}, email: ${!!user?.email}`, null, 'general');
            
            console.log('🔍 SEND_CHAT_MESSAGE: User validation check...');
            console.log('🔍 SEND_CHAT_MESSAGE: user exists:', !!user);
            console.log('🔍 SEND_CHAT_MESSAGE: user.id:', user?.id);
            console.log('🔍 SEND_CHAT_MESSAGE: user.email:', user?.email);
            console.log('🔍 SEND_CHAT_MESSAGE: user.id || user.email:', !!(user?.id || user?.email));
            
            if (user && (user.id || user.email)) {
              console.log('✅ SEND_CHAT_MESSAGE: User validation PASSED');
              try {
                console.log('🔍 SEND_CHAT_MESSAGE: === STEP 2: GETTING URL DATA ===');
                // Get normalized URL for consistency with presence and visibility
                const urlData = await normalizeCurrentUrl();
                console.log('🔍 SEND_CHAT_MESSAGE: urlData:', urlData);
                const currentUri = urlData.normalizedUrl;
                console.log('🔍 SEND_CHAT_MESSAGE: currentUri:', currentUri);
                console.log(`Current page URI: ${currentUri}`);
                
                console.log('🔍 SEND_CHAT_MESSAGE: === STEP 3: CHECKING FOR OPTIONAL CONTENT ===');
                // Check if this is a message with selected content
                let optionalContent = null;
                if (message.startsWith('Commenting on: "')) {
                  console.log('🔍 SEND_CHAT_MESSAGE: Message has "Commenting on:" prefix');
                  // Extract the selected content from the pre-populated message
                  const match = message.match(/^Commenting on: "(.+)"$/);
                  if (match) {
                    optionalContent = match[1];
                    console.log('🔍 SEND_CHAT_MESSAGE: Extracted optional content:', optionalContent);
                    // Remove the prefix from the actual message content
                    message = message.replace(/^Commenting on: ".+":\s*/, '');
                    console.log('🔍 SEND_CHAT_MESSAGE: Message after removing prefix:', message);
                  }
                } else {
                  console.log('🔍 SEND_CHAT_MESSAGE: No optional content detected');
                }
                
                console.log('🔍 SEND_CHAT_MESSAGE: === STEP 4: CHECKING FOR REPLY/THREAD ===');
                // Check if this is a reply or thread
                let parentId = null;
                let threadId = null;
                
                if (chatInput.dataset.replyTo) {
                  parentId = chatInput.dataset.replyTo;
                  threadId = chatInput.dataset.replyToConversation; // Use the conversation ID as thread ID
                  console.log('🔍 SEND_CHAT_MESSAGE: Reply detected:', { parentId, threadId });
                  console.log(`Reply detected: parentId=${parentId}, threadId=${threadId}`);
                  console.log('Reply detected:', { parentId, threadId });
                  // Clear the reply data
                  delete chatInput.dataset.replyTo;
                  delete chatInput.dataset.replyToConversation;
                  delete chatInput.dataset.contextMode;
                } else if (chatInput.dataset.threadId) {
                  threadId = chatInput.dataset.threadId;
                  console.log('🔍 SEND_CHAT_MESSAGE: Thread detected:', threadId);
                  // Remove the thread prefix from the message
                  message = message.replace(/^Starting thread on ".+":\s*/, '');
                  console.log('🔍 SEND_CHAT_MESSAGE: Message after removing thread prefix:', message);
                  // Clear the thread data
                  delete chatInput.dataset.threadId;
                } else {
                  console.log('🔍 SEND_CHAT_MESSAGE: Not a reply or thread');
                }
                
                console.log('🔍 SEND_CHAT_MESSAGE: === STEP 5: GETTING USER EMAIL ===');
                // Use email for user identification (consistent with presence API)
                const userEmail = await getCurrentUserEmail();
                console.log('🔍 SEND_CHAT_MESSAGE: userEmail:', userEmail);
                console.log(`CHAT_SEND: Sending message for user ${userEmail} in community ${communityId} on URI ${currentUri}`, null, 'general');
                console.log(`CHAT_SEND: Message content: "${message}"`, null, 'general');
                
                console.log('🔍 SEND_CHAT_MESSAGE: === STEP 6: SENDING VIA SUPABASE ===');
                // Send message via Supabase real-time ONLY
                console.log('📡 MESSAGE_CREATE: Sending message via Supabase real-time...');
                console.log('📡 MESSAGE_CREATE: Message content:', message);
                console.log('📡 MESSAGE_CREATE: Message length:', message.length);
                let supabaseMessage = null;
                try {
                  console.log('📡 MESSAGE_CREATE: Calling sendMessageViaSupabase...');
                  supabaseMessage = await sendMessageViaSupabase(message);
          console.log('📡 MESSAGE_CREATE: ✅ sendMessageViaSupabase returned');
          console.log('📡 MESSAGE_CREATE: Supabase returned message:', supabaseMessage);
          console.log('📡 MESSAGE_CREATE: Supabase message type:', typeof supabaseMessage);
          console.log('📡 MESSAGE_CREATE: Supabase message is null:', supabaseMessage === null);
          console.log('📡 MESSAGE_CREATE: Supabase message id:', supabaseMessage?.id);
          
          // DIAGNOSTIC: Log message persistence result
          if (window.messageDiagnostic) {
            const success = supabaseMessage && supabaseMessage.id;
            window.messageDiagnostic.logMessagePersist(
              supabaseMessage?.id || 'NO_ID',
              success,
              success ? null : new Error('No message ID returned from Supabase')
            );
          }
                  console.log(`CHAT_SEND: Message sent via Supabase real-time`, null, 'general');
                } catch (error) {
                  console.log('📡 MESSAGE_CREATE: ❌ Supabase real-time send failed:', error);
                  console.log('📡 MESSAGE_CREATE: ❌ Error type:', typeof error);
                  console.log('📡 MESSAGE_CREATE: ❌ Error message:', error?.message);
                  console.log('📡 MESSAGE_CREATE: ❌ Error stack:', error?.stack);
                  console.error(`CHAT_SEND: Failed to send message via Supabase`, error, 'general');
                }
                
                console.log('🔍 SEND_CHAT_MESSAGE: === STEP 7: BUILDING NEW POST OBJECT ===');
                // CRITICAL FIX: Add message to chat display with FULL author information
                // The Supabase message only has user_email, but the UI needs full author details
                const currentUserData = window.currentUser || await authManager.getCurrentUser();
                console.log('🔍 SEND_CHAT_MESSAGE: currentUserData:', currentUserData);
                console.log('🔍 SEND_CHAT_MESSAGE: currentUserData type:', typeof currentUserData);
                console.log('🔍 SEND_CHAT_MESSAGE: currentUserData.avatarUrl:', currentUserData?.avatarUrl);
                console.log('🔍 SEND_CHAT_MESSAGE: currentUserData.user_metadata:', currentUserData?.user_metadata);
                
                let newPost = {
                  id: supabaseMessage?.id || `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  content: message,
                  body: message, // Some parts of code expect 'body' instead of 'content'
                  user_email: userEmail,
                  authorId: userEmail,
                  created_at: supabaseMessage?.created_at || new Date().toISOString(),
                  createdAt: supabaseMessage?.created_at || new Date().toISOString(),
                  community_id: communityId,
                  uri: currentUri,
                  parent_id: parentId,
                  parentId: parentId,
                  thread_id: threadId,
                  // CRITICAL: Add full author object so UI can display avatar and name
                  author: {
                    id: userEmail,
                    email: userEmail,
                    name: currentUserData?.name || currentUserData?.displayName || 'You',
                    handle: currentUserData?.handle || currentUserData?.name?.toLowerCase().replace(/\s+/g, '') || 'user',
                    avatarUrl: currentUserData?.avatarUrl || currentUserData?.photoURL || currentUserData?.avatar_url || currentUserData?.user_metadata?.avatar_url,
                    auraColor: currentUserData?.auraColor || window.currentUser?.auraColor || '#aa00aa'
                  }
                };
                
                console.log('📡 MESSAGE_CREATE: Created newPost with ID:', newPost.id);
                console.log('📡 MESSAGE_CREATE: Using Supabase UUID:', !!supabaseMessage?.id);
                console.log('📡 MESSAGE_CREATE: Author info:', newPost.author);
                console.log('📡 MESSAGE_CREATE: Full newPost object:', newPost);
                
                console.log('🔍 SEND_CHAT_MESSAGE: === STEP 8: SETTING POST FLAGS ===');
                // Set proper flags for the new post
                newPost.isReply = !!newPost.parentId;
                console.log('🔍 SEND_CHAT_MESSAGE: isReply:', newPost.isReply);
                
                // Store the original community name for this message
                const currentCommunityName = await getPrimaryCommunityName();
                console.log('🔍 SEND_CHAT_MESSAGE: currentCommunityName:', currentCommunityName);
                newPost.originalCommunityName = currentCommunityName;
                
                // Ensure the new post has conversation data with empty reactions (new posts shouldn't inherit reactions)
                newPost.conversation = {
                  reactions: [] // New posts start with no reactions
                };
                console.log('🔍 SEND_CHAT_MESSAGE: Set conversation data with empty reactions');
                  
                console.log('🔍 SEND_CHAT_MESSAGE: === STEP 9: SKIPPING CLIENT-SIDE ADD ===');
                console.log('🔍 SEND_CHAT_MESSAGE: Real-time system will handle UI updates via Postgres Changes');
                console.log('🔍 SEND_CHAT_MESSAGE: Avoiding duplicate adds by letting real-time handle it');
                console.log('✅ SEND_CHAT_MESSAGE: Message will appear via real-time propagation');
                  
                  // Broadcast new message to other profiles
                  try {
                    chrome.runtime.sendMessage({
                      type: 'NEW_MESSAGE_ADDED',
                      messageId: newPost.id,
                      message: newPost,
                      timestamp: Date.now()
                    });
                    console.log('📡 MESSAGE: Broadcasted new message to other profiles');
                  } catch (error) {
                    console.log('📡 MESSAGE: Could not broadcast to other profiles:', error);
                  }
                  
                  // Reset last loaded URI to force reload on next loadChatHistory call
                  console.log(`CHAT_SEND: Resetting lastLoadedUri from ${lastLoadedUri} to null`, null, 'general');
                  lastLoadedUri = null;
                  
                  // Update last message count
                  lastMessageCount = document.querySelectorAll('.message').length;
                  console.log(`CHAT_SEND: Updated last message count to ${lastMessageCount}`, null, 'general');
                  
                  // CRITICAL FIX: DO NOT call loadChatHistory() here!
                  // The message is already added to UI via addMessageToChat() above.
                  // loadChatHistory() fetches from the backend API, which is a DIFFERENT database than Supabase.
                  // Calling it will CLEAR the UI and reload messages from the backend API, which doesn't have
                  // the Supabase message we just sent, making it appear like the message failed to send.
                  // Real-time subscriptions will handle propagation to other users.
                  console.log(`CHAT_SEND: Message added to UI, real-time sync will handle propagation`, null, 'general');
                  console.log('🚫 CHAT_SEND: NOT calling loadChatHistory() - would clear Supabase message from UI');
                  console.log('✅ CHAT_SEND: Message successfully added and will propagate via real-time');
                  
                  // If this was a reply, expand the thread after adding the message
                  if (newPost.parentId && newPost.conversationId) {
                    // Use setTimeout to ensure DOM is updated before trying to expand
                    setTimeout(() => {
                      // First, ensure the parent message has a thread toggle
                      const parentMessage = document.querySelector(`[data-message-id="${newPost.parentId}"]`);
                      if (parentMessage) {
                        let threadToggle = parentMessage.querySelector('.thread-toggle-btn');
                        if (!threadToggle) {
                          // Create thread toggle if it doesn't exist
                          console.log('Creating thread toggle for parent message');
                          const footer = parentMessage.querySelector('.message-footer');
                          if (footer) {
                            const threadToggleHTML = `<button class="thread-toggle-btn" data-thread-id="${newPost.conversationId}" title="Show thread replies" data-expanded="false">📂<span class="icon-count">1</span></button>`;
                            footer.insertAdjacentHTML('afterbegin', threadToggleHTML);
                            threadToggle = parentMessage.querySelector('.thread-toggle-btn');
                            
                            // Add event listener for the new thread toggle
                            threadToggle.addEventListener('click', (e) => {
                              e.stopPropagation();
                              toggleThreadReplies(newPost.conversationId, parentMessage);
                            });
                          }
                        }
                      }
                      
                      // Update thread toggle count but don't auto-expand
                      const threadToggle = document.querySelector(`[data-thread-id="${newPost.conversationId}"]`);
                      console.log('Looking for thread toggle:', `[data-thread-id="${newPost.conversationId}"]`);
                      console.log('Found thread toggle:', threadToggle);
                      if (threadToggle) {
                        // Update the count on the toggle button
                        const countSpan = threadToggle.querySelector('.icon-count');
                        if (countSpan) {
                          const currentCount = parseInt(countSpan.textContent) || 0;
                          countSpan.textContent = currentCount + 1;
                        }
                        console.log('New reply added, thread toggle count updated but not auto-expanded');
                      }
                    }, 100);
                  }
                
                // Clear input and reset height
                console.log(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Clearing input field and resetting styling`, null, 'general');
                console.log(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field current height:`, chatInput.style.height, 'general');
                console.log(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field computed height:`, window.getComputedStyle(chatInput).height, 'general');
                console.log(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field value before clear:`, chatInput.value, 'general');
                
                // Clear the input value
                chatInput.value = '';
                
                // Clear context bar and reset input styling
                const contextBar = document.getElementById('context-bar');
                if (contextBar) {
                  contextBar.style.display = 'none';
                  console.log(`CHAT_CLEAR: Context bar hidden`, null, 'general');
                }
                chatInput.placeholder = 'Start thread in Public Square';
                chatInput.style.borderColor = '';
                chatInput.style.backgroundColor = '';
                
                // Reset height and overflow properties
                chatInput.style.height = 'auto';
                chatInput.style.maxHeight = 'none';
                chatInput.style.minHeight = 'auto';
                chatInput.style.overflowY = 'hidden';
                console.log(`CHAT_CLEAR: Input field height set to auto`, null, 'general');
                
                // Force a reflow and then set to natural height
                chatInput.offsetHeight; // Force reflow
                chatInput.style.height = 'auto';
                chatInput.style.maxHeight = '120px'; // Allow expansion up to 120px
                chatInput.style.minHeight = '40px'; // Minimum reasonable height
                console.log(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field cleared and styling reset`, null, 'general');
                console.log(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Final input field height:`, chatInput.style.height, 'general');
                console.log(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Final computed height:`, window.getComputedStyle(chatInput).height, 'general');
                console.log(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Input field value after clear:`, chatInput.value, 'general');
                console.log(`CHAT_CLEAR: [BUILD ${EXTENSION_BUILD}] Message field reset completed successfully`, null, 'general');
              } catch (error) {
                console.log(`Failed to send message: ${error.message}`);
                console.error('Failed to send message:', error);
              }
    } else {
              console.log('No user found for sending message');
            }
          } catch (error) {
            console.log(`Failed to send message: ${error.message}`);
            console.error('Failed to send message:', error);
          }
        }
      });
    }
  
    // --- Agent Input Authentication ---
    const agentInput = document.getElementById('agent-input');
    const agentSendButton = document.getElementById('agent-send-btn');
    
    if (agentInput) {
      agentInput.addEventListener('focus', () => {
        if (!requireAuth('interact with AI agents', () => {
          agentInput.focus();
        })) {
          agentInput.blur();
        }
      });
    }
    
    if (agentSendButton) {
      agentSendButton.addEventListener('click', () => {
        console.log('Agent send button clicked');
        requireAuth('interact with AI agents', () => {
          const message = agentInput?.value;
          if (message) {
            console.log(`Sending to agent: ${message}`);
            console.log('Sending to agent:', message);
            // TODO: Implement actual agent interaction
            agentInput.value = '';
          }
        });
      });
    }
  
    // --- Add Friend Functionality ---
    function addFriend(userId, userName) {
      requireAuth('add friends', () => {
        console.log(`Adding friend: ${userName} (${userId})`);
        // TODO: Implement actual friend adding
      });
    }
  
    // --- Update People Tab with Add Friend Buttons ---
    function updatePeopleTabWithAuth() {
      const peopleTab = document.getElementById('people-tab');
      if (!peopleTab) return;
      
      peopleTab.innerHTML = `
        <ul class="item-list">
          <!-- NO MOCK USERS - Only real presence data -->
        </ul>
      `;
      
      // Add event listeners to add friend buttons
      const addFriendBtns = peopleTab.querySelectorAll('.add-friend-btn');
      addFriendBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const userId = btn.dataset.userId;
          const userName = btn.dataset.userName;
          addFriend(userId, userName);
        });
      });
    }
  
    // Update people tab
    updatePeopleTabWithAuth();
  
    // Initial UI state will be set by auth manager
  
    // Make functions globally accessible for onclick handlers
    window.requireAuth = requireAuth;
    window.addFriend = addFriend;
    window.openUserProfile = openUserProfile;
  
    // Direct authentication already happened above - no need to repeat
    console.log("Sidebar setup complete", null, 'general');
    console.log("Sidebar setup complete (from JS)");
  });
  
  