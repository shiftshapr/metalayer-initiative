/**
 * AUTH MODULE - Authentication and User Management
 * Handles all authentication functionality
 */

// Global types are automatically included via tsconfig.json - no need to import .d.ts files
import { SupabaseClient, User as UserType } from '../types/index.js';
import { stateManagerInstance } from '../core/StateManager.js';

import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
import {
  getCurrentUserAvatarBgColor as profileGetCurrentUserAvatarBgColor,
  getCurrentUserAvatarColor as profileGetCurrentUserAvatarColor,
  resetCustomAvatarColor as profileResetCustomAvatarColor
} from './ProfileManager.js';
type LogLevel = 'SILENT' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

// Type definitions for window properties
interface UnifiedAuth {
  initialize?: () => Promise<void>;
  [key: string]: unknown;
}

interface SupabaseRealtimeClient {
  setCurrentUser?: (email: string | undefined, id: string | undefined, communityId: string) => Promise<void>;
  sendMessage?: (content: string, parentId?: string | null, conversationId?: string | null) => Promise<unknown>;
  deleteMessage?: (messageId: string) => Promise<void>;
  editMessage?: (messageId: string, content: string) => Promise<void>;
  [key: string]: unknown;
}

interface AuthManager {
  getCurrentUser: () => Promise<UserType | null>;
  updateUserProfile: (profile: { auraColor?: string | null; avatarUrl?: string }) => void;
  signIn?: (provider: string, email?: string) => Promise<{ user?: UserType }>;
  signOut?: () => Promise<void>;
  currentProvider?: { name?: string } | string;
}

interface User {
  id?: string;
  userId?: string;
  email?: string;
  name?: string;
  picture?: string;
  userMetadata?: {
    fullName?: string;
    avatarUrl?: string;
  };
}

interface AppUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  auraColor?: string;
}

interface CompleteUserData {
  id?: string;
  auraColor?: string;
  avatarUrl?: string;
}

// COMP METHOD: Track initialization state to prevent premature auth prompts
let isInitializing: boolean = true;

class AuthModule {
  private logLevel: LogLevel = 'INFO';
  private isInitialized: boolean = false;

  /**
   * Initialize Auth module
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.log('WARN', 'AuthModule already initialized');
      return;
    }

    this.log('INFO', 'Initializing AuthModule...');
    
    try {
      // TODO: Initialize authentication systems here
      
      this.isInitialized = true;
      this.log('INFO', 'AuthModule initialized successfully');
    } catch (error: unknown) {
      this.log('ERROR', 'Failed to initialize AuthModule:', error);
      throw error;
    }
  }

  /**
   * Logging utility
   */
  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (this.logLevel === 'SILENT') return;
    
    const levels: Record<LogLevel, number> = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, SILENT: -1 };
    if (levels[level] <= levels[this.logLevel]) {
      const data = args.length > 0 ? args.length === 1 ? args[0] : args : null;
      if (level === 'ERROR') {
        Logger.error(`[AuthModule] ${message}`, data, 'auth');
      } else if (level === 'WARN') {
        Logger.warn(`[AuthModule] ${message}`, data, 'auth');
      } else {
        Logger.debug(`[AuthModule] [${level}] ${message}`, data, 'auth');
      }
    }
  }
}

// ===== AUTHENTICATION FUNCTIONS =====

