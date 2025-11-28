/**
 * VISIBILITY UI MODULE - Comprehensive Visibility UI Management
 *
 * Consolidates all visibility-related UI fixes to prevent reverts:
 * - Visibility tab click behavior (show modal when Visible=No)
 * - Go Invisible button (navigate to Discuss tab)
 * - Theme toggle isolation (doesn't toggle visibility)
 * - Visibility toggle fix (no double-click)
 * - GoVisibleModal integration
 * - Tab navigation
 *
 * COMP: Follows COMP design system
 * TypeScript + ES6 Module
 */
class VisibilityUIModule {
    constructor() {
        this.isInitialized = false;
        this.visibilityTabBtn = null;
        this.visibilityToggle = null;
        this.themeToggle = null;
        this.goInvisibleBtn = null;
    }
    /**
     * Initialize Visibility UI Module
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('✅ VISIBILITY_UI_MODULE: Already initialized');
            return;
        }
        console.log('🔧 VISIBILITY_UI_MODULE: Initializing...');
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAllHandlers());
        }
        else {
            this.setupAllHandlers();
        }
        this.isInitialized = true;
        console.log('✅ VISIBILITY_UI_MODULE: Initialized successfully');
    }
    /**
     * Setup all event handlers
     */
    setupAllHandlers() {
        // Setup visibility tab click handler
        this.setupVisibilityTabHandler();
        // Setup Go Invisible button
        this.setupGoInvisibleButton();
        // Setup theme toggle isolation
        this.setupThemeToggleIsolation();
        // Setup visibility toggle fix
        this.setupVisibilityToggleFix();
        // Setup tab activation watcher
        this.setupTabActivationWatcher();
    }
    /**
     * COMP: Visibility tab click handler
     * When Visible=No, clicking Visibility tab shows Go Visible modal
     * When Visible=Yes, clicking Visibility tab navigates normally
     */
    setupVisibilityTabHandler() {
        const checkForTab = () => {
            const visibilityTabBtn = document.querySelector('[data-tab="visibility-tab"]');
            if (!visibilityTabBtn) {
                setTimeout(checkForTab, 500);
                return;
            }
            this.visibilityTabBtn = visibilityTabBtn;
            // COMP: Use capture phase to intercept BEFORE tabNavigation runs
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
                        console.warn('⚠️ VISIBILITY_UI_MODULE: Go Visible modal not available');
                    }
                    return false; // COMP: Prevent default navigation
                }
                else {
                    // Visible is Yes, let tabNavigation handle it, then refresh
                    setTimeout(() => this.refreshVisibilityOnTabOpen(), 100);
                }
            }, true); // COMP: Capture phase - runs before tabNavigation
            console.log('✅ VISIBILITY_UI_MODULE: Visibility tab click handler attached (capture phase)');
        };
        checkForTab();
    }
    /**
     * COMP: Setup Go Invisible button in Visibility tab
     * Navigates to Discuss tab and sets Visible to No
     */
    setupGoInvisibleButton() {
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
                this.goInvisibleBtn = goInvisibleBtn;
                console.log('✅ VISIBILITY_UI_MODULE: Go Invisible button created');
            }
        };
        checkVisibilityTab();
    }
    /**
     * COMP: Switch to Discuss tab
     * Used when Go Invisible is clicked
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
        console.log('✅ VISIBILITY_UI_MODULE: Switched to Discuss tab');
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
     * COMP FIX: Theme toggle isolation
     * Ensures theme toggle ONLY toggles theme, not visibility
     */
    setupThemeToggleIsolation() {
        const checkForToggle = () => {
            const themeToggle = document.getElementById('theme-toggle');
            if (!themeToggle) {
                setTimeout(checkForToggle, 500);
                return;
            }
            // Check if already attached
            if (themeToggle.getAttribute('data-visibility-ui-handler-attached') === 'true') {
                console.log('✅ VISIBILITY_UI_MODULE: Theme toggle handler already attached, skipping');
                return;
            }
            this.themeToggle = themeToggle;
            // ROOT CAUSE FIX: Track if we're programmatically setting the toggle to prevent save loops
            let isProgrammaticChange = false;
            // Attach event listener with strict isolation
            themeToggle.addEventListener('change', async (e) => {
                // COMP: CRITICAL - Ensure this is ONLY the theme toggle
                if (e.target !== themeToggle || themeToggle.id !== 'theme-toggle') {
                    console.warn('⚠️ VISIBILITY_UI_MODULE: Ignoring change event - wrong target for theme toggle');
                    return;
                }
                // ROOT CAUSE FIX: Ignore change events that are programmatic (from loadSettings)
                if (isProgrammaticChange) {
                    console.log('🔍 VISIBILITY_UI_MODULE: Ignoring programmatic theme toggle change');
                    isProgrammaticChange = false;
                    return;
                }
                e.stopPropagation();
                e.stopImmediatePropagation(); // COMP: Prevent other handlers from running
                console.log('🔍 VISIBILITY_UI_MODULE: Theme toggle changed (user action)');
                // Get current theme
                const beforeTheme = document.body.getAttribute('data-theme') ||
                    document.documentElement.getAttribute('data-theme') ||
                    'light';
                console.log('🔍 VISIBILITY_UI_MODULE: Theme before change:', beforeTheme);
                // COMP: Save theme and apply immediately
                const win = window;
                if (win.saveTheme) {
                    await win.saveTheme();
                }
                else if (win.updateThemeEverywhere) {
                    const newTheme = beforeTheme === 'light' ? 'dark' : 'light';
                    win.updateThemeEverywhere(newTheme);
                }
                const afterTheme = document.body.getAttribute('data-theme') ||
                    document.documentElement.getAttribute('data-theme') ||
                    'light';
                console.log('🔍 VISIBILITY_UI_MODULE: Theme after change:', afterTheme);
                console.log('🔍 VISIBILITY_UI_MODULE: Theme changed:', beforeTheme !== afterTheme ? 'YES ✅' : 'NO ❌');
            });
            // ROOT CAUSE FIX: Store flag setter on toggle element for programmatic changes
            themeToggle._setProgrammaticChange = () => { isProgrammaticChange = true; };
            themeToggle.setAttribute('data-visibility-ui-handler-attached', 'true');
            console.log('✅ VISIBILITY_UI_MODULE: Theme toggle isolation handler attached');
        };
        checkForToggle();
    }
    /**
     * COMP FIX: Visibility toggle fix
     * Prevents double-click issue by not cloning element
     */
    setupVisibilityToggleFix() {
        const checkForToggle = () => {
            const visibilityToggle = document.getElementById('visibility-toggle');
            if (!visibilityToggle) {
                setTimeout(checkForToggle, 500);
                return;
            }
            // Check if already attached
            if (visibilityToggle.getAttribute('data-visibility-ui-handler-attached') === 'true') {
                console.log('✅ VISIBILITY_UI_MODULE: Visibility toggle handler already attached, skipping');
                return;
            }
            this.visibilityToggle = visibilityToggle;
            // COMP: Don't clone - cloning causes double-click issue
            // Just attach the handler directly
            const toggle = visibilityToggle;
            toggle.addEventListener('change', async (e) => {
                // COMP: CRITICAL FIX - Ensure this is the visibility toggle, not theme toggle
                if (e.target !== toggle || toggle.id !== 'visibility-toggle') {
                    console.warn('⚠️ VISIBILITY_UI_MODULE: Ignoring change event - wrong target for visibility toggle');
                    return;
                }
                e.stopPropagation(); // COMP: Prevent event bubbling
                e.stopImmediatePropagation(); // COMP: Prevent other handlers from running
                console.log('🔍 VISIBILITY_UI_MODULE: Visibility toggle changed');
                const isVisible = toggle.checked;
                console.log('🔍 VISIBILITY_UI_MODULE: Visibility toggle checked:', isVisible);
                // COMP: Update UI and save immediately
                const win = window;
                if (win.updateVisibilityStatus) {
                    win.updateVisibilityStatus();
                }
                if (win.setVisibilityStatus) {
                    await win.setVisibilityStatus(isVisible);
                }
                console.log('🔍 VISIBILITY_UI_MODULE: Visibility saved:', toggle.checked);
            }, { once: false, passive: false });
            toggle.setAttribute('data-visibility-ui-handler-attached', 'true');
            console.log('✅ VISIBILITY_UI_MODULE: Visibility toggle handler attached');
        };
        checkForToggle();
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
                console.log('🔄 VISIBILITY_UI_MODULE: Tab activated, triggering refresh');
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
        console.log('✅ VISIBILITY_UI_MODULE: Tab activation watcher set up');
    }
    /**
     * COMP FIX: Refresh visibility data when visibility tab is opened
     */
    async refreshVisibilityOnTabOpen() {
        try {
            console.log('🔄 VISIBILITY_UI_MODULE: Refreshing visibility on tab open');
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
            console.log('🔄 VISIBILITY_UI_MODULE: Current page ID:', currentPageId);
            if (!currentPageId) {
                console.warn('⚠️ VISIBILITY_UI_MODULE: No page ID available for refresh');
                return;
            }
            // COMP: Use window.refreshVisibilityAvatars (set by buildGraph.js) which uses graph.visibilityManager
            if (typeof window !== 'undefined' && window.refreshVisibilityAvatars && typeof window.refreshVisibilityAvatars === 'function') {
                console.log('🔄 VISIBILITY_UI_MODULE: Calling refreshVisibilityAvatars (COMP method)');
                await window.refreshVisibilityAvatars(currentPageId);
                console.log('✅ VISIBILITY_UI_MODULE: Visibility refresh completed');
            }
            else {
                console.warn('⚠️ VISIBILITY_UI_MODULE: refreshVisibilityAvatars not available');
            }
        }
        catch (error) {
            console.error('❌ VISIBILITY_UI_MODULE: Error refreshing visibility:', error);
        }
    }
}
// Create singleton instance
const visibilityUIModuleInstance = new VisibilityUIModule();
// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            visibilityUIModuleInstance.initialize();
        });
    }
    else {
        visibilityUIModuleInstance.initialize();
    }
    // Export to window
    window.visibilityUIModule = visibilityUIModuleInstance;
    window.navigateToVisibilityTab =
        () => visibilityUIModuleInstance.navigateToVisibilityTab();
    console.log('✅ VISIBILITY_UI_MODULE: Exported to window');
}
export { VisibilityUIModule, visibilityUIModuleInstance };
export default VisibilityUIModule;
