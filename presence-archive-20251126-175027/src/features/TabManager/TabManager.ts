/**
 * Tab Manager Module
 * Main orchestrator for tab management functionality
 */

import { TabConfiguration } from './TabConfiguration.js';
import { TabDisplay } from './TabDisplay.js';
import { TabManagerModal } from './TabManagerModal.js';
import { AppStoreIntegration } from './AppStoreIntegration.js';
import { Logger } from '../../utils/Logger.js';
import { handleError } from '../../utils/ErrorHandler.js';

export interface TabHandlers {
  onAgentTab?: () => Promise<void>;
  onPeopleTab?: () => Promise<void>;
  onVisibilityTab?: () => Promise<void>;
  onRoomsTab?: () => Promise<void>;
  onDiscussTab?: () => Promise<void>;
  onSettingsTab?: () => Promise<void>;
}

export class TabManager {
  private config: TabConfiguration;
  private display: TabDisplay;
  private modal: TabManagerModal;
  private appStore: AppStoreIntegration;
  private logger: typeof Logger;
  private initialized: boolean = false;
  private handlers: TabHandlers = {};

  constructor(logger: typeof Logger = Logger, handlers?: TabHandlers) {
    this.logger = logger;
    this.config = new TabConfiguration(logger);
    this.display = new TabDisplay(logger);
    this.modal = new TabManagerModal(logger);
    this.appStore = new AppStoreIntegration(logger);
    if (handlers) {
      this.handlers = handlers;
    }
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
      // Set preferences manager if available
      if (typeof window !== 'undefined' && window.userPreferencesManager) {
        this.config.setPreferencesManager(window.userPreferencesManager);
        this.logger.debug?.('✅ TabManager: Connected to UserPreferencesManager');
      }

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

      // ROOT CAUSE FIX: Ensure discuss-tab is active by default if no tab is set
      // This prevents messages from being blocked due to incorrect tab detection
      let currentTab = this.config.getCurrentTab();
      if (!currentTab) {
        // Default to discuss-tab if no tab is set
        await this.config.switchToTab('discuss-tab');
        currentTab = 'discuss-tab';
        this.logger.debug?.('✅ TabManager: Set discuss-tab as default');
      }

      // CRITICAL FIX: Trigger tab switch to ensure content visibility matches active tab
      if (currentTab) {
        await this.triggerTabSwitch(currentTab);
      }

      // Listen for configuration changes
      this.setupConfigListeners();

      // ROOT CAUSE FIX: Expose TabManager to window.tabContextManager for getActiveSidepanelTab()
      // This ensures MessageLoadingService and other modules can reliably detect the active tab
      if (typeof window !== 'undefined') {
        (window as Window & { 
          tabContextManager?: {
            getActiveTab: () => string | null;
            getTabContainer: (tabId: string) => HTMLElement | null;
          }
        }).tabContextManager = {
          getActiveTab: () => this.config.getCurrentTab(),
          getTabContainer: (tabId: string) => {
            const container = document.getElementById(tabId);
            return container as HTMLElement | null;
          }
        };
        this.logger.debug?.('✅ TabManager: Exposed to window.tabContextManager');
      }

      this.initialized = true;
      this.logger.debug?.('✅ TabManager: Initialized successfully');
    } catch (error: unknown) {
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
      try {
        await this.config.switchToTab(tabId);
        this.display.updateActiveTab(tabId);
        
        // Also update existing tab navigation system
        await this.triggerTabSwitch(tabId);
      } catch (error: unknown) {
        handleError(error, {
          context: { operation: 'setupDisplayHandlers.tabClickHandler', component: 'TabManager', tabId }
        });
      }
    });

    // Manage button is now a tab, handled by tab click handler
    // No separate manage click handler needed
  }

  /**
   * Setup modal event handlers
   */
  private setupModalHandlers(): void {
    this.modal.setOnClose(() => {
      this.config.getState().isModalOpen = false;
    });

    this.modal.setOnTabOrderChange(async (tabId: string, newOrder: number) => {
      try {
        await this.config.updateTabOrder(tabId, newOrder);
        await this.refreshDisplay();
      } catch (error: unknown) {
        handleError(error, {
          context: { operation: 'setupModalHandlers.onTabOrderChange', component: 'TabManager', tabId, newOrder }
        });
      }
    });

    this.modal.setOnTabVisibilityChange(async (tabId: string, visible: boolean) => {
      try {
        await this.config.setTabVisibility(tabId, visible);
        await this.refreshDisplay();
      } catch (error: unknown) {
        handleError(error, {
          context: { operation: 'setupModalHandlers.onTabVisibilityChange', component: 'TabManager', tabId, visible }
        });
      }
    });

    this.modal.setOnVisibleTabCountChange(async (count: number) => {
      try {
        await this.config.setVisibleTabCount(count);
        await this.refreshDisplay();
        
        // Update preview in modal
        const modalElement = this.modal.getModal();
        if (modalElement) {
          const preview = modalElement.querySelector('.tab-count-preview');
          if (preview) {
            preview.textContent = `(showing first ${count} visible tabs)`;
          }
        }
      } catch (error: unknown) {
        handleError(error, {
          context: { operation: 'setupModalHandlers.onVisibleTabCountChange', component: 'TabManager', count }
        });
      }
    });

    // Tab click handler (click-through from manage tab)
    this.modal.setOnTabClick(async (tabId: string) => {
      try {
        // Switch to the tab (tab switching will hide manage tab content)
        await this.config.switchToTab(tabId);
        await this.triggerTabSwitch(tabId);
        await this.refreshDisplay();
      } catch (error: unknown) {
        handleError(error, {
          context: { operation: 'setupModalHandlers.onTabClick', component: 'TabManager', tabId }
        });
      }
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
      // Also dispatch event for test page state updates
      document.dispatchEvent(new CustomEvent('tabManager:visibleTabCountChanged', {
        detail: { count: this.config.getState().visibleTabCount }
      }));
    });
  }

  /**
   * Refresh tab display
   */
  private async refreshDisplay(): Promise<void> {
    try {
      const state = this.config.getState();
      const visibleTabs = this.config.getVisibleTabs();
      const currentTab = state.currentTab;

      this.display.render(visibleTabs, currentTab);
      this.display.updateActiveTab(currentTab);
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'refreshDisplay', component: 'TabManager' }
      });
    }
  }

  /**
   * Refresh modal content
   */
  private async refreshModal(): Promise<void> {
    try {
      if (!this.modal.getIsOpen()) return;

      const tabs = this.config.getTabs();
      this.modal.renderTabList(tabs);

      // TODO: Load and render app store (Phase 2)
      const apps = this.appStore.getApps();
      this.modal.renderAppStore(apps);
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'refreshModal', component: 'TabManager' }
      });
    }
  }

  // openModal method removed - no longer needed as manage-tab is handled via tab switching

  /**
   * Trigger tab switch in existing tab navigation system
   * This integrates with the existing tabNavigation.ts system
   * ROOT CAUSE FIX: Ensure manage-tab can be switched away from (navigation not stuck)
   */
  private async triggerTabSwitch(tabId: string): Promise<void> {
    try {
      // Directly update tab content visibility (avoid circular click)
      const mainTabs = Array.from(document.querySelectorAll('.main-nav-tab'));
      const mainTabContents = Array.from(document.querySelectorAll('.main-tab-content'));

      // ROOT CAUSE FIX: Remove active class from ALL tabs including manage-tab
      // This ensures navigation is not stuck on manage-tab
      mainTabs.forEach(t => {
        const tElement = t as HTMLElement;
        tElement.classList.remove('active');
        tElement.setAttribute('aria-selected', 'false');
      });

      // Update tab contents (including manage-tab content)
      mainTabContents.forEach(content => {
        content.classList.remove('active');
      });

      // Activate target tab button (including manage-tab if that's the target)
      const targetTabButton = document.querySelector(`[data-tab="${tabId}"]`) as HTMLElement;
      if (targetTabButton) {
        targetTabButton.classList.add('active');
        targetTabButton.setAttribute('aria-selected', 'true');
        this.logger.debug?.(`✅ TabManager: Activated tab button ${tabId} (selector line should be visible)`);
      } else {
        this.logger.warn?.(`⚠️ TabManager: Tab button ${tabId} not found`);
      }

      // Activate target tab content
      const targetTabContent = document.getElementById(tabId);
      if (targetTabContent) {
        targetTabContent.classList.add('active');
        
        // Handle special tab initialization
        const sidebar = document.querySelector('.sidebar-content');
        if (sidebar) {
          sidebar.classList.remove('agent-tab-active');
        }
        
        // Handle manage tab - ensure content is rendered
        if (tabId === 'manage-tab') {
          // Ensure modal content is rendered
          if (!this.modal.getIsOpen()) {
            const state = this.config.getState();
            this.modal.open(state.visibleTabCount);
            const tabs = this.config.getTabs();
            this.modal.renderTabList(tabs);
            const apps = this.appStore.getApps();
            this.modal.renderAppStore(apps);
          }
        }
        
        // Call appropriate handler if available
        if (tabId === 'agent-tab' && this.handlers.onAgentTab) {
          try {
            if (sidebar) {
              sidebar.classList.add('agent-tab-active');
            }
            await this.handlers.onAgentTab();
            this.logger.debug?.('✅ TabManager: Agent tab initialized');
          } catch (error: unknown) {
            handleError(error, {
              context: { operation: 'triggerTabSwitch.onAgentTab', component: 'TabManager', tabId }
            });
          }
        } else if (tabId === 'people-tab' && this.handlers.onPeopleTab) {
          try {
            await this.handlers.onPeopleTab();
            this.logger.debug?.('✅ TabManager: People tab initialized');
          } catch (error: unknown) {
            handleError(error, {
              context: { operation: 'triggerTabSwitch.onPeopleTab', component: 'TabManager', tabId }
            });
          }
        } else if (tabId === 'visibility-tab' && this.handlers.onVisibilityTab) {
          try {
            await this.handlers.onVisibilityTab();
            this.logger.debug?.('✅ TabManager: Visibility tab initialized');
          } catch (error: unknown) {
            handleError(error, {
              context: { operation: 'triggerTabSwitch.onVisibilityTab', component: 'TabManager', tabId }
            });
          }
        }
      } else {
        this.logger.warn?.(`⚠️ TabManager: Tab content #${tabId} not found`);
      }

      // Dispatch custom event for other modules
      document.dispatchEvent(new CustomEvent('tabManager:tabSwitched', {
        detail: {
          tabId,
          currentTab: this.config.getCurrentTab(),
          previousTab: this.config.getPreviousTab()
        }
      }));
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'triggerTabSwitch', component: 'TabManager', tabId }
      });
    }
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

export function getTabManager(handlers?: TabHandlers): TabManager {
  if (!tabManagerInstance) {
    tabManagerInstance = new TabManager(Logger, handlers);
  }
  return tabManagerInstance;
}