async function authenticateWithSupabase(user: User): Promise<void> {
  try {
    Logger.debug('🔧 SUPABASE AUTH: Authenticating user with Supabase...', null, 'auth');
    Logger.debug('🔧 SUPABASE AUTH: User id:', user.id || user.userId, 'auth');
    
    // ROOT CAUSE FIX: Map user_metadata.avatar_url to avatarUrl before processing
    const userWithMetadata = user as UserType & { user_metadata?: { avatar_url?: string } };
    const avatarUrl = userWithMetadata.user_metadata?.avatar_url;
    if (avatarUrl && !(user as UserType).avatarUrl) {
      (user as UserType).avatarUrl = avatarUrl;
      Logger.debug('[AUTH] Mapped user_metadata.avatar_url to avatarUrl in authenticateWithSupabase:', avatarUrl, 'auth');
    }
    
    // TODO: Replace with ES6 SupabaseService import when available
    // ACCEPTABLE: Using window.supabase for now as it's a runtime dependency
    const win = window as Window & { supabase?: SupabaseClient };
    const supabase = win.supabase;
    if (!supabase) {
      Logger.error('❌ SUPABASE AUTH: Supabase client not available', null, 'auth');
      return;
    }
    
    // Check if user is already authenticated
    // Type assertion needed because getSession may not be in the type definition
    const { data: { session }, error: _sessionError } = await ((supabase.auth as unknown) as { getSession: () => Promise<{ data: { session: { user: { email?: string }; expires_at: number } | null }; error: unknown }> }).getSession();
    if (session && session.user && session.user.email === user.email) {
      Logger.debug('✅ SUPABASE AUTH: User already authenticated with Supabase', null, 'auth');
      Logger.debug('✅ SUPABASE AUTH: Session expires at:', new Date(session.expires_at * 1000), 'auth');
      return;
    }
    
    // CRITICAL FIX: Use unified authentication system for real-time
    Logger.debug('🔧 SUPABASE AUTH: Authenticating user with unified auth system...', null, 'auth');
    
    // Initialize unified auth if not already done
    const unifiedAuth = (window as Window & { unifiedAuth?: UnifiedAuth }).unifiedAuth;
    if (!unifiedAuth) {
      Logger.error('❌ SUPABASE AUTH: Unified auth system not available', null, 'auth');
      return;
    }
    
    // Authenticate user with unified system
    const authenticateUserForRealtime = (window as Window & { authenticateUserForRealtime?: (user: User, email?: string) => Promise<boolean> }).authenticateUserForRealtime;
    if (!authenticateUserForRealtime) {
      Logger.error('❌ SUPABASE AUTH: authenticateUserForRealtime not available', null, 'auth');
      return;
    }
    
    const authSuccess = await authenticateUserForRealtime(user, user.email);
    
    if (authSuccess) {
      Logger.debug('✅ SUPABASE AUTH: User authenticated for real-time', null, 'auth');
      
      // Test real-time connection
      const testRealtimeWithUnifiedAuth = (window as Window & { testRealtimeWithUnifiedAuth?: (pageId?: string) => Promise<boolean> }).testRealtimeWithUnifiedAuth;
      if (testRealtimeWithUnifiedAuth) {
        const testResult = await testRealtimeWithUnifiedAuth('test-page-123');
        if (testResult) {
          Logger.debug('🎉 SUPABASE AUTH: Real-time is working!', null, 'auth');
        } else {
          Logger.warn('⚠️ SUPABASE AUTH: Real-time test failed', null, 'auth');
        }
      }
    } else {
      Logger.warn('⚠️ SUPABASE AUTH: Authentication failed, real-time may not work', 'auth');
    }
    
    // Set the current user in the real-time client for context
    const supabaseRealtimeClient = (window as Window & { supabaseRealtimeClient?: SupabaseRealtimeClient }).supabaseRealtimeClient;
    if (supabaseRealtimeClient && supabaseRealtimeClient.setCurrentUser) {
      // Get primary community from state or fallback to Public Square
      const { PUBLIC_SQUARE_UUID } = await import('../core/ConfigModule.js');
      const primaryCommunity = stateManagerInstance.getState('primaryCommunity') as string | null;
      await supabaseRealtimeClient.setCurrentUser(user.email, user.id, primaryCommunity || PUBLIC_SQUARE_UUID);
      Logger.debug('✅ SUPABASE AUTH: Real-time client user set', null, 'auth');
    }
    
    // ROOT CAUSE FIX: Fetch AppUser UUID from backend (AppUser table always has UUIDs)
    // Supabase auth user.id is NOT a UUID - it's a Google ID like "116467399993975200419"
    // We need to get the AppUser UUID from backend by email
    const currentUser = stateManagerInstance.getState('currentUser') as UserType | null;
    if (currentUser && user.email) {
      try {
        const api = (window as unknown as Window & { api?: { request: <T = unknown>(endpoint: string, options?: { method?: string; body?: string | Record<string, unknown>; headers?: Record<string, string> }) => Promise<{ data?: T; error?: unknown }> } }).api;
        if (!api || !api.request) {
          Logger.warn('⚠️ AUTH: API not available', null, 'auth');
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
        const appUser = (appUserResponse && typeof appUserResponse === 'object' && 'data' in appUserResponse ? (appUserResponse as { data?: unknown }).data : appUserResponse) as unknown as AppUser;
        
        if (appUser && appUser.id) {
          // AppUser.id is ALWAYS a UUID (from userService.getOrCreateUser)
          const updatedUser = { ...currentUser, id: appUser.id };
          stateManagerInstance.setState('currentUser', updatedUser);
          Logger.debug('✅ AUTH: Set currentUser.id to AppUser UUID:', appUser.id, 'auth');
            
            // CRITICAL FIX: Fetch complete user data including auraColor using the UUID we just got
            // POST /v1/users/:email may not return auraColor, so do GET /v1/users/:id for complete data
            try {
              const completeUserData = await api.request(`/v1/users/${appUser.id}`, {
                method: 'GET'
              }) as CompleteUserData;

              if (completeUserData) {
              const currentUserForUpdate = stateManagerInstance.getState('currentUser') as UserType | null || updatedUser;
              const userWithData = { ...currentUserForUpdate };
              
                // Set auraColor from the complete user data (same approach as PreRenderInitializer)
                const auraColor = completeUserData.auraColor;
                if (auraColor) {
                userWithData.auraColor = auraColor;
                Logger.debug('✅ AUTH: Set currentUser.auraColor from complete user data:', auraColor, 'auth');
                } else {
                  Logger.debug('ℹ️ AUTH: No auraColor in complete user data (user may not have set one yet)', null, 'auth');
                userWithData.auraColor = undefined;
                }

                // Also update avatarUrl if it differs from Google OAuth avatar
                const dbAvatarUrl = completeUserData.avatarUrl;
              if (dbAvatarUrl && dbAvatarUrl !== userWithData.avatarUrl) {
                userWithData.avatarUrl = dbAvatarUrl;
                Logger.debug('✅ AUTH: Updated currentUser.avatarUrl from database:', dbAvatarUrl, 'auth');
                }

              // ROOT CAUSE FIX: Update stateManager with complete user data
              stateManagerInstance.setState('currentUser', userWithData);

                // CRITICAL FIX: Also update AuthManager with complete user data
                const authManager = (window as Window & { authManager?: AuthManager }).authManager;
                if (authManager && typeof authManager.updateUserProfile === 'function') {
                  authManager.updateUserProfile({
                  auraColor: userWithData.auraColor ?? null,
                  avatarUrl: userWithData.avatarUrl,
                    // auraColor already set above (camelCase only - RED-LINE compliance)
                  });
                  Logger.debug('✅ AUTH: Updated AuthManager with complete user data', null, 'auth');
                }
              }
            } catch (error: unknown) {
              handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'Auth'
            }
        });;
            const currentUserForError = stateManagerInstance.getState('currentUser') as UserType | null;
            if (currentUserForError) {
              stateManagerInstance.setState('currentUser', { ...currentUserForError, auraColor: undefined });
            }
          
    }
        }
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'Auth'
            }
        });;
        // Leave as null - will be set when backend returns UUID in reaction/user API response
      
    }
      const currentUserForCommunity = stateManagerInstance.getState('currentUser') as UserType | null;
      if (currentUserForCommunity) {
        // Get primary community from state or fallback to Public Square
        const { PUBLIC_SQUARE_UUID } = await import('../core/ConfigModule.js');
        const primaryCommunity = stateManagerInstance.getState('primaryCommunity') as string | null;
        stateManagerInstance.setState('currentUser', { ...currentUserForCommunity, communityId: primaryCommunity || PUBLIC_SQUARE_UUID });
      }
    }
    
    Logger.debug('✅ SUPABASE AUTH: User context set globally', null, 'auth');
    Logger.debug('✅ SUPABASE AUTH: Authentication process completed', null, 'auth');
    
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'Auth'
            }
        });;
  
    }
}

