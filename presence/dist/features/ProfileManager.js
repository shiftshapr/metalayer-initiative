import { AvatarUtils } from '../utils/AvatarUtils.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { stateManagerInstance } from '../core/StateManager.js';
// ROOT CAUSE FIX: legacyContext is DEPRECATED - all references should be replaced with proper TypeScript imports
// Keeping temporarily for backward compatibility during migration - will be removed once all references are fixed
const legacyContext = globalThis;
// Helper functions using proper TypeScript imports
const getApi = () => {
    // ROOT CAUSE FIX: Get API from window (set by APIService.ts) or stateManager
    const win = window;
    if (win.api && typeof win.api.request === 'function') {
        return win.api;
    }
    // Fallback: try stateManager
    const apiFromState = stateManagerInstance.getState('api');
    if (apiFromState && typeof apiFromState.request === 'function') {
        return apiFromState;
    }
    return null;
};
const ensureApi = (context) => {
    const api = getApi();
    if (!api) {
        console.warn(`⚠️ PROFILE_MANAGER: API not available (${context})`);
        return null;
    }
    return api;
};
const getVisibilityDataUnfiltered = () => {
    // ROOT CAUSE FIX: Get from window (set by VisibilityManager) instead of legacyContext
    const win = window;
    const candidate = win.currentVisibilityDataUnfiltered;
    if (candidate && Array.isArray(candidate.active)) {
        return { active: candidate.active };
    }
    return null;
};
const getVisibilityDataFiltered = () => {
    // ROOT CAUSE FIX: Get from window (set by VisibilityManager) instead of legacyContext
    const win = window;
    const candidate = win.currentVisibilityData;
    if (candidate && Array.isArray(candidate.active)) {
        return { active: candidate.active };
    }
    return null;
};
const getVisibilityData = () => getVisibilityDataUnfiltered() ?? getVisibilityDataFiltered();
const getUserPreferencesManager = () => {
    // ROOT CAUSE FIX: Get from window (set by UserPreferencesManager) instead of legacyContext
    const win = window;
    return win.userPreferencesManager ?? null;
};
const getChromeStorage = (keys) => {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => {
            resolve((result || {}));
        });
    });
};
const setChromeStorage = (items) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(items, () => {
            if (chrome.runtime?.lastError) {
                reject(chrome.runtime.lastError);
            }
            else {
                resolve();
            }
        });
    });
};
// ROOT CAUSE FIX: Helper to ensure user object has required fields
// Note: This is synchronous - callers should get currentUser from stateManager first if needed
const ensureLegacyUser = (user) => {
    if (!user) {
        return {
            id: `user-${Date.now()}`,
            name: 'User',
            email: 'user@example.com',
            displayName: 'User'
        };
    }
    if (!user.id) {
        user.id = user.userId || `user-${Date.now()}`;
    }
    if (!user.name) {
        user.name = user.displayName || user.email?.split('@')[0] || 'User';
    }
    if (!user.displayName) {
        user.displayName = user.name;
    }
    return user;
};
class ProfileManager {
    constructor() {
        /**
         * COMP METHOD: Setup profile menu and aura modal
         * ROOT CAUSE FIX: Wait for currentUser if not available, retry when it becomes available
         * ROOT CAUSE FIX: Prevent multiple simultaneous calls to avoid redundant API requests
         */
        this.setupProfileMenuAndAuraModalPromise = null;
        this.currentUserUnsubscribe = null; // For StateManager subscription cleanup
        this.profileData = null;
        this.avatarCache = new Map();
        this.updateCallbacks = [];
        this.isAuthenticated = false;
        this.authPromise = null;
        console.log('ProfileManager initialized', null, 'profile');
        // ROOT CAUSE FIX: Load and apply theme on startup
        this.loadThemeOnStartup();
        this.initializeProfileHandlers();
        // CRITICAL FIX: Initialize avatar immediately with available data, don't wait for everything
        this.initializeProfileAvatarImmediately();
        // Still set up the waiting mechanism for updates
        this.waitForAuthentication();
    }
    /**
     * Load and apply theme on startup
     * ROOT CAUSE FIX: Ensures theme persists across page reloads
     */
    async loadThemeOnStartup() {
        try {
            const theme = await getCurrentUserTheme();
            if (theme && ['light', 'dark', 'auto'].includes(theme)) {
                console.log(`✅ PROFILE MANAGER: Loading theme on startup: ${theme}`);
                // Apply theme immediately
                document.documentElement.setAttribute('data-theme', theme);
                document.body.setAttribute('data-theme', theme);
                // Update theme toggle if it exists
                const themeToggle = document.getElementById('theme-toggle');
                if (themeToggle) {
                    themeToggle.checked = theme === 'dark';
                }
                // Update profile menu theme display
                this.updateProfileMenuTheme();
                console.log(`✅ PROFILE MANAGER: Theme applied on startup: ${theme}`);
            }
        }
        catch (error) {
            console.warn('⚠️ PROFILE MANAGER: Error loading theme on startup:', error);
        }
    }
    /**
     * Wait for authentication AND pre-render initialization to complete using proper async/promises
     */
    async waitForAuthentication() {
        console.log('🔧 PROFILE_MANAGER: Waiting for authentication and pre-render data...');
        // Create promises for each dependency
        const waitForAuth = new Promise((resolve) => {
            // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no legacyContext.currentUser)
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser && currentUser.id) {
                console.log('🔧 PROFILE_MANAGER: Authentication already available');
                resolve();
                return;
            }
            console.log('🔧 PROFILE_MANAGER: Waiting for authentication...');
            // Listen for auth events (these may already be fired, so check immediately)
            const checkAuth = () => {
                const user = stateManagerInstance.getState('currentUser');
                if (user && user.id) {
                    console.log('🔧 PROFILE_MANAGER: Authentication completed:', user.email);
                    resolve();
                }
            };
            // Check immediately in case auth already happened
            checkAuth();
            // Listen for future auth completion events
            document.addEventListener('authUIUpdate', (event) => {
                const detail = event.detail;
                if (detail?.isAuthenticated && detail.user) {
                    checkAuth();
                }
            }, { once: true });
            document.addEventListener('userUpdated', (event) => {
                const detail = event.detail;
                if (detail && detail.id) {
                    checkAuth();
                }
            }, { once: true });
        });
        const waitForPreRender = new Promise((resolve) => {
            // ROOT CAUSE FIX: Get preRenderInitializer from window instead of legacyContext
            const win = window;
            if (win.preRenderInitializer?.isInitialized) {
                console.log('🔧 PROFILE_MANAGER: Pre-render already initialized');
                resolve();
                return;
            }
            console.log('🔧 PROFILE_MANAGER: Waiting for pre-render initialization...');
            // Listen for pre-render events
            const checkPreRender = () => {
                // ROOT CAUSE FIX: Get preRenderInitializer from window instead of legacyContext
                const win = window;
                if (win.preRenderInitializer?.isInitialized) {
                    console.log('🔧 PROFILE_MANAGER: Pre-render initialization completed');
                    const preRenderData = win.preRenderInitializer.getPreRenderData();
                    console.log('🔧 PROFILE_MANAGER: Pre-render data:', {
                        hasAuraColor: !!preRenderData.auraColor,
                        hasAvatarUrl: !!preRenderData.avatarUrl,
                        auraColor: preRenderData.auraColor
                    });
                    resolve();
                }
            };
            // Check immediately in case pre-render already happened
            checkPreRender();
            // Listen for future pre-render completion events
            document.addEventListener('preRenderComplete', checkPreRender, { once: true });
        });
        // Add timeout as fallback (30 seconds max)
        const timeout = new Promise((resolve) => {
            setTimeout(() => {
                console.warn('🔧 PROFILE_MANAGER: Timeout waiting for full initialization (30s)');
                console.warn('🔧 PROFILE_MANAGER: Proceeding with available data...');
                resolve();
            }, 30000);
        });
        // Wait for all promises to resolve (auth + pre-render + timeout fallback)
        try {
            await Promise.all([waitForAuth, waitForPreRender, timeout]);
            console.log('🔧 PROFILE_MANAGER: All initialization promises resolved');
        }
        catch (error) {
            console.error('🔧 PROFILE_MANAGER: Error waiting for promises:', error);
        }
        // Check final state and proceed
        // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no legacyContext.currentUser)
        const currentUserForCheck = stateManagerInstance.getState('currentUser');
        const hasUser = currentUserForCheck && currentUserForCheck.id;
        // ROOT CAUSE FIX: Get preRenderInitializer from window instead of legacyContext
        const win = window;
        const preRenderReady = win.preRenderInitializer && win.preRenderInitializer.isInitialized;
        if (hasUser) {
            this.isAuthenticated = true;
            console.log('🔧 PROFILE_MANAGER: Ready to initialize profile avatar...');
            // ROOT CAUSE FIX: Initialize UserPreferencesManager when user becomes available
            await this.initializeUserPreferencesManager(currentUserForCheck);
            await this.initializeProfileAvatar();
        }
        else {
            console.warn('🔧 PROFILE_MANAGER: No authentication available, skipping profile avatar initialization');
        }
    }
    /**
     * ROOT CAUSE FIX: Initialize UserPreferencesManager when user becomes available
     * This ensures preferences (including theme) are loaded from database and applied correctly
     */
    async initializeUserPreferencesManager(user) {
        if (!user || !user.id) {
            console.warn('⚠️ PROFILE_MANAGER: Cannot initialize UserPreferencesManager - no user ID');
            return;
        }
        try {
            const win = window;
            if (!win.userPreferencesManager) {
                console.warn('⚠️ PROFILE_MANAGER: UserPreferencesManager not available on window');
                return;
            }
            if (win.userPreferencesManager.isInitialized) {
                console.log('✅ PROFILE_MANAGER: UserPreferencesManager already initialized');
                return;
            }
            console.log('🔧 PROFILE_MANAGER: Initializing UserPreferencesManager for user:', user.id);
            if (typeof win.userPreferencesManager.initialize === 'function') {
                const result = await win.userPreferencesManager.initialize(user.id);
                if (result) {
                    console.log('✅ PROFILE_MANAGER: UserPreferencesManager initialized successfully');
                }
                else {
                    console.warn('⚠️ PROFILE_MANAGER: UserPreferencesManager initialization returned false');
                }
            }
            else {
                console.warn('⚠️ PROFILE_MANAGER: UserPreferencesManager.initialize is not a function');
            }
        }
        catch (error) {
            console.error('❌ PROFILE_MANAGER: Error initializing UserPreferencesManager:', error);
        }
    }
    /**
     * CRITICAL FIX: Initialize profile avatar with pre-render data to prevent white flash
     */
    async initializeProfileAvatarImmediately() {
        console.log('🔧 PROFILE_MANAGER: Initializing profile avatar with pre-render data to prevent white flash...');
        // CRITICAL FIX: Wait for PreRenderInitializer to complete before rendering avatar
        // This prevents the 10-15 second white flash while waiting for database auraColor
        // ROOT CAUSE FIX: Get preRenderInitializer from window instead of legacyContext
        const win = window;
        if (!win.preRenderInitializer?.isInitialized) {
            console.log('⏳ PROFILE_MANAGER: Waiting for PreRenderInitializer to complete...');
            // Wait for pre-render initialization to complete (max 10 seconds)
            const preRenderPromise = new Promise((resolve) => {
                const checkPreRender = () => {
                    // ROOT CAUSE FIX: Reuse win variable from outer scope
                    if (win.preRenderInitializer?.isInitialized) {
                        console.log('✅ PROFILE_MANAGER: PreRenderInitializer completed, proceeding with avatar setup');
                        resolve();
                    }
                    else {
                        // Check again in 100ms
                        setTimeout(checkPreRender, 100);
                    }
                };
                // Start checking immediately
                checkPreRender();
                // Timeout after 10 seconds to prevent infinite waiting
                setTimeout(() => {
                    console.log('⏰ PROFILE_MANAGER: PreRenderInitializer timeout reached, proceeding anyway');
                    resolve();
                }, 10000);
            });
            await preRenderPromise;
        }
        // Now get the complete pre-render data
        // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no legacyContext.currentUser)
        const currentUser = stateManagerInstance.getState('currentUser');
        // ROOT CAUSE FIX: Reuse win variable from outer scope
        const preRenderData = win.preRenderInitializer?.getPreRenderData();
        console.log('🔧 PROFILE_MANAGER: Pre-render data available:', {
            isInitialized: preRenderData?.isInitialized,
            hasAuraColor: !!preRenderData?.auraColor,
            auraColor: preRenderData?.auraColor,
            hasAvatarUrl: !!preRenderData?.avatarUrl,
            avatarUrl: preRenderData?.avatarUrl?.substring(0, 50) + '...'
        });
        // If we have user data, create the avatar with complete information
        if (currentUser?.id || preRenderData?.userData?.id) {
            console.log('🔧 PROFILE_MANAGER: User data available, setting up avatar with complete data...');
            // Set basic profile data from currentUser
            if (currentUser) {
                this.profileData = { ...currentUser };
            }
            // CRITICAL FIX: Check Chrome storage FIRST for instant display
            let auraColorValue = null;
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                try {
                    const storageResult = await getChromeStorage(['userAuraColor', 'auraColor']);
                    const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
                    if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'white' && cachedAuraColor !== '#fff') {
                        auraColorValue = cachedAuraColor;
                        console.log('🎨 PROFILE_MANAGER: Using aura color from Chrome storage (CACHE):', auraColorValue);
                    }
                }
                catch (error) {
                    console.warn('⚠️ PROFILE_MANAGER: Could not read from Chrome storage:', error);
                }
            }
            // Apply pre-render aura color (takes precedence over cache - this should be the database value)
            if (!auraColorValue && preRenderData?.auraColor) {
                auraColorValue = preRenderData.auraColor;
                console.log('🎨 PROFILE_MANAGER: Using auraColor from pre-render data (DATABASE):', auraColorValue);
                // Cache database value in Chrome storage for next time
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    try {
                        await setChromeStorage({ userAuraColor: auraColorValue, auraColor: auraColorValue });
                        console.log('💾 PROFILE_MANAGER: Cached aura color in Chrome storage:', auraColorValue);
                    }
                    catch (error) {
                        console.warn('⚠️ PROFILE_MANAGER: Could not cache to Chrome storage:', error);
                    }
                }
            }
            if (auraColorValue) {
                if (this.profileData) {
                    this.profileData.auraColor = auraColorValue;
                }
                if (currentUser) {
                    currentUser.auraColor = auraColorValue;
                }
            }
            else {
                console.log('⚠️ PROFILE_MANAGER: No auraColor in cache or pre-render data, will fallback to auth data or API fetch');
            }
            // Apply pre-render avatar URL if available
            if (preRenderData?.avatarUrl && currentUser) {
                currentUser.avatarUrl = preRenderData.avatarUrl;
                if (this.profileData) {
                    this.profileData.avatarUrl = preRenderData.avatarUrl;
                }
                console.log('🖼️ PROFILE_MANAGER: Using avatarUrl from pre-render data');
            }
            // Verify we have the auraColor before rendering
            if (this.profileData && this.profileData.auraColor) {
                console.log('🎉 PROFILE_MANAGER: AuraColor available from pre-render/auth data - no white flash!');
            }
            else {
                console.log('⚠️ PROFILE_MANAGER: AuraColor still missing - will cause white flash');
            }
            // Set up the profile menu and avatar with complete data
            await this.setupProfileMenuAndAuraModal();
            console.log('✅ PROFILE_MANAGER: Profile avatar initialized with complete pre-render data');
        }
        else {
            console.log('🔧 PROFILE_MANAGER: No user data available, will initialize when authentication completes');
        }
    }
    /**
     * Initialize profile avatar after authentication
     */
    async initializeProfileAvatar() {
        console.log('🔧 PROFILE_MANAGER: Initializing profile avatar after authentication...');
        // Load aura color from storage if not already set
        await this.loadAuraColorFromStorage();
        // Set up the profile menu and avatar now that we have user data
        await this.setupProfileMenuAndAuraModal();
    }
    /**
     * Load aura color from pre-render data or storage
     */
    async loadAuraColorFromStorage() {
        try {
            console.log('🔧 PROFILE_MANAGER: Loading aura color from available sources...');
            // First priority: Check pre-render initializer data
            // ROOT CAUSE FIX: Get preRenderInitializer from window instead of legacyContext
            const win = window;
            if (win.preRenderInitializer?.getPreRenderData) {
                const preRenderData = win.preRenderInitializer.getPreRenderData();
                console.log('🔧 PROFILE_MANAGER: Pre-render data available:', {
                    isInitialized: preRenderData.isInitialized,
                    auraColor: preRenderData.auraColor,
                    avatarUrl: preRenderData.avatarUrl
                });
                // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no legacyContext.currentUser)
                if (preRenderData.auraColor) {
                    console.log('🎨 PROFILE_MANAGER: Using aura color from pre-render data (DATABASE):', preRenderData.auraColor);
                    const currentUserForAura = stateManagerInstance.getState('currentUser');
                    if (currentUserForAura) {
                        stateManagerInstance.setState('currentUser', { ...currentUserForAura, auraColor: preRenderData.auraColor });
                    }
                    // Update profile data if it exists
                    if (this.profileData) {
                        this.profileData.auraColor = preRenderData.auraColor;
                    }
                    console.log('✅ PROFILE_MANAGER: Aura color applied to currentUser and profileData');
                    return; // Don't check storage if we have pre-render data
                }
                else if (preRenderData.isInitialized) {
                    console.log('ℹ️ PROFILE_MANAGER: Pre-render initialized but no aura color available');
                }
                else {
                    console.log('⏳ PROFILE_MANAGER: Pre-render data available but not yet initialized');
                }
            }
            else {
                console.log('⚠️ PROFILE_MANAGER: Pre-render initializer not available');
            }
            // Fallback: Load aura color from state storage (set by aura color modal)
            // ROOT CAUSE FIX: Use stateManagerInstance instead of legacyContext.getState
            const storedColor = await stateManagerInstance.getState('userAvatarBgColor');
            if (storedColor) {
                console.log('🔧 PROFILE_MANAGER: Checking storage for aura color:', storedColor);
                // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no legacyContext.currentUser)
                if (storedColor && storedColor !== AVATAR_FALLBACK_COLOR) {
                    console.log('🎨 PROFILE_MANAGER: Using aura color from storage (USER PREFERENCE):', storedColor);
                    const currentUserForAura = stateManagerInstance.getState('currentUser');
                    if (currentUserForAura) {
                        stateManagerInstance.setState('currentUser', { ...currentUserForAura, auraColor: storedColor });
                    }
                    // Update profile data if it exists
                    if (this.profileData) {
                        this.profileData.auraColor = storedColor;
                    }
                    console.log('✅ PROFILE_MANAGER: Aura color applied from storage');
                }
                else {
                    console.log('ℹ️ PROFILE_MANAGER: No valid aura color in storage');
                }
            }
            else {
                console.log('⚠️ PROFILE_MANAGER: State storage not available');
            }
            // Last resort: Try to fetch aura color directly from API
            const api = getApi();
            // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no legacyContext.currentUser)
            const currentUserForApi = stateManagerInstance.getState('currentUser');
            if (currentUserForApi?.id && api && !this.profileData?.auraColor) {
                console.log('🔍 PROFILE_MANAGER: Last resort - fetching aura color directly from API...');
                try {
                    const userResponse = await api.request(`/v1/users/${currentUserForApi.id}`, {
                        method: 'GET'
                    });
                    // ROOT CAUSE FIX: API response is wrapped in APIResponse type, check data property
                    let apiAuraColor = null;
                    if (userResponse && typeof userResponse === 'object') {
                        if ('data' in userResponse && userResponse.data && typeof userResponse.data === 'object' && 'auraColor' in userResponse.data) {
                            apiAuraColor = typeof userResponse.data.auraColor === 'string' ? userResponse.data.auraColor : null;
                        }
                        else if ('auraColor' in userResponse) {
                            // Fallback: check if auraColor is directly on response
                            apiAuraColor = typeof userResponse.auraColor === 'string'
                                ? userResponse.auraColor
                                : null;
                        }
                    }
                    if (apiAuraColor) {
                        console.log('🎨 PROFILE_MANAGER: Retrieved aura color from API (fallback):', apiAuraColor);
                        // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no legacyContext.currentUser)
                        stateManagerInstance.setState('currentUser', { ...currentUserForApi, auraColor: apiAuraColor });
                        // Update profile data if it exists
                        if (this.profileData) {
                            this.profileData.auraColor = apiAuraColor;
                        }
                        console.log('✅ PROFILE_MANAGER: Aura color applied from API fallback');
                        return;
                    }
                    else {
                        console.log('⚠️ PROFILE_MANAGER: API response received but no aura color found');
                    }
                }
                catch (apiError) {
                    const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
                    console.warn('⚠️ PROFILE_MANAGER: API fallback failed:', errorMessage);
                }
            }
        }
        catch (error) {
            console.log('🔧 PROFILE_MANAGER: Could not load aura color from storage:', error);
        }
    }
    /**
     * Initialize profile event handlers
     */
    initializeProfileHandlers() {
        // Listen for user updates
        document.addEventListener('userUpdated', (event) => {
            const detail = event.detail;
            if (detail) {
                this.handleUserUpdate(detail);
            }
        });
        // Listen for avatar updates
        document.addEventListener('avatarUpdated', (event) => {
            const detail = event.detail;
            if (detail) {
                this.handleAvatarUpdate(detail);
            }
        });
        // Listen for profile UI updates
        document.addEventListener('authUIUpdate', (event) => {
            const detail = event.detail;
            if (detail) {
                this.handleAuthUIUpdate(detail);
            }
        });
        // Listen for aura color updates
        document.addEventListener('auraColorUpdated', (event) => {
            const detail = event.detail;
            if (detail) {
                this.handleAuraColorUpdate(detail);
            }
        });
        // ROOT CAUSE FIX: Subscribe to stateManager currentUser updates (event-driven, NO POLLING)
        // This handles the race condition where avatar is created before auraColor is fetched from API
        // Using StateManager subscription instead of polling - aligns with Supabase real-time architecture
        const unsubscribeCurrentUser = stateManagerInstance.subscribe('currentUser', (newValue, oldValue) => {
            const currentUser = newValue;
            const oldUser = oldValue;
            // Only update if auraColor changed from missing/invalid to valid
            const oldAuraColor = oldUser?.auraColor;
            const newAuraColor = currentUser?.auraColor;
            if (currentUser && newAuraColor &&
                newAuraColor !== AVATAR_FALLBACK_COLOR &&
                newAuraColor !== '#ffffff' &&
                newAuraColor !== 'ffffff' &&
                newAuraColor !== oldAuraColor) { // Only if auraColor actually changed
                // Check if avatar exists but has wrong aura color
                const avatarContainer = document.getElementById('user-avatar-container');
                if (avatarContainer) {
                    const userAvatar = avatarContainer.querySelector('.user-avatar');
                    if (userAvatar) {
                        const auraElement = userAvatar.querySelector('.avatar-aura-background');
                        if (auraElement) {
                            const existingAuraColor = window.getComputedStyle(auraElement).backgroundColor;
                            // If existing aura is white/fallback and we have a valid color, update avatar
                            if (existingAuraColor === 'rgb(255, 255, 255)' || existingAuraColor === 'rgba(255, 255, 255, 1)') {
                                console.log(`🔄 PROFILE MANAGER: Aura color updated via StateManager subscription (${newAuraColor}), refreshing avatar...`);
                                // Reset promise to allow avatar update
                                this.setupProfileMenuAndAuraModalPromise = null;
                                this.setupProfileMenuAndAuraModal();
                            }
                        }
                    }
                }
            }
        });
        // Store unsubscribe function for cleanup (if needed in future)
        this.currentUserUnsubscribe = unsubscribeCurrentUser;
        // COMP METHOD: Initialize profile menu and aura modal fixes
        this.initializeProfileMenuAndAuraModal();
    }
    /**
     * COMP METHOD: Initialize profile menu and aura modal with error handling
     */
    initializeProfileMenuAndAuraModal() {
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Initializing profile menu and aura modal...');
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupProfileMenuAndAuraModal());
        }
        else {
            this.setupProfileMenuAndAuraModal();
        }
    }
    /**
     * ROOT CAUSE FIX: Ensure parent container #user-info is visible when user is authenticated
     */
    ensureUserInfoVisible() {
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            const currentUser = stateManagerInstance.getState('currentUser');
            // ROOT CAUSE FIX: Check computed style, not just inline style (may be hidden by CSS)
            const computedStyle = window.getComputedStyle(userInfo);
            if (currentUser && (computedStyle.display === 'none' || userInfo.style.display === 'none')) {
                userInfo.style.display = 'flex'; // Match the inline style intent (align-items: center suggests flex)
                console.log('✅ PROFILE MANAGER: Showing user-info container (was hidden)');
            }
        }
    }
    async setupProfileMenuAndAuraModal() {
        // ROOT CAUSE FIX: Prevent multiple simultaneous calls - but allow retry if promise completed
        // Check if promise exists AND is still pending (not completed)
        if (this.setupProfileMenuAndAuraModalPromise) {
            // Check if promise is already resolved/rejected by trying to access it
            try {
                // If promise exists, wait for it to complete
                console.log('🔧 PROFILE MANAGER: COMP METHOD - setupProfileMenuAndAuraModal already in progress, waiting...');
                await this.setupProfileMenuAndAuraModalPromise;
                // After waiting, check if we still need to proceed (currentUser might be available now)
                const currentUserAfterWait = stateManagerInstance.getState('currentUser');
                if (currentUserAfterWait && currentUserAfterWait.id) {
                    // Promise completed but we should proceed now that currentUser is available
                    // Reset promise and continue
                    this.setupProfileMenuAndAuraModalPromise = null;
                }
                else {
                    // Still no currentUser, exit
                    return;
                }
            }
            catch (error) {
                // Promise rejected, reset and continue
                console.warn('⚠️ PROFILE MANAGER: Previous setupProfileMenuAndAuraModal promise rejected:', error);
                this.setupProfileMenuAndAuraModalPromise = null;
            }
        }
        this.setupProfileMenuAndAuraModalPromise = (async () => {
            try {
                console.log('🔧 PROFILE MANAGER: COMP METHOD - Setting up profile menu and aura modal...');
                // ROOT CAUSE FIX: Get currentUser - if not available, StateManager subscription will trigger update when it arrives
                // NO POLLING - using event-driven architecture (StateManager subscription handles updates)
                let currentUserForAvatar = stateManagerInstance.getState('currentUser');
                if (!currentUserForAvatar || !currentUserForAvatar.id) {
                    console.log('⏳ PROFILE MANAGER: COMP METHOD - currentUser not yet available, will update via StateManager subscription when it arrives');
                    // Don't wait/poll - StateManager subscription (set up in constructor) will trigger update when currentUser arrives
                    // Create fallback avatar for now
                    this.createFallbackAvatar();
                    // ROOT CAUSE FIX: Reset promise before returning early so future calls can proceed
                    // Note: This reset happens inside the promise, so it will be reset in finally block too
                    return; // Exit early, subscription will trigger update when currentUser arrives
                }
                // ROOT CAUSE FIX: Ensure parent container #user-info is visible
                this.ensureUserInfoVisible();
                // Find or create user avatar container
                let userAvatarContainer = document.getElementById('user-avatar-container');
                if (!userAvatarContainer) {
                    console.log('🔧 PROFILE MANAGER: COMP METHOD - Creating user avatar container...');
                    userAvatarContainer = document.createElement('div');
                    userAvatarContainer.id = 'user-avatar-container';
                    userAvatarContainer.className = 'user-avatar-container';
                    userAvatarContainer.style.cssText = `
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 8px;
        background: #f5f5f5;
        margin: 8px;
      `;
                    // Add to sidebar
                    const sidebar = document.querySelector('.sidebar, .sidepanel, #sidebar, #sidepanel') || document.body;
                    sidebar.appendChild(userAvatarContainer);
                }
                else {
                    console.log('🔧 PROFILE MANAGER: COMP METHOD - Found existing user avatar container, updating size for profile avatar...');
                    // Update existing container size to accommodate profile avatar (32px + 2px aura extension on each side)
                    userAvatarContainer.style.width = '36px'; // 32px avatar + 2px aura extension on each side
                    userAvatarContainer.style.height = '36px'; // 32px avatar + 2px aura extension on each side
                    userAvatarContainer.style.minWidth = '36px';
                    userAvatarContainer.style.minHeight = '36px';
                }
                // ROOT CAUSE FIX: Create/update user avatar if:
                // 1. Avatar doesn't exist, OR
                // 2. currentUser is now available and we want to replace fallback with real avatar, OR
                // 3. Avatar exists but auraColor is now available and different (race condition fix)
                let userAvatar = userAvatarContainer.querySelector('.user-avatar');
                // Check if current avatar is a fallback (has specific fallback styling or class)
                const isFallbackAvatar = userAvatar && (userAvatar.classList.contains('fallback-avatar') ||
                    (userAvatar.style && userAvatar.style.backgroundColor === '#007bff') ||
                    !userAvatar.querySelector('img') // Fallback avatars typically don't have img
                );
                // ROOT CAUSE FIX: Check if existing avatar has wrong aura color (white/fallback) and we now have correct color
                let needsAuraColorUpdate = false;
                if (userAvatar && currentUserForAvatar) {
                    const latestCurrentUser = stateManagerInstance.getState('currentUser');
                    const currentAuraColor = latestCurrentUser?.auraColor;
                    if (currentAuraColor &&
                        currentAuraColor !== AVATAR_FALLBACK_COLOR &&
                        currentAuraColor !== '#ffffff' &&
                        currentAuraColor !== 'ffffff') {
                        // Check if existing avatar has white/fallback aura color
                        const existingAuraElement = userAvatar.querySelector('.avatar-aura-background');
                        if (existingAuraElement) {
                            const existingAuraColor = window.getComputedStyle(existingAuraElement).backgroundColor;
                            // If existing aura is white (rgb(255, 255, 255)) and we have a valid color, update it
                            if (existingAuraColor === 'rgb(255, 255, 255)' || existingAuraColor === 'rgba(255, 255, 255, 1)') {
                                needsAuraColorUpdate = true;
                                console.log(`🔄 PROFILE MANAGER: Existing avatar has white aura color, will update with: ${currentAuraColor}`);
                            }
                        }
                    }
                }
                // Should create/update if: no avatar, fallback exists, OR aura color needs update
                const shouldCreateAvatar = !userAvatar || (isFallbackAvatar && currentUserForAvatar && currentUserForAvatar.id) || needsAuraColorUpdate;
                if (shouldCreateAvatar) {
                    console.log('🔧 PROFILE MANAGER: COMP METHOD - Creating/updating user avatar...');
                    // ROOT CAUSE FIX: Use imported AvatarUtils directly (TypeScript import - no need to wait or check window)
                    // AvatarUtils is imported at the top of this file, so it's always available
                    // ROOT CAUSE FIX: Re-check currentUser after waiting
                    if (!currentUserForAvatar) {
                        currentUserForAvatar = stateManagerInstance.getState('currentUser');
                    }
                    if (currentUserForAvatar && currentUserForAvatar.id && typeof AvatarUtils.createUnifiedAvatar === 'function') {
                        try {
                            // ROOT CAUSE FIX: Prioritize stateManager's currentUser.auraColor (most up-to-date from API)
                            let auraColorValue = null;
                            let fromChromeStorage = false;
                            // ROOT CAUSE FIX: Check stateManager FIRST (this is the source of truth after API fetch)
                            // Re-fetch currentUser to ensure we have the latest (it may have been updated by API)
                            const latestCurrentUser = stateManagerInstance.getState('currentUser');
                            if (latestCurrentUser && latestCurrentUser.auraColor) {
                                const auraColor = latestCurrentUser.auraColor.trim();
                                // Only exclude if it's explicitly the fallback color or white variants
                                if (auraColor !== AVATAR_FALLBACK_COLOR &&
                                    auraColor !== '#ffffff' &&
                                    auraColor !== 'ffffff' &&
                                    auraColor !== '#fff' &&
                                    auraColor !== 'fff' &&
                                    auraColor !== 'white' &&
                                    auraColor.length > 0) {
                                    auraColorValue = auraColor;
                                    console.log('🎨 PROFILE MANAGER: Using aura color from stateManager currentUser:', auraColorValue);
                                }
                                else {
                                    console.log(`⚠️ PROFILE MANAGER: stateManager has auraColor but it's fallback/white: ${auraColor}`);
                                }
                            }
                            // ROOT CAUSE FIX: Fallback to getCurrentUserAuraColor() if stateManager doesn't have it
                            if (!auraColorValue) {
                                try {
                                    auraColorValue = await getCurrentUserAuraColor();
                                    if (auraColorValue &&
                                        auraColorValue !== AVATAR_FALLBACK_COLOR &&
                                        auraColorValue !== '#ffffff' &&
                                        auraColorValue !== 'ffffff') {
                                        console.log('🎨 PROFILE MANAGER: Using aura color from getCurrentUserAuraColor():', auraColorValue);
                                        fromChromeStorage = true;
                                    }
                                    else {
                                        console.log(`⚠️ PROFILE MANAGER: getCurrentUserAuraColor() returned fallback/white: ${auraColorValue}`);
                                        auraColorValue = null; // Don't use white/fallback
                                    }
                                }
                                catch (error) {
                                    console.warn('⚠️ PROFILE MANAGER: Error calling getCurrentUserAuraColor():', error);
                                }
                            }
                            // Final fallback to profileData if still no value (but not white/fallback)
                            if (!auraColorValue && this.profileData?.auraColor) {
                                const profileAuraColor = this.profileData.auraColor.trim();
                                if (profileAuraColor !== AVATAR_FALLBACK_COLOR &&
                                    profileAuraColor !== '#ffffff' &&
                                    profileAuraColor !== 'ffffff') {
                                    auraColorValue = profileAuraColor;
                                    console.log('🎨 PROFILE MANAGER: Using aura color from profileData:', auraColorValue);
                                }
                            }
                            // ROOT CAUSE FIX: If still no valid color, check stateManager one more time (it may have been updated)
                            if (!auraColorValue) {
                                const finalCheckUser = stateManagerInstance.getState('currentUser');
                                if (finalCheckUser?.auraColor) {
                                    const finalAuraColor = finalCheckUser.auraColor.trim();
                                    if (finalAuraColor !== AVATAR_FALLBACK_COLOR &&
                                        finalAuraColor !== '#ffffff' &&
                                        finalAuraColor !== 'ffffff' &&
                                        finalAuraColor !== '#fff' &&
                                        finalAuraColor !== 'fff' &&
                                        finalAuraColor !== 'white' &&
                                        finalAuraColor.length > 0) {
                                        auraColorValue = finalAuraColor;
                                        console.log('🎨 PROFILE MANAGER: Using aura color from final stateManager check:', auraColorValue);
                                    }
                                }
                            }
                            // If still no valid color, log warning but don't use white
                            if (!auraColorValue) {
                                console.warn('⚠️ PROFILE MANAGER: No valid aura color found, will use default from AvatarUtils');
                            }
                            // CRITICAL FIX: Use profileData if available (has aura color), otherwise fall back to currentUser
                            // ROOT CAUSE FIX: Ensure auraColorValue is passed to AvatarUtils
                            const fallbackUser = {
                                id: currentUserForAvatar?.id || 'anonymous-user',
                                name: currentUserForAvatar?.name || 'User',
                                email: currentUserForAvatar?.email || 'user@example.com'
                            };
                            const sourceUser = (this.profileData || currentUserForAvatar || fallbackUser);
                            // ROOT CAUSE FIX: Override auraColor in sourceUser if we found a valid one
                            if (auraColorValue) {
                                sourceUser.auraColor = auraColorValue;
                                console.log('🎨 PROFILE MANAGER: Setting auraColor on sourceUser:', auraColorValue);
                            }
                            if (!sourceUser.id) {
                                sourceUser.id = currentUserForAvatar?.id || `user-${Date.now()}`;
                            }
                            // ROOT CAUSE FIX: Map picture to avatarUrl for AvatarUtils compatibility
                            // currentUser has 'picture' property but AvatarUtils expects 'avatarUrl'
                            const pictureValue = currentUserForAvatar?.picture;
                            const profilePictureValue = this.profileData?.picture;
                            const avatarUrlFromPicture = (typeof pictureValue === 'string' ? pictureValue : null) ||
                                (typeof profilePictureValue === 'string' ? profilePictureValue : null) ||
                                this.profileData?.avatarUrl ||
                                (typeof currentUserForAvatar?.avatarUrl === 'string' ? currentUserForAvatar.avatarUrl : null);
                            // ROOT CAUSE FIX: Get final aura color - prioritize auraColorValue, then stateManager, then profileData
                            let finalAuraColor = auraColorValue;
                            if (!finalAuraColor) {
                                const stateUser = stateManagerInstance.getState('currentUser');
                                if (stateUser?.auraColor) {
                                    const stateAura = stateUser.auraColor.trim();
                                    if (stateAura !== AVATAR_FALLBACK_COLOR &&
                                        stateAura !== '#ffffff' &&
                                        stateAura !== 'ffffff' &&
                                        stateAura !== '#fff' &&
                                        stateAura !== 'fff' &&
                                        stateAura !== 'white' &&
                                        stateAura.length > 0) {
                                        finalAuraColor = stateAura;
                                        console.log('🎨 PROFILE MANAGER: Using aura color from stateManager in userDataForAvatar:', finalAuraColor);
                                    }
                                }
                            }
                            if (!finalAuraColor) {
                                finalAuraColor = this.profileData?.auraColor || currentUserForAvatar?.auraColor || undefined;
                            }
                            const userDataForAvatar = {
                                ...sourceUser,
                                avatarUrl: avatarUrlFromPicture || undefined, // ROOT CAUSE FIX: Map picture -> avatarUrl
                                picture: avatarUrlFromPicture || undefined, // Also keep picture for compatibility
                                auraColor: finalAuraColor || undefined // ROOT CAUSE FIX: Use finalAuraColor which includes stateManager check, convert null to undefined
                            };
                            console.log('🔧 PROFILE MANAGER: COMP METHOD - Creating avatar with user data:', {
                                userId: userDataForAvatar.id,
                                auraColor: userDataForAvatar.auraColor,
                                avatarUrl: userDataForAvatar.avatarUrl,
                                usingProfileData: !!this.profileData,
                                fromChromeStorage: fromChromeStorage,
                                timestamp: new Date().toISOString()
                            });
                            // ROOT CAUSE FIX: Ensure availability is set for status dots
                            if (!userDataForAvatar.availability) {
                                // Try to get from currentUser first
                                if (currentUserForAvatar && (currentUserForAvatar.availability || currentUserForAvatar.globalAvailability)) {
                                    userDataForAvatar.availability = currentUserForAvatar.availability || currentUserForAvatar.globalAvailability;
                                }
                                else {
                                    // Try to get from visibility data
                                    const visibilityData = getVisibilityData();
                                    if (visibilityData) {
                                        const currentUserInVisibility = visibilityData.active.find((u) => String(u.id || u.userId) === String(currentUserForAvatar?.id));
                                        if (currentUserInVisibility && currentUserInVisibility.availability) {
                                            userDataForAvatar.availability = currentUserInVisibility.availability;
                                        }
                                    }
                                }
                                // Default to AVAILABLE if active, OFFLINE if not
                                if (!userDataForAvatar.availability) {
                                    userDataForAvatar.availability = (userDataForAvatar.isActive || userDataForAvatar.is_active) ? 'AVAILABLE' : 'OFFLINE';
                                }
                            }
                            // ROOT CAUSE FIX: Use imported AvatarUtils directly (TypeScript import)
                            const avatarHTML = await AvatarUtils.createUnifiedAvatar(userDataForAvatar, 'profile', {
                                showAura: true,
                                showStatus: true, // ROOT CAUSE FIX: Enable status dots on profile avatar
                                size: 32
                            });
                            console.log('🔧 PROFILE MANAGER: COMP METHOD - Avatar HTML generated, updating container at', new Date().toISOString());
                            // ROOT CAUSE FIX: Wrap AvatarUtils HTML in .user-avatar div for consistency with diagnostic expectations
                            // AvatarUtils returns .avatar-container, but we wrap it in .user-avatar for ProfileManager
                            userAvatarContainer.innerHTML = `<div class="user-avatar">${avatarHTML}</div>`;
                            // Log what was actually inserted
                            console.log('🔧 PROFILE MANAGER: COMP METHOD - Container updated, innerHTML length:', userAvatarContainer.innerHTML.length);
                            console.log('🔧 PROFILE MANAGER: COMP METHOD - Container updated, checking for aura element...');
                            const auraElement = userAvatarContainer.querySelector('.avatar-aura');
                            if (auraElement) {
                                console.log('✅ PROFILE MANAGER: COMP METHOD - Aura element found with background:', auraElement.style.backgroundColor);
                            }
                            else {
                                console.log('⚠️ PROFILE MANAGER: COMP METHOD - Aura element NOT found in avatar HTML');
                            }
                            console.log('✅ PROFILE MANAGER: COMP METHOD - User avatar created using AvatarUtils with aura color');
                        }
                        catch (error) {
                            console.error('🔧 PROFILE MANAGER: COMP METHOD - Error creating avatar with AvatarUtils:', error);
                            // Fallback to simple avatar
                            this.createFallbackAvatar();
                        }
                    }
                    else {
                        // ROOT CAUSE FIX: Log detailed diagnostic info
                        console.log('⚠️ PROFILE MANAGER: COMP METHOD - AvatarUtils.createUnifiedAvatar not available or currentUser missing');
                        console.log('   📋 currentUserForAvatar:', currentUserForAvatar ? 'exists' : 'null/undefined');
                        console.log('   📋 currentUserForAvatar.id:', currentUserForAvatar?.id || 'missing');
                        console.log('   📋 AvatarUtils:', typeof AvatarUtils !== 'undefined' ? 'available' : 'undefined');
                        console.log('   📋 AvatarUtils.createUnifiedAvatar:', typeof AvatarUtils?.createUnifiedAvatar === 'function' ? 'function' : typeof AvatarUtils?.createUnifiedAvatar);
                        // Only create fallback if we don't have currentUser - otherwise wait for retry
                        if (!currentUserForAvatar || !currentUserForAvatar.id) {
                            console.log('   ⏳ PROFILE MANAGER: COMP METHOD - currentUser not available yet, will retry when auth completes');
                            // Don't create fallback - wait for handleAuthUIUpdate to retry
                        }
                        else {
                            console.log('   ⚠️ PROFILE MANAGER: COMP METHOD - AvatarUtils issue, using fallback');
                            this.createFallbackAvatar();
                        }
                    }
                }
                else {
                    console.log('🔧 PROFILE MANAGER: COMP METHOD - User avatar already exists, skipping creation');
                }
                // ROOT CAUSE FIX: Remove existing handler if it exists, then add new one
                // Use a data attribute to track if handler is already attached
                if (userAvatarContainer.dataset.clickHandlerAttached === 'true') {
                    // Handler already attached, skip to prevent duplicates
                    console.log('🔧 PROFILE MANAGER: Click handler already attached, skipping');
                    return;
                }
                // ROOT CAUSE FIX: Add click handler with proper event handling
                userAvatarContainer.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('🔧 PROFILE MANAGER: COMP METHOD - Profile avatar clicked');
                    this.toggleUserMenu(e); // Pass event to toggleUserMenu
                });
                // Mark handler as attached
                userAvatarContainer.dataset.clickHandlerAttached = 'true';
                console.log('✅ PROFILE MANAGER: COMP METHOD - Profile menu and aura modal setup complete');
            }
            catch (error) {
                console.error('❌ PROFILE MANAGER: Error in setupProfileMenuAndAuraModal:', error);
                // ROOT CAUSE FIX: Reset promise on error so future calls can proceed
                this.setupProfileMenuAndAuraModalPromise = null;
            }
            finally {
                // ROOT CAUSE FIX: Always reset promise after completion (success or error)
                this.setupProfileMenuAndAuraModalPromise = null;
            }
        })();
        return this.setupProfileMenuAndAuraModalPromise;
    }
    /**
     * COMP METHOD: Toggle user menu
     */
    async toggleUserMenu(e) {
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Toggling user menu...');
        // ROOT CAUSE FIX: Stop event propagation to prevent immediate click-outside handler
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        let userMenu = document.getElementById('user-menu');
        if (!userMenu) {
            console.log('🔧 PROFILE MANAGER: COMP METHOD - Menu not found, creating...');
            await this.createUserMenu();
            userMenu = document.getElementById('user-menu');
        }
        if (userMenu) {
            const isVisible = userMenu.style.display !== 'none' && userMenu.style.display !== '';
            userMenu.style.display = isVisible ? 'none' : 'block';
            // ROOT CAUSE FIX: Ensure menu is positioned correctly
            const userAvatarContainer = document.getElementById('user-avatar-container');
            if (userAvatarContainer && !isVisible) {
                // Menu is being shown - CRITICAL FIX: Re-attach event listeners
                this.addUserMenuEventListeners();
                // Position menu relative to avatar container
                const rect = userAvatarContainer.getBoundingClientRect();
                userMenu.style.position = 'absolute';
                userMenu.style.top = `${rect.height + 4}px`;
                userMenu.style.right = '0';
                userMenu.style.zIndex = '10000';
                // ROOT CAUSE FIX: Add click-outside handler AFTER menu is shown, with longer delay
                // Use requestAnimationFrame to ensure menu is in DOM before adding handler
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        this.addClickOutsideHandler();
                    }, 500); // ROOT CAUSE FIX: Increased delay to 500ms to prevent immediate closing from same click event
                });
            }
            else if (isVisible) {
                // Menu is closing, remove click-outside handler
                if (this.clickOutsideHandler) {
                    document.removeEventListener('click', this.clickOutsideHandler);
                }
            }
            console.log('🔧 PROFILE MANAGER: COMP METHOD - Menu toggled:', !isVisible, 'display:', userMenu.style.display);
        }
        else {
            console.error('❌ PROFILE MANAGER: COMP METHOD - Failed to create or find user menu');
        }
    }
    /**
     * COMP METHOD: Create user menu
     */
    async createUserMenu() {
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Creating user menu...');
        const userMenu = document.createElement('div');
        userMenu.id = 'user-menu';
        userMenu.className = 'user-menu';
        userMenu.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      min-width: 200px;
      display: none;
    `;
        // ROOT CAUSE FIX: Get currentUser from stateManager instead of legacyContext
        const currentUserFromState = stateManagerInstance.getState('currentUser');
        const currentUser = ensureLegacyUser(currentUserFromState);
        // Create small avatar using AvatarUtils if available
        let smallAvatarHTML = '';
        // ROOT CAUSE FIX: Use imported AvatarUtils directly (TypeScript import)
        if (currentUser && typeof AvatarUtils.createUnifiedAvatar === 'function') {
            try {
                smallAvatarHTML = await AvatarUtils.createUnifiedAvatar(currentUser, 'menu', {
                    showAura: true,
                    size: 24
                });
            }
            catch (error) {
                console.error('🔧 PROFILE MANAGER: COMP METHOD - Error creating small avatar:', error);
                const displayNameOrName = currentUser.displayName || currentUser.name || 'U';
                smallAvatarHTML = `<div class="user-avatar-small" style="width: 24px; height: 24px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
          ${displayNameOrName.charAt(0).toUpperCase()}
        </div>`;
            }
        }
        else {
            const displayNameOrName = currentUser.displayName || currentUser.name || 'U';
            smallAvatarHTML = `<div class="user-avatar-small" style="width: 24px; height: 24px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
        ${displayNameOrName.charAt(0).toUpperCase()}
      </div>`;
        }
        userMenu.innerHTML = `
      <div class="user-menu-header" style="padding: 12px; border-bottom: 1px solid #eee;">
        <div class="user-info" style="display: flex; align-items: center; gap: 8px;">
          ${smallAvatarHTML}
          <div>
            <div class="user-name" style="font-weight: bold; font-size: 14px;">${currentUser.displayName || currentUser.name || 'User'}</div>
            <div class="user-id" style="font-size: 12px; color: #666;">${currentUser.id || currentUser.userId}</div>
          </div>
        </div>
      </div>
      <div class="user-menu-actions" style="padding: 8px 0;">
        <button class="menu-action" id="aura-color-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>🎨</span>
          <span>Change Aura Color</span>
        </button>
        <button class="menu-action" id="visibility-settings-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>👁️</span>
          <span>Visibility Settings</span>
        </button>
        <button class="menu-action" id="theme-toggle-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span id="theme-icon-menu">🌙</span>
          <span id="theme-text-menu">Toggle Theme</span>
        </button>
        <button class="menu-action" id="logout-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #d32f2f;">
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    `;
        // ROOT CAUSE FIX: Add to avatar container with proper positioning
        const userAvatarContainer = document.getElementById('user-avatar-container');
        if (userAvatarContainer) {
            // Ensure container has position: relative for absolute positioning
            // ROOT CAUSE FIX: Use window.getComputedStyle instead of legacyContext
            if (window.getComputedStyle(userAvatarContainer).position === 'static') {
                userAvatarContainer.style.position = 'relative';
            }
            userAvatarContainer.appendChild(userMenu);
            // ROOT CAUSE FIX: Position menu correctly
            const rect = userAvatarContainer.getBoundingClientRect();
            userMenu.style.position = 'absolute';
            userMenu.style.top = `${rect.height + 4}px`;
            userMenu.style.right = '0';
            userMenu.style.zIndex = '10000';
        }
        else {
            console.error('❌ PROFILE MANAGER: COMP METHOD - User avatar container not found');
        }
        // Add event listeners
        this.addUserMenuEventListeners();
        // ROOT CAUSE FIX: Add click-outside handler
        this.addClickOutsideHandler();
        // CRITICAL FIX: Initialize theme icon/text based on current theme
        this.updateProfileMenuTheme();
        // FIX: Listen for preference changes to update display name and theme
        // ROOT CAUSE FIX: Get EventBus from window instead of legacyContext
        const win = window;
        if (win.EventBus && typeof win.EventBus === 'object') {
            const eventBus = win.EventBus;
            if (typeof eventBus.on === 'function') {
                eventBus.on('preference:changed', (data) => {
                    if (data.key === 'displayName' || data.key === 'theme') {
                        this.updateUserMenu();
                        if (data.key === 'theme') {
                            this.updateProfileMenuTheme();
                        }
                    }
                });
            }
        }
        // Also listen for native custom events
        document.addEventListener('preferenceChanged', (event) => {
            const detail = event.detail;
            if (detail && (detail.key === 'displayName' || detail.key === 'theme')) {
                this.updateUserMenu();
                if (detail.key === 'theme') {
                    this.updateProfileMenuTheme();
                }
            }
        });
        console.log('✅ PROFILE MANAGER: COMP METHOD - User menu created');
    }
    /**
     * Update profile menu theme icon and text based on current theme
     */
    updateProfileMenuTheme() {
        const currentTheme = document.body.getAttribute('data-theme') ||
            document.documentElement.getAttribute('data-theme') ||
            'light';
        const themeIconMenu = document.getElementById('theme-icon-menu');
        const themeTextMenu = document.getElementById('theme-text-menu');
        if (themeIconMenu) {
            themeIconMenu.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        }
        if (themeTextMenu) {
            themeTextMenu.textContent = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';
        }
    }
    /**
     * ROOT CAUSE FIX: Unified function to update ALL theme UI elements (profile menu AND settings tab)
     * This ensures both toggles stay in sync when theme is changed from either location
     */
    updateAllThemeUI(theme) {
        console.log('🔄 THEME_SYNC: Updating all theme UI elements for theme:', theme);
        // Update DOM
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        // Update profile menu theme icon/text (both IDs)
        const themeIconMenu = document.getElementById('theme-icon-menu');
        const themeTextMenu = document.getElementById('theme-text-menu');
        if (themeIconMenu) {
            themeIconMenu.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        if (themeTextMenu) {
            themeTextMenu.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
        }
        // Update settings tab theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = theme === 'dark';
            // Update slider position via VisibilitySettingsManager if available
            const win = window;
            if (win.visibilitySettingsManager && typeof win.visibilitySettingsManager.updateThemeStatus === 'function') {
                win.visibilitySettingsManager.updateThemeStatus();
            }
        }
        console.log('✅ THEME_SYNC: All theme UI elements updated');
    }
    /**
     * COMP METHOD: Add user menu event listeners
     */
    addUserMenuEventListeners() {
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Adding event listeners...');
        // Aura color button
        const auraColorBtn = document.getElementById('aura-color-btn');
        if (auraColorBtn) {
            auraColorBtn.onclick = (e) => {
                e.preventDefault();
                console.log('🔧 PROFILE MANAGER: COMP METHOD - Aura color button clicked');
                this.hideUserMenu();
                this.showColorPickerModal();
            };
        }
        // Visibility settings button - FIX: Add link to visibility tab
        const visibilitySettingsBtn = document.getElementById('visibility-settings-btn');
        if (visibilitySettingsBtn) {
            // Remove any existing handler to prevent duplicates
            visibilitySettingsBtn.onclick = null;
            visibilitySettingsBtn.removeEventListener('click', this.visibilitySettingsHandler);
            // Create handler function
            this.visibilitySettingsHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 PROFILE MANAGER: COMP METHOD - Visibility settings button clicked');
                this.hideUserMenu();
                // FIX: Switch to visibility tab - try multiple methods for reliability
                let switched = false;
                // ROOT CAUSE FIX: Switch to settings tab (not visibility tab)
                // Method 1: Try button click
                const selectors = [
                    'button[data-tab="settings-tab"]',
                    '.main-nav-tab[data-tab="settings-tab"]',
                    'button[aria-controls="settings-tab"]',
                    '[data-tab="settings-tab"]',
                    '.nav-tab[data-tab="settings-tab"]'
                ];
                for (const selector of selectors) {
                    const button = document.querySelector(selector);
                    if (button) {
                        button.click();
                        console.log(`✅ PROFILE MANAGER: Switched to settings tab via selector: ${selector}`);
                        switched = true;
                        break;
                    }
                }
                // Method 2: Direct tab activation if button click didn't work
                if (!switched) {
                    const settingsTab = document.getElementById('settings-tab');
                    const allTabs = document.querySelectorAll('.main-tab-content');
                    const allTabButtons = document.querySelectorAll('.main-nav-tab, button[data-tab]');
                    if (settingsTab) {
                        // Hide all tabs
                        allTabs.forEach(tab => tab.classList.remove('active'));
                        // Show settings tab
                        settingsTab.classList.add('active');
                        // Update button states
                        allTabButtons.forEach(btn => {
                            btn.classList.remove('active');
                            if (btn.getAttribute('data-tab') === 'settings-tab' || btn.getAttribute('aria-controls') === 'settings-tab') {
                                btn.classList.add('active');
                            }
                        });
                        console.log('✅ PROFILE MANAGER: Directly activated settings tab');
                        switched = true;
                    }
                }
                // Method 3: Dispatch custom event as last resort
                if (!switched) {
                    const tabSwitchEvent = new CustomEvent('tabSwitch', { detail: { tabId: 'settings-tab' } });
                    legacyContext.dispatchEvent(tabSwitchEvent);
                    console.log('✅ PROFILE MANAGER: Dispatched tab switch event for settings tab');
                }
                // CRITICAL FIX: Ensure event listeners are attached when settings tab opens
                setTimeout(async () => {
                    // ROOT CAUSE FIX: Ensure VisibilitySettingsManager event listeners are attached
                    // Use dynamic import with type assertion (ES6 module pattern)
                    try {
                        // @ts-ignore - Dynamic import of JS module without type declarations
                        const module = await import('../../extension/features/VisibilitySettingsManager.js');
                        const visibilitySettingsManager = module?.visibilitySettingsManagerInstance;
                        if (visibilitySettingsManager && typeof visibilitySettingsManager.ensureEventListeners === 'function') {
                            await visibilitySettingsManager.ensureEventListeners();
                            console.log('✅ PROFILE MANAGER: Ensured visibility settings event listeners after tab switch');
                        }
                        else {
                            console.warn('⚠️ PROFILE MANAGER: visibilitySettingsManagerInstance not available or ensureEventListeners not a function');
                        }
                    }
                    catch (error) {
                        console.warn('⚠️ PROFILE MANAGER: Failed to import VisibilitySettingsManager:', error);
                    }
                }, 100);
            };
            // Attach handler
            visibilitySettingsBtn.addEventListener('click', this.visibilitySettingsHandler);
            visibilitySettingsBtn.dataset.handlerAttached = 'true';
            // ROOT CAUSE FIX: Ensure button is active and clickable
            visibilitySettingsBtn.style.pointerEvents = 'auto';
            visibilitySettingsBtn.style.cursor = 'pointer';
            visibilitySettingsBtn.style.opacity = '1';
            visibilitySettingsBtn.disabled = false;
            console.log('✅ PROFILE MANAGER: Visibility settings button handler added and activated');
        }
        else {
            console.warn('⚠️ PROFILE MANAGER: Visibility settings button not found in DOM');
        }
        // Theme toggle button - CRITICAL FIX: Ensure button is clickable and handler is attached
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            // Remove any existing handlers first
            themeToggleBtn.onclick = null;
            themeToggleBtn.removeEventListener('click', this.themeToggleHandler);
            // Create handler function
            this.themeToggleHandler = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 PROFILE MANAGER: COMP METHOD - Theme toggle button clicked');
                console.log('🔍 DIAGNOSTIC: Profile menu theme toggle clicked');
                const beforeTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
                console.log('🔍 DIAGNOSTIC: Theme before toggle:', beforeTheme);
                await this.toggleTheme();
                const afterTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
                console.log('🔍 DIAGNOSTIC: Theme after toggle:', afterTheme);
                console.log('🔍 DIAGNOSTIC: Theme changed:', beforeTheme !== afterTheme ? 'YES ✅' : 'NO ❌');
                // CRITICAL: Close profile menu after theme toggle
                this.hideUserMenu();
            };
            // Attach handler
            themeToggleBtn.addEventListener('click', this.themeToggleHandler);
            // Mark as handled to prevent duplicate handlers
            themeToggleBtn.dataset.handlerAttached = 'true';
            // Ensure button is active and clickable
            themeToggleBtn.style.pointerEvents = 'auto';
            themeToggleBtn.style.cursor = 'pointer';
            themeToggleBtn.style.opacity = '1';
            themeToggleBtn.style.visibility = 'visible';
            themeToggleBtn.disabled = false;
            console.log('✅ PROFILE MANAGER: Theme toggle button handler attached and activated');
        }
        else {
            console.warn('❌ PROFILE MANAGER: Theme toggle button not found');
        }
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                console.log('🔧 PROFILE MANAGER: COMP METHOD - Logout button clicked');
                this.hideUserMenu();
                this.performLogout();
            };
        }
        console.log('✅ PROFILE MANAGER: COMP METHOD - Event listeners added');
    }
    /**
     * COMP METHOD: Hide user menu
     */
    hideUserMenu() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.style.display = 'none';
            console.log('🔧 PROFILE MANAGER: COMP METHOD - User menu hidden');
        }
    }
    /**
     * ROOT CAUSE FIX: Add click-outside handler to close menu
     */
    addClickOutsideHandler() {
        // Remove existing handler if any
        if (this.clickOutsideHandler) {
            document.removeEventListener('click', this.clickOutsideHandler);
            this.clickOutsideHandler = undefined;
        }
        // Create new handler
        this.clickOutsideHandler = (e) => {
            const userAvatarContainer = document.getElementById('user-avatar-container');
            const userMenu = document.getElementById('user-menu');
            const target = e.target;
            if (userAvatarContainer && userMenu && target && userMenu.style.display !== 'none') {
                // Check if click is outside both avatar container and menu
                if (!userAvatarContainer.contains(target) && !userMenu.contains(target)) {
                    console.log('🔧 PROFILE MANAGER: Click outside detected, hiding menu');
                    userMenu.style.display = 'none';
                    // Remove handler when menu closes
                    if (this.clickOutsideHandler) {
                        document.removeEventListener('click', this.clickOutsideHandler);
                        this.clickOutsideHandler = undefined;
                    }
                }
            }
        };
        // Add listener with delay to prevent immediate closing from the click that opened the menu
        setTimeout(() => {
            if (this.clickOutsideHandler) {
                document.addEventListener('click', this.clickOutsideHandler, true); // Use capture phase
            }
        }, 300); // Increased delay to ensure menu is fully rendered
    }
    /**
     * COMP METHOD: Show color picker modal
     */
    async showColorPickerModal() {
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Showing color picker modal...');
        // Check if modal already exists
        let modal = document.getElementById('color-picker-modal');
        if (modal) {
            modal.style.display = 'flex';
            return;
        }
        // Create modal
        modal = document.createElement('div');
        modal.id = 'color-picker-modal';
        modal.className = 'color-picker-modal';
        modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
        // COMP METHOD: Get current user's aura color (Chrome storage first, then database)
        const currentAuraColor = await getCurrentUserAuraColor();
        const currentColorHex = currentAuraColor ? currentAuraColor.replace('#', '') : '';
        const displayColor = currentAuraColor || AVATAR_FALLBACK_COLOR;
        console.log('🔧 AURA_MODAL: Current database aura color:', currentAuraColor);
        console.log('🔧 AURA_MODAL: Using color for modal:', displayColor);
        modal.innerHTML = `
      <div class="color-picker-content" style="background: white; border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
        <div class="color-picker-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Change Aura Color</h3>
          <button id="color-picker-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
        </div>
        <div class="color-picker-input-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Hex Color (without #):</label>
          <input type="text" id="color-input" placeholder="${currentColorHex}" value="${currentColorHex}" maxlength="6" 
                 style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;">
        </div>
        <div class="color-picker-preview" style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px;">
          <div id="color-preview-circle" style="width: 40px; height: 40px; border-radius: 50%; background: ${displayColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">D</div>
          <div id="color-preview-text" style="font-weight: 500;">Current: ${displayColor}</div>
        </div>
        <div class="color-picker-buttons" style="display: flex; gap: 12px;">
          <button id="color-picker-reset" style="flex: 1; padding: 12px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">Reset to Default</button>
          <button id="color-picker-save" style="flex: 1; padding: 12px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer;">Save Color</button>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
        // Add event listeners
        this.addColorPickerEventListeners();
        console.log('✅ PROFILE MANAGER: COMP METHOD - Color picker modal created');
    }
    /**
     * COMP METHOD: Add color picker event listeners
     */
    addColorPickerEventListeners() {
        const colorInput = document.getElementById('color-input');
        const previewCircle = document.getElementById('color-preview-circle');
        const previewText = document.getElementById('color-preview-text');
        const closeBtn = document.getElementById('color-picker-close');
        const resetBtn = document.getElementById('color-picker-reset');
        const saveBtn = document.getElementById('color-picker-save');
        const modal = document.getElementById('color-picker-modal');
        // Color input handler
        if (colorInput && previewCircle && previewText) {
            colorInput.oninput = (e) => {
                const input = e.target;
                const color = input.value;
                if (color.length === 6) {
                    previewCircle.style.background = '#' + color;
                    previewText.textContent = 'Preview';
                }
            };
        }
        // Close button
        if (closeBtn && modal) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
        // Reset button
        if (resetBtn && colorInput && previewCircle && previewText) {
            resetBtn.onclick = async () => {
                const currentColor = await getCurrentUserAuraColor();
                if (!currentColor)
                    return;
                const currentHex = currentColor.replace('#', '');
                colorInput.value = currentHex;
                previewCircle.style.background = currentColor;
                previewText.textContent = `Current: ${currentColor}`;
            };
        }
        // Save button
        if (saveBtn && colorInput && modal) {
            saveBtn.onclick = async () => {
                const color = colorInput.value;
                if (color.length === 6) {
                    const colorHex = '#' + color;
                    console.log('🔧 PROFILE MANAGER: COMP METHOD - Saving aura color:', colorHex);
                    // ROOT CAUSE FIX: Update BOTH Chrome storage AND database
                    await updateAuraColorEverywhere(colorHex);
                    modal.style.display = 'none';
                }
                else {
                    alert('Please enter a valid 6-digit hex color');
                }
            };
        }
        // Click outside to close
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            };
        }
    }
    /**
     * COMP METHOD: Toggle theme
     */
    async toggleTheme() {
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Toggling theme');
        // Get current theme from DOM or storage
        // ROOT CAUSE FIX: getCurrentUserTheme is defined in this file, use it directly
        const currentThemeGetter = typeof getCurrentUserTheme === 'function'
            ? getCurrentUserTheme
            : undefined;
        // CRITICAL FIX: Get UserPreferencesManager first, then get theme
        const userPreferencesManager = getUserPreferencesManager();
        // CRITICAL FIX: Get theme from UserPreferencesManager first, then DOM, then default
        let currentTheme = 'light';
        if (userPreferencesManager && userPreferencesManager.isInitialized && typeof userPreferencesManager.getPreference === 'function') {
            const storedTheme = await userPreferencesManager.getPreference('theme');
            if (storedTheme === 'dark' || storedTheme === 'light') {
                currentTheme = storedTheme;
            }
        }
        // Fallback to DOM if UserPreferencesManager doesn't have it
        if (currentTheme === 'light') {
            const domTheme = document.body.getAttribute('data-theme') ||
                document.documentElement.getAttribute('data-theme');
            if (domTheme === 'dark' || domTheme === 'light') {
                currentTheme = domTheme;
            }
        }
        // Only toggle if we have a valid current theme
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        console.log('🔧 PROFILE MANAGER: Current theme:', currentTheme, 'New theme:', newTheme);
        console.log('🔍 DIAGNOSTIC: UserPreferencesManager available:', !!userPreferencesManager);
        console.log('🔍 DIAGNOSTIC: UserPreferencesManager initialized:', userPreferencesManager?.isInitialized);
        // CRITICAL FIX: Use UserPreferencesManager (unified preference system) - ensure it saves to both Chrome storage and database
        if (userPreferencesManager && userPreferencesManager.isInitialized && typeof userPreferencesManager.savePreference === 'function') {
            console.log('✅ PROFILE MANAGER: Using UserPreferencesManager to toggle theme');
            // FIX: Save immediately (not batched) to ensure database save happens right away
            const saved = await userPreferencesManager.savePreference('theme', newTheme, { batch: false });
            console.log('🔍 DIAGNOSTIC: UserPreferencesManager savePreference result:', saved);
            // Verify it was saved to Chrome storage
            const chromeStorage = await getChromeStorage(['theme']);
            console.log('🔍 DIAGNOSTIC: Theme in Chrome storage after save:', chromeStorage.theme);
            console.log('✅ PROFILE MANAGER: Theme saved via UserPreferencesManager:', newTheme);
            // ROOT CAUSE FIX: Update ALL theme UI elements (profile menu AND settings tab) to keep them in sync
            this.updateAllThemeUI(newTheme);
            console.log('✅ PROFILE MANAGER: All theme UI elements updated (profile menu + settings tab)');
        }
        else if (typeof updateThemeEverywhere === 'function') {
            // ROOT CAUSE FIX: updateThemeEverywhere is defined in this file, use it directly
            console.log('⚠️ PROFILE MANAGER: UserPreferencesManager not available, using updateThemeEverywhere fallback');
            await updateThemeEverywhere(newTheme);
        }
        else {
            // Fallback: Update manually if function not available
            console.warn('⚠️ PROFILE MANAGER: updateThemeEverywhere not available, using fallback');
            // Update profile menu icon and text after theme change
            const themeIconMenu = document.getElementById('theme-icon-menu');
            const themeTextMenu = document.getElementById('theme-text-menu');
            if (themeIconMenu) {
                themeIconMenu.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            }
            if (themeTextMenu) {
                themeTextMenu.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
            }
            // Update DOM immediately
            document.documentElement.setAttribute('data-theme', newTheme);
            document.body.setAttribute('data-theme', newTheme);
            if (themeIconMenu) {
                themeIconMenu.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            }
            if (themeTextMenu) {
                themeTextMenu.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
            }
            // Update settings tab theme toggle if it exists
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.checked = newTheme === 'dark';
            }
            // Update Chrome storage
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                await setChromeStorage({ theme: newTheme, userTheme: newTheme });
            }
            // ROOT CAUSE FIX: Removed localStorage - we only use Chrome storage and database
            // Update database
            const apiForTheme = getApi();
            // ROOT CAUSE FIX: Get currentUser from stateManager instead of legacyContext
            const currentUserForTheme = stateManagerInstance.getState('currentUser');
            if (currentUserForTheme && currentUserForTheme.id && apiForTheme) {
                try {
                    await apiForTheme.request(`/v1/users/${currentUserForTheme.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            theme: newTheme
                        })
                    });
                    console.log('✅ PROFILE MANAGER: Theme saved to database:', newTheme);
                    // Update stateManager with new theme
                    stateManagerInstance.setState('currentUser', { ...currentUserForTheme, theme: newTheme });
                }
                catch (error) {
                    console.error('❌ PROFILE MANAGER: Error saving theme to database:', error);
                }
            }
            console.log(`✅ PROFILE MANAGER: Switched to ${newTheme} theme`);
        }
    }
    /**
     * COMP METHOD: Perform logout
     */
    performLogout() {
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Performing logout');
        try {
            // ROOT CAUSE FIX: Clear currentUser in stateManager instead of legacyContext
            stateManagerInstance.setState('currentUser', null);
            stateManagerInstance.setState('supabaseUser', null);
            // Clear storage
            if (chrome?.storage?.local?.clear) {
                chrome.storage.local.clear();
            }
            // Reload the extension
            // ROOT CAUSE FIX: Use window.location instead of legacyContext
            window.location.reload();
            console.log('✅ PROFILE MANAGER: COMP METHOD - Logout completed');
        }
        catch (error) {
            console.error('❌ PROFILE MANAGER: COMP METHOD - Error during logout:', error);
        }
    }
    /**
     * Handle user profile updates
     */
    async handleUserUpdate(user) {
        console.log('User profile updated', user);
        // SD1 CRITICAL DEBUG: Log what user data is being set for profile avatar
        console.log('🔍 SD1 PROFILE DEBUG: === PROFILE MANAGER USER UPDATE ===');
        console.log('🔍 SD1 PROFILE DEBUG: User email:', user?.email);
        console.log('🔍 SD1 PROFILE DEBUG: User name:', user?.name);
        console.log('🔍 SD1 PROFILE DEBUG: User avatarUrl:', user?.avatarUrl);
        console.log('🔍 SD1 PROFILE DEBUG: User auraColor (before fetch):', user?.auraColor);
        console.log('🔍 SD1 PROFILE DEBUG: Full user object:', user);
        console.log('🔍 SD1 PROFILE DEBUG: === END PROFILE MANAGER USER UPDATE ===');
        this.profileData = user;
        // ROOT CAUSE FIX: Sync Chrome storage with database when user updates
        // Note: syncStorageWithDatabase should be imported from proper module if needed
        const win = window;
        if (win.syncStorageWithDatabase && typeof win.syncStorageWithDatabase === 'function') {
            win.syncStorageWithDatabase().catch((err) => {
                console.warn('⚠️ PROFILE_MANAGER: Error syncing storage with database:', err);
            });
        }
        // CRITICAL: Ensure we have auraColor for profile avatar
        // First priority: from user object (if included in update)
        if (this.profileData && this.profileData.auraColor) {
            console.log('✅ PROFILE_MANAGER: Using auraColor from user object:', this.profileData.auraColor);
        }
        // Second priority: from stateManager currentUser (should have been set during auth)
        // ROOT CAUSE FIX: Get currentUser from stateManager instead of legacyContext
        const currentUserForAura = stateManagerInstance.getState('currentUser');
        if (currentUserForAura?.auraColor) {
            if (this.profileData) {
                this.profileData.auraColor = currentUserForAura.auraColor;
                console.log('✅ PROFILE_MANAGER: Using auraColor from stateManager currentUser:', currentUserForAura.auraColor);
            }
        }
        // Third priority: fetch from API if user ID is available
        else if (this.profileData && this.profileData.id) {
            const api = ensureApi('fetch auraColor for profileData');
            if (api) {
                console.log('🔍 PROFILE_MANAGER: Fetching auraColor from API for user:', this.profileData.id);
                try {
                    const userResponse = await api.request(`/v1/users/${this.profileData.id}`, {
                        method: 'GET'
                    });
                    if (userResponse && typeof userResponse === 'object' && 'auraColor' in userResponse) {
                        const auraColor = typeof userResponse.auraColor === 'string' ? userResponse.auraColor : undefined;
                        if (auraColor && this.profileData) {
                            this.profileData.auraColor = auraColor;
                            // ROOT CAUSE FIX: Also update stateManager currentUser for consistency
                            const currentUserForUpdate = stateManagerInstance.getState('currentUser');
                            if (currentUserForUpdate) {
                                stateManagerInstance.setState('currentUser', { ...currentUserForUpdate, auraColor });
                            }
                            console.log('✅ PROFILE_MANAGER: Fetched auraColor from API:', auraColor);
                        }
                        else {
                            console.log('ℹ️ PROFILE_MANAGER: No auraColor found in API response');
                        }
                    }
                }
                catch (error) {
                    console.warn('⚠️ PROFILE_MANAGER: Failed to fetch auraColor from API:', error);
                }
            }
        }
        else {
            console.log('ℹ️ PROFILE_MANAGER: No auraColor available yet (may be set later)');
        }
        this.updateProfileUI();
        // Notify callbacks
        this.updateCallbacks.forEach(callback => {
            try {
                callback(user);
            }
            catch (error) {
                console.error('Profile callback error', error, 'profile');
            }
        });
    }
    /**
     * Handle avatar updates
     */
    async handleAvatarUpdate(avatarData) {
        console.log('Avatar updated', avatarData);
        if (this.profileData) {
            this.profileData.avatarUrl = avatarData.avatarUrl;
            this.profileData.avatarSource = avatarData.source;
            await this.updateUserAvatar();
        }
    }
    /**
     * Handle aura color updates
     */
    async handleAuraColorUpdate(auraData) {
        console.log('🔧 PROFILE_MANAGER: Handling aura color update:', auraData);
        const color = auraData.color || auraData.auraColor;
        const user = auraData.user;
        // Update profile data if it's the current user
        if (this.profileData && user && (this.profileData.id === user.id || this.profileData.id === user.userId)) {
            this.profileData.auraColor = color;
            console.log('🔧 PROFILE_MANAGER: Updated profile data aura color:', color);
            // Refresh the profile avatar with the new aura color
            await this.updateUserAvatar();
        }
    }
    /**
     * Handle authentication UI updates
     */
    async handleAuthUIUpdate(authData) {
        console.log('🔧 PROFILE_MANAGER: Handling auth UI update:', authData?.isAuthenticated);
        if (authData.isAuthenticated && authData.user) {
            // SD1 CRITICAL DEBUG: Log what user data is being set for profile avatar
            console.log('🔍 SD1 PROFILE DEBUG: === PROFILE MANAGER AUTH UPDATE ===');
            console.log('🔍 SD1 PROFILE DEBUG: Auth user email:', authData.user?.email);
            console.log('🔍 SD1 PROFILE DEBUG: Auth user name:', authData.user?.name);
            console.log('🔍 SD1 PROFILE DEBUG: Auth user avatarUrl:', authData.user?.avatarUrl);
            console.log('🔍 SD1 PROFILE DEBUG: Auth user auraColor (before fetch):', authData.user?.auraColor);
            console.log('🔍 SD1 PROFILE DEBUG: Full auth user object:', authData.user);
            console.log('🔍 SD1 PROFILE DEBUG: === END PROFILE MANAGER AUTH UPDATE ===');
            this.profileData = authData.user;
            // CRITICAL: Ensure we have auraColor for profile avatar
            // First priority: from authData.user (if included in auth response)
            if (this.profileData && this.profileData.auraColor) {
                console.log('✅ PROFILE_MANAGER: Using auraColor from authData.user:', this.profileData.auraColor);
            }
            // Second priority: from stateManager (TypeScript migration - no legacyContext.currentUser)
            else if (this.profileData) {
                const currentUserFromState = stateManagerInstance.getState('currentUser');
                if (currentUserFromState?.auraColor) {
                    this.profileData.auraColor = currentUserFromState.auraColor;
                    console.log('✅ PROFILE_MANAGER: Using auraColor from stateManager:', currentUserFromState.auraColor);
                }
                // Third priority: fetch from API if user ID is available
                else if (this.profileData.id) {
                    const api = ensureApi('fetch auraColor after auth');
                    if (api) {
                        console.log('🔍 PROFILE_MANAGER: Fetching auraColor from API for user:', this.profileData.id);
                        try {
                            const userResponse = await api.request(`/v1/users/${this.profileData.id}`, {
                                method: 'GET'
                            });
                            if (userResponse && typeof userResponse === 'object' && 'auraColor' in userResponse && this.profileData) {
                                const auraColor = typeof userResponse.auraColor === 'string' ? userResponse.auraColor : undefined;
                                if (auraColor) {
                                    this.profileData.auraColor = auraColor;
                                    // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no legacyContext.currentUser)
                                    const currentUserForAura = stateManagerInstance.getState('currentUser');
                                    if (currentUserForAura) {
                                        stateManagerInstance.setState('currentUser', { ...currentUserForAura, auraColor: auraColor });
                                    }
                                    console.log('✅ PROFILE_MANAGER: Fetched auraColor from API:', auraColor);
                                }
                                else {
                                    console.log('ℹ️ PROFILE_MANAGER: No auraColor found in API response');
                                }
                            }
                        }
                        catch (error) {
                            console.warn('⚠️ PROFILE_MANAGER: Failed to fetch auraColor from API:', error);
                        }
                    }
                }
                else {
                    console.log('ℹ️ PROFILE_MANAGER: No auraColor available yet (may be set later)');
                }
            }
            // If authentication just completed, we need to initialize the profile avatar
            if (!this.isAuthenticated) {
                console.log('🔧 PROFILE_MANAGER: Authentication completed, initializing profile avatar...');
                this.isAuthenticated = true;
                // ROOT CAUSE FIX: Initialize UserPreferencesManager FIRST (before avatar) to ensure theme is loaded correctly
                await this.initializeUserPreferencesManager(authData.user);
                // ROOT CAUSE FIX: Force avatar recreation by calling setupProfileMenuAndAuraModal directly
                // This ensures avatar is created even if it was skipped earlier due to missing currentUser
                await this.setupProfileMenuAndAuraModal();
                await this.initializeProfileAvatar();
            }
            else {
                // ROOT CAUSE FIX: If already authenticated but user data updated, refresh avatar
                console.log('🔧 PROFILE_MANAGER: User data updated, refreshing profile avatar...');
                // ROOT CAUSE FIX: Ensure UserPreferencesManager is initialized even if already authenticated
                await this.initializeUserPreferencesManager(authData.user);
                await this.setupProfileMenuAndAuraModal(); // This will update existing avatar if currentUser is now available
                this.updateProfileUI();
            }
        }
        else {
            this.clearProfileUI();
        }
    }
    /**
     * Update profile UI with current user data
     */
    async updateProfileUI() {
        if (!this.profileData) {
            console.warn('No profile data available for UI update', null, 'profile');
            return;
        }
        console.log('Updating profile UI', {
            user: this.profileData.email,
            hasAvatar: !!this.profileData.avatarUrl,
            auraColor: this.profileData.auraColor
        });
        try {
            this.updateUserInfo();
            await this.updateUserAvatar(); // CRITICAL: Wait for avatar update to complete
            this.updateUserMenu();
        }
        catch (error) {
            console.error('Profile UI update failed', error, 'profile');
        }
    }
    /**
     * Update user information display
     */
    updateUserInfo() {
        const userInfoDiv = document.getElementById('user-info');
        const userMenuName = document.getElementById('user-menu-name');
        if (userInfoDiv) {
            userInfoDiv.style.display = 'flex';
        }
        if (userMenuName && this.profileData) {
            // FIX: Use displayName first, fallback to name, then email
            const displayName = this.profileData.displayName || this.profileData.name || this.profileData.email || 'User';
            userMenuName.textContent = displayName;
        }
    }
    /**
     * Update user avatar display
     */
    async updateUserAvatar() {
        console.log('🔧 PROFILE_MANAGER: updateUserAvatar called at', new Date().toISOString());
        const userAvatarContainer = document.getElementById('user-avatar-container');
        if (!userAvatarContainer) {
            console.warn('User avatar container not found', null, 'profile');
            return;
        }
        console.log('🔧 PROFILE_MANAGER: Updating user avatar with data:', {
            avatarUrl: this.profileData?.avatarUrl,
            auraColor: this.profileData?.auraColor,
            profileDataId: this.profileData?.id,
            timestamp: new Date().toISOString()
        });
        // ROOT CAUSE FIX: Use getCurrentUserAuraColor() for latest aura color (prioritizes Chrome storage, then database)
        let auraColorValue = null;
        if (typeof legacyContext.getCurrentUserAuraColor === 'function') {
            try {
                auraColorValue = await legacyContext.getCurrentUserAuraColor();
                console.log('🎨 PROFILE_MANAGER: Got aura color from getCurrentUserAuraColor():', auraColorValue);
            }
            catch (error) {
                console.warn('⚠️ PROFILE_MANAGER: Error calling getCurrentUserAuraColor():', error);
            }
        }
        // Fallback to profileData if getCurrentUserAuraColor not available
        if (!auraColorValue) {
            auraColorValue = this.profileData?.auraColor;
        }
        // CRITICAL FIX: Check Chrome storage FIRST for instant display (persists across sessions)
        if (!auraColorValue && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            try {
                const storageResult = await getChromeStorage(['userAuraColor', 'auraColor']);
                const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
                if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'white' && cachedAuraColor !== '#fff') {
                    auraColorValue = cachedAuraColor;
                    console.log('🎨 PROFILE_MANAGER: Using aura color from Chrome storage (CACHE):', auraColorValue);
                }
            }
            catch (error) {
                console.warn('⚠️ PROFILE_MANAGER: Could not read from Chrome storage:', error);
            }
        }
        // CRITICAL FIX: Check pre-render data as SECONDARY source (database value)
        if (!auraColorValue && legacyContext.preRenderInitializer?.getPreRenderData) {
            const preRenderData = legacyContext.preRenderInitializer.getPreRenderData();
            if (preRenderData.auraColor) {
                auraColorValue = preRenderData.auraColor;
                console.log('🎨 PROFILE_MANAGER: Using aura color from pre-render data (DATABASE):', auraColorValue);
                // CRITICAL FIX: Cache database value in Chrome storage for next time
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    try {
                        await setChromeStorage({ userAuraColor: auraColorValue, auraColor: auraColorValue });
                        console.log('💾 PROFILE_MANAGER: Cached aura color in Chrome storage:', auraColorValue);
                    }
                    catch (error) {
                        console.warn('⚠️ PROFILE_MANAGER: Could not cache to Chrome storage:', error);
                    }
                }
            }
        }
        // ROOT CAUSE FIX: Fallback to stateManager currentUser if pre-render data not available
        if (!auraColorValue) {
            const currentUserForAura = stateManagerInstance.getState('currentUser');
            if (currentUserForAura?.auraColor) {
                auraColorValue = currentUserForAura.auraColor;
                console.log('✅ PROFILE_MANAGER: Using auraColor from stateManager currentUser:', auraColorValue);
            }
        }
        // CRITICAL FIX: Resolve Promise if auraColor is a Promise
        if (auraColorValue && typeof auraColorValue === 'object' && typeof auraColorValue.then === 'function') {
            console.log('🔧 PROFILE_MANAGER: auraColor is a Promise, awaiting resolution...');
            try {
                auraColorValue = await auraColorValue;
                console.log(`✅ PROFILE_MANAGER: Resolved auraColor Promise: ${auraColorValue}`);
            }
            catch (e) {
                console.warn(`⚠️ PROFILE_MANAGER: Error resolving auraColor Promise:`, e);
                auraColorValue = null; // Treat as missing, will fetch from API
            }
        }
        // CRITICAL FIX: Validate auraColor - treat #ffffff as missing
        if (auraColorValue === '#ffffff' || auraColorValue === 'white' || auraColorValue === '#fff') {
            console.log('⚠️ PROFILE_MANAGER: auraColor is fallback white, treating as missing (will fetch from API)');
            auraColorValue = null;
        }
        // CRITICAL FIX: Fetch from API if still missing
        if (!auraColorValue && this.profileData && this.profileData.id) {
            const api = ensureApi('fetch auraColor for profile avatar');
            if (api) {
                console.log('🔍 PROFILE_MANAGER: Fetching auraColor from API for profile avatar...');
                try {
                    const userResponse = await api.request(`/v1/users/${this.profileData.id}`, {
                        method: 'GET'
                    });
                    if (userResponse && typeof userResponse === 'object' && 'auraColor' in userResponse) {
                        const apiAuraColor = typeof userResponse.auraColor === 'string' ? userResponse.auraColor : undefined;
                        if (apiAuraColor) {
                            // Validate API response - treat #ffffff as missing
                            if (apiAuraColor !== '#ffffff' && apiAuraColor !== 'white' && apiAuraColor !== '#fff' && this.profileData) {
                                auraColorValue = apiAuraColor;
                                this.profileData.auraColor = apiAuraColor;
                                // Update legacyContext.currentUser for consistency
                                if (legacyContext.currentUser) {
                                    legacyContext.currentUser.auraColor = apiAuraColor;
                                }
                                // CRITICAL FIX: Cache API value in Chrome storage for instant display next time
                                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                                    try {
                                        await setChromeStorage({ userAuraColor: apiAuraColor, auraColor: apiAuraColor });
                                        console.log('💾 PROFILE_MANAGER: Cached API aura color in Chrome storage:', apiAuraColor);
                                    }
                                    catch (error) {
                                        console.warn('⚠️ PROFILE_MANAGER: Could not cache API value to Chrome storage:', error);
                                    }
                                }
                                console.log('✅ PROFILE_MANAGER: Fetched auraColor from API for profile avatar:', apiAuraColor);
                            }
                            else {
                                console.log('⚠️ PROFILE_MANAGER: API returned fallback white, treating as missing');
                            }
                        }
                    }
                }
                catch (error) {
                    console.warn('⚠️ PROFILE_MANAGER: Could not fetch auraColor from API for profile avatar:', error);
                }
            }
        }
        // Update profileData with resolved value
        if (auraColorValue && this.profileData) {
            this.profileData.auraColor = auraColorValue;
        }
        if (!this.profileData) {
            console.warn('Cannot update avatar: no profile data');
            return;
        }
        try {
            // Use AvatarUtils for consistent avatar creation
            // CRITICAL FIX: Create user object with resolved auraColor value
            // ROOT CAUSE FIX: Map picture to avatarUrl for AvatarUtils compatibility
            const pictureValue = this.profileData.picture;
            const pictureUrl = (typeof pictureValue === 'string' ? pictureValue : null) || this.profileData.avatarUrl || undefined;
            const userForAvatar = {
                ...this.profileData,
                avatarUrl: pictureUrl, // ROOT CAUSE FIX: Map picture -> avatarUrl
                picture: pictureUrl, // Also keep picture for compatibility
                auraColor: auraColorValue || this.profileData.auraColor
            };
            // ROOT CAUSE FIX: Use imported AvatarUtils directly (TypeScript import)
            if (typeof AvatarUtils.createUnifiedAvatar === 'function') {
                console.log('🔧 PROFILE_MANAGER: Calling AvatarUtils.createUnifiedAvatar with:', {
                    userId: userForAvatar.id,
                    auraColor: userForAvatar.auraColor,
                    avatarUrl: userForAvatar.avatarUrl,
                    source: auraColorValue ? 'resolved' : 'profileData'
                });
                // ROOT CAUSE FIX: Ensure availability is set for status dots
                // ROOT CAUSE FIX: Prioritize stateManager currentUser.availability/globalAvailability (most up-to-date)
                const currentUserForAvailability = stateManagerInstance.getState('currentUser');
                if (currentUserForAvailability && String(currentUserForAvailability.id || currentUserForAvailability.userId) === String(userForAvatar.id || userForAvatar.userId)) {
                    // Current user: use stateManager currentUser.availability/globalAvailability (most up-to-date from database)
                    userForAvatar.availability = currentUserForAvailability.availability || currentUserForAvailability.globalAvailability || userForAvatar.availability;
                    console.log(`🔍 PROFILE_MANAGER: Using currentUser.availability for profile avatar: ${userForAvatar.availability}`);
                }
                if (!userForAvatar.availability) {
                    // ROOT CAUSE FIX: Try to get from stateManager currentUser first
                    if (currentUserForAvailability && (currentUserForAvailability.availability || currentUserForAvailability.globalAvailability)) {
                        userForAvatar.availability = currentUserForAvailability.availability || currentUserForAvailability.globalAvailability;
                    }
                    else {
                        // Try to get from visibility data
                        const visibilityData = getVisibilityDataUnfiltered();
                        if (visibilityData?.active) {
                            const currentUserInVisibility = visibilityData.active.find((u) => String(u.id || u.userId) === String(currentUserForAvailability?.id));
                            if (currentUserInVisibility && currentUserInVisibility.availability) {
                                userForAvatar.availability = currentUserInVisibility.availability;
                            }
                        }
                    }
                    // Default to AVAILABLE if active, OFFLINE if not
                    if (!userForAvatar.availability) {
                        userForAvatar.availability = (userForAvatar.isActive || userForAvatar.is_active) ? 'AVAILABLE' : 'OFFLINE';
                    }
                }
                const avatarHTML = await AvatarUtils.createUnifiedAvatar(userForAvatar, 'profile', {
                    showAura: true,
                    showStatus: true, // ROOT CAUSE FIX: Enable status dots on profile avatar
                    size: 32
                });
                // ROOT CAUSE FIX: Wrap AvatarUtils HTML in .user-avatar div for consistency
                userAvatarContainer.innerHTML = `<div class="user-avatar">${avatarHTML}</div>`;
                console.log('✅ PROFILE_MANAGER: Avatar updated using AvatarUtils with auraColor:', this.profileData?.auraColor);
                console.log('📄 PROFILE_MANAGER: Generated avatar HTML:', avatarHTML.substring(0, 200) + '...');
                // Log what was actually inserted and check for aura element
                console.log('🔧 PROFILE_MANAGER: updateUserAvatar - Container updated, checking for aura element...');
                const auraElement = userAvatarContainer.querySelector('.avatar-aura');
                if (auraElement) {
                    console.log('✅ PROFILE_MANAGER: updateUserAvatar - Aura element found with background:', auraElement.style.backgroundColor);
                }
                else {
                    console.log('⚠️ PROFILE_MANAGER: updateUserAvatar - Aura element NOT found in avatar HTML');
                    console.log('⚠️ PROFILE_MANAGER: updateUserAvatar - Full container HTML:', userAvatarContainer.innerHTML);
                }
            }
            else {
                console.warn('AvatarUtils not available, using fallback', null, 'profile');
                this.createFallbackAvatar();
            }
        }
        catch (error) {
            console.error('Avatar update failed', error, 'profile');
            this.createFallbackAvatar();
        }
    }
    /**
     * Create fallback avatar when AvatarUtils is not available
     */
    createFallbackAvatar() {
        const userAvatarContainer = document.getElementById('user-avatar-container');
        if (!userAvatarContainer)
            return;
        // ROOT CAUSE FIX: Get currentUser from stateManager instead of legacyContext
        const currentUserFromState = stateManagerInstance.getState('currentUser');
        const currentUser = ensureLegacyUser(currentUserFromState);
        const fallbackHTML = `
      <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
        ${(currentUser.displayName || currentUser.name || 'U').charAt(0).toUpperCase()}
      </div>
    `;
        userAvatarContainer.innerHTML = fallbackHTML;
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Fallback avatar created');
    }
    /**
     * Update user menu display
     */
    updateUserMenu() {
        // Update any user menu elements
        const userMenuElements = document.querySelectorAll('[data-user-menu]');
        const displayName = this.profileData?.displayName || this.profileData?.name || this.profileData?.email || 'User';
        userMenuElements.forEach(element => {
            const el = element;
            const menuKey = el.dataset.userMenu;
            if (menuKey === 'name') {
                el.textContent = displayName;
            }
            else if (menuKey === 'email' && this.profileData?.email) {
                el.textContent = this.profileData.email;
            }
        });
    }
    /**
     * Clear profile UI when user signs out
     */
    clearProfileUI() {
        console.log('Clearing profile UI', null);
        const userInfoDiv = document.getElementById('user-info');
        if (userInfoDiv) {
            userInfoDiv.style.display = 'none';
        }
        const userAvatarContainer = document.getElementById('user-avatar-container');
        if (userAvatarContainer) {
            userAvatarContainer.innerHTML = '';
        }
        this.profileData = null;
    }
    /**
     * Update user aura color
     */
    updateAuraColor(color) {
        if (!this.profileData) {
            console.warn('Cannot update aura color: no profile data', null, 'profile');
            return false;
        }
        console.log('Updating aura color', {
            oldColor: this.profileData.auraColor,
            newColor: color
        });
        this.profileData.auraColor = color;
        // Update avatar with new aura color
        this.updateUserAvatar();
        // Dispatch aura update event
        document.dispatchEvent(new CustomEvent('auraColorUpdated', {
            detail: {
                color: color,
                user: this.profileData
            }
        }));
        return true;
    }
    /**
     * Refresh profile avatar with latest data
     */
    refreshProfileAvatar() {
        console.log('Refreshing profile avatar', null);
        if (!this.profileData) {
            console.warn('No profile data for avatar refresh', null, 'profile');
            return;
        }
        // Try to get latest avatar from visibility data
        const visibilityData = getVisibilityDataUnfiltered();
        if (visibilityData?.active && this.profileData) {
            const userInVisibility = visibilityData.active.find((u) => u.email === this.profileData.email || u.userId === this.profileData.email);
            if (userInVisibility && userInVisibility.avatarUrl) {
                console.log('Found updated avatar in visibility data', {
                    oldAvatar: this.profileData.avatarUrl,
                    newAvatar: userInVisibility.avatarUrl
                });
                this.profileData.avatarUrl = userInVisibility.avatarUrl;
                this.updateUserAvatar();
            }
        }
    }
    /**
     * Get current profile data
     */
    getProfileData() {
        return this.profileData;
    }
    /**
     * Register profile update callback
     */
    onProfileUpdate(callback) {
        this.updateCallbacks.push(callback);
        // Return unsubscribe function
        return () => {
            const index = this.updateCallbacks.indexOf(callback);
            if (index > -1) {
                this.updateCallbacks.splice(index, 1);
            }
        };
    }
    /**
     * Cache avatar for performance
     */
    cacheAvatar(userId, avatarData) {
        this.avatarCache.set(userId, {
            ...avatarData,
            cachedAt: Date.now()
        });
    }
    /**
     * Get cached avatar
     */
    getCachedAvatar(userId) {
        const cached = this.avatarCache.get(userId);
        if (cached && typeof cached === 'object' && 'cachedAt' in cached && typeof cached.cachedAt === 'number') {
            if (Date.now() - cached.cachedAt < 300000) { // 5 minutes
                return cached;
            }
        }
        return null;
    }
    /**
     * Clear avatar cache
     */
    clearAvatarCache() {
        this.avatarCache.clear();
    }
    /**
     * Get profile status for debugging
     */
    getProfileStatus() {
        return {
            hasProfileData: !!this.profileData,
            userId: this.profileData?.id || this.profileData?.userId || null,
            hasAvatar: !!this.profileData?.avatarUrl,
            avatarSource: this.profileData?.avatarSource || null,
            auraColor: this.profileData?.auraColor || null,
            callbacksRegistered: this.updateCallbacks.length,
            cacheSize: this.avatarCache.size
        };
    }
}
// ===== GLOBAL AVATAR FUNCTIONS =====
// ROOT CAUSE FIX: Unified function to update aura color in BOTH Chrome storage AND database
async function updateAuraColorEverywhere(color) {
    console.log('🔄 AURA_UPDATE: Updating aura color everywhere:', color);
    if (!color || !color.startsWith('#')) {
        console.error('❌ AURA_UPDATE: Invalid color format:', color);
        return false;
    }
    try {
        // Step 1: Update Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            try {
                await setChromeStorage({ userAuraColor: color, auraColor: color });
                console.log('✅ AURA_UPDATE: Saved to Chrome storage:', color);
            }
            catch (error) {
                console.error('❌ AURA_UPDATE: Error saving to Chrome storage:', error);
            }
        }
        // ROOT CAUSE FIX: Step 2: Update database via API
        const currentUserForAuraUpdate = stateManagerInstance.getState('currentUser');
        if (currentUserForAuraUpdate && currentUserForAuraUpdate.id) {
            const api = ensureApi('update aura color in database');
            if (api) {
                try {
                    const result = await api.request(`/v1/users/${currentUserForAuraUpdate.id}/aura-color`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            auraColor: color
                        })
                    });
                    if (result) {
                        console.log('✅ AURA_UPDATE: Saved to database:', color);
                    }
                    else {
                        console.error('❌ AURA_UPDATE: Database update returned no result');
                    }
                }
                catch (error) {
                    console.error('❌ AURA_UPDATE: Error saving to database:', error);
                    // Don't throw - Chrome storage update succeeded
                }
            }
        }
        else {
            console.warn('⚠️ AURA_UPDATE: Cannot update database - missing user or API');
        }
        // ROOT CAUSE FIX: Step 3: Update stateManager currentUser immediately
        if (currentUserForAuraUpdate) {
            stateManagerInstance.setState('currentUser', { ...currentUserForAuraUpdate, auraColor: color });
            console.log('✅ AURA_UPDATE: Updated stateManager currentUser');
        }
        // Step 4: Update visibility cache immediately to prevent stale data
        const visibilityData = getVisibilityDataUnfiltered();
        if (visibilityData?.active) {
            const currentUserInVisibility = visibilityData.active.find((u) => String(u.id || u.userId) === String(currentUserForAuraUpdate?.id));
            if (currentUserInVisibility) {
                currentUserInVisibility.auraColor = color;
                console.log('✅ AURA_UPDATE: Updated visibility cache');
            }
        }
        const visibilityDataFiltered = getVisibilityDataFiltered();
        if (visibilityDataFiltered?.active) {
            const currentUserInVisibility = visibilityDataFiltered.active.find((u) => String(u.id || u.userId) === String(currentUserForAuraUpdate?.id));
            if (currentUserInVisibility) {
                currentUserInVisibility.auraColor = color;
            }
        }
        // ROOT CAUSE FIX: Step 5: Trigger real-time update and avatar refresh
        const win = window;
        if (win.handleAuraChange && typeof win.handleAuraChange === 'function') {
            const currentUserForEvent = stateManagerInstance.getState('currentUser');
            win.handleAuraChange({
                userId: currentUserForEvent?.id,
                auraColor: color
            });
        }
        // ROOT CAUSE FIX: Step 6: Force refresh all message avatars to show new color
        if (typeof win.refreshAllMessageAvatars === 'function') {
            console.log('🔄 AURA_UPDATE: Refreshing all message avatars with new aura color');
            await win.refreshAllMessageAvatars();
        }
        // ROOT CAUSE FIX: Step 7: Refresh visibility avatars
        if (typeof win.refreshVisibilityAvatars === 'function') {
            console.log('🔄 AURA_UPDATE: Refreshing visibility avatars');
            await win.refreshVisibilityAvatars();
        }
        console.log('✅ AURA_UPDATE: Aura color update complete');
        return true;
    }
    catch (error) {
        console.error('❌ AURA_UPDATE: Error updating aura color:', error);
        return false;
    }
}
// COMP METHOD: Get current user's aura color (Chrome storage first, then database fallback)
async function getCurrentUserAuraColor() {
    console.log('🔍 AURA_MODAL: Getting current user aura color (stateManager FIRST, then Chrome storage, then database)');
    // ROOT CAUSE FIX: Check stateManager FIRST (most up-to-date, from API)
    const currentUserForAura = stateManagerInstance.getState('currentUser');
    if (currentUserForAura && currentUserForAura.auraColor) {
        const auraColor = currentUserForAura.auraColor.trim();
        // Only exclude if it's explicitly the fallback color or white variants
        if (auraColor !== AVATAR_FALLBACK_COLOR &&
            auraColor !== '#ffffff' &&
            auraColor !== 'ffffff' &&
            auraColor !== '#fff' &&
            auraColor !== 'fff' &&
            auraColor !== 'white' &&
            auraColor.length > 0) {
            console.log(`✅ AURA_MODAL: Found auraColor in stateManager currentUser: ${auraColor}`);
            return auraColor;
        }
        else {
            console.log(`⚠️ AURA_MODAL: stateManager has auraColor but it's fallback/white: ${auraColor}`);
        }
    }
    else {
        console.log(`⚠️ AURA_MODAL: stateManager currentUser missing or no auraColor`);
    }
    // ROOT CAUSE FIX: Fallback 1: Check Chrome storage (persisted value)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
            const storageResult = await getChromeStorage(['userAuraColor', 'auraColor']);
            const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
            if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'ffffff' && cachedAuraColor !== AVATAR_FALLBACK_COLOR) {
                console.log(`✅ AURA_MODAL: Found aura color in Chrome storage: ${cachedAuraColor}`);
                return cachedAuraColor;
            }
        }
        catch (error) {
            console.warn('⚠️ AURA_MODAL: Error reading Chrome storage:', error);
        }
    }
    // ROOT CAUSE FIX: Fallback 2: Try to get from visibility data (database)
    const visibilityDataFiltered = getVisibilityDataFiltered();
    if (visibilityDataFiltered?.active) {
        const currentUserEmail = currentUserForAura?.email;
        if (currentUserEmail) {
            const userData = visibilityDataFiltered.active.find((u) => u.email === currentUserEmail);
            if (userData && userData.auraColor && userData.auraColor !== AVATAR_FALLBACK_COLOR) {
                console.log(`✅ AURA_MODAL: Found database auraColor in visibility data: ${userData.auraColor}`);
                return userData.auraColor;
            }
        }
    }
    // ROOT CAUSE FIX: Fallback 3: Try to get from unfiltered visibility data (database)
    const visibilityData = getVisibilityDataUnfiltered();
    if (visibilityData?.active) {
        const currentUserEmail = currentUserForAura?.email;
        if (currentUserEmail) {
            const userData = visibilityData.active.find((u) => u.email === currentUserEmail);
            if (userData && userData.auraColor && userData.auraColor !== AVATAR_FALLBACK_COLOR) {
                console.log(`✅ AURA_MODAL: Found database auraColor in unfiltered visibility data: ${userData.auraColor}`);
                return userData.auraColor;
            }
        }
    }
    // ROOT CAUSE FIX: Fallback 4: Try to fetch from database via API
    if (currentUserForAura && currentUserForAura.id) {
        const api = ensureApi('fetch aura color from database');
        if (api) {
            try {
                const userData = await api.request(`/v1/users/${currentUserForAura.id}`, {
                    method: 'GET'
                });
                if (userData && typeof userData === 'object' && 'auraColor' in userData) {
                    const dbColor = typeof userData.auraColor === 'string' ? userData.auraColor : undefined;
                    if (dbColor && dbColor !== AVATAR_FALLBACK_COLOR) {
                        console.log(`✅ AURA_MODAL: Fetched aura color from database API: ${dbColor}`);
                        // Cache it in Chrome storage for next time
                        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                            await setChromeStorage({ userAuraColor: dbColor, auraColor: dbColor });
                        }
                        return dbColor;
                    }
                }
            }
            catch (error) {
                console.error('❌ AURA_MODAL: Error fetching aura color from database:', error);
            }
        }
    }
    // Final fallback to default
    console.log('⚠️ AURA_MODAL: No aura color found, using default');
    return AVATAR_FALLBACK_COLOR;
}
// COMP METHOD: Get aura color from database, never use hardcoded colors
function getCurrentUserAvatarBgColor() {
    console.log('🔍 AURA_FIX: Getting current user aura color from database');
    // First, try to get from currentUser if it has a real database color
    if (legacyContext.currentUser && legacyContext.currentUser.auraColor && legacyContext.currentUser.auraColor !== AVATAR_FALLBACK_COLOR) {
        console.log(`✅ AURA_FIX: Found database aura color in currentUser: ${legacyContext.currentUser.auraColor}`);
        return legacyContext.currentUser.auraColor;
    }
    // Try to get from visibility data (database)
    const visibilityDataFiltered2 = getVisibilityDataFiltered();
    if (visibilityDataFiltered2?.active) {
        const currentUserEmail = legacyContext.currentUser?.email;
        if (currentUserEmail) {
            const userData = visibilityDataFiltered2.active.find((u) => u.email === currentUserEmail);
            if (userData && userData.auraColor && userData.auraColor !== AVATAR_FALLBACK_COLOR) {
                console.log(`✅ AURA_FIX: Found database aura color in visibility data: ${userData.auraColor}`);
                return userData.auraColor;
            }
        }
    }
    // Try to load from storage if not in database
    if (typeof legacyContext.getState === 'function') {
        try {
            const storedColor = legacyContext.getState('userAvatarBgColor');
            if (storedColor && storedColor !== AVATAR_FALLBACK_COLOR) {
                console.log('🔧 AURA_FIX: Loading aura color from storage:', storedColor);
                return storedColor;
            }
        }
        catch (error) {
            console.log('🔧 AURA_FIX: Could not load aura color from storage:', error);
        }
    }
    // COMP METHOD: Never use hardcoded colors - use white fallback
    console.log('⚠️ AURA_FIX: No database aura color found, using white fallback (no hardcoded colors)');
    return AVATAR_FALLBACK_COLOR;
}
function getCurrentUserAvatarColor() {
    if (legacyContext.currentUser && legacyContext.currentUser.auraColor) {
        return legacyContext.currentUser.auraColor;
    }
    return AVATAR_FALLBACK_COLOR; // Default white
}
function setCustomAvatarColor(color) {
    if (legacyContext.currentUser) {
        legacyContext.currentUser.auraColor = color;
        // Update profile if ProfileManager instance exists
        if (legacyContext.ProfileManager && typeof legacyContext.ProfileManager === 'object' && 'updateProfile' in legacyContext.ProfileManager && typeof legacyContext.ProfileManager.updateProfile === 'function') {
            legacyContext.ProfileManager.updateProfile(legacyContext.currentUser);
        }
    }
}
function resetCustomAvatarColor() {
    if (legacyContext.currentUser) {
        legacyContext.currentUser.auraColor = AVATAR_FALLBACK_COLOR; // Default white
        // Update profile if ProfileManager instance exists
        if (legacyContext.ProfileManager && typeof legacyContext.ProfileManager === 'object' && 'updateProfile' in legacyContext.ProfileManager && typeof legacyContext.ProfileManager.updateProfile === 'function') {
            legacyContext.ProfileManager.updateProfile(legacyContext.currentUser);
        }
    }
}
// ===== PROFILE MENU FUNCTIONS (FROM COMP) =====
function handleAvatarClick(e) {
    const userAvatarContainer = document.getElementById('user-avatar-container');
    const userMenu = document.getElementById('user-menu');
    if (!userMenu) {
        console.warn('User menu not found');
        return;
    }
    console.log('👤 Profile avatar clicked!');
    console.log('🔍 Current menu display:', userMenu.style.display);
    e.stopPropagation();
    // Toggle menu visibility
    if (userMenu.style.display === 'none' || userMenu.style.display === '') {
        userMenu.style.display = 'block';
    }
    else {
        userMenu.style.display = 'none';
    }
}
function handleClickOutside(e) {
    const userAvatarContainer = document.getElementById('user-avatar-container');
    const userMenu = document.getElementById('user-menu');
    // Add a small delay to prevent immediate closing
    setTimeout(() => {
        if (userAvatarContainer && userMenu && userMenu.style.display !== 'none') {
            const target = e.target;
            if (target && !userAvatarContainer.contains(target) && !userMenu.contains(target)) {
                console.log('🖱️ Clicked outside, hiding menu');
                userMenu.style.display = 'none';
            }
        }
    }, 100);
}
function addProfileAvatarClickHandler() {
    const userAvatarContainer = document.getElementById('user-avatar-container');
    const userMenu = document.getElementById('user-menu');
    if (userAvatarContainer && userMenu) {
        // Remove any existing click listeners to avoid duplicates
        userAvatarContainer.removeEventListener('click', handleAvatarClick);
        userAvatarContainer.addEventListener('click', handleAvatarClick);
        // Add click-outside listener only once
        if (!legacyContext.clickOutsideListenerAdded) {
            document.addEventListener('click', handleClickOutside);
            legacyContext.clickOutsideListenerAdded = true;
        }
        console.log('✅ Profile avatar click handler added');
    }
    else {
        console.log('❌ Profile avatar container or menu not found');
    }
}
// ===== PROFILE MENU ITEM HANDLERS (FROM COMP) =====
function addAuraButtonClickHandler() {
    const auraBtn = document.getElementById('aura-btn');
    if (auraBtn) {
        auraBtn.addEventListener('click', (e) => {
            console.log('🎨 Aura button clicked!');
            e.stopPropagation(); // Prevent menu from closing
            if (typeof legacyContext.showColorPickerModal === 'function') {
                legacyContext.showColorPickerModal();
            }
            else {
                console.log('❌ showColorPickerModal not available');
            }
        });
        console.log('✅ Aura button click handler added');
    }
    else {
        console.log('❌ Aura button not found');
    }
}
function addLogoutButtonClickHandler() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            console.log('🚪 COMP METHOD: Logout button clicked!');
            e.stopPropagation(); // Prevent menu from closing
            if (typeof legacyContext.logout === 'function') {
                legacyContext.logout();
            }
            else if (typeof legacyContext.performLogout === 'function') {
                legacyContext.performLogout();
            }
            else {
                console.log('❌ logout function not available, creating COMP method logout');
                // COMP METHOD: Create logout function if not available
                legacyContext.performLogout = async function () {
                    console.log('🔧 LOGOUT: Performing logout');
                    try {
                        // Clear user data
                        legacyContext.currentUser = undefined;
                        legacyContext.supabaseUser = undefined;
                        // Clear storage
                        if (chrome?.storage?.local?.clear) {
                            await chrome.storage.local.clear();
                        }
                        // Reload the extension
                        // ROOT CAUSE FIX: Use window.location instead of legacyContext
                        window.location.reload();
                        console.log('✅ LOGOUT: Logout completed');
                    }
                    catch (error) {
                        console.error('❌ LOGOUT: Error during logout:', error);
                    }
                };
                if (legacyContext.performLogout && typeof legacyContext.performLogout === 'function') {
                    legacyContext.performLogout();
                }
            }
        });
        console.log('✅ COMP METHOD: Logout button click handler added');
    }
    else {
        console.log('❌ Logout button not found');
    }
}
function addAllProfileMenuHandlers() {
    console.log('🎯 PROFILE_MENU: Adding all profile menu handlers...');
    addAuraButtonClickHandler();
    addLogoutButtonClickHandler();
    // ROOT CAUSE FIX: Ensure visibility settings button handler is added
    const profileManager = legacyContext.profileManager || (legacyContext.ProfileManager && typeof legacyContext.ProfileManager === 'object' && 'instance' in legacyContext.ProfileManager ? legacyContext.ProfileManager.instance : undefined);
    if (profileManager) {
        const visibilityBtn = document.getElementById('visibility-settings-btn');
        if (visibilityBtn) {
            // Check if handler is already attached
            if (!visibilityBtn.dataset.handlerAttached) {
                console.log('🔧 PROFILE_MENU: Visibility button found but handler not attached, attaching now...');
                // Remove any existing handlers first
                visibilityBtn.onclick = null;
                if (profileManager && typeof profileManager === 'object' && 'visibilitySettingsHandler' in profileManager && profileManager.visibilitySettingsHandler) {
                    visibilityBtn.removeEventListener('click', profileManager.visibilitySettingsHandler);
                }
                // Create handler function if it doesn't exist
                if (!profileManager || typeof profileManager !== 'object' || !('visibilitySettingsHandler' in profileManager) || !profileManager.visibilitySettingsHandler) {
                    if (profileManager && typeof profileManager === 'object') {
                        profileManager.visibilitySettingsHandler = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔧 PROFILE MANAGER: COMP METHOD - Visibility settings button clicked');
                            if (profileManager && typeof profileManager === 'object' && 'hideUserMenu' in profileManager && typeof profileManager.hideUserMenu === 'function') {
                                profileManager.hideUserMenu();
                            }
                            // ROOT CAUSE FIX: Switch to settings tab (not visibility tab)
                            let switched = false;
                            const selectors = [
                                'button[data-tab="settings-tab"]',
                                '.main-nav-tab[data-tab="settings-tab"]',
                                'button[aria-controls="settings-tab"]',
                                '[data-tab="settings-tab"]',
                                '.nav-tab[data-tab="settings-tab"]'
                            ];
                            for (const selector of selectors) {
                                const button = document.querySelector(selector);
                                if (button) {
                                    button.click();
                                    console.log(`✅ PROFILE MANAGER: Switched to settings tab via selector: ${selector}`);
                                    switched = true;
                                    break;
                                }
                            }
                            // Method 2: Direct tab activation
                            if (!switched) {
                                const settingsTab = document.getElementById('settings-tab');
                                const allTabs = document.querySelectorAll('.main-tab-content');
                                const allTabButtons = document.querySelectorAll('.main-nav-tab, button[data-tab]');
                                if (settingsTab) {
                                    allTabs.forEach(tab => tab.classList.remove('active'));
                                    settingsTab.classList.add('active');
                                    allTabButtons.forEach(btn => {
                                        btn.classList.remove('active');
                                        if (btn.getAttribute('data-tab') === 'settings-tab' || btn.getAttribute('aria-controls') === 'settings-tab') {
                                            btn.classList.add('active');
                                        }
                                    });
                                    console.log('✅ PROFILE MANAGER: Directly activated settings tab');
                                    switched = true;
                                    // ROOT CAUSE FIX: Ensure event listeners are attached when settings tab opens
                                    // Use setTimeout to avoid blocking, and wrap in async IIFE
                                    setTimeout(async () => {
                                        try {
                                            // @ts-ignore - Dynamic import of JS module without type declarations
                                            const module = await import('../../extension/features/VisibilitySettingsManager.js');
                                            const visibilitySettingsManager = module?.visibilitySettingsManagerInstance;
                                            if (visibilitySettingsManager && typeof visibilitySettingsManager.ensureEventListeners === 'function') {
                                                await visibilitySettingsManager.ensureEventListeners();
                                                console.log('✅ PROFILE MANAGER: Ensured VisibilitySettingsManager event listeners are attached.');
                                            }
                                            else {
                                                console.warn('⚠️ PROFILE MANAGER: visibilitySettingsManagerInstance not available or ensureEventListeners not a function');
                                            }
                                        }
                                        catch (error) {
                                            console.warn('⚠️ PROFILE MANAGER: Failed to import VisibilitySettingsManager:', error);
                                        }
                                    }, 100);
                                }
                            }
                            // Method 3: Dispatch custom event
                            if (!switched) {
                                const tabSwitchEvent = new CustomEvent('tabSwitch', { detail: { tabId: 'settings-tab' } });
                                legacyContext.dispatchEvent(tabSwitchEvent);
                                console.log('✅ PROFILE MANAGER: Dispatched tab switch event for settings tab');
                            }
                        };
                    }
                }
                // Attach handler
                if (profileManager && typeof profileManager === 'object' && 'visibilitySettingsHandler' in profileManager && profileManager.visibilitySettingsHandler) {
                    visibilityBtn.addEventListener('click', profileManager.visibilitySettingsHandler);
                }
                visibilityBtn.dataset.handlerAttached = 'true';
                // Ensure button is active and clickable
                visibilityBtn.style.pointerEvents = 'auto';
                visibilityBtn.style.cursor = 'pointer';
                visibilityBtn.style.opacity = '1';
                visibilityBtn.disabled = false;
                console.log('✅ PROFILE_MENU: Visibility button handler attached and activated');
            }
            else {
                console.log('✅ PROFILE_MENU: Visibility button handler already attached');
            }
        }
        else {
            console.warn('⚠️ PROFILE_MENU: Visibility button not found in DOM');
        }
    }
    else {
        console.warn('⚠️ PROFILE_MENU: ProfileManager instance not found');
    }
    console.log('✅ PROFILE_MENU: All profile menu handlers added');
}
// ===== AURA COLOR MODAL (FROM COMP) =====
function showColorPickerModal() {
    console.log('🎨 Opening color picker modal...');
    // Check if modal already exists and is visible
    const existingModal = document.getElementById('color-picker-modal');
    if (existingModal) {
        console.log('🎨 Modal already exists, showing it');
        existingModal.style.display = 'flex';
        return;
    }
    // Create modal HTML
    const modalHTML = `
    <div class="color-picker-modal" id="color-picker-modal" style="display: flex;">
      <div class="color-picker-content">
        <div class="color-picker-header">
          <h3 class="color-picker-title">Change Aura Color</h3>
          <button class="color-picker-close" id="color-picker-close">&times;</button>
        </div>
        <div class="color-picker-input-group">
          <label class="color-picker-label" for="color-input">Hex Color (without #):</label>
          <input type="text" class="color-picker-input" id="color-input" placeholder="45B7D1" maxlength="6">
        </div>
        <div class="color-picker-preview">
          <div class="color-picker-preview-circle" id="color-preview-circle">D</div>
          <div class="color-picker-preview-text" id="color-preview-text">Preview</div>
        </div>
        <div class="color-picker-buttons">
          <button class="color-picker-btn" id="color-picker-reset">Reset to Default</button>
          <button class="color-picker-btn primary" id="color-picker-save">Save Color</button>
        </div>
      </div>
    </div>
  `;
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    // Wait for DOM to be ready before attaching event listeners
    setTimeout(() => {
        const modal = document.getElementById('color-picker-modal');
        const colorInput = document.getElementById('color-input');
        const previewCircle = document.getElementById('color-preview-circle');
        const previewText = document.getElementById('color-preview-text');
        const closeBtn = document.getElementById('color-picker-close');
        const resetBtn = document.getElementById('color-picker-reset');
        const saveBtn = document.getElementById('color-picker-save');
        if (!modal || !colorInput || !previewCircle || !previewText || !closeBtn || !resetBtn || !saveBtn) {
            console.error('❌ Modal elements not found after creation');
            return;
        }
        // Get current color and set initial values
        const currentColor = getCurrentUserAvatarBgColor();
        const currentHex = currentColor.replace('#', '');
        colorInput.value = currentHex;
        updateColorPreview(currentHex);
        // Remove any existing event listeners to prevent duplicates
        const newColorInput = colorInput.cloneNode(true);
        colorInput.parentNode.replaceChild(newColorInput, colorInput);
        // Event listeners
        newColorInput.addEventListener('input', (e) => {
            const inputEl = e.target;
            const hex = inputEl.value.replace('#', '');
            updateColorPreview(hex);
        });
        closeBtn.addEventListener('click', closeColorPickerModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal)
                closeColorPickerModal();
        });
        resetBtn.addEventListener('click', () => {
            // Get the dynamic default color (based on user's name) - use legacyContext.currentUser
            let defaultColor = AVATAR_FALLBACK_COLOR; // Fallback
            const user = legacyContext.currentUser;
            if (user) {
                const userMetadata = user.user_metadata;
                const name = userMetadata?.full_name || user.name || user.email || 'User';
                defaultColor = getAvatarColor(name);
            }
            const defaultHex = (defaultColor || '#aaaaaa').replace('#', '');
            newColorInput.value = defaultHex;
            updateColorPreview(defaultHex);
        });
        saveBtn.addEventListener('click', async () => {
            const hex = newColorInput.value.replace('#', '');
            if (isValidHex(hex)) {
                console.log('🎨 Saving aura color:', '#' + hex);
                const auraColor = '#' + hex;
                console.log('🎨 Setting aura color:', auraColor);
                // Apply aura color to profile avatar using unified system
                if (legacyContext.currentUser) {
                    legacyContext.currentUser.auraColor = auraColor;
                    if (typeof legacyContext.updateUI === 'function') {
                        legacyContext.updateUI(legacyContext.currentUser);
                    }
                }
                // Save aura color to storage
                if (typeof legacyContext.setState === 'function') {
                    legacyContext.setState('userAvatarBgColor', auraColor);
                }
                closeColorPickerModal();
            }
            else {
                alert('Please enter a valid 6-digit hex color (e.g., 45B7D1)');
            }
        });
        // Focus the input
        newColorInput.focus();
        newColorInput.select();
        console.log('🎨 Modal setup complete');
    }, 50);
}
function closeColorPickerModal() {
    const modal = document.getElementById('color-picker-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}
function updateColorPreview(hex) {
    const previewCircle = document.getElementById('color-preview-circle');
    const previewText = document.getElementById('color-preview-text');
    if (previewCircle && previewText) {
        const color = '#' + hex;
        previewCircle.style.backgroundColor = color;
        previewText.textContent = color;
    }
}
function isValidHex(hex) {
    return /^[A-Fa-f0-9]{6}$/.test(hex);
}
function getAvatarColor(name) {
    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}
// ROOT CAUSE FIX: Unified function to update availability status in BOTH Chrome storage AND database
async function updateAvailabilityEverywhere(availability) {
    console.log('🔄 STATUS_UPDATE: Updating availability everywhere:', availability);
    if (!availability || !['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(availability)) {
        console.error('❌ STATUS_UPDATE: Invalid availability:', availability);
        return false;
    }
    try {
        // Step 1: Update Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            try {
                await setChromeStorage({
                    userAvailability: availability,
                    availability: availability,
                    globalAvailability: availability
                });
                console.log('✅ STATUS_UPDATE: Saved to Chrome storage:', availability);
            }
            catch (error) {
                console.error('❌ STATUS_UPDATE: Error saving to Chrome storage:', error);
            }
        }
        // ROOT CAUSE FIX: Step 2: Update database via API
        const currentUserForStatusApi = stateManagerInstance.getState('currentUser');
        if (currentUserForStatusApi && currentUserForStatusApi.id) {
            const api = ensureApi('update availability in database');
            if (api) {
                try {
                    const result = await api.request('/v1/presence/availability', {
                        method: 'POST',
                        body: JSON.stringify({
                            availability: availability,
                            isGlobal: true
                        })
                    });
                    if (result && typeof result === 'object' && 'success' in result && result.success) {
                        console.log('✅ STATUS_UPDATE: Saved to database:', availability);
                    }
                    else {
                        console.error('❌ STATUS_UPDATE: Database update returned no result');
                    }
                }
                catch (error) {
                    console.error('❌ STATUS_UPDATE: Error saving to database:', error);
                    // Don't throw - Chrome storage update succeeded
                }
            }
        }
        else {
            console.warn('⚠️ STATUS_UPDATE: Cannot update database - missing user or API');
        }
        // ROOT CAUSE FIX: Step 3: Update stateManager currentUser immediately
        const currentUserForStatusUpdate = stateManagerInstance.getState('currentUser');
        if (currentUserForStatusUpdate) {
            stateManagerInstance.setState('currentUser', { ...currentUserForStatusUpdate, availability, globalAvailability: availability });
            console.log('✅ STATUS_UPDATE: Updated stateManager currentUser');
        }
        // ROOT CAUSE FIX: Step 4: Update visibility cache immediately to prevent stale data
        const visibilityData = getVisibilityDataUnfiltered();
        if (visibilityData?.active && currentUserForStatusUpdate) {
            const currentUserInVisibility = visibilityData.active.find((u) => String(u.id || u.userId) === String(currentUserForStatusUpdate.id));
            if (currentUserInVisibility) {
                currentUserInVisibility.availability = availability;
                console.log('✅ STATUS_UPDATE: Updated visibility cache');
            }
        }
        const visibilityDataFiltered3 = getVisibilityDataFiltered();
        if (visibilityDataFiltered3?.active && currentUserForStatusUpdate) {
            const currentUserInVisibility = visibilityDataFiltered3.active.find((u) => String(u.id || u.userId) === String(currentUserForStatusUpdate.id));
            if (currentUserInVisibility) {
                currentUserInVisibility.availability = availability;
            }
        }
        // Step 5: Refresh profile avatar to show new status dot
        const profileManagerInstance = (legacyContext.profileManager || (legacyContext.ProfileManager && legacyContext.ProfileManager.instance));
        if (profileManagerInstance && typeof profileManagerInstance.updateUserAvatar === 'function') {
            try {
                console.log('🔄 STATUS_UPDATE: Refreshing profile avatar with new status');
                await profileManagerInstance.updateUserAvatar();
                console.log('✅ STATUS_UPDATE: Profile avatar refreshed');
            }
            catch (error) {
                console.warn('⚠️ STATUS_UPDATE: Error refreshing profile avatar:', error);
            }
        }
        // Step 6: Force refresh all message avatars to show new status
        if (typeof legacyContext.refreshAllMessageAvatars === 'function') {
            console.log('🔄 STATUS_UPDATE: Refreshing all message avatars with new status');
            await legacyContext.refreshAllMessageAvatars();
        }
        // Step 7: Refresh visibility avatars
        if (typeof legacyContext.refreshVisibilityAvatars === 'function') {
            console.log('🔄 STATUS_UPDATE: Refreshing visibility avatars');
            await legacyContext.refreshVisibilityAvatars();
        }
        console.log('✅ STATUS_UPDATE: Availability update complete');
        return true;
    }
    catch (error) {
        console.error('❌ STATUS_UPDATE: Error updating availability:', error);
        return false;
    }
}
// ROOT CAUSE FIX: Unified function to update theme in BOTH Chrome storage AND database
async function updateThemeEverywhere(theme) {
    // ROOT CAUSE FIX: Log call stack to identify where this is being called from
    const stack = new Error().stack;
    console.log('🔄 THEME_UPDATE: Updating theme everywhere:', theme);
    console.log('🔍 THEME_UPDATE: Call stack:', stack?.split('\n').slice(1, 5).join('\n'));
    if (!theme || !['light', 'dark', 'auto'].includes(theme)) {
        console.error('❌ THEME_UPDATE: Invalid theme:', theme);
        return false;
    }
    // ROOT CAUSE FIX: CRITICAL - Prevent resetting to 'light' if current DOM theme is 'dark'
    // This prevents theme from being reset when preferences load or messages reload
    // NEVER allow resetting from dark to light unless it's an explicit user action
    const currentDomTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
    if (currentDomTheme === 'dark' && theme === 'light') {
        // Check if this is coming from UserPreferencesManager or VisibilitySettingsManager (which should respect DOM)
        const isFromPreferencesManager = stack?.includes('UserPreferencesManager') ||
            stack?.includes('applyPreferencesToUI') ||
            stack?.includes('loadAllPreferences') ||
            stack?.includes('VisibilitySettingsManager') ||
            stack?.includes('saveTheme');
        if (isFromPreferencesManager) {
            console.warn('🚫 THEME_UPDATE: BLOCKING reset from dark to light - preserving current DOM theme');
            console.warn('🚫 THEME_UPDATE: Current DOM theme is dark, requested theme is light, but this appears to be from preferences/settings loading');
            console.warn('🚫 THEME_UPDATE: This is likely a fallback that should not happen - UserPreferencesManager should be initialized');
            return false; // Don't reset theme
        }
        // Even if not from preferences manager, check if Chrome storage has 'dark' (user's actual preference)
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            try {
                const chromeStorage = await new Promise((resolve) => {
                    chrome.storage.local.get(['theme'], (result) => {
                        resolve((result || {}));
                    });
                });
                if (chromeStorage && chromeStorage.theme === 'dark') {
                    console.warn('🚫 THEME_UPDATE: BLOCKING reset from dark to light - Chrome storage has dark theme');
                    return false; // Don't reset theme
                }
            }
            catch (error) {
                console.warn('⚠️ THEME_UPDATE: Error checking Chrome storage:', error);
            }
        }
    }
    try {
        // Step 1: Update Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            try {
                await setChromeStorage({ theme: theme, userTheme: theme });
                console.log('✅ THEME_UPDATE: Saved to Chrome storage:', theme);
            }
            catch (error) {
                console.error('❌ THEME_UPDATE: Error saving to Chrome storage:', error);
            }
        }
        // ROOT CAUSE FIX: Removed localStorage - we only use Chrome storage and database
        // Step 3: Update DOM immediately for instant feedback
        const currentDomBeforeUpdate = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
        console.log('🔍 THEME_UPDATE: ========================================');
        console.log('🔍 THEME_UPDATE: About to set DOM theme');
        console.log('🔍 THEME_UPDATE: Current DOM theme:', currentDomBeforeUpdate || 'NOT SET');
        console.log('🔍 THEME_UPDATE: New theme:', theme);
        console.log('🔍 THEME_UPDATE: ========================================');
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        // Step 4: Update database via API
        // ROOT CAUSE FIX: Get currentUser from stateManager
        const currentUserForThemeApi = stateManagerInstance.getState('currentUser');
        if (currentUserForThemeApi && currentUserForThemeApi.id) {
            const api = ensureApi('update theme in database');
            if (api) {
                try {
                    const result = await api.request(`/v1/users/${currentUserForThemeApi.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            theme: theme
                        })
                    });
                    if (result) {
                        console.log('✅ THEME_UPDATE: Saved to database:', theme);
                    }
                    else {
                        console.error('❌ THEME_UPDATE: Database update returned no result');
                    }
                }
                catch (error) {
                    console.error('❌ THEME_UPDATE: Error saving to database:', error);
                    // Don't throw - Chrome storage update succeeded
                }
            }
        }
        else {
            console.warn('⚠️ THEME_UPDATE: Cannot update database - missing user or API');
        }
        // Step 5: Update local user object immediately
        if (legacyContext.currentUser) {
            legacyContext.currentUser.theme = theme;
            console.log('✅ THEME_UPDATE: Updated legacyContext.currentUser');
        }
        // Step 6: Update profile menu theme icon and text (both IDs)
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');
        const themeIconMenu = document.getElementById('theme-icon-menu');
        const themeTextMenu = document.getElementById('theme-text-menu');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        if (themeText) {
            themeText.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
        }
        if (themeIconMenu) {
            themeIconMenu.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        if (themeTextMenu) {
            themeTextMenu.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
        }
        // Step 7: Update settings tab theme toggle if it exists
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = theme === 'dark';
            // Trigger updateThemeStatus to update slider position
            if (legacyContext.visibilitySettingsManager && typeof legacyContext.visibilitySettingsManager === 'object' && 'updateThemeStatus' in legacyContext.visibilitySettingsManager && typeof legacyContext.visibilitySettingsManager.updateThemeStatus === 'function') {
                legacyContext.visibilitySettingsManager.updateThemeStatus();
            }
            console.log('✅ THEME_UPDATE: Updated settings tab theme toggle');
        }
        console.log('✅ THEME_UPDATE: Theme update complete');
        return true;
    }
    catch (error) {
        console.error('❌ THEME_UPDATE: Error updating theme:', error);
        return false;
    }
}
// ROOT CAUSE FIX: Get current user's theme (Chrome storage first, then database fallback)
async function getCurrentUserTheme() {
    console.log('🔍 THEME_GET: Getting current user theme (Chrome storage first, then database)');
    // ROOT CAUSE FIX: Check Chrome storage FIRST
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
            const storageResult = await getChromeStorage(['theme', 'userTheme']);
            const cachedTheme = storageResult.theme || storageResult.userTheme;
            if (cachedTheme && ['light', 'dark', 'auto'].includes(cachedTheme)) {
                console.log(`✅ THEME_GET: Found theme in Chrome storage: ${cachedTheme}`);
                return cachedTheme;
            }
        }
        catch (error) {
            console.warn('⚠️ THEME_GET: Error reading Chrome storage:', error);
        }
    }
    // ROOT CAUSE FIX: Removed localStorage fallback - we only use Chrome storage and database
    // Fallback 1: Try to get from current user object (from database)
    if (legacyContext.currentUser && legacyContext.currentUser.theme) {
        const userTheme = legacyContext.currentUser.theme;
        if (['light', 'dark', 'auto'].includes(userTheme)) {
            console.log(`✅ THEME_GET: Found theme in currentUser: ${userTheme}`);
            return userTheme;
        }
    }
    // ROOT CAUSE FIX: Fallback 3: Try to fetch from database via API
    const currentUserForThemeFetch = stateManagerInstance.getState('currentUser');
    if (currentUserForThemeFetch && currentUserForThemeFetch.id) {
        const api = ensureApi('fetch theme from database');
        if (api) {
            try {
                const userData = await api.request(`/v1/users/${currentUserForThemeFetch.id}`, {
                    method: 'GET'
                });
                if (userData && typeof userData === 'object' && 'theme' in userData && typeof userData.theme === 'string') {
                    console.log(`✅ THEME_GET: Fetched theme from database API: ${userData.theme}`);
                    // Cache it in Chrome storage for next time
                    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                        await setChromeStorage({ theme: userData.theme, userTheme: userData.theme });
                    }
                    // ROOT CAUSE FIX: Removed localStorage - we only use Chrome storage and database
                    return userData.theme;
                }
            }
            catch (error) {
                console.warn('⚠️ THEME_GET: Error fetching from database API:', error);
            }
        }
    }
    // Fallback 4: Check DOM attribute
    const domTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
    if (domTheme && ['light', 'dark', 'auto'].includes(domTheme)) {
        console.log(`✅ THEME_GET: Found theme in DOM: ${domTheme}`);
        return domTheme;
    }
    // Final fallback to default
    console.log('⚠️ THEME_GET: No theme found, using default: light');
    return 'light';
}
// ROOT CAUSE FIX: Get current user's availability (Chrome storage first, then database fallback)
async function getCurrentUserAvailability() {
    console.log('🔍 STATUS_GET: Getting current user availability (Chrome storage first, then database)');
    // ROOT CAUSE FIX: Check Chrome storage FIRST
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
            const storageResult = await getChromeStorage(['userAvailability', 'availability', 'globalAvailability']);
            const cachedAvailability = storageResult.userAvailability || storageResult.availability || storageResult.globalAvailability;
            if (cachedAvailability && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(cachedAvailability)) {
                console.log(`✅ STATUS_GET: Found availability in Chrome storage: ${cachedAvailability}`);
                return cachedAvailability;
            }
        }
        catch (error) {
            console.warn('⚠️ STATUS_GET: Error reading Chrome storage:', error);
        }
    }
    // ROOT CAUSE FIX: Fallback 1: Try to get from stateManager currentUser (from database)
    const currentUserForStatus = stateManagerInstance.getState('currentUser');
    if (currentUserForStatus) {
        const userAvailability = currentUserForStatus.availability || currentUserForStatus.globalAvailability;
        if (userAvailability && typeof userAvailability === 'string' && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(userAvailability)) {
            console.log(`✅ STATUS_GET: Found availability in currentUser: ${userAvailability}`);
            return userAvailability;
        }
    }
    // ROOT CAUSE FIX: Fallback 2: Try to get from visibility data (database)
    const visibilityData = getVisibilityDataUnfiltered();
    if (visibilityData?.active) {
        const currentUserInVisibility = visibilityData.active.find((u) => String(u.id || u.userId) === String(currentUserForStatus?.id));
        if (currentUserInVisibility && currentUserInVisibility.availability) {
            console.log(`✅ STATUS_GET: Found availability in visibility data: ${currentUserInVisibility.availability}`);
            return currentUserInVisibility.availability;
        }
    }
    // ROOT CAUSE FIX: Fallback 3: Try to fetch from database via API
    if (currentUserForStatus && currentUserForStatus.id) {
        const api = ensureApi('fetch availability from database');
        if (api) {
            try {
                const statusData = await api.request('/v1/presence/availability', {
                    method: 'GET'
                });
                if (statusData && typeof statusData === 'object' && 'availability' in statusData && typeof statusData.availability === 'string') {
                    console.log(`✅ STATUS_GET: Fetched availability from database API: ${statusData.availability}`);
                    // Cache it in Chrome storage for next time
                    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                        chrome.storage.local.set({
                            userAvailability: statusData.availability,
                            availability: statusData.availability,
                            globalAvailability: statusData.availability
                        });
                    }
                    return statusData.availability;
                }
            }
            catch (error) {
                console.warn('⚠️ STATUS_GET: Error fetching from database API:', error);
            }
        }
    }
    // Final fallback to default
    console.log('⚠️ STATUS_GET: No availability found, using default: AVAILABLE');
    return 'AVAILABLE';
}
// Create singleton instance
const profileManagerInstance = new ProfileManager();
// ROOT CAUSE FIX: Export to window instead of legacyContext (TypeScript migration)
if (typeof window !== 'undefined') {
    const win = window;
    win.ProfileManager = ProfileManager;
    win.profileManager = profileManagerInstance;
    win.getCurrentUserAuraColor = getCurrentUserAuraColor;
    win.updateAuraColorEverywhere = updateAuraColorEverywhere;
    win.getCurrentUserTheme = getCurrentUserTheme;
    win.updateThemeEverywhere = updateThemeEverywhere;
    win.getCurrentUserAvailability = getCurrentUserAvailability;
    win.updateAvailabilityEverywhere = updateAvailabilityEverywhere;
    win.getCurrentUserAvatarBgColor = getCurrentUserAvatarBgColor;
    win.getCurrentUserAvatarColor = getCurrentUserAvatarColor;
    win.setCustomAvatarColor = setCustomAvatarColor;
    win.resetCustomAvatarColor = resetCustomAvatarColor;
    win.handleAvatarClick = handleAvatarClick;
    win.handleClickOutside = handleClickOutside;
    win.addProfileAvatarClickHandler = addProfileAvatarClickHandler;
    win.addAuraButtonClickHandler = addAuraButtonClickHandler;
    win.addLogoutButtonClickHandler = addLogoutButtonClickHandler;
    win.addAllProfileMenuHandlers = addAllProfileMenuHandlers;
    win.showColorPickerModal = showColorPickerModal;
    win.closeColorPickerModal = closeColorPickerModal;
    win.updateColorPreview = updateColorPreview;
    win.isValidHex = isValidHex;
    win.getAvatarColor = getAvatarColor;
}
// Export as ES6 module
export { ProfileManager, profileManagerInstance };
export default ProfileManager;
console.log('ProfileManager module loaded', null, 'profile');
