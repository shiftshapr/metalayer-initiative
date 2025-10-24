/**
 * AUTH MODULE - Authentication and User Management
 * Handles all authentication functionality
 */

class AuthModule {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }

  /**
   * Initialize Auth module
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('WARN', 'AuthModule already initialized');
      return;
    }

    this.log('INFO', 'Initializing AuthModule...');
    
    try {
      // TODO: Initialize authentication systems here
      
      this.isInitialized = true;
      this.log('INFO', 'AuthModule initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize AuthModule:', error);
      throw error;
    }
  }

  /**
   * Logging utility
   */
  log(level, message, ...args) {
    if (this.logLevel === 'SILENT') return;
    
    const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    if (levels[level] <= levels[this.logLevel]) {
      console.log(`[AuthModule] [${level}] ${message}`, ...args);
    }
  }
}

// ===== AUTHENTICATION FUNCTIONS (Move from sidepanel.js) =====
// TODO: Move these functions from sidepanel.js:

async function authenticateWithSupabase(user) {
  try {
    console.log('🔧 SUPABASE AUTH: Authenticating user with Supabase...');
    console.log('🔧 SUPABASE AUTH: User email:', user.email);
    
    if (!window.supabase) {
      console.error('❌ SUPABASE AUTH: Supabase client not available');
      return;
    }
    
    // Check if user is already authenticated
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    if (session && session.user && session.user.email === user.email) {
      console.log('✅ SUPABASE AUTH: User already authenticated with Supabase');
      console.log('✅ SUPABASE AUTH: Session expires at:', new Date(session.expires_at * 1000));
      return;
    }
    
    // CRITICAL FIX: Use unified authentication system for real-time
    console.log('🔧 SUPABASE AUTH: Authenticating user with unified auth system...');
    
    // Initialize unified auth if not already done
    if (!window.unifiedAuth) {
      console.error('❌ SUPABASE AUTH: Unified auth system not available');
      return;
    }
    
    // Authenticate user with unified system
    const authSuccess = await window.authenticateUserForRealtime(user.email, user.name);
    
    if (authSuccess) {
      console.log('✅ SUPABASE AUTH: User authenticated for real-time');
      
      // Test real-time connection
      const testResult = await window.testRealtimeWithUnifiedAuth('test-page-123');
      if (testResult) {
        console.log('🎉 SUPABASE AUTH: Real-time is working!');
      } else {
        console.warn('⚠️ SUPABASE AUTH: Real-time test failed');
      }
    } else {
      console.warn('⚠️ SUPABASE AUTH: Authentication failed, real-time may not work');
    }
    
    // Set the current user in the real-time client for context
    if (window.supabaseRealtimeClient) {
      await window.supabaseRealtimeClient.setCurrentUser(user.email, user.id, 'comm-001');
      console.log('✅ SUPABASE AUTH: Real-time client user set');
    }
    
    // Update global user context with additional data
    if (window.currentUser) {
      window.currentUser.id = user.id;
      window.currentUser.communityId = 'comm-001';
    }
    
    console.log('✅ SUPABASE AUTH: User context set globally');
    console.log('✅ SUPABASE AUTH: Authentication process completed');
    
  } catch (error) {
    console.error('❌ SUPABASE AUTH: Exception during authentication:', error);
  }
}

// --- Authentication Check Functions ---
async function requireAuth(action, callback) {
  try {
    // Check window.currentUser from direct authentication
    const currentUser = window.currentUser;
    
    console.log('[AUTH] requireAuth called for:', action, 'currentUser:', currentUser);
    console.log(`requireAuth called for: ${action}, currentUser: ${currentUser ? 'exists' : 'null'}`);
    
    if (!currentUser) {
      console.log('No user found, showing auth prompt');
      showAuthPrompt(action);
      return false;
    }
    console.log('User found, executing callback');
    if (callback) callback();
    return true;
  } catch (error) {
    console.log('Error checking auth, showing auth prompt');
    showAuthPrompt(action);
    return false;
  }
}

function showAuthPrompt(action) {
  console.log('showAuthPrompt called for:', action);
  const authPrompt = document.getElementById('auth-prompt-modal');
  if (!authPrompt) {
    console.log('Creating auth prompt modal');
    createAuthPromptModal();
  }
  
  const actionText = document.getElementById('auth-prompt-action');
  if (actionText) {
    actionText.textContent = action;
  }
  
  // Show which auth provider is available
  const providerName = authManager.currentProvider?.name || 'unknown';
  const providerInfo = document.getElementById('auth-prompt-provider');
  if (providerInfo) {
    providerInfo.textContent = `Using ${providerName} authentication`;
  }
  
  const modal = document.getElementById('auth-prompt-modal');
  if (modal) {
    modal.style.display = 'block';
    console.log('Auth prompt modal displayed');
  } else {
    console.error('Auth prompt modal not found!');
  }
  console.log(`Auth required for: ${action} (provider: ${providerName})`);
}