// --- Authentication Check Functions ---
async function requireAuth(action: string, callback?: () => void): Promise<boolean> {
  try {
    // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no window.currentUser)
    const currentUser = stateManagerInstance.getState('currentUser') as UserType | null;
    
    Logger.debug('[AUTH] requireAuth called for:', { action, currentUser: currentUser ? 'exists' : 'null' }, 'auth');
    
    if (!currentUser) {
      Logger.debug('No user found, showing auth prompt', 'auth');
      showAuthPrompt(action);
      return false;
    }
    Logger.debug('User found, executing callback', 'auth');
    if (callback) callback();
    return true;
  } catch (error: unknown) {
    Logger.debug('Error checking auth, showing auth prompt', 'auth');
    showAuthPrompt(action);
    return false;
  }
}

function showAuthPrompt(action: string): void {
  Logger.debug('showAuthPrompt called for:', action, 'auth');
  const authPrompt = document.getElementById('auth-prompt-modal');
  if (!authPrompt) {
    Logger.debug('Creating auth prompt modal', null, 'auth');
    createAuthPromptModal();
  }
  
  const actionText = document.getElementById('auth-prompt-action');
  if (actionText) {
    actionText.textContent = action;
  }
  
  // Show which auth provider is available
  const authManager = (window as Window & { authManager?: AuthManager }).authManager;
  const providerName = (typeof authManager?.currentProvider === 'object' && authManager.currentProvider?.name) || (typeof authManager?.currentProvider === 'string' ? authManager.currentProvider : 'unknown');
  const providerInfo = document.getElementById('auth-prompt-provider');
  if (providerInfo) {
    providerInfo.textContent = `Using ${providerName} authentication`;
  }
  
  const modal = document.getElementById('auth-prompt-modal');
  if (modal) {
    (modal as HTMLElement).style.display = 'block';
    Logger.debug('Auth prompt modal displayed', null, 'auth');
  } else {
    Logger.error('Auth prompt modal not found!', null, 'auth');
  }
  Logger.debug(`Auth required for: ${action} (provider: ${providerName})`, null, 'auth');
}

