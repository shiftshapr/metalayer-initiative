/**
 * AUTH MANAGER - Authentication Management Module
 * TypeScript + ES6 Module
 */
import { stateManagerInstance } from '../core/StateManager.js';
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authState = 'unknown';
        this.authCallbacks = [];
        console.log('AuthManager initialized', null, 'auth');
        this.initializeAuthHandlers();
    }
    async initialize() {
        console.log('🔧 AuthManager initialize called');
        // ROOT CAUSE FIX: Preserve existing currentUser from stateManager instead of clearing it
        const existingUser = stateManagerInstance.getState('currentUser');
        if (existingUser && !this.currentUser) {
            console.log('✅ AuthManager: Preserving existing user from stateManager:', existingUser.email);
            this.currentUser = existingUser;
            this.authState = 'authenticated';
        }
        return Promise.resolve(true);
    }
    async signIn(provider, email = null) {
        console.log('🔧 AuthManager signIn called with provider:', provider);
        if (provider === 'google') {
            if (typeof window !== 'undefined' && window.realGoogleAuth) {
                const realGoogleAuth = window.realGoogleAuth;
                return await realGoogleAuth?.signInWithGoogle();
            }
        }
        else if (provider === 'magic_link' && email) {
            if (typeof window !== 'undefined' && window.realGoogleAuth) {
                const realGoogleAuth = window.realGoogleAuth;
                return await realGoogleAuth?.signInWithMagicLink(email);
            }
        }
        return null;
    }
    initializeAuthHandlers() {
        if (typeof document === 'undefined')
            return;
        document.addEventListener('authGoogleSignIn', () => {
            this.handleGoogleSignInInternal();
        });
        document.addEventListener('authMagicLinkSignIn', ((e) => {
            this.handleMagicLinkSignInInternal(e.detail?.email);
        }));
    }
    async handleGoogleSignInInternal() {
        // Implementation for internal Google sign-in handling
    }
    async handleMagicLinkSignInInternal(email) {
        // Implementation for internal magic link sign-in handling
    }
    async handleGoogleSignIn() {
        return this.signIn('google');
    }
    async handleMagicLinkSignIn(email) {
        return this.signIn('magic_link', email);
    }
    signOut() {
        this.currentUser = null;
        this.authState = 'signed_out';
        // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
        stateManagerInstance.setState('currentUser', null);
        this.handleAuthStateChange({ isAuthenticated: false, user: null });
    }
    isAuthenticated() {
        return this.currentUser !== null;
    }
    getCurrentUser() {
        return this.currentUser;
    }
    setCurrentUser(user) {
        this.currentUser = user;
        this.authState = user ? 'authenticated' : 'signed_out';
        // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
        stateManagerInstance.setState('currentUser', user);
        this.handleAuthStateChange({ isAuthenticated: !!user, user });
    }
    requireAuth(action, callback) {
        if (this.isAuthenticated()) {
            callback();
        }
        else {
            this.showAuthPrompt(action);
        }
    }
    async updateUserProfile(updates) {
        console.log('Updating user profile', { updates }, 'auth');
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
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated(),
            authState: this.authState,
            user: this.currentUser
        };
    }
    handleAuthStateChange(detail) {
        this.authCallbacks.forEach(callback => {
            try {
                callback(detail);
            }
            catch (error) {
                console.error('Error in auth state change callback:', error);
            }
        });
    }
    onAuthStateChange(callback) {
        this.authCallbacks.push(callback);
        return () => {
            const index = this.authCallbacks.indexOf(callback);
            if (index > -1) {
                this.authCallbacks.splice(index, 1);
            }
        };
    }
    showAuthPrompt(action) {
        // Implementation for showing auth prompt
        console.log('Show auth prompt for action:', action);
    }
    createAuthPromptModal() {
        // Implementation for creating auth prompt modal
    }
    setupAuthPromptListeners() {
        // Implementation for setting up auth prompt listeners
    }
    hideAuthPrompt() {
        // Implementation for hiding auth prompt
    }
    updateAuthUI() {
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
export const signIn = (provider, email = null) => authManagerInstance.signIn(provider, email);
export const isAuthenticated = () => authManagerInstance.isAuthenticated();
export const getCurrentUser = () => authManagerInstance.getCurrentUser();
export const requireAuth = (action, callback) => authManagerInstance.requireAuth(action, callback);
export const handleGoogleSignIn = () => authManagerInstance.handleGoogleSignIn();
export const handleMagicLinkSignIn = (email) => authManagerInstance.handleMagicLinkSignIn(email);
export const updateUserProfile = (updates) => authManagerInstance.updateUserProfile(updates);
export const signOut = () => authManagerInstance.signOut();
export const getAuthStatus = () => authManagerInstance.getAuthStatus();
export const initializeAuthHandlers = () => authManagerInstance.initializeAuthHandlers();
export const handleAuthStateChange = (detail) => authManagerInstance.handleAuthStateChange(detail);
export const handleUserUpdate = (updatedUser) => authManagerInstance.setCurrentUser(updatedUser);
export const showAuthPrompt = (action) => authManagerInstance.showAuthPrompt(action);
export const createAuthPromptModal = () => authManagerInstance.createAuthPromptModal();
export const setupAuthPromptListeners = () => authManagerInstance.setupAuthPromptListeners();
export const hideAuthPrompt = () => authManagerInstance.hideAuthPrompt();
export const updateAuthUI = () => authManagerInstance.updateAuthUI();
export const onAuthStateChange = (callback) => authManagerInstance.onAuthStateChange(callback);
