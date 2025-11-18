/**
 * VISIBILITY MODAL HANDLER
 * Handles visibility access modal when user tries to access Visibility tab while not visible
 * TypeScript + ES6 Module
 */
declare class VisibilityModalHandler {
    private modal;
    private goVisibleBtn;
    private cancelBtn;
    private closeBtn;
    private isInitialized;
    constructor();
    /**
     * Initialize visibility modal handler
     */
    initialize(): Promise<void>;
    /**
     * Set up event listeners
     */
    setupEventListeners(): void;
    /**
     * Intercept visibility tab clicks
     */
    interceptVisibilityTabClicks(): void;
    /**
     * Check if user is currently visible
     * Checks both Chrome storage, settings page toggle value, and window.currentUser
     */
    checkVisibility(): Promise<boolean>;
    /**
     * Show modal
     */
    showModal(): void;
    /**
     * Hide modal
     */
    hideModal(): void;
    /**
     * Handle Go Visible button click
     */
    handleGoVisible(): Promise<void>;
    /**
     * Get auth token for API calls
     */
    getAuthToken(): Promise<string>;
    /**
     * Switch to visibility tab (normal tab switch)
     * FIX: Ensure tab is properly activated and visible
     * ROOT CAUSE FIX: Use correct tab ID format and ensure UIManager.switchTab works correctly
     */
    switchToVisibilityTab(): void;
}
declare const visibilityModalHandlerInstance: VisibilityModalHandler;
export { VisibilityModalHandler, visibilityModalHandlerInstance };
export default VisibilityModalHandler;
//# sourceMappingURL=VisibilityModalHandler.d.ts.map