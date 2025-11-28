/**
 * Tab Configuration Service
 * Manages tab state, order, visibility, and tracking (currentTab/previousTab)
 */

import { TabManagerState, TabConfig, DEFAULT_STATE } from './types.js';
import { Logger } from '../../utils/Logger.js';
import { handleError } from '../../utils/ErrorHandler.js';

export class TabConfiguration {
  private state: TabManagerState;
  private logger: typeof Logger;
  private storageKey = 'tabManagerConfig';
  private eventListeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private preferencesManager: {
    initialize: (userId: string) => Promise<boolean>;
    getPreference: (key: string) => Promise<string | number | boolean | null>;
    savePreference: (key: string, value: string | number | boolean, options?: { skipDatabase?: boolean; batch?: boolean }) => Promise<boolean>;
    savePreferences: (preferences: Record<string, string | number | boolean>, options?: { skipDatabase?: boolean; batch?: boolean }) => Promise<Record<string, boolean>>;
    isInitialized: boolean;
    [key: string]: unknown;
  } | null = null;

  constructor(logger: typeof Logger = Logger) {
    this.logger = logger;
    this.state = { ...DEFAULT_STATE };
  }

  /**
   * Set preferences manager instance
   */
  setPreferencesManager(manager: {
    initialize: (userId: string) => Promise<boolean>;
    getPreference: (key: string) => Promise<string | number | boolean | null>;
    savePreference: (key: string, value: string | number | boolean, options?: { skipDatabase?: boolean; batch?: boolean }) => Promise<boolean>;
    savePreferences: (preferences: Record<string, string | number | boolean>, options?: { skipDatabase?: boolean; batch?: boolean }) => Promise<Record<string, boolean>>;
    isInitialized: boolean;
    [key: string]: unknown;
  }): void {
    this.preferencesManager = manager;
  }

  /**
   * Initialize configuration from storage or use defaults
   */
  async initialize(): Promise<void> {
    try {
      // Try to get preferences manager from window
      if (!this.preferencesManager && typeof window !== 'undefined' && window.userPreferencesManager) {
        this.preferencesManager = window.userPreferencesManager;
      }

      const stored = await this.loadFromStorage();
      if (stored !== null) {
        this.state = stored;
        this.logger.debug?.('✅ TabConfiguration: Loaded from storage');
      } else {
        this.state = { ...DEFAULT_STATE };
        await this.persistState();
        this.logger.debug?.('✅ TabConfiguration: Using default state');
      }
    } catch (error: unknown) {
      this.logger.error?.('❌ TabConfiguration: Failed to initialize', error);
      this.state = { ...DEFAULT_STATE };
    }
  }

  /**
   * Get current tab state
   */
  getCurrentTab(): string | null {
    return this.state.currentTab;
  }

  /**
   * Get previous tab state
   */
  getPreviousTab(): string | null {
    return this.state.previousTab;
  }

