/**
 * VISIBILITY MODAL HANDLER
 * Handles visibility access modal when user tries to access Visibility tab while not visible
 * TypeScript + ES6 Module
 */
class VisibilityModalHandler {
    constructor() {
        this.modal = null;
        this.goVisibleBtn = null;
        this.cancelBtn = null;
        this.closeBtn = null;
        this.isInitialized = false;
        this.modal = null;
        this.goVisibleBtn = null;
        this.cancelBtn = null;
        this.closeBtn = null;
        this.isInitialized = false;
    }
    /**
     * Initialize visibility modal handler
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ VISIBILITY_MODAL: Already initialized');
            return;
        }
        console.log('🔧 VISIBILITY_MODAL: Initializing visibility modal handler...');
        try {
            // Get DOM elements
            this.modal = document.getElementById('visibility-access-modal');
            this.goVisibleBtn = document.getElementById('go-visible-btn');
            this.cancelBtn = document.getElementById('cancel-visibility-btn');
            this.closeBtn = document.getElementById('close-visibility-access-modal');
            if (!this.modal) {
                console.error('❌ VISIBILITY_MODAL: Modal element (visibility-access-modal) not found in DOM');
                return;
            }
            if (!this.goVisibleBtn) {
                console.error('❌ VISIBILITY_MODAL: Go Visible button (go-visible-btn) not found in DOM');
                return;
            }
            if (!this.cancelBtn) {
                console.error('❌ VISIBILITY_MODAL: Cancel button (cancel-visibility-btn) not found in DOM');
                return;
            }
            // Set up event listeners
            this.setupEventListeners();
            // Intercept visibility tab clicks
            this.interceptVisibilityTabClicks();
            this.isInitialized = true;
            console.log('✅ VISIBILITY_MODAL: Visibility modal handler initialized');
        }
        catch (error) {
            console.error('❌ VISIBILITY_MODAL: Failed to initialize:', error);
        }
    }
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Go Visible button
        if (this.goVisibleBtn) {
            this.goVisibleBtn.addEventListener('click', async () => {
                await this.handleGoVisible();
            });
        }
        // Cancel button
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }
        // Close on backdrop click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hideModal();
                }
            });
        }
    }
    /**
     * Intercept visibility tab clicks
     */
    interceptVisibilityTabClicks() {
        // Listen for all tab clicks
        document.addEventListener('click', async (e) => {
            const visibilityTabBtn = e.target.closest('[data-tab="visibility-tab"]');
            if (visibilityTabBtn) {
                // Check if already processing to prevent loops
                if (visibilityTabBtn.dataset.processing === 'true') {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                // Mark as processing
                visibilityTabBtn.dataset.processing = 'true';
                // Check if user is visible (check both toggle and storage)
                const isVisible = await this.checkVisibility();
                console.log('🔍 VISIBILITY_MODAL: Tab clicked, isVisible:', isVisible);
                if (!isVisible) {
                    // Show modal
                    console.log('🔍 VISIBILITY_MODAL: User not visible, showing modal');
                    this.showModal();
                    visibilityTabBtn.dataset.processing = 'false';
                }
                else {
                    // Allow normal tab switch (remove processing flag first)
                    visibilityTabBtn.dataset.processing = 'false';
                    // FIX: Ensure tab button is properly activated
                    const allTabButtons = document.querySelectorAll('.main-nav-tab, button[data-tab]');
                    allTabButtons.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-tab') === 'visibility-tab') {
                            btn.classList.add('active');
                        }
                    });
                    // Use UIManager to switch tab
                    if (window.uiManager && typeof window.uiManager.switchTab === 'function') {
                        window.uiManager.switchTab('visibility-tab');
                    }
                    else {
                        this.switchToVisibilityTab();
                    }
                    console.log('✅ VISIBILITY_MODAL: Visibility tab opened successfully');
                }
            }
        }, true); // Use capture phase to intercept before other handlers
    }
    /**
     * Check if user is currently visible
     * Checks both Chrome storage, settings page toggle value, and window.currentUser
     */
    async checkVisibility() {
        try {
            // First check window.currentUser (most reliable, updated immediately)
            if (window.currentUser) {
                if (window.currentUser.isVisible === true || window.currentUser.visibilityEnabled === true) {
                    console.log('🔍 VISIBILITY_MODAL: User is visible (from window.currentUser)');
                    return true;
                }
                if (window.currentUser.isVisible === false || window.currentUser.visibilityEnabled === false) {
                    console.log('🔍 VISIBILITY_MODAL: User is not visible (from window.currentUser)');
                    return false;
                }
            }
            // Then check the settings page toggle (most current UI value)
            const visibilityToggle = document.getElementById('visibility-toggle');
            if (visibilityToggle) {
                const toggleValue = visibilityToggle.checked;
                console.log('🔍 VISIBILITY_MODAL: Settings toggle value:', toggleValue);
                if (toggleValue === true) {
                    return true;
                }
                if (toggleValue === false) {
                    return false;
                }
            }
            // Use UserPreferencesManager (unified system)
            if (window.userPreferencesManager && window.userPreferencesManager.isInitialized) {
                const isVisible = await window.userPreferencesManager.getPreference('isVisible');
                // getPreference returns PreferenceValue (string | number | boolean | null)
                // For isVisible, we expect boolean, but need to handle string values too
                if (isVisible === true || isVisible === 'true') {
                    console.log('🔍 VISIBILITY_MODAL: User is visible (from UserPreferencesManager)');
                    return true;
                }
                if (isVisible === false || isVisible === 'false') {
                    console.log('🔍 VISIBILITY_MODAL: User is not visible (from UserPreferencesManager)');
                    return false;
                }
            }
            else if (window.unifiedSettingsStorage && typeof window.unifiedSettingsStorage.getSetting === 'function') {
                // Fallback to old system during transition
                const dbValue = await window.unifiedSettingsStorage.getSetting('visibilityEnabled', true, { apiKey: 'isVisible' });
                if (dbValue === true) {
                    console.log('🔍 VISIBILITY_MODAL: User is visible (from database fallback)');
                    return true;
                }
                if (dbValue === false) {
                    console.log('🔍 VISIBILITY_MODAL: User is not visible (from database fallback)');
                    return false;
                }
            }
            // Fallback to Chrome storage
            const storageData = await chrome.storage.local.get(['visibilityEnabled']);
            const storageValue = storageData.visibilityEnabled !== false; // Default to true
            console.log('🔍 VISIBILITY_MODAL: Storage value:', storageValue);
            return storageValue;
        }
        catch (error) {
            console.warn('⚠️ VISIBILITY_MODAL: Failed to check visibility:', error);
            return true; // Default to visible on error
        }
    }
    /**
     * Show modal
     */
    showModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            this.modal.style.zIndex = '10002'; // Ensure it's on top
            console.log('✅ VISIBILITY_MODAL: Modal displayed with z-index:', this.modal.style.zIndex);
            // Debug: Check if modal is actually visible
            const computedStyle = window.getComputedStyle(this.modal);
            console.log('🔍 VISIBILITY_MODAL: Modal computed display:', computedStyle.display);
            console.log('🔍 VISIBILITY_MODAL: Modal computed z-index:', computedStyle.zIndex);
        }
        else {
            console.error('❌ VISIBILITY_MODAL: Modal element not found when trying to show');
        }
    }
    /**
     * Hide modal
     */
    hideModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
    /**
     * Handle Go Visible button click
     */
    async handleGoVisible() {
        try {
            console.log('🔧 VISIBILITY_MODAL: Setting user to visible...');
            // Set visibility to true using unified storage (ROOT CAUSE FIX: Use unified function)
            // Use UserPreferencesManager (unified system)
            if (window.userPreferencesManager && window.userPreferencesManager.isInitialized) {
                console.log('✅ VISIBILITY_MODAL: Using UserPreferencesManager to save visibility');
                await window.userPreferencesManager.savePreference('isVisible', true);
            }
            else if (window.saveSetting) {
                // Fallback to old system
                console.log('⚠️ VISIBILITY_MODAL: UserPreferencesManager not available, using saveSetting fallback');
                await window.saveSetting('visibilityEnabled', true, { apiKey: 'isVisible' });
            }
            else {
                // Fallback to direct storage
                await chrome.storage.local.set({ visibilityEnabled: true });
            }
            // FIX: Force update window.currentUser immediately
            if (window.currentUser) {
                window.currentUser.isVisible = true;
                window.currentUser.visibilityEnabled = true;
            }
            // Update visibility toggle in settings if available
            const visibilityToggleEl = document.getElementById('visibility-toggle');
            if (visibilityToggleEl) {
                visibilityToggleEl.checked = true;
                // Trigger change event to update UI and save
                visibilityToggleEl.dispatchEvent(new Event('change'));
            }
            // Update visibility settings manager if available
            if (window.visibilitySettingsManager && typeof window.visibilitySettingsManager.saveVisibility === 'function') {
                await window.visibilitySettingsManager.saveVisibility();
            }
            // Hide modal first
            this.hideModal();
            // FIX: Wait for save to complete, then switch to visibility tab
            // CRITICAL FIX: Increased timeout to ensure database save completes
            setTimeout(async () => {
                // Force check visibility again
                const isVisible = await this.checkVisibility();
                console.log('🔍 VISIBILITY_MODAL: After Go Visible, isVisible check:', isVisible);
                // CRITICAL FIX: Always switch to tab after Go Visible click (user intent is clear)
                console.log('✅ VISIBILITY_MODAL: Switching to visibility tab after Go Visible');
                this.switchToVisibilityTab();
                // Double-check after a short delay to ensure tab is visible
                setTimeout(() => {
                    const visibilityTab = document.getElementById('visibility-tab');
                    if (visibilityTab && (visibilityTab.style.display === 'none' || !visibilityTab.classList.contains('active'))) {
                        console.warn('⚠️ VISIBILITY_MODAL: Tab still not visible, forcing display');
                        visibilityTab.style.display = 'block';
                        visibilityTab.classList.add('active');
                        const visibilityTabBtn = document.querySelector('[data-tab="visibility-tab"]');
                        if (visibilityTabBtn) {
                            visibilityTabBtn.classList.add('active');
                        }
                    }
                }, 200);
            }, 500);
            console.log('✅ VISIBILITY_MODAL: User set to visible');
        }
        catch (error) {
            console.error('❌ VISIBILITY_MODAL: Failed to set visibility:', error);
            alert('Failed to enable visibility. Please try again.');
        }
    }
    /**
     * Get auth token for API calls
     */
    async getAuthToken() {
        try {
            const authData = await chrome.storage.local.get(['authToken', 'googleAccessToken']);
            return authData.authToken || authData.googleAccessToken || '';
        }
        catch (error) {
            console.warn('⚠️ VISIBILITY_MODAL: Failed to get auth token:', error);
            return '';
        }
    }
    /**
     * Switch to visibility tab (normal tab switch)
     * FIX: Ensure tab is properly activated and visible
     * ROOT CAUSE FIX: Use correct tab ID format and ensure UIManager.switchTab works correctly
     */
    switchToVisibilityTab() {
        console.log('🔧 VISIBILITY_MODAL: switchToVisibilityTab() called');
        // ROOT CAUSE FIX: Use UIManager directly with correct tab ID format
        if (window.uiManager && typeof window.uiManager.switchTab === 'function') {
            console.log('✅ VISIBILITY_MODAL: Using UIManager.switchTab with "visibility-tab"');
            window.uiManager.switchTab('visibility-tab');
            // Double-check tab is visible after switch with longer timeout
            setTimeout(() => {
                const visibilityTab = document.getElementById('visibility-tab');
                const visibilityTabBtn = document.querySelector('[data-tab="visibility-tab"]');
                if (visibilityTab) {
                    if (visibilityTab.style.display === 'none' || !visibilityTab.classList.contains('active')) {
                        console.warn('⚠️ VISIBILITY_MODAL: Tab still hidden after UIManager switch, forcing display');
                        visibilityTab.style.display = 'block';
                        visibilityTab.classList.add('active');
                    }
                }
                else {
                    console.error('❌ VISIBILITY_MODAL: Visibility tab element not found!');
                }
                if (visibilityTabBtn && !visibilityTabBtn.classList.contains('active')) {
                    console.warn('⚠️ VISIBILITY_MODAL: Tab button not active, forcing activation');
                    visibilityTabBtn.classList.add('active');
                }
            }, 200);
            return;
        }
        // Fallback: manually switch tabs without triggering events
        console.log('🔧 VISIBILITY_MODAL: Using fallback manual tab switch');
        const allTabs = document.querySelectorAll('.main-tab-content');
        const allTabButtons = document.querySelectorAll('.main-nav-tab, button[data-tab]');
        allTabs.forEach((tab) => {
            const tabEl = tab;
            tabEl.classList.remove('active');
            tabEl.style.display = 'none';
        });
        allTabButtons.forEach((btn) => {
            const btnEl = btn;
            btnEl.classList.remove('active');
            if (btnEl.getAttribute('data-tab') === 'visibility-tab') {
                btnEl.classList.add('active');
            }
        });
        const visibilityTab = document.getElementById('visibility-tab');
        if (visibilityTab) {
            visibilityTab.classList.add('active');
            visibilityTab.style.display = 'block';
            console.log('✅ VISIBILITY_MODAL: Visibility tab manually activated');
        }
        else {
            console.error('❌ VISIBILITY_MODAL: Visibility tab element not found!');
        }
    }
}
// Create singleton instance
const visibilityModalHandlerInstance = new VisibilityModalHandler();
// Export as ES6 module
export { VisibilityModalHandler, visibilityModalHandlerInstance };
export default VisibilityModalHandler;
// Note: Window exports and auto-initialization will be added in compiled JS
// TypeScript source uses pure ES6 exports only
