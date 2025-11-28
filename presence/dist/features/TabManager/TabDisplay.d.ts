/**
 * Tab Display Component
 * Renders visible tabs in the main navigation bar with manage button
 */
import { TabConfig } from './types.js';
import { Logger } from '../../utils/Logger.js';
export declare class TabDisplay {
    private container;
    private manageButton;
    private logger;
    private onTabClick?;
    constructor(logger?: typeof Logger);
    /**
     * Initialize tab display
     */
    initialize(containerSelector?: string): void;
    /**
     * Render tabs based on configuration
     */
    render(tabs: TabConfig[], currentTab: string | null): void;
    /**
     * Create a tab element
     */
    private createTabElement;
    /**
     * Create manage button (now a true tab)
     * ROOT CAUSE FIX: Ensure manage-tab is permanent (always far right, cannot move/remove)
     */
    private createManageButton;
    /**
     * Set tab click handler
     */
    setTabClickHandler(handler: (tabId: string) => void): void;
    /**
     * Set manage button click handler
     * NOTE: Manage button is now a regular tab, so this is no longer used
     * Kept for backward compatibility
     */
    setManageClickHandler(_handler: () => void): void;
    /**
     * Update active tab visual state
     * ROOT CAUSE FIX: Ensure manage-tab selector line displays correctly
     */
    updateActiveTab(tabId: string | null): void;
}
//# sourceMappingURL=TabDisplay.d.ts.map