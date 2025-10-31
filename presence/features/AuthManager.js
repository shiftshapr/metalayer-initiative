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
    
    console.log('AuthManager initialized', null, 'auth');
    this.initializeAuthHandlers();
  }

  /**
   * Initialize AuthManager (COMP METHOD)
   */
  async initialize() {
    console.log('🔧 AuthManager initialize called');
    return Promise.resolve(true);
  }

  /**
   * Sign in with provider (COMP METHOD)
   */
  async signIn(provider, email = null) {
    console.log('🔧 AuthManager signIn called with provider:', provider);
    if (provider === 'google') {
      // Use real Google auth
      if (window.realGoogleAuth) {
        return await window.realGoogleAuth.signInWithGoogle();
      }
    } else if (provider === 'magic_link' && email) {
      // Use magic link auth
      if (window.realGoogleAuth) {
        return await window.realGoogleAuth.signInWithMagicLink(email);
      }
    }
    return null;
  }

  /**
   * Initialize authentication event handlers
   */
  initializeAuthHandlers() {
    console.log('Setting up authentication handlers', null, 'auth');
    
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
    console.log('Authentication state changed:', detail);
    
    this.authState = detail.state;
    this.currentUser = detail.user;
    
    // Notify all registered callbacks
    this.authCallbacks.forEach(callback => {
      try {
        callback(detail);
      } catch (error) {
        console.error('Auth callback error', error, 'auth');
      }
    });
    
    // Update UI based on auth state
    this.updateAuthUI();
  }

  /**
   * Handle user profile updates
   */
  handleUserUpdate(user) {
    console.log('User profile updated:', user);
    
    if (this.currentUser && this.currentUser.email === user.email) {
      this.currentUser = { ...this.currentUser, ...user };
      this.updateAuthUI();
    }
  }

  /**
   * Require authentication for an action
   */
  async requireAuth(action, callback) {
    console.log(`Requiring authentication for: ${action}`);
    
    try {
      // Check if user is authenticated
      if (this.isAuthenticated()) {
        console.log('User is authenticated, proceeding');
        if (callback) {
          await callback();
        }
        return true;
      } else {
        console.log('User not authenticated, showing prompt');
        this.showAuthPrompt(action);
        return false;
      }
    } catch (error) {
      console.error('Authentication check failed', error, 'auth');
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
    console.log(`Showing auth prompt for: ${action}`);
    
    const authPrompt = document.getElementById('auth-prompt-modal');
    if (!authPrompt) {
      console.warn('Auth prompt modal not found, creating...', null, 'auth');
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
    console.log('Creating authentication prompt modal', null, 'auth');
    
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
        console.log('Google sign-in requested');
        this.handleGoogleSignIn();
      });
    }
    
    // Magic link sign-in
    const magicBtn = document.getElementById('auth-prompt-magic');
    if (magicBtn) {
      magicBtn.addEventListener('click', () => {
        console.log('Magic link sign-in requested');
        this.handleMagicLinkSignIn();
      });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('auth-prompt-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        console.log('Auth prompt cancelled');
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
    console.log('Initiating Google sign-in');
    
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
    console.log('Initiating Magic Link sign-in');
    
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
    console.log('Updating authentication UI', { 
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
      console.warn('Cannot update profile: no current user', null, 'auth');
      return false;
    }
    
    console.log('Updating user profile:', updates);
    
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
    console.log('Signing out user');
    
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
      userId: this.currentUser?.id || this.currentUser?.user_id || null,
      callbacksRegistered: this.authCallbacks.length
    };
  }
}

// Make available globally
window.AuthManager = AuthManager;

console.log('AuthManager module loaded', null, 'auth');