function createAuthPromptModal() {
  const modal = document.createElement('div');
  modal.id = 'auth-prompt-modal';
  modal.className = 'modal';
  modal.style.display = 'none';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Authentication Required</h3>
        <button id="close-auth-prompt" class="close-button">&times;</button>
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
  document.getElementById('close-auth-prompt').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  document.getElementById('auth-prompt-cancel').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  document.getElementById('auth-prompt-google').addEventListener('click', () => {
    modal.style.display = 'none';
    signInWithGoogle();
  });
  
  document.getElementById('auth-prompt-magic').addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('magic-link-modal').style.display = 'block';
  });
  
  // Close modal if clicked outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

function initializeRealGoogleAuth() {
  try {
    console.log('🚀 REAL_GOOGLE_AUTH: Initializing for actual Google profile pictures...');
    
    // Initialize real Google auth
    if (typeof RealGoogleAuth !== 'undefined') {
      realGoogleAuth = new RealGoogleAuth();
      realGoogleAuth.initialize().then(success => {
        if (success) {
          console.log('✅ REAL_GOOGLE_AUTH: Real Google Auth initialized successfully');
          console.log('✅ REAL_GOOGLE_AUTH: Will now use actual Google profile pictures');
        } else {
          console.error('❌ REAL_GOOGLE_AUTH: Failed to initialize');
        }
      });
    } else {
      console.warn('⚠️ REAL_GOOGLE_AUTH: RealGoogleAuth not available - check if script is loaded');
    }
  } catch (error) {
    console.error('❌ REAL_GOOGLE_AUTH: Error initializing:', error);
  }
}

// --- Auth Functions ---

// CRITICAL FIX: Authenticate user with Supabase after Google auth
async function authenticateWithSupabase(user) {
  try {
    console.log('🔧 SUPABASE AUTH: Authenticating user with Supabase...');
    console.log('🔧 SUPABASE AUTH: User email:', user.email);
    
    if (!window.supabase) {
      console.error('❌ SUPABASE AUTH: Supabase client not available');
      return;
    }
    
    // Check if user is already authenticated
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    if (session && session.user && session.user.email === user.email) {
      console.log('✅ SUPABASE AUTH: User already authenticated with Supabase');
      console.log('✅ SUPABASE AUTH: Session expires at:', new Date(session.expires_at * 1000));
      return;
    }
    
    // CRITICAL FIX: Use unified authentication system for real-time
    console.log('🔧 SUPABASE AUTH: Authenticating user with unified auth system...');
    
    // Initialize unified auth if not already done
    if (!window.unifiedAuth) {
      console.error('❌ SUPABASE AUTH: Unified auth system not available');
      return;
    }
    
    // Authenticate user with unified system
    const authSuccess = await window.authenticateUserForRealtime(user.email, user.name);
    
    if (authSuccess) {
      console.log('✅ SUPABASE AUTH: User authenticated for real-time');
      
      // Test real-time connection
      const testResult = await window.testRealtimeWithUnifiedAuth('test-page-123');
      if (testResult) {
        console.log('🎉 SUPABASE AUTH: Real-time is working!');
      } else {
        console.warn('⚠️ SUPABASE AUTH: Real-time test failed');
      }
    } else {
      console.warn('⚠️ SUPABASE AUTH: Authentication failed, real-time may not work');
    }
    
    // Set the current user in the real-time client for context
    if (window.supabaseRealtimeClient) {
      await window.supabaseRealtimeClient.setCurrentUser(user.email, user.id, 'comm-001');
      console.log('✅ SUPABASE AUTH: Real-time client user set');
    }
    
    // Update global user context with additional data
    if (window.currentUser) {
      window.currentUser.id = user.id;
      window.currentUser.communityId = 'comm-001';
    }
    
    console.log('✅ SUPABASE AUTH: User context set globally');
    console.log('✅ SUPABASE AUTH: Authentication process completed');
    
  } catch (error) {
    console.error('❌ SUPABASE AUTH: Exception during authentication:', error);
  }
}

// CRITICAL FIX: Test real-time with authenticated user
async function testRealtimeAfterAuth(pageId) {
  console.log('🧪 REALTIME TEST: Testing real-time with authenticated user...');
  
  if (!window.supabase) {
    console.error('❌ REALTIME TEST: Supabase client not available');
    return false;
  }
  
  try {
    const result = await testRealtimeWithAuth(window.supabase, pageId);
    
    if (result.success) {
      console.log('🎉 REALTIME TEST: Real-time is working with authenticated user!');
      console.log('🎉 REALTIME TEST: Events received:', result.eventReceived);
      return true;
    } else {
      console.error('❌ REALTIME TEST: Real-time still not working');
      console.error('❌ REALTIME TEST: Status:', result.status);
      return false;
    }
  } catch (error) {
    console.error('❌ REALTIME TEST: Exception during test:', error);
    return false;
  }
}