function createAuthPromptModal(): void {
  const modal = document.createElement('div');
  modal.id = 'auth-prompt-modal';
  modal.className = 'modal';
  (modal as HTMLElement).style.display = 'none';
  
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
      (modal as HTMLElement).style.display = 'none';
    });
  }
  
  const cancelBtn = document.getElementById('auth-prompt-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      (modal as HTMLElement).style.display = 'none';
    });
  }
  
  const googleBtn = document.getElementById('auth-prompt-google');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      (modal as HTMLElement).style.display = 'none';
      // ES6 pattern: Dispatch DOM event instead of calling window function
      (window as Window).dispatchEvent(new CustomEvent('signInWithGoogle', {
        detail: { source: 'AuthModule' }
      }));
      // Optional: Try direct call if available (graceful degradation)
      const win = window as Window & { signInWithGoogle?: () => void };
      if (typeof win.signInWithGoogle === 'function') {
        win.signInWithGoogle();
      }
    });
  }
  
  const magicBtn = document.getElementById('auth-prompt-magic');
  if (magicBtn) {
    magicBtn.addEventListener('click', () => {
      (modal as HTMLElement).style.display = 'none';
      const magicLinkModal = document.getElementById('magic-link-modal');
      if (magicLinkModal) {
        (magicLinkModal as HTMLElement).style.display = 'block';
      }
    });
  }
  
  // Close modal if clicked outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      (modal as HTMLElement).style.display = 'none';
    }
  });
}

function initializeRealGoogleAuth(): void {
  try {
    Logger.debug('🚀 REAL_GOOGLE_AUTH: Initializing for actual Google profile pictures...', null, 'auth');
    
    // Initialize real Google auth
    // TODO: Export RealGoogleAuth from a module instead of window
    // ACCEPTABLE: RealGoogleAuth may be loaded from external script
    const win2 = window as Window & { RealGoogleAuth?: new () => { initialize: () => Promise<boolean> } };
    const RealGoogleAuth = win2.RealGoogleAuth;
    if (typeof RealGoogleAuth !== 'undefined' && typeof RealGoogleAuth === 'function') {
      const realGoogleAuth = new (RealGoogleAuth as new () => { initialize: () => Promise<boolean> })();
      realGoogleAuth.initialize().then((success: boolean) => {
        if (success) {
          Logger.debug('✅ REAL_GOOGLE_AUTH: Real Google Auth initialized successfully', null, 'auth');
          Logger.debug('✅ REAL_GOOGLE_AUTH: Will now use actual Google profile pictures', null, 'auth');
        } else {
          Logger.error('❌ REAL_GOOGLE_AUTH: Failed to initialize', null, 'auth');
        }
      });
    } else {
      Logger.warn('⚠️ REAL_GOOGLE_AUTH: RealGoogleAuth not available - check if script is loaded', null, 'auth');
    }
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'Auth'
            }
        });;
  
    }
}

