/**
 * Tab Configuration Service
 * Manages tab state, order, visibility, and tracking (currentTab/previousTab)
 */
import { DEFAULT_STATE } from './types';
import { Logger } from '../../utils/Logger.js';
import { handleError } from '../../utils/ErrorHandler.js';
import { userPreferencesManager } from '../../utils/UserPreferencesManager.js';
export class TabConfiguration {
    constructor(logger = Logger) {
        this.storageKey = 'tabManagerConfig';
        this.eventListeners = new Map();
        this.preferencesManager = null;
        this.logger = logger;
        this.state = { ...DEFAULT_STATE };
    }
    /**
     * Set preferences manager instance
     */
    setPreferencesManager(manager) {
        this.preferencesManager = manager;
    }
    /**
     * Add default built-in tabs
     */
    async addDefaultTabs() {
        const defaultTabs = [
            {
                id: 'discuss-tab',
                label: 'Discuss',
                icon: '💬',
                visible: true,
                builtIn: true,
                order: 0,
                tabContentId: 'discuss-tab'
            },
            {
                id: 'visibility-tab',
                label: 'Visibility',
                icon: '👁️',
                visible: true,
                builtIn: true,
                order: 1,
                tabContentId: 'visibility-tab'
            },
            {
                id: 'rooms-tab',
                label: 'Rooms',
                icon: '🏠',
                visible: true,
                builtIn: true,
                order: 2,
                tabContentId: 'rooms-tab'
            },
            {
                id: 'people-tab',
                label: 'People',
                icon: '👥',
                visible: true,
                builtIn: true,
                order: 3,
                tabContentId: 'people-tab'
            },
            {
                id: 'agent-tab',
                label: 'Agent',
                icon: '🤖',
                visible: true,
                builtIn: true,
                order: 4,
                tabContentId: 'agent-tab'
            },
            {
                id: 'settings-tab',
                label: 'Settings',
                icon: '⚙️',
                visible: true,
                builtIn: true,
                order: 5,
                tabContentId: 'settings-tab'
            }
        ];
        for (const tab of defaultTabs) {
            this.state.tabs.push(tab);
        }
        this.state.visibleTabCount = defaultTabs.length;
        this.logger.debug?.(`✅ TabConfiguration: Added ${defaultTabs.length} default tabs`);
    }
    /**
     * Initialize configuration from storage or use defaults
     */
    async initialize() {
        try {
            // Set preferences manager from ES6 import
            if (!this.preferencesManager) {
                this.preferencesManager = userPreferencesManager;
            }
            const stored = await this.loadFromStorage();
            if (stored !== null) {
                this.state = stored;
                this.logger.debug?.('✅ TabConfiguration: Loaded from storage');
            }
            else {
                this.state = { ...DEFAULT_STATE };
                // Add default tabs
                await this.addDefaultTabs();
                await this.persistState();
                this.logger.debug?.('✅ TabConfiguration: Using default state with tabs');
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
        try {
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
        catch (error) {
            handleError(error, {
                context: { operation: 'switchToTab', component: 'TabConfiguration', tabId }
            });
        }
    }
    /**
     * Get all tabs
     */
    getTabs() {
        return [...this.state.tabs];
    }
    /**
     * Get visible tabs (sorted by order)
     * Excludes manage-tab since it's permanent and always shown separately
     */
    getVisibleTabs() {
        return this.state.tabs
            .filter((tab) => tab.visible && tab.id !== 'manage-tab')
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .slice(0, this.state.visibleTabCount);
    }
    /**
     * Get tab by ID
     */
    getTabById(tabId) {
        return this.state.tabs.find((tab) => tab.id === tabId);
    }
    /**
     * Update tab order
     */
    async updateTabOrder(tabId, newOrder) {
        try {
            const tab = this.getTabById(tabId);
            if (!tab) {
                this.logger.warn?.(`⚠️ TabConfiguration: Tab ${tabId} not found`);
                return;
            }
            // Get all tabs sorted by current order
            const sortedTabs = [...this.state.tabs].sort((a, b) => (a.order || 0) - (b.order || 0));
            // Remove the dragged tab from its current position
            const draggedTab = sortedTabs.find(t => t.id === tabId);
            if (!draggedTab)
                return;
            const filteredTabs = sortedTabs.filter((t) => t.id !== tabId);
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
        catch (error) {
            handleError(error, {
                context: { operation: 'updateTabOrder', component: 'TabConfiguration', tabId, newOrder }
            });
        }
    }
    /**
     * Update tab visibility
     */
    async setTabVisibility(tabId, visible) {
        try {
            const tab = this.getTabById(tabId);
            if (!tab) {
                this.logger.warn?.(`⚠️ TabConfiguration: Tab ${tabId} not found`);
                return;
            }
            tab.visible = visible;
            await this.persistState();
            this.emit('tabVisibilityChanged', { tabId, visible });
        }
        catch (error) {
            handleError(error, {
                context: { operation: 'setTabVisibility', component: 'TabConfiguration', tabId, visible }
            });
        }
    }
    /**
     * Set number of visible tabs
     */
    async setVisibleTabCount(count) {
        try {
            if (count < 1 || count > this.state.userTabLimit) {
                this.logger.warn?.(`⚠️ TabConfiguration: Invalid tab count ${count}`);
                return;
            }
            this.state.visibleTabCount = count;
            await this.persistState();
            this.emit('visibleTabCountChanged', { count });
        }
        catch (error) {
            handleError(error, {
                context: { operation: 'setVisibleTabCount', component: 'TabConfiguration', count }
            });
        }
    }
    /**
     * Add a new tab (for SDK apps)
     */
    async addTab(tab) {
        try {
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
        catch (error) {
            handleError(error, {
                context: { operation: 'addTab', component: 'TabConfiguration', tabId: tab.id }
            });
        }
    }
    /**
     * Remove a tab (only SDK apps, not built-in)
     */
    async removeTab(tabId) {
        try {
            const tab = this.getTabById(tabId);
            if (!tab) {
                this.logger.warn?.(`⚠️ TabConfiguration: Tab ${tabId} not found`);
                return;
            }
            if (tab.builtIn) {
                this.logger.warn?.(`⚠️ TabConfiguration: Cannot remove built-in tab ${tabId}`);
                return;
            }
            this.state.tabs = this.state.tabs.filter((t) => t.id !== tabId);
            // Reorder remaining tabs
            this.state.tabs.forEach((t, index) => {
                t.order = index;
            });
            await this.persistState();
            this.emit('tabRemoved', { tabId });
        }
        catch (error) {
            handleError(error, {
                context: { operation: 'removeTab', component: 'TabConfiguration', tabId }
            });
        }
    }
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Load state from storage (preferences manager or chrome.storage.local fallback)
     */
    async loadFromStorage() {
        // Try preferences manager first (includes database)
        if (this.preferencesManager) {
            try {
                const stored = await this.preferencesManager.getPreference('tabConfiguration');
                if (stored && typeof stored === 'string') {
                    // Parse JSON string if stored as string
                    try {
                        const parsed = JSON.parse(stored);
                        const loaded = this.validateAndMergeState(parsed);
                        this.logger.debug?.('✅ TabConfiguration: Loaded from preferences manager');
                        return loaded;
                    }
                    catch (parseError) {
                        this.logger.warn?.('⚠️ TabConfiguration: Failed to parse stored configuration', parseError);
                    }
                }
                else if (stored && typeof stored === 'object') {
                    // Validate and merge with defaults
                    const loaded = this.validateAndMergeState(stored);
                    this.logger.debug?.('✅ TabConfiguration: Loaded from preferences manager');
                    return loaded;
                }
            }
            catch (error) {
                this.logger.warn?.('⚠️ TabConfiguration: Failed to load from preferences manager, falling back to chrome.storage', error);
            }
        }
        // Fallback to chrome.storage.local
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([this.storageKey], (result) => {
                    if (result[this.storageKey]) {
                        const loaded = this.validateAndMergeState(result[this.storageKey]);
                        resolve(loaded);
                    }
                    else {
                        resolve(null);
                    }
                });
            }
            else {
                resolve(null);
            }
        });
    }
    /**
     * Validate and merge loaded state with defaults
     * CRITICAL FIX: Merge missing default tabs into stored state to ensure all tabs are present
     */
    validateAndMergeState(stored) {
        if (!stored || typeof stored !== 'object') {
            return { ...DEFAULT_STATE };
        }
        const storedObj = stored;
        // Merge with defaults to ensure all required fields exist
        const storedTabs = storedObj.tabs && Array.isArray(storedObj.tabs) ? storedObj.tabs : null;
        // CRITICAL FIX: Merge stored tabs with default tabs to ensure all default tabs are present
        // This fixes the issue where stored state might be missing Rooms, People, Timelines, Settings
        let mergedTabs = DEFAULT_STATE.tabs;
        if (storedTabs && storedTabs.length > 0) {
            // Start with default tabs
            mergedTabs = [...DEFAULT_STATE.tabs];
            // Create a map of stored tabs by ID for quick lookup
            const storedTabsMap = new Map();
            storedTabs.forEach(tab => {
                if (tab && typeof tab === 'object' && 'id' in tab) {
                    storedTabsMap.set(String(tab.id), tab);
                }
            });
            // Merge: update default tabs with stored values, preserve stored tabs not in defaults
            mergedTabs = mergedTabs.map(defaultTab => {
                const storedTab = storedTabsMap.get(defaultTab.id);
                if (storedTab) {
                    // Merge stored tab with default (stored values take precedence, but keep default structure)
                    return {
                        ...defaultTab,
                        ...storedTab,
                        id: defaultTab.id, // Ensure ID matches
                        tabContentId: storedTab.tabContentId || defaultTab.tabContentId,
                        label: storedTab.label || defaultTab.label
                    };
                }
                return defaultTab;
            });
            // Add any stored tabs that aren't in defaults (e.g., SDK apps)
            storedTabs.forEach(storedTab => {
                if (storedTab && typeof storedTab === 'object' && 'id' in storedTab) {
                    const tabId = storedTab.id;
                    if (!DEFAULT_STATE.tabs.find(t => t.id === tabId)) {
                        mergedTabs.push(storedTab);
                    }
                }
            });
        }
        const merged = {
            ...DEFAULT_STATE,
            ...storedObj,
            tabs: mergedTabs,
            currentTab: (storedObj.currentTab && typeof storedObj.currentTab === 'string') ? storedObj.currentTab : DEFAULT_STATE.currentTab,
            previousTab: (storedObj.previousTab !== undefined && (storedObj.previousTab === null || typeof storedObj.previousTab === 'string')) ? storedObj.previousTab : DEFAULT_STATE.previousTab,
            visibleTabCount: (typeof storedObj.visibleTabCount === 'number') ? storedObj.visibleTabCount : DEFAULT_STATE.visibleTabCount,
            userTabLimit: (typeof storedObj.userTabLimit === 'number') ? storedObj.userTabLimit : DEFAULT_STATE.userTabLimit,
            isModalOpen: (typeof storedObj.isModalOpen === 'boolean') ? storedObj.isModalOpen : false
        };
        return merged;
    }
    /**
     * Persist state to storage (preferences manager or chrome.storage.local fallback)
     */
    async persistState() {
        // Try preferences manager first (saves to both chrome.storage and database)
        if (this.preferencesManager) {
            try {
                // Use savePreferences for complex objects, or serialize to JSON string
                await this.preferencesManager.savePreferences({ tabConfiguration: JSON.stringify(this.state) });
                this.logger.debug?.('✅ TabConfiguration: Saved to preferences manager (chrome.storage + database)');
                return;
            }
            catch (error) {
                this.logger.warn?.('⚠️ TabConfiguration: Failed to save via preferences manager, falling back to chrome.storage', error);
            }
        }
        // Fallback to chrome.storage.local only
        return new Promise((resolve, reject) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [this.storageKey]: this.state }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    }
                    else {
                        this.logger.debug?.('✅ TabConfiguration: Saved to chrome.storage.local (fallback)');
                        resolve();
                    }
                });
            }
            else {
                reject(new Error('Chrome storage not available'));
            }
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