async function signInWithGoogle() {
  try {
    console.log('Attempting Google sign-in for REAL profile pictures...');
    
    // Use real Google auth for actual profile pictures
    if (realGoogleAuth) {
      const result = await realGoogleAuth.signInWithGoogle();
      console.log('Real Google sign-in successful:', result);
      
      // Update UI with the authenticated user
      if (result && result.user) {
        // CRITICAL FIX: Authenticate with Supabase after Google auth
        await authenticateWithSupabase(result.user);
        await updateUI(result.user);
        console.log(`User authenticated with REAL profile picture: ${result.user.email}`);
        console.log('🔍 REAL_GOOGLE_AUTH: Real avatar URL:', result.user.user_metadata?.avatar_url);
      }
    } else {
      // Fallback to AuthManager
      const result = await authManager.signIn('google');
      console.log('Google sign-in successful (fallback):', result);
      
      // Update UI with the authenticated user
      if (result && result.user) {
        // CRITICAL FIX: Authenticate with Supabase after Google auth
        await authenticateWithSupabase(result.user);
        await updateUI(result.user);
        console.log(`User authenticated (fallback): ${result.user.email}`);
      }
    }
  } catch (error) {
    console.error('Google sign-in failed:', error);
    console.log(`Google sign-in error: ${error.message}`);
    
    // Show error to user
    const statusElement = document.getElementById('magic-link-status');
    if (statusElement) {
      statusElement.textContent = `Sign-in failed: ${error.message}`;
      statusElement.style.color = 'red';
    }
  }
}

// was not in here before
async function sendMagicLink() {
  try {
    const email = document.getElementById('magic-link-email').value;
    if (!email) {
      document.getElementById('magic-link-status').textContent = 'Please enter an email address';
      return;
    }

    document.getElementById('magic-link-status').textContent = 'Sending magic link...';
    console.log(`Attempting magic link sign-in for: ${email}`);
    
    const result = await authManager.signIn('magic_link', email);
    
    if (result && result.user) {
      document.getElementById('magic-link-status').textContent = 'Magic link sent! Check your email.';
      await updateUI(result.user);
      console.log(`Magic link successful: ${result.user.email}`);
    } else {
      document.getElementById('magic-link-status').textContent = 'Magic link sent! Check your email.';
    }
    document.getElementById('magic-link-modal').style.display = 'none';
  } catch (error) {
    console.error('Magic link sign-in failed:', error);
    document.getElementById('magic-link-status').textContent = `Error: ${error.message}`;
    console.log(`Magic link error: ${error.message}`);
  }
}

async function signOut() {
  try {
    console.log('Attempting sign-out...');
    await authManager.signOut();
    console.log('Sign-out successful');
  } catch (error) {
    console.error('Sign-out failed:', error);
    console.log(`Sign-out error: ${error.message}`);
  }
}

