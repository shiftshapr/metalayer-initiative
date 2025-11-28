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
export class TabManager {
    constructor(logger = Logger, handlers) {
        this.initialized = false;
        this.handlers = {};
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
    async initialize() {
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
                window.tabContextManager = {
                    getActiveTab: () => this.config.getCurrentTab(),
                    getTabContainer: (tabId) => {
                        const container = document.getElementById(tabId);
                        return container;
                    }
                };
                this.logger.debug?.('✅ TabManager: Exposed to window.tabContextManager');
            }
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
            try {
                await this.config.switchToTab(tabId);
                this.display.updateActiveTab(tabId);
                // Also update existing tab navigation system
                await this.triggerTabSwitch(tabId);
            }
            catch (error) {
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
    setupModalHandlers() {
        this.modal.setOnClose(() => {
            this.config.getState().isModalOpen = false;
        });
        this.modal.setOnTabOrderChange(async (tabId, newOrder) => {
            try {
                await this.config.updateTabOrder(tabId, newOrder);
                await this.refreshDisplay();
            }
            catch (error) {
                handleError(error, {
                    context: { operation: 'setupModalHandlers.onTabOrderChange', component: 'TabManager', tabId, newOrder }
                });
            }
        });
        this.modal.setOnTabVisibilityChange(async (tabId, visible) => {
            try {
                await this.config.setTabVisibility(tabId, visible);
                await this.refreshDisplay();
            }
            catch (error) {
                handleError(error, {
                    context: { operation: 'setupModalHandlers.onTabVisibilityChange', component: 'TabManager', tabId, visible }
                });
            }
        });
        this.modal.setOnVisibleTabCountChange(async (count) => {
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
            }
            catch (error) {
                handleError(error, {
                    context: { operation: 'setupModalHandlers.onVisibleTabCountChange', component: 'TabManager', count }
                });
            }
        });
        // Tab click handler (click-through from manage tab)
        this.modal.setOnTabClick(async (tabId) => {
            try {
                // Switch to the tab (tab switching will hide manage tab content)
                await this.config.switchToTab(tabId);
                await this.triggerTabSwitch(tabId);
                await this.refreshDisplay();
            }
            catch (error) {
                handleError(error, {
                    context: { operation: 'setupModalHandlers.onTabClick', component: 'TabManager', tabId }
                });
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
        try {
            const state = this.config.getState();
            const visibleTabs = this.config.getVisibleTabs();
            const currentTab = state.currentTab;
            this.display.render(visibleTabs, currentTab);
            this.display.updateActiveTab(currentTab);
        }
        catch (error) {
            handleError(error, {
                context: { operation: 'refreshDisplay', component: 'TabManager' }
            });
        }
    }
    /**
     * Refresh modal content
     */
    async refreshModal() {
        try {
            if (!this.modal.getIsOpen())
                return;
            const tabs = this.config.getTabs();
            this.modal.renderTabList(tabs);
            // TODO: Load and render app store (Phase 2)
            const apps = this.appStore.getApps();
            this.modal.renderAppStore(apps);
        }
        catch (error) {
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
    async triggerTabSwitch(tabId) {
        try {
            // Directly update tab content visibility (avoid circular click)
            const mainTabs = Array.from(document.querySelectorAll('.main-nav-tab'));
            const mainTabContents = Array.from(document.querySelectorAll('.main-tab-content'));
            // ROOT CAUSE FIX: Remove active class from ALL tabs including manage-tab
            // This ensures navigation is not stuck on manage-tab
            mainTabs.forEach(t => {
                const tElement = t;
                tElement.classList.remove('active');
                tElement.setAttribute('aria-selected', 'false');
            });
            // Update tab contents (including manage-tab content)
            mainTabContents.forEach(content => {
                content.classList.remove('active');
            });
            // Activate target tab button (including manage-tab if that's the target)
            const targetTabButton = document.querySelector(`[data-tab="${tabId}"]`);
            if (targetTabButton) {
                targetTabButton.classList.add('active');
                targetTabButton.setAttribute('aria-selected', 'true');
                this.logger.debug?.(`✅ TabManager: Activated tab button ${tabId} (selector line should be visible)`);
            }
            else {
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
                    }
                    catch (error) {
                        handleError(error, {
                            context: { operation: 'triggerTabSwitch.onAgentTab', component: 'TabManager', tabId }
                        });
                    }
                }
                else if (tabId === 'people-tab' && this.handlers.onPeopleTab) {
                    try {
                        await this.handlers.onPeopleTab();
                        this.logger.debug?.('✅ TabManager: People tab initialized');
                    }
                    catch (error) {
                        handleError(error, {
                            context: { operation: 'triggerTabSwitch.onPeopleTab', component: 'TabManager', tabId }
                        });
                    }
                }
                else if (tabId === 'visibility-tab' && this.handlers.onVisibilityTab) {
                    try {
                        await this.handlers.onVisibilityTab();
                        this.logger.debug?.('✅ TabManager: Visibility tab initialized');
                    }
                    catch (error) {
                        handleError(error, {
                            context: { operation: 'triggerTabSwitch.onVisibilityTab', component: 'TabManager', tabId }
                        });
                    }
                }
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
        catch (error) {
            handleError(error, {
                context: { operation: 'triggerTabSwitch', component: 'TabManager', tabId }
            });
        }
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
export function getTabManager(handlers) {
    if (!tabManagerInstance) {
        tabManagerInstance = new TabManager(Logger, handlers);
    }
    return tabManagerInstance;
}
//# sourceMappingURL=TabManager.js.map