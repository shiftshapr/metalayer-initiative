const INITIAL_COMMUNITY = 'comm-001';
export class BootController {
    constructor(graph, options) {
        this.graph = graph;
        this.options = options;
        this.currentUser = null;
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
            const isInitialized = await this.graph.stateManager.get('extension.isInitialized');
            if (isInitialized) {
                return;
            }
            await this.graph.stateManager.initialize({
                userAvatarBgColor: window?.AVATAR_FALLBACK_COLOR ?? '#7C3AED',
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
            this.graph.logger.error?.('STATE_INIT', { error });
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
            this.graph.logger.error?.('AUTH_INIT', { error });
        }
        this.graph.authManager.onAuthStateChange(async (user) => {
            await this.handleUserChange(user);
        });
        const initialUser = this.graph.authManager.getCurrentUser();
        await this.handleUserChange(initialUser);
    }
    async handleUserChange(user) {
        // ROOT CAUSE FIX: Convert Google ID to UUID BEFORE setting currentUser
        // Supabase auth user.id is NOT a UUID - it's a Google ID like "116467399993975200419"
        // We MUST get the AppUser UUID from backend before setting currentUser
        let userWithUUID = user;
        if (user && user.id && user.email) {
            // Check if user.id is a Google ID (not a UUID)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isGoogleId = /^\d{15,21}$/.test(user.id);
            
            if (isGoogleId || !uuidRegex.test(user.id)) {
                // This is a Google ID, we need to convert it to UUID
                try {
                    const api = this.graph.stateManager.getState('api') || window.api;
                    if (api && api.request) {
                        // Get or create AppUser - backend will return UUID
                        const appUserResponse = await api.request(`/v1/users/${encodeURIComponent(user.email)}`, {
                            method: 'POST',
                            body: JSON.stringify({
                                email: user.email,
                                name: user.name || user.userMetadata?.fullName || user.email.split('@')[0],
                                avatarUrl: user.picture || user.userMetadata?.avatarUrl
                            })
                        });
                        
                        const appUser = appUserResponse?.data || appUserResponse;
                        if (appUser && appUser.id) {
                            // AppUser.id is ALWAYS a UUID (from userService.getOrCreateUser)
                            userWithUUID = { ...user, id: appUser.id };
                            console.log('✅ BOOT: Converted Google ID to UUID:', user.id, '→', appUser.id);
                            
                            // Fetch complete user data with UUID
                            try {
                                const completeUserData = await api.request(`/v1/users/${appUser.id}`, {
                                    method: 'GET'
                                });
                                
                                if (completeUserData?.data) {
                                    userWithUUID = {
                                        ...userWithUUID,
                                        auraColor: completeUserData.data.auraColor || userWithUUID.auraColor,
                                        avatarUrl: completeUserData.data.avatarUrl || userWithUUID.avatarUrl
                                    };
                                }
                            } catch (err) {
                                console.warn('⚠️ BOOT: Failed to fetch complete user data:', err);
                            }
                        } else {
                            console.warn('⚠️ BOOT: Failed to get AppUser UUID, keeping Google ID (will cause 400 errors)');
                        }
                    } else {
                        console.warn('⚠️ BOOT: API not available, cannot convert Google ID to UUID');
                    }
                } catch (error) {
                    console.error('❌ BOOT: Error converting Google ID to UUID:', error);
                    // Continue with Google ID - will cause 400 errors but at least extension won't crash
                }
            }
        }
        
        this.currentUser = userWithUUID ?? null;
        // ROOT CAUSE FIX: Use stateManager only (TypeScript migration - no window.currentUser)
        await this.graph.stateManager.setState('currentUser', userWithUUID ?? null);
        if (!userWithUUID) {
            return;
        }
        const bootWin = window;
        if (bootWin.updateUI) {
            await bootWin.updateUI(userWithUUID);
        }
        await this.ensureCommunitiesInitialized();
        
        // RED-LINE: Only load chat history when on discuss tab, NEVER on visibility tab
        const activeSidepanelTab = this.getActiveSidepanelTab();
        if (activeSidepanelTab === 'discuss-tab' || activeSidepanelTab === null) {
            // Only load messages on discuss tab or if no tab is active (initial load)
            await this.options.loadChatHistory();
        }
        // Visibility tab should NEVER trigger message loading
        
        const urlData = await this.graph.stateManager.get('currentUrlData');
        await this.options.refreshVisibility(urlData?.pageId ?? null);
        await this.handlePendingContent();
        await this.options.realtimeController.handleAuthenticatedUser(user);
        this.options.setupTabNavigation();
        this.options.setupMessageInputEventListeners();
    }
    async ensureCommunitiesInitialized() {
        try {
            await this.graph.communitiesModule.initialize();
        }
        catch (error) {
            this.graph.logger.warn?.('COMMUNITIES_INIT', { error });
        }
    }
    setupEventBridges() {
        this.graph.eventBus.on('avatar:colorChanged', async (payload) => {
            if (!payload?.color) {
                return;
            }
            await this.graph.stateManager.setState('avatars.user.customColor', payload.color, true);
        });
    }
    async handlePendingContent() {
        try {
            const messageContent = await this.graph.stateManager.get('pendingMessageContent');
            const visibilityContent = await this.graph.stateManager.get('pendingVisibilityContent');
            if (messageContent) {
                const textarea = document.getElementById('chat-textarea');
                if (textarea) {
                    textarea.value = `Commenting on: \"${messageContent}\"`;
                    textarea.focus();
                    window?.autoResize?.(textarea);
                }
                await this.graph.stateManager.setState('pendingMessageContent', null);
                await this.graph.stateManager.setState('pendingMessageUri', null);
            }
            if (visibilityContent) {
                window?.showNotification?.('Visibility anchoring feature coming soon!');
                await this.graph.stateManager.setState('pendingVisibilityContent', null);
                await this.graph.stateManager.setState('pendingVisibilityUri', null);
            }
        }
        catch (error) {
            this.graph.logger.warn?.('PENDING_CONTENT', { error });
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
                const value = await this.graph.stateManager.get(key);
                if (value !== undefined) {
                    await this.graph.stateManager.setState(key, value);
                }
            }
        }
        catch (error) {
            this.graph.logger.error?.('MIGRATION', { error });
        }
    }
    async safeInitializeTheme() {
        try {
            await this.options.initializeTheme();
        }
        catch (error) {
            this.graph.logger.warn?.('THEME_INIT', { error });
        }
    }
    
    /**
     * Get the currently active sidepanel tab
     * @returns Tab ID string or null if not found
     */
    getActiveSidepanelTab() {
        if (typeof document === 'undefined') {
            return null;
        }
        
        // Check tabContextManager first
        const win = typeof window !== 'undefined' ? window : null;
        if (win?.tabContextManager?.getActiveTab) {
            const activeTab = win.tabContextManager.getActiveTab();
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
