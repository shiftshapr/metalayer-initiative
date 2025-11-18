import { User } from '../types/index.js';
/**
 * ProfileManager.ts - User Profile Management Module
 * Extracted from sidepanel.js for modular architecture
 *
 * Responsibilities:
 * - User profile display and updates
 * - Avatar management and updates
 * - Profile UI state management
 * - Profile data synchronization
 */
type LegacyUser = User & {
    userId?: string;
    displayName?: string;
    globalAvailability?: string;
    is_active?: boolean;
    theme?: string;
    avatarSource?: string;
    [key: string]: any;
};
declare class ProfileManager {
    private profileData;
    private avatarCache;
    private updateCallbacks;
    private isAuthenticated;
    private authPromise;
    private clickOutsideHandler?;
    private visibilitySettingsHandler?;
    private themeToggleHandler?;
    constructor();
    /**
     * Wait for authentication AND pre-render initialization to complete using proper async/promises
     */
    waitForAuthentication(): Promise<void>;
    /**
     * CRITICAL FIX: Initialize profile avatar with pre-render data to prevent white flash
     */
    initializeProfileAvatarImmediately(): Promise<void>;
    /**
     * Initialize profile avatar after authentication
     */
    initializeProfileAvatar(): Promise<void>;
    /**
     * Load aura color from pre-render data or storage
     */
    loadAuraColorFromStorage(): Promise<void>;
    /**
     * Initialize profile event handlers
     */
    initializeProfileHandlers(): void;
    /**
     * COMP METHOD: Initialize profile menu and aura modal with error handling
     */
    initializeProfileMenuAndAuraModal(): void;
    /**
     * COMP METHOD: Setup profile menu and aura modal
     */
    setupProfileMenuAndAuraModal(): Promise<void>;
    /**
     * COMP METHOD: Toggle user menu
     */
    toggleUserMenu(e: Event): Promise<void>;
    /**
     * COMP METHOD: Create user menu
     */
    createUserMenu(): Promise<void>;
    /**
     * Update profile menu theme icon and text based on current theme
     */
    updateProfileMenuTheme(): void;
    /**
     * COMP METHOD: Add user menu event listeners
     */
    addUserMenuEventListeners(): void;
    /**
     * COMP METHOD: Hide user menu
     */
    hideUserMenu(): void;
    /**
     * ROOT CAUSE FIX: Add click-outside handler to close menu
     */
    addClickOutsideHandler(): void;
    /**
     * COMP METHOD: Show color picker modal
     */
    showColorPickerModal(): Promise<void>;
    /**
     * COMP METHOD: Add color picker event listeners
     */
    addColorPickerEventListeners(): void;
    /**
     * COMP METHOD: Toggle theme
     */
    toggleTheme(): Promise<void>;
    /**
     * COMP METHOD: Perform logout
     */
    performLogout(): void;
    /**
     * Handle user profile updates
     */
    handleUserUpdate(user: LegacyUser): Promise<void>;
    /**
     * Handle avatar updates
     */
    handleAvatarUpdate(avatarData: {
        avatarUrl?: string;
        source?: string;
    }): Promise<void>;
    /**
     * Handle aura color updates
     */
    handleAuraColorUpdate(auraData: any): Promise<void>;
    /**
     * Handle authentication UI updates
     */
    handleAuthUIUpdate(authData: any): Promise<void>;
    /**
     * Update profile UI with current user data
     */
    updateProfileUI(): Promise<void>;
    /**
     * Update user information display
     */
    updateUserInfo(): void;
    /**
     * Update user avatar display
     */
    updateUserAvatar(): Promise<void>;
    /**
     * Create fallback avatar when AvatarUtils is not available
     */
    createFallbackAvatar(): void;
    /**
     * Update user menu display
     */
    updateUserMenu(): void;
    /**
     * Clear profile UI when user signs out
     */
    clearProfileUI(): void;
    /**
     * Update user aura color
     */
    updateAuraColor(color: string): boolean;
    /**
     * Refresh profile avatar with latest data
     */
    refreshProfileAvatar(): void;
    /**
     * Get current profile data
     */
    getProfileData(): LegacyUser;
    /**
     * Register profile update callback
     */
    onProfileUpdate(callback: (user: LegacyUser | null) => void): () => void;
    /**
     * Cache avatar for performance
     */
    cacheAvatar(userId: string, avatarData: any): void;
    /**
     * Get cached avatar
     */
    getCachedAvatar(userId: string): any;
    /**
     * Clear avatar cache
     */
    clearAvatarCache(): void;
    /**
     * Get profile status for debugging
     */
    getProfileStatus(): {
        hasProfileData: boolean;
        userId: string;
        hasAvatar: boolean;
        avatarSource: string;
        auraColor: string;
        callbacksRegistered: number;
        cacheSize: number;
    };
}
declare const profileManagerInstance: ProfileManager;
export { ProfileManager, profileManagerInstance };
export default ProfileManager;
//# sourceMappingURL=ProfileManager.d.ts.map