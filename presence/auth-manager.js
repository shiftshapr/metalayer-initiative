// Loosely Coupled Authentication Manager
// Supports multiple auth providers with easy swapping and extension

class AuthManager {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
    this.currentUser = null;
    this.listeners = [];
    this.config = {
      defaultProvider: 'supabase',
      fallbackProvider: 'metalayer'
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
      const user = await this.currentProvider.getCurrentUser();
      this.currentUser = user;
      
      // Notify listeners about current user state
      if (user) {
        this.notifyListeners('SIGNED_IN', user);
      } else {
        this.notifyListeners('SIGNED_OUT', null);
      }
      
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
      // Wait for Supabase to be available
      let attempts = 0;
      while (attempts < 10) {
        if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
          break;
        }
        console.log(`Supabase not ready, attempt ${attempts + 1}/10...`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // CRITICAL FIX: window.supabase IS the client instance, not the constructor
      // It's already created in sidepanel.js via supabase.createClient()
      if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.auth === 'object') {
        this.supabase = window.supabase; // Use the existing client instance
        this.initialized = true;
        console.log('✅ AUTH_MANAGER: Supabase auth provider initialized using existing window.supabase client');
        console.log('✅ AUTH_MANAGER: Supabase auth methods available:', Object.keys(window.supabase.auth));
        return true;
      } else {
        console.error('❌ AUTH_MANAGER: window.supabase not available or missing auth property');
        console.error('❌ AUTH_MANAGER: window.supabase exists:', !!window.supabase);
        console.error('❌ AUTH_MANAGER: window.supabase.auth exists:', !!(window.supabase && window.supabase.auth));
        throw new Error('Supabase client not available');
      }
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
    try {
      // Use Chrome identity API for OAuth
      const redirectUrl = chrome.identity.getRedirectURL();
      const authUrl = `https://bvshfzikwwjasluumfkr.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
      
      // Launch OAuth flow
      const responseUrl = await new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow({
          url: authUrl,
          interactive: true
        }, (responseUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(responseUrl);
          }
        });
      });
      
      // Extract session from response URL
      const url = new URL(responseUrl);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      
      if (!accessToken) {
        throw new Error('No access token received from OAuth flow');
      }
      
      // Get user info from Supabase
      const { data: { user }, error } = await this.supabase.auth.getUser(accessToken);
      if (error) throw error;
      
      // Store session in chrome storage
      const session = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: user
      };
      
      await chrome.storage.local.set({ supabaseUser: user, supabaseSession: session });
      console.log('SupabaseAuthProvider: Google sign-in successful, user stored');
      
      return { user: user, session: session };
    } catch (error) {
      console.error('SupabaseAuthProvider: Google sign-in failed:', error);
      throw error;
    }
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

  async getGoogleProfilePicture(email) {
    try {
      console.log('🔍 AUTH_DEBUG: Getting Google profile picture for:', email);
      
      // The Chrome identity API doesn't provide profile pictures directly
      // We need to use a different approach. For now, let's use a more sophisticated
      // fallback that creates better-looking avatars
      const name = email.split('@')[0];
      
      // Create a more personalized avatar using the user's initials
      // This is better than the generic ui-avatars approach
      const initials = name.substring(0, 2).toUpperCase();
      const backgroundColor = this.generateColorFromEmail(email);
      
      console.log('🔍 AUTH_DEBUG: Generated avatar with initials:', initials, 'color:', backgroundColor);
      
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${backgroundColor}&color=fff&size=96&format=png&bold=true`;
    } catch (error) {
      console.log('🔍 AUTH_DEBUG: Error getting Google profile picture:', error.message);
      // Fallback to ui-avatars with better styling
      const name = email.split('@')[0];
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=96&format=png`;
    }
  }
  
  generateColorFromEmail(email) {
    // Generate a consistent color based on email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padEnd(6, '0')}`;
  }

  async getCurrentUser() {
    try {
      // FIRST: Try to get Supabase OAuth user (real Google profile with avatar)
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (user && !error) {
        console.log('SupabaseAuthProvider: Using Supabase OAuth user:', user.email);
        console.log('🔍 AUTH_DEBUG: Supabase user object:', user);
        console.log('🔍 AUTH_DEBUG: Real avatar URL:', user.user_metadata?.avatar_url);
        
        // Store for future use
        await chrome.storage.local.set({ supabaseUser: user });
        return user;
      }
      
      // SECOND: Try Chrome profile user and FETCH REAL AVATAR from database
      if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getProfileUserInfo) {
        const profileInfo = await new Promise((resolve) => {
          chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, resolve);
        });
        
        if (profileInfo && profileInfo.email) {
          console.log('SupabaseAuthProvider: Using Chrome profile user:', profileInfo.email);
          console.log('🔍 AUTH_DEBUG: profileInfo object:', profileInfo);
          
          // CRITICAL FIX: Query backend API to get REAL avatar from database
          let realAvatarUrl = null;
          let realName = profileInfo.email.split('@')[0];
          let realAuraColor = null;
          
          try {
            console.log('🔍 AUTH_FIX: Fetching REAL avatar from backend API...');
            // CRITICAL FIX: Use correct domain (.org NOT .com)
            const METALAYER_API_URL = window.METALAYER_API_URL || 'https://api.themetalayer.org';
            const response = await fetch(`${METALAYER_API_URL}/v1/users/${encodeURIComponent(profileInfo.email)}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              console.log('🔍 AUTH_FIX: Backend returned user data:', userData);
              
              if (userData.avatarUrl) {
                realAvatarUrl = userData.avatarUrl;
                console.log('✅ AUTH_FIX: Got REAL avatar from database:', realAvatarUrl);
              }
              if (userData.name) {
                realName = userData.name;
              }
              if (userData.auraColor) {
                realAuraColor = userData.auraColor;
              }
            } else {
              console.warn('⚠️ AUTH_FIX: Backend API returned', response.status, '- using fallback avatar');
            }
          } catch (apiError) {
            console.error('❌ AUTH_FIX: Failed to fetch real avatar from backend:', apiError);
          }
          
          // Fallback to generated avatar if backend query failed
          if (!realAvatarUrl) {
            realAvatarUrl = await this.getGoogleProfilePicture(profileInfo.email);
            console.log('🔍 AUTH_DEBUG: Using fallback avatar URL:', realAvatarUrl);
          }
          
          const user = {
            id: profileInfo.email,
            email: profileInfo.email,
            user_metadata: {
              full_name: realName,
              avatar_url: realAvatarUrl
            },
            auraColor: realAuraColor
          };
          
          console.log('🔍 AUTH_DEBUG: Final user object with REAL avatar:', user);
          
          // Store for future use
          await chrome.storage.local.set({ supabaseUser: user });
          return user;
        }
      }
      
      // SECOND: Check for stored session
      const result = await chrome.storage.local.get(['supabaseUser']);
      if (result.supabaseUser) {
        console.log('SupabaseAuthProvider: Found stored user:', result.supabaseUser.email);
        return result.supabaseUser;
      }
      
      // THIRD: If no Chrome profile and no stored session, return null
      return null;
    } catch (error) {
      console.error('SupabaseAuthProvider: Error getting current user:', error);
      return null;
    }
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
//       return true;
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
    try {
      // Use Chrome identity API for OAuth
      const redirectUrl = chrome.identity.getRedirectURL();
      const authUrl = `https://bvshfzikwwjasluumfkr.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
      
      // Launch OAuth flow
      const responseUrl = await new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow({
          url: authUrl,
          interactive: true
        }, (responseUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(responseUrl);
          }
        });
      });
      
      // Extract session from response URL
      const url = new URL(responseUrl);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      
      if (!accessToken) {
        throw new Error('No access token received from OAuth flow');
      }
      
      // Get user info from Supabase
      const { data: { user }, error } = await this.supabase.auth.getUser(accessToken);
      if (error) throw error;
      
      // Store session in chrome storage
      const session = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: user
      };
      
      await chrome.storage.local.set({ supabaseUser: user, supabaseSession: session });
      console.log('SupabaseAuthProvider: Google sign-in successful, user stored');
      
      return { user: user, session: session };
    } catch (error) {
      console.error('SupabaseAuthProvider: Google sign-in failed:', error);
      throw error;
    }
  }

  async signInMock() {
    const result = await this.api.login();
    return { user: result.session, session: result.session };
  }

  async signInWithMagicLink(email) {
    try {
      // Use Supabase magic link authentication
      const { data, error } = await this.supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: chrome.identity.getRedirectURL()
        }
      });
      
      if (error) throw error;
      
      // Store user in chrome storage for persistence
      if (data.user) {
        await chrome.storage.local.set({ supabaseUser: data.user });
        console.log('MetalayerAuthProvider: Magic link sign-in successful, user stored');
      }
      
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('MetalayerAuthProvider: Magic link sign-in failed:', error);
      throw error;
    }
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
      // Use Supabase authentication
      if (this.supabase) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (user) {
          console.log('MetalayerAuthProvider: Found authenticated user:', user.email);
          return user;
        }
      }
      
      // Check for existing session in storage as fallback
      const result = await chrome.storage.local.get(['supabaseUser', 'googleUser', 'metalayerUser']);
      const user = result.supabaseUser || result.googleUser || result.metalayerUser;
      if (user) {
        console.log('MetalayerAuthProvider: Found user in storage:', user.email);
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('MetalayerAuthProvider: Error getting current user:', error);
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
//     return true;
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
