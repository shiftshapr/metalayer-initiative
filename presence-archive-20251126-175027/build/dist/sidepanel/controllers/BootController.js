const INITIAL_COMMUNITY = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4';
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
        // BEST PRACTICE: Don't use setTimeout delays - TabController will handle URL processing
        // BootController's job is to initialize auth and communities, not trigger message loading
        // Message loading is TabController's responsibility after URL is processed
    }
    exposeCompatibilityAPI() {
        if (typeof window === 'undefined') {
            return;
        }
        const bootWin = window;
        bootWin.handlePendingContent = () => this.handlePendingContent();
        bootWin.startPresenceTracking = () => this.options.realtimeController.startForCurrentPage();
        bootWin.migrateFromChromeStorage = () => this.migrateFromChromeStorage();
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
                activeCommunities: [INITIAL_COMMUNITY],
                primaryCommunity: INITIAL_COMMUNITY,
                currentCommunity: INITIAL_COMMUNITY,
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
        try {
            await this.graph.authManager.initialize();
        }
        catch (error) {
            this.graph.logger?.error?.('AUTH_INIT', { error });
        }
        this.graph.authManager.onAuthStateChange(async (user) => {
            await this.handleUserChange(user);
        });
        const initialUser = this.graph.authManager.getCurrentUser();
        await this.handleUserChange(initialUser);
    }
    async handleUserChange(user) {
        // ROOT CAUSE FIX: Use stateManager only (TypeScript migration - no window.currentUser)
        await this.graph.stateManager.setState('currentUser', user ?? null);
        if (!user) {
            return;
        }
        // ROOT CAUSE FIX: Auth flow provides Google ID, not AppUser UUID
        // Look up AppUser UUID from email if user.id is not a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        let appUserUUID = user.id && uuidRegex.test(user.id) ? user.id : null;
        // If user.id is not a UUID (e.g., Google ID), look up AppUser UUID from email
        if (!appUserUUID && user.email && this.graph.supabaseService) {
            try {
                const client = this.graph.supabaseService.getClient();
                if (client) {
                    const { data, error } = await client
                        .from('AppUser')
                        .select('id')
                        .eq('email', user.email)
                        .single();
                    if (!error && data?.id) {
                        appUserUUID = data.id;
                        // Update user.id to AppUser UUID
                        user.id = appUserUUID;
                        // Update state with corrected user
                        await this.graph.stateManager.setState('currentUser', user);
                        this.graph.logger?.info?.('AUTH_UUID_FIX', {
                            message: 'Looked up AppUser UUID from email',
                            email: user.email,
                            appUserUUID: appUserUUID,
                            originalId: user.id
                        });
                    }
                    else {
                        this.graph.logger?.warn?.('AUTH_UUID_FIX', {
                            message: 'Could not find AppUser UUID for email',
                            email: user.email,
                            error: error?.message
                        });
                    }
                }
            }
            catch (error) {
                this.graph.logger?.error?.('AUTH_UUID_FIX', {
                    error,
                    message: 'Exception looking up AppUser UUID',
                    email: user.email
                });
            }
        }
        // REFACTOR PHASE 1: Single Initialization Point
        // This is the ONLY place where VisibilityManager.initialize() is called
        // All other initialization attempts have been removed (buildGraph, createVisibilityRefresher)
        if (this.graph.visibilityManager) {
            const status = this.graph.visibilityManager.getStatus();
            // Only initialize if not already active (initialization guard in VisibilityManager also prevents double-init)
            if (!status.isActive) {
                if (!appUserUUID) {
                    this.graph.logger?.warn?.('VISIBILITY_INIT', {
                        message: 'Cannot initialize VisibilityManager - no AppUser UUID available',
                        userEmail: user.email,
                        hasUserId: !!user.id
                    });
                    return; // Cannot initialize without UUID
                }
                try {
                    // This is the ONLY initialization call in the entire codebase
                    await this.graph.visibilityManager.initialize(appUserUUID);
                    this.graph.logger?.info?.('VISIBILITY_INIT', {
                        message: 'VisibilityManager initialized successfully (single initialization point)',
                        appUserUUID: appUserUUID,
                        userEmail: user.email
                    });
                }
                catch (error) {
                    this.graph.logger?.error?.('VISIBILITY_INIT', {
                        error,
                        message: 'Failed to initialize VisibilityManager in handleUserChange',
                        appUserUUID: appUserUUID,
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
//# sourceMappingURL=BootController.js.map