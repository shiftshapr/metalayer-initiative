/**
 * UIManager.js - User Interface Management Module
 * Extracted from sidepanel.js for modular architecture
 * 
 * Responsibilities:
 * - DOM manipulation and updates
 * - UI state management
 * - Event delegation
 * - UI component creation
 */

class UIManager {
  constructor() {
    this.uiState = {
      activeTab: 'visibility',
      isVisible: false,
      isLoading: false,
      hasError: false
    };
    
    this.uiCallbacks = [];
    this.eventListeners = new Map();
    
    console.log('UIManager initialized', null, 'ui');
    this.initializeUI();
  }

  /**
   * Initialize UI components and event listeners
   */
  initializeUI() {
    console.log('Initializing UI components', null, 'ui');
    
    this.setupTabNavigation();
    this.setupEventListeners();
    this.initializeModals();
    this.updateUIState();
    
    // COMP METHOD: Initialize COMP method fixes
    this.initializeCOMPMethodFixes();
  }

  /**
   * Initialize COMP method fixes for UI elements
   */
  initializeCOMPMethodFixes() {
    console.log('Initializing COMP method fixes', null, 'ui');
    
    // Fix message UI elements
    this.fixMessageUIElements();
    
    // Fix visible tab
    this.fixVisibleTab();
    
    // Fix profile menu
    this.fixProfileMenu();
    
    // Fix message input
    this.fixMessageInput();
  }

