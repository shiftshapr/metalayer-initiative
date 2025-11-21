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
        const normalized = await this.normalizeUrl(rawUrl);
        await this.persistCurrentUrl(normalized);
        await this.options.loadChatHistory(normalized.rawUrl);
        if (normalized.pageId) {
            await this.options.refreshVisibility(normalized.pageId);
        }
        if (this.options.realtimeController.handlePageChange && typeof this.options.realtimeController.handlePageChange === 'function') {
            await this.options.realtimeController.handlePageChange(normalized);
        }
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
