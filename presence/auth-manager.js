// Loosely Coupled Authentication Manager
// Supports multiple auth providers with easy swapping and extension

class AuthManager {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
    this.currentUser = null;
    this.listeners = [];
    this.config = {
      defaultProvider: 'metalayer',
      fallbackProvider: 'supabase'
    };
  }

  // Register an auth provider
  registerProvider(name, provider) {
    this.providers.set(name, provider);
    console.log(`Auth provider '${name}' registered`);
  }

  // Set the active auth provider
  async setProvider(name) {
    if (!this.providers.has(name)) {
      throw new Error(`Auth provider '${name}' not registered`);
    }

    this.currentProvider = this.providers.get(name);
    await this.currentProvider.initialize();
    console.log(`Auth provider switched to '${name}'`);
  }

  // Initialize with default provider
  async initialize() {
    try {
      await this.setProvider(this.config.defaultProvider);
      return true;
    } catch (error) {
      console.warn(`Default provider failed, trying fallback: ${error.message}`);
      try {
        await this.setProvider(this.config.fallbackProvider);
        return true;
      } catch (fallbackError) {
        console.warn(`Fallback provider failed, trying offline mode: ${fallbackError.message}`);
        try {
          await this.setProvider('offline');
          return true;
        } catch (offlineError) {
          console.error('All auth providers failed to initialize:', offlineError);
          return false;
        }
      }
    }
  }

  // Generic auth methods that work with any provider
  async signIn(method, ...args) {
    if (!this.currentProvider) {
      throw new Error('No auth provider initialized');
    }

    try {
      const result = await this.currentProvider.signIn(method, ...args);
      this.currentUser = result.user;
      this.notifyListeners('SIGNED_IN', result);
      return result;
    } catch (error) {
      console.error(`Sign in failed with ${method}:`, error);
      throw error;
    }
  }

  async signOut() {
    if (!this.currentProvider) {
      throw new Error('No auth provider initialized');
    }

    try {
      await this.currentProvider.signOut();
      this.currentUser = null;
      this.notifyListeners('SIGNED_OUT', null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    if (!this.currentProvider) {
      return null;
    }

    try {
      this.currentUser = await this.currentProvider.getCurrentUser();
      return this.currentUser;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Listen for auth state changes
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of auth state changes
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Get available auth methods from current provider
  getAvailableMethods() {
    if (!this.currentProvider) {
      return [];
    }
    return this.currentProvider.getAvailableMethods();
  }

  // Check if a specific method is available
  isMethodAvailable(method) {
    return this.getAvailableMethods().includes(method);
  }
}

// Base Auth Provider Interface
class BaseAuthProvider {
  constructor(name) {
    this.name = name;
    this.initialized = false;
  }

  async initialize() {
    throw new Error('initialize() must be implemented by auth provider');
  }

  async signIn(method, ...args) {
    throw new Error('signIn() must be implemented by auth provider');
  }

  async signOut() {
    throw new Error('signOut() must be implemented by auth provider');
  }

  async getCurrentUser() {
    throw new Error('getCurrentUser() must be implemented by auth provider');
  }

  getAvailableMethods() {
    throw new Error('getAvailableMethods() must be implemented by auth provider');
  }
}

// Supabase Auth Provider
class SupabaseAuthProvider extends BaseAuthProvider {
  constructor() {
    super('supabase');
    this.supabase = null;
  }

  async initialize() {
    try {
      if (typeof window.supabase === 'object' && window.supabase !== null && typeof window.supabase.createClient === 'function') {
        // Test if Supabase URL is reachable
        try {
          const response = await fetch('https://bvshfzikwwjasluumfkr.supabase.co/rest/v1/', {
            method: 'HEAD'
          });
          
          this.supabase = window.supabase.createClient(
            'https://bvshfzikwwjasluumfkr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c2hmemlrd3dqYXNsdXVtZmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDU3NjUsImV4cCI6MjA1OTcyMTc2NX0.YuBpfklO3IxI-yFwFBP_2GIlSO-IGYia6CwpRyRd7VA'
          );
          this.initialized = true;
          console.log('Supabase auth provider initialized');
          return true;
        } catch (networkError) {
          console.warn('Supabase URL not reachable, skipping initialization:', networkError.message);
          throw new Error(`Supabase service unavailable: ${networkError.message}`);
        }
      }
      throw new Error('Supabase library not available');
    } catch (error) {
      console.error('Failed to initialize Supabase auth provider:', error);
      throw error;
    }
  }

  async signIn(method, ...args) {
    if (!this.initialized) throw new Error('Provider not initialized');

    switch (method) {
      case 'google':
        return await this.signInWithGoogle();
      case 'magic_link':
        const [email] = args;
        return await this.signInWithMagicLink(email);
      default:
        throw new Error(`Unsupported sign-in method: ${method}`);
    }
  }

  async signInWithGoogle() {
    // Use Chrome's background script for Google OAuth
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'GOOGLE_AUTH_REQUEST' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        if (response.success) {
          resolve({ user: response.user, session: { access_token: 'google-token' } });
        } else {
          reject(new Error(response.error || 'Google authentication failed'));
        }
      });
    });
  }

  async signInWithMagicLink(email) {
    const { data, error } = await this.supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: chrome.identity.getRedirectURL()
      }
    });
    
    if (error) throw error;
    return { user: data.user, session: data.session };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  getAvailableMethods() {
    return ['google', 'magic_link'];
  }

  // Supabase-specific real-time features
  async getPresenceData(pageUrl) {
    const { data, error } = await this.supabase
      .from('presence')
      .select('*')
      .eq('page_url', pageUrl);
    
    if (error) throw error;
    return data || [];
  }

  subscribeToPresence(pageUrl, callback) {
    return this.supabase
      .channel('presence')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'presence',
        filter: `page_url=eq.${pageUrl}`
      }, callback)
      .subscribe();
  }
}