  /**
   * COMP METHOD: Fix message UI elements
   */
  fixMessageUIElements() {
    console.log('COMP METHOD: Fixing message UI elements', null, 'ui');
    
    const messages = document.querySelectorAll('.message');
    messages.forEach((message, index) => {
      // Fix avatar display
      const avatar = message.querySelector('.message-avatar img');
      if (avatar && avatar.src.includes('gravatar.com') && avatar.dataset.avatarFallback === 'true') {
        const userEmail = avatar.dataset.userEmail;
        if (userEmail) {
          avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail.split('@')[0])}&background=random&color=fff&size=200`;
        }
      }
      
      // Fix author name
      const authorName = message.querySelector('.message-author');
      if (authorName && !authorName.textContent.trim()) {
        const userEmail = message.dataset.userEmail || message.querySelector('[data-user-email]')?.dataset.userEmail;
        if (userEmail) {
          authorName.textContent = userEmail.split('@')[0];
        }
      }
      
      // Fix community info
      const community = message.querySelector('.message-community');
      if (community && !community.textContent.trim()) {
        community.textContent = 'Metalayer';
      }
      
      // Fix message menu
      if (!message.querySelector('.message-menu')) {
        const menuButton = document.createElement('button');
        menuButton.className = 'message-menu';
        menuButton.innerHTML = '⋮';
        menuButton.title = 'Message options';
        message.appendChild(menuButton);
      }
      
      // Fix reactions
      if (!message.querySelector('.message-reactions')) {
        const reactionsDiv = document.createElement('div');
        reactionsDiv.className = 'message-reactions';
        reactionsDiv.innerHTML = `
          <button class="reaction-btn" data-emoji="👍">👍</button>
          <button class="reaction-btn" data-emoji="❤️">❤️</button>
          <button class="reaction-btn" data-emoji="😂">😂</button>
          <button class="reaction-btn" data-emoji="😮">😮</button>
        `;
        message.appendChild(reactionsDiv);
      }
      
      // Fix replies
      if (!message.querySelector('.message-replies')) {
        const repliesDiv = document.createElement('div');
        repliesDiv.className = 'message-replies';
        repliesDiv.innerHTML = `<button class="reply-btn">Reply</button>`;
        message.appendChild(repliesDiv);
      }
    });
    
    console.log('COMP METHOD: Message UI elements fixed', null, 'ui');
  }

  /**
   * COMP METHOD: Fix visible tab using exact COMP method
   */
  fixVisibleTab() {
    console.log('COMP METHOD: Fixing visible tab using COMP method', null, 'ui');
    
    // COMP METHOD: Use the exact COMP updateVisibleTab function
    if (typeof window.updateVisibleTab === 'function') {
      console.log('COMP METHOD: Using COMP updateVisibleTab function', null, 'ui');
      
      // COMP METHOD: Get current user and add to visibility list
      if (window.currentUser && window.currentUser.email) {
        const currentUserAvatar = {
          email: window.currentUser.email,
          name: window.currentUser.name || window.currentUser.email,
          avatarUrl: window.currentUser.avatarUrl || window.currentUser.avatar,
          status: 'active',
          isCurrentUser: true
        };
        
        console.log('COMP METHOD: Adding current user to visibility list', null, 'ui');
        window.updateVisibleTab([currentUserAvatar]);
      } else {
        console.log('COMP METHOD: No current user, showing empty list', null, 'ui');
        window.updateVisibleTab([]);
      }
    } else {
      console.log('COMP METHOD: updateVisibleTab not available, using fallback', null, 'ui');
      this.fixVisibleTabFallback();
    }
    
    console.log('COMP METHOD: Visible tab fixed using COMP method', null, 'ui');
  }

  /**
   * COMP METHOD: Fallback visible tab fix
   */
  fixVisibleTabFallback() {
    console.log('COMP METHOD: Using fallback visible tab fix', null, 'ui');
    
    const visibleTab = document.querySelector('#visible-tab');
    if (!visibleTab) return;
    
    // COMP METHOD: Always show current user in visible tab
    if (window.currentUser && window.currentUser.email) {
      visibleTab.innerHTML = '';
      const profileDiv = document.createElement('div');
      profileDiv.className = 'profile-item';
      profileDiv.innerHTML = `
        <div class="profile-avatar">
          <img src="${window.currentUser.avatarUrl || window.currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(window.currentUser.name || window.currentUser.email)}&background=random&color=fff&size=200`}" alt="${window.currentUser.name || window.currentUser.email}">
        </div>
        <div class="profile-info">
          <div class="profile-name">${window.currentUser.name || window.currentUser.email}</div>
          <div class="profile-status">Active</div>
        </div>
      `;
      visibleTab.appendChild(profileDiv);
    } else {
      visibleTab.innerHTML = '<div class="no-users">No active users on this page</div>';
    }
  }

  /**
   * COMP METHOD: Fix profile menu
   */
  fixProfileMenu() {
    console.log('COMP METHOD: Fixing profile menu', null, 'ui');
    
    const profileMenu = document.querySelector('.profile-menu');
    if (!profileMenu) {
      try {
        const menuDiv = document.createElement('div');
        menuDiv.className = 'profile-menu';
        
        // Safe template literal with proper escaping
        const userName = window.currentUser?.name || 'User';
        const userEmail = window.currentUser?.email || 'user@example.com';
        const userAvatar = window.currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=200`;
        
        menuDiv.innerHTML = `
          <div class="profile-menu-header">
            <div class="profile-avatar">
              <img src="${userAvatar}" alt="${userName}">
            </div>
            <div class="profile-info">
              <div class="profile-name">${userName}</div>
              <div class="profile-email">${userEmail}</div>
            </div>
          </div>
          <div class="profile-menu-actions">
            <button class="profile-action">Settings</button>
            <button class="profile-action">Help</button>
            <button class="profile-action">Sign Out</button>
          </div>
        `;
        
        const profileButton = document.querySelector('.profile-button');
        if (profileButton) {
          profileButton.appendChild(menuDiv);
        } else {
          // COMP METHOD: Use a safer fallback
          const userInfoDiv = document.querySelector('#user-info');
          if (userInfoDiv) {
            userInfoDiv.appendChild(menuDiv);
          } else {
            console.warn('COMP METHOD: No suitable container found for profile menu', null, 'ui');
            return;
          }
        }
        
        console.log('COMP METHOD: Profile menu created successfully', null, 'ui');
      } catch (error) {
        console.error('COMP METHOD: Error creating profile menu:', error, null, 'ui');
      }
    } else {
      console.log('COMP METHOD: Profile menu already exists', null, 'ui');
    }
    
    console.log('COMP METHOD: Profile menu fixed', null, 'ui');
  }

