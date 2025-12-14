/**
 * TabStateManager - TypeScript ES6 Module
 * Manages tab loading states and coordinates theme isolation
 */
import { Logger } from '../../utils/Logger.js';
import { TabOperation } from './TabOperations.js';
/**
 * TabStateManager
 * Manages tab loading states and prevents theme pollution during operations
 */
export class TabStateManager {
    constructor(logger = Logger) {
        this.loadingStates = new Map();
        this.loadedTabs = new Set();
        this.themeChangeInProgress = false;
        // Security: Memory limits to prevent DoS attacks
        this.MAX_LOADING_STATES = 50;
        this.MAX_LOADED_TABS = 20;
        this.VALID_TAB_IDS = new Set([
            'discuss-tab', 'visibility-tab', 'rooms-tab', 'people-tab',
            'agent-tab', 'timelines-tab', 'settings-tab', 'manage-tab'
        ]);
        this.logger = logger;
        this.logger.debug?.('TabStateManager: Initialized');
    }
    /**
     * Check if tab content is currently loading
     */
    isTabLoading(tabId) {
        return this.loadingStates.get(tabId) || false;
    }
    /**
     * Check if tab content has been loaded in this session
     */
    isTabLoaded(tabId) {
        return this.loadedTabs.has(tabId);
    }
    /**
     * Mark tab as loading/loaded with security validation
     */
    setTabLoading(tabId, loading) {
        // Security: Validate tabId to prevent injection attacks
        if (!this.VALID_TAB_IDS.has(tabId)) {
            this.logger.warn?.(`SECURITY: Invalid tabId rejected in setTabLoading: ${tabId}`);
            return;
        }
        // Security: Prevent memory exhaustion attacks
        if (loading && this.loadingStates.size >= this.MAX_LOADING_STATES) {
            this.logger.error?.(`SECURITY: Maximum loading states exceeded (${this.MAX_LOADING_STATES}), rejecting: ${tabId}`);
            return;
        }
        if (!loading && this.loadedTabs.size >= this.MAX_LOADED_TABS) {
            // Security: Clean up old loaded tabs to prevent memory accumulation
            const oldestTabs = Array.from(this.loadedTabs).slice(0, this.loadedTabs.size - this.MAX_LOADED_TABS + 1);
            oldestTabs.forEach(oldTab => this.loadedTabs.delete(oldTab));
            this.logger.debug?.(`SECURITY: Cleaned up ${oldestTabs.length} old loaded tabs to prevent memory exhaustion`);
        }
        if (loading) {
            this.loadingStates.set(tabId, true);
            this.logger.debug?.(`🔄 TabStateManager: Started loading tab ${tabId}`);
        }
        else {
            this.loadingStates.set(tabId, false);
            this.loadedTabs.add(tabId);
            this.logger.debug?.(`✅ TabStateManager: Finished loading tab ${tabId}`);
        }
    }
    /**
     * Determine if tab should be loaded based on operation type
     */
    shouldLoadTab(tabId, operation) {
        switch (operation) {
            case TabOperation.LOAD:
                // Always load for LOAD operations (initialization, explicit loads)
                return true;
            case TabOperation.SWITCH:
                // Load for SWITCH operations only if tab was never loaded before
                return !this.isTabLoaded(tabId);
            case TabOperation.REFRESH:
                // Always load for REFRESH operations (force reload)
                return true;
            default:
                this.logger.warn?.(`⚠️ TabStateManager: Unknown operation ${operation}, defaulting to false`);
                return false;
        }
    }
    /**
     * Get loading operation description for logging
     */
    getOperationDescription(operation) {
        switch (operation) {
            case TabOperation.LOAD:
                return 'LOAD (first-time content loading)';
            case TabOperation.SWITCH:
                return 'SWITCH (UI-only tab change)';
            case TabOperation.REFRESH:
                return 'REFRESH (force content reload)';
            default:
                return `UNKNOWN (${operation})`;
        }
    }
    /**
     * Check if theme change is in progress
     */
    isThemeChanging() {
        return this.themeChangeInProgress;
    }
    /**
     * Mark theme change as in progress - ROOT CAUSE FIX for theme pollution
     */
    setThemeChanging(changing) {
        // ROOT CAUSE FIX: Prevent theme changes during tab operations
        const win = typeof window !== 'undefined' ? window : null;
        const tabManager = win?.tabContextManager;
        if (changing && tabManager?.operationInProgress) {
            this.logger?.warn?.('THEME_POLLUTION_PREVENTED', {
                message: 'Theme change blocked during tab operation to prevent pollution',
                operationInProgress: tabManager.operationInProgress
            });
            return; // Block theme change during tab operations
        }
        this.themeChangeInProgress = changing;
        if (changing) {
            this.logger.debug?.('🎨 TabStateManager: Theme change started');
        }
        else {
            this.logger.debug?.('🎨 TabStateManager: Theme change completed');
        }
    }
    /**
     * Get comprehensive state for diagnostics
     */
    getState() {
        return {
            loadingStates: Object.fromEntries(this.loadingStates),
            loadedTabs: Array.from(this.loadedTabs),
            themeChangeInProgress: this.themeChangeInProgress,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Validate operation against current state
     */
    validateOperation(tabId, operation) {
        // Security: Validate tabId is in whitelist
        if (!this.VALID_TAB_IDS.has(tabId)) {
            return {
                valid: false,
                reason: 'Invalid tab identifier'
            };
        }
        // Security: Validate operation enum
        const validOperations = Object.values(TabOperation);
        if (!validOperations.includes(operation)) {
            return {
                valid: false,
                reason: 'Invalid operation type'
            };
        }
        // Prevent loading if already loading (except for REFRESH)
        if (operation !== TabOperation.REFRESH && this.isTabLoading(tabId)) {
            return {
                valid: false,
                reason: `Tab ${tabId} is already loading`
            };
        }
        // Prevent SWITCH if tab not loaded
        if (operation === TabOperation.SWITCH && !this.isTabLoaded(tabId)) {
            return {
                valid: false,
                reason: `Cannot SWITCH to unloaded tab ${tabId}`
            };
        }
        return { valid: true };
    }
    /**
     * Reset state (useful for testing or error recovery)
     */
    reset() {
        this.loadingStates.clear();
        this.loadedTabs.clear();
        this.themeChangeInProgress = false;
        this.logger.debug?.('🔄 TabStateManager: State reset');
    }
}
// Export singleton instance with immediate initialization
let tabStateManagerInstance = null;
export function getTabStateManager(logger) {
    if (!tabStateManagerInstance) {
        tabStateManagerInstance = new TabStateManager(logger);
    }
    return tabStateManagerInstance;
}
// CRITICAL FIX: Expose singleton immediately for browser compatibility
if (typeof window !== 'undefined') {
    // Ensure singleton is created and exposed immediately
    const instance = getTabStateManager();
    window.tabStateManager = instance;
    // Also expose constructor for legacy compatibility
    window.TabStateManager = TabStateManager;
}
//# sourceMappingURL=TabStateManager.js.map