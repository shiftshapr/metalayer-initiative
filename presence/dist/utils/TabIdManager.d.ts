/**
 * TabIdManager - Chrome Tab ID Management
 * Provides utilities for getting and managing Chrome tab IDs
 * TypeScript + ES6 Module
 */
declare class TabIdManager {
    private currentTabId;
    private tabIdPromise;
    constructor();
    /**
     * Get the current Chrome tab ID
     * @returns {Promise<number|null>} Tab ID (integer) or null if unavailable
     */
    getCurrentTabId(): Promise<number | null>;
    /**
     * Internal method to fetch tab ID from Chrome API
     * @private
     */
    private _fetchTabId;
    /**
     * Refresh the cached tab ID (useful when tab changes)
     */
    refreshTabId(): Promise<number | null>;
    /**
     * Clear cached tab ID
     */
    clearCache(): void;
}
declare const tabIdManagerInstance: TabIdManager;
export { TabIdManager, tabIdManagerInstance };
export default TabIdManager;
//# sourceMappingURL=TabIdManager.d.ts.map