// Metalayer API Auth Provider
class MetalayerAuthProvider extends BaseAuthProvider {
  constructor() {
    super('metalayer');
    this.api = null;
  }

  async initialize() {
    try {
      this.api = new MetaLayerAPI('http://216.238.91.120:3002');
      this.initialized = true;
      console.log('Metalayer auth provider initialized (no network check)');
      return true;
    } catch (error) {
      console.error('Failed to initialize Metalayer auth provider:', error);
      throw error;
    }
  }

  async signIn(method, ...args) {
    if (!this.initialized) throw new Error('Provider not initialized');

    switch (method) {
      case 'mock':
        return await this.signInMock();
      case 'google':
        return await this.signInWithGoogle();
      case 'magic_link':
        const [email] = args;
        return await this.signInWithMagicLink(email);
      default:
        throw new Error(`Unsupported sign-in method: ${method}`);
    }
  }

  async signInWithGoogle() {
    // Use Chrome's background script for Google OAuth
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'GOOGLE_AUTH_REQUEST' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        if (response.success) {
          resolve({ user: response.user, session: { access_token: 'google-token' } });
        } else {
          reject(new Error(response.error || 'Google authentication failed'));
        }
      });
    });
  }

  async signInMock() {
    const result = await this.api.login();
    return { user: result.session, session: result.session };
  }

  async signInWithMagicLink(email) {
    // This would integrate with your existing magic link system
    // For now, return a mock response
    return {
      user: {
        id: `magic-${email}`,
        email: email,
        user_metadata: { full_name: email.split('@')[0] }
      },
      session: { access_token: 'mock-token' }
    };
  }

  async signOut() {
    try {
      // Revoke Google OAuth token if it exists
      const result = await chrome.storage.local.get(['googleUser']);
      if (result.googleUser) {
        try {
          // Get the stored token and revoke it
          chrome.identity.getAuthToken({ interactive: false }, (token) => {
            if (token) {
              chrome.identity.removeCachedAuthToken({ token }, () => {
                console.log('Google token revoked');
              });
            }
          });
        } catch (error) {
          console.log('No Google token to revoke');
        }
      }
      
      // Clear Chrome storage
      await chrome.storage.local.clear();
      console.log('Chrome storage cleared');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }

  async getCurrentUser() {
    try {
      // For Chrome extension, get user from storage instead of API
      const result = await chrome.storage.local.get(['googleUser', 'supabaseUser', 'metalayerUser']);
      return result.googleUser || result.supabaseUser || result.metalayerUser || null;
    } catch (error) {
      return null;
    }
  }

  getAvailableMethods() {
    return ['mock', 'google', 'magic_link'];
  }
}