// CRITICAL FIX: Test real-time with authenticated user
async function testRealtimeAfterAuth(pageId: string): Promise<boolean> {
  Logger.debug('🧪 REALTIME TEST: Testing real-time with authenticated user...', null, 'auth');
  
  const supabase = (window as Window & { supabase?: SupabaseClient }).supabase;
  if (!supabase) {
    Logger.error('❌ REALTIME TEST: Supabase client not available', null, 'auth');
    return false;
  }
  
  try {
    const testRealtimeWithAuth = (window as Window & { testRealtimeWithAuth?: (supabase?: SupabaseClient, pageId?: string) => Promise<{ success: boolean; eventReceived?: number; status?: string }> }).testRealtimeWithAuth;
    if (!testRealtimeWithAuth) {
      Logger.error('❌ REALTIME TEST: testRealtimeWithAuth not available', null, 'auth');
      return false;
    }
    
    const result = await testRealtimeWithAuth(supabase, pageId);
    
    if (result.success) {
      Logger.debug('🎉 REALTIME TEST: Real-time is working with authenticated user!', null, 'auth');
      if ('eventReceived' in result) {
        Logger.debug('🎉 REALTIME TEST: Events received:', result.eventReceived, 'auth');
      }
      return true;
    } else {
      Logger.error('❌ REALTIME TEST: Real-time still not working', null, 'auth');
      if ('status' in result) {
        Logger.error('❌ REALTIME TEST: Status:', result.status, 'auth');
      }
      return false;
    }
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'Auth'
            }
        });;
    return false;
  
    }
}

async function signInWithGoogle(): Promise<void> {
  try {
    Logger.debug('Attempting Google sign-in for REAL profile pictures...', null, 'auth');
    
    const realGoogleAuth = (window as Window & { realGoogleAuth?: { getCurrentUser: () => Promise<User | null>; signInWithGoogle?: () => Promise<{ user?: UserType }> } }).realGoogleAuth;
    const authManager = (window as Window & { authManager?: AuthManager }).authManager;
    
    // Use real Google auth for actual profile pictures
    if (realGoogleAuth && realGoogleAuth.signInWithGoogle) {
      const result = await realGoogleAuth.signInWithGoogle();
      Logger.debug('Real Google sign-in successful:', result, 'auth');
      
      // Update UI with the authenticated user
      if (result && result.user) {
        // ROOT CAUSE FIX: Map user_metadata.avatar_url to avatarUrl (camelCase conversion)
        const userWithMetadata = result.user as UserType & { user_metadata?: { avatar_url?: string } };
        const avatarUrl = userWithMetadata.user_metadata?.avatar_url;
        
        if (avatarUrl && !result.user.avatarUrl) {
          result.user.avatarUrl = avatarUrl;
          Logger.debug('[AUTH] Mapped user_metadata.avatar_url to avatarUrl in signInWithGoogle:', avatarUrl, 'auth');
        }
        
        // CRITICAL FIX: Authenticate with Supabase after Google auth
        await authenticateWithSupabase(result.user);
        // ES6 pattern: Dispatch DOM event instead of calling window function
        (window as Window).dispatchEvent(new CustomEvent('updateUI', {
          detail: { user: result.user, source: 'AuthModule' }
        }));
        // Optional: Try direct call if available (graceful degradation)
        const win3 = window as Window & { updateUI?: (user: UserType) => Promise<void> | void };
        if (typeof win3.updateUI === 'function') {
          await win3.updateUI(result.user);
        }
        Logger.debug(`User authenticated with REAL profile picture: ${result.user.email}`, null, 'auth');
        Logger.debug('🔍 REAL_GOOGLE_AUTH: Real avatar URL:', avatarUrl || result.user.avatarUrl, 'auth');
      }
    } else if (authManager && authManager.signIn) {
      // Fallback to AuthManager
      const result = await authManager.signIn('google');
      Logger.debug('Google sign-in successful (fallback):', result, 'auth');
      
      // Update UI with the authenticated user
      if (result && result.user) {
        // CRITICAL FIX: Authenticate with Supabase after Google auth
        await authenticateWithSupabase(result.user);
        // ES6 pattern: Dispatch DOM event instead of calling window function
        (window as Window).dispatchEvent(new CustomEvent('updateUI', {
          detail: { user: result.user, source: 'AuthModule' }
        }));
        // Optional: Try direct call if available (graceful degradation)
        const win4 = window as Window & { updateUI?: (user: UserType) => Promise<void> | void };
        if (typeof win4.updateUI === 'function') {
          await win4.updateUI(result.user);
        }
        Logger.debug(`User authenticated (fallback): ${result.user.email}`, null, 'auth');
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'Auth'
            }
        });;
    Logger.debug(`Google sign-in error: ${errorMessage}`, null, 'auth');
    
    // Show error to user
    const statusElement = document.getElementById('magic-link-status');
    if (statusElement) {
      statusElement.textContent = `Sign-in failed: ${errorMessage}`;
      (statusElement as HTMLElement).style.color = 'red';
    }
  
    }
}

