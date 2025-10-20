/**
 * AuthManager.js - Authentication Management Module
 * Extracted from sidepanel.js for modular architecture
 * 
 * Responsibilities:
 * - User authentication state management
 * - Authentication prompts and UI
 * - User profile management
 * - Authentication event handling
 */

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authState = 'unknown';
    this.authCallbacks = [];
    
    Logger.info('AuthManager initialized', null, 'auth');
    this.initializeAuthHandlers();
  }

  /**
   * Initialize authentication event handlers
   */
  initializeAuthHandlers() {
    Logger.debug('Setting up authentication handlers', null, 'auth');
    
    // Listen for authentication state changes
    document.addEventListener('authStateChanged', (event) => {
      this.handleAuthStateChange(event.detail);
    });
    
    // Listen for user updates
    document.addEventListener('userUpdated', (event) => {
      this.handleUserUpdate(event.detail);
    });
  }

  /**
   * Handle authentication state changes
   */
  handleAuthStateChange(detail) {
    Logger.auth('Authentication state changed', detail);
    
    this.authState = detail.state;
    this.currentUser = detail.user;
    
    // Notify all registered callbacks
    this.authCallbacks.forEach(callback => {
      try {
        callback(detail);
      } catch (error) {
        Logger.error('Auth callback error', error, 'auth');
      }
    });
    
    // Update UI based on auth state
    this.updateAuthUI();
  }

  /**
   * Handle user profile updates
   */
  handleUserUpdate(user) {
    Logger.auth('User profile updated', user);
    
    if (this.currentUser && this.currentUser.email === user.email) {
      this.currentUser = { ...this.currentUser, ...user };
      this.updateAuthUI();
    }
  }

  /**
   * Require authentication for an action
   */
  async requireAuth(action, callback) {
    Logger.auth(`Requiring authentication for: ${action}`, null);
    
    try {
      // Check if user is authenticated
      if (this.isAuthenticated()) {
        Logger.auth('User is authenticated, proceeding', null);
        if (callback) {
          await callback();
        }
        return true;
      } else {
        Logger.auth('User not authenticated, showing prompt', null);
        this.showAuthPrompt(action);
        return false;
      }
    } catch (error) {
      Logger.error('Authentication check failed', error, 'auth');
      return false;
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated() {
    return this.currentUser && this.authState === 'SIGNED_IN';
  }

  /**
   * Get current user information
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Show authentication prompt modal
   */
  showAuthPrompt(action) {
    Logger.auth(`Showing auth prompt for: ${action}`, null);
    
    const authPrompt = document.getElementById('auth-prompt-modal');
    if (!authPrompt) {
      Logger.warn('Auth prompt modal not found, creating...', null, 'auth');
      this.createAuthPromptModal();
    }
    
    // Update prompt content
    const actionSpan = document.getElementById('auth-prompt-action');
    const providerSpan = document.getElementById('auth-prompt-provider');
    
    if (actionSpan) {
      actionSpan.textContent = action;
    }
    
    if (providerSpan) {
      providerSpan.textContent = 'Choose your preferred sign-in method:';
    }
    
    // Show modal
    if (authPrompt) {
      authPrompt.style.display = 'flex';
    }
  }

  /**
   * Create authentication prompt modal
   */
  createAuthPromptModal() {
    Logger.debug('Creating authentication prompt modal', null, 'auth');
    
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
    
    // Add event listeners
    this.setupAuthPromptListeners();
  }

  /**
   * Setup authentication prompt event listeners
   */
  setupAuthPromptListeners() {
    const modal = document.getElementById('auth-prompt-modal');
    if (!modal) return;
    
    // Google sign-in
    const googleBtn = document.getElementById('auth-prompt-google');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        Logger.auth('Google sign-in requested', null);
        this.handleGoogleSignIn();
      });
    }
    
    // Magic link sign-in
    const magicBtn = document.getElementById('auth-prompt-magic');
    if (magicBtn) {
      magicBtn.addEventListener('click', () => {
        Logger.auth('Magic link sign-in requested', null);
        this.handleMagicLinkSignIn();
      });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('auth-prompt-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        Logger.auth('Auth prompt cancelled', null);
        this.hideAuthPrompt();
      });
    }
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideAuthPrompt();
      }
    });
  }

  /**
   * Handle Google sign-in
   */
  handleGoogleSignIn() {
    Logger.auth('Initiating Google sign-in', null);
    
    // Dispatch event for main app to handle
    document.dispatchEvent(new CustomEvent('authGoogleSignIn', {
      detail: { source: 'auth-prompt' }
    }));
    
    this.hideAuthPrompt();
  }

  /**
   * Handle Magic Link sign-in
   */
  handleMagicLinkSignIn() {
    Logger.auth('Initiating Magic Link sign-in', null);
    
    // Dispatch event for main app to handle
    document.dispatchEvent(new CustomEvent('authMagicLinkSignIn', {
      detail: { source: 'auth-prompt' }
    }));
    
    this.hideAuthPrompt();
  }

  /**
   * Hide authentication prompt
   */
  hideAuthPrompt() {
    const modal = document.getElementById('auth-prompt-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Update authentication UI based on current state
   */
  updateAuthUI() {
    Logger.debug('Updating authentication UI', { 
      authState: this.authState, 
      hasUser: !!this.currentUser 
    }, 'auth');
    
    // Dispatch event for UI updates
    document.dispatchEvent(new CustomEvent('authUIUpdate', {
      detail: {
        authState: this.authState,
        user: this.currentUser,
        isAuthenticated: this.isAuthenticated()
      }
    }));
  }

  /**
   * Register authentication callback
   */
  onAuthStateChange(callback) {
    this.authCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authCallbacks.indexOf(callback);
      if (index > -1) {
        this.authCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Update user profile
   */
  updateUserProfile(updates) {
    if (!this.currentUser) {
      Logger.warn('Cannot update profile: no current user', null, 'auth');
      return false;
    }
    
    Logger.auth('Updating user profile', updates);
    
    this.currentUser = { ...this.currentUser, ...updates };
    
    // Dispatch update event
    document.dispatchEvent(new CustomEvent('userUpdated', {
      detail: this.currentUser
    }));
    
    return true;
  }

  /**
   * Sign out current user
   */
  signOut() {
    Logger.auth('Signing out user', null);
    
    this.currentUser = null;
    this.authState = 'SIGNED_OUT';
    
    // Dispatch sign out event
    document.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: {
        state: 'SIGNED_OUT',
        user: null
      }
    }));
  }

  /**
   * Get authentication status for debugging
   */
  getAuthStatus() {
    return {
      authState: this.authState,
      isAuthenticated: this.isAuthenticated(),
      hasUser: !!this.currentUser,
      userEmail: this.currentUser?.email || null,
      callbacksRegistered: this.authCallbacks.length
    };
  }
}

// Make available globally
window.AuthManager = AuthManager;

Logger.info('AuthManager module loaded', null, 'auth');