  /**
   * COMP METHOD: Fix message input
   */
  fixMessageInput() {
    console.log('COMP METHOD: Fixing message input', null, 'ui');
    
    const messageInput = document.querySelector('#messageInput, #chat-textarea');
    if (messageInput) {
      if (messageInput.dataset.replyingTo) {
        messageInput.dataset.replyingTo = '';
      }
      if (messageInput.dataset.editingMessageId) {
        messageInput.dataset.editingMessageId = '';
      }
      messageInput.placeholder = 'Type a message...';
      messageInput.disabled = false;
    }
    
    console.log('COMP METHOD: Message input fixed', null, 'ui');
  }

  /**
   * Setup tab navigation
   */
  setupTabNavigation() {
    console.log('Setting up tab navigation', null, 'ui');
    
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabId = e.target.dataset.tab;
        if (tabId) {
          this.switchTab(tabId);
        }
      });
    });
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    console.log('Setting up event listeners', null, 'ui');
    
    // Listen for visibility updates
    document.addEventListener('visibilityUpdated', (event) => {
      this.handleVisibilityUpdate(event.detail);
    });
    
    // Listen for profile updates
    document.addEventListener('profileUpdated', (event) => {
      this.handleProfileUpdate(event.detail);
    });
    
    // Listen for error events
    document.addEventListener('errorOccurred', (event) => {
      this.handleError(event.detail);
    });
  }

  /**
   * Initialize modal components
   */
  initializeModals() {
    console.log('Initializing modals', null, 'ui');
    
    // Create auth prompt modal if it doesn't exist
    if (!document.getElementById('auth-prompt-modal')) {
      this.createAuthPromptModal();
    }
    
    // Create error modal if it doesn't exist
    if (!document.getElementById('error-modal')) {
      this.createErrorModal();
    }
  }

  /**
   * Switch to specified tab
   */
  switchTab(tabId) {
    console.log(`Switching to tab: ${tabId}`, null);
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabId);
    });
    
    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      content.style.display = content.id === `${tabId}-tab` ? 'block' : 'none';
    });
    
    // Update UI state
    this.uiState.activeTab = tabId;
    this.updateUIState();
    
    // Dispatch tab change event
    document.dispatchEvent(new CustomEvent('tabChanged', {
      detail: { tabId, previousTab: this.uiState.activeTab }
    }));
  }

  /**
   * Handle visibility updates
   */
  handleVisibilityUpdate(visibilityData) {
    console.log('Handling visibility update', visibilityData);
    
    this.updateVisibilityDisplay(visibilityData);
  }

  /**
   * Update visibility display
   */
  updateVisibilityDisplay(visibilityData) {
    const visibilityTab = document.getElementById('visibility-tab');
    if (!visibilityTab) return;
    
    console.log('Updating visibility display', {
      userCount: visibilityData?.users?.length || 0
    });
    
    // Update user count
    const userCountElement = document.getElementById('user-count');
    if (userCountElement) {
      userCountElement.textContent = visibilityData?.users?.length || 0;
    }
    
    // Update user list
    this.updateUserList(visibilityData?.users || []);
  }

  /**
   * Update user list display
   */
  updateUserList(users) {
    const userListContainer = document.getElementById('user-list');
    if (!userListContainer) return;
    
    console.log(`Updating user list with ${users.length} users`, null);
    
    if (users.length === 0) {
      userListContainer.innerHTML = '<p class="no-users">No other users currently visible</p>';
      return;
    }
    
    // Create user list HTML
    const userListHTML = users.map(user => this.createUserListItem(user)).join('');
    userListContainer.innerHTML = userListHTML;
  }

  /**
   * Create user list item HTML
   */
  createUserListItem(user) {
    const avatarHTML = this.createUserAvatar(user);
    const statusClass = user.isActive ? 'online' : 'offline';
    const lastSeen = this.formatLastSeen(user.lastSeen);
    
    return `
      <div class="user-item ${statusClass}" data-user-id="${user.id}">
        <div class="user-avatar">${avatarHTML}</div>
        <div class="user-info">
          <div class="user-name">${user.name || user.email}</div>
          <div class="user-status">${user.isActive ? 'Online' : `Last seen ${lastSeen}`}</div>
        </div>
      </div>
    `;
  }

  /**
   * Create user avatar HTML
   */
  async createUserAvatar(user) {
    if (window.AvatarUtils) {
      return await window.AvatarUtils.createUnifiedAvatar(user, {
        context: 'visibility',
        showAura: true,
        size: 24
      });
    }
    
    // Fallback avatar
    return `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="position: absolute; top: -1px; left: -1px; width: 26px; height: 26px; border-radius: 50%; background-color: ${user.auraColor || '#aaaaaa'}; z-index: 1;"></div>
        <img src="${user.avatarUrl || 'https://lh3.googleusercontent.com/a/default-user=s96-c'}" 
             alt="${user.name || 'User'}" 
             style="position: relative; z-index: 2; width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid ${user.auraColor || '#aaaaaa'};">
      </div>
    `;
  }

  /**
   * Format last seen timestamp
   */
  formatLastSeen(timestamp) {
    if (!timestamp) return 'unknown';
    
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  /**
   * Handle profile updates
   */
  handleProfileUpdate(profileData) {
    console.log('Handling profile update', profileData);
    
    // Update any profile-related UI elements
    this.updateProfileElements(profileData);
  }

  /**
   * Update profile-related UI elements
   */
  updateProfileElements(profileData) {
    // Update user menu if it exists
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
      const userNameElement = userMenu.querySelector('.user-name');
      if (userNameElement) {
        userNameElement.textContent = profileData.name || profileData.email;
      }
    }
  }

  /**
   * Handle error events
   */
  handleError(errorData) {
    console.log('Handling error', errorData);
    
    this.showError(errorData.message || 'An error occurred', errorData.details);
  }

  /**
   * Show error message
   */
  showError(message, details = null) {
    console.error(`UI Error: ${message}`, details, 'ui');
    
    const errorModal = document.getElementById('error-modal');
    if (errorModal) {
      const messageElement = errorModal.querySelector('.error-message');
      const detailsElement = errorModal.querySelector('.error-details');
      
      if (messageElement) {
        messageElement.textContent = message;
      }
      
      if (detailsElement && details) {
        detailsElement.textContent = JSON.stringify(details, null, 2);
        detailsElement.style.display = 'block';
      } else {
        detailsElement.style.display = 'none';
      }
      
      errorModal.style.display = 'flex';
    }
  }

  /**
   * Create error modal
   */
  createErrorModal() {
    const modal = document.createElement('div');
    modal.id = 'error-modal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Error</h3>
        </div>
        <div class="modal-body">
          <p class="error-message">An error occurred</p>
          <pre class="error-details" style="display: none; font-size: 0.8em; background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; max-height: 200px;"></pre>
          <button id="error-modal-close" class="close-button">Close</button>
        </div>
      </div>
    `;
    
    if (document.body) {
      document.body.appendChild(modal);
    } else {
      console.warn('Document body not available, deferring error modal creation', null, 'ui');
      // Defer modal creation until DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body) {
            document.body.appendChild(modal);
          }
        });
      }
    }
    
    // Add event listeners
    const closeBtn = modal.querySelector('#error-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  /**
   * Create auth prompt modal
   */
  createAuthPromptModal() {
    const modal = document.createElement('div');
    modal.id = 'auth-prompt-modal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Sign In Required</h3>
        </div>
        <div class="modal-body">
          <p>You need to sign in to <span id="auth-prompt-action">perform this action</span>.</p>
          <p class="provider-info" id="auth-prompt-provider" style="font-size: 0.9em; color: #666; margin: 10px 0;"></p>
          <div class="auth-prompt-buttons">
            <button id="auth-prompt-google" class="auth-button google">Sign in with Google</button>
            <button id="auth-prompt-magic" class="auth-button magic">Sign in with Magic Link</button>
          </div>
          <button id="auth-prompt-cancel" class="cancel-button">Cancel</button>
        </div>
      </div>
    `;
    
    if (document.body) {
      document.body.appendChild(modal);
    } else {
      console.warn('Document body not available, deferring modal creation', null, 'ui');
      // Defer modal creation until DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body) {
            document.body.appendChild(modal);
          }
        });
      }
    }
  }

  /**
   * Update UI state
   */
  updateUIState() {
    console.log('Updating UI state', this.uiState, 'ui');
    
    // Notify callbacks
    this.uiCallbacks.forEach(callback => {
      try {
        callback(this.uiState);
      } catch (error) {
        console.error('UI callback error', error, 'ui');
      }
    });
  }

  /**
   * Show loading state
   */
  showLoading(message = 'Loading...') {
    console.log(`Showing loading: ${message}`, null);
    
    this.uiState.isLoading = true;
    this.updateUIState();
    
    // Show loading indicator if it exists
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
      loadingElement.textContent = message;
      loadingElement.style.display = 'block';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    console.log('Hiding loading', null);
    
    this.uiState.isLoading = false;
    this.updateUIState();
    
    // Hide loading indicator
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  /**
   * Register UI state callback
   */
  onUIStateChange(callback) {
    this.uiCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.uiCallbacks.indexOf(callback);
      if (index > -1) {
        this.uiCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current UI state
   */
  getUIState() {
    return { ...this.uiState };
  }

  /**
   * Setup tab navigation event listeners (FROM COMP)
   */
  setupTabNavigation() {
    console.log('🔗 TAB_NAVIGATION: Setting up tab navigation event listeners...');
    
    // Main tab switching logic
    const mainTabs = document.querySelectorAll('.main-nav-tab');
    const mainTabContents = document.querySelectorAll('.main-tab-content');
    
    mainTabs.forEach(tab => {
      this.addEventListeners(tab, 'click', () => {
        const targetTabId = tab.getAttribute('data-tab');
        console.log(`🔗 TAB_NAVIGATION: Switching to main tab: ${targetTabId}`);

        // Deactivate all main tabs and content
        mainTabs.forEach(t => t.classList.remove('active'));
        mainTabContents.forEach(c => c.classList.remove('active'));

        // Activate the clicked tab and its corresponding content
        tab.classList.add('active');
        const targetTabContent = document.getElementById(targetTabId);
        if (targetTabContent) {
          targetTabContent.classList.add('active');
          console.log(`✅ TAB_NAVIGATION: Activated content: #${targetTabId}`);
          
          // Initialize specific tab functionality
          if (targetTabId === 'agent-tab') {
            console.log('🎯 TAB_NAVIGATION: Agent tab activated! Initializing agent...');
            try {
              if (typeof window.initializeAgentTab === 'function') {
                window.initializeAgentTab();
                console.log('✅ TAB_NAVIGATION: Agent tab initialization completed successfully');
              }
            } catch (error) {
              console.error('❌ TAB_NAVIGATION: Agent tab initialization failed:', error);
            }
          }
        } else {
          console.error(`❌ TAB_NAVIGATION: Target content not found: #${targetTabId}`);
        }
      });
    });

    // Sub-tab switching logic
    document.querySelectorAll('.sub-nav-tab').forEach(subTab => {
      this.addEventListeners(subTab, 'click', () => {
        const targetSubTabId = subTab.getAttribute('data-subtab');
        console.log(`🔗 TAB_NAVIGATION: Switching to sub-tab: ${targetSubTabId}`);

        // Find the parent tab content
        const parentMainContent = subTab.closest('.main-tab-content');
        if (!parentMainContent) {
          console.error("❌ TAB_NAVIGATION: Could not find parent main content for sub-tab.");
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
        
        // Activate the clicked sub-tab and its content
        subTab.classList.add('active');
        const targetSubTabContent = document.getElementById(targetSubTabId);
        if (targetSubTabContent) {
          targetSubTabContent.classList.add('active');
          console.log(`✅ TAB_NAVIGATION: Activated sub-tab content: #${targetSubTabId}`);
        } else {
          console.error(`❌ TAB_NAVIGATION: Target sub-tab content not found: #${targetSubTabId}`);
        }
      });
    });

    console.log('✅ TAB_NAVIGATION: Tab navigation event listeners set up successfully');
  }

  /**
   * Setup message input event listeners (FROM COMP)
   */
  setupMessageInputEventListeners() {
    console.log('💬 MESSAGE_INPUT: Setting up message input event listeners...');
    
    const chatInput = document.getElementById('chat-textarea');
    if (!chatInput) {
      console.log('❌ MESSAGE_INPUT: chat-textarea not found');
      return;
    }

    // Add auto-resize functionality to textarea
    this.addEventListeners(chatInput, 'input', function() {
      autoResize(this);
    });
    
    // Handle window resize to recalculate max height
    this.addEventListeners(window, 'resize', function() {
      autoResize(chatInput);
    });

    // Add Enter key support for sending messages
    this.addEventListeners(chatInput, 'keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendChatMessage();
      }
    });

    console.log('✅ MESSAGE_INPUT: Message input event listeners added');
  }

  /**
   * Send chat message (FROM COMP)
   */
  sendChatMessage() {
    console.log('🚀🚀🚀 ============================================');
    console.log('🚀🚀🚀 SEND_CHAT_MESSAGE: ENTRY POINT');
    console.log('🚀🚀🚀 ============================================');
    
    const chatInput = document.getElementById('chat-textarea');
    if (!chatInput) {
      console.log('❌ SEND_CHAT_MESSAGE: chat-textarea not found');
      return;
    }
    
    console.log('🚀 SEND_CHAT_MESSAGE: Chat send triggered');
    console.log('🚀 SEND_CHAT_MESSAGE: chatInput element:', !!chatInput);
    console.log('🚀 SEND_CHAT_MESSAGE: chatInput value:', chatInput?.value);
    console.log('🚀 SEND_CHAT_MESSAGE: chatInput value length:', chatInput?.value?.length);
    
    // Check if we're in edit mode
    if (chatInput.dataset.editingMessageId) {
      console.log('✏️ SEND_CHAT_MESSAGE: In edit mode, skipping send');
      return;
    }
    
    let message = chatInput?.value?.trim();
    console.log('📝 SEND_CHAT_MESSAGE: Message after trim:', message);
    console.log('📝 SEND_CHAT_MESSAGE: Message length:', message?.length);
    
    if (!message) {
      console.log('❌ SEND_CHAT_MESSAGE: No message content');
      return;
    }
    
    // Use the existing sendMessageViaSupabase function
    if (typeof window.sendMessageViaSupabase === 'function') {
      console.log('📡 SEND_CHAT_MESSAGE: Calling sendMessageViaSupabase...');
      window.sendMessageViaSupabase(message).then((result) => {
        console.log('📡 SEND_CHAT_MESSAGE: Message sent successfully:', result);
        console.log('📡 SEND_CHAT_MESSAGE: Result type:', typeof result);
        console.log('📡 SEND_CHAT_MESSAGE: Result success:', result?.success);
        console.log('📡 SEND_CHAT_MESSAGE: Result id:', result?.id);
        console.log('📡 SEND_CHAT_MESSAGE: Result data:', result?.data);
        
        // CRITICAL: Check if message should be added to UI immediately
        console.log('🎯 UI_UPDATE: Checking if message should be added to UI...');
        console.log('🎯 UI_UPDATE: window.addMessageToChat available:', typeof window.addMessageToChat);
        console.log('🎯 UI_UPDATE: window.loadChatHistory available:', typeof window.loadChatHistory);
        
        if (result && result.success && result.data) {
          console.log('🎯 UI_UPDATE: Message sent successfully, adding to UI immediately...');
          console.log('🎯 UI_UPDATE: Message data:', result.data);
          
          // Add message to UI immediately
          if (typeof window.addMessageToChat === 'function') {
            console.log('🎯 UI_UPDATE: Calling window.addMessageToChat...');
            try {
              window.addMessageToChat(result.data);
              console.log('✅ UI_UPDATE: Message added to chat UI successfully');
            } catch (error) {
              console.error('❌ UI_UPDATE: Failed to add message to chat UI:', error);
            }
          } else {
            console.log('❌ UI_UPDATE: window.addMessageToChat not available');
            console.log('🎯 UI_UPDATE: Trying alternative - loadChatHistory...');
            if (typeof window.loadChatHistory === 'function') {
              console.log('🎯 UI_UPDATE: Calling window.loadChatHistory...');
              try {
                window.loadChatHistory();
                console.log('✅ UI_UPDATE: Chat history reloaded');
              } catch (error) {
                console.error('❌ UI_UPDATE: Failed to reload chat history:', error);
              }
            } else {
              console.log('❌ UI_UPDATE: No UI update methods available');
            }
          }
        } else {
          console.log('❌ UI_UPDATE: Message send failed or no data returned');
        }
        
        // Clear the input
        chatInput.value = '';
        console.log('🎯 UI_UPDATE: Input cleared, message send process complete');
      }).catch((error) => {
        console.error('❌ SEND_CHAT_MESSAGE: Failed to send message:', error);
      });
    } else {
      console.log('❌ SEND_CHAT_MESSAGE: sendMessageViaSupabase not available');
    }
  }

  /**
   * Add event listener with automatic cleanup tracking
   */
  addEventListeners(element, event, handler) {
    if (!element) {
      console.warn('UIManager: Cannot add event listener to null element');
      return;
    }
    
    // Add the event listener
    element.addEventListener(event, handler);
    
    // Track for cleanup
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ event, handler });
    
    console.log(`Added event listener: ${event} on element`, null, 'ui');
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    console.log('Cleaning up UI manager', null, 'ui');
    
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    
    this.eventListeners.clear();
    this.uiCallbacks = [];
  }
}

