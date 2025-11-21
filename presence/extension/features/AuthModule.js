/**
 * AUTH MODULE - Authentication and User Management
 * Handles all authentication functionality
 */
import { stateManagerInstance } from '../core/StateManager.js';
// COMP METHOD: Track initialization state to prevent premature auth prompts
let isInitializing = true;
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
        }
        catch (error) {
            this.log('ERROR', 'Failed to initialize AuthModule:', error);
            throw error;
        }
    }
    /**
     * Logging utility
     */
    log(level, message, ...args) {
        if (this.logLevel === 'SILENT')
            return;
        const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, SILENT: -1 };
        if (levels[level] <= levels[this.logLevel]) {
            console.log(`[AuthModule] [${level}] ${message}`, ...args);
        }
    }
}
// ===== AUTHENTICATION FUNCTIONS =====
async function authenticateWithSupabase(user) {
    try {
        console.log('🔧 SUPABASE AUTH: Authenticating user with Supabase...');
        console.log('🔧 SUPABASE AUTH: User id:', user.id || user.userId);
        const supabase = window.supabase;
        if (!supabase) {
            console.error('❌ SUPABASE AUTH: Supabase client not available');
            return;
        }
        // Check if user is already authenticated
        // Type assertion needed because getSession may not be in the type definition
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (session && session.user && session.user.email === user.email) {
            console.log('✅ SUPABASE AUTH: User already authenticated with Supabase');
            console.log('✅ SUPABASE AUTH: Session expires at:', new Date(session.expires_at * 1000));
            return;
        }
        // CRITICAL FIX: Use unified authentication system for real-time
        console.log('🔧 SUPABASE AUTH: Authenticating user with unified auth system...');
        // Initialize unified auth if not already done
        const unifiedAuth = window.unifiedAuth;
        if (!unifiedAuth) {
            console.error('❌ SUPABASE AUTH: Unified auth system not available');
            return;
        }
        // Authenticate user with unified system
        const authenticateUserForRealtime = window.authenticateUserForRealtime;
        if (!authenticateUserForRealtime) {
            console.error('❌ SUPABASE AUTH: authenticateUserForRealtime not available');
            return;
        }
        const authSuccess = await authenticateUserForRealtime(user, user.email);
        if (authSuccess) {
            console.log('✅ SUPABASE AUTH: User authenticated for real-time');
            // Test real-time connection
            const testRealtimeWithUnifiedAuth = window.testRealtimeWithUnifiedAuth;
            if (testRealtimeWithUnifiedAuth) {
                const testResult = await testRealtimeWithUnifiedAuth('test-page-123');
                if (testResult) {
                    console.log('🎉 SUPABASE AUTH: Real-time is working!');
                }
                else {
                    console.warn('⚠️ SUPABASE AUTH: Real-time test failed');
                }
            }
        }
        else {
            console.warn('⚠️ SUPABASE AUTH: Authentication failed, real-time may not work');
        }
        // Set the current user in the real-time client for context
        const supabaseRealtimeClient = window.supabaseRealtimeClient;
        if (supabaseRealtimeClient && supabaseRealtimeClient.setCurrentUser) {
            await supabaseRealtimeClient.setCurrentUser(user.email, user.id, 'comm-001');
            console.log('✅ SUPABASE AUTH: Real-time client user set');
        }
        // ROOT CAUSE FIX: Fetch AppUser UUID from backend (AppUser table always has UUIDs)
        // Supabase auth user.id is NOT a UUID - it's a Google ID like "116467399993975200419"
        // We need to get the AppUser UUID from backend by email
        const currentUser = stateManagerInstance.getState('currentUser');
        if (currentUser && user.email) {
            try {
                const api = window.api;
                if (!api || !api.request) {
                    console.warn('⚠️ AUTH: API not available');
                    return;
                }
                // Get or create AppUser - backend will return UUID
                const appUserResponse = await api.request(`/v1/users/${encodeURIComponent(user.email)}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        email: user.email,
                        name: user.name || user.userMetadata?.fullName || user.email.split('@')[0],
                        avatarUrl: user.picture || user.userMetadata?.avatarUrl
                    })
                });
                const appUser = (appUserResponse && typeof appUserResponse === 'object' && 'data' in appUserResponse ? appUserResponse.data : appUserResponse);
                if (appUser && appUser.id) {
                    // AppUser.id is ALWAYS a UUID (from userService.getOrCreateUser)
                    const updatedUser = { ...currentUser, id: appUser.id };
                    stateManagerInstance.setState('currentUser', updatedUser);
                    console.log('✅ AUTH: Set currentUser.id to AppUser UUID:', appUser.id);
                    // CRITICAL FIX: Fetch complete user data including auraColor using the UUID we just got
                    // POST /v1/users/:email may not return auraColor, so do GET /v1/users/:id for complete data
                    try {
                        const completeUserData = await api.request(`/v1/users/${appUser.id}`, {
                            method: 'GET'
                        });
                        if (completeUserData) {
                            const currentUserForUpdate = stateManagerInstance.getState('currentUser') || updatedUser;
                            const userWithData = { ...currentUserForUpdate };
                            // Set auraColor from the complete user data (same approach as PreRenderInitializer)
                            const auraColor = completeUserData.auraColor;
                            if (auraColor) {
                                userWithData.auraColor = auraColor;
                                console.log('✅ AUTH: Set currentUser.auraColor from complete user data:', auraColor);
                            }
                            else {
                                console.log('ℹ️ AUTH: No auraColor in complete user data (user may not have set one yet)');
                                userWithData.auraColor = undefined;
                            }
                            // Also update avatarUrl if it differs from Google OAuth avatar
                            const dbAvatarUrl = completeUserData.avatarUrl;
                            if (dbAvatarUrl && dbAvatarUrl !== userWithData.avatarUrl) {
                                userWithData.avatarUrl = dbAvatarUrl;
                                console.log('✅ AUTH: Updated currentUser.avatarUrl from database:', dbAvatarUrl);
                            }
                            // ROOT CAUSE FIX: Update stateManager with complete user data
                            stateManagerInstance.setState('currentUser', userWithData);
                            // CRITICAL FIX: Also update AuthManager with complete user data
                            const authManager = window.authManager;
                            if (authManager && typeof authManager.updateUserProfile === 'function') {
                                authManager.updateUserProfile({
                                    auraColor: userWithData.auraColor ?? null,
                                    avatarUrl: userWithData.avatarUrl,
                                    // auraColor already set above (camelCase only - RED-LINE compliance)
                                });
                                console.log('✅ AUTH: Updated AuthManager with complete user data');
                            }
                        }
                    }
                    catch (error) {
                        console.warn('⚠️ AUTH: Could not fetch complete user data for auraColor:', error);
                        const currentUserForError = stateManagerInstance.getState('currentUser');
                        if (currentUserForError) {
                            stateManagerInstance.setState('currentUser', { ...currentUserForError, auraColor: undefined });
                        }
                    }
                }
            }
            catch (error) {
                console.warn('⚠️ AUTH: Could not fetch AppUser UUID, will be set on next API call:', error);
                // Leave as null - will be set when backend returns UUID in reaction/user API response
            }
            const currentUserForCommunity = stateManagerInstance.getState('currentUser');
            if (currentUserForCommunity) {
                stateManagerInstance.setState('currentUser', { ...currentUserForCommunity, communityId: 'comm-001' });
            }
        }
        console.log('✅ SUPABASE AUTH: User context set globally');
        console.log('✅ SUPABASE AUTH: Authentication process completed');
    }
    catch (error) {
        console.error('❌ SUPABASE AUTH: Exception during authentication:', error);
    }
}
// --- Authentication Check Functions ---
async function requireAuth(action, callback) {
    try {
        // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no window.currentUser)
        const currentUser = stateManagerInstance.getState('currentUser');
        console.log('[AUTH] requireAuth called for:', action, 'currentUser:', currentUser);
        console.log(`requireAuth called for: ${action}, currentUser: ${currentUser ? 'exists' : 'null'}`);
        if (!currentUser) {
            console.log('No user found, showing auth prompt');
            showAuthPrompt(action);
            return false;
        }
        console.log('User found, executing callback');
        if (callback)
            callback();
        return true;
    }
    catch (error) {
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
    const authManager = window.authManager;
    const providerName = (typeof authManager?.currentProvider === 'object' && authManager.currentProvider?.name) || (typeof authManager?.currentProvider === 'string' ? authManager.currentProvider : 'unknown');
    const providerInfo = document.getElementById('auth-prompt-provider');
    if (providerInfo) {
        providerInfo.textContent = `Using ${providerName} authentication`;
    }
    const modal = document.getElementById('auth-prompt-modal');
    if (modal) {
        modal.style.display = 'block';
        console.log('Auth prompt modal displayed');
    }
    else {
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
    const closeBtn = document.getElementById('close-auth-prompt');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    const cancelBtn = document.getElementById('auth-prompt-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    const googleBtn = document.getElementById('auth-prompt-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            const signInWithGoogle = window.signInWithGoogle;
            if (signInWithGoogle) {
                signInWithGoogle();
            }
        });
    }
    const magicBtn = document.getElementById('auth-prompt-magic');
    if (magicBtn) {
        magicBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            const magicLinkModal = document.getElementById('magic-link-modal');
            if (magicLinkModal) {
                magicLinkModal.style.display = 'block';
            }
        });
    }
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
        const RealGoogleAuth = window.RealGoogleAuth;
        if (typeof RealGoogleAuth !== 'undefined' && typeof RealGoogleAuth === 'function') {
            const realGoogleAuth = new RealGoogleAuth();
            realGoogleAuth.initialize().then((success) => {
                if (success) {
                    console.log('✅ REAL_GOOGLE_AUTH: Real Google Auth initialized successfully');
                    console.log('✅ REAL_GOOGLE_AUTH: Will now use actual Google profile pictures');
                }
                else {
                    console.error('❌ REAL_GOOGLE_AUTH: Failed to initialize');
                }
            });
        }
        else {
            console.warn('⚠️ REAL_GOOGLE_AUTH: RealGoogleAuth not available - check if script is loaded');
        }
    }
    catch (error) {
        console.error('❌ REAL_GOOGLE_AUTH: Error initializing:', error);
    }
}
// CRITICAL FIX: Test real-time with authenticated user
async function testRealtimeAfterAuth(pageId) {
    console.log('🧪 REALTIME TEST: Testing real-time with authenticated user...');
    const supabase = window.supabase;
    if (!supabase) {
        console.error('❌ REALTIME TEST: Supabase client not available');
        return false;
    }
    try {
        const testRealtimeWithAuth = window.testRealtimeWithAuth;
        if (!testRealtimeWithAuth) {
            console.error('❌ REALTIME TEST: testRealtimeWithAuth not available');
            return false;
        }
        const result = await testRealtimeWithAuth(supabase, pageId);
        if (result.success) {
            console.log('🎉 REALTIME TEST: Real-time is working with authenticated user!');
            if ('eventReceived' in result) {
                console.log('🎉 REALTIME TEST: Events received:', result.eventReceived);
            }
            return true;
        }
        else {
            console.error('❌ REALTIME TEST: Real-time still not working');
            if ('status' in result) {
                console.error('❌ REALTIME TEST: Status:', result.status);
            }
            return false;
        }
    }
    catch (error) {
        console.error('❌ REALTIME TEST: Exception during test:', error);
        return false;
    }
}
async function signInWithGoogle() {
    try {
        console.log('Attempting Google sign-in for REAL profile pictures...');
        const realGoogleAuth = window.realGoogleAuth;
        const authManager = window.authManager;
        // Use real Google auth for actual profile pictures
        if (realGoogleAuth && realGoogleAuth.signInWithGoogle) {
            const result = await realGoogleAuth.signInWithGoogle();
            console.log('Real Google sign-in successful:', result);
            // Update UI with the authenticated user
            if (result && result.user) {
                // CRITICAL FIX: Authenticate with Supabase after Google auth
                await authenticateWithSupabase(result.user);
                const updateUI = window.updateUI;
                if (updateUI) {
                    await updateUI(result.user);
                }
                console.log(`User authenticated with REAL profile picture: ${result.user.email}`);
                console.log('🔍 REAL_GOOGLE_AUTH: Real avatar URL:', result.user.user_metadata?.avatar_url);
            }
        }
        else if (authManager && authManager.signIn) {
            // Fallback to AuthManager
            const result = await authManager.signIn('google');
            console.log('Google sign-in successful (fallback):', result);
            // Update UI with the authenticated user
            if (result && result.user) {
                // CRITICAL FIX: Authenticate with Supabase after Google auth
                await authenticateWithSupabase(result.user);
                const updateUI = window.updateUI;
                if (updateUI) {
                    if (updateUI && typeof updateUI === 'function') {
                        await updateUI(result.user);
                    }
                }
                console.log(`User authenticated (fallback): ${result.user.email}`);
            }
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Google sign-in failed:', error);
        console.log(`Google sign-in error: ${errorMessage}`);
        // Show error to user
        const statusElement = document.getElementById('magic-link-status');
        if (statusElement) {
            statusElement.textContent = `Sign-in failed: ${errorMessage}`;
            statusElement.style.color = 'red';
        }
    }
}
async function sendMagicLink() {
    try {
        const emailInput = document.getElementById('magic-link-email');
        if (!emailInput) {
            console.error('Magic link email input not found');
            return;
        }
        const email = emailInput.value;
        if (!email) {
            const statusElement = document.getElementById('magic-link-status');
            if (statusElement) {
                statusElement.textContent = 'Please enter an email address';
            }
            return;
        }
        const statusElement = document.getElementById('magic-link-status');
        if (statusElement) {
            statusElement.textContent = 'Sending magic link...';
        }
        console.log(`Attempting magic link sign-in for: ${email}`);
        const authManager = window.authManager;
        if (!authManager || !authManager.signIn) {
            throw new Error('AuthManager not available');
        }
        const result = await authManager.signIn('magic_link', email);
        if (result && result.user) {
            if (statusElement) {
                statusElement.textContent = 'Magic link sent! Check your email.';
            }
            const updateUI = window.updateUI;
            if (updateUI && result.user) {
                await updateUI(result.user);
            }
            if (result.user) {
                console.log(`Magic link successful: ${result.user.email}`);
            }
        }
        else {
            if (statusElement) {
                statusElement.textContent = 'Magic link sent! Check your email.';
            }
        }
        const magicLinkModal = document.getElementById('magic-link-modal');
        if (magicLinkModal) {
            magicLinkModal.style.display = 'none';
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Magic link sign-in failed:', error);
        const statusElement = document.getElementById('magic-link-status');
        if (statusElement) {
            statusElement.textContent = `Error: ${errorMessage}`;
        }
        console.log(`Magic link error: ${errorMessage}`);
    }
}
async function signOut() {
    try {
        console.log('Attempting sign-out...');
        const authManager = window.authManager;
        if (authManager && authManager.signOut) {
            await authManager.signOut();
            console.log('Sign-out successful');
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Sign-out failed:', error);
        console.log(`Sign-out error: ${errorMessage}`);
    }
}
// CRITICAL FIX: Complete OTP verification for real-time
async function completeOTPForRealtime(otpCode) {
    console.log('🔐 OTP VERIFICATION: Completing OTP verification for real-time...');
    const supabase = window.supabase;
    if (!supabase) {
        console.error('❌ OTP VERIFICATION: Supabase client not available');
        return false;
    }
    try {
        const completeOTPVerification = window.completeOTPVerification;
        if (!completeOTPVerification) {
            console.error('❌ OTP VERIFICATION: completeOTPVerification not available');
            return false;
        }
        const result = await completeOTPVerification(supabase, otpCode);
        if (result && typeof result === 'object' && 'success' in result && result.success && 'user' in result && result.user) {
            const typedResult = result;
            console.log('✅ OTP VERIFICATION: OTP verified successfully');
            console.log('✅ OTP VERIFICATION: User authenticated:', typedResult.user.email);
            if (typedResult.session && typeof typedResult.session === 'object' && 'expires_at' in typedResult.session && typeof typedResult.session.expires_at === 'number') {
                console.log('✅ OTP VERIFICATION: Session expires at:', new Date(typedResult.session.expires_at * 1000));
            }
            // Now test real-time with authenticated user
            const testResult = await testRealtimeAfterAuth('00000000-0000-0000-0000-000000000001');
            if (testResult) {
                console.log('🎉 OTP VERIFICATION: Real-time is now working!');
            }
            return true;
        }
        else {
            const errorMessage = (result && typeof result === 'object' && 'error' in result) ? result.error : 'Unknown error';
            console.error('❌ OTP VERIFICATION: OTP verification failed:', errorMessage);
            return false;
        }
    }
    catch (error) {
        console.error('❌ OTP VERIFICATION: Exception during OTP verification:', error);
        return false;
    }
}
// Get current user ID for presence tracking
async function getCurrentUserId() {
    try {
        // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no window.currentUser)
        const user = stateManagerInstance.getState('currentUser');
        if (user && user.id) {
            return user.id; // Use the actual user ID
        }
        else {
            // Fallback to email if no ID is stored
            const email = await getCurrentUserEmail();
            return email;
        }
    }
    catch (error) {
        console.error('Error getting user ID:', error);
        // Fallback to email
        const email = await getCurrentUserEmail();
        return email;
    }
}
// Get current user email for presence tracking
// CRITICAL FIX: Guard to prevent multiple simultaneous calls
let isGettingCurrentUserEmail = false;
let currentUserEmailPromise = null;
async function getCurrentUserEmail() {
    // ROOT CAUSE FIX: Check stateManager first (TypeScript migration - no window.currentUser)
    const currentUserFromState = stateManagerInstance.getState('currentUser');
    if (currentUserFromState?.email) {
        console.log('[AUTH] Using existing stateManager.currentUser:', currentUserFromState?.email);
        return currentUserFromState?.email || null;
    }
    // CRITICAL FIX: Guard against multiple simultaneous calls
    if (isGettingCurrentUserEmail && currentUserEmailPromise) {
        console.log('[AUTH] getCurrentUserEmail() already in progress, returning existing promise');
        return currentUserEmailPromise;
    }
    isGettingCurrentUserEmail = true;
    currentUserEmailPromise = (async () => {
        try {
            // FIRST: Try real Google auth for actual profile pictures
            // COMP METHOD: Check if realGoogleAuth is available and initialized
            const realGoogleAuth = window.realGoogleAuth;
            if (realGoogleAuth && typeof realGoogleAuth.getCurrentUser === 'function') {
                console.log('[AUTH] Calling realGoogleAuth.getCurrentUser()...');
                const user = await realGoogleAuth.getCurrentUser();
                console.log('[AUTH] Real Google Auth returned user:', user);
                if (user && user.email) {
                    console.log('[AUTH] Found authenticated user with REAL profile picture:', user.email);
                    // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
                    stateManagerInstance.setState('currentUser', user);
                    console.log('[AUTH] Set stateManager.currentUser from getCurrentUserEmail():', user.email);
                    const userWithMetadata = user;
                    console.log('[AUTH] Real avatar URL:', userWithMetadata.user_metadata?.avatar_url);
                    return user.email;
                }
                else {
                    console.log('[AUTH] Real Google Auth returned null or no email');
                }
            }
            else {
                console.log('[AUTH] realGoogleAuth not available or not initialized');
            }
            // SECOND: Fallback to AuthManager
            const authManager = window.authManager;
            if (authManager && authManager.getCurrentUser) {
                const user = await authManager.getCurrentUser();
                console.log('[AUTH] AuthManager returned user:', user);
                if (user && user.email) {
                    console.log('[AUTH] Found authenticated user (fallback):', user.email);
                    // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
                    stateManagerInstance.setState('currentUser', user);
                    console.log('[AUTH] Set stateManager.currentUser from AuthManager:', user.email);
                    return user.email;
                }
            }
            console.error('[AUTH] No authenticated user found via any method');
            // COMP METHOD: Only show auth prompt after initialization is complete
            if (!isInitializing) {
                console.log('[AUTH] No user found, showing authentication prompt...');
                showAuthPrompt('access presence features');
            }
            else {
                console.log('[AUTH] No user found, but not showing auth prompt during initialization');
            }
            // Return null instead of throwing error to allow graceful handling
            return null;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('[AUTH] Error getting current user email:', errorMessage);
            return null;
        }
        finally {
            // CRITICAL FIX: Reset guard after completion
            isGettingCurrentUserEmail = false;
            currentUserEmailPromise = null;
        }
    })();
    return currentUserEmailPromise;
}
// Get the avatar color for the current user (custom or default)
function getCurrentUserAvatarColor() {
    return new Promise((resolve) => {
        // Modernized: Use StateManager instead of Chrome Storage
        const getState = window.getState;
        if (getState) {
            const stateValue = getState('customAvatarColor');
            if (stateValue && typeof stateValue === 'object' && 'customAvatarColor' in stateValue) {
                const colorResult = stateValue;
                if (colorResult.customAvatarColor) {
                    resolve(colorResult.customAvatarColor);
                    return;
                }
            }
            // Use the same color system as message avatars
            getCurrentUserEmail().then(email => {
                if (email) {
                    const getAvatarColor = window.getAvatarColor;
                    if (getAvatarColor && typeof getAvatarColor === 'function') {
                        resolve(getAvatarColor(email));
                    }
                    else {
                        resolve(window.AVATAR_FALLBACK_COLOR || '#ffffff');
                    }
                }
                else {
                    resolve(window.AVATAR_FALLBACK_COLOR || '#ffffff');
                }
            }).catch(() => {
                resolve(window.AVATAR_FALLBACK_COLOR || '#ffffff'); // Default white
            });
        }
        else {
            resolve(window.AVATAR_FALLBACK_COLOR || '#ffffff');
        }
    });
}
function getUserAvatarBgColor() {
    // Get the user's custom background color for their profile avatar
    // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no window.currentUser)
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser && currentUser.auraColor) {
        return currentUser.auraColor;
    }
    return window.AVATAR_FALLBACK_COLOR || '#ffffff'; // Default white
}
function getCurrentUserAvatarBgColor() {
    // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no window.currentUser)
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser && currentUser.auraColor) {
        return currentUser.auraColor;
    }
    return window.AVATAR_FALLBACK_COLOR || '#ffffff'; // Default white
}
// Global function to reset to default avatar color
function resetCustomAvatarColor() {
    // Modernized: Use StateManager instead of Chrome Storage
    const setState = window.setState;
    if (setState) {
        setState('customAvatarColor', null);
        // Refresh the profile avatar
        const refreshUserAvatar = window.refreshUserAvatar;
        if (refreshUserAvatar) {
            refreshUserAvatar();
        }
    }
}
// COMP METHOD: Mark initialization as complete
function markInitializationComplete() {
    isInitializing = false;
    console.log('[AUTH] Initialization complete - auth prompts will now be shown when needed');
}
// Export for global access
window.AuthModule = AuthModule;
window.getCurrentUserEmail = getCurrentUserEmail;
window.authenticateWithSupabase = authenticateWithSupabase;
window.requireAuth = requireAuth;
window.showAuthPrompt = showAuthPrompt;
window.createAuthPromptModal = createAuthPromptModal;
window.initializeRealGoogleAuth = initializeRealGoogleAuth;
window.markInitializationComplete = markInitializationComplete;
window.signOut = signOut;
window.logout = signOut; // Alias for compatibility
window.signInWithGoogle = signInWithGoogle;
window.sendMagicLink = sendMagicLink;
window.getCurrentUserId = getCurrentUserId;
window.getCurrentUserAvatarColor = getCurrentUserAvatarColor;
window.getUserAvatarBgColor = getUserAvatarBgColor;
window.getCurrentUserAvatarBgColor = getCurrentUserAvatarBgColor;
window.resetCustomAvatarColor = resetCustomAvatarColor;
window.testRealtimeAfterAuth = testRealtimeAfterAuth;
window.completeOTPForRealtime = completeOTPForRealtime;
export { AuthModule, authenticateWithSupabase, requireAuth, showAuthPrompt, createAuthPromptModal, initializeRealGoogleAuth, markInitializationComplete, signOut, signInWithGoogle, sendMagicLink, getCurrentUserId, getCurrentUserEmail, getCurrentUserAvatarColor, getUserAvatarBgColor, getCurrentUserAvatarBgColor, resetCustomAvatarColor, testRealtimeAfterAuth, completeOTPForRealtime };
