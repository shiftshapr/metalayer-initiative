const INITIAL_COMMUNITY = 'comm-001';
export class BootController {
    constructor(graph, options) {
        this.currentUser = null;
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
        this.currentUser = user ?? null;
        // ROOT CAUSE FIX: Use stateManager only (TypeScript migration - no window.currentUser)
        await this.graph.stateManager.setState('currentUser', user ?? null);
        if (this.graph.visibilityManager && user?.email) {
            try {
                await this.graph.visibilityManager.initialize(user.email);
            }
            catch (error) {
                this.graph.logger?.warn?.('VISIBILITY_INIT', { error });
            }
        }
        if (!user) {
            return;
        }
        const bootWin = window;
        if (bootWin.updateUI) {
            await bootWin.updateUI(user);
        }
        await this.ensureCommunitiesInitialized();
        await this.options.loadChatHistory();
        const urlData = await this.graph.stateManager.getState('currentUrlData');
        const currentPageId = urlData?.pageId ?? null;
        if (currentPageId && this.graph.visibilityManager) {
            try {
                await this.graph.visibilityManager.refreshVisibilityAvatars(currentPageId);
            }
            catch (error) {
                this.graph.logger?.warn?.('VISIBILITY_REFRESH', { error });
            }
        }
        await this.options.refreshVisibility(currentPageId);
        await this.handlePendingContent();
        await this.options.realtimeController.handleAuthenticatedUser(user);
        this.options.setupTabNavigation();
        this.options.setupMessageInputEventListeners();
    }
    async ensureCommunitiesInitialized() {
        try {
            await this.graph.communitiesModule?.initialize();
        }
        catch (error) {
            this.graph.logger?.warn?.('COMMUNITIES_INIT', { error });
        }
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
}
