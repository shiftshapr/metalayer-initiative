/**
 * AuthManager - Loosely coupled authentication manager
 * Manages multiple auth providers and provides unified interface
 */

class AuthManager {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
    this.currentUser = null;
    this.authState = 'unknown';
    this.authCallbacks = [];
  }

  /**
   * Register an auth provider
   * @param {string} name - Provider name
   * @param {AuthInterface} provider - Provider instance
   */
  registerProvider(name, provider) {
    console.log(`🔐 AUTH_MANAGER: Registering provider: ${name}`);
    this.providers.set(name, provider);
  }

  /**
   * Set the current auth provider
   * @param {string} name - Provider name
   */
  setCurrentProvider(name) {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not registered`);
    }
    this.currentProvider = this.providers.get(name);
    console.log(`🔐 AUTH_MANAGER: Current provider set to: ${name}`);
  }

  /**
   * Initialize the auth manager
   */
  async initialize() {
    console.log('🔐 AUTH_MANAGER: Initializing...');
    
    // Initialize all registered providers
    for (const [name, provider] of this.providers) {
      try {
        await provider.initialize();
        console.log(`✅ AUTH_MANAGER: Provider ${name} initialized`);
      } catch (error) {
        console.error(`❌ AUTH_MANAGER: Provider ${name} failed to initialize:`, error);
      }
    }

    // Set default provider if none set
    if (!this.currentProvider && this.providers.size > 0) {
      this.setCurrentProvider(this.providers.keys().next().value);
    }

    // Check for existing authentication
    await this.checkAuthState();
  }

  /**
   * Check current authentication state
   */
  async checkAuthState() {
    if (!this.currentProvider) {
      this.authState = 'no_provider';
      return;
    }

    try {
      const isAuth = await this.currentProvider.isAuthenticated();
      if (isAuth) {
        this.currentUser = await this.currentProvider.getCurrentUser();
        this.authState = 'authenticated';
        console.log('✅ AUTH_MANAGER: User is authenticated:', this.currentUser?.email);
      } else {
        this.currentUser = null;
        this.authState = 'unauthenticated';
        console.log('ℹ️ AUTH_MANAGER: User is not authenticated');
      }
    } catch (error) {
      console.error('❌ AUTH_MANAGER: Error checking auth state:', error);
      this.authState = 'error';
    }
  }

  /**
   * Sign in with specified provider
   * @param {string} provider - Provider name
   * @param {Object} options - Provider-specific options
   */
  async signIn(provider, options = {}) {
    console.log(`🔐 AUTH_MANAGER: Signing in with ${provider}...`);
    
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} not registered`);
    }

    try {
      const result = await this.providers.get(provider).signIn(provider, options);
      await this.checkAuthState();
      this.notifyAuthCallbacks('signIn', result);
      return result;
    } catch (error) {
      console.error(`❌ AUTH_MANAGER: Sign in failed:`, error);
      this.notifyAuthCallbacks('signInError', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    if (!this.currentProvider) {
      throw new Error('No auth provider available');
    }

    try {
      const result = await this.currentProvider.signOut();
      this.currentUser = null;
      this.authState = 'unauthenticated';
      this.notifyAuthCallbacks('signOut', result);
      return result;
    } catch (error) {
      console.error('❌ AUTH_MANAGER: Sign out failed:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get user name from current user or provided user
   * @param {Object} user - Optional user object
   */
  getUserName(user = null) {
    const targetUser = user || this.currentUser;
    if (!targetUser || !this.currentProvider) return 'User';
    
    return this.currentProvider.getUserName(targetUser);
  }

  /**
   * Get user email from current user or provided user
   * @param {Object} user - Optional user object
   */
  getUserEmail(user = null) {
    const targetUser = user || this.currentUser;
    if (!targetUser || !this.currentProvider) return null;
    
    return this.currentProvider.getUserEmail(targetUser);
  }

  /**
   * Get user avatar from current user or provided user
   * @param {Object} user - Optional user object
   */
  getUserAvatar(user = null) {
    const targetUser = user || this.currentUser;
    if (!targetUser || !this.currentProvider) return null;
    
    return this.currentProvider.getUserAvatar(targetUser);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    return this.authState === 'authenticated';
  }

  /**
   * Add authentication callback
   * @param {Function} callback - Callback function
   */
  addAuthCallback(callback) {
    this.authCallbacks.push(callback);
  }

  /**
   * Notify all auth callbacks
   * @param {string} event - Event type
   * @param {*} data - Event data
   */
  notifyAuthCallbacks(event, data) {
    this.authCallbacks.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('❌ AUTH_MANAGER: Callback error:', error);
      }
    });
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