async function sendMagicLink(): Promise<void> {
  try {
    const emailInput = document.getElementById('magic-link-email') as HTMLInputElement;
    if (!emailInput) {
      Logger.error('Magic link email input not found', null, 'auth');
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
    Logger.debug(`Attempting magic link sign-in for: ${email}`, null, 'auth');
    
    const authManager = (window as Window & { authManager?: AuthManager }).authManager;
    if (!authManager || !authManager.signIn) {
      throw new Error('AuthManager not available');
    }
    
    const result = await authManager.signIn('magic_link', email);
    
    if (result && result.user) {
      if (statusElement) {
        statusElement.textContent = 'Magic link sent! Check your email.';
      }
      const updateUI = (window as Window & { updateUI?: (user?: UserType) => Promise<void> | void }).updateUI;
      if (updateUI && result.user) {
        await updateUI(result.user);
      }
      if (result.user) {
        Logger.debug(`Magic link successful: ${result.user.email}`, null, 'auth');
      }
    } else {
      if (statusElement) {
        statusElement.textContent = 'Magic link sent! Check your email.';
      }
    }
    const magicLinkModal = document.getElementById('magic-link-modal');
    if (magicLinkModal) {
      (magicLinkModal as HTMLElement).style.display = 'none';
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'Auth'
            }
        });;
    const statusElement = document.getElementById('magic-link-status');
    if (statusElement) {
      statusElement.textContent = `Error: ${errorMessage}`;
    }
    Logger.debug(`Magic link error: ${errorMessage}`, null, 'auth');
  
    }
}

async function signOut(): Promise<void> {
  try {
    Logger.debug('Attempting sign-out...', null, 'auth');
    const authManager = (window as Window & { authManager?: AuthManager }).authManager;
    if (authManager && authManager.signOut) {
      await authManager.signOut();
      Logger.debug('Sign-out successful', null, 'auth');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'Auth'
            }
        });;
    Logger.debug(`Sign-out error: ${errorMessage}`, null, 'auth');
  
    }
}