  /**
   * Switch to a tab (updates currentTab and previousTab)
   */
  async switchToTab(tabId: string): Promise<void> {
    try {
      const currentTab = this.state.currentTab;
      
      // Update state: previousTab gets current currentTab, currentTab gets new tabId
      this.state.previousTab = currentTab;  // Current becomes previous
      this.state.currentTab = tabId;         // New tab becomes current
      
      // Persist to storage
      await this.persistState();
      
      // Emit event for other modules
      this.emit('tabSwitched', {
        currentTab: tabId,
        previousTab: currentTab
      });
      
      this.logger.debug?.(`✅ TabConfiguration: Switched to tab ${tabId} (previous: ${currentTab})`);
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'switchToTab', component: 'TabConfiguration', tabId }
      });
    }
  }

  /**
   * Get all tabs
   */
  getTabs(): TabConfig[] {
    return [...this.state.tabs];
  }

  /**
   * Get visible tabs (sorted by order)
   * Excludes manage-tab from the visible tabs list (it's always shown separately at the end)
   */
  getVisibleTabs(): TabConfig[] {
    return this.state.tabs
      .filter(tab => tab.visible && tab.id !== 'manage-tab')
      .sort((a, b) => a.order - b.order)
      .slice(0, this.state.visibleTabCount);
  }

  /**
   * Get tab by ID
   */
  getTabById(tabId: string): TabConfig | undefined {
    return this.state.tabs.find(tab => tab.id === tabId);
  }

  /**
   * Update tab order
   */
  async updateTabOrder(tabId: string, newOrder: number): Promise<void> {
    try {
      // Prevent managing the manage-tab
      if (tabId === 'manage-tab') {
        this.logger.warn?.('⚠️ TabConfiguration: Cannot reorder manage-tab (fixed position)');
        return;
      }

      const tab = this.getTabById(tabId);
      if (!tab) {
        this.logger.warn?.(`⚠️ TabConfiguration: Tab ${tabId} not found`);
        return;
      }

      // Get all tabs sorted by current order (exclude manage-tab from reordering)
      const manageableTabs = this.state.tabs.filter(t => t.id !== 'manage-tab');
      const sortedTabs = [...manageableTabs].sort((a, b) => a.order - b.order);
      
      // Remove the dragged tab from its current position
      const draggedTab = sortedTabs.find(t => t.id === tabId);
      if (!draggedTab) return;
      
      const filteredTabs = sortedTabs.filter(t => t.id !== tabId);
      
      // Insert at new position
      filteredTabs.splice(newOrder, 0, draggedTab);
      
      // Update order values (only for manageable tabs)
      filteredTabs.forEach((t, index) => {
        t.order = index;
      });
      
      // Update state (keep manage-tab if it exists, but don't change its order)
      const manageTab = this.state.tabs.find(t => t.id === 'manage-tab');
      this.state.tabs = [...filteredTabs];
      if (manageTab) {
        // Keep manage-tab at the end (highest order)
        manageTab.order = filteredTabs.length;
        this.state.tabs.push(manageTab);
      }
      
      await this.persistState();
      this.emit('tabOrderChanged', { tabId, newOrder });
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'updateTabOrder', component: 'TabConfiguration', tabId, newOrder }
      });
    }
  }

  /**
   * Update tab visibility
   */
  async setTabVisibility(tabId: string, visible: boolean): Promise<void> {
    try {
      // Prevent managing the manage-tab visibility
      if (tabId === 'manage-tab') {
        this.logger.warn?.('⚠️ TabConfiguration: Cannot change manage-tab visibility (always visible)');
        return;
      }

      const tab = this.getTabById(tabId);
      if (!tab) {
        this.logger.warn?.(`⚠️ TabConfiguration: Tab ${tabId} not found`);
        return;
      }

      tab.visible = visible;
      await this.persistState();
      this.emit('tabVisibilityChanged', { tabId, visible });
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'setTabVisibility', component: 'TabConfiguration', tabId, visible }
      });
    }
  }

  /**
   * Set number of visible tabs
   */
  async setVisibleTabCount(count: number): Promise<void> {
    try {
      if (count < 1 || count > this.state.userTabLimit) {
        this.logger.warn?.(`⚠️ TabConfiguration: Invalid tab count ${count}`);
        return;
      }

      this.state.visibleTabCount = count;
      await this.persistState();
      this.emit('visibleTabCountChanged', { count });
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'setVisibleTabCount', component: 'TabConfiguration', count }
      });
    }
  }

  /**
   * Add a new tab (for SDK apps)
   */
  async addTab(tab: TabConfig): Promise<void> {
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
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'addTab', component: 'TabConfiguration', tabId: tab.id }
      });
    }
  }

  /**
   * Remove a tab (only SDK apps, not built-in)
   */
  async removeTab(tabId: string): Promise<void> {
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

      this.state.tabs = this.state.tabs.filter(t => t.id !== tabId);
      // Reorder remaining tabs
      this.state.tabs.forEach((t, index) => {
        t.order = index;
      });

      await this.persistState();
      this.emit('tabRemoved', { tabId });
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'removeTab', component: 'TabConfiguration', tabId }
      });
    }
  }

  /**
   * Get current state
   */
  getState(): TabManagerState {
    return { ...this.state };
  }

  /**
   * Load state from storage (preferences manager or chrome.storage.local fallback)
   */
  private async loadFromStorage(): Promise<TabManagerState | null> {
    // Try preferences manager first (includes database)
    if (this.preferencesManager) {
      try {
        const stored = await this.preferencesManager.getPreference('tabConfiguration');
        if (stored && typeof stored === 'string') {
          // Parse JSON string if stored as string
          try {
            const parsed = JSON.parse(stored) as unknown;
            const loaded = this.validateAndMergeState(parsed);
            this.logger.debug?.('✅ TabConfiguration: Loaded from preferences manager');
            return loaded;
          } catch (parseError) {
            this.logger.warn?.('⚠️ TabConfiguration: Failed to parse stored configuration', parseError);
          }
        } else if (stored && typeof stored === 'object') {
          // Validate and merge with defaults
          const loaded = this.validateAndMergeState(stored);
          this.logger.debug?.('✅ TabConfiguration: Loaded from preferences manager');
          return loaded;
        }
      } catch (error: unknown) {
        this.logger.warn?.('⚠️ TabConfiguration: Failed to load from preferences manager, falling back to chrome.storage', error);
      }
    }

    // Fallback to chrome.storage.local
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([this.storageKey], (result) => {
          if (result[this.storageKey]) {
            const loaded = this.validateAndMergeState(result[this.storageKey] as TabManagerState);
            resolve(loaded);
          } else {
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Validate and merge loaded state with defaults
   */
  private validateAndMergeState(stored: unknown): TabManagerState {
    if (!stored || typeof stored !== 'object') {
      return { ...DEFAULT_STATE };
    }

    const storedObj = stored as Record<string, unknown>;

    // Merge with defaults to ensure all required fields exist
    const merged: TabManagerState = {
      ...DEFAULT_STATE,
      ...storedObj,
      tabs: storedObj.tabs && Array.isArray(storedObj.tabs) ? storedObj.tabs as TabManagerState['tabs'] : DEFAULT_STATE.tabs,
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
  private async persistState(): Promise<void> {
    // Try preferences manager first (saves to both chrome.storage and database)
    if (this.preferencesManager) {
      try {
        // Use savePreferences for complex objects, or serialize to JSON string
        await this.preferencesManager.savePreferences({ tabConfiguration: JSON.stringify(this.state) });
        this.logger.debug?.('✅ TabConfiguration: Saved to preferences manager (chrome.storage + database)');
        return;
      } catch (error: unknown) {
        this.logger.warn?.('⚠️ TabConfiguration: Failed to save via preferences manager, falling back to chrome.storage', error);
      }
    }

    // Fallback to chrome.storage.local only
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [this.storageKey]: this.state }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            this.logger.debug?.('✅ TabConfiguration: Saved to chrome.storage.local (fallback)');
            resolve();
          }
        });
      } else {
        reject(new Error('Chrome storage not available'));
      }
    });
  }

  /**
   * Event emitter methods
   */
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);
  }

  off(event: string, callback: (data: unknown) => void): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown): void {
    this.eventListeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error: unknown) {
        this.logger.error?.(`❌ TabConfiguration: Error in event listener for ${event}`, error);
      }
    });
  }
}

