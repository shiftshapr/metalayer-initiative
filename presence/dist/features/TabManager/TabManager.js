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
import { userPreferencesManager } from '../../utils/UserPreferencesManager.js';
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
            // Set preferences manager from ES6 import
            this.config.setPreferencesManager(userPreferencesManager);
            this.logger.debug?.('✅ TabManager: Connected to UserPreferencesManager');
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
            // Initialize manage tab content if it's the current tab on startup
            const state = this.config.getState();
            if (state.currentTab === 'manage-tab') {
                try {
                    // Ensure manage-tab content exists and is active
                    let manageTabContent = document.getElementById('manage-tab');
                    if (!manageTabContent) {
                        const sidebarContent = document.querySelector('.sidebar-content');
                        if (sidebarContent) {
                            manageTabContent = document.createElement('div');
                            manageTabContent.id = 'manage-tab';
                            manageTabContent.className = 'main-tab-content';
                            sidebarContent.appendChild(manageTabContent);
                        }
                    }
                    // Make sure it has the active class
                    if (manageTabContent) {
                        manageTabContent.classList.add('active');
                    }
                    // Ensure modal is initialized and content is ready
                    if (!this.modal.getModal()) {
                        this.modal.initialize();
                    }
                    // Render current state
                    const tabs = this.config.getTabs();
                    this.modal.renderTabList(tabs, state.currentTab);
                    // Update visible tab count input
                    this.modal.open(state.visibleTabCount);
                    // Load and render app store
                    const apps = this.appStore.getApps();
                    this.modal.renderAppStore(apps);
                    this.logger.debug?.('✅ TabManager: Manage tab content initialized on startup');
                }
                catch (error) {
                    handleError(error, {
                        context: { operation: 'initialize.manageTabOnStartup', component: 'TabManager' }
                    });
                }
            }
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
        // Manage button click handler (no-op, handled via tab click)
        this.display.setManageClickHandler(() => {
            // Manage button is now handled via tab click handler
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
        // Tab click handler (click-through from modal)
        this.modal.setOnTabClick(async (tabId) => {
            try {
                // Switch to the tab
                await this.config.switchToTab(tabId);
                await this.triggerTabSwitch(tabId);
                await this.refreshDisplay();
                // Close the modal
                this.modal.close();
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
            const state = this.config.getState();
            this.modal.renderTabList(tabs, state.currentTab);
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
    /**
     * Trigger tab switch in existing tab navigation system
     * This integrates with the existing tabNavigation.ts system
     */
    async triggerTabSwitch(tabId) {
        try {
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
                // Handle special tab initialization
                const sidebar = document.querySelector('.sidebar-content');
                if (sidebar) {
                    sidebar.classList.remove('agent-tab-active');
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
                else if (tabId === 'rooms-tab' && this.handlers.onRoomsTab) {
                    try {
                        await this.handlers.onRoomsTab();
                        this.logger.debug?.('✅ TabManager: Rooms tab initialized');
                    }
                    catch (error) {
                        handleError(error, {
                            context: { operation: 'triggerTabSwitch.onRoomsTab', component: 'TabManager', tabId }
                        });
                    }
                }
                else if (tabId === 'timelines-tab' && this.handlers.onTimelinesTab) {
                    try {
                        await this.handlers.onTimelinesTab();
                        this.logger.debug?.('✅ TabManager: Timelines tab initialized');
                    }
                    catch (error) {
                        handleError(error, {
                            context: { operation: 'triggerTabSwitch.onTimelinesTab', component: 'TabManager', tabId }
                        });
                    }
                }
                else if (tabId === 'settings-tab' && this.handlers.onSettingsTab) {
                    try {
                        await this.handlers.onSettingsTab();
                        this.logger.debug?.('✅ TabManager: Settings tab initialized');
                    }
                    catch (error) {
                        handleError(error, {
                            context: { operation: 'triggerTabSwitch.onSettingsTab', component: 'TabManager', tabId }
                        });
                    }
                }
                else if (tabId === 'manage-tab') {
                    // Initialize tab manager content when manage-tab is clicked (tab-based, not modal)
                    try {
                        // Ensure manage-tab content exists and has proper structure
                        let manageTabContent = document.getElementById('manage-tab');
                        if (!manageTabContent) {
                            const sidebarContent = document.querySelector('.sidebar-content');
                            if (sidebarContent) {
                                manageTabContent = document.createElement('div');
                                manageTabContent.id = 'manage-tab';
                                manageTabContent.className = 'main-tab-content';
                                sidebarContent.appendChild(manageTabContent);
                            }
                        }
                        // Ensure modal is initialized and content is ready
                        if (!this.modal.getModal()) {
                            this.modal.initialize();
                        }
                        // Render current state
                        const tabs = this.config.getTabs();
                        const currentState = this.config.getState();
                        this.modal.renderTabList(tabs, currentState.currentTab);
                        // Update visible tab count input
                        this.modal.open(currentState.visibleTabCount);
                        // Load and render app store
                        const apps = this.appStore.getApps();
                        this.modal.renderAppStore(apps);
                        this.logger.debug?.('✅ TabManager: Manage tab content initialized');
                    }
                    catch (error) {
                        handleError(error, {
                            context: { operation: 'triggerTabSwitch.onManageTab', component: 'TabManager', tabId }
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
    /**
     * Get current state (for diagnostics and external access)
     * CRITICAL FIX: Expose state for diagnostics (regression fix)
     */
    getState() {
        return this.config.getState();
    }
    /**
     * Get active tab (alias for getCurrentTab for compatibility)
     * CRITICAL FIX: Expose getActiveTab for compatibility with existing code (regression fix)
     */
    getActiveTab() {
        return this.getCurrentTab();
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
