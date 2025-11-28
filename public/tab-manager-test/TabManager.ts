/**
 * Tab Manager Module
 * Main orchestrator for tab management functionality
 */

import { TabConfiguration } from './TabConfiguration.js';
import { TabDisplay } from './TabDisplay.js';
import { TabManagerModal } from './TabManagerModal.js';
import { AppStoreIntegration } from './AppStoreIntegration.js';
import { TabConfig, SDKApp } from './types.js';
import { Logger } from '../../utils/Logger.js';

export class TabManager {
  private config: TabConfiguration;
  private display: TabDisplay;
  private modal: TabManagerModal;
  private appStore: AppStoreIntegration;
  private logger: typeof Logger;
  private initialized: boolean = false;

  constructor(logger: typeof Logger = Logger) {
    this.logger = logger;
    this.config = new TabConfiguration(logger);
    this.display = new TabDisplay(logger);
    this.modal = new TabManagerModal(logger);
    this.appStore = new AppStoreIntegration(logger);
  }

  /**
   * Initialize Tab Manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn?.('⚠️ TabManager: Already initialized');
      return;
    }

    try {
      // Initialize configuration
      await this.config.initialize();

      // Initialize display
      this.display.initialize('.sidebar-nav-main');
      this.setupDisplayHandlers();

      // Initialize modal
      this.modal.initialize();
      this.setupModalHandlers();

      // Initialize app store
      await this.appStore.initialize();

      // Render initial state
      await this.refreshDisplay();

      // Listen for configuration changes
      this.setupConfigListeners();

      this.initialized = true;
      this.logger.debug?.('✅ TabManager: Initialized successfully');
    } catch (error) {
      this.logger.error?.('❌ TabManager: Failed to initialize', error);
      throw error;
    }
  }

  /**
   * Setup display event handlers
   */
  private setupDisplayHandlers(): void {
    // Tab click handler
    this.display.setTabClickHandler(async (tabId: string) => {
      await this.config.switchToTab(tabId);
      this.display.updateActiveTab(tabId);
      
      // Also update existing tab navigation system
      this.triggerTabSwitch(tabId);
    });

    // Manage button click handler
    this.display.setManageClickHandler(() => {
      this.openModal();
    });
  }

  /**
   * Setup modal event handlers
   */
  private setupModalHandlers(): void {
    this.modal.setOnClose(() => {
      this.config.getState().isModalOpen = false;
    });

    this.modal.setOnTabOrderChange(async (tabId: string, newOrder: number) => {
      await this.config.updateTabOrder(tabId, newOrder);
      await this.refreshDisplay();
    });

    this.modal.setOnTabVisibilityChange(async (tabId: string, visible: boolean) => {
      await this.config.setTabVisibility(tabId, visible);
      await this.refreshDisplay();
    });

    this.modal.setOnVisibleTabCountChange(async (count: number) => {
      await this.config.setVisibleTabCount(count);
      await this.refreshDisplay();
    });
  }

  /**
   * Setup configuration change listeners
   */
  private setupConfigListeners(): void {
    this.config.on('tabSwitched', () => {
      this.refreshDisplay();
    });

    this.config.on('tabOrderChanged', () => {
      this.refreshModal();
    });

    this.config.on('tabVisibilityChanged', () => {
      this.refreshDisplay();
    });

    this.config.on('visibleTabCountChanged', () => {
      this.refreshDisplay();
    });
  }

  /**
   * Refresh tab display
   */
  private async refreshDisplay(): Promise<void> {
    const state = this.config.getState();
    const visibleTabs = this.config.getVisibleTabs();
    const currentTab = state.currentTab;

    this.display.render(visibleTabs, currentTab);
    this.display.updateActiveTab(currentTab);
  }

  /**
   * Refresh modal content
   */
  private async refreshModal(): Promise<void> {
    if (!this.modal.getIsOpen()) return;

    const tabs = this.config.getTabs();
    this.modal.renderTabList(tabs);

    // TODO: Load and render app store (Phase 2)
    const apps = this.appStore.getApps();
    this.modal.renderAppStore(apps);
  }

  /**
   * Open management modal
   */
  private openModal(): void {
    const state = this.config.getState();
    state.isModalOpen = true;

    // Render current state
    const tabs = this.config.getTabs();
    this.modal.renderTabList(tabs);

    // TODO: Load and render app store (Phase 2)
    const apps = this.appStore.getApps();
    this.modal.renderAppStore(apps);

    this.modal.open();
  }

  /**
   * Trigger tab switch in existing tab navigation system
   * This integrates with the existing tabNavigation.ts system
   */
  private triggerTabSwitch(tabId: string): void {
    // Find the tab button and trigger click
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`) as HTMLElement;
    if (tabButton) {
      tabButton.click();
    }

    // Also dispatch custom event for other modules
    document.dispatchEvent(new CustomEvent('tabManager:tabSwitched', {
      detail: {
        tabId,
        currentTab: this.config.getCurrentTab(),
        previousTab: this.config.getPreviousTab()
      }
    }));
  }

  /**
   * Get current tab
   */
  getCurrentTab(): string | null {
    return this.config.getCurrentTab();
  }

  /**
   * Get previous tab
   */
  getPreviousTab(): string | null {
    return this.config.getPreviousTab();
  }

  /**
   * Get configuration service (for other modules)
   */
  getConfiguration(): TabConfiguration {
    return this.config;
  }

  /**
   * Get app store service (for other modules)
   */
  getAppStore(): AppStoreIntegration {
    return this.appStore;
  }
}

// Export singleton instance
let tabManagerInstance: TabManager | null = null;

export function getTabManager(): TabManager {
  if (!tabManagerInstance) {
    tabManagerInstance = new TabManager();
  }
  return tabManagerInstance;
}

