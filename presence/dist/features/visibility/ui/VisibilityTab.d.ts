/**
 * VISIBILITY TAB COMPONENT - UI Rendering Component
 *
 * Phase 3: UI Component Extraction
 * - Extracted from updateVisibleTab function (legacy VisibilityManager.ts)
 * - Subscribes to VisibilityState for reactive updates
 * - Handles user list rendering, search, and Go Invisible button
 */
import type { VisibilityUser } from '../core/VisibilityTypes.js';
import { VisibilityState } from '../core/VisibilityState.js';
/**
 * VisibilityTab component
 * Renders the visibility tab UI with user list, search, and controls
 */
export declare class VisibilityTab {
    private container;
    private state;
    private unsubscribe;
    private searchInput;
    private goInvisibleBtn;
    private refreshInterval;
    private themeObserver;
    private isRendering;
    private previousTabId;
    constructor(state: VisibilityState);
    /**
     * Initialize component - find container and subscribe to state
     */
    initialize(): Promise<void>;
    /**
     * Set up tab tracking to remember previous tab
     */
    private setupTabTracking;
    /**
     * Find visibility tab container
     */
    private findContainer;
    /**
     * Render users list
     */
    render(users: VisibilityUser[]): Promise<void>;
    /**
     * Create header with count, search, and Go Invisible button
     */
    private createHeader;
    /**
     * Create user list
     */
    private createUserList;
    /**
     * Create user list item
     */
    private createUserItem;
    /**
     * Create fallback avatar
     */
    private createFallbackAvatar;
    /**
     * Set up search functionality
     */
    private setupSearch;
    /**
     * Set up Go Invisible button
     */
    private setupGoInvisibleButton;
    /**
     * Update button color based on theme
     */
    private updateButtonColor;
    /**
     * Set up theme observer
     */
    private setupThemeObserver;
    /**
     * Set up periodic refresh
     */
    private setupPeriodicRefresh;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
//# sourceMappingURL=VisibilityTab.d.ts.map