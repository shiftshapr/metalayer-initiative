import UrlNormalization from '../../utils/UrlNormalization.js';
const normalizer = new UrlNormalization();
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
            this.options.graph.logger.warn?.('TAB_CTRL_INIT', { reason: 'CHROME_TABS_UNAVAILABLE' });
            return;
        }
        tabsApi.onUpdated.addListener(this.onUpdated);
        tabsApi.onActivated.addListener(this.onActivated);
        this.initialized = true;
        await this.captureActiveTab();
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
    async handleTabUpdated(tabId, changeInfo, tab) {
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
            this.options.graph.logger.warn?.('TAB_CTRL_ACTIVATED', { error });
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
            this.options.graph.logger.warn?.('TAB_CTRL_CAPTURE', { error });
        }
    }
    async processUrl(rawUrl) {
        const normalized = this.normalizeUrl(rawUrl);
        await this.persistCurrentUrl(normalized);
        
        // RED-LINE: Only load chat history when on discuss tab, NEVER on visibility tab
        const activeSidepanelTab = this.getActiveSidepanelTab();
        if (activeSidepanelTab === 'discuss-tab' || activeSidepanelTab === null) {
            // Only load messages on discuss tab or if no tab is active (initial load)
            await this.options.loadChatHistory(normalized.rawUrl);
        }
        // Visibility tab should NEVER trigger message loading
        
        await this.options.refreshVisibility(normalized.pageId);
        await this.options.realtimeController.handlePageChange(normalized);
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
    normalizeUrl(rawUrl) {
        try {
            const result = normalizer.normalizeUrl(rawUrl);
            return {
                rawUrl,
                normalizedUrl: result.normalizedUrl ?? rawUrl,
                pageId: result.pageId ?? rawUrl,
                canonicalUrl: result.normalizedUrl ?? rawUrl
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
