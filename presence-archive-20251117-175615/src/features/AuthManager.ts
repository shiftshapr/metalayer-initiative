/**
 * AUTH MANAGER - Authentication Management Module
 * TypeScript + ES6 Module
 */

import { User } from '../types/index.js';

// Declare window globals (for reading only, not exporting)
declare const window: Window & {
  currentUser?: User | null;
  realGoogleAuth?: {
    signInWithGoogle: () => Promise<User | null>;
    signInWithMagicLink: (email: string) => Promise<User | null>;
  };
  // Window exports will be added in compiled JS, not in TypeScript source
  AuthManager?: any;
  initializeAuth?: () => Promise<boolean>;
  signInAuth?: (provider: AuthProvider, email?: string | null) => Promise<User | null>;
  [key: string]: any; // Allow other window properties during migration
};

type AuthState = 'unknown' | 'SIGNED_IN' | 'SIGNED_OUT';
type AuthProvider = 'google' | 'magic_link';
type AuthCallback = (user: User | null) => void | Promise<void>;

class AuthManager {
    private currentUser: User | null = null;
    private authState: AuthState = 'unknown';
    private authCallbacks: AuthCallback[] = [];

    constructor() {
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
    async signIn(provider: AuthProvider, email: string | null = null): Promise<User | null> {
        console.log('🔧 AuthManager signIn called with provider:', provider);
        if (provider === 'google') {
            // Use real Google auth
            if (window.realGoogleAuth) {
                return await window.realGoogleAuth.signInWithGoogle();
            }
        }
        else if (provider === 'magic_link' && email) {
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
        // Listen for authentication events
        document.addEventListener('authGoogleSignIn', () => {
            this.handleGoogleSignInInternal();
        });
        document.addEventListener('authMagicLinkSignIn', (e: Event) => {
            const customEvent = e as CustomEvent<{ email?: string }>;
            this.handleMagicLinkSignInInternal(customEvent.detail?.email);
        });
        // Listen for auth state changes
        document.addEventListener('authStateChanged', (e: Event) => {
            const customEvent = e as CustomEvent<{ user?: User; authState?: AuthState }>;
            this.handleAuthStateChange(customEvent.detail || {});
        });
    }
    /**
     * Handle Google sign-in (internal)
     */
    async handleGoogleSignInInternal() {
        console.log('Initiating Google sign-in');
        const user = await this.signIn('google');
        if (user) {
            this.setCurrentUser(user);
        }
    }
    /**
     * Handle Magic Link sign-in (internal)
     */
    async handleMagicLinkSignInInternal(email: string | undefined): Promise<void> {
        console.log('Initiating Magic Link sign-in');
        if (email) {
            const user = await this.signIn('magic_link', email);
            if (user) {
                this.setCurrentUser(user);
            }
        }
    }
    /**
     * Handle authentication state change
     */
    handleAuthStateChange(detail: { user?: User; authState?: AuthState }): void {
        if (detail.user) {
            this.setCurrentUser(detail.user);
        }
        else if (detail.authState === 'SIGNED_OUT') {
            this.signOut();
        }
    }
    /**
     * Set current user and update state
     */
    setCurrentUser(user: User | null): void {
        this.currentUser = user;
        this.authState = user ? 'SIGNED_IN' : 'SIGNED_OUT';
        // Update window.currentUser for backward compatibility
        if (typeof window !== 'undefined') {
            window.currentUser = user;
        }
        // Notify callbacks
        this.authCallbacks.forEach(callback => {
            try {
                callback(user);
            }
            catch (error) {
                console.error('Auth callback error:', error);
            }
        });
        // Update UI
        this.updateAuthUI();
    }
    /**
     * Sign out current user
     */
    signOut() {
        this.currentUser = null;
        this.authState = 'SIGNED_OUT';
        // Update window.currentUser for backward compatibility
        if (typeof window !== 'undefined') {
            window.currentUser = null;
        }
        // Notify callbacks
        this.authCallbacks.forEach(callback => {
            try {
                callback(null);
            }
            catch (error) {
                console.error('Auth callback error:', error);
            }
        });
        // Update UI
        this.updateAuthUI();
    }
    /**
     * Require authentication for an action
     */
    async requireAuth(action: string, callback?: () => void | Promise<void>): Promise<boolean> {
        console.log(`Requiring authentication for: ${action}`);
        try {
            // Check if user is authenticated
            if (this.isAuthenticated()) {
                console.log('User is authenticated, proceeding');
                if (callback) {
                    await callback();
                }
                return true;
            }
            else {
                console.log('User not authenticated, showing prompt');
                this.showAuthPrompt(action);
                return false;
            }
        }
        catch (error) {
            console.error('Authentication check failed', error, 'auth');
            return false;
        }
    }
    /**
     * Check if user is currently authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null && this.authState === 'SIGNED_IN';
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
        if (!modal)
            return;
        // Google sign-in
        const googleBtn = document.getElementById('auth-prompt-google');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                console.log('Google sign-in requested');
                this.handleGoogleSignInFromPrompt();
            });
        }
        // Magic link sign-in
        const magicBtn = document.getElementById('auth-prompt-magic');
        if (magicBtn) {
            magicBtn.addEventListener('click', () => {
                console.log('Magic link sign-in requested');
                this.handleMagicLinkSignInFromPrompt();
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
     * Handle Google sign-in from prompt
     */
    handleGoogleSignInFromPrompt() {
        console.log('Initiating Google sign-in from prompt');
        // Dispatch event for main app to handle
        document.dispatchEvent(new CustomEvent('authGoogleSignIn', {
            detail: { source: 'auth-prompt' }
        }));
        this.hideAuthPrompt();
    }
    /**
     * Handle Magic Link sign-in from prompt
     */
    handleMagicLinkSignInFromPrompt() {
        console.log('Initiating Magic Link sign-in from prompt');
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
     * Register callback for auth state changes
     */
    onAuthStateChange(callback: AuthCallback): () => void {
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
     * Handle user update
     * COMP METHOD: Matches original implementation
     */
    handleUserUpdate(updatedUser) {
        console.log('Handling user update', { userId: updatedUser.id }, 'auth');
        if (this.currentUser && this.currentUser.id === updatedUser.id) {
            this.setCurrentUser(updatedUser);
        }
    }
    /**
     * Handle Google sign-in (public wrapper)
     * COMP METHOD: Matches original implementation
     */
    async handleGoogleSignIn() {
        await this.handleGoogleSignInInternal();
    }
    /**
     * Handle Magic Link sign-in (public wrapper)
     * COMP METHOD: Matches original implementation
     */
    async handleMagicLinkSignIn(email: string): Promise<void> {
        await this.handleMagicLinkSignInInternal(email);
    }
    /**
     * Update user profile
     * COMP METHOD: Matches original implementation
     */
    async updateUserProfile(updates: Partial<User>): Promise<void> {
        console.log('Updating user profile', { updates }, 'auth');
        if (this.currentUser) {
            const updatedUser = { ...this.currentUser, ...updates };
            this.setCurrentUser(updatedUser);
            // Dispatch event for profile update
            document.dispatchEvent(new CustomEvent('userProfileUpdated', {
                detail: { user: updatedUser }
            }));
        }
    }
    /**
     * Get authentication status
     * COMP METHOD: Matches original implementation
     */
    getAuthStatus(): { isAuthenticated: boolean; authState: AuthState; user: User | null } {
        return {
            isAuthenticated: this.isAuthenticated(),
            authState: this.authState,
            user: this.currentUser
        };
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
export const signIn = (provider: AuthProvider, email: string | null = null) => 
    authManagerInstance.signIn(provider, email);
export const isAuthenticated = () => authManagerInstance.isAuthenticated();
export const getCurrentUser = () => authManagerInstance.getCurrentUser();
export const requireAuth = (action: string, callback?: () => void | Promise<void>) => 
    authManagerInstance.requireAuth(action, callback);
export const handleGoogleSignIn = () => authManagerInstance.handleGoogleSignIn();
export const handleMagicLinkSignIn = (email: string) => authManagerInstance.handleMagicLinkSignIn(email);
export const updateUserProfile = (updates: Partial<User>) => authManagerInstance.updateUserProfile(updates);
export const signOut = () => authManagerInstance.signOut();
export const getAuthStatus = () => authManagerInstance.getAuthStatus();
export const initializeAuthHandlers = () => authManagerInstance.initializeAuthHandlers();
export const handleAuthStateChange = (detail: { user?: User; authState?: AuthState }) => 
    authManagerInstance.handleAuthStateChange(detail);
export const handleUserUpdate = (updatedUser: User) => authManagerInstance.setCurrentUser(updatedUser);
export const showAuthPrompt = (action: string) => authManagerInstance.showAuthPrompt(action);
export const createAuthPromptModal = () => authManagerInstance.createAuthPromptModal();
export const setupAuthPromptListeners = () => authManagerInstance.setupAuthPromptListeners();
export const hideAuthPrompt = () => authManagerInstance.hideAuthPrompt();
export const updateAuthUI = () => authManagerInstance.updateAuthUI();
export const onAuthStateChange = (callback: AuthCallback) => authManagerInstance.onAuthStateChange(callback);
//# sourceMappingURL=AuthManager.js.map