// ===== AUTO-RESIZE FUNCTION (FROM COMP) =====
function autoResize(textarea) {
  if (!textarea) return;
  
  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = 'auto';
  
  // Calculate the new height
  const maxHeight = 120; // Maximum height in pixels
  const newHeight = Math.min(textarea.scrollHeight, maxHeight);
  
  // Set the new height
  textarea.style.height = newHeight + 'px';
  
  // Show scrollbar if content exceeds max height
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

// ===== GLOBAL UI FUNCTIONS =====
function updateVisualHierarchy() {
  console.log('🔄 UI: updateVisualHierarchy called');
  // Update visual hierarchy for messages and UI elements
  if (window.UIManager && window.UIManager.updateVisualHierarchy) {
    window.UIManager.updateVisualHierarchy();
  }
}

function debugHierarchy() {
  console.log('🔍 UI: debugHierarchy called');
  // Debug visual hierarchy
  if (window.UIManager && window.UIManager.debugHierarchy) {
    window.UIManager.debugHierarchy();
  }
}

function forceRefreshCSS() {
  console.log('🔄 UI: forceRefreshCSS called');
  // Force CSS refresh
  if (window.UIManager && window.UIManager.forceRefreshCSS) {
    window.UIManager.forceRefreshCSS();
  }
}

// ===== TAB NAVIGATION EVENT LISTENERS (FROM COMP) =====
function setupTabNavigation() {
  console.log('🔗 TAB_NAV: Setting up tab navigation event listeners...');
  
  // Main tab navigation
  const mainTabs = document.querySelectorAll('.main-nav-tab');
  const mainTabContents = document.querySelectorAll('.main-tab-content');
  
  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTabId = tab.getAttribute('data-tab');
      console.log(`🔗 TAB_NAV: Switching to main tab: ${targetTabId}`);
      
      // Deactivate all main tabs and content
      mainTabs.forEach(t => t.classList.remove('active'));
      mainTabContents.forEach(c => c.classList.remove('active'));
      
      // Activate the clicked tab and its corresponding content
      tab.classList.add('active');
      const targetTabContent = document.getElementById(targetTabId);
      if (targetTabContent) {
        targetTabContent.classList.add('active');
        console.log(`✅ TAB_NAV: Activated tab: ${targetTabId}`);
      } else {
        console.error(`❌ TAB_NAV: Tab content not found: ${targetTabId}`);
      }
    });
  });
  
  // Sub-tab navigation
  document.querySelectorAll('.sub-nav-tab').forEach(subTab => {
    subTab.addEventListener('click', () => {
      const targetSubTabId = subTab.getAttribute('data-subtab');
      console.log(`🔗 TAB_NAV: Switching to sub-tab: ${targetSubTabId}`);
      
      // Find the parent tab content
      const parentMainContent = subTab.closest('.main-tab-content');
      if (!parentMainContent) {
        console.error("❌ TAB_NAV: Could not find parent main content for sub-tab.");
        return;
      }
      
      // Deactivate all sub-tabs and sub-content within this main tab
      const subTabs = parentMainContent.querySelectorAll('.sub-nav-tab');
      const subTabContents = parentMainContent.querySelectorAll('.sub-tab-content');
      
      subTabs.forEach(t => t.classList.remove('active'));
      subTabContents.forEach(c => c.classList.remove('active'));
      
      // Activate the clicked sub-tab and its content
      subTab.classList.add('active');
      const targetSubTabContent = document.getElementById(targetSubTabId);
      if (targetSubTabContent) {
        targetSubTabContent.classList.add('active');
        console.log(`✅ TAB_NAV: Activated sub-tab: ${targetSubTabId}`);
      } else {
        console.error(`❌ TAB_NAV: Sub-tab content not found: ${targetSubTabId}`);
      }
    });
  });
  
  console.log('✅ TAB_NAV: Tab navigation event listeners added');
}

