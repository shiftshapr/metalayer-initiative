/**
 * Tab Configuration Service
 * Manages tab state, order, visibility, and tracking (currentTab/previousTab)
 */
import { TabManagerState, TabConfig } from './types.js';
import { Logger } from '../../utils/Logger.js';
export declare class TabConfiguration {
    private state;
    private logger;
    private storageKey;
    private eventListeners;
    private preferencesManager;
    constructor(logger?: typeof Logger);
    /**
     * Set preferences manager instance
     */
    setPreferencesManager(manager: {
        initialize: (userId: string) => Promise<boolean>;
        getPreference: (key: string) => Promise<string | number | boolean | null>;
        savePreference: (key: string, value: string | number | boolean, options?: {
            skipDatabase?: boolean;
            batch?: boolean;
        }) => Promise<boolean>;
        savePreferences: (preferences: Record<string, string | number | boolean>, options?: {
            skipDatabase?: boolean;
            batch?: boolean;
        }) => Promise<Record<string, boolean>>;
        isInitialized: boolean;
        [key: string]: unknown;
    }): void;
    /**
     * Initialize configuration from storage or use defaults
     */
    initialize(): Promise<void>;
    /**
     * Get current tab state
     */
    getCurrentTab(): string | null;
    /**
     * Get previous tab state
     */
    getPreviousTab(): string | null;
    /**
     * Switch to a tab (updates currentTab and previousTab)
     */
    switchToTab(tabId: string): Promise<void>;
    /**
     * Get all tabs
     */
    getTabs(): TabConfig[];
    /**
     * Get visible tabs (sorted by order)
     * Excludes manage-tab from the visible tabs list (it's always shown separately at the end)
     */
    getVisibleTabs(): TabConfig[];
    /**
     * Get tab by ID
     */
    getTabById(tabId: string): TabConfig | undefined;
    /**
     * Update tab order
     */
    updateTabOrder(tabId: string, newOrder: number): Promise<void>;
    /**
     * Update tab visibility
     */
    setTabVisibility(tabId: string, visible: boolean): Promise<void>;
    /**
     * Set number of visible tabs
     */
    setVisibleTabCount(count: number): Promise<void>;
    /**
     * Add a new tab (for SDK apps)
     */
    addTab(tab: TabConfig): Promise<void>;
    /**
     * Remove a tab (only SDK apps, not built-in)
     */
    removeTab(tabId: string): Promise<void>;
    /**
     * Get current state
     */
    getState(): TabManagerState;
    /**
     * Load state from storage (preferences manager or chrome.storage.local fallback)
     */
    private loadFromStorage;
    /**
     * Validate and merge loaded state with defaults
     */
    private validateAndMergeState;
    /**
     * Persist state to storage (preferences manager or chrome.storage.local fallback)
     */
    private persistState;
    /**
     * Event emitter methods
     */
    on(event: string, callback: (data: unknown) => void): void;
    off(event: string, callback: (data: unknown) => void): void;
    private emit;
}
//# sourceMappingURL=TabConfiguration.d.ts.map