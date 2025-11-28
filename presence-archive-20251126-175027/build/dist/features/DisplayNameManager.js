import { createProfileSettingChannel } from './settings/helpers/profileSettingChannel.js';
import { ensureManager, waitForPreferencesManager, getSettingContracts } from '../sidepanel/windowInjections.js';
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
class DisplayNameManager {
    constructor() {
        this.minLength = 4; // Min characters for display name
        this.maxLength = 16; // Max characters for display name (updated from 20)
        this.currentDisplayName = null;
        this.originalDisplayName = null;
        this.isInitialized = false;
        this.isEditing = false;
        this.storage = createProfileSettingChannel('displayName');
        this.displayNameInput = null;
        this.charCount = null;
        this.charMax = null;
        this.saveBtn = null;
        this.cancelBtn = null;
        this.actionsDiv = null;
        this.menuContainer = null;
        this.menuBtn = null;
        this.menuDropdown = null;
        this.menuEdit = null;
        this.menuDelete = null;
        this.statusDiv = null;
    }
    /**
     * Initialize display name manager
     */
    async initialize() {
        if (this.isInitialized) {
            Logger.debug('⚠️ DISPLAY_NAME: Already initialized', null, 'display-name');
            return;
        }
        Logger.debug('🔧 DISPLAY_NAME: Initializing display name manager...', null, 'display-name');
        try {
            // Get DOM elements
            this.displayNameInput = document.getElementById('display-name-input');
            this.charCount = document.getElementById('display-name-char-count');
            this.charMax = document.getElementById('display-name-char-max');
            this.saveBtn = document.getElementById('display-name-save-btn');
            this.cancelBtn = document.getElementById('display-name-cancel-btn');
            this.actionsDiv = document.getElementById('display-name-actions');
            this.menuContainer = document.getElementById('display-name-menu-container');
            this.menuBtn = document.getElementById('display-name-menu-btn');
            this.menuDropdown = document.getElementById('display-name-menu-dropdown');
            this.menuEdit = document.getElementById('display-name-menu-edit');
            this.menuDelete = document.getElementById('display-name-menu-delete');
            this.statusDiv = document.getElementById('display-name-status');
            if (!this.displayNameInput || !this.charCount || !this.saveBtn || !this.cancelBtn) {
                Logger.warn('⚠️ DISPLAY_NAME: Required DOM elements not found', null, 'display-name');
                return;
            }
            if (this.charMax) {
                this.charMax.textContent = String(this.maxLength); // Set max chars in UI
            }
            this.displayNameInput.maxLength = this.maxLength; // Ensure input has max length
            this.displayNameInput.minLength = this.minLength; // Ensure input has min length
            // Load existing display name
            await this.readDisplayName();
            // Set up event listeners
            this.setupEventListeners();
            this.isInitialized = true;
            Logger.debug('✅ DISPLAY_NAME: Display name manager initialized', null, 'display-name');
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'DisplayName'
                }
            });
            ;
        }
    }
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (!this.displayNameInput)
            return;
        // Character count update
        this.displayNameInput.addEventListener('input', () => {
            this.updateCharCount();
            if (!this.isEditing) {
                this.startEditing();
            }
        });
        // Save button
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.saveDisplayName();
            });
        }
        // Cancel button
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                this.cancelEdit();
            });
        }
        // Menu button
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }
        // Menu edit
        if (this.menuEdit) {
            this.menuEdit.addEventListener('click', () => {
                this.startEditing();
                this.hideMenu();
            });
        }
        // Menu delete
        if (this.menuDelete) {
            this.menuDelete.addEventListener('click', () => {
                this.deleteDisplayName();
                this.hideMenu();
            });
        }
        // Click outside to close menu
        document.addEventListener('click', (e) => {
            if (this.menuContainer && !this.menuContainer.contains(e.target)) {
                this.hideMenu();
            }
        });
        // Enter key to save
        this.displayNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.isEditing) {
                e.preventDefault();
                this.saveDisplayName();
            }
        });
        // Focus to manage editing state
        this.displayNameInput.addEventListener('focus', () => {
            const hasContent = this.displayNameInput ? this.displayNameInput.value.trim().length > 0 : false;
            if (hasContent && !this.isEditing) {
                this.startEditing();
            }
            else if (!hasContent) {
                this.isEditing = true;
                this.updateUIState();
            }
        });
        Logger.debug('✅ DISPLAY_NAME: Event listeners attached', null, 'display-name');
    }
    /**
     * Update character count display
     */
    updateCharCount() {
        if (!this.displayNameInput || !this.charCount)
            return;
        const currentLength = this.displayNameInput.value.length;
        this.charCount.textContent = String(currentLength);
        // Update color based on length (ROOT CAUSE FIX: Char count is now in separate div below input)
        const charCountContainer = this.charCount.parentElement;
        if (charCountContainer) {
            if (currentLength > this.maxLength * 0.9) {
                charCountContainer.style.color = '#dc3545'; // Red
            }
            else if (currentLength > this.maxLength * 0.75) {
                charCountContainer.style.color = '#ffc107'; // Yellow
            }
            else {
                charCountContainer.style.color = '#666'; // Gray
            }
        }
        // Update UI state to show/hide Save button based on validity
        this.updateUIState();
    }
    /**
     * READ: Load display name from storage/API
     */
    async readDisplayName() {
        try {
            Logger.debug('📖 DISPLAY_NAME: Reading display name...', null, 'display-name');
            Logger.debug('🔍 DIAGNOSTIC: Reading display name via unified storage channel', null, 'display-name');
            const displayName = await this.storage.read();
            this.currentDisplayName = displayName || '';
            this.originalDisplayName = displayName || '';
            if (this.displayNameInput) {
                this.displayNameInput.value = this.currentDisplayName;
            }
            this.updateCharCount();
            this.updateUIState();
            if (displayName) {
                Logger.debug('✅ DISPLAY_NAME: Display name loaded via profile setting channel', null, 'display-name');
            }
            else {
                Logger.debug('ℹ️ DISPLAY_NAME: No display name found, starting fresh', 'display-name');
            }
            // If UserPreferencesManager wasn't ready, retry when it becomes available
            const { userPreferencesManager } = getSettingContracts();
            if (!userPreferencesManager?.isInitialized) {
                Logger.debug('🔄 DISPLAY_NAME: UserPreferencesManager not ready, will retry when available', 'display-name');
                const retryHandler = async () => {
                    const contracts = getSettingContracts();
                    if (contracts.userPreferencesManager?.isInitialized) {
                        window.removeEventListener('preferenceLoaded', retryHandler);
                        Logger.debug('🔄 DISPLAY_NAME: UserPreferencesManager now ready, re-reading display name', 'display-name');
                        await this.readDisplayName();
                    }
                };
                window.addEventListener('preferenceLoaded', retryHandler);
            }
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'DisplayName'
                }
            });
            ;
            this.showStatus('Error loading display name', 'error');
        }
    }
    /**
     * Update UI state based on display name content
     */
    updateUIState() {
        if (!this.displayNameInput)
            return;
        const hasDisplayName = this.displayNameInput.value.trim().length > 0;
        const isValidEntry = this.displayNameInput.value.trim().length >= this.minLength;
        // Show menu if display name exists and not editing
        if (this.menuContainer) {
            this.menuContainer.style.display = hasDisplayName && !this.isEditing ? 'block' : 'none';
        }
        // Show actions (Save/Cancel) only when editing AND valid entry
        if (this.actionsDiv) {
            this.actionsDiv.style.display = (this.isEditing && isValidEntry) ? 'flex' : 'none';
        }
        // Disable input when not editing (if display name exists)
        if (hasDisplayName && !this.isEditing) {
            this.displayNameInput.style.pointerEvents = 'none';
            this.displayNameInput.style.backgroundColor = '#f5f5f5';
            this.displayNameInput.readOnly = true;
        }
        else {
            this.displayNameInput.style.pointerEvents = 'auto';
            this.displayNameInput.style.backgroundColor = '';
            this.displayNameInput.readOnly = false;
        }
    }
    /**
     * Start editing display name
     */
    startEditing() {
        this.isEditing = true;
        this.updateUIState();
        if (this.displayNameInput) {
            this.displayNameInput.focus();
        }
    }
    /**
     * Toggle menu dropdown
     */
    toggleMenu() {
        if (this.menuDropdown) {
            const isVisible = this.menuDropdown.style.display === 'block';
            this.menuDropdown.style.display = isVisible ? 'none' : 'block';
        }
    }
    /**
     * Hide menu dropdown
     */
    hideMenu() {
        if (this.menuDropdown) {
            this.menuDropdown.style.display = 'none';
        }
    }
    /**
     * CREATE/UPDATE: Save display name
     */
    async saveDisplayName() {
        try {
            if (!this.displayNameInput)
                return;
            const newDisplayName = this.displayNameInput.value.trim();
            // ROOT CAUSE FIX: Min 4, max 16 chars, null is ok
            if (newDisplayName.length > 0) {
                if (newDisplayName.length < this.minLength) {
                    this.showStatus(`Display name must be at least ${this.minLength} characters`, 'error');
                    return;
                }
                if (newDisplayName.length > this.maxLength) {
                    this.showStatus(`Display name must be ${this.maxLength} characters or less`, 'error');
                    return;
                }
            }
            Logger.debug('💾 DISPLAY_NAME: Saving display name...', null, 'display-name');
            await this.storage.save(newDisplayName || null);
            this.currentDisplayName = newDisplayName;
            this.originalDisplayName = newDisplayName;
            this.isEditing = false;
            this.updateUIState();
            this.showStatus('Display name saved successfully', 'success');
            Logger.debug('✅ DISPLAY_NAME: Display name saved', null, 'display-name');
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'DisplayName'
                }
            });
            ;
            this.showStatus('Error saving display name', 'error');
        }
    }
    /**
     * DELETE: Delete display name
     */
    async deleteDisplayName() {
        try {
            Logger.debug('🗑️ DISPLAY_NAME: Deleting display name...', null, 'display-name');
            await this.storage.delete();
            this.currentDisplayName = '';
            this.originalDisplayName = '';
            if (this.displayNameInput) {
                this.displayNameInput.value = '';
            }
            this.updateCharCount();
            this.isEditing = false;
            this.updateUIState();
            this.hideMenu();
            this.showStatus('Display name deleted successfully', 'success');
            Logger.debug('✅ DISPLAY_NAME: Display name deleted', null, 'display-name');
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'DisplayName'
                }
            });
            ;
            this.showStatus('Error deleting display name', 'error');
        }
    }
    /**
     * Cancel edit and restore original
     */
    cancelEdit() {
        if (this.displayNameInput) {
            this.displayNameInput.value = this.originalDisplayName || '';
        }
        this.updateCharCount();
        this.isEditing = false;
        this.updateUIState();
        this.showStatus('Changes cancelled', 'info');
        Logger.debug('❌ DISPLAY_NAME: Edit cancelled', null, 'display-name');
    }
    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        if (!this.statusDiv)
            return;
        this.statusDiv.textContent = message;
        this.statusDiv.style.display = 'block';
        // Set color based on type
        switch (type) {
            case 'success':
                this.statusDiv.style.backgroundColor = '#d4edda';
                this.statusDiv.style.color = '#155724';
                this.statusDiv.style.border = '1px solid #c3e6cb';
                break;
            case 'error':
                this.statusDiv.style.backgroundColor = '#f8d7da';
                this.statusDiv.style.color = '#721c24';
                this.statusDiv.style.border = '1px solid #f5c6cb';
                break;
            default:
                this.statusDiv.style.backgroundColor = '#d1ecf1';
                this.statusDiv.style.color = '#0c5460';
                this.statusDiv.style.border = '1px solid #bee5eb';
        }
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.statusDiv.style.display = 'none';
        }, 3000);
    }
}
// Initialize when DOM is ready and UserPreferencesManager is available
const bootstrapDisplayNameManager = async () => {
    try {
        const manager = ensureManager('displayNameManager', () => new DisplayNameManager());
        // Wait for UserPreferencesManager to be ready before initializing
        await waitForPreferencesManager();
        await manager.initialize();
    }
    catch (error) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'bootstrapDisplayNameManager',
                component: 'DisplayNameManager'
            }
        });
    }
};
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            void bootstrapDisplayNameManager();
        });
    }
    else {
        void bootstrapDisplayNameManager();
    }
    // Constructor export removed - use window.displayNameManager instance instead
}
export { DisplayNameManager };
//# sourceMappingURL=DisplayNameManager.js.map