// Create UIManager instance
const uiManager = new UIManager();

// Make available globally
window.UIManager = UIManager;
window.uiManager = uiManager;
window.updateVisualHierarchy = updateVisualHierarchy;
window.debugHierarchy = debugHierarchy;
window.forceRefreshCSS = forceRefreshCSS;
window.autoResize = autoResize;
window.setupTabNavigation = setupTabNavigation;
window.setupMessageInputEventListeners = setupMessageInputEventListeners;

// ===== GLOBAL FUNCTIONS (FROM COMP) =====
function setupTabNavigation() {
  console.log('🔗 TAB_NAVIGATION: Setting up tab navigation...');
  if (window.uiManager && window.uiManager.setupTabNavigation) {
    window.uiManager.setupTabNavigation();
    console.log('✅ TAB_NAVIGATION: Tab navigation setup completed');
  } else {
    console.log('❌ TAB_NAVIGATION: UIManager instance not available');
    console.log('❌ TAB_NAVIGATION: window.uiManager:', !!window.uiManager);
    console.log('❌ TAB_NAVIGATION: setupTabNavigation method:', typeof window.uiManager?.setupTabNavigation);
  }
}

function setupMessageInputEventListeners() {
  console.log('💬 MESSAGE_INPUT: Setting up message input event listeners...');
  if (window.uiManager && window.uiManager.setupMessageInputEventListeners) {
    window.uiManager.setupMessageInputEventListeners();
    console.log('✅ MESSAGE_INPUT: Message input event listeners setup completed');
  } else {
    console.log('❌ MESSAGE_INPUT: UIManager instance not available');
    console.log('❌ MESSAGE_INPUT: window.uiManager:', !!window.uiManager);
    console.log('❌ MESSAGE_INPUT: setupMessageInputEventListeners method:', typeof window.uiManager?.setupMessageInputEventListeners);
  }
}

console.log('UIManager module loaded', null, 'ui');

// ===== THEME FUNCTIONS (FROM COMP) =====
function initializeTheme() {
  // Load saved theme from storage or default to light
  // Modernized: Use StateManager instead of Chrome Storage
  if (typeof window.getState === 'function') {
    try {
      window.getState('theme').then((theme) => {
        const savedTheme = theme || 'light';
        setTheme(savedTheme);
      }).catch(() => {
        setTheme('light');
      });
    } catch (error) {
      console.log('Theme initialization failed, using default:', error);
      setTheme('light');
    }
  } else {
    // Fallback to light theme if getState is not available
    setTheme('light');
  }
}

function setTheme(theme) {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  
  if (theme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeText) themeText.textContent = 'Light mode';
  } else {
    body.setAttribute('data-theme', 'light');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeText) themeText.textContent = 'Dark mode';
  }
  
  // Save theme preference
  if (typeof window.setState === 'function') {
    window.setState('theme', theme);
  }
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

// Make available globally
window.initializeTheme = initializeTheme;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;
