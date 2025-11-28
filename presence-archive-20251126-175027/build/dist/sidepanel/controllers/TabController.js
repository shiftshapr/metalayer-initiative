import { waitForCondition } from '../../utils/AsyncCoordination.js';
export class TabController {
    constructor(options) {
        this.options = options;
        this.onUpdated = this.handleTabUpdated.bind(this);
        this.onActivated = this.handleTabActivated.bind(this);
        this.initialized = false;
    }
    async initialize() {
        const tabsApi = this.getTabsApi();
        if (!tabsApi) {
            if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
                this.options.graph.logger.warn('TAB_CTRL_INIT', { reason: 'CHROME_TABS_UNAVAILABLE' });
            }
            return;
        }
        tabsApi.onUpdated.addListener(this.onUpdated);
        tabsApi.onActivated.addListener(this.onActivated);
        this.initialized = true;
        // BEST PRACTICE: Wait for dependencies using events/promises, not setTimeout delays
        // Wait for TabManager to be initialized before processing URLs
        await this.waitForTabManager();
        // Wait for communities to be ready (BootController should have initialized them)
        await this.ensureCommunitiesReady();
        // Now safe to capture active tab and process URL
        await this.captureActiveTab();
    }
    /**
     * Wait for TabManager to be initialized using event-based coordination
     * BEST PRACTICE: Use events instead of setTimeout delays
     */
    async waitForTabManager() {
        // Check if already initialized
        const win = typeof window !== 'undefined' ? window : null;
        if (win && 'tabContextManager' in win) {
            const tabManager = win.tabContextManager;
            if (tabManager?.getActiveTab) {
                // TabManager is ready
                if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
                    this.options.graph.logger.debug('TAB_CTRL_TAB_MANAGER_READY', { immediate: true });
                }
                return;
            }
        }
        // Wait for initialization event (max 5 seconds timeout)
        return new Promise((resolve) => {
            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
                        this.options.graph.logger.warn('TAB_CTRL_TAB_MANAGER_TIMEOUT', {
                            message: 'Timeout waiting for TabManager, proceeding anyway'
                        });
                    }
                    resolve();
                }
            }, 5000);
            const handler = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    if (typeof document !== 'undefined') {
                        document.removeEventListener('tabManager:initialized', handler);
                    }
                    if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
                        this.options.graph.logger.debug('TAB_CTRL_TAB_MANAGER_READY', { fromEvent: true });
                    }
                    resolve();
                }
            };
            if (typeof document !== 'undefined') {
                document.addEventListener('tabManager:initialized', handler, { once: true });
            }
            else {
                clearTimeout(timeout);
                resolve();
            }
        });
    }
    dispose() {
        if (!this.initialized)
            return;
        const tabsApi = this.getTabsApi();
        if (!tabsApi)
            return;
        tabsApi.onUpdated.removeListener(this.onUpdated);
        tabsApi.onActivated.removeListener(this.onActivated);
        this.initialized = false;
    }
    getTabsApi() {
        return typeof chrome !== 'undefined' && chrome.tabs ? chrome.tabs : null;
    }
    async handleTabUpdated(_tabId, changeInfo, tab) {
        if (changeInfo.status !== 'complete' || !tab?.url) {
            return;
        }
        await this.processUrl(tab.url);
    }
    async handleTabActivated() {
        try {
            const [tab] = await this.queryTabs({ active: true, currentWindow: true });
            if (tab?.url) {
                await this.processUrl(tab.url);
            }
        }
        catch (error) {
            if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
                this.options.graph.logger.warn('TAB_CTRL_ACTIVATED', { error });
            }
        }
    }
    async captureActiveTab() {
        try {
            const [tab] = await this.queryTabs({ active: true, currentWindow: true });
            if (tab?.url) {
                await this.processUrl(tab.url);
            }
        }
        catch (error) {
            if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
                this.options.graph.logger.warn('TAB_CTRL_CAPTURE', { error });
            }
        }
    }
    async processUrl(rawUrl) {
        if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
            this.options.graph.logger.debug('TAB_CTRL_PROCESS_URL', { rawUrl });
        }
        // ROOT CAUSE FIX: Skip chrome:// and chrome-extension:// URLs - they're not valid pages for messages
        if (rawUrl.startsWith('chrome://') || rawUrl.startsWith('chrome-extension://')) {
            if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
                this.options.graph.logger.debug('TAB_CTRL_SKIP_CHROME_URL', { rawUrl });
            }
            return;
        }
        const normalized = await this.normalizeUrl(rawUrl);
        await this.persistCurrentUrl(normalized);
        if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
            this.options.graph.logger.debug('TAB_CTRL_URL_NORMALIZED', { normalized });
        }
        // ROOT CAUSE FIX: Ensure communities are initialized before loading messages
        // This prevents race condition where TabController processes URL before BootController initializes communities
        await this.ensureCommunitiesReady();
        // ROOT CAUSE FIX: Always trigger message loading when URL is processed
        // This ensures messages load automatically on page navigation
        if (this.options.messageLoadingService) {
            // Service enforces tab checks automatically
            if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
                this.options.graph.logger.debug('TAB_CTRL_CALLING_MESSAGE_SERVICE', { rawUrl: normalized.rawUrl, pageId: normalized.pageId });
            }
            try {
                await this.options.messageLoadingService.loadMessages(normalized.rawUrl);
            }
            catch (error) {
                if (this.options.graph.logger && typeof this.options.graph.logger.error === 'function') {
                    this.options.graph.logger.error('TAB_CTRL_MESSAGE_LOAD_ERROR', { error, rawUrl: normalized.rawUrl });
                }
            }
        }
        else {
            // Fallback: manual guard (for backward compatibility during migration)
            const activeSidepanelTab = this.getActiveSidepanelTab();
            if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
                this.options.graph.logger.debug('TAB_CTRL_FALLBACK_LOAD', { activeSidepanelTab, rawUrl: normalized.rawUrl });
            }
            if (activeSidepanelTab === 'discuss-tab' || activeSidepanelTab === null) {
                try {
                    await this.options.loadChatHistory(normalized.rawUrl);
                }
                catch (error) {
                    if (this.options.graph.logger && typeof this.options.graph.logger.error === 'function') {
                        this.options.graph.logger.error('TAB_CTRL_FALLBACK_LOAD_ERROR', { error, rawUrl: normalized.rawUrl });
                    }
                }
            }
        }
        if (normalized.pageId) {
            await this.options.refreshVisibility(normalized.pageId);
        }
        if (this.options.realtimeController.handlePageChange && typeof this.options.realtimeController.handlePageChange === 'function') {
            await this.options.realtimeController.handlePageChange(normalized);
        }
    }
    /**
     * Ensure communities are initialized before processing URLs
     * Prevents race condition where TabController processes URL before communities are ready
     * BEST PRACTICE: Uses waitForCondition instead of setTimeout delays
     */
    async ensureCommunitiesReady() {
        try {
            // Check if communities module exists and initialize if needed
            if (this.options.graph.communitiesModule) {
                await this.options.graph.communitiesModule.initialize();
            }
            // Wait for active communities to be available in state (with timeout)
            // BEST PRACTICE: Use waitForCondition instead of setTimeout loop
            try {
                await waitForCondition(() => {
                    const activeCommunities = this.options.graph.stateManager.getState('ui.activeCommunities');
                    return activeCommunities !== null && Array.isArray(activeCommunities) && activeCommunities.length > 0;
                }, { timeout: 1000, interval: 100 } // 1 second timeout, check every 100ms
                );
                // Communities are ready
                if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
                    this.options.graph.logger.debug('TAB_CTRL_COMMUNITIES', { message: 'Communities ready' });
                }
            }
            catch (timeoutError) {
                // If still no communities after timeout, that's okay - loadChatHistory will use Public Square UUID fallback
                if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
                    this.options.graph.logger.debug('TAB_CTRL_COMMUNITIES', { message: 'No active communities found after timeout, proceeding with fallback' });
                }
            }
        }
        catch (error) {
            // Don't block URL processing if community check fails
            if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
                this.options.graph.logger.warn('TAB_CTRL_COMMUNITIES', { error });
            }
        }
    }
    /**
     * Get the currently active sidepanel tab
     * @returns Tab ID string or null if not found
     * @deprecated Use getActiveSidepanelTab from utils/getActiveSidepanelTab.js instead
     */
    getActiveSidepanelTab() {
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
    async normalizeUrl(rawUrl) {
        try {
            const win = window;
            if (win.normalizeUrl && typeof win.normalizeUrl === 'function') {
                const result = await win.normalizeUrl(rawUrl);
                return {
                    rawUrl,
                    normalizedUrl: result.normalizedUrl ?? rawUrl,
                    pageId: result.pageId ?? rawUrl,
                    canonicalUrl: result.normalizedUrl ?? rawUrl
                };
            }
            // Fallback if normalizeUrl not available
            return {
                rawUrl,
                normalizedUrl: rawUrl,
                pageId: rawUrl.replace(/[^a-zA-Z0-9]/g, '_')
            };
        }
        catch {
            return {
                rawUrl,
                normalizedUrl: rawUrl,
                pageId: rawUrl.replace(/[^a-zA-Z0-9]/g, '_')
            };
        }
    }
    async persistCurrentUrl(urlData) {
        await this.options.graph.stateManager.setState('currentUrlData', urlData);
        if (typeof window !== 'undefined') {
            window.currentUrlData = urlData;
        }
    }
    async queryTabs(queryInfo) {
        const tabsApi = this.getTabsApi();
        if (!tabsApi)
            return [];
        return new Promise(resolve => tabsApi.query(queryInfo, resolve));
    }
}
//# sourceMappingURL=TabController.js.map