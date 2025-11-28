/**
 * VISIBILITY UI EVENTS COORDINATOR - Unified Event Handling
 *
 * Phase 4: Event Handler Consolidation
 * - Consolidates event handlers from VisibilityTabHandler and VisibilityUIModule
 * - Single source of truth for tab navigation
 * - Unified visibility check and modal triggering
 */
import { VisibilityTab } from './VisibilityTab.js';
import { VisibilityModal } from './VisibilityModal.js';
import { getCurrentPageId } from '../utils/pageIdResolver.js';
import { Logger } from '../../../utils/Logger.js';
import { handleError } from '../../../utils/ErrorHandler.js';
/**
 * VisibilityUIEvents coordinator
 * Manages all visibility-related UI events
 */
export class VisibilityUIEvents {
    constructor(state, storage) {
        this.visibilityTab = null;
        this.modal = null;
        this.isInitialized = false;
        this.tabActivationObserver = null;
        this.state = state;
        this.storage = storage;
    }
    /**
     * Initialize event coordinator
     */
    async initialize() {
        try {
            if (this.isInitialized)
                return;
            // Initialize components
            this.visibilityTab = new VisibilityTab(this.state);
            await this.visibilityTab.initialize();
            this.modal = new VisibilityModal(this.storage, () => {
                // After going visible, navigate to visibility tab
                this.navigateToVisibilityTab();
            });
            await this.modal.initialize();
            // Set up unified event handlers
            this.setupVisibilityTabClick();
            this.setupTabActivationWatcher();
            this.isInitialized = true;
            Logger.debug('✅ VISIBILITY_UI_EVENTS: Initialized', null, 'general');
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'initialize',
                    component: 'VisibilityUIEvents'
                }
            });
        }
    }
    /**
     * Set up visibility tab click handler (unified)
     */
    setupVisibilityTabClick() {
        const checkForTab = () => {
            const btn = document.querySelector('[data-tab="visibility-tab"]');
            if (!btn) {
                setTimeout(checkForTab, 500);
                return;
            }
            // Use capture phase to intercept before other handlers
            btn.addEventListener('click', async (e) => {
                try {
                    const isVisible = await this.storage.getVisibility();
                    if (!isVisible) {
                        // Show modal instead of switching tabs
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        if (this.modal) {
                            this.modal.show();
                        }
                    }
                    else {
                        // Visible - allow navigation, then refresh
                        setTimeout(() => this.refreshVisibilityOnTabOpen(), 100);
                    }
                }
                catch (error) {
                    handleError(error, {
                        log: true,
                        logLevel: 'error',
                        context: {
                            operation: 'visibilityTabClick',
                            component: 'VisibilityUIEvents'
                        }
                    });
                }
            }, true); // Capture phase
            Logger.debug('✅ VISIBILITY_UI_EVENTS: Visibility tab click handler attached', null, 'general');
        };
        checkForTab();
    }
    /**
     * Set up tab activation watcher
     */
    setupTabActivationWatcher() {
        const visibilityTab = document.getElementById('visibility-tab');
        if (!visibilityTab) {
            setTimeout(() => this.setupTabActivationWatcher(), 500);
            return;
        }
        let lastActiveState = visibilityTab.classList.contains('active');
        this.tabActivationObserver = new MutationObserver(() => {
            const isActive = visibilityTab.classList.contains('active');
            if (isActive && !lastActiveState) {
                // Tab just became active - trigger refresh
                this.refreshVisibilityOnTabOpen();
            }
            lastActiveState = isActive;
        });
        this.tabActivationObserver.observe(visibilityTab, {
            attributes: true,
            attributeFilter: ['class']
        });
        // Also watch the tab button
        const btn = document.querySelector('[data-tab="visibility-tab"]');
        if (btn) {
            this.tabActivationObserver.observe(btn, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
    /**
     * Refresh visibility when tab opens
     */
    async refreshVisibilityOnTabOpen() {
        const currentPageId = getCurrentPageId('visibility-tab');
        if (!currentPageId) {
            Logger.warn('⚠️ VISIBILITY_UI_EVENTS: No page ID for refresh', null, 'general');
            return;
        }
        Logger.debug('🔍 VISIBILITY_UI_EVENTS: Tab opened', { pageId: currentPageId }, 'general');
        // ROOT CAUSE FIX: Actually call refreshVisibilityAvatars when tab opens
        // Access VisibilityManager from module graph
        const win = typeof window !== 'undefined' ? window : null;
        if (win?.__CANOPI_MODULE_GRAPH__?.visibilityManager) {
            try {
                const users = await win.__CANOPI_MODULE_GRAPH__.visibilityManager.refreshVisibilityAvatars(currentPageId);
                Logger.debug('✅ VISIBILITY_UI_EVENTS: Refreshed visibility', { pageId: currentPageId, userCount: users.length }, 'general');
                // State subscription will trigger UI update automatically
            }
            catch (error) {
                Logger.error('❌ VISIBILITY_UI_EVENTS: Failed to refresh visibility', error, 'general');
            }
        }
        else {
            Logger.warn('⚠️ VISIBILITY_UI_EVENTS: VisibilityManager not available in module graph', null, 'general');
        }
    }
    /**
     * Navigate to visibility tab
     */
    navigateToVisibilityTab() {
        const win = typeof window !== 'undefined' ? window : null;
        if (win?.uiManager?.switchTab) {
            win.uiManager.switchTab('visibility-tab');
        }
        else if (win?.switchTab) {
            win.switchTab('visibility-tab');
        }
        else {
            // Fallback: manual tab switch
            const allTabs = document.querySelectorAll('.main-nav-tab');
            const allTabContents = document.querySelectorAll('.main-tab-content');
            allTabs.forEach(tab => tab.classList.remove('active'));
            allTabContents.forEach(content => content.classList.remove('active'));
            const btn = document.querySelector('[data-tab="visibility-tab"]');
            const content = document.getElementById('visibility-tab');
            if (btn)
                btn.classList.add('active');
            if (content)
                content.classList.add('active');
        }
    }
    /**
     * Show modal
     */
    showModal() {
        if (this.modal) {
            this.modal.show();
        }
    }
    /**
     * Cleanup
     */
    cleanup() {
        if (this.visibilityTab) {
            this.visibilityTab.cleanup();
        }
        if (this.tabActivationObserver) {
            this.tabActivationObserver.disconnect();
        }
        this.isInitialized = false;
    }
}
