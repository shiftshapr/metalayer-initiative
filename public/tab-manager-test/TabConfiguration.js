/**
 * Tab Configuration Service
 * Manages tab state, order, visibility, and tracking (currentTab/previousTab)
 */
import { DEFAULT_STATE } from './types.js';
import { Logger } from './utils/Logger.js';
export class TabConfiguration {
    constructor(logger = Logger) {
        this.storageKey = 'tabManagerConfig';
        this.eventListeners = new Map();
        this.logger = logger;
        this.state = { ...DEFAULT_STATE };
    }
    /**
     * Initialize configuration from storage or use defaults
     */
    async initialize() {
        try {
            const stored = await this.loadFromStorage();
            if (stored !== null) {
                this.state = stored;
                this.logger.debug?.('✅ TabConfiguration: Loaded from storage');
            }
            else {
                this.state = { ...DEFAULT_STATE };
                await this.persistState();
                this.logger.debug?.('✅ TabConfiguration: Using default state');
            }
        }
        catch (error) {
            this.logger.error?.('❌ TabConfiguration: Failed to initialize', error);
            this.state = { ...DEFAULT_STATE };
        }
    }
    /**
     * Get current tab state
     */
    getCurrentTab() {
        return this.state.currentTab;
    }
    /**
     * Get previous tab state
     */
    getPreviousTab() {
        return this.state.previousTab;
    }
    /**
     * Switch to a tab (updates currentTab and previousTab)
     */
    async switchToTab(tabId) {
        const currentTab = this.state.currentTab;
        // Update state: previousTab gets current currentTab, currentTab gets new tabId
        this.state.previousTab = currentTab; // Current becomes previous
        this.state.currentTab = tabId; // New tab becomes current
        // Persist to storage
        await this.persistState();
        // Emit event for other modules
        this.emit('tabSwitched', {
            currentTab: tabId,
            previousTab: currentTab
        });
        this.logger.debug?.(`✅ TabConfiguration: Switched to tab ${tabId} (previous: ${currentTab})`);
    }
    /**
     * Get all tabs
     */
    getTabs() {
        return [...this.state.tabs];
    }
    /**
     * Get visible tabs (sorted by order)
     */
    getVisibleTabs() {
        return this.state.tabs
            .filter(tab => tab.visible)
            .sort((a, b) => a.order - b.order)
            .slice(0, this.state.visibleTabCount);
    }
    /**
     * Get tab by ID
     */
    getTabById(tabId) {
        return this.state.tabs.find(tab => tab.id === tabId);
    }
    /**
     * Update tab order
     */
    async updateTabOrder(tabId, newOrder) {
        const tab = this.getTabById(tabId);
        if (!tab) {
            this.logger.warn?.(`⚠️ TabConfiguration: Tab ${tabId} not found`);
            return;
        }
        // Get all tabs sorted by current order
        const sortedTabs = [...this.state.tabs].sort((a, b) => a.order - b.order);
        // Remove the dragged tab from its current position
        const draggedTab = sortedTabs.find(t => t.id === tabId);
        if (!draggedTab)
            return;
        const filteredTabs = sortedTabs.filter(t => t.id !== tabId);
        // Insert at new position
        filteredTabs.splice(newOrder, 0, draggedTab);
        // Update order values
        filteredTabs.forEach((t, index) => {
            t.order = index;
        });
        this.state.tabs = filteredTabs;
        await this.persistState();
        this.emit('tabOrderChanged', { tabId, newOrder });
    }
    /**
     * Update tab visibility
     */
    async setTabVisibility(tabId, visible) {
        const tab = this.getTabById(tabId);
        if (!tab) {
            this.logger.warn?.(`⚠️ TabConfiguration: Tab ${tabId} not found`);
            return;
        }
        tab.visible = visible;
        await this.persistState();
        this.emit('tabVisibilityChanged', { tabId, visible });
    }
    /**
     * Set number of visible tabs
     */
    async setVisibleTabCount(count) {
        if (count < 1 || count > this.state.userTabLimit) {
            this.logger.warn?.(`⚠️ TabConfiguration: Invalid tab count ${count}`);
            return;
        }
        this.state.visibleTabCount = count;
        await this.persistState();
        this.emit('visibleTabCountChanged', { count });
    }
    /**
     * Add a new tab (for SDK apps)
     */
    async addTab(tab) {
        // Check if tab already exists
        if (this.getTabById(tab.id)) {
            this.logger.warn?.(`⚠️ TabConfiguration: Tab ${tab.id} already exists`);
            return;
        }
        // Set order to end of list
        tab.order = this.state.tabs.length;
        this.state.tabs.push(tab);
        await this.persistState();
        this.emit('tabAdded', { tab });
    }
    /**
     * Remove a tab (only SDK apps, not built-in)
     */
    async removeTab(tabId) {
        const tab = this.getTabById(tabId);
        if (!tab) {
            this.logger.warn?.(`⚠️ TabConfiguration: Tab ${tabId} not found`);
            return;
        }
        if (tab.builtIn) {
            this.logger.warn?.(`⚠️ TabConfiguration: Cannot remove built-in tab ${tabId}`);
            return;
        }
        this.state.tabs = this.state.tabs.filter(t => t.id !== tabId);
        // Reorder remaining tabs
        this.state.tabs.forEach((t, index) => {
            t.order = index;
        });
        await this.persistState();
        this.emit('tabRemoved', { tabId });
    }
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Load state from chrome.storage.local
     */
    async loadFromStorage() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.storageKey], (result) => {
                if (result[this.storageKey]) {
                    resolve(result[this.storageKey]);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    /**
     * Persist state to chrome.storage.local
     */
    async persistState() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [this.storageKey]: this.state }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)?.add(callback);
    }
    off(event, callback) {
        this.eventListeners.get(event)?.delete(callback);
    }
    emit(event, data) {
        this.eventListeners.get(event)?.forEach(callback => {
            try {
                callback(data);
            }
            catch (error) {
                this.logger.error?.(`❌ TabConfiguration: Error in event listener for ${event}`, error);
            }
        });
    }
}
