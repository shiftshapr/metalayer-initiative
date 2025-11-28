import { User } from '../types/index.js';
declare class ProfileManager {
    private profileData;
    private avatarCache;
    private updateCallbacks;
    private isAuthenticated;
    private clickOutsideHandler?;
    visibilitySettingsHandler?: (event: Event) => void;
    private themeToggleHandler?;
    constructor();
    /**
     * Load and apply theme on startup
     * ROOT CAUSE FIX: Ensures theme persists across page reloads
     */
    loadThemeOnStartup(): Promise<void>;
    /**
     * Wait for authentication AND pre-render initialization to complete using proper async/promises
     */
    waitForAuthentication(): Promise<void>;
    /**
     * ROOT CAUSE FIX: Initialize UserPreferencesManager when user becomes available
     * This ensures preferences (including theme) are loaded from database and applied correctly
     */
    initializeUserPreferencesManager(user: User | null): Promise<void>;
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
     * ROOT CAUSE FIX: Ensure parent container #user-info is visible when user is authenticated
     */
    private ensureUserInfoVisible;
    /**
     * COMP METHOD: Setup profile menu and aura modal
     * ROOT CAUSE FIX: Wait for currentUser if not available, retry when it becomes available
     * ROOT CAUSE FIX: Prevent multiple simultaneous calls to avoid redundant API requests
     */
    private setupProfileMenuAndAuraModalPromise;
    setupProfileMenuAndAuraModal(): Promise<void>;
    /**
     * COMP METHOD: Toggle user menu
     */
    toggleUserMenu(e: Event): Promise<void>;
    /**
     * COMP METHOD: Create user menu
     */
    createUserMenu(): Promise<string>;
    /**
     * Update profile menu theme icon and text based on current theme
     * ROOT CAUSE FIX: Update BOTH theme-icon/theme-text (sidepanel.html) AND theme-icon-menu/theme-text-menu (dynamic menu)
     */
    updateProfileMenuTheme(): void;
    /**
     * ROOT CAUSE FIX: Unified function to update ALL theme UI elements (profile menu AND settings tab)
     * This ensures both toggles stay in sync when theme is changed from either location
     */
    updateAllThemeUI(theme: string): void;
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
    handleUserUpdate(user: User): Promise<void>;
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
    handleAuraColorUpdate(auraData: {
        auraColor?: string;
        color?: string;
        userId?: string;
        user?: User;
        [key: string]: unknown;
    }): Promise<void>;
    /**
     * Handle authentication UI updates
     */
    handleAuthUIUpdate(authData: {
        isAuthenticated?: boolean;
        user?: User;
        [key: string]: unknown;
    }): Promise<void>;
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
    createFallbackAvatar(): string | undefined;
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
    getProfileData(): User | null;
    /**
     * Register profile update callback
     */
    onProfileUpdate(callback: (user: User | null) => void): () => void;
    /**
     * Cache avatar for performance
     */
    cacheAvatar(userId: string, avatarData: {
        url?: string;
        color?: string;
        initials?: string;
        [key: string]: unknown;
    }): void;
    /**
     * Get cached avatar
     */
    getCachedAvatar(userId: string): {
        [key: string]: unknown;
        url?: string;
        color?: string;
        initials?: string;
    } | null;
    /**
     * Clear avatar cache
     */
    clearAvatarCache(): void;
    /**
     * Get profile status for debugging
     */
    getProfileStatus(): {
        hasProfileData: boolean;
        userId: string | null;
        hasAvatar: boolean;
        avatarSource: {} | null;
        auraColor: string | null;
        callbacksRegistered: number;
        cacheSize: number;
    };
}
declare function updateAuraColorEverywhere(color: string): Promise<boolean>;
declare function getCurrentUserAuraColor(): Promise<string>;
declare function getCurrentUserAvatarBgColor(): string;
declare function getCurrentUserAvatarColor(): Promise<string>;
declare function setCustomAvatarColor(color: string): void;
declare function resetCustomAvatarColor(): void;
declare function handleAvatarClick(e: Event): void;
declare function handleClickOutside(e: Event): void;
declare function addProfileAvatarClickHandler(): void;
declare function addAuraButtonClickHandler(): void;
declare function addLogoutButtonClickHandler(): void;
declare function addAllProfileMenuHandlers(): void;
declare function showColorPickerModal(): void;
declare function closeColorPickerModal(): void;
declare function updateColorPreview(hex: string): void;
declare function isValidHex(hex: string): boolean;
declare function getAvatarColor(name: string): string;
declare function updateAvailabilityEverywhere(availability: string): Promise<boolean>;
declare function updateThemeEverywhere(theme: string): Promise<boolean>;
declare function getCurrentUserTheme(): Promise<string>;
declare function getCurrentUserAvailability(): Promise<{}>;
declare const getProfileManagerInstance: () => ProfileManager;
declare const initializeProfileManager: () => ProfileManager | null;
declare const profileManagerApi: {
    ProfileManager: typeof ProfileManager;
    initializeProfileManager: () => ProfileManager | null;
    getProfileManagerInstance: () => ProfileManager;
    getCurrentUserAuraColor: typeof getCurrentUserAuraColor;
    updateAuraColorEverywhere: typeof updateAuraColorEverywhere;
    getCurrentUserTheme: typeof getCurrentUserTheme;
    updateThemeEverywhere: typeof updateThemeEverywhere;
    getCurrentUserAvailability: typeof getCurrentUserAvailability;
    updateAvailabilityEverywhere: typeof updateAvailabilityEverywhere;
    getCurrentUserAvatarBgColor: typeof getCurrentUserAvatarBgColor;
    getCurrentUserAvatarColor: typeof getCurrentUserAvatarColor;
    setCustomAvatarColor: typeof setCustomAvatarColor;
    resetCustomAvatarColor: typeof resetCustomAvatarColor;
    handleAvatarClick: typeof handleAvatarClick;
    handleClickOutside: typeof handleClickOutside;
    addProfileAvatarClickHandler: typeof addProfileAvatarClickHandler;
    addAuraButtonClickHandler: typeof addAuraButtonClickHandler;
    addLogoutButtonClickHandler: typeof addLogoutButtonClickHandler;
    addAllProfileMenuHandlers: typeof addAllProfileMenuHandlers;
    showColorPickerModal: typeof showColorPickerModal;
    closeColorPickerModal: typeof closeColorPickerModal;
    updateColorPreview: typeof updateColorPreview;
    isValidHex: typeof isValidHex;
    getAvatarColor: typeof getAvatarColor;
};
export { ProfileManager, initializeProfileManager, getProfileManagerInstance, getCurrentUserAuraColor, updateAuraColorEverywhere, getCurrentUserTheme, updateThemeEverywhere, getCurrentUserAvailability, updateAvailabilityEverywhere, getCurrentUserAvatarBgColor, getCurrentUserAvatarColor, setCustomAvatarColor, resetCustomAvatarColor, handleAvatarClick, handleClickOutside, addProfileAvatarClickHandler, addAuraButtonClickHandler, addLogoutButtonClickHandler, addAllProfileMenuHandlers, showColorPickerModal, closeColorPickerModal, updateColorPreview, isValidHex, getAvatarColor };
export default profileManagerApi;
//# sourceMappingURL=ProfileManager.d.ts.map