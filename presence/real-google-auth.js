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
      
      if (typeof window.setState === 'function') {
        await window.setState('supabaseUser', user);
        await window.setState('supabaseSession', session);
      }
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

      // COMP METHOD: Check Chrome profile first (like COMP does)
      console.log('🔍 REAL_GOOGLE_AUTH: Checking Chrome profile first...');
      console.log('🔍 REAL_GOOGLE_AUTH: Chrome identity available:', typeof chrome !== 'undefined' && chrome.identity);
      
      try {
        // Check if Chrome identity API is available
        if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getProfileUserInfo) {
          console.log('🔍 REAL_GOOGLE_AUTH: Chrome identity API is available, calling getProfileUserInfo...');
          
          // COMP METHOD: Chrome identity API - get signed-in Google user profile info directly
          const profileInfo = await new Promise((resolve, reject) => {
            chrome.identity.getProfileUserInfo((profileInfo) => {
              console.log('🔍 REAL_GOOGLE_AUTH: Chrome profile info callback:', profileInfo);
              console.log('🔍 REAL_GOOGLE_AUTH: Chrome runtime last error:', chrome.runtime.lastError);
              
              if (chrome.runtime.lastError) {
                console.log('🔍 REAL_GOOGLE_AUTH: Chrome profile info not available:', chrome.runtime.lastError.message);
                resolve(null);
              } else if (profileInfo && profileInfo.email) {
                console.log('🔍 REAL_GOOGLE_AUTH: Chrome profile info received:', profileInfo.email);
                resolve(profileInfo);
              } else {
                console.log('🔍 REAL_GOOGLE_AUTH: No Chrome profile info found');
                resolve(null);
              }
            });
          });

          if (profileInfo && profileInfo.email) {
            console.log('🔍 REAL_GOOGLE_AUTH: Using Chrome profile info for:', profileInfo.email);
            
            // NOTE: getProfileUserInfo doesn't include profile picture, so we'll try OAuth token method below
            console.log('🔍 REAL_GOOGLE_AUTH: getProfileUserInfo doesn\'t include profile picture, will try OAuth token method');
            
            // Store the email for fallback if OAuth token fails
            const chromeProfileEmail = profileInfo.email;
            
            // Try getAuthToken method (non-interactive first to avoid popups)
            let authToken = null;
            if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getAuthToken) {
              console.log('🔍 REAL_GOOGLE_AUTH: Chrome identity API is available, calling getAuthToken (non-interactive)...');
              
              // COMP METHOD: Chrome identity API - get OAuth token for Google People API (try non-interactive first)
              authToken = await new Promise((resolve, reject) => {
                chrome.identity.getAuthToken({ interactive: false }, (token) => {
                  console.log('🔍 REAL_GOOGLE_AUTH: Chrome identity callback received token:', token);
                  console.log('🔍 REAL_GOOGLE_AUTH: Chrome runtime last error:', chrome.runtime.lastError);
                  
                  if (chrome.runtime.lastError) {
                    console.log('🔍 REAL_GOOGLE_AUTH: Chrome auth token not available (non-interactive):', chrome.runtime.lastError.message);
                    resolve(null);
                  } else if (token) {
                    console.log('🔍 REAL_GOOGLE_AUTH: Chrome auth token received:', token);
                    resolve(token);
                  } else {
                    console.log('🔍 REAL_GOOGLE_AUTH: No Chrome auth token found');
                    resolve(null);
                  }
                });
              });
            }

            if (authToken) {
              // COMP METHOD: Use OAuth token to get actual Google profile picture
              console.log('🔍 REAL_GOOGLE_AUTH: Fetching Google profile with OAuth token...');
              try {
                const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authToken}`);
                const userInfo = await response.json();
                console.log('🔍 REAL_GOOGLE_AUTH: Google API response:', userInfo);
                console.log('🔍 REAL_GOOGLE_AUTH: Google profile picture:', userInfo.picture);
                console.log('🔍 REAL_GOOGLE_AUTH: Full Google profile data:', userInfo);
                
                const chromeProfile = userInfo;

                if (chromeProfile && chromeProfile.email) {
                  // COMP METHOD: Create user object from Chrome profile with OAuth data
                  const chromeUser = {
                    email: chromeProfile.email,
                    name: chromeProfile.name || chromeProfile.email.split('@')[0],
                    picture: chromeProfile.picture, // Use ACTUAL Google profile picture
                    user_metadata: {
                      full_name: chromeProfile.name || chromeProfile.email.split('@')[0],
                      avatar_url: chromeProfile.picture // Use ACTUAL Google profile picture
                    },
                    provider: 'chrome_profile',
                    id: chromeProfile.id || chromeProfile.email
                  };

                  console.log('🔍 REAL_GOOGLE_AUTH: Chrome profile user created with OAuth data:', chromeUser.email);
                  console.log('🔍 REAL_GOOGLE_AUTH: Chrome profile avatar:', chromeUser.picture);
                  
                  // COMP METHOD: Automatically update AppUser table with real Google profile picture
                  if (chromeProfile.picture && !chromeProfile.picture.includes('default-user')) {
                    console.log('🔍 REAL_GOOGLE_AUTH: Updating AppUser table with real Google profile picture...');
                    try {
                      const updateResponse = await window.api.request('/v1/users/update-avatar', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          email: chromeProfile.email,
                          avatarUrl: chromeProfile.picture
                        })
                      });
                      console.log('✅ REAL_GOOGLE_AUTH: AppUser table updated with real avatar:', updateResponse);
                    } catch (error) {
                      console.log('⚠️ REAL_GOOGLE_AUTH: Failed to update AppUser table:', error);
                      
                      // COMP METHOD: Fallback - try to get or create user with avatar URL
                      try {
                        console.log('🔍 REAL_GOOGLE_AUTH: Attempting fallback - get or create user with avatar URL');
                        const fallbackResponse = await window.api.request(`/v1/users/${encodeURIComponent(chromeProfile.email)}`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            email: chromeProfile.email,
                            name: chromeProfile.name || chromeProfile.email.split('@')[0],
                            avatarUrl: chromeProfile.picture,
                            auraColor: window.AVATAR_FALLBACK_COLOR
                          })
                        });
                        console.log('✅ REAL_GOOGLE_AUTH: Fallback successful - user created/updated:', fallbackResponse);
                      } catch (fallbackError) {
                        console.log('❌ REAL_GOOGLE_AUTH: Fallback also failed:', fallbackError);
                      }
                    }
                  } else {
                    console.log('⚠️ REAL_GOOGLE_AUTH: Not updating AppUser table - avatar URL is generic fallback:', chromeProfile.picture);
                  }
                  
                  // Store Chrome profile user in StateManager
                  if (typeof window.setState === 'function') {
                    await window.setState('supabaseUser', chromeUser);
                    await window.setState('supabaseSession', { user: chromeUser });
                  }
                  
                  console.log('🔍 REAL_GOOGLE_AUTH: RETURNING Chrome profile user:', chromeUser.email);
                  console.log('🔍 REAL_GOOGLE_AUTH: RETURNING Chrome user object:', chromeUser);
                  return chromeUser;
                }
              } catch (error) {
                console.log('🔍 REAL_GOOGLE_AUTH: Google API error:', error);
                // Fall through to create user with just email
              }
            }
            
            // FALLBACK: If OAuth token is not available (bad client ID or not configured),
            // authenticate user with just the Chrome profile email
            // This allows the extension to work even when OAuth is not properly configured
            console.log('🔍 REAL_GOOGLE_AUTH: OAuth token not available, creating user with Chrome profile email only');
            const chromeUser = {
              email: chromeProfileEmail,
              name: chromeProfileEmail.split('@')[0],
              picture: null, // Will be set later if OAuth becomes available
              user_metadata: {
                full_name: chromeProfileEmail.split('@')[0],
                avatar_url: null
              },
              provider: 'chrome_profile',
              id: chromeProfileEmail
            };

            console.log('🔍 REAL_GOOGLE_AUTH: Chrome profile user created (email only):', chromeUser.email);
            
            // COMP METHOD: Get or create user in backend
            try {
              console.log('🔍 REAL_GOOGLE_AUTH: Getting or creating user in backend...');
              const userResponse = await window.api.request(`/v1/users/${encodeURIComponent(chromeProfileEmail)}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: chromeProfileEmail,
                  name: chromeProfileEmail.split('@')[0],
                  avatarUrl: null,
                  auraColor: window.AVATAR_FALLBACK_COLOR
                })
              });
              console.log('✅ REAL_GOOGLE_AUTH: User created/updated in backend:', userResponse);
              
              // Update user ID if backend returned one
              if (userResponse && userResponse.id) {
                chromeUser.id = userResponse.id;
                chromeUser.user_id = userResponse.id;
              }
            } catch (error) {
              console.log('⚠️ REAL_GOOGLE_AUTH: Failed to create user in backend (will continue anyway):', error);
            }
            
            // Store Chrome profile user in StateManager
            if (typeof window.setState === 'function') {
              await window.setState('supabaseUser', chromeUser);
              await window.setState('supabaseSession', { user: chromeUser });
            }
            
            console.log('🔍 REAL_GOOGLE_AUTH: RETURNING Chrome profile user (email only):', chromeUser.email);
            console.log('🔍 REAL_GOOGLE_AUTH: RETURNING Chrome user object:', chromeUser);
            return chromeUser;
          }
        } else {
          console.log('🔍 REAL_GOOGLE_AUTH: Chrome identity API not available');
          console.log('🔍 REAL_GOOGLE_AUTH: chrome object:', typeof chrome);
          console.log('🔍 REAL_GOOGLE_AUTH: chrome.identity:', typeof chrome !== 'undefined' ? chrome.identity : 'undefined');
        }
      } catch (chromeError) {
        console.log('🔍 REAL_GOOGLE_AUTH: Chrome profile check failed:', chromeError.message);
        console.log('🔍 REAL_GOOGLE_AUTH: Chrome error stack:', chromeError.stack);
      }

      // SECOND: Try to get Supabase OAuth user (real Google profile with avatar)
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (user && !error) {
        console.log('🔍 REAL_GOOGLE_AUTH: Using Supabase OAuth user:', user.email);
        console.log('🔍 REAL_GOOGLE_AUTH: Real avatar URL:', user.user_metadata?.avatar_url);
        
        // Store for future use
        if (typeof window.setState === 'function') {
          await window.setState('supabaseUser', user);
        }
        return user;
      }
      
      // THIRD: Check for stored session
      const supabaseUser = await getState('supabaseUser');
      const result = { supabaseUser };
      if (result.supabaseUser) {
        console.log('🔍 REAL_GOOGLE_AUTH: Found stored user with real avatar:', result.supabaseUser.email);
        console.log('🔍 REAL_GOOGLE_AUTH: Stored avatar URL:', result.supabaseUser.user_metadata?.avatar_url);
        return result.supabaseUser;
      }
      
      console.log('🔍 REAL_GOOGLE_AUTH: No authenticated user found via any method');
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
      if (typeof window.setState === 'function') {
        await window.setState('supabaseUser', null);
        await window.setState('supabaseSession', null);
      }
      console.log('🔍 REAL_GOOGLE_AUTH: Signed out successfully');
    } catch (error) {
      console.error('🔍 REAL_GOOGLE_AUTH: Sign out failed:', error);
      throw error;
    }
  }

  // Helper method to generate Gravatar ha
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealGoogleAuth;
} else if (typeof window !== 'undefined') {
  // COMP METHOD: Initialize and expose globally for browser extension
  window.realGoogleAuth = new RealGoogleAuth();
  window.RealGoogleAuth = RealGoogleAuth;
  console.log('✅ REAL_GOOGLE_AUTH: Initialized and exposed globally as window.realGoogleAuth');
}
