/**
 * TabManager - TypeScript ES6 Module
 * Main orchestrator for tab management with theme isolation and operation protection
 */
import { TabConfiguration } from './TabConfiguration.js';
import { TabDisplay } from './TabDisplay.js';
import { TabManagerModal } from './TabManagerModal.js';
import { AppStoreIntegration } from './AppStoreIntegration.js';
import { Logger } from '../../utils/Logger.js';
import { handleError } from '../../utils/ErrorHandler.js';
import { userPreferencesManager } from '../../utils/UserPreferencesManager.js';
import { getTabIsolationGuard } from './TabIsolationGuard.js';
import { TabOperation } from './TabOperations.js';
import { getTabStateManager } from './TabStateManager.js';
/**
 * TabManager - Main orchestrator for tab management functionality
 */
export class TabManager {
    constructor(logger = Logger, handlers) {
        this.initialized = false;
        this.handlers = {};
        // Security: Valid tab IDs whitelist for injection prevention
        this.VALID_TAB_IDS = new Set([
            'discuss-tab', 'visibility-tab', 'rooms-tab', 'people-tab',
            'agent-tab', 'timelines-tab', 'settings-tab', 'manage-tab'
        ]);
        // Blind-spot mitigation: Concurrent operation protection
        this.operationInProgress = false;
        this.OPERATION_TIMEOUT = 10000; // 10 seconds max per operation
        this.operationStartTime = 0;
        this.logger = logger;
        this.config = new TabConfiguration(logger);
        this.display = new TabDisplay(logger);
        this.modal = new TabManagerModal(logger);
        this.appStore = new AppStoreIntegration(logger);
        this.tabStateManager = getTabStateManager(logger);
        if (handlers) {
            this.handlers = handlers;
        }
        this.logger.debug?.('TabManager: Initialized');
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
            // CRITICAL FIX: Switch to saved currentTab on initialization
            const state = this.config.getState();
            const savedCurrentTab = state.currentTab;
            if (savedCurrentTab && savedCurrentTab !== 'manage-tab') {
                try {
                    // LOAD operation for initialization
                    await this.triggerTabSwitch(savedCurrentTab, { operation: TabOperation.LOAD });
                    this.logger.debug?.(`✅ TabManager: Restored saved tab: ${savedCurrentTab}`);
                }
                catch (error) {
                    handleError(error, {
                        context: {
                            operation: 'initialize.restoreSavedTab',
                            component: 'TabManager',
                            tabId: savedCurrentTab,
                        },
                    });
                }
            }
            // Initialize manage tab if it's current
            if (savedCurrentTab === 'manage-tab') {
                try {
                    await this.initializeManageTab();
                }
                catch (error) {
                    handleError(error, {
                        context: { operation: 'initialize.manageTabOnStartup', component: 'TabManager' },
                    });
                }
            }
            // Listen for configuration changes
            this.setupConfigListeners();
            // Start tab isolation guard
            try {
                const isolationGuard = getTabIsolationGuard();
                isolationGuard.startMonitoring();
                this.logger.debug?.('✅ TabManager: Tab isolation guard started');
            }
            catch (error) {
                handleError(error, {
                    context: { operation: 'initialize.isolationGuard', component: 'TabManager' },
                });
            }
            // Restore state from extension lifecycle
            // Note: TabStateManager doesn't have restoreState method - state restoration handled by TabConfiguration
            this.logger.debug?.('✅ TabManager: State restoration handled by TabConfiguration');
            // Set up memory pressure monitoring
            // Note: TabStateManager doesn't have monitorMemoryPressure method
            this.logger.debug?.('✅ TabManager: Memory pressure monitoring not available');
            // Handle power management
            try {
                if (typeof document !== 'undefined') {
                    document.addEventListener('visibilitychange', () => {
                        if (!document.hidden) {
                            this.logger.debug?.('BLIND-SPOT: Page visibility restored');
                            // Reset stuck operations
                            if (this.operationInProgress && (Date.now() - this.operationStartTime) > this.OPERATION_TIMEOUT) {
                                this.logger.warn?.('BLIND-SPOT: Resetting stuck operation after visibility restore');
                                this.operationInProgress = false;
                                this.operationStartTime = 0;
                            }
                        }
                    });
                }
                this.logger.debug?.('✅ TabManager: Power management handling started');
            }
            catch (error) {
                this.logger.warn?.('TabManager: Power management setup failed', error);
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
     * Initialize manage tab content
     */
    async initializeManageTab() {
        // Ensure manage-tab content exists
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
        if (manageTabContent) {
            manageTabContent.classList.add('active');
        }
        // Initialize modal
        if (!this.modal.getModal?.()) {
            this.modal.initialize();
        }
        // Render tab management UI
        const tabs = this.config.getTabs();
        const state = this.config.getState();
        this.modal.renderTabList?.(tabs, state.currentTab);
        // Update visible tab count
        this.modal.open?.(state.visibleTabCount);
        // Load app store
        const apps = this.appStore.getApps?.();
        this.modal.renderAppStore?.(apps);
        this.logger.debug?.('✅ TabManager: Manage tab initialized');
    }
    /**
     * Security: Validate tabId and operation parameters
     */
    validateTabOperation(tabId, operation) {
        // Security: Validate tabId is in whitelist
        if (!this.VALID_TAB_IDS.has(tabId)) {
            this.logger.warn?.(`SECURITY: Invalid tabId rejected: ${tabId}`);
            return { valid: false, reason: 'Invalid tab identifier' };
        }
        // Security: Validate operation is valid enum value
        const validOperations = Object.values(TabOperation);
        if (!validOperations.includes(operation)) {
            this.logger.warn?.(`SECURITY: Invalid operation rejected: ${operation}`);
            return { valid: false, reason: 'Invalid operation type' };
        }
        // Additional state validation through TabStateManager
        const stateValidation = this.tabStateManager.validateOperation(tabId, operation);
        if (!stateValidation.valid) {
            this.logger.debug?.(`SECURITY: State validation failed: ${stateValidation.reason}`);
            return stateValidation;
        }
        return { valid: true };
    }
    /**
     * Public method for coordinated tab operations - ROOT CAUSE FIX
     */
    async performTabOperation(tabId, options) {
        return this.triggerTabSwitch(tabId, options);
    }
    /**
     * Trigger tab switch with comprehensive protection - ROOT CAUSE FIX
     */
    async triggerTabSwitch(tabId, options = { operation: TabOperation.SWITCH }) {
        try {
            // Blind-spot mitigation: Prevent concurrent operations
            if (this.operationInProgress) {
                this.logger.debug?.(`BLIND-SPOT: Operation already in progress for tab ${tabId}, queuing`);
                return;
            }
            // Check for operation timeout
            const now = Date.now();
            if (this.operationStartTime > 0 && (now - this.operationStartTime) > this.OPERATION_TIMEOUT) {
                this.logger.warn?.(`BLIND-SPOT: Previous operation timed out, resetting state`);
                this.operationInProgress = false;
                this.operationStartTime = 0;
            }
            this.operationInProgress = true;
            this.operationStartTime = now;
            // ROOT CAUSE FIX: Prevent theme changes during tab operations
            this.tabStateManager.setThemeChanging(true);
            // Security: Validate inputs
            const securityValidation = this.validateTabOperation(tabId, options.operation);
            if (!securityValidation.valid) {
                this.logger.error?.(`SECURITY: Tab operation blocked - ${securityValidation.reason}`, {
                    tabId,
                    operation: options.operation,
                    reason: securityValidation.reason
                });
                return;
            }
            // Validate operation against current state
            const stateValidation = this.tabStateManager.validateOperation(tabId, options.operation);
            if (!stateValidation.valid) {
                this.logger.debug?.(`ℹ️ TabManager: Skipping tab switch - ${stateValidation.reason}`);
                return;
            }
            // Update tab UI
            this.updateTabUI(tabId);
            // Determine if tab should be loaded
            const shouldLoad = this.tabStateManager.shouldLoadTab(tabId, options.operation);
            // Handle tab content loading
            if (shouldLoad) {
                await this.handleTabContent(tabId, options);
            }
            // Log operation
            const wasAlreadyLoaded = this.tabStateManager.isTabLoaded(tabId);
            if (!shouldLoad && wasAlreadyLoaded) {
                this.logger.debug?.(`ℹ️ TabManager: Tab ${tabId} already loaded, skipping reload`);
            }
            // Dispatch event for coordination
            this.dispatchTabSwitchedEvent(tabId, options, wasAlreadyLoaded);
        }
        catch (error) {
            this.logger.error?.(`TabManager: Operation failed for tab ${tabId}`, {
                operation: options.operation,
                error: error instanceof Error ? error.message : String(error)
            });
            handleError(error, {
                context: { operation: 'triggerTabSwitch', component: 'TabManager', tabId },
            });
        }
        finally {
            // Always reset operation state and allow theme changes
            this.operationInProgress = false;
            this.operationStartTime = 0;
            this.tabStateManager.setThemeChanging(false);
        }
    }
    /**
     * Update tab UI elements
     */
    updateTabUI(tabId) {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.main-nav-tab');
        tabButtons.forEach((button) => {
            const btn = button;
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        // Update tab contents
        const tabContents = document.querySelectorAll('.main-tab-content');
        tabContents.forEach((content) => {
            content.classList.remove('active');
        });
        // Activate target elements
        const targetButton = document.querySelector(`[data-tab="${tabId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
            targetButton.setAttribute('aria-selected', 'true');
        }
        const targetContent = document.getElementById(tabId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }
    /**
     * Handle tab content loading
     */
    async handleTabContent(tabId, _options) {
        // Mark as loading
        this.tabStateManager.setTabLoading(tabId, true);
        // Show loading gif for tab content
        const loadingGifManager = window.loadingGifManager;
        if (loadingGifManager) {
            loadingGifManager.show({
                container: `.main-tab-content[data-tab="${tabId}"]`,
                text: `Loading ${this.getTabDisplayName(tabId)}...`
            });
        }
        try {
            // Handle specific tab types
            switch (tabId) {
                case 'agent-tab':
                    await this.handleAgentTab();
                    break;
                case 'people-tab':
                    await this.handlePeopleTab();
                    break;
                case 'visibility-tab':
                    await this.handleVisibilityTab();
                    break;
                case 'rooms-tab':
                    await this.handleRoomsTab();
                    break;
                case 'timelines-tab':
                    await this.handleTimelinesTab();
                    break;
                case 'settings-tab':
                    await this.handleSettingsTab();
                    break;
                case 'manage-tab':
                    await this.handleManageTab();
                    break;
                default:
                    this.logger.debug?.(`TabManager: No specific handler for tab ${tabId}`);
            }
            this.logger.debug?.(`✅ TabManager: Tab ${tabId} content loaded`);
        }
        catch (error) {
            this.logger.error?.(`TabManager: Failed to load tab ${tabId}`, error);
            throw error;
        }
        finally {
            // Mark as loaded
            this.tabStateManager.setTabLoading(tabId, false);
            // Hide loading gif
            if (loadingGifManager) {
                loadingGifManager.hide();
            }
        }
    }
    /**
     * Get display name for tab (for loading messages)
     */
    getTabDisplayName(tabId) {
        const tab = this.config.getTabById(tabId);
        return tab?.label || tabId.replace('-tab', '');
    }
    /**
     * Handle specific tab types
     */
    async handleAgentTab() {
        if (this.handlers.onAgentTab) {
            // Update sidebar for agent tab
            const sidebar = document.querySelector('.sidebar-content');
            if (sidebar) {
                sidebar.classList.add('agent-tab-active');
            }
            await this.handlers.onAgentTab();
        }
    }
    async handlePeopleTab() {
        if (this.handlers.onPeopleTab) {
            await this.handlers.onPeopleTab();
        }
    }
    async handleVisibilityTab() {
        if (this.handlers.onVisibilityTab) {
            await this.handlers.onVisibilityTab();
        }
    }
    async handleRoomsTab() {
        if (this.handlers.onRoomsTab) {
            await this.handlers.onRoomsTab();
        }
    }
    async handleTimelinesTab() {
        if (this.handlers.onTimelinesTab) {
            await this.handlers.onTimelinesTab();
        }
    }
    async handleSettingsTab() {
        if (this.handlers.onSettingsTab) {
            await this.handlers.onSettingsTab();
        }
    }
    async handleManageTab() {
        await this.initializeManageTab();
    }
    /**
     * Dispatch tab switched event
     */
    dispatchTabSwitchedEvent(tabId, options, wasLoaded) {
        // Security: Sanitize event data
        const sanitizedDetail = {
            tabId, // Already validated as safe
            operation: options.operation, // Enum value, safe
            operationDesc: this.tabStateManager.getOperationDescription(options.operation), // Generated string, safe
            currentTab: this.config.getCurrentTab(), // Internal state, safe for coordination
            previousTab: this.config.getPreviousTab(), // Internal state, safe for coordination
            wasLoaded, // Boolean, safe
            shouldLoad: this.tabStateManager.shouldLoadTab(tabId, options.operation), // Boolean, safe
            skipThemeChanges: options.skipThemeChanges, // Boolean, safe
        };
        document.dispatchEvent(new CustomEvent('tabManager:tabSwitched', {
            detail: sanitizedDetail,
        }));
    }
    /**
     * Setup event handlers
     */
    setupDisplayHandlers() {
        this.display.setTabClickHandler?.(async (tabId) => {
            try {
                await this.config.switchToTab(tabId);
                this.display.updateActiveTab?.(tabId);
                // Use SWITCH operation for user clicks
                await this.triggerTabSwitch(tabId, { operation: TabOperation.SWITCH });
            }
            catch (error) {
                handleError(error, {
                    context: {
                        operation: 'setupDisplayHandlers.tabClickHandler',
                        component: 'TabManager',
                        tabId,
                    },
                });
            }
        });
    }
    setupModalHandlers() {
        // Modal event handlers would be implemented here
        this.logger.debug?.('TabManager: Modal handlers setup (placeholder)');
    }
    setupConfigListeners() {
        // Configuration change listeners would be implemented here
        this.logger.debug?.('TabManager: Config listeners setup (placeholder)');
    }
    /**
     * Utility methods
     */
    getCurrentTab() {
        return this.config.getCurrentTab();
    }
    getPreviousTab() {
        return this.config.getPreviousTab();
    }
    getConfiguration() {
        return this.config;
    }
    getAppStore() {
        return this.appStore;
    }
    getState() {
        return this.config.getState();
    }
    getActiveTab() {
        return this.getCurrentTab();
    }
    getTabStateManager() {
        return this.tabStateManager;
    }
    isTabLoaded(tabId) {
        return this.tabStateManager.isTabLoaded(tabId);
    }
    /**
     * Refresh display and modal
     */
    async refreshDisplay() {
        try {
            const state = this.config.getState();
            const visibleTabs = this.config.getVisibleTabs();
            const currentTab = state.currentTab;
            this.display.render?.(visibleTabs, currentTab);
            this.display.updateActiveTab?.(currentTab);
        }
        catch (error) {
            handleError(error, {
                context: { operation: 'refreshDisplay', component: 'TabManager' },
            });
        }
    }
}
// Export singleton instance with immediate initialization
let tabManagerInstance = null;
export function getTabManager(handlers) {
    if (!tabManagerInstance) {
        tabManagerInstance = new TabManager(Logger, handlers);
    }
    return tabManagerInstance;
}
// CRITICAL FIX: Expose singleton immediately for browser compatibility
if (typeof window !== 'undefined') {
    // Ensure singleton is created and exposed immediately
    const instance = getTabManager();
    window.getTabManager = getTabManager;
    window.tabContextManager = instance;
    window.tabStateManager = getTabStateManager();
    window.TabOperation = TabOperation;
}
//# sourceMappingURL=TabManager.js.map