/**
 * AUTH MODULE - Authentication and User Management
 * Handles all authentication functionality
 */
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
declare class AuthModule {
    private logLevel;
    private isInitialized;
    /**
     * Initialize Auth module
     */
    initialize(): Promise<void>;
    /**
     * Logging utility
     */
    private log;
}
declare function authenticateWithSupabase(user: User): Promise<void>;
declare function requireAuth(action: string, callback?: () => void): Promise<boolean>;
declare function showAuthPrompt(action: string): void;
declare function createAuthPromptModal(): void;
declare function initializeRealGoogleAuth(): void;
declare function testRealtimeAfterAuth(pageId: string): Promise<boolean>;
declare function signInWithGoogle(): Promise<void>;
declare function sendMagicLink(): Promise<void>;
declare function signOut(): Promise<void>;
declare function completeOTPForRealtime(otpCode: string): Promise<boolean>;
declare function getCurrentUserId(): Promise<string | null>;
declare function getCurrentUserEmail(): Promise<string | null>;
declare function getCurrentUserAvatarColor(): Promise<string>;
declare function getUserAvatarBgColor(): string;
declare function getCurrentUserAvatarBgColor(): string;
declare function resetCustomAvatarColor(): void;
declare function markInitializationComplete(): void;
export { AuthModule, authenticateWithSupabase, requireAuth, showAuthPrompt, createAuthPromptModal, initializeRealGoogleAuth, markInitializationComplete, signOut, signInWithGoogle, sendMagicLink, getCurrentUserId, getCurrentUserEmail, getCurrentUserAvatarColor, getUserAvatarBgColor, getCurrentUserAvatarBgColor, resetCustomAvatarColor, testRealtimeAfterAuth, completeOTPForRealtime };
//# sourceMappingURL=AuthModule.d.ts.map