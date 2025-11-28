/**
 * Tab Manager Modal Component
 * Full sidebar modal for managing tabs (reorder, visibility, count, app store)
 */
import { TabConfig, SDKApp, AppStoreFilters } from './types.js';
import { Logger } from '../../utils/Logger.js';
export declare class TabManagerModal {
    private modal;
    private isOpen;
    private logger;
    private onClose?;
    private onTabOrderChange?;
    private onTabVisibilityChange?;
    private onVisibleTabCountChange?;
    private onTabClick?;
    constructor(logger?: typeof Logger);
    /**
     * Initialize modal (create DOM structure)
     * ROOT CAUSE FIX: Ensure manage-tab content exists before creating modal
     */
    initialize(): void;
    /**
     * Ensure manage-tab content exists in DOM
     * ROOT CAUSE FIX: Create manage-tab content if it doesn't exist
     */
    private ensureManageTabContentExists;
    /**
     * Create modal DOM structure (now renders inside manage-tab content)
     */
    private createModalStructure;
    /**
     * Attach event listeners
     */
    private attachEventListeners;
    /**
     * Open/Show content (now part of tab, not modal overlay)
     */
    open(visibleTabCount?: number): void;
    /**
     * Close/Hide content (now handled by tab switching)
     */
    close(): void;
    /**
     * Render tab list for reordering
     */
    renderTabList(tabs: TabConfig[]): void;
    /**
     * Create tab list item for management
     */
    private createTabListItem;
    /**
     * Render app store list
     */
    renderAppStore(apps: SDKApp[], _filters?: AppStoreFilters): void;
    /**
     * Create app store item
     */
    private createAppStoreItem;
    /**
     * Render star rating
     */
    private renderStars;
    /**
     * Set event handlers
     */
    setOnClose(handler: () => void): void;
    setOnTabOrderChange(handler: (tabId: string, newOrder: number) => void): void;
    setOnTabVisibilityChange(handler: (tabId: string, visible: boolean) => void): void;
    setOnVisibleTabCountChange(handler: (count: number) => void): void;
    setOnTabClick(handler: (tabId: string) => void): void;
    /**
     * Check if modal is open
     */
    getIsOpen(): boolean;
    /**
     * Get modal element (for internal use)
     */
    getModal(): HTMLElement | null;
}
//# sourceMappingURL=TabManagerModal.d.ts.map