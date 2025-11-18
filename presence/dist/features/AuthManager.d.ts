/**
 * AUTH MANAGER - Authentication Management Module
 * TypeScript + ES6 Module
 */
import { User } from '../types/index.js';
type AuthState = 'unknown' | 'SIGNED_IN' | 'SIGNED_OUT';
type AuthProvider = 'google' | 'magic_link';
type AuthCallback = (user: User | null) => void | Promise<void>;
declare class AuthManager {
    private currentUser;
    private authState;
    private authCallbacks;
    constructor();
    /**
     * Initialize AuthManager (COMP METHOD)
     */
    initialize(): Promise<boolean>;
    /**
     * Sign in with provider (COMP METHOD)
     */
    signIn(provider: AuthProvider, email?: string | null): Promise<User | null>;
    /**
     * Initialize authentication event handlers
     */
    initializeAuthHandlers(): void;
    /**
     * Handle Google sign-in (internal)
     */
    handleGoogleSignInInternal(): Promise<void>;
    /**
     * Handle Magic Link sign-in (internal)
     */
    handleMagicLinkSignInInternal(email: string | undefined): Promise<void>;
    /**
     * Handle authentication state change
     */
    handleAuthStateChange(detail: {
        user?: User;
        authState?: AuthState;
    }): void;
    /**
     * Set current user and update state
     */
    setCurrentUser(user: User | null): void;
    /**
     * Sign out current user
     */
    signOut(): void;
    /**
     * Require authentication for an action
     */
    requireAuth(action: string, callback?: () => void | Promise<void>): Promise<boolean>;
    /**
     * Check if user is currently authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Get current user information
     */
    getCurrentUser(): User;
    /**
     * Show authentication prompt modal
     */
    showAuthPrompt(action: string): void;
    /**
     * Create authentication prompt modal
     */
    createAuthPromptModal(): void;
    /**
     * Setup authentication prompt event listeners
     */
    setupAuthPromptListeners(): void;
    /**
     * Handle Google sign-in from prompt
     */
    handleGoogleSignInFromPrompt(): void;
    /**
     * Handle Magic Link sign-in from prompt
     */
    handleMagicLinkSignInFromPrompt(): void;
    /**
     * Hide authentication prompt
     */
    hideAuthPrompt(): void;
    /**
     * Update authentication UI based on current state
     */
    updateAuthUI(): void;
    /**
     * Register callback for auth state changes
     */
    onAuthStateChange(callback: AuthCallback): () => void;
    /**
     * Handle user update
     * COMP METHOD: Matches original implementation
     */
    handleUserUpdate(updatedUser: any): void;
    /**
     * Handle Google sign-in (public wrapper)
     * COMP METHOD: Matches original implementation
     */
    handleGoogleSignIn(): Promise<void>;
    /**
     * Handle Magic Link sign-in (public wrapper)
     * COMP METHOD: Matches original implementation
     */
    handleMagicLinkSignIn(email: string): Promise<void>;
    /**
     * Update user profile
     * COMP METHOD: Matches original implementation
     */
    updateUserProfile(updates: Partial<User>): Promise<void>;
    /**
     * Get authentication status
     * COMP METHOD: Matches original implementation
     */
    getAuthStatus(): {
        isAuthenticated: boolean;
        authState: AuthState;
        user: User | null;
    };
}
declare const authManagerInstance: AuthManager;
export { AuthManager, authManagerInstance };
export default authManagerInstance;
export declare const getAuthManagerInstance: () => AuthManager;
export declare const initialize: () => Promise<boolean>;
export declare const signIn: (provider: AuthProvider, email?: string | null) => Promise<User>;
export declare const isAuthenticated: () => boolean;
export declare const getCurrentUser: () => User;
export declare const requireAuth: (action: string, callback?: () => void | Promise<void>) => Promise<boolean>;
export declare const handleGoogleSignIn: () => Promise<void>;
export declare const handleMagicLinkSignIn: (email: string) => Promise<void>;
export declare const updateUserProfile: (updates: Partial<User>) => Promise<void>;
export declare const signOut: () => void;
export declare const getAuthStatus: () => {
    isAuthenticated: boolean;
    authState: AuthState;
    user: User | null;
};
export declare const initializeAuthHandlers: () => void;
export declare const handleAuthStateChange: (detail: {
    user?: User;
    authState?: AuthState;
}) => void;
export declare const handleUserUpdate: (updatedUser: User) => void;
export declare const showAuthPrompt: (action: string) => void;
export declare const createAuthPromptModal: () => void;
export declare const setupAuthPromptListeners: () => void;
export declare const hideAuthPrompt: () => void;
export declare const updateAuthUI: () => void;
export declare const onAuthStateChange: (callback: AuthCallback) => () => void;
//# sourceMappingURL=AuthManager.d.ts.map