// CRITICAL FIX: Complete OTP verification for real-time
async function completeOTPForRealtime(otpCode) {
  console.log('🔐 OTP VERIFICATION: Completing OTP verification for real-time...');
  
  if (!window.supabase) {
    console.error('❌ OTP VERIFICATION: Supabase client not available');
    return false;
  }
  
  try {
    const result = await completeOTPVerification(window.supabase, otpCode);
    
    if (result.success) {
      console.log('✅ OTP VERIFICATION: OTP verified successfully');
      console.log('✅ OTP VERIFICATION: User authenticated:', result.user.email);
      console.log('✅ OTP VERIFICATION: Session expires at:', new Date(result.session.expires_at * 1000));
      
      // Now test real-time with authenticated user
      const testResult = await testRealtimeAfterAuth('00000000-0000-0000-0000-000000000001');
      if (testResult) {
        console.log('🎉 OTP VERIFICATION: Real-time is now working!');
      }
      
      return true;
    } else {
      console.error('❌ OTP VERIFICATION: OTP verification failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ OTP VERIFICATION: Exception during OTP verification:', error);
    return false;
  }
}

// Get current user ID for presence tracking
async function getCurrentUserId() {
  try {
    // Use window.currentUser from direct authentication
    const user = window.currentUser;
    if (user && user.id) {
      return user.id; // Use the actual user ID
    } else {
      // Fallback to email if no ID is stored
      const email = await getCurrentUserEmail();
      return email;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
    // Fallback to email
    const email = await getCurrentUserEmail();
    return email;
  }
}

// Get current user email for presence tracking
async function getCurrentUserEmail() {
  try {
    // FIRST: Try real Google auth for actual profile pictures
    if (realGoogleAuth) {
      const user = await realGoogleAuth.getCurrentUser();
      console.log('[AUTH] Real Google Auth returned user:', user);
      
      if (user && user.email) {
        console.log('[AUTH] Found authenticated user with REAL profile picture:', user.email);
        console.log('[AUTH] Real avatar URL:', user.user_metadata?.avatar_url);
        return user.email;
      }
    }
    
    // SECOND: Fallback to AuthManager
    const user = await authManager.getCurrentUser();
    console.log('[AUTH] AuthManager returned user:', user);
    
    if (user && user.email) {
      console.log('[AUTH] Found authenticated user (fallback):', user.email);
      return user.email;
    }
    
    console.error('[AUTH] No authenticated user found via any method');
    
    // Show authentication prompt for proper OAuth flow
    console.log('[AUTH] No user found, showing authentication prompt...');
    showAuthPrompt('access presence features');
    
    // Return null instead of throwing error to allow graceful handling
    return null;
  } catch (error) {
    console.error('[AUTH] Error getting current user:', error.message);
    throw new Error('User not authenticated');
  }
}

// Get the avatar color for the current user (custom or default)
function getCurrentUserAvatarColor() {
  return new Promise((resolve) => {
    // Modernized: Use StateManager instead of Chrome Storage
    getState('customAvatarColor').then((customAvatarColor) => {
      if (result.customAvatarColor) {
        resolve(result.customAvatarColor);
      } else {
        // Use the same color system as message avatars
        getCurrentUserEmail().then(email => {
          resolve(getAvatarColor(email));
        }).catch(() => {
          resolve('#45B7D1'); // Default blue
        });
      }
    });
  });
}

function getUserAvatarBgColor() {
  // Get the user's custom background color for their profile avatar
  if (window.currentUser && window.currentUser.auraColor) {
    return window.currentUser.auraColor;
  }
  return '#ffffff'; // Default white
}

function getCurrentUserAvatarBgColor() {
  if (window.currentUser && window.currentUser.auraColor) {
    return window.currentUser.auraColor;
  }
  return '#ffffff'; // Default white
}


// Global function to reset to default avatar color
function resetCustomAvatarColor() {
  // Modernized: Use StateManager instead of Chrome Storage
  setState('customAvatarColor', null).then(() => {
    // Refresh the profile avatar
    refreshUserAvatar();
  });
}



async function testRealtimeAfterAuth(pageId) {
  console.log('🧪 REALTIME TEST: Testing real-time with authenticated user...');
  
  if (!window.supabase) {
    console.error('❌ REALTIME TEST: Supabase client not available');
    return false;
  }
  
  try {
    const result = await testRealtimeWithAuth(window.supabase, pageId);
    
    if (result.success) {
      console.log('🎉 REALTIME TEST: Real-time is working with authenticated user!');
      console.log('🎉 REALTIME TEST: Events received:', result.eventReceived);
      return true;
    } else {
      console.error('❌ REALTIME TEST: Real-time still not working');
      console.error('❌ REALTIME TEST: Status:', result.status);
      return false;
    }
  } catch (error) {
    console.error('❌ REALTIME TEST: Exception during test:', error);
    return false;
  }
}

async function completeOTPForRealtime(otpCode) {
  console.log('🔐 OTP VERIFICATION: Completing OTP verification for real-time...');
  
  if (!window.supabase) {
    console.error('❌ OTP VERIFICATION: Supabase client not available');
    return false;
  }
  
  try {
    const result = await completeOTPVerification(window.supabase, otpCode);
    
    if (result.success) {
      console.log('✅ OTP VERIFICATION: OTP verified successfully');
      console.log('✅ OTP VERIFICATION: User authenticated:', result.user.email);
      console.log('✅ OTP VERIFICATION: Session expires at:', new Date(result.session.expires_at * 1000));
      
      // Now test real-time with authenticated user
      const testResult = await testRealtimeAfterAuth('00000000-0000-0000-0000-000000000001');
      if (testResult) {
        console.log('🎉 OTP VERIFICATION: Real-time is now working!');
      }
      
      return true;
    } else {
      console.error('❌ OTP VERIFICATION: OTP verification failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ OTP VERIFICATION: Exception during OTP verification:', error);
    return false;
  }
}


// Export for global access
window.AuthModule = AuthModule;
window.getCurrentUserEmail = getCurrentUserEmail;
window.authenticateWithSupabase = authenticateWithSupabase;
window.requireAuth = requireAuth;
window.showAuthPrompt = showAuthPrompt;
window.createAuthPromptModal = createAuthPromptModal;
window.initializeRealGoogleAuth = initializeRealGoogleAuth;
window.signOut = signOut;
window.logout = signOut; // Alias for compatibility