/**
 * Tab Manager Module
 * Main orchestrator for tab management functionality
 */
import { TabConfiguration } from './TabConfiguration.js';
import { AppStoreIntegration } from './AppStoreIntegration.js';
import { Logger } from '../../utils/Logger.js';
export interface TabHandlers {
    onAgentTab?: () => Promise<void>;
    onPeopleTab?: () => Promise<void>;
    onVisibilityTab?: () => Promise<void>;
    onRoomsTab?: () => Promise<void>;
    onDiscussTab?: () => Promise<void>;
    onSettingsTab?: () => Promise<void>;
}
export declare class TabManager {
    private config;
    private display;
    private modal;
    private appStore;
    private logger;
    private initialized;
    private handlers;
    constructor(logger?: typeof Logger, handlers?: TabHandlers);
    /**
     * Initialize Tab Manager
     */
    initialize(): Promise<void>;
    /**
     * Setup display event handlers
     */
    private setupDisplayHandlers;
    /**
     * Setup modal event handlers
     */
    private setupModalHandlers;
    /**
     * Setup configuration change listeners
     */
    private setupConfigListeners;
    /**
     * Refresh tab display
     */
    private refreshDisplay;
    /**
     * Refresh modal content
     */
    private refreshModal;
    /**
     * Trigger tab switch in existing tab navigation system
     * This integrates with the existing tabNavigation.ts system
     * ROOT CAUSE FIX: Ensure manage-tab can be switched away from (navigation not stuck)
     */
    private triggerTabSwitch;
    /**
     * Get current tab
     */
    getCurrentTab(): string | null;
    /**
     * Get previous tab
     */
    getPreviousTab(): string | null;
    /**
     * Get configuration service (for other modules)
     */
    getConfiguration(): TabConfiguration;
    /**
     * Get app store service (for other modules)
     */
    getAppStore(): AppStoreIntegration;
}
export declare function getTabManager(handlers?: TabHandlers): TabManager;
//# sourceMappingURL=TabManager.d.ts.map