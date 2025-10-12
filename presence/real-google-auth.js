/**
 * REAL GOOGLE PROFILE PICTURE AUTHENTICATION
 * Most straightforward approach to get real Google profile pictures
 */

class RealGoogleAuth {
  constructor() {
    this.supabase = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('🔍 REAL_GOOGLE_AUTH: Starting initialization...');
      console.log('🔍 REAL_GOOGLE_AUTH: window.supabase available:', typeof window !== 'undefined' && !!window.supabase);
      
      if (typeof window !== 'undefined' && window.supabase) {
        this.supabase = window.supabase;
        this.initialized = true;
        console.log('🔍 REAL_GOOGLE_AUTH: Initialized for real profile pictures');
        console.log('🔍 REAL_GOOGLE_AUTH: Supabase client:', this.supabase);
        console.log('🔍 REAL_GOOGLE_AUTH: Supabase auth:', this.supabase.auth);
        return true;
      } else {
        console.error('🔍 REAL_GOOGLE_AUTH: Supabase client not available');
        console.error('🔍 REAL_GOOGLE_AUTH: window.supabase:', window.supabase);
        throw new Error('Supabase client not available');
      }
    } catch (error) {
      console.error('Failed to initialize Real Google Auth:', error);
      throw error;
    }
  }

  async signInWithGoogle() {
    try {
      console.log('🔍 REAL_GOOGLE_AUTH: Starting Google OAuth for REAL profile pictures...');
      
      if (!this.initialized) {
        await this.initialize();
      }

      // Use Supabase OAuth with proper scopes for profile picture
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: chrome.identity.getRedirectURL(),
          scopes: 'openid email profile'
        }
      });
      
      if (error) {
        console.error('🔍 REAL_GOOGLE_AUTH: Supabase OAuth error:', error);
        throw error;
      }
      
      console.log('🔍 REAL_GOOGLE_AUTH: OAuth URL generated:', data.url);
      
      // Launch OAuth flow
      const responseUrl = await new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow({
          url: data.url,
          interactive: true
        }, (responseUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(responseUrl);
          }
        });
      });
      
      console.log('🔍 REAL_GOOGLE_AUTH: OAuth response URL:', responseUrl);
      
      // Extract session from response URL
      const url = new URL(responseUrl);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      
      if (!accessToken) {
        throw new Error('No access token received from OAuth flow');
      }
      
      // Get user info from Supabase (this will have real Google profile picture)
      const { data: { user }, error: userError } = await this.supabase.auth.getUser(accessToken);
      if (userError) throw userError;
      
      console.log('🔍 REAL_GOOGLE_AUTH: Real Google user:', user);
      console.log('🔍 REAL_GOOGLE_AUTH: Real avatar URL:', user.user_metadata?.avatar_url);
      
      // Store session in chrome storage
      const session = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: user
      };
      
      await chrome.storage.local.set({ supabaseUser: user, supabaseSession: session });
      console.log('🔍 REAL_GOOGLE_AUTH: Google OAuth successful with REAL profile picture');
      
      return { user: user, session: session };
    } catch (error) {
      console.error('🔍 REAL_GOOGLE_AUTH: Google OAuth failed:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Check if Supabase client is properly initialized
      if (!this.supabase || !this.supabase.auth) {
        console.error('🔍 REAL_GOOGLE_AUTH: Supabase client not properly initialized');
        console.error('🔍 REAL_GOOGLE_AUTH: this.supabase:', this.supabase);
        console.error('🔍 REAL_GOOGLE_AUTH: this.supabase.auth:', this.supabase?.auth);
        return null;
      }

      // FIRST: Try to get Supabase OAuth user (real Google profile with avatar)
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (user && !error) {
        console.log('🔍 REAL_GOOGLE_AUTH: Using Supabase OAuth user:', user.email);
        console.log('🔍 REAL_GOOGLE_AUTH: Real avatar URL:', user.user_metadata?.avatar_url);
        
        // Store for future use
        await chrome.storage.local.set({ supabaseUser: user });
        return user;
      }
      
      // SECOND: Check for stored session
      const result = await chrome.storage.local.get(['supabaseUser']);
      if (result.supabaseUser) {
        console.log('🔍 REAL_GOOGLE_AUTH: Found stored user with real avatar:', result.supabaseUser.email);
        console.log('🔍 REAL_GOOGLE_AUTH: Stored avatar URL:', result.supabaseUser.user_metadata?.avatar_url);
        return result.supabaseUser;
      }
      
      console.log('🔍 REAL_GOOGLE_AUTH: No authenticated user found');
      return null;
    } catch (error) {
      console.error('🔍 REAL_GOOGLE_AUTH: Error getting current user:', error);
      return null;
    }
  }

  async signOut() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      
      // Clear stored session
      await chrome.storage.local.remove(['supabaseUser', 'supabaseSession']);
      console.log('🔍 REAL_GOOGLE_AUTH: Signed out successfully');
    } catch (error) {
      console.error('🔍 REAL_GOOGLE_AUTH: Sign out failed:', error);
      throw error;
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealGoogleAuth;
} else if (typeof window !== 'undefined') {
  window.RealGoogleAuth = RealGoogleAuth;
}
