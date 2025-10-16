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
    
    Logger.info('UIManager initialized', null, 'ui');
    this.initializeUI();
  }

  /**
   * Initialize UI components and event listeners
   */
  initializeUI() {
    Logger.debug('Initializing UI components', null, 'ui');
    
    this.setupTabNavigation();
    this.setupEventListeners();
    this.initializeModals();
    this.updateUIState();
  }

  /**
   * Setup tab navigation
   */
  setupTabNavigation() {
    Logger.debug('Setting up tab navigation', null, 'ui');
    
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
    Logger.debug('Setting up event listeners', null, 'ui');
    
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
    Logger.debug('Initializing modals', null, 'ui');
    
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
    Logger.ui(`Switching to tab: ${tabId}`, null);
    
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
    Logger.ui('Handling visibility update', visibilityData);
    
    this.updateVisibilityDisplay(visibilityData);
  }

  /**
   * Update visibility display
   */
  updateVisibilityDisplay(visibilityData) {
    const visibilityTab = document.getElementById('visibility-tab');
    if (!visibilityTab) return;
    
    Logger.ui('Updating visibility display', {
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
    
    Logger.ui(`Updating user list with ${users.length} users`, null);
    
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
  createUserAvatar(user) {
    if (window.AvatarUtils) {
      return window.AvatarUtils.createUnifiedAvatar(user, {
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
    Logger.ui('Handling profile update', profileData);
    
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
    Logger.ui('Handling error', errorData);
    
    this.showError(errorData.message || 'An error occurred', errorData.details);
  }

  /**
   * Show error message
   */
  showError(message, details = null) {
    Logger.error(`UI Error: ${message}`, details, 'ui');
    
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
    
    document.body.appendChild(modal);
    
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
    
    document.body.appendChild(modal);
  }

  /**
   * Update UI state
   */
  updateUIState() {
    Logger.debug('Updating UI state', this.uiState, 'ui');
    
    // Notify callbacks
    this.uiCallbacks.forEach(callback => {
      try {
        callback(this.uiState);
      } catch (error) {
        Logger.error('UI callback error', error, 'ui');
      }
    });
  }

  /**
   * Show loading state
   */
  showLoading(message = 'Loading...') {
    Logger.ui(`Showing loading: ${message}`, null);
    
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
    Logger.ui('Hiding loading', null);
    
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
   * Cleanup event listeners
   */
  cleanup() {
    Logger.debug('Cleaning up UI manager', null, 'ui');
    
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    
    this.eventListeners.clear();
    this.uiCallbacks = [];
  }
}

// Make available globally
window.UIManager = UIManager;

Logger.info('UIManager module loaded', null, 'ui');