// CRITICAL FIX: Complete OTP verification for real-time
async function completeOTPForRealtime(otpCode: string): Promise<boolean> {
  Logger.debug('🔐 OTP VERIFICATION: Completing OTP verification for real-time...', null, 'auth');
  
  const supabase = (window as Window & { supabase?: SupabaseClient }).supabase;
  if (!supabase) {
    Logger.error('❌ OTP VERIFICATION: Supabase client not available', null, 'auth');
    return false;
  }
  
  try {
    // TODO: Export completeOTPVerification from a module instead of window
    // ACCEPTABLE: Optional check for backward compatibility
    const win5 = window as Window & { completeOTPVerification?: (supabase: SupabaseClient, otpCode: string) => Promise<unknown> };
    const completeOTPVerification = win5.completeOTPVerification;
    if (!completeOTPVerification) {
      Logger.error('❌ OTP VERIFICATION: completeOTPVerification not available', null, 'auth');
      return false;
    }
    
    const result = await completeOTPVerification(supabase, otpCode) as { success?: boolean; user?: User; session?: { expires_at?: number; [key: string]: unknown } } | unknown;
    
    if (result && typeof result === 'object' && 'success' in result && result.success && 'user' in result && result.user) {
      const typedResult = result as { success: boolean; user: User; session?: { expires_at?: number; [key: string]: unknown } };
      Logger.debug('✅ OTP VERIFICATION: OTP verified successfully', null, 'auth');
      Logger.debug('✅ OTP VERIFICATION: User authenticated:', typedResult.user.email, 'auth');
      if (typedResult.session && typeof typedResult.session === 'object' && 'expires_at' in typedResult.session && typeof typedResult.session.expires_at === 'number') {
        Logger.debug('✅ OTP VERIFICATION: Session expires at:', new Date(typedResult.session.expires_at * 1000), 'auth');
      }
      
      // Now test real-time with authenticated user
      const testResult = await testRealtimeAfterAuth('00000000-0000-0000-0000-000000000001');
      if (testResult) {
        Logger.debug('🎉 OTP VERIFICATION: Real-time is now working!', null, 'auth');
      }
      
      return true;
    } else {
      const errorMessage = (result && typeof result === 'object' && 'error' in result) ? (result as { error?: unknown }).error : 'Unknown error';
      Logger.error('❌ OTP VERIFICATION: OTP verification failed:', errorMessage, 'auth');
      return false;
    }
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'Auth'
            }
        });;
    return false;
  
    }
}

// Get current user ID for presence tracking
async function getCurrentUserId(): Promise<string | null> {
  try {
    // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no window.currentUser)
    const user = stateManagerInstance.getState('currentUser') as UserType | null;
    if (user && user.id) {
      return user.id; // Use the actual user ID
    } else {
      // Fallback to email if no ID is stored
      const email = await getCurrentUserEmail();
      return email;
    }
  } catch (error: unknown) {
    // user is not in scope here, get it again if needed
    const userInCatch = stateManagerInstance.getState('currentUser') as UserType | null;
    handleError(error, {
      log: true,
      logLevel: 'error',
      context: {
        operation: 'getCurrentUserId',
        component: 'Auth',
        userId: userInCatch?.id
      }
    });
    // Fallback to email
    const email = await getCurrentUserEmail();
    return email;
  
    }
}

// Get current user email for presence tracking
// CRITICAL FIX: Guard to prevent multiple simultaneous calls
let isGettingCurrentUserEmail: boolean = false;
let currentUserEmailPromise: Promise<string | null> | null = null;