// Offline Mock Auth Provider (for testing when no services are available)
class OfflineAuthProvider extends BaseAuthProvider {
  constructor() {
    super('offline');
    this.mockUser = null;
  }

  async initialize() {
    this.initialized = true;
    console.log('Offline auth provider initialized (mock mode)');
    return true;
  }

  async signIn(method, ...args) {
    if (!this.initialized) throw new Error('Provider not initialized');

    switch (method) {
      case 'mock':
        return await this.signInMock();
      case 'google':
        return await this.signInWithGoogle();
      case 'magic_link':
        const [email] = args;
        return await this.signInWithMagicLink(email);
      default:
        throw new Error(`Unsupported sign-in method: ${method}`);
    }
  }

  async signInWithGoogle() {
    // Use Chrome's background script for Google OAuth even in offline mode
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'GOOGLE_AUTH_REQUEST' }, (response) => {
        if (chrome.runtime.lastError) {
          // If Chrome OAuth fails, fall back to mock
          console.warn('Chrome OAuth failed, using mock Google user:', chrome.runtime.lastError.message);
          this.mockUser = {
            id: 'mock-google-user',
            email: 'demo@gmail.com',
            user_metadata: { 
              full_name: 'Demo Google User',
              avatar_url: null
            }
          };
          resolve({ user: this.mockUser, session: { access_token: 'mock-google-token' } });
          return;
        }
        
        if (response.success) {
          this.mockUser = response.user;
          resolve({ user: response.user, session: { access_token: 'google-token' } });
        } else {
          // Fall back to mock if OAuth fails
          console.warn('Google OAuth failed, using mock user:', response.error);
          this.mockUser = {
            id: 'mock-google-user',
            email: 'demo@gmail.com',
            user_metadata: { 
              full_name: 'Demo Google User',
              avatar_url: null
            }
          };
          resolve({ user: this.mockUser, session: { access_token: 'mock-google-token' } });
        }
      });
    });
  }

  async signInMock() {
    this.mockUser = {
      id: 'mock-user-123',
      email: 'demo@example.com',
      user_metadata: { 
        full_name: 'Demo User',
        avatar_url: null
      }
    };
    return { user: this.mockUser, session: { access_token: 'mock-token' } };
  }

  async signInWithMagicLink(email) {
    this.mockUser = {
      id: `mock-${email}`,
      email: email,
      user_metadata: { 
        full_name: email.split('@')[0],
        avatar_url: null
      }
    };
    return { user: this.mockUser, session: { access_token: 'mock-token' } };
  }

  async signOut() {
    this.mockUser = null;
  }

  async getCurrentUser() {
    return this.mockUser;
  }

  getAvailableMethods() {
    return ['mock', 'google', 'magic_link'];
  }
}

// Export for use in sidepanel.js
window.AuthManager = AuthManager;
window.BaseAuthProvider = BaseAuthProvider;
window.SupabaseAuthProvider = SupabaseAuthProvider;
window.MetalayerAuthProvider = MetalayerAuthProvider;
window.OfflineAuthProvider = OfflineAuthProvider;
