/**
 * VISIBILITY MODAL COMPONENT - Modal UI Component
 *
 * Phase 3: UI Component Extraction
 * - Extracted from VisibilityModalHandler
 * - Handles Go Visible modal display and interactions
 */
import { handleError } from '../../../utils/ErrorHandler.js';
import { Logger } from '../../../utils/Logger.js';
/**
 * VisibilityModal component
 * Manages the "Go Visible" modal UI
 */
export class VisibilityModal {
    constructor(storage, onVisibilityEnabled) {
        this.modal = null;
        this.goVisibleBtn = null;
        this.cancelBtn = null;
        this.closeBtn = null;
        this.storage = storage;
        this.onVisibilityEnabled = onVisibilityEnabled;
    }
    /**
     * Initialize component
     */
    async initialize() {
        this.modal = document.getElementById('visibility-access-modal');
        this.goVisibleBtn = document.getElementById('go-visible-btn');
        this.cancelBtn = document.getElementById('cancel-visibility-btn');
        this.closeBtn = document.getElementById('close-visibility-access-modal');
        if (!this.modal || !this.goVisibleBtn || !this.cancelBtn) {
            Logger.warn('⚠️ VISIBILITY_MODAL: Required DOM elements not found', null, 'general');
            return;
        }
        // Fix cancel button text color for light theme
        this.updateCancelButtonColor();
        this.setupThemeObserver();
        this.setupEventListeners();
    }
    /**
     * Update cancel button text color based on theme
     */
    updateCancelButtonColor() {
        if (!this.cancelBtn)
            return;
        const theme = document.body.getAttribute('data-theme') || 'light';
        // Set text color for light theme (dark text), dark theme uses white
        // Use !important to override inline styles
        if (theme === 'light') {
            this.cancelBtn.style.setProperty('color', 'var(--text-primary, #333)', 'important');
        }
        else {
            this.cancelBtn.style.setProperty('color', 'var(--text-primary, #fff)', 'important');
        }
    }
    /**
     * Set up theme observer to update cancel button color on theme change
     */
    setupThemeObserver() {
        if (!this.cancelBtn)
            return;
        const observer = new MutationObserver(() => {
            this.updateCancelButtonColor();
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (this.goVisibleBtn) {
            this.goVisibleBtn.addEventListener('click', () => this.handleGoVisible());
        }
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.hide());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hide();
                }
            });
        }
    }
    /**
     * Show modal
     */
    show() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            this.modal.style.zIndex = '10002';
        }
    }
    /**
     * Hide modal
     */
    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
    /**
     * Handle Go Visible button click
     */
    async handleGoVisible() {
        try {
            // Save visibility setting
            await this.storage.saveVisibility(true);
            // Update currentUser if available
            const win = typeof window !== 'undefined' ? window : null;
            if (win?.currentUser) {
                win.currentUser.isVisible = true;
                win.currentUser.visibilityEnabled = true;
            }
            // Update toggle if available
            const toggle = document.getElementById('visibility-toggle');
            if (toggle) {
                toggle.checked = true;
                toggle.dispatchEvent(new Event('change'));
            }
            // Hide modal
            this.hide();
            // Callback
            if (this.onVisibilityEnabled) {
                this.onVisibilityEnabled();
            }
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                showUserNotification: true,
                userMessage: 'VISIBILITY_MODAL: Failed to enable visibility:',
                context: {
                    operation: 'catch',
                    component: 'VisibilityModal'
                }
            });
            ;
            alert('Failed to enable visibility. Please try again.');
        }
    }
    /**
     * Check if user is visible
     */
    async isUserVisible() {
        return this.storage.getVisibility();
    }
}
