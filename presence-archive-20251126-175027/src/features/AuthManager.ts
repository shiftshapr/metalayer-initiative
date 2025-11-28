/**
 * AUTH MANAGER - Authentication Management Module
 * TypeScript + ES6 Module
 */

import type { User } from '../types/index.js';
import { stateManagerInstance } from '../core/StateManager.js';

import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';

interface AuthStateChangeDetail {
  isAuthenticated: boolean;
  user?: User | null;
  [key: string]: unknown;
}

type AuthCallback = (detail: AuthStateChangeDetail) => void;

class AuthManager {
  private currentUser: User | null = null;
  private authState: string = 'unknown';
  private authCallbacks: AuthCallback[] = [];

  constructor() {
    Logger.debug('AuthManager initialized', null, 'auth');
    this.initializeAuthHandlers();
  }

  async initialize(): Promise<boolean> {
    Logger.debug('🔧 AuthManager initialize called', null, 'auth');
    // ROOT CAUSE FIX: Preserve existing currentUser from stateManager instead of clearing it
    const existingUser = stateManagerInstance.getState('currentUser') as User | null;
    if (existingUser && !this.currentUser) {
      Logger.debug('✅ AuthManager: Preserving existing user from stateManager', { email: existingUser.email }, 'auth');
      this.currentUser = existingUser;
      this.authState = 'authenticated';
    }
    return Promise.resolve(true);
  }

  async signIn(provider: string, email: string | null = null): Promise<unknown> {
    try {
      Logger.debug('🔧 AuthManager signIn called with provider', { provider }, 'auth');
      if (provider === 'google') {
        if (typeof window !== 'undefined' && (window as Window & { realGoogleAuth?: { signInWithGoogle: () => Promise<unknown> } }).realGoogleAuth) {
          const realGoogleAuth = (window as Window & { realGoogleAuth?: { signInWithGoogle: () => Promise<unknown> } }).realGoogleAuth;
          return await realGoogleAuth?.signInWithGoogle();
        }
      } else if (provider === 'magic_link' && email) {
        if (typeof window !== 'undefined' && (window as Window & { realGoogleAuth?: { signInWithMagicLink: (email: string) => Promise<unknown> } }).realGoogleAuth) {
          const realGoogleAuth = (window as Window & { realGoogleAuth?: { signInWithMagicLink: (email: string) => Promise<unknown> } }).realGoogleAuth;
          return await realGoogleAuth?.signInWithMagicLink(email);
        }
      }
      return null;
    } catch (error: unknown) {
      handleError(error, {
        log: true,
        logLevel: 'error',
        context: {
          operation: 'signIn',
          component: 'AuthManager',
          provider,
          email
        }
      });
      return null;
    }
  }

  initializeAuthHandlers(): void {
    if (typeof document === 'undefined') return;
    
    document.addEventListener('authGoogleSignIn', () => {
      this.handleGoogleSignInInternal();
    });
    
    document.addEventListener('authMagicLinkSignIn', ((e: CustomEvent) => {
      this.handleMagicLinkSignInInternal(e.detail?.email);
    }) as EventListener);
  }

  private async handleGoogleSignInInternal(): Promise<void> {
    // Implementation for internal Google sign-in handling
  }

  private async handleMagicLinkSignInInternal(_email?: string): Promise<void> {
    // Implementation for internal magic link sign-in handling
  }

  async handleGoogleSignIn(): Promise<unknown> {
    return this.signIn('google');
  }

  async handleMagicLinkSignIn(email: string): Promise<unknown> {
    return this.signIn('magic_link', email);
  }

  signOut(): void {
    this.currentUser = null;
    this.authState = 'signed_out';
    // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
    stateManagerInstance.setState('currentUser', null);
    this.handleAuthStateChange({ isAuthenticated: false, user: null });
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    this.authState = user ? 'authenticated' : 'signed_out';
    // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
    stateManagerInstance.setState('currentUser', user);
    this.handleAuthStateChange({ isAuthenticated: !!user, user });
  }

  requireAuth(action: string, callback: () => void): void {
    if (this.isAuthenticated()) {
      callback();
    } else {
      this.showAuthPrompt(action);
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<void> {
    Logger.debug('Updating user profile', { updates }, 'auth');
    if (this.currentUser) {
      const updatedUser = { ...this.currentUser, ...updates };
      this.setCurrentUser(updatedUser);
      if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('userProfileUpdated', {
          detail: { user: updatedUser }
        }));
      }
    }
  }

  getAuthStatus(): { isAuthenticated: boolean; authState: string; user: User | null } {
    return {
      isAuthenticated: this.isAuthenticated(),
      authState: this.authState,
      user: this.currentUser
    };
  }

  handleAuthStateChange(detail: AuthStateChangeDetail): void {
    this.authCallbacks.forEach(callback => {
      try {
        callback(detail);
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
    });
  }

  onAuthStateChange(callback: AuthCallback): () => void {
    this.authCallbacks.push(callback);
    return () => {
      const index = this.authCallbacks.indexOf(callback);
      if (index > -1) {
        this.authCallbacks.splice(index, 1);
      }
    };
  }

  showAuthPrompt(action: string): void {
    // Implementation for showing auth prompt
    Logger.debug('Show auth prompt for action:', action, 'auth');
  }

  createAuthPromptModal(): void {
    // Implementation for creating auth prompt modal
  }

  setupAuthPromptListeners(): void {
    // Implementation for setting up auth prompt listeners
  }

  hideAuthPrompt(): void {
    // Implementation for hiding auth prompt
  }

  updateAuthUI(): void {
    // Implementation for updating auth UI
  }
}

// Create singleton instance
const authManagerInstance = new AuthManager();

// Export as ES6 module
export { AuthManager, authManagerInstance };
export default authManagerInstance;

// Export convenience functions that use the singleton
export const getAuthManagerInstance = () => authManagerInstance;
export const initialize = () => authManagerInstance.initialize();
export const signIn = (provider: string, email: string | null = null) => authManagerInstance.signIn(provider, email);
export const isAuthenticated = () => authManagerInstance.isAuthenticated();
export const getCurrentUser = () => authManagerInstance.getCurrentUser();
export const requireAuth = (action: string, callback: () => void) => authManagerInstance.requireAuth(action, callback);
export const handleGoogleSignIn = () => authManagerInstance.handleGoogleSignIn();
export const handleMagicLinkSignIn = (email: string) => authManagerInstance.handleMagicLinkSignIn(email);
export const updateUserProfile = (updates: Partial<User>) => authManagerInstance.updateUserProfile(updates);
export const signOut = () => authManagerInstance.signOut();
export const getAuthStatus = () => authManagerInstance.getAuthStatus();
export const initializeAuthHandlers = () => authManagerInstance.initializeAuthHandlers();
export const handleAuthStateChange = (detail: AuthStateChangeDetail) => authManagerInstance.handleAuthStateChange(detail);
export const handleUserUpdate = (updatedUser: User | null) => authManagerInstance.setCurrentUser(updatedUser);
export const showAuthPrompt = (action: string) => authManagerInstance.showAuthPrompt(action);
export const createAuthPromptModal = () => authManagerInstance.createAuthPromptModal();
export const setupAuthPromptListeners = () => authManagerInstance.setupAuthPromptListeners();
export const hideAuthPrompt = () => authManagerInstance.hideAuthPrompt();
export const updateAuthUI = () => authManagerInstance.updateAuthUI();
export const onAuthStateChange = (callback: AuthCallback) => authManagerInstance.onAuthStateChange(callback);
