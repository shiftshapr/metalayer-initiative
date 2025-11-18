/**
 * TabIdManager - Chrome Tab ID Management
 * Provides utilities for getting and managing Chrome tab IDs
 * TypeScript + ES6 Module
 */
class TabIdManager {
    constructor() {
        this.currentTabId = null;
        this.tabIdPromise = null;
        this.currentTabId = null;
        this.tabIdPromise = null;
    }
    /**
     * Get the current Chrome tab ID
     * @returns {Promise<number|null>} Tab ID (integer) or null if unavailable
     */
    async getCurrentTabId() {
        // Return cached value if available
        if (this.currentTabId !== null) {
            return this.currentTabId;
        }
        // Return existing promise if already fetching
        if (this.tabIdPromise) {
            return this.tabIdPromise;
        }
        // Fetch tab ID
        this.tabIdPromise = this._fetchTabId();
        const tabId = await this.tabIdPromise;
        this.currentTabId = tabId;
        return tabId;
    }
    /**
     * Internal method to fetch tab ID from Chrome API
     * @private
     */
    async _fetchTabId() {
        try {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                const tabs = await new Promise((resolve) => {
                    chrome.tabs.query({ active: true, currentWindow: true }, resolve);
                });
                if (tabs && tabs.length > 0 && tabs[0].id) {
                    return tabs[0].id; // Returns integer
                }
            }
            return null;
        }
        catch (error) {
            console.error('Error getting Chrome tab ID:', error);
            return null;
        }
    }
    /**
     * Refresh the cached tab ID (useful when tab changes)
     */
    async refreshTabId() {
        this.currentTabId = null;
        this.tabIdPromise = null;
        return this.getCurrentTabId();
    }
    /**
     * Clear cached tab ID
     */
    clearCache() {
        this.currentTabId = null;
        this.tabIdPromise = null;
    }
}
// Create singleton instance
const tabIdManagerInstance = new TabIdManager();
// Export as ES6 module
export { TabIdManager, tabIdManagerInstance };
export default TabIdManager;
// Note: Window exports will be added in compiled JS for backward compatibility
// TypeScript source uses pure ES6 exports only
//# sourceMappingURL=TabIdManager.js.map