/**
 * VisibilityTabHandler - Handles Visibility tab click behavior and Go Invisible functionality
 * COMP: Follows COMP design system
 *
 * When Visible is No:
 * - Clicking Visibility tab shows Go Visible modal
 * - After clicking Go Visible in modal, sets Visible to Yes and shows Visibility Tab
 *
 * When on Visibility Tab:
 * - Go Invisible button navigates to Discuss tab and sets Visible to No
 */
class VisibilityTabHandler {
    constructor() {
        this.isInitialized = false;
    }
    /**
     * Initialize visibility tab handler
     */
    async initialize() {
        if (this.isInitialized)
            return;
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupHandlers());
        }
        else {
            this.setupHandlers();
        }
        this.isInitialized = true;
        console.log('✅ VISIBILITY_TAB_HANDLER: Initialized');
    }
    /**
     * Setup event handlers
     */
    setupHandlers() {
        // COMP FIX: Watch for visibility tab activation and trigger refresh
        this.setupTabActivationWatcher();
        // Intercept Visibility tab click - COMP: Show modal when Visible=No
        // Use capture phase to intercept BEFORE tabNavigation runs
        const visibilityTabBtn = document.querySelector('[data-tab="visibility-tab"]');
        if (visibilityTabBtn) {
            // COMP: Add listener in capture phase to intercept before tabNavigation
            visibilityTabBtn.addEventListener('click', async (e) => {
                const visibilityToggle = document.getElementById('visibility-toggle');
                const isVisible = visibilityToggle?.checked || false;
                if (!isVisible) {
                    // COMP: Show Go Visible modal instead of switching tabs
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation(); // COMP: Prevent tabNavigation from running
                    const win = window;
                    if (win.showGoVisibleModal) {
                        win.showGoVisibleModal();
                    }
                    else if (win.openGoVisibleModal) {
                        win.openGoVisibleModal();
                    }
                    else {
                        console.warn('⚠️ VISIBILITY_TAB_HANDLER: Go Visible modal not available');
                    }
                }
                else {
                    // Visible is Yes, let tabNavigation handle it, then refresh
                    setTimeout(() => this.refreshVisibilityOnTabOpen(), 100);
                }
            }, true); // COMP: Capture phase - runs before tabNavigation
            console.log('✅ VISIBILITY_TAB_HANDLER: Visibility tab click handler attached (capture phase)');
        }
        // Setup Go Invisible button in Visibility tab - COMP: Navigate to Discuss tab
        this.setupGoInvisibleButton();
    }
    /**
     * Setup Go Invisible button in Visibility tab
     * COMP: Navigates to Discuss tab, not Settings
     */
    setupGoInvisibleButton() {
        // Check if Visibility tab content exists and add Go Invisible button
        const checkVisibilityTab = () => {
            const visibilityTab = document.getElementById('visibility-tab');
            if (!visibilityTab) {
                setTimeout(checkVisibilityTab, 500);
                return;
            }
            // Check if button already exists
            let goInvisibleBtn = document.getElementById('go-invisible-btn');
            if (!goInvisibleBtn) {
                // Create Go Invisible button
                goInvisibleBtn = document.createElement('button');
                goInvisibleBtn.id = 'go-invisible-btn';
                goInvisibleBtn.textContent = 'Go Invisible';
                goInvisibleBtn.style.cssText = `
          padding: 10px 20px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          margin: 16px;
        `;
                goInvisibleBtn.addEventListener('click', async () => {
                    // Set visibility to false
                    const win = window;
                    if (win.setVisibilityStatus) {
                        await win.setVisibilityStatus(false);
                    }
                    // COMP: Switch to Discuss tab, not Settings
                    this.switchToDiscussTab();
                });
                // Insert at the top of visibility tab
                visibilityTab.insertBefore(goInvisibleBtn, visibilityTab.firstChild);
            }
        };
        checkVisibilityTab();
    }
    /**
     * Switch to Discuss tab - COMP: Go Invisible navigates here
     */
    switchToDiscussTab() {
        // Remove active class from all tabs
        const allTabs = document.querySelectorAll('.main-nav-tab');
        const allTabContents = document.querySelectorAll('.main-tab-content');
        allTabs.forEach(tab => tab.classList.remove('active'));
        allTabContents.forEach(content => content.classList.remove('active'));
        // Activate Discuss tab
        const discussTabBtn = document.querySelector('[data-tab="discuss-tab"]');
        const discussTabContent = document.getElementById('discuss-tab');
        if (discussTabBtn) {
            discussTabBtn.classList.add('active');
        }
        if (discussTabContent) {
            discussTabContent.classList.add('active');
        }
    }
    /**
     * Navigate to Visibility tab (called after Go Visible)
     */
    navigateToVisibilityTab() {
        // Remove active class from all tabs
        const allTabs = document.querySelectorAll('.main-nav-tab');
        const allTabContents = document.querySelectorAll('.main-tab-content');
        allTabs.forEach(tab => tab.classList.remove('active'));
        allTabContents.forEach(content => content.classList.remove('active'));
        // Activate Visibility tab
        const visibilityTabBtn = document.querySelector('[data-tab="visibility-tab"]');
        const visibilityTabContent = document.getElementById('visibility-tab');
        if (visibilityTabBtn) {
            visibilityTabBtn.classList.add('active');
        }
        if (visibilityTabContent) {
            visibilityTabContent.classList.add('active');
        }
        // COMP FIX: Trigger visibility refresh when navigating to tab
        setTimeout(() => this.refreshVisibilityOnTabOpen(), 100);
    }
    /**
     * COMP FIX: Refresh visibility data when visibility tab is opened
     */
    async refreshVisibilityOnTabOpen() {
        try {
            console.log('🔄 VISIBILITY_TAB_HANDLER: Refreshing visibility on tab open');
            // Get current page ID
            const resolveCurrentPageId = () => {
                const tabContainer = (typeof window !== 'undefined' && window.tabContextManager)
                    ? window.tabContextManager?.getTabContainer('visibility-tab')
                    : null;
                if (tabContainer?.dataset.pageId) {
                    return tabContainer.dataset.pageId;
                }
                const pageId = (typeof window !== 'undefined' && window.currentUrlData)
                    ? window.currentUrlData?.pageId
                    : null;
                if (pageId) {
                    return pageId;
                }
                const firstMessage = typeof document !== 'undefined' ? document.querySelector('[data-page-id]') : null;
                const pageIdAttr = firstMessage?.getAttribute('data-page-id');
                return pageIdAttr || null;
            };
            const currentPageId = resolveCurrentPageId();
            console.log('🔄 VISIBILITY_TAB_HANDLER: Current page ID:', currentPageId);
            if (!currentPageId) {
                console.warn('⚠️ VISIBILITY_TAB_HANDLER: No page ID available for refresh');
                return;
            }
            // COMP: Use window.refreshVisibilityAvatars (set by buildGraph.js) which uses graph.visibilityManager
            if (typeof window !== 'undefined' && window.refreshVisibilityAvatars && typeof window.refreshVisibilityAvatars === 'function') {
                console.log('🔄 VISIBILITY_TAB_HANDLER: Calling refreshVisibilityAvatars (COMP method)');
                await window.refreshVisibilityAvatars(currentPageId);
                console.log('✅ VISIBILITY_TAB_HANDLER: Visibility refresh completed');
            }
            else {
                console.warn('⚠️ VISIBILITY_TAB_HANDLER: refreshVisibilityAvatars not available');
            }
        }
        catch (error) {
            console.error('❌ VISIBILITY_TAB_HANDLER: Error refreshing visibility:', error);
        }
    }
    /**
     * COMP FIX: Watch for visibility tab activation using MutationObserver
     */
    setupTabActivationWatcher() {
        const visibilityTab = document.getElementById('visibility-tab');
        if (!visibilityTab) {
            // Retry after DOM is ready
            setTimeout(() => this.setupTabActivationWatcher(), 500);
            return;
        }
        let lastActiveState = visibilityTab.classList.contains('active');
        const observer = new MutationObserver(() => {
            const isActive = visibilityTab.classList.contains('active');
            if (isActive && !lastActiveState) {
                // Tab just became active - trigger refresh
                console.log('🔄 VISIBILITY_TAB_HANDLER: Tab activated, triggering refresh');
                this.refreshVisibilityOnTabOpen();
            }
            lastActiveState = isActive;
        });
        observer.observe(visibilityTab, {
            attributes: true,
            attributeFilter: ['class']
        });
        // Also watch the tab button
        const visibilityTabBtn = document.querySelector('[data-tab="visibility-tab"]');
        if (visibilityTabBtn) {
            observer.observe(visibilityTabBtn, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
}
// Create singleton instance
const visibilityTabHandlerInstance = new VisibilityTabHandler();
// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            visibilityTabHandlerInstance.initialize();
        });
    }
    else {
        visibilityTabHandlerInstance.initialize();
    }
    // Export to window
    window.visibilityTabHandler = visibilityTabHandlerInstance;
    window.navigateToVisibilityTab =
        () => visibilityTabHandlerInstance.navigateToVisibilityTab();
    console.log('✅ VISIBILITY_TAB_HANDLER: Exported to window');
}
export { VisibilityTabHandler, visibilityTabHandlerInstance };
export default VisibilityTabHandler;