async function getCurrentUserEmail(): Promise<string | null> {
  // ROOT CAUSE FIX: Check stateManager first (TypeScript migration - no window.currentUser)
  const currentUserFromState = stateManagerInstance.getState('currentUser') as UserType | null;
  if (currentUserFromState?.email) {
    Logger.debug('[AUTH] Using existing stateManager.currentUser:', currentUserFromState?.email, 'auth');
    return currentUserFromState?.email || null;
  }

  // CRITICAL FIX: Guard against multiple simultaneous calls
  if (isGettingCurrentUserEmail && currentUserEmailPromise) {
    Logger.debug('[AUTH] getCurrentUserEmail() already in progress, returning existing promise', null, 'auth');
    return currentUserEmailPromise;
  }

  isGettingCurrentUserEmail = true;
  currentUserEmailPromise = (async (): Promise<string | null> => {
    try {
      // FIRST: Try real Google auth for actual profile pictures
      // COMP METHOD: Check if realGoogleAuth is available and initialized
      const realGoogleAuth = (window as Window & { realGoogleAuth?: { getCurrentUser: () => Promise<User | null>; signInWithGoogle?: () => Promise<unknown> } }).realGoogleAuth;
      if (realGoogleAuth && typeof realGoogleAuth.getCurrentUser === 'function') {
        Logger.debug('[AUTH] Calling realGoogleAuth.getCurrentUser()...', null, 'auth');
        const user = await realGoogleAuth.getCurrentUser();
        Logger.debug('[AUTH] Real Google Auth returned user:', user, 'auth');
        
        if (user && user.email) {
          Logger.debug('[AUTH] Found authenticated user with REAL profile picture:', user.email, 'auth');
          
          // ROOT CAUSE FIX: Map user_metadata.avatar_url to avatarUrl (camelCase conversion)
          const userWithMetadata = user as UserType & { user_metadata?: { avatar_url?: string } };
          const avatarUrl = userWithMetadata.user_metadata?.avatar_url;
          
          if (avatarUrl && !(user as UserType).avatarUrl) {
            (user as UserType).avatarUrl = avatarUrl;
            Logger.debug('[AUTH] Mapped user_metadata.avatar_url to avatarUrl:', avatarUrl, 'auth');
          }
          
          Logger.debug('[AUTH] Real avatar URL:', avatarUrl || (user as UserType).avatarUrl, 'auth');
          
          // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
          stateManagerInstance.setState('currentUser', user as UserType);
          Logger.debug('[AUTH] Set stateManager.currentUser from getCurrentUserEmail():', user.email, 'auth');
          
          return user.email;
        } else {
          Logger.debug('[AUTH] Real Google Auth returned null or no email', null, 'auth');
        }
      } else {
        Logger.debug('[AUTH] realGoogleAuth not available or not initialized', null, 'auth');
      }
    
      // SECOND: Fallback to AuthManager
      const authManager = (window as Window & { authManager?: AuthManager }).authManager;
      if (authManager && authManager.getCurrentUser) {
        const user = await authManager.getCurrentUser();
        Logger.debug('[AUTH] AuthManager returned user:', user, 'auth');
        
        if (user && user.email) {
          Logger.debug('[AUTH] Found authenticated user (fallback):', user.email, 'auth');
          
          // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
          stateManagerInstance.setState('currentUser', user as UserType);
          Logger.debug('[AUTH] Set stateManager.currentUser from AuthManager:', user.email, 'auth');
          
          return user.email;
        }
      }
      
      Logger.error('[AUTH] No authenticated user found via any method', null, 'auth');
      
      // COMP METHOD: Only show auth prompt after initialization is complete
      if (!isInitializing) {
        Logger.debug('[AUTH] No user found, showing authentication prompt...', 'auth');
        showAuthPrompt('access presence features');
      } else {
        Logger.debug('[AUTH] No user found, but not showing auth prompt during initialization', 'auth');
      }
      
      // Return null instead of throwing error to allow graceful handling
      return null;
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'Auth'
            }
        });;
      return null;
    
    } finally {
      // CRITICAL FIX: Reset guard after completion
      isGettingCurrentUserEmail = false;
      currentUserEmailPromise = null;
    }
  })();

  return currentUserEmailPromise;
}

// Avatar helper shims routed through ProfileManager singletons
const getCurrentUserAvatarColor = profileGetCurrentUserAvatarColor;
const getCurrentUserAvatarBgColor = (): string => profileGetCurrentUserAvatarBgColor();
const getUserAvatarBgColor = (): string => profileGetCurrentUserAvatarBgColor();
const resetCustomAvatarColor = (): void => {
  profileResetCustomAvatarColor();
};

// COMP METHOD: Mark initialization as complete
function markInitializationComplete(): void {
  isInitializing = false;
  Logger.debug('[AUTH] Initialization complete - auth prompts will now be shown when needed', null, 'auth');
}

// ES6 exports only - no window assignments (backward compatibility removed)

export {
  AuthModule,
  authenticateWithSupabase,
  requireAuth,
  showAuthPrompt,
  createAuthPromptModal,
  initializeRealGoogleAuth,
  markInitializationComplete,
  signOut,
  signInWithGoogle,
  sendMagicLink,
  getCurrentUserId,
  getCurrentUserEmail,
  getCurrentUserAvatarColor,
  getUserAvatarBgColor,
  getCurrentUserAvatarBgColor,
  resetCustomAvatarColor,
  testRealtimeAfterAuth,
  completeOTPForRealtime
};


