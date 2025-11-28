/**
 * Tab Manager Module
 * Main orchestrator for tab management functionality
 */
import { TabConfiguration } from './TabConfiguration.js';
import { TabDisplay } from './TabDisplay.js';
import { TabManagerModal } from './TabManagerModal.js';
import { AppStoreIntegration } from './AppStoreIntegration.js';
import { Logger } from './utils/Logger.js';
export class TabManager {
    constructor(logger = Logger) {
        this.initialized = false;
        this.logger = logger;
        this.config = new TabConfiguration(logger);
        this.display = new TabDisplay(logger);
        this.modal = new TabManagerModal(logger);
        this.appStore = new AppStoreIntegration(logger);
    }
    /**
     * Initialize Tab Manager
     */
    async initialize() {
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
        }
        catch (error) {
            this.logger.error?.('❌ TabManager: Failed to initialize', error);
            throw error;
        }
    }
    /**
     * Setup display event handlers
     */
    setupDisplayHandlers() {
        // Tab click handler
        this.display.setTabClickHandler(async (tabId) => {
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
    setupModalHandlers() {
        this.modal.setOnClose(() => {
            this.config.getState().isModalOpen = false;
        });
        this.modal.setOnTabOrderChange(async (tabId, newOrder) => {
            await this.config.updateTabOrder(tabId, newOrder);
            await this.refreshDisplay();
        });
        this.modal.setOnTabVisibilityChange(async (tabId, visible) => {
            await this.config.setTabVisibility(tabId, visible);
            await this.refreshDisplay();
        });
        this.modal.setOnVisibleTabCountChange(async (count) => {
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
        });
    }
    /**
     * Setup configuration change listeners
     */
    setupConfigListeners() {
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
    async refreshDisplay() {
        const state = this.config.getState();
        const visibleTabs = this.config.getVisibleTabs();
        const currentTab = state.currentTab;
        this.display.render(visibleTabs, currentTab);
        this.display.updateActiveTab(currentTab);
    }
    /**
     * Refresh modal content
     */
    async refreshModal() {
        if (!this.modal.getIsOpen())
            return;
        const tabs = this.config.getTabs();
        this.modal.renderTabList(tabs);
        // TODO: Load and render app store (Phase 2)
        const apps = this.appStore.getApps();
        this.modal.renderAppStore(apps);
    }
    /**
     * Open management modal
     */
    openModal() {
        const state = this.config.getState();
        state.isModalOpen = true;
        // Render current state
        const tabs = this.config.getTabs();
        this.modal.renderTabList(tabs);
        // Update visible tab count input
        this.modal.open(state.visibleTabCount);
        // TODO: Load and render app store (Phase 2)
        const apps = this.appStore.getApps();
        this.modal.renderAppStore(apps);
    }
    /**
     * Trigger tab switch in existing tab navigation system
     * This integrates with the existing tabNavigation.ts system
     */
    triggerTabSwitch(tabId) {
        // Directly update tab content visibility (avoid circular click)
        const mainTabs = Array.from(document.querySelectorAll('.main-nav-tab'));
        const mainTabContents = Array.from(document.querySelectorAll('.main-tab-content'));
        // Update tab buttons
        mainTabs.forEach(t => {
            const tElement = t;
            tElement.classList.remove('active');
            tElement.setAttribute('aria-selected', 'false');
        });
        // Update tab contents
        mainTabContents.forEach(content => {
            content.classList.remove('active');
        });
        // Activate target tab button
        const targetTabButton = document.querySelector(`[data-tab="${tabId}"]`);
        if (targetTabButton) {
            targetTabButton.classList.add('active');
            targetTabButton.setAttribute('aria-selected', 'true');
        }
        // Activate target tab content
        const targetTabContent = document.getElementById(tabId);
        if (targetTabContent) {
            targetTabContent.classList.add('active');
        }
        else {
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
    }
    /**
     * Get current tab
     */
    getCurrentTab() {
        return this.config.getCurrentTab();
    }
    /**
     * Get previous tab
     */
    getPreviousTab() {
        return this.config.getPreviousTab();
    }
    /**
     * Get configuration service (for other modules)
     */
    getConfiguration() {
        return this.config;
    }
    /**
     * Get app store service (for other modules)
     */
    getAppStore() {
        return this.appStore;
    }
}
// Export singleton instance
let tabManagerInstance = null;
export function getTabManager() {
    if (!tabManagerInstance) {
        tabManagerInstance = new TabManager();
    }
    return tabManagerInstance;
}
