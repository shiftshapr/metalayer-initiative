// RED-LINE: No hardcoded community - communities must come from database
export class BootController {
    constructor(graph, options) {
        this.graph = graph;
        this.options = options;
    }
    async initialize() {
        await this.initializeState();
        this.registerLifecycle();
        await this.initializeAuthFlow();
        await this.safeInitializeTheme();
        this.setupEventBridges();
        this.exposeCompatibilityAPI();
        // ROOT CAUSE FIX: Direct message loading trigger - simple and reliable
        // Wait for TabController to finish, then ensure messages load
        if (typeof document !== 'undefined' && typeof chrome !== 'undefined' && chrome.tabs) {
            // Use waitForEvent to wait for TabController to complete, then check
            const triggerMessageLoad = async () => {
                try {
                    // Wait a moment for TabController to initialize and capture URL
                    await new Promise(resolve => setTimeout(resolve, 2500));
                    const currentUrlData = this.graph.stateManager.getState('currentUrlData');
                    const messagesInDom = document.querySelector('.chat-messages')?.children.length || 0;
                    this.graph.logger?.debug?.('BOOT_CTRL_MESSAGE_CHECK', {
                        hasUrlData: !!currentUrlData?.rawUrl,
                        messagesInDom,
                        hasMessageService: !!this.options.messageLoadingService,
                        hasLoadChatHistory: !!this.options.loadChatHistory
                    });
                    // If no URL captured and no messages, trigger manual capture
                    if (!currentUrlData?.rawUrl && messagesInDom === 0) {
                        this.graph.logger?.warn?.('BOOT_CTRL_FALLBACK_NEEDED', {
                            message: 'TabController did not capture URL, triggering fallback'
                        });
                        try {
                            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                            if (tabs && tabs.length > 0 && tabs[0]?.url) {
                                const tabUrl = tabs[0].url;
                                // Only process non-chrome URLs
                                if (tabUrl && !tabUrl.startsWith('chrome://') && !tabUrl.startsWith('chrome-extension://')) {
                                    this.graph.logger?.debug?.('BOOT_CTRL_FALLBACK_URL_CAPTURE', { tabUrl });
                                    // Trigger message loading via service if available
                                    if (this.options.messageLoadingService) {
                                        this.graph.logger?.debug?.('BOOT_CTRL_FALLBACK_CALLING_SERVICE', { tabUrl });
                                        await this.options.messageLoadingService.loadMessages(tabUrl);
                                        this.graph.logger?.debug?.('BOOT_CTRL_FALLBACK_SERVICE_COMPLETE', { tabUrl });
                                    }
                                    else if (this.options.loadChatHistory) {
                                        const win = typeof window !== 'undefined' ? window : null;
                                        const getActiveTabFn = win?.getActiveSidepanelTab;
                                        const activeTab = typeof getActiveTabFn === 'function' ? getActiveTabFn() : null;
                                        if (activeTab === 'discuss-tab' || activeTab === null) {
                                            this.graph.logger?.debug?.('BOOT_CTRL_FALLBACK_CALLING_LOADCHAT', { tabUrl, activeTab });
                                            await this.options.loadChatHistory(tabUrl);
                                            this.graph.logger?.debug?.('BOOT_CTRL_FALLBACK_LOADCHAT_COMPLETE', { tabUrl });
                                        }
                                    }
                                }
                            }
                        }
                        catch (error) {
                            this.graph.logger?.error?.('BOOT_CTRL_FALLBACK_URL_CAPTURE_ERROR', {
                                error,
                                errorMessage: error instanceof Error ? error.message : String(error)
                            });
                        }
                    }
                    else if (currentUrlData?.rawUrl && messagesInDom === 0) {
                        // URL captured but no messages - try loading
                        this.graph.logger?.warn?.('BOOT_CTRL_URL_BUT_NO_MESSAGES', {
                            url: currentUrlData.rawUrl,
                            message: 'URL captured but no messages in DOM, triggering load'
                        });
                        if (this.options.messageLoadingService) {
                            await this.options.messageLoadingService.loadMessages(currentUrlData.rawUrl);
                        }
                        else if (this.options.loadChatHistory) {
                            const win = typeof window !== 'undefined' ? window : null;
                            const getActiveTabFn = win?.getActiveSidepanelTab;
                            const activeTab = typeof getActiveTabFn === 'function' ? getActiveTabFn() : null;
                            if (activeTab === 'discuss-tab' || activeTab === null) {
                                await this.options.loadChatHistory(currentUrlData.rawUrl);
                            }
                        }
                    }
                }
                catch (error) {
                    this.graph.logger?.error?.('BOOT_CTRL_FALLBACK_CHECK_ERROR', {
                        error,
                        errorMessage: error instanceof Error ? error.message : String(error)
                    });
                }
            };
            // Trigger check after TabController should have completed
            triggerMessageLoad().catch(error => {
                this.graph.logger?.error?.('BOOT_CTRL_FALLBACK_TRIGGER_ERROR', { error });
            });
        }
    }
    exposeCompatibilityAPI() {
        if (typeof window === 'undefined') {
            return;
        }
        const bootWin = window;
        bootWin.handlePendingContent = () => this.handlePendingContent();
        bootWin.startPresenceTracking = () => this.options.realtimeController.startForCurrentPage();
        bootWin.migrateFromChromeStorage = () => this.migrateFromChromeStorage();
        // ROOT CAUSE FIX: Expose handleUserChange so auth code can use it
        // This ensures ALL auth code goes through proper UUID conversion
        bootWin.handleUserChange = (user) => this.handleUserChange(user);
        this.graph.logger?.info?.('BOOT_CTRL_API', {
            message: 'Exposed handleUserChange() on window - auth code should use this instead of direct setState',
            apiAvailable: true
        });
    }
    async initializeState() {
        try {
            const isInitialized = await this.graph.stateManager.getState('extension.isInitialized');
            if (isInitialized) {
                return;
            }
            await this.graph.stateManager.initialize({
                userAvatarBgColor: window.AVATAR_FALLBACK_COLOR ?? '#7C3AED',
                googleUser: null,
                supabaseUser: null,
                metalayerUser: null,
                activeCommunities: [],
                primaryCommunity: null,
                currentCommunity: null,
                communities: [],
                theme: 'auto',
                debugMode: false,
                customAvatarColor: null,
                lastMessageId: null,
                lastLoadedUri: null,
                currentUri: null,
                presenceData: null,
                chatData: [],
                currentUrlData: null,
                extension: {
                    isInitialized: true
                }
            });
        }
        catch (error) {
            this.graph.logger?.error?.('STATE_INIT', { error });
        }
    }
    registerLifecycle() {
        const lifecycle = this.graph.lifecycleManager;
        if (!lifecycle) {
            return;
        }
        lifecycle.register('sidepanel', {
            init: () => true,
            destroy: () => true
        }, {
            dependencies: ['StateManager'],
            autoInitialize: true
        });
        lifecycle.register('chat', {
            initialize: () => true,
            destroy: () => true
        }, {
            dependencies: ['sidepanel'],
            autoInitialize: true
        });
    }
    async initializeAuthFlow() {
        // ROOT CAUSE FIX: Initialize real Google auth at startup
        // ES6 pattern: Use imported function instead of window
        // TODO: Import initializeRealGoogleAuth from AuthModule instead of window
        // ACCEPTABLE: Optional check for backward compatibility during migration
        const win = typeof window !== 'undefined' ? window : null;
        if (win && typeof win.initializeRealGoogleAuth === 'function') {
            try {
                this.graph.logger?.debug?.('BOOT_CTRL_INIT_REAL_GOOGLE_AUTH', { message: 'Initializing real Google auth' });
                win.initializeRealGoogleAuth();
            }
            catch (error) {
                this.graph.logger?.error?.('BOOT_CTRL_AUTH_INIT_ERROR', { error, message: 'Failed to initialize real Google auth' });
            }
        }
        // ROOT CAUSE FIX: Intercept setState for currentUser to catch any direct sets
        // This is a safety net until real-google-auth.js is fixed to use window.handleUserChange()
        this.interceptCurrentUserSetState();
        try {
            await this.graph.authManager.initialize();
        }
        catch (error) {
            this.graph.logger?.error?.('AUTH_INIT', { error });
        }
        // CRITICAL: AuthManager should ONLY trigger onAuthStateChange
        // BootController.handleUserChange() is the ONLY place that sets currentUser in state
        // This ensures UUID conversion always happens
        this.graph.authManager.onAuthStateChange(async (user) => {
            await this.handleUserChange(user);
        });
        // Handle initial user if available
        const initialUser = this.graph.authManager.getCurrentUser();
        if (initialUser) {
            await this.handleUserChange(initialUser);
        }
    }
    /**
     * ROOT CAUSE FIX: Intercept setState('currentUser', ...) to catch direct sets
     * This is a TEMPORARY safety net until real-google-auth.js is fixed
     * TODO: Remove this once real-google-auth.js uses window.handleUserChange()
     */
    interceptCurrentUserSetState() {
        const originalSetState = this.graph.stateManager.setState.bind(this.graph.stateManager);
        const self = this;
        this.graph.stateManager.setState = async function (key, value) {
            // If setting currentUser, ensure UUID is used
            if (key === 'currentUser') {
                const user = value;
                if (user && user.email) {
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    const isUUID = user.id && uuidRegex.test(user.id);
                    // If user.id is Google ID, redirect to handleUserChange() instead
                    if (!isUUID) {
                        self.graph.logger?.warn?.('AUTH_UUID_FIX', {
                            message: 'CRITICAL: Intercepted direct setState("currentUser") with Google ID - redirecting to handleUserChange()',
                            googleId: user.id,
                            email: user.email,
                            fix: 'real-google-auth.js should use window.handleUserChange() instead',
                            stackTrace: new Error().stack?.split('\n').slice(0, 5).join('\n')
                        });
                        // Redirect to proper flow - this will do UUID lookup and set correctly
                        await self.handleUserChange(user);
                        return; // Don't call original setState - handleUserChange() already set it
                    }
                }
            }
            // For all other keys, or if currentUser already has UUID, proceed normally
            return originalSetState(key, value);
        };
    }
    async handleUserChange(user) {
        // CRITICAL: Log entry to verify this function is being called
        this.graph.logger?.info?.('AUTH_UUID_FIX', {
            message: 'handleUserChange() called',
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.email,
            timestamp: new Date().toISOString()
        });
        if (!user) {
            await this.graph.stateManager.setState('currentUser', null);
            return;
        }
        // CRITICAL: NEVER use Google ID - user.id MUST ALWAYS be AppUser UUID
        // If user.id is not a UUID (e.g., Google ID), look up AppUser UUID immediately
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUUID = user.id && uuidRegex.test(user.id);
        this.graph.logger?.info?.('AUTH_UUID_FIX', {
            message: 'UUID validation check',
            userId: user.id,
            isUUID: isUUID,
            hasEmail: !!user.email,
            hasSupabaseService: !!this.graph.supabaseService
        });
        // If user.id is Google ID or invalid, look up AppUser UUID from email
        if (!isUUID && user.email) {
            if (!this.graph.supabaseService) {
                this.graph.logger?.error?.('AUTH_UUID_FIX', {
                    message: 'CRITICAL: supabaseService not available - cannot lookup AppUser UUID',
                    email: user.email,
                    userId: user.id
                });
                return; // Cannot proceed without supabaseService
            }
            try {
                const client = this.graph.supabaseService.getClient();
                if (!client) {
                    this.graph.logger?.error?.('AUTH_UUID_FIX', {
                        message: 'CRITICAL: Supabase client not available - cannot lookup AppUser UUID',
                        email: user.email,
                        userId: user.id
                    });
                    return; // Cannot proceed without client
                }
                this.graph.logger?.info?.('AUTH_UUID_FIX', {
                    message: 'Looking up AppUser UUID from email',
                    email: user.email,
                    googleId: user.id
                });
                const { data, error } = await client
                    .from('AppUser')
                    .select('id')
                    .eq('email', user.email)
                    .single();
                if (error) {
                    this.graph.logger?.error?.('AUTH_UUID_FIX', {
                        message: 'CRITICAL: Database query error looking up AppUser UUID',
                        email: user.email,
                        error: error.message,
                        errorCode: error.code,
                        errorDetails: error.details,
                        currentUserId: user.id
                    });
                    return; // Don't set user with invalid ID
                }
                if (!data || !data.id) {
                    this.graph.logger?.error?.('AUTH_UUID_FIX', {
                        message: 'CRITICAL: AppUser not found in database for email',
                        email: user.email,
                        currentUserId: user.id,
                        dataReturned: !!data
                    });
                    return; // Don't set user with invalid ID
                }
                // CRITICAL: Replace Google ID with AppUser UUID immediately
                // Store Google ID in separate field if needed, but NEVER use it for matching
                const googleId = user.id; // Preserve Google ID if needed
                user.id = data.id; // ALWAYS use AppUser UUID
                if (googleId && !user.googleId) {
                    user.googleId = googleId;
                }
                this.graph.logger?.info?.('AUTH_UUID_FIX', {
                    message: '✅ Replaced Google ID with AppUser UUID - user.id is now UUID',
                    email: user.email,
                    appUserUUID: user.id,
                    googleId: googleId
                });
            }
            catch (error) {
                this.graph.logger?.error?.('AUTH_UUID_FIX', {
                    error: error instanceof Error ? error.message : String(error),
                    errorStack: error instanceof Error ? error.stack : undefined,
                    message: 'CRITICAL: Exception looking up AppUser UUID',
                    email: user.email,
                    userId: user.id
                });
                // Don't set user with invalid ID
                return;
            }
        }
        // CRITICAL: Verify user.id is UUID before proceeding
        if (!user.id || !uuidRegex.test(user.id)) {
            this.graph.logger?.error?.('AUTH_UUID_FIX', {
                message: 'CRITICAL: user.id is not a valid UUID - cannot proceed',
                userId: user.id,
                email: user.email,
                afterLookup: true
            });
            return; // Don't set user with invalid ID
        }
        // Now user.id is guaranteed to be AppUser UUID - set in state
        this.graph.logger?.info?.('AUTH_UUID_FIX', {
            message: 'Setting currentUser in state with AppUser UUID',
            appUserUUID: user.id,
            email: user.email
        });
        await this.graph.stateManager.setState('currentUser', user);
        // CRITICAL: Verify the user was set correctly
        const verifyUser = await this.graph.stateManager.getState('currentUser');
        if (verifyUser?.id !== user.id) {
            this.graph.logger?.error?.('AUTH_UUID_FIX', {
                message: 'CRITICAL: User ID mismatch after setting in state',
                expectedUUID: user.id,
                actualId: verifyUser?.id,
                email: user.email
            });
        }
        // REFACTOR PHASE 1: Single Initialization Point
        // This is the ONLY place where VisibilityManager.initialize() is called
        // user.id is now guaranteed to be AppUser UUID (not Google ID)
        if (this.graph.visibilityManager) {
            const status = this.graph.visibilityManager.getStatus();
            // Only initialize if not already active (initialization guard in VisibilityManager also prevents double-init)
            if (!status.isActive) {
                // user.id is now guaranteed to be AppUser UUID (checked above)
                if (!user.id) {
                    this.graph.logger?.error?.('VISIBILITY_INIT', {
                        message: 'CRITICAL: user.id is missing after UUID lookup',
                        userEmail: user.email
                    });
                    return; // Cannot initialize without UUID
                }
                try {
                    // This is the ONLY initialization call in the entire codebase
                    // user.id is AppUser UUID (never Google ID)
                    await this.graph.visibilityManager.initialize(user.id);
                    this.graph.logger?.info?.('VISIBILITY_INIT', {
                        message: 'VisibilityManager initialized successfully (single initialization point)',
                        appUserUUID: user.id,
                        userEmail: user.email
                    });
                }
                catch (error) {
                    this.graph.logger?.error?.('VISIBILITY_INIT', {
                        error,
                        message: 'Failed to initialize VisibilityManager in handleUserChange',
                        appUserUUID: user.id,
                        userEmail: user.email
                    });
                    // Don't throw - let the system continue, but VisibilityManager won't work
                }
            }
            else {
                // Already initialized - this is fine, just log for debugging
                this.graph.logger?.debug?.('VISIBILITY_INIT', {
                    message: 'VisibilityManager already initialized',
                    currentUserId: status.currentUserId
                });
            }
        }
        // ROOT CAUSE FIX: Ensure communities are initialized before loading messages
        await this.ensureCommunitiesInitialized();
        // ROOT CAUSE FIX: Load messages after user is authenticated and communities are ready
        // Use MessageLoadingService if available, otherwise fallback to direct loadChatHistory
        try {
            // ROOT CAUSE FIX: Load messages after user is authenticated and communities are ready
            // Get current URL from state or active tab, but don't block if URL isn't available yet
            // TabController will handle URL processing and message loading when URL is available
            let currentUrl = null;
            const currentUrlData = this.graph.stateManager.getState('currentUrlData');
            if (currentUrlData?.rawUrl) {
                currentUrl = currentUrlData.rawUrl;
            }
            else if (typeof chrome !== 'undefined' && chrome.tabs) {
                try {
                    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tabs && tabs.length > 0 && tabs[0]?.url) {
                        const tabUrl = tabs[0].url;
                        // Only use non-chrome URLs
                        if (tabUrl && !tabUrl.startsWith('chrome://') && !tabUrl.startsWith('chrome-extension://')) {
                            currentUrl = tabUrl;
                        }
                    }
                }
                catch (error) {
                    this.graph.logger?.warn?.('BOOT_CTRL_GET_TAB_URL', { error });
                }
            }
            // ROOT CAUSE FIX: Only load messages if we have a URL
            // If no URL yet, TabController will handle it when URL is processed
            if (currentUrl && this.options.messageLoadingService) {
                this.graph.logger?.debug?.('BOOT_CTRL_LOAD_MESSAGES', { currentUrl, hasService: true });
                try {
                    await this.options.messageLoadingService.loadMessages(currentUrl);
                }
                catch (error) {
                    this.graph.logger?.error?.('BOOT_CTRL_LOAD_MESSAGES_ERROR', { error, currentUrl });
                }
            }
            else if (currentUrl && this.options.loadChatHistory) {
                // Fallback: direct call with tab check
                const win = typeof window !== 'undefined' ? window : null;
                const getActiveTabFn = win?.getActiveSidepanelTab;
                const getActiveTab = getActiveTabFn || (() => {
                    const activeTab = document.querySelector('.main-nav-tab.active');
                    return activeTab?.getAttribute('data-tab') || null;
                });
                const activeTab = typeof getActiveTab === 'function' ? getActiveTab() : null;
                if (activeTab === 'discuss-tab' || activeTab === null) {
                    this.graph.logger?.debug?.('BOOT_CTRL_LOAD_MESSAGES_FALLBACK', { currentUrl, activeTab });
                    try {
                        await this.options.loadChatHistory(currentUrl);
                    }
                    catch (error) {
                        this.graph.logger?.error?.('BOOT_CTRL_LOAD_MESSAGES_FALLBACK_ERROR', { error, currentUrl });
                    }
                }
            }
            else {
                this.graph.logger?.debug?.('BOOT_CTRL_NO_URL_YET', {
                    hasCurrentUrlData: !!currentUrlData,
                    willBeHandledByTabController: true
                });
            }
        }
        catch (error) {
            this.graph.logger?.error?.('BOOT_CTRL_LOAD_MESSAGES_ERROR', { error });
        }
        const bootWin = window;
        if (bootWin.updateUI) {
            await bootWin.updateUI(user);
        }
    }
    async ensureCommunitiesInitialized() {
        try {
            await this.graph.communitiesModule?.initialize();
        }
        catch (error) {
            this.graph.logger?.warn?.('COMMUNITIES_INIT', { error });
        }
    }
    /**
     * Wait for TabManager to initialize
     * Ensures tab state is set before message loading
     * @deprecated Not currently used but kept for potential future use
     */
    // @ts-ignore - Unused method kept for potential future use
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async _waitForTabManager() {
        return new Promise((resolve) => {
            // Check if already initialized
            const win = typeof window !== 'undefined' ? window : null;
            if (win && 'tabContextManager' in win) {
                const tabManager = win.tabContextManager;
                if (tabManager?.getActiveTab) {
                    // TabManager is ready
                    resolve();
                    return;
                }
            }
            // Wait for initialization event (max 2 seconds)
            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    this.graph.logger?.warn?.('TAB_MANAGER_WAIT', { message: 'Timeout waiting for TabManager, proceeding anyway' });
                    resolve();
                }
            }, 2000);
            const handler = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    if (typeof document !== 'undefined') {
                        document.removeEventListener('tabManager:initialized', handler);
                    }
                    resolve();
                }
            };
            if (typeof document !== 'undefined') {
                document.addEventListener('tabManager:initialized', handler, { once: true });
            }
            else {
                // No document, resolve immediately
                clearTimeout(timeout);
                resolve();
            }
        });
    }
    setupEventBridges() {
        this.graph.eventBus?.on('avatar:colorChanged', async (payload) => {
            const typedPayload = payload;
            if (!typedPayload?.color) {
                return;
            }
            await this.graph.stateManager.setState('avatars.user.customColor', typedPayload.color, true);
        });
    }
    async handlePendingContent() {
        try {
            const messageContent = await this.graph.stateManager.getState('pendingMessageContent');
            const visibilityContent = await this.graph.stateManager.getState('pendingVisibilityContent');
            if (messageContent) {
                const textarea = document.getElementById('chat-textarea');
                if (textarea) {
                    textarea.value = `Commenting on: \"${messageContent}\"`;
                    textarea.focus();
                    const autoResize = window.autoResize;
                    autoResize?.(textarea);
                }
                await this.graph.stateManager.setState('pendingMessageContent', null);
                await this.graph.stateManager.setState('pendingMessageUri', null);
            }
            if (visibilityContent) {
                const showNotification = window.showNotification;
                showNotification?.('Visibility anchoring feature coming soon!');
                await this.graph.stateManager.setState('pendingVisibilityContent', null);
                await this.graph.stateManager.setState('pendingVisibilityUri', null);
            }
        }
        catch (error) {
            this.graph.logger?.warn?.('PENDING_CONTENT', { error });
        }
    }
    async migrateFromChromeStorage() {
        try {
            const keys = [
                'userAvatarBgColor',
                'googleUser',
                'supabaseUser',
                'metalayerUser',
                'activeCommunities',
                'primaryCommunity',
                'currentCommunity',
                'communities',
                'theme',
                'debugMode',
                'customAvatarColor',
                'pendingMessageContent',
                'pendingMessageUri',
                'pendingVisibilityContent',
                'pendingVisibilityUri'
            ];
            for (const key of keys) {
                const value = await this.graph.stateManager.getState(key);
                if (value !== undefined) {
                    await this.graph.stateManager.setState(key, value);
                }
            }
        }
        catch (error) {
            this.graph.logger?.error?.('MIGRATION', { error });
        }
    }
    async safeInitializeTheme() {
        try {
            await this.options.initializeTheme();
        }
        catch (error) {
            this.graph.logger?.warn?.('THEME_INIT', { error });
        }
    }
    /**
     * Get the currently active sidepanel tab
     * @returns Tab ID string or null if not found
     * @deprecated Use getActiveSidepanelTab from utils/getActiveSidepanelTab.js instead
     */
    // @ts-ignore - Unused method kept for potential future use
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getActiveSidepanelTab() {
        // Implementation kept for potential future use
        if (typeof document === 'undefined') {
            return null;
        }
        // Check tabContextManager first
        const win = typeof window !== 'undefined' ? window : null;
        const tabContextManager = win?.tabContextManager;
        if (tabContextManager?.getActiveTab) {
            const activeTab = tabContextManager.getActiveTab();
            if (activeTab) {
                return activeTab;
            }
        }
        // Fallback: check DOM for active tab
        const activeTab = document.querySelector('.main-nav-tab.active');
        const tabId = activeTab?.getAttribute('data-tab');
        return tabId || null;
    }
}
