/**
 * AUTH MANAGER - Authentication Management Module
 * TypeScript + ES6 Module
 */
import type { User } from '../types/index.js';
interface AuthStateChangeDetail {
    isAuthenticated: boolean;
    user?: User | null;
    [key: string]: unknown;
}
type AuthCallback = (detail: AuthStateChangeDetail) => void;
declare class AuthManager {
    private currentUser;
    private authState;
    private authCallbacks;
    constructor();
    initialize(): Promise<boolean>;
    signIn(provider: string, email?: string | null): Promise<unknown>;
    initializeAuthHandlers(): void;
    private handleGoogleSignInInternal;
    private handleMagicLinkSignInInternal;
    handleGoogleSignIn(): Promise<unknown>;
    handleMagicLinkSignIn(email: string): Promise<unknown>;
    signOut(): void;
    isAuthenticated(): boolean;
    getCurrentUser(): User | null;
    setCurrentUser(user: User | null): void;
    requireAuth(action: string, callback: () => void): void;
    updateUserProfile(updates: Partial<User>): Promise<void>;
    getAuthStatus(): {
        isAuthenticated: boolean;
        authState: string;
        user: User | null;
    };
    handleAuthStateChange(detail: AuthStateChangeDetail): void;
    onAuthStateChange(callback: AuthCallback): () => void;
    showAuthPrompt(action: string): void;
    createAuthPromptModal(): void;
    setupAuthPromptListeners(): void;
    hideAuthPrompt(): void;
    updateAuthUI(): void;
}
declare const authManagerInstance: AuthManager;
export { AuthManager, authManagerInstance };
export default authManagerInstance;
export declare const getAuthManagerInstance: () => AuthManager;
export declare const initialize: () => Promise<boolean>;
export declare const signIn: (provider: string, email?: string | null) => Promise<unknown>;
export declare const isAuthenticated: () => boolean;
export declare const getCurrentUser: () => User | null;
export declare const requireAuth: (action: string, callback: () => void) => void;
export declare const handleGoogleSignIn: () => Promise<unknown>;
export declare const handleMagicLinkSignIn: (email: string) => Promise<unknown>;
export declare const updateUserProfile: (updates: Partial<User>) => Promise<void>;
export declare const signOut: () => void;
export declare const getAuthStatus: () => {
    isAuthenticated: boolean;
    authState: string;
    user: User | null;
};
export declare const initializeAuthHandlers: () => void;
export declare const handleAuthStateChange: (detail: AuthStateChangeDetail) => void;
export declare const handleUserUpdate: (updatedUser: User | null) => void;
export declare const showAuthPrompt: (action: string) => void;
export declare const createAuthPromptModal: () => void;
export declare const setupAuthPromptListeners: () => void;
export declare const hideAuthPrompt: () => void;
export declare const updateAuthUI: () => void;
export declare const onAuthStateChange: (callback: AuthCallback) => () => void;
//# sourceMappingURL=AuthManager.d.